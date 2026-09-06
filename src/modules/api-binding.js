// api-binding.js — 用户自定义模型 API 绑定（悬浮小组件）
const express = require("express");
const axios = require("axios");
const { authenticateJWT } = require("../middleware");
const db = require("../db");
const { invalidateUserBinding } = require("../core/llm/UserBindingContext");

const router = express.Router();
router.use(authenticateJWT);

// ── 初始化 user_api_bindings 表 ──
async function ensureTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS user_api_bindings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            provider VARCHAR(64) DEFAULT 'openai-compatible',
            base_url VARCHAR(255) DEFAULT '',
            model_name VARCHAR(128) DEFAULT '',
            model_version VARCHAR(64) DEFAULT '',
            api_key VARCHAR(512) DEFAULT '',
            enabled TINYINT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

function maskKey(key = "") {
    if (!key) return "";
    if (key.length <= 8) return "***";
    return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

function serialize(row) {
    if (!row) return null;
    return {
        id: row.id,
        provider: row.provider,
        baseUrl: row.base_url,
        modelName: row.model_name,
        modelVersion: row.model_version,
        apiKeyMasked: maskKey(row.api_key),
        hasKey: Boolean(row.api_key),
        enabled: Number(row.enabled) === 1
    };
}

async function getRow(userId) {
    const [rows] = await db.query("SELECT * FROM user_api_bindings WHERE user_id = ? LIMIT 1", [userId]);
    return rows && rows[0] ? rows[0] : null;
}

// ── GET / — 获取当前绑定 ──
router.get("/", async (req, res) => {
    try {
        await ensureTable();
        res.json({ success: true, data: serialize(await getRow(req.user.id)) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── POST / — 保存绑定 ──
router.post("/", async (req, res) => {
    try {
        await ensureTable();
        const { provider, baseUrl, modelName, modelVersion, apiKey } = req.body || {};
        if (!modelName) return res.status(400).json({ success: false, message: "模型名称不能为空" });
        if (!baseUrl) return res.status(400).json({ success: false, message: "接口地址不能为空" });
        const existing = await getRow(req.user.id);
        // 不填 apiKey 且已有绑定时保留旧 key
        const finalKey = apiKey && String(apiKey).trim() ? String(apiKey).trim() : existing ? existing.api_key : "";
        if (!finalKey) return res.status(400).json({ success: false, message: "请填写 API Key" });
        // 弱密钥拦截：常见大模型密钥至少 20 位（讯飞 APIPassword 32 位、OpenAI/DeepSeek 40+ 位），
        // 过短基本是浏览器密码自动填充误填了登录密码
        if (finalKey.length < 20) {
            return res.status(400).json({
                success: false,
                message: `API Key 长度异常（仅 ${finalKey.length} 位，正规密钥至少 20 位）。请检查是否被浏览器密码自动填充覆盖，重新粘贴完整的 APIPassword/API Key`
            });
        }
        if (existing) {
            await db.query(
                "UPDATE user_api_bindings SET provider = ?, base_url = ?, model_name = ?, model_version = ?, api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
                [provider || "openai-compatible", baseUrl.trim(), modelName.trim(), modelVersion || "", finalKey, req.user.id]
            );
        } else {
            await db.query(
                "INSERT INTO user_api_bindings (user_id, provider, base_url, model_name, model_version, api_key, enabled) VALUES (?, ?, ?, ?, ?, ?, 1)",
                [req.user.id, provider || "openai-compatible", baseUrl.trim(), modelName.trim(), modelVersion || "", finalKey]
            );
        }
        invalidateUserBinding(req.user.id); // 全站 AI 功能立即切换到新绑定
        res.json({ success: true, message: "API 绑定成功", data: serialize(await getRow(req.user.id)) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── POST /toggle — 启用/停用 ──
router.post("/toggle", async (req, res) => {
    try {
        const existing = await getRow(req.user.id);
        if (!existing) return res.status(404).json({ success: false, message: "尚未绑定 API" });
        const next = Number(existing.enabled) === 1 ? 0 : 1;
        await db.query("UPDATE user_api_bindings SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", [next, req.user.id]);
        invalidateUserBinding(req.user.id);
        res.json({ success: true, message: next ? "已启用" : "已停用", data: serialize(await getRow(req.user.id)) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── POST /test — 连通性测试（OpenAI 兼容 chat/completions） ──
router.post("/test", async (req, res) => {
    try {
        const existing = await getRow(req.user.id);
        if (!existing) return res.status(404).json({ success: false, message: "尚未绑定 API" });
        // 支持用表单当前值即时测试（无需先保存）
        const { apiKey, baseUrl, modelName, modelVersion } = req.body || {};
        const key = apiKey && String(apiKey).trim() ? String(apiKey).trim() : existing.api_key;
        const modelNameFinal = modelName && String(modelName).trim() ? String(modelName).trim() : existing.model_name;
        const base = String(baseUrl && String(baseUrl).trim() ? baseUrl : existing.base_url).replace(/\/+$/, "");
        const url = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
        const model = modelVersion || existing.model_version ? `${modelNameFinal}@${modelVersion || existing.model_version}` : modelNameFinal;
        const started = Date.now();
        const resp = await axios.post(
            url,
            { model: modelNameFinal, messages: [{ role: "user", content: "ping，请回复 pong" }], max_tokens: 16 },
            {
                headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
                timeout: 15000
            }
        );
        const reply = resp.data?.choices?.[0]?.message?.content || "";
        res.json({
            success: true,
            message: `连接成功（${Date.now() - started}ms）`,
            data: { reply: reply.slice(0, 120), latencyMs: Date.now() - started, model }
        });
    } catch (error) {
        const status = error.response?.status;
        const bodyText = error.response ? JSON.stringify(error.response.data) : "";
        const detail = error.response ? `HTTP ${status} ${bodyText.slice(0, 200)}` : error.message;
        let hint = "";
        if (status === 401 && /HMAC secret key does not match/i.test(bodyText)) {
            hint = "。提示：该接口需要 APIPassword 鉴权——请到服务商控制台「http服务接口认证信息」复制 APIPassword 作为 API Key（不是 Websocket 的 APIKey/APISecret）";
        } else if (status === 401 && /apikey not found/i.test(bodyText)) {
            hint = "。提示：APIPassword 不正确或已失效——请在控制台重新复制（注意与掩码首尾字符核对，如 Qto****jDI 应以 jDI 结尾），必要时点击「重置」生成新密码再绑定";
        } else if (status === 401 || status === 403) {
            hint = "。提示：请检查 API Key 是否正确、是否为该接口要求的凭证类型";
        } else if (/model.*not.*exist|invalid model|模型不存在/i.test(bodyText)) {
            hint = "。提示：模型名称可能不正确，请查看服务商文档中的模型标识（如讯飞 Spark Lite 为 lite）";
        }
        res.json({ success: false, message: `连接失败：${detail}${hint}` });
    }
});

// ── DELETE / — 解除绑定 ──
router.delete("/", async (req, res) => {
    try {
        await db.query("DELETE FROM user_api_bindings WHERE user_id = ?", [req.user.id]);
        invalidateUserBinding(req.user.id);
        res.json({ success: true, message: "已解除绑定" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
