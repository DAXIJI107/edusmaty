const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');
const { ensureQuestionData } = require('../core/DemoDataSeeder');
const { normalizeQuestionType } = require('../core/SubjectUtils');

async function ensureDynamicExamSchema() {
    const [cols] = await pool.query("SHOW COLUMNS FROM exam_records LIKE 'question_ids'");
    if (!cols.length) {
        await pool.query('ALTER TABLE exam_records ADD COLUMN question_ids JSON NULL AFTER exam_id');
    }
}

function parseOptions(options, type) {
    let parsed = options;
    if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
    }
    if (!Array.isArray(parsed)) parsed = [];
    if (type === 'judge' && parsed.length === 0) parsed = ['正确', '错误'];
    return parsed;
}

function formatQuestion(q) {
    const type = normalizeQuestionType(q.type);
    return {
        id: q.id,
        content: q.content,
        type,
        options: parseOptions(q.options, type),
        difficulty: q.difficulty || 'medium',
        score: Number(q.score || 5),
        node_id: q.node_id,
        node_name: q.node_name || '',
        subject: q.subject || 'math',
        mastery: Number(q.mastery || 0)
    };
}

// 获取考试列表（只显示已发布考试）
router.get('/', authenticateJWT, async (req, res) => {
    try {
        await ensureQuestionData(pool);
        const { subject } = req.query;
        const params = [];
        let whereClause = 'WHERE e.is_publish = 1 AND (e.is_active = 1 OR e.is_active IS NULL)';
        if (subject && subject !== 'all') {
            whereClause += ' AND e.subject = ?';
            params.push(subject);
        }
        const [rows] = await pool.query(
            `SELECT e.id, e.name, e.difficulty, e.subject, e.duration,
                    (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id AND (q.is_active = 1 OR q.is_active IS NULL)) AS question_count
             FROM exams e
             ${whereClause}
             AND EXISTS (SELECT 1 FROM questions q2 WHERE q2.exam_id = e.id AND (q2.is_active = 1 OR q2.is_active IS NULL))
             ORDER BY e.id`,
            params
        );
        res.json(rows);
    } catch (error) {
        console.error('获取考试列表失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.get('/:examId/questions', authenticateJWT, async (req, res) => {
    try {
        await ensureQuestionData(pool);
        const examId = req.params.examId;
        const [rows] = await pool.query(
            'SELECT id, content, type, options, answer, difficulty, score, node_id, subject FROM questions WHERE exam_id = ? AND (is_active = 1 OR is_active IS NULL)',
            [examId]
        );

        const questions = rows.map(q => {
            let options = q.options;
            if (typeof options === 'string') {
                try { options = JSON.parse(options); } catch (e) { options = []; }
            }
            if (!Array.isArray(options)) options = [];
            const type = normalizeQuestionType(q.type);
            if (type === 'judge' && options.length === 0) {
                options = ['正确', '错误'];
            }
            return {
                id: q.id,
                content: q.content,
                type,
                options,
                difficulty: q.difficulty || 'medium',
                score: Number(q.score || 5),
                node_id: q.node_id,
                subject: q.subject || 'math'
            };
        });
        res.json({ success: true, questions });
    } catch (error) {
        console.error('获取考试题目失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.get('/smart-paper/preview', authenticateJWT, async (req, res) => {
    try {
        await ensureQuestionData(pool);
        const userId = req.user.id;
        const subject = String(req.query.subject || 'all');
        const maxQuestions = Math.max(5, Math.min(60, Number(req.query.max || 40)));
        const params = [userId];
        let subjectWhere = '';
        if (subject && subject !== 'all') {
            subjectWhere = 'AND q.subject = ?';
            params.push(subject);
        }

        const [rows] = await pool.query(
            `SELECT q.id, q.content, q.type, q.options, q.difficulty, q.score, q.node_id, q.subject,
                    k.name AS node_name,
                    COALESCE(sk.mastery, 0) AS mastery
             FROM questions q
             LEFT JOIN knowledge_nodes k ON k.id = q.node_id
             LEFT JOIN student_knowledge sk ON sk.node_id = q.node_id AND sk.user_id = ?
             WHERE (q.is_active = 1 OR q.is_active IS NULL)
               AND q.node_id IS NOT NULL
               ${subjectWhere}
             ORDER BY
               CASE
                 WHEN COALESCE(sk.mastery, 0) < 50 THEN 0
                 WHEN COALESCE(sk.mastery, 0) < 80 THEN 1
                 ELSE 2
               END,
               COALESCE(sk.mastery, 0),
               q.node_id,
               q.id
             LIMIT ${maxQuestions}`,
            params
        );

        const questionIds = rows.map(row => row.id);
        const nodes = {};
        rows.forEach(row => {
            const key = row.node_id || 'unknown';
            if (!nodes[key]) {
                nodes[key] = {
                    id: row.node_id,
                    name: row.node_name || '未关联知识点',
                    mastery: Number(row.mastery || 0),
                    count: 0
                };
            }
            nodes[key].count += 1;
        });

        res.json({
            success: true,
            data: {
                mode: 'smart',
                subject,
                questionCount: questionIds.length,
                duration: Math.max(10, Math.ceil(questionIds.length * 1.8)),
                questionIds,
                nodes: Object.values(nodes),
                questions: rows.map(formatQuestion)
            }
        });
    } catch (error) {
        console.error('智能组卷预览失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.post('/smart-paper/start', authenticateJWT, async (req, res) => {
    try {
        await ensureQuestionData(pool);
        await ensureDynamicExamSchema();
        const userId = req.user.id;
        const subject = String(req.body.subject || 'all');
        const previewReq = {
            ...req,
            query: { subject, max: req.body.max || 40 }
        };

        const params = [userId];
        let subjectWhere = '';
        if (subject && subject !== 'all') {
            subjectWhere = 'AND q.subject = ?';
            params.push(subject);
        }
        const [questions] = await pool.query(
            `SELECT q.id
             FROM questions q
             LEFT JOIN student_knowledge sk ON sk.node_id = q.node_id AND sk.user_id = ?
             WHERE (q.is_active = 1 OR q.is_active IS NULL)
               AND q.node_id IS NOT NULL
               ${subjectWhere}
             ORDER BY
               CASE
                 WHEN COALESCE(sk.mastery, 0) < 50 THEN 0
                 WHEN COALESCE(sk.mastery, 0) < 80 THEN 1
                 ELSE 2
               END,
               COALESCE(sk.mastery, 0),
               q.node_id,
               q.id
             LIMIT ${Math.max(5, Math.min(60, Number(req.body.max || 40)))}`,
            params
        );
        const questionIds = questions.map(q => Number(q.id));
        if (!questionIds.length) {
            return res.status(400).json({ success: false, message: '当前条件下没有相关题目' });
        }

        const [[exam]] = await pool.query(
            `SELECT id FROM exams
             WHERE subject = ? AND is_publish = 1
             ORDER BY id
             LIMIT 1`,
            [subject === 'all' ? 'math' : subject]
        );
        const examId = exam?.id || 1;
        const [result] = await pool.query(
            'INSERT INTO exam_records (user_id, exam_id, question_ids, start_time, status) VALUES (?, ?, ?, NOW(), ?)',
            [userId, examId, JSON.stringify(questionIds), 'in_progress']
        );

        res.json({
            success: true,
            user_exam_id: result.insertId,
            questionIds,
            questionCount: questionIds.length,
            duration: Math.max(10, Math.ceil(questionIds.length * 1.8))
        });
    } catch (error) {
        console.error('启动智能组卷失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});
module.exports = router;
