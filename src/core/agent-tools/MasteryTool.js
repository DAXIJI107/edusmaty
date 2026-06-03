/**
 * MasteryTool - BKT 简化掌握度计算引擎
 * 
 * 基于 Bayesian Knowledge Tracing 简化模型：
 * P(mastery) = P(L₀) + (1 - P(L₀)) * P(T)
 * 
 * 考虑因子：
 * - 正确率 (correct / total)
 * - 错题重复错误次数 (error_count)
 * - 距离上次练习的时间衰减 (days since last practice)
 * - 题目难度加权
 */
class MasteryTool {
    constructor(pool) {
        this.pool = pool;
        // BKT 默认参数
        this.P_L0 = 0.3;   // 初始掌握概率
        this.P_T = 0.2;    // 每次正确回答的学习增益
        this.P_S = 0.1;    // 猜测概率 (即使未掌握也答对)
        this.P_G = 0.15;   // 失误概率 (即使掌握了也答错)
    }

    /** 
     * 根据练习记录计算最新掌握度
     * @param {number} userId
     * @param {number} knowledgeId
     * @returns {{ mastery: number, confidence: number, trend: string, evidence: object }}
     */
    async calculate(userId, knowledgeId) {
        // 1. 获取该知识点的答题记录
        const [answers] = await this.pool.query(
            `SELECT ua.is_correct, q.difficulty, ua.created_at
             FROM user_answers ua
             JOIN questions q ON q.id = ua.question_id
             WHERE ua.user_id = ? AND q.knowledge_id = ?
             ORDER BY ua.created_at DESC
             LIMIT 30`,
            [userId, knowledgeId]
        ).catch(() => [[]]);

        // 2. 获取错题本中该知识点的记录
        const [errors] = await this.pool.query(
            `SELECT COUNT(*) as count, SUM(redo_correct) as redo_correct, SUM(redo_count) as redo_total,
                    AVG(mastery_before) as avg_mastery_before
             FROM error_book
             WHERE user_id = ? AND knowledge_node_id = ?`,
            [userId, knowledgeId]
        ).catch(() => [[{ count: 0, redo_correct: 0, redo_total: 0, avg_mastery_before: null }]]);

        // 3. 获取已有的学生知识记录
        const [studentK] = await this.pool.query(
            `SELECT mastery, error_count, trend, last_practice_at
             FROM student_knowledge
             WHERE user_id = ? AND node_id = ?`,
            [userId, knowledgeId]
        ).catch(() => [[]]);

        const errorInfo = errors[0] || { count: 0, redo_correct: 0, redo_total: 0, avg_mastery_before: null };
        const priorMastery = studentK.length ? studentK[0].mastery : this.P_L0 * 100;
        const priorErrorCount = studentK.length ? studentK[0].error_count : 0;

        // 4. 计算练习正确率 (近期 10 题加权)
        const recentTotal = Math.min(answers.length, 10);
        if (recentTotal === 0) {
            return {
                mastery: Math.round(priorMastery),
                confidence: studentK.length ? 0.5 : 0.2,
                trend: studentK.length ? studentK[0].trend : 'unknown',
                evidence: {
                    totalAnswers: 0,
                    priorMastery,
                    message: '暂无该知识点的答题记录，保持现有掌握度。'
                }
            };
        }

        const recent = answers.slice(0, recentTotal);
        let weightedCorrect = 0;
        let weightedTotal = 0;
        for (let i = 0; i < recent.length; i++) {
            const difficultyWeight = recent[i].difficulty === 'hard' ? 1.5 : recent[i].difficulty === 'medium' ? 1.2 : 1.0;
            const recencyWeight = 1 - (i / recent.length) * 0.3; // 越近权重越高
            if (recent[i].is_correct) {
                weightedCorrect += difficultyWeight * recencyWeight;
            }
            weightedTotal += difficultyWeight * recencyWeight;
        }
        const weightedAccuracy = weightedTotal > 0 ? weightedCorrect / weightedTotal : 0;

        // 5. BKT 更新公式
        // P(L₁) = P(L₀ | evidence) = (P(L₀) * P(evidence | L₀)) / P(evidence)
        // 简化：新掌握度 = 先验 * (1 - α) + 近期表现 * α
        const recencyHours = studentK.length && studentK[0].last_practice_at
            ? (Date.now() - new Date(studentK[0].last_practice_at).getTime()) / 3600000
            : 999;
        
        // 遗忘衰减：超过 7 天不练习，权重偏向先验
        const decayDays = recencyHours / 24;
        const forgetFactor = Math.max(0.3, Math.exp(-decayDays / 14)); // 14天半衰期
        
        // 学习率：数据越多学得越准
        const learnRate = Math.min(0.7, 0.15 + recentTotal * 0.05);
        
        const rawMastery = (priorMastery / 100) * (1 - learnRate) * forgetFactor + weightedAccuracy * learnRate;
        
        // 错题修正：重复错误降低掌握度
        const repeatErrorPenalty = Math.min(0.2, errorInfo.count * 0.02);
        const adjustedMastery = Math.max(0.05, rawMastery - repeatErrorPenalty);

        // 6. 趋势判断
        let trend = 'stable';
        const currentMasteryPct = adjustedMastery * 100;
        if (currentMasteryPct > priorMastery + 5) trend = 'improving';
        else if (currentMasteryPct < priorMastery - 5) trend = 'declining';

        return {
            mastery: Math.round(currentMasteryPct),
            confidence: Math.min(0.9, 0.3 + recentTotal * 0.04),
            trend,
            evidence: {
                totalAnswers: answers.length,
                recentTotal,
                weightedAccuracy: Math.round(weightedAccuracy * 100),
                priorMastery,
                errorCount: errorInfo.count,
                redoCorrectRate: errorInfo.redo_total ? Math.round((errorInfo.redo_correct / errorInfo.redo_total) * 100) : null,
                forgetFactor: Math.round(forgetFactor * 100),
                message: errorInfo.count > 2
                    ? `该知识点累计 ${errorInfo.count} 道错题，重复错误扣减掌握度。`
                    : weightedAccuracy > 0.7
                        ? '近期练习表现良好，掌握度提升。'
                        : '近期正确率偏低，建议加强练习。'
            }
        };
    }

    /** 
     * 记录练习完成并更新掌握度
     */
    async recordCompletion(userId, knowledgeId, { score, total, durationMs, questionIds, answers = [] }) {
        // 1. 写入 practice_records
        await this.pool.query(
            `INSERT INTO practice_records
                (user_id, knowledge_node_id, question_ids, answers, score, total, duration, practice_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'closure')`,
            [
                userId,
                knowledgeId,
                JSON.stringify(questionIds || []),
                JSON.stringify(answers),
                score,
                total,
                durationMs || 0
            ]
        ).catch(() => {});

        // 2. 计算新掌握度
        const result = await this.calculate(userId, knowledgeId);

        // 3. 更新 student_knowledge
        await this.pool.query(
            `INSERT INTO student_knowledge (user_id, node_id, mastery, last_practice_at, error_count, trend)
             VALUES (?, ?, ?, NOW(), ?, ?)
             ON DUPLICATE KEY UPDATE
                mastery = VALUES(mastery),
                last_practice_at = NOW(),
                error_count = VALUES(error_count),
                trend = VALUES(trend)`,
            [
                userId,
                knowledgeId,
                result.mastery,
                result.evidence.errorCount,
                result.trend
            ]
        ).catch(() => {});

        // 4. 同步更新 knowledge_points (兼容旧表)
        await this.pool.query(
            `UPDATE knowledge_points SET mastery = ? WHERE id = ?`,
            [result.mastery, knowledgeId]
        ).catch(() => {});

        // 5. 更新 student_practice_mastery
        await this.pool.query(
            `INSERT INTO student_practice_mastery (user_id, knowledge_node_id, mastery, last_practice_time)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE mastery = VALUES(mastery), last_practice_time = NOW()`,
            [userId, knowledgeId, result.mastery]
        ).catch(() => {});

        return result;
    }

    /** 
     * 批量获取多个知识点的掌握度
     */
    async batchGet(userId, knowledgeIds) {
        const [rows] = await this.pool.query(
            `SELECT node_id, mastery, trend, error_count, last_practice_at
             FROM student_knowledge
             WHERE user_id = ? AND node_id IN (${knowledgeIds.map(() => '?').join(',')})`,
            [userId, ...knowledgeIds]
        ).catch(() => [[]]);

        const map = {};
        knowledgeIds.forEach(id => {
            map[id] = { mastery: 0, trend: 'unknown', errorCount: 0 };
        });
        rows.forEach(r => {
            map[r.node_id] = { mastery: r.mastery, trend: r.trend, errorCount: r.error_count, lastPractice: r.last_practice_at };
        });
        return map;
    }
}

module.exports = MasteryTool;