const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

const BKTModel = require('../core/BKTModel');
const CognitiveDiagnosis = require('../core/CognitiveDiagnosis');
const ForgettingCurveEngine = require('../core/ForgettingCurveEngine');
const SocraticTutor = require('../core/SocraticTutor');
const AdaptivePracticeEngine = require('../core/AdaptivePracticeEngine');
const SmartNoteEngine = require('../core/SmartNoteEngine');
const LearningDashboard = require('../core/LearningDashboard');
const ImmersiveReader = require('../core/ImmersiveReader');
const EssayGrader = require('../core/EssayGrader');
const DynamicLearningPath = require('../core/DynamicLearningPath');

const bkt = new BKTModel();
const cognitiveDiagnosis = new CognitiveDiagnosis();
const forgettingCurve = new ForgettingCurveEngine();
const socraticTutor = new SocraticTutor();
const adaptivePractice = new AdaptivePracticeEngine();
const smartNote = new SmartNoteEngine();
const learningDashboard = new LearningDashboard();
const immersiveReader = new ImmersiveReader();
const essayGrader = new EssayGrader();
const dynamicPath = new DynamicLearningPath();

router.use(authenticateJWT);

async function tableExists(tableName) {
    const [rows] = await pool.query('SHOW TABLES LIKE ?', [tableName]);
    return rows.length > 0;
}

async function columnExists(tableName, columnName) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
    return rows.length > 0;
}

function safeJson(value, fallback) {
    if (Array.isArray(value) || (value && typeof value === 'object')) return value;
    try {
        return JSON.parse(value || '');
    } catch {
        return fallback;
    }
}

async function getCompatKnowledge(limit = 10) {
    if (await tableExists('knowledge_points')) {
        const [rows] = await pool.query(
            `SELECT id, title AS name, subject, summary AS description, mastery
             FROM knowledge_points
             ORDER BY mastery ASC, id LIMIT ?`,
            [limit]
        );
        return rows;
    }
    if (await tableExists('knowledge_nodes')) {
        const [rows] = await pool.query(
            `SELECT kn.id, kn.name, kn.subject, kn.description, COALESCE(sk.mastery, 50) AS mastery
             FROM knowledge_nodes kn
             LEFT JOIN student_knowledge sk ON sk.node_id = kn.id
             WHERE COALESCE(kn.is_active, 1) = 1
             ORDER BY COALESCE(sk.mastery, 50) ASC, kn.id LIMIT ?`,
            [limit]
        );
        return rows;
    }
    return [];
}

async function generateCompatDashboard(userId) {
    const knowledge = await getCompatKnowledge(12);
    const total = knowledge.length;
    const mastered = knowledge.filter(k => Number(k.mastery || 0) >= 80).length;
    const developing = knowledge.filter(k => Number(k.mastery || 0) >= 50 && Number(k.mastery || 0) < 80).length;
    const weak = knowledge.filter(k => Number(k.mastery || 0) < 50).length;
    const average = total ? Math.round(knowledge.reduce((sum, k) => sum + Number(k.mastery || 0), 0) / total) : 0;

    let answerStats = { answers: 0, correct: 0, accuracy: 0 };
    if (await tableExists('user_answers')) {
        const dateColumn = await columnExists('user_answers', 'answered_at') ? 'answered_at' : 'created_at';
        const [[row]] = await pool.query(
            `SELECT COUNT(*) AS answers, SUM(is_correct = 1) AS correct,
                    AVG(is_correct = 1) AS accuracy
             FROM user_answers
             WHERE user_id = ? AND DATE(${dateColumn}) = CURDATE()`,
            [userId]
        );
        answerStats = {
            answers: Number(row.answers || 0),
            correct: Number(row.correct || 0),
            accuracy: Math.round(Number(row.accuracy || 0) * 100)
        };
    }

    return {
        mastery: { total, mastered, developing, weak, average },
        today: { answers: answerStats.answers, exams: 0, accuracy: answerStats.accuracy },
        streak: { current: 1, longest: 1, history: [] },
        energy: {
            fatigueScore: 10,
            focusScore: 80,
            status: 'energetic',
            suggestion: '当前状态适合进行高价值学习任务，可优先处理薄弱知识点。'
        },
        predictions: {
            predictedAccuracy: Math.max(50, answerStats.accuracy || average),
            trend: 'improving',
            estimatedDaysToMasterAll: weak * 2,
            weakNodeCount: weak
        },
        alerts: weak ? [{
            type: 'insight',
            severity: 'medium',
            title: '薄弱知识点提醒',
            message: `检测到 ${weak} 个待巩固知识点，建议生成专项资源包。`,
            action: '生成学习路径'
        }] : []
    };
}

async function estimateCompatMastery(userId, nodeId) {
    if (await tableExists('knowledge_points')) {
        const [[point]] = await pool.query('SELECT id, title, mastery FROM knowledge_points WHERE id = ? LIMIT 1', [nodeId]);
        const [[stats]] = await pool.query(
            `SELECT COUNT(*) AS attempts, SUM(ua.is_correct = 1) AS correct
             FROM user_answers ua
             JOIN questions q ON q.id = ua.question_id
             WHERE ua.user_id = ? AND q.knowledge_id = ?`,
            [userId, nodeId]
        ).catch(() => [[{ attempts: 0, correct: 0 }]]);
        const attempts = Number(stats.attempts || 0);
        const mastery = attempts
            ? Math.round((Number(point?.mastery || 50) * 0.6) + (Number(stats.correct || 0) / attempts * 100 * 0.4))
            : Number(point?.mastery || 0);
        return {
            nodeId,
            nodeName: point?.title || `知识点 ${nodeId}`,
            mastery,
            confidence: Math.min(100, 40 + attempts * 12),
            attempts,
            nextReview: mastery < 50 ? { days: 1, reason: '掌握度偏低，建议明天复习' } : { days: 3, reason: '建议三天内巩固一次' }
        };
    }
    return await bkt.estimateMastery(userId, nodeId, pool);
}

async function generateCompatAdaptiveTest(userId, options = {}) {
    const count = Number(options.count || 8);
    const weak = await getCompatKnowledge(Math.max(4, count));
    let questions = [];
    if (await tableExists('questions') && await columnExists('questions', 'knowledge_id')) {
        const ids = weak.map(k => k.id);
        if (ids.length) {
            const placeholders = ids.map(() => '?').join(',');
            const [rows] = await pool.query(
                `SELECT q.id, q.question AS content, q.difficulty, q.options_json AS options,
                        kp.title AS nodeName, kp.subject, kp.mastery AS nodeMastery
                 FROM questions q
                 JOIN knowledge_points kp ON kp.id = q.knowledge_id
                 WHERE q.knowledge_id IN (${placeholders})
                 ORDER BY kp.mastery ASC, RAND() LIMIT ?`,
                [...ids, count]
            );
            questions = rows.map(q => ({ ...q, options: safeJson(q.options, []) }));
        }
    }

    if (!questions.length) {
        questions = weak.slice(0, count).map((k, index) => ({
            id: `demo-${index + 1}`,
            content: `请解释「${k.name}」的核心思想，并举一个计算机课程中的应用例子。`,
            difficulty: Number(k.mastery || 0) < 50 ? 'easy' : 'medium',
            options: [],
            nodeName: k.name,
            subject: k.subject,
            nodeMastery: k.mastery
        }));
    }

    return {
        testId: `adaptive_${Date.now()}`,
        type: 'adaptive',
        totalQuestions: questions.length,
        estimatedTime: questions.length * 3,
        difficulty: 'mixed',
        questions,
        focusNodes: weak.slice(0, 5).map(k => ({ id: k.id, name: k.name, mastery: k.mastery }))
    };
}

async function generateCompatLearningPath(userId, goal) {
    const nodes = await getCompatKnowledge(8);
    const enriched = nodes.map((node, index) => ({
        id: node.id,
        name: node.name,
        subject: node.subject,
        description: node.description,
        mastery: Number(node.mastery || 0),
        status: Number(node.mastery || 0) >= 80 ? 'mastered' : Number(node.mastery || 0) >= 50 ? 'in_progress' : 'pending',
        priority: 100 - Number(node.mastery || 0),
        difficulty: Number(node.mastery || 0) < 50 ? 'hard' : 'medium',
        estimatedHours: Number(node.mastery || 0) < 50 ? 2 : 1,
        resources: [
            { title: `${node.name}讲解文档`, type: 'document', url: `/ai-assistant?topic=${encodeURIComponent(node.name)}` },
            { title: `${node.name}专项练习`, type: 'quiz', url: '/practice' },
            { title: `${node.name}代码/实验任务`, type: 'practice', url: '/code-lab' }
        ],
        tips: index === 0 ? '优先修复当前最薄弱概念，再进入后续知识点。' : '结合讲解、练习和项目任务完成迁移。'
    }));

    return {
        goal: goal || '系统掌握计算机核心能力',
        userLevel: {
            level: 'elementary',
            avgMastery: enriched.length ? Math.round(enriched.reduce((s, n) => s + n.mastery, 0) / enriched.length) : 0
        },
        totalNodes: enriched.length,
        estimatedHours: enriched.reduce((sum, n) => sum + n.estimatedHours, 0),
        difficulty: enriched.some(n => n.difficulty === 'hard') ? 'moderate' : 'manageable',
        nodes: enriched,
        milestones: enriched.filter(n => n.difficulty === 'hard').slice(0, 3).map((n, i) => ({
            nodeIndex: i,
            nodeName: n.name,
            type: 'weakness_repair',
            message: `优先修复：${n.name}`
        })),
        alternatives: [
            { type: 'standard', description: '标准版：讲解、练习、项目三段式推进', estimatedHours: enriched.reduce((sum, n) => sum + n.estimatedHours, 0) },
            { type: 'exam', description: '考试版：强化题库和错题复盘', estimatedHours: Math.ceil(enriched.length * 0.8) }
        ]
    };
}

async function generateCompatReviewSchedule(userId) {
    const weak = await getCompatKnowledge(6);
    return weak.map((item, index) => ({
        nodeId: item.id,
        nodeName: item.name,
        mastery: item.mastery,
        nextReviewAt: new Date(Date.now() + (index + 1) * 24 * 3600 * 1000).toISOString(),
        intervalDays: index < 2 ? 1 : 3,
        reason: Number(item.mastery || 0) < 50 ? '薄弱知识点，建议高频复习' : '保持性复习'
    }));
}

router.get('/dashboard', async (req, res) => {
    try {
        const dashboard = await learningDashboard.generateDashboard(req.user.id, pool);
        res.json({ success: true, data: dashboard });
    } catch (error) {
        console.error('获取仪表盘失败:', error);
        try {
            const dashboard = await generateCompatDashboard(req.user.id);
            res.json({ success: true, fallback: true, data: dashboard });
        } catch {
            res.status(500).json({ success: false, message: '获取仪表盘失败' });
        }
    }
});

router.post('/bkt/estimate', async (req, res) => {
    try {
        const { nodeId } = req.body;
        const result = await bkt.estimateMastery(req.user.id, nodeId, pool);
        res.json({ success: true, data: result });
    } catch (error) {
        try {
            const result = await estimateCompatMastery(req.user.id, req.body?.nodeId);
            res.json({ success: true, fallback: true, data: result });
        } catch {
            res.status(500).json({ success: false, message: 'BKT评估失败' });
        }
    }
});

router.post('/bkt/batch-update', async (req, res) => {
    try {
        const results = await bkt.batchUpdate(req.user.id, pool);
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: '批量更新失败' });
    }
});

router.post('/diagnose', async (req, res) => {
    try {
        const { examRecordId } = req.body;
        const result = await cognitiveDiagnosis.diagnose(req.user.id, examRecordId, pool);
        res.json({ success: true, data: result });
    } catch (error) {
        try {
            const weak = await getCompatKnowledge(5);
            res.json({
                success: true,
                fallback: true,
                data: {
                    ability: weak.length ? Math.round(weak.reduce((s, k) => s + Number(k.mastery || 0), 0) / weak.length) : 50,
                    weakConcepts: weak.map(k => ({ id: k.id, name: k.name, mastery: k.mastery })),
                    diagnosis: weak.length ? '建议先修复低掌握度概念，再进入项目实践。' : '暂无足够数据，建议先完成诊断题。',
                    confidence: 0.72
                }
            });
        } catch {
            res.status(500).json({ success: false, message: '认知诊断失败' });
        }
    }
});

router.get('/forgetting-curve', async (req, res) => {
    try {
        const schedule = await forgettingCurve.calculateReviewSchedule(req.user.id, pool);
        res.json({ success: true, data: schedule });
    } catch (error) {
        try {
            res.json({ success: true, fallback: true, data: await generateCompatReviewSchedule(req.user.id) });
        } catch {
            res.status(500).json({ success: false, message: '获取遗忘曲线失败' });
        }
    }
});

router.get('/forgetting-curve/message', async (req, res) => {
    try {
        const message = await forgettingCurve.generateReviewMessage(req.user.id, pool);
        res.json({ success: true, data: message });
    } catch (error) {
        try {
            const schedule = await generateCompatReviewSchedule(req.user.id);
            const first = schedule[0];
            res.json({ success: true, fallback: true, data: first ? `今天建议优先复习「${first.nodeName}」，当前掌握度 ${first.mastery}%。` : '今天没有紧急复习任务。' });
        } catch {
            res.status(500).json({ success: false, message: '生成复习消息失败' });
        }
    }
});

router.post('/socratic/chat', async (req, res) => {
    try {
        const { question, conversation } = req.body;
        const response = await socraticTutor.generateResponse(req.user.id, question, conversation || [], pool);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, message: '苏格拉底对话失败' });
    }
});

router.post('/socratic/note', async (req, res) => {
    try {
        const { question, conversation } = req.body;
        const note = await socraticTutor.generateStructuredNote(req.user.id, question, conversation || [], pool);
        res.json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: '生成对话笔记失败' });
    }
});

router.post('/adaptive/practice', async (req, res) => {
    try {
        const { nodeId, options } = req.body;
        const practice = await adaptivePractice.generatePractice(req.user.id, nodeId, pool, options);
        res.json({ success: true, data: practice });
    } catch (error) {
        try {
            const test = await generateCompatAdaptiveTest(req.user.id, { ...(req.body?.options || {}), count: req.body?.options?.count || 5 });
            res.json({
                success: true,
                fallback: true,
                data: {
                    nodeId: req.body?.nodeId || test.focusNodes[0]?.id,
                    mastery: test.focusNodes[0]?.mastery || 50,
                    targetDifficulty: 'mixed',
                    questions: test.questions,
                    strategy: {
                        focus: '薄弱概念修复',
                        approach: '先做诊断题，再看讲解文档，最后进入代码/实验任务',
                        tips: '每道错题都沉淀成复习卡片。'
                    },
                    estimatedTime: test.estimatedTime
                }
            });
        } catch {
            res.status(500).json({ success: false, message: '生成自适应练习失败' });
        }
    }
});

router.post('/adaptive/analyze', async (req, res) => {
    try {
        const { questionId, answer } = req.body;
        const feedback = await adaptivePractice.analyzeAnswer(req.user.id, questionId, answer, pool);
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: '分析答案失败' });
    }
});

router.post('/adaptive/test', async (req, res) => {
    try {
        const { options } = req.body;
        const test = await adaptivePractice.generateAdaptiveTest(req.user.id, pool, options);
        res.json({ success: true, data: test });
    } catch (error) {
        try {
            const test = await generateCompatAdaptiveTest(req.user.id, req.body?.options || {});
            res.json({ success: true, fallback: true, data: test });
        } catch {
            res.status(500).json({ success: false, message: '生成自适应测试失败' });
        }
    }
});

router.post('/notes/enrich', async (req, res) => {
    try {
        const { content } = req.body;
        const enriched = await smartNote.enrichNote(req.user.id, content, pool);
        res.json({ success: true, data: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: '笔记丰富失败' });
    }
});

router.post('/notes/mindmap', async (req, res) => {
    try {
        const { content } = req.body;
        const mindMap = await smartNote.generateMindMap(content, pool);
        res.json({ success: true, data: mindMap });
    } catch (error) {
        res.status(500).json({ success: false, message: '生成思维导图失败' });
    }
});

router.get('/notes/related/:noteId', async (req, res) => {
    try {
        const related = await smartNote.findRelatedNotes(req.params.noteId, pool);
        res.json({ success: true, data: related });
    } catch (error) {
        res.status(500).json({ success: false, message: '查找相关笔记失败' });
    }
});

router.post('/notes/summary', async (req, res) => {
    try {
        const { content } = req.body;
        const summary = await smartNote.generateSummary(content);
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: '生成摘要失败' });
    }
});

router.post('/reader/analyze', async (req, res) => {
    try {
        const { text, options } = req.body;
        const analysis = await immersiveReader.analyzeText(text, options);
        res.json({ success: true, data: analysis });
    } catch (error) {
        res.status(500).json({ success: false, message: '文本分析失败' });
    }
});

router.post('/reader/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        const translation = await immersiveReader.translate(text, targetLang);
        res.json({ success: true, data: translation });
    } catch (error) {
        res.status(500).json({ success: false, message: '翻译失败' });
    }
});

router.post('/reader/flashcard', async (req, res) => {
    try {
        const { text, source } = req.body;
        const cards = await immersiveReader.generateFlashcard(text, source);
        res.json({ success: true, data: cards });
    } catch (error) {
        res.status(500).json({ success: false, message: '生成闪卡失败' });
    }
});

router.post('/grade', async (req, res) => {
    try {
        const { question, answer, options } = req.body;
        const result = await essayGrader.grade(req.user.id, question, answer, pool, options);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: '批改失败' });
    }
});

router.post('/learning-path', async (req, res) => {
    try {
        const { goal } = req.body;
        const path = await dynamicPath.generatePath(req.user.id, goal, pool);
        res.json({ success: true, data: path });
    } catch (error) {
        try {
            const path = await generateCompatLearningPath(req.user.id, req.body?.goal);
            res.json({ success: true, fallback: true, data: path });
        } catch {
            res.status(500).json({ success: false, message: '生成学习路径失败' });
        }
    }
});

router.post('/learning-path/adjust', async (req, res) => {
    try {
        const { pathId, performance } = req.body;
        const adjustment = await dynamicPath.adjustPath(req.user.id, pathId, performance, pool);
        res.json({ success: true, data: adjustment });
    } catch (error) {
        const performance = req.body?.performance || {};
        const adjustments = [];
        if (Number(performance.errorRate || 0) > 0.4) {
            adjustments.push({
                type: 'remedial_resources',
                message: '错误率偏高，建议补充基础讲解文档、图解和低难度练习。',
                suggestedAction: '生成补救资源包'
            });
        }
        if (Number(performance.accuracy || 0) > 0.85) {
            adjustments.push({
                type: 'advance_project',
                message: '正确率较高，可以进入项目实践或综合案例。',
                suggestedAction: '进入代码实训'
            });
        }
        res.json({
            success: true,
            fallback: true,
            data: {
                pathId: req.body?.pathId || `path_${Date.now()}`,
                adjustments,
                hasChanges: adjustments.length > 0,
                updatedPath: await generateCompatLearningPath(req.user.id, '根据学习表现动态调整')
            }
        });
    }
});

router.post('/ocr', async (req, res) => {
    try {
        const { image } = req.body;
        res.json({ success: true, data: { text: '[OCR识别结果]', confidence: 0.95 } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'OCR识别失败' });
    }
});

router.post('/voice/transcribe', async (req, res) => {
    try {
        const { audio } = req.body;
        res.json({ success: true, data: { text: '[语音识别结果]', duration: 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: '语音识别失败' });
    }
});

router.post('/cross-module/link', async (req, res) => {
    try {
        const { sourceType, sourceId, targetType, targetId } = req.body;
        await pool.query(
            `INSERT INTO cross_module_links (user_id, source_type, source_id, target_type, target_id)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, sourceType, sourceId, targetType, targetId]
        );
        res.json({ success: true, message: '关联创建成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '创建关联失败' });
    }
});

router.get('/cross-module/links/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const [links] = await pool.query(
            `SELECT * FROM cross_module_links
             WHERE user_id = ? AND (source_type = ? AND source_id = ?)
             ORDER BY created_at DESC`,
            [req.user.id, type, id]
        );
        res.json({ success: true, data: links });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取关联失败' });
    }
});

router.post('/video/mark', async (req, res) => {
    try {
        const { courseId, timePoint, content, nodeId } = req.body;
        const [result] = await pool.query(
            `INSERT INTO video_marks (user_id, course_id, time_point, content, node_id)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, courseId, timePoint, content, nodeId || null]
        );
        const reviewTask = {
            type: 'review',
            source: 'video_mark',
            sourceId: result.insertId,
            content: `复习视频标记：${content}`,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        res.json({ success: true, data: { markId: result.insertId, reviewTask } });
    } catch (error) {
        res.status(500).json({ success: false, message: '标记视频失败' });
    }
});

router.get('/video/marks/:courseId', async (req, res) => {
    try {
        const [marks] = await pool.query(
            'SELECT * FROM video_marks WHERE user_id = ? AND course_id = ? ORDER BY time_point ASC',
            [req.user.id, req.params.courseId]
        );
        res.json({ success: true, data: marks });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取视频标记失败' });
    }
});

router.post('/calendar/plan', async (req, res) => {
    try {
        const { date, task, nodeId, duration } = req.body;
        const [result] = await pool.query(
            `INSERT INTO study_plans (user_id, plan_date, task, node_id, duration, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [req.user.id, date, task, nodeId || null, duration || 30]
        );
        res.json({ success: true, data: { planId: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: '创建学习计划失败' });
    }
});

router.get('/calendar/plans/:date', async (req, res) => {
    try {
        const [plans] = await pool.query(
            'SELECT * FROM study_plans WHERE user_id = ? AND plan_date = ? ORDER BY created_at ASC',
            [req.user.id, req.params.date]
        );
        res.json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取学习计划失败' });
    }
});

router.get('/error-book/heatmap', async (req, res) => {
    try {
        const [errors] = await pool.query(
            `SELECT eb.knowledge_node_id, kn.name as node_name, kn.subject,
                    COUNT(*) as error_count, kn.chapter
             FROM error_book eb
             JOIN knowledge_nodes kn ON eb.knowledge_node_id = kn.id
             WHERE eb.user_id = ? AND eb.status = 'unsolved'
             GROUP BY eb.knowledge_node_id, kn.name, kn.subject, kn.chapter
             ORDER BY error_count DESC`,
            [req.user.id]
        );

        const maxErrors = errors.length > 0 ? Math.max(...errors.map(e => e.error_count)) : 1;
        const heatmap = errors.map(e => ({
            nodeId: e.knowledge_node_id,
            nodeName: e.node_name,
            subject: e.subject,
            chapter: e.chapter,
            errorCount: e.error_count,
            intensity: Math.round((e.error_count / maxErrors) * 100),
            level: e.error_count / maxErrors > 0.7 ? 'high' :
                   e.error_count / maxErrors > 0.4 ? 'medium' : 'low'
        }));

        res.json({ success: true, data: heatmap });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取错题热力图失败' });
    }
});

router.post('/mock-interview/start', async (req, res) => {
    try {
        const { subject, difficulty } = req.body;
        const questions = [
            { id: 1, content: `请介绍一下${subject}的核心概念`, type: 'essay' },
            { id: 2, content: `${subject}中最重要的原理是什么？请举例说明`, type: 'essay' },
            { id: 3, content: `你在学习${subject}时遇到的最大挑战是什么？如何克服的？`, type: 'essay' }
        ];
        res.json({ success: true, data: { sessionId: Date.now(), questions } });
    } catch (error) {
        res.status(500).json({ success: false, message: '开始模拟面试失败' });
    }
});

router.post('/mock-interview/evaluate', async (req, res) => {
    try {
        const { answers } = req.body;
        const dimensions = {
            fluency: Math.round(60 + Math.random() * 40),
            vocabulary: Math.round(60 + Math.random() * 40),
            grammar: Math.round(60 + Math.random() * 40),
            pronunciation: Math.round(60 + Math.random() * 40),
            depth: Math.round(60 + Math.random() * 40)
        };
        res.json({ success: true, data: { dimensions, overall: Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 5) } });
    } catch (error) {
        res.status(500).json({ success: false, message: '评估失败' });
    }
});

router.get('/alerts', async (req, res) => {
    try {
        const dashboard = await learningDashboard.generateDashboard(req.user.id, pool);
        res.json({ success: true, data: dashboard.alerts });
    } catch (error) {
        try {
            const dashboard = await generateCompatDashboard(req.user.id);
            res.json({ success: true, fallback: true, data: dashboard.alerts });
        } catch {
            res.status(500).json({ success: false, message: '获取预警失败' });
        }
    }
});

router.post('/demo-loop', async (req, res) => {
    try {
        const userId = req.user.id;
        const goal = req.body?.goal || '一周掌握 Python 循环和函数，并完成成绩管理系统项目';
        const path = await generateCompatLearningPath(userId, goal);
        const adaptiveTest = await generateCompatAdaptiveTest(userId, { count: 5 });
        const reviewSchedule = await generateCompatReviewSchedule(userId);
        const dashboard = await generateCompatDashboard(userId);
        const firstNode = path.nodes[0] || {};

        res.json({
            success: true,
            scenario: {
                user: '计算机类课程学生',
                goal,
                story: '画像诊断 -> 个性化路径 -> 多资源学习包 -> 练习/代码实训 -> 掌握度更新 -> 复习计划'
            },
            pretest: {
                title: '入门诊断题',
                focus: adaptiveTest.focusNodes,
                questions: adaptiveTest.questions
            },
            path,
            resourcePackage: {
                knowledgePoint: firstNode.name || 'Python 循环与函数',
                types: ['课程讲解文档', 'PPT大纲', '思维导图', '专项题库', '代码实操案例', '视频讲解脚本'],
                safety: '内容生成后进入安全审查与幻觉风险提示'
            },
            posttestAndUpdate: {
                rule: '正确率 >= 80% 标记掌握，50%-80% 进入巩固，低于 50% 自动回退到前置概念',
                dashboard
            },
            reviewSchedule
        });
    } catch (error) {
        res.status(500).json({ success: false, message: '生成演示闭环失败', detail: error.message });
    }
});

module.exports = router;
