const mysql = require('mysql2/promise');
const config = require('../config');

const BILIBILI_SEARCH_API = 'https://api.bilibili.com/x/web-interface/search/type';

const SEARCH_TOPICS = [
    { keyword: 'Python 入门 课程', subject: '程序设计', difficulty: '入门' },
    { keyword: '数据结构 课程', subject: '数据结构与算法', difficulty: '中等' },
    { keyword: '计算机网络 课程', subject: '计算机网络', difficulty: '中等' },
    { keyword: '数据库 SQL 课程', subject: '数据库', difficulty: '入门' },
    { keyword: '操作系统 课程', subject: '系统软件', difficulty: '进阶' },
    { keyword: '机器学习 课程', subject: '人工智能', difficulty: '进阶' }
];

const VERIFIED_FALLBACK_COURSES = [
    {
        title: 'Python入门公开视频课程',
        provider: '哔哩哔哩',
        subject: '程序设计',
        difficulty: '入门',
        description: 'B站 Python 入门公开视频课程入口，作为搜索接口被限流时的稳定课程链接。',
        source_url: 'https://www.bilibili.com/video/BV1qW4y1a7fU'
    },
    {
        title: '王道计算机考研 操作系统',
        provider: '哔哩哔哩 · 王道计算机教育',
        subject: '系统软件',
        difficulty: '进阶',
        description: '王道计算机教育发布的操作系统公开视频课程入口，适合补充进程、内存、文件系统等基础。',
        source_url: 'https://www.bilibili.com/video/BV1YE411D7nH'
    },
    {
        title: '大数据技术原理与应用',
        provider: '厦门大学数据库实验室',
        subject: '云计算与大数据',
        difficulty: '中等',
        description: '林子雨老师团队公开维护的大数据在线课程入口，包含章节介绍、公开视频和配套学习资料。',
        source_url: 'https://dblab.xmu.edu.cn/post/bigdata-online-course/'
    },
    {
        title: '中国大学MOOC公开课程入口',
        provider: '中国大学MOOC',
        subject: '综合',
        difficulty: '入门',
        description: '中国大学MOOC公开课程平台入口，可继续检索高校课程、公开视频、课件和题库资源。',
        source_url: 'https://www.icourse163.org/'
    },
    {
        title: '爱课程公开视频公开课入口',
        provider: '爱课程',
        subject: '综合',
        difficulty: '入门',
        description: '爱课程公开课程入口，聚合高校公开视频公开课、一流大学系列课程和中国大学MOOC资源。',
        source_url: 'https://www.icourses.cn/oc'
    },
    {
        title: '中国高校计算机教育MOOC联盟',
        provider: '高校计算机教育MOOC联盟',
        subject: '计算机科学',
        difficulty: '中等',
        description: '面向计算机类课程的中文公开课程联盟入口，可作为计算机学习路径的真实课程来源。',
        source_url: 'https://computer.icourses.cn/'
    }
];

function stripHtml(value) {
    return String(value || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

async function tableExists(db, tableName) {
    const [rows] = await db.query('SHOW TABLES LIKE ?', [tableName]);
    return rows.length > 0;
}

async function columnExists(db, tableName, columnName) {
    const [rows] = await db.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
    return rows.length > 0;
}

async function ensureColumn(db, tableName, columnName, ddl) {
    if (!await columnExists(db, tableName, columnName)) {
        await db.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${ddl}`);
    }
}

async function ensureSchema(db) {
    if (!await tableExists(db, 'courses')) {
        await db.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } else {
        await ensureColumn(db, 'courses', 'provider', 'provider VARCHAR(120) NULL AFTER title');
        await ensureColumn(db, 'courses', 'subject', 'subject VARCHAR(80) NULL AFTER provider');
        await ensureColumn(db, 'courses', 'difficulty', 'difficulty VARCHAR(40) NULL AFTER subject');
        await ensureColumn(db, 'courses', 'source_url', 'source_url VARCHAR(500) NULL AFTER description');
        await ensureColumn(db, 'courses', 'progress', 'progress INT DEFAULT 0 AFTER source_url');
    }

    if (!await tableExists(db, 'knowledge_points')) {
        await db.query(`
            CREATE TABLE knowledge_points (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(160) NOT NULL,
                subject VARCHAR(80) NOT NULL,
                summary TEXT,
                mastery INT DEFAULT 50,
                source_name VARCHAR(120),
                source_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }
}

async function fetchBilibiliCourses(topic) {
    const url = new URL(BILIBILI_SEARCH_API);
    url.searchParams.set('search_type', 'video');
    url.searchParams.set('keyword', topic.keyword);
    url.searchParams.set('page', '1');

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'EduSmartRebuild/2.0 course-resource-importer',
            Referer: 'https://www.bilibili.com/'
        }
    });
    if (!response.ok) throw new Error(`Bilibili search failed: ${response.status}`);

    const json = await response.json();
    const rows = Array.isArray(json.data?.result) ? json.data.result : [];
    return rows
        .filter(item => item.bvid && item.title)
        .slice(0, 2)
        .map(item => ({
            title: stripHtml(item.title),
            provider: `哔哩哔哩 · ${stripHtml(item.author || '公开视频')}`,
            subject: topic.subject,
            difficulty: topic.difficulty,
            description: stripHtml(item.description) || `${topic.keyword} 相关中文公开视频课程资源。`,
            source_url: `https://www.bilibili.com/video/${item.bvid}`,
            bvid: item.bvid
        }));
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function collectCourses() {
    const courses = [];
    for (const topic of SEARCH_TOPICS) {
        try {
            const rows = await fetchBilibiliCourses(topic);
            courses.push(...rows);
        } catch (error) {
            console.warn(`skip bilibili keyword "${topic.keyword}": ${error.message}`);
        }
        await wait(700);
    }
    courses.push(...VERIFIED_FALLBACK_COURSES);

    const seen = new Set();
    return courses.filter(course => {
        const key = course.source_url || course.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return course.title && course.source_url;
    });
}

async function upsertKnowledgePoint(db, course) {
    const [[existing]] = await db.query(
        'SELECT id FROM knowledge_points WHERE title = ? OR source_url = ? LIMIT 1',
        [course.title, course.source_url]
    );
    if (existing) return existing.id;

    const [result] = await db.query(
        `INSERT INTO knowledge_points (title, subject, summary, mastery, source_name, source_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [course.title.slice(0, 160), course.subject || '综合', course.description || '', 48, course.provider || '公开课程', course.source_url]
    );
    return result.insertId;
}

async function upsertCourse(db, course) {
    const [[existing]] = await db.query(
        'SELECT id, progress FROM courses WHERE source_url = ? OR title = ? LIMIT 1',
        [course.source_url, course.title]
    );
    if (existing) {
        await db.query(
            `UPDATE courses
             SET title = ?, provider = ?, subject = ?, difficulty = ?, description = ?, source_url = ?
             WHERE id = ?`,
            [course.title, course.provider, course.subject, course.difficulty, course.description, course.source_url, existing.id]
        );
        return { id: existing.id, inserted: false };
    }

    const [result] = await db.query(
        `INSERT INTO courses (title, provider, subject, difficulty, description, source_url, progress)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [course.title, course.provider, course.subject, course.difficulty, course.description, course.source_url, Math.floor(5 + Math.random() * 35)]
    );
    return { id: result.insertId, inserted: true };
}

async function main() {
    const db = await mysql.createConnection(config.database);
    await ensureSchema(db);

    const courses = await collectCourses();
    let inserted = 0;
    let updated = 0;

    for (const course of courses) {
        await upsertKnowledgePoint(db, course);
        const result = await upsertCourse(db, course);
        if (result.inserted) inserted += 1;
        else updated += 1;
    }

    await db.end();
    console.log(`Real course resources imported. inserted=${inserted}, updated=${updated}, total=${courses.length}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
