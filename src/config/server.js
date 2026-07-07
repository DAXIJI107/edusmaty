/**
 * =============================================================================
 * 服务器配置
 * =============================================================================
 *
 * @file       src/config/server.js
 * @module     Config/Server
 * @description
 *   Express 服务器运行配置，包括监听端口、CORS 跨域策略等。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 *
 * @env PORT        - 服务监听端口（默认 3020）
 * @env CORS_ORIGIN - 允许跨域的源地址（默认 http://localhost:3020）
 *
 * =============================================================================
 */

/**
 * 服务器配置
 *
 * @type {Object}
 * @property {number} port       - 监听端口
 * @property {string} corsOrigin - CORS 允许的源
 */
module.exports = {
  /** HTTP 服务监听端口，默认 3020 */
  port: Number(process.env.PORT || 3020),

  /** CORS 跨域白名单，支持 credentials 模式 */
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3020',
};
