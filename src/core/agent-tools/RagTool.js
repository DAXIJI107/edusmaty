const RagSearchService = require("../RagSearchService");

class RagTool {
    constructor(pool) {
        this.pool = pool;
        this.searchService = new RagSearchService(pool);
    }

    async run({ query, subject = "all", sourceName = null, userId = null }) {
        const result = await this.searchService.hybridSearch({
            query,
            subject,
            sourceName,
            userId,
            limit: 5
        });
        return {
            ...result,
            provider: "edusmart_hybrid_rag",
            fallbackUsed: result.searchMode !== "hybrid",
            evidenceCount: result.hitCount,
            summary: result.hitCount
                ? `已从 ${result.hitCount} 条公开资料/平台知识片段中找到证据，最高相关来源为 ${result.citations[0].source.name}。`
                : "没有检索到足够证据，建议先抓取公开资料或补充课程材料。"
        };
    }
}

module.exports = RagTool;
