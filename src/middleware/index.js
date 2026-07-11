/**
 * =============================================================================
 * 中间件聚合注册入口
 * =============================================================================
 *
 * @file       src/middleware/index.js
 * @module     Middleware
 * @description
 *   集中导出所有 Express 中间件，方便 app.js 统一引用。
 *   新增中间件只需在此文件中添加导出即可。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从单体 middleware.js 拆分为模块化中间件体系
 *
 * @example
 *   const { authenticateJWT, requireTeacher, errorHandler } = require('./middleware');
 *   app.use('/api/admin', authenticateJWT, requireTeacher);
 *
 * =============================================================================
 */

const { authenticateJWT, requireTeacher } = require('./auth');
const { errorHandler } = require('./error-handler');
const { requestLogger } = require('./request-logger');
const { rateLimiter } = require('./rate-limit');
const { validate } = require('./validate');

module.exports = {
  // 认证中间件
  authenticateJWT,
  requireTeacher,

  // 通用中间件
  errorHandler,
  requestLogger,
  rateLimiter,
  validate,
};
