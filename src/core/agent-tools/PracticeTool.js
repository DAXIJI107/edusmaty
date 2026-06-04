const MasteryTool = require("./MasteryTool");

class PracticeTool {
    constructor(pool) {
        this.pool = pool;
        this.masteryTool = new MasteryTool(pool);
    }

    async run({ userId, weakPoints = [], intensity = "normal" }) {
        const nodeIds = weakPoints
            .map(item => Number(item.id))
            .filter(Boolean)
            .slice(0, intensity === "intense" ? 5 : 3);
        if (!nodeIds.length) {
            return { tasks: [], questions: [], summary: "暂无薄弱知识点，先完成诊断后再生成练习。" };
        }
        const placeholders = nodeIds.map(() => "?").join(",");
        const [questions] = await this.pool
            .query(
                `SELECT q.id, q.knowledge_id, q.question, q.difficulty, kp.title AS knowledgeTitle, kp.subject
             FROM questions q
             LEFT JOIN knowledge_points kp ON kp.id = q.knowledge_id
             WHERE q.knowledge_id IN (${placeholders})
             ORDER BY kp.mastery ASC, q.difficulty, q.id
             LIMIT ?`,
                [...nodeIds, intensity === "light" ? 4 : intensity === "intense" ? 12 : 8]
            )
            .catch(() => [[]]);

        // 获取真实掌握度
        const masteryMap = await this.masteryTool.batchGet(userId, nodeIds);

        const tasks = weakPoints.slice(0, nodeIds.length).map(point => {
            const realMastery = masteryMap[point.id]?.mastery || point.mastery || 0;
            const trend = masteryMap[point.id]?.trend || "unknown";
            const trendIcon = trend === "improving" ? "↑" : trend === "declining" ? "↓" : "→";
            return {
                knowledgeId: point.id,
                title: `专项练习：${point.title}`,
                subtitle: `${point.subject} · 掌握度 ${realMastery}% ${trendIcon}`,
                estimatedMinutes: realMastery < 50 ? 30 : realMastery < 75 ? 20 : 15
            };
        });

        return {
            tasks,
            questions,
            masteryMap: Object.entries(masteryMap).map(([id, v]) => ({ knowledgeId: Number(id), ...v })),
            summary: `已为 ${nodeIds.length} 个薄弱点准备 ${questions.length} 道练习题。`
        };
    }

    /**
     * 记录练习完成结果，自动更新掌握度
     * @param {number} userId
     * @param {object} completion - { knowledgeId, score, total, durationMs, questionIds, answers }
     */
    async recordCompletion(userId, { knowledgeId, score, total, durationMs, questionIds, answers }) {
        const result = await this.masteryTool.recordCompletion(userId, knowledgeId, {
            score,
            total,
            durationMs,
            questionIds,
            answers
        });

        // 记录学习事件
        await this.pool
            .query(
                `INSERT INTO learning_events (user_id, event_type, knowledge_id, target_type, target_id, context_json)
             VALUES (?, 'complete_practice', ?, 'practice', ?, ?)`,
                [
                    userId,
                    knowledgeId,
                    Date.now(),
                    JSON.stringify({ score, total, mastery: result.mastery, trend: result.trend })
                ]
            )
            .catch(() => {});

        // 反馈更新到 feedback_loop
        await this.pool
            .query(
                `INSERT INTO feedback_loop
                (user_id, practice_record_id, weak_points, mastery_improvement)
             VALUES (?, (SELECT MAX(id) FROM practice_records WHERE user_id = ? AND knowledge_node_id = ?),
                     ?, ?)`,
                [
                    userId,
                    userId,
                    knowledgeId,
                    JSON.stringify([knowledgeId]),
                    JSON.stringify({ [knowledgeId]: { newMastery: result.mastery, trend: result.trend } })
                ]
            )
            .catch(() => {});

        return result;
    }
}

module.exports = PracticeTool;
