const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");
const { ensureRagData } = require("../core/RagSeeder");
const { ingestPublicSources, PUBLIC_AGENT_SOURCES } = require("../core/PublicRagIngestor");
const RagSearchService = require("../core/RagSearchService");
const llmGateway = require("../core/llm/LlmGateway");

const ragSearch = new RagSearchService(pool);

function splitKeywords(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, " ")
        .split(/\s+/)
        .map(item => item.trim())
        .filter(item => item.length >= 2)
        .slice(0, 10);
}

function scoreChunk(chunk, query, keywords) {
    let score = 0;
    const t = String(chunk.chunk_text || "").toLowerCase();
    const kp = String(chunk.knowledge_point || "").toLowerCase();
    const course = String(chunk.course || "").toLowerCase();
    const q = String(query || "").toLowerCase();
    if (q && t.includes(q)) score += 5;
    if (q && kp.includes(q)) score += 3;
    if (q && course.includes(q)) score += 2;
    for (const kw of keywords) {
        if (t.includes(kw)) score += 2;
        if (kp.includes(kw)) score += 2;
        if (course.includes(kw)) score += 1;
    }
    score += Number(chunk.quality_score || 0);
    return score;
}

// 计算相关性
function calculateRelevance(item, query, keywords) {
    let relevance = 0;
    const chunkText = String(item.chunk_text || "").toLowerCase();
    const queryLower = String(query || "").toLowerCase();

    // 完全匹配
    if (chunkText.includes(queryLower)) {
        relevance += 0.5;
    }

    // 关键词匹配
    for (const keyword of keywords) {
        if (chunkText.includes(keyword.toLowerCase())) {
            relevance += 0.1;
        }
    }

    // 质量分数
    relevance += (Number(item.quality_score || 0) / 10) * 0.3;

    return Math.min(relevance, 1.0);
}

router.get("/status", authenticateJWT, async (req, res) => {
    try {
        await ensureRagData(pool);
        const [[docRow]] = await pool.query("SELECT COUNT(*) AS total FROM rag_documents");
        const [[chunkRow]] = await pool.query("SELECT COUNT(*) AS total FROM rag_chunks WHERE is_active = 1");
        res.json({
            success: true,
            data: {
                documents: Number(docRow.total || 0),
                chunks: Number(chunkRow.total || 0)
            }
        });
    } catch (error) {
        console.error("RAG状态查询失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/public-sources", authenticateJWT, async (req, res) => {
    res.json({
        success: true,
        data: PUBLIC_AGENT_SOURCES.map(source => ({
            id: source.id,
            name: source.name,
            baseUrl: source.baseUrl,
            subject: source.subject,
            course: source.course,
            license: source.license
        }))
    });
});

router.post("/ingest-public", authenticateJWT, async (req, res) => {
    try {
        const result = await ingestPublicSources(pool, {
            sourceName: req.body?.sourceName || req.body?.source || "all",
            limit: req.body?.limit || 4
        });
        res.json(result);
    } catch (error) {
        console.error("公开资料入库失败:", error);
        res.status(500).json({ success: false, message: error.message || "公开资料入库失败" });
    }
});

// 用户资料入库工作台：文本/Markdown → 分块 → rag_*（供检索与资源生成溯源）
router.post("/ingest-workspace", authenticateJWT, async (req, res) => {
    try {
        const { ingestWorkspaceDocument } = require("../core/WorkspaceIngestor");
        const result = await ingestWorkspaceDocument(pool, {
            userId: req.user.id,
            title: req.body?.title,
            filename: req.body?.filename,
            content: req.body?.content,
            subject: req.body?.subject,
            knowledgePoint: req.body?.knowledgePoint,
            course: req.body?.course
        });
        res.json(result);
    } catch (error) {
        console.error("工作台资料入库失败:", error);
        res.status(400).json({ success: false, message: error.message || "资料入库失败" });
    }
});

router.post("/quality-check", authenticateJWT, async (req, res) => {
    try {
        const { evaluateResource } = require("../core/ResourceQualityGate");
        const resource = req.body?.resource || {
            title: req.body?.title || "未命名",
            content: req.body?.content || "",
            citations: req.body?.citations || []
        };
        const quality = evaluateResource(resource, req.body?.subject || "计算机科学");
        res.json({ success: true, quality });
    } catch (error) {
        console.error("资源质检失败:", error);
        res.status(500).json({ success: false, message: error.message || "质检失败" });
    }
});

async function handleOverview(req, res) {
    try {
        await ensureRagData(pool);
        const subject = String(req.body?.subject || req.query?.subject || "all").trim();
        const params = [];
        let docWhere = "";
        let chunkWhere = "WHERE c.is_active = 1";
        if (subject && subject !== "all") {
            docWhere = "WHERE d.subject = ?";
            chunkWhere += " AND c.subject = ?";
            params.push(subject);
        }

        const [[sourceTotal]] = await pool.query('SELECT COUNT(*) AS total FROM rag_sources WHERE approved = "Y"');
        const [[docTotal]] = await pool.query(`SELECT COUNT(*) AS total FROM rag_documents d ${docWhere}`, params);
        const [[chunkTotal]] = await pool.query(`SELECT COUNT(*) AS total FROM rag_chunks c ${chunkWhere}`, params);
        const [courseRows] = await pool.query(
            `SELECT c.course, COUNT(*) AS chunks
             FROM rag_chunks c
             ${chunkWhere}
             GROUP BY c.course
             ORDER BY chunks DESC
             LIMIT 12`,
            params
        );
        const [sourceRows] = await pool.query(
            `SELECT s.source_id, s.source_name, s.base_url, s.license_type,
                    COUNT(d.doc_id) AS documents
             FROM rag_sources s
             LEFT JOIN rag_documents d ON d.source_id = s.source_id
             GROUP BY s.source_id, s.source_name, s.base_url, s.license_type
             ORDER BY documents DESC, s.source_id
             LIMIT 20`
        );
        const [docRows] = await pool.query(
            `SELECT d.doc_id, d.title, d.url, d.subject, d.course, d.chapter, d.knowledge_point,
                    s.source_name,
                    (SELECT COUNT(*) FROM rag_chunks c WHERE c.doc_id = d.doc_id AND c.is_active = 1) AS chunks
             FROM rag_documents d
             LEFT JOIN rag_sources s ON s.source_id = d.source_id
             ${docWhere}
             ORDER BY d.created_at DESC, d.doc_id DESC
             LIMIT 30`,
            params
        );
        const [queryRows] = await pool.query(
            `SELECT query_text, subject, hit_count, created_at
             FROM rag_query_logs
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 12`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                stats: {
                    sources: Number(sourceTotal.total || 0),
                    documents: Number(docTotal.total || 0),
                    chunks: Number(chunkTotal.total || 0)
                },
                courses: courseRows.map(row => ({
                    course: row.course,
                    chunks: Number(row.chunks || 0)
                })),
                sources: sourceRows.map(row => ({
                    id: row.source_id,
                    name: row.source_name,
                    url: row.base_url,
                    license: row.license_type,
                    documents: Number(row.documents || 0)
                })),
                documents: docRows.map(row => ({
                    id: row.doc_id,
                    title: row.title,
                    url: row.url,
                    subject: row.subject,
                    course: row.course,
                    chapter: row.chapter,
                    knowledgePoint: row.knowledge_point,
                    source: row.source_name,
                    chunks: Number(row.chunks || 0)
                })),
                recentQueries: queryRows.map(row => ({
                    query: row.query_text,
                    subject: row.subject,
                    hitCount: Number(row.hit_count || 0),
                    createdAt: row.created_at
                }))
            }
        });
    } catch (error) {
        console.error("RAG概览查询失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
}

router.get(/^\/overview\/?$/, authenticateJWT, handleOverview);
router.post("/overview", authenticateJWT, handleOverview);

router.post("/query", authenticateJWT, async (req, res) => {
    try {
        const query = String(req.body?.query || "").trim();
        const subject = String(req.body?.subject || "all").trim();
        const sourceName = String(req.body?.sourceName || req.body?.source || "").trim() || null;
        if (!query) {
            return res.status(400).json({ success: false, message: "query不能为空" });
        }
        const data = await ragSearch.search({
            query,
            subject,
            sourceName,
            userId: req.user.id,
            limit: req.body?.limit || 5
        });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("RAG检索失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

function buildRagPrompt({ query, subject, citations }) {
    const evidence = citations
        .map(item =>
            [
                `[${item.rank}] ${item.title}`,
                `来源: ${item.source?.name || "未知来源"}`,
                `课程/知识点: ${item.course || ""} / ${item.knowledgePoint || ""}`,
                `片段: ${item.snippet || ""}`
            ].join("\n")
        )
        .join("\n\n");

    return [
        {
            role: "system",
            content: [
                "你是 EduSmart 本地学习导师。请只基于给定证据回答。",
                "如果证据不足，请明确说明“当前资料不足以确定”，并给出下一步检索建议。",
                "回答必须包含简明结论、分步解释、引用编号和下一步学习动作。",
                "引用格式使用 [1]、[2]，不要编造来源、链接或题号。"
            ].join("\n")
        },
        {
            role: "user",
            content: [`学科: ${subject || "all"}`, `问题: ${query}`, "", "证据:", evidence || "无可用证据"].join("\n")
        }
    ];
}

// ======================== 智能问答：AI 查询分析 + 多查询检索 + 混合回答 ========================

// 从 LLM 输出中稳健提取 JSON 对象（兼容 ```json 代码块包裹、前后多余文字）
function extractJsonObject(text) {
    const raw = String(text || "");
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const body = fenced ? fenced[1] : raw;
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
        return JSON.parse(body.slice(start, end + 1));
    } catch (e) {
        return null;
    }
}

/**
 * AI 查询分析：让 LLM 理解问题意图，扩展同义词/近义词/上位概念，输出检索用短语
 * 失败时静默降级为本地分词关键词
 */
async function analyzeQueryWithAi(query) {
    const fallback = { intent: "", keywords: [], queries: [], provider: "local-fallback" };
    try {
        const messages = [
            {
                role: "system",
                content: [
                    "你是 EduSmart 知识库的检索查询分析器。",
                    "本地知识库使用 BM25 关键词检索（中文按二字/三字切分），无法理解语义近似，所以你需要把用户的口语问题扩展为多个可能的书面表达。",
                    "只输出 JSON，不要输出任何解释或多余文字。"
                ].join("\n")
            },
            {
                role: "user",
                content: [
                    `用户问题：${query}`,
                    "",
                    "请输出 JSON：",
                    '{"intent":"一句话概括用户想知道什么","keywords":["2-4字核心关键词","同义词","近义词","相关概念"],"queries":["改写检索短语1","改写检索短语2","改写检索短语3"]}',
                    "",
                    "要求：",
                    "1. keywords 给 4-8 个，包含问题中的核心名词、它们的同义词、近义词和上位概念（如“码农”→“程序员/软件开发”）；",
                    "2. queries 给 2-3 个，每个 4-12 字，是可能出现在教材/笔记中的书面说法；",
                    "3. 不要输出与问题无关的词。"
                ].join("\n")
            }
        ];
        const result = await llmGateway.chat({ messages, temperature: 0.2, maxTokens: 500 });
        const parsed = extractJsonObject(result.content);
        if (!parsed || !Array.isArray(parsed.queries)) return fallback;
        return {
            intent: String(parsed.intent || "").slice(0, 120),
            keywords: (parsed.keywords || []).map(k => String(k).trim()).filter(Boolean).slice(0, 8),
            queries: (parsed.queries || []).map(q => String(q).trim()).filter(q => q && q !== query).slice(0, 3),
            provider: result.provider || "ai"
        };
    } catch (error) {
        return fallback;
    }
}

/**
 * 多查询合并检索：原问题 + AI 扩展短语分别检索，按 chunkId 去重保留最高分，重排取 topK
 */
async function smartRetrieve(ragSearch, { query, subject, sourceName = null, userId, limit = 6 }) {
    const analysis = await analyzeQueryWithAi(query);
    const queries = [query, ...analysis.queries].filter(Boolean);
    const merged = new Map();
    for (let i = 0; i < queries.length; i++) {
        try {
            // 仅第一次检索记录查询日志，避免日志刷屏
            const r = await ragSearch.search({
                query: queries[i],
                subject,
                sourceName,
                userId: i === 0 ? userId : null,
                limit: 4
            });
            for (const c of r.citations || []) {
                const existing = merged.get(c.chunkId);
                if (!existing || Number(c.score || 0) > Number(existing.score || 0)) {
                    merged.set(c.chunkId, { ...c, matchedBy: queries[i] });
                }
            }
        } catch (e) {
            // 单条查询检索失败不阻断整体流程
        }
    }
    const citations = [...merged.values()]
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limit)
        .map((c, i) => ({ ...c, rank: i + 1 }));
    return { citations, analysis, queryCount: queries.length };
}

// 统一回答 prompt：回答在界面上分两个区展示——「📚 知识库匹配」区展示检索到的原文片段，
// 「💡 AI 思考与解答」区展示本模型的回答。AI 负责提炼、解释、推理，不照抄原文。
function buildSmartPrompt({ query, subject, citations, mode }) {
    const evidence = citations.length
        ? citations
              .map(item =>
                  [
                      `[${item.rank}] ${item.title}`,
                      `课程/知识点: ${item.course || ""} / ${item.knowledgePoint || ""}`,
                      `原文片段: ${item.snippet || ""}`
                  ].join("\n")
              )
              .join("\n\n")
        : "（知识库未检索到相关片段）";

    const evidenceRule =
        mode === "ai_only"
            ? [
                  "知识库没有检索到相关资料，请直接用你的通用知识【完整回答用户的问题】，这是你的主要任务。",
                  "要求：回答开头第一句写「以下为 AI 通用知识解答，非知识库内容，请以课程教材为准」；",
                  "然后给出完整、准确、通俗的解答（结论+分步解释）；不要输出任何 [n] 引用编号；",
                  "全部解答完成后，最后另起一行写「建议补充到知识库的关键词：xxx」。"
              ].join("\n")
            : [
                  "知识库原文片段已在界面的「📚 知识库匹配」区单独展示给用户，你不要大段照抄原文。",
                  "你的职责是思考与提炼：",
                  "1. 先给简明结论，再分步解释，语言通俗，适合学习者阅读；",
                  "2. 引用知识库内容时用 [1]、[2] 编号，编号与「📚 知识库匹配」区的片段一一对应；",
                  "3. 若知识库片段只覆盖了问题的一部分，先基于证据回答能回答的部分，证据未覆盖的内容另起一行，以「🤖 AI 补充：」开头用通用知识简要补充，并声明该部分请以教材为准；严禁为补充内容编造 [n] 编号；",
                  "4. 末尾给出下一步学习动作（建议查阅的关键词/知识点）。"
              ].join("\n");

    return [
        {
            role: "system",
            content: [
                "你是 EduSmart 知识库学习导师。",
                "系统流程：用户提问 → AI 分析改写 → 从 Obsidian 知识库检索原文片段 → 你作答。",
                "重要：界面会自动把「知识库原文」和「你的解答」分成两个区块展示，",
                "你【绝对不要】输出“知识库匹配”“AI 思考与解答”之类的分区标题，也不要使用 ```markdown 代码块包裹你的回答，直接输出解答正文即可。",
                "回答使用 Markdown（标题、加粗、列表均可），结构清晰。",
                evidenceRule
            ].join("\n")
        },
        {
            role: "user",
            content: [`学科: ${subject || "all"}`, `问题: ${query}`, "", "知识库检索到的原文片段（已单独展示给用户，供你参考）:", evidence].join("\n")
        }
    ];
}

// POST /api/rag/add-to-learning — 将RAG检索到的知识点加入学习列表
router.post("/add-to-learning", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const knowledgePoint = String(req.body?.knowledgePoint || "").trim();
        const queryContext = String(req.body?.queryContext || "").trim();

        if (!knowledgePoint) {
            return res.status(400).json({ success: false, message: "knowledgePoint不能为空" });
        }

        // 1. 尝试匹配已有知识节点（精确匹配 → 模糊匹配）
        let nodeId = null;
        const [exactMatch] = await pool.query(
            "SELECT id, name FROM knowledge_nodes WHERE name = ? AND is_active = 1 LIMIT 1",
            [knowledgePoint]
        );
        if (exactMatch.length > 0) {
            nodeId = exactMatch[0].id;
        } else {
            const [fuzzyMatch] = await pool.query(
                "SELECT id, name FROM knowledge_nodes WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1 LIMIT 1",
                [`%${knowledgePoint}%`, `%${knowledgePoint}%`]
            );
            if (fuzzyMatch.length > 0) {
                nodeId = fuzzyMatch[0].id;
            }
        }

        // 2. 若没有匹配节点，自动创建一个
        let isNewNode = false;
        if (!nodeId) {
            const [result] = await pool.query(
                `INSERT INTO knowledge_nodes (name, description, subject, difficulty, type, is_active)
                 VALUES (?, ?, 'general', 'medium', 'concept', 1)`,
                [knowledgePoint, `来自RAG检索的知识点：${knowledgePoint}（查询上下文：${queryContext || "无"}）`]
            );
            nodeId = result.insertId;
            isNewNode = true;
        }

        // 3. 确保 learning_list 表存在
        await pool.query(`
            CREATE TABLE IF NOT EXISTS learning_list (
                id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                knowledge_node_id INT NOT NULL,
                card JSON NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uk_learning_list_user_node (user_id, knowledge_node_id),
                INDEX idx_learning_list_user_status (user_id, status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 4. 添加到学习列表
        const card = {
            source: "rag_search",
            knowledgePoint,
            queryContext,
            addedAt: new Date().toISOString()
        };
        await pool.query(
            `INSERT INTO learning_list (user_id, knowledge_node_id, card, status)
             VALUES (?, ?, ?, 'pending')
             ON DUPLICATE KEY UPDATE card = VALUES(card), status = 'pending', created_at = CURRENT_TIMESTAMP`,
            [userId, nodeId, JSON.stringify(card)]
        );

        res.json({
            success: true,
            message: `知识点「${knowledgePoint}」已加入学习列表`,
            nodeId,
            isNewNode
        });
    } catch (error) {
        console.error("添加RAG知识点到学习列表失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

// POST /api/rag/enrich-nodes — 为 suggestedNodes 匹配已有的 knowledge_node ID
router.post("/enrich-nodes", authenticateJWT, async (req, res) => {
    try {
        const nodes = req.body?.nodes || [];
        if (!Array.isArray(nodes) || nodes.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const enriched = [];
        for (const node of nodes) {
            const name = String(node.name || "").trim();
            if (!name) continue;

            const [matches] = await pool.query(
                "SELECT id, name, subject FROM knowledge_nodes WHERE name LIKE ? AND is_active = 1 LIMIT 3",
                [`%${name}%`]
            );

            enriched.push({
                ...node,
                matchedNodes: matches.map(m => ({ id: m.id, name: m.name, subject: m.subject }))
            });
        }

        res.json({ success: true, data: enriched });
    } catch (error) {
        console.error("RAG节点匹配失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.post("/ask", authenticateJWT, async (req, res) => {
    try {
        const query = String(req.body?.query || "").trim();
        const subject = String(req.body?.subject || "all").trim();
        const sourceName = String(req.body?.sourceName || req.body?.source || "").trim() || null;
        if (!query) {
            return res.status(400).json({ success: false, message: "query不能为空" });
        }

        // ① AI 分析问题（意图/同义词/改写短语）→ 多查询合并检索
        const smart = await smartRetrieve(ragSearch, {
            query,
            subject,
            sourceName,
            userId: req.user.id,
            limit: Number(req.body?.limit) || 6
        });
        const citations = smart.citations;
        const bestScore = citations.length ? Number(citations[0].score || 0) : 0;

        // ② 两种体现：有知识库匹配 → 知识库区展示原文 + AI 区提炼解答；无匹配 → 知识库区空态 + AI 通用解答
        // 实词门控已过滤虚词误命中，强相关命中通常 ≥ 5 分；弱命中也展示片段，由 AI 判断补充
        const mode = citations.length ? "kb_match" : "ai_only";

        // ③ 生成回答
        let answer = "";
        let provider = "local";
        try {
            const messages = buildSmartPrompt({ query, subject, citations, mode });
            const result = await llmGateway.chat({ messages, temperature: 0.35, maxTokens: 1800 });
            answer = result.content || "";
            provider = result.provider;
        } catch (error) {
            // LLM 不可用时的降级：有证据给模板答案，无证据给提示
            provider = "rag-template";
            answer = citations.length
                ? buildAnswerFallback(query, citations)
                : "知识库未检索到相关资料，且 AI 服务暂时不可用，请稍后再试或换个关键词提问。";
        }

        res.json({
            success: true,
            data: {
                answer,
                citations,
                evidenceChain: citations,
                hitCount: citations.length,
                provider,
                mode,
                bestScore,
                analysis: smart.analysis,
                queryCount: smart.queryCount,
                model: provider === "local" ? undefined : provider
            }
        });
    } catch (error) {
        console.error("RAG智能问答失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

// LLM 不可用时的模板化降级答案
function buildAnswerFallback(query, citations) {
    const themes = [...new Set(citations.map(c => c.knowledgePoint).filter(Boolean))].slice(0, 4).join("、");
    const sources = citations
        .map((c, i) => `[${i + 1}] ${c.title}（${c.course || "通用"}）`)
        .join("\n");
    return [
        `关于「${query}」，知识库检索到相关内容：${themes || "见参考资料"}。`,
        "",
        "📚 参考资料：",
        sources,
        "",
        "（AI 生成服务暂时不可用，以上为知识库检索结果摘要）"
    ].join("\n");
}

module.exports = router;
