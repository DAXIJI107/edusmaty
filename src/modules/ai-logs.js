const express = require("express");
const aiInteractionStore = require("../core/llm/AiInteractionStore");

const router = express.Router();

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

router.get("/", (req, res) => {
    const data = aiInteractionStore.readRecent(req.query.limit || 50);
    res.json({
        success: true,
        file: data.file,
        total: data.items.length,
        items: data.items
    });
});

router.get("/view", (req, res) => {
    const data = aiInteractionStore.readRecent(req.query.limit || 50);
    const rows = data.items
        .map(
            item => `<article>
                <header>
                    <b>${escapeHtml(item.question || "未记录问题")}</b>
                    <span>${escapeHtml(item.provider)} / ${escapeHtml(item.model)} · ${escapeHtml(item.status)} · ${Number(item.durationMs || 0)}ms</span>
                </header>
                <p>${escapeHtml(item.answer || item.error || "暂无回答")}</p>
                <small>${escapeHtml(item.timestamp)} · tokens: ${escapeHtml(item.usage?.total_tokens || "-")}</small>
            </article>`
        )
        .join("");
    res.type("html").send(`<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>EduSmart AI 问答日志</title>
    <style>
        body{margin:0;padding:32px;font-family:Inter,"Microsoft YaHei",system-ui,sans-serif;background:#f5f8ff;color:#13254a}
        main{max-width:1100px;margin:0 auto}
        h1{margin:0 0 8px;font-size:28px}
        .file{margin:0 0 24px;color:#667899;font-size:13px}
        article{margin:14px 0;padding:18px 20px;border:1px solid #dce8fb;border-radius:14px;background:rgba(255,255,255,.82);box-shadow:0 14px 34px rgba(40,75,145,.08)}
        header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
        b{font-size:16px}
        span,small{color:#667899;font-size:12px}
        p{white-space:pre-wrap;line-height:1.7;color:#263c67}
    </style>
</head>
<body><main><h1>EduSmart AI 问答日志</h1><p class="file">${escapeHtml(data.file)}</p>${rows || "<p>暂无记录。</p>"}</main></body>
</html>`);
});

module.exports = router;
