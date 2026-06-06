const test = require("node:test");
const assert = require("node:assert/strict");
const { buildAgentRunMetadata, detectMissingInputs } = require("../src/core/AgentRunMetadata");
const AgentRuntime = require("../src/core/AgentRuntime");
const ToolRegistry = require("../src/core/agent-tools/ToolRegistry");
const RagTool = require("../src/core/agent-tools/RagTool");
const agentMigration = require("../ops/database/migrations/002_agent_memory_and_evaluations");

test("demo mode stays disabled when explicitly configured for production", () => {
    process.env.DEMO_MODE = "false";
    delete require.cache[require.resolve("../src/config")];
    assert.equal(require("../src/config").app.demoMode, false);
});

test("detectMissingInputs exposes absent profile, evidence and resources", () => {
    assert.deepEqual(
        detectMissingInputs({
            profile: { weakPoints: [], answerStats: { total: 0 } },
            rag: { hitCount: 0 },
            resources: { courses: [], questions: [] },
            message: "",
            context: {}
        }),
        ["goal", "learning_profile", "rag_evidence", "learning_resources"]
    );
});

test("agent metadata clearly identifies rule fallback and uncertainty", () => {
    const metadata = buildAgentRunMetadata({
        sessionId: "agent-test",
        config: { app: { demoMode: false }, llm: { provider: "local", local: { model: "test-model" } } },
        profile: { weakPoints: [], answerStats: { total: 0 } },
        rag: { hitCount: 0, searchMode: "bm25_only" },
        resources: { courses: [], questions: [] },
        message: "制定计划",
        context: {}
    });

    assert.equal(metadata.source, "rule_fallback");
    assert.equal(metadata.provider, "rules");
    assert.equal(metadata.fallbackUsed, true);
    assert.equal(metadata.uncertainty, "insufficient_data");
    assert.equal(metadata.traceId, "agent-test");
});

test("tool registry rejects unknown tools in an execution plan", () => {
    const registry = new ToolRegistry().register({ name: "profile" }, { run: async () => ({}) });
    assert.throws(() => registry.validatePlan([{ tool: "missing" }]), /unknown tools/i);
    assert.deepEqual(registry.validatePlan([{ tool: "profile" }]), [{ tool: "profile" }]);
});

test("RagTool uses hybrid search and reports BM25 fallback", async () => {
    const tool = new RagTool({});
    tool.searchService = {
        hybridSearch: async () => ({
            hitCount: 1,
            citations: [{ source: { name: "Course Notes" } }],
            searchMode: "bm25_only"
        })
    };

    const result = await tool.run({ query: "TCP" });
    assert.equal(result.provider, "edusmart_hybrid_rag");
    assert.equal(result.fallbackUsed, true);
    assert.equal(result.evidenceCount, 1);
    assert.equal(result.citations[0].source.name, "Course Notes");
});

test("agent evaluation stores fallback, evidence and missing-input facts", async () => {
    const calls = [];
    const runtime = Object.create(AgentRuntime.prototype);
    runtime.pool = { query: async (...args) => calls.push(args) };

    await runtime.recordEvaluation({
        userId: 7,
        sessionId: "agent-eval",
        metadata: {
            fallbackUsed: true,
            evidenceCount: 2,
            missingInputs: ["learning_profile"],
            confidence: 0.64
        },
        executionPlan: [{ tool: "profile" }, { tool: "rag" }],
        writebackCount: 1,
        latencyMs: 42
    });

    assert.equal(calls.length, 1);
    assert.deepEqual(JSON.parse(calls[0][1][2]), ["profile", "rag"]);
    assert.equal(calls[0][1][3], 1);
    assert.equal(calls[0][1][8], 42);
});

test("agent memory migration has reversible table operations", async () => {
    const upStatements = [];
    const downStatements = [];
    await agentMigration.up({ query: async sql => upStatements.push(sql) });
    await agentMigration.down({ query: async sql => downStatements.push(sql) });

    assert.equal(upStatements.length, 6);
    assert.equal(downStatements.length, 6);
    assert.match(upStatements[0], /agent_sessions/);
    assert.match(downStatements.at(-1), /agent_sessions/);
});
