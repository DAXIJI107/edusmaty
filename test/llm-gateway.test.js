const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const axios = require("axios");

const { LlmGateway } = require("../src/core/llm/LlmGateway");
const aiInteractionStore = require("../src/core/llm/AiInteractionStore");

function buildConfig() {
    return {
        spark: {
            apiKeySecret: "test-token",
            httpApi: "https://spark-api-open.xf-yun.com/v1/chat/completions",
            model: "lite"
        },
        search: { apiPassword: "" },
        llm: {
            provider: "spark",
            allowSparkFallback: false,
            local: {
                baseUrl: "http://127.0.0.1:8080/v1",
                model: "local-test",
                apiKey: "local",
                timeoutMs: 5000,
                maxTokens: 256,
                temperature: 0.4
            },
            herdsman: {}
        }
    };
}

test("LlmGateway sends chat requests to Spark and records structured question logs", async t => {
    const previousPost = axios.post;
    const previousLogFile = process.env.AI_QUESTION_LOG_FILE;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "edusmart-ai-log-"));
    const logFile = path.join(tempDir, "questions.jsonl");

    process.env.AI_QUESTION_LOG_FILE = logFile;
    t.after(() => {
        axios.post = previousPost;
        if (previousLogFile === undefined) delete process.env.AI_QUESTION_LOG_FILE;
        else process.env.AI_QUESTION_LOG_FILE = previousLogFile;
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    let posted;
    axios.post = async (url, body, options) => {
        posted = { url, body, options };
        return {
            data: {
                choices: [{ message: { content: "递归是函数把大问题拆成同类小问题，直到遇到停止条件。" } }],
                usage: { prompt_tokens: 12, completion_tokens: 18, total_tokens: 30 }
            }
        };
    };

    const gateway = new LlmGateway({ config: buildConfig() });
    const result = await gateway.chat({
        messages: [{ role: "user", content: "请解释递归" }],
        temperature: 0.2,
        maxTokens: 120
    });

    assert.equal(result.provider, "spark");
    assert.equal(result.model, "lite");
    assert.equal(result.content, "递归是函数把大问题拆成同类小问题，直到遇到停止条件。");
    assert.equal(posted.url, "https://spark-api-open.xf-yun.com/v1/chat/completions");
    assert.equal(posted.body.model, "lite");
    assert.deepEqual(posted.body.messages, [{ role: "user", content: "请解释递归" }]);
    assert.equal(posted.body.stream, false);
    assert.equal(posted.options.headers.Authorization, "Bearer test-token");

    const { file, items } = aiInteractionStore.readRecent(1);
    assert.equal(file, logFile);
    assert.equal(items.length, 1);
    assert.equal(items[0].provider, "spark");
    assert.equal(items[0].model, "lite");
    assert.equal(items[0].status, "success");
    assert.equal(items[0].question, "请解释递归");
    assert.equal(items[0].answer, "递归是函数把大问题拆成同类小问题，直到遇到停止条件。");
    assert.equal(items[0].usage.total_tokens, 30);
});
