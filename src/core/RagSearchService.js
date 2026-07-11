// core/RagSearchService.js
// 增强版 RAG 搜索引擎 — BM25 语义检索 + TF-IDF 加权 + 停用词过滤
const { ensureRagData } = require("./RagSeeder");
const { ingestPublicSources } = require("./PublicRagIngestor");

// ======================== 中文+英文停用词表 ========================
const STOP_WORDS = new Set([
    // 中文停用词
    "的",
    "了",
    "是",
    "在",
    "和",
    "就",
    "都",
    "而",
    "及",
    "与",
    "不",
    "也",
    "这",
    "那",
    "着",
    "之",
    "过",
    "但",
    "或",
    "很",
    "更",
    "最",
    "一",
    "个",
    "有",
    "人",
    "我",
    "你",
    "他",
    "她",
    "它",
    "们",
    "要",
    "会",
    "能",
    "可",
    "以",
    "对",
    "从",
    "到",
    "把",
    "被",
    "让",
    "向",
    "由",
    "将",
    "并",
    "中",
    "上",
    "下",
    "前",
    "后",
    "里",
    "外",
    "所",
    "用",
    "为",
    "已",
    "还",
    "又",
    "再",
    "没",
    "只",
    "如",
    "其",
    "去",
    "做",
    "该",
    "等",
    "因",
    "为",
    "所以",
    "如果",
    "虽然",
    "但是",
    "然后",
    "可以",
    "应该",
    "需要",
    "已经",
    "没有",
    "什么",
    "怎么",
    "哪",
    "吗",
    "呢",
    "吧",
    "啊",
    "哦",
    "嗯",
    "哈",
    "嘛",
    "呀",
    "啦",
    "通过",
    "进行",
    "实现",
    "使用",
    "包括",
    "提供",
    "具有",
    "发展",
    "问题",
    "方法",
    "技术",
    "系统",
    "数据",
    "信息",
    "知识",
    "学习",
    "研究",
    "工作",
    "主要",
    "方面",
    "基本",
    "不同",
    "比较",
    "重要",
    "关系",
    "过程",
    "方式",
    "结果",
    "情况",
    "内容",
    // 英文停用词
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "shall",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "as",
    "into",
    "about",
    "like",
    "through",
    "after",
    "over",
    "between",
    "out",
    "against",
    "during",
    "without",
    "before",
    "under",
    "around",
    "among",
    "and",
    "but",
    "or",
    "not",
    "no",
    "so",
    "if",
    "than",
    "then",
    "also",
    "just",
    "now",
    "up",
    "down",
    "only",
    "very",
    "too",
    "more",
    "some",
    "any",
    "each",
    "every",
    "both",
    "few",
    "most",
    "other",
    "such",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "he",
    "she",
    "they",
    "them",
    "we",
    "you",
    "us",
    "all",
    "there",
    "here",
    "when",
    "where",
    "why",
    "how",
    "which",
    "who",
    "whom",
    "what"
]);

// ======================== BM25 参数 ========================
const BM25_K1 = 1.2; // 词频饱和度参数
const BM25_B = 0.75; // 文档长度归一化参数

// ======================== 分词器 ========================
/**
 * 增强版分词器：优先字典匹配 + bigram 回退
 * 输出去停用词后的 token 列表
 */
function tokenize(text) {
    const raw = String(text || "")
        .toLowerCase()
        .trim();
    if (!raw) return [];

    const tokens = [];

    // 1. 提取英文单词（连续字母数字，至少2个字符）
    const latinPattern = /[a-z0-9]{2,}/g;
    let match;
    while ((match = latinPattern.exec(raw)) !== null) {
        const token = match[0];
        if (!STOP_WORDS.has(token) && token.length >= 2) {
            tokens.push(token);
        }
    }

    // 2. 提取中文片段（连续汉字）
    const chinesePattern = /[\u4e00-\u9fa5]+/g;
    while ((match = chinesePattern.exec(raw)) !== null) {
        const segment = match[0];
        // 先尝试完整词（≥2 字且非停用词）
        if (segment.length >= 2 && segment.length <= 6 && !STOP_WORDS.has(segment)) {
            tokens.push(segment);
        }
        // bigram 切分
        for (let i = 0; i < segment.length - 1; i++) {
            const bigram = segment.slice(i, i + 2);
            if (!STOP_WORDS.has(bigram)) {
                tokens.push(bigram);
            }
        }
        // trigram 切分（对长段有用）
        if (segment.length >= 5) {
            for (let i = 0; i < segment.length - 2; i++) {
                const trigram = segment.slice(i, i + 3);
                if (!STOP_WORDS.has(trigram)) {
                    tokens.push(trigram);
                }
            }
        }
    }

    // 3. 去重并限制数量
    const unique = [...new Set(tokens)];
    return unique.slice(0, 48);
}

// ======================== BM25 评分引擎 ========================
/**
 * 从数据库抽样获取文档集合统计信息
 * 用于计算 IDF（逆文档频率）
 */
class CorpusStats {
    constructor() {
        this.docCount = 0;
        this.avgDocLength = 0;
        this.idfCache = new Map(); // token → idf
        this.docFreq = new Map(); // token → 包含该token的文档数
        this.ready = false;
    }

    async build(pool, force = false) {
        if (this.ready && !force) return;

        try {
            // 获取活跃文档数量和平均chunk长度
            const [[countRow]] = await pool.query(
                "SELECT COUNT(*) AS cnt, AVG(CHAR_LENGTH(chunk_text)) AS avg_len FROM rag_chunks WHERE is_active = 1"
            );
            this.docCount = Number(countRow.cnt || 0);
            this.avgDocLength = Number(countRow.avg_len || 200);

            if (this.docCount === 0) {
                this.ready = true;
                return;
            }

            // 抽样计算文档频率（最多5000条防止性能问题）
            const sampleSize = Math.min(this.docCount, 5000);
            const [samples] = await pool.query(
                "SELECT chunk_text FROM rag_chunks WHERE is_active = 1 ORDER BY RAND() LIMIT ?",
                [sampleSize]
            );

            // 统计每个 token 出现在多少文档中
            for (const row of samples) {
                const chunkTokens = new Set(tokenize(row.chunk_text));
                for (const token of chunkTokens) {
                    this.docFreq.set(token, (this.docFreq.get(token) || 0) + 1);
                }
            }

            // 计算 IDF
            for (const [token, df] of this.docFreq) {
                // IDF = log((N - df + 0.5) / (df + 0.5))
                this.idfCache.set(token, Math.log((this.docCount - df + 0.5) / (df + 0.5) + 1));
            }

            this.ready = true;
        } catch (error) {
            console.warn("构建语料统计失败:", error.message);
            this.ready = false;
        }
    }

    getIdf(token) {
        if (this.idfCache.has(token)) return this.idfCache.get(token);
        // 未出现的 token 给一个较低的默认 IDF
        return Math.log((this.docCount + 1) / 1);
    }
}

/**
 * BM25 单文档评分
 * @param {string[]} queryTokens - 查询 token 列表
 * @param {string[]} docTokens - 文档 token 列表
 * @param {number} docLength - 文档长度（字符数）
 * @param {CorpusStats} stats - 语料统计
 */
function bm25Score(queryTokens, docTokens, docLength, stats) {
    if (!stats.ready || !queryTokens.length || !docTokens.length) return 0;

    const docTermFreq = new Map();
    for (const t of docTokens) {
        docTermFreq.set(t, (docTermFreq.get(t) || 0) + 1);
    }

    let score = 0;
    const docLenNorm = docLength / Math.max(stats.avgDocLength, 1);

    for (const qt of queryTokens) {
        const tf = docTermFreq.get(qt) || 0;
        if (tf === 0) continue;

        const idf = stats.getIdf(qt);
        const numerator = tf * (BM25_K1 + 1);
        const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * docLenNorm);
        score += (idf * numerator) / denominator;
    }

    return score;
}

/**
 * 综合评分：BM25 + 精确匹配加分 + 质量分
 */
function scoreChunkEnhanced(chunk, query, queryTokens, stats) {
    const chunkText = String(chunk.chunk_text || "");
    const knowledgePoint = String(chunk.knowledge_point || "");
    const course = String(chunk.course || "");
    const combinedText = `${chunkText} ${knowledgePoint} ${course}`;

    const docTokens = tokenize(combinedText);
    const docLength = combinedText.length;

    // 1. BM25 主分（权重 0.65）
    const bm25 = bm25Score(queryTokens, docTokens, docLength, stats);
    const bm25Norm = Math.tanh(bm25 / 3); // 归一化到 [0, 1)

    // 2. 精确匹配加分（权重 0.20）
    const queryLower = String(query || "").toLowerCase();
    let exactBonus = 0;
    if (queryLower && combinedText.toLowerCase().includes(queryLower)) {
        exactBonus = 0.2;
    }
    // 知识点名精确匹配
    if (queryLower && knowledgePoint.toLowerCase().includes(queryLower)) {
        exactBonus += 0.08;
    }

    // 3. 质量分（权重 0.12）
    const qualityBonus = (Number(chunk.quality_score || 0) / 10) * 0.12;

    // 4. 标题匹配加分（权重 0.03）
    const title = String(chunk.title || "").toLowerCase();
    let titleBonus = 0;
    if (queryLower && title.includes(queryLower)) {
        titleBonus = 0.03;
    }

    // 合成最终分（乘以10放大便于过滤和排序）
    const finalScore = (bm25Norm * 0.65 + exactBonus + qualityBonus + titleBonus) * 10;

    return Number(finalScore.toFixed(4));
}

// ======================== 答案生成 ========================
function buildAnswer(query, evidenceChain) {
    if (!evidenceChain.length) {
        return [
            "当前知识库没有检索到足够证据。",
            '建议：1) 尝试使用更具体的关键词；2) 点击"开源资料卡片"生成落地任务，系统会抓取公开资料入库后再回答。'
        ].join("\n");
    }

    const top = evidenceChain[0];
    const themes = [...new Set(evidenceChain.map(ev => ev.knowledgePoint).filter(Boolean))].slice(0, 4).join("、");

    const sourceList = evidenceChain
        .map((ev, index) => {
            const relevancePct = Math.round((ev.relevance || 1) * 100);
            return `[${index + 1}] ${ev.title} — ${ev.source.name}（相关性 ${relevancePct}%）`;
        })
        .join("\n");

    return [
        `关于「${query}」，知识库检索到相关知识点：${themes || top.knowledgePoint}。`,
        "",
        "💡 学习路径建议：",
        `1. 先掌握基础概念「${themes.split("、")[0] || top.knowledgePoint}」的核心定义`,
        "2. 结合练习题检验理解程度",
        "3. 利用间隔复习巩固长期记忆",
        "",
        "📚 参考资料：",
        sourceList
    ].join("\n");
}

// ======================== 搜索服务类 ========================
class RagSearchService {
    constructor(pool) {
        this.pool = pool;
        this.stats = new CorpusStats();
        this.statsBuiltForPool = false;
    }

    async ensureData({ sourceName = null } = {}) {
        await ensureRagData(this.pool);
        if (sourceName) {
            await ingestPublicSources(this.pool, { sourceName, limit: 2 });
        }
    }

    async search({ query, subject = "all", sourceName = null, userId = null, limit = 5 }) {
        await this.ensureData({ sourceName });

        // 构建语料统计（首次或定期重建）
        if (!this.statsBuiltForPool) {
            await this.stats.build(this.pool);
            this.statsBuiltForPool = true;
        }

        const queryTokens = tokenize(query);
        if (!queryTokens.length) {
            return {
                answer: "请提供更具体的问题描述。",
                citations: [],
                evidenceChain: [],
                hitCount: 0,
                queryId: `q_${Date.now()}`,
                tokens: [],
                addToLearningList: false
            };
        }

        // 查询候选 chunks
        const params = [];
        let whereClause = 'WHERE c.is_active = 1 AND s.approved = "Y"';
        if (subject && subject !== "all") {
            whereClause += " AND (c.subject = ? OR c.course = ? OR c.knowledge_point LIKE ?)";
            params.push(subject, subject, `%${subject}%`);
        }
        if (sourceName) {
            whereClause += " AND (s.source_name LIKE ? OR c.course LIKE ? OR c.knowledge_point LIKE ?)";
            params.push(`%${sourceName}%`, `%${sourceName}%`, `%${sourceName}%`);
        }

        // 先用关键词预过滤（取每个 query token 做 LIKE 匹配的并集）
        const keywordConditions = queryTokens
            .slice(0, 6)
            .map(() => "(c.chunk_text LIKE ? OR c.knowledge_point LIKE ? OR c.course LIKE ?)")
            .join(" OR ");
        if (keywordConditions) {
            whereClause += ` AND (${keywordConditions})`;
            for (const token of queryTokens.slice(0, 6)) {
                params.push(`%${token}%`, `%${token}%`, `%${token}%`);
            }
        }

        const [rows] = await this.pool.query(
            `SELECT c.chunk_id, c.doc_id, c.chunk_text, c.subject, c.course, c.knowledge_point,
                    c.quality_score, c.created_at,
                    d.title, d.url, d.source_id, d.chapter,
                    s.source_name, s.base_url, s.license_type
             FROM rag_chunks c
             JOIN rag_documents d ON d.doc_id = c.doc_id
             JOIN rag_sources s ON s.source_id = d.source_id
             ${whereClause}
             ORDER BY c.created_at DESC
             LIMIT 300`,
            params
        );

        // BM25 评分 + 排序
        const ranked = rows
            .map(row => ({
                ...row,
                score: scoreChunkEnhanced(row, query, queryTokens, this.stats)
            }))
            .filter(row => row.score > 0.3)
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.max(1, Number(limit || 5)));

        // 记录查询日志
        if (userId) {
            await this.pool
                .query("INSERT INTO rag_query_logs (user_id, query_text, subject, hit_count) VALUES (?, ?, ?, ?)", [
                    userId,
                    query,
                    subject || "all",
                    ranked.length
                ])
                .catch(() => {});
        }

        const evidenceChain = ranked.map((item, index) => ({
            id: `ev_${Date.now()}_${index}`,
            rank: index + 1,
            chunkId: item.chunk_id,
            docId: item.doc_id,
            title: item.title || item.knowledge_point,
            url: item.url || "",
            course: item.course,
            knowledgePoint: item.knowledge_point,
            snippet: String(item.chunk_text || "").slice(0, 300),
            score: item.score,
            relevance: Math.min(1, Number((item.score / 8).toFixed(2))),
            source: {
                id: item.source_id,
                name: item.source_name,
                url: item.base_url,
                license: item.license_type
            },
            createdAt: item.created_at
        }));

        // 构建可添加到学习列表的动作数据
        const topKnowledgePoints = [...new Set(evidenceChain.map(ev => ev.knowledgePoint).filter(Boolean))].slice(0, 5);

        return {
            answer: buildAnswer(query, evidenceChain),
            citations: evidenceChain,
            evidenceChain,
            hitCount: evidenceChain.length,
            queryId: `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            tokens: queryTokens.slice(0, 16),
            // 可添加到学习列表的知识点
            addToLearningList: evidenceChain.length > 0,
            suggestedNodes: topKnowledgePoints.map(kp => ({
                name: kp,
                source: "rag_search",
                queryContext: query
            }))
        };
    }

    /**
     * 重建语料统计（外部调用，例如新增大量文档后）
     */
    async rebuildStats() {
        this.stats = new CorpusStats();
        await this.stats.build(this.pool, true);
        this.statsBuiltForPool = true;
    }
}

/**
 * 混合搜索：BM25 + 向量检索
 * 需要 Embedding 服务和 ChromaDB 可用时激活
 */
RagSearchService.prototype.hybridSearch = async function ({
    query,
    subject = "all",
    sourceName = null,
    userId = null,
    limit = 5
}) {
    // 先运行 BM25 搜索获取基线结果
    const bm25Result = await this.search({ query, subject, sourceName, userId, limit: Math.max(limit, 10) });

    // 尝试向量检索
    let vectorResults = [];
    try {
        const EmbeddingService = require("./EmbeddingService");
        const ChromaClient = require("./ChromaClient");

        const embedding = new EmbeddingService();
        const chroma = new ChromaClient();

        const queryVec = await embedding.embed(query);
        const isZeroVec = queryVec.every(v => v === 0);

        if (!isZeroVec) {
            vectorResults = await chroma.query(queryVec, Math.max(limit, 5));
        }
    } catch (error) {
        console.warn("向量检索不可用，仅使用 BM25:", error.message);
    }

    // 融合 BM25 和向量结果
    if (vectorResults.length === 0) {
        return { ...bm25Result, searchMode: "bm25_only" };
    }

    // 将向量结果与 BM25 结果合并去重
    const mergedMap = new Map();

    // BM25 结果先入库
    for (const ev of bm25Result.evidenceChain) {
        mergedMap.set(ev.chunkId, { ...ev, retrievalMode: "bm25", vectorScore: 0 });
    }

    // 向量结果：尝试匹配到已有 chunk（通过 chunk_id 在 metadata 中）
    for (const vr of vectorResults) {
        const chunkId = vr.metadata?.chunk_id || vr.id;
        if (mergedMap.has(chunkId)) {
            mergedMap.get(chunkId).vectorScore = vr.similarity;
            mergedMap.get(chunkId).retrievalMode = "hybrid";
        } else {
            // 新结果，构建最小 evidence
            mergedMap.set(vr.id, {
                id: `ve_${Date.now()}`,
                chunkId: vr.id,
                snippet: (vr.document || "").slice(0, 300),
                score: vr.similarity * 5, // 归一化到 BM25 分数范围
                vectorScore: vr.similarity,
                relevance: vr.similarity,
                source: { name: "Vector Search", url: "", license: "N/A" },
                sourceTag: "vector"
            });
        }
    }

    // 按综合分排序
    const merged = [...mergedMap.values()]
        .map(ev => ({
            ...ev,
            combinedScore: (ev.score || 0) + (ev.vectorScore || 0) * 3
        }))
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, limit);

    return {
        ...bm25Result,
        evidenceChain: merged,
        citations: merged,
        hitCount: merged.length,
        searchMode: "hybrid",
        searchBreakdown: {
            bm25Count: bm25Result.hitCount,
            vectorCount: vectorResults.length,
            mergedCount: merged.length
        }
    };
};

module.exports = RagSearchService;
