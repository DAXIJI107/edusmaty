const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');
const config = require('../config');
const AgentRuntime = require('../core/AgentRuntime');
const { writeVaultMarkdown } = require('../core/ObsidianQuestionSync');
const llmGateway = require('../core/llm/LlmGateway');
const agentRuntime = new AgentRuntime(pool);

router.use(authenticateJWT);

function toMetric(icon, label, value, unit, sub, trend, color, glow, grad) {
    return [icon, label, String(value), unit, sub, trend ? String(trend) : '', color, glow, grad];
}

function parseOptions(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value);
    try {
        const parsed = JSON.parse(value || '[]');
        return Array.isArray(parsed) ? parsed : Object.values(parsed || {});
    } catch {
        return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
    }
}

async function tableExists(tableName) {
    const [rows] = await pool.query('SHOW TABLES LIKE ?', [tableName]);
    return rows.length > 0;
}

async function columnExists(tableName, columnName) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
    return rows.length > 0;
}

async function ensureColumn(tableName, columnName, ddl) {
    if (!await columnExists(tableName, columnName)) {
        await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${ddl}`);
    }
}

async function ensureNotesSchema() {
    if (!await tableExists('notes')) {
        await pool.query(`
            CREATE TABLE notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                knowledge_id INT NULL,
                title VARCHAR(220) NOT NULL,
                body MEDIUMTEXT,
                subject VARCHAR(80) NULL,
                source_type VARCHAR(40) DEFAULT 'manual',
                source_id INT NULL,
                tags_json JSON NULL,
                review_status VARCHAR(40) DEFAULT 'new',
                next_review_at DATETIME NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } else {
        await ensureColumn('notes', 'subject', 'subject VARCHAR(80) NULL AFTER body');
        await ensureColumn('notes', 'source_type', "source_type VARCHAR(40) DEFAULT 'manual' AFTER subject");
        await ensureColumn('notes', 'source_id', 'source_id INT NULL AFTER source_type');
        await ensureColumn('notes', 'tags_json', 'tags_json JSON NULL AFTER source_id');
        await ensureColumn('notes', 'review_status', "review_status VARCHAR(40) DEFAULT 'new' AFTER tags_json");
        await ensureColumn('notes', 'next_review_at', 'next_review_at DATETIME NULL AFTER review_status');
        await ensureColumn('notes', 'created_at', 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }

    if (!await tableExists('note_cards')) {
        await pool.query(`
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }
}

function safeJson(value, fallback) {
    if (Array.isArray(value) || (value && typeof value === 'object')) return value;
    try {
        return JSON.parse(value || '');
    } catch {
        return fallback;
    }
}

function inferTags(text, subject) {
    const tags = new Set([subject || '综合']);
    const source = String(text || '');
    ['错题', '课程', '考试', '概念', '公式', '项目', '复习'].forEach(tag => {
        if (source.includes(tag)) tags.add(tag);
    });
    return Array.from(tags).filter(Boolean).slice(0, 6);
}

function maskSecret(value) {
    const text = String(value || '');
    if (!text) return '';
    return `${text.slice(0, 4)}****${text.slice(-4)}`;
}

function localAssistantReply({ prompt, mode, context }) {
    const weak = context.weakPoints?.map(item => item.title).join('、') || '当前薄弱点';
    const modeLabel = {
        tutor: '学习导师',
        mistake: '错题教练',
        note: '笔记整理',
        oral: '口语陪练',
        plan: '学习规划'
    }[mode] || '学习助手';
    return [
        `我是你的${modeLabel}。我会先基于你的课程、笔记和错题记录给出可执行建议。`,
        `你现在可以优先处理：${weak}。`,
        prompt ? `针对你刚才的问题：“${String(prompt).slice(0, 80)}”，建议先拆成「概念定位、关键条件、例题验证、复盘卡片」四步。` : '请输入课程问题、错题截图文字、笔记草稿或复习目标。',
        '下一步：把最卡的一道题或一段课程内容贴进来，我可以继续生成讲解、追问、复习卡和学习计划。'
    ].join('\n\n');
}

async function getAssistantContext(userId) {
    const [weakPoints] = await pool.query(
        'SELECT title, subject, mastery, summary FROM knowledge_points ORDER BY mastery ASC, id LIMIT 5'
    ).catch(() => [[]]);
    const [notes] = await pool.query(
        `SELECT title, subject, body, updated_at
         FROM notes
         WHERE user_id = ?
         ORDER BY updated_at DESC
         LIMIT 5`,
        [userId]
    ).catch(() => [[]]);
    const [courses] = await pool.query(
        'SELECT title, provider, subject, progress FROM courses ORDER BY progress DESC, id LIMIT 5'
    ).catch(() => [[]]);
    const [answers] = await pool.query(
        `SELECT ua.is_correct, q.question, kp.title AS knowledgeTitle, kp.subject
         FROM user_answers ua
         JOIN questions q ON q.id = ua.question_id
         JOIN knowledge_points kp ON kp.id = q.knowledge_id
         WHERE ua.user_id = ?
         ORDER BY ua.answered_at DESC
         LIMIT 5`,
        [userId]
    ).catch(() => [[]]);
    return { weakPoints, notes, courses, answers };
}

function buildAssistantSystemPrompt(mode, context) {
    const weak = context.weakPoints?.map(item => `${item.title}(${item.mastery}%)`).join('、') || '暂无';
    const courses = context.courses?.map(item => `${item.title}/${item.progress || 0}%`).join('、') || '暂无';
    const notes = context.notes?.map(item => `${item.title}`).join('、') || '暂无';
    const modes = {
        tutor: '你是一个面向学生的苏格拉底式 AI 学习助手，目标是讲清楚概念但保留适度追问。',
        mistake: '你是错题教练，要定位错因、给出同类题识别方法和下次避免策略。',
        note: '你是智能笔记整理助手，要输出结构化笔记、主动回忆问题和复习卡片。',
        oral: '你是口语和表达陪练，要给出表达改写、追问和评分维度。',
        plan: '你是学习规划助手，要把目标拆成今日任务、复习节奏和验证方式。'
    };
    return [
        modes[mode] || modes.tutor,
        '请用中文回答，结构清晰，优先给可执行步骤。',
        `学生薄弱点：${weak}`,
        `最近课程：${courses}`,
        `最近笔记：${notes}`,
        '回答最后给出一个“下一步动作”。'
    ].join('\n');
}

async function callSpark(messages) {
    return await llmGateway.chatText({ messages, temperature: 0.65, maxTokens: 1800 });
}

async function createLearningNote(userId, note) {
    await ensureNotesSchema();
    const title = String(note.title || '学习笔记').slice(0, 220);
    const body = String(note.body || '').trim();
    if (!body) return null;
    const subject = note.subject || '综合';
    const tags = note.tags || inferTags(`${title}\n${body}`, subject);
    const [result] = await pool.query(
        `INSERT INTO notes
            (user_id, knowledge_id, title, body, subject, source_type, source_id, tags_json, review_status, next_review_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), 'new', DATE_ADD(NOW(), INTERVAL 1 DAY))`,
        [
            userId,
            note.knowledgeId || null,
            title,
            body,
            subject,
            note.sourceType || 'manual',
            note.sourceId || null,
            JSON.stringify(tags)
        ]
    );
    let obsidianNote = null;
    try {
        obsidianNote = writeVaultMarkdown({
            title,
            body: [
                body,
                '',
                '## EduSmart 回写信息',
                `- 用户：${userId}`,
                `- 来源：${note.sourceType || 'manual'}`,
                `- 学科：[[${subject}]]`,
                note.knowledgeTitle ? `- 知识点：[[${note.knowledgeTitle}]]` : ''
            ].filter(Boolean).join('\n'),
            folder: note.sourceType === 'practice' || note.sourceType === 'exam' ? '错题复盘' : '智能笔记',
            tags: ['edusmart', ...tags],
            links: [subject, note.knowledgeTitle, ...(note.links || [])].filter(Boolean)
        });
    } catch (error) {
        console.warn('Obsidian笔记回写失败:', error.message);
    }
    return { id: result.insertId, obsidianNote };
}

async function getOverview(req, res) {
    const userId = req.user.id || 1;
    const [[user]] = await pool.query(
        `SELECT id, username, nickname, study_hours, knowledge_mastery, study_efficiency, continuous_days
         FROM users WHERE id = ? LIMIT 1`,
        [userId]
    );
    const [[taskStats]] = await pool.query(
        `SELECT COUNT(*) AS total, SUM(status = 'done') AS done, COALESCE(SUM(estimated_minutes), 0) AS minutes
         FROM study_tasks WHERE user_id = ? AND task_date = CURDATE()`,
        [userId]
    );
    const [tasks] = await pool.query(
        `SELECT id, icon, title, subtitle, estimated_minutes, status, color, soft_color
         FROM study_tasks WHERE user_id = ? AND task_date = CURDATE()
         ORDER BY sort_order, id LIMIT 8`,
        [userId]
    );
    const [activities] = await pool.query(
        `SELECT icon, title, time_label, badge, color, soft_color
         FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 6`,
        [userId]
    );
    const [courses] = await pool.query(
        `SELECT id, title, provider, subject, difficulty, progress, source_url
         FROM courses ORDER BY progress DESC, id LIMIT 8`
    );
    const [achievements] = await pool.query(
        `SELECT title, badge, xp, earned_at FROM achievements WHERE user_id = ? ORDER BY earned_at DESC LIMIT 6`,
        [userId]
    );
    const [[question]] = await pool.query(
        `SELECT q.id, q.question, q.correct_answer, q.options_json, q.difficulty, q.source_name,
                kp.title AS knowledge_title, kp.mastery
         FROM questions q
         JOIN knowledge_points kp ON kp.id = q.knowledge_id
         ORDER BY RAND() LIMIT 1`
    );
    const [weakPoints] = await pool.query(
        `SELECT title, subject, mastery, summary, source_name, source_url
         FROM knowledge_points ORDER BY mastery ASC, id LIMIT 5`
    );
    const [recommendations] = await pool.query(
        `SELECT title, reason, action_label, target_view, priority
         FROM recommendations WHERE user_id = ? ORDER BY priority DESC, id DESC LIMIT 5`,
        [userId]
    );

    const totalTasks = Number(taskStats.total || 0);
    const doneTasks = Number(taskStats.done || 0);
    const minutes = Number(taskStats.minutes || 0);
    const mastery = Number(user?.knowledge_mastery || 0);
    const efficiency = Number(user?.study_efficiency || 0);
    const hours = Number(user?.study_hours || 0);
    const streak = Number(user?.continuous_days || 0);

    res.json({
        success: true,
        user: {
            id: user?.id || userId,
            username: user?.nickname || user?.username || req.user.username || '同学'
        },
        metrics: [
            toMetric('clock', '学习总时长', hours.toFixed(1), '小时', '来自学习行为表', '12%', '#5f58ee', 'rgba(95,88,238,.18)', 'linear-gradient(135deg,#5f58ee,#7c4dff)'),
            toMetric('brain', '知识掌握度', mastery, '%', '由答题与任务闭环计算', '8%', '#18b87a', 'rgba(24,184,122,.16)', 'linear-gradient(135deg,#18b87a,#1ecda4)'),
            toMetric('bolt', '学习效率', efficiency, '%', '完成率与正确率综合', '5%', '#ff9500', 'rgba(255,149,0,.16)', 'linear-gradient(135deg,#ff9500,#ffb020)'),
            toMetric('flame', '连续学习', streak, '天', '最长连续 28 天', '', '#7c4dff', 'rgba(124,77,255,.16)', 'linear-gradient(135deg,#7c4dff,#8f5bff)')
        ],
        tasks: tasks.map((task) => ({
            id: task.id,
            icon: task.icon || 'book',
            title: task.title,
            meta: task.subtitle,
            time: `预计 ${task.estimated_minutes} 分钟`,
            done: task.status === 'done',
            color: task.color || '#2f6bff',
            soft: task.soft_color || 'rgba(47,107,255,.10)'
        })),
        taskSummary: {
            total: totalTasks,
            done: doneTasks,
            minutes,
            percent: totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0
        },
        activities: activities.map((item) => ({
            icon: item.icon || 'check',
            text: item.title,
            time: item.time_label,
            color: item.color || '#18b87a',
            soft: item.soft_color || 'rgba(24,184,122,.12)',
            badge: item.badge || '动态'
        })),
        courses,
        achievements,
        weakPoints,
        recommendations,
        dailyQuestion: question ? {
            id: question.id,
            question: question.question,
            correctAnswer: question.correct_answer,
            options: parseOptions(question.options_json),
            difficulty: question.difficulty,
            sourceName: question.source_name,
            knowledgeTitle: question.knowledge_title,
            mastery: question.mastery
        } : null
    });
}

router.get('/overview', (req, res, next) => getOverview(req, res).catch(next));

function normalizeMastery(value, fallback = 50) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback;
}

function buildAgentConsole({ profile, weakPoints, tasks, notes, messages, cards, reviews, radar, teacher, services }) {
    const primaryWeak = weakPoints[0] || { title: '数据结构基础', subject: '计算机基础', mastery: 48, summary: '需要通过讲解、练习和复盘卡片重新校准。' };
    const doneTasks = tasks.filter(task => task.status === 'done').length;
    const pendingTasks = tasks.filter(task => task.status !== 'done');
    const latestAi = [...messages].reverse().find(item => item.sender === 'ai');
    const avgRadar = radar.length
        ? Math.round(radar.reduce((sum, item) => sum + normalizeMastery(item.understanding_score || item.application_score, 50), 0) / radar.length)
        : normalizeMastery(profile?.ability_theta ? 50 + Number(profile.ability_theta) * 35 : primaryWeak.mastery, 50);
    const masteryBefore = normalizeMastery(primaryWeak.mastery);
    const masteryAfter = normalizeMastery(masteryBefore + Math.min(14, cards.length * 2 + doneTasks * 3 + messages.length));
    const needTeacher = normalizeMastery(primaryWeak.mastery) < 55 || teacher.interventionQueue.length > 0;

    const serviceMap = Object.fromEntries(services.map(item => [item.key, item.status]));
    const executionRecords = [
        ...tasks.slice(0, 4).map(task => ({
            type: task.status === 'done' ? '完成任务' : '学习任务',
            title: task.title,
            detail: task.subtitle || `预计 ${task.estimated_minutes || 20} 分钟`,
            status: task.status === 'done' ? 'done' : 'pending',
            agent: '学情诊断智能体'
        })),
        ...cards.slice(0, 2).map(card => ({
            type: '生成笔记',
            title: card.title,
            detail: `${card.card_type || 'concept'} · 掌握信号 ${card.mastery_signal || 50}%`,
            status: 'done',
            agent: '学生导师智能体'
        })),
        ...reviews.slice(0, 2).map(review => ({
            type: '安排复习',
            title: review.knowledge_title,
            detail: review.review_prompt || `${review.interval_days || 1} 天后复习`,
            status: 'scheduled',
            agent: '学情诊断智能体'
        }))
    ].slice(0, 8);

    return {
        todayJudgment: {
            focus: primaryWeak.title,
            subject: primaryWeak.subject,
            mastery: masteryBefore,
            reason: primaryWeak.summary || `${primaryWeak.subject} 掌握度偏低，建议先补概念边界，再做同类题。`,
            nextTask: pendingTasks[0]?.title || `AI 巩固：${primaryWeak.title}`,
            teacherRequired: needTeacher,
            confidence: Math.max(68, Math.min(96, 100 - Math.floor(masteryBefore / 3)))
        },
        taskPlan: [
            {
                title: `错题讲解：${primaryWeak.title}`,
                detail: '先定位错因，再用苏格拉底追问确认是否真正理解。',
                minutes: 12,
                status: messages.length ? 'running' : 'ready',
                agent: '学生导师智能体',
                action: 'ask'
            },
            {
                title: `补救练习：${primaryWeak.subject}`,
                detail: '从同知识点题库抽题，完成后自动回写掌握度。',
                minutes: 20,
                status: pendingTasks.length ? 'scheduled' : 'ready',
                agent: '教师干预智能体',
                action: 'practice'
            },
            {
                title: `生成复习卡：${primaryWeak.title}`,
                detail: '把讲解沉淀为主动回忆卡，进入明日复习队列。',
                minutes: 5,
                status: cards.length ? 'done' : 'ready',
                agent: '学生导师智能体',
                action: 'note'
            }
        ],
        profileDelta: {
            before: masteryBefore,
            after: masteryAfter,
            label: `${primaryWeak.title} 掌握度`,
            changedBy: [
                doneTasks ? `完成 ${doneTasks} 个任务` : '等待完成今日任务',
                cards.length ? `新增 ${cards.length} 张智能卡片` : '尚未生成复习卡',
                messages.length ? `导师追问 ${messages.length} 轮` : '等待对话校准'
            ],
            abilityScore: avgRadar
        },
        executionRecords,
        conversation: {
            tutor: '小星',
            topic: primaryWeak.title,
            lastReply: latestAi?.content || `我建议先从「${primaryWeak.title}」最容易混淆的一步开始：你能说出它和相邻概念的区别吗？`,
            messages: messages.slice(-6)
        },
        agents: [
            {
                name: '学生导师智能体',
                status: serviceMap.llm === 'connected' ? '本地模型已接入' : '本地兜底',
                abilities: ['错题讲解', '苏格拉底追问', '生成笔记', '语音陪练'],
                next: `追问 ${primaryWeak.title} 的关键条件`
            },
            {
                name: '学情诊断智能体',
                status: '持续分析',
                abilities: ['答题分析', '课程进度', '笔记证据', '考试结果'],
                next: `校准 ${primaryWeak.subject} 薄弱点`
            },
            {
                name: '教师干预智能体',
                status: needTeacher ? '需要介入' : '观察中',
                abilities: ['补救练习', '分层任务', '班级预警'],
                next: needTeacher ? '建议教师发布分层补救任务' : '暂不需要强干预'
            }
        ],
        teacherView: {
            needTeacher,
            riskStudents: teacher.interventionQueue.slice(0, 4),
            recommendedActions: [
                { key: 'assign-remediation', title: `发布 ${primaryWeak.subject} 补救练习`, target: primaryWeak.subject },
                { key: 'push-test', title: `发布 ${primaryWeak.subject} 分层测试`, target: primaryWeak.subject },
                { key: 'create-note-task', title: `要求整理 ${primaryWeak.title} 复盘笔记`, target: primaryWeak.subject }
            ]
        },
        integrations: [
            { key: 'llm', name: '本地大模型', status: serviceMap.llm || 'missing', role: '错题讲解、学习计划、教师建议' },
            { key: 'iat', name: '语音听写 IAT', status: serviceMap.iat || 'todo', role: '语音提问、口述复盘' },
            { key: 'tts', name: '在线语音合成 TTS', status: serviceMap.tts || 'todo', role: '导师朗读、复习提醒' },
            { key: 'ocr', name: 'OCR / 试题识别', status: serviceMap.ocr || 'todo', role: '拍照识题、试卷订正' }
        ]
    };
}

router.get('/intelligence', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const [[profile]] = await pool.query(
            'SELECT ability_theta, diagnosis_json, misconception_json, goal_text, goal_graph_json, updated_at FROM cognitive_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [userId]
        );
        const [[preference]] = await pool.query(
            'SELECT style, modality_weights, evidence_json FROM learning_preferences WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [userId]
        );
        const [humans] = await pool.query(
            'SELECT id, name, role, persona, voice, emotion_state, avatar_style, memory_summary FROM digital_humans WHERE user_id = ? ORDER BY id',
            [userId]
        );
        const [[session]] = await pool.query(
            'SELECT id, mode, topic, status FROM tutor_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [userId]
        );
        const [messages] = session
            ? await pool.query('SELECT sender, content, strategy, emotion_signal, created_at FROM tutor_messages WHERE session_id = ? ORDER BY id LIMIT 8', [session.id])
            : [[]];
        const [cards] = await pool.query(
            `SELECT nc.id, nc.title, nc.card_type, nc.content_json, nc.backlinks_json, nc.mastery_signal, kp.title AS knowledge_title
             FROM note_cards nc LEFT JOIN knowledge_points kp ON kp.id = nc.knowledge_id
             WHERE nc.user_id = ? ORDER BY nc.id DESC LIMIT 8`,
            [userId]
        );
        const [reviews] = await pool.query(
            `SELECT sr.next_review_at, sr.interval_days, sr.encoding_depth, sr.review_prompt, kp.title AS knowledge_title
             FROM spaced_reviews sr JOIN knowledge_points kp ON kp.id = sr.knowledge_id
             WHERE sr.user_id = ? ORDER BY sr.next_review_at LIMIT 6`,
            [userId]
        );
        const [radar] = await pool.query(
            `SELECT kp.title AS knowledge_title, ar.memory_score, ar.understanding_score, ar.application_score,
                    ar.analysis_score, ar.transfer_score, ar.creation_score
             FROM ability_radar ar JOIN knowledge_points kp ON kp.id = ar.knowledge_id
             WHERE ar.user_id = ? ORDER BY ar.updated_at DESC LIMIT 6`,
            [userId]
        );
        const [contents] = await pool.query(
            `SELECT mc.modality, mc.title, mc.content, mc.difficulty_band, kp.title AS knowledge_title
             FROM multimodal_contents mc JOIN knowledge_points kp ON kp.id = mc.knowledge_id
             ORDER BY mc.id DESC LIMIT 10`
        );
        const [edges] = await pool.query(
            `SELECT s.title AS source, t.title AS target, ke.relation, ke.weight
             FROM knowledge_edges ke
             JOIN knowledge_points s ON s.id = ke.source_id
             JOIN knowledge_points t ON t.id = ke.target_id
             ORDER BY ke.weight DESC LIMIT 12`
        );
        const [feynman] = await pool.query(
            `SELECT fr.explanation_text, fr.clarity_score, fr.accuracy_score, fr.missing_points_json, fr.feedback, kp.title AS knowledge_title
             FROM feynman_reviews fr LEFT JOIN knowledge_points kp ON kp.id = fr.knowledge_id
             WHERE fr.user_id = ? ORDER BY fr.id DESC LIMIT 4`,
            [userId]
        );
        const [weakPoints] = await pool.query(
            `SELECT id, title, subject, mastery, summary
             FROM knowledge_points
             ORDER BY mastery ASC, id
             LIMIT 6`
        );
        const [tasks] = await pool.query(
            `SELECT id, title, subtitle, estimated_minutes, status, source, sort_order
             FROM study_tasks
             WHERE user_id = ? AND task_date = CURDATE()
             ORDER BY status = 'done', sort_order, id
             LIMIT 8`,
            [userId]
        );
        const [teacherWeak] = await pool.query(
            `SELECT title, subject, mastery, summary
             FROM knowledge_points
             ORDER BY mastery ASC, id
             LIMIT 5`
        );
        const teacher = {
            interventionQueue: teacherWeak.map((point, index) => ({
                student: index % 2 ? '张三同学' : '计算机学习小组',
                issue: `${point.subject} · ${point.title}`,
                mastery: point.mastery,
                action: point.mastery < 50 ? '安排补救练习' : '推送讲解与测试'
            }))
        };
        const services = [
            { key: 'llm', status: 'connected' },
            { key: 'iat', status: config.xfyun.appId && config.xfyun.apiKey && config.xfyun.apiSecret ? 'ready' : 'todo' },
            { key: 'ocr', status: config.ocr.appId && config.ocr.apiKey && config.ocr.apiSecret ? 'ready' : 'todo' },
            { key: 'tts', status: config.tts.appId && config.tts.apiKey && config.tts.apiSecret ? 'ready' : 'todo' }
        ];
        const agentConsole = buildAgentConsole({ profile, weakPoints, tasks, notes: [], messages, cards, reviews, radar, teacher, services });

        res.json({
            success: true,
            profile,
            preference,
            humans,
            session,
            messages,
            cards,
            reviews,
            radar,
            contents,
            edges,
            feynman,
            weakPoints,
            tasks,
            agentConsole
        });
    } catch (error) {
        next(error);
    }
});

router.post('/intelligence/run-agent-flow', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { topic = '', message = '' } = req.body || {};
        const [[point]] = await pool.query(
            `SELECT id, title, subject, mastery, summary
             FROM knowledge_points
             WHERE title LIKE ? OR subject LIKE ? OR summary LIKE ?
             ORDER BY mastery ASC, id
             LIMIT 1`,
            [`%${topic}%`, `%${topic}%`, `%${topic}%`]
        );
        const focus = point || (await pool.query('SELECT id, title, subject, mastery, summary FROM knowledge_points ORDER BY mastery ASC LIMIT 1'))[0][0];
        const answers = [
            { correct: focus?.mastery > 60 ? 1 : 0 },
            { correct: 1 },
            { correct: focus?.mastery > 45 ? 1 : 0 },
            { correct: 0 }
        ];
        const goal = `补齐 ${focus?.title || topic || '当前薄弱点'}`;
        const diagnosis = {
            irt: { theta: Number(((answers.filter(item => item.correct).length - 2) / 4).toFixed(3)), confidence: 0.78 },
            weakConcepts: [focus?.title || topic || '当前薄弱点'],
            readiness: '建议先修复前置概念，再进入变式练习'
        };
        await pool.query(
            `INSERT INTO cognitive_profiles (user_id, ability_theta, diagnosis_json, misconception_json, goal_text, goal_graph_json)
             VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, CAST(? AS JSON))`,
            [
                userId,
                diagnosis.irt.theta,
                JSON.stringify(diagnosis),
                JSON.stringify([{ concept: focus?.title || topic || '当前薄弱点', severity: 0.74 }]),
                goal,
                JSON.stringify({ root: goal, prerequisites: [focus?.title || topic || '当前薄弱点'], next: ['导师追问', '补救练习', '智能笔记', '间隔复习'] })
            ]
        );
        await pool.query('DELETE FROM study_tasks WHERE user_id = ? AND task_date = CURDATE() AND source = "ai"', [userId]);
        const planItems = [
            [`AI 讲解：${focus?.title || topic || '薄弱点'}`, `${focus?.subject || '综合'} · 先听讲解再回答追问`, 'robot', 12],
            [`补救练习：${focus?.title || topic || '薄弱点'}`, '完成后自动回写掌握度', 'brain', 20],
            [`复盘卡片：${focus?.title || topic || '薄弱点'}`, '生成主动回忆问题并进入明日复习', 'pen', 8]
        ];
        for (let i = 0; i < planItems.length; i += 1) {
            const item = planItems[i];
            await pool.query(
                `INSERT INTO study_tasks (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, color, soft_color, source)
                 VALUES (?, ?, ?, ?, ?, ?, 'pending', CURDATE(), ?, ?, ?, 'ai')`,
                [userId, focus?.id || null, item[0], item[1], item[2], item[3], 20 + i, i === 1 ? '#18b87a' : '#2f6bff', i === 1 ? 'rgba(24,184,122,.12)' : 'rgba(47,107,255,.12)']
            );
        }
        const content = {
            concept: focus?.title || topic || '当前薄弱点',
            explanation: message || focus?.summary || '由智能体根据诊断结果生成讲解卡片。',
            activeRecall: `不用看资料，解释「${focus?.title || topic || '这个知识点'}」最容易错的一步。`,
            nextPractice: '完成补救练习后再次校准画像。'
        };
        await pool.query(
            `INSERT INTO note_cards (user_id, knowledge_id, title, card_type, content_json, backlinks_json, mastery_signal)
             VALUES (?, ?, ?, 'agent_flow', CAST(? AS JSON), CAST(? AS JSON), 46)`,
            [userId, focus?.id || null, `${focus?.title || topic || '薄弱点'} · 智能体复盘卡`, JSON.stringify(content), JSON.stringify(['智能体任务流', '主动回忆'])]
        );
        let [[session]] = await pool.query('SELECT id FROM tutor_sessions WHERE user_id = ? AND status = "active" ORDER BY id DESC LIMIT 1', [userId]);
        if (!session) {
            const [created] = await pool.query('INSERT INTO tutor_sessions (user_id, mode, topic) VALUES (?, "agent_flow", ?)', [userId, focus?.title || topic || '智能体任务流']);
            session = { id: created.insertId };
        }
        const tutorPrompt = message || `请围绕 ${focus?.title || topic || '当前薄弱点'} 追问我一个关键问题`;
        const tutorReply = buildSocraticReply(tutorPrompt);
        await pool.query('INSERT INTO tutor_messages (session_id, sender, content, strategy, emotion_signal) VALUES (?, "user", ?, "agent_flow", "focused")', [session.id, tutorPrompt]);
        await pool.query('INSERT INTO tutor_messages (session_id, sender, content, strategy, emotion_signal) VALUES (?, "ai", ?, "socratic_probe", "supportive")', [session.id, tutorReply]);
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'robot', ?, '刚刚', '智能体任务流', '#2f6bff', 'rgba(47,107,255,.12)')`,
            [userId, `智能体已围绕「${focus?.title || topic || '薄弱点'}」完成诊断、任务、笔记和追问`]
        );
        res.json({ success: true, focus: focus?.title || topic || '当前薄弱点', diagnosis, generated: planItems.length, reply: tutorReply });
    } catch (error) {
        next(error);
    }
});

router.get('/ai-assistant/status', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const context = await getAssistantContext(userId);
        const services = [
            {
                key: 'llm',
                name: '本地大模型',
                status: 'connected',
                value: config.llm.provider === 'spark' ? maskSecret(config.search.apiPassword || config.spark.apiKeySecret) : config.llm.local.model,
                use: '学习问答、错题讲解、笔记生成、规划拆解'
            },
            {
                key: 'iat',
                name: '语音听写 IAT',
                status: config.xfyun.appId && config.xfyun.apiKey && config.xfyun.apiSecret ? 'ready' : 'todo',
                use: '学生语音提问、课堂录音转文字、口语练习'
            },
            {
                key: 'ocr',
                name: '文字识别 OCR',
                status: config.ocr.appId && config.ocr.apiKey && config.ocr.apiSecret ? 'ready' : 'todo',
                use: '拍照识题、试卷录入、板书识别'
            },
            {
                key: 'tts',
                name: '语音合成 TTS',
                status: config.tts.appId && config.tts.apiKey && config.tts.apiSecret ? 'ready' : 'todo',
                use: 'AI 导师朗读、错题讲解播报、无障碍阅读'
            },
            {
                key: 'image',
                name: '图像理解/多模态',
                status: 'todo',
                use: '图片题目理解、实验图分析、知识图谱可视化'
            }
        ];
        res.json({
            success: true,
            llm: {
                provider: config.llm.provider,
                endpoint: config.llm.provider === 'spark' ? config.spark.httpApi : config.llm.local.baseUrl,
                model: config.llm.provider === 'spark' ? (config.spark.model || 'lite') : config.llm.local.model,
                configured: services[0].status === 'connected'
            },
            context,
            services,
            productNeeds: [
                '学生不知道问什么：提供一键错题拆解、课程总结、笔记卡片。',
                'AI 回答和学习记录割裂：把对话结果沉淀到笔记、复习队列和学习计划。',
                '输入成本高：接入语音听写、OCR 和文件识别，减少手打。',
                '只回答不闭环：每次回答必须给下一步动作，可转课程、练习、笔记、复习。'
            ],
            requiredXfyunApis: [
                'Spark Lite/Pro/Max HTTP APIPassword：已用于文字对话。',
                '语音听写 IAT：需要 APPID、APIKey、APISecret。',
                '在线语音合成 TTS：需要 APPID、APIKey、APISecret。',
                '通用文字识别 OCR 或拍照速算/试题识别：需要对应 OCR 服务授权。',
                '如要做数字人讲解：需要超拟人交互或虚拟人服务的 APPID、APIKey、APISecret。'
            ]
        });
    } catch (error) {
        next(error);
    }
});

router.post('/ai-assistant/chat', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { prompt = '', mode = 'tutor', saveAsNote = false } = req.body || {};
        if (!String(prompt).trim()) {
            return res.status(400).json({ success: false, message: '请输入要问 AI 助手的问题' });
        }
        const context = await getAssistantContext(userId);
        const messages = [
            { role: 'system', content: buildAssistantSystemPrompt(mode, context) },
            { role: 'user', content: String(prompt).slice(0, 4000) }
        ];
        let answer;
        let provider = config.llm.provider || 'local';
        try {
            answer = await callSpark(messages);
            if (!answer) throw new Error('本地模型返回为空');
        } catch (error) {
            provider = 'local-fallback';
            answer = localAssistantReply({ prompt, mode, context });
        }

        let noteId = null;
        if (saveAsNote || mode === 'note' || mode === 'mistake') {
            const createdNote = await createLearningNote(userId, {
                title: `AI助手：${String(prompt).slice(0, 24)}`,
                body: `问题：${prompt}\n\n回答：${answer}`,
                subject: context.weakPoints?.[0]?.subject || 'AI助手',
                sourceType: 'ai_assistant',
                tags: ['AI助手', mode === 'mistake' ? '错题' : mode === 'note' ? '笔记' : '问答']
            });
            noteId = createdNote.id;
        }

        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'robot', ?, '刚刚', 'AI助手', '#2f6bff', 'rgba(47,107,255,.12)')`,
            [userId, `AI助手完成一次${mode === 'mistake' ? '错题拆解' : mode === 'note' ? '笔记整理' : '学习问答'}`]
        ).catch(() => {});

        res.json({
            success: true,
            provider,
            answer,
            noteId,
            suggestions: [
                '保存为笔记并生成复习卡',
                '基于回答生成 3 道自测题',
                '切换成错题教练继续追问',
                '把回答朗读出来'
            ],
            context: {
                weakPoints: context.weakPoints,
                courses: context.courses,
                notes: context.notes
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/tasks/:id/toggle', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const taskId = Number(req.params.id);
        const [[task]] = await pool.query('SELECT status, estimated_minutes FROM study_tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
        if (!task) return res.status(404).json({ success: false, message: '任务不存在' });
        const nextStatus = task.status === 'done' ? 'pending' : 'done';
        await pool.query('UPDATE study_tasks SET status = ?, completed_at = IF(? = "done", NOW(), NULL) WHERE id = ? AND user_id = ?', [nextStatus, nextStatus, taskId, userId]);
        if (nextStatus === 'done') {
            await pool.query('UPDATE users SET study_hours = study_hours + ?, study_efficiency = LEAST(100, study_efficiency + 1), continuous_days = GREATEST(continuous_days, 1) WHERE id = ?', [Number(task.estimated_minutes || 0) / 60, userId]);
            await pool.query(
                `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
                 VALUES (?, 'check', '完成了学习任务，系统已更新学习画像', '刚刚', '闭环更新', '#18b87a', 'rgba(24,184,122,.12)')`,
                [userId]
            );
        }
        res.json({ success: true, status: nextStatus });
    } catch (error) {
        next(error);
    }
});

router.post('/practice/answer', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { questionId, answer } = req.body;
        const [[question]] = await pool.query(
            `SELECT q.id, q.correct_answer, q.knowledge_id, kp.mastery, kp.title
             FROM questions q JOIN knowledge_points kp ON kp.id = q.knowledge_id
             WHERE q.id = ? LIMIT 1`,
            [questionId]
        );
        if (!question) return res.status(404).json({ success: false, message: '题目不存在' });
        const isCorrect = String(answer) === String(question.correct_answer);
        const delta = isCorrect ? 6 : -5;
        const nextMastery = Math.max(0, Math.min(100, Number(question.mastery || 0) + delta));

        await pool.query(
            'INSERT INTO user_answers (user_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?)',
            [userId, questionId, answer, isCorrect ? 1 : 0]
        );
        await pool.query('UPDATE knowledge_points SET mastery = ? WHERE id = ?', [nextMastery, question.knowledge_id]);
        await pool.query(
            `UPDATE users SET correct_answers = correct_answers + ?, knowledge_mastery =
             (SELECT ROUND(AVG(mastery)) FROM knowledge_points), study_efficiency = LEAST(100, GREATEST(1, study_efficiency + ?))
             WHERE id = ?`,
            [isCorrect ? 1 : 0, isCorrect ? 2 : -3, userId]
        );

        if (!isCorrect) {
            await pool.query(
                `INSERT INTO recommendations (user_id, title, reason, action_label, target_view, priority)
                 VALUES (?, ?, ?, '生成巩固任务', 'path', 90)`,
                [userId, `巩固 ${question.title}`, `刚才答错了相关题目，掌握度调整为 ${nextMastery}%`]
            );
        }

        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, ?, ?, '刚刚', ?, ?, ?)`,
            [
                userId,
                isCorrect ? 'check' : 'book',
                isCorrect ? `答对了「${question.title}」相关题目` : `答错了「${question.title}」，已加入复习闭环`,
                isCorrect ? '掌握提升' : '错题闭环',
                isCorrect ? '#18b87a' : '#ff9500',
                isCorrect ? 'rgba(24,184,122,.12)' : 'rgba(255,149,0,.12)'
            ]
        );

        res.json({ success: true, isCorrect, correctAnswer: question.correct_answer, nextMastery });
    } catch (error) {
        next(error);
    }
});

router.get('/practice/set', async (req, res, next) => {
    try {
        const mode = String(req.query.mode || 'practice');
        const subject = String(req.query.subject || 'all');
        const limitMap = { practice: 6, test: 10, exam: 20 };
        const limit = Math.max(3, Math.min(30, Number(req.query.limit || limitMap[mode] || 8)));
        const difficultyOrder = mode === 'practice'
            ? 'kp.mastery ASC, q.id'
            : mode === 'exam'
                ? 'RAND()'
                : 'q.difficulty, kp.mastery ASC, q.id';
        const params = [];
        let subjectWhere = '';
        if (mode !== 'exam' && subject !== 'all') {
            subjectWhere = 'WHERE kp.subject = ?';
            params.push(subject);
        }
        const [rows] = await pool.query(
            `SELECT q.id, q.question, q.options_json, q.difficulty, q.source_name,
                    kp.title AS knowledge_title, kp.subject, kp.mastery
             FROM questions q
             JOIN knowledge_points kp ON kp.id = q.knowledge_id
             ${subjectWhere}
             ORDER BY ${difficultyOrder}
             LIMIT ${limit}`,
            params
        );
        res.json({
            success: true,
            mode,
            subject,
            duration: mode === 'exam' ? 45 : mode === 'test' ? 20 : 12,
            questions: rows.map(row => ({
                id: row.id,
                question: row.question,
                options: parseOptions(row.options_json),
                difficulty: row.difficulty,
                sourceName: row.source_name,
                knowledgeTitle: row.knowledge_title,
                subject: row.subject,
                mastery: row.mastery
            }))
        });
    } catch (error) {
        next(error);
    }
});

router.get('/practice/subjects', async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT kp.subject, COUNT(DISTINCT kp.id) AS knowledgeCount, COUNT(q.id) AS questionCount,
                    ROUND(AVG(kp.mastery)) AS avgMastery
             FROM knowledge_points kp
             LEFT JOIN questions q ON q.knowledge_id = kp.id
             GROUP BY kp.subject
             ORDER BY knowledgeCount DESC, kp.subject`
        );
        res.json({ success: true, subjects: rows });
    } catch (error) {
        next(error);
    }
});

router.get('/account', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const [[user]] = await pool.query(
            `SELECT id, username, nickname, role, interests, study_hours, completed_courses,
                    knowledge_mastery, correct_answers, study_efficiency, continuous_days, created_at
             FROM users WHERE id = ? LIMIT 1`,
            [userId]
        );
        const [[answerStats]] = await pool.query(
            `SELECT COUNT(*) AS totalAnswers, SUM(is_correct = 1) AS correctAnswers,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers WHERE user_id = ?`,
            [userId]
        );
        const [subjectScores] = await pool.query(
            `SELECT kp.subject, ROUND(AVG(kp.mastery)) AS mastery, COUNT(DISTINCT kp.id) AS knowledgeCount
             FROM knowledge_points kp
             GROUP BY kp.subject
             ORDER BY mastery ASC, knowledgeCount DESC`
        );
        const [recentAnswers] = await pool.query(
            `SELECT ua.is_correct, ua.answered_at, q.question, kp.title AS knowledgeTitle, kp.subject
             FROM user_answers ua
             JOIN questions q ON q.id = ua.question_id
             JOIN knowledge_points kp ON kp.id = q.knowledge_id
             WHERE ua.user_id = ?
             ORDER BY ua.answered_at DESC
             LIMIT 8`,
            [userId]
        );
        const [activities] = await pool.query(
            `SELECT icon, title, time_label, badge, color, soft_color
             FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 8`,
            [userId]
        );
        res.json({
            success: true,
            user,
            answerStats: {
                totalAnswers: Number(answerStats.totalAnswers || 0),
                correctAnswers: Number(answerStats.correctAnswers || 0),
                accuracy: Number(answerStats.accuracy || 0)
            },
            subjectScores,
            recentAnswers,
            activities
        });
    } catch (error) {
        next(error);
    }
});

router.get('/profile/insight', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const [[user]] = await pool.query(
            `SELECT id, username, nickname, role, interests, study_hours, completed_courses,
                    knowledge_mastery, correct_answers, study_efficiency, continuous_days, created_at
             FROM users WHERE id = ? LIMIT 1`,
            [userId]
        );
        const [[answerStats]] = await pool.query(
            `SELECT COUNT(*) AS totalAnswers, SUM(is_correct = 1) AS correctAnswers,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers WHERE user_id = ?`,
            [userId]
        );
        const [subjectScores] = await pool.query(
            `SELECT kp.subject, ROUND(AVG(kp.mastery)) AS mastery, COUNT(DISTINCT kp.id) AS knowledgeCount,
                    COUNT(q.id) AS questionCount,
                    COALESCE(SUM(ua.user_id = ? AND ua.is_correct = 0), 0) AS wrongCount
             FROM knowledge_points kp
             LEFT JOIN questions q ON q.knowledge_id = kp.id
             LEFT JOIN user_answers ua ON ua.question_id = q.id
             GROUP BY kp.subject
             ORDER BY mastery ASC, wrongCount DESC, knowledgeCount DESC`,
            [userId]
        );
        const [weakPoints] = await pool.query(
            `SELECT kp.id, kp.title, kp.subject, kp.mastery, kp.summary,
                    COUNT(q.id) AS questionCount,
                    COALESCE(SUM(ua.user_id = ? AND ua.is_correct = 0), 0) AS wrongCount
             FROM knowledge_points kp
             LEFT JOIN questions q ON q.knowledge_id = kp.id
             LEFT JOIN user_answers ua ON ua.question_id = q.id
             GROUP BY kp.id, kp.title, kp.subject, kp.mastery, kp.summary
             ORDER BY kp.mastery ASC, wrongCount DESC, kp.id
             LIMIT 8`,
            [userId]
        );
        const [strongPoints] = await pool.query(
            `SELECT title, subject, mastery
             FROM knowledge_points
             ORDER BY mastery DESC, id
             LIMIT 5`
        );
        const [recentAnswers] = await pool.query(
            `SELECT ua.is_correct, ua.answered_at, q.question, kp.title AS knowledgeTitle, kp.subject
             FROM user_answers ua
             JOIN questions q ON q.id = ua.question_id
             JOIN knowledge_points kp ON kp.id = q.knowledge_id
             WHERE ua.user_id = ?
             ORDER BY ua.answered_at DESC
             LIMIT 10`,
            [userId]
        );
        const [tasks] = await pool.query(
            `SELECT id, title, subtitle, estimated_minutes, status, source
             FROM study_tasks
             WHERE user_id = ? AND task_date = CURDATE()
             ORDER BY status = 'done', sort_order, id
             LIMIT 8`,
            [userId]
        );
        const [notes] = await pool.query(
            `SELECT subject, COUNT(*) AS total
             FROM notes
             WHERE user_id = ?
             GROUP BY subject
             ORDER BY total DESC
             LIMIT 6`,
            [userId]
        ).catch(() => [[]]);
        const [courses] = await pool.query(
            `SELECT title, provider, subject, progress
             FROM courses
             ORDER BY progress ASC, id
             LIMIT 6`
        );

        const accuracy = Number(answerStats.accuracy || 0);
        const mastery = Number(user?.knowledge_mastery || 0);
        const efficiency = Number(user?.study_efficiency || 0);
        const studyHours = Number(user?.study_hours || 0);
        const completedToday = tasks.filter(task => task.status === 'done').length;
        const persona = accuracy >= 80 && efficiency >= 75
            ? '高效推进型'
            : weakPoints.some(point => Number(point.mastery || 0) < 45)
                ? '基础巩固型'
                : notes.length >= 3
                    ? '复盘沉淀型'
                    : '稳步成长型';
        const dimensions = [
            { key: 'concept', label: '概念理解', value: Math.max(20, Math.min(96, mastery)) },
            { key: 'practice', label: '练习稳定', value: Math.max(20, Math.min(96, accuracy || 50)) },
            { key: 'review', label: '复习沉淀', value: Math.max(18, Math.min(95, notes.reduce((sum, item) => sum + Number(item.total || 0), 0) * 12)) },
            { key: 'execution', label: '执行效率', value: Math.max(20, Math.min(96, efficiency || 50)) },
            { key: 'persistence', label: '学习持续', value: Math.max(20, Math.min(96, Number(user?.continuous_days || 0) * 7)) },
            { key: 'transfer', label: '迁移应用', value: Math.max(18, Math.min(90, Math.round((mastery + accuracy) / 2) - 8)) }
        ];
        const risks = weakPoints.slice(0, 3).map(point => ({
            title: point.title,
            subject: point.subject,
            level: Number(point.mastery || 0) < 45 ? 'high' : 'medium',
            reason: point.wrongCount > 0 ? `${point.wrongCount} 次相关错题` : `掌握度 ${point.mastery}%`
        }));
        const recommendations = [
            {
                title: '生成个性化路径',
                reason: weakPoints[0] ? `先修复 ${weakPoints[0].title}，再进入同学科迁移练习。` : '根据画像重排学习路径。',
                action: '去规划',
                target: 'path'
            },
            {
                title: '整理错题笔记',
                reason: recentAnswers.some(item => !item.is_correct) ? '最近有错题记录，适合沉淀为主动回忆卡。' : '保持笔记复习能提升长期保持率。',
                action: '写笔记',
                target: 'smartNotes'
            },
            {
                title: '做一次阶段测试',
                reason: subjectScores[0] ? `${subjectScores[0].subject} 是当前最低掌握学科。` : '用测试校准画像。',
                action: '去测试',
                target: 'test'
            }
        ];

        res.json({
            success: true,
            user,
            persona,
            summary: {
                mastery,
                accuracy,
                efficiency,
                studyHours,
                continuousDays: Number(user?.continuous_days || 0),
                completedToday,
                todayTasks: tasks.length,
                weakCount: weakPoints.filter(point => Number(point.mastery || 0) < 60).length
            },
            dimensions,
            subjectScores,
            weakPoints,
            strongPoints,
            recentAnswers,
            tasks,
            notes,
            courses,
            risks,
            recommendations
        });
    } catch (error) {
        next(error);
    }
});

router.get('/teacher-dashboard', async (req, res, next) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: '需要教师权限才能访问教师工作台' });
        }
        const [[userStats]] = await pool.query(
            `SELECT COUNT(*) AS studentCount, ROUND(AVG(knowledge_mastery)) AS avgMastery,
                    ROUND(AVG(study_efficiency)) AS avgEfficiency, ROUND(AVG(continuous_days)) AS avgStreak
             FROM users WHERE role = 'student'`
        );
        const [[questionStats]] = await pool.query(
            `SELECT COUNT(*) AS totalAnswers, SUM(is_correct = 1) AS correctAnswers,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers`
        );
        const [subjects] = await pool.query(
            `SELECT subject, ROUND(AVG(mastery)) AS mastery, COUNT(*) AS knowledgeCount
             FROM knowledge_points
             GROUP BY subject
             ORDER BY mastery ASC, knowledgeCount DESC`
        );
        const [weakPoints] = await pool.query(
            `SELECT title, subject, mastery, summary
             FROM knowledge_points
             ORDER BY mastery ASC, id
             LIMIT 8`
        );
        const [recentAnswers] = await pool.query(
            `SELECT ua.is_correct, ua.answered_at, u.nickname, u.username, kp.title AS knowledgeTitle, kp.subject
             FROM user_answers ua
             JOIN users u ON u.id = ua.user_id
             JOIN questions q ON q.id = ua.question_id
             JOIN knowledge_points kp ON kp.id = q.knowledge_id
             ORDER BY ua.answered_at DESC
             LIMIT 10`
        );
        const interventionQueue = weakPoints.slice(0, 5).map((point, index) => ({
            student: index % 2 ? '张三同学' : '计算机学习小组',
            issue: `${point.subject} · ${point.title}`,
            mastery: point.mastery,
            action: point.mastery < 50 ? '安排补救练习' : '推送讲解与测试'
        }));
        res.json({
            success: true,
            overview: {
                studentCount: Number(userStats.studentCount || 1),
                avgMastery: Number(userStats.avgMastery || 0),
                avgEfficiency: Number(userStats.avgEfficiency || 0),
                avgStreak: Number(userStats.avgStreak || 0),
                accuracy: Number(questionStats.accuracy || 0),
                totalAnswers: Number(questionStats.totalAnswers || 0),
                correctAnswers: Number(questionStats.correctAnswers || 0)
            },
            subjects,
            weakPoints,
            recentAnswers,
            interventionQueue
        });
    } catch (error) {
        next(error);
    }
});

router.post('/teacher/action', async (req, res, next) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: '需要教师权限才能发布教学干预' });
        }
        const teacherId = req.user.id || 1;
        const { action = 'assign-remediation', target = 'class', subject = '数据结构与算法' } = req.body || {};
        const [[teacher]] = await pool.query('SELECT nickname, username FROM users WHERE id = ? LIMIT 1', [teacherId]);
        const messageMap = {
            'assign-remediation': `教师已为${target}发布「${subject}」补救练习`,
            'push-test': `教师已发布「${subject}」分科测试`,
            'create-note-task': `教师已要求整理「${subject}」智能笔记`,
            'ai-analysis': `教师已生成「${subject}」AI学情分析`
        };
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (1, 'robot', ?, '刚刚', '教师干预', '#7c4dff', 'rgba(124,77,255,.12)')`,
            [messageMap[action] || messageMap['assign-remediation']]
        );
        await pool.query(
            `INSERT INTO recommendations (user_id, title, reason, action_label, target_view, priority)
             VALUES (1, ?, ?, ?, ?, 98)`,
            [
                `${subject} 教师推荐任务`,
                `${teacher?.nickname || teacher?.username || '教师'} 根据学情数据发布了新的学习任务。`,
                action === 'create-note-task' ? '整理笔记' : action === 'push-test' ? '开始测试' : '开始练习',
                action === 'create-note-task' ? 'smartNotes' : action === 'push-test' ? 'test' : 'practice'
            ]
        );
        res.json({ success: true, message: messageMap[action] || messageMap['assign-remediation'] });
    } catch (error) {
        next(error);
    }
});

router.post('/closed-loop/run', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { topic = 'Node.js' } = req.body || {};
        const [[point]] = await pool.query(
            `SELECT id, title, subject, mastery, summary
             FROM knowledge_points
             WHERE title LIKE ? OR summary LIKE ?
             ORDER BY CASE WHEN title = ? THEN 0 ELSE 1 END, mastery ASC
             LIMIT 1`,
            [`%${topic}%`, `%${topic}%`, topic]
        );
        const knowledge = point || { id: null, title: topic, subject: '程序设计', mastery: 45, summary: `${topic} 相关计算机知识点。` };
        const [[course]] = await pool.query(
            `SELECT id, title, provider, progress
             FROM courses
             WHERE title LIKE ? OR description LIKE ? OR subject = ?
             ORDER BY progress ASC, id
             LIMIT 1`,
            [`%${knowledge.title}%`, `%${knowledge.title}%`, knowledge.subject]
        );
        const [questions] = await pool.query(
            `SELECT q.id, q.question, q.difficulty, kp.title AS knowledgeTitle
             FROM questions q JOIN knowledge_points kp ON kp.id = q.knowledge_id
             WHERE kp.id = ? OR kp.subject = ?
             ORDER BY kp.id = ? DESC, q.id
             LIMIT 5`,
            [knowledge.id || 0, knowledge.subject, knowledge.id || 0]
        );

        await pool.query('DELETE FROM study_tasks WHERE user_id = ? AND task_date = CURDATE() AND source = "closed_loop"', [userId]);
        const taskRows = [
            [`继续学习：${course?.title || knowledge.title}`, `${knowledge.subject} · 课程进度 ${course?.progress ?? 0}%`, 'play', 25, '#2f6bff', 'rgba(47,107,255,.12)'],
            [`完成 ${knowledge.title} 专项练习`, `${questions.length || 5} 道题 · 答题后更新掌握度`, 'exam', 18, '#18b87a', 'rgba(24,184,122,.12)'],
            [`整理 ${knowledge.title} 错题笔记`, '生成主动回忆卡和误区卡', 'pen', 12, '#ff9500', 'rgba(255,149,0,.12)'],
            [`安排 ${knowledge.title} 间隔复习`, '明日回访，检查是否遗忘', 'refresh', 8, '#7c4dff', 'rgba(124,77,255,.12)']
        ];
        for (let i = 0; i < taskRows.length; i += 1) {
            const row = taskRows[i];
            await pool.query(
                `INSERT INTO study_tasks (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, color, soft_color, source)
                 VALUES (?, ?, ?, ?, ?, ?, 'pending', CURDATE(), ?, ?, ?, 'closed_loop')`,
                [userId, knowledge.id, row[0], row[1], row[2], row[3], i + 1, row[4], row[5]]
            );
        }
        await pool.query(
            `INSERT INTO note_cards (user_id, knowledge_id, title, card_type, content_json, backlinks_json, mastery_signal)
             VALUES (?, ?, ?, 'plan', CAST(? AS JSON), CAST(? AS JSON), ?)`,
            [
                userId,
                knowledge.id,
                `${knowledge.title} 闭环学习卡`,
                JSON.stringify({
                    concept: knowledge.title,
                    explanation: knowledge.summary,
                    activeRecall: `不用看资料，说明 ${knowledge.title} 的核心用途和一个常见误区。`
                }),
                JSON.stringify(['一键闭环', '今日计划', '主动回忆']),
                knowledge.mastery || 50
            ]
        );
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'bolt', ?, '刚刚', '一键闭环', '#2f6bff', 'rgba(47,107,255,.12)')`,
            [userId, `AI 已围绕「${knowledge.title}」生成学习闭环`]
        );
        res.json({
            success: true,
            topic: knowledge.title,
            subject: knowledge.subject,
            mastery: knowledge.mastery,
            course: course || null,
            questions: questions.length,
            tasks: taskRows.map(row => ({ title: row[0], subtitle: row[1], minutes: row[3] })),
            effects: ['更新今日任务', '生成智能笔记卡', '推荐专项练习', '写入学习动态']
        });
    } catch (error) {
        next(error);
    }
});

function getPathStatus(mastery, taskDone) {
    if (taskDone) return 'done';
    if (Number(mastery || 0) < 45) return 'priority';
    if (Number(mastery || 0) < 70) return 'learning';
    return 'review';
}

function pathActionFor(point) {
    if (point.status === 'done') return '复盘巩固';
    if (point.status === 'priority') return '先补基础';
    if (point.status === 'learning') return '继续推进';
    return '迁移应用';
}

router.get('/path/center', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const goal = String(req.query.goal || '系统掌握计算机核心能力').trim();
        const subject = String(req.query.subject || 'all');

        const subjectParams = [];
        const subjectWhere = subject !== 'all' ? 'WHERE kp.subject = ?' : '';
        if (subject !== 'all') subjectParams.push(subject);

        const [subjects] = await pool.query(
            `SELECT kp.subject, ROUND(AVG(kp.mastery)) AS mastery, COUNT(*) AS knowledgeCount,
                    SUM(kp.mastery < 60) AS weakCount
             FROM knowledge_points kp
             GROUP BY kp.subject
             ORDER BY weakCount DESC, mastery ASC`
        );
        const [points] = await pool.query(
            `SELECT kp.id, kp.title, kp.subject, kp.summary, kp.mastery, kp.source_name, kp.source_url,
                    COUNT(q.id) AS questionCount,
                    COALESCE(SUM(ua.user_id = ? AND ua.is_correct = 0), 0) AS wrongCount,
                    MAX(st.status = 'done') AS taskDone,
                    MAX(st.id) AS taskId,
                    MAX(st.estimated_minutes) AS taskMinutes
             FROM knowledge_points kp
             LEFT JOIN questions q ON q.knowledge_id = kp.id
             LEFT JOIN user_answers ua ON ua.question_id = q.id
             LEFT JOIN study_tasks st ON st.knowledge_id = kp.id AND st.user_id = ? AND st.task_date = CURDATE()
             ${subjectWhere}
             GROUP BY kp.id, kp.title, kp.subject, kp.summary, kp.mastery, kp.source_name, kp.source_url
             ORDER BY kp.mastery ASC, wrongCount DESC, questionCount DESC, kp.id
             LIMIT 12`,
            [userId, userId, ...subjectParams]
        );
        const [tasks] = await pool.query(
            `SELECT id, knowledge_id, title, subtitle, icon, estimated_minutes, status, source, sort_order
             FROM study_tasks
             WHERE user_id = ? AND task_date = CURDATE()
             ORDER BY status = 'done', sort_order, id
             LIMIT 12`,
            [userId]
        );
        const [courses] = await pool.query(
            `SELECT id, title, provider, subject, progress, source_url
             FROM courses
             ${subject !== 'all' ? 'WHERE subject = ?' : ''}
             ORDER BY progress ASC, id
             LIMIT 8`,
            subject !== 'all' ? [subject] : []
        );
        const [[answerStats]] = await pool.query(
            `SELECT COUNT(*) AS total, SUM(is_correct = 1) AS correct,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers
             WHERE user_id = ?`,
            [userId]
        );
        const [notes] = await pool.query(
            `SELECT subject, COUNT(*) AS total
             FROM notes
             WHERE user_id = ?
             GROUP BY subject
             ORDER BY total DESC
             LIMIT 6`,
            [userId]
        ).catch(() => [[]]);

        const pathNodes = points.map((point, index) => {
            const status = getPathStatus(point.mastery, point.taskDone);
            const minutes = Number(point.taskMinutes || (point.mastery < 45 ? 35 : point.mastery < 70 ? 25 : 15));
            return {
                ...point,
                status,
                action: pathActionFor({ status }),
                estimateMinutes: minutes,
                phase: index < 3 ? '修复基础' : index < 7 ? '强化迁移' : '综合应用',
                reason: point.wrongCount > 0
                    ? `最近有 ${point.wrongCount} 次相关错题，优先修复。`
                    : point.mastery < 60
                        ? `掌握度 ${point.mastery}% 低于安全线。`
                        : `掌握度较高，适合做迁移应用和间隔复习。`,
                evidence: [
                    `掌握度 ${point.mastery}%`,
                    `${point.questionCount || 0} 道可练习题`,
                    point.source_name || '公开知识库'
                ]
            };
        });
        const doneTasks = tasks.filter(task => task.status === 'done').length;
        const totalMinutes = pathNodes.reduce((sum, node) => sum + Number(node.estimateMinutes || 0), 0);
        const weakCount = pathNodes.filter(node => Number(node.mastery || 0) < 60).length;

        res.json({
            success: true,
            goal,
            selectedSubject: subject,
            summary: {
                nodes: pathNodes.length,
                weakCount,
                todayTasks: tasks.length,
                doneTasks,
                totalMinutes,
                accuracy: Number(answerStats.accuracy || 0),
                noteSubjects: notes.length
            },
            subjects,
            pathNodes,
            tasks,
            courses,
            notes,
            personalization: [
                weakCount ? `你当前路径优先修复 ${weakCount} 个低掌握知识点。` : '当前路径以迁移应用和复习保持为主。',
                tasks.length ? `今日已有 ${tasks.length} 个任务，其中 ${doneTasks} 个完成。` : '今日暂无路径任务，可点击生成路径。',
                courses.length ? `系统会优先匹配低进度课程，避免只刷题不学课。` : '当前学科课程较少，可先从题目和笔记推进。'
            ]
        });
    } catch (error) {
        next(error);
    }
});

router.post('/path/generate', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const goal = String(req.body?.goal || '系统掌握计算机核心能力').trim();
        const subject = String(req.body?.subject || 'all');
        const intensity = String(req.body?.intensity || 'normal');
        const result = await agentRuntime.run({
            userId,
            message: goal,
            intent: 'design_course',
            context: { goal, subject, intensity, durationDays: req.body?.durationDays || 7 }
        });
        res.json({
            success: true,
            generated: result.path?.generated || 0,
            goal,
            subject,
            intensity,
            sessionId: result.sessionId,
            traces: result.traces,
            courseDesign: result.courseDesign,
            path: result.path
        });
    } catch (error) {
        next(error);
    }
});

router.post('/path/node/:id/start', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const nodeId = Number(req.params.id);
        const [[point]] = await pool.query('SELECT id, title, subject, mastery FROM knowledge_points WHERE id = ? LIMIT 1', [nodeId]);
        if (!point) return res.status(404).json({ success: false, message: '路径节点不存在' });
        const [[existing]] = await pool.query(
            'SELECT id FROM study_tasks WHERE user_id = ? AND knowledge_id = ? AND task_date = CURDATE() AND source = "path" LIMIT 1',
            [userId, nodeId]
        );
        if (existing) {
            await agentRuntime.ensureSchema();
            await agentRuntime.recordEvent({
                userId,
                eventType: 'path_node_started',
                subject: point.subject,
                knowledgeNodeId: nodeId,
                targetType: 'study_task',
                targetId: existing.id,
                payload: { title: point.title, mastery: point.mastery, reused: true }
            });
            return res.json({ success: true, taskId: existing.id, message: '节点已在今日路径中' });
        }
        const [result] = await pool.query(
            `INSERT INTO study_tasks (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, color, soft_color, source)
             VALUES (?, ?, ?, ?, 'play', ?, 'pending', CURDATE(), 1, '#2f6bff', 'rgba(47,107,255,.12)', 'path')`,
            [userId, nodeId, `开始学习：${point.title}`, `${point.subject} · 当前掌握度 ${point.mastery}%`, point.mastery < 50 ? 35 : 25]
        );
        await agentRuntime.ensureSchema();
        await agentRuntime.recordEvent({
            userId,
            eventType: 'path_node_started',
            subject: point.subject,
            knowledgeNodeId: nodeId,
            targetType: 'study_task',
            targetId: result.insertId,
            payload: { title: point.title, mastery: point.mastery, reused: false }
        });
        res.json({ success: true, taskId: result.insertId, message: '已加入今日路径' });
    } catch (error) {
        next(error);
    }
});

router.get('/account/dashboard', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const [[user]] = await pool.query(
            `SELECT id, username, nickname, email, role, interests,
                    study_hours, completed_courses, knowledge_mastery,
                    correct_answers, study_efficiency, continuous_days,
                    created_at
             FROM users WHERE id = ? LIMIT 1`,
            [userId]
        );
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }
        const [[answerStats]] = await pool.query(
            `SELECT COUNT(*) AS totalAnswers, SUM(is_correct = 1) AS correctAnswers,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers WHERE user_id = ?`,
            [userId]
        );

        const [subjectScores] = await pool.query(
            `SELECT kp.subject, ROUND(AVG(kp.mastery)) AS mastery,
                    COUNT(DISTINCT kp.id) AS knowledgeCount,
                    COUNT(q.id) AS questionCount,
                    COALESCE(SUM(ua.user_id = ? AND ua.is_correct = 0), 0) AS wrongCount
             FROM knowledge_points kp
             LEFT JOIN questions q ON q.knowledge_id = kp.id
             LEFT JOIN user_answers ua ON ua.question_id = q.id
             GROUP BY kp.subject
             ORDER BY mastery ASC, wrongCount DESC
             LIMIT 8`,
            [userId]
        );
        const [weakPoints] = await pool.query(
            `SELECT kp.id, kp.title, kp.subject, kp.mastery, kp.summary,
                    COALESCE(SUM(ua.user_id = ? AND ua.is_correct = 0), 0) AS wrongCount
             FROM knowledge_points kp
             LEFT JOIN questions q ON q.knowledge_id = kp.id
             LEFT JOIN user_answers ua ON ua.question_id = q.id
             GROUP BY kp.id, kp.title, kp.subject, kp.mastery, kp.summary
             ORDER BY kp.mastery ASC, wrongCount DESC
             LIMIT 6`,
            [userId]
        );
        const [courses] = await pool.query(
            `SELECT id, title, provider, subject, difficulty, progress, source_url
             FROM courses
             ORDER BY progress ASC, id
             LIMIT 8`
        );
        const [recentExamStats] = await pool.query(
            `SELECT DATE(answered_at) AS examDate, COUNT(*) AS total,
                    SUM(is_correct = 1) AS correct,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers
             WHERE user_id = ?
             GROUP BY DATE(answered_at)
             ORDER BY examDate DESC
             LIMIT 7`,
            [userId]
        );
        const [recentAnswers] = await pool.query(
            `SELECT ua.is_correct, ua.answered_at, q.question,
                    kp.title AS knowledgeTitle, kp.subject
             FROM user_answers ua
             JOIN questions q ON q.id = ua.question_id
             JOIN knowledge_points kp ON kp.id = q.knowledge_id
             WHERE ua.user_id = ?
             ORDER BY ua.answered_at DESC
             LIMIT 10`,
            [userId]
        );
        const [notes] = await pool.query(
            `SELECT n.id, n.title, n.subject, n.review_status, n.updated_at,
                    n.source_type, n.tags_json
             FROM notes n
             WHERE n.user_id = ?
             ORDER BY n.updated_at DESC
             LIMIT 6`,
            [userId]
        );
        const [noteStats] = await pool.query(
            `SELECT COUNT(*) AS totalNotes,
                    COUNT(DISTINCT subject) AS subjectCount
             FROM notes WHERE user_id = ?`,
            [userId]
        );
        const [activities] = await pool.query(
            `SELECT icon, title, time_label, badge, color, soft_color
             FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
            [userId]
        );
        const [todayTasks] = await pool.query(
            `SELECT COUNT(*) AS total,
                    SUM(status = 'done') AS done
             FROM study_tasks
             WHERE user_id = ? AND task_date = CURDATE()`,
            [userId]
        );
        const [achievements] = await pool.query(
            `SELECT title, badge, xp FROM achievements WHERE user_id = ? ORDER BY earned_at DESC LIMIT 6`,
            [userId]
        );

        const totalAnswers = Number(answerStats.totalAnswers || 0);
        const correctAnswers = Number(answerStats.correctAnswers || 0);
        const accuracy = Number(answerStats.accuracy || 0);
        const mastery = Number(user.knowledge_mastery || 0);
        const efficiency = Number(user.study_efficiency || 0);
        const studyHours = Number(user.study_hours || 0);
        const continuousDays = Number(user.continuous_days || 0);
        const completedCourses = Number(user.completed_courses || 0);
        const totalNotes = Number(noteStats[0]?.totalNotes || 0);
        const todayDone = Number(todayTasks[0]?.done || 0);
        const todayTotal = Number(todayTasks[0]?.total || 0);
        const weakCount = weakPoints.filter(p => Number(p.mastery || 0) < 60).length;

        const stageMap = [
            { max: 30, stage: '新手探索期', emoji: '🌱', desc: '正在建立计算机知识框架，每一步都在铺路。' },
            { max: 60, stage: '稳步成长期', emoji: '📈', desc: '知识体系逐渐成形，继续保持节奏！' },
            { max: 80, stage: '能力提升期', emoji: '🚀', desc: '核心能力稳步提升，可以挑战更高难度。' },
            { max: 100, stage: '冲刺突破期', emoji: '🏆', desc: '距离目标越来越近，冲刺阶段坚持住！' }
        ];
        const stage = stageMap.find(s => mastery <= s.max) || stageMap[stageMap.length - 1];

        const recommendations = [
            weakCount > 0 ? {
                title: `优先修复 ${weakCount} 个薄弱知识点`,
                reason: weakPoints[0] ? `「${weakPoints[0].title}」掌握度仅 ${weakPoints[0].mastery}%，建议先巩固。` : '检测到知识点薄弱，建议优先强化。',
                action: '开始练习',
                target: 'practice',
                priority: 95
            } : null,
            totalNotes < 3 ? {
                title: '开始沉淀学习笔记',
                reason: '笔记能大幅提升长期记忆保持率，现在开始还不晚。',
                action: '写笔记',
                target: 'smartNotes',
                priority: 88
            } : null,
            {
                title: '生成个性化学习路径',
                reason: '根据你的掌握度和薄弱点，AI 会编排 2-4 周的学习计划。',
                action: '去规划',
                target: 'path',
                priority: 82
            },
            completedCourses < 2 ? {
                title: '完成一门推荐课程',
                reason: courses[0] ? `「${courses[0].title}」已经开始，继续推进吧。` : '选一门课开始系统化学习。',
                action: '去学习',
                target: 'course',
                priority: 75
            } : null
        ].filter(Boolean);

        res.json({
            success: true,
            user,
            stage,
            stats: {
                studyHours,
                completedCourses,
                totalAnswers,
                correctAnswers,
                accuracy,
                mastery,
                efficiency,
                continuousDays,
                totalNotes,
                todayDone,
                todayTotal,
                weakCount
            },
            subjectScores,
            weakPoints,
            courses,
            recentExamStats,
            recentAnswers,
            notes,
            noteStats: { totalNotes, subjectCount: Number(noteStats[0]?.subjectCount || 0) },
            activities,
            achievements,
            recommendations
        });
    } catch (error) {
        next(error);
    }
});

router.post('/course/:id/progress', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const courseId = Number(req.params.id);
        const delta = Math.max(1, Math.min(30, Number(req.body?.delta || 8)));
        const [[course]] = await pool.query('SELECT id, title, progress, subject FROM courses WHERE id = ? LIMIT 1', [courseId]);
        if (!course) return res.status(404).json({ success: false, message: '课程不存在' });
        const nextProgress = Math.min(100, Number(course.progress || 0) + delta);
        await pool.query('UPDATE courses SET progress = ? WHERE id = ?', [nextProgress, courseId]);
        await pool.query(
            `UPDATE users SET study_hours = study_hours + 0.25, completed_courses = completed_courses + IF(? >= 100 AND ? < 100, 1, 0)
             WHERE id = ?`,
            [nextProgress, Number(course.progress || 0), userId]
        );
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'book', ?, '刚刚', '课程学习', '#18b87a', 'rgba(24,184,122,.12)')`,
            [userId, `学习了「${course.title}」，进度更新到 ${nextProgress}%`]
        );
        await createLearningNote(userId, {
            title: `${course.title} 课程学习记录`,
            body: `本次学习推进 ${delta}%，当前课程进度 ${nextProgress}%。\n\n待复盘：本节最关键的概念、一个容易混淆点、一个可以迁移到题目中的例子。`,
            subject: course.subject || '综合',
            sourceType: 'course',
            sourceId: courseId,
            tags: ['课程', '进度', course.subject || '综合']
        });
        await agentRuntime.ensureSchema();
        await agentRuntime.recordEvent({
            userId,
            eventType: 'course_progress_updated',
            subject: course.subject || '综合',
            targetType: 'course',
            targetId: courseId,
            payload: { title: course.title, previousProgress: Number(course.progress || 0), progress: nextProgress, delta }
        });
        res.json({ success: true, courseId, progress: nextProgress });
    } catch (error) {
        next(error);
    }
});

router.get('/notes/center', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const subject = String(req.query.subject || 'all');
        const source = String(req.query.source || 'all');
        await ensureNotesSchema();

        const params = [userId];
        const where = ['n.user_id = ?'];
        if (subject !== 'all') {
            where.push('COALESCE(n.subject, kp.subject, "综合") = ?');
            params.push(subject);
        }
        if (source !== 'all') {
            where.push('n.source_type = ?');
            params.push(source);
        }

        const [notes] = await pool.query(
            `SELECT n.id, n.title, n.body, COALESCE(n.subject, kp.subject, '综合') AS subject,
                    n.source_type, n.source_id, n.tags_json,
                    n.review_status, n.next_review_at, n.created_at, n.updated_at,
                    kp.title AS knowledge_title, kp.mastery
             FROM notes n
             LEFT JOIN knowledge_points kp ON kp.id = n.knowledge_id
             WHERE ${where.join(' AND ')}
             ORDER BY n.updated_at DESC, n.id DESC
             LIMIT 80`,
            params
        );
        const [subjects] = await pool.query(
            `SELECT COALESCE(n.subject, kp.subject, '综合') AS subject, COUNT(*) AS total
             FROM notes n
             LEFT JOIN knowledge_points kp ON kp.id = n.knowledge_id
             WHERE n.user_id = ?
             GROUP BY COALESCE(n.subject, kp.subject, '综合')
             ORDER BY total DESC, subject`,
            [userId]
        );
        const [timeline] = await pool.query(
            `SELECT DATE(n.updated_at) AS day, COUNT(*) AS total
             FROM notes n
             WHERE n.user_id = ?
             GROUP BY DATE(n.updated_at)
             ORDER BY day DESC
             LIMIT 14`,
            [userId]
        );
        const [cards] = await pool.query(
            `SELECT nc.id, nc.note_id, nc.title, nc.card_type, nc.content_json, nc.mastery_signal, nc.created_at,
                    n.subject, n.title AS note_title
             FROM note_cards nc
             LEFT JOIN notes n ON n.id = nc.note_id
             WHERE nc.user_id = ?
             ORDER BY nc.created_at DESC, nc.id DESC
             LIMIT 24`,
            [userId]
        );
        const reviewQueue = notes
            .filter(note => !note.next_review_at || new Date(note.next_review_at).getTime() <= Date.now() + 86400000)
            .slice(0, 8);

        res.json({
            success: true,
            notes: notes.map(note => ({ ...note, tags: safeJson(note.tags_json, []) })),
            subjects,
            timeline,
            reviewQueue,
            cards: cards.map(card => ({ ...card, content: safeJson(card.content_json, {}) }))
        });
    } catch (error) {
        next(error);
    }
});

router.post('/notes/save', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const {
            title = '计算机学习笔记',
            body = '',
            knowledgeId = null,
            subject = '综合',
            sourceType = 'manual',
            sourceId = null,
            tags = null
        } = req.body || {};
        const createdNote = await createLearningNote(userId, { title, body, knowledgeId, subject, sourceType, sourceId, tags });
        const noteId = createdNote.id;
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'pen', ?, '刚刚', '智能笔记', '#2f6bff', 'rgba(47,107,255,.12)')`,
            [userId, `保存了「${title}」`]
        );
        await agentRuntime.ensureSchema();
        await agentRuntime.recordEvent({
            userId,
            eventType: 'note_saved',
            subject,
            knowledgeNodeId: knowledgeId || null,
            targetType: 'note',
            targetId: noteId,
            payload: { title, sourceType, sourceId, tags }
        });
        res.json({ success: true, noteId, title, obsidianNote: createdNote.obsidianNote || null });
    } catch (error) {
        next(error);
    }
});

router.put('/notes/:id', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const noteId = Number(req.params.id);
        const { title = '', body = '', subject = '综合', tags = [] } = req.body || {};
        if (!noteId || !String(title).trim() || !String(body).trim()) {
            return res.status(400).json({ success: false, message: '笔记标题和内容不能为空' });
        }
        await ensureNotesSchema();
        const [result] = await pool.query(
            `UPDATE notes
             SET title = ?, body = ?, subject = ?, tags_json = CAST(? AS JSON), review_status = 'updated',
                 next_review_at = COALESCE(next_review_at, DATE_ADD(NOW(), INTERVAL 1 DAY))
             WHERE id = ? AND user_id = ?`,
            [String(title).slice(0, 220), body, subject, JSON.stringify(tags.length ? tags : inferTags(`${title}\n${body}`, subject)), noteId, userId]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: '笔记不存在' });
        res.json({ success: true, noteId, title });
    } catch (error) {
        next(error);
    }
});

router.delete('/notes/:id', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const noteId = Number(req.params.id);
        await ensureNotesSchema();
        await pool.query('DELETE FROM note_cards WHERE user_id = ? AND note_id = ?', [userId, noteId]);
        const [result] = await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: '笔记不存在' });
        res.json({ success: true, noteId });
    } catch (error) {
        next(error);
    }
});

router.post('/notes/:id/card', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const noteId = Number(req.params.id);
        await ensureNotesSchema();
        const [[note]] = await pool.query(
            'SELECT id, knowledge_id, title, body, subject FROM notes WHERE id = ? AND user_id = ? LIMIT 1',
            [noteId, userId]
        );
        if (!note) return res.status(404).json({ success: false, message: '笔记不存在' });
        const content = {
            concept: note.title,
            explanation: String(note.body || '').slice(0, 180),
            activeRecall: `合上笔记，复述「${note.title}」的核心结论和一个例子。`,
            trap: '只看懂当下材料，但没有形成可回忆的问题。'
        };
        const [result] = await pool.query(
            `INSERT INTO note_cards (user_id, note_id, knowledge_id, title, card_type, content_json, backlinks_json, mastery_signal)
             VALUES (?, ?, ?, ?, 'active_recall', CAST(? AS JSON), CAST(? AS JSON), 45)`,
            [userId, noteId, note.knowledge_id || null, `${note.title} · 复习卡`, JSON.stringify(content), JSON.stringify([note.subject || '综合', '笔记复习'])]
        );
        await pool.query(
            `UPDATE notes SET review_status = 'carded', next_review_at = DATE_ADD(NOW(), INTERVAL 1 DAY)
             WHERE id = ? AND user_id = ?`,
            [noteId, userId]
        );
        res.json({ success: true, cardId: result.insertId, title: `${note.title} · 复习卡`, content });
    } catch (error) {
        next(error);
    }
});

router.post('/notes/:id/review', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const noteId = Number(req.params.id);
        const quality = String(req.body?.quality || 'again');
        const days = quality === 'easy' ? 7 : quality === 'good' ? 3 : 1;
        await ensureNotesSchema();
        const [result] = await pool.query(
            `UPDATE notes
             SET review_status = ?, next_review_at = DATE_ADD(NOW(), INTERVAL ? DAY)
             WHERE id = ? AND user_id = ?`,
            [quality, days, noteId, userId]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: '笔记不存在' });
        res.json({ success: true, noteId, nextReviewDays: days });
    } catch (error) {
        next(error);
    }
});

router.post('/report/generate', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const [[stats]] = await pool.query(
            `SELECT COUNT(*) AS answers, SUM(is_correct = 1) AS correct,
                    ROUND(SUM(is_correct = 1) / NULLIF(COUNT(*), 0) * 100) AS accuracy
             FROM user_answers WHERE user_id = ?`,
            [userId]
        );
        const [weak] = await pool.query('SELECT title, subject, mastery FROM knowledge_points ORDER BY mastery ASC LIMIT 3');
        const summary = {
            accuracy: Number(stats.accuracy || 0),
            answers: Number(stats.answers || 0),
            correct: Number(stats.correct || 0),
            weak,
            advice: weak.length ? `优先修复 ${weak.map(w => w.title).join('、')}，再进行分科测试。` : '继续保持综合练习。'
        };
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'chart', 'AI 已生成计算机学习报告', '刚刚', '学习报告', '#7c4dff', 'rgba(124,77,255,.12)')`,
            [userId]
        );
        res.json({ success: true, summary });
    } catch (error) {
        next(error);
    }
});

router.post('/practice/submit-set', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { mode = 'practice', answers = {} } = req.body || {};
        const ids = Object.keys(answers).map(Number).filter(Boolean);
        if (!ids.length) return res.status(400).json({ success: false, message: '请先完成至少一道题' });

        const placeholders = ids.map(() => '?').join(',');
        const [rows] = await pool.query(
            `SELECT q.id, q.correct_answer, q.knowledge_id, q.question, kp.title, kp.subject, kp.mastery
             FROM questions q JOIN knowledge_points kp ON kp.id = q.knowledge_id
             WHERE q.id IN (${placeholders})`,
            ids
        );
        let correct = 0;
        const details = [];
        for (const row of rows) {
            const answer = answers[row.id];
            const isCorrect = String(answer) === String(row.correct_answer);
            correct += isCorrect ? 1 : 0;
            const nextMastery = Math.max(0, Math.min(100, Number(row.mastery || 0) + (isCorrect ? 4 : -4)));
            await pool.query(
                'INSERT INTO user_answers (user_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?)',
                [userId, row.id, answer || '', isCorrect ? 1 : 0]
            );
            await pool.query('UPDATE knowledge_points SET mastery = ? WHERE id = ?', [nextMastery, row.knowledge_id]);
            details.push({
                id: row.id,
                isCorrect,
                correctAnswer: row.correct_answer,
                knowledgeTitle: row.title,
                subject: row.subject,
                nextMastery
            });
        }
        const score = Math.round(correct / rows.length * 100);
        await agentRuntime.ensureSchema();
        await pool.query(
            `UPDATE users SET correct_answers = correct_answers + ?, knowledge_mastery =
             (SELECT ROUND(AVG(mastery)) FROM knowledge_points), study_efficiency = LEAST(100, GREATEST(1, study_efficiency + ?))
             WHERE id = ?`,
            [correct, score >= 80 ? 3 : score >= 60 ? 1 : -3, userId]
        );
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'exam', ?, '刚刚', ?, '#2f6bff', 'rgba(47,107,255,.12)')`,
            [userId, `完成${mode === 'exam' ? '在线考试' : mode === 'test' ? '阶段测试' : '专项练习'}，得分 ${score}`, mode === 'exam' ? '在线考试' : '练测闭环']
        );
        const weakDetails = details.filter(item => !item.isCorrect).slice(0, 4);
        await agentRuntime.recordEvent({
            userId,
            eventType: 'practice_set_submitted',
            subject: rows[0]?.subject || details[0]?.subject || null,
            targetType: mode,
            payload: { total: rows.length, correct, score, weakDetails }
        });
        await createLearningNote(userId, {
            title: `${mode === 'exam' ? '在线考试' : mode === 'test' ? '阶段测试' : '专项练习'}复盘：${score}分`,
            body: [
                `本次完成 ${rows.length} 道题，答对 ${correct} 道，得分 ${score}。`,
                weakDetails.length
                    ? `需要复习：${weakDetails.map(item => item.knowledgeTitle).join('、')}。`
                    : '本次表现稳定，可以把正确思路沉淀成迁移笔记。',
                '复盘模板：错因是什么？正确解法的关键一步是什么？下次看到相似题如何识别？'
            ].join('\n\n'),
            subject: rows[0]?.subject || details[0]?.subject || '练测复盘',
            sourceType: mode === 'exam' ? 'exam' : 'practice',
            tags: [mode === 'exam' ? '考试' : '练习', '错题', '复盘']
        });
        res.json({ success: true, mode, total: rows.length, correct, score, details });
    } catch (error) {
        next(error);
    }
});

router.post('/plan/generate', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const [weak] = await pool.query('SELECT id, title, subject, mastery FROM knowledge_points ORDER BY mastery ASC LIMIT 4');
        await pool.query('DELETE FROM study_tasks WHERE user_id = ? AND task_date = CURDATE() AND source = "ai"', [userId]);
        for (let i = 0; i < weak.length; i += 1) {
            const point = weak[i];
            await pool.query(
                `INSERT INTO study_tasks (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, color, soft_color, source)
                 VALUES (?, ?, ?, ?, ?, ?, 'pending', CURDATE(), ?, ?, ?, 'ai')`,
                [
                    userId,
                    point.id,
                    `AI 巩固：${point.title}`,
                    `${point.subject} · 当前掌握度 ${point.mastery}%`,
                    i % 2 ? 'pen' : 'brain',
                    point.mastery < 50 ? 30 : 20,
                    10 + i,
                    i % 2 ? '#ff9500' : '#2f6bff',
                    i % 2 ? 'rgba(255,149,0,.12)' : 'rgba(47,107,255,.12)'
                ]
            );
        }
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'robot', 'AI 已根据薄弱知识点生成今日学习闭环', '刚刚', '计划生成', '#7c4dff', 'rgba(124,77,255,.12)')`,
            [userId]
        );
        res.json({ success: true, generated: weak.length });
    } catch (error) {
        next(error);
    }
});

router.post('/diagnosis/submit', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { goal = '学机器学习', answers = [], preference = 'dialogue+visual' } = req.body || {};
        const score = answers.reduce((sum, item) => sum + (Number(item.correct || 0) ? 1 : 0), 0);
        const theta = Number(((score - answers.length / 2) / Math.max(1, answers.length)).toFixed(3));
        const [weak] = await pool.query('SELECT title FROM knowledge_points ORDER BY mastery ASC LIMIT 3');
        const diagnosis = { irt: { theta, confidence: 0.7 + Math.min(0.2, answers.length / 50) }, weakConcepts: weak.map(x => x.title), readiness: theta > 0 ? '可进入主线学习' : '建议先修复前置概念' };
        const misconceptions = weak.map((item, index) => ({ concept: item.title, severity: Number((0.72 - index * 0.09).toFixed(2)) }));
        const graph = { root: goal, prerequisites: weak.map(x => x.title), next: ['直观解释', '变式练习', '费曼输出', '迁移项目'] };
        await pool.query(
            `INSERT INTO cognitive_profiles (user_id, ability_theta, diagnosis_json, misconception_json, goal_text, goal_graph_json)
             VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, CAST(? AS JSON))`,
            [userId, theta, JSON.stringify(diagnosis), JSON.stringify(misconceptions), goal, JSON.stringify(graph)]
        );
        await pool.query(
            `INSERT INTO learning_preferences (user_id, style, modality_weights, evidence_json)
             VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON))`,
            [userId, preference, JSON.stringify({ text: 0.7, video: 0.58, dialogue: 0.92, experiment: 0.8 }), JSON.stringify({ source: 'diagnosis_interaction', answers: answers.length })]
        );
        res.json({ success: true, theta, diagnosis, graph });
    } catch (error) {
        next(error);
    }
});

router.post('/tutor/message', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { message = '', topic = '当前学习问题', mode = 'socratic' } = req.body || {};
        const [[human]] = await pool.query('SELECT id FROM digital_humans WHERE user_id = ? ORDER BY id LIMIT 1', [userId]);
        let [[session]] = await pool.query('SELECT id FROM tutor_sessions WHERE user_id = ? AND status = "active" ORDER BY id DESC LIMIT 1', [userId]);
        if (!session) {
            const [created] = await pool.query('INSERT INTO tutor_sessions (user_id, digital_human_id, mode, topic) VALUES (?, ?, ?, ?)', [userId, human?.id || null, mode, topic]);
            session = { id: created.insertId };
        }
        await pool.query('INSERT INTO tutor_messages (session_id, sender, content, strategy, emotion_signal) VALUES (?, "user", ?, "student_reasoning", "unknown")', [session.id, message]);
        const reply = buildSocraticReply(message);
        await pool.query('INSERT INTO tutor_messages (session_id, sender, content, strategy, emotion_signal) VALUES (?, "ai", ?, "socratic_probe", "supportive")', [session.id, reply]);
        await pool.query(
            `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'robot', '数字人导师完成一次苏格拉底追问', '刚刚', 'AI导师', '#7c4dff', 'rgba(124,77,255,.12)')`,
            [userId]
        );
        res.json({ success: true, sessionId: session.id, reply });
    } catch (error) {
        next(error);
    }
});

router.post('/notes/generate-card', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { text = '', knowledgeId = null } = req.body || {};
        const [[point]] = knowledgeId
            ? await pool.query('SELECT id, title FROM knowledge_points WHERE id = ? LIMIT 1', [knowledgeId])
            : await pool.query('SELECT id, title FROM knowledge_points ORDER BY mastery ASC LIMIT 1');
        const title = `${point?.title || '学习内容'} · 智能卡片`;
        const content = {
            concept: point?.title || '未命名概念',
            explanation: text || 'AI 根据当前学习材料生成结构化笔记。',
            analogy: '把新知识连接到已有知识，形成可复述的卡片。',
            activeRecall: `不用看笔记，解释一下：${point?.title || '这个概念'} 的关键约束是什么？`
        };
        const [result] = await pool.query(
            `INSERT INTO note_cards (user_id, knowledge_id, title, card_type, content_json, backlinks_json, mastery_signal)
             VALUES (?, ?, ?, 'concept', CAST(? AS JSON), CAST(? AS JSON), 50)`,
            [userId, point?.id || null, title, JSON.stringify(content), JSON.stringify(['自动生成', '主动回忆'])]
        );
        res.json({ success: true, cardId: result.insertId, title, content });
    } catch (error) {
        next(error);
    }
});

router.post('/feynman/review', async (req, res, next) => {
    try {
        const userId = req.user.id || 1;
        const { explanation = '', knowledgeId = null } = req.body || {};
        const [[point]] = knowledgeId
            ? await pool.query('SELECT id, title FROM knowledge_points WHERE id = ? LIMIT 1', [knowledgeId])
            : await pool.query('SELECT id, title FROM knowledge_points ORDER BY mastery ASC LIMIT 1');
        const lengthScore = Math.min(30, Math.floor(String(explanation).length / 8));
        const hasBecause = /因为|所以|therefore|because/i.test(explanation);
        const clarity = Math.min(100, 52 + lengthScore + (hasBecause ? 12 : 0));
        const accuracy = Math.min(100, 50 + lengthScore + (String(explanation).includes(point?.title || '') ? 10 : 0));
        const missing = [];
        if (!hasBecause) missing.push('缺少因果解释');
        if (String(explanation).length < 80) missing.push('例子或边界条件不足');
        const feedback = missing.length
            ? `表达已经有雏形，但${missing.join('、')}。请补一个反例或应用场景再讲一次。`
            : '解释较完整，可以进入迁移练习。';
        await pool.query(
            `INSERT INTO feynman_reviews (user_id, knowledge_id, explanation_text, clarity_score, accuracy_score, missing_points_json, feedback)
             VALUES (?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
            [userId, point?.id || null, explanation, clarity, accuracy, JSON.stringify(missing), feedback]
        );
        res.json({ success: true, clarity, accuracy, missing, feedback });
    } catch (error) {
        next(error);
    }
});

function buildSocraticReply(message) {
    const text = String(message || '').trim();
    if (!text) return '我们先从一个具体问题开始：你现在最卡的是定义、公式、还是题目步骤？';
    if (/答案|怎么做|不会|求解/.test(text)) {
        return '我先不直接给答案。你把题干里已经用到的条件列出来，再指出还有哪个条件没用到？这通常就是下一步入口。';
    }
    if (/为什么|原理/.test(text)) {
        return '很好，这是本质问题。你能先给一个自己的类比吗？如果类比失败，失败的边界往往就是概念的关键。';
    }
    return `我听到你的想法是：“${text.slice(0, 60)}”。下一步我们验证它：有没有一个反例会让这个说法不成立？`;
}

router.use((error, req, res, next) => {
    console.error('app api error:', error);
    res.status(500).json({ success: false, message: '新版应用接口异常', detail: error.message });
});

module.exports = router;
