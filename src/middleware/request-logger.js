/**
 * =============================================================================
 * 请求日志中间件
 * =============================================================================
 *
 * @file       src/middleware/request-logger.js
 * @module     Middleware/RequestLogger
 * @description
 *   HTTP 请求日志记录中间件。
 *   记录每个请求的方法、路径、状态码和响应时间，便于调试和监控。
 *
 *   日志格式：[HTTP] 2026-06-27T19:00:00.000Z GET /api/health 200 12ms
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，添加请求追踪能力
 *
 * =============================================================================
 */

/**
 * 请求日志中间件
 *
 * 使用 res.on('finish') 事件确保在响应发送后再记录日志，
 * 这样可以准确记录 HTTP 状态码和响应时间。
 *
 * @param {express.Request}  req  - Express 请求对象
 * @param {express.Response} res  - Express 响应对象
 * @param {express.NextFunction} next - 下一个中间件
 *
 * @example
 *   // 在 app.js 中尽早注册
 *   app.use(requestLogger);
 */
function requestLogger(req, res, next) {
  // 记录请求开始时间
  const startTime = Date.now();

  // 在响应完成后记录日志
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // 跳过静态资源请求的日志（减少噪音）
    if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/images/')) {
      return;
    }

    console.log(
      `[HTTP] ${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}

module.exports = { requestLogger };
