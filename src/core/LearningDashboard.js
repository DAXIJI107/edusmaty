class LearningDashboard {
    async generateDashboard(userId, pool) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const [masteryStats] = await pool.query(
            `SELECT 
                COUNT(*) as total_nodes,
                SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) as mastered,
                SUM(CASE WHEN mastery >= 50 AND mastery < 80 THEN 1 ELSE 0 END) as developing,
                SUM(CASE WHEN mastery < 50 THEN 1 ELSE 0 END) as weak,
                AVG(mastery) as avg_mastery
             FROM student_knowledge WHERE user_id = ?`,
            [userId]
        );

        const [todayActivity] = await pool.query(
            `SELECT 
                COUNT(DISTINCT ua.id) as answers_today,
                COUNT(DISTINCT ua.exam_id) as exams_today,
                AVG(ua.is_correct) as accuracy_today
             FROM user_answers ua
             WHERE ua.user_id = ? AND DATE(ua.created_at) = ?`,
            [userId, today]
        );

        const [streakData] = await pool.query(
            `SELECT DATE(created_at) as study_date, COUNT(*) as activity_count
             FROM user_answers WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at) ORDER BY study_date DESC`,
            [userId]
        );

        const streak = this.calculateStreak(streakData);
        const fatigueScore = await this.calculateFatigue(userId, pool);
        const focusScore = await this.calculateFocusScore(userId, pool);

        return {
            mastery: {
                total: masteryStats[0]?.total_nodes || 0,
                mastered: masteryStats[0]?.mastered || 0,
                developing: masteryStats[0]?.developing || 0,
                weak: masteryStats[0]?.weak || 0,
                average: Math.round(masteryStats[0]?.avg_mastery || 0)
            },
            today: {
                answers: todayActivity[0]?.answers_today || 0,
                exams: todayActivity[0]?.exams_today || 0,
                accuracy: Math.round((todayActivity[0]?.accuracy_today || 0) * 100)
            },
            streak: {
                current: streak.current,
                longest: streak.longest,
                history: streakData.slice(0, 7).map(d => ({
                    date: d.study_date,
                    count: d.activity_count
                }))
            },
            energy: {
                fatigueScore,
                focusScore,
                status: this.getEnergyStatus(fatigueScore, focusScore),
                suggestion: this.getEnergySuggestion(fatigueScore, focusScore)
            },
            predictions: await this.generatePredictions(userId, pool),
            alerts: await this.generateAlerts(userId, pool, fatigueScore)
        };
    }

    calculateStreak(streakData) {
        let current = 0;
        let longest = 0;
        let tempStreak = 0;
        const today = new Date().toISOString().split('T')[0];

        for (let i = 0; i < streakData.length; i++) {
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - i);
            const expected = expectedDate.toISOString().split('T')[0];

            if (streakData[i]?.study_date === expected) {
                tempStreak++;
                longest = Math.max(longest, tempStreak);
            } else {
                if (i === 0 && streakData[0]?.study_date === today) {
                    continue;
                }
                break;
            }
        }
        current = tempStreak;

        let tempLongest = 0;
        for (let i = 0; i < streakData.length; i++) {
            if (i > 0 && streakData[i].study_date === streakData[i-1].study_date) continue;
            const expectedDate = new Date(streakData[i].study_date);
            expectedDate.setDate(expectedDate.getDate() - 1);
            const expected = expectedDate.toISOString().split('T')[0];
            if (i === 0 || streakData[i-1]?.study_date === expected) {
                tempLongest++;
            } else {
                tempLongest = 1;
            }
            longest = Math.max(longest, tempLongest);
        }

        return { current, longest: Math.max(longest, current) };
    }

    async calculateFatigue(userId, pool) {
        const [recentActivity] = await pool.query(
            `SELECT COUNT(*) as count, 
                    AVG(TIMESTAMPDIFF(MINUTE, 
                        LAG(created_at) OVER (ORDER BY created_at), 
                        created_at
                    )) as avg_gap
             FROM user_answers 
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)`,
            [userId]
        );

        const activityCount = recentActivity[0]?.count || 0;
        const avgGap = recentActivity[0]?.avg_gap || 0;

        let fatigue = 0;
        if (activityCount > 50) fatigue += 30;
        else if (activityCount > 30) fatigue += 20;
        else if (activityCount > 15) fatigue += 10;

        if (avgGap < 0.5) fatigue += 20;
        else if (avgGap < 1) fatigue += 10;

        const [sessionDuration] = await pool.query(
            `SELECT SUM(TIMESTAMPDIFF(MINUTE, created_at, 
                COALESCE(LEAD(created_at) OVER (ORDER BY created_at), NOW())
            )) as total_minutes
             FROM user_answers 
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 4 HOUR)
             LIMIT 1`,
            [userId]
        );

        const totalMinutes = sessionDuration[0]?.total_minutes || 0;
        if (totalMinutes > 120) fatigue += 30;
        else if (totalMinutes > 60) fatigue += 20;

        return Math.min(100, fatigue);
    }

    async calculateFocusScore(userId, pool) {
        const [attentionData] = await pool.query(
            `SELECT attention_status, COUNT(*) as count
             FROM attention_logs
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
             GROUP BY attention_status`,
            [userId]
        );

        const statusMap = { focusing: 0, distracted: 0, away: 0 };
        for (const d of attentionData) {
            statusMap[d.attention_status] = d.count;
        }

        const total = statusMap.focusing + statusMap.distracted + statusMap.away;
        if (total === 0) return 80;

        return Math.round((statusMap.focusing / total) * 100);
    }

    getEnergyStatus(fatigue, focus) {
        if (fatigue >= 70) return 'exhausted';
        if (fatigue >= 50) return 'tired';
        if (focus < 50) return 'distracted';
        if (fatigue >= 30) return 'moderate';
        return 'energetic';
    }

    getEnergySuggestion(fatigue, focus) {
        if (fatigue >= 70) return '建议立即休息，过度疲劳会影响学习效果';
        if (fatigue >= 50) return '建议休息15-20分钟，或切换到轻松的知识卡片复习';
        if (focus < 50) return '注意力分散，建议使用番茄工作法保持专注';
        if (fatigue >= 30) return '状态尚可，建议适当安排休息';
        return '精力充沛，适合进行高难度学习任务';
    }

    async generatePredictions(userId, pool) {
        const [recentTrend] = await pool.query(
            `SELECT DATE(created_at) as date, AVG(is_correct) as accuracy
             FROM user_answers
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date`,
            [userId]
        );

        const accuracies = recentTrend.map(r => r.accuracy);
        const trend = accuracies.length >= 2
            ? (accuracies[accuracies.length - 1] - accuracies[0]) / accuracies.length
            : 0;

        const predictedAccuracy = Math.min(100, Math.max(0,
            ((accuracies[accuracies.length - 1] || 0) + trend * 3) * 100
        ));

        const [weakNodes] = await pool.query(
            `SELECT COUNT(*) as count FROM student_knowledge
             WHERE user_id = ? AND mastery < 50`,
            [userId]
        );

        const estimatedDaysToMaster = weakNodes[0]?.count > 0
            ? Math.ceil(weakNodes[0].count * 2.5)
            : 0;

        return {
            predictedAccuracy: Math.round(predictedAccuracy),
            trend: trend >= 0 ? 'improving' : 'declining',
            estimatedDaysToMasterAll: estimatedDaysToMaster,
            weakNodeCount: weakNodes[0]?.count || 0
        };
    }

    async generateAlerts(userId, pool, fatigueScore) {
        const alerts = [];

        if (fatigueScore >= 70) {
            alerts.push({
                type: 'warning',
                severity: 'high',
                title: '学习疲劳预警',
                message: '检测到您已连续学习较长时间，建议立即休息',
                action: '查看休息建议'
            });
        }

        const [inactiveDays] = await pool.query(
            `SELECT DATEDIFF(NOW(), MAX(created_at)) as days_inactive
             FROM user_answers WHERE user_id = ?`,
            [userId]
        );

        if (inactiveDays[0]?.days_inactive >= 3) {
            alerts.push({
                type: 'warning',
                severity: 'medium',
                title: '学习中断提醒',
                message: `您已经${inactiveDays[0].days_inactive}天没有学习了，是否遇到了困难？`,
                action: '查看激励内容'
            });
        }

        const [errorSpike] = await pool.query(
            `SELECT COUNT(*) as error_count, DATE(created_at) as date
             FROM user_answers
             WHERE user_id = ? AND is_correct = 0
               AND created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
             GROUP BY DATE(created_at)
             HAVING error_count > 10`,
            [userId]
        );

        if (errorSpike.length > 0) {
            alerts.push({
                type: 'insight',
                severity: 'medium',
                title: '错误率上升',
                message: '最近3天错误题数较多，建议回顾薄弱知识点',
                action: '查看错题本'
            });
        }

        return alerts;
    }
}

module.exports = LearningDashboard;