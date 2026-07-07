/**
 * =============================================================================
 * 错误码常量
 * =============================================================================
 *
 * @file       src/constants/error-codes.js
 * @module     Constants/ErrorCodes
 * @description
 *   系统统一错误码定义。
 *   错误码格式：{模块前缀}_{错误类型}
 *   前端可根据错误码进行差异化处理（如 Token 过期自动跳转登录）。
 *
 *   HTTP 状态码映射（约定）：
 *   - 4xx: 客户端错误（参数、认证、权限）
 *   - 5xx: 服务端错误（数据库、外部服务、内部逻辑）
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块
 *
 * =============================================================================
 */

module.exports = {
  // ========== 通用错误 ==========
  /** 未知错误 */
  UNKNOWN_ERROR: { code: 'UNKNOWN_ERROR', status: 500, message: '未知错误' },

  /** 参数校验失败 */
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400, message: '参数校验失败' },

  /** 资源不存在 */
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: '资源不存在' },

  /** 请求过于频繁 */
  RATE_LIMITED: { code: 'RATE_LIMITED', status: 429, message: '请求过于频繁' },

  // ========== 认证错误 ==========
  /** 未登录 */
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401, message: '未授权，请先登录' },

  /** Token 过期 */
  TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', status: 401, message: 'Token 已过期' },

  /** Token 无效 */
  TOKEN_INVALID: { code: 'TOKEN_INVALID', status: 403, message: 'Token 无效' },

  /** 用户名或密码错误 */
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', status: 401, message: '用户名或密码错误' },

  /** 账号已停用 */
  ACCOUNT_DISABLED: { code: 'ACCOUNT_DISABLED', status: 403, message: '账号已被停用' },

  // ========== 权限错误 ==========
  /** 无权限 */
  FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: '无权限访问' },

  /** 需要教师权限 */
  TEACHER_REQUIRED: { code: 'TEACHER_REQUIRED', status: 403, message: '需要教师权限' },

  /** 需要管理员权限 */
  ADMIN_REQUIRED: { code: 'ADMIN_REQUIRED', status: 403, message: '需要管理员权限' },

  // ========== 数据库错误 ==========
  /** 数据库连接失败 */
  DB_CONNECTION_ERROR: { code: 'DB_CONNECTION_ERROR', status: 500, message: '数据库连接失败' },

  /** 数据库查询失败 */
  DB_QUERY_ERROR: { code: 'DB_QUERY_ERROR', status: 500, message: '数据库查询失败' },

  // ========== AI 服务错误 ==========
  /** LLM 调用失败 */
  LLM_ERROR: { code: 'LLM_ERROR', status: 500, message: 'AI 服务暂时不可用' },

  /** LLM 超时 */
  LLM_TIMEOUT: { code: 'LLM_TIMEOUT', status: 504, message: 'AI 服务响应超时' },

  /** RAG 检索失败 */
  RAG_ERROR: { code: 'RAG_ERROR', status: 500, message: '知识检索服务暂时不可用' },

  /** 嵌入服务失败 */
  EMBEDDING_ERROR: { code: 'EMBEDDING_ERROR', status: 500, message: '向量化服务暂时不可用' },

  // ========== 业务错误 ==========
  /** 用户已存在 */
  USER_EXISTS: { code: 'USER_EXISTS', status: 409, message: '用户名已存在' },

  /** 邮箱已注册 */
  EMAIL_EXISTS: { code: 'EMAIL_EXISTS', status: 409, message: '邮箱已被注册' },

  /** 密码错误 */
  WRONG_PASSWORD: { code: 'WRONG_PASSWORD', status: 400, message: '当前密码错误' },

  /** 考试时间冲突 */
  EXAM_TIME_CONFLICT: { code: 'EXAM_TIME_CONFLICT', status: 409, message: '考试时间冲突' },
};
