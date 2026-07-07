const nodemailer = require("nodemailer");

function bool(value) {
    return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

function emailConfig() {
    const provider = process.env.EMAIL_PROVIDER || "smtp";
    const host = process.env.SMTP_HOST || "";
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASSWORD || "";
    const secure = process.env.SMTP_SECURE ? bool(process.env.SMTP_SECURE) : port === 465;
    const from = process.env.EMAIL_FROM || (user ? `EduSmart <${user}>` : "");
    return {
        provider,
        host,
        port,
        secure,
        user,
        pass,
        from,
        configured: provider === "smtp" && Boolean(host && user && pass && from)
    };
}

function requireSmtpConfig(override = null) {
    const config = override || emailConfig();
    if (!config.configured) {
        const error = new Error(
            "邮件服务未配置。请在 .env 中配置 EMAIL_PROVIDER=smtp、SMTP_HOST、SMTP_PORT、SMTP_USER、SMTP_PASSWORD、EMAIL_FROM。QQ 邮箱发件需要使用 SMTP 授权码，不是登录密码。"
        );
        error.status = 503;
        error.code = "EMAIL_NOT_CONFIGURED";
        error.emailConfig = { provider: config.provider, configured: false };
        throw error;
    }
    return config;
}

function createTransport() {
    const config = requireSmtpConfig();
    return createTransportFromConfig(config);
}

function createTransportFromConfig(config) {
    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass
        }
    });
}

function renderLayout(title, bodyHtml) {
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;color:#172033;">
  <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
    <div style="background:#ffffff;border:1px solid #e6ebf4;border-radius:14px;padding:28px;box-shadow:0 12px 30px rgba(21,32,56,.08);">
      <div style="font-size:14px;color:#4f6bff;font-weight:700;margin-bottom:12px;">EduSmart</div>
      ${bodyHtml}
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

async function sendMail({ to, subject, text, html, smtpConfig = null }) {
    const config = requireSmtpConfig(smtpConfig);
    const transporter = smtpConfig ? createTransportFromConfig(config) : createTransport();
    const info = await transporter.sendMail({
        from: config.from,
        to,
        subject,
        text,
        html
    });
    return {
        provider: "smtp",
        status: "sent",
        messageId: info.messageId || "",
        accepted: info.accepted || [],
        rejected: info.rejected || []
    };
}

async function sendVerificationCodeEmail({ to, code, expiresMinutes = 30, smtpConfig = null }) {
    const subject = "EduSmart 邮箱验证码";
    const text = `你的 EduSmart 邮箱验证码是：${code}。${expiresMinutes} 分钟内有效。`;
    const html = renderLayout(
        subject,
        `<h1 style="margin:0 0 12px;font-size:22px;">验证你的推送邮箱</h1>
        <p style="line-height:1.7;margin:0 0 18px;">请在 EduSmart 会员中心输入下面的验证码，完成邮箱绑定。</p>
        <div style="font-size:30px;letter-spacing:6px;font-weight:800;color:#172033;background:#f0f4ff;border-radius:10px;padding:18px 20px;text-align:center;">${escapeHtml(code)}</div>
        <p style="line-height:1.7;color:#667085;margin:18px 0 0;">验证码 ${expiresMinutes} 分钟内有效。如果不是你本人操作，可以忽略这封邮件。</p>`
    );
    return sendMail({ to, subject, text, html, smtpConfig });
}

function renderDigestEmail(digest) {
    const points = (digest.recommendedPoints || []).map(point => `<li>${escapeHtml(point)}</li>`).join("");
    const cards = (digest.cards || [])
        .map(
            card => `<div style="border:1px solid #e6ebf4;border-radius:10px;padding:14px;margin:12px 0;">
                <b>${escapeHtml(card.title)}</b>
                <p style="margin:8px 0 0;line-height:1.7;color:#4b5565;">${escapeHtml(card.summary)}</p>
            </div>`
        )
        .join("");
    const questions = (digest.recallQuestions || []).map(item => `<li>${escapeHtml(item)}</li>`).join("");
    const actions = (digest.nextActions || []).map(item => `<li>${escapeHtml(item)}</li>`).join("");
    return renderLayout(
        digest.title,
        `<h1 style="margin:0 0 12px;font-size:22px;">${escapeHtml(digest.title)}</h1>
        <p style="line-height:1.8;margin:0 0 18px;color:#344054;">${escapeHtml(digest.summary)}</p>
        <h2 style="font-size:16px;margin:22px 0 8px;">今日推荐知识点</h2>
        <ul style="line-height:1.8;margin:0 0 16px;padding-left:20px;">${points || "<li>主动回忆与错题复盘</li>"}</ul>
        <h2 style="font-size:16px;margin:22px 0 8px;">个人知识卡片</h2>
        ${cards || "<p style=\"color:#667085;\">暂无知识卡片，完成问答或笔记后会自动沉淀。</p>"}
        <h2 style="font-size:16px;margin:22px 0 8px;">主动回忆题</h2>
        <ul style="line-height:1.8;margin:0 0 16px;padding-left:20px;">${questions}</ul>
        <h2 style="font-size:16px;margin:22px 0 8px;">下一步行动</h2>
        <ul style="line-height:1.8;margin:0;padding-left:20px;">${actions}</ul>`
    );
}

async function sendDailyDigestEmail({ to, digest, smtpConfig = null }) {
    const html = renderDigestEmail(digest);
    const text = [
        digest.title,
        digest.summary,
        `推荐知识点：${(digest.recommendedPoints || []).join("、")}`,
        `主动回忆：${(digest.recallQuestions || []).join("；")}`,
        `下一步：${(digest.nextActions || []).join("；")}`
    ].join("\n\n");
    return sendMail({ to, subject: digest.title, text, html, smtpConfig });
}

module.exports = {
    emailConfig,
    sendVerificationCodeEmail,
    sendDailyDigestEmail
};
