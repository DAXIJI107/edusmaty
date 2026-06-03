const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');
const { normalizeQuestionType, normalizeAnswerForCompare } = require('../core/SubjectUtils');

async function ensureDynamicExamSchema() {
    const [cols] = await pool.query("SHOW COLUMNS FROM exam_records LIKE 'question_ids'");
    if (!cols.length) {
        await pool.query('ALTER TABLE exam_records ADD COLUMN question_ids JSON NULL AFTER exam_id');
    }
}

// 创建用户考试记录
router.post('/', authenticateJWT, async (req, res) => {
    let { exam_id } = req.body;
    exam_id = parseInt(exam_id, 10);
    if (!exam_id || isNaN(exam_id)) {
        return res.status(400).json({ error: '无效的 exam_id' });
    }
    const [result] = await pool.query(
        'INSERT INTO exam_records (user_id, exam_id, start_time, status) VALUES (?, ?, NOW(), ?)',
        [req.user.id, exam_id, 'in_progress']
    );
    res.json({ user_exam_id: result.insertId });
});

// 获取用户的所有考试记录
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const [records] = await pool.query(
            `SELECT er.*, e.title AS exam_title
             FROM exam_records er
             LEFT JOIN exams e ON er.exam_id = e.id
             WHERE er.user_id = ?
             ORDER BY er.start_time DESC`,
            [req.user.id]
        );
        res.json({ success: true, records });
    } catch (error) {
        console.error('获取考试记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取单条考试记录
router.get('/:id', authenticateJWT, async (req, res) => {
    try {
        const [[record]] = await pool.query(
            `SELECT er.*, e.title AS exam_title
             FROM exam_records er
             LEFT JOIN exams e ON er.exam_id = e.id
             WHERE er.id = ? AND er.user_id = ?
             LIMIT 1`,
            [req.params.id, req.user.id]
        );
        if (!record) {
            return res.status(404).json({ success: false, message: '考试记录不存在' });
        }
        res.json({ success: true, record });
    } catch (error) {
        console.error('获取考试记录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 提交试卷并自动判分
router.post('/:id/submit', authenticateJWT, async (req, res) => {
    const user_exam_id = req.params.id;
    try {
        await ensureDynamicExamSchema();
        const [[record]] = await pool.query(
            'SELECT id, exam_id, question_ids FROM exam_records WHERE id = ? AND user_id = ? LIMIT 1',
            [user_exam_id, req.user.id]
        );
        if (!record) {
            return res.status(404).json({ success: false, message: '考试记录不存在' });
        }

        let questionIds = [];
        if (record.question_ids) {
            if (Array.isArray(record.question_ids)) {
                questionIds = record.question_ids;
            } else {
                try { questionIds = JSON.parse(record.question_ids); } catch (error) { questionIds = []; }
            }
        }

        let questions = [];
        if (questionIds.length) {
            const placeholders = questionIds.map(() => '?').join(',');
            const [rows] = await pool.query(
                `SELECT id, type, answer, score FROM questions WHERE id IN (${placeholders})`,
                questionIds
            );
            const orderMap = new Map(questionIds.map((id, index) => [Number(id), index]));
            questions = rows.sort((a, b) => (orderMap.get(Number(a.id)) || 0) - (orderMap.get(Number(b.id)) || 0));
        } else {
            const [rows] = await pool.query(
                'SELECT id, type, answer, score FROM questions WHERE exam_id = ?',
                [record.exam_id]
            );
            questions = rows;
        }
        const [answers] = await pool.query(
            'SELECT question_id, answer FROM user_answers WHERE user_exam_id=?',
            [user_exam_id]
        );
        const answerMap = new Map(answers.map(item => [Number(item.question_id), item.answer]));

        let total = 0;
        for (const q of questions) {
            const userAnswer = answerMap.get(Number(q.id));
            if (userAnswer === undefined || userAnswer === null || userAnswer === '') continue;

            const type = normalizeQuestionType(q.type);
            if (type === 'essay') continue;

            const std = normalizeAnswerForCompare(type, q.answer);
            const user = normalizeAnswerForCompare(type, userAnswer);

            const isCorrect = Array.isArray(std)
                ? JSON.stringify(std) === JSON.stringify(user)
                : String(std) === String(user);

            if (isCorrect) total += Number(q.score || 0);
        }

        await pool.query(
            'UPDATE exam_records SET submit_time=NOW(), status=?, score=? WHERE id=?',
            ['submitted', total, user_exam_id]
        );
        res.json({ success: true, score: total });
    } catch (error) {
        console.error('提交考试失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;
