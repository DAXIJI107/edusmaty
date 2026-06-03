// core/AdaptiveDiagnosticEngine.js
// CAT自适应诊断引擎 - Fisher信息量最大化选题 + EAP能力估计

const { normalizeDifficulty } = require('./SubjectUtils');

class AdaptiveDiagnosticEngine {
    constructor(userId, pool, options = {}) {
        this.userId = userId;
        this.pool = pool;
        this.ability = 0;           // θ 能力估计
        this.abilitySE = 2.0;       // 标准误(初始大)
        this.minQuestions = options.minQuestions || 8;
        this.maxQuestions = options.maxQuestions || 25;
        this.targetSE = options.targetSE || 0.35;
        this.responses = [];
        this.questionsUsed = new Set();
        this.subjects = options.subjects || [];
        this.subjectScores = {};
    }

    /**
     * 获取下一道自适应题目
     */
    async selectNextQuestion() {
        try {
            const conditions = [];
            const params = [];

            // 已用题目排除
            if (this.questionsUsed.size > 0) {
                conditions.push(`q.id NOT IN (${[...this.questionsUsed].map(() => '?').join(',')})`);
                params.push(...[...this.questionsUsed]);
            }

            // 学科过滤
            if (this.subjects.length > 0) {
                conditions.push(`kp.subject IN (${this.subjects.map(() => '?').join(',')})`);
                params.push(...this.subjects);
            }

            const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // 获取候选题目
            const [rows] = await this.pool.query(
                `SELECT q.id, q.question, q.options_json, q.correct_answer, q.difficulty,
                        q.knowledge_id, kp.subject, kp.title as knowledge_name
                 FROM questions q
                 JOIN knowledge_points kp ON q.knowledge_id = kp.id
                 ${where}
                 ORDER BY RAND()
                 LIMIT 50`,
                params
            );

            if (!rows.length) return null;

            // 计算每道题的Fisher信息量，选最大
            let bestQuestion = rows[0];
            let maxInfo = 0;

            for (const row of rows) {
                const diff = this.difficultyToNumeric(row.difficulty);
                const info = this.fisherInformation(this.ability, diff);
                if (info > maxInfo) {
                    maxInfo = info;
                    bestQuestion = row;
                }
            }

            // 如果估计值还很宽，选难度更接近的题
            if (maxInfo < 0.1 && this.responses.length < 5) {
                const targetDiff = this.estimateTargetDifficulty();
                bestQuestion = rows.reduce((best, row) => {
                    const d = this.difficultyToNumeric(row.difficulty);
                    return Math.abs(d - targetDiff) < Math.abs(this.difficultyToNumeric(best.difficulty) - targetDiff) ? row : best;
                }, rows[0]);
            }

            this.questionsUsed.add(bestQuestion.id);

            let options = bestQuestion.options_json;
            if (typeof options === 'string') {
                try { options = JSON.parse(options); } catch (e) { options = []; }
            }
            if (!Array.isArray(options)) options = [];

            return {
                id: bestQuestion.id,
                content: bestQuestion.question,
                type: this.inferQuestionType(options),
                options: options,
                difficulty: bestQuestion.difficulty || 'medium',
                difficultyNumeric: this.difficultyToNumeric(bestQuestion.difficulty),
                knowledgeId: bestQuestion.knowledge_id,
                knowledgeName: bestQuestion.knowledge_name,
                subject: bestQuestion.subject,
                questionIndex: this.responses.length + 1
            };
        } catch (error) {
            console.error('AdaptiveDiagnostic: 选题失败', error.message);
            return null;
        }
    }

    /**
     * 提交答案并更新能力估计
     */
    async submitAnswer(questionId, isCorrect, timeMs) {
        try {
            const [rows] = await this.pool.query(
                `SELECT q.difficulty, q.knowledge_id, kp.subject
                 FROM questions q
                 JOIN knowledge_points kp ON q.knowledge_id = kp.id
                 WHERE q.id = ?`,
                [questionId]
            );

            if (!rows.length) throw new Error('题目不存在');

            const { difficulty, knowledge_id, subject } = rows[0];
            const diffNumeric = this.difficultyToNumeric(difficulty);

            // EAP更新能力估计
            this.updateAbilityEAP(isCorrect, diffNumeric);

            // 更新学科得分
            if (subject) {
                if (!this.subjectScores[subject]) {
                    this.subjectScores[subject] = { correct: 0, total: 0, questions: [] };
                }
                this.subjectScores[subject].total++;
                if (isCorrect) this.subjectScores[subject].correct++;
                this.subjectScores[subject].questions.push({
                    questionId, correct: isCorrect, difficulty, knowledgeId: knowledge_id
                });
            }

            this.responses.push({
                questionId, correct: isCorrect, difficulty, diffNumeric,
                knowledgeId: knowledge_id, subject, timeMs
            });

            return {
                ability: Math.round(this.ability * 100) / 100,
                abilitySE: Math.round(this.abilitySE * 100) / 100,
                shouldContinue: this.shouldContinue(),
                progress: Math.round((this.responses.length / this.maxQuestions) * 100),
                recentAccuracy: this.calculateRecentAccuracy()
            };
        } catch (error) {
            console.error('AdaptiveDiagnostic: 提交答案失败', error.message);
            throw error;
        }
    }

    /**
     * 生成最终诊断报告
     */
    async generateReport() {
        const subjectAnalysis = {};
        for (const [subject, data] of Object.entries(this.subjectScores)) {
            const accuracy = data.total > 0 ? data.correct / data.total : 0;
            subjectAnalysis[subject] = {
                subject,
                accuracy: Math.round(accuracy * 100),
                questions: data.total,
                correct: data.correct,
                state: accuracy >= 0.75 ? 'strong' : accuracy >= 0.5 ? 'moderate' : accuracy >= 0.3 ? 'weak' : 'beginner',
                weakKnowledgeIds: [...new Set(data.questions.filter(q => !q.correct).map(q => q.knowledgeId))]
            };
        }

        const overallAccuracy = this.responses.length > 0
            ? this.responses.filter(r => r.correct).length / this.responses.length
            : 0;

        return {
            abilityEstimate: Math.round(this.ability * 100) / 100,
            abilitySE: Math.round(this.abilitySE * 100) / 100,
            reliability: this.abilitySE < 0.35 ? '高' : this.abilitySE < 0.55 ? '中' : '低',
            questionsAnswered: this.responses.length,
            overallAccuracy: Math.round(overallAccuracy * 100),
            subjectAnalysis,
            cognitiveLevels: this.estimateCognitiveLevels(),
            responsePattern: this.analyzeResponsePattern(),
            estimatedGrade: this.estimateGrade(this.ability),
            diagnosisQuality: this.calculateDiagnosisQuality()
        };
    }

    // ==== IRT核心算法 =====

    /**
     * Fisher信息量: I(θ) = P'(θ)² / [ P(θ) * (1-P(θ)) ]
     */
    fisherInformation(ability, difficulty) {
        const prob = this.itemResponseProbability(ability, difficulty);
        const slope = 1.7;
        const dP = slope * prob * (1 - prob);
        const information = (dP * dP) / (prob * (1 - prob));
        return isNaN(information) ? 0 : information;
    }

    /**
     * 项目反应函数: P(θ) = 1 / (1 + e^(-a*(θ-b)))
     */
    itemResponseProbability(ability, difficulty) {
        const a = 1.7;  // 区分度参数
        return 1 / (1 + Math.exp(-a * (ability - difficulty)));
    }

    /**
     * EAP (最大期望后验) 能力更新
     */
    updateAbilityEAP(isCorrect, difficulty) {
        const a = 1.7;
        const P = this.itemResponseProbability(this.ability, difficulty);

        // 似然函数的梯度
        const gradient = a * (isCorrect - P);

        // Fisher信息 = Hessian的期望
        const info = this.fisherInformation(this.ability, difficulty) || 0.1;

        // 先验: N(0, 1)
        const priorGradient = -this.ability;
        const priorInfo = 1;

        // EAP更新: θ_new = θ_old + gradient_total / info_total
        const totalGradient = gradient + priorGradient;
        const totalInfo = info + priorInfo;

        if (totalInfo > 0) {
            this.ability += totalGradient / (totalInfo * (1 + this.responses.length * 0.1));
        }

        this.abilitySE = Math.sqrt(1 / Math.max(totalInfo, 0.01));
        this.ability = Math.max(-3, Math.min(3, this.ability));
    }

    shouldContinue() {
        if (this.responses.length < this.minQuestions) return true;
        if (this.responses.length >= this.maxQuestions) return false;
        return this.abilitySE > this.targetSE;
    }

    difficultyToNumeric(difficulty) {
        const d = String(difficulty || 'medium').toLowerCase().trim();
        if (d === 'easy' || d === '简单') return -1;
        if (d === 'hard' || d === '困难') return 1.5;
        return 0;
    }

    estimateTargetDifficulty() {
        if (this.responses.length === 0) return 0;
        const recentAccuracy = this.calculateRecentAccuracy();
        if (recentAccuracy >= 0.8) return 1;
        if (recentAccuracy >= 0.5) return 0;
        return -1;
    }

    calculateRecentAccuracy(n = 5) {
        const recent = this.responses.slice(-n);
        if (!recent.length) return 0;
        return recent.filter(r => r.correct).length / recent.length;
    }

    inferQuestionType(options) {
        if (!options || !options.length) return 'single';
        if (options.length === 2 && (options.includes('正确') || options.includes('错误'))) return 'judge';
        return 'single';
    }

    estimateCognitiveLevels() {
        const bloomLevels = {
            '记忆': 0.5 + this.ability * 0.1,
            '理解': 0.4 + this.ability * 0.12,
            '应用': 0.3 + this.ability * 0.15,
            '分析': 0.2 + this.ability * 0.15,
            '评价': 0.15 + this.ability * 0.12,
            '创造': 0.1 + this.ability * 0.1
        };
        // 归一化到0-1
        for (const key in bloomLevels) {
            bloomLevels[key] = Math.max(0.05, Math.min(0.95, bloomLevels[key]));
        }
        return bloomLevels;
    }

    analyzeResponsePattern() {
        if (this.responses.length < 5) return { pattern: 'insufficient_data', description: '答题量不足，无法分析模式' };

        let consecutiveCorrect = 0, consecutiveWrong = 0;
        let maxConsecutiveCorrect = 0, maxConsecutiveWrong = 0;

        for (const r of this.responses) {
            if (r.correct) {
                consecutiveCorrect++;
                consecutiveWrong = 0;
                maxConsecutiveCorrect = Math.max(maxConsecutiveCorrect, consecutiveCorrect);
            } else {
                consecutiveWrong++;
                consecutiveCorrect = 0;
                maxConsecutiveWrong = Math.max(maxConsecutiveWrong, consecutiveWrong);
            }
        }

        if (maxConsecutiveWrong >= 3) return { pattern: 'struggling', description: '连续多题错误，可能需要调整学习策略' };
        if (maxConsecutiveCorrect >= 4) return { pattern: 'thriving', description: '连续多题正确，当前难度适中偏低' };
        return { pattern: 'variable', description: '对错交替，处于最佳学习区间边缘' };
    }

    estimateGrade(ability) {
        if (ability >= 2) return 'A (优秀)';
        if (ability >= 1) return 'B (良好)';
        if (ability >= 0) return 'C (中等)';
        if (ability >= -1) return 'D (及格)';
        return 'E (需努力)';
    }

    calculateDiagnosisQuality() {
        const reliability = this.abilitySE < 0.35 ? '高' : this.abilitySE < 0.55 ? '中' : '低';
        const coverage = this.subjects.length >= 3 ? '全面' : this.subjects.length >= 2 ? '基本' : '单一';
        const depth = this.responses.length >= 15 ? '充分' : this.responses.length >= 10 ? '适中' : '初步';
        return { reliability, coverage, depth };
    }
}

module.exports = AdaptiveDiagnosticEngine;