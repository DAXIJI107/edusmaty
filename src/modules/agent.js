const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');
const OrchestratorAgent = require('../core/OrchestratorAgent');
const ProfileAgent = require('../core/ProfileAgent');
const LearningAgent = require('../core/LearningAgent');
const { ensurePathData } = require('../core/DemoDataSeeder');
const llmGateway = require('../core/llm/LlmGateway');

async function ensureAgentTables(userId) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS agent_permissions (
            user_id INT NOT NULL PRIMARY KEY,
            allow_auto_tutor TINYINT(1) DEFAULT 1,
            allow_auto_group TINYINT(1) DEFAULT 1,
            allow_auto_review TINYINT(1) DEFAULT 1,
            allow_auto_purchase TINYINT(1) DEFAULT 0,
            budget_limit DECIMAL(10,2) DEFAULT 0,
            require_review_for_purchase TINYINT(1) DEFAULT 1,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS agent_execution_logs (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            action_type VARCHAR(60) NOT NULL,
            params JSON NULL,
            result JSON NULL,
            status VARCHAR(30) DEFAULT 'success',
            executed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_agent_logs_user_time (user_id, executed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        INSERT INTO agent_permissions
            (user_id, allow_auto_tutor, allow_auto_group, allow_auto_review, allow_auto_purchase, budget_limit, require_review_for_purchase)
        VALUES (?, 1, 1, 1, 0, 0, 1)
        ON DUPLICATE KEY UPDATE user_id = user_id
    `, [userId]);
}

function getUserId(req) {
    return req.user.id;
}

// 初始化学习画像
router.post('/profile/initialize', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensurePathData(pool, userId);
        const orchestrator = new OrchestratorAgent(userId, pool);
        const result = await orchestrator.handleMessage({ type: 'init_profile' });
        res.json(result);
    } catch (error) {
        console.error('初始化画像失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 处理多模态输入
router.post('/profile/process-input', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { content, type = 'text' } = req.body;
        await ensurePathData(pool, userId);

        const profileAgent = new ProfileAgent(userId, pool);
        await profileAgent.initializeProfile();
        const profile = await profileAgent.processMultimodalInput(type, content || '');

        // 新增: 用Agent画像驱动学习计划生成
        let studyPlan = null;
        let hasPlanUpdated = false;
        try {
            const StudyPlanEngine = require('../core/StudyPlanEngine');
            const engine = new StudyPlanEngine();
            studyPlan = await engine.generateDailyWithProfile(pool, { userId });
            hasPlanUpdated = Boolean(studyPlan);
        } catch (e) {
            console.warn('画像驱动计划生成失败(降级):', e.message);
        }

        res.json({
            success: true,
            profile,
            studyPlan,
            hasPlanUpdated
        });
    } catch (error) {
        console.error('处理输入失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取画像摘要
router.get('/profile/summary', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensurePathData(pool, userId);
        const orchestrator = new OrchestratorAgent(userId, pool);
        const result = await orchestrator.handleMessage({ type: 'get_profile_summary' });
        res.json(result);
    } catch (error) {
        console.error('获取画像摘要失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 生成学习资源（SSE流式版本，带进度追踪）
router.get('/resources/generate-stream', authenticateJWT, async (req, res) => {
    const userId = getUserId(req);
    const { knowledgePoint, resourceTypes } = req.query;
    const types = resourceTypes ? resourceTypes.split(',') : [];

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    });

    const send = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
        await ensurePathData(pool, userId);
        const orchestrator = new OrchestratorAgent(userId, pool);

        send('progress', { step: '初始化', percent: 5, message: '正在加载学习画像...' });

        await orchestrator.handleMessage({ type: 'init_profile' });
        send('progress', { step: '画像就绪', percent: 15, message: '学习画像已加载' });

        const resourceAgent = orchestrator.agents.get('resource');
        const availableTypes = resourceAgent ? resourceAgent.getAvailableTypes() : [];
        const selectedTypes = types.length > 0 ? types : availableTypes.map(t => t.id);

        send('progress', { step: '资源类型', percent: 20, message: `准备生成${selectedTypes.length}种类型资源`, types: availableTypes });

        const profile = orchestrator.agents.get('profile')?.getProfile() || {};
        const totalSteps = selectedTypes.length;
        let completedSteps = 0;

        const results = [];
        for (let i = 0; i < totalSteps; i++) {
            const type = selectedTypes[i];
            send('progress', {
                step: `生成${type}`,
                percent: 20 + Math.round((i / totalSteps) * 60),
                message: `正在生成${type}类型资源...`,
                currentType: type
            });

            try {
                const resourceResult = await resourceAgent.handleMessage({
                    type: 'generate',
                    content: { knowledgePoint, types: [type], profile }
                });
                if (resourceResult.success && resourceResult.resources) {
                    for (const r of resourceResult.resources) {
                        const safetyCheck = await orchestrator.agents.get('safety').validateAndFilter(
                            r.content || '', profile.basicInfo?.major
                        );
                        r.safetyPassed = safetyCheck.passed;
                        r.hallucinationRisk = safetyCheck.hallucinationRisk;
                        results.push(r);
                    }
                }
            } catch (e) {
                results.push({ type, success: false, error: e.message });
            }

            completedSteps++;
            send('resource-ready', {
                type,
                percent: 20 + Math.round((completedSteps / totalSteps) * 60),
                result: results[results.length - 1]
            });
        }

        send('progress', { step: '安全审查', percent: 85, message: '正在进行内容安全审查...' });
        send('complete', {
            success: true,
            resources: results,
            knowledgePoint,
            totalGenerated: results.length,
            percent: 100
        });
    } catch (error) {
        console.error('流式生成资源失败:', error);
        send('error', { success: false, message: error.message });
    } finally {
        res.end();
    }
});

// 生成学习资源（普通版本）
router.post('/resources/generate', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensurePathData(pool, userId);
        const orchestrator = new OrchestratorAgent(userId, pool);
        const result = await orchestrator.handleMessage({
            type: 'generate_resources',
            content: req.body
        });
        res.json(result);
    } catch (error) {
        console.error('生成资源失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取可用的资源类型列表
router.get('/resources/types', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const orchestrator = new OrchestratorAgent(userId, pool);
        const result = await orchestrator.getAvailableResourceTypes();
        res.json(result);
    } catch (error) {
        console.error('获取资源类型失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.get('/settings', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensureAgentTables(userId);
        const [rows] = await pool.query('SELECT * FROM agent_permissions WHERE user_id = ?', [userId]);
        res.json({ success: true, permissions: rows[0] });
    } catch (error) {
        console.error('读取代理设置失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.post('/settings', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensureAgentTables(userId);
        const data = req.body;
        await pool.query(
            `INSERT INTO agent_permissions
                (user_id, allow_auto_tutor, allow_auto_group, allow_auto_review, allow_auto_purchase, budget_limit, require_review_for_purchase)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                allow_auto_tutor = VALUES(allow_auto_tutor),
                allow_auto_group = VALUES(allow_auto_group),
                allow_auto_review = VALUES(allow_auto_review),
                allow_auto_purchase = VALUES(allow_auto_purchase),
                budget_limit = VALUES(budget_limit),
                require_review_for_purchase = VALUES(require_review_for_purchase)`,
            [
                userId,
                !!data.allow_auto_tutor,
                !!data.allow_auto_group,
                !!data.allow_auto_review,
                !!data.allow_auto_purchase,
                Number(data.budget_limit || 0),
                !!data.require_review_for_purchase
            ]
        );
        res.json({ success: true, message: '设置已保存' });
    } catch (error) {
        console.error('保存代理设置失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

async function executeAgentAction(userId, actionType, params = {}) {
    const agent = new LearningAgent(userId, pool);
    let result;

    switch (actionType) {
        case 'BOOK_TUTOR':
            result = await agent.bookTutoringSession(params.topic || await pickWeakTopic(userId));
            break;
        case 'FORM_STUDY_GROUP':
            result = await createStudyGroup(userId, params.topic);
            break;
        case 'SCHEDULE_REVIEW':
            result = await agent.scheduleReview(params.knowledgePoints?.length ? params.knowledgePoints : await pickReviewTopics(userId));
            break;
        case 'PURCHASE_COURSE':
            result = await purchaseCourse(userId, params.courseId || params.course);
            break;
        default:
            throw new Error('不支持的代理动作');
    }

    await agent.logExecution(actionType, params, result, result.success ? 'success' : 'failed');
    return result;
}

router.post('/execute', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensureAgentTables(userId);
        await ensurePathData(pool, userId);
        const { actionType, params } = req.body;
        const result = await executeAgentAction(userId, actionType, params || {});
        res.json({ success: true, result });
    } catch (error) {
        console.error('执行代理动作失败:', error);
        res.status(500).json({ success: false, message: error.message || '服务器错误' });
    }
});

router.post('/run-daily-plan', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensureAgentTables(userId);
        await ensurePathData(pool, userId);
        const topics = await pickReviewTopics(userId);
        const actions = [];

        for (const action of [
            { actionType: 'SCHEDULE_REVIEW', params: { knowledgePoints: topics } },
            { actionType: 'BOOK_TUTOR', params: { topic: topics[0] } },
            { actionType: 'FORM_STUDY_GROUP', params: { topic: topics[0] } }
        ]) {
            const result = await executeAgentAction(userId, action.actionType, action.params);
            actions.push({ ...action, result, status: 'success' });
        }

        res.json({ success: true, actions });
    } catch (error) {
        console.error('执行每日计划失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// ========== 学习效果评估 ==========
router.get('/assessment', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const LearningAssessment = require('../core/LearningAssessment');
        const assessment = new LearningAssessment(userId, pool);
        const result = await assessment.getFullAssessment();
        res.json(result);
    } catch (error) {
        console.error('获取评估失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.post('/assessment/adjust-strategy', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const LearningAssessment = require('../core/LearningAssessment');
        const assessment = new LearningAssessment(userId, pool);
        const result = await assessment.adjustResourceStrategy();
        res.json(result);
    } catch (error) {
        console.error('调整策略失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.post('/assessment/log-resource', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { resourceType, completionRate, feedback } = req.body;
        const LearningAssessment = require('../core/LearningAssessment');
        const assessment = new LearningAssessment(userId, pool);
        await assessment.logResourceUsage(userId, resourceType, completionRate, feedback);
        res.json({ success: true });
    } catch (error) {
        console.error('记录资源使用失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.post('/assessment/log-study', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { durationMinutes, subject, activityType } = req.body;
        const LearningAssessment = require('../core/LearningAssessment');
        const assessment = new LearningAssessment(userId, pool);
        await assessment.logStudySession(userId, durationMinutes, subject, activityType);
        res.json({ success: true });
    } catch (error) {
        console.error('记录学习时段失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.get('/logs', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensureAgentTables(userId);
        const [logs] = await pool.query(
            `SELECT id, action_type, params, result, status, executed_at
             FROM agent_execution_logs
             WHERE user_id = ?
             ORDER BY executed_at DESC
             LIMIT 30`,
            [userId]
        );
        res.json({ success: true, logs });
    } catch (error) {
        console.error('读取代理日志失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

async function pickWeakTopic(userId) {
    const [rows] = await pool.query(
        `SELECT k.name
         FROM student_knowledge sk
         JOIN knowledge_nodes k ON sk.node_id = k.id
         WHERE sk.user_id = ?
         ORDER BY sk.mastery ASC, sk.last_updated ASC
         LIMIT 1`,
        [userId]
    );
    return rows[0]?.name || '函数的概念';
}

async function pickReviewTopics(userId) {
    const [rows] = await pool.query(
        `SELECT k.name
         FROM student_knowledge sk
         JOIN knowledge_nodes k ON sk.node_id = k.id
         WHERE sk.user_id = ?
         ORDER BY sk.mastery ASC, sk.last_updated ASC
         LIMIT 3`,
        [userId]
    );
    return rows.length ? rows.map(row => row.name) : ['函数的概念'];
}

async function createStudyGroup(userId, topic) {
    const [peers] = await pool.query(
        `SELECT username
         FROM users
         WHERE id <> ? AND role = 'student'
         ORDER BY updated_at DESC
         LIMIT 3`,
        [userId]
    );
    const names = peers.map(peer => peer.username);
    return {
        success: true,
        peers: names,
        message: `已围绕「${topic || '薄弱知识点'}」创建学习小组，邀请已发送给 ${names.join('、') || '可匹配同学'}`
    };
}

async function purchaseCourse(userId, course) {
    const [[row]] = await pool.query('SELECT name FROM courses WHERE id = ? OR name = ? LIMIT 1', [course, course]);
    return {
        success: true,
        course: row?.name || course || '推荐课程',
        message: `课程「${row?.name || course || '推荐课程'}」已加入待确认清单`
    };
}

router.post('/chat', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { message, mode = 'chat', history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: '请输入问题' });
        }

        await ensurePathData(pool, userId);

        const profileAgent = new ProfileAgent(userId, pool);
        await profileAgent.initializeProfile();
        const profile = profileAgent.getProfile();

        const systemPrompt = `你是EduSmart平台的AI学习导师"小星"，一个耐心、专业、激励型的学习伙伴。
你的职责是帮助学生解答学术问题、提供学习建议、进行错题分析和课程推荐。
根据学生的学习画像（${JSON.stringify(profile.basicInfo || {})})，提供个性化的帮助。
保持回复简洁、有用、有激励性。`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-6),
            { role: 'user', content: message }
        ];

        const assistantMessage = await llmGateway.chatText({
            messages,
            temperature: 0.7,
            maxTokens: 1800,
            fallbackContent: '抱歉，我现在无法回答这个问题，请稍后再试。'
        }) || '抱歉，我现在无法回答这个问题，请稍后再试。';

        res.json({
            success: true,
            response: assistantMessage,
            tutor: '小星',
            mode: mode
        });
    } catch (error) {
        console.error('AI导师对话失败:', error);
        res.status(500).json({
            success: false,
            response: '抱歉，我现在无法回答这个问题，请稍后再试。',
            error: error.message
        });
    }
});

router.post('/apply-plan', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        await ensurePathData(pool, userId);

        const StudyPlanEngine = require('../core/StudyPlanEngine');
        const KnowledgeTracingEngine = require('../core/KnowledgeTracingEngine');
        const CognitiveDiagnosis = require('../core/CognitiveDiagnosis');

        // 获取学生画像
        let profile = null;
        try {
            const [rows] = await pool.query(
                'SELECT profile_json FROM student_profiles WHERE user_id = ?',
                [userId]
            );
            if (rows.length > 0) {
                profile = typeof rows[0].profile_json === 'string'
                    ? JSON.parse(rows[0].profile_json)
                    : rows[0].profile_json;
            }
        } catch (e) {
            console.error('获取画像失败:', e.message);
        }

        // BKT知识追踪
        const bkt = new KnowledgeTracingEngine();
        const knowledgeMastery = await bkt.batchEstimateMastery(pool, userId);

        // 误区检测
        const cognitive = new CognitiveDiagnosis();
        const cognitiveData = await cognitive.batchDiagnoseBySubject(pool, userId);
        const misconceptions = [];
        for (const [, data] of Object.entries(cognitiveData)) {
            if (data.misconceptions?.categories) {
                for (const cat of data.misconceptions.categories) {
                    misconceptions.push({ ...cat, subject: data.subject || 'general' });
                }
            }
        }

        // 生成画像驱动的学习计划
        const engine = new StudyPlanEngine();
        const { date } = req.body;
        const plan = await engine.generateProfileAware(pool, {
            userId,
            date: date || null,
            profile,
            knowledgeMastery,
            cognitiveProfile: cognitiveData,
            misconceptions
        });

        res.json({
            success: true,
            message: '学习计划已根据智能诊断画像生成',
            data: plan
        });
    } catch (error) {
        console.error('应用学习计划失败:', error);
        res.status(500).json({ success: false, message: error.message || '服务器错误' });
    }
});

module.exports = router;
