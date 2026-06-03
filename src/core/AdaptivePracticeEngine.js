class AdaptivePracticeEngine {
    async generatePractice(userId, nodeId, pool, options = {}) {
        const mastery = await this.getMastery(userId, nodeId, pool);
        const targetDifficulty = this.calculateTargetDifficulty(mastery);
        const questionCount = options.count || this.calculateOptimalCount(mastery);

        const [questions] = await pool.query(
            `SELECT id, content, type, difficulty, options, answer, skill_codes
             FROM questions
             WHERE node_id = ? AND is_active = 1 AND difficulty = ?
             ORDER BY RAND() LIMIT ?`,
            [nodeId, targetDifficulty, questionCount]
        );

        if (questions.length < questionCount) {
            const [backup] = await pool.query(
                `SELECT id, content, type, difficulty, options, answer, skill_codes
                 FROM questions
                 WHERE node_id = ? AND is_active = 1
                 ORDER BY RAND() LIMIT ?`,
                [nodeId, questionCount - questions.length]
            );
            questions.push(...backup);
        }

        return {
            nodeId,
            mastery,
            targetDifficulty,
            questions: questions.map(q => ({
                id: q.id,
                content: q.content,
                type: q.type,
                difficulty: q.difficulty,
                options: q.options,
                skillCodes: q.skill_codes
            })),
            strategy: this.getPracticeStrategy(mastery),
            estimatedTime: questions.length * 2
        };
    }

    async getMastery(userId, nodeId, pool) {
        const [rows] = await pool.query(
            'SELECT mastery FROM student_knowledge WHERE user_id = ? AND node_id = ?',
            [userId, nodeId]
        );
        return rows.length > 0 ? rows[0].mastery : 0;
    }

    calculateTargetDifficulty(mastery) {
        if (mastery < 30) return 'easy';
        if (mastery < 50) return 'easy';
        if (mastery < 70) return 'medium';
        if (mastery < 85) return 'hard';
        return 'hard';
    }

    calculateOptimalCount(mastery) {
        if (mastery < 30) return 8;
        if (mastery < 50) return 6;
        if (mastery < 70) return 5;
        if (mastery < 85) return 4;
        return 3;
    }

    getPracticeStrategy(mastery) {
        if (mastery < 30) {
            return {
                focus: '基础概念理解',
                approach: '从定义和基本应用开始',
                tips: '建议先观看相关视频教程再做题'
            };
        }
        if (mastery < 50) {
            return {
                focus: '核心概念巩固',
                approach: '通过典型例题掌握基本应用',
                tips: '注意总结每道题的解题步骤'
            };
        }
        if (mastery < 70) {
            return {
                focus: '综合应用提升',
                approach: '练习跨知识点的综合题',
                tips: '尝试一题多解，拓展思路'
            };
        }
        if (mastery < 85) {
            return {
                focus: '高阶应用挑战',
                approach: '解决复杂场景问题',
                tips: '关注解题效率和最优方法'
            };
        }
        return {
            focus: '创新应用',
            approach: '探索非常规问题解法',
            tips: '尝试自己出题或教别人'
        };
    }

    async analyzeAnswer(userId, questionId, userAnswer, pool) {
        const [question] = await pool.query(
            'SELECT * FROM questions WHERE id = ?',
            [questionId]
        );
        if (question.length === 0) return null;

        const q = question[0];
        const isCorrect = String(userAnswer).trim() === String(q.answer).trim();

        const feedback = {
            isCorrect,
            correctAnswer: q.answer,
            explanation: null,
            misconception: null,
            nextDifficulty: null
        };

        if (!isCorrect) {
            feedback.explanation = await this.generateExplanation(q, userAnswer);
            feedback.misconception = this.detectMisconception(q, userAnswer);
            feedback.nextDifficulty = 'easy';
        } else {
            feedback.nextDifficulty = this.getNextDifficulty(q.difficulty);
        }

        return feedback;
    }

    async generateExplanation(question, userAnswer) {
        return `正确答案是：${question.answer}。你的回答"${userAnswer}"不完全正确。建议回顾相关知识点，注意理解题目中的关键条件。`;
    }

    detectMisconception(question, userAnswer) {
        const patterns = [
            { pattern: /公式记错|记错公式/, diagnosis: '公式记忆不牢固' },
            { pattern: /计算错误|算错了/, diagnosis: '计算过程粗心' },
            { pattern: /概念混淆|混淆/, diagnosis: '概念理解不清晰' },
            { pattern: /审题不清|看错了/, diagnosis: '审题习惯需要改进' }
        ];

        for (const p of patterns) {
            if (p.pattern.test(userAnswer)) return p.diagnosis;
        }
        return '需要进一步分析错误原因';
    }

    getNextDifficulty(currentDifficulty) {
        const levels = ['easy', 'medium', 'hard'];
        const idx = levels.indexOf(currentDifficulty);
        if (idx < levels.length - 1) return levels[idx + 1];
        return 'hard';
    }

    async generateAdaptiveTest(userId, pool, options = {}) {
        const count = options.count || 10;
        const subjects = options.subjects || [];

        let subjectFilter = '';
        const params = [userId];
        if (subjects.length > 0) {
            subjectFilter = `AND kn.subject IN (${subjects.map(() => '?').join(',')})`;
            params.push(...subjects);
        }

        const [weakNodes] = await pool.query(
            `SELECT sk.node_id, sk.mastery, kn.name, kn.subject
             FROM student_knowledge sk
             JOIN knowledge_nodes kn ON sk.node_id = kn.id
             WHERE sk.user_id = ? AND kn.is_active = 1 ${subjectFilter}
             ORDER BY sk.mastery ASC LIMIT 10`,
            params
        );

        const questions = [];
        let remainingCount = count;

        for (const node of weakNodes) {
            if (remainingCount <= 0) break;
            const nodeCount = Math.min(remainingCount, Math.ceil(count / weakNodes.length));
            const difficulty = this.calculateTargetDifficulty(node.mastery);

            const [qs] = await pool.query(
                `SELECT id, content, type, difficulty, options, skill_codes
                 FROM questions WHERE node_id = ? AND difficulty = ? AND is_active = 1
                 ORDER BY RAND() LIMIT ?`,
                [node.nodeId, difficulty, nodeCount]
            );

            questions.push(...qs.map(q => ({
                ...q,
                nodeName: node.name,
                subject: node.subject,
                nodeMastery: node.mastery
            })));
            remainingCount -= qs.length;
        }

        if (questions.length < count) {
            const [extra] = await pool.query(
                `SELECT q.id, q.content, q.type, q.difficulty, q.options, q.skill_codes,
                        kn.name as nodeName, kn.subject
                 FROM questions q
                 JOIN knowledge_nodes kn ON q.node_id = kn.id
                 WHERE q.is_active = 1
                 ORDER BY RAND() LIMIT ?`,
                [count - questions.length]
            );
            questions.push(...extra);
        }

        return {
            testId: `adaptive_${Date.now()}`,
            type: 'adaptive',
            totalQuestions: questions.length,
            estimatedTime: questions.length * 2,
            difficulty: 'mixed',
            questions: questions.map(q => ({
                id: q.id,
                content: q.content,
                type: q.type,
                difficulty: q.difficulty,
                options: q.options,
                skillCodes: q.skill_codes,
                nodeName: q.nodeName,
                subject: q.subject
            })),
            focusNodes: weakNodes.map(n => ({
                id: n.node_id,
                name: n.name,
                mastery: n.mastery
            }))
        };
    }
}

module.exports = AdaptivePracticeEngine;