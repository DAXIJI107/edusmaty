class ProfileTool {
    constructor(pool) {
        this.pool = pool;
    }

    async run({ userId, subject = "all" }) {
        const subjectWhere = subject && subject !== "all" ? "WHERE subject = ?" : "";
        const subjectParams = subjectWhere ? [subject] : [];
        let [weakPoints] = await this.pool.query(
            `SELECT id, title, subject, mastery, summary
             FROM knowledge_points
             ${subjectWhere}
             ORDER BY mastery ASC, id
             LIMIT 6`,
            subjectParams
        ).catch(() => [[]]);
        if (!weakPoints.length && subjectWhere) {
            [weakPoints] = await this.pool.query(
                `SELECT id, title, subject, mastery, summary
                 FROM knowledge_points
                 ORDER BY mastery ASC, id
                 LIMIT 6`
            ).catch(() => [[]]);
        }
        const [[answerStats]] = await this.pool.query(
            `SELECT COUNT(*) AS total, SUM(is_correct = 1) AS correct,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers
             WHERE user_id = ?`,
            [userId]
        ).catch(() => [[{}]]);
        const [recentEvents] = await this.pool.query(
            `SELECT event_type, subject, knowledge_node_id, payload, created_at
             FROM learning_events
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 8`,
            [userId]
        ).catch(() => [[]]);
        const [notes] = await this.pool.query(
            `SELECT title, subject, updated_at
             FROM notes
             WHERE user_id = ?
             ORDER BY updated_at DESC
             LIMIT 5`,
            [userId]
        ).catch(() => [[]]);

        const averageMastery = weakPoints.length
            ? Math.round(weakPoints.reduce((sum, item) => sum + Number(item.mastery || 0), 0) / weakPoints.length)
            : 0;

        return {
            weakPoints,
            answerStats: {
                total: Number(answerStats.total || 0),
                correct: Number(answerStats.correct || 0),
                accuracy: Number(answerStats.accuracy || 0)
            },
            recentEvents,
            notes,
            averageMastery,
            summary: weakPoints.length
                ? `当前优先薄弱点是 ${weakPoints[0].title}，最低掌握度 ${weakPoints[0].mastery}%。`
                : "暂无足够画像数据，建议先完成一次诊断或专项练习。"
        };
    }
}

module.exports = ProfileTool;
