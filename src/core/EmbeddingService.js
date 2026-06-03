// core/EmbeddingService.js
// 文本向量化服务 — 对接 text2vec-base-chinese 等 Embedding 模型
// 通过 Ollama OpenAI-compatible API 或自定义 HTTP 端点
const axios = require('axios');
const config = require('../config');

class EmbeddingService {
    constructor() {
        this.baseUrl = config.embedding.local.baseUrl.replace(/\/+$/, '');
        this.model = config.embedding.local.model;
        this.apiKey = config.embedding.local.apiKey;
        this.timeoutMs = config.embedding.local.timeoutMs;
        this.dimensions = config.embedding.local.dimensions;
        this.ready = false;
    }

    async health() {
        try {
            const response = await axios.get(`${this.baseUrl}/models`, {
                timeout: 5000,
                headers: this.apiKey && this.apiKey !== 'local'
                    ? { Authorization: `Bearer ${this.apiKey}` }
                    : {}
            });
            this.ready = true;
            return { ok: true, model: this.model, baseUrl: this.baseUrl };
        } catch (error) {
            this.ready = false;
            return { ok: false, error: error.message };
        }
    }

    /**
     * 将单个文本转为向量
     */
    async embed(text) {
        if (!text || !String(text).trim()) {
            return new Array(this.dimensions).fill(0);
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/embeddings`,
                {
                    model: this.model,
                    input: String(text).trim()
                },
                {
                    timeout: this.timeoutMs,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.apiKey && this.apiKey !== 'local'
                            ? { Authorization: `Bearer ${this.apiKey}` }
                            : {})
                    }
                }
            );

            const embedding = response.data?.data?.[0]?.embedding;
            if (embedding && Array.isArray(embedding)) {
                this.ready = true;
                return embedding;
            }
            throw new Error('无效的 Embedding 响应格式');
        } catch (error) {
            this.ready = false;
            console.warn('Embedding 请求失败:', error.message);
            // 返回零向量作为 fallback（不会被匹配到）
            return new Array(this.dimensions).fill(0);
        }
    }

    /**
     * 批量文本向量化
     */
    async embedBatch(texts, batchSize = 10) {
        const results = [];
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const embeddings = await Promise.all(batch.map(t => this.embed(t)));
            results.push(...embeddings);
        }
        return results;
    }

    /**
     * 计算两个向量的余弦相似度
     */
    static cosineSimilarity(a, b) {
        if (!a || !b || a.length !== b.length) return 0;
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

module.exports = EmbeddingService;
