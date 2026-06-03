// core/SupervisorAgent.js
// 智能督学Agent - 负责学习过程监控、番茄钟管理、学习激励

const pool = require('../db');
const config = require('../config');

class SupervisorAgent {
    constructor(userId, pool) {
        this.userId = userId;
        this.pool = pool;
        this.pomodoroState = {
            isActive: false,
            type: 'work',
            remainingTime: 25 * 60,
            sessionsCompleted: 0,
            totalFocusTime: 0,
            startTime: null,
            task: null
        };
        this.studyMetrics = {
            todayStudyTime: 0,
            weekStudyTime: 0,
            streakDays: 0,
            totalSessions: 0,
            averageFocus: 0
        };
    }

    // 开始番茄钟
    async startPomodoro(task = null, duration = 25) {
        this.pomodoroState = {
            isActive: true,
            type: 'work',
            remainingTime: duration * 60,
            sessionsCompleted: this.pomodoroState.sessionsCompleted,
            totalFocusTime: this.pomodoroState.totalFocusTime,
            startTime: Date.now(),
            task: task
        };

        await this.savePomodoroState();
        return {
            success: true,
            state: this.getPomodoroState()
        };
    }

    // 暂停番茄钟
    async pausePomodoro() {
        if (!this.pomodoroState.isActive) {
            return { success: false, error: '番茄钟未在运行' };
        }
        const elapsed = Math.floor((Date.now() - this.pomodoroState.startTime) / 1000);
        this.pomodoroState.remainingTime -= elapsed;
        this.pomodoroState.isActive = false;
        await this.savePomodoroState();
        return {
            success: true,
            state: this.getPomodoroState()
        };
    }

    // 继续番茄钟
    async resumePomodoro() {
        if (this.pomodoroState.isActive) {
            return { success: false, error: '番茄钟已在运行' };
        }
        this.pomodoroState.isActive = true;
        this.pomodoroState.startTime = Date.now();
        await this.savePomodoroState();
        return {
            success: true,
            state: this.getPomodoroState()
        };
    }

    // 完成番茄钟
    async completePomodoro() {
        this.pomodoroState.sessionsCompleted++;
        this.pomodoroState.totalFocusTime += 25 * 60;
        this.pomodoroState.isActive = false;
        this.pomodoroState.remainingTime = 5 * 60;
        this.pomodoroState.type = 'break';

        await this.savePomodoroState();
        await this.updateStudyMetrics();

        return {
            success: true,
            session: this.pomodoroState.sessionsCompleted,
            message: '太棒了！休息一下吧～',
            state: this.getPomodoroState()
        };
    }

    // 获取当前状态
    getPomodoroState() {
        return {
            isActive: this.pomodoroState.isActive,
            type: this.pomodoroState.type,
            remainingTime: this.pomodoroState.remainingTime,
            sessionsCompleted: this.pomodoroState.sessionsCompleted,
            totalFocusTime: this.pomodoroState.totalFocusTime,
            task: this.pomodoroState.task
        };
    }

    // 保存番茄钟状态
    async savePomodoroState() {
        try {
            await this.pool.query(`
                INSERT INTO pomodoro_sessions (user_id, session_date, sessions_completed, total_focus_time, last_session_time)
                VALUES (?, CURDATE(), ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                    sessions_completed = VALUES(sessions_completed),
                    total_focus_time = VALUES(total_focus_time),
                    last_session_time = NOW()
            `, [this.userId, this.pomodoroState.sessionsCompleted, this.pomodoroState.totalFocusTime]);
        } catch (error) {
            console.error('保存番茄钟状态失败:', error);
        }
    }

    // 更新学习指标
    async updateStudyMetrics() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const [todayResult] = await this.pool.query(
                'SELECT SUM(total_focus_time) as total FROM pomodoro_sessions WHERE user_id = ? AND session_date = ?',
                [this.userId, today]
            );

            const [weekResult] = await this.pool.query(
                'SELECT SUM(total_focus_time) as total FROM pomodoro_sessions WHERE user_id = ? AND session_date >= ?',
                [this.userId, weekAgo]
            );

            const [streakResult] = await this.pool.query(`
                SELECT COUNT(DISTINCT session_date) as streak FROM (
                    SELECT session_date FROM pomodoro_sessions
                    WHERE user_id = ? AND session_date <= CURDATE()
                    ORDER BY session_date DESC
                ) dates
                WHERE DATEDIFF(CURDATE(), session_date) = (
                    SELECT MIN(DATEDIFF(CURDATE(), session_date)) FROM pomodoro_sessions WHERE user_id = ?
                )
            `, [this.userId, this.userId]);

            this.studyMetrics = {
                todayStudyTime: todayResult[0]?.total || 0,
                weekStudyTime: weekResult[0]?.total || 0,
                streakDays: streakResult[0]?.streak || 0,
                totalSessions: this.pomodoroState.sessionsCompleted
            };
        } catch (error) {
            console.error('更新学习指标失败:', error);
        }
    }

    // 获取学习统计
    async getStudyStatistics() {
        try {
            await this.updateStudyMetrics();

            const [recentSessions] = await this.pool.query(`
                SELECT session_date, sessions_completed, total_focus_time
                FROM pomodoro_sessions
                WHERE user_id = ? AND session_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                ORDER BY session_date DESC
            `, [this.userId]);

            const [achievements] = await this.pool.query(`
                SELECT achievement_type, COUNT(*) as count
                FROM study_achievements
                WHERE user_id = ? AND achieved_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY achievement_type
            `, [this.userId]);

            return {
                success: true,
                metrics: this.studyMetrics,
                recentSessions: recentSessions,
                recentAchievements: achievements
            };
        } catch (error) {
            console.error('获取学习统计失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 发送激励消息
    getMotivationMessage(type = 'encouragement') {
        const messages = {
            encouragement: [
                '坚持就是胜利！继续保持这个节奏～',
                '你今天的努力一定会有回报的！',
                '学习是一个积累的过程，为你的坚持点赞！',
                '小小的进步也是进步，为自己喝彩！'
            ],
            achievement: [
                '太棒了！你完成了一个番茄钟！',
                '专注力满分！继续保持～',
                '学习效率很高，继续加油！',
                '一个又一个的成就，铸就优秀的你！'
            ],
            break: [
                '休息一下吧，让大脑充充电～',
                '短暂的休息是为了走得更远！',
                '站起来活动一下，身体也很重要哦～'
            ],
            streak: [
                `你已经连续学习${this.studyMetrics.streakDays}天了！太厉害了！`,
                '坚持的力量！继续保持学习热情！',
                '连续学习是学霸的标志，为你骄傲！'
            ]
        };

        const typeMessages = messages[type] || messages.encouragement;
        return typeMessages[Math.floor(Math.random() * typeMessages.length)];
    }

    // 处理消息
    async handleMessage(message) {
        switch (message.type) {
            case 'start_pomodoro':
                return await this.startPomodoro(message.task, message.duration);
            case 'pause_pomodoro':
                return await this.pausePomodoro();
            case 'resume_pomodoro':
                return await this.resumePomodoro();
            case 'complete_pomodoro':
                return await this.completePomodoro();
            case 'get_state':
                return { success: true, state: this.getPomodoroState() };
            case 'get_statistics':
                return await this.getStudyStatistics();
            case 'get_motivation':
                return { success: true, message: this.getMotivationMessage(message.motivationType) };
            default:
                return { error: 'Unknown message type' };
        }
    }
}

module.exports = SupervisorAgent;