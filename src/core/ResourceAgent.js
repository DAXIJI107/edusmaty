// core/ResourceAgent.js
// 资源生成智能体 - 支持多种类型的个性化学习资源生成（含 RAG 溯源与质检）

const RagSearchService = require("./RagSearchService");
const { attachQuality } = require("./ResourceQualityGate");

class ResourceAgent {
    constructor(userId, pool) {
        this.userId = userId;
        this.pool = pool;
        this.ragSearch = new RagSearchService(pool);
        this.resourceTypes = {
            document: this.generateDocument.bind(this),
            ppt: this.generatePptOutline.bind(this),
            quiz: this.generateQuiz.bind(this),
            video: this.generateVideo.bind(this),
            mindmap: this.generateMindMap.bind(this),
            reading: this.generateReading.bind(this),
            practice: this.generatePracticeCase.bind(this),
            micro_lesson: this.generateMicroLesson.bind(this)
        };
    }

    async handleMessage(message) {
        console.log("ResourceAgent received message:", message);
        try {
            switch (message.type) {
                case "generate":
                    return await this.generateResources(message.content);
                case "get_types":
                    return this.getAvailableTypes();
                default:
                    throw new Error("Unsupported message type");
            }
        } catch (error) {
            console.error("ResourceAgent error:", error);
            return { error: error.message };
        }
    }

    getAvailableTypes() {
        return [
            { id: "document", name: "课程讲解文档", description: "专业知识点详解文档" },
            { id: "ppt", name: "PPT大纲", description: "课堂演示型幻灯片大纲" },
            { id: "quiz", name: "练习题目", description: "针对性练习题目生成" },
            { id: "video", name: "教学视频", description: "知识点讲解视频推荐" },
            { id: "mindmap", name: "思维导图", description: "知识结构思维导图" },
            { id: "reading", name: "拓展阅读", description: "相关文献和扩展资料" },
            { id: "practice", name: "实操案例", description: "代码实操和实践项目" },
            { id: "micro_lesson", name: "微课脚本", description: "3-8分钟讲解脚本，可接TTS/数字人" }
        ];
    }

    async collectCitations(knowledgePoint, limit = 4) {
        try {
            const result = await this.ragSearch.search({
                query: knowledgePoint,
                userId: this.userId,
                limit
            });
            const hits = result?.citations || result?.evidenceChain || [];
            return hits.slice(0, limit).map((item, index) => ({
                id: index + 1,
                chunkId: item.chunkId || item.chunk_id || null,
                title: item.title || item.knowledgePoint || knowledgePoint,
                knowledgePoint: item.knowledgePoint || item.knowledge_point || knowledgePoint,
                source: item.source?.name || item.course || "knowledge_base",
                excerpt: String(item.snippet || item.chunk_text || item.excerpt || "").slice(0, 180),
                score: item.score || item.relevance || null
            }));
        } catch (error) {
            console.warn("资源生成引用检索降级:", error.message);
            return [];
        }
    }

    formatCitationAppendix(citations = []) {
        if (!citations.length) {
            return "\n\n## 引用与溯源\n\n暂无检索到知识库片段。建议先在「资料入库」上传讲义后再生成，以降低幻觉风险。\n";
        }
        const lines = citations.map(
            c => `- [${c.id}] ${c.title}（${c.source}）: ${c.excerpt || "（无摘录）"}`
        );
        return `\n\n## 引用与溯源\n\n${lines.join("\n")}\n`;
    }

    async generateResources(params) {
        const { knowledgePoint, types = [], profile = {} } = params;

        if (!knowledgePoint) {
            return { success: false, error: "请指定知识点" };
        }

        const requestedTypes = types.length > 0 ? types : Object.keys(this.resourceTypes);
        let sharedCitations = await this.collectCitations(knowledgePoint, 4);
        if (!sharedCitations.length) {
            const node = await this.findKnowledge(knowledgePoint);
            sharedCitations = [
                {
                    id: 1,
                    chunkId: null,
                    title: node.name || knowledgePoint,
                    knowledgePoint: node.name || knowledgePoint,
                    source: node.schema === "fallback" ? "generated_knowledge_card" : "knowledge_nodes",
                    excerpt: String(node.description || `${knowledgePoint}的核心概念、应用场景与常见误区。`).slice(
                        0,
                        180
                    ),
                    score: 1
                }
            ];
        }
        const results = [];

        for (const type of requestedTypes) {
            if (this.resourceTypes[type]) {
                try {
                    let resource = await this.resourceTypes[type](knowledgePoint, profile, sharedCitations);
                    if (!resource.citations) resource.citations = sharedCitations;
                    resource = attachQuality(resource, profile.basicInfo?.major || this.inferSubject(knowledgePoint));
                    results.push(resource);
                } catch (error) {
                    console.error(`生成${type}资源失败:`, error);
                    results.push({
                        type: type,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        return {
            success: true,
            knowledgePoint: knowledgePoint,
            citationCount: sharedCitations.length,
            resources: results,
            factoryVersion: "p0-grounded-v1"
        };
    }

    async tableExists(tableName) {
        const [rows] = await this.pool.query("SHOW TABLES LIKE ?", [tableName]);
        return rows.length > 0;
    }

    async columnExists(tableName, columnName) {
        const [rows] = await this.pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
        return rows.length > 0;
    }

    async findKnowledge(knowledgePoint) {
        const keyword = `%${knowledgePoint}%`;
        if (await this.tableExists("knowledge_points")) {
            const [rows] = await this.pool.query(
                `SELECT id, title AS name, summary AS description, subject, source_url, source_name, mastery
                 FROM knowledge_points
                 WHERE title LIKE ? OR summary LIKE ? OR subject LIKE ?
                 ORDER BY
                    CASE WHEN title = ? THEN 0 WHEN title LIKE ? THEN 1 ELSE 2 END,
                    mastery ASC, id
                 LIMIT 1`,
                [keyword, keyword, keyword, knowledgePoint, keyword]
            );
            if (rows.length) return { ...rows[0], schema: "new" };
        }

        if (await this.tableExists("knowledge_nodes")) {
            const [rows] = await this.pool.query(
                "SELECT id, name, description, subject, bvid, video_platform FROM knowledge_nodes WHERE name LIKE ? LIMIT 1",
                [keyword]
            );
            if (rows.length) return { ...rows[0], schema: "legacy" };
        }

        return {
            id: null,
            name: knowledgePoint,
            description: `${knowledgePoint}的核心概念、应用场景与常见误区。`,
            subject: this.inferSubject(knowledgePoint),
            schema: "fallback"
        };
    }

    inferSubject(text) {
        const source = String(text || "").toLowerCase();
        if (/python|javascript|java|node|编程|代码|函数|循环|变量/.test(source)) return "程序设计";
        if (/算法|数据结构|数组|链表|树|动态规划/.test(source)) return "数据结构与算法";
        if (/sql|mysql|redis|数据库/.test(source)) return "数据库";
        if (/网络|tcp|http|linux|操作系统/.test(source)) return "系统与网络";
        if (/ai|机器学习|深度学习|人工智能/.test(source)) return "人工智能";
        return "计算机科学";
    }

    async generateDocument(knowledgePoint, profile, citations = []) {
        const node = await this.findKnowledge(knowledgePoint);

        const cognitiveStyle = profile.cognitiveStyle?.type || profile.preferences?.cognitiveStyle || "visual";
        const depth = profile.learningPatterns?.学习速度 === "slow" ? "详细版" : "标准版";
        const grounded = citations[0]?.excerpt || node?.description || "待补充详细说明";

        return {
            type: "document",
            title: `${knowledgePoint}知识点详解${depth}`,
            description: node?.description || `${knowledgePoint}的核心概念与应用`,
            content: await this.generateDocumentContent(knowledgePoint, node, cognitiveStyle, citations, grounded),
            format: "markdown",
            estimatedReadingTime: cognitiveStyle === "slow" ? "15分钟" : "8分钟",
            relatedKnowledge: await this.getRelatedKnowledge(knowledgePoint),
            citations
        };
    }

    async generateDocumentContent(knowledgePoint, node, cognitiveStyle, citations = [], grounded = "") {
        const evidence = citations
            .slice(0, 3)
            .map(c => `> [${c.id}] ${c.excerpt}`)
            .join("\n\n");
        const content =
            `# ${knowledgePoint}\n\n` +
            `## 一、核心概念\n\n` +
            `${grounded}\n\n` +
            (evidence ? `### 知识库证据\n\n${evidence}\n\n` : "") +
            `## 二、关键知识点\n\n` +
            `- 定义与内涵\n` +
            `- 核心原理\n` +
            `- 应用场景\n` +
            `- 常见误区\n\n` +
            `## 三、学习建议\n\n` +
            `${this.getLearningTips(cognitiveStyle)}\n` +
            this.formatCitationAppendix(citations);

        return content;
    }

    async generatePptOutline(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);
        const related = await this.getRelatedKnowledgeNames(knowledgePoint);
        const audience = profile.basicInfo?.major || node?.subject || this.inferSubject(knowledgePoint);
        const slides = [
            {
                title: `${knowledgePoint}学习目标`,
                subtitle: `面向${audience}的课堂导入`,
                bullets: [
                    `说清${knowledgePoint}的定义与使用边界`,
                    "建立从概念到案例的学习路线",
                    "用一个检查题确认理解程度"
                ],
                speakerNotes: `从学生已有经验切入，先问一个和${knowledgePoint}相关的真实问题。`
            },
            {
                title: "核心概念拆解",
                bullets: [
                    node?.description || `${knowledgePoint}的核心概念、应用场景与常见误区。`,
                    "关键术语：定义、输入输出、约束条件",
                    "判断标准：什么时候该用、什么时候不该用"
                ],
                speakerNotes: "用“定义-例子-反例”的节奏讲解，避免只背概念。"
            },
            {
                title: "知识结构图",
                bullets: [
                    "前置知识：基础语法、抽象思维、问题分解",
                    `关联知识：${related.slice(0, 3).join("、") || "典型例题、常见误区、项目实践"}`,
                    "后续迁移：练习题、项目任务、复盘笔记"
                ],
                speakerNotes: "这一页配合思维导图展示，强调知识之间的连接。"
            },
            {
                title: "课堂示例与推演",
                bullets: [
                    `选择一个${knowledgePoint}小案例`,
                    "先手算或口述流程，再落到代码/步骤",
                    "标出最容易出错的一步"
                ],
                speakerNotes: "教师边推演边停顿，让学生预测下一步。"
            },
            {
                title: "随堂练习",
                bullets: ["基础题：识别概念或判断正误", "进阶题：解释一个边界情况", "实践题：完成一个最小可运行任务"],
                speakerNotes: "练习完成后收集错误类型，为下一轮补救资源提供证据。"
            },
            {
                title: "总结与课后任务",
                bullets: [`用一句话复述${knowledgePoint}`, "整理一张主动回忆卡", "完成实操案例并记录问题"],
                speakerNotes: "收束到可提交产物，方便系统跟踪学习闭环。"
            }
        ];

        return {
            type: "ppt",
            title: `${knowledgePoint}课堂PPT大纲`,
            description: `已生成${slides.length}页课堂讲解型幻灯片结构`,
            slides,
            format: "outline",
            audience,
            estimatedDuration: "20-30分钟"
        };
    }

    getLearningTips(cognitiveStyle) {
        const tips = {
            visual: "建议配合思维导图和图示进行学习，可视化有助于理解抽象概念。",
            auditory: "建议结合讲解视频或有声读物，通过听觉加深记忆。",
            kinesthetic: "建议通过实践练习和案例操作来巩固知识点。"
        };
        return tips[cognitiveStyle] || tips.visual;
    }

    async generateQuiz(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);

        let difficulty = "medium";
        if (profile.knowledgeBase?.[knowledgePoint] > 0.7) {
            difficulty = "hard";
        } else if (profile.knowledgeBase?.[knowledgePoint] < 0.3) {
            difficulty = "easy";
        }

        let questions = [];
        if (await this.tableExists("questions")) {
            const hasKnowledgeId = await this.columnExists("questions", "knowledge_id");
            const hasNodeId = await this.columnExists("questions", "node_id");
            const hasQuestion = await this.columnExists("questions", "question");
            const hasContent = await this.columnExists("questions", "content");
            const activeFilter = (await this.columnExists("questions", "is_active"))
                ? "AND COALESCE(is_active, 1) = 1"
                : "";
            if (hasKnowledgeId && node.id) {
                const [rows] = await this.pool.query(
                    `SELECT id,
                            ${hasQuestion ? "question" : "content"} AS content,
                            'single' AS type,
                            options_json AS options,
                            correct_answer AS answer,
                            5 AS score
                     FROM questions
                     WHERE knowledge_id = ? AND (difficulty = ? OR difficulty IS NULL) ${activeFilter}
                     ORDER BY RAND() LIMIT 5`,
                    [node.id, difficulty]
                );
                questions = rows;
            } else if (hasNodeId && hasContent && node.id) {
                const [rows] = await this.pool.query(
                    `SELECT id, content, type, options, answer, score
                     FROM questions
                     WHERE node_id = ? AND (difficulty = ? OR difficulty IS NULL) ${activeFilter}
                     ORDER BY RAND() LIMIT 5`,
                    [node.id, difficulty]
                );
                questions = rows;
            }
        }

        if (questions.length === 0) {
            return {
                type: "quiz",
                title: `${knowledgePoint}专项练习`,
                description: "暂无匹配题目，已生成示例题目",
                questions: this.generateMockQuestions(knowledgePoint, difficulty),
                difficulty: difficulty,
                totalQuestions: 5
            };
        }

        return {
            type: "quiz",
            title: `${knowledgePoint}专项练习`,
            description: `共${questions.length}道${difficulty === "easy" ? "基础" : difficulty === "medium" ? "中等" : "困难"}难度题目`,
            questions: questions,
            difficulty: difficulty,
            totalQuestions: questions.length
        };
    }

    generateMockQuestions(knowledgePoint, difficulty) {
        const difficultyLabel = difficulty === "easy" ? "基础" : difficulty === "medium" ? "中等" : "困难";
        return [
            {
                id: -1,
                type: "single",
                content: `关于「${knowledgePoint}」，下列说法正确的是？`,
                options: JSON.stringify(["选项A", "选项B", "选项C", "选项D"]),
                answer: "选项A",
                score: 5
            },
            {
                id: -2,
                type: "judge",
                content: `「${knowledgePoint}」是${difficultyLabel}难度知识点。`,
                options: JSON.stringify(["正确", "错误"]),
                answer: "正确",
                score: 5
            },
            {
                id: -3,
                type: "single",
                content: `「${knowledgePoint}」的核心特点是什么？`,
                options: JSON.stringify(["特点A", "特点B", "特点C", "特点D"]),
                answer: "特点A",
                score: 5
            }
        ];
    }

    async generateVideo(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);

        const videos = [];
        if (node?.bvid) {
            videos.push({
                title: `${node.name}讲解视频`,
                url: `https://www.bilibili.com/video/${node.bvid}`,
                platform: "bilibili",
                duration: "约15分钟"
            });
        }

        videos.push({
            title: `${knowledgePoint}核心概念速讲`,
            url: node?.source_url || `/course-detail?knowledgeId=${node?.id || ""}`,
            platform: "平台内课程",
            duration: "约10分钟"
        });

        return {
            type: "video",
            title: `${knowledgePoint}视频资源`,
            description: `找到${videos.length}个相关视频资源`,
            videos: videos,
            recommendedDuration: profile.learningPatterns?.注意力持续时间 || 30
        };
    }

    async generateMindMap(knowledgePoint, profile, citations = []) {
        const node = await this.findKnowledge(knowledgePoint);
        const related = await this.getRelatedKnowledgeNames(knowledgePoint);
        const evidenceNodes = citations
            .map(c => (c.knowledgePoint || "").trim())
            .filter(Boolean)
            .slice(0, 4);

        const mindmap = {
            root: knowledgePoint,
            children: [
                {
                    name: "核心概念",
                    children: ["定义", "特点", "原理"].concat(evidenceNodes.slice(0, 1))
                },
                {
                    name: "相关知识点",
                    children: related.length ? related : evidenceNodes
                },
                {
                    name: "证据来源",
                    children: citations.length
                        ? citations.map(c => `[${c.id}] ${c.source || "知识库"}`)
                        : ["待补充资料入库"]
                },
                {
                    name: "学习路径",
                    children: ["基础", "进阶", "实践", "复习"]
                }
            ]
        };

        return {
            type: "mindmap",
            title: `${knowledgePoint}知识结构图`,
            description: "基于知识点关联与知识库证据生成的学习路径图",
            mindmap: mindmap,
            nodeId: node?.id,
            citations,
            content: `思维导图根节点：${knowledgePoint}\n关联：${related.join("、")}`
        };
    }

    async generateMicroLesson(knowledgePoint, profile, citations = []) {
        const node = await this.findKnowledge(knowledgePoint);
        const style = profile.preferences?.cognitiveStyle || profile.cognitiveStyle?.type || "visual";
        const hook = citations[0]?.excerpt || node?.description || `${knowledgePoint}的核心思想`;
        const script =
            `# 微课脚本：${knowledgePoint}\n\n` +
            `## 0. 开场（20秒）\n` +
            `今天用 5 分钟讲清「${knowledgePoint}」：它是什么、为什么重要、怎么用。\n\n` +
            `## 1. 概念锚定（90秒）\n` +
            `${hook}\n\n` +
            `## 2. 最小例子（120秒）\n` +
            `给出一个最小可运行/可推演例子，并指出最容易错的一步。\n\n` +
            `## 3. 对照检查（60秒）\n` +
            `请你用一句话复述定义，并判断一个正例和一个反例。\n\n` +
            `## 4. 收束与作业（40秒）\n` +
            `课后完成 1 道练习 + 1 张主动回忆卡。学习风格建议：${this.getLearningTips(style)}\n` +
            this.formatCitationAppendix(citations);

        return {
            type: "micro_lesson",
            title: `${knowledgePoint}微课（5分钟）`,
            description: "可直接用于 TTS / 数字人讲解的结构化脚本",
            script,
            content: script,
            format: "lesson_script",
            estimatedDuration: "5分钟",
            ttsReady: true,
            citations
        };
    }

    async getRelatedKnowledgeNames(knowledgePoint) {
        const node = await this.findKnowledge(knowledgePoint);
        if (node.schema === "new" && (await this.tableExists("knowledge_points"))) {
            const [nodes] = await this.pool.query(
                "SELECT title AS name FROM knowledge_points WHERE subject = ? AND title <> ? ORDER BY mastery ASC, id LIMIT 5",
                [node.subject, node.name]
            );
            return nodes.map(n => n.name);
        }
        if (await this.tableExists("knowledge_nodes")) {
            const [nodes] = await this.pool.query(
                "SELECT name FROM knowledge_nodes WHERE subject IN (SELECT subject FROM knowledge_nodes WHERE name LIKE ?) LIMIT 5",
                [`%${knowledgePoint}%`]
            );
            return nodes.map(n => n.name).filter(n => n !== knowledgePoint);
        }
        return ["前置概念", "典型例题", "常见误区", "项目实践"];
    }

    async generateReading(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);
        const subject = node.subject || this.inferSubject(knowledgePoint);

        const readingList = [
            {
                title: `${knowledgePoint}深度解析`,
                type: "学术论文",
                source: "CNKI",
                relevance: "high"
            },
            {
                title: `${knowledgePoint}入门到精通`,
                type: "教材章节",
                source: "高等教育出版社",
                relevance: "medium"
            },
            {
                title: `${knowledgePoint}最新研究进展`,
                type: "综述文章",
                source: "ResearchGate",
                relevance: "medium"
            },
            {
                title: `${knowledgePoint}常见问题解答`,
                type: "技术博客",
                source: "CSDN",
                relevance: "low"
            }
        ];

        return {
            type: "reading",
            title: `${knowledgePoint}拓展阅读`,
            description: `为您推荐${readingList.length}篇相关阅读材料`,
            readings: readingList,
            subject: subject
        };
    }

    async generatePracticeCase(knowledgePoint, profile, citations = []) {
        const node = await this.findKnowledge(knowledgePoint);
        const evidence = citations[0]?.excerpt || node?.description || knowledgePoint;

        let cases = [];

        if (
            /programming|程序|编程|Python|JavaScript|Java|代码|函数|循环|算法|数据结构/i.test(
                `${node?.subject || ""} ${knowledgePoint}`
            )
        ) {
            cases = [
                {
                    title: `${knowledgePoint}基础实践`,
                    type: "代码示例",
                    difficulty: "easy",
                    estimatedTime: "30分钟",
                    content:
                        `# ${knowledgePoint}实践案例\n\n## 目标\n基于证据理解并实现最小版本：\n> ${evidence}\n\n## 步骤\n1. 写出输入/输出约定\n2. 实现核心函数\n3. 补 2 个边界测试\n\n## 代码框架\n\`\`\`python\ndef solve(data):\n    """实现 ${knowledgePoint} 的最小可运行版本"""\n    # TODO: 根据知识库证据完成实现\n    return data\n\nif __name__ == "__main__":\n    assert solve([1, 2, 3]) is not None\n    print("ok")\n\`\`\``
                },
                {
                    title: `${knowledgePoint}综合项目`,
                    type: "项目实战",
                    difficulty: "hard",
                    estimatedTime: "2小时",
                    content: `# ${knowledgePoint}综合项目\n\n## 项目描述\n将「${knowledgePoint}」嵌入一个小工具（CLI/API/可视化其一）。\n\n## 验收\n- 有 README\n- 有测试\n- 能解释与知识库证据的对应关系`
                }
            ];
        } else {
            cases = [
                {
                    title: `${knowledgePoint}应用题解`,
                    type: "例题解析",
                    difficulty: "medium",
                    estimatedTime: "15分钟",
                    content: `# ${knowledgePoint}例题详解\n\n## 背景证据\n> ${evidence}\n\n## 题目\n请用自己的话解释该概念，并给出一个正例与反例。\n\n## 评分点\n定义准确、边界清楚、能迁移到新场景。`
                },
                {
                    title: `${knowledgePoint}实验报告`,
                    type: "实验指导",
                    difficulty: "hard",
                    estimatedTime: "1小时",
                    content: `# ${knowledgePoint}实验报告\n\n## 实验目的\n验证核心性质并记录失败案例。\n\n## 实验步骤\n1. 复述定义\n2. 设计对照实验\n3. 记录结果与误区`
                }
            ];
        }

        return {
            type: "practice",
            title: `${knowledgePoint}实操案例`,
            description: `为您推荐${cases.length}个实践项目`,
            cases: cases,
            subject: node?.subject,
            citations,
            content: cases.map(c => c.content).join("\n\n")
        };
    }

    async getRelatedKnowledge(knowledgePoint) {
        return (await this.getRelatedKnowledgeNames(knowledgePoint)).slice(0, 3);
    }
}

module.exports = ResourceAgent;
