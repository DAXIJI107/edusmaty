class NoteTool {
    constructor(pool) {
        this.pool = pool;
    }

    async run({ userId, goal, weakPoints = [], mode = "plan" }) {
        const focus = weakPoints[0] || {};
        const title = `AI学习任务卡：${focus.title || goal || "今日学习"}`;
        const body = [
            `目标：${goal || "完成今日智能学习闭环"}`,
            focus.title
                ? `优先知识点：${focus.subject} / ${focus.title}，当前掌握度 ${focus.mastery}%。`
                : "优先完成一次诊断，建立基础画像。",
            "学习步骤：先看概念，再做 3-5 道检验题，最后写一张主动回忆卡。",
            "复盘问题：我卡在哪里？正确思路的关键条件是什么？下次如何识别同类题？"
        ].join("\n\n");

        let noteId = null;
        try {
            const [result] = await this.pool.query(
                `INSERT INTO notes
                    (user_id, knowledge_id, title, body, subject, source_type, source_id, tags_json, review_status, next_review_at)
                 VALUES (?, ?, ?, ?, ?, 'agent', NULL, CAST(? AS JSON), 'new', DATE_ADD(NOW(), INTERVAL 1 DAY))`,
                [
                    userId,
                    focus.id || null,
                    title,
                    body,
                    focus.subject || "智能学习",
                    JSON.stringify(["AI任务卡", "智能体", mode])
                ]
            );
            noteId = result.insertId;
        } catch (error) {
            noteId = null;
        }

        return {
            noteId,
            title,
            body,
            summary: noteId ? "已生成可复习的 AI 学习任务卡。" : "已生成任务卡内容，但当前笔记表暂不可写入。"
        };
    }
}

module.exports = NoteTool;
