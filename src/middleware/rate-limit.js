/**
 * =============================================================================
 * 请求限流中间件
 * =============================================================================
 *
 * @file       src/middleware/rate-limit.js
 * @module     Middleware/RateLimit
 * @description
 *   简单的内存级请求限流中间件。
 *   防止 API 被恶意高频调用，保护后端服务稳定性。
 *
 *   限流策略：基于 IP 的滑动窗口计数，超过阈值返回 429。
 *   ⚠️ 当前为内存实现，重启后计数清零。生产环境建议使用 Redis 实现。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，添加 API 保护能力
 *
 * =============================================================================
 */

/**
 * 默认限流配置
 *
 * @type {Object}
 * @property {number} windowMs - 时间窗口（毫秒），默认 60 秒
 * @property {number} max      - 窗口内最大请求数，默认 100
 */
const DEFAULT_OPTIONS = {
  windowMs: 60 * 1000,  // 1 分钟
  max: 100,              // 每分钟最多 100 次请求
};

/**
 * 内存存储：IP → { count, resetTime }
 *
 * ⚠️ 生产环境建议替换为 Redis：
 *   1. Key: `rate_limit:${ip}`
 *   2. 使用 INCR + EXPIRE 原子操作
 */
const store = new Map();

/**
 * 定期清理过期记录（每 5 分钟）
 * 防止内存无限增长
 *
 * 使用 unref() 避免定时器阻止 Node 进程退出。
 */
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

// 允许 Node 进程在只有此定时器时正常退出
if (cleanupTimer.unref) cleanupTimer.unref();

/**
 * 创建限流中间件
 *
 * @param {Object} [options] - 限流配置选项
 * @param {number} [options.windowMs] - 时间窗口（毫秒）
 * @param {number} [options.max]      - 最大请求数
 * @returns {Function} Express 中间件函数
 *
 * @example
 *   // 全局限流
 *   app.use(rateLimiter());
 *
 *   // 登录接口严格限流
 *   app.use('/api/auth/login', rateLimiter({ windowMs: 60000, max: 5 }));
 */
function rateLimiter(options = {}) {
  const { windowMs, max } = { ...DEFAULT_OPTIONS, ...options };

  return (req, res, next) => {
    // 获取客户端标识（优先 X-Forwarded-For，其次 IP）
    const clientKey =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';

    const now = Date.now();
    let record = store.get(clientKey);

    // 窗口过期：重置计数
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      store.set(clientKey, record);
    }

    // 计数 +1
    record.count++;

    // 设置限流响应头
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader(
      'X-RateLimit-Reset',
      Math.ceil(record.resetTime / 1000)
    );

    // 超限
    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}

module.exports = { rateLimiter };
