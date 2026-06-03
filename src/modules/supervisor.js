// api/supervisor.js
// 智能督学API - 番茄钟、学习统计、督学Agent

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

async function ensureSupervisorTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS pomodoro_sessions (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_date DATE NOT NULL,
            sessions_completed INT DEFAULT 0,
            total_focus_time INT DEFAULT 0,
            last_session_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_date (user_id, session_date),
            INDEX idx_user_date (user_id, session_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS study_achievements (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            achievement_type VARCHAR(50) NOT NULL,
            achievement_name VARCHAR(100) NOT NULL,
            achieved_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_achievement (user_id, achievement_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS study_streaks (
            user_id INT PRIMARY KEY,
            current_streak INT DEFAULT 0,
            longest_streak INT DEFAULT 0,
            last_study_date DATE,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

router.use(async (req, res, next) => {
    await ensureSupervisorTables();
    next();
});

router.post('/pomodoro/start', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { task, duration } = req.body;

        const supervisorAgent = new (require('../core/SupervisorAgent'))(userId, pool);
        const result = await supervisorAgent.startPomodoro(task, duration || 25);

        res.json(result);
    } catch (error) {
        console.error('启动番茄钟失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/pomodoro/pause', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const supervisorAgent = new (require('../core/SupervisorAgent'))(userId, pool);
        const result = await supervisorAgent.pausePomodoro();

        res.json(result);
    } catch (error) {
        console.error('暂停番茄钟失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/pomodoro/resume', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const supervisorAgent = new (require('../core/SupervisorAgent'))(userId, pool);
        const result = await supervisorAgent.resumePomodoro();

        res.json(result);
    } catch (error) {
        console.error('继续番茄钟失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/pomodoro/complete', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const supervisorAgent = new (require('../core/SupervisorAgent'))(userId, pool);
        const result = await supervisorAgent.completePomodoro();

        res.json(result);
    } catch (error) {
        console.error('完成番茄钟失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/pomodoro/state', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            'SELECT * FROM pomodoro_sessions WHERE user_id = ? AND session_date = CURDATE()',
            [userId]
        );

        const todaySession = rows[0] || { sessions_completed: 0, total_focus_time: 0 };

        res.json({
            success: true,
            state: {
                isActive: false,
                type: 'work',
                remainingTime: 25 * 60,
                sessionsCompleted: todaySession.sessions_completed,
                totalFocusTime: todaySession.total_focus_time
            }
        });
    } catch (error) {
        console.error('获取番茄钟状态失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/statistics', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const supervisorAgent = new (require('../core/SupervisorAgent'))(userId, pool);
        const result = await supervisorAgent.getStudyStatistics();

        res.json(result);
    } catch (error) {
        console.error('获取学习统计失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/motivation', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const type = req.query.type || 'encouragement';

        const supervisorAgent = new (require('../core/SupervisorAgent'))(userId, pool);
        const result = await supervisorAgent.handleMessage({
            type: 'get_motivation',
            motivationType: type
        });

        res.json(result);
    } catch (error) {
        console.error('获取激励消息失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/achievements', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        const [achievements] = await pool.query(`
            SELECT achievement_type, achievement_name, achieved_at
            FROM study_achievements
            WHERE user_id = ?
            ORDER BY achieved_at DESC
            LIMIT 20
        `, [userId]);

        res.json({
            success: true,
            achievements: achievements
        });
    } catch (error) {
        console.error('获取成就失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/achievements/check', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, name } = req.body;

        await pool.query(`
            INSERT INTO study_achievements (user_id, achievement_type, achievement_name)
            VALUES (?, ?, ?)
        `, [userId, type, name]);

        res.json({ success: true, message: '成就已解锁' });
    } catch (error) {
        console.error('解锁成就失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;