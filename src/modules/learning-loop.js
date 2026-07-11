const express = require("express");
const pool = require("../db");
const { authenticateJWT } = require("../middleware");
const LearningLoopService = require("../core/LearningLoopService");

const router = express.Router();
const service = new LearningLoopService(pool);

router.use(authenticateJWT);

router.post("/start", async (req, res, next) => {
    try {
        const result = await service.start({
            userId: req.user.id,
            goal: req.body?.goal,
            subject: req.body?.subject || "all",
            durationDays: req.body?.durationDays || 3
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/diagnosis/submit", async (req, res, next) => {
    try {
        res.json(
            await service.submitDiagnosis({
                userId: req.user.id,
                goalId: Number(req.body?.goalId),
                answers: req.body?.answers || {}
            })
        );
    } catch (error) {
        next(error);
    }
});

router.post("/practice/submit", async (req, res, next) => {
    try {
        res.json(
            await service.submitPractice({
                userId: req.user.id,
                goalId: Number(req.body?.goalId),
                answers: req.body?.answers || {}
            })
        );
    } catch (error) {
        next(error);
    }
});

router.get("/status", async (req, res, next) => {
    try {
        res.json(await service.status(req.user.id, req.query.goalId ? Number(req.query.goalId) : null));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
