const express = require("express");
const { authenticateJWT } = require("../middleware");

const router = express.Router();
router.use(authenticateJWT);

const assistantModes = [
    { key: "tutor", icon: "brain", label: "学习问答", desc: "讲概念、追问、给例题" },
    { key: "mistake", icon: "exam", label: "错题教练", desc: "定位错因和同类题" },
    { key: "note", icon: "pen", label: "笔记生成", desc: "转结构化卡片" },
    { key: "oral", icon: "send", label: "口语表达", desc: "陪练和表达优化" },
    { key: "plan", icon: "route", label: "课程规划", desc: "设计课程和复习节奏" },
    { key: "agent", icon: "bolt", label: "智能体任务", desc: "调用工具写回学习任务" }
];

const assistantPrompts = {
    tutor: ["把这个概念讲给初学者听，并追问我 2 个问题", "给我一道由易到难的检验题", "把这节课最容易混淆的点列出来"],
    mistake: ["请按错因、正确思路、同类题识别三步拆解", "根据这道题生成 2 道变式题", "把我的错误整理成错题复盘卡"],
    note: ["整理成康奈尔笔记、主动回忆题和复习计划", "从这段内容提取 5 个关键词和 3 张卡片", "把回答变成适合明天复习的笔记"],
    oral: ["帮我润色这段表达并给出评分", "围绕这个主题连续追问我 3 轮", "改写成自然、简洁的英文表达"],
    plan: ["按今天、明天、考前拆一个复习安排", "根据我的薄弱点生成 30 分钟学习闭环", "把目标拆成课程、练习、笔记三类任务"],
    agent: ["我 7 天后要考操作系统，帮我设计复习课并写入学习路径", "根据我最近的错题分析下一步，并生成练习和笔记任务", "把 AI Agent 入门课程拆成 5 天实训计划"]
};

const promptPlaceholders = {
    tutor: "例如：用高中生能听懂的话解释一下函数极限，并给我一道检验题",
    mistake: "例如：我这道 SQL 题为什么错？帮我找错因和同类题识别方法",
    note: "例如：把这段课程内容整理成康奈尔笔记和 3 张主动回忆卡",
    oral: "例如：帮我练一段英文自我介绍，指出语法和发音注意点",
    plan: "例如：我三天后要考数据结构，帮我安排复习计划",
    agent: "例如：我 7 天后要考操作系统，帮我设计复习课程、练习和笔记任务"
};

const openSourceIntegrations = [
    {
        name: "OATutor",
        icon: "brain",
        repoUrl: "https://github.com/CAHLR/OATutor-LLM-Learner",
        category: "assessment_model",
        source: "智能辅导与 BKT 模型",
        summary: "开源自适应辅导系统，适合借鉴 BKT 掌握度模型、技能模型和弱项选题。",
        mappedModules: ["智能诊断", "学习路径", "专项练习", "掌握度仪表盘"],
        implementationStatus: "active",
        projectLanding: "在 EduSmart 中落地为掌握度估计、自适应选题、学习日志和路径调整依据。",
        actions: [
            { label: "生成诊断路径", view: "aiAssistant", prompt: "基于 OATutor 的 BKT 与自适应辅导思路，抓取公开资料并生成诊断路径、练习和掌握度更新任务" },
            { label: "查看学习路径", view: "path" }
        ]
    },
    {
        name: "OpenMAIC",
        icon: "users",
        repoUrl: "https://openmaic.chat/",
        category: "multi_agent_classroom",
        source: "多智能体互动课堂",
        summary: "多智能体互动课堂，适合生成 AI 教师、助教、同学、测验和课堂讨论。",
        mappedModules: ["AI课程设计", "AI学习助手", "教师工作台"],
        implementationStatus: "active",
        projectLanding: "在 EduSmart 中落地为 AI 课程设计器、角色化课堂讨论和教师工作台的一键助教。",
        actions: [
            { label: "设计 AI 课程", view: "aiAssistant", prompt: "基于 OpenMAIC 思路，为 AI Agent 入门设计一节多智能体互动课" },
            { label: "教师工作台", view: "teacherWorkbench" }
        ]
    },
    {
        name: "NexusRAG",
        icon: "db",
        repoUrl: "https://github.com/LeDat98/NexusRAG",
        category: "rag_knowledge_graph",
        source: "RAG 与知识图谱",
        summary: "混合检索、知识图谱 RAG 和引用溯源，可增强课程资料与智能笔记问答。",
        mappedModules: ["RAG知识库", "智能笔记", "知识图谱", "AI助手"],
        implementationStatus: "active",
        projectLanding: "在 EduSmart 中落地为课程资料问答、笔记溯源、知识图谱检索和可解释回答。",
        actions: [
            { label: "RAG 问答", view: "aiAssistant", prompt: "基于 NexusRAG 公开资料，抓取入库后用 RAG 回答：如何把知识图谱、引用溯源和课程资料问答落到 EduSmart" },
            { label: "知识图谱", view: "knowledgeGraph" }
        ]
    },
    {
        name: "Hello-Agents",
        icon: "book",
        repoUrl: "https://github.com/datawhalechina/hello-agents",
        category: "course_package",
        source: "GitHub 开源教程",
        summary: "中文 Agent 教程，可拆成 AI Agent 学习路径、练习和实训模板。",
        mappedModules: ["Agent研究中心", "AI编程舱", "学习路径"],
        implementationStatus: "active",
        projectLanding: "在 EduSmart 中落地为 4 周 Agent 学习路线、代码模板、练习题和项目验收任务。",
        actions: [
            { label: "生成学习路径", view: "path", prompt: "把 Hello-Agents 拆成 4 周学习路径" },
            { label: "AI编程舱", view: "codeLab" }
        ]
    }
];

const agentRoadmap = [
    { num: "01", title: "读懂 Agent", desc: "学习 LLM、ReAct、Planning、Reflection、Memory、RAG 和 MCP。", tag: "学习", view: "tutorials" },
    { num: "02", title: "记录知识", desc: "把概念、代码片段、错题复盘沉淀成可检索笔记。", tag: "沉淀", view: "smartNotes" },
    { num: "03", title: "跑通工程", desc: "在 AI 编程舱运行工具调用、RAG、多智能体模板。", tag: "开发", view: "codeLab" },
    { num: "04", title: "接入平台", desc: "把诊断、路径、练习、笔记和导师对话组织成学习智能体。", tag: "融合", view: "aiAssistant" }
];

const agentImplementationMap = [
    { title: "学习路线", desc: "开源教程章节转为读概念、做题、写笔记、跑模板的阶段任务。", view: "path" },
    { title: "实训模板", desc: "Agent 框架中的 ReAct、Tool、Memory、RAG、多 Agent 设计转为 AI 编程舱模板。", view: "codeLab" },
    { title: "项目协作", desc: "多 Agent 角色落到团队项目：产品、架构、开发、测试、审查协同推进。", view: "teamCode" },
    { title: "知识库检索", desc: "笔记、标签和知识图谱成为 AI 助手回答问题的上下文。", view: "smartNotes" }
];

router.get("/ai-intelligence", (req, res) => {
    res.json({
        success: true,
        assistantModes,
        assistantPrompts,
        promptPlaceholders,
        openSourceIntegrations,
        agentRoadmap,
        agentImplementationMap
    });
});

module.exports = router;
