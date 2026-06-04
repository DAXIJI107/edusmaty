class BKTModel {
    constructor() {
        this.params = {
            guess: 0.15,
            slip: 0.1,
            transit: 0.2,
            init: 0.3
        };
    }

    async estimateMastery(userId, nodeId, pool) {
        const [answers] = await pool.query(
            `SELECT ua.is_correct, ua.created_at
             FROM user_answers ua
             JOIN questions q ON ua.question_id = q.id
             WHERE ua.user_id = ? AND q.node_id = ?
             ORDER BY ua.created_at ASC`,
            [userId, nodeId]
        );

        if (answers.length === 0) return { mastery: 0, confidence: 0, nextReview: null };

        let pLearned = this.params.init;

        for (const ans of answers) {
            const pCorrect = pLearned * (1 - this.params.slip) + (1 - pLearned) * this.params.guess;
            if (ans.is_correct) {
                pLearned = (pLearned * (1 - this.params.slip)) / pCorrect;
            } else {
                pLearned = (pLearned * this.params.slip) / (1 - pCorrect);
            }
            pLearned += (1 - pLearned) * this.params.transit;
        }

        const mastery = Math.round(pLearned * 100);
        const confidence = Math.min(100, answers.length * 15);
        const nextReview = this.calculateNextReview(mastery, answers.length);

        return { mastery, confidence, nextReview, attempts: answers.length };
    }

    calculateNextReview(mastery, attempts) {
        if (mastery < 40) return { days: 1, reason: "掌握度低，建议明天复习" };
        if (mastery < 60) return { days: 3, reason: "基础薄弱，建议3天后复习" };
        if (mastery < 80) return { days: 7, reason: "基本掌握，建议一周后复习" };
        return { days: 14, reason: "掌握良好，建议两周后巩固" };
    }

    async batchUpdate(userId, pool) {
        const [nodes] = await pool.query("SELECT id FROM knowledge_nodes WHERE is_active = 1");
        const results = [];
        for (const node of nodes) {
            const result = await this.estimateMastery(userId, node.id, pool);
            await pool.query(
                `INSERT INTO student_knowledge (user_id, node_id, mastery, updated_at)
                 VALUES (?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE mastery = VALUES(mastery), updated_at = NOW()`,
                [userId, node.id, result.mastery]
            );
            results.push({ nodeId: node.id, ...result });
        }
        return results;
    }
}

module.exports = BKTModel;
