/**
 * EduSmart 智能体功能演示脚本
 * 运行方式: node scripts/demo-agent.js
 */

const axios = require("axios").default;

const BASE_URL = "http://localhost:3020";

let authToken = "";

const apiClient = axios.create({
    baseURL: BASE_URL
});

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("========================================");
    console.log("🤖 EduSmart 智能体功能演示");
    console.log("========================================\n");

    // 首先登录获取会话
    console.log("【登录】获取会话凭证");
    console.log("────────────────────────────────────");
    try {
        const loginRes = await axios.post(
            `${BASE_URL}/api/auth/login`,
            {
                username: "zhangsan",
                password: "123456"
            },
            { withCredentials: true }
        );

        authToken = loginRes.data.token;
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

        console.log("✅ 登录成功");
        console.log("   - 用户:", loginRes.data.user?.username || loginRes.data.user?.name);
        console.log("   - 角色:", loginRes.data.user?.role);
        console.log("   - Token获取成功");
    } catch (e) {
        console.log("❌ 登录失败:", e.response?.data?.message || e.message);
        return;
    }

    // 演示步骤 1: 获取系统配置（从数据库读取，替代硬编码）
    console.log("\n【步骤 1】获取系统配置");
    console.log("────────────────────────────────────");
    try {
        const res = await apiClient.get("/api/config");
        console.log("✅ 成功获取配置");
        console.log("   - 配置项数量:", Object.keys(res.data.data).length);
        console.log("   - 导航配置:", res.data.data["navigation.items"] ? "✓" : "✗");
        console.log("   - Agent能力:", res.data.data["agent.capabilities"] ? "✓" : "✗");
        console.log("   - 学科列表:", res.data.data["subjects.default"] ? "✓" : "✗");
    } catch (e) {
        console.log("❌ 失败:", e.response?.data?.message || e.message);
    }
    await delay(500);

    // 演示步骤 2: 触发完整的 Agent Runtime 执行
    console.log("\n【步骤 2】触发 Agent Runtime 完整执行流程");
    console.log("────────────────────────────────────");
    try {
        const res = await apiClient.post("/api/agent-runtime/run", {
            message: "我想学习机器学习入门知识",
            intent: "design_course",
            context: {
                goal: "掌握机器学习基础知识",
                subject: "人工智能",
                durationDays: 7,
                intensity: "normal"
            }
        });

        console.log("✅ Agent 执行成功");
        console.log("   - 意图:", res.data.intent);
        console.log("   - 会话ID:", res.data.sessionId);
        console.log("   - 执行步骤:", res.data.traces?.length, "步");
        console.log("   - 结果摘要:", res.data.summary);
        console.log("\n📋 执行轨迹:");
        res.data.traces?.forEach((trace, i) => {
            console.log(`   ${i + 1}. [${trace.step}] ${trace.title}: ${trace.content}`);
        });
        console.log("\n📝 下一步行动:");
        res.data.nextActions?.forEach((action, i) => {
            console.log(`   ${i + 1}. ${action}`);
        });
    } catch (e) {
        console.log("❌ 失败:", e.response?.data?.message || e.message);
    }
    await delay(1000);

    // 演示步骤 3: 模拟练习完成闭环
    console.log("\n【步骤 3】练习完成 → 掌握度更新 → 路径评估");
    console.log("────────────────────────────────────");
    try {
        const res = await apiClient.post("/api/agent-runtime/practice-complete", {
            knowledgeId: 1,
            score: 7,
            total: 10,
            durationMs: 180000,
            questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            answers: [
                { qid: 1, correct: true },
                { qid: 2, correct: true },
                { qid: 3, correct: true },
                { qid: 4, correct: true },
                { qid: 5, correct: false },
                { qid: 6, correct: true },
                { qid: 7, correct: true },
                { qid: 8, correct: false },
                { qid: 9, correct: true },
                { qid: 10, correct: true }
            ]
        });

        console.log("✅ 练习闭环执行成功");
        console.log("   - 掌握度:", res.data.mastery?.mastery + "%");
        console.log("   - 置信度:", res.data.mastery?.confidence);
        console.log("   - 趋势:", res.data.mastery?.trend);
        console.log("   - 证据说明:", res.data.mastery?.evidence?.message);

        console.log("\n🎯 路径评估建议:");
        res.data.pathAnalysis?.adjustment?.suggestions?.forEach((s, i) => {
            console.log(`   ${i + 1}. [${s.priority?.toUpperCase()}] ${s.message}`);
        });

        if (res.data.pathAnalysis?.adjustment?.nextRecommendation) {
            const rec = res.data.pathAnalysis.adjustment.nextRecommendation;
            console.log(`\n🚀 下一步推荐: ${rec.title} (掌握度 ${rec.currentMastery}%, ${rec.action})`);
        }
    } catch (e) {
        console.log("❌ 失败:", e.response?.data?.message || e.message);
    }
    await delay(1000);

    // 演示步骤 4: 查看学习事件记录
    console.log("\n【步骤 4】查看学习事件记录");
    console.log("────────────────────────────────────");
    try {
        const res = await apiClient.get("/api/learning-events?limit=5");
        console.log("✅ 获取成功");
        console.log("   - 总事件数:", res.data.total);
        console.log("   - 最近事件:");
        res.data.data?.forEach((event, i) => {
            console.log(`   ${i + 1}. [${event.event_type}] ${event.created_at}`);
        });
    } catch (e) {
        console.log("❌ 失败:", e.response?.data?.message || e.message);
    }
    await delay(500);

    // 演示步骤 5: 查看 Agent 决策历史
    console.log("\n【步骤 5】查看 Agent 决策历史");
    console.log("────────────────────────────────────");
    try {
        const res = await apiClient.get("/api/agent-decisions?limit=5");
        console.log("✅ 获取成功");
        console.log("   - 决策记录数:", res.data.data?.length);
        console.log("   - 最近决策:");
        res.data.data?.forEach((decision, i) => {
            console.log(`   ${i + 1}. [${decision.decision_type}] ${decision.decision_summary}`);
            console.log(`      → 触发事件: ${decision.trigger_event}, 创建时间: ${decision.created_at}`);
        });
    } catch (e) {
        console.log("❌ 失败:", e.response?.data?.message || e.message);
    }
    await delay(500);

    // 演示步骤 6: 路径分析
    console.log("\n【步骤 6】路径分析");
    console.log("────────────────────────────────────");
    try {
        const res = await apiClient.get("/api/agent-runtime/analyze-path");
        console.log("✅ 分析完成");
        console.log("   - 需要调整:", res.data.adjustment?.needsAdjustment ? "是" : "否");
        console.log("   - 摘要:", res.data.summary);

        console.log("\n💡 调整建议:");
        res.data.adjustment?.suggestions?.forEach((s, i) => {
            console.log(`   ${i + 1}. [${s.type?.toUpperCase()}] ${s.message}`);
        });
    } catch (e) {
        console.log("❌ 失败:", e.response?.data?.message || e.message);
    }

    console.log("\n========================================");
    console.log("🎉 智能体功能演示完成！");
    console.log("========================================");
    console.log("\n📊 数据统计:");
    console.log("   - learning_events: 记录学生所有学习行为");
    console.log("   - agent_decisions: 记录 Agent 完整决策链");
    console.log("   - student_knowledge: 记录各知识点掌握度");
    console.log("   - feedback_loop: 记录学习闭环反馈");
}

main().catch(console.error);
