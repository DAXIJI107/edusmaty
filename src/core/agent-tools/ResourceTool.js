class ResourceTool {
    constructor(pool) {
        this.pool = pool;
    }

    async run({ subject = "all", weakPoints = [] }) {
        const targetSubject = subject && subject !== "all"
            ? subject
            : weakPoints[0]?.subject || "数据结构与算法";
        const [courses] = await this.pool.query(
            `SELECT id, title, provider, subject, progress, source_url
             FROM courses
             WHERE subject = ? OR ? = 'all'
             ORDER BY progress ASC, id
             LIMIT 6`,
            [targetSubject, subject || "all"]
        ).catch(() => [[]]);
        const nodeIds = weakPoints.map(item => Number(item.id)).filter(Boolean).slice(0, 4);
        let questions = [];
        if (nodeIds.length) {
            const placeholders = nodeIds.map(() => "?").join(",");
            [questions] = await this.pool.query(
                `SELECT id, knowledge_id, question, difficulty
                 FROM questions
                 WHERE knowledge_id IN (${placeholders})
                 ORDER BY difficulty, id
                 LIMIT 8`,
                nodeIds
            ).catch(() => [[]]);
        }

        return {
            targetSubject,
            courses,
            questions,
            summary: courses.length
                ? `已匹配 ${courses.length} 个课程资源和 ${questions.length} 道练习题。`
                : `当前 ${targetSubject} 课程资源不足，优先用题库和笔记任务推进。`
        };
    }
}

module.exports = ResourceTool;
