const axios = require("axios");
const config = require("../../config");
const LocalLlmClient = require("./LocalLlmClient");

class LlmGateway {
    constructor(options = {}) {
        this.config = options.config || config;
        // 自动检测：如果明确配置了 herdsman 模型名，优先使用 herdsman
        this._useHerdsman = Boolean(
            this.config.llm.herdsman?.model && this.config.llm.herdsman.model !== "local-model"
        );
        const llmConfig = this._useHerdsman ? { ...this.config.llm.herdsman } : { ...this.config.llm.local };
        this.localClient = new LocalLlmClient(llmConfig);
    }

    get provider() {
        return this._useHerdsman ? "herdsman" : this.config.llm.provider || "local";
    }

    async chat({ messages, temperature, maxTokens, fallbackContent = "" } = {}) {
        try {
            if (this.provider === "spark") {
                return await this.chatSpark({ messages, temperature, maxTokens });
            }
            return await this.localClient.chat({ messages, temperature, maxTokens });
        } catch (error) {
            if (this.config.llm.allowSparkFallback && this.provider !== "spark") {
                try {
                    return await this.chatSpark({ messages, temperature, maxTokens });
                } catch (sparkError) {
                    if (fallbackContent) {
                        return { provider: "fallback", content: fallbackContent, error: sparkError.message };
                    }
                    throw sparkError;
                }
            }
            if (fallbackContent) {
                return { provider: "fallback", content: fallbackContent, error: error.message };
            }
            throw error;
        }
    }

    async chatText(options = {}) {
        const result = await this.chat(options);
        return result.content || "";
    }

    async chatSpark({ messages, temperature, maxTokens } = {}) {
        const authToken = this.config.search.apiPassword || this.config.spark.apiKeySecret;
        if (!authToken) throw new Error("未配置 Spark APIPassword");

        const response = await axios.post(
            this.config.spark.httpApi,
            {
                model: this.config.spark.model || "lite",
                messages,
                stream: false,
                temperature: Number(temperature ?? 0.65),
                max_tokens: Number(maxTokens || 2048)
            },
            {
                timeout: Number(this.config.llm.local.timeoutMs || 60000),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`
                }
            }
        );

        return {
            provider: "spark",
            model: this.config.spark.model,
            content:
                response.data?.choices?.[0]?.message?.content ||
                response.data?.choices?.[0]?.delta?.content ||
                response.data?.content ||
                "",
            raw: response.data
        };
    }

    async health() {
        if (this.provider === "spark") {
            return {
                ok: Boolean(this.config.search.apiPassword || this.config.spark.apiKeySecret),
                provider: "spark",
                model: this.config.spark.model,
                endpoint: this.config.spark.httpApi
            };
        }
        return this.localClient.health();
    }
}

module.exports = new LlmGateway();
module.exports.LlmGateway = LlmGateway;
