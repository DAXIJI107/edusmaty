/**
 * =============================================================================
 * JWT 认证配置
 * =============================================================================
 *
 * @file       src/config/auth.js
 * @module     Config/Auth
 * @description
 *   JSON Web Token (JWT) 认证相关配置。
 *   包括签名密钥、过期时间等安全参数。
 *
 *   ⚠️ 生产环境必须将 JWT_SECRET 设置为高强度随机字符串！
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 *
 * @env JWT_SECRET    - JWT 签名密钥（生产环境必须覆盖）
 * @env JWT_EXPIRES_IN - Token 过期时间（默认 24h）
 *
 * =============================================================================
 */

/**
 * JWT 配置
 *
 * @type {Object}
 * @property {string} secret    - HMAC 签名密钥
 * @property {string} expiresIn - Token 过期时间，格式遵循 vercel/ms 规范
 */
module.exports = {
  /**
   * JWT 签名密钥
   *
   * ⚠️ 安全警告：生产环境必须通过环境变量覆盖此默认值，
   *    推荐使用 openssl rand -base64 64 生成高强度密钥。
   */
  secret:
    process.env.JWT_SECRET ||
    'edusmart_rebuild_local_secret_change_in_production',

  /** Token 过期时间，如 '24h', '7d', '1h' */
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
