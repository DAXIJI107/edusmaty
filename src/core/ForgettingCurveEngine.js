class ForgettingCurveEngine {
    constructor() {
        this.curve = {
            1: { interval: 1, retention: 0.582 },
            2: { interval: 2, retention: 0.478 },
            3: { interval: 4, retention: 0.388 },
            4: { interval: 7, retention: 0.334 },
            5: { interval: 15, retention: 0.277 },
            6: { interval: 30, retention: 0.233 }
        };
    }

    async calculateReviewSchedule(userId, pool) {
        const [knowledge] = await pool.query(
            `SELECT sk.node_id, sk.mastery, kn.name, kn.subject,
                    MAX(ua.created_at) as last_reviewed
             FROM student_knowledge sk
             JOIN knowledge_nodes kn ON sk.node_id = kn.id
             LEFT JOIN user_answers ua ON ua.user_id = sk.user_id AND ua.question_id IN 
                (SELECT id FROM questions WHERE node_id = sk.node_id)
             WHERE sk.user_id = ?
             GROUP BY sk.node_id, sk.mastery, kn.name, kn.subject`,
            [userId]
        );

        const now = new Date();
        const schedule = [];

        for (const item of knowledge) {
            const daysSinceReview = item.last_reviewed
                ? Math.floor((now - new Date(item.last_reviewed)) / (1000 * 60 * 60 * 24))
                : 999;

            const retentionRate = this.predictRetention(item.mastery, daysSinceReview);
            const reviewPriority = this.calculatePriority(item.mastery, retentionRate, daysSinceReview);
            const optimalReviewDay = this.findOptimalReviewDay(item.mastery);

            schedule.push({
                nodeId: item.node_id,
                nodeName: item.name,
                subject: item.subject,
                mastery: item.mastery,
                daysSinceReview,
                retentionRate: Math.round(retentionRate * 100),
                reviewPriority,
                optimalReviewDay,
                shouldReview: reviewPriority >= 60,
                reviewType: this.getReviewType(item.mastery, retentionRate)
            });
        }

        schedule.sort((a, b) => b.reviewPriority - a.reviewPriority);

        return {
            dueToday: schedule.filter(s => s.shouldReview && s.daysSinceReview >= s.optimalReviewDay),
            upcoming: schedule.filter(s => s.shouldReview && s.daysSinceReview < s.optimalReviewDay).slice(0, 10),
            mastered: schedule.filter(s => !s.shouldReview),
            all: schedule
        };
    }

    predictRetention(mastery, daysSinceReview) {
        const baseRetention = mastery / 100;
        const decayRate = 0.1 + (1 - baseRetention) * 0.2;
        return baseRetention * Math.exp(-decayRate * daysSinceReview);
    }

    calculatePriority(mastery, retention, daysSinceReview) {
        const masteryFactor = (100 - mastery) / 100;
        const retentionFactor = 1 - retention;
        const recencyFactor = Math.min(1, daysSinceReview / 30);
        return Math.round((masteryFactor * 0.4 + retentionFactor * 0.4 + recencyFactor * 0.2) * 100);
    }

    findOptimalReviewDay(mastery) {
        if (mastery < 40) return 1;
        if (mastery < 60) return 2;
        if (mastery < 75) return 4;
        if (mastery < 85) return 7;
        return 15;
    }

    getReviewType(mastery, retention) {
        if (retention < 0.3) return "relearn";
        if (retention < 0.5) return "intensive_review";
        if (retention < 0.7) return "quick_review";
        return "light_consolidation";
    }

    async generateReviewMessage(userId, pool) {
        const schedule = await this.calculateReviewSchedule(userId, pool);
        const dueToday = schedule.dueToday;

        if (dueToday.length === 0) {
            const nextUp = schedule.upcoming.slice(0, 3);
            if (nextUp.length === 0) return null;
            return {
                type: "upcoming",
                message: `你有 ${nextUp.length} 个知识点即将需要复习`,
                items: nextUp.map(n => ({
                    name: n.nodeName,
                    reviewIn: `${n.optimalReviewDay - n.daysSinceReview}天后`,
                    type: n.reviewType
                }))
            };
        }

        const urgentItems = dueToday.filter(d => d.reviewPriority >= 80);
        const normalItems = dueToday.filter(d => d.reviewPriority < 80);

        let message = "";
        if (urgentItems.length > 0) {
            message = `⚠️ 紧急！${urgentItems.length}个知识点即将遗忘：${urgentItems.map(u => u.nodeName).join("、")}。`;
        }
        if (normalItems.length > 0) {
            message += ` 还有${normalItems.length}个知识点需要复习巩固。`;
        }

        return {
            type: "due_today",
            message: message.trim(),
            urgentCount: urgentItems.length,
            totalDue: dueToday.length,
            items: dueToday.map(d => ({
                name: d.nodeName,
                subject: d.subject,
                retentionRate: d.retentionRate,
                priority: d.reviewPriority,
                type: d.reviewType,
                suggestion:
                    d.reviewType === "relearn"
                        ? "建议重新学习基础知识"
                        : d.reviewType === "intensive_review"
                          ? "建议做3-5道练习题巩固"
                          : d.reviewType === "quick_review"
                            ? "快速浏览笔记即可"
                            : "简单回顾即可"
            }))
        };
    }
}

module.exports = ForgettingCurveEngine;
