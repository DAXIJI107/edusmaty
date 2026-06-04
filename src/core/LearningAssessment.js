// core/LearningAssessment.js
// 学习效果评估模块 - 多维度评估与策略调整

class LearningAssessment {
    constructor(userId, pool) {
        this.userId = userId;
        this.pool = pool;
    }

    async getFullAssessment() {
        const [examStats, errorStats, studyTime, knowledgeProgress, resourceUsage] = await Promise.all([
            this.getExamStatistics(),
            this.getErrorBookStatistics(),
            this.getStudyTimeAnalysis(),
            this.getKnowledgeProgress(),
            this.getResourceUsageStats()
        ]);

        const scores = this.calculateDimensionScores(
            examStats,
            errorStats,
            studyTime,
            knowledgeProgress,
            resourceUsage
        );
        const trend = await this.getLearningTrend();
        const recommendations = this.generateRecommendations(scores, trend);

        return {
            success: true,
            timestamp: new Date().toISOString(),
            dimensions: {
                examPerformance: {
                    label: "考试表现",
                    score: scores.examScore,
                    detail: examStats
                },
                errorAnalysis: {
                    label: "错题分析",
                    score: scores.errorScore,
                    detail: errorStats
                },
                studyConsistency: {
                    label: "学习持续性",
                    score: scores.consistencyScore,
                    detail: studyTime
                },
                knowledgeMastery: {
                    label: "知识掌握",
                    score: scores.knowledgeScore,
                    detail: knowledgeProgress
                },
                resourceUtilization: {
                    label: "资源利用",
                    score: scores.resourceScore,
                    detail: resourceUsage
                },
                improvementRate: {
                    label: "进步速度",
                    score: scores.improvementScore,
                    detail: trend
                }
            },
            overallScore: Math.round(
                (scores.examScore +
                    scores.errorScore +
                    scores.consistencyScore +
                    scores.knowledgeScore +
                    scores.resourceScore +
                    scores.improvementScore) /
                    6
            ),
            level: this.getLevel(scores),
            trend: trend,
            recommendations: recommendations,
            radarData: {
                labels: ["考试表现", "错题改进", "学习持续", "知识掌握", "资源利用", "进步速度"],
                datasets: [
                    {
                        label: "当前水平",
                        data: [
                            scores.examScore,
                            scores.errorScore,
                            scores.consistencyScore,
                            scores.knowledgeScore,
                            scores.resourceScore,
                            scores.improvementScore
                        ]
                    }
                ]
            }
        };
    }

    async getExamStatistics() {
        const [rows] = await this.pool.query(
            `SELECT 
                COUNT(*) as totalExams,
                ROUND(AVG(score / total_score * 100), 1) as avgScore,
                MAX(score / total_score * 100) as bestScore,
                MIN(score / total_score * 100) as worstScore,
                ROUND(AVG(COALESCE(time_spent, 30) / COALESCE(total_score, 100)), 1) as avgTimePerPoint
             FROM exam_records 
             WHERE user_id = ? AND status = 'completed'`,
            [this.userId]
        );

        const [recentRows] = await this.pool.query(
            `SELECT score, COALESCE(total_score, 100) as total_score, COALESCE(start_time, NOW()) as event_time 
             FROM exam_records 
             WHERE user_id = ? AND status = 'completed' 
             ORDER BY event_time DESC LIMIT 10`,
            [this.userId]
        );

        return {
            ...rows[0],
            totalExams: rows[0]?.totalExams || 0,
            avgScore: parseFloat(rows[0]?.avgScore) || 0,
            bestScore: parseFloat(rows[0]?.bestScore) || 0,
            worstScore: parseFloat(rows[0]?.worstScore) || 0,
            avgTimePerPoint: parseFloat(rows[0]?.avgTimePerPoint) || 0,
            recentScores: recentRows.map(r => ({
                score: parseFloat(r.score) || 0,
                total: parseFloat(r.total_score) || 100,
                percent: Math.round(((parseFloat(r.score) || 0) / (parseFloat(r.total_score) || 100)) * 100),
                date: r.event_time
            }))
        };
    }

    async getErrorBookStatistics() {
        const [rows] = await this.pool.query(
            `SELECT 
                COUNT(*) as totalErrors,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolvedCount,
                SUM(CASE WHEN status = 'unsolved' THEN 1 ELSE 0 END) as unsolvedCount,
                ROUND(AVG(CASE WHEN redo_count > 0 THEN 1 ELSE 0 END) * 100, 1) as redoRate,
                SUM(CASE WHEN redo_correct = 1 THEN 1 ELSE 0 END) as redoCorrectCount
             FROM error_book WHERE user_id = ?`,
            [this.userId]
        );

        const [errorTypes] = await this.pool.query(
            `SELECT error_type, COUNT(*) as count 
             FROM error_book WHERE user_id = ? 
             GROUP BY error_type 
             ORDER BY count DESC LIMIT 5`,
            [this.userId]
        );

        return {
            ...rows[0],
            resolutionRate:
                rows[0].totalErrors > 0 ? Math.round((rows[0].resolvedCount / rows[0].totalErrors) * 100) : 0,
            topErrorTypes: errorTypes
        };
    }

    async getStudyTimeAnalysis() {
        const [rows] = await this.pool.query(
            `SELECT 
                COUNT(DISTINCT DATE(COALESCE(created_at, NOW()))) as activeDays,
                COUNT(*) as totalSessions,
                ROUND(AVG(COALESCE(duration_minutes, 30)), 0) as avgSessionMinutes,
                SUM(COALESCE(duration_minutes, 0)) as totalMinutes
             FROM study_sessions 
             WHERE user_id = ? AND COALESCE(created_at, NOW()) >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            [this.userId]
        );

        const [weeklyRows] = await this.pool.query(
            `SELECT 
                DATE(COALESCE(created_at, NOW())) as studyDate,
                SUM(COALESCE(duration_minutes, 0)) as totalMinutes
             FROM study_sessions 
             WHERE user_id = ? AND COALESCE(created_at, NOW()) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(COALESCE(created_at, NOW()))
             ORDER BY studyDate`,
            [this.userId]
        );

        const activeDays = rows[0]?.activeDays || 0;
        const totalMinutes = rows[0]?.totalMinutes || 0;

        return {
            ...rows[0],
            activeDays: activeDays,
            consistencyScore: activeDays > 0 ? Math.min(100, Math.round((activeDays / 30) * 100)) : 0,
            dailyBreakdown: weeklyRows,
            totalHours: totalMinutes ? Math.round(totalMinutes / 60) : 0
        };
    }

    async getKnowledgeProgress() {
        const [rows] = await this.pool.query(
            `SELECT 
                COUNT(*) as totalNodes,
                ROUND(AVG(mastery), 2) as avgMastery,
                SUM(CASE WHEN mastery >= 0.7 THEN 1 ELSE 0 END) as masteredCount,
                SUM(CASE WHEN mastery < 0.4 THEN 1 ELSE 0 END) as weakCount
             FROM student_knowledge WHERE user_id = ?`,
            [this.userId]
        );

        const [weakNodes] = await this.pool.query(
            `SELECT sk.node_id, k.name, sk.mastery
             FROM student_knowledge sk
             JOIN knowledge_nodes k ON sk.node_id = k.id
             WHERE sk.user_id = ? AND sk.mastery < 0.5
             ORDER BY sk.mastery ASC LIMIT 5`,
            [this.userId]
        );

        return {
            ...rows[0],
            masteryPercent: rows[0].totalNodes > 0 ? Math.round((rows[0].masteredCount / rows[0].totalNodes) * 100) : 0,
            weakNodes: weakNodes
        };
    }

    async getResourceUsageStats() {
        const [rows] = await this.pool.query(
            `SELECT 
                COUNT(*) as totalResources,
                SUM(CASE WHEN resource_type = 'document' THEN 1 ELSE 0 END) as docCount,
                SUM(CASE WHEN resource_type = 'quiz' THEN 1 ELSE 0 END) as quizCount,
                SUM(CASE WHEN resource_type = 'video' THEN 1 ELSE 0 END) as videoCount,
                SUM(CASE WHEN resource_type = 'mindmap' THEN 1 ELSE 0 END) as mindmapCount,
                SUM(CASE WHEN resource_type = 'reading' THEN 1 ELSE 0 END) as readingCount,
                SUM(CASE WHEN resource_type = 'practice' THEN 1 ELSE 0 END) as practiceCount,
                ROUND(AVG(completion_rate), 1) as avgCompletionRate,
                SUM(CASE WHEN feedback = 'positive' THEN 1 ELSE 0 END) as positiveFeedback
             FROM resource_usage_logs 
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            [this.userId]
        );

        return rows[0] || {};
    }

    async getLearningTrend() {
        const [rows] = await this.pool.query(
            `SELECT 
                DATE(COALESCE(start_time, NOW())) as recordDate,
                ROUND(AVG(COALESCE(score, 0) / COALESCE(total_score, 100) * 100), 1) as avgScore
             FROM exam_records 
             WHERE user_id = ? AND status = 'completed' AND score IS NOT NULL
             GROUP BY DATE(COALESCE(start_time, NOW()))
             ORDER BY recordDate
             LIMIT 20`,
            [this.userId]
        );

        let trend = "stable";
        if (rows.length >= 2) {
            const firstScore = parseFloat(rows[0].avgScore) || 0;
            const lastScore = parseFloat(rows[rows.length - 1].avgScore) || 0;
            const diff = lastScore - firstScore;
            if (diff > 10) trend = "rising";
            else if (diff > 3) trend = "slightly_rising";
            else if (diff < -10) trend = "declining";
            else if (diff < -3) trend = "slightly_declining";
        }

        return {
            trend,
            label: this.getTrendLabel(trend),
            dataPoints: rows.map(r => ({ date: r.recordDate, score: r.avgScore }))
        };
    }

    getTrendLabel(trend) {
        const map = {
            rising: "快速上升",
            slightly_rising: "稳步提升",
            stable: "保持稳定",
            slightly_declining: "略有下降",
            declining: "需要关注"
        };
        return map[trend] || "保持稳定";
    }

    calculateDimensionScores(examStats, errorStats, studyTime, knowledgeProgress, resourceUsage) {
        const examScore = Math.min(
            100,
            Math.round((parseFloat(examStats.avgScore) || 60) * 0.8 + (examStats.bestScore > 80 ? 20 : 10))
        );

        const errorScore = Math.min(
            100,
            Math.round((errorStats.resolutionRate || 0) * 0.6 + (errorStats.redoCorrectCount > 0 ? 30 : 10) + 10)
        );

        const consistencyScore = Math.min(
            100,
            Math.round(
                (studyTime.consistencyScore || 30) * 0.7 +
                    (studyTime.totalHours >= 20 ? 30 : studyTime.totalHours >= 10 ? 20 : 10)
            )
        );

        const knowledgeScore = Math.min(
            100,
            Math.round(
                (knowledgeProgress.masteryPercent || 30) * 0.8 +
                    (parseFloat(knowledgeProgress.avgMastery) || 0.3) * 100 * 0.2
            )
        );

        const resourceScore = Math.min(
            100,
            Math.round(
                (resourceUsage.avgCompletionRate || 0) * 100 * 0.5 +
                    (resourceUsage.totalResources > 20 ? 30 : resourceUsage.totalResources > 10 ? 20 : 10) +
                    20
            )
        );

        const improvementScore = Math.min(
            100,
            Math.round((knowledgeProgress.masteryPercent || 30) * 0.4 + errorScore * 0.3 + examScore * 0.3)
        );

        return { examScore, errorScore, consistencyScore, knowledgeScore, resourceScore, improvementScore };
    }

    getLevel(scores) {
        const avg = Math.round(
            (scores.examScore +
                scores.errorScore +
                scores.consistencyScore +
                scores.knowledgeScore +
                scores.resourceScore +
                scores.improvementScore) /
                6
        );
        if (avg >= 85) return { level: "excellent", label: "优秀", color: "#10b981" };
        if (avg >= 70) return { level: "good", label: "良好", color: "#3b82f6" };
        if (avg >= 55) return { level: "average", label: "中等", color: "#f59e0b" };
        return { level: "need_improve", label: "待提升", color: "#ef4444" };
    }

    generateRecommendations(scores, trend) {
        const recs = [];

        if (scores.examScore < 60)
            recs.push({
                type: "exam",
                priority: "high",
                message: "考试成绩偏低，建议增加模拟测试练习频次",
                action: "start_practice"
            });

        if (scores.errorScore < 50)
            recs.push({
                type: "error",
                priority: "high",
                message: "错题解决率较低，建议优先复习错题本并重做错题",
                action: "open_error_book"
            });

        if (scores.consistencyScore < 40)
            recs.push({
                type: "consistency",
                priority: "medium",
                message: "学习持续性不足，建议制定固定的每日学习计划",
                action: "create_study_plan"
            });

        if (scores.knowledgeScore < 50)
            recs.push({
                type: "knowledge",
                priority: "high",
                message: "知识点掌握率偏低，建议从基础知识点开始系统学习",
                action: "start_course"
            });

        if (scores.resourceScore < 40)
            recs.push({
                type: "resource",
                priority: "low",
                message: "资源利用率较低，建议多使用系统生成的个性化学习资源",
                action: "explore_resources"
            });

        if (trend.trend === "declining" || trend.trend === "slightly_declining")
            recs.push({
                type: "trend",
                priority: "high",
                message: "学习成绩呈下降趋势，建议回顾最近的学习方法并调整策略",
                action: "review_strategy"
            });

        if (recs.length === 0)
            recs.push({
                type: "positive",
                priority: "low",
                message: "各维度表现良好，继续保持！可以尝试挑战更高难度的学习内容",
                action: "advance_learning"
            });

        return recs;
    }

    async adjustResourceStrategy() {
        const assessment = await this.getFullAssessment();
        const adjustments = [];

        if (assessment.dimensions.examPerformance.score < 50) {
            adjustments.push({
                action: "increase_quiz",
                description: "增加练习题目推送比例",
                newRatio: { quiz: 0.4, document: 0.3, video: 0.2, practice: 0.1 }
            });
        }

        if (assessment.dimensions.knowledgeMastery.score < 50) {
            adjustments.push({
                action: "increase_document",
                description: "增加知识文档推送比例",
                newRatio: { document: 0.5, video: 0.3, quiz: 0.1, mindmap: 0.1 }
            });
        }

        if (assessment.dimensions.resourceUtilization.score < 40) {
            adjustments.push({
                action: "increase_video",
                description: "增加视频资源推送以提高学习兴趣",
                newRatio: { video: 0.4, document: 0.2, quiz: 0.2, mindmap: 0.2 }
            });
        }

        return {
            success: true,
            assessment: assessment.overallScore,
            adjustments: adjustments,
            recommendation:
                adjustments.length > 0 ? adjustments.map(a => a.description).join("；") : "当前策略适宜，无需调整"
        };
    }

    async logResourceUsage(userId, resourceType, completionRate, feedback) {
        try {
            await this.pool.query(
                `INSERT INTO resource_usage_logs (user_id, resource_type, completion_rate, feedback)
                 VALUES (?, ?, ?, ?)`,
                [userId, resourceType, completionRate, feedback || "neutral"]
            );
        } catch (error) {
            console.error("记录资源使用日志失败:", error);
        }
    }

    async logStudySession(userId, durationMinutes, subject, activityType) {
        try {
            await this.pool.query(
                `INSERT INTO study_sessions (user_id, duration_minutes, subject, activity_type, created_at)
                 VALUES (?, ?, ?, ?, NOW())`,
                [userId, durationMinutes, subject, activityType]
            );
        } catch (error) {
            console.error("记录学习时段失败:", error);
        }
    }
}

module.exports = LearningAssessment;
