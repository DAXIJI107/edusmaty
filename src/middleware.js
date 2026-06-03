const jwt = require('jsonwebtoken');
const config = require('./config');
const pool = require('./db');

function readToken(req) {
    if (req.cookies?.token) return req.cookies.token;
    const authorization = req.headers.authorization || '';
    if (authorization.startsWith('Bearer ')) return authorization.slice(7);
    return '';
}

function authenticateJWT(req, res, next) {
    const token = readToken(req);
    if (!token) {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ success: false, message: '未授权' });
        }
        return res.redirect('/');
    }

    try {
        req.user = jwt.verify(token, config.jwt.secret);
        next();
    } catch (error) {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(403).json({ success: false, message: '无效的token' });
        }
        return res.redirect('/');
    }
}

async function requireTeacher(req, res, next) {
    try {
        const [[row]] = await pool.query('SELECT role, status FROM users WHERE id = ? LIMIT 1', [req.user?.id]);
        if (!row) return res.status(401).json({ success: false, message: '未授权' });
        if (row.status && row.status !== 'active') return res.status(403).json({ success: false, message: '账号已停用' });
        if (row.role !== 'teacher' && row.role !== 'admin') return res.status(403).json({ success: false, message: '需要教师权限' });
        req.user.role = row.role;
        next();
    } catch (error) {
        if (config.app.demoMode) {
            req.user.role = req.user.role || 'teacher';
            return next();
        }
        return res.status(500).json({ success: false, message: '权限校验失败' });
    }
}

module.exports = { authenticateJWT, requireTeacher };
