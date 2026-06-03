const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');
const { ensureIotData } = require('../core/DemoDataSeeder');

router.get('/devices', authenticateJWT, async (req, res) => {
    try {
        await ensureIotData(pool, req.user.id);
        const [rows] = await pool.query(
            `SELECT device_id, device_type, name, status, updated_at
             FROM devices
             ORDER BY status = 'online' DESC, updated_at DESC`,
            []
        );
        res.json({ success: true, devices: rows });
    } catch (error) {
        console.error('获取设备失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.get('/logs', authenticateJWT, async (req, res) => {
    try {
        await ensureIotData(pool, req.user.id);
        const [rows] = await pool.query(
            `SELECT id, device_id, operation_name, parameters, start_time, end_time
             FROM device_operation_logs
             WHERE user_id = ?
             ORDER BY start_time DESC
             LIMIT 30`,
            [req.user.id]
        );
        res.json({ success: true, logs: rows });
    } catch (error) {
        console.error('获取设备日志失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.post('/register-device', authenticateJWT, async (req, res) => {
    const { deviceId, deviceType, name, status = 'online' } = req.body;
    if (!deviceId || !deviceType) {
        return res.status(400).json({ success: false, message: '缺少设备ID或设备类型' });
    }

    try {
        await ensureIotData(pool, req.user.id);
        await pool.query(
            `INSERT INTO devices (device_id, device_type, name, status, user_id)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                device_type = VALUES(device_type),
                name = VALUES(name),
                status = VALUES(status),
                user_id = VALUES(user_id),
                updated_at = NOW()`,
            [deviceId, deviceType, name || deviceId, status, req.user.id]
        );
        res.json({ success: true, message: '设备注册成功' });
    } catch (error) {
        console.error('设备注册失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

router.post('/analyze-operation', authenticateJWT, async (req, res) => {
    const { deviceId, operationLog = {} } = req.body;
    const action = operationLog.action || operationLog.operationName;
    if (!deviceId || !action) {
        return res.status(400).json({ success: false, message: '缺少设备ID或操作类型' });
    }

    try {
        await ensureIotData(pool, req.user.id);

        await pool.query(
            `INSERT INTO device_operation_logs (device_id, operation_name, parameters, start_time, end_time, user_id)
             VALUES (?, ?, ?, NOW(), NOW(), ?)`,
            [deviceId, action, JSON.stringify(operationLog), req.user.id]
        );

        const [[device]] = await pool.query(
            'SELECT device_type FROM devices WHERE device_id = ? LIMIT 1',
            [deviceId]
        );

        const [mappings] = await pool.query(
            `SELECT kn.id, kn.name, kn.description, okm.weight
             FROM operation_knowledge_mapping okm
             JOIN knowledge_nodes kn ON okm.knowledge_node_id = kn.id
             WHERE okm.operation_pattern = ?
               AND (? IS NULL OR okm.device_type = ?)
             ORDER BY okm.weight DESC`,
            [action, device?.device_type || null, device?.device_type || null]
        );

        const practicedNodes = mappings.map(item => item.name);
        const recommendedTheory = mappings
            .filter(item => item.description)
            .slice(0, 3)
            .map(item => item.description);

        res.json({
            success: true,
            message: '操作已记录并完成知识映射',
            practicedNodes,
            recommendedTheory,
            mappings
        });
    } catch (error) {
        console.error('分析操作失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

module.exports = router;
