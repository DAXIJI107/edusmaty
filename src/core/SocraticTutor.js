class SocraticTutor {
    async generateResponse(userId, question, context, pool) {
        const questionType = this.classifyQuestion(question);
        const userLevel = await this.assessUserLevel(userId, pool);
        const relatedKnowledge = await this.findRelatedKnowledge(question, pool);

        const response = {
            type: questionType,
            userLevel,
            guidance: [],
            knowledgeCards: relatedKnowledge,
            nextQuestion: null,
            summary: null
        };

        if (questionType === 'direct_answer') {
            response.guidance = this.generateSocraticSteps(question, userLevel, relatedKnowledge);
            response.nextQuestion = this.generateFollowUp(question, userLevel);
        } else if (questionType === 'concept_confusion') {
            response.guidance = this.generateConceptClarification(question, relatedKnowledge);
        } else if (questionType === 'problem_solving') {
            response.guidance = this.generateProblemSolvingSteps(question, userLevel);
        }

        return response;
    }

    classifyQuestion(question) {
        const directPatterns = [/怎么解/, /怎么做/, /答案/, /等于多少/, /如何计算/];
        const conceptPatterns = [/什么是/, /区别/, /关系/, /概念/, /定义/, /什么意思/];
        const problemPatterns = [/为什么/, /如何理解/, /原理/, /机制/, /原因/];

        if (directPatterns.some(p => p.test(question))) return 'direct_answer';
        if (conceptPatterns.some(p => p.test(question))) return 'concept_confusion';
        if (problemPatterns.some(p => p.test(question))) return 'problem_solving';
        return 'general';
    }

    async assessUserLevel(userId, pool) {
        const [rows] = await pool.query(
            `SELECT AVG(sk.mastery) as avg_mastery
             FROM student_knowledge sk
             WHERE sk.user_id = ?`,
            [userId]
        );
        const avgMastery = rows[0]?.avg_mastery || 0;
        if (avgMastery < 40) return 'beginner';
        if (avgMastery < 70) return 'intermediate';
        return 'advanced';
    }

    async findRelatedKnowledge(question, pool) {
        const keywords = this.extractKeywords(question);
        const cards = [];

        for (const keyword of keywords) {
            const [nodes] = await pool.query(
                `SELECT id, name, subject, description FROM knowledge_nodes
                 WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1
                 LIMIT 3`,
                [`%${keyword}%`, `%${keyword}%`]
            );
            for (const node of nodes) {
                cards.push({
                    id: node.id,
                    name: node.name,
                    subject: node.subject,
                    description: node.description,
                    type: 'knowledge_card'
                });
            }
        }
        return cards;
    }

    extractKeywords(text) {
        const stopWords = ['的', '了', '是', '在', '什么', '怎么', '如何', '为什么', '一个', '这个', '那个'];
        const chars = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
        const words = chars.split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w));
        return [...new Set(words)].slice(0, 5);
    }

    generateSocraticSteps(question, level, knowledgeCards) {
        const steps = [];

        if (level === 'beginner') {
            steps.push({
                type: 'question',
                content: '在开始解题之前，你能先用自己的话说说，这个问题涉及哪些基本概念吗？',
                hint: '想想看题目中出现的专业术语，它们分别是什么意思？'
            });
            steps.push({
                type: 'guidance',
                content: '很好。让我们一步步来分析。首先，你能否确定题目给出的已知条件是什么？',
                hint: '把题目中的数字和条件列出来，看看哪些是直接给出的'
            });
        } else if (level === 'intermediate') {
            steps.push({
                type: 'question',
                content: '这道题和我们之前学过的哪个知识点相关？你能回忆一下相关的公式或定理吗？',
                hint: '想想这类题型的通用解法'
            });
            steps.push({
                type: 'guidance',
                content: '不错。那你觉得解题的关键步骤是什么？先别急着算，说说你的思路。',
                hint: '从已知条件出发，想想需要先求什么，再求什么'
            });
        } else {
            steps.push({
                type: 'question',
                content: '这道题有多种解法，你能想到几种？哪种最简洁？',
                hint: '考虑不同的角度和方法'
            });
            steps.push({
                type: 'challenge',
                content: '如果改变其中一个条件，答案会怎么变化？你能推导出一般规律吗？',
                hint: '尝试做参数化思考'
            });
        }

        if (knowledgeCards.length > 0) {
            steps.push({
                type: 'resource',
                content: `相关知识点：${knowledgeCards.map(k => k.name).join('、')}`,
                hint: '点击可查看详细知识卡片'
            });
        }

        return steps;
    }

    generateConceptClarification(question, knowledgeCards) {
        return [
            {
                type: 'explanation',
                content: '让我们从基本定义开始理解这个概念。',
                hint: '概念的定义是理解的基础'
            },
            {
                type: 'analogy',
                content: '我们可以用一个生活中的例子来类比理解：',
                hint: '类比能帮助建立直观认识'
            },
            {
                type: 'contrast',
                content: '这个概念和与之相近的概念有什么区别？',
                hint: '对比分析能加深理解'
            }
        ];
    }

    generateProblemSolvingSteps(question, level) {
        return [
            {
                type: 'decompose',
                content: '让我们把这个问题分解成几个小问题：',
                hint: '复杂问题往往可以拆解'
            },
            {
                type: 'think_aloud',
                content: '你觉得这个现象背后的核心原因是什么？',
                hint: '尝试从基本原理出发思考'
            },
            {
                type: 'verify',
                content: '你的推理过程有没有什么假设？这些假设都成立吗？',
                hint: '检查推理中的每一步'
            }
        ];
    }

    generateFollowUp(question, level) {
        if (level === 'beginner') {
            return '你能试着用你自己的话复述一下解题思路吗？';
        } else if (level === 'intermediate') {
            return '如果我把题目中的数字改一下，你还能用同样的方法解出来吗？';
        }
        return '你能总结一下这类题型的通用解题模板吗？';
    }

    async generateStructuredNote(userId, question, conversation, pool) {
        const keyPoints = this.extractKeyPoints(conversation);
        const misconceptions = this.identifyMisconceptions(conversation);
        const thinkingPath = this.extractThinkingPath(conversation);

        const note = {
            title: `对话笔记：${question.slice(0, 30)}${question.length > 30 ? '...' : ''}`,
            initialQuestion: question,
            keyPoints,
            misconceptions,
            thinkingPath,
            coreKnowledge: keyPoints.map(k => k.knowledge),
            reviewTask: {
                type: 'review',
                priority: misconceptions.length > 0 ? 'high' : 'medium',
                suggestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            createdAt: new Date()
        };

        if (misconceptions.length > 0) {
            for (const mc of misconceptions) {
                await pool.query(
                    `INSERT INTO error_book (user_id, question, wrong_answer, correct_answer, knowledge_node_id, status)
                     VALUES (?, ?, ?, ?, ?, 'unsolved')`,
                    [userId, question, mc.misconception, mc.correction, mc.nodeId || null]
                );
            }
        }

        return note;
    }

    extractKeyPoints(conversation) {
        return conversation
            .filter(c => c.type === 'guidance' || c.type === 'explanation')
            .map(c => ({
                knowledge: c.content.slice(0, 50),
                detail: c.content
            }));
    }

    identifyMisconceptions(conversation) {
        const misconceptions = [];
        const errorIndicators = ['不对', '错了', '不是', '误解', '混淆', '错误'];
        for (const turn of conversation) {
            if (turn.role === 'ai' && errorIndicators.some(i => turn.content.includes(i))) {
                misconceptions.push({
                    misconception: turn.content,
                    correction: turn.hint || '建议重新学习相关概念',
                    nodeId: turn.nodeId || null
                });
            }
        }
        return misconceptions;
    }

    extractThinkingPath(conversation) {
        return conversation
            .filter(c => c.type === 'question' || c.type === 'guidance')
            .map(c => ({
                step: c.content,
                type: c.type
            }));
    }
}

module.exports = SocraticTutor;