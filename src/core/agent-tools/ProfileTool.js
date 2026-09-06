class ProfileTool {
    constructor(pool) {
        this.pool = pool;
    }

    async run({ userId, subject = "all" }) {
        const subjectWhere = subject && subject !== "all" ? "WHERE subject = ?" : "";
        const subjectParams = subjectWhere ? [subject] : [];
        let [weakPoints] = await this.pool
            .query(
                `SELECT id, title, subject, mastery, summary
             FROM knowledge_points
             ${subjectWhere}
             ORDER BY mastery ASC, id
             LIMIT 6`,
                subjectParams
            )
            .catch(() => [[]]);
        if (!weakPoints.length && subjectWhere) {
            [weakPoints] = await this.pool
                .query(
                    `SELECT id, title, subject, mastery, summary
                 FROM knowledge_points
                 ORDER BY mastery ASC, id
                 LIMIT 6`
                )
                .catch(() => [[]]);
        }
        const [[answerStats]] = await this.pool
            .query(
                `SELECT COUNT(*) AS total, SUM(is_correct = 1) AS correct,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers
             WHERE user_id = ?`,
                [userId]
            )
            .catch(() => [[{}]]);
        const [recentEvents] = await this.pool
            .query(
                `SELECT event_type, subject, knowledge_node_id, payload, created_at
             FROM learning_events
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 8`,
                [userId]
            )
            .catch(() => [[]]);
        const [notes] = await this.pool
            .query(
                `SELECT title, subject, updated_at
             FROM notes
             WHERE user_id = ?
             ORDER BY updated_at DESC
             LIMIT 5`,
                [userId]
            )
            .catch(() => [[]]);

        const averageMastery = weakPoints.length
            ? Math.round(weakPoints.reduce((sum, item) => sum + Number(item.mastery || 0), 0) / weakPoints.length)
            : 0;

        // 合并学生手动维护的薄弱点：手动忽略的剔除，手动添加的置顶优先
        const [overrides] = await this.pool
            .query("SELECT topic, knowledge_id, kind FROM user_weak_overrides WHERE user_id = ?", [userId])
            .catch(() => [[]]);
        if (overrides.length) {
            const removedTopics = new Set(overrides.filter(o => o.kind === "removed").map(o => o.topic));
            weakPoints = weakPoints.filter(w => !removedTopics.has(w.title));
            const existingIds = new Set(weakPoints.map(w => Number(w.id)).filter(Boolean));
            const existingTitles = new Set(weakPoints.map(w => w.title));
            const customPoints = [];
            for (const added of overrides.filter(o => o.kind === "added")) {
                if (added.knowledge_id && !existingIds.has(Number(added.knowledge_id))) {
                    const [[kp]] = await this.pool
                        .query("SELECT id, title, subject, mastery, summary FROM knowledge_points WHERE id = ?", [
                            added.knowledge_id
                        ])
                        .catch(() => [[]]);
                    if (kp) {
                        customPoints.push({ ...kp, custom: true });
                        existingIds.add(Number(kp.id));
                    }
                } else if (!added.knowledge_id && !existingTitles.has(added.topic)) {
                    // 自由文本薄弱点（知识库中无对应节点）：低掌握度占位，推动 Agent 优先安排
                    customPoints.push({
                        id: null,
                        title: added.topic,
                        subject: "自定义",
                        mastery: 20,
                        summary: "你手动标记的薄弱点",
                        custom: true
                    });
                    existingTitles.add(added.topic);
                }
            }
            weakPoints = [...customPoints, ...weakPoints];
        }

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
