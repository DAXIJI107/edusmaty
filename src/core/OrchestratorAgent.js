// core/OrchestratorAgent.js
// 智能体调度器 - 负责任务分解和智能体协调

const agentCommunicator = require("./AgentCommunicator");
const ProfileAgent = require("./ProfileAgent");
const ResourceAgent = require("./ResourceAgent");
const SafetyAgent = require("./SafetyAgent");
const TTSAgent = require("./TTSAgent");
const SupervisorAgent = require("./SupervisorAgent");

class OrchestratorAgent {
    constructor(userId, pool) {
        this.userId = userId;
        this.pool = pool;
        this.agents = new Map();
        this.tasks = new Map();
        this.initializeAgents();
    }

    // 初始化智能体
    initializeAgents() {
        // 注册自身
        if (!agentCommunicator.agents.has("orchestrator")) {
            agentCommunicator.registerAgent("orchestrator", this);
        }

        // 初始化ProfileAgent
        if (!agentCommunicator.agents.has("profile")) {
            const profileAgent = new ProfileAgent(this.userId, this.pool);
            agentCommunicator.registerAgent("profile", profileAgent);
            this.agents.set("profile", profileAgent);
        } else {
            this.agents.set("profile", agentCommunicator.agents.get("profile"));
        }

        // 初始化ResourceAgent
        if (!agentCommunicator.agents.has("resource")) {
            const resourceAgent = new ResourceAgent(this.userId, this.pool);
            agentCommunicator.registerAgent("resource", resourceAgent);
            this.agents.set("resource", resourceAgent);
        } else {
            this.agents.set("resource", agentCommunicator.agents.get("resource"));
        }

        // 初始化SafetyAgent（全局共享）
        if (!agentCommunicator.agents.has("safety")) {
            const safetyAgent = new SafetyAgent();
            agentCommunicator.registerAgent("safety", safetyAgent);
            this.agents.set("safety", safetyAgent);
        } else {
            this.agents.set("safety", agentCommunicator.agents.get("safety"));
        }

        // 初始化TTSAgent（语音合成）
        if (!agentCommunicator.agents.has("tts")) {
            const ttsAgent = new TTSAgent();
            agentCommunicator.registerAgent("tts", ttsAgent);
            this.agents.set("tts", ttsAgent);
        } else {
            this.agents.set("tts", agentCommunicator.agents.get("tts"));
        }

        // 初始化SupervisorAgent（智能督学）
        if (!agentCommunicator.agents.has("supervisor")) {
            const supervisorAgent = new SupervisorAgent(this.userId, this.pool);
            agentCommunicator.registerAgent("supervisor", supervisorAgent);
            this.agents.set("supervisor", supervisorAgent);
        } else {
            this.agents.set("supervisor", agentCommunicator.agents.get("supervisor"));
        }
    }

    // 处理消息
    async handleMessage(message) {
        console.log(`Orchestrator received message:`, message);

        switch (message.type) {
            case "init_profile":
                return await this.initializeProfile();
            case "process_input":
                return await this.processUserInput(message.content);
            case "generate_resources":
                return await this.generateResources(message.content);
            case "get_profile_summary":
                return await this.getProfileSummary();
            default:
                return {
                    error: "Unknown message type"
                };
        }
    }

    // 初始化学习画像
    async initializeProfile() {
        const profileAgent = this.agents.get("profile");
        if (profileAgent) {
            const profile = await profileAgent.initializeProfile();
            return {
                success: true,
                profile: profile
            };
        }
        return {
            success: false,
            error: "Profile agent not available"
        };
    }

    // 处理用户输入
    async processUserInput(input) {
        // 分解输入任务
        const tasks = this.decomposeTask(input);

        // 执行任务
        const results = [];
        for (const task of tasks) {
            const result = await this.executeTask(task);
            results.push(result);
        }

        return {
            success: true,
            results: results
        };
    }

    // 分解任务
    decomposeTask(input) {
        // 简单的任务分解逻辑
        const tasks = [];

        // 检查是否是学习画像相关
        // 更灵活的条件，只要输入不是空的，就认为是学习画像相关
        if (input && input.trim() !== "") {
            tasks.push({
                agent: "profile",
                type: "process_input",
                content: input
            });
        }

        // 可以添加更多任务分解逻辑

        return tasks;
    }

    // 执行任务
    async executeTask(task) {
        try {
            console.log("执行任务:", task);
            const response = await agentCommunicator.sendMessage(task.agent, {
                from: "orchestrator",
                type: task.type,
                content: task.content
            });
            console.log("任务执行结果:", response);
            return response;
        } catch (error) {
            console.error(`Error executing task:`, error);
            return {
                error: error.message
            };
        }
    }

    // 生成学习资源
    async generateResources(params) {
        const profileAgent = this.agents.get("profile");
        const resourceAgent = this.agents.get("resource");
        const safetyAgent = this.agents.get("safety");

        if (!profileAgent) {
            return { success: false, error: "Profile agent not available" };
        }
        if (!resourceAgent) {
            return { success: false, error: "Resource agent not available" };
        }

        await profileAgent.initializeProfile();
        const profile = profileAgent.getProfile();
        const knowledgePoint = params.knowledgePoint || params.topic || params.courseContent || params.content;
        const types = Array.isArray(params.resourceTypes)
            ? params.resourceTypes
            : Array.isArray(params.types)
              ? params.types
              : typeof params.resourceTypes === "string"
                ? params.resourceTypes
                      .split(",")
                      .map(type => type.trim())
                      .filter(Boolean)
                : [];

        if (!knowledgePoint) {
            return { success: false, error: "请指定知识点" };
        }

        // 使用ResourceAgent生成资源
        const resourceResult = await resourceAgent.handleMessage({
            type: "generate",
            content: {
                knowledgePoint: knowledgePoint,
                types: types,
                profile: profile
            }
        });

        if (!resourceResult.success) {
            return resourceResult;
        }

        // 使用SafetyAgent进行内容安全检查
        const safetyResults = [];
        for (const resource of resourceResult.resources) {
            if (resource.content && typeof resource.content === "string") {
                const safetyCheck = await safetyAgent.handleMessage({
                    type: "validate",
                    content: resource.content
                });
                if (!safetyCheck.valid) {
                    console.warn(`资源 ${resource.type} 内容安全检查未通过`, safetyCheck.violations);
                    resource.safetyWarning = safetyCheck.violations;
                }

                const hallucinationCheck = await safetyAgent.handleMessage({
                    type: "check_hallucination",
                    content: resource.content
                });
                if (hallucinationCheck.hasHallucinationRisk) {
                    console.warn(`资源 ${resource.type} 存在幻觉风险`, hallucinationCheck);
                    resource.hallucinationRisk = hallucinationCheck.riskLevel;
                    resource.hallucinationSuggestion = hallucinationCheck.suggestion;
                }
            }
            safetyResults.push(resource);
        }

        return {
            success: true,
            resources: safetyResults,
            knowledgePoint: knowledgePoint,
            profile: profile,
            safetyChecked: true
        };
    }

    // 获取可用资源类型
    async getAvailableResourceTypes() {
        const resourceAgent = this.agents.get("resource");
        if (!resourceAgent) {
            return { success: false, error: "Resource agent not available" };
        }

        const result = await resourceAgent.handleMessage({
            type: "get_types"
        });

        return {
            success: true,
            types: result
        };
    }

    // 获取画像摘要
    async getProfileSummary() {
        const profileAgent = this.agents.get("profile");
        if (profileAgent) {
            await profileAgent.initializeProfile();
            const summary = profileAgent.generateProfileSummary();
            return {
                success: true,
                summary: summary
            };
        }
        return {
            success: false,
            error: "Profile agent not available"
        };
    }

    // 监控任务进度
    monitorTaskProgress(taskId) {
        const task = this.tasks.get(taskId);
        if (task) {
            return {
                status: task.status,
                progress: task.progress,
                result: task.result
            };
        }
        return {
            error: "Task not found"
        };
    }

    // 取消任务
    cancelTask(taskId) {
        this.tasks.delete(taskId);
        return {
            success: true,
            message: "Task cancelled"
        };
    }
}

module.exports = OrchestratorAgent;
