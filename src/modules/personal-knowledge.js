const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware");
const { createCard, createCardFromAi, listCards } = require("../services/personalKnowledgeService");

router.use(authenticateJWT);

router.get("/cards", async (req, res, next) => {
    try {
        const cards = await listCards(req.user.id, { status: req.query.status, limit: req.query.limit });
        res.json({ success: true, data: cards });
    } catch (error) {
        next(error);
    }
});

router.post("/cards", async (req, res, next) => {
    try {
        const card = await createCard(req.user.id, {
            title: req.body.title,
            summary: req.body.summary,
            subject: req.body.subject,
            knowledgePoint: req.body.knowledgePoint,
            recallQuestion: req.body.recallQuestion,
            sourceType: req.body.sourceType || "manual",
            sourceId: req.body.sourceId,
            masteryState: req.body.masteryState || "new",
            priorityScore: req.body.priorityScore || 50,
            metadata: req.body.metadata || {}
        });
        res.json({ success: true, message: "知识卡片已保存", data: card });
    } catch (error) {
        next(error);
    }
});

router.post("/cards/from-ai", async (req, res, next) => {
    try {
        const card = await createCardFromAi(req.user.id, req.body);
        res.json({ success: true, message: "AI 回答已整理为知识卡片", data: card });
    } catch (error) {
        next(error);
    }
});

router.use((error, req, res, next) => {
    console.error("personal knowledge api error:", error);
    res.status(error.status || 500).json({ success: false, message: error.message || "个人知识卡接口异常" });
});

module.exports = router;
