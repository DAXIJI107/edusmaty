const { inferSubjectByName, subjectLabel, normalizeDifficulty } = require("./SubjectUtils");

const DEFAULT_KNOWLEDGE_NODES = [
    ["函数的概念", "理解函数定义、定义域、值域、表示方法", "easy", "theory", "BV1Se4y167hs"],
    ["函数的极限", "极限的定义、左极限右极限、无穷小与无穷大", "medium", "theory", "BV1bu41157SQ"],
    ["导数的定义", "导数的概念、几何意义、可导与连续的关系", "medium", "theory", "BV1kx4y1N7xx"],
    ["基本求导公式", "常数、幂函数、指数函数、对数函数、三角函数的导数", "easy", "practice", "BV1wm421378f"],
    ["复合函数求导", "链式法则及应用", "medium", "practice", "BV1UW4y1j7uL"],
    ["不定积分的概念", "原函数、不定积分的定义与性质", "medium", "theory", "BV1yE411o7NH"],
    ["基本积分法", "直接积分法、凑微分法", "easy", "practice", "BV1hbr6Y6EAQ"],
    ["线性代数", "矩阵、行列式、线性方程组", "medium", "theory", "BV1oZ8cz4EyC"],
    ["力学基础", "牛顿定律、动量、能量", "easy", "theory", "BV1kx411S7f3"],
    ["热力学", "热力学第一、第二定律", "medium", "theory", "BV1bu41157SQ"],
    ["英语语法", "时态、语态、从句", "easy", "practice", "BV1Qh4y1J7Uu"],
    ["Python入门", "变量、条件、循环、函数和项目实战", "easy", "practice", "BV1qW4y1a7fU"]
];

const SOFTWARE_ENGINEERING_NODES = [
    {
        name: "软件工程基础概念",
        description: "理解软件工程为什么出现、解决什么问题，以及软件危机、工程化开发、质量和维护性的关系。",
        difficulty: "easy",
        type: "theory",
        subject: "software_engineering",
        mastery: 35,
        summary: "软件工程把工程化方法应用到软件开发、运行和维护中，关注需求、设计、实现、测试、部署、维护和质量保证。"
    },
    {
        name: "软件过程模型",
        description: "比较瀑布模型、原型模型、增量迭代模型和敏捷方法的适用场景、优缺点与风险。",
        difficulty: "medium",
        type: "case",
        subject: "software_engineering",
        mastery: 42,
        summary: "过程模型决定项目如何组织阶段、反馈和交付。需求稳定时可用瀑布，需求变化快时更适合迭代或敏捷。"
    },
    {
        name: "需求分析",
        description: "掌握功能需求、非功能需求、用户故事、用例和需求规格说明的基本写法。",
        difficulty: "medium",
        type: "practice",
        subject: "software_engineering",
        mastery: 38,
        summary:
            "需求分析用于澄清系统要解决什么问题。功能需求描述系统做什么，非功能需求描述性能、安全、可靠性等质量约束。"
    },
    {
        name: "软件设计与建模",
        description: "从需求推导模块、接口和主要类关系，理解高内聚、低耦合、抽象和分层设计。",
        difficulty: "medium",
        type: "diagram",
        subject: "software_engineering",
        mastery: 45,
        summary: "软件设计把需求转成模块、接口、数据和交互结构。好的设计通常追求高内聚、低耦合和清晰分层。"
    },
    {
        name: "软件测试基础",
        description: "理解单元测试、集成测试、系统测试、黑盒测试和白盒测试，并能为需求设计测试用例。",
        difficulty: "medium",
        type: "practice",
        subject: "software_engineering",
        mastery: 48,
        summary: "软件测试通过设计测试用例发现缺陷并验证需求。黑盒测试关注输入输出，白盒测试关注内部逻辑和覆盖。"
    }
];

const SOFTWARE_ENGINEERING_RAG = [
    {
        title: "软件工程基础概念",
        course: "软件工程导论",
        chapter: "第1章 软件工程概述",
        knowledgePoint: "软件工程基础概念",
        summary: "软件工程的目标、范围和软件危机背景。",
        chunks: [
            "软件工程是把工程化思想应用到软件开发、运行和维护中的学科。它关注的不只是写代码，还包括需求、设计、实现、测试、部署、维护、项目管理和质量保证。",
            "软件危机通常表现为开发延期、成本超支、质量不稳定、需求难以控制和维护困难。软件工程的核心目标是用系统方法降低这些风险。"
        ]
    },
    {
        title: "需求分析入门",
        course: "软件工程导论",
        chapter: "第3章 需求工程",
        knowledgePoint: "需求分析",
        summary: "功能需求、非功能需求、用户故事和验收标准。",
        chunks: [
            "需求分析的任务是澄清系统应该解决什么问题。功能需求描述系统要做什么，非功能需求描述性能、安全、可靠性、可用性等质量约束。",
            "用户故事常用“作为某类用户，我希望完成某个目标，从而获得某种价值”的格式。复杂系统仍需要补充验收标准和约束说明。"
        ]
    },
    {
        title: "软件测试基础",
        course: "软件工程导论",
        chapter: "第6章 软件测试",
        knowledgePoint: "软件测试基础",
        summary: "测试层次、黑盒测试、白盒测试和测试用例。",
        chunks: [
            "黑盒测试从输入和输出角度设计测试，不依赖代码内部结构；白盒测试关注程序内部逻辑、分支、路径和覆盖率。",
            "好的测试用例应包含测试目标、前置条件、输入数据、执行步骤、预期结果和实际结果记录。测试用例要能追溯到具体需求。"
        ]
    }
];

const SOFTWARE_ENGINEERING_QUESTIONS = [
    {
        knowledge: "软件工程基础概念",
        question: "软件工程主要解决的问题是什么？",
        options: [
            "只提高代码运行速度",
            "用系统方法提升软件开发、维护和质量管理",
            "只学习某一种编程语言",
            "完全取消测试工作"
        ],
        answer: "用系统方法提升软件开发、维护和质量管理",
        difficulty: "easy"
    },
    {
        knowledge: "软件过程模型",
        question: "需求非常明确且变化较少的项目，更适合优先考虑哪类过程模型？",
        options: ["瀑布模型", "无计划边写边改", "只做原型不交付", "完全不做文档"],
        answer: "瀑布模型",
        difficulty: "medium"
    },
    {
        knowledge: "需求分析",
        question: "“系统应在 2 秒内返回搜索结果”属于哪类需求？",
        options: ["功能需求", "非功能需求", "业务实体", "代码注释"],
        answer: "非功能需求",
        difficulty: "medium"
    },
    {
        knowledge: "软件设计与建模",
        question: "高内聚、低耦合的设计目标是什么？",
        options: [
            "让一个模块承担所有职责",
            "让模块职责集中并减少模块间依赖",
            "让代码不能被测试",
            "让数据库替代全部业务逻辑"
        ],
        answer: "让模块职责集中并减少模块间依赖",
        difficulty: "medium"
    },
    {
        knowledge: "软件测试基础",
        question: "从输入输出角度设计测试、不关心内部代码结构的方法通常是？",
        options: ["黑盒测试", "白盒测试", "代码格式化", "数据库备份"],
        answer: "黑盒测试",
        difficulty: "medium"
    }
];

async function tableExists(pool, tableName) {
    const [rows] = await pool.query("SHOW TABLES LIKE ?", [tableName]);
    return rows.length > 0;
}

async function columnExists(pool, tableName, columnName) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
    return rows.length > 0;
}

async function ensureCrudSchema(pool) {
    // Admin CRUD requires safe on/off switching rather than hard deletes.
    const targets = [
        {
            table: "knowledge_nodes",
            column: "is_active",
            ddl: "ALTER TABLE knowledge_nodes ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1"
        },
        {
            table: "exams",
            column: "is_active",
            ddl: "ALTER TABLE exams ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1"
        },
        {
            table: "questions",
            column: "is_active",
            ddl: "ALTER TABLE questions ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1"
        }
    ];

    for (const target of targets) {
        if (!(await tableExists(pool, target.table))) continue;
        if (!(await columnExists(pool, target.table, target.column))) {
            await pool.query(target.ddl);
        }
    }
}

async function countRows(pool, tableName) {
    if (!(await tableExists(pool, tableName))) return 0;
    const [[row]] = await pool.query(`SELECT COUNT(*) AS total FROM \`${tableName}\``);
    return row.total || 0;
}

async function ensureKnowledgeSchema(pool) {
    if (!(await tableExists(pool, "knowledge_nodes"))) return;
    if (!(await columnExists(pool, "knowledge_nodes", "subject"))) {
        await pool.query("ALTER TABLE knowledge_nodes ADD COLUMN subject VARCHAR(50) NULL DEFAULT 'math' AFTER type");
    }
    await pool.query(
        `UPDATE knowledge_nodes
         SET subject = ?
         WHERE subject IS NULL OR subject = ''`,
        ["math"]
    );
}

async function ensureExamSchema(pool) {
    if (!(await tableExists(pool, "exams"))) return;
    if (!(await columnExists(pool, "exams", "subject"))) {
        await pool.query("ALTER TABLE exams ADD COLUMN subject VARCHAR(50) NULL DEFAULT 'math' AFTER difficulty");
    }
    const [rows] = await pool.query("SELECT id, name, subject FROM exams");
    for (const row of rows) {
        const inferred = inferSubjectByName(row.name);
        const current = row.subject || "math";
        const shouldUpdate = !row.subject || current !== inferred || (current === "math" && inferred !== "math");
        if (shouldUpdate) {
            await pool.query("UPDATE exams SET subject = ? WHERE id = ?", [inferred, row.id]);
        }
    }
}

async function ensureLearningTables(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS course_interactions (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            knowledge_node_id INT NOT NULL,
            action_type VARCHAR(40) NOT NULL,
            payload JSON NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_course_interactions_user_node (user_id, knowledge_node_id, action_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS course_notes (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            knowledge_node_id INT NOT NULL,
            subject VARCHAR(64) NULL,
            content TEXT NOT NULL,
            progress_snapshot DECIMAL(5,2) NULL DEFAULT 0,
            last_section VARCHAR(255) NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_course_notes_user_node (user_id, knowledge_node_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS course_comments (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            knowledge_node_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_course_comments_node (knowledge_node_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    if (!(await columnExists(pool, "course_notes", "subject"))) {
        await pool.query("ALTER TABLE course_notes ADD COLUMN subject VARCHAR(64) NULL AFTER knowledge_node_id");
    }
    if (!(await columnExists(pool, "course_notes", "progress_snapshot"))) {
        await pool.query(
            "ALTER TABLE course_notes ADD COLUMN progress_snapshot DECIMAL(5,2) NULL DEFAULT 0 AFTER content"
        );
    }
    if (!(await columnExists(pool, "course_notes", "last_section"))) {
        await pool.query("ALTER TABLE course_notes ADD COLUMN last_section VARCHAR(255) NULL AFTER progress_snapshot");
    }
}

async function ensureKnowledgeData(pool) {
    if (!(await tableExists(pool, "knowledge_nodes"))) return;
    await ensureCrudSchema(pool);
    await ensureKnowledgeSchema(pool);
    const total = await countRows(pool, "knowledge_nodes");
    if (total === 0) {
        const rows = DEFAULT_KNOWLEDGE_NODES.map(row => [
            row[0],
            row[1],
            row[2],
            row[3],
            inferSubjectByName(row[0]),
            row[4]
        ]);
        const hasBvid = await columnExists(pool, "knowledge_nodes", "bvid");
        const hasVideoPlatform = await columnExists(pool, "knowledge_nodes", "video_platform");
        if (hasBvid && hasVideoPlatform) {
            await pool.query(
                `INSERT INTO knowledge_nodes (name, description, difficulty, type, subject, bvid, video_platform)
                 VALUES ?`,
                [rows.map(row => [...row, "bilibili"])]
            );
        } else {
            await pool.query(
                `INSERT INTO knowledge_nodes (name, description, difficulty, type, subject)
                 VALUES ?`,
                [rows.map(row => row.slice(0, 5))]
            );
        }
    }

    await ensureSoftwareEngineeringKnowledgeBase(pool);

    const [nodes] = await pool.query("SELECT id, name, subject FROM knowledge_nodes");
    for (const node of nodes) {
        const inferred = inferSubjectByName(node.name);
        const current = node.subject || "math";
        if (current === "software_engineering") continue;
        const shouldUpdate = !node.subject || current !== inferred || (current === "math" && inferred !== "math");
        if (shouldUpdate) {
            await pool.query("UPDATE knowledge_nodes SET subject = ? WHERE id = ?", [inferred, node.id]);
        }
    }
}

async function ensureSoftwareEngineeringKnowledgeBase(pool) {
    if (!(await tableExists(pool, "knowledge_nodes"))) return;

    for (const node of SOFTWARE_ENGINEERING_NODES) {
        const [existing] = await pool.query("SELECT id FROM knowledge_nodes WHERE name = ? AND subject = ? LIMIT 1", [
            node.name,
            node.subject
        ]);
        if (existing.length) {
            await pool.query(
                `UPDATE knowledge_nodes
                 SET description = ?, difficulty = ?, type = ?, is_active = 1
                 WHERE id = ?`,
                [node.description, node.difficulty, node.type, existing[0].id]
            );
        } else {
            await pool.query(
                `INSERT INTO knowledge_nodes (name, description, difficulty, type, subject, is_active)
                 VALUES (?, ?, ?, ?, ?, 1)`,
                [node.name, node.description, node.difficulty, node.type, node.subject]
            );
        }
    }

    if (await tableExists(pool, "courses")) {
        const [courseRows] = await pool.query("SELECT id FROM courses WHERE title = ? AND subject = ? LIMIT 1", [
            "软件工程导论",
            "software_engineering"
        ]);
        if (courseRows.length) {
            await pool.query(
                `UPDATE courses
                 SET provider = ?, difficulty = ?, description = ?, source_url = ?, progress = COALESCE(progress, 0)
                 WHERE id = ?`,
                [
                    "EduSmart",
                    "beginner",
                    "覆盖软件生命周期、需求分析、建模设计、测试和工程实践的默认知识库课程。",
                    "/knowledge-base?subject=software_engineering",
                    courseRows[0].id
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO courses (title, provider, subject, difficulty, description, source_url, progress)
                 VALUES (?, ?, ?, ?, ?, ?, 0)`,
                [
                    "软件工程导论",
                    "EduSmart",
                    "software_engineering",
                    "beginner",
                    "覆盖软件生命周期、需求分析、建模设计、测试和工程实践的默认知识库课程。",
                    "/knowledge-base?subject=software_engineering"
                ]
            );
        }
    }

    if (await tableExists(pool, "knowledge_points")) {
        for (const node of SOFTWARE_ENGINEERING_NODES) {
            const [existing] = await pool.query(
                "SELECT id FROM knowledge_points WHERE title = ? AND subject = ? LIMIT 1",
                [node.name, node.subject]
            );
            if (existing.length) {
                await pool.query(
                    `UPDATE knowledge_points
                     SET summary = ?, mastery = ?, source_name = ?, source_url = ?
                     WHERE id = ?`,
                    [
                        node.summary,
                        node.mastery,
                        "EduSmart 默认知识库",
                        `/learn?topic=${encodeURIComponent(node.name)}`,
                        existing[0].id
                    ]
                );
            } else {
                await pool.query(
                    `INSERT INTO knowledge_points (title, subject, summary, mastery, source_name, source_url)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        node.name,
                        node.subject,
                        node.summary,
                        node.mastery,
                        "EduSmart 默认知识库",
                        `/learn?topic=${encodeURIComponent(node.name)}`
                    ]
                );
            }
        }
    }

    if ((await tableExists(pool, "rag_documents")) && (await tableExists(pool, "rag_chunks"))) {
        for (const doc of SOFTWARE_ENGINEERING_RAG) {
            const docId = `seed-${doc.knowledgePoint}`;
            const [existing] = await pool.query("SELECT doc_id FROM rag_documents WHERE doc_id = ? LIMIT 1", [docId]);
            if (existing.length) {
                await pool.query(
                    `UPDATE rag_documents
                     SET title = ?, subject = ?, course = ?, chapter = ?, knowledge_point = ?, summary = ?, url = ?
                     WHERE doc_id = ?`,
                    [
                        doc.title,
                        "software_engineering",
                        doc.course,
                        doc.chapter,
                        doc.knowledgePoint,
                        doc.summary,
                        `/kb/software-engineering/${encodeURIComponent(doc.knowledgePoint)}`,
                        docId
                    ]
                );
            } else {
                await pool.query(
                    `INSERT INTO rag_documents (doc_id, source_id, title, url, subject, course, chapter, knowledge_point, summary)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        docId,
                        "edusmart-seed",
                        doc.title,
                        `/kb/software-engineering/${encodeURIComponent(doc.knowledgePoint)}`,
                        "software_engineering",
                        doc.course,
                        doc.chapter,
                        doc.knowledgePoint,
                        doc.summary
                    ]
                );
            }

            for (let index = 0; index < doc.chunks.length; index++) {
                const chunkId = `${docId}-${index + 1}`;
                const [chunkRows] = await pool.query("SELECT chunk_id FROM rag_chunks WHERE chunk_id = ? LIMIT 1", [
                    chunkId
                ]);
                if (chunkRows.length) {
                    await pool.query(
                        `UPDATE rag_chunks
                         SET doc_id = ?, chunk_index = ?, chunk_text = ?, subject = ?, course = ?, knowledge_point = ?, quality_score = ?, is_active = 1
                         WHERE chunk_id = ?`,
                        [
                            docId,
                            index,
                            doc.chunks[index],
                            "software_engineering",
                            doc.course,
                            doc.knowledgePoint,
                            0.96,
                            chunkId
                        ]
                    );
                } else {
                    await pool.query(
                        `INSERT INTO rag_chunks (chunk_id, doc_id, chunk_index, chunk_text, subject, course, knowledge_point, quality_score, is_active)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                        [
                            chunkId,
                            docId,
                            index,
                            doc.chunks[index],
                            "software_engineering",
                            doc.course,
                            doc.knowledgePoint,
                            0.96
                        ]
                    );
                }
            }
        }
    }

    if ((await tableExists(pool, "questions")) && (await tableExists(pool, "knowledge_points"))) {
        for (const item of SOFTWARE_ENGINEERING_QUESTIONS) {
            const [points] = await pool.query(
                "SELECT id FROM knowledge_points WHERE title = ? AND subject = ? LIMIT 1",
                [item.knowledge, "software_engineering"]
            );
            if (!points.length) continue;
            const knowledgeId = points[0].id;
            const [existing] = await pool.query("SELECT id FROM questions WHERE question = ? LIMIT 1", [item.question]);
            if (existing.length) {
                await pool.query(
                    `UPDATE questions
                     SET knowledge_id = ?, correct_answer = ?, options_json = ?, difficulty = ?, source_name = ?, source_url = ?, is_active = 1
                     WHERE id = ?`,
                    [
                        knowledgeId,
                        item.answer,
                        JSON.stringify(item.options),
                        item.difficulty,
                        "EduSmart 默认知识库",
                        `/practice?knowledge=${knowledgeId}`,
                        existing[0].id
                    ]
                );
            } else {
                await pool.query(
                    `INSERT INTO questions (knowledge_id, question, correct_answer, options_json, difficulty, source_name, source_url, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                    [
                        knowledgeId,
                        item.question,
                        item.answer,
                        JSON.stringify(item.options),
                        item.difficulty,
                        "EduSmart 默认知识库",
                        `/practice?knowledge=${knowledgeId}`
                    ]
                );
            }
        }
    }

    await deactivateDuplicateKnowledgeNodes(pool, "software_engineering");
}

async function deactivateDuplicateKnowledgeNodes(pool, subject) {
    const [duplicates] = await pool.query(
        `SELECT name, MIN(id) AS keep_id, GROUP_CONCAT(id ORDER BY id) AS ids, COUNT(*) AS total
         FROM knowledge_nodes
         WHERE subject = ?
         GROUP BY name
         HAVING COUNT(*) > 1`,
        [subject]
    );

    for (const item of duplicates) {
        await pool.query(
            `UPDATE knowledge_nodes
             SET is_active = CASE WHEN id = ? THEN 1 ELSE 0 END
             WHERE subject = ? AND name = ?`,
            [item.keep_id, subject, item.name]
        );
    }
}

async function ensureExamData(pool) {
    if (!(await tableExists(pool, "exams"))) return;
    await ensureCrudSchema(pool);
    await ensureExamSchema(pool);
    await ensureKnowledgeData(pool);

    const SUBJECT_CODES = ["math", "physics", "chemistry", "biology", "english", "programming"];
    const LEVELS = [
        { level: "easy", duration: 45, title: "基础测验" },
        { level: "medium", duration: 60, title: "单元测试" },
        { level: "hard", duration: 90, title: "综合考试" }
    ];

    for (const code of SUBJECT_CODES) {
        for (const item of LEVELS) {
            const name = `${subjectLabel(code)}${item.title}`;
            const [rows] = await pool.query(
                "SELECT id FROM exams WHERE name = ? OR (subject = ? AND difficulty = ?) LIMIT 1",
                [name, code, item.level]
            );
            if (!rows.length) {
                await pool.query(
                    "INSERT INTO exams (name, difficulty, subject, duration, is_publish) VALUES (?, ?, ?, ?, 1)",
                    [name, item.level, code, item.duration]
                );
            }
        }
    }
}

function buildSingleQuestion(node) {
    const options = [
        `定义与内涵：${node.name}`,
        `错误迁移：忽略${node.name}中的关键条件`,
        `仅记忆结论，不做推理`,
        `将${node.name}与无关章节混用`
    ];
    return {
        type: "single",
        content: `关于「${node.name}」，下列说法最准确的是哪一项？`,
        options: JSON.stringify(options),
        answer: options[0],
        score: 5
    };
}

function buildMultipleQuestion(node) {
    const options = [
        `${node.name}需要先理解定义`,
        `${node.name}需要结合典型例题迁移`,
        `${node.name}只能死记硬背`,
        `${node.name}可通过错题复盘强化`
    ];
    return {
        type: "multiple",
        content: `针对「${node.name}」的有效学习策略有哪些？（多选）`,
        options: JSON.stringify(options),
        answer: JSON.stringify([options[0], options[1], options[3]]),
        score: 8
    };
}

function buildJudgeQuestion(node, subject) {
    return {
        type: "judge",
        content: `「${node.name}」属于${subjectLabel(subject)}学科核心知识点，判断此说法是否正确。`,
        options: JSON.stringify(["正确", "错误"]),
        answer: "正确",
        score: 5
    };
}

function buildEssayQuestion(node) {
    return {
        type: "essay",
        content: `请用自己的话解释「${node.name}」并结合一道典型题说明它的应用场景。`,
        options: null,
        answer: "开放题，教师评阅",
        score: 10
    };
}

/**
 * 使用 PersonalizedQuestionGenerator 生成个性化题目
 * 当LLM可用时提供高质量题目，否则回退到模版题目
 */
async function buildQuestionWithLLM(node, pool) {
    try {
        const PersonalizedQuestionGenerator = require("./PersonalizedQuestionGenerator");
        const generator = new PersonalizedQuestionGenerator(pool);
        const result = await generator.generateQuestion(node.name, {
            difficulty: node.difficulty || "medium",
            questionType: Math.floor(Math.random() * 3)
        });

        if (result && result.question && result.options) {
            return {
                type: result.type || "single",
                content: result.question,
                options: JSON.stringify(result.options),
                answer: typeof result.answer === "number" ? result.options[result.answer] : String(result.answer),
                score: 5
            };
        }
    } catch (e) {
        // LLM不可用，回退到模版
    }

    // 回退到原有模版
    const builders = [buildSingleQuestion, buildMultipleQuestion, buildJudgeQuestion, buildEssayQuestion];
    const builder = builders[Math.floor(Math.random() * builders.length)];
    return builder(node);
}

async function ensureQuestionData(pool) {
    if (!(await tableExists(pool, "questions"))) return;
    await ensureCrudSchema(pool);
    await ensureExamData(pool);
    await pool.query(
        `UPDATE questions q
         JOIN knowledge_nodes k ON q.node_id = k.id
         SET q.subject = k.subject
         WHERE q.node_id IS NOT NULL
           AND (q.subject IS NULL OR q.subject = '' OR q.subject <> k.subject)`
    );

    const minQuestionCount = 320;
    const minPerSubject = 30;
    const total = await countRows(pool, "questions");
    const [subjectCountRows] = await pool.query("SELECT subject, COUNT(*) AS total FROM questions GROUP BY subject");
    const subjectCounts = subjectCountRows.reduce((acc, row) => {
        acc[row.subject || "math"] = Number(row.total || 0);
        return acc;
    }, {});
    const subjectNeedFill = ["math", "physics", "chemistry", "biology", "english", "programming"].some(
        code => (subjectCounts[code] || 0) < minPerSubject
    );
    if (total >= minQuestionCount && !subjectNeedFill) return;

    const [nodes] = await pool.query(
        "SELECT id, name, description, difficulty, subject FROM knowledge_nodes ORDER BY id"
    );
    const [exams] = await pool.query("SELECT id, subject, difficulty FROM exams WHERE is_publish = 1");
    if (!nodes.length || !exams.length) return;

    const examMap = {};
    for (const exam of exams) {
        const subject = exam.subject || "math";
        const level = normalizeDifficulty(exam.difficulty);
        const key = `${subject}:${level}`;
        if (!examMap[key]) examMap[key] = [];
        examMap[key].push(exam.id);
    }

    const [existingRows] = await pool.query("SELECT content FROM questions");
    const existingContent = new Set(existingRows.map(row => row.content));
    const insertRows = [];

    for (const node of nodes) {
        const subject = node.subject || inferSubjectByName(node.name);
        const level = normalizeDifficulty(node.difficulty);
        const examIds = examMap[`${subject}:${level}`] || examMap[`${subject}:medium`] || examMap["math:medium"] || [];
        const examId = examIds[0] || null;

        // 尝试用LLM生成个性化题目，回退到模版
        const llmQuestion = await buildQuestionWithLLM(node, pool);

        const variants = [
            llmQuestion,
            buildMultipleQuestion(node),
            buildJudgeQuestion(node, subject),
            buildEssayQuestion(node),
            {
                type: "single",
                content: `在${subjectLabel(subject)}学习中，「${node.name}」最常见的失分原因是什么？`,
                options: JSON.stringify(["定义不清", "题干太短", "字数不够", "读题太快"]),
                answer: "定义不清",
                score: 5
            },
            {
                type: "judge",
                content: `只刷题不复盘，也能长期掌握「${node.name}」。`,
                options: JSON.stringify(["正确", "错误"]),
                answer: "错误",
                score: 5
            }
        ];

        for (const question of variants) {
            if (
                !existingContent.has(question.content) &&
                ((subjectCounts[subject] || 0) < minPerSubject || total < minQuestionCount)
            ) {
                existingContent.add(question.content);
                insertRows.push([
                    examId,
                    question.type,
                    question.content,
                    question.options,
                    question.answer,
                    question.score,
                    level,
                    subject,
                    node.id
                ]);
                subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
            }
        }
    }

    if (insertRows.length) {
        await pool.query(
            `INSERT INTO questions
                (exam_id, type, content, options, answer, score, difficulty, subject, node_id)
             VALUES ?`,
            [insertRows]
        );
    }
}

async function ensurePathData(pool, userId) {
    await ensureKnowledgeData(pool);
    if (!(await tableExists(pool, "student_knowledge")) || !(await tableExists(pool, "knowledge_nodes"))) return;

    const [[existing]] = await pool.query("SELECT COUNT(*) AS total FROM student_knowledge WHERE user_id = ?", [
        userId
    ]);
    if (existing.total > 0) return;

    const [nodes] = await pool.query("SELECT id, difficulty FROM knowledge_nodes ORDER BY id LIMIT 60");
    const rows = nodes.map((node, index) => {
        const level = normalizeDifficulty(node.difficulty);
        const base = level === "hard" ? 30 : level === "medium" ? 50 : 70;
        return [userId, node.id, Math.min(96, base + ((index * 7) % 26))];
    });
    if (rows.length) {
        await pool.query("INSERT INTO student_knowledge (user_id, node_id, mastery) VALUES ?", [rows]);
    }
}

async function ensureIotData(pool, userId) {
    if (await tableExists(pool, "devices")) {
        const total = await countRows(pool, "devices");
        if (total === 0) {
            await pool.query(
                `INSERT INTO devices (device_id, device_type, name, status, user_id)
                 VALUES ?`,
                [
                    [
                        ["printer-001", "3d_printer", "3D打印机一号", "online", userId],
                        ["arduino-101", "arduino", "Arduino传感器套件", "online", userId],
                        ["cam-ai", "other", "AI视觉摄像头", "offline", userId]
                    ]
                ]
            );
        }
    }

    if (await tableExists(pool, "operation_knowledge_mapping")) {
        const total = await countRows(pool, "operation_knowledge_mapping");
        if (total === 0) {
            await ensureKnowledgeData(pool);
            await pool.query(
                `INSERT INTO operation_knowledge_mapping (device_type, operation_pattern, knowledge_node_id, weight)
                 VALUES ?`,
                [
                    [
                        ["3d_printer", "print", 9, 1],
                        ["arduino", "read_temp", 10, 0.85],
                        ["other", "vision_check", 1, 0.7]
                    ]
                ]
            );
        }
    }
}

async function ensureClosedLoopTables(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS error_book (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            question_id INT NOT NULL,
            exam_record_id INT NULL,
            wrong_answer TEXT NULL,
            correct_answer TEXT NULL,
            error_type VARCHAR(32) NULL,
            error_reason TEXT NULL,
            knowledge_node_id INT NULL,
            subject VARCHAR(50) NULL,
            mastery_before DECIMAL(5,2) NULL,
            redo_count INT NULL DEFAULT 0,
            redo_correct TINYINT(1) NULL DEFAULT 0,
            status VARCHAR(20) NULL DEFAULT 'unsolved',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_error_user_status (user_id, status),
            INDEX idx_error_user_subject (user_id, subject),
            INDEX idx_error_question (question_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

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

    await pool.query(`
        CREATE TABLE IF NOT EXISTS practice_records (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            knowledge_node_id INT NULL,
            question_ids JSON NULL,
            answers JSON NULL,
            score DECIMAL(5,2) NULL,
            total DECIMAL(5,2) NULL,
            duration INT NULL,
            practice_type VARCHAR(20) NULL DEFAULT 'weakness',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_practice_user (user_id),
            INDEX idx_practice_node (knowledge_node_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS feedback_loop (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            cycle_start DATE NULL,
            cycle_end DATE NULL,
            exam_record_id INT NULL,
            weak_points JSON NULL,
            recommended_courses JSON NULL,
            practice_record_id INT NULL,
            error_solved_count INT NULL DEFAULT 0,
            mastery_improvement JSON NULL,
            cycle_effectiveness DECIMAL(5,2) NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_feedback_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS study_recommendations (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            trigger_type VARCHAR(20) NULL,
            trigger_id INT NULL,
            recommended_json JSON NULL,
            accepted_count INT NULL DEFAULT 0,
            completed_count INT NULL DEFAULT 0,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_recommend_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    if (!(await tableExists(pool, "exam_records"))) return;
    if (!(await columnExists(pool, "exam_records", "paper_type"))) {
        await pool.query("ALTER TABLE exam_records ADD COLUMN paper_type VARCHAR(20) NULL DEFAULT 'standard'");
    }
    if (!(await columnExists(pool, "exam_records", "knowledge_coverage"))) {
        await pool.query("ALTER TABLE exam_records ADD COLUMN knowledge_coverage JSON NULL");
    }

    if (await tableExists(pool, "student_knowledge")) {
        if (!(await columnExists(pool, "student_knowledge", "last_practice_at"))) {
            await pool.query("ALTER TABLE student_knowledge ADD COLUMN last_practice_at TIMESTAMP NULL");
        }
        if (!(await columnExists(pool, "student_knowledge", "error_count"))) {
            await pool.query("ALTER TABLE student_knowledge ADD COLUMN error_count INT NULL DEFAULT 0");
        }
        if (!(await columnExists(pool, "student_knowledge", "trend"))) {
            await pool.query("ALTER TABLE student_knowledge ADD COLUMN trend VARCHAR(10) NULL DEFAULT 'stable'");
        }
    }
}

async function ensureAssessmentTables(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS resource_usage_logs (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            resource_type VARCHAR(30) NULL,
            completion_rate DECIMAL(5,2) NULL DEFAULT 0,
            feedback VARCHAR(20) NULL DEFAULT 'neutral',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_rul_user (user_id),
            INDEX idx_rul_user_time (user_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS study_sessions (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            duration_minutes INT NULL DEFAULT 0,
            subject VARCHAR(50) NULL,
            activity_type VARCHAR(30) NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_ss_user (user_id),
            INDEX idx_ss_user_time (user_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 为已有表补充列
    if (await tableExists(pool, "exam_records")) {
        if (!(await columnExists(pool, "exam_records", "score"))) {
            await pool.query("ALTER TABLE exam_records ADD COLUMN score DECIMAL(5,2) NULL");
        }
        if (!(await columnExists(pool, "exam_records", "total_score"))) {
            await pool.query("ALTER TABLE exam_records ADD COLUMN total_score DECIMAL(5,2) NULL DEFAULT 100");
        }
        if (!(await columnExists(pool, "exam_records", "time_spent"))) {
            await pool.query("ALTER TABLE exam_records ADD COLUMN time_spent INT NULL");
        }
    }
}

async function ensureDefaultUsers(pool) {
    if (!(await tableExists(pool, "users"))) return;

    const bcrypt = require("bcryptjs");
    const [adminExists] = await pool.query("SELECT id FROM users WHERE username = ?", ["admin"]);
    if (adminExists.length === 0) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await pool.query("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)", [
            "admin",
            "admin@edusmart.local",
            hashedPassword,
            "admin",
            "active"
        ]);
        console.log("已创建默认管理员用户: admin/admin123");
    }

    const [studentExists] = await pool.query("SELECT id FROM users WHERE username = ?", ["student"]);
    if (studentExists.length === 0) {
        const hashedPassword = await bcrypt.hash("student123", 10);
        await pool.query("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)", [
            "student",
            "student@edusmart.local",
            hashedPassword,
            "student",
            "active"
        ]);
        console.log("已创建默认学生用户: student/student123");
    }
}

module.exports = {
    ensureCrudSchema,
    ensureLearningTables,
    ensureKnowledgeData,
    ensureExamData,
    ensurePathData,
    ensureQuestionData,
    ensureIotData,
    ensureClosedLoopTables,
    ensureAssessmentTables,
    ensureDefaultUsers
};
