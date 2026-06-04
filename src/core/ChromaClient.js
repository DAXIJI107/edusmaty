// core/ChromaClient.js
// ChromaDB 向量数据库客户端 — HTTP API 封装
// 用于存储和检索文本 Embedding 向量
const axios = require("axios");
const config = require("../config");

class ChromaClient {
    constructor() {
        this.baseUrl = config.chroma.url.replace(/\/+$/, "");
        this.collectionName = config.chroma.collectionName;
        this.timeoutMs = config.chroma.timeoutMs;
        this.collectionId = null;
        this.ready = false;
    }

    async health() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/v2/heartbeat`, {
                timeout: 5000
            });
            this.ready = true;
            return { ok: true, baseUrl: this.baseUrl };
        } catch (error) {
            this.ready = false;
            return { ok: false, error: error.message };
        }
    }

    /**
     * 获取或创建集合
     */
    async getOrCreateCollection() {
        try {
            // 先尝试列出已有集合
            const listResp = await axios.get(`${this.baseUrl}/api/v2/collections`, {
                timeout: this.timeoutMs
            });
            const collections = listResp.data || [];
            const existing = collections.find(c => c.name === this.collectionName);

            if (existing) {
                this.collectionId = existing.id;
                return existing;
            }

            // 创建新集合
            const createResp = await axios.post(
                `${this.baseUrl}/api/v2/collections`,
                {
                    name: this.collectionName,
                    metadata: { description: "EduSmart RAG knowledge base" }
                },
                { timeout: this.timeoutMs, headers: { "Content-Type": "application/json" } }
            );
            this.collectionId = createResp.data?.id;
            this.ready = true;
            return createResp.data;
        } catch (error) {
            console.warn("ChromaDB 集合操作失败:", error.message);
            return null;
        }
    }

    /**
     * 添加向量到集合
     * @param {Array<{id:string, embedding:number[], metadata:object, document:string}>} items
     */
    async add(items) {
        if (!this.collectionId) await this.getOrCreateCollection();
        if (!this.collectionId || !items.length) return 0;

        try {
            const ids = items.map(i => i.id);
            const embeddings = items.map(i => i.embedding);
            const metadatas = items.map(i => i.metadata || {});
            const documents = items.map(i => i.document || "");

            await axios.post(
                `${this.baseUrl}/api/v2/collections/${this.collectionId}/add`,
                { ids, embeddings, metadatas, documents },
                { timeout: this.timeoutMs * 2, headers: { "Content-Type": "application/json" } }
            );
            return items.length;
        } catch (error) {
            console.warn("ChromaDB add 失败:", error.message);
            return 0;
        }
    }

    /**
     * 向量相似度查询
     * @param {number[]} queryEmbedding - 查询向量
     * @param {number} nResults - 返回数量
     * @param {object} whereFilter - 元数据过滤条件
     */
    async query(queryEmbedding, nResults = 5, whereFilter = null) {
        if (!this.collectionId) await this.getOrCreateCollection();
        if (!this.collectionId) return [];

        try {
            const body = {
                query_embeddings: [queryEmbedding],
                n_results: nResults,
                include: ["documents", "metadatas", "distances"]
            };
            if (whereFilter) {
                body.where = whereFilter;
            }

            const response = await axios.post(`${this.baseUrl}/api/v2/collections/${this.collectionId}/query`, body, {
                timeout: this.timeoutMs,
                headers: { "Content-Type": "application/json" }
            });

            const data = response.data;
            if (!data?.ids?.[0]) return [];

            const results = [];
            for (let i = 0; i < data.ids[0].length; i++) {
                results.push({
                    id: data.ids[0][i],
                    document: data.documents?.[0]?.[i] || "",
                    metadata: data.metadatas?.[0]?.[i] || {},
                    distance: data.distances?.[0]?.[i] ?? 1,
                    similarity: 1 - (data.distances?.[0]?.[i] ?? 1) // 距离转相似度
                });
            }
            return results;
        } catch (error) {
            console.warn("ChromaDB query 失败:", error.message);
            return [];
        }
    }

    /**
     * 删除指定 ID 的向量
     */
    async delete(ids) {
        if (!this.collectionId) return 0;
        try {
            await axios.post(
                `${this.baseUrl}/api/v2/collections/${this.collectionId}/delete`,
                { ids: Array.isArray(ids) ? ids : [ids] },
                { timeout: this.timeoutMs, headers: { "Content-Type": "application/json" } }
            );
            return Array.isArray(ids) ? ids.length : 1;
        } catch (error) {
            console.warn("ChromaDB delete 失败:", error.message);
            return 0;
        }
    }

    /**
     * 获取集合中的向量数量
     */
    async count() {
        if (!this.collectionId) await this.getOrCreateCollection();
        if (!this.collectionId) return 0;
        try {
            const resp = await axios.get(`${this.baseUrl}/api/v2/collections/${this.collectionId}`, {
                timeout: this.timeoutMs
            });
            return resp.data?.count || 0;
        } catch (error) {
            return 0;
        }
    }
}

module.exports = ChromaClient;
