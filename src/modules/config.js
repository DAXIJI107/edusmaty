const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - 获取公开配置（无需登录）
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT config_key, config_value FROM system_config WHERE is_public = 1'
        );

        const config = {};
        rows.forEach(row => {
            try {
                config[row.config_key] = JSON.parse(row.config_value);
            } catch {
                config[row.config_key] = row.config_value;
            }
        });

        res.json({ success: true, data: config });
    } catch (e) {
        console.error('获取配置失败:', e);
        res.status(500).json({ success: false, message: '获取配置失败' });
    }
});

// GET /:key - 获取单个配置
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const [rows] = await pool.query(
            'SELECT config_key, config_value FROM system_config WHERE config_key = ? AND is_public = 1',
            [key]
        );

        if (!rows.length) {
            return res.status(404).json({ success: false, message: '配置不存在' });
        }

        let value = rows[0].config_value;
        try { value = JSON.parse(value); } catch {}

        res.json({ success: true, data: value });
    } catch (e) {
        console.error('获取配置失败:', e);
        res.status(500).json({ success: false, message: '获取配置失败' });
    }
});

module.exports = router;