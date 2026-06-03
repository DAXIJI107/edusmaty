const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateJWT } = require('../middleware');
const config = require('../config');

const JWT_SECRET = config.jwt.secret;

const demoUsers = [
    {
        id: 1,
        username: 'zhangsan',
        email: 'zhangsan@edusmart.local',
        password: '123456',
        role: 'student',
        nickname: '张三同学',
        name: '张三同学',
        status: 'active',
        study_hours: 15.6,
        completed_courses: 6,
        knowledge_mastery: 82,
        correct_answers: 148,
        study_efficiency: 77,
        continuous_days: 13
    },
    {
        id: 2,
        username: 'teacher',
        email: 'teacher@edusmart.local',
        password: '123456',
        role: 'teacher',
        nickname: '李老师',
        name: '李老师',
        status: 'active'
    }
];

function signUser(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'student' },
        JWT_SECRET,
        { expiresIn: config.jwt.expiresIn || '24h' }
    );
}

function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 3600000,
        sameSite: 'lax',
        path: '/'
    });
}

function publicUser(user) {
    return {
        id: user.id,
        username: user.username,
        name: user.name || '',
        nickname: user.nickname || user.username,
        email: user.email,
        phone: user.phone || '',
        phoneDisplay: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '',
        gender: user.gender || 'male',
        birthday: user.birthday || '',
        bio: user.bio || '',
        interests: user.interests || ['数学', '编程', '英语口语'],
        avatar: user.avatar || '',
        role: user.role || 'student',
        studyStats: {
            studyHours: user.study_hours || 15.6,
            completedCourses: user.completed_courses || 6,
            knowledgeMastery: user.knowledge_mastery || 82,
            correctAnswers: user.correct_answers || 148,
            studyEfficiency: user.study_efficiency || 77,
            continuousDays: user.continuous_days || 13
        }
    };
}

function findDemoUser(usernameOrId) {
    return demoUsers.find(user => String(user.id) === String(usernameOrId) || user.username === usernameOrId);
}

// 管理员引导初始化（仅用于比赛/本地演示）
// 启用方式：在 .env 设置 BOOTSTRAP_TOKEN，并在首次部署时调用一次创建管理员账号。
router.post('/bootstrap-admin', async (req, res) => {
    try {
        const bootstrapToken = String(process.env.BOOTSTRAP_TOKEN || '').trim();
        if (!bootstrapToken) {
            return res.status(403).json({ success: false, message: '未启用管理员初始化' });
        }
        const provided = String(req.headers['x-bootstrap-token'] || req.body?.token || '').trim();
        if (!provided || provided !== bootstrapToken) {
            return res.status(403).json({ success: false, message: '初始化口令错误' });
        }

        const username = String(req.body?.username || 'admin').trim();
        const email = String(req.body?.email || 'admin@edusmart.local').trim();
        const password = String(req.body?.password || '').trim();
        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: '请提供至少8位的password' });
        }

        const [exists] = await pool.query('SELECT id, role FROM users WHERE username = ? OR email = ? LIMIT 1', [username, email]);
        if (exists.length) {
            // 若已存在则升级为 admin，便于演示环境恢复
            await pool.query('UPDATE users SET role = ? WHERE id = ?', ['admin', exists[0].id]);
            return res.json({ success: true, message: '管理员已存在，已确保为admin权限', userId: exists[0].id });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, 'admin', 'active']
        );
        res.json({ success: true, message: '管理员账号已创建', userId: result.insertId });
    } catch (error) {
        console.error('管理员初始化错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: '请提供所有必填字段' });
        }
        const [userRows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (userRows.length > 0) {
            return res.status(400).json({ success: false, message: '用户名已存在' });
        }
        const [emailRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (emailRows.length > 0) {
            return res.status(400).json({ success: false, message: '邮箱已存在' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.json({ success: true, message: '用户注册成功' });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 教师注册（需要已验证的管理员token）
router.post('/register-teacher', authenticateJWT, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: '请提供所有必填字段' });
        }

        const [[adminRow]] = await pool.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (!adminRow || adminRow.role !== 'admin') {
            // Allow self-registration as teacher for testing
            const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
            if (existing.length > 0 && existing[0].id !== req.user.id) {
                return res.status(403).json({ success: false, message: '仅管理员可注册教师账号' });
            }
        }

        const [userRows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (userRows.length > 0) {
            // Update existing user's role to teacher
            await pool.query("UPDATE users SET role = 'teacher' WHERE username = ?", [username]);
            return res.json({ success: true, message: '用户已升级为教师' });
        }

        const [emailRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (emailRows.length > 0) {
            return res.status(400).json({ success: false, message: '邮箱已存在' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'teacher')",
            [username, email, hashedPassword]
        );
        res.json({ success: true, message: '教师注册成功' });
    } catch (error) {
        console.error('教师注册错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 登录
router.post('/login', async (req, res) => {
    let demoUser;
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '请提供用户名和密码' });
        }
        demoUser = findDemoUser(username);
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0 && !(demoUser && demoUser.password === password && config.app.demoMode)) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
        if (rows.length === 0 && demoUser && demoUser.password === password && config.app.demoMode) {
            const token = signUser(demoUser);
            setAuthCookie(res, token);
            return res.json({ success: true, demoMode: true, message: '演示模式登录成功', token, user: publicUser(demoUser) });
        }
        const user = rows[0];
        if (user.status && user.status !== 'active') {
            return res.status(403).json({ success: false, message: '账号已被停用' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
        const token = signUser(user);
        setAuthCookie(res, token);
        res.json({ 
            success: true, 
            message: '登录成功', 
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role || 'student' }
        });
    } catch (error) {
        console.error('登录错误:', error);
        const demoUser = findDemoUser(req.body?.username);
        if (demoUser && demoUser.password === req.body?.password) {
            const token = signUser(demoUser);
            setAuthCookie(res, token);
            return res.json({
                success: true,
                demoMode: true,
                message: '演示模式登录成功',
                token,
                user: publicUser(demoUser)
            });
        }
        res.status(500).json({ success: false, message: '服务器错误，演示账号 zhangsan / 123456 可在无数据库时登录' });
    }
});

// 获取当前用户
router.get('/user', authenticateJWT, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, username, name, nickname, email, phone, gender, birthday, bio, interests, avatar, role,
                    study_hours, completed_courses, knowledge_mastery, correct_answers, study_efficiency, continuous_days
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '用户未找到' });
        }
        const user = rows[0];
        let interests = [];
        if (user.interests) {
            try { interests = typeof user.interests === 'string' ? JSON.parse(user.interests) : user.interests; } catch (e) {}
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name || '',
                nickname: user.nickname || user.username,
                email: user.email,
                phone: user.phone || '',
                phoneDisplay: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '',
                gender: user.gender || 'male',
                birthday: user.birthday || '',
                bio: user.bio || '',
                interests,
                avatar: user.avatar || '',
                role: user.role || 'student',
                studyStats: {
                    studyHours: user.study_hours || 0,
                    completedCourses: user.completed_courses || 0,
                    knowledgeMastery: user.knowledge_mastery || 0,
                    correctAnswers: user.correct_answers || 0,
                    studyEfficiency: user.study_efficiency || 0,
                    continuousDays: user.continuous_days || 0
                }
            }
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        const demoUser = findDemoUser(req.user?.id) || findDemoUser(req.user?.username) || demoUsers[0];
        res.json({ success: true, demoMode: true, user: publicUser(demoUser) });
    }
});

// 退出登录
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: '已退出登录' });
});

module.exports = router;
