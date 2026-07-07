/**
 * =============================================================================
 * 数据库连接配置
 * =============================================================================
 *
 * @file       src/config/database.js
 * @module     Config/Database
 * @description
 *   数据库连接池配置，根据 DB_TYPE 切换驱动：
 *
 *   - DB_TYPE=mysql（默认）：使用 mysql2/promise，需配置 MySQL 连接信息
 *   - DB_TYPE=sqlite：使用 sql.js 内嵌 SQLite，数据库文件在 data/edu_smart.sqlite
 *                     无需安装任何数据库，适合打包为 .exe 分发
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 * @updated    v2.1.0 - 添加 SQLite 双模式支持
 *
 * @env DB_TYPE       - 数据库类型：mysql | sqlite（默认 mysql）
 * @env DB_HOST       - MySQL 主机地址（默认 localhost）
 * @env DB_USER       - MySQL 用户名（默认 root）
 * @env DB_PASSWORD   - MySQL 密码（默认 123456）
 * @env DB_NAME       - MySQL 数据库名（默认 edu_smart）
 * @env DB_POOL_LIMIT - 连接池最大连接数（默认 10）
 *
 * =============================================================================
 */

/**
 * MySQL 连接池配置
 *
 * @type {Object}
 * @property {string}  host              - 主机地址
 * @property {string}  user              - 用户名
 * @property {string}  password          - 密码
 * @property {string}  database          - 数据库名
 * @property {boolean} waitForConnections - 连接池满时是否排队等待
 * @property {number}  connectionLimit   - 最大连接数
 * @property {number}  queueLimit        - 排队上限（0 = 无限制）
 */
module.exports = {
  /** 数据库主机地址 */
  host: process.env.DB_HOST || 'localhost',

  /** 数据库登录用户名 */
  user: process.env.DB_USER || 'root',

  /** 数据库登录密码 */
  password: process.env.DB_PASSWORD || '123456',

  /** 目标数据库名称 */
  database: process.env.DB_NAME || 'edu_smart',

  /** 连接池满时是否等待（推荐 true，避免拒绝连接） */
  waitForConnections: true,

  /** 连接池最大连接数 */
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),

  /** 连接排队上限，0 表示无限制 */
  queueLimit: 0,
};
