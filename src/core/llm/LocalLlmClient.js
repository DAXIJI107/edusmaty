const axios = require("axios");

function normalizeBaseUrl(baseUrl) {
    return String(baseUrl || "").replace(/\/+$/, "");
}

class LocalLlmClient {
    constructor(options = {}) {
        this.baseUrl = normalizeBaseUrl(options.baseUrl || "http://127.0.0.1:8080/v1");
        this.model = options.model || "local-model";
        this.apiKey = options.apiKey || "local";
        this.timeoutMs = Number(options.timeoutMs || 60000);
        this.maxTokens = Number(options.maxTokens || 2048);
        this.temperature = Number(options.temperature ?? 0.4);
    }

    async chat({ messages, temperature, maxTokens, stream = false } = {}) {
        if (!Array.isArray(messages) || !messages.length) {
            throw new Error("messages 参数缺失或格式错误");
        }

        const response = await axios.post(
            `${this.baseUrl}/chat/completions`,
            {
                model: this.model,
                messages,
                stream,
                temperature: Number(temperature ?? this.temperature),
                max_tokens: Number(maxTokens || this.maxTokens)
            },
            {
                timeout: this.timeoutMs,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`
                }
            }
        );

        const content =
            response.data?.choices?.[0]?.message?.content ||
            response.data?.choices?.[0]?.delta?.content ||
            response.data?.content ||
            "";

        return {
            provider: "local",
            model: this.model,
            content,
            raw: response.data
        };
    }

    async health() {
        try {
            const response = await axios.get(`${this.baseUrl}/models`, {
                timeout: Math.min(this.timeoutMs, 5000),
                headers: { Authorization: `Bearer ${this.apiKey}` }
            });
            return { ok: true, provider: "local", model: this.model, data: response.data };
        } catch (error) {
            return { ok: false, provider: "local", model: this.model, error: error.message };
        }
    }
}

module.exports = LocalLlmClient;
