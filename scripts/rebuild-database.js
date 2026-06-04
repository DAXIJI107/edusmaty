const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const config = require("../config");

const dbName = process.env.DB_NAME || config.database.database || "edusmart_rebuild";
const sourceNotes = [];

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: { "User-Agent": "EduSmartRebuild/2.0 educational demo" }
    });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json();
}

function decodeHtml(value) {
    return String(value || "")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

const COMPUTER_TOPICS = [
    ["计算机科学导论", "计算机科学", "计算机基础"],
    ["计算机组成原理", "计算机组成原理", "计算机基础"],
    ["冯·诺依曼结构", "冯·诺伊曼结构", "计算机基础"],
    ["二进制与信息编码", "二进制", "计算机基础"],
    ["数据结构", "数据结构", "数据结构与算法"],
    ["数组", "数组", "数据结构与算法"],
    ["链表", "链表", "数据结构与算法"],
    ["栈", "堆栈", "数据结构与算法"],
    ["队列", "队列", "数据结构与算法"],
    ["树结构", "树_(数据结构)", "数据结构与算法"],
    ["二叉树", "二叉树", "数据结构与算法"],
    ["哈希表", "哈希表", "数据结构与算法"],
    ["图论基础", "图论", "数据结构与算法"],
    ["算法设计", "算法", "数据结构与算法"],
    ["时间复杂度", "时间复杂度", "数据结构与算法"],
    ["排序算法", "排序算法", "数据结构与算法"],
    ["动态规划", "动态规划", "数据结构与算法"],
    ["贪心算法", "贪心算法", "数据结构与算法"],
    ["操作系统", "操作系统", "系统软件"],
    ["进程与线程", "进程", "系统软件"],
    ["内存管理", "内存管理", "系统软件"],
    ["虚拟内存", "虚拟内存", "系统软件"],
    ["文件系统", "文件系统", "系统软件"],
    ["Linux", "Linux", "系统软件"],
    ["计算机网络", "计算机网络", "计算机网络"],
    ["TCP/IP协议族", "TCP/IP协议族", "计算机网络"],
    ["HTTP", "超文本传输协议", "计算机网络"],
    ["DNS", "域名系统", "计算机网络"],
    ["网络安全", "网络安全", "网络安全"],
    ["密码学", "密码学", "网络安全"],
    ["数据库系统", "数据库", "数据库"],
    ["关系数据库", "关系数据库", "数据库"],
    ["SQL", "SQL", "数据库"],
    ["事务处理", "数据库事务", "数据库"],
    ["数据库索引", "数据库索引", "数据库"],
    ["软件工程", "软件工程", "软件工程"],
    ["需求分析", "需求分析", "软件工程"],
    ["软件测试", "软件测试", "软件工程"],
    ["版本控制", "版本控制", "软件工程"],
    ["面向对象程序设计", "面向对象程序设计", "程序设计"],
    ["C语言", "C语言", "程序设计"],
    ["Java", "Java", "程序设计"],
    ["Python", "Python", "程序设计"],
    ["JavaScript", "JavaScript", "程序设计"],
    ["Node.js", "Node.js", "程序设计"],
    ["Web开发", "万维网", "程序设计"],
    ["人工智能", "人工智能", "人工智能"],
    ["机器学习", "机器学习", "人工智能"],
    ["深度学习", "深度学习", "人工智能"],
    ["神经网络", "人工神经网络", "人工智能"],
    ["自然语言处理", "自然语言处理", "人工智能"],
    ["计算机视觉", "计算机视觉", "人工智能"],
    ["云计算", "云计算", "云计算与大数据"],
    ["大数据", "大数据", "云计算与大数据"],
    ["分布式系统", "分布式计算", "云计算与大数据"],
    ["容器技术", "操作系统层虚拟化", "云计算与大数据"]
];

async function getWikipediaTopics() {
    const topics = COMPUTER_TOPICS;
    const rows = [];
    for (const [title, page, subject] of topics) {
        try {
            const url = `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`;
            const data = await fetchJson(url);
            rows.push({
                title,
                subject,
                summary: data.extract || `${title} 学习资料`,
                sourceName: "中文维基百科 REST API",
                sourceUrl:
                    data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(page)}`,
                mastery: Math.floor(42 + Math.random() * 42)
            });
        } catch (error) {
            rows.push({
                title,
                subject,
                summary: `${title} 是计算机学习路径中的核心知识点，适合通过概念解释、代码实践、典型题和项目任务形成闭环。`,
                sourceName: "本地计算机知识点兜底",
                sourceUrl: "",
                mastery: Math.floor(42 + Math.random() * 42)
            });
        }
    }
    sourceNotes.push("中文维基百科 REST API page summary");
    return rows;
}

async function getTriviaQuestions(knowledgeRows) {
    const questions = [];
    const stems = [
        {
            difficulty: "easy",
            question: point => `关于「${point.title}」的学习，下列哪一项最适合作为入门理解？`,
            correct: point => `先理解${point.title}的基本概念和适用场景`,
            wrong: point => [
                `只背诵${point.title}的名词，不看例子`,
                `跳过${point.title}直接做综合项目`,
                `把${point.title}与无关学科概念混用`
            ]
        },
        {
            difficulty: "medium",
            question: point => `在智能学习平台中，系统如何判断「${point.title}」需要优先复习？`,
            correct: () => "结合答题正确率、掌握度、错题记录和间隔复习时间",
            wrong: () => ["只看用户是否收藏过课程", "只按课程标题字数排序", "随机选择一个知识点"]
        },
        {
            difficulty: "medium",
            question: point => `围绕「${point.title}」生成自适应练习时，最合理的干扰项设计原则是什么？`,
            correct: () => "干扰项应对应常见误区，能暴露具体认知缺口",
            wrong: () => ["干扰项越离谱越好", "所有选项都写成同一句话", "只放一个正确选项且不记录原因"]
        },
        {
            difficulty: "hard",
            question: point => `如果学生在「${point.title}」题目上连续出错，AI 闭环下一步最应该做什么？`,
            correct: point => `降低难度并生成${point.title}的概念卡、例题和复习任务`,
            wrong: () => ["直接提高难度", "删除该知识点", "只给出分数不提供反馈"]
        },
        {
            difficulty: "easy",
            question: point => `下列哪种学习证据能直接帮助更新「${point.title}」掌握度？`,
            correct: () => "一次带答案记录的练习提交",
            wrong: () => ["打开页面但没有学习行为", "修改头像", "浏览无关课程"]
        },
        {
            difficulty: "hard",
            question: point => `对「${point.title}」做费曼评估时，AI 最应该关注什么？`,
            correct: () => "解释是否清晰、准确，并能补充例子或边界条件",
            wrong: () => ["字数越短越好", "只检查标点符号", "只统计输入速度"]
        },
        {
            difficulty: "medium",
            question: point => `把「${point.title}」放入知识图谱时，边的关系最适合表示什么？`,
            correct: () => "前置依赖、细化关系或类比关系",
            wrong: () => ["用户登录时间", "页面主题颜色", "浏览器版本"]
        },
        {
            difficulty: "easy",
            question: point => `学习「${point.title}」后，哪一种产物最能沉淀为长期学习资产？`,
            correct: () => "结构化笔记卡、错题卡和主动回忆提示",
            wrong: () => ["临时弹窗", "无来源的空白记录", "不可复习的随机文本"]
        }
    ];

    for (const point of knowledgeRows) {
        for (const stem of stems) {
            const correctAnswer = stem.correct(point);
            const options = [correctAnswer, ...stem.wrong(point)].sort(() => Math.random() - 0.5);
            questions.push({
                knowledgeTitle: point.title,
                question: stem.question(point),
                correctAnswer,
                options,
                difficulty: stem.difficulty,
                sourceName: "EduSmart 中文计算机题库生成器",
                sourceUrl: point.sourceUrl
            });
        }
    }
    sourceNotes.push("中文公开知识摘要 + EduSmart 题库模板生成");
    return questions;
}

async function getCourses(knowledgeRows) {
    const realCourseMap = {
        Python: {
            provider: "哔哩哔哩",
            sourceUrl: "https://www.bilibili.com/video/BV1qW4y1a7fU",
            description: "B站 Python 入门公开视频课程，可直接跳转学习。"
        },
        数据结构: {
            provider: "中国高校计算机教育MOOC联盟",
            sourceUrl: "https://computer.icourses.cn/",
            description: "中国高校计算机教育MOOC联盟公开课程入口，适合继续检索数据结构课程资源。"
        },
        计算机网络: {
            provider: "哔哩哔哩",
            sourceUrl: "https://www.bilibili.com/video/BV1c4411d7jb",
            description: "B站计算机网络公开视频课程入口。"
        },
        数据库系统: {
            provider: "哔哩哔哩",
            sourceUrl: "https://www.bilibili.com/video/BV1xs411Q799",
            description: "B站数据库与编程公开视频课程入口。"
        },
        大数据: {
            provider: "厦门大学数据库实验室",
            sourceUrl: "https://dblab.xmu.edu.cn/post/bigdata-online-course/",
            description: "厦门大学数据库实验室维护的大数据技术公开课程资源。"
        },
        软件工程: {
            provider: "中国大学MOOC",
            sourceUrl: "https://www.icourse163.org/",
            description: "中国大学MOOC公开课程平台入口，可检索软件工程相关高校课程。"
        }
    };
    const providers = ["中国大学MOOC", "学堂在线", "中国高校计算机教育MOOC联盟", "哔哩哔哩"];
    const fallback = knowledgeRows.map((point, index) => ({
        title: `${point.title} · 中文公开课程`,
        provider: realCourseMap[point.title]?.provider || providers[index % providers.length],
        subject: point.subject,
        difficulty: index % 3 === 0 ? "进阶" : index % 3 === 1 ? "中等" : "入门",
        description: realCourseMap[point.title]?.description || point.summary,
        sourceUrl: realCourseMap[point.title]?.sourceUrl || point.sourceUrl || "https://computer.icourses.cn/",
        progress: Math.max(8, Math.min(92, point.mastery - 8))
    }));
    sourceNotes.push("哔哩哔哩公开视频 + 中国高校计算机教育MOOC联盟/中国大学MOOC课程入口");
    return fallback;
}

async function main() {
    const rootConfig = { ...config.database };
    delete rootConfig.database;
    const root = await mysql.createConnection(rootConfig);
    await root.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await root.end();

    const db = await mysql.createConnection({ ...config.database, database: dbName, multipleStatements: true });
    await db.query(`
        SET FOREIGN_KEY_CHECKS = 0;
        DROP TABLE IF EXISTS feynman_reviews, tutor_messages, tutor_sessions, note_cards, spaced_reviews, multimodal_contents, ability_radar, digital_humans, learning_preferences, cognitive_profiles, knowledge_edges, user_answers, recommendations, activities, study_tasks, achievements, questions, courses, knowledge_points, notes, users;
        SET FOREIGN_KEY_CHECKS = 1;

        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(160) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(80),
            nickname VARCHAR(80),
            role VARCHAR(40) DEFAULT 'student',
            status VARCHAR(40) DEFAULT 'active',
            interests JSON,
            study_hours DECIMAL(8,2) DEFAULT 0,
            completed_courses INT DEFAULT 0,
            knowledge_mastery INT DEFAULT 0,
            correct_answers INT DEFAULT 0,
            study_efficiency INT DEFAULT 0,
            continuous_days INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE knowledge_points (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(160) NOT NULL,
            subject VARCHAR(80) NOT NULL,
            summary TEXT,
            mastery INT DEFAULT 50,
            source_name VARCHAR(120),
            source_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE knowledge_edges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            source_id INT NOT NULL,
            target_id INT NOT NULL,
            relation VARCHAR(60) NOT NULL,
            weight DECIMAL(4,2) DEFAULT 1,
            rationale TEXT,
            FOREIGN KEY (source_id) REFERENCES knowledge_points(id) ON DELETE CASCADE,
            FOREIGN KEY (target_id) REFERENCES knowledge_points(id) ON DELETE CASCADE
        );

        CREATE TABLE courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(220) NOT NULL,
            provider VARCHAR(120),
            subject VARCHAR(80),
            difficulty VARCHAR(40),
            description TEXT,
            source_url VARCHAR(500),
            progress INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            knowledge_id INT NOT NULL,
            question TEXT NOT NULL,
            correct_answer VARCHAR(500) NOT NULL,
            options_json JSON NOT NULL,
            difficulty VARCHAR(40),
            source_name VARCHAR(120),
            source_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE CASCADE
        );

        CREATE TABLE study_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            knowledge_id INT NULL,
            title VARCHAR(220) NOT NULL,
            subtitle VARCHAR(220),
            icon VARCHAR(40) DEFAULT 'book',
            estimated_minutes INT DEFAULT 20,
            status VARCHAR(40) DEFAULT 'pending',
            task_date DATE NOT NULL,
            sort_order INT DEFAULT 0,
            color VARCHAR(40) DEFAULT '#2f6bff',
            soft_color VARCHAR(80) DEFAULT 'rgba(47,107,255,.12)',
            source VARCHAR(40) DEFAULT 'system',
            completed_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE SET NULL
        );

        CREATE TABLE activities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            icon VARCHAR(40) DEFAULT 'check',
            title VARCHAR(220) NOT NULL,
            time_label VARCHAR(80) DEFAULT '刚刚',
            badge VARCHAR(80),
            color VARCHAR(40) DEFAULT '#18b87a',
            soft_color VARCHAR(80) DEFAULT 'rgba(24,184,122,.12)',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE achievements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(160) NOT NULL,
            badge VARCHAR(80),
            xp INT DEFAULT 0,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE user_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            question_id INT NOT NULL,
            answer VARCHAR(500),
            is_correct TINYINT(1) DEFAULT 0,
            answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        );

        CREATE TABLE recommendations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(220) NOT NULL,
            reason TEXT,
            action_label VARCHAR(80),
            target_view VARCHAR(40),
            priority INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            knowledge_id INT NULL,
            title VARCHAR(220) NOT NULL,
            body MEDIUMTEXT,
            subject VARCHAR(80),
            source_type VARCHAR(40) DEFAULT 'manual',
            source_id INT NULL,
            tags_json JSON,
            review_status VARCHAR(40) DEFAULT 'new',
            next_review_at DATETIME NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE SET NULL
        );

        CREATE TABLE cognitive_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            ability_theta DECIMAL(6,3) DEFAULT 0,
            diagnosis_json JSON,
            misconception_json JSON,
            goal_text VARCHAR(260),
            goal_graph_json JSON,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE learning_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            style VARCHAR(60) DEFAULT 'dialogue',
            modality_weights JSON,
            evidence_json JSON,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE digital_humans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(80) NOT NULL,
            role VARCHAR(80) NOT NULL,
            persona VARCHAR(80),
            voice VARCHAR(80),
            emotion_state VARCHAR(80) DEFAULT 'focused',
            avatar_style VARCHAR(120),
            memory_summary TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE tutor_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            digital_human_id INT,
            mode VARCHAR(80) DEFAULT 'socratic',
            topic VARCHAR(160),
            status VARCHAR(60) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (digital_human_id) REFERENCES digital_humans(id) ON DELETE SET NULL
        );

        CREATE TABLE tutor_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            sender VARCHAR(40) NOT NULL,
            content TEXT NOT NULL,
            strategy VARCHAR(80),
            emotion_signal VARCHAR(80),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES tutor_sessions(id) ON DELETE CASCADE
        );

        CREATE TABLE note_cards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            note_id INT NULL,
            knowledge_id INT NULL,
            title VARCHAR(220) NOT NULL,
            card_type VARCHAR(80) DEFAULT 'concept',
            content_json JSON,
            backlinks_json JSON,
            mastery_signal INT DEFAULT 50,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL,
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE SET NULL
        );

        CREATE TABLE multimodal_contents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            knowledge_id INT NOT NULL,
            modality VARCHAR(80) NOT NULL,
            title VARCHAR(220) NOT NULL,
            content MEDIUMTEXT,
            difficulty_band VARCHAR(80),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE CASCADE
        );

        CREATE TABLE spaced_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            knowledge_id INT NOT NULL,
            next_review_at DATETIME,
            interval_days INT DEFAULT 1,
            ease_factor DECIMAL(5,2) DEFAULT 2.50,
            encoding_depth VARCHAR(60) DEFAULT 'surface',
            review_prompt TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE CASCADE
        );

        CREATE TABLE ability_radar (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            knowledge_id INT NOT NULL,
            memory_score INT DEFAULT 50,
            understanding_score INT DEFAULT 50,
            application_score INT DEFAULT 50,
            analysis_score INT DEFAULT 50,
            transfer_score INT DEFAULT 50,
            creation_score INT DEFAULT 50,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE CASCADE
        );

        CREATE TABLE feynman_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            knowledge_id INT NULL,
            explanation_text TEXT NOT NULL,
            clarity_score INT DEFAULT 0,
            accuracy_score INT DEFAULT 0,
            missing_points_json JSON,
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_points(id) ON DELETE SET NULL
        );
    `);

    const password = await bcrypt.hash("123456", 10);
    await db.query(
        `INSERT INTO users (id, username, email, password, name, nickname, role, interests, study_hours, completed_courses, knowledge_mastery, correct_answers, study_efficiency, continuous_days)
         VALUES
         (1, 'zhangsan', 'zhangsan@edusmart.local', ?, '张三同学', 'zhangsan', 'student', JSON_ARRAY('计算机科学','数据结构','人工智能','软件工程'), 15.6, 6, 72, 18, 77, 13),
         (2, 'teacher', 'teacher@edusmart.local', ?, '李老师', '李老师', 'teacher', JSON_ARRAY('计算机教学分析','个性化辅导','智能题库'), 42.0, 12, 86, 88, 91, 22)`,
        [password, password]
    );

    const knowledgeRows = await getWikipediaTopics();
    for (const item of knowledgeRows) {
        await db.query(
            "INSERT INTO knowledge_points (title, subject, summary, mastery, source_name, source_url) VALUES (?, ?, ?, ?, ?, ?)",
            [item.title, item.subject, item.summary, item.mastery, item.sourceName, item.sourceUrl]
        );
    }
    const [points] = await db.query(
        "SELECT id, title, subject, mastery, summary, source_name AS sourceName, source_url AS sourceUrl FROM knowledge_points"
    );
    const pointByTitle = new Map(points.map(point => [point.title, point]));

    for (let i = 0; i < points.length - 1; i += 1) {
        await db.query(
            "INSERT INTO knowledge_edges (source_id, target_id, relation, weight, rationale) VALUES (?, ?, ?, ?, ?)",
            [
                points[i].id,
                points[i + 1].id,
                i % 3 === 0 ? "requires" : i % 3 === 1 ? "refines" : "analogous_to",
                0.8,
                "由课程顺序和主题相似度初始化"
            ]
        );
    }

    const courses = await getCourses(points);
    for (const course of courses) {
        await db.query(
            "INSERT INTO courses (title, provider, subject, difficulty, description, source_url, progress) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                course.title,
                course.provider,
                course.subject,
                course.difficulty,
                course.description,
                course.sourceUrl,
                course.progress
            ]
        );
    }

    const questions = await getTriviaQuestions(points);
    for (const item of questions) {
        const point = pointByTitle.get(item.knowledgeTitle) || points[0];
        await db.query(
            "INSERT INTO questions (knowledge_id, question, correct_answer, options_json, difficulty, source_name, source_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                point.id,
                item.question,
                item.correctAnswer,
                JSON.stringify(item.options),
                item.difficulty,
                item.sourceName,
                item.sourceUrl
            ]
        );
    }

    const firstPoints = points.slice(0, 4);
    for (let i = 0; i < firstPoints.length; i += 1) {
        const point = firstPoints[i];
        await db.query(
            `INSERT INTO study_tasks (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, color, soft_color)
             VALUES (1, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
            [
                point.id,
                i === 0
                    ? `完成今日推荐课程学习`
                    : i === 1
                      ? `完成 5 道课后练习题`
                      : i === 2
                        ? `与 AI 助手进行专题复盘`
                        : `查看本周学习报告`,
                `${point.subject} · ${point.title}`,
                i === 0 ? "play" : i === 1 ? "file" : i === 2 ? "robot" : "book",
                [45, 20, 15, 10][i],
                i < 2 ? "done" : "pending",
                i + 1,
                ["#635bff", "#18b87a", "#ff9500", "#2f6bff"][i],
                ["rgba(99,91,255,.12)", "rgba(24,184,122,.12)", "rgba(255,149,0,.12)", "rgba(47,107,255,.12)"][i]
            ]
        );
    }

    const activities = [
        ["check", "完成了“数据结构”的学习", "10 分钟前", "学习完成", "#18b87a", "rgba(24,184,122,.12)"],
        ["trophy", "连续学习第 13 天达成", "30 分钟前", "连续记录", "#ff9500", "rgba(255,149,0,.12)"],
        [
            "chart",
            "完成了计算机网络在线测验，系统更新掌握度",
            "1 小时前",
            "测验完成",
            "#2f6bff",
            "rgba(47,107,255,.12)"
        ],
        ["book", "导入中文计算机公开知识与智能题库数据", "今天", "数据入库", "#7c4dff", "rgba(124,77,255,.12)"]
    ];
    for (const row of activities) {
        await db.query(
            "INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color) VALUES (1, ?, ?, ?, ?, ?, ?)",
            row
        );
    }

    for (const title of ["勤奋学习者", "知识点掌握", "学习里程碑", "连续学习"]) {
        await db.query("INSERT INTO achievements (user_id, title, badge, xp) VALUES (1, ?, ?, ?)", [
            title,
            "Lv.2",
            100
        ]);
    }

    await db.query(
        `INSERT INTO recommendations (user_id, title, reason, action_label, target_view, priority)
         VALUES
         (1, '优先复习低掌握计算机知识点', '系统检测到部分计算机知识点掌握度低于 60%，建议先完成巩固任务。', '生成计划', 'path', 95),
         (1, '完成一次计算机智能组卷', '中文计算机题库已入库，可通过答题更新知识画像。', '开始练习', 'exam', 88),
         (1, '沉淀计算机学习笔记', '把中文公开知识摘要转化为自己的结构化笔记，有利于长期保持。', '写笔记', 'asset', 72)`
    );

    await db.query(
        `INSERT INTO notes
            (user_id, knowledge_id, title, body, subject, source_type, tags_json, review_status, next_review_at)
         VALUES
            (1, ?, ?, ?, ?, 'manual', CAST(? AS JSON), 'new', DATE_ADD(NOW(), INTERVAL 1 DAY)),
            (1, ?, '专项练习错题复盘', ?, ?, 'practice', CAST(? AS JSON), 'again', NOW()),
            (1, ?, '课程学习记录：计算机科学导论', ?, ?, 'course', CAST(? AS JSON), 'good', DATE_ADD(NOW(), INTERVAL 3 DAY))`,
        [
            points[0].id,
            `${points[0].title} 学习笔记`,
            points[0].summary,
            points[0].subject,
            JSON.stringify([points[0].subject, "概念", "复习"]),
            points[2].id,
            "本次练习暴露出复杂度边界判断不稳定。复盘重点：先确认输入规模，再区分最坏情况、平均情况和数据结构操作成本。",
            points[2].subject,
            JSON.stringify(["错题", "练习", points[2].subject]),
            points[1].id,
            "完成课程片段后需要沉淀三个问题：这个概念解决什么问题？常见误区是什么？能否举一个迁移例子？",
            points[1].subject,
            JSON.stringify(["课程", "主动回忆", points[1].subject])
        ]
    );
    const [noteRows] = await db.query("SELECT id FROM notes WHERE user_id = 1 LIMIT 1");

    await db.query(
        `INSERT INTO cognitive_profiles (user_id, ability_theta, diagnosis_json, misconception_json, goal_text, goal_graph_json)
         VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, CAST(? AS JSON))`,
        [
            1,
            0.42,
            JSON.stringify({
                irt: { theta: 0.42, confidence: 0.74 },
                weakConcepts: points.slice(0, 3).map(p => p.title),
                readiness: "需要修复计算机前置概念"
            }),
            JSON.stringify([
                { concept: "复杂度边界判断不清", severity: 0.72 },
                { concept: "系统调用与库函数混淆", severity: 0.66 }
            ]),
            "系统掌握计算机科学核心能力",
            JSON.stringify({
                root: "计算机科学核心能力",
                prerequisites: ["计算机组成原理", "数据结构", "操作系统", "计算机网络"],
                next: ["数据库系统", "软件工程", "人工智能", "项目实战"]
            })
        ]
    );

    await db.query(
        `INSERT INTO learning_preferences (user_id, style, modality_weights, evidence_json)
         VALUES (1, 'dialogue+visual', CAST(? AS JSON), CAST(? AS JSON))`,
        [
            JSON.stringify({ text: 0.72, video: 0.64, dialogue: 0.91, experiment: 0.78 }),
            JSON.stringify({ readingSpeed: "medium", hintPreference: "socratic", bestTime: "14:00-16:00" })
        ]
    );

    await db.query(
        `INSERT INTO digital_humans (user_id, name, role, persona, voice, emotion_state, avatar_style, memory_summary)
         VALUES
         (1, '小星', '数字人导师', '苏格拉底式、耐心、会追问', 'warm-female', 'focused', '蓝紫科技风', '记住用户容易在算法复杂度、进程线程和数据库事务上卡住'),
         (1, 'Nova', '编程学伴', '陪伴式自习、费曼追问', 'calm-neutral', 'encouraging', '代码实验室学伴', '适合用同伴提问促进计算机概念输出')`
    );
    const [dhRows] = await db.query("SELECT id FROM digital_humans WHERE user_id = 1 ORDER BY id LIMIT 1");
    await db.query("INSERT INTO tutor_sessions (user_id, digital_human_id, mode, topic) VALUES (1, ?, ?, ?)", [
        dhRows[0].id,
        "socratic",
        "算法复杂度入门"
    ]);
    const [sessionRows] = await db.query("SELECT id FROM tutor_sessions WHERE user_id = 1 ORDER BY id LIMIT 1");
    await db.query(
        `INSERT INTO tutor_messages (session_id, sender, content, strategy, emotion_signal)
         VALUES
         (?, 'ai', '你问这题怎么做之前，我们先判断输入规模 n 变大时，哪一层循环真正决定增长速度。你觉得瓶颈在哪里？', 'socratic_prompt', 'focused'),
         (?, 'user', '我觉得是双重循环，但里面还有一次哈希查询，我不确定怎么估算。', 'student_reasoning', 'hesitation'),
         (?, 'ai', '很好。哈希查询通常近似 O(1)，那双重循环会把总复杂度推到哪个量级？有没有最坏情况例外？', 'misconception_probe', 'supportive')`,
        [sessionRows[0].id, sessionRows[0].id, sessionRows[0].id]
    );

    for (const point of points.slice(0, 6)) {
        await db.query(
            `INSERT INTO multimodal_contents (knowledge_id, modality, title, content, difficulty_band)
             VALUES
             (?, 'explanation', ?, ?, 'intuitive'),
             (?, 'analogy', ?, ?, 'intuitive'),
             (?, 'case', ?, ?, 'application'),
             (?, 'visual', ?, ?, 'visual')`,
            [
                point.id,
                `${point.title} · 直观解释`,
                `${point.summary}\n\n数字人会先用生活类比解释，再逐步进入正式定义。`,
                point.id,
                `${point.title} · 类比`,
                `把 ${point.title} 类比为一次证据更新或结构拆解，帮助建立直觉。`,
                point.id,
                `${point.title} · 案例`,
                `围绕 ${point.title} 生成一个小案例，并附带诊断性干扰项。`,
                point.id,
                `${point.title} · 可视化`,
                `生成概念流程图、变量关系和关键节点。`
            ]
        );
        await db.query(
            `INSERT INTO spaced_reviews (user_id, knowledge_id, next_review_at, interval_days, ease_factor, encoding_depth, review_prompt)
             VALUES (1, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?, ?, ?)`,
            [
                point.id,
                point.mastery < 60 ? 1 : 3,
                point.mastery < 60 ? 1 : 3,
                point.mastery < 60 ? 2.1 : 2.8,
                point.mastery < 60 ? "surface" : "transfer",
                `用一个新场景解释 ${point.title}`
            ]
        );
        await db.query(
            `INSERT INTO ability_radar (user_id, knowledge_id, memory_score, understanding_score, application_score, analysis_score, transfer_score, creation_score)
             VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
            [
                point.id,
                Math.min(100, point.mastery + 10),
                point.mastery,
                Math.max(10, point.mastery - 8),
                Math.max(10, point.mastery - 12),
                Math.max(10, point.mastery - 18),
                Math.max(10, point.mastery - 25)
            ]
        );
    }

    await db.query(
        `INSERT INTO note_cards (user_id, note_id, knowledge_id, title, card_type, content_json, backlinks_json, mastery_signal)
         VALUES
         (1, ?, ?, ?, 'concept', CAST(? AS JSON), CAST(? AS JSON), 68),
         (1, ?, ?, '复杂度边界避坑卡', 'misconception', CAST(? AS JSON), CAST(? AS JSON), 52)`,
        [
            noteRows[0].id,
            points[0].id,
            `${points[0].title} 原子卡`,
            JSON.stringify({
                concept: points[0].title,
                explanation: points[0].summary,
                analogy: "把复杂概念拆成可验证步骤",
                example: "用一道迁移题检验理解"
            }),
            JSON.stringify([points[1].title, points[2].title]),
            noteRows[0].id,
            points[2].id,
            JSON.stringify({
                misconception: "只数循环层数就能得到全部复杂度",
                fix: "还要考虑输入规模、数据结构操作成本、最坏/平均情况和递归关系",
                prompt: "如果哈希退化，复杂度会如何变化？"
            }),
            JSON.stringify([points[0].title, points[3].title])
        ]
    );

    await db.query(
        `INSERT INTO feynman_reviews (user_id, knowledge_id, explanation_text, clarity_score, accuracy_score, missing_points_json, feedback)
         VALUES (1, ?, '时间复杂度就是描述算法运行时间随输入规模增长的趋势。', 72, 68, CAST(? AS JSON), '解释清晰，但需要补充最坏情况、平均情况和常数项忽略的边界。')`,
        [
            points.find(p => p.title === "时间复杂度")?.id || points[2].id,
            JSON.stringify(["最坏情况", "平均情况", "常数项忽略边界"])
        ]
    );

    await db.end();
    console.log(`Database ${dbName} rebuilt.`);
    console.log(`Public sources: ${Array.from(new Set(sourceNotes)).join(", ")}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
