const express = require('express');
const router = express.Router();
const pool = require('../db');
const { ensureKnowledgeData } = require('../core/DemoDataSeeder');

router.get('/', async (req, res) => {
    try {
        await ensureKnowledgeData(pool);
        const { subject } = req.query;
        const params = [];
        let whereClause = 'WHERE is_active = 1';
        if (subject && subject !== 'all') {
            whereClause += ' AND subject = ?';
            params.push(subject);
        }
        const [rows] = await pool.query(
            `SELECT id, name, description, difficulty, type, subject, content_url, bvid, video_platform
             FROM knowledge_nodes
             ${whereClause}
             ORDER BY id`
            ,
            params
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('查询知识点列表失败:', err);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ success: false, message: '无效的ID' });
    }
    try {
        await ensureKnowledgeData(pool);
        const [rows] = await pool.query(
            `SELECT id, name, description, difficulty, type, subject, content_url, bvid, video_platform
             FROM knowledge_nodes
             WHERE id = ? AND is_active = 1`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '知识点不存在' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('查询知识点失败:', err);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

module.exports = router;
