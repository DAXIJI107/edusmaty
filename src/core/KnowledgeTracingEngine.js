// core/KnowledgeTracingEngine.js
// BKT贝叶斯知识追踪引擎 - 四参数概率模型

class KnowledgeTracingEngine {
    constructor() {
        this.defaults = {
            prior: 0.3,     // P(L₀): 初始掌握概率
            learn: 0.15,    // P(T): 每次练习后的学习概率
            guess: 0.2,     // P(G): 猜测概率
            slip: 0.1       // P(S): 粗心失误概率
        };
    }

    /**
     * 从答题序列估计知识掌握度
     * @param {Array} answerSequence - [{correct: boolean, difficulty?: string, timeMs?: number}]
     * @param {Object} params - 可选的BKT参数覆盖
     */
    estimateMastery(answerSequence, params = {}) {
        if (!answerSequence || !answerSequence.length) {
            return { mastery: 0.3, confidence: 0.1, state: 'not_started' };
        }

        const p = { ...this.defaults, ...params };
        let L = p.prior;

        for (const answer of answerSequence) {
            if (answer.correct) {
                const P_correct_given_known = 1 - p.slip;
                const P_correct_given_unknown = p.guess;
                L = (L * P_correct_given_known) /
                    (L * P_correct_given_known + (1 - L) * P_correct_given_unknown);
            } else {
                const P_wrong_given_known = p.slip;
                const P_wrong_given_unknown = 1 - p.guess;
                L = (L * P_wrong_given_known) /
                    (L * P_wrong_given_known + (1 - L) * P_wrong_given_unknown);
            }
            L = L + (1 - L) * p.learn;
        }

        L = Math.max(0.01, Math.min(0.99, Math.round(L * 100) / 100));

        return {
            mastery: L,
            confidence: this.calculateConfidence(answerSequence.length),
            state: L >= 0.85 ? 'mastered' : L >= 0.6 ? 'learning' : L >= 0.3 ? 'beginner' : 'not_started',
            observationCount: answerSequence.length
        };
    }

    /**
     * 含遗忘效应的BKT变体
     */
    estimateMasteryWithForgetting(answerSequence, lastPracticeDate) {
        const result = this.estimateMastery(answerSequence);

        if (!lastPracticeDate) return result;

        const daysSinceLastPractice =
            (Date.now() - new Date(lastPracticeDate).getTime()) / 86400000;

        // 艾宾浩斯遗忘曲线: R = e^(-t/30)
        const halfLife = 30;
        const retentionRate = Math.exp(-daysSinceLastPractice / halfLife);

        return {
            ...result,
            mastery: Math.max(0.01, result.mastery * retentionRate),
            retentionRate: Math.round(retentionRate * 100) / 100,
            daysSincePractice: Math.round(daysSinceLastPractice),
            suggestedReviewIn: daysSinceLastPractice > 7 ? '尽快复习' :
                daysSinceLastPractice > 3 ? '1-2天内' :
                '暂不需要'
        };
    }

    /**
     * 根据用户历史拟合个性化BKT参数
     */
    async fitUserParams(pool, userId) {
        try {
            const [rows] = await pool.query(
                `SELECT ua.is_correct, ua.question_id, q.difficulty
                 FROM user_answers ua
                 JOIN questions q ON ua.question_id = q.id
                 WHERE ua.user_id = ?
                 ORDER BY ua.created_at ASC
                 LIMIT 200`,
                [userId]
            );

            if (!rows.length) return this.defaults;

            const correctCount = rows.filter(r => r.is_correct).length;
            const totalCount = rows.length;
            const overallAccuracy = correctCount / totalCount;

            // 拟合learn参数: 计算时间序列上accuracy的改善率
            const halves = Math.floor(rows.length / 2);
            const firstHalf = rows.slice(0, halves);
            const secondHalf = rows.slice(halves);
            const firstAcc = firstHalf.filter(r => r.is_correct).length / firstHalf.length;
            const secondAcc = secondHalf.filter(r => r.is_correct).length / secondHalf.length;
            const improvement = Math.max(0, secondAcc - firstAcc);

            // 拟合guess/slip: 分析高难度题对vs低难度题错
            const hardQuestions = rows.filter(r => r.difficulty === 'hard');
            const easyQuestions = rows.filter(r => r.difficulty === 'easy');

            const easyErrors = easyQuestions.filter(r => !r.is_correct).length / Math.max(1, easyQuestions.length);
            const hardCorrects = hardQuestions.filter(r => r.is_correct).length / Math.max(1, hardQuestions.length);

            return {
                prior: Math.max(0.1, Math.min(0.8, overallAccuracy)),
                learn: Math.max(0.05, Math.min(0.3, improvement || 0.15)),
                guess: Math.max(0.05, Math.min(0.4, hardCorrects || 0.2)),
                slip: Math.max(0.02, Math.min(0.3, easyErrors || 0.1))
            };
        } catch (e) {
            console.error('拟合BKT参数失败，使用默认值:', e.message);
            return this.defaults;
        }
    }

    /**
     * 预测下一题的正确概率
     */
    predictNextCorrect(currentMastery, questionDifficulty, params = {}) {
        const p = { ...this.defaults, ...params };
        const slip = p.slip * (1 + (questionDifficulty === 'hard' ? 0.5 : questionDifficulty === 'easy' ? -0.3 : 0));
        const guess = p.guess * (1 + (questionDifficulty === 'easy' ? 0.3 : questionDifficulty === 'hard' ? -0.2 : 0));
        return currentMastery * (1 - slip) + (1 - currentMastery) * guess;
    }

    /**
     * 从knowledge_bindings和user_answers批量计算所有知识点掌握度
     */
    async batchEstimateMastery(pool, userId) {
        try {
            const [bindings] = await pool.query(
                `SELECT DISTINCT kb.knowledge_id, kn.title, kn.subject
                 FROM knowledge_bindings kb
                 JOIN knowledge_nodes kn ON kb.knowledge_id = kn.id
                 LIMIT 500`
            );

            const [answers] = await pool.query(
                `SELECT ua.question_id, ua.is_correct, kb.knowledge_id, q.difficulty
                 FROM user_answers ua
                 JOIN questions q ON ua.question_id = q.id
                 JOIN knowledge_bindings kb ON q.id = kb.question_id
                 WHERE ua.user_id = ?
                 ORDER BY ua.created_at ASC`,
                [userId]
            );

            const answersByKnowledge = {};
            for (const ans of answers) {
                const kid = ans.knowledge_id;
                if (!answersByKnowledge[kid]) answersByKnowledge[kid] = [];
                answersByKnowledge[kid].push({ correct: Boolean(ans.is_correct), difficulty: ans.difficulty });
            }

            const userParams = await this.fitUserParams(pool, userId);

            const result = {};
            for (const b of bindings) {
                const seq = answersByKnowledge[b.knowledge_id] || [];
                const est = this.estimateMastery(seq, userParams);
                result[b.knowledge_id] = {
                    knowledgeId: b.knowledge_id,
                    title: b.title,
                    subject: b.subject,
                    ...est
                };
            }

            return result;
        } catch (e) {
            console.error('批量知识追踪失败:', e.message);
            return {};
        }
    }

    calculateConfidence(n) {
        if (n === 0) return 0.1;
        if (n <= 3) return 0.25;
        if (n <= 7) return 0.45;
        if (n <= 12) return 0.65;
        if (n <= 20) return 0.8;
        return 0.9;
    }
}

module.exports = KnowledgeTracingEngine;