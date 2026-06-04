const express = require("express");
const router = express.Router();
const XunfeiVirtualHuman = require("../services/xunfei-virtual-human");
const { authenticateJWT } = require("../middleware");

const sessions = new Map();

router.post("/connect", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { useMock = false } = req.body;

        if (sessions.has(userId)) {
            const vh = sessions.get(userId);
            if (vh.isConnected) {
                return res.json({ success: true, message: "已连接", sessionId: vh.sessionId, isMock: vh.isMock });
            }
        }

        if (useMock) {
            const mockVh = {
                isConnected: true,
                isMock: true,
                sessionId: "mock_session_" + Date.now(),
                disconnect: () => {},
                sendMessage: (text, callback) => {
                    setTimeout(() => {
                        callback(null, { text: `这是模拟回复: ${text}` });
                    }, 1000);
                },
                getVideoStream: async () => "mock_stream"
            };
            sessions.set(userId, mockVh);
            console.log("使用模拟虚拟人连接");
            return res.json({
                success: true,
                sessionId: mockVh.sessionId,
                message: "虚拟人连接成功（模拟模式）",
                isMock: true
            });
        }

        const vh = new XunfeiVirtualHuman();
        vh.isMock = false;
        vh.onMessage = data => {
            console.log("收到虚拟人消息:", data);
        };
        vh.onError = error => {
            console.error("虚拟人错误:", error);
            sessions.delete(userId);
        };
        vh.onClose = () => {
            sessions.delete(userId);
        };

        const result = await vh.connect();
        sessions.set(userId, vh);

        res.json({
            success: true,
            sessionId: result.session_id,
            message: "虚拟人连接成功",
            isMock: false
        });
    } catch (error) {
        console.error("虚拟人连接失败:", error);

        const mockVh = {
            isConnected: true,
            isMock: true,
            sessionId: "mock_session_" + Date.now(),
            disconnect: () => {},
            sendMessage: (text, callback) => {
                setTimeout(() => {
                    callback(null, { text: `这是模拟回复: ${text}` });
                }, 1000);
            },
            getVideoStream: async () => "mock_stream"
        };
        sessions.set(userId, mockVh);

        res.status(200).json({
            success: true,
            sessionId: mockVh.sessionId,
            message: "真实虚拟人服务暂时不可用，已切换到模拟模式",
            isMock: true,
            fallback: true
        });
    }
});

router.post("/disconnect", authenticateJWT, (req, res) => {
    try {
        const userId = req.user.id;
        const vh = sessions.get(userId);

        if (vh) {
            vh.disconnect();
            sessions.delete(userId);
        }

        res.json({ success: true, message: "已断开连接" });
    } catch (error) {
        console.error("断开连接失败:", error);
        res.status(500).json({ success: false, message: "断开失败" });
    }
});

router.post("/message", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "请输入消息" });
        }

        const vh = sessions.get(userId);
        if (!vh) {
            return res.status(400).json({ success: false, message: "请先连接虚拟人" });
        }

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        });

        const send = (event, data) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        vh.onMessage = data => {
            if (data.text) {
                send("message", { text: data.text, type: "text" });
            }
            if (data.audio) {
                send("audio", { audio: data.audio, type: "audio" });
            }
            if (data.type === "complete") {
                send("complete", { success: true });
                res.end();
            }
        };

        vh.sendMessage(text, (error, result) => {
            if (error) {
                send("error", { success: false, message: error.message });
                res.end();
            } else if (result && result.text) {
                send("complete", { success: true, text: result.text });
                res.end();
            }
        });
    } catch (error) {
        console.error("发送消息失败:", error);
        res.status(500).json({ success: false, message: "发送失败", error: error.message });
    }
});

router.get("/avatars", authenticateJWT, (req, res) => {
    const avatars = [
        { id: "110017009", name: "译林", gender: "男", description: "专业稳重的男性形象" },
        { id: "110026013", name: "伊凡", gender: "男", description: "阳光开朗的男性形象" },
        { id: "118801001", name: "依丹", gender: "女", description: "温柔知性的女性形象" },
        { id: "110021004", name: "晓娴", gender: "女", description: "活泼可爱的女性形象" }
    ];

    res.json({ success: true, avatars });
});

router.get("/stream-url", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const vh = sessions.get(userId);

        if (!vh) {
            return res.status(400).json({ success: false, message: "请先连接虚拟人" });
        }

        const streamUrl = await vh.getVideoStream();

        res.json({ success: true, streamUrl });
    } catch (error) {
        console.error("获取流地址失败:", error);
        res.status(500).json({ success: false, message: "获取失败", error: error.message });
    }
});

router.get("/status", authenticateJWT, (req, res) => {
    try {
        const userId = req.user.id;
        const vh = sessions.get(userId);

        res.json({
            success: true,
            connected: !!vh && vh.isConnected,
            sessionId: vh?.sessionId || null
        });
    } catch (error) {
        console.error("获取状态失败:", error);
        res.status(500).json({ success: false, message: "获取状态失败" });
    }
});

module.exports = router;
