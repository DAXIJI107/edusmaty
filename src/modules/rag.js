const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');
const { ensureRagData } = require('../core/RagSeeder');
const { ingestPublicSources, PUBLIC_AGENT_SOURCES } = require('../core/PublicRagIngestor');
const RagSearchService = require('../core/RagSearchService');
const llmGateway = require('../core/llm/LlmGateway');

const ragSearch = new RagSearchService(pool);

function splitKeywords(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2)
        .slice(0, 10);
}

function scoreChunk(chunk, query, keywords) {
    let score = 0;
    const t = String(chunk.chunk_text || '').toLowerCase();
    const kp = String(chunk.knowledge_point || '').toLowerCase();
    const course = String(chunk.course || '').toLowerCase();
    const q = String(query || '').toLowerCase();
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
    const chunkText = String(item.chunk_text || '').toLowerCase();
    const queryLower = String(query || '').toLowerCase();
    
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

router.get('/status', authenticateJWT, async (req, res) => {
    try {
        await ensureRagData(pool);
        const [[docRow]] = await pool.query('SELECT COUNT(*) AS total FROM rag_documents');
        const [[chunkRow]] = await pool.query('SELECT COUNT(*) AS total FROM rag_chunks WHERE is_active = 1');
        res.json({
            success: true,
            data: {
                documents: Number(docRow.total || 0),
                chunks: Number(chunkRow.total || 0)
            }
        });
    } catch (error) {
        console.error('RAG状态查询失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.get('/public-sources', authenticateJWT, async (req, res) => {
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

router.post('/ingest-public', authenticateJWT, async (req, res) => {
    try {
        const result = await ingestPublicSources(pool, {
            sourceName: req.body?.sourceName || req.body?.source || 'all',
            limit: req.body?.limit || 4
        });
        res.json(result);
    } catch (error) {
        console.error('公开资料入库失败:', error);
        res.status(500).json({ success: false, message: error.message || '公开资料入库失败' });
    }
});

async function handleOverview(req, res) {
    try {
        await ensureRagData(pool);
        const subject = String(req.body?.subject || req.query?.subject || 'all').trim();
        const params = [];
        let docWhere = '';
        let chunkWhere = 'WHERE c.is_active = 1';
        if (subject && subject !== 'all') {
            docWhere = 'WHERE d.subject = ?';
            chunkWhere += ' AND c.subject = ?';
            params.push(subject);
        }

        const [[sourceTotal]] = await pool.query('SELECT COUNT(*) AS total FROM rag_sources WHERE approved = "Y"');
        const [[docTotal]] = await pool.query(
            `SELECT COUNT(*) AS total FROM rag_documents d ${docWhere}`,
            params
        );
        const [[chunkTotal]] = await pool.query(
            `SELECT COUNT(*) AS total FROM rag_chunks c ${chunkWhere}`,
            params
        );
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
        console.error('RAG概览查询失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
}

router.get(/^\/overview\/?$/, authenticateJWT, handleOverview);
router.post('/overview', authenticateJWT, handleOverview);

router.post('/query', authenticateJWT, async (req, res) => {
    try {
        const query = String(req.body?.query || '').trim();
        const subject = String(req.body?.subject || 'all').trim();
        const sourceName = String(req.body?.sourceName || req.body?.source || '').trim() || null;
        if (!query) {
            return res.status(400).json({ success: false, message: 'query不能为空' });
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
        console.error('RAG检索失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

function buildRagPrompt({ query, subject, citations }) {
    const evidence = citations.map(item => [
        `[${item.rank}] ${item.title}`,
        `来源: ${item.source?.name || '未知来源'}`,
        `课程/知识点: ${item.course || ''} / ${item.knowledgePoint || ''}`,
        `片段: ${item.snippet || ''}`
    ].join('\n')).join('\n\n');

    return [
        {
            role: 'system',
            content: [
                '你是 EduSmart 本地学习导师。请只基于给定证据回答。',
                '如果证据不足，请明确说明“当前资料不足以确定”，并给出下一步检索建议。',
                '回答必须包含简明结论、分步解释、引用编号和下一步学习动作。',
                '引用格式使用 [1]、[2]，不要编造来源、链接或题号。'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                `学科: ${subject || 'all'}`,
                `问题: ${query}`,
                '',
                '证据:',
                evidence || '无可用证据'
            ].join('\n')
        }
    ];
}

// POST /api/rag/add-to-learning — 将RAG检索到的知识点加入学习列表
router.post('/add-to-learning', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const knowledgePoint = String(req.body?.knowledgePoint || '').trim();
        const queryContext = String(req.body?.queryContext || '').trim();

        if (!knowledgePoint) {
            return res.status(400).json({ success: false, message: 'knowledgePoint不能为空' });
        }

        // 1. 尝试匹配已有知识节点（精确匹配 → 模糊匹配）
        let nodeId = null;
        const [exactMatch] = await pool.query(
            'SELECT id, name FROM knowledge_nodes WHERE name = ? AND is_active = 1 LIMIT 1',
            [knowledgePoint]
        );
        if (exactMatch.length > 0) {
            nodeId = exactMatch[0].id;
        } else {
            const [fuzzyMatch] = await pool.query(
                'SELECT id, name FROM knowledge_nodes WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1 LIMIT 1',
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
                [knowledgePoint, `来自RAG检索的知识点：${knowledgePoint}（查询上下文：${queryContext || '无'}）`]
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
            source: 'rag_search',
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
        console.error('添加RAG知识点到学习列表失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// POST /api/rag/enrich-nodes — 为 suggestedNodes 匹配已有的 knowledge_node ID
router.post('/enrich-nodes', authenticateJWT, async (req, res) => {
    try {
        const nodes = req.body?.nodes || [];
        if (!Array.isArray(nodes) || nodes.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const enriched = [];
        for (const node of nodes) {
            const name = String(node.name || '').trim();
            if (!name) continue;

            const [matches] = await pool.query(
                'SELECT id, name, subject FROM knowledge_nodes WHERE name LIKE ? AND is_active = 1 LIMIT 3',
                [`%${name}%`]
            );

            enriched.push({
                ...node,
                matchedNodes: matches.map(m => ({ id: m.id, name: m.name, subject: m.subject }))
            });
        }

        res.json({ success: true, data: enriched });
    } catch (error) {
        console.error('RAG节点匹配失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.post('/ask', authenticateJWT, async (req, res) => {
    try {
        const query = String(req.body?.query || '').trim();
        const subject = String(req.body?.subject || 'all').trim();
        const sourceName = String(req.body?.sourceName || req.body?.source || '').trim() || null;
        if (!query) {
            return res.status(400).json({ success: false, message: 'query不能为空' });
        }

        const retrieved = await ragSearch.search({
            query,
            subject,
            sourceName,
            userId: req.user.id,
            limit: req.body?.limit || 5
        });

        if (!retrieved.citations?.length) {
            return res.json({
                success: true,
                data: {
                    ...retrieved,
                    provider: 'rag-template',
                    answer: retrieved.answer
                }
            });
        }

        const messages = buildRagPrompt({ query, subject, citations: retrieved.citations });
        let answer = '';
        let provider = 'local';
        try {
            const result = await llmGateway.chat({ messages, temperature: 0.35, maxTokens: 1800 });
            answer = result.content || '';
            provider = result.provider;
        } catch (error) {
            provider = 'rag-template';
            answer = retrieved.answer;
        }

        res.json({
            success: true,
            data: {
                ...retrieved,
                answer: answer || retrieved.answer,
                provider,
                model: provider === 'local' ? undefined : provider
            }
        });
    } catch (error) {
        console.error('RAG本地问答失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;
