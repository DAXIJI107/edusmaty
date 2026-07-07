const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware");
const {
    generateDailyDigest,
    recentDigests,
    recentEmailLogs,
    sendDigestEmail,
    todayDate
} = require("../services/dailyDigestService");

router.use(authenticateJWT);

router.post("/generate", async (req, res, next) => {
    try {
        const digest = await generateDailyDigest(req.user.id, req.body.date || todayDate());
        res.json({ success: true, message: "每日知识推送已生成", data: digest });
    } catch (error) {
        next(error);
    }
});

router.get("/recent", async (req, res, next) => {
    try {
        res.json({ success: true, data: await recentDigests(req.user.id, req.query.limit) });
    } catch (error) {
        next(error);
    }
});

router.get("/email-logs", async (req, res, next) => {
    try {
        res.json({ success: true, data: await recentEmailLogs(req.user.id, req.query.limit) });
    } catch (error) {
        next(error);
    }
});

router.post("/send-test", async (req, res, next) => {
    try {
        const digest = await generateDailyDigest(req.user.id, req.body.date || todayDate());
        const result = await sendDigestEmail(req.user.id, digest);
        res.json({ success: true, message: "测试推送邮件已发送", data: result });
    } catch (error) {
        next(error);
    }
});

router.use((error, req, res, next) => {
    console.error("daily digest api error:", error);
    res.status(error.status || 500).json({ success: false, message: error.message || "每日推送接口异常" });
});

module.exports = router;
