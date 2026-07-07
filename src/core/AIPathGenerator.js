// core/AIPathGenerator.js
// 画像驱动的学习路径生成器
// 整合 student_profiles 中的学习风格、时间、专注度等数据
const DIFFICULTY_MINUTES = { easy: 30, medium: 60, hard: 90 };
const DIFFICULTY_SCORE = { easy: 1, medium: 2, hard: 3 };

// VARK 学习风格 → 资源类型权重
const VARK_RESOURCE_WEIGHTS = {
    visual: { lecture: 1.0, video: 1.5, exercise: 0.8, lab: 1.0, diagram: 1.3 },
    auditory: { lecture: 1.3, video: 0.9, exercise: 0.7, lab: 0.8, podcast: 1.5 },
    reading: { lecture: 1.5, video: 0.7, exercise: 1.0, lab: 0.8, document: 1.4 },
    kinesthetic: { lecture: 0.7, video: 0.9, exercise: 1.5, lab: 1.6, project: 1.3 }
};

const DEFAULT_WEIGHTS = VARK_RESOURCE_WEIGHTS.reading;

function normalizeDifficulty(value) {
    return ["easy", "medium", "hard"].includes(value) ? value : "medium";
}

function masteryBand(mastery) {
    if (mastery >= 80) return "mastered";
    if (mastery >= 60) return "consolidating";
    if (mastery >= 40) return "weak";
    return "remedial";
}

function recommendDifficulty(masteries) {
    if (!masteries.length) return 2;
    const avg = masteries.reduce((sum, item) => sum + item, 0) / masteries.length;
    if (avg >= 76) return 3;
    if (avg >= 45) return 2;
    return 1;
}

function buildReason(node, prereqCount) {
    const band = masteryBand(node.mastery);
    if (band === "remedial") return `掌握度仅 ${node.mastery}%，建议先补救再进入后续节点`;
    if (band === "weak") return `掌握度 ${node.mastery}%，适合安排讲解与练习巩固`;
    if (prereqCount > 0) return "前置节点已满足，可作为下一阶段进阶学习";
    return "基础节点优先学习，帮助后续知识衔接";
}

class AIPathGenerator {
    /**
     * 读取用户画像数据
     */
    async loadUserProfile(userId, pool) {
        try {
            const [rows] = await pool.query("SELECT profile_json FROM student_profiles WHERE user_id = ?", [userId]);
            if (rows.length > 0) {
                const profile =
                    typeof rows[0].profile_json === "string" ? JSON.parse(rows[0].profile_json) : rows[0].profile_json;
                return profile || {};
            }
        } catch (error) {
            console.warn("读取用户画像失败，使用默认值:", error.message);
        }
        return {};
    }

    /**
     * 从画像中提取学习风格权重
     */
    getStyleWeights(profile) {
        const style = [
            profile.learningStyle,
            profile.learning_style,
            profile.cognitiveStyle?.type,
            profile.q_learn_prefer
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        // 尝试映射：visual/auditory/reading/kinesthetic
        for (const [key, weights] of Object.entries(VARK_RESOURCE_WEIGHTS)) {
            if (style.includes(key)) return weights;
        }
        const preferences = profile.multimodalPreferences || profile.multimodal_preferences || {};
        const preferenceMap = {
            视觉: "visual",
            visual: "visual",
            听觉: "auditory",
            auditory: "auditory",
            阅读: "reading",
            reading: "reading",
            readwrite: "reading",
            触觉: "kinesthetic",
            互动: "kinesthetic",
            kinesthetic: "kinesthetic",
            experiment: "kinesthetic"
        };
        const preferred = Object.entries(preferences)
            .map(([key, value]) => ({ key: preferenceMap[key] || key, value: Number(value || 0) }))
            .filter(item => VARK_RESOURCE_WEIGHTS[item.key])
            .sort((a, b) => b.value - a.value)[0];
        if (preferred) return VARK_RESOURCE_WEIGHTS[preferred.key];
        // 回退：检查概览风格字段
        const overview = profile.overview || profile.style || {};
        const mapped = String(overview.primaryStyle || overview.preferredStyle || "").toLowerCase();
        for (const [key, weights] of Object.entries(VARK_RESOURCE_WEIGHTS)) {
            if (mapped.includes(key)) return weights;
        }
        return DEFAULT_WEIGHTS;
    }

    /**
     * 从画像中提取每日可用学习分钟数
     */
    getDailyMinutes(profile) {
        // 来自诊断问卷 q_daily_time 的 meta.minutes
        if (profile.dailyTimeMinutes) return Number(profile.dailyTimeMinutes);
        if (profile.daily_time_minutes) return Number(profile.daily_time_minutes);
        // 来自学习习惯
        const habits = profile.habits || profile.learning_habits || {};
        if (habits.dailyMinutes) return Number(habits.dailyMinutes);
        if (habits.daily_minutes) return Number(habits.daily_minutes);
        return 60; // 默认 60 分钟
    }

    /**
     * 从画像中提取专注时长（分钟）
     */
    getAttentionSpan(profile) {
        if (profile.attentionSpanMinutes) return Number(profile.attentionSpanMinutes);
        if (profile.attention_span_minutes) return Number(profile.attention_span_minutes);
        if (profile.learningPatterns?.["注意力持续时间"]) return Number(profile.learningPatterns["注意力持续时间"]);
        if (profile.learning_patterns?.["注意力持续时间"]) return Number(profile.learning_patterns["注意力持续时间"]);
        const habits = profile.habits || profile.learning_habits || {};
        if (habits.attentionSpan) return Number(habits.attentionSpan);
        if (habits.attention_span) return Number(habits.attention_span);
        return 30; // 默认 30 分钟
    }

    getProfileContext(profile, styleWeights, dailyMinutes, attentionSpan) {
        const styleLabels = {
            visual: "视觉型",
            auditory: "听觉型",
            reading: "读写型",
            kinesthetic: "实践型"
        };
        const primaryStyle =
            Object.entries(VARK_RESOURCE_WEIGHTS).find(([, weights]) => weights === styleWeights)?.[0] || "reading";
        const preferredResources = Object.entries(styleWeights || DEFAULT_WEIGHTS)
            .filter(([, weight]) => weight >= 1.3)
            .map(([key]) => key);
        return {
            primaryStyle,
            primaryStyleLabel: styleLabels[primaryStyle] || "读写型",
            learningStyle: preferredResources,
            dailyMinutes,
            attentionSpan,
            suggestedPerDay: null,
            estimatedDays: null,
            evidence: [
                `学习风格：${styleLabels[primaryStyle] || "读写型"}`,
                `每日可用：约 ${dailyMinutes} 分钟`,
                `专注时长：约 ${attentionSpan} 分钟`
            ],
            source: profile.updatedAt || profile.updated_at ? "student_profiles" : "default"
        };
    }

    /**
     * 生成学习路径（画像驱动版）
     */
    async generate(userId, pool, subject = null) {
        // 加载画像
        const profile = await this.loadUserProfile(userId, pool);
        const styleWeights = this.getStyleWeights(profile);
        const dailyMinutes = this.getDailyMinutes(profile);
        const attentionSpan = this.getAttentionSpan(profile);
        const profileContext = this.getProfileContext(profile, styleWeights, dailyMinutes, attentionSpan);

        const params = [];
        let whereClause = "";
        if (subject && subject !== "all") {
            whereClause = "WHERE subject = ?";
            params.push(subject);
        }

        const [nodes] = await pool.query(
            `SELECT id, name, description, difficulty, type, subject
             FROM knowledge_nodes
             ${whereClause}
             ORDER BY id`,
            params
        );
        let prereqMap = {};
        try {
            const [prereqs] = await pool.query("SELECT node_id, prereq_id FROM prerequisites");
            prereqs.forEach(row => {
                const key = Number(row.node_id);
                if (!prereqMap[key]) prereqMap[key] = [];
                prereqMap[key].push(Number(row.prereq_id));
            });
        } catch (e) {
            // prerequisites 表可能不存在，忽略
        }
        let masteryMap = {};
        try {
            const [masteryRows] = await pool.query(
                `SELECT q.knowledge_id AS node_id,
                        SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(ua.id), 0) * 100 AS mastery
                 FROM questions q
                 LEFT JOIN user_answers ua ON ua.question_id = q.id AND ua.user_id = ?
                 WHERE q.knowledge_id IS NOT NULL
                 GROUP BY q.knowledge_id`,
                [userId]
            );
            masteryRows.forEach(row => {
                masteryMap[Number(row.node_id)] = Math.round(Number(row.mastery || 0));
            });
        } catch (e) {
            // 忽略，masteryMap 为空
        }

        const nodeIdSet = new Set(nodes.map(item => Number(item.id)));
        const masteryValues = nodes.map(node => masteryMap[Number(node.id)] || 0);
        const targetDifficulty = recommendDifficulty(masteryValues);
        const nodeMap = {};

        nodes.forEach(node => {
            nodeMap[Number(node.id)] = {
                ...node,
                id: Number(node.id),
                difficulty: normalizeDifficulty(node.difficulty),
                mastery: masteryMap[Number(node.id)] || 0,
                prereqs: [],
                children: []
            };
        });

        // 从 prereqMap 构建先决关系
        for (const [nodeId, prereqIds] of Object.entries(prereqMap)) {
            const nid = Number(nodeId);
            if (!nodeIdSet.has(nid)) continue;
            for (const prereqId of prereqIds) {
                const pid = Number(prereqId);
                if (!nodeIdSet.has(pid)) continue;
                nodeMap[nid].prereqs.push(pid);
                nodeMap[pid].children.push(nid);
            }
        }

        const inDegree = {};
        Object.values(nodeMap).forEach(node => {
            inDegree[node.id] = node.prereqs.length;
        });

        const available = Object.values(nodeMap)
            .filter(node => inDegree[node.id] === 0)
            .map(node => node.id);
        const visited = new Set();
        const path = [];

        while (available.length > 0) {
            available.sort(
                (a, b) => this.priority(nodeMap[b], targetDifficulty) - this.priority(nodeMap[a], targetDifficulty)
            );
            const cur = available.shift();
            if (visited.has(cur)) continue;

            const node = nodeMap[cur];
            const blockedByWeakPrereq = node.prereqs.some(prereqId => {
                const prereq = nodeMap[prereqId];
                return prereq && prereq.mastery < 50 && !visited.has(prereqId);
            });
            if (blockedByWeakPrereq) {
                available.push(cur);
                if (available.every(id => id === cur)) break;
                continue;
            }

            visited.add(cur);
            path.push(node);

            node.children.forEach(childId => {
                inDegree[childId] -= 1;
                if (inDegree[childId] === 0 && !visited.has(childId)) {
                    available.push(childId);
                }
            });
        }

        Object.values(nodeMap)
            .filter(node => !visited.has(node.id))
            .sort((a, b) => this.priority(b, targetDifficulty) - this.priority(a, targetDifficulty))
            .forEach(node => path.push(node));

        // 根据每日可用时间和专注时长计算建议每日任务数
        const avgEstimateMin =
            path.reduce((s, n) => s + DIFFICULTY_MINUTES[n.difficulty], 0) / Math.max(path.length, 1);
        const suggestedPerDay = Math.max(1, Math.round(dailyMinutes / Math.max(avgEstimateMin, 15)));

        const steps = path.map((node, index) => {
            const prereqCount = node.prereqs.length;
            const band = masteryBand(node.mastery);
            // 专注时长分段：如果节点预估时间超过专注时长，拆分提示
            const estimateMinutes = DIFFICULTY_MINUTES[node.difficulty];
            const needsBreak = estimateMinutes > attentionSpan;
            const step = {
                id: node.id,
                name: node.name,
                description: node.description || "",
                difficulty: node.difficulty,
                subject: node.subject || "general",
                mastery: node.mastery,
                masteryBand: band,
                estimate: estimateMinutes,
                prereqCount,
                bvid: node.bvid || null,
                priorityScore: Number(this.priority(node, targetDifficulty).toFixed(2)),
                reason: buildReason(node, prereqCount),
                isRemedial: node.mastery < 50,
                needsBreak,
                sessionIndex: Math.floor(index / suggestedPerDay) + 1,
                resources: this.buildResources(node, index, styleWeights, profile)
            };
            step.personalizedReason = `${profileContext.primaryStyleLabel}画像优先匹配${
                step.resources
                    .filter(item => item.isPreferred)
                    .map(item => item.type)
                    .join("、") || "基础"
            }资源；按 ${attentionSpan} 分钟专注时长${needsBreak ? "建议拆分学习。" : "可一次完成。"}`;
            return step;
        });

        // 从 prereqMap 构建图谱边
        const links = [];
        for (const [nodeId, prereqIds] of Object.entries(prereqMap)) {
            const nid = Number(nodeId);
            if (!nodeIdSet.has(nid)) continue;
            for (const prereqId of prereqIds) {
                const pid = Number(prereqId);
                if (!nodeIdSet.has(pid)) continue;
                links.push({ source: pid, target: nid });
            }
        }

        const subjects = [...new Set(steps.map(step => step.subject).filter(Boolean))];
        const totalMinutes = steps.reduce((s, step) => s + step.estimate, 0);
        const estimatedDays = Math.max(1, Math.ceil(totalMinutes / Math.max(dailyMinutes, 15)));

        return {
            steps,
            links,
            subjects,
            profileContext: {
                ...profileContext,
                suggestedPerDay,
                estimatedDays
            },
            strategy: {
                targetDifficulty,
                rule: "topological-prerequisite + mastery-weight + adaptive-difficulty + profile-aware",
                replanTrigger: "mastery < 50 or assessment weak node",
                pacing: `建议每天完成 ${suggestedPerDay} 个节点（约 ${Math.round(suggestedPerDay * avgEstimateMin)} 分钟）`
            },
            stats: {
                total: steps.length,
                mastered: steps.filter(s => s.mastery >= 80).length,
                toLearn: steps.filter(s => s.mastery < 80).length,
                estimateTime: Math.round(totalMinutes / 60)
            }
        };
    }

    priority(node, targetDifficulty) {
        const masteryGap = Math.max(0, 100 - Number(node.mastery || 0)) / 100;
        const weakBonus = node.mastery < 50 ? 0.35 : node.mastery < 70 ? 0.18 : -0.18;
        const difficultyDistance = Math.abs(DIFFICULTY_SCORE[node.difficulty] - targetDifficulty);
        const difficultyFit = 1 - difficultyDistance * 0.22;
        const unlockValue = Math.min(0.28, (node.children?.length || 0) * 0.07);
        return masteryGap * 0.52 + difficultyFit * 0.22 + weakBonus + unlockValue;
    }

    /**
     * 根据学习风格权重生成个性化资源推荐
     */
    buildResources(node, index, styleWeights, profile) {
        const topic = node.name;
        const weights = styleWeights || DEFAULT_WEIGHTS;

        // 按权重排序资源类型
        const weightedTypes = Object.entries(weights).sort(([, a], [, b]) => b - a);

        const allResources = [];

        for (const [type, weight] of weightedTypes) {
            if (weight < 0.7) continue; // 跳过低权重类型

            switch (type) {
                case "lecture":
                    allResources.push({
                        title: `${topic}讲稿与核心概念`,
                        type: "document",
                        duration: 12,
                        weight,
                        isPreferred: weight >= 1.3
                    });
                    break;
                case "video":
                    allResources.push({
                        title: `${topic}10分钟精讲`,
                        type: "video",
                        duration: 10,
                        bvid: node.bvid || null,
                        weight,
                        isPreferred: weight >= 1.3
                    });
                    break;
                case "exercise":
                    allResources.push({
                        title: `${topic}专项练习`,
                        type: "quiz",
                        count: weight >= 1.4 ? 8 : 5,
                        weight,
                        isPreferred: weight >= 1.3
                    });
                    break;
                case "lab":
                    allResources.push({
                        title: `${topic}微实验 ${index + 1}`,
                        type: "lab",
                        duration: node.difficulty === "hard" ? 35 : 20,
                        weight,
                        isPreferred: weight >= 1.3
                    });
                    break;
                case "diagram":
                    allResources.push({
                        title: `${topic}概念图解`,
                        type: "diagram",
                        duration: 5,
                        weight,
                        isPreferred: weight >= 1.3
                    });
                    break;
                case "podcast":
                    allResources.push({
                        title: `${topic}音频精讲`,
                        type: "audio",
                        duration: 8,
                        weight,
                        isPreferred: weight >= 1.3
                    });
                    break;
                case "document":
                    allResources.push({
                        title: `${topic}深度阅读材料`,
                        type: "document",
                        duration: 15,
                        weight,
                        isPreferred: weight >= 1.3
                    });
                    break;
                case "project":
                    allResources.push({
                        title: `${topic}实战项目`,
                        type: "project",
                        duration: node.difficulty === "hard" ? 45 : 25,
                        weight,
                        isPreferred: weight >= 1.3
                    });
                    break;
                default:
                    break;
            }
        }

        // 取前 4 个资源，但确保至少有 2 个
        const topResources = allResources.slice(0, 4);
        if (topResources.length < 2) {
            // 补充默认资源
            topResources.push(
                { title: `${topic}讲稿与核心概念`, type: "document", duration: 12, weight: 1.0, isPreferred: false },
                { title: `${topic}专项练习`, type: "quiz", count: 5, weight: 1.0, isPreferred: false }
            );
        }

        return topResources;
    }

    /**
     * LLM 增强路径生成
     * 在规则引擎基础上，由 LLM 审查路径合理性并调整优先级
     */
    async generateWithLLM(userId, pool, subject = null) {
        // 1. 先运行规则引擎生成初始路径
        const baseResult = await this.generate(userId, pool, subject);
        const steps = baseResult.steps || [];

        if (steps.length <= 2) return baseResult; // 节点太少不需要 LLM

        try {
            const llmGateway = require("./llm/LlmGateway");

            // 2. 构建 LLM prompt — 描述候选节点和当前顺序
            const nodeDescriptions = steps
                .map((step, i) => {
                    const band = step.masteryBand;
                    const bandLabel =
                        { mastered: "已掌握", consolidating: "巩固中", weak: "薄弱", remedial: "需补救" }[band] || band;
                    return `${i + 1}.「${step.name}」掌握度${step.mastery}(${bandLabel}) 难度${step.difficulty} 所属学科${step.subject} 前置数${step.prereqCount}`;
                })
                .join("\n");

            const messages = [
                {
                    role: "system",
                    content: [
                        "你是 EduSmart 学习路径优化专家。",
                        "基于学生的掌握度、节点难度和前置依赖，审查当前学习路径排序是否合理。",
                        "",
                        "规则：",
                        "- 掌握度 < 50 的薄弱节点应排在靠前位置（基数）",
                        "- 前置依赖未满足的节点应排在其所有前置之后",
                        "- 难度低的节点通常排在前面，形成渐进式难度",
                        "- 同一学科的节点尽量连续排列，减少上下文切换",
                        "",
                        "输出格式：返回一个 JSON 对象，包含：",
                        "{",
                        '  "adjustments": [{"index": 原始序号, "newIndex": 建议新序号, "reason": "原因"}],',
                        '  "summary": "一句话总结调整策略",',
                        '  "estimatedEffectiveness": 0-100 评分',
                        "}",
                        "adjustments 数组只列出有调整的节点，不需要列出全部。",
                        "注意：originalIndex 指当前 1-based 序号。"
                    ].join("\n")
                },
                {
                    role: "user",
                    content: `以下是当前${steps.length}个节点的排序（共${baseResult.stats?.toLearn || 0}个待学节点）：\n${nodeDescriptions}\n\n请审查并给出调整建议。`
                }
            ];

            const result = await llmGateway.chat({
                messages,
                temperature: 0.3,
                maxTokens: 1200,
                fallbackContent: ""
            });

            // 3. 解析 LLM 返回的调整建议
            let llmAdjustments = null;
            try {
                let content = result.content || "";
                // 先剥离 markdown 代码块
                const codeFenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (codeFenceMatch) {
                    content = codeFenceMatch[1].trim();
                }
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    llmAdjustments = JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                console.warn("LLM 路径调整解析失败，使用规则引擎结果:", parseError.message);
            }

            // 4. 应用 LLM 调整
            if (llmAdjustments?.adjustments?.length > 0) {
                const stepArray = [...steps];
                for (const adj of llmAdjustments.adjustments) {
                    // 兼容多种 JSON 字段名变体（index/originalIndex/oldPosition, newIndex/targetIndex/newPosition）
                    const fromIdx = (adj.index || adj.originalIndex || adj.oldPosition) - 1;
                    const toIdx = (adj.newIndex || adj.targetIndex || adj.newPosition) - 1;
                    if (fromIdx >= 0 && fromIdx < stepArray.length && toIdx >= 0 && toIdx < stepArray.length) {
                        const [moved] = stepArray.splice(fromIdx, 1);
                        stepArray.splice(toIdx, 0, moved);
                        moved.llmAdjusted = true;
                        moved.adjustReason = adj.reason || "";
                    }
                }

                // 重新计算 session 分组
                const dailyMinutes = this.getDailyMinutes(await this.loadUserProfile(userId, pool));
                const avgEstimateMin =
                    stepArray.reduce((s, n) => s + (n.estimate || 30), 0) / Math.max(stepArray.length, 1);
                const suggestedPerDay = Math.max(1, Math.round(dailyMinutes / Math.max(avgEstimateMin, 15)));
                stepArray.forEach((step, index) => {
                    step.sessionIndex = Math.floor(index / suggestedPerDay) + 1;
                });

                return {
                    ...baseResult,
                    steps: stepArray,
                    strategy: {
                        ...baseResult.strategy,
                        rule: baseResult.strategy.rule + " + LLM-augmented",
                        llmAdjustments: llmAdjustments.adjustments.length,
                        llmSummary: llmAdjustments.summary || "",
                        llmEffectiveness: llmAdjustments.estimatedEffectiveness || 0
                    }
                };
            }
        } catch (error) {
            console.warn("LLM 路径增强失败，回退到规则引擎:", error.message);
        }

        // LLM 不可用时返回原始结果
        return {
            ...baseResult,
            strategy: { ...baseResult.strategy, rule: baseResult.strategy.rule + " (LLM unavailable, fallback)" }
        };
    }

    /**
     * Agentic 路径生成：使用 AgenticLearningAgent 进行真正的智能推理
     * 借鉴 DeepTutor 的 Agent-Native 设计，不仅调整顺序，而是重新推理学习路径
     */
    async generateWithAgent(userId, pool, subject = null) {
        try {
            const AgenticLearningAgent = require("./AgenticLearningAgent");
            const agent = new AgenticLearningAgent(userId, pool);

            // 先运行规则引擎获取基础数据
            const baseResult = await this.generate(userId, pool, subject);

            // 让 Agent 推理下一步
            const agentReasoning = await agent.reasonNextStep();

            // 获取Agent状态摘要
            const agentStatus = agent.getStatus();

            // 标记Agent推荐的知识点在路径中的优先级
            const steps = baseResult.steps || [];
            const recommendedTopic = agentReasoning.topic || "";

            if (recommendedTopic) {
                // 找到Agent推荐的知识点在路径中的位置，将其提前
                const matchIdx = steps.findIndex(
                    s => s.name.includes(recommendedTopic) || recommendedTopic.includes(s.name)
                );
                if (matchIdx > 0) {
                    const [target] = steps.splice(matchIdx, 1);
                    target.agentRecommended = true;
                    target.agentReason = agentReasoning.reason || "";
                    target.agentMethod = agentReasoning.method || "";
                    steps.unshift(target);

                    // 重新计算session分组
                    const dailyMinutes = agentStatus._dailyMinutes || 60;
                    const avgMin = steps.reduce((s, n) => s + (n.estimate || 30), 0) / Math.max(steps.length, 1);
                    const perDay = Math.max(1, Math.round(dailyMinutes / Math.max(avgMin, 15)));
                    steps.forEach((step, index) => {
                        step.sessionIndex = Math.floor(index / perDay) + 1;
                    });
                }
            }

            return {
                ...baseResult,
                steps,
                agentInsight: {
                    recommendedTopic: agentReasoning.topic,
                    reason: agentReasoning.reason,
                    method: agentReasoning.method,
                    estimatedMinutes: agentReasoning.estimatedMinutes,
                    agentStatus
                },
                strategy: {
                    ...baseResult.strategy,
                    rule: baseResult.strategy.rule + " + Agentic-Reasoning (DeepTutor)",
                    agentRecommended: Boolean(recommendedTopic)
                }
            };
        } catch (e) {
            console.warn("Agentic路径生成失败，回退到规则引擎:", e.message);
            return this.generate(userId, pool, subject);
        }
    }

    /**
     * 将生成的路径持久化保存到 study_plans 表
     */
    async savePathToStudyPlans(userId, pool, pathResult) {
        const StudyPlanEngine = require("./StudyPlanEngine");
        const engine = new StudyPlanEngine();

        const steps = pathResult.steps || [];
        const tasks = steps.slice(0, 8).map((step, i) => ({
            time: `Session ${i + 1}`,
            title: step.name,
            nodeId: step.id,
            subject: step.subject,
            difficulty: step.difficulty,
            duration: step.estimate,
            resources: step.resources || [],
            type: step.mastery < 50 ? "remedial" : step.mastery < 70 ? "learn" : "practice",
            priority: step.isRemedial ? "high" : "medium",
            mastery: step.mastery,
            profileAware: true,
            generatedBy: pathResult.strategy?.rule || "profile-aware",
            completed: false,
            status: "pending"
        }));

        return await engine.savePlan(pool, {
            userId,
            tasks,
            strategy: pathResult.strategy?.rule || "profile-aware"
        });
    }
}

module.exports = AIPathGenerator;
