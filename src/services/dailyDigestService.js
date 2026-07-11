const pool = require("../db");
const { getEmailBinding, getUserMembership, getUserSmtpConfig, parseJson } = require("./membershipService");
const { ensurePersonalKnowledgeTables, ensureSeedCard, listCards } = require("./personalKnowledgeService");
const { sendDailyDigestEmail } = require("./emailService");

let readyPromise = null;

function todayDate() {
    return new Date().toISOString().slice(0, 10);
}

function safeJson(value) {
    return JSON.stringify(value || []);
}

function clean(value, fallback = "") {
    return String(value || fallback)
        .replace(/\s+/g, " ")
        .trim();
}

async function tableExists(table) {
    const [rows] = await pool.query("SHOW TABLES LIKE ?", [table]);
    return rows.length > 0;
}

async function columnExists(table, column) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
    return rows.length > 0;
}

async function ensureDailyDigestTables() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
        await ensurePersonalKnowledgeTables();
        await pool.query(`
            CREATE TABLE IF NOT EXISTS daily_digest_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                digest_date DATE NOT NULL,
                title VARCHAR(220) NOT NULL,
                summary TEXT,
                recommended_points_json JSON NULL,
                cards_json JSON NULL,
                recall_questions_json JSON NULL,
                next_actions_json JSON NULL,
                status VARCHAR(30) DEFAULT 'generated',
                generated_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_user_digest_date (user_id, digest_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS email_push_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                digest_id INT NULL,
                email VARCHAR(180) NOT NULL,
                status VARCHAR(30) DEFAULT 'pending',
                provider VARCHAR(60) NULL,
                provider_message_id VARCHAR(160) NULL,
                error_message TEXT NULL,
                sent_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_created (user_id, created_at),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    })();
    return readyPromise;
}

async function recentLearningContext(userId) {
    const context = { answers: [], notes: [], tasks: [], mistakes: [], events: [] };
    if (await tableExists("user_answers")) {
        const answerTimeColumn = (await columnExists("user_answers", "created_at"))
            ? "ua.created_at"
            : (await columnExists("user_answers", "answered_at"))
              ? "ua.answered_at"
              : "NULL";
        const questionTextColumn = (await columnExists("questions", "content"))
            ? "q.content"
            : (await columnExists("questions", "question"))
              ? "q.question"
              : "''";
        const questionSubjectColumn = (await columnExists("questions", "subject")) ? "q.subject" : "NULL";
        const questionAnswerColumn = (await columnExists("questions", "correct_answer"))
            ? "q.correct_answer"
            : (await columnExists("questions", "answer"))
              ? "q.answer"
              : "NULL";
        const [answers] = await pool.query(
            `SELECT ua.id, ua.is_correct, ${answerTimeColumn} AS created_at,
                    ${questionTextColumn} AS content,
                    ${questionSubjectColumn} AS subject,
                    ${questionAnswerColumn} AS correct_answer
             FROM user_answers ua
             LEFT JOIN questions q ON q.id = ua.question_id
             WHERE ua.user_id = ?
             ORDER BY ${answerTimeColumn === "NULL" ? "ua.id" : answerTimeColumn} DESC
             LIMIT 8`,
            [userId]
        );
        context.answers = answers;
    }
    if (await tableExists("notes")) {
        const [notes] = await pool.query(
            `SELECT id, title, body, subject, created_at
             FROM notes
             WHERE user_id = ?
             ORDER BY updated_at DESC, created_at DESC
             LIMIT 6`,
            [userId]
        );
        context.notes = notes;
    }
    if (await tableExists("study_tasks")) {
        const [tasks] = await pool.query(
            `SELECT id, title, subtitle, status, task_date, created_at
             FROM study_tasks
             WHERE user_id = ?
             ORDER BY task_date DESC, created_at DESC
             LIMIT 8`,
            [userId]
        );
        context.tasks = tasks;
    }
    if (await tableExists("error_book")) {
        const [mistakes] = await pool.query(
            `SELECT id, subject, status, wrong_answer, correct_answer, created_at
             FROM error_book
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 6`,
            [userId]
        );
        context.mistakes = mistakes;
    }
    if (await tableExists("learning_events")) {
        const [events] = await pool.query(
            `SELECT event_type, page, subject, created_at
             FROM learning_events
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 10`,
            [userId]
        );
        context.events = events;
    }
    return context;
}

function buildDigestPayload(context, cards) {
    const weakAnswers = context.answers.filter(item => !item.is_correct);
    const firstCard = cards[0];
    const pointFromMistake = clean(weakAnswers[0]?.subject || context.mistakes[0]?.subject);
    const pointFromNote = clean(context.notes[0]?.subject || context.notes[0]?.title);
    const mainPoint = clean(firstCard?.knowledgePoint || pointFromMistake || pointFromNote || "主动回忆与错题复盘");
    const learnedCount = context.answers.length + context.notes.length + context.tasks.length + context.events.length;
    const summary =
        learnedCount > 0
            ? `昨日系统记录到 ${learnedCount} 条学习线索，其中 ${weakAnswers.length} 条需要复盘。今天建议围绕“${mainPoint}”做一次短复习。`
            : `今天先用一张知识卡启动复习。完成 AI 问答、笔记或练习后，推送会自动变得更个性化。`;
    const recommendedPoints = [
        mainPoint,
        pointFromMistake && pointFromMistake !== mainPoint ? pointFromMistake : "",
        pointFromNote && pointFromNote !== mainPoint ? pointFromNote : ""
    ]
        .filter(Boolean)
        .slice(0, 3);
    const selectedCards = cards.slice(0, 3).map(card => ({
        id: card.id,
        title: card.title,
        summary: card.summary,
        subject: card.subject,
        knowledgePoint: card.knowledgePoint,
        recallQuestion: card.recallQuestion
    }));
    const recallQuestions = selectedCards.length
        ? selectedCards.map(card => card.recallQuestion || `请解释：${card.knowledgePoint || card.title}`)
        : [`请不用看资料，说明“${mainPoint}”的核心含义。`];
    const nextActions = [
        `用 10 分钟复述“${mainPoint}”，并补充一条自己的例子。`,
        weakAnswers.length ? "回看最近错题，标出错因是概念、审题还是步骤。" : "完成一道相关练习，让系统积累更多复盘素材。",
        context.notes.length ? "把最近笔记整理成 3 个关键词。" : "保存一条学习笔记，作为明天推送素材。"
    ];
    return {
        title: `你的 EduSmart 今日知识推送：${mainPoint}`,
        summary,
        recommendedPoints,
        cards: selectedCards,
        recallQuestions: recallQuestions.slice(0, 3),
        nextActions
    };
}

async function generateDailyDigest(userId, date = todayDate()) {
    await ensureDailyDigestTables();
    await ensureSeedCard(userId);
    const context = await recentLearningContext(userId);
    const cards = await listCards(userId, { status: "due", limit: 6 });
    const payload = buildDigestPayload(context, cards);

    await pool.query(
        `INSERT INTO daily_digest_logs
            (user_id, digest_date, title, summary, recommended_points_json, cards_json,
             recall_questions_json, next_actions_json, status, generated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'generated', NOW())
         ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            summary = VALUES(summary),
            recommended_points_json = VALUES(recommended_points_json),
            cards_json = VALUES(cards_json),
            recall_questions_json = VALUES(recall_questions_json),
            next_actions_json = VALUES(next_actions_json),
            status = 'generated',
            generated_at = NOW()`,
        [
            userId,
            date,
            payload.title,
            payload.summary,
            safeJson(payload.recommendedPoints),
            safeJson(payload.cards),
            safeJson(payload.recallQuestions),
            safeJson(payload.nextActions)
        ]
    );
    const [[row]] = await pool.query("SELECT * FROM daily_digest_logs WHERE user_id = ? AND digest_date = ? LIMIT 1", [
        userId,
        date
    ]);
    return formatDigest(row);
}

async function logEmailPush(userId, digestId, email, status = "pending", errorMessage = null, provider = "smtp", messageId = null) {
    await ensureDailyDigestTables();
    const [result] = await pool.query(
        `INSERT INTO email_push_logs
            (user_id, digest_id, email, status, provider, provider_message_id, error_message, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, IF(? = 'sent', NOW(), NULL))`,
        [userId, digestId, email, status, provider, messageId, errorMessage, status]
    );
    return result.insertId;
}

async function sendDigestEmail(userId, digest = null) {
    const binding = await getEmailBinding(userId);
    if (!binding.email || !binding.verified || !binding.pushEnabled || binding.unsubscribed) {
        const error = new Error("邮箱未验证或未开启推送");
        error.status = 400;
        throw error;
    }
    const targetDigest = digest || (await generateDailyDigest(userId));
    try {
        const smtpConfig = await getUserSmtpConfig(userId);
        const delivery = await sendDailyDigestEmail({ to: binding.email, digest: targetDigest, smtpConfig });
        await logEmailPush(
            userId,
            targetDigest.id,
            binding.email,
            "sent",
            null,
            delivery.provider,
            delivery.messageId
        );
        return { ...delivery, email: binding.maskedEmail, digest: targetDigest };
    } catch (error) {
        await logEmailPush(userId, targetDigest.id, binding.email, "failed", error.message, "smtp");
        throw error;
    }
}

function formatDigest(row) {
    if (!row) return null;
    return {
        id: row.id,
        userId: row.user_id,
        digestDate: row.digest_date,
        title: row.title,
        summary: row.summary,
        recommendedPoints: parseJson(row.recommended_points_json, []),
        cards: parseJson(row.cards_json, []),
        recallQuestions: parseJson(row.recall_questions_json, []),
        nextActions: parseJson(row.next_actions_json, []),
        status: row.status,
        generatedAt: row.generated_at,
        createdAt: row.created_at
    };
}

async function recentDigests(userId, limit = 10) {
    await ensureDailyDigestTables();
    const [rows] = await pool.query(
        `SELECT *
         FROM daily_digest_logs
         WHERE user_id = ?
         ORDER BY digest_date DESC, id DESC
         LIMIT ?`,
        [userId, Math.max(1, Math.min(30, Number(limit) || 10))]
    );
    return rows.map(formatDigest);
}

async function recentEmailLogs(userId, limit = 10) {
    await ensureDailyDigestTables();
    const [rows] = await pool.query(
        `SELECT id, digest_id, email, status, provider, error_message, sent_at, created_at
         FROM email_push_logs
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, Math.max(1, Math.min(30, Number(limit) || 10))]
    );
    return rows;
}

async function membershipCenterData(userId) {
    const [membership, emailBinding, digests, emailLogs, cards] = await Promise.all([
        getUserMembership(userId),
        getEmailBinding(userId),
        recentDigests(userId, 5),
        recentEmailLogs(userId, 5),
        listCards(userId, { limit: 8 })
    ]);
    return { membership, emailBinding, digests, emailLogs, cards };
}

module.exports = {
    todayDate,
    ensureDailyDigestTables,
    generateDailyDigest,
    sendDigestEmail,
    recentDigests,
    recentEmailLogs,
    membershipCenterData
};
