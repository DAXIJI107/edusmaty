const express = require('express');
const router = express.Router();
const db = require('../db');
const { ensureQuestionData } = require('../core/DemoDataSeeder');
const { normalizeQuestionType } = require('../core/SubjectUtils');

function parseOptions(options) {
    if (typeof options !== 'string') return Array.isArray(options) ? options : [];
    try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function normalizeQuestionRow(q) {
    let ans = q.answer;
    if (q.type === 'multiple' && typeof ans === 'string') {
        try {
            ans = JSON.parse(ans);
        } catch (error) {
            ans = ans.split(',').map(a => a.trim());
        }
    }

    return {
        id: q.id,
        content: q.content,
        type: normalizeQuestionType(q.type),
        options: parseOptions(q.options),
        answer: ans,
        difficulty: q.difficulty || 'medium',
        score: q.score,
        node_id: q.node_id,
        subject: q.subject || 'math',
        knowledgeName: q.knowledge_name || ''
    };
}

router.get('/search', async (req, res) => {
    try {
        await ensureQuestionData(db);
        const keyword = String(req.query.q || '').trim();
        const subject = String(req.query.subject || 'all').trim();
        const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);

        if (!keyword) {
            return res.json({ success: true, questions: [] });
        }

        const params = [];
        let sql = `
            SELECT q.id, q.content, q.type, q.options, q.answer, q.difficulty, q.score, q.node_id, q.subject,
                   k.name AS knowledge_name
            FROM questions q
            LEFT JOIN knowledge_nodes k ON q.node_id = k.id
            WHERE (q.is_active = 1 OR q.is_active IS NULL)
              AND (q.content LIKE ? OR q.options LIKE ? OR q.answer LIKE ? OR k.name LIKE ?)
        `;
        const like = `%${keyword}%`;
        params.push(like, like, like, like);

        if (subject && subject !== 'all') {
            sql += ' AND q.subject = ?';
            params.push(subject);
        }

        sql += ' ORDER BY q.id DESC LIMIT ?';
        params.push(limit);

        const [rows] = await db.query(sql, params);
        res.json({ success: true, questions: rows.map(normalizeQuestionRow) });
    } catch (err) {
        console.error('题目搜索失败:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.get('/', async (req, res) => {
    try {
        await ensureQuestionData(db);
        const { subject, difficulty, count } = req.query;
        let sql = 'SELECT id, content, type, options, answer, difficulty, score, node_id, subject FROM questions WHERE (is_active = 1 OR is_active IS NULL)';
        const params = [];

        // 学科筛选（直接使用 subject 列）
        if (subject && subject !== 'all') {
            sql += ' AND subject = ?';
            params.push(subject);
        }

        // 难度筛选
        if (difficulty && difficulty !== 'all') {
            sql += ' AND difficulty = ?';
            params.push(difficulty);
        }

        sql += ' ORDER BY RAND() LIMIT ?';
        params.push(parseInt(count) || 10);

        let [rows] = await db.query(sql, params);

        // 兜底：若按条件无结果，忽略所有筛选随机返回题目
        if (rows.length === 0) {
            const fallbackSql = 'SELECT id, content, type, options, answer, difficulty, score, node_id, subject FROM questions WHERE (is_active = 1 OR is_active IS NULL) ORDER BY RAND() LIMIT ?';
            [rows] = await db.query(fallbackSql, [parseInt(count) || 10]);
        }

        const questions = rows.map(normalizeQuestionRow);

        res.json({ success: true, questions });
    } catch (err) {
        console.error('题目查询失败:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;
