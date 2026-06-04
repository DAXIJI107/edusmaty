const { ingestPublicSources } = require("../PublicRagIngestor");

class PublicSourceTool {
    constructor(pool) {
        this.pool = pool;
    }

    async run({ sourceName = "all", limit = 2 } = {}) {
        const result = await ingestPublicSources(this.pool, { sourceName, limit });
        return {
            ...result,
            summary: `公开资料入库完成：${result.sourceCount} 个来源、${result.documentCount} 篇文档、${result.chunkCount} 个检索片段。`
        };
    }
}

module.exports = PublicSourceTool;
