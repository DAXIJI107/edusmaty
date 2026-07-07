/**
 * =============================================================================
 * 系统默认值常量
 * =============================================================================
 *
 * @file       src/constants/defaults.js
 * @module     Constants/Defaults
 * @description
 *   系统级默认值定义。
 *   包括分页默认值、缓存时间、文件大小限制等。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块
 *
 * =============================================================================
 */

module.exports = {
  /** 默认分页大小 */
  PAGE_SIZE: 20,

  /** 最大分页大小（防止恶意请求） */
  MAX_PAGE_SIZE: 200,

  /** 演示账号用户名 */
  DEMO_STUDENT_USERNAME: 'zhangsan',
  DEMO_TEACHER_USERNAME: 'teacher',

  /** 演示账号密码 */
  DEMO_PASSWORD: '123456',

  /** JWT Token 默认过期时间 */
  JWT_EXPIRES_IN: '24h',

  /** 服务默认端口 */
  DEFAULT_PORT: 3020,

  /** 请求体大小限制 */
  BODY_LIMIT: '10mb',

  /** API 速率限制：每分钟最大请求数 */
  RATE_LIMIT_MAX: 100,

  /** API 速率限制：时间窗口（毫秒） */
  RATE_LIMIT_WINDOW_MS: 60 * 1000,

  /** 登录接口速率限制：每分钟最大尝试次数 */
  LOGIN_RATE_LIMIT_MAX: 5,

  /** LLM 默认超时（毫秒） */
  LLM_DEFAULT_TIMEOUT_MS: 60000,

  /** LLM 默认温度 */
  LLM_DEFAULT_TEMPERATURE: 0.4,

  /** LLM 默认最大 Token */
  LLM_DEFAULT_MAX_TOKENS: 2048,

  /** 嵌入计算默认超时（毫秒） */
  EMBEDDING_TIMEOUT_MS: 30000,

  /** 嵌入向量默认维度 */
  EMBEDDING_DIMENSIONS: 768,

  /** ChromaDB 默认超时（毫秒） */
  CHROMA_TIMEOUT_MS: 30000,
};
