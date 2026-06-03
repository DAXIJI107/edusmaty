const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

router.use(authenticateJWT);

// POST / - 记录学习事件（单条或批量）
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { events } = req.body;
        const eventList = events || [req.body];

        if (!eventList.length) {
            return res.status(400).json({ success: false, message: '事件不能为空' });
        }

        const values = [];
        const placeholders = eventList.map(evt => {
            values.push(
                userId,
                evt.session_id || null,
                evt.event_type,
                evt.page || null,
                evt.subject || null,
                evt.knowledge_id || null,
                evt.target_id || null,
                evt.target_type || null,
                evt.duration_ms || 0,
                evt.context_json ? JSON.stringify(evt.context_json) : null,
                evt.client_ts || Date.now()
            );
            return '(?,?,?,?,?,?,?,?,?,?,?)';
        }).join(',');

        await pool.query(
            `INSERT INTO learning_events (user_id, session_id, event_type, page, subject, knowledge_id, target_id, target_type, duration_ms, context_json, client_ts)
             VALUES ${placeholders}`,
            values
        );

        res.json({ success: true, count: eventList.length });
    } catch (e) {
        console.error('记录学习事件失败:', e);
        res.status(500).json({ success: false, message: '记录失败' });
    }
});

// GET / - 查询学习事件
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { event_type, limit = 50, offset = 0, from, to } = req.query;

        let where = 'WHERE user_id = ?';
        const params = [userId];

        if (event_type) {
            where += ' AND event_type = ?';
            params.push(event_type);
        }
        if (from) {
            where += ' AND created_at >= ?';
            params.push(from);
        }
        if (to) {
            where += ' AND created_at <= ?';
            params.push(to);
        }

        const [rows] = await pool.query(
            `SELECT * FROM learning_events ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        res.json({ success: true, data: rows, total: rows.length });
    } catch (e) {
        console.error('查询学习事件失败:', e);
        res.status(500).json({ success: false, message: '查询失败' });
    }
});

// GET /stats - 行为统计
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;
        const { days = 7 } = req.query;

        const [daily] = await pool.query(
            `SELECT DATE(created_at) as date, event_type, COUNT(*) as count
             FROM learning_events
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
             GROUP BY DATE(created_at), event_type
             ORDER BY date DESC`,
            [userId, parseInt(days)]
        );

        const [summary] = await pool.query(
            `SELECT event_type, COUNT(*) as total, AVG(duration_ms) as avg_duration
             FROM learning_events
             WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
             GROUP BY event_type`,
            [userId, parseInt(days)]
        );

        res.json({ success: true, data: { daily, summary } });
    } catch (e) {
        console.error('行为统计失败:', e);
        res.status(500).json({ success: false, message: '统计失败' });
    }
});

// GET /behaviors — 行为画像摘要（用于推荐和路径调整）
router.get('/behaviors', async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days || '14');

        // 各类行为统计
        const [videoStats] = await pool.query(
            `SELECT COUNT(*) as total, AVG(duration_ms) as avg_duration_ms,
                    SUM(duration_ms) as total_duration_ms
             FROM learning_events
             WHERE user_id = ? AND event_type = 'video_watch_duration'
               AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [userId, days]
        );

        const [noteStats] = await pool.query(
            `SELECT COUNT(*) as total
             FROM learning_events
             WHERE user_id = ? AND event_type = 'note_edit_frequency'
               AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [userId, days]
        );

        const [resourceClicks] = await pool.query(
            `SELECT target_type, COUNT(*) as count
             FROM learning_events
             WHERE user_id = ? AND event_type = 'resource_click'
               AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
             GROUP BY target_type
             ORDER BY count DESC`,
            [userId, days]
        );

        const [hesitationStats] = await pool.query(
            `SELECT COUNT(*) as total, AVG(duration_ms) as avg_hesitation_ms
             FROM learning_events
             WHERE user_id = ? AND event_type = 'answer_hesitation_time'
               AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [userId, days]
        );

        // 推断资源偏好
        const resourcePreference = {};
        resourceClicks.forEach(row => {
            resourcePreference[row.target_type] = Number(row.count);
        });

        // 推断专注模式
        let focusPattern = 'unknown';
        const avgWatchMs = Number(videoStats[0]?.avg_duration_ms || 0);
        if (avgWatchMs > 600000) focusPattern = 'deep_focus';        // > 10min average
        else if (avgWatchMs > 180000) focusPattern = 'moderate';      // 3-10min
        else if (avgWatchMs > 0) focusPattern = 'short_burst';       // < 3min

        // 推断学习偏好
        let inferredStyle = 'reading';
        const totalClicks = resourceClicks.reduce((s, r) => s + Number(r.count), 0);
        if (totalClicks > 0) {
            const videoRatio = (resourcePreference.video || 0) / totalClicks;
            const docRatio = (resourcePreference.document || 0) / totalClicks;
            const quizRatio = (resourcePreference.quiz || 0) / totalClicks;
            const labRatio = (resourcePreference.lab || 0) / totalClicks;

            if (videoRatio > 0.4) inferredStyle = 'visual';
            else if (quizRatio > 0.35) inferredStyle = 'kinesthetic';
            else if (labRatio > 0.3) inferredStyle = 'kinesthetic';
            else if (docRatio > 0.35) inferredStyle = 'reading';
        }

        res.json({
            success: true,
            data: {
                period: `${days}天`,
                video: {
                    totalViews: Number(videoStats[0]?.total || 0),
                    avgDurationMs: Math.round(avgWatchMs),
                    totalDurationMs: Number(videoStats[0]?.total_duration_ms || 0)
                },
                notes: {
                    totalEdits: Number(noteStats[0]?.total || 0)
                },
                resourcePreference,
                hesitation: {
                    total: Number(hesitationStats[0]?.total || 0),
                    avgMs: Math.round(Number(hesitationStats[0]?.avg_hesitation_ms || 0))
                },
                inferred: {
                    focusPattern,
                    learningStyle: inferredStyle,
                    confidence: totalClicks >= 5 ? 'medium' : 'low'
                }
            }
        });
    } catch (e) {
        console.error('行为画像查询失败:', e);
        res.status(500).json({ success: false, message: '查询失败' });
    }
});

// POST /sync-profile — 将行为推断结果同步到 student_profiles
router.post('/sync-profile', async (req, res) => {
    try {
        const userId = req.user.id;

        // 获取行为画像
        const [videoStats] = await pool.query(
            `SELECT COUNT(*) as total, AVG(duration_ms) as avg_duration_ms
             FROM learning_events
             WHERE user_id = ? AND event_type = 'video_watch_duration'
               AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)`,
            [userId]
        );

        const [resourceClicks] = await pool.query(
            `SELECT target_type, COUNT(*) as count
             FROM learning_events
             WHERE user_id = ? AND event_type = 'resource_click'
               AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
             GROUP BY target_type
             ORDER BY count DESC`,
            [userId]
        );

        // 读取现有画像
        const [profileRows] = await pool.query(
            'SELECT profile_json, version FROM student_profiles WHERE user_id = ?',
            [userId]
        );

        let profile = {};
        let version = 1;
        if (profileRows.length > 0) {
            profile = typeof profileRows[0].profile_json === 'string'
                ? JSON.parse(profileRows[0].profile_json)
                : profileRows[0].profile_json;
            version = (profileRows[0].version || 1) + 1;
        }

        // 更新行为推断字段
        const resourcePreference = {};
        resourceClicks.forEach(row => {
            resourcePreference[row.target_type] = Number(row.count);
        });

        profile.behavioral = {
            lastSyncAt: new Date().toISOString(),
            videoAvgDurationMs: Math.round(Number(videoStats[0]?.avg_duration_ms || 0)),
            videoTotalViews: Number(videoStats[0]?.total || 0),
            resourcePreference,
            updatedAt: new Date().toISOString()
        };

        // 写入或更新
        await pool.query(
            `INSERT INTO student_profiles (user_id, profile_json, version)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE profile_json = VALUES(profile_json), version = VALUES(version)`,
            [userId, JSON.stringify(profile), version]
        );

        res.json({
            success: true,
            message: '画像已同步',
            version,
            behavioral: profile.behavioral
        });
    } catch (e) {
        console.error('同步画像失败:', e);
        res.status(500).json({ success: false, message: '同步失败' });
    }
});

module.exports = router;