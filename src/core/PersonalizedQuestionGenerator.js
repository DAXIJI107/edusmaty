// core/PersonalizedQuestionGenerator.js
// 基于LLM + RAG的个性化题目生成器
// 替代固定模版：根据用户画像、掌握度、学习风格、薄弱点生成专属题目
//
// 参考 Ollama + LightRAG 方案：
//   1. 检索学习者掌握度
//   2. RAG检索相关知识上下文
//   3. 结合学习风格生成个性化prompt
//   4. 调用LLM生成题目

const llmGateway = require("./llm/LlmGateway");
const { ensureRagData } = require("./RagSeeder");

class PersonalizedQuestionGenerator {
    /**
     * @param {object} pool - MySQL连接池
     * @param {object} options
     */
    constructor(pool, options = {}) {
        this.pool = pool;
        this.maxBatch = options.maxBatch || 10;
        this.defaultDifficulty = options.defaultDifficulty || "medium";
    }

    /**
     * 加载用户画像
     */
    async _loadProfile(userId) {
        try {
            const [rows] = await this.pool.query("SELECT profile_json FROM student_profiles WHERE user_id = ?", [
                userId
            ]);
            if (rows.length > 0) {
                const profile =
                    typeof rows[0].profile_json === "string" ? JSON.parse(rows[0].profile_json) : rows[0].profile_json;
                return profile || {};
            }
        } catch (e) {
            /* 忽略 */
        }
        return {};
    }

    /**
     * 获取指定知识点的掌握度
     */
    async _getMastery(userId, nodeId) {
        const [rows] = await this.pool.query(
            "SELECT mastery FROM student_knowledge WHERE user_id = ? AND node_id = ?",
            [userId, nodeId]
        );
        return rows.length > 0 ? Number(rows[0].mastery || 0) : 0;
    }

    /**
     * RAG检索相关知识上下文
     */
    async _retrieveContext(topic, limit = 3) {
        try {
            const data = await ensureRagData();
            const chunks = data.chunks || data.rag_chunks || [];
            if (!chunks.length) return [];

            // 简单关键词匹配
            const keywords = String(topic)
                .split(/[\s,，]+/)
                .filter(Boolean);
            const scored = chunks.map(chunk => {
                const text = (chunk.title + " " + (chunk.content || "")).toLowerCase();
                let score = 0;
                for (const kw of keywords) {
                    if (text.includes(kw.toLowerCase())) score += 1;
                }
                return { ...chunk, score };
            });

            return scored
                .filter(c => c.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(c => c.content || c.title || "");
        } catch (e) {
            return [];
        }
    }

    /**
     * 核心方法：生成个性化题目
     *
     * @param {string} topic - 知识点名称
     * @param {object} options
     * @param {number} [options.userId] - 用户ID（个性化画像）
     * @param {string} [options.difficulty] - 难度 easy/medium/hard
     * @param {string} [options.learningStyle] - 学习风格
     * @param {number} [options.mastery] - 掌握度 0-100
     * @param {number} [options.questionType] - 0=单选, 1=多选, 2=判断
     * @returns {object} { question, options, answer, explanation, difficulty, tags }
     */
    async generateQuestion(topic, options = {}) {
        const userId = options.userId;
        let mastery = options.mastery;
        let learningStyle = options.learningStyle || "reading";
        let difficulty = options.difficulty || this.defaultDifficulty;

        // 如果有userId，从数据库加载个性化数据
        if (userId) {
            const profile = await this._loadProfile(userId);
            learningStyle = profile.learningStyle || profile.learning_style || learningStyle;
            difficulty = this._mapMasteryToDifficulty(mastery || 50);
        }

        // 检索RAG上下文
        const contexts = await this._retrieveContext(topic, 3);
        const ragContext =
            contexts.length > 0
                ? `\n【相关知识库内容】\n${contexts.map((c, i) => `${i + 1}. ${c.slice(0, 300)}`).join("\n")}`
                : "";

        const typeLabels = ["单选题", "多选题", "判断题"];
        const qType = options.questionType !== undefined ? typeLabels[options.questionType] : "单选题";

        const prompt = `你是一位专业的计算机科学教育者，请为学习者生成一道${qType}。

【题目要求】
- 知识点：${topic}
- 难度：${difficulty}
- 题型：${qType}
- 学习者掌握度：${mastery || "未知"}%（掌握度越低，题目越基础）
- 学习者风格：${learningStyle}（visual=图表类, auditory=讲解类, reading=文字类, kinesthetic=实践类）
${ragContext}

请返回JSON格式：
{
  "question": "题目内容（根据学习风格调整表述方式）",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "answer": "正确选项的索引（0-based）或'正确'/'错误'",
  "explanation": "详细解析，解释为什么正确以及其他选项为什么错误",
  "difficulty": "${difficulty}",
  "tags": ["标签1", "标签2"]
}

只返回JSON。`;

        try {
            const result = await llmGateway.chat({
                messages: [
                    {
                        role: "system",
                        content: "你是计算机科学题目生成专家。请总是返回有效JSON，题目内容准确、有教育意义。"
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.6,
                maxTokens: 1024,
                fallbackContent: JSON.stringify(this._fallbackQuestion(topic, difficulty))
            });

            const isFallback = result && result.provider === "fallback";
            const content = result?.content || "";

            const jsonMatch = String(content).match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    ...parsed,
                    generatedBy: isFallback ? "fallback" : "llm",
                    generatedAt: new Date().toISOString()
                };
            }
        } catch (e) {
            console.warn("题目生成LLM调用失败，使用回退:", e.message);
        }

        return {
            ...this._fallbackQuestion(topic, difficulty),
            generatedBy: "fallback",
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * 批量生成个性化题目集
     *
     * @param {Array<{topic: string, difficulty?: string}>} topics
     * @param {object} options - 同 generateQuestion
     * @returns {Array<object>}
     */
    async generateQuestionSet(topics, options = {}) {
        const questions = [];
        for (const item of topics.slice(0, this.maxBatch)) {
            const q = await this.generateQuestion(typeof item === "string" ? item : item.topic, {
                ...options,
                difficulty: item.difficulty || options.difficulty,
                questionType: options.questionType
            });
            questions.push(q);
        }
        return questions;
    }

    /**
     * 针对用户薄弱点生成专属题目集
     */
    async generateForWeakPoints(userId, limit = 5) {
        const profile = await this._loadProfile(userId);
        const weakPoints = profile.weakPoints || profile.weak_points || [];

        // 从数据库获取薄弱知识点
        const [weakRows] = await this.pool.query(
            `SELECT sk.node_id, sk.mastery, kn.name, kn.difficulty
             FROM student_knowledge sk
             JOIN knowledge_nodes kn ON sk.node_id = kn.id
             WHERE sk.user_id = ? AND sk.mastery < 60
             ORDER BY sk.mastery ASC
             LIMIT ?`,
            [userId, limit]
        );

        if (weakRows.length === 0 && weakPoints.length === 0) {
            // 没有薄弱点，生成进阶题目
            return this.generateQuestionSet([{ topic: "计算机综合", difficulty: "medium" }], { userId, count: 1 });
        }

        const topics = weakRows.map(r => ({
            topic: r.name,
            difficulty: r.difficulty || "medium",
            mastery: Number(r.mastery || 0)
        }));

        const questions = [];
        for (const t of topics.slice(0, limit)) {
            const q = await this.generateQuestion(t.topic, {
                userId,
                difficulty: t.difficulty,
                mastery: t.mastery,
                questionType: Math.random() > 0.5 ? 0 : 2 // 交替单选和判断
            });
            questions.push(q);
        }
        return questions;
    }

    /**
     * LLM不可用时的回退题目
     */
    _fallbackQuestion(topic, difficulty = "medium") {
        const banks = {
            easy: [
                {
                    question: `关于「${topic}」，以下哪项描述最准确？`,
                    options: [
                        `${topic}是计算机科学中的一个基础概念`,
                        `${topic}与硬件设计直接相关`,
                        `${topic}只存在于高级编程语言中`,
                        `${topic}是一个过时的概念`
                    ],
                    answer: 0,
                    explanation: `${topic}是计算机科学基础组成部分，理解它有助于深入学习。`
                }
            ],
            medium: [
                {
                    question: `在「${topic}」的实际应用中，以下哪种做法最合理？`,
                    options: [
                        `优先考虑${topic}的理论正确性再考虑性能`,
                        `忽略${topic}直接追求运行速度`,
                        `完全按照${topic}标准而不做任何调整`,
                        `将${topic}与其他概念混用`
                    ],
                    answer: 0,
                    explanation: `在实际应用中，应先保证${topic}的理论正确性，再根据场景优化。`
                }
            ],
            hard: [
                {
                    question: `关于「${topic}」的深入理解，以下分析最全面的是？`,
                    options: [
                        `${topic}涉及底层原理、算法优化和系统设计的综合考量`,
                        `${topic}只需记忆结论即可掌握`,
                        `${topic}与其他知识点完全独立`,
                        `${topic}的理论已经过时`
                    ],
                    answer: 0,
                    explanation: `深入学习${topic}需要从底层原理、算法优化到系统设计多维度理解。`
                }
            ]
        };

        const bank = banks[difficulty] || banks.medium;
        const template = bank[Math.floor(Math.random() * bank.length)];
        return {
            question: template.question,
            options: template.options,
            answer: template.answer,
            explanation: template.explanation,
            difficulty,
            tags: [topic, "基础概念"]
        };
    }

    /**
     * 根据掌握度映射难度
     */
    _mapMasteryToDifficulty(mastery) {
        if (mastery < 30) return "easy";
        if (mastery < 70) return "medium";
        return "hard";
    }
}

module.exports = PersonalizedQuestionGenerator;
