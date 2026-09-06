/**
 * =============================================================================
 * SPA 前端路由
 * =============================================================================
 *
 * @file       src/server/web-routes.js
 * @module     Server/WebRoutes
 * @description
 *   SPA（Single Page Application）前端路由注册。
 *   所有前端页面路径均返回同一个 app.html，由前端 JavaScript 路由接管。
 *
 *   路由策略：
 *   - / 直接返回 SPA 入口
 *   - /home、/profile 等 SPA 路由需要 JWT 认证后返回
 *   - 未匹配的路径：API 返回 404 JSON，其他返回 SPA 入口（支持前端路由）
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 更新引用路径，添加完整注释
 *
 * =============================================================================
 */

const path = require('path');
const { authenticateJWT } = require('../middleware/auth');

/**
 * 需要登录才能访问的 SPA 页面路由列表
 *
 * 这些路径对应前端单页应用的不同视图，
 * 后端统一返回 app.html，前端根据 URL 渲染对应页面。
 *
 * @type {string[]}
 */
const appRoutes = [
  '/home',
  '/profile',
  '/agent-profile',
  '/study-report',
  '/study-plan',
  '/report',
  '/exam',
  '/practice',
  '/test',
  '/online-exam',
  '/daily-challenge',
  '/course',
  '/course-detail',
  '/path',
  '/ai-path',
  '/learning-path',
  '/knowledge-base',
  '/asset',
  '/my-notes',
  '/smart-notes',
  '/account',
  '/me',
  '/teacher-workbench',
  '/teacher',
  '/rag-knowledge',
  '/error-book',
  '/ai-assistant',
  '/agent-research',
  '/code-lab',
  '/team-code',
  '/compiler',
  '/ai-learning',
  '/intelligence',
  '/knowledge-graph',
  '/concept-canvas',
  '/database',
];

/**
 * 注册 SPA 前端路由
 *
 * 注册顺序（Express 按注册顺序匹配）：
 *   1. GET / → SPA 入口（无需登录）
 *   2. GET /html/app.html → SPA 入口（直接访问）
 *   3. GET /{appRoutes} → 需要 JWT 认证后返回 SPA 入口
 *   4. GET /favicon.ico → 返回 204（无内容）
 *   5. 其他 GET 请求 → API 返回 404 JSON，其他返回 SPA 入口
 *
 * @param {express.Application} app    - Express 应用实例
 * @param {string}              appHtml - SPA 入口 HTML 文件路径
 */
function registerWebRoutes(app, appHtml) {
  // HTML 入口禁用缓存：HTML 引用带版本号的 JS，必须每次拿到最新 HTML
  // 否则浏览器缓存旧 HTML 后，JS 版本号升级不会生效（用户永远加载旧脚本）
  const sendAppHtml = (req, res) => {
    res.set('Cache-Control', 'no-store, must-revalidate');
    res.sendFile(appHtml);
  };

  // 首页（无需登录）
  app.get('/', sendAppHtml);

  // 直接访问 HTML 文件
  app.get('/html/app.html', sendAppHtml);

  // SPA 子页面（需要登录）
  appRoutes.forEach((route) => app.get(route, authenticateJWT, sendAppHtml));

  // Favicon（避免不必要的 404 日志）
  app.get('/favicon.ico', (req, res) => res.status(204).end());

  // 404 兜底处理
  app.use((req, res) => {
    // API 请求：返回 JSON 格式的 404
    if (req.originalUrl.startsWith('/api/')) {
      return res
        .status(404)
        .json({ success: false, message: 'API 接口不存在' });
    }

    // 静态资源请求：返回纯文本 404
    if (path.extname(req.path)) {
      return res.status(404).send('Not found');
    }

    // 其他请求：返回 SPA 入口（前端路由接管）
    sendAppHtml(req, res);
  });
}

module.exports = { registerWebRoutes, appRoutes };
