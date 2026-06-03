const express = require("express");
const pool = require("../db");
const { authenticateJWT } = require("../middleware");
const AgentRuntime = require("../core/AgentRuntime");

const router = express.Router();
const runtime = new AgentRuntime(pool);

router.use(authenticateJWT);

router.post("/run", async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const result = await runtime.run({
            userId,
            message: req.body?.message || req.body?.goal || "",
            intent: req.body?.intent || "",
            context: req.body?.context || {}
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/design-course", async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const goal = req.body?.goal || "生成智能课程";
        const subject = req.body?.subject || "all";
        const durationDays = req.body?.durationDays || 7;
        const result = await runtime.run({
            userId,
            message: goal,
            intent: "design_course",
            context: { goal, subject, durationDays, intensity: req.body?.intensity || "normal" }
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/traces/:sessionId", async (req, res, next) => {
    try {
        await runtime.ensureSchema();
        const userId = req.user.id || 1;
        const [rows] = await pool.query(
            `SELECT id, session_id AS sessionId, agent_name AS agentName, step_type AS stepType,
                    title, content, tool_name AS toolName, tool_input AS toolInput,
                    tool_output AS toolOutput, confidence, created_at AS createdAt
             FROM agent_traces
             WHERE user_id = ? AND session_id = ?
             ORDER BY id`,
            [userId, req.params.sessionId]
        );
        res.json({ success: true, traces: rows });
    } catch (error) {
        next(error);
    }
});

router.get("/next-action", async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const result = await runtime.run({
            userId,
            message: req.query.goal || "根据我的学习数据安排下一步",
            intent: "next_action",
            context: { subject: req.query.subject || "all", intensity: "light" }
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/practice-complete", async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { knowledgeId, score, total, durationMs, questionIds, answers } = req.body;

        if (!knowledgeId || score === undefined || !total) {
            return res.status(400).json({ success: false, message: "缺少 knowledgeId / score / total 参数" });
        }

        // 先记录为学习事件
        await runtime.recordEvent({
            userId,
            eventType: "complete_practice",
            knowledgeNodeId: knowledgeId,
            targetType: "practice",
            targetId: Date.now(),
            payload: { score, total, durationMs }
        });

        // 执行闭环：更新掌握度 → 重分析路径
        const result = await runtime.recordPracticeCompletion(userId, {
            knowledgeId: Number(knowledgeId),
            score: Number(score),
            total: Number(total),
            durationMs: durationMs || 0,
            questionIds: questionIds || [],
            answers: answers || []
        });

        res.json({
            success: true,
            mastery: result.mastery,
            pathAnalysis: result.pathAnalysis,
            summary: result.summary
        });
    } catch (error) {
        next(error);
    }
});

router.get("/analyze-path", async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const profile = req.query.force ? null : undefined;
        const result = await runtime.analyzePath(userId);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
});

router.use((error, req, res, next) => {
    res.status(500).json({ success: false, message: error.message || "Agent Runtime 执行失败" });
});

module.exports = router;
