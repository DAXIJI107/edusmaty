// core/AgenticLearningAgent.js
// 借鉴 DeepTutor (HKUDS) Agent-Native 设计的智能学习路径推理引擎
// 使用本地LLM（LlmGateway）进行个性化学习路径推理，替代固定规则匹配
//
// 参考: https://github.com/HKUDS/DeepTutor (arXiv:2604.26962)
// 核心理念: 混合个性化引擎 = 静态知识接地 + 动态多分辨率记忆 + 学习者画像持续演化

const llmGateway = require("./llm/LlmGateway");

class AgenticLearningAgent {
    /**
     * @param {number} userId
     * @param {object} pool - MySQL连接池
     */
    constructor(userId, pool) {
        this.userId = userId;
        this.pool = pool;
        this.state = {
            knowledgeState: {}, // { nodeId: { mastery, lastStudied, errorCount } }
            interactionHistory: [], // [{ action, result, timestamp }]
            preferences: {}, // { learningStyle, dailyMinutes, attentionSpan }
            currentFocus: null // 当前聚焦的知识点
        };
        this.initialized = false;
    }

    /**
     * 初始化：从数据库加载学习者的完整状态
     */
    async init() {
        if (this.initialized) return;

        // 1. 加载知识掌握状态（基于 user_answers 推断每个知识点的掌握度）
        try {
            const [knowledgeRows] = await this.pool.query(
                `SELECT kn.id AS node_id, kn.name, kn.subject, kn.difficulty,
                        COUNT(ua.id) AS total_answers,
                        SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers
                 FROM knowledge_nodes kn
                 LEFT JOIN knowledge_bindings kb ON kb.knowledge_id = kn.id AND kb.target_type = 'user' AND kb.target_id = ?
                 LEFT JOIN questions q ON q.knowledge_id = kn.id
                 LEFT JOIN user_answers ua ON ua.question_id = q.id AND ua.user_id = ?
                 WHERE kb.id IS NOT NULL OR q.id IS NOT NULL
                 GROUP BY kn.id, kn.name, kn.subject, kn.difficulty
                 ORDER BY (SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(ua.id), 0)) ASC
                 LIMIT 50`,
                [String(this.userId), this.userId]
            );
            for (const row of knowledgeRows) {
                const mastery =
                    row.total_answers > 0 ? Math.round((row.correct_answers / row.total_answers) * 100) : 30; // 无答题记录默认为30%
                this.state.knowledgeState[String(row.node_id)] = {
                    mastery,
                    name: row.name,
                    subject: row.subject,
                    difficulty: row.difficulty
                };
            }
        } catch (e) {
            // knowledge_bindings 可能也是空的，降级为所有知识节点
            try {
                const [allNodes] = await this.pool.query(
                    `SELECT id AS node_id, name, subject, difficulty
                     FROM knowledge_nodes ORDER BY difficulty ASC LIMIT 50`
                );
                for (const row of allNodes) {
                    this.state.knowledgeState[String(row.node_id)] = {
                        mastery: 30,
                        name: row.name,
                        subject: row.subject,
                        difficulty: row.difficulty
                    };
                }
            } catch (e2) {
                /* ignore */
            }
        }

        // 如果知识状态仍为空，从 knowledge_nodes 直接加载前50个
        if (Object.keys(this.state.knowledgeState).length === 0) {
            try {
                const [allNodes] = await this.pool.query(
                    `SELECT id AS node_id, name, subject, difficulty
                     FROM knowledge_nodes ORDER BY id ASC LIMIT 50`
                );
                for (const row of allNodes) {
                    this.state.knowledgeState[String(row.node_id)] = {
                        mastery: 30,
                        name: row.name,
                        subject: row.subject,
                        difficulty: row.difficulty
                    };
                }
            } catch (e2) {
                /* ignore */
            }
        }

        // 2. 加载最近的学习交互历史（实际表: questions.knowledge_id → knowledge_nodes.id）
        try {
            const [historyRows] = await this.pool.query(
                `SELECT ua.id, ua.is_correct, q.knowledge_id AS node_id,
                        kn.name AS node_name, ua.answered_at AS created_at
                 FROM user_answers ua
                 JOIN questions q ON ua.question_id = q.id
                 JOIN knowledge_nodes kn ON q.knowledge_id = kn.id
                 WHERE ua.user_id = ?
                 ORDER BY ua.answered_at DESC
                 LIMIT 30`,
                [this.userId]
            );
            this.state.interactionHistory = historyRows.map(r => ({
                action: r.is_correct ? "correct" : "incorrect",
                nodeId: r.node_id,
                nodeName: r.node_name,
                timestamp: r.created_at
            }));
        } catch (e) {
            /* ignore */
        }

        // 3. 加载偏好设置
        try {
            const [profileRows] = await this.pool.query("SELECT profile_json FROM student_profiles WHERE user_id = ?", [
                this.userId
            ]);
            if (profileRows.length > 0) {
                const profile =
                    typeof profileRows[0].profile_json === "string"
                        ? JSON.parse(profileRows[0].profile_json)
                        : profileRows[0].profile_json;
                this.state.preferences = {
                    learningStyle: profile.learningStyle || profile.learning_style || "reading",
                    dailyMinutes: profile.dailyTimeMinutes || profile.daily_time_minutes || 60,
                    attentionSpan: profile.attentionSpanMinutes || profile.attention_span_minutes || 30,
                    goal: profile.goal || profile.learningGoal || "",
                    level: profile.level || profile.currentLevel || "beginner"
                };
            }
        } catch (e) {
            /* ignore */
        }

        // 4. 尝试从 learning_preferences 补充学习风格
        try {
            const [prefRows] = await this.pool.query(
                "SELECT style, modality_weights FROM learning_preferences WHERE user_id = ?",
                [this.userId]
            );
            if (prefRows.length > 0 && !this.state.preferences.learningStyle) {
                this.state.preferences.learningStyle = prefRows[0].style || "reading";
            }
        } catch (e) {
            /* ignore */
        }

        // 5. 确定当前聚焦的薄弱点
        if (this.state.interactionHistory.length > 0) {
            const incorrectNodes = {};
            for (const h of this.state.interactionHistory) {
                if (h.action === "incorrect") {
                    incorrectNodes[h.nodeId] = (incorrectNodes[h.nodeId] || 0) + 1;
                }
            }
            const sorted = Object.entries(incorrectNodes).sort((a, b) => b[1] - a[1]);
            this.state.currentFocus = sorted.length > 0 ? sorted[0][0] : null;
        }

        this.initialized = true;
        return this.state;
    }

    /**
     * 基于LLM推理下一步最佳学习内容
     * 这是核心方法：不是规则匹配，而是让LLM根据画像、历史、知识状态综合推理
     *
     * @returns {object} { topic, difficulty, method, reason, resources }
     */
    async reasonNextStep() {
        await this.init();

        // 构建推理prompt
        const weakNodes = Object.entries(this.state.knowledgeState)
            .filter(([, s]) => s.mastery < 50)
            .sort((a, b) => a[1].mastery - b[1].mastery)
            .slice(0, 5);

        const recentHistory = this.state.interactionHistory
            .slice(0, 10)
            .map(h => `${h.action === "correct" ? "✓" : "✗"} ${h.nodeName}`);

        const prompt = `你是一位智能学习导师，需要为学习者推理下一步最佳学习内容。

【学习者画像】
- 学习风格：${this.state.preferences.learningStyle || "未评估"}
- 每日可用时间：${this.state.preferences.dailyMinutes || 60}分钟
- 专注时长：${this.state.preferences.attentionSpan || 30}分钟
- 学习目标：${this.state.preferences.goal || "系统掌握计算机核心能力"}
- 当前水平：${this.state.preferences.level || "初学者"}

【薄弱知识点（掌握度<50%）】
${weakNodes.map(([id, s]) => `- ${s.name} (${s.subject}, 掌握度: ${s.mastery}%, 难度: ${s.difficulty})`).join("\n") || "暂无数据"}

【最近学习记录】
${recentHistory.map(h => `- ${h}`).join("\n") || "暂无记录"}

请推理并返回JSON格式的下一步学习计划：
{
  "topic": "推荐学习的知识点名称",
  "difficulty": "easy/medium/hard",
  "method": "理论讲解/视频学习/动手练习/项目实战",
  "reason": "为什么推荐这个内容的详细理由，引用画像数据",
  "estimatedMinutes": 30,
  "suggestedResources": ["资源1", "资源2"]
}

只返回JSON，不要其他内容。`;

        try {
            const result = await llmGateway.chatText({
                messages: [
                    {
                        role: "system",
                        content:
                            "你是一个智能学习导师，专门为计算机科学学习者推荐个性化学习路径。请总是返回有效的JSON。"
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
                maxTokens: 1024,
                fallbackContent: JSON.stringify(this._fallbackReasoning())
            });

            // 解析LLM返回的JSON
            const jsonMatch = String(result).match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                this.state._lastReasoning = parsed;
                return parsed;
            }
        } catch (e) {
            console.warn("AgenticLearningAgent LLM推理失败，使用规则回退:", e.message);
        }

        return this._fallbackReasoning();
    }

    /**
     * 当LLM不可用时的规则回退
     */
    _fallbackReasoning() {
        const weakEntries = Object.entries(this.state.knowledgeState)
            .filter(([, s]) => s.mastery < 60)
            .sort((a, b) => a[1].mastery - b[1].mastery);

        if (weakEntries.length === 0) {
            return {
                topic: "进阶学习",
                difficulty: "medium",
                method: "项目实战",
                reason: "当前基础知识点掌握良好，建议通过项目综合练习提升",
                estimatedMinutes: 45,
                suggestedResources: ["选择一个实战项目", "完成综合练习"]
            };
        }

        const [nodeId, state] = weakEntries[0];
        const methodMap = {
            visual: "视频学习",
            auditory: "理论讲解",
            reading: "阅读文档",
            kinesthetic: "动手练习"
        };

        return {
            topic: state.name,
            difficulty: state.difficulty || "medium",
            method: methodMap[this.state.preferences.learningStyle] || "理论讲解",
            reason: `掌握度仅${state.mastery}%，是当前最薄弱环节，建议优先补充`,
            estimatedMinutes: Math.min(this.state.preferences.attentionSpan || 30, 45),
            suggestedResources: [`${state.name}核心概念讲解`, `${state.name}专项练习题`]
        };
    }

    /**
     * 根据答题反馈自适应调整路径
     */
    async adjustPath(feedback) {
        await this.init();

        this.state.interactionHistory.unshift({
            action: feedback.isCorrect ? "correct" : "incorrect",
            nodeId: feedback.nodeId,
            nodeName: feedback.nodeName || "",
            timestamp: new Date().toISOString()
        });

        // 更新知识状态
        if (feedback.nodeId && this.state.knowledgeState[feedback.nodeId]) {
            const current = this.state.knowledgeState[feedback.nodeId].mastery;
            const delta = feedback.isCorrect ? 5 : -3;
            this.state.knowledgeState[feedback.nodeId].mastery = Math.max(0, Math.min(100, current + delta));
        }

        return this.reasonNextStep();
    }

    /**
     * 生成完整的学习计划（多步骤）
     */
    async generateLearningPlan(targetSubject = null, days = 7) {
        await this.init();

        const dailyMinutes = this.state.preferences.dailyMinutes || 60;
        const weakNodes = Object.entries(this.state.knowledgeState)
            .filter(([, s]) => {
                if (targetSubject && s.subject !== targetSubject) return false;
                return s.mastery < 70;
            })
            .sort((a, b) => a[1].mastery - b[1].mastery)
            .slice(0, days * 2);

        if (weakNodes.length === 0) {
            return { days: [], summary: "当前学科知识点掌握良好，建议扩展学习范围或进行综合项目练习" };
        }

        const prompt = `为学习者生成${days}天的学习计划。

每日可用时间：${dailyMinutes}分钟
学习风格：${this.state.preferences.learningStyle || "综合"}

需要加强的知识点：
${weakNodes.map(([id, s]) => `- ${s.name} (${s.subject}, 掌握度: ${s.mastery}%)`).join("\n")}

请返回JSON：
{
  "days": [
    {
      "day": 1,
      "focus": "当日主题",
      "tasks": [
        { "type": "学习/练习/复习", "topic": "内容", "minutes": 30, "method": "方式" }
      ],
      "goal": "当日目标"
    }
  ],
  "summary": "计划概述"
}`;

        try {
            const result = await llmGateway.chatText({
                messages: [
                    {
                        role: "system",
                        content: "你是学习计划生成专家，为学习者生成科学合理的学习计划。请总是返回有效JSON。"
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.4,
                maxTokens: 2048
            });

            const jsonMatch = String(result).match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.warn("学习计划生成失败:", e.message);
        }

        // 回退：简单均分
        const daysPlan = [];
        const perDay = Math.ceil(weakNodes.length / days);
        for (let d = 0; d < days; d++) {
            const dayNodes = weakNodes.slice(d * perDay, (d + 1) * perDay);
            daysPlan.push({
                day: d + 1,
                focus: dayNodes.map(([, s]) => s.name).join("、"),
                tasks: dayNodes.map(([, s]) => ({
                    type: "学习",
                    topic: s.name,
                    minutes: Math.floor(dailyMinutes / dayNodes.length),
                    method: "阅读文档"
                })),
                goal: `掌握${dayNodes.map(([, s]) => s.name).join("、")}`
            });
        }
        return {
            days: daysPlan,
            summary: `按${days}天规划，逐步巩固${weakNodes.length}个薄弱知识点`
        };
    }

    /**
     * 获取当前的学习状态摘要
     */
    getStatus() {
        const totalNodes = Object.keys(this.state.knowledgeState).length;
        if (totalNodes === 0) return { message: "尚未开始学习" };

        const mastered = Object.values(this.state.knowledgeState).filter(s => s.mastery >= 80).length;
        const weak = Object.values(this.state.knowledgeState).filter(s => s.mastery < 50).length;
        const avgMastery = Object.values(this.state.knowledgeState).reduce((sum, s) => sum + s.mastery, 0) / totalNodes;

        return {
            totalNodes,
            masteredCount: mastered,
            weakCount: weak,
            averageMastery: Math.round(avgMastery),
            currentFocus: this.state.currentFocus,
            lastReasoning: this.state._lastReasoning || null
        };
    }
}

module.exports = AgenticLearningAgent;
