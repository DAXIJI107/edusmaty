/**
 * WorkspaceIngestor — 用户资料入库工作台
 * 支持纯文本 / Markdown 上传 → 分块 → 写入 rag_* 表，供检索与资源生成溯源。
 */
const crypto = require("crypto");
const { ensurePublicRagSchema, chunkText, stripHtml } = require("./PublicRagIngestor");

const WORKSPACE_SOURCE_ID = "SRC_USER_WORKSPACE";

function stableId(prefix, value, maxLength = 32) {
    const hash = crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, maxLength - prefix.length);
    return `${prefix}${hash}`.slice(0, maxLength);
}

function estimateQuality(text) {
    const length = String(text || "").length;
    let score = 3.5;
    if (length >= 200) score += 0.4;
    if (length >= 600) score += 0.4;
    if (/定义|原理|步骤|例子|例题|注意|误区/.test(text)) score += 0.3;
    if (/```|公式|定理|算法/.test(text)) score += 0.2;
    return Math.min(4.95, Number(score.toFixed(2)));
}

async function ensureWorkspaceSource(pool, userId) {
    await ensurePublicRagSchema(pool);
    await pool.query(
        `INSERT INTO rag_sources (source_id, source_name, base_url, license_type, approved)
         VALUES (?, ?, ?, ?, 'Y')
         ON DUPLICATE KEY UPDATE source_name = VALUES(source_name), approved = 'Y'`,
        [WORKSPACE_SOURCE_ID, "用户学习资料工作台", `workspace://user/${userId}`, "用户授权上传"]
    );
}

/**
 * @param {import('mysql2/promise').Pool} pool
 * @param {{ userId:number, title?:string, content:string, subject?:string, knowledgePoint?:string, course?:string, filename?:string }} input
 */
async function ingestWorkspaceDocument(pool, input) {
    const userId = Number(input.userId);
    const content = String(input.content || "").trim();
    if (!userId) throw new Error("缺少 userId");
    if (content.length < 40) throw new Error("资料内容过短，请至少提供约 40 字以上文本");

    await ensureWorkspaceSource(pool, userId);

    const title = String(input.title || input.filename || "未命名资料").slice(0, 180);
    const subject = String(input.subject || "计算机科学").slice(0, 64);
    const knowledgePoint = String(input.knowledgePoint || title).slice(0, 255);
    const course = String(input.course || `user_${userId}_workspace`).slice(0, 128);
    const cleaned = stripHtml(content);
    const chunks = chunkText(cleaned, 900, 120);
    if (!chunks.length) {
        // 短文也至少保留一块
        chunks.push(cleaned.slice(0, 900));
    }

    const url = `workspace://user/${userId}/${stableId("F", `${title}:${cleaned.slice(0, 80)}`)}`;
    const docId = stableId("DOC", `${userId}:${url}`);

    await pool.query(
        `INSERT INTO rag_documents
            (doc_id, source_id, title, url, subject, course, chapter, knowledge_point, summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            subject = VALUES(subject),
            course = VALUES(course),
            chapter = VALUES(chapter),
            knowledge_point = VALUES(knowledge_point),
            summary = VALUES(summary)`,
        [
            docId,
            WORKSPACE_SOURCE_ID,
            title,
            url,
            subject,
            course,
            `用户上传 · uid=${userId}`,
            knowledgePoint,
            chunks[0].slice(0, 260)
        ]
    );

    await pool.query("UPDATE rag_chunks SET is_active = 0 WHERE doc_id = ?", [docId]);

    const writtenChunks = [];
    for (let index = 0; index < chunks.length; index += 1) {
        const chunkTextValue = chunks[index];
        const quality = estimateQuality(chunkTextValue);
        const chunkId = stableId("CHK", `${docId}:${index}:${chunkTextValue.slice(0, 40)}`);
        await pool.query(
            `INSERT INTO rag_chunks
                (chunk_id, doc_id, chunk_index, chunk_text, subject, course, knowledge_point, quality_score, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE
                chunk_text = VALUES(chunk_text),
                subject = VALUES(subject),
                course = VALUES(course),
                knowledge_point = VALUES(knowledge_point),
                quality_score = VALUES(quality_score),
                is_active = 1`,
            [chunkId, docId, index + 1, chunkTextValue, subject, course, knowledgePoint, quality]
        );
        writtenChunks.push({
            chunkId,
            index: index + 1,
            qualityScore: quality,
            preview: chunkTextValue.slice(0, 120)
        });
    }

    return {
        success: true,
        docId,
        title,
        subject,
        knowledgePoint,
        url,
        chunkCount: writtenChunks.length,
        chunks: writtenChunks,
        citations: writtenChunks.map((c, i) => ({
            id: i + 1,
            chunkId: c.chunkId,
            title,
            knowledgePoint,
            excerpt: c.preview
        }))
    };
}

module.exports = {
    WORKSPACE_SOURCE_ID,
    ingestWorkspaceDocument,
    estimateQuality,
    ensureWorkspaceSource
};
