/**
 * =============================================================================
 * JWT 认证中间件
 * =============================================================================
 *
 * @file       src/middleware/auth.js
 * @module     Middleware/Auth
 * @description
 *   Express 认证中间件集合。
 *   - authenticateJWT: 验证 JWT Token，将解析后的用户信息注入 req.user
 *   - requireTeacher:  校验用户是否为教师/管理员角色
 *
 *   Token 来源优先级：Cookie > Authorization Header (Bearer)
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 src/middleware.js 独立拆分，添加完整注释
 *
 * @requires   jsonwebtoken
 * @requires   ../config     - JWT 配置（secret, expiresIn）
 * @requires   ../database/connection - MySQL 连接池
 *
 * =============================================================================
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../database/connection');

/**
 * 从请求中提取 JWT Token
 *
 * 查找顺序：
 *   1. req.cookies.token（HttpOnly Cookie，推荐）
 *   2. req.headers.authorization（Bearer Token）
 *
 * @param {express.Request} req - Express 请求对象
 * @returns {string} - 提取到的 Token 字符串，未找到则返回空字符串
 * @private
 */
function readToken(req) {
  // 优先从 Cookie 中读取
  if (req.cookies?.token) return req.cookies.token;

  // 其次从 Authorization Header 中读取
  const authorization = req.headers.authorization || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7);

  return '';
}

/**
 * JWT 认证中间件
 *
 * 验证流程：
 *   1. 从请求中提取 Token
 *   2. 使用 JWT_SECRET 验证签名和过期时间
 *   3. 验证通过后将用户信息注入 req.user
 *   4. 验证失败：API 请求返回 401/403，页面请求重定向到首页
 *
 * @param {express.Request}  req  - Express 请求对象
 * @param {express.Response} res  - Express 响应对象
 * @param {express.NextFunction} next - 下一个中间件
 *
 * @example
 *   // 保护 API 路由
 *   router.get('/profile', authenticateJWT, profileHandler);
 *
 *   // 保护页面路由
 *   app.get('/dashboard', authenticateJWT, renderDashboard);
 */
function authenticateJWT(req, res, next) {
  const token = readToken(req);

  // 无 Token：API 返回 401，页面重定向
  if (!token) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ success: false, message: '未授权，请先登录' });
    }
    return res.redirect('/');
  }

  try {
    // 验证 Token 并注入用户信息
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch (error) {
    // Token 无效或过期
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({ success: false, message: 'Token 无效或已过期' });
    }
    return res.redirect('/');
  }
}

/**
 * 教师权限校验中间件
 *
 * 校验流程：
 *   1. 从数据库查询用户角色和状态
 *   2. 检查账号是否处于激活状态
 *   3. 检查角色是否为 teacher 或 admin
 *   4. 演示模式下自动授予教师权限（开发便利）
 *
 * ⚠️ 需要在 authenticateJWT 之后使用，依赖 req.user.id
 *
 * @param {express.Request}  req  - Express 请求对象
 * @param {express.Response} res  - Express 响应对象
 * @param {express.NextFunction} next - 下一个中间件
 *
 * @example
 *   router.get('/teacher/students', authenticateJWT, requireTeacher, listStudents);
 */
async function requireTeacher(req, res, next) {
  try {
    // 查询用户角色和状态
    const [[row]] = await pool.query(
      'SELECT role, status FROM users WHERE id = ? LIMIT 1',
      [req.user?.id]
    );

    // 用户不存在
    if (!row) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    // 账号已停用
    if (row.status && row.status !== 'active') {
      return res.status(403).json({ success: false, message: '账号已被停用' });
    }

    // 角色校验
    if (row.role !== 'teacher' && row.role !== 'admin') {
      return res.status(403).json({ success: false, message: '需要教师或管理员权限' });
    }

    // 注入角色信息，供后续中间件/控制器使用
    req.user.role = row.role;
    next();
  } catch (error) {
    // 演示模式兜底：数据库不可用时自动授予教师权限
    if (config.app.demoMode) {
      req.user.role = req.user.role || 'teacher';
      return next();
    }

    console.error('[Auth] 权限校验失败:', error.message);
    return res.status(500).json({ success: false, message: '权限校验服务异常' });
  }
}

module.exports = { authenticateJWT, requireTeacher };
