const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware");
const {
    activateMembership,
    bindEmail,
    getEmailBinding,
    getUserMembership,
    updatePushSettings,
    verifyEmail
} = require("../services/membershipService");
const { membershipCenterData } = require("../services/dailyDigestService");

router.use(authenticateJWT);

router.get("/status", async (req, res, next) => {
    try {
        res.json({ success: true, data: await getUserMembership(req.user.id) });
    } catch (error) {
        next(error);
    }
});

router.get("/center", async (req, res, next) => {
    try {
        res.json({ success: true, data: await membershipCenterData(req.user.id) });
    } catch (error) {
        next(error);
    }
});

router.post("/activate-demo", async (req, res, next) => {
    try {
        const membership = await activateMembership(req.user.id, "free_companion");
        res.json({ success: true, message: "已开启免费学习陪伴", data: membership });
    } catch (error) {
        next(error);
    }
});

router.get("/email", async (req, res, next) => {
    try {
        res.json({ success: true, data: await getEmailBinding(req.user.id) });
    } catch (error) {
        next(error);
    }
});

router.post("/email/bind", async (req, res, next) => {
    try {
        const data = await bindEmail(req.user.id, req.body.email, {
            smtpAuthCode: req.body.smtpAuthCode,
            smtpHost: req.body.smtpHost,
            smtpPort: req.body.smtpPort,
            smtpSecure: req.body.smtpSecure
        });
        res.json({
            success: true,
            message: "验证码已发送到你的邮箱",
            data
        });
    } catch (error) {
        next(error);
    }
});

router.post("/email/verify", async (req, res, next) => {
    try {
        const data = await verifyEmail(req.user.id, req.body.email, req.body.code);
        res.json({ success: true, message: "邮箱验证成功", data });
    } catch (error) {
        next(error);
    }
});

router.post("/push-settings", async (req, res, next) => {
    try {
        const data = await updatePushSettings(req.user.id, Boolean(req.body.pushEnabled), req.body.pushTime);
        res.json({ success: true, message: "推送设置已更新", data });
    } catch (error) {
        next(error);
    }
});

router.use((error, req, res, next) => {
    console.error("membership api error:", error);
    res.status(error.status || 500).json({ success: false, message: error.message || "学习陪伴中心接口异常" });
});

module.exports = router;
