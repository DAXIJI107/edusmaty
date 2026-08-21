/**
 * 自习室个人知识库文档 API
 * 支持五种模板、私密/链接分享、导入导出
 */
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");

const TEMPLATE_TYPES = new Set(["normal", "structured", "note", "report", "diary"]);
const VISIBILITIES = new Set(["private", "link"]);

let schemaReady = false;

async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS personal_documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL DEFAULT '未命名文档',
            content_html MEDIUMTEXT,
            template_type VARCHAR(32) NOT NULL DEFAULT 'normal',
            visibility ENUM('private', 'link') NOT NULL DEFAULT 'private',
            share_token VARCHAR(64) NULL,
            tags_json JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_share_token (share_token),
            INDEX idx_user_updated (user_id, updated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

router.use(async (req, res, next) => {
    if (!schemaReady) {
        try {
            await ensureSchema();
            schemaReady = true;
        } catch (error) {
            console.error("personal_documents schema:", error.message);
        }
    }
    next();
});

function mapDoc(row, { includeContent = true } = {}) {
    if (!row) return null;
    let tags = [];
    try {
        tags = typeof row.tags_json === "string" ? JSON.parse(row.tags_json || "[]") : row.tags_json || [];
    } catch {
        tags = [];
    }
    const doc = {
        id: row.id,
        title: row.title,
        templateType: row.template_type,
        visibility: row.visibility,
        shareToken: row.share_token || null,
        tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
    if (includeContent) doc.contentHtml = row.content_html || "";
    return doc;
}

function htmlToMarkdownRough(html) {
    return String(html || "")
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
        .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function markdownToHtml(md) {
    const escaped = String(md || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const lines = escaped.split(/\r?\n/);
    const parts = [];
    for (const line of lines) {
        if (/^###\s+/.test(line)) parts.push(`<h3>${line.replace(/^###\s+/, "")}</h3>`);
        else if (/^##\s+/.test(line)) parts.push(`<h2>${line.replace(/^##\s+/, "")}</h2>`);
        else if (/^#\s+/.test(line)) parts.push(`<h1>${line.replace(/^#\s+/, "")}</h1>`);
        else if (/^-\s+/.test(line)) parts.push(`<li>${line.replace(/^-\s+/, "")}</li>`);
        else if (!line.trim()) parts.push("");
        else parts.push(`<p>${line}</p>`);
    }
    let html = parts.join("\n");
    html = html.replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, block => `<ul>${block}</ul>`);
    return html || "<p></p>";
}

function buildShareUrl(req, token) {
    const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3020";
    const proto = req.get("x-forwarded-proto") || req.protocol || "http";
    return `${proto}://${host}/study-room/shared/${token}`;
}

async function getOwnedDoc(userId, id) {
    const [rows] = await pool.query("SELECT * FROM personal_documents WHERE id = ? AND user_id = ? LIMIT 1", [
        id,
        userId
    ]);
    return rows[0] || null;
}

// Public shared read — must be registered before auth middleware for this path.
router.get("/shared/:token", async (req, res, next) => {
    try {
        const token = String(req.params.token || "").trim();
        if (!token) return res.status(404).json({ success: false, message: "分享不存在" });
        const [rows] = await pool.query(
            "SELECT * FROM personal_documents WHERE share_token = ? AND visibility = 'link' LIMIT 1",
            [token]
        );
        if (!rows[0]) return res.status(404).json({ success: false, message: "分享已关闭或不存在" });
        res.json({ success: true, data: mapDoc(rows[0]), readonly: true });
    } catch (error) {
        next(error);
    }
});

router.use(authenticateJWT);

router.get("/", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query(
            `SELECT id, user_id, title, content_html, template_type, visibility, share_token, tags_json, created_at, updated_at
             FROM personal_documents
             WHERE user_id = ?
             ORDER BY updated_at DESC`,
            [userId]
        );
        const docs = rows.map(row => mapDoc(row, { includeContent: true }));
        const byTemplate = {};
        for (const doc of docs) {
            byTemplate[doc.templateType] = (byTemplate[doc.templateType] || 0) + 1;
        }
        res.json({
            success: true,
            data: {
                docs,
                stats: {
                    total: docs.length,
                    shared: docs.filter(d => d.visibility === "link").length,
                    private: docs.filter(d => d.visibility !== "link").length,
                    byTemplate
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const title = String(req.body?.title || "未命名文档").trim().slice(0, 255) || "未命名文档";
        const templateType = TEMPLATE_TYPES.has(req.body?.templateType) ? req.body.templateType : "normal";
        const contentHtml = String(req.body?.contentHtml || "<p></p>");
        const tags = Array.isArray(req.body?.tags) ? req.body.tags : [];
        const [result] = await pool.query(
            `INSERT INTO personal_documents (user_id, title, content_html, template_type, visibility, tags_json)
             VALUES (?, ?, ?, ?, 'private', ?)`,
            [userId, title, contentHtml, templateType, JSON.stringify(tags)]
        );
        const doc = await getOwnedDoc(userId, result.insertId);
        res.json({ success: true, data: mapDoc(doc), message: "文档已创建" });
    } catch (error) {
        next(error);
    }
});

router.post("/import", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const format = String(req.body?.format || "md").toLowerCase();
        const filename = String(req.body?.filename || "导入文档").replace(/\.[^.]+$/, "");
        let title = String(req.body?.title || filename || "导入文档").slice(0, 255);
        let contentHtml = "<p></p>";
        let templateType = "normal";
        let tags = [];

        if (format === "json") {
            let payload = req.body?.payload;
            if (typeof payload === "string") {
                try {
                    payload = JSON.parse(payload);
                } catch {
                    return res.status(400).json({ success: false, message: "JSON 格式无效" });
                }
            }
            const item = Array.isArray(payload) ? payload[0] : payload?.doc || payload;
            if (!item) return res.status(400).json({ success: false, message: "缺少导入内容" });
            title = String(item.title || title).slice(0, 255);
            contentHtml = String(item.contentHtml || item.content || "<p></p>");
            templateType = TEMPLATE_TYPES.has(item.templateType) ? item.templateType : "normal";
            tags = Array.isArray(item.tags) ? item.tags : [];
        } else {
            const md = String(req.body?.content || req.body?.markdown || "");
            contentHtml = markdownToHtml(md);
            title = title || "导入的 Markdown";
        }

        const [result] = await pool.query(
            `INSERT INTO personal_documents (user_id, title, content_html, template_type, visibility, tags_json)
             VALUES (?, ?, ?, ?, 'private', ?)`,
            [userId, title, contentHtml, templateType, JSON.stringify(tags)]
        );
        const doc = await getOwnedDoc(userId, result.insertId);
        res.json({ success: true, data: mapDoc(doc), message: "导入成功" });
    } catch (error) {
        next(error);
    }
});

router.get("/:id/export", async (req, res, next) => {
    try {
        const doc = await getOwnedDoc(req.user.id, Number(req.params.id));
        if (!doc) return res.status(404).json({ success: false, message: "文档不存在" });
        const format = String(req.query.format || "md").toLowerCase();
        const mapped = mapDoc(doc);
        if (format === "json") {
            return res.json({
                success: true,
                format: "json",
                data: {
                    version: 1,
                    exportedAt: new Date().toISOString(),
                    doc: mapped
                }
            });
        }
        const markdown = htmlToMarkdownRough(doc.content_html);
        res.json({
            success: true,
            format: "md",
            filename: `${mapped.title || "document"}.md`,
            data: markdown
        });
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const doc = await getOwnedDoc(req.user.id, Number(req.params.id));
        if (!doc) return res.status(404).json({ success: false, message: "文档不存在" });
        res.json({ success: true, data: mapDoc(doc) });
    } catch (error) {
        next(error);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = Number(req.params.id);
        const existing = await getOwnedDoc(userId, id);
        if (!existing) return res.status(404).json({ success: false, message: "文档不存在" });

        const title =
            req.body?.title !== undefined
                ? String(req.body.title || "未命名文档").trim().slice(0, 255) || "未命名文档"
                : existing.title;
        const contentHtml =
            req.body?.contentHtml !== undefined ? String(req.body.contentHtml) : existing.content_html;
        const templateType = TEMPLATE_TYPES.has(req.body?.templateType)
            ? req.body.templateType
            : existing.template_type;
        let visibility = existing.visibility;
        let shareToken = existing.share_token;
        if (req.body?.visibility && VISIBILITIES.has(req.body.visibility)) {
            visibility = req.body.visibility;
            if (visibility === "private") shareToken = null;
        }
        const tags =
            req.body?.tags !== undefined
                ? Array.isArray(req.body.tags)
                    ? req.body.tags
                    : []
                : (() => {
                      try {
                          return typeof existing.tags_json === "string"
                              ? JSON.parse(existing.tags_json || "[]")
                              : existing.tags_json || [];
                      } catch {
                          return [];
                      }
                  })();

        await pool.query(
            `UPDATE personal_documents
             SET title = ?, content_html = ?, template_type = ?, visibility = ?, share_token = ?, tags_json = ?
             WHERE id = ? AND user_id = ?`,
            [title, contentHtml, templateType, visibility, shareToken, JSON.stringify(tags), id, userId]
        );
        const doc = await getOwnedDoc(userId, id);
        res.json({ success: true, data: mapDoc(doc), message: "已保存" });
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const [result] = await pool.query("DELETE FROM personal_documents WHERE id = ? AND user_id = ?", [
            Number(req.params.id),
            req.user.id
        ]);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "文档不存在" });
        res.json({ success: true, message: "已删除" });
    } catch (error) {
        next(error);
    }
});

router.post("/:id/share", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = Number(req.params.id);
        const existing = await getOwnedDoc(userId, id);
        if (!existing) return res.status(404).json({ success: false, message: "文档不存在" });
        const token = existing.share_token || crypto.randomBytes(16).toString("hex");
        await pool.query(
            `UPDATE personal_documents SET visibility = 'link', share_token = ? WHERE id = ? AND user_id = ?`,
            [token, id, userId]
        );
        const doc = await getOwnedDoc(userId, id);
        const shareUrl = buildShareUrl(req, token);
        res.json({
            success: true,
            data: { ...mapDoc(doc), shareUrl },
            message: "已开启链接分享"
        });
    } catch (error) {
        next(error);
    }
});

router.post("/:id/unshare", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = Number(req.params.id);
        const existing = await getOwnedDoc(userId, id);
        if (!existing) return res.status(404).json({ success: false, message: "文档不存在" });
        await pool.query(
            `UPDATE personal_documents SET visibility = 'private', share_token = NULL WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        const doc = await getOwnedDoc(userId, id);
        res.json({ success: true, data: mapDoc(doc), message: "已设为私密" });
    } catch (error) {
        next(error);
    }
});

router.use((error, req, res, next) => {
    console.error("personal-docs api error:", error);
    res.status(error.status || 500).json({ success: false, message: error.message || "个人知识库接口异常" });
});

module.exports = router;
