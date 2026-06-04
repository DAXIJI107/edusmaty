class StudyPlanEngine {
    today() {
        return this.dateKey(new Date());
    }

    dateKey(value) {
        if (!value) return "";
        if (typeof value === "string") return value.split("T")[0];
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    parseJson(value, fallback) {
        if (!value) return fallback;
        if (Array.isArray(value) || typeof value === "object") return value;
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    async ensureStudyPlanTable(pool) {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS study_plans (
                id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                plan_date DATE NOT NULL,
                plan_type VARCHAR(20) NULL DEFAULT 'daily',
                tasks JSON NULL,
                ai_suggestion TEXT NULL,
                completion_rate DECIMAL(5,2) NULL DEFAULT 0,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uk_user_date (user_id, plan_date),
                INDEX idx_plan_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }

    normalizeSubject(subject) {
        const map = {
            programming: "编程",
            computer: "计算机",
            software_engineering: "软件工程",
            math: "数学",
            english: "英语",
            chinese: "语文"
        };
        return map[subject] || subject || "综合";
    }

    defaultMaterials(topic) {
        const normalized = topic || "动态规划";
        const softwareMaterials = {
            软件工程基础概念: [
                {
                    title: "软件工程基础概念讲义",
                    type: "concept",
                    source: "EduSmart 默认知识库",
                    url: "/knowledge-base?subject=software_engineering&q=软件工程基础概念",
                    instruction: "先理解软件危机、工程化和质量保证之间的关系。"
                },
                {
                    title: "软件生命周期总览",
                    type: "diagram",
                    source: "EduSmart 默认知识库",
                    url: "/knowledge-base?subject=software_engineering&q=生命周期",
                    instruction: "画出需求、设计、实现、测试、维护的顺序和反馈关系。"
                },
                {
                    title: "软件工程基础练习",
                    type: "practice-set",
                    source: "EduSmart 题库",
                    url: "/practice?subject=software_engineering",
                    instruction: "完成基础概念选择题，并把错因写成一句话。"
                }
            ],
            软件过程模型: [
                {
                    title: "软件过程模型案例",
                    type: "case",
                    source: "EduSmart 默认知识库",
                    url: "/knowledge-base?subject=software_engineering&q=过程模型",
                    instruction: "比较瀑布、原型、迭代和敏捷的适用场景。"
                },
                {
                    title: "过程模型场景判断",
                    type: "practice-set",
                    source: "EduSmart 题库",
                    url: "/practice?subject=software_engineering",
                    instruction: "用项目特征判断适合的过程模型。"
                }
            ],
            需求分析: [
                {
                    title: "需求分析入门",
                    type: "concept",
                    source: "EduSmart 默认知识库",
                    url: "/knowledge-base?subject=software_engineering&q=需求分析",
                    instruction: "区分功能需求、非功能需求、用户故事和验收标准。"
                },
                {
                    title: "需求规格说明模板",
                    type: "template",
                    source: "EduSmart 默认知识库",
                    url: "/knowledge-base?subject=software_engineering&q=SRS",
                    instruction: "按模板写出一个校园系统的小需求。"
                },
                {
                    title: "需求分析练习",
                    type: "practice-set",
                    source: "EduSmart 题库",
                    url: "/practice?subject=software_engineering",
                    instruction: "完成需求类型判断题并订正。"
                }
            ],
            软件设计与建模: [
                {
                    title: "从需求到设计",
                    type: "diagram",
                    source: "EduSmart 默认知识库",
                    url: "/knowledge-base?subject=software_engineering&q=软件设计",
                    instruction: "把一个用例拆成模块、接口和数据对象。"
                },
                {
                    title: "模块拆分练习",
                    type: "lab",
                    source: "EduSmart 实验",
                    url: "/practice?subject=software_engineering",
                    instruction: "围绕高内聚、低耦合检查设计。"
                }
            ],
            软件测试基础: [
                {
                    title: "软件测试基础讲义",
                    type: "concept",
                    source: "EduSmart 默认知识库",
                    url: "/knowledge-base?subject=software_engineering&q=软件测试",
                    instruction: "对比黑盒测试、白盒测试和测试用例结构。"
                },
                {
                    title: "测试方法选择练习",
                    type: "practice-set",
                    source: "EduSmart 题库",
                    url: "/practice?subject=software_engineering",
                    instruction: "根据需求描述选择合适测试方法。"
                }
            ]
        };
        if (softwareMaterials[normalized]) return softwareMaterials[normalized];
        return [
            {
                title: `${normalized} 概念导学`,
                type: "concept",
                source: "菜鸟教程",
                url: "https://www.runoob.com/data-structures/dsa-dynamic-programming.html",
                instruction: "先看问题定义、子问题、状态转移和边界条件，记录 3 个关键词。"
            },
            {
                title: `${normalized} DP Introduction`,
                type: "article",
                source: "GeeksforGeeks",
                url: "https://www.geeksforgeeks.org/introduction-to-dynamic-programming-data-structures-and-algorithm-tutorials/",
                instruction: "重点理解“重叠子问题”和“记忆化/制表”为什么能减少重复计算。"
            },
            {
                title: `${normalized} 题单与分型训练`,
                type: "practice-set",
                source: "洛谷题单",
                url: "https://www.luogu.com.cn/training/420012",
                instruction: "只挑基础 DP 题，不追求数量，先把状态定义写清楚。"
            },
            {
                title: "数据结构练习题库",
                type: "question-bank",
                source: "Dotcpp",
                url: "https://www.dotcpp.com/oj/ds/",
                instruction: "用于补充数据结构基础题，做完后把错因写入笔记模板。"
            }
        ];
    }

    defaultPracticeQuestions(topic) {
        const normalized = topic || "动态规划";
        return [
            {
                title: "判断题：是否适合动态规划",
                prompt: `给出一个求最优解的问题，请判断它是否满足最优子结构和重叠子问题，并说明原因。`,
                expected: "能说出状态、选择、子问题是否重复。"
            },
            {
                title: "填空题：斐波那契状态转移",
                prompt: "定义 dp[i] 表示第 i 项斐波那契数，请写出转移方程和初始条件。",
                expected: "dp[i] = dp[i-1] + dp[i-2]，dp[0] = 0，dp[1] = 1。"
            },
            {
                title: "应用题：爬楼梯",
                prompt: "一次可以爬 1 或 2 阶，爬到第 n 阶有多少种方法？写出状态定义和转移。",
                expected: "dp[i] = dp[i-1] + dp[i-2]。"
            },
            {
                title: "代码题：最小路径和",
                prompt: "给定二维网格，从左上到右下只能向右或向下，求路径数字和最小值。",
                expected: "定义 dp[i][j] 为到达该格的最小路径和。"
            },
            {
                title: "复盘题：为什么不能贪心",
                prompt: `选择一道 ${normalized} 题，说明为什么局部最优不一定得到全局最优。`,
                expected: "能用反例或状态依赖关系解释。"
            }
        ];
    }

    defaultNoteTemplate(topic) {
        const normalized = topic || "动态规划";
        return {
            title: `${normalized} 主动回忆笔记`,
            sections: [
                { heading: "1. 核心概念", prompt: `不用看资料，用自己的话解释 ${normalized} 是什么。` },
                { heading: "2. 状态定义", prompt: "dp[i] 或 dp[i][j] 分别表示什么？为什么这样定义？" },
                { heading: "3. 转移方程", prompt: "当前状态由哪些更小状态推来？选择有哪些？" },
                { heading: "4. 边界条件", prompt: "最小规模问题是什么？初始化值是什么？" },
                { heading: "5. 易错点", prompt: "今天错在哪：状态定义、循环顺序、边界、还是审题？" },
                { heading: "6. 下一次检查", prompt: "下次遇到同类题，先检查哪 2 件事？" }
            ]
        };
    }

    attachLearningSession(task, overrides = {}) {
        const topic = task.nodeName || task.title || "动态规划";
        const materials = overrides.materials || this.defaultMaterials(topic);
        const practiceQuestions = overrides.practiceQuestions || this.defaultPracticeQuestions(topic);
        const noteTemplate = overrides.noteTemplate || this.defaultNoteTemplate(topic);
        return {
            ...task,
            materials,
            practiceQuestions,
            noteTemplate,
            nextStep: overrides.nextStep || `完成后进入「${topic} 专项练习」，至少做对 2 道同类题再标记完成。`,
            completionCriteria: overrides.completionCriteria || [
                "至少看完 1 份学习材料并写出 3 个关键词",
                "完成 3 道练习题并记录错因",
                "按模板写出主动回忆笔记",
                "能说清下一步要练什么"
            ]
        };
    }

    withTaskIds(plan) {
        if (!plan) return null;
        const tasks = this.parseJson(plan.tasks, []);
        return {
            ...plan,
            tasks: tasks.map((task, index) => ({
                ...(!task.materials || !task.practiceQuestions || !task.noteTemplate
                    ? this.attachLearningSession(task)
                    : task),
                id: `${plan.id}:${index}`,
                taskIndex: index,
                completed: Boolean(task.completed || task.status === "completed"),
                status: task.completed || task.status === "completed" ? "completed" : task.status || "pending"
            }))
        };
    }

    buildLearningTask({ time, node, type, reason, duration, priority }) {
        const subjectName = this.normalizeSubject(node.subject);
        const nodeName = node.name || node.nodeName || "核心知识点";
        const mastery = Math.round(Number(node.mastery || 0));
        const baseUrl = node.node_id ? `/practice?nodeId=${node.node_id}` : "/practice";

        const typeConfig = {
            diagnose: {
                verb: "先测",
                icon: "brain",
                title: `诊断 ${nodeName}`,
                deliverable: "记录错因标签和不会的前置概念",
                steps: [
                    `用 3 分钟回忆 ${nodeName} 的定义、适用场景和一个例子`,
                    "做 5 道同知识点题目，先不查答案",
                    "把错题按“概念不清/步骤漏掉/审题错误”归类"
                ]
            },
            learn: {
                verb: "学懂",
                icon: "book",
                title: `补齐 ${nodeName}`,
                deliverable: "写出一张包含定义、公式或代码模板的速记卡",
                steps: [
                    `阅读或回看 ${nodeName} 的核心讲解，圈出 2 个关键词`,
                    "用自己的话复述知识点，不超过 80 字",
                    "完成 1 道例题，并标注每一步为什么这样做"
                ]
            },
            practice: {
                verb: "练会",
                icon: "pen",
                title: `专项练习 ${nodeName}`,
                deliverable: "完成练习并留下 1 条可复用解题策略",
                steps: [
                    "先做 5 道基础题，目标正确率 80%",
                    "遇到卡顿超过 2 分钟就查看提示，再重做一遍",
                    "把最容易错的一步写进错题本或笔记"
                ]
            },
            review: {
                verb: "巩固",
                icon: "refresh",
                title: `复盘 ${nodeName}`,
                deliverable: "确认旧错题能独立做对，并更新掌握度判断",
                steps: [
                    "遮住答案重做最近错过的同类题",
                    "对比旧答案，找出今天是否还犯同一种错",
                    "用一句话写下下次遇到同类题的检查点"
                ]
            }
        };

        const cfg = typeConfig[type] || typeConfig.learn;
        return this.attachLearningSession(
            {
                time,
                title: cfg.title,
                task: cfg.title,
                subject: node.subject || "general",
                subjectName,
                nodeId: node.node_id || node.nodeId || null,
                nodeName,
                mastery,
                reason,
                duration,
                type,
                priority,
                icon: cfg.icon,
                actionLabel: `${cfg.verb} ${nodeName}`,
                actionUrl: baseUrl,
                deliverable: cfg.deliverable,
                steps: cfg.steps,
                successCriteria: ["能不用提示讲清关键概念", "同类题连续做对 2 题", "能说出自己下一步要避开的错误"],
                completed: false,
                status: "pending"
            },
            {
                nextStep:
                    type === "practice"
                        ? `提交 ${nodeName} 练习后，回到计划页更新完成状态，并整理 1 条错因。`
                        : `先完成材料和笔记，再进入 ${nodeName} 专项练习。`
            }
        );
    }

    buildSummaryTask(time, focusNames) {
        return this.attachLearningSession(
            {
                time,
                title: "今日闭环复盘",
                task: "今日闭环复盘",
                subject: "general",
                subjectName: "综合",
                nodeId: null,
                nodeName: "学习闭环",
                mastery: null,
                reason:
                    focusNames.length > 0
                        ? `围绕 ${focusNames.join("、")} 做收束`
                        : "把今天的学习结果转成明天可执行的动作",
                duration: 20,
                type: "summary",
                priority: "medium",
                icon: "check",
                actionLabel: "整理今日闭环",
                actionUrl: "/my-notes",
                deliverable: "形成“学了什么、卡在哪里、明天先做什么”的三行总结",
                steps: [
                    "写下今天完成的知识点和练习数量",
                    "选出 1 个仍不稳的点，描述卡住原因",
                    "生成明天第一项任务：知识点 + 题量 + 完成标准"
                ],
                successCriteria: ["今日任务状态已更新", "至少沉淀 1 条错因或解题策略", "明天第一步明确到可直接开始"],
                completed: false,
                status: "pending"
            },
            {
                materials: [
                    {
                        title: "今日任务清单",
                        type: "plan",
                        source: "EduSmart",
                        url: "/study-plan",
                        instruction: "逐项检查任务产出是否真的留下。"
                    },
                    {
                        title: "错题本",
                        type: "reflection",
                        source: "EduSmart",
                        url: "/error-book",
                        instruction: "把今天仍不稳定的题写入错因。"
                    }
                ],
                practiceQuestions: [
                    {
                        title: "复盘问题 1",
                        prompt: "今天最卡住的是哪个概念？卡住原因是什么？",
                        expected: "能定位到一个具体概念或步骤。"
                    },
                    {
                        title: "复盘问题 2",
                        prompt: "明天第一道要做的题或第一个要看的材料是什么？",
                        expected: "下一步明确到可马上执行。"
                    }
                ],
                noteTemplate: this.defaultNoteTemplate("今日闭环复盘"),
                nextStep: "明天优先打开今天标记的薄弱点，先做 1 道回忆题再看资料。",
                completionCriteria: ["任务状态已更新", "至少沉淀 1 条错因", "写出明天第一步"]
            }
        );
    }

    async collectSignals(pool, userId) {
        try {
            const { ensureKnowledgeData } = require("./DemoDataSeeder");
            await ensureKnowledgeData(pool);
        } catch (error) {
            // 计划生成不能因为种子数据补齐失败而中断。
        }

        let weakNodes = [];
        try {
            [weakNodes] = await pool.query(
                `SELECT sk.node_id, sk.mastery, kn.name, kn.subject
                 FROM student_knowledge sk
                 JOIN knowledge_nodes kn ON sk.node_id = kn.id
                 WHERE sk.user_id = ? AND sk.mastery < 75 AND kn.is_active = 1
                 ORDER BY sk.mastery ASC, sk.last_updated ASC LIMIT 8`,
                [userId]
            );
        } catch (error) {
            weakNodes = [];
        }

        let errorNodes = [];
        try {
            [errorNodes] = await pool.query(
                `SELECT eb.knowledge_node_id as node_id, COUNT(*) as error_count,
                        COALESCE(kn.name, '错题知识点') as name,
                        COALESCE(kn.subject, eb.subject, 'general') as subject,
                        COALESCE(sk.mastery, 0) as mastery
                 FROM error_book eb
                 LEFT JOIN knowledge_nodes kn ON eb.knowledge_node_id = kn.id
                 LEFT JOIN student_knowledge sk ON sk.user_id = eb.user_id AND sk.node_id = eb.knowledge_node_id
                 WHERE eb.user_id = ? AND eb.status = 'unsolved' AND eb.knowledge_node_id IS NOT NULL
                 GROUP BY eb.knowledge_node_id, kn.name, kn.subject, eb.subject, sk.mastery
                 ORDER BY error_count DESC LIMIT 5`,
                [userId]
            );
        } catch (error) {
            errorNodes = [];
        }

        let recentPractice = [];
        try {
            [recentPractice] = await pool.query(
                `SELECT pr.knowledge_node_id as node_id, kn.name, kn.subject, COALESCE(sk.mastery, 50) as mastery,
                        MAX(pr.created_at) as last_practice_at
                 FROM practice_records pr
                 LEFT JOIN knowledge_nodes kn ON pr.knowledge_node_id = kn.id
                 LEFT JOIN student_knowledge sk ON sk.user_id = pr.user_id AND sk.node_id = pr.knowledge_node_id
                 WHERE pr.user_id = ? AND pr.knowledge_node_id IS NOT NULL
                 GROUP BY pr.knowledge_node_id, kn.name, kn.subject, sk.mastery
                 ORDER BY last_practice_at ASC LIMIT 4`,
                [userId]
            );
        } catch (error) {
            recentPractice = [];
        }

        if (weakNodes.length === 0 && errorNodes.length === 0) {
            try {
                [weakNodes] = await pool.query(
                    `SELECT id AS node_id, name, subject, 35 AS mastery, 0 AS error_count
                     FROM knowledge_nodes
                     WHERE is_active = 1
                       AND subject IN ('software_engineering', 'computer', 'programming')
                     ORDER BY
                       CASE
                         WHEN subject = 'software_engineering' THEN 0
                         WHEN subject = 'computer' THEN 1
                         ELSE 2
                       END,
                       id
                     LIMIT 5`
                );
            } catch (error) {
                weakNodes = [];
            }
        }

        return { weakNodes, errorNodes, recentPractice };
    }

    buildTasks(signals) {
        const focus = signals.weakNodes[0] ||
            signals.errorNodes[0] || {
                node_id: null,
                name: "软件工程基础概念",
                subject: "software_engineering",
                mastery: 35,
                error_count: 0
            };
        const topic = focus.name || "软件工程基础概念";
        const mastery = Math.round(Number(focus.mastery || 35));
        const subject = focus.subject || "software_engineering";
        const node = { ...focus, name: topic, subject, mastery };
        const courseTitle = subject === "software_engineering" ? "《软件工程导论》知识库课程" : `${topic} 核心课程`;

        return [
            this.attachLearningSession(
                {
                    time: "08:30",
                    title: `预习：${topic}`,
                    task: `预习：${topic}`,
                    subject,
                    subjectName: this.normalizeSubject(subject),
                    nodeId: focus.node_id || null,
                    nodeName: topic,
                    mastery,
                    reason: "补足前置知识，避免直接做题时只背答案",
                    duration: 20,
                    type: "prelearn",
                    priority: "high",
                    icon: "book",
                    actionLabel: "打开学习材料",
                    actionUrl: this.defaultMaterials(topic)[0].url,
                    deliverable: "写出 3 个关键词和 1 个不懂的问题",
                    steps: ["阅读概念导学", "标出状态/子问题/边界条件", "写下最不懂的一个点"],
                    successCriteria: ["能说出概念", "能提出一个具体问题"],
                    completed: false,
                    status: "pending"
                },
                { nextStep: `继续学习课程：${courseTitle}` }
            ),
            this.attachLearningSession(
                {
                    time: "09:10",
                    title: `继续学习：${courseTitle}`,
                    task: `继续学习：${courseTitle}`,
                    subject,
                    subjectName: this.normalizeSubject(subject),
                    nodeId: focus.node_id || null,
                    nodeName: topic,
                    mastery,
                    reason: `当前掌握度 ${mastery}%，先通过课程讲解建立框架`,
                    duration: 25,
                    type: "learn",
                    priority: "high",
                    icon: "play",
                    actionLabel: "看课程材料",
                    actionUrl: this.defaultMaterials(topic)[1].url,
                    deliverable: "整理一张概念卡：状态定义 + 转移方程 + 边界",
                    steps: ["看材料中的例题", "暂停后自己复述状态定义", "对照材料补齐转移方程"],
                    successCriteria: ["能复述例题思路", "能写出状态定义"],
                    completed: false,
                    status: "pending"
                },
                { nextStep: `进入 ${topic} 专项练习` }
            ),
            this.buildLearningTask({
                time: "10:00",
                node,
                type: "learn",
                reason: "用第二轮短讲解把概念和例题连接起来",
                duration: 30,
                priority: "medium"
            }),
            this.buildLearningTask({
                time: "14:30",
                node,
                type: "practice",
                reason: "5 道题，答题后更新掌握度",
                duration: 18,
                priority: "high"
            }),
            this.attachLearningSession(
                {
                    time: "15:10",
                    title: `基础练习：${topic}`,
                    task: `基础练习：${topic}`,
                    subject,
                    subjectName: this.normalizeSubject(subject),
                    nodeId: focus.node_id || null,
                    nodeName: topic,
                    mastery,
                    reason: "8 道基础题，做完后更新掌握度",
                    duration: 25,
                    type: "practice",
                    priority: "medium",
                    icon: "file",
                    actionLabel: "开始基础练习",
                    actionUrl: "/practice",
                    deliverable: "完成基础题并记录 1 条通用解题策略",
                    steps: ["先独立做题", "错题立即归因", "重做错题直到不看提示"],
                    successCriteria: ["至少完成 3 道题", "错题有归因"],
                    completed: false,
                    status: "pending"
                },
                { nextStep: `整理 ${topic} 错题笔记` }
            ),
            this.attachLearningSession(
                {
                    time: "16:00",
                    title: `整理 ${topic} 错题笔记`,
                    task: `整理 ${topic} 错题笔记`,
                    subject,
                    subjectName: this.normalizeSubject(subject),
                    nodeId: focus.node_id || null,
                    nodeName: topic,
                    mastery,
                    reason: "生成主动回忆卡和误区卡",
                    duration: 12,
                    type: "error-note",
                    priority: "medium",
                    icon: "pen",
                    actionLabel: "写智能笔记",
                    actionUrl: "/smart-notes",
                    deliverable: "主动回忆卡 + 误区卡各 1 张",
                    steps: ["复制错题题干", "写出错因", "写出下次检查点"],
                    successCriteria: ["有错因", "有下次检查点"],
                    completed: false,
                    status: "pending"
                },
                { nextStep: `整理 ${topic} 完整笔记` }
            ),
            this.attachLearningSession(
                {
                    time: "20:00",
                    title: `整理笔记：${topic}`,
                    task: `整理笔记：${topic}`,
                    subject,
                    subjectName: this.normalizeSubject(subject),
                    nodeId: focus.node_id || null,
                    nodeName: topic,
                    mastery,
                    reason: "记录核心概念、常见错误和理解误区",
                    duration: 15,
                    type: "note",
                    priority: "medium",
                    icon: "edit",
                    actionLabel: "打开笔记模板",
                    actionUrl: "/smart-notes",
                    deliverable: "完成一份结构化笔记模板",
                    steps: ["写核心概念", "写常见错误", "写明天要复习的问题"],
                    successCriteria: ["笔记包含 3 个区块", "能用于明日复习"],
                    completed: false,
                    status: "pending"
                },
                { nextStep: `安排 ${topic} 间隔复习` }
            ),
            this.attachLearningSession(
                {
                    time: "明日",
                    title: `安排 ${topic} 间隔复习`,
                    task: `安排 ${topic} 间隔复习`,
                    subject,
                    subjectName: this.normalizeSubject(subject),
                    nodeId: focus.node_id || null,
                    nodeName: topic,
                    mastery,
                    reason: "明日回访，检查是否遗忘",
                    duration: 8,
                    type: "spaced-review",
                    priority: "low",
                    icon: "refresh",
                    actionLabel: "查看复习安排",
                    actionUrl: "/study-plan",
                    deliverable: "明日先做 1 道回忆题",
                    steps: ["明天先不看答案", "做 1 道同类题", "若错则回看今天笔记"],
                    successCriteria: ["能独立回忆状态定义", "同类题至少做对 1 道"],
                    completed: false,
                    status: "pending"
                },
                { nextStep: "明天根据回访结果自动调整计划" }
            )
        ];
    }

    /**
     * 基于画像和Agent增强生成每日学习计划（混合策略入口）
     */
    async generateDailyWithProfile(pool, { userId, date, title, duration }) {
        const AIPathGenerator = require("./AIPathGenerator");
        const aiPathGenerator = new AIPathGenerator();

        const planDate = date || this.today();

        const profile = await aiPathGenerator.loadUserProfile(userId, pool);
        const dailyMinutes = aiPathGenerator.getDailyMinutes(profile);
        const attentionSpan = aiPathGenerator.getAttentionSpan(profile);
        const styleWeights = aiPathGenerator.getStyleWeights(profile);

        const taskCount = Math.max(3, Math.min(8, Math.round(dailyMinutes / 45)));

        const signals = await this.collectSignals(pool, userId);

        let agentSuggestions = null;
        try {
            const AgenticLearningAgent = require("./AgenticLearningAgent");
            const agent = new AgenticLearningAgent(userId, pool);
            agentSuggestions = await agent.reasonNextStep();
        } catch (e) {
            console.warn("Agent增强失败，使用规则引擎:", e.message);
        }

        const tasks = this.buildTasksWithProfile(signals, {
            dailyMinutes,
            attentionSpan,
            styleWeights,
            taskCount,
            agentSuggestions,
            title,
            duration
        });

        const strategy = agentSuggestions ? "agent-driven" : "profile-aware";
        return this.savePlan(pool, { userId, date: planDate, tasks, strategy });
    }

    buildTasksWithProfile(signals, options) {
        const { attentionSpan, agentSuggestions, title, duration } = options;

        if (title) {
            return [
                this.attachLearningSession({
                    time: "自定",
                    title,
                    task: title,
                    subject: "general",
                    subjectName: "自定义",
                    nodeId: null,
                    nodeName: title,
                    mastery: null,
                    reason: "你手动加入的学习任务",
                    duration: duration || 30,
                    type: "custom",
                    priority: "medium",
                    icon: "plus",
                    actionLabel: "开始学习",
                    actionUrl: "/ai-tutor",
                    deliverable: "完成后写下一个收获或一个待解决问题",
                    steps: ["明确本任务要解决的一个具体问题", "学习或练习到能口头复述关键点", "用一句话记录结果"],
                    successCriteria: ["目标问题有答案", "留下学习产出"],
                    completed: false,
                    status: "pending"
                })
            ];
        }

        const tasks = [];
        const focus = signals.weakNodes[0] ||
            signals.errorNodes[0] || {
                node_id: null,
                name: "软件工程基础概念",
                subject: "software_engineering",
                mastery: 35
            };
        const topic = focus.name || "软件工程基础概念";
        const mastery = Math.round(Number(focus.mastery || 35));
        const subject = focus.subject || "software_engineering";
        const node = { ...focus, name: topic, subject, mastery };

        tasks.push(
            this.attachLearningSession(
                {
                    time: "08:30",
                    title: `预习：${topic}`,
                    task: `预习：${topic}`,
                    subject,
                    subjectName: this.normalizeSubject(subject),
                    nodeId: focus.node_id || null,
                    nodeName: topic,
                    mastery,
                    reason: "补足前置知识",
                    duration: Math.min(attentionSpan, 20),
                    type: "prelearn",
                    priority: "high",
                    icon: "book",
                    actionLabel: "打开学习材料",
                    actionUrl: this.defaultMaterials(topic)[0].url,
                    deliverable: "写出3个关键词和1个问题",
                    steps: ["阅读概念导学", "标出关键概念", "写下最不懂的一个点"],
                    successCriteria: ["能说出概念", "能提出一个问题"],
                    completed: false,
                    status: "pending"
                },
                { nextStep: `继续学习${topic}` }
            )
        );

        tasks.push(
            this.buildLearningTask({
                time: "09:00",
                node,
                type: "learn",
                reason: `当前掌握度${mastery}%，需建立框架`,
                duration: Math.min(attentionSpan, 30),
                priority: "high"
            })
        );

        if (signals.weakNodes.length > 1) {
            tasks.push(
                this.buildLearningTask({
                    time: "09:45",
                    node: { ...signals.weakNodes[1], name: signals.weakNodes[1].name || "练习" },
                    type: "practice",
                    reason: "巩固练习",
                    duration: Math.min(attentionSpan, 25),
                    priority: "medium"
                })
            );
        }

        const weakNames = signals.weakNodes.slice(0, 3).map(n => n.name);
        tasks.push(this.buildSummaryTask("10:15", weakNames.length > 0 ? weakNames : ["今日学习内容"]));

        return tasks.slice(0, options.taskCount || 4);
    }

    async savePlan(pool, { userId, date, tasks, strategy }) {
        const planDate = date || this.today();
        const suggestion =
            tasks.length > 0
                ? `基于画像的个性化计划：共${tasks.length}个任务，优先完成「${tasks[0].nodeName || tasks[0].title}」`
                : "先完成一轮综合练习";

        let plan = await this.getPlan(pool, { userId, date: planDate, autoGenerate: false });
        const stg = strategy || "profile-aware";

        if (plan) {
            await pool.query(
                `UPDATE study_plans SET tasks = ?, ai_suggestion = ?, completion_rate = ?, plan_type = ?, updated_at = NOW()
                 WHERE id = ? AND user_id = ?`,
                [JSON.stringify(tasks), suggestion, 0, stg, plan.id, userId]
            );
            plan = { ...plan, tasks, ai_suggestion: suggestion, completion_rate: 0, plan_type: stg };
        } else {
            const [result] = await pool.query(
                `INSERT INTO study_plans (user_id, plan_date, plan_type, tasks, ai_suggestion, completion_rate)
                 VALUES (?, ?, ?, ?, ?, 0)`,
                [userId, planDate, stg, JSON.stringify(tasks), suggestion]
            );
            plan = {
                id: result.insertId,
                user_id: userId,
                plan_date: planDate,
                plan_type: stg,
                tasks,
                ai_suggestion: suggestion,
                completion_rate: 0
            };
        }

        return this.withTaskIds(plan);
    }

    /**
     * 基于学生画像和知识掌握度生成个性化学习计划（原方法保留）
     * @param {Object} pool - 数据库连接池
     * @param {Object} options
     * @param {number} options.userId
     * @param {string} options.date - 计划日期
     * @param {Object} options.profile - 学生画像
     * @param {Object} options.knowledgeMastery - BKT知识掌握度
     * @param {Object} options.cognitiveProfile - 认知画像
     * @param {Array} options.misconceptions - 误区列表
     */
    async generateProfileAware(pool, { userId, date, profile, knowledgeMastery, cognitiveProfile, misconceptions }) {
        await this.ensureStudyPlanTable(pool);
        const planDate = date || this.today();
        const tasks = [];

        const learningSpeed = profile?.learningPatterns?.["学习速度"] || "medium";
        const bestTime = profile?.learningPatterns?.["最佳学习时间"] || "morning";
        const cognitiveType = profile?.cognitiveStyle?.type || "visual";
        const attentionSpan = profile?.learningPatterns?.["注意力持续时间"] || 30;

        // 时间系数
        const timeModifier = { slow: 1.4, medium: 1.0, fast: 0.7 }[learningSpeed] || 1.0;
        const baseDuration = Math.round(attentionSpan * timeModifier);

        // 从知识追踪找薄弱知识点
        const weakNodes = knowledgeMastery
            ? Object.values(knowledgeMastery)
                  .filter(n => (n.mastery || 0) < 0.6)
                  .sort((a, b) => (a.mastery || 0) - (b.mastery || 0))
                  .slice(0, 5)
            : [];

        // 从误区识别找需要专项训练的类别
        const misconceptionTargets = misconceptions
            ? misconceptions.filter(m => m.severity === "critical" || m.severity === "moderate").slice(0, 2)
            : [];

        // 认知风格映射学习策略
        const styleStrategy = this.getStyleStrategy(cognitiveType);

        // === 任务1: 补弱 (薄弱知识点) ===
        const startTime = bestTime === "afternoon" ? "13:30" : bestTime === "evening" ? "19:00" : "08:30";

        if (weakNodes.length > 0) {
            const primaryWeak = weakNodes[0];
            tasks.push(
                this.buildLearningTask({
                    time: startTime,
                    node: {
                        node_id: primaryWeak.knowledgeId,
                        name: primaryWeak.title,
                        subject: primaryWeak.subject,
                        mastery: Math.round((primaryWeak.mastery || 0) * 100)
                    },
                    type: "diagnose",
                    reason: `智能诊断发现${primaryWeak.title}掌握度仅${Math.round((primaryWeak.mastery || 0) * 100)}%，优先补强`,
                    duration: baseDuration,
                    priority: "high"
                })
            );
        }

        // === 任务2: 概念学习 (认知偏好适配) ===
        const learnNode = weakNodes[1] ||
            weakNodes[0] || {
                knowledgeId: null,
                title: profile?.basicInfo?.interests?.[0] || "软件工程基础概念",
                subject: "software_engineering",
                mastery: 0.35
            };

        tasks.push(
            this.attachLearningSession(
                {
                    time: this.addMinutes(startTime, baseDuration + 5),
                    title: `${styleStrategy.label}学习: ${learnNode.title}`,
                    task: `${styleStrategy.label}学习: ${learnNode.title}`,
                    subject: learnNode.subject || "general",
                    subjectName: this.normalizeSubject(learnNode.subject),
                    nodeId: learnNode.knowledgeId || null,
                    nodeName: learnNode.title,
                    mastery: Math.round((learnNode.mastery || 0.3) * 100),
                    reason: `基于你的${this.getCognitiveLabel(cognitiveType)}偏好，推荐以下方式学习`,
                    duration: Math.round(baseDuration * 1.2),
                    type: "learn",
                    priority: "high",
                    icon: styleStrategy.icon,
                    actionLabel: `开始${styleStrategy.label}学习`,
                    actionUrl: styleStrategy.url,
                    deliverable: "完成学习并写下3个关键点和1个疑问",
                    steps: styleStrategy.steps,
                    successCriteria: ["能复述关键概念", "能回答自我检测问题"],
                    completed: false,
                    status: "pending"
                },
                {
                    nextStep: `进入${learnNode.title}专项练习`,
                    materials: styleStrategy.materials(learnNode.title)
                }
            )
        );

        // === 任务3: 误区专项纠正 ===
        if (misconceptionTargets.length > 0) {
            const primaryMc = misconceptionTargets[0];
            tasks.push(
                this.attachLearningSession(
                    {
                        time: this.addMinutes(startTime, (baseDuration + 5) * 2),
                        title: `纠错专练: ${primaryMc.category}`,
                        task: `纠错专练: ${primaryMc.category}`,
                        subject: primaryMc.subject || "general",
                        subjectName: this.normalizeSubject(primaryMc.subject),
                        nodeId: null,
                        nodeName: primaryMc.category,
                        mastery: null,
                        reason: `智能诊断发现${primaryMc.category}类误区占比${primaryMc.percentage}%，需专项纠正`,
                        duration: Math.round(baseDuration * 0.8),
                        type: "error-correction",
                        priority: "critical",
                        icon: "target",
                        actionLabel: "开始纠错练习",
                        actionUrl: "/practice?mode=error-correction",
                        deliverable: `消除${primaryMc.category}类错误，总结正确方法`,
                        steps: [
                            `回顾${primaryMc.category}的典型错题`,
                            "分析错误根因并写出正确解法",
                            "做3道同类变式题验证"
                        ],
                        successCriteria: ["同类题正确率≥80%", "能解释为什么之前会错"],
                        completed: false,
                        status: "pending"
                    },
                    {
                        nextStep: "继续练习直到同类题连续做对"
                    }
                )
            );
        }

        // === 任务4: 练习巩固 ===
        if (weakNodes.length > 1) {
            const practiceNode = weakNodes[1];
            tasks.push(
                this.buildLearningTask({
                    time: this.addMinutes(startTime, (baseDuration + 5) * 3),
                    node: {
                        node_id: practiceNode.knowledgeId,
                        name: practiceNode.title,
                        subject: practiceNode.subject,
                        mastery: Math.round((practiceNode.mastery || 0) * 100)
                    },
                    type: "practice",
                    reason: `${practiceNode.title}需要练习巩固`,
                    duration: Math.round(baseDuration * 0.7),
                    priority: "medium"
                })
            );
        }

        // === 任务5: 闭环复盘 ===
        const weakNames = weakNodes.slice(0, 3).map(n => n.title);
        tasks.push(
            this.buildSummaryTask(
                this.addMinutes(startTime, (baseDuration + 5) * 4),
                weakNames.length > 0 ? weakNames : ["今日学习内容"]
            )
        );

        // 生成AI建议
        const suggestion = this.generateProfileSuggestion({
            profile,
            weakNodes,
            misconceptionTargets,
            cognitiveType,
            learningSpeed,
            tasks
        });

        // 持久化
        let plan = await this.getPlan(pool, { userId, date: planDate, autoGenerate: false });
        if (plan) {
            await pool.query(
                `UPDATE study_plans SET tasks = ?, ai_suggestion = ?, completion_rate = ?, plan_type = 'profile-aware', updated_at = NOW()
                 WHERE id = ? AND user_id = ?`,
                [JSON.stringify(tasks), suggestion, 0, plan.id, userId]
            );
            plan = { ...plan, tasks, ai_suggestion: suggestion, completion_rate: 0, plan_type: "profile-aware" };
        } else {
            const [result] = await pool.query(
                `INSERT INTO study_plans (user_id, plan_date, plan_type, tasks, ai_suggestion, completion_rate)
                 VALUES (?, ?, 'profile-aware', ?, ?, 0)`,
                [userId, planDate, JSON.stringify(tasks), suggestion]
            );
            plan = {
                id: result.insertId,
                user_id: userId,
                plan_date: planDate,
                plan_type: "profile-aware",
                tasks,
                ai_suggestion: suggestion,
                completion_rate: 0
            };
        }

        return this.withTaskIds(plan);
    }

    getStyleStrategy(cognitiveType) {
        const strategies = {
            visual: {
                label: "视觉",
                icon: "eye",
                url: "/learn?mode=visual",
                steps: ["观看概念图解/流程图", "用颜色标记关键概念", "画出知识结构图"],
                materials: topic => [
                    {
                        title: `${topic} 概念图解`,
                        type: "concept-map",
                        source: "EduSmart",
                        url: `/concept-canvas?topic=${encodeURIComponent(topic)}`,
                        instruction: "通过可视化概念图理解知识结构"
                    },
                    {
                        title: `${topic} 教学视频`,
                        type: "video",
                        source: "EduSmart",
                        url: "/video-library",
                        instruction: "观看教学视频，注意画面中的标注和动画"
                    }
                ]
            },
            auditory: {
                label: "听觉",
                icon: "headphones",
                url: "/learn?mode=auditory",
                steps: ["听AI助教讲解核心概念", "用自己的话口头复述", "与AI讨论疑难点"],
                materials: topic => [
                    {
                        title: `${topic} AI语音讲解`,
                        type: "audio",
                        source: "EduSmart",
                        url: "/ai-tutor?mode=voice",
                        instruction: "听AI助教语音讲解核心概念"
                    },
                    {
                        title: `${topic} 讨论练习`,
                        type: "discussion",
                        source: "EduSmart",
                        url: "/ai-tutor",
                        instruction: "与AI进行问答讨论，加深理解"
                    }
                ]
            },
            kinesthetic: {
                label: "动觉",
                icon: "hand",
                url: "/learn?mode=kinesthetic",
                steps: ["动手操作交互式模拟器", "完成动手实验/练习", "记录操作过程中的发现"],
                materials: topic => [
                    {
                        title: `${topic} 交互练习`,
                        type: "interactive",
                        source: "EduSmart",
                        url: "/practice?mode=interactive",
                        instruction: "通过交互式练习动手验证概念"
                    },
                    {
                        title: `${topic} 实操任务`,
                        type: "lab",
                        source: "EduSmart",
                        url: "/practice",
                        instruction: "完成动手实操任务"
                    }
                ]
            }
        };
        return strategies[cognitiveType] || strategies.visual;
    }

    getCognitiveLabel(type) {
        const labels = { visual: "视觉型", auditory: "听觉型", kinesthetic: "动觉型" };
        return labels[type] || "综合型";
    }

    generateProfileSuggestion({ profile, weakNodes, misconceptionTargets, cognitiveType, learningSpeed, tasks }) {
        const parts = [];

        if (weakNodes.length > 0) {
            parts.push(`智能诊断发现你有${weakNodes.length}个知识点需要加强，今天优先攻克「${weakNodes[0].title}」`);
        }
        if (misconceptionTargets.length > 0) {
            parts.push(
                `检测到「${misconceptionTargets[0].category}」类误区占比${misconceptionTargets[0].percentage}%，安排了专项纠错任务`
            );
        }
        if (cognitiveType && cognitiveType !== "visual") {
            parts.push(`已根据你的${this.getCognitiveLabel(cognitiveType)}偏好调整学习材料形式`);
        }
        parts.push(`今天共${tasks.length}个任务，按照优先级依次完成，最后做闭环复盘。`);

        return parts.join("。");
    }

    addMinutes(timeStr, minutes) {
        const [h, m] = timeStr.split(":").map(Number);
        const total = h * 60 + m + minutes;
        const newH = Math.floor(total / 60) % 24;
        const newM = total % 60;
        return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
    }

    async generateDaily(pool, { userId, date, title, duration }) {
        await this.ensureStudyPlanTable(pool);
        const planDate = date || this.today();
        let plan = await this.getPlan(pool, { userId, date: planDate, autoGenerate: false });

        if (title) {
            return this.addTask(pool, {
                userId,
                date: planDate,
                title,
                duration: duration || 30
            });
        }

        const signals = await this.collectSignals(pool, userId);
        const tasks = this.buildTasks(signals);
        const suggestion =
            tasks.length > 0
                ? `今天优先完成 ${tasks[0].nodeName}，每个任务都要留下可检查产出；晚上用闭环复盘决定明天第一步。`
                : "今天先完成一轮综合练习，再根据结果生成新的薄弱点任务。";

        if (plan) {
            await pool.query(
                `UPDATE study_plans SET tasks = ?, ai_suggestion = ?, completion_rate = ?, updated_at = NOW()
                 WHERE id = ? AND user_id = ?`,
                [JSON.stringify(tasks), suggestion, 0, plan.id, userId]
            );
            plan = { ...plan, tasks, ai_suggestion: suggestion, completion_rate: 0 };
        } else {
            const [result] = await pool.query(
                `INSERT INTO study_plans (user_id, plan_date, plan_type, tasks, ai_suggestion, completion_rate)
                 VALUES (?, ?, 'daily', ?, ?, 0)`,
                [userId, planDate, JSON.stringify(tasks), suggestion]
            );
            plan = {
                id: result.insertId,
                user_id: userId,
                plan_date: planDate,
                plan_type: "daily",
                tasks,
                ai_suggestion: suggestion,
                completion_rate: 0
            };
        }

        return this.withTaskIds(plan);
    }

    async addTask(pool, { userId, date, title, duration }) {
        const planDate = date || this.today();
        let plan = await this.getPlan(pool, { userId, date: planDate });
        const tasks = plan ? plan.tasks : [];
        tasks.push({
            time: "自定",
            title,
            task: title,
            subject: "general",
            subjectName: "自定义",
            nodeId: null,
            nodeName: title,
            mastery: null,
            reason: "你手动加入的学习任务",
            duration: duration || 30,
            type: "custom",
            priority: "medium",
            icon: "plus",
            actionLabel: "开始学习",
            actionUrl: "/ai-tutor",
            deliverable: "完成后写下一个收获或一个待解决问题",
            steps: [
                "明确本任务要解决的一个具体问题",
                "学习或练习到能口头复述关键点",
                "用一句话记录结果，并标记任务完成"
            ],
            successCriteria: ["目标问题有答案", "留下学习产出", "能判断下一步是否需要复习"],
            completed: false,
            status: "pending"
        });

        const completedCount = tasks.filter(task => task.completed || task.status === "completed").length;
        const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

        await pool.query(
            `UPDATE study_plans SET tasks = ?, completion_rate = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
            [JSON.stringify(tasks), completionRate, plan.id, userId]
        );

        return this.withTaskIds({ ...plan, tasks, completion_rate: completionRate });
    }

    async getPlan(pool, { userId, date, autoGenerate = true }) {
        await this.ensureStudyPlanTable(pool);
        const planDate = date || this.today();
        const [rows] = await pool.query(`SELECT * FROM study_plans WHERE user_id = ? AND plan_date = ? LIMIT 1`, [
            userId,
            planDate
        ]);
        if (rows.length === 0) {
            return autoGenerate ? this.generateDaily(pool, { userId, date: planDate }) : null;
        }
        return this.withTaskIds(rows[0]);
    }

    parseTaskId(taskId) {
        const [planPart, indexPart] = String(taskId || "").split(":");
        return {
            planId: Number(planPart),
            taskIndex: Number(indexPart)
        };
    }

    async setTaskCompletion(pool, { userId, taskId, completed }) {
        await this.ensureStudyPlanTable(pool);
        const parsed = this.parseTaskId(taskId);
        if (!Number.isInteger(parsed.planId) || !Number.isInteger(parsed.taskIndex)) {
            throw new Error("任务标识无效");
        }

        const [rows] = await pool.query(`SELECT * FROM study_plans WHERE id = ? AND user_id = ? LIMIT 1`, [
            parsed.planId,
            userId
        ]);
        if (rows.length === 0) throw new Error("学习计划不存在");

        const tasks = this.parseJson(rows[0].tasks, []);
        if (parsed.taskIndex < 0 || parsed.taskIndex >= tasks.length) {
            throw new Error("任务不存在");
        }

        tasks[parsed.taskIndex].completed = Boolean(completed);
        tasks[parsed.taskIndex].status = completed ? "completed" : "pending";
        tasks[parsed.taskIndex].completedAt = completed ? new Date().toISOString() : null;

        const completedCount = tasks.filter(task => task.completed || task.status === "completed").length;
        const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

        await pool.query(`UPDATE study_plans SET tasks = ?, completion_rate = ?, updated_at = NOW() WHERE id = ?`, [
            JSON.stringify(tasks),
            completionRate,
            parsed.planId
        ]);

        return { tasks, completionRate, completedCount, total: tasks.length };
    }

    async completeTask(pool, options) {
        return this.setTaskCompletion(pool, { ...options, completed: true });
    }

    async getWeekPlan(pool, { userId }) {
        await this.ensureStudyPlanTable(pool);
        const [rows] = await pool.query(
            `SELECT plan_date, completion_rate, tasks FROM study_plans
             WHERE user_id = ? AND plan_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 DAY) AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
             ORDER BY plan_date ASC`,
            [userId]
        );

        const byDate = new Map(rows.map(row => [this.dateKey(row.plan_date), row]));
        const days = [];
        for (let offset = -3; offset <= 3; offset++) {
            const date = new Date();
            date.setDate(date.getDate() + offset);
            const key = date.toISOString().split("T")[0];
            const row = byDate.get(key);
            days.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                fullDate: key,
                is_today: offset === 0,
                progress: row ? Math.round(Number(row.completion_rate || 0)) : 0,
                taskCount: row ? this.parseJson(row.tasks, []).length : 0
            });
        }
        return { days };
    }

    async getMonthGoals(pool, { userId }) {
        await this.ensureStudyPlanTable(pool);
        let rows = [];
        try {
            [rows] = await pool.query(
                `SELECT kn.subject, COUNT(*) as total,
                        SUM(CASE WHEN sk.mastery >= 70 THEN 1 ELSE 0 END) as mastered,
                        ROUND(AVG(sk.mastery), 0) as avg_mastery
                 FROM student_knowledge sk
                 JOIN knowledge_nodes kn ON sk.node_id = kn.id
                 WHERE sk.user_id = ? AND kn.is_active = 1
                 GROUP BY kn.subject
                 ORDER BY avg_mastery ASC LIMIT 5`,
                [userId]
            );
        } catch (error) {
            rows = [];
        }

        const goals = rows.map(row => ({
            title: `${this.normalizeSubject(row.subject)}知识点达标`,
            progress: Math.max(0, Math.min(100, Math.round(Number(row.avg_mastery || 0)))),
            detail: `${row.mastered || 0}/${row.total || 0} 个知识点掌握度达到 70%`
        }));

        if (goals.length === 0) {
            goals.push({ title: "建立本月学习基线", progress: 0, detail: "完成一次练习或测评后自动生成目标" });
        }

        return { goals };
    }

    async getProgress(pool, { userId }) {
        await this.ensureStudyPlanTable(pool);
        const plan = await this.getPlan(pool, { userId, date: this.today() });
        const todayTasks = plan ? plan.tasks : [];
        const todayCompleted = todayTasks.filter(task => task.completed || task.status === "completed").length;

        let [weekRows] = await pool.query(
            `SELECT plan_date, completion_rate, tasks FROM study_plans
             WHERE user_id = ? AND plan_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
             ORDER BY plan_date ASC`,
            [userId]
        );
        weekRows = weekRows.map(row => ({ ...row, plan_date: this.dateKey(row.plan_date) }));

        const [monthRows] = await pool.query(
            `SELECT completion_rate FROM study_plans
             WHERE user_id = ? AND plan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
            [userId]
        );

        const weekMinutes = weekRows.reduce((sum, row) => {
            return (
                sum +
                this.parseJson(row.tasks, [])
                    .filter(task => task.completed || task.status === "completed")
                    .reduce((taskSum, task) => taskSum + Number(task.duration || 0), 0)
            );
        }, 0);
        const monthCompleted = monthRows.filter(row => Number(row.completion_rate || 0) >= 80).length;

        return {
            today: {
                total: todayTasks.length,
                completed: todayCompleted,
                completionRate: todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0
            },
            month: {
                total: Math.max(monthRows.length, 1),
                completed: monthCompleted
            },
            stats: {
                today_minutes: todayTasks
                    .filter(task => task.completed || task.status === "completed")
                    .reduce((sum, task) => sum + Number(task.duration || 0), 0),
                week_minutes: weekMinutes
            },
            progress: {
                recentDays: weekRows,
                averageCompletion:
                    weekRows.length > 0
                        ? Math.round(
                              weekRows.reduce((sum, row) => sum + Number(row.completion_rate || 0), 0) / weekRows.length
                          )
                        : 0,
                totalDays: weekRows.length
            }
        };
    }
}

module.exports = StudyPlanEngine;
