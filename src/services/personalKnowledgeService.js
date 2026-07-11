const pool = require("../db");
const { parseJson } = require("./membershipService");

let readyPromise = null;

function clampText(value, length) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, length);
}

async function ensurePersonalKnowledgeTables() {
    if (readyPromise) return readyPromise;
    readyPromise = pool.query(`
        CREATE TABLE IF NOT EXISTS personal_knowledge_cards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(220) NOT NULL,
            summary TEXT,
            subject VARCHAR(80) NULL,
            knowledge_point VARCHAR(160) NULL,
            recall_question TEXT,
            source_type VARCHAR(60) NOT NULL,
            source_id VARCHAR(120) NULL,
            mastery_state VARCHAR(40) DEFAULT 'new',
            priority_score DECIMAL(6,2) DEFAULT 0,
            next_review_at DATETIME NULL,
            last_reviewed_at DATETIME NULL,
            metadata_json JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_review (user_id, next_review_at),
            INDEX idx_user_priority (user_id, priority_score)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    return readyPromise;
}

function inferTitle(answer, fallback = "AI 问答知识卡") {
    const text = clampText(answer, 180);
    const first = text.split(/[。！？.!?]/)[0] || fallback;
    return clampText(first, 60) || fallback;
}

function buildCardFromAi({ sourceId, answer, subject, knowledgePoint }) {
    const title = inferTitle(answer, knowledgePoint || "AI 问答知识卡");
    const summary = clampText(answer, 360) || "这张卡片来自一次 AI 学习问答，可在每日推送中复习。";
    const point = clampText(knowledgePoint || title, 120);
    return {
        title,
        summary,
        subject: clampText(subject || "综合", 80),
        knowledgePoint: point,
        recallQuestion: `请用自己的话解释：${point}`,
        sourceType: "ai_answer",
        sourceId: clampText(sourceId || `ai_${Date.now()}`, 120),
        masteryState: "new",
        priorityScore: 70,
        metadata: { generatedBy: "mvp-rule", freeTestMode: true }
    };
}

async function createCard(userId, card) {
    await ensurePersonalKnowledgeTables();
    const [result] = await pool.query(
        `INSERT INTO personal_knowledge_cards
            (user_id, title, summary, subject, knowledge_point, recall_question, source_type, source_id,
             mastery_state, priority_score, next_review_at, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), ?)`,
        [
            userId,
            clampText(card.title, 220) || "知识卡片",
            clampText(card.summary, 1200),
            clampText(card.subject, 80) || null,
            clampText(card.knowledgePoint, 160) || null,
            clampText(card.recallQuestion, 500),
            clampText(card.sourceType, 60) || "manual",
            clampText(card.sourceId, 120) || null,
            clampText(card.masteryState, 40) || "new",
            Number(card.priorityScore || 0),
            JSON.stringify(card.metadata || {})
        ]
    );
    return { id: result.insertId, ...card };
}

async function createCardFromAi(userId, payload) {
    return createCard(userId, buildCardFromAi(payload || {}));
}

async function listCards(userId, { status = "", limit = 20 } = {}) {
    await ensurePersonalKnowledgeTables();
    const params = [userId];
    const where = ["user_id = ?"];
    if (status === "due") {
        where.push("(next_review_at IS NULL OR next_review_at <= DATE_ADD(NOW(), INTERVAL 1 DAY))");
    } else if (status) {
        where.push("mastery_state = ?");
        params.push(status);
    }
    params.push(Math.max(1, Math.min(50, Number(limit) || 20)));
    const [rows] = await pool.query(
        `SELECT *
         FROM personal_knowledge_cards
         WHERE ${where.join(" AND ")}
         ORDER BY priority_score DESC, COALESCE(next_review_at, created_at), id DESC
         LIMIT ?`,
        params
    );
    return rows.map(row => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        subject: row.subject,
        knowledgePoint: row.knowledge_point,
        recallQuestion: row.recall_question,
        sourceType: row.source_type,
        sourceId: row.source_id,
        masteryState: row.mastery_state,
        priorityScore: Number(row.priority_score || 0),
        nextReviewAt: row.next_review_at,
        lastReviewedAt: row.last_reviewed_at,
        metadata: parseJson(row.metadata_json, {}),
        createdAt: row.created_at
    }));
}

async function ensureSeedCard(userId) {
    await ensurePersonalKnowledgeTables();
    const [[row]] = await pool.query("SELECT id FROM personal_knowledge_cards WHERE user_id = ? LIMIT 1", [userId]);
    if (row) return null;
    return createCard(userId, {
        title: "每日复习启动卡",
        summary: "这是一张用于测试每日知识推送的启动卡。后续 AI 问答、笔记和错题会自动沉淀为更贴近你的复习材料。",
        subject: "综合",
        knowledgePoint: "主动回忆",
        recallQuestion: "为什么复习时主动回忆比只看答案更有效？",
        sourceType: "system_seed",
        sourceId: "free_test_seed",
        masteryState: "new",
        priorityScore: 45,
        metadata: { seed: true }
    });
}

module.exports = {
    ensurePersonalKnowledgeTables,
    buildCardFromAi,
    createCard,
    createCardFromAi,
    listCards,
    ensureSeedCard
};
