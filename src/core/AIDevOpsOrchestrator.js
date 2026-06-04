const axios = require("axios");
const config = require("../config");
const llmGateway = require("./llm/LlmGateway");

const TOOL_DEFINITIONS = [
    {
        key: "git",
        name: "Git 仓库",
        kind: "tool",
        status: "ready",
        description: "读取 diff、同步分支、生成提交计划和 PR 草稿。"
    },
    {
        key: "mcp",
        name: "MCP 工具总线",
        kind: "mcp",
        status: "ready",
        description: "统一转发外部 MCP Server，例如 GitHub、文档、浏览器、部署平台。"
    },
    {
        key: "skill",
        name: "Skill 技能库",
        kind: "skill",
        status: "ready",
        description: "把审查、测试、修正、发布检查封装为可复用技能。"
    },
    {
        key: "agent",
        name: "多智能体编排",
        kind: "agent",
        status: "ready",
        description: "按需求分析、代码审查、测试生成、修复建议拆分角色协作。"
    },
    {
        key: "ai-review",
        name: "AI 代码审查",
        kind: "ai",
        status: "ready",
        description: "通过模型或本地规则识别质量、安全、可维护性和协作风险。"
    },
    {
        key: "ai-test",
        name: "AI 测试生成",
        kind: "ai",
        status: "ready",
        description: "基于文件内容生成测试思路、测试代码草稿和验收清单。"
    },
    {
        key: "ai-fix",
        name: "AI 自动修正",
        kind: "ai",
        status: "ready",
        description: "根据审查与测试结果生成最小修复建议，默认不直接覆盖代码。"
    },
    {
        key: "ci",
        name: "CI 流水线",
        kind: "tool",
        status: "ready",
        description: "运行语法检查、单元测试、页面冒烟和部署预检。"
    }
];

const AGENT_DEFINITIONS = [
    { key: "requirement", name: "需求分析 Agent", focus: "从项目说明、提交记录和需求卡片中提取可执行任务。" },
    { key: "architect", name: "架构设计 Agent", focus: "检查模块边界、接口契约和依赖方向。" },
    { key: "reviewer", name: "Code Review Agent", focus: "审查安全、异常分支、可维护性和协作风险。" },
    { key: "tester", name: "Test Agent", focus: "生成测试用例、边界场景和回归清单。" },
    { key: "fixer", name: "Fix Agent", focus: "给出最小代码修正方案和提交说明。" },
    { key: "release", name: "Release Agent", focus: "整理部署清单、CI 结果和发布风险。" }
];

function clampScore(score) {
    return Math.max(45, Math.min(98, Math.round(score)));
}

function summarizeCode({ content = "", moduleKey = "frontend", path = "" }) {
    const text = String(content || "");
    const lines = text.split(/\r?\n/);
    const nonEmpty = lines.filter(line => line.trim()).length;
    const findings = [];
    const suggestions = [];
    let score = 90;

    if (!text.trim()) {
        findings.push("当前文件为空，无法完成审查、测试或修复闭环。");
        suggestions.push("先提交最小可运行版本，再启动 AI 流水线。");
        score -= 32;
    }
    if (nonEmpty > 160) {
        findings.push("单文件内容偏长，后续维护和多人协作成本会升高。");
        suggestions.push("按组件、服务、测试或配置职责拆分文件。");
        score -= 8;
    }
    if (/eval\s*\(|new Function\s*\(/.test(text)) {
        findings.push("检测到动态执行代码，存在明显安全风险。");
        suggestions.push("改用白名单映射、解释器沙箱或固定命令表。");
        score -= 18;
    }
    if (/password|secret|token|api[_-]?key/i.test(text)) {
        findings.push("代码中疑似出现密钥、Token 或密码字段。");
        suggestions.push("确认敏感值来自环境变量，并避免提交真实凭据。");
        score -= 12;
    }
    if (/console\.log/.test(text) && moduleKey !== "testing") {
        findings.push("存在调试输出，发布前需要替换为可控日志或移除。");
        suggestions.push("保留必要日志时添加级别、上下文和脱敏策略。");
        score -= 5;
    }
    if (/TODO|FIXME|待完善/i.test(text)) {
        findings.push("存在未闭环 TODO，需要同步到需求或缺陷记录。");
        suggestions.push("把 TODO 变为可认领卡片，标注负责人和验收标准。");
        score -= 7;
    }
    if (moduleKey === "backend" && !/try|catch|throw|Error|status|return/i.test(text)) {
        findings.push("后端逻辑缺少明显的异常处理或返回约定。");
        suggestions.push("补充参数校验、错误分支和接口响应结构。");
        score -= 10;
    }
    if (moduleKey === "testing" && !/assert|expect|test|describe|it|PASS|passed/i.test(text)) {
        findings.push("测试模块缺少断言或可追踪测试结果。");
        suggestions.push("至少覆盖正常路径、异常路径和权限边界。");
        score -= 10;
    }

    if (!findings.length) {
        findings.push("未发现阻塞级问题，可以进入同伴评审和测试补强。");
        suggestions.push("继续补充接口契约、边界用例和发布检查清单。");
    }

    return {
        score: clampScore(score),
        level: score >= 90 ? "优秀" : score >= 80 ? "可合并" : score >= 70 ? "需复查" : "需返工",
        lineCount: lines.length,
        nonEmptyLineCount: nonEmpty,
        summary: `${path || "当前编辑区"} 完成 ${nonEmpty} 行有效内容扫描，覆盖质量、安全、测试、协作和发布风险。`,
        findings,
        suggestions
    };
}

function buildTests({ content = "", moduleKey = "frontend", path = "" }) {
    const code = String(content || "");
    const cases = [
        { name: "正常输入路径", type: "unit", expected: "核心函数或页面流程能返回预期结果。" },
        { name: "异常输入路径", type: "unit", expected: "空值、非法值和缺少字段时给出明确错误。" },
        { name: "协作边界", type: "integration", expected: "只访问本模块允许的接口、文件和状态。" }
    ];
    if (moduleKey === "frontend" || /\.(html|css|jsx|tsx|vue)$/i.test(path)) {
        cases.push({ name: "页面冒烟", type: "e2e", expected: "页面可打开，关键按钮可点击，文本不溢出。" });
    }
    if (moduleKey === "backend" || /api|server|route/i.test(path)) {
        cases.push({ name: "接口契约", type: "api", expected: "成功、失败、无权限三类响应结构一致。" });
    }
    if (/async|await|Promise|fetch|axios/.test(code)) {
        cases.push({ name: "异步失败回退", type: "unit", expected: "网络失败、超时或空响应时不会阻断主流程。" });
    }

    return {
        framework:
            moduleKey === "frontend" ? "Playwright / Jest" : moduleKey === "backend" ? "Jest / Supertest" : "Jest",
        command: moduleKey === "frontend" ? "npm run check && npm run test:e2e" : "npm run check && npm test",
        cases,
        draft: cases.map(item => `test("${item.name}", async () => { /* ${item.expected} */ });`).join("\n")
    };
}

function buildFixPlan(review, testPlan) {
    const actions = [];
    for (const finding of review.findings || []) {
        if (/为空/.test(finding)) actions.push("补齐最小可运行实现，并提交首个版本。");
        else if (/动态执行/.test(finding)) actions.push("移除动态执行逻辑，改为显式白名单或沙箱调用。");
        else if (/密钥|Token|密码/.test(finding)) actions.push("把敏感配置迁移到环境变量，并补充示例配置。");
        else if (/调试输出/.test(finding)) actions.push("清理调试日志或封装为可控日志工具。");
        else if (/TODO/.test(finding)) actions.push("将 TODO 转为需求卡片，并在代码中保留明确跟踪编号。");
        else if (/异常处理/.test(finding)) actions.push("补充参数校验、错误分支和统一响应结构。");
        else if (/断言/.test(finding)) actions.push("补充断言，确保测试失败能定位到具体行为。");
    }
    if (!actions.length) actions.push("根据测试清单补齐边界用例，并准备提交说明。");

    return {
        mode: "proposal",
        safety: "默认生成修正建议，不直接覆盖团队代码；保存前需成员确认。",
        actions: [...new Set(actions)].slice(0, 6),
        commitMessage: `fix: improve ${testPlan.framework.toLowerCase()} quality gates`,
        patchHint: "真实模型接入后可在这里返回 unified diff、受影响文件和风险说明。"
    };
}

class AIDevOpsOrchestrator {
    constructor(options = {}) {
        this.modelProvider = options.modelProvider || "auto";
    }

    listTools() {
        return TOOL_DEFINITIONS;
    }

    listAgents() {
        return AGENT_DEFINITIONS.map(agent => ({
            ...agent,
            status: "可调用",
            toolAccess: ["git", "mcp", "skill", "ci"].filter(Boolean)
        }));
    }

    async callModel({ system, prompt, temperature = 0.2 }) {
        try {
            const result = await llmGateway.chat({
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: prompt }
                ],
                temperature,
                maxTokens: 1600
            });
            return { provider: result.provider, content: result.content || "" };
        } catch (error) {
            return { provider: "local", content: "", error: error.message };
        }
    }

    async reviewCode(input) {
        const local = summarizeCode(input);
        const prompt = [
            `文件: ${input.path || "当前编辑区"}`,
            `模块: ${input.moduleKey || "frontend"}`,
            "请用 JSON 返回 summary、findings、suggestions、nextActions。",
            "代码:",
            String(input.content || "").slice(0, 8000)
        ].join("\n");
        const model = await this.callModel({
            system: "你是团队项目代码审查 Agent，输出简洁、可执行、适合学生项目。",
            prompt
        });

        return {
            ...local,
            provider: model.provider,
            modelComment: model.content ? model.content.slice(0, 1200) : "",
            nextActions: [...local.suggestions.slice(0, 2), "运行 AI 测试生成并把高风险项转为验收任务。"]
        };
    }

    async generateTests(input) {
        const testPlan = buildTests(input);
        const model = await this.callModel({
            system: "你是测试生成 Agent，围绕团队项目生成测试用例和执行建议。",
            prompt: `模块: ${input.moduleKey}\n文件: ${input.path}\n代码:\n${String(input.content || "").slice(0, 6000)}`
        });
        return {
            ...testPlan,
            provider: model.provider,
            modelComment: model.content ? model.content.slice(0, 1200) : ""
        };
    }

    async suggestFix(input) {
        const review = input.review || (await this.reviewCode(input));
        const testPlan = input.testPlan || (await this.generateTests(input));
        const fix = buildFixPlan(review, testPlan);
        const model = await this.callModel({
            system: "你是代码修正 Agent，默认输出最小修复计划，不直接覆盖代码。",
            prompt: `审查结果:\n${JSON.stringify(review).slice(0, 5000)}\n测试计划:\n${JSON.stringify(testPlan).slice(0, 3000)}`
        });
        return { ...fix, provider: model.provider, modelComment: model.content ? model.content.slice(0, 1200) : "" };
    }

    async runPipeline(input) {
        const review = await this.reviewCode(input);
        const testPlan = await this.generateTests(input);
        const fixPlan = await this.suggestFix({ ...input, review, testPlan });
        const gates = [
            {
                name: "代码审查",
                status: review.score >= 75 ? "passed" : "attention",
                detail: `${review.level} · ${review.score}分`
            },
            {
                name: "测试生成",
                status: testPlan.cases.length >= 3 ? "passed" : "attention",
                detail: `${testPlan.cases.length} 个测试场景`
            },
            {
                name: "修正建议",
                status: fixPlan.actions.length ? "passed" : "attention",
                detail: `${fixPlan.actions.length} 条建议`
            }
        ];
        return {
            provider:
                review.provider === "spark" || testPlan.provider === "spark" || fixPlan.provider === "spark"
                    ? "spark"
                    : "local",
            status: gates.some(gate => gate.status === "attention") ? "needs-attention" : "completed",
            review,
            testPlan,
            fixPlan,
            gates,
            report: [
                `AI DevOps 流水线完成：${input.path || "当前编辑区"}`,
                `审查：${review.level}，${review.score}分`,
                `测试：生成 ${testPlan.cases.length} 个场景，建议命令 ${testPlan.command}`,
                `修正：${fixPlan.actions[0] || "暂无阻塞修正"}`
            ].join("\n")
        };
    }

    async runTool({ tool, roleKey, task, project, file }) {
        const target =
            TOOL_DEFINITIONS.find(item => item.key === tool) || TOOL_DEFINITIONS.find(item => item.key === "mcp");
        const role = roleKey || file?.module_key || "frontend";
        const text = String(task || "").trim() || "读取当前项目上下文并生成下一步建议。";
        const outputs = {
            git: `Git 适配器已接收任务：${text}\n仓库：${project?.repository_name || project?.name || "team-repo"}\n建议动作：读取 diff -> 创建功能分支 -> 生成提交说明 -> 准备 PR 草稿。`,
            mcp: `MCP 适配器已接收任务：${text}\n可路由能力：文件系统、GitHub、文档、浏览器、部署平台。当前返回模拟结果，接入 MCP Server 后会返回真实调用日志。`,
            skill: `Skill 适配器已接收任务：${text}\n推荐技能：代码审查、测试生成、修复建议、发布检查。`,
            agent: `智能体编排已接收任务：${text}\n参与角色：需求分析 Agent、Code Review Agent、Test Agent、Fix Agent、Release Agent。`,
            "ai-review": `AI 审查入口已准备：可对 ${role} 模块执行质量、安全、维护性和协作风险扫描。`,
            "ai-test": `AI 测试入口已准备：可为 ${role} 模块生成单测、接口测试、页面冒烟和验收清单。`,
            "ai-fix": `AI 修正入口已准备：将生成最小修复计划和提交说明，默认等待人工确认。`,
            ci: `CI 适配器已接收任务：${text}\n建议执行：npm run check -> npm test -> 页面冒烟 -> 发布预检。`
        };
        return {
            tool: target.key,
            name: target.name,
            roleKey: role,
            task: text,
            status: "completed",
            output: outputs[target.key] || outputs.mcp,
            next: "把真实密钥、MCP Server URL 或 CI Webhook 配置到服务端后，此接口即可替换为真实执行结果。"
        };
    }
}

module.exports = AIDevOpsOrchestrator;
