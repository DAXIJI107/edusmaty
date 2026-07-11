/**
 * 讯飞星火连通性验证
 * 用法：node scripts/test-spark.js
 */
require("dotenv").config();
const llmGateway = require("../src/core/llm/LlmGateway");
const config = require("../src/config");

async function main() {
    const token = config.search.apiPassword || config.spark.apiKeySecret;
    console.log("== Spark Config ==");
    console.log({
        provider: config.llm.provider,
        allowSparkFallback: config.llm.allowSparkFallback,
        model: config.spark.model,
        httpApi: config.spark.httpApi,
        hasToken: Boolean(token),
        tokenFormatOk: Boolean(token && token.includes(":")),
        appId: config.spark.appId ? "(set)" : "(empty)"
    });

    if (!token) {
        console.error("\nFAIL: 未配置 SPARK_API_KEY_SECRET 或 SEARCH_API_PASSWORD");
        console.error("格式: {APIKey}:{APISecret}");
        process.exit(1);
    }

    console.log("\n== Calling Spark chat ==");
    const result = await llmGateway.chat({
        messages: [
            { role: "system", content: "你是 EduSmart 学习助手，请用一句话中文回答。" },
            { role: "user", content: "用一句话解释什么是哈希表。" }
        ],
        temperature: 0.3,
        maxTokens: 200
    });

    console.log({
        provider: result.provider,
        model: result.model,
        contentPreview: String(result.content || "").slice(0, 200),
        usage: result.usage || null
    });

    if (!result.content) {
        console.error("\nFAIL: 星火返回空内容");
        process.exit(1);
    }
    if (result.provider !== "spark") {
        console.error(`\nFAIL: 期望 provider=spark，实际=${result.provider}`);
        process.exit(1);
    }
    console.log("\nSPARK OK");
}

main().catch(err => {
    console.error("\nSPARK FAIL:", err.response?.data || err.message);
    process.exit(1);
});
