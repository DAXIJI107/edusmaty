const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware");
const llmGateway = require("../core/llm/LlmGateway");

// 角色提示词配置
const rolePrompts = {
    teacher: {
        name: "老师",
        style: "循循善诱，先讲解核心概念，然后提出检验性问题",
        prompt: `你是一位经验丰富的老师，擅长循循善诱地引导学生理解知识。
你的教学风格是：
1. 先用简洁易懂的语言讲解核心概念
2. 然后提出一个检验性问题，确认学生是否理解
3. 根据学生的回答，给出反馈并继续追问
4. 如果学生回答正确，给予鼓励并提出更深入的问题
5. 如果学生回答有误，温和指出问题并引导正确思路

请保持友好、鼓励的语气，每次回复都要包含一个新问题来检验理解。`
    },
    interviewer: {
        name: "面试官",
        style: "模拟真实面试场景，层层追问，考察深度",
        prompt: `你是一位专业的技术面试官，正在对候选人进行技术面试。
你的面试风格是：
1. 先提出一个基础问题作为开场
2. 根据候选人的回答，追问更深入的技术细节
3. 考察候选人对原理、实现细节、边界情况的理解
4. 适时给出反馈，指出回答中的亮点或不足
5. 保持专业、严谨但不失友好的态度

请模拟真实面试场景，每次回复都要包含一个追问。`
    },
    examiner: {
        name: "考官",
        style: "严格考核，出题检验知识掌握程度",
        prompt: `你是一位严格的考官，负责考核学生的知识掌握程度。
你的考核风格是：
1. 直接出题，不提供提示或讲解
2. 根据学生的答案给出评分和反馈
3. 如果答案不完整或错误，指出具体问题
4. 继续出下一道题，逐步增加难度
5. 保持客观、公正的态度

请严格考核，每次回复都要包含一道新题目。`
    },
    studyBuddy: {
        name: "学霸",
        style: "互相讨论，分享学习心得和技巧",
        prompt: `你是一位成绩优异的学霸同学，愿意和学习伙伴一起讨论学习内容。
你的讨论风格是：
1. 用同龄人的语气交流，轻松友好
2. 分享自己对知识的理解和记忆技巧
3. 提出问题引导伙伴思考
4. 如果伙伴理解有偏差，用易懂的方式纠正
5. 互相鼓励，共同进步

请像同学一样交流，每次回复都要包含一个讨论性问题。`
    }
};

// 根据角色和主题生成第一个问题
router.post("/start", authenticateJWT, async (req, res) => {
    try {
        const { role, topic } = req.body;
        const user = req.user;

        if (!topic) {
            return res.json({ success: false, message: "请提供学习主题" });
        }

        const roleConfig = rolePrompts[role] || rolePrompts.teacher;

        // 构建系统提示
        const systemPrompt = `${roleConfig.prompt}

当前学习主题：${topic}

请作为${roleConfig.name}，根据你的风格提出第一个问题。问题要简洁明了，适合检验学生对"${topic}"的基础理解。`;

        // 调用LLM生成问题
        const response = await llmGateway.chat({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `请开始关于"${topic}"的学习互动。` }
            ],
            userContext: {
                username: user?.username || "学生",
                role: user?.role || "student"
            }
        });

        const question = response.content || `让我们开始学习${topic}。首先，你能告诉我你对${topic}的基本理解是什么？`;

        res.json({
            success: true,
            question: question,
            role: role,
            roleLabel: roleConfig.name
        });
    } catch (error) {
        console.error("AI Tutor start error:", error);
        res.json({
            success: false,
            message: error.message || "启动陪练失败",
            question: `让我们开始学习${req.body.topic || "这个主题"}。首先，你能告诉我你对这个主题的基本理解是什么？`
        });
    }
});

// 处理学生回答并生成追问
router.post("/answer", authenticateJWT, async (req, res) => {
    try {
        const { role, topic, answer, history } = req.body;
        const user = req.user;

        if (!answer) {
            return res.json({ success: false, message: "请提供回答" });
        }

        const roleConfig = rolePrompts[role] || rolePrompts.teacher;

        // 构建对话历史
        const messages = [
            { role: "system", content: `${roleConfig.prompt}\n当前学习主题：${topic}` }
        ];

        // 添加历史消息
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                if (msg.role === "ai") {
                    messages.push({ role: "assistant", content: msg.content });
                } else {
                    messages.push({ role: "user", content: msg.content });
                }
            });
        }

        // 添加当前回答
        messages.push({ role: "user", content: answer });

        // 调用LLM生成追问
        const response = await llmGateway.chat({
            messages: messages,
            userContext: {
                username: user?.username || "学生",
                role: user?.role || "student"
            }
        });

        const aiResponse = response.content || "很好！让我继续追问一个问题...";

        // 判断是否包含新问题（简单判断）
        const isQuestion = aiResponse.includes("?") || aiResponse.includes("？") || 
                          aiResponse.includes("什么") || aiResponse.includes("如何") || 
                          aiResponse.includes("为什么") || aiResponse.includes("请");

        res.json({
            success: true,
            response: aiResponse,
            isQuestion: isQuestion
        });
    } catch (error) {
        console.error("AI Tutor answer error:", error);
        res.json({
            success: false,
            message: error.message || "处理回答失败",
            response: "好的，我理解了你的回答。让我继续追问一个问题..."
        });
    }
});

// 跳过当前问题，生成新问题
router.post("/skip", authenticateJWT, async (req, res) => {
    try {
        const { role, topic, history } = req.body;
        const user = req.user;

        const roleConfig = rolePrompts[role] || rolePrompts.teacher;

        // 构建对话历史
        const messages = [
            { role: "system", content: `${roleConfig.prompt}\n当前学习主题：${topic}\n学生跳过了上一个问题，请提出一个新的问题，难度可以稍低一些。` }
        ];

        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                if (msg.role === "ai") {
                    messages.push({ role: "assistant", content: msg.content });
                } else {
                    messages.push({ role: "user", content: msg.content });
                }
            });
        }

        messages.push({ role: "user", content: "我跳过这个问题，请给我一个新问题。" });

        const response = await llmGateway.chat({
            messages: messages,
            userContext: {
                username: user?.username || "学生",
                role: user?.role || "student"
            }
        });

        res.json({
            success: true,
            nextQuestion: response.content || `好的，让我们换个角度。关于${topic}，你觉得它的主要应用场景是什么？`
        });
    } catch (error) {
        console.error("AI Tutor skip error:", error);
        res.json({
            success: false,
            nextQuestion: `好的，让我们换个角度。关于${topic}，你觉得它的主要应用场景是什么？`
        });
    }
});

// 提供提示
router.post("/hint", authenticateJWT, async (req, res) => {
    try {
        const { role, topic, history } = req.body;
        const user = req.user;

        const roleConfig = rolePrompts[role] || rolePrompts.teacher;

        // 构建对话历史
        const messages = [
            { role: "system", content: `${roleConfig.prompt}\n当前学习主题：${topic}\n学生请求提示，请给出一个有帮助但不直接给出答案的提示。` }
        ];

        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                if (msg.role === "ai") {
                    messages.push({ role: "assistant", content: msg.content });
                } else {
                    messages.push({ role: "user", content: msg.content });
                }
            });
        }

        messages.push({ role: "user", content: "请给我一些提示，帮助我思考这个问题。" });

        const response = await llmGateway.chat({
            messages: messages,
            userContext: {
                username: user?.username || "学生",
                role: user?.role || "student"
            }
        });

        res.json({
            success: true,
            hint: response.content || `关于${topic}，你可以从它的基本定义入手，思考它解决了什么问题。`
        });
    } catch (error) {
        console.error("AI Tutor hint error:", error);
        res.json({
            success: false,
            hint: `关于${topic}，你可以从它的基本定义入手，思考它解决了什么问题。`
        });
    }
});

module.exports = router;