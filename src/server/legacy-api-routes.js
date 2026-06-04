const pool = require("../db");
const config = require("../config");
const { authenticateJWT } = require("../middleware");
const llmGateway = require("../core/llm/LlmGateway");

function registerLegacyApiRoutes(app) {
    app.post("/api/questions/search-by-image", authenticateJWT, async (req, res) => {
        const fallbackQuestions = [
            { id: "demo-1", content: "时间复杂度 O(n log n) 通常对应哪种排序算法？", knowledge_name: "算法复杂度" },
            { id: "demo-2", content: "氧化还原反应中失去电子的过程称为什么？", knowledge_name: "化学反应" },
            { id: "demo-3", content: "导数的几何意义是什么？", knowledge_name: "微积分" }
        ];

        try {
            const keywords = ["函数", "算法", "反应", "导数", "语法"];
            const likeConditions = keywords.map(() => "(content LIKE ? OR knowledge_name LIKE ?)").join(" OR ");
            const queryParams = keywords.flatMap(keyword => [`%${keyword}%`, `%${keyword}%`]);
            const [questions] = await pool.query(
                `SELECT * FROM questions WHERE ${likeConditions} LIMIT 8`,
                queryParams
            );
            res.json({ success: true, questions: questions.length ? questions : fallbackQuestions });
        } catch (error) {
            res.json({ success: true, demoMode: true, questions: fallbackQuestions });
        }
    });

    app.post("/api/spark-proxy", authenticateJWT, async (req, res) => {
        try {
            const { messages, temperature = 0.7, max_tokens: maxTokens } = req.body;
            if (!messages || !Array.isArray(messages) || !messages.length) {
                return res.status(400).json({ success: false, message: "messages 参数缺失或格式错误" });
            }

            const result = await llmGateway.chat({ messages, temperature, maxTokens });
            res.json({
                id: `local_${Date.now()}`,
                object: "chat.completion",
                model: result.model || config.llm.local.model,
                provider: result.provider,
                choices: [
                    { index: 0, message: { role: "assistant", content: result.content || "" }, finish_reason: "stop" }
                ],
                raw: result.raw
            });
        } catch (error) {
            const question = String(req.body?.messages?.at(-1)?.content || "").trim();
            res.json({
                fallback: true,
                provider: "local",
                message: "大模型服务暂时不可用，已返回本地学习助手兜底内容。",
                choices: [
                    {
                        message: {
                            content: question
                                ? `我先帮你拆解这个问题：${question}。建议先定位相关概念，再列出已知条件，最后用例题验证。`
                                : "请先输入你想解决的学习问题。"
                        }
                    }
                ]
            });
        }
    });
}

module.exports = { registerLegacyApiRoutes };
