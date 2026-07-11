/**
 * =============================================================================
 * 应用基础配置
 * =============================================================================
 *
 * @file       src/config/app.js
 * @module     Config/App
 * @description
 *   应用级别的全局配置，包括应用名称、运行模式等。
 *   demoMode 为 true 时启用演示模式，允许免数据库访问。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 *
 * @env DEMO_MODE - 是否启用演示模式（默认 false）
 *
 * =============================================================================
 */

const bool = (value) => String(value || '').toLowerCase() === 'true';

/**
 * 应用基础配置
 *
 * @type {Object}
 * @property {string}  name     - 应用名称
 * @property {boolean} demoMode - 演示模式开关
 */
module.exports = {
  /** 应用名称，用于日志和响应头 */
  name: 'EduSmart',

  /**
   * 演示模式开关
   * - true: 启用演示模式，使用内置演示账号，部分功能免数据库
   * - false: 正常模式，需要完整数据库支持
   */
  demoMode: bool(process.env.DEMO_MODE || 'false'),
};
