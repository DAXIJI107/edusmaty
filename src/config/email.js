/**
 * =============================================================================
 * 邮件发送配置
 * =============================================================================
 *
 * @file       src/config/email.js
 * @module     Config/Email
 * @description
 *   邮件发送服务配置，用于系统通知、每日知识推送等场景。
 *   默认使用 QQ 邮箱 SMTP，生产环境建议替换为企业邮箱或 SendGrid 等服务。
 *
 *   ⚠️ QQ 邮箱发件需先在 QQ 邮箱设置中开启 SMTP 服务，
 *      并使用"授权码"作为 SMTP_PASSWORD，而非 QQ 密码。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 *
 * @env EMAIL_PROVIDER - 邮件服务提供商（默认 smtp）
 * @env EMAIL_FROM     - 发件人地址（格式：名称 <邮箱>）
 * @env SMTP_HOST      - SMTP 服务器地址
 * @env SMTP_PORT      - SMTP 端口（465 SSL / 587 TLS）
 * @env SMTP_SECURE    - 是否使用 SSL
 * @env SMTP_USER      - SMTP 登录用户名
 * @env SMTP_PASSWORD  - SMTP 密码/授权码
 *
 * =============================================================================
 */

const bool = (value) => String(value || '').toLowerCase() === 'true';

/**
 * 邮件配置
 *
 * @type {Object}
 * @property {string}  provider - 邮件服务提供商
 * @property {string}  from     - 发件人地址
 * @property {string}  host     - SMTP 服务器
 * @property {number}  port     - SMTP 端口
 * @property {boolean} secure   - 是否使用 SSL/TLS
 * @property {string}  user     - 认证用户名
 * @property {string}  password - 认证密码/授权码
 */
module.exports = {
  /** 邮件提供商，当前为 SMTP */
  provider: process.env.EMAIL_PROVIDER || 'smtp',

  /** 发件人显示名称和邮箱 */
  from: process.env.EMAIL_FROM || 'EduSmart <noreply@edusmart.com>',

  /** SMTP 服务器地址 */
  host: process.env.SMTP_HOST || 'smtp.qq.com',

  /** SMTP 端口：465 (SSL) 或 587 (STARTTLS) */
  port: Number(process.env.SMTP_PORT || 465),

  /** 是否使用 SSL 加密连接 */
  secure: bool(process.env.SMTP_SECURE || 'true'),

  /** SMTP 认证用户名（通常与发件邮箱相同） */
  user: process.env.SMTP_USER || '',

  /**
   * SMTP 密码
   *
   * ⚠️ QQ 邮箱用户：此处应填写"授权码"而非 QQ 密码。
   *    获取路径：QQ邮箱 → 设置 → 账户 → POP3/SMTP服务 → 生成授权码
   */
  password: process.env.SMTP_PASSWORD || '',
};
