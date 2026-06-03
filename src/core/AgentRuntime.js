const ProfileTool = require("./agent-tools/ProfileTool");
const ResourceTool = require("./agent-tools/ResourceTool");
const PracticeTool = require("./agent-tools/PracticeTool");
const NoteTool = require("./agent-tools/NoteTool");
const PathTool = require("./agent-tools/PathTool");
const CourseDesignTool = require("./agent-tools/CourseDesignTool");
const MasteryTool = require("./agent-tools/MasteryTool");
const RagTool = require("./agent-tools/RagTool");
const PublicSourceTool = require("./agent-tools/PublicSourceTool");

class AgentRuntime {
    constructor(pool) {
        this.pool = pool;
        this.tools = {
            profile: new ProfileTool(pool),
            resource: new ResourceTool(pool),
            practice: new PracticeTool(pool),
            note: new NoteTool(pool),
            path: new PathTool(pool),
            courseDesign: new CourseDesignTool(pool),
            mastery: new MasteryTool(pool),
            rag: new RagTool(pool),
            publicSource: new PublicSourceTool(pool)
        };
    }

    async ensureSchema() {
        await this.pool.query(`CREATE TABLE IF NOT EXISTS learning_events (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            user_id BIGINT NOT NULL,
            event_type VARCHAR(64) NOT NULL,
            subject VARCHAR(100),
            knowledge_id INT,
            target_type VARCHAR(64),
            target_id BIGINT,
            context_json JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`).catch(() => {});
        await this.pool.query(`CREATE TABLE IF NOT EXISTS agent_traces (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            user_id BIGINT NOT NULL,
            session_id VARCHAR(80) NOT NULL,
            agent_name VARCHAR(80) NOT NULL,
            step_type VARCHAR(40) NOT NULL,
            title VARCHAR(200),
            content TEXT,
            tool_name VARCHAR(100),
            tool_input JSON,
            tool_output JSON,
            confidence DECIMAL(5,2),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`).catch(() => {});
        await this.pool.query(`CREATE TABLE IF NOT EXISTS ai_course_designs (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            user_id BIGINT NOT NULL,
            goal VARCHAR(300) NOT NULL,
            subject VARCHAR(100),
            duration_days INT,
            design_json JSON,
            status VARCHAR(40) DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`).catch(() => {});
    }

    createSessionId() {
        return `agent-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    }

    inferIntent(message = "", explicitIntent = "") {
        if (explicitIntent) return explicitIntent;
        const text = String(message || "");
        if (/课程|复习课|教学设计|几天|计划|路径|安排/.test(text)) return "design_course";
        if (/错题|练习|题|刷题|检测|测验/.test(text)) return "practice";
        if (/笔记|总结|复盘|卡片/.test(text)) return "note";
        return "next_action";
    }

    inferDurationDays(message = "") {
        const matched = String(message).match(/(\d{1,2})\s*天/);
        if (matched) return Math.max(1, Math.min(14, Number(matched[1])));
        if (/一周|7天|七天/.test(message)) return 7;
        if (/三天|3天/.test(message)) return 3;
        return 7;
    }

    inferSubject(message = "", fallback = "all") {
        const subjects = ["数据结构与算法", "操作系统", "计算机网络", "数据库系统", "软件工程", "AI Agent", "人工智能"];
        return subjects.find(subject => String(message).includes(subject.replace("系统", "")) || String(message).includes(subject)) || fallback || "all";
    }

    inferSourceName(message = "", context = {}) {
        if (context.sourceName) return context.sourceName;
        const text = `${message || ""} ${context.goal || ""} ${context.subject || ""}`.toLowerCase();
        const sources = ["Hello-Agents", "OATutor", "OpenMAIC", "NexusRAG", "AgentScope", "Hugging Face Agents Course"];
        return sources.find(name => text.includes(name.toLowerCase())) || null;
    }

    createExecutionPlan({ intent, message, context, sourceName }) {
        const text = `${message || ""} ${context.goal || ""}`.toLowerCase();
        const needsPublicSource = !!sourceName || /开源|公开|github|资料|rag|nexusrag|oatutor|openmaic|agentscope|hello-agents/.test(text);
        const needsRag = needsPublicSource || /检索|引用|证据|知识库|rag|资料/.test(text);
        const needsCourse = intent === "design_course" || /课程|路径|计划|几天|落地|实训/.test(text);
        const needsPractice = intent === "practice" || needsCourse || /练习|错题|测验|题/.test(text);
        const needsNote = intent === "note" || needsCourse || /笔记|复盘|卡片|沉淀/.test(text);
        const steps = [
            { tool: "profile", reason: "读取学习画像、掌握度、近期行为和笔记，作为个性化依据。" }
        ];
        if (needsPublicSource) steps.push({ tool: "publicSource", reason: "从公开网页或 GitHub README 抓取资料并写入 RAG 知识库。" });
        if (needsRag) steps.push({ tool: "rag", reason: "基于公开资料和平台知识片段检索证据，避免只返回硬编码文案。" });
        steps.push({ tool: "resource", reason: "匹配平台课程和题库资源。" });
        if (needsPractice) steps.push({ tool: "practice", reason: "按薄弱点生成练习策略。" });
        if (needsCourse) steps.push({ tool: "courseDesign", reason: "把目标拆成多天课程/实训单元。" });
        if (needsCourse || needsPractice || intent === "next_action") steps.push({ tool: "path", reason: "把 agent 决策写回今日学习任务。" });
        if (needsNote || needsRag || intent === "next_action") steps.push({ tool: "note", reason: "生成复盘卡或资料沉淀任务。" });
        return steps;
    }

    async recordTrace({ userId, sessionId, stepType, title, content, toolName = null, toolInput = null, toolOutput = null, confidence = null }) {
        const trace = {
            userId,
            sessionId,
            agentName: "EduSmart Agent Runtime",
            stepType,
            title,
            content,
            toolName,
            toolInput,
            toolOutput,
            confidence
        };
        await this.pool.query(
            `INSERT INTO agent_traces
                (user_id, session_id, agent_name, step_type, title, content, tool_name, tool_input, tool_output, confidence)
             VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?)`,
            [
                userId,
                sessionId,
                trace.agentName,
                stepType,
                title,
                content,
                toolName,
                JSON.stringify(toolInput || {}),
                JSON.stringify(toolOutput || {}),
                confidence
            ]
        ).catch(() => {});
        return trace;
    }

    async recordEvent({ userId, eventType, subject = null, knowledgeNodeId = null, targetType = null, targetId = null, payload = {} }) {
        try {
            const [columns] = await this.pool.query("SHOW COLUMNS FROM learning_events");
            const names = new Set(columns.map(col => col.Field));
            if (names.has("payload")) {
                await this.pool.query(
                    `INSERT INTO learning_events
                        (user_id, event_type, subject, knowledge_node_id, target_type, target_id, payload)
                     VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON))`,
                    [userId, eventType, subject, knowledgeNodeId, targetType, targetId, JSON.stringify(payload)]
                );
                return;
            }
            if (names.has("context_json")) {
                await this.pool.query(
                    `INSERT INTO learning_events
                        (user_id, session_id, event_type, page, subject, knowledge_id, target_id, target_type, duration_ms, context_json, client_ts)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
                    [
                        userId,
                        payload.sessionId || null,
                        eventType,
                        payload.page || null,
                        subject,
                        knowledgeNodeId,
                        targetId,
                        targetType,
                        Number(payload.durationMs || 0),
                        JSON.stringify(payload),
                        Date.now()
                    ]
                );
            }
        } catch (error) {
            /* learning event logging should not block agent execution */
        }
    }

    async recordDecision({ userId, sessionId, decisionType, triggerEvent, observation, reasoning, toolsCalled, decisionSummary, decisionDetail, confidence }) {
        const [result] = await this.pool.query(
            `INSERT INTO agent_decisions
                (user_id, session_id, decision_type, trigger_event, 
                 observation_json, reasoning, tools_called,
                 decision_summary, decision_detail, confidence)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                userId,
                sessionId,
                decisionType,
                triggerEvent || null,
                observation ? JSON.stringify(observation) : null,
                reasoning || null,
                toolsCalled ? JSON.stringify(toolsCalled) : null,
                decisionSummary || null,
                decisionDetail ? JSON.stringify(decisionDetail) : null,
                confidence || null
            ]
        ).catch(() => {});
        return result?.insertId;
    }

    async run({ userId, message = "", intent = "", context = {} }) {
        await this.ensureSchema();
        const sessionId = this.createSessionId();
        const resolvedIntent = this.inferIntent(message, intent);
        const subject = this.inferSubject(message, context.subject || "all");
        const sourceName = this.inferSourceName(message, context);
        const goal = String(context.goal || message || "完成今日智能学习闭环").trim();
        const durationDays = Number(context.durationDays || this.inferDurationDays(message));
        const intensity = context.intensity || "normal";
        const executionPlan = this.createExecutionPlan({ intent: resolvedIntent, message, context, sourceName });
        const shouldRun = tool => executionPlan.some(step => step.tool === tool);
        const traces = [];

        traces.push(await this.recordTrace({
            userId,
            sessionId,
            stepType: "observe",
            title: "读取学习目标与上下文",
            content: `用户目标：${goal}；识别意图：${resolvedIntent}；学科：${subject}；资料源：${sourceName || "平台知识库"}。`,
            confidence: 0.86
        }));
        traces.push(await this.recordTrace({
            userId,
            sessionId,
            stepType: "plan",
            title: "动态选择工具链",
            content: executionPlan.map((step, index) => `${index + 1}. ${step.tool}: ${step.reason}`).join("\n"),
            toolName: "AgentPlanner",
            toolInput: { intent: resolvedIntent, sourceName, goal },
            toolOutput: { executionPlan },
            confidence: 0.84
        }));
        await this.recordEvent({
            userId,
            eventType: "agent_goal_submitted",
            subject,
            targetType: "agent_session",
            payload: { message, intent: resolvedIntent, goal, durationDays }
        });

        let profile = { weakPoints: [], answerStats: {}, recentEvents: [], notes: [], averageMastery: 0, summary: "本次未读取画像。" };
        let publicSource = null;
        let rag = null;
        let resources = { courses: [], questions: [], summary: "本次未匹配课程资源。" };
        let practice = { tasks: [], questions: [], summary: "本次未生成练习策略。" };
        let courseDesign = null;
        let path = { generated: 0, pathNodes: [], summary: "本次未写入学习路径。" };
        let note = { noteId: null, title: "", summary: "本次未生成笔记任务。" };

        profile = await this.tools.profile.run({ userId, subject });
        traces.push(await this.recordTrace({
            userId,
            sessionId,
            stepType: "tool_result",
            title: "画像与薄弱点分析",
            content: profile.summary,
            toolName: "ProfileTool",
            toolInput: { userId, subject },
            toolOutput: { weakPoints: profile.weakPoints.slice(0, 3), answerStats: profile.answerStats },
            confidence: profile.weakPoints.length ? 0.82 : 0.56
        }));

        if (shouldRun("publicSource")) {
            publicSource = await this.tools.publicSource.run({ sourceName: sourceName || "all", limit: sourceName ? 1 : 4 });
            traces.push(await this.recordTrace({
                userId,
                sessionId,
                stepType: "tool_result",
                title: "公开资料抓取入库",
                content: publicSource.summary,
                toolName: "PublicSourceTool",
                toolInput: { sourceName: sourceName || "all" },
                toolOutput: { documents: publicSource.documents, errors: publicSource.errors?.slice(0, 3) },
                confidence: publicSource.chunkCount ? 0.86 : 0.52
            }));
        }

        if (shouldRun("rag")) {
            rag = await this.tools.rag.run({ query: goal, subject, sourceName, userId });
            traces.push(await this.recordTrace({
                userId,
                sessionId,
                stepType: "tool_result",
                title: "RAG 证据检索",
                content: rag.summary,
                toolName: "RagTool",
                toolInput: { query: goal, subject, sourceName },
                toolOutput: { hitCount: rag.hitCount, citations: rag.citations?.slice(0, 3) },
                confidence: rag.hitCount ? 0.84 : 0.45
            }));
        }

        resources = await this.tools.resource.run({ subject, weakPoints: profile.weakPoints });
        traces.push(await this.recordTrace({
            userId,
            sessionId,
            stepType: "tool_result",
            title: "课程资源与题库匹配",
            content: resources.summary,
            toolName: "ResourceTool",
            toolInput: { subject, weakPointCount: profile.weakPoints.length },
            toolOutput: { courseCount: resources.courses.length, questionCount: resources.questions.length },
            confidence: 0.78
        }));

        if (shouldRun("practice")) {
            practice = await this.tools.practice.run({ weakPoints: profile.weakPoints, intensity });
            traces.push(await this.recordTrace({
                userId,
                sessionId,
                stepType: "tool_result",
                title: "生成练习策略",
                content: practice.summary,
                toolName: "PracticeTool",
                toolInput: { intensity },
                toolOutput: { taskCount: practice.tasks.length, questionCount: practice.questions.length },
                confidence: 0.8
            }));
        }

        if (shouldRun("courseDesign")) {
            courseDesign = await this.tools.courseDesign.run({ userId, goal, subject, durationDays, profile, resources, practice });
            traces.push(await this.recordTrace({
                userId,
                sessionId,
                stepType: "plan",
                title: "设计个性化课程",
                content: courseDesign.summary,
                toolName: "CourseDesignTool",
                toolInput: { goal, subject, durationDays },
                toolOutput: { designId: courseDesign.designId, units: courseDesign.design.units.slice(0, 3) },
                confidence: courseDesign.design.agentDecision.confidence
            }));
        }

        if (shouldRun("path")) {
            path = await this.tools.path.run({ userId, goal, subject, intensity, weakPoints: profile.weakPoints, resources, practice });
            traces.push(await this.recordTrace({
                userId,
                sessionId,
                stepType: "write_back",
                title: "写入今日学习任务",
                content: path.summary,
                toolName: "PathTool",
                toolInput: { goal, subject, intensity },
                toolOutput: { generated: path.generated, pathNodes: path.pathNodes.slice(0, 3) },
                confidence: 0.84
            }));
        }

        if (shouldRun("note")) {
            note = await this.tools.note.run({ userId, goal, weakPoints: profile.weakPoints, mode: resolvedIntent });
            traces.push(await this.recordTrace({
                userId,
                sessionId,
                stepType: "write_back",
                title: "生成复盘任务卡",
                content: note.summary,
                toolName: "NoteTool",
                toolInput: { goal, mode: resolvedIntent },
                toolOutput: { noteId: note.noteId, title: note.title },
                confidence: 0.76
            }));
        }

        const nextActions = [
            path.generated ? `完成今日 ${path.generated} 个智能体任务。` : "先完成一次诊断，建立学习画像。",
            courseDesign ? `按 ${durationDays} 天课程设计推进，今天先完成第 1 个学习单元。` : "先完成薄弱点专项练习。",
            note.noteId ? "今晚复习 AI 任务卡，并标记掌握情况。" : "把今天的错因写成一张复盘卡。"
        ];

        const answer = [
            `我已经把你的目标「${goal}」转成可执行学习闭环。`,
            profile.summary,
            publicSource ? publicSource.summary : "",
            rag ? `RAG 检索：${rag.answer}` : "",
            resources.summary,
            practice.summary,
            path.summary,
            courseDesign ? `课程设计：${courseDesign.summary}` : "",
            "下一步：",
            ...nextActions.map((item, index) => `${index + 1}. ${item}`)
        ].filter(Boolean).join("\n\n");

        traces.push(await this.recordTrace({
            userId,
            sessionId,
            stepType: "reflection",
            title: "形成下一步行动",
            content: nextActions.join("；"),
            confidence: 0.82
        }));

        // 保存决策记录
        await this.recordDecision({
            userId,
            sessionId,
            decisionType: resolvedIntent,
            triggerEvent: "user_request",
            observation: {
                profile: profile.summary,
                weakPoints: profile.weakPoints.slice(0, 5),
                ragEvidence: rag?.citations?.slice(0, 5) || [],
                context: { subject, goal, durationDays, sourceName }
            },
            reasoning: `用户目标: ${goal}。动态工具链: ${executionPlan.map(step => step.tool).join(" -> ")}。画像分析: ${profile.summary}。${rag ? `RAG证据: ${rag.summary}。` : ""}资源匹配: ${resources.summary}。`,
            toolsCalled: traces
                .filter(trace => trace.toolName)
                .map(trace => ({ tool: trace.toolName, result: trace.content })),
            decisionSummary: path.summary,
            decisionDetail: {
                nextActions,
                pathNodes: path.pathNodes,
                courseDesign: courseDesign?.design || null,
                rag: rag ? { answer: rag.answer, citations: rag.citations } : null,
                publicSource: publicSource ? { documents: publicSource.documents, chunkCount: publicSource.chunkCount } : null,
                executionPlan
            },
            confidence: 0.82
        });

        return {
            success: true,
            sessionId,
            intent: resolvedIntent,
            answer,
            profile,
            resources,
            practice,
            courseDesign,
            rag,
            publicSource,
            path,
            note,
            nextActions,
            traces
        };
    }

    /**
     * 练习完成闭环：接收练习结果 → 更新掌握度 → 重新分析路径
     */
    async recordPracticeCompletion(userId, { knowledgeId, score, total, durationMs, questionIds, answers }) {
        // 1. 调用 PracticeTool.recordCompletion 更新掌握度
        const masteryResult = await this.tools.practice.recordCompletion(userId, {
            knowledgeId, score, total, durationMs, questionIds, answers
        });

        // 2. 获取当前画像（含更新后的掌握度）
        const profile = await this.tools.profile.run({ userId });

        // 3. 分析路径是否需要调整
        const pathAnalysis = await this.analyzePath(userId, {
            profile,
            recentMasteryChange: masteryResult
        });

        // 4. 保存决策记录
        await this.recordDecision({
            userId,
            sessionId: `closure-${Date.now()}`,
            decisionType: "evaluate_practice",
            triggerEvent: "practice_completed",
            observation: { masteryResult },
            reasoning: `练习完成：得分 ${score}/${total}，掌握度从 ${masteryResult.evidence.priorMastery}% → ${masteryResult.mastery}%，趋势 ${masteryResult.trend}`,
            toolsCalled: [
                { tool: "MasteryTool.recordCompletion", result: { mastery: masteryResult.mastery, trend: masteryResult.trend } },
                { tool: "ProfileTool.run", result: profile.summary },
                { tool: "analyzePath", result: pathAnalysis.summary }
            ],
            decisionSummary: pathAnalysis.summary,
            decisionDetail: {
                masteryChange: masteryResult,
                pathAdjustment: pathAnalysis.adjustment
            },
            confidence: masteryResult.confidence
        });

        return {
            mastery: masteryResult,
            pathAnalysis,
            summary: pathAnalysis.summary
        };
    }

    /**
     * 分析当前路径是否需要调整
     */
    async analyzePath(userId, { profile, recentMasteryChange } = {}) {
        if (!profile) profile = await this.tools.profile.run({ userId });

        const weakPoints = profile.weakPoints || [];
        const improved = recentMasteryChange && recentMasteryChange.trend === 'improving';
        const declined = recentMasteryChange && recentMasteryChange.trend === 'declining';

        // 分析建议
        const suggestions = [];
        if (improved) {
            suggestions.push({
                type: "advance",
                message: `知识点掌握度提升至 ${recentMasteryChange.mastery}%，建议安排下一难度节点或相关迁移练习。`,
                priority: "medium"
            });
        }
        if (declined) {
            suggestions.push({
                type: "review",
                message: `掌握度下降至 ${recentMasteryChange.mastery}%，建议增加间隔复习并检查先修知识。`,
                priority: "high"
            });
        }
        if (weakPoints.length > 0 && weakPoints[0].mastery < 40) {
            suggestions.push({
                type: "focus",
                message: `当前最弱知识点为 ${weakPoints[0].title}（掌握度 ${weakPoints[0].mastery}%），建议优先安排。`,
                priority: "high"
            });
        }

        const adjustment = {
            needsAdjustment: suggestions.length > 0,
            suggestions,
            reason: suggestions.map(s => s.message).join(' '),
            nextRecommendation: weakPoints.length > 0
                ? {
                    knowledgeId: weakPoints[0].id,
                    title: weakPoints[0].title,
                    currentMastery: weakPoints[0].mastery,
                    action: improved ? "advance" : "review"
                }
                : null
        };

        return {
            adjustment,
            summary: suggestions.length
                ? `路径评估完成：${suggestions.length} 项建议，${suggestions.filter(s => s.priority === 'high').length} 项高优先级。`
                : "当前路径无明显问题，按计划继续即可。"
        };
    }

}

module.exports = AgentRuntime;
