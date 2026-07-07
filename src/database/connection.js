/**
 * =============================================================================
 * 数据库连接池（MySQL / SQLite 双模式）
 * =============================================================================
 *
 * @file       src/database/connection.js
 * @module     Database/Connection
 * @description
 *   根据环境变量 DB_TYPE 自动选择数据库驱动：
 *
 *   - DB_TYPE=mysql（默认）：使用 mysql2/promise 连接 MySQL
 *   - DB_TYPE=sqlite：使用 sql.js 内嵌 SQLite，无需安装任何数据库
 *
 *   SQLite 模式下：
 *   - 数据库文件自动保存在 data/edu_smart.sqlite
 *   - 首次启动自动从 ops/database/sql/edu_smart.sql 创建表结构
 *   - 接口与 MySQL 模式完全兼容，业务代码零修改
 *
 *   配置来源：src/config/database.js
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @updated    v2.1.0 - 添加 SQLite 双模式支持
 *
 * @requires   mysql2/promise (MySQL 模式)
 * @requires   ./sqlite-adapter (SQLite 模式)
 *
 * @example
 *   const pool = require('./database/connection');
 *   const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [1]);
 *
 * =============================================================================
 */

const config = require('../config');

/** @type {string} 数据库类型：mysql | sqlite */
const DB_TYPE = (process.env.DB_TYPE || 'mysql').toLowerCase();

/** @type {Object} 数据库连接池实例 */
let pool;

if (DB_TYPE === 'sqlite') {
  // ========== SQLite 模式 ==========
  pool = require('./sqlite-adapter');
  console.log('[DB] 使用 SQLite 数据库（内嵌模式，无需安装数据库）');
} else {
  // ========== MySQL 模式（默认） ==========
  const mysql = require('mysql2/promise');

  pool = mysql.createPool({
    ...config.database,
    connectTimeout: 5000,
    acquireTimeout: 5000,
    waitForConnections: true,
    connectionLimit: config.database.connectionLimit || 10,
    queueLimit: 0,
  });

  /**
   * 连接池健康检查
   *
   * 可用于启动时的数据库连通性验证。
   *
   * @returns {Promise<boolean>} 数据库是否可达
   */
  pool.healthCheck = async () => {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  };

  console.log(`[DB] 使用 MySQL 数据库 (${config.database.host}:3306/${config.database.database})`);
}

module.exports = pool;
