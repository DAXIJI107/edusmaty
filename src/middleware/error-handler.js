/**
 * =============================================================================
 * 全局错误处理中间件
 * =============================================================================
 *
 * @file       src/middleware/error-handler.js
 * @module     Middleware/ErrorHandler
 * @description
 *   Express 全局错误处理中间件。
 *   捕获所有未处理的异常，统一返回标准 JSON 格式的错误响应。
 *   必须在所有路由注册之后使用（Express 错误处理中间件特性）。
 *
 *   错误响应格式：
 *   {
 *     "success": false,
 *     "message": "错误描述",
 *     "error": { "code": "ERROR_CODE", "detail": "..." }  // 仅开发模式
 *   }
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，规范全局错误处理
 *
 * =============================================================================
 */

const config = require('../config');

/**
 * 全局错误处理中间件
 *
 * Express 要求错误处理中间件必须有 4 个参数 (err, req, res, next)，
 * 这样 Express 才能识别这是一个错误处理器。
 *
 * @param {Error}              err  - 捕获的错误对象
 * @param {express.Request}    req  - Express 请求对象
 * @param {express.Response}   res  - Express 响应对象
 * @param {express.NextFunction} next - 下一个中间件（保留用于 Express 识别）
 *
 * @example
 *   // 在 app.js 中注册（必须在所有路由之后）
 *   app.use(errorHandler);
 */
function errorHandler(err, req, res, next) {
  // 记录错误日志（生产环境建议接入日志系统）
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  // 根据请求类型返回不同格式
  if (req.originalUrl.startsWith('/api/')) {
    // API 请求：返回 JSON
    const statusCode = err.statusCode || 500;
    const response = {
      success: false,
      message: err.message || '服务器内部错误',
    };

    // 开发/演示模式下返回详细错误信息
    if (config.app.demoMode || process.env.NODE_ENV !== 'production') {
      response.error = {
        code: err.code || 'INTERNAL_ERROR',
        detail: err.stack?.split('\n')[0] || err.message,
      };
    }

    return res.status(statusCode).json(response);
  }

  // 页面请求：返回错误页面或重定向
  return res.status(500).send('服务器内部错误，请稍后重试');
}

module.exports = { errorHandler };
