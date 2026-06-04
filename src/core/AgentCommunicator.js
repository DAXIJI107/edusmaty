// core/AgentCommunicator.js
// 智能体通信系统 - 事件驱动的通信机制

class AgentCommunicator {
    constructor() {
        this.events = {};
        this.agents = new Map();
        this.messageQueue = [];
        this.isProcessing = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    // 注册智能体
    registerAgent(agentId, agent) {
        if (!agentId || !agent) {
            console.error("Agent ID and agent instance are required");
            return false;
        }

        if (!agent.handleMessage || typeof agent.handleMessage !== "function") {
            console.error(`Agent ${agentId} must have a handleMessage method`);
            return false;
        }

        this.agents.set(agentId, agent);
        console.log(`Agent ${agentId} registered successfully`);
        return true;
    }

    // 订阅事件
    subscribe(event, callback) {
        if (!event || typeof callback !== "function") {
            console.error("Event name and callback function are required");
            return false;
        }

        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return true;
    }

    // 发布事件
    publish(event, data) {
        if (!event) {
            console.error("Event name is required");
            return false;
        }

        if (this.events[event]) {
            this.events[event].forEach((callback, index) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error handling event ${event} for callback ${index}:`, error);
                }
            });
        }
        return true;
    }

    // 发送消息给特定智能体
    async sendMessage(toAgentId, message) {
        if (!toAgentId) {
            return Promise.reject(new Error("Agent ID is required"));
        }

        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullMessage = {
            id: messageId,
            from: message.from || "system",
            to: toAgentId,
            type: message.type || "request",
            content: message.content,
            timestamp: new Date(),
            correlationId: message.correlationId || messageId
        };

        this.messageQueue.push(fullMessage);
        this.processMessages();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Message timeout"));
            }, 30000); // 30秒超时

            this.subscribe(`message_response_${messageId}`, response => {
                clearTimeout(timeout);
                resolve(response);
            });
        });
    }

    // 处理消息队列
    async processMessages() {
        if (this.isProcessing || this.messageQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            await this.processSingleMessage(message);
        }

        this.isProcessing = false;
    }

    // 处理单个消息
    async processSingleMessage(message, attempt = 0) {
        const agent = this.agents.get(message.to);

        if (agent && agent.handleMessage) {
            try {
                const response = await agent.handleMessage(message);
                if (response) {
                    this.publish(`message_response_${message.id}`, response);
                } else {
                    // 即使没有响应，也发布一个空响应以避免超时
                    this.publish(`message_response_${message.id}`, { success: true, message: "No response" });
                }
            } catch (error) {
                console.error(`Error processing message for agent ${message.to}:`, error);

                // 重试机制
                if (attempt < this.retryAttempts) {
                    console.log(
                        `Retrying message ${message.id} for agent ${message.to} (${attempt + 1}/${this.retryAttempts})`
                    );
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
                    await this.processSingleMessage(message, attempt + 1);
                } else {
                    this.publish(`message_response_${message.id}`, {
                        error: error.message
                    });
                }
            }
        } else {
            console.warn(`Agent ${message.to} not found or does not have handleMessage method`);
            this.publish(`message_response_${message.id}`, {
                error: `Agent ${message.to} not available`
            });
        }
    }

    // 广播消息给所有智能体
    broadcast(message) {
        if (!message) {
            console.error("Message is required");
            return false;
        }

        this.agents.forEach((agent, agentId) => {
            this.sendMessage(agentId, {
                ...message,
                to: agentId
            });
        });
        return true;
    }

    // 获取所有智能体
    getAgents() {
        return Array.from(this.agents.keys());
    }

    // 获取智能体状态
    getAgentStatus(agentId) {
        const agent = this.agents.get(agentId);
        return {
            exists: !!agent,
            hasHandleMessage: agent && typeof agent.handleMessage === "function"
        };
    }

    // 移除智能体
    removeAgent(agentId) {
        const removed = this.agents.delete(agentId);
        if (removed) {
            console.log(`Agent ${agentId} removed successfully`);
        } else {
            console.warn(`Agent ${agentId} not found`);
        }
        return removed;
    }

    // 清空消息队列
    clearMessageQueue() {
        const count = this.messageQueue.length;
        this.messageQueue = [];
        console.log(`Cleared ${count} messages from queue`);
        return count;
    }

    // 获取队列状态
    getQueueStatus() {
        return {
            queueLength: this.messageQueue.length,
            isProcessing: this.isProcessing,
            agentCount: this.agents.size
        };
    }
}

// 全局通信实例
const agentCommunicator = new AgentCommunicator();
module.exports = agentCommunicator;
