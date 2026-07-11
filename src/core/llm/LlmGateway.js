const axios = require("axios");
const config = require("../../config");
const LocalLlmClient = require("./LocalLlmClient");
const aiInteractionStore = require("./AiInteractionStore");

class LlmGateway {
    constructor(options = {}) {
        this.config = options.config || config;
        this._explicitProvider = String(this.config.llm.provider || "").toLowerCase();
        // 自动检测：未显式指定 provider 时，如果明确配置了 herdsman 模型名，优先使用 herdsman
        this._useHerdsman = Boolean(
            !this._explicitProvider &&
            this.config.llm.herdsman?.model && this.config.llm.herdsman.model !== "local-model"
        );
        const llmConfig =
            this._explicitProvider === "herdsman" || this._useHerdsman
                ? { ...this.config.llm.herdsman }
                : { ...this.config.llm.local };
        this.localClient = new LocalLlmClient(llmConfig);
    }

    get provider() {
        if (this._explicitProvider) return this._explicitProvider;
        return this._useHerdsman ? "herdsman" : "local";
    }

    async chat({ messages, temperature, maxTokens, fallbackContent = "" } = {}) {
        const startedAt = Date.now();
        try {
            let result;
            if (this.provider === "spark") {
                result = await this.chatSpark({ messages, temperature, maxTokens });
            } else {
                result = await this.localClient.chat({ messages, temperature, maxTokens });
            }
            this.logInteraction({ messages, result, startedAt, status: "success" });
            return result;
        } catch (error) {
            if (this.config.llm.allowSparkFallback && this.provider !== "spark") {
                try {
                    const result = await this.chatSpark({ messages, temperature, maxTokens });
                    this.logInteraction({ messages, result, startedAt, status: "success" });
                    return result;
                } catch (sparkError) {
                    if (fallbackContent) {
                        const result = { provider: "fallback", content: fallbackContent, error: sparkError.message };
                        this.logInteraction({ messages, result, startedAt, status: "fallback", error: sparkError });
                        return result;
                    }
                    this.logInteraction({ messages, startedAt, status: "error", error: sparkError });
                    throw sparkError;
                }
            }
            if (fallbackContent) {
                const result = { provider: "fallback", content: fallbackContent, error: error.message };
                this.logInteraction({ messages, result, startedAt, status: "fallback", error });
                return result;
            }
            this.logInteraction({ messages, startedAt, status: "error", error });
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
            usage: response.data?.usage || null,
            raw: response.data
        };
    }

    logInteraction({ messages, result = {}, startedAt, status, error } = {}) {
        try {
            aiInteractionStore.append({
                provider: result.provider || this.provider,
                model: result.model || (this.provider === "spark" ? this.config.spark.model : this.localClient.model),
                status,
                durationMs: Date.now() - Number(startedAt || Date.now()),
                messages,
                answer: result.content || "",
                usage: result.usage || result.raw?.usage || null,
                error: error?.message || result.error || null
            });
        } catch (logError) {
            console.warn("AI问答日志写入失败:", logError.message);
        }
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
