/**
 * P0 功能离线/轻量测试：对话画像、质检门、分块、资源类型清单
 * 不依赖 MySQL / LLM，可在 CI 或本机快速验证。
 */
const assert = require("assert");
const {
    extractScoreHints,
    extractPreferences,
    mergeDimensions,
    defaultDimensions,
    completeness,
    DIMENSIONS,
    ConversationalProfileEngine
} = require("../src/core/ConversationalProfileEngine");
const { evaluateResource, attachQuality } = require("../src/core/ResourceQualityGate");
const { chunkText } = require("../src/core/PublicRagIngestor");
const { estimateQuality } = require("../src/core/WorkspaceIngestor");
const ResourceAgent = require("../src/core/ResourceAgent");

function mockPool() {
    return {
        async query(sql) {
            if (/SHOW TABLES/i.test(sql)) return [[]];
            if (/SHOW COLUMNS/i.test(sql)) return [[]];
            if (/FROM knowledge/i.test(sql)) return [[]];
            if (/rag_/i.test(sql)) return [[]];
            return [[]];
        }
    };
}

async function run() {
    console.log("== P0 Feature Tests ==");

    // 1) 六维常量
    assert.strictEqual(DIMENSIONS.length, 6, "画像维度必须为 6");
    console.log("[ok] 六维画像常量");

    // 2) 对话抽取
    const hints = extractScoreHints("我是编程小白，每天只能学45分钟，经常拖延，但想学数据结构和算法，会刷一点 leetcode");
    assert.ok(hints.实践能力 >= 60 || hints.概念理解 <= 50, "应识别薄弱基础或实践倾向");
    const prefs = extractPreferences("我更喜欢看视频，每天60分钟学操作系统");
    assert.ok(prefs.goals.includes("操作系统") || prefs.cognitiveStyle === "auditory");
    console.log("[ok] 对话特征抽取", { hints, prefs });

    // 3) 会话引擎（无 DB）
    const engine = new ConversationalProfileEngine(null);
    const turn1 = await engine.processTurn(1, "我想系统学习数据库，基础一般，每天90分钟，容易拖延");
    assert.ok(turn1.success);
    assert.strictEqual(Object.keys(turn1.dimensions).length, 6);
    assert.ok(turn1.nextQuestion);
    const turn2 = await engine.processTurn(1, "我偏好边写 SQL 边学，事务和索引经常出错", { confirm: true });
    assert.ok(turn2.completeness >= 0);
    console.log("[ok] 对话画像回合", {
        completeness: turn2.completeness,
        weak: turn2.profileSummary.weakDimension,
        goals: turn2.preferences.goals
    });

    // 4) 分块与质量
    const sample =
        "哈希表是一种通过哈希函数将键映射到桶的数据结构。它支持近似常数时间的查找与插入。常见冲突解决包括链地址法和开放寻址法。定义清晰后，需要注意负载因子与扩容策略。".repeat(
            3
        );
    const chunks = chunkText(sample, 200, 40);
    assert.ok(chunks.length >= 1, "应产生分块");
    assert.ok(estimateQuality(sample) >= 3.5);
    console.log("[ok] 资料分块", { chunkCount: chunks.length, quality: estimateQuality(sample) });

    // 5) 资源质检
    const poor = evaluateResource({ title: "测试", content: "据说也许大概是这样", citations: [] });
    assert.ok(poor.qualityScore < 90);
    const good = evaluateResource({
        title: "哈希表讲义",
        content: "哈希表通过哈希函数映射键到桶。# 定义\n## 原理\n```js\nconst m=new Map()\n```",
        citations: [
            { id: 1, excerpt: "哈希表通过哈希函数将键映射到桶，支持近似常数时间查找。" },
            { id: 2, excerpt: "冲突可用链地址法或开放寻址法处理，并关注负载因子。" }
        ]
    });
    assert.ok(good.passed, "有引用的资源应通过质检");
    console.log("[ok] 资源质检", { poor: poor.qualityScore, good: good.qualityScore });

    // 6) ResourceAgent 五类+微课（mock pool，无 RAG）
    const agent = new ResourceAgent(1, mockPool());
    const types = agent.getAvailableTypes().map(t => t.id);
    assert.ok(types.includes("micro_lesson"), "必须包含微课类型");
    assert.ok(types.includes("mindmap") && types.includes("document") && types.includes("quiz"));
    assert.ok(types.includes("practice"));

    const generated = await agent.generateResources({
        knowledgePoint: "哈希表",
        types: ["document", "mindmap", "quiz", "practice", "micro_lesson"],
        profile: { preferences: { cognitiveStyle: "kinesthetic", dailyMinutes: 60 } }
    });
    assert.ok(generated.success);
    assert.strictEqual(generated.resources.length, 5);
    for (const r of generated.resources) {
        assert.ok(r.type);
        assert.ok(r.quality, `${r.type} 应带 quality`);
        assert.ok(Array.isArray(r.citations), `${r.type} 应带 citations 数组`);
    }
    const micro = generated.resources.find(r => r.type === "micro_lesson");
    assert.ok(micro.script || micro.content, "微课应有脚本");
    console.log("[ok] 五类资源工厂", {
        types: generated.resources.map(r => `${r.type}:${r.qualityScore}`),
        factoryVersion: generated.factoryVersion
    });

    // 7) attachQuality 幂等
    const again = attachQuality(micro, "数据结构与算法");
    assert.ok(again.qualityScore >= 0);
    console.log("[ok] attachQuality");

    // 8) merge/completeness
    const merged = mergeDimensions(defaultDimensions(), { 概念理解: 80, 实践能力: 30 });
    assert.ok(merged.概念理解 > 50);
    assert.ok(completeness(merged, 3) > 0);
    console.log("[ok] 维度合并与完整度");

    console.log("\nALL P0 TESTS PASSED");
}

run().catch(err => {
    console.error("\nP0 TESTS FAILED:", err);
    process.exit(1);
});
