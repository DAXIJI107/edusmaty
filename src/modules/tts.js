// api/tts.js
// 讯飞TTS语音合成API

const express = require("express");
const router = express.Router();
const TTSAgent = require("../core/TTSAgent");
const { authenticateJWT } = require("../middleware");

router.post("/speak", authenticateJWT, async (req, res) => {
    try {
        const { text, voice, speed, volume, pitch, format } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "请提供要转换的文本" });
        }

        const ttsAgent = new TTSAgent();
        const audioBuffer = await ttsAgent.synthesize(text, {
            voice,
            speed,
            volume,
            pitch,
            format: format || "mp3"
        });

        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.length,
            "Content-Disposition": 'inline; filename="speech.mp3"'
        });

        res.send(audioBuffer);
    } catch (error) {
        console.error("TTS合成失败:", error);
        res.status(500).json({ success: false, message: "语音合成失败", error: error.message });
    }
});

router.post("/tutor-speak", authenticateJWT, async (req, res) => {
    try {
        const { text, voice, speed, volume, pitch } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "请提供要转换的文本" });
        }

        const ttsAgent = new TTSAgent();
        const audioBuffer = await ttsAgent.tutorSpeak(text, {
            voice: voice || "x4_lingxiaoxuan",
            speed: speed || 45,
            volume: volume || 60,
            pitch: pitch || 55
        });

        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.length,
            "Content-Disposition": 'inline; filename="tutor_speech.mp3"'
        });

        res.send(audioBuffer);
    } catch (error) {
        console.error("导师语音合成失败:", error);
        res.status(500).json({ success: false, message: "语音合成失败", error: error.message });
    }
});

router.get("/voices", authenticateJWT, (req, res) => {
    const voices = [
        { id: "x4_lingxiaoxuan", name: "小星", gender: "女", description: "温柔女声，适合学习导师" },
        { id: "x4_yunxiaonian", name: "云小念", gender: "女", description: "甜美女声，适合课程讲解" },
        { id: "x4_yunxiaonian_m", name: "云小念(男)", gender: "男", description: "磁性男声，适合知识科普" },
        { id: "aisjiuxian", name: "爱新九号", gender: "男", description: "活力男声，适合激励学习" }
    ];

    res.json({ success: true, voices });
});

module.exports = router;
