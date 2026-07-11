/**
 * =============================================================================
 * SQLite 数据库适配层
 * =============================================================================
 *
 * @file       src/database/sqlite-adapter.js
 * @module     Database/SQLiteAdapter
 * @description
 *   使用 sql.js (纯 JavaScript SQLite 实现) 提供与 mysql2/promise 兼容的
 *   pool.query() 接口。所有 89+ 个业务文件无需修改，只替换 connection.js 即可。
 *
 *   关键设计决策：
 *   - sql.js 是纯 JS 实现，无需 native 编译，兼容 Windows/Linux/macOS
 *   - 数据库文件自动保存在 data/ 目录下
 *   - 自动将 MySQL SQL 语法转换为 SQLite 兼容格式
 *   - 支持参数化查询 (?) 占位符
 *   - 模拟 rows/fields 返回格式，与 mysql2 保持一致
 *   - 数据库自动持久化到磁盘
 *
 * @author     EduSmart Team
 * @since      v2.1.0 - SQLite 迁移
 * @requires   sql.js
 *
 * @example
 *   const pool = require('./sqlite-adapter');
 *   const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [1]);
 *   const [result] = await pool.query('INSERT INTO users SET ?', [{ name: 'test' }]);
 *
 * =============================================================================
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// =============================================================================
// 配置
// =============================================================================

/** 
 * 运行时根目录
 * - 开发模式：项目根目录（edusmart-rebuild/）
 * - pkg打包后：exe所在目录（用户可写）
 */
const isPkg = typeof process.pkg !== 'undefined';
const BASE_DATA_DIR = isPkg 
  ? path.dirname(process.execPath) 
  : path.resolve(__dirname, '..', '..');

/** 
 * 项目根目录（pkg打包后为虚拟文件系统）
 * 用于只读资源（schema等）
 */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/** 数据库文件路径（用户可写） */
const DB_DIR = path.join(BASE_DATA_DIR, 'data');
const DB_PATH = path.join(DB_DIR, 'edu_smart.sqlite');

// =============================================================================
// 内部状态
// =============================================================================

/** @type {import('sql.js').Database|null} */
let db = null;

/** 初始化是否完成 */
let initialized = false;

/** 初始化 Promise（防止并发初始化） */
let initPromise = null;

// =============================================================================
// SQL 转换工具
// =============================================================================

/**
 * 将 MySQL SQL 转换为 SQLite 兼容格式
 *
 * 处理以下差异：
 * - ENGINE=InnoDB / CHARACTER SET / COLLATE → 移除
 * - AUTO_INCREMENT → AUTOINCREMENT
 * - `name` 反引号 → "name" 双引号（或保留，sql.js 兼容反引号）
 * - ON UPDATE CURRENT_TIMESTAMP → 移除（SQLite 不支持）
 * - ENUM → TEXT + CHECK
 * - TINYINT(1) → INTEGER
 * - JSON → TEXT
 * - DATETIME/TIMESTAMP → TEXT (ISO 8601)
 * - DECIMAL(p,s) → REAL
 * - USING BTREE → 移除
 * - ROW_FORMAT = Dynamic → 移除
 * - INSERT IGNORE → INSERT OR IGNORE
 * - SET NAMES / SET FOREIGN_KEY_CHECKS → 移除
 *
 * @param {string} sql - MySQL SQL 语句
 * @returns {string} - SQLite 兼容 SQL
 */
function convertMySQLToSQLite(sql) {
  let converted = sql;

  // ========== 在最开始处理跨行问题 ==========

  // 移除所有 COMMENT（跨行匹配）
  converted = converted.replace(/\s+COMMENT\s+['"].*?['"]/gis, '');

  // 移除 SET 语句（包括同一行的多个SET）
  converted = converted.replace(/SET\s+\w+.*?(?=;)/gi, '');
  converted = converted.replace(/SET\s+\w+.*?;/gi, '');

  // 将 SQL 中的换行符替换为空格（保留语句间的换行）
  converted = converted.replace(/(\S)\s*\n\s*(\S)/g, '$1 $2');

  // 移除 DROP PROCEDURE / CREATE PROCEDURE / delimiter
  converted = converted.replace(/DROP\s+PROCEDURE\s+IF\s+EXISTS\s+`\w+`\s*;/gi, '');
  converted = converted.replace(/delimiter\s*;;/gi, '');
  converted = converted.replace(/delimiter\s*;/gi, '');
  converted = converted.replace(
    /CREATE\s+PROCEDURE\s+`\w+`[\s\S]*?END\s*;;/gi,
    '-- SQLite: PROCEDURE removed'
  );

  // ========== MySQL 函数 → SQLite 函数转换 ==========
  // CURDATE() → DATE('now')
  converted = converted.replace(/\bCURDATE\s*\(\s*\)/gi, "DATE('now')");
  // NOW() → DATETIME('now')
  converted = converted.replace(/\bNOW\s*\(\s*\)/gi, "DATETIME('now')");
  // CURRENT_DATE → DATE('now')
  converted = converted.replace(/\bCURRENT_DATE\b/gi, "DATE('now')");
  // CURRENT_TIMESTAMP → DATETIME('now')
  converted = converted.replace(/\bCURRENT_TIMESTAMP\b/gi, "DATETIME('now')");
  // DATE_ADD(date, INTERVAL 1 DAY) → date + 1
  converted = converted.replace(
    /DATE_ADD\s*\(\s*(\w+)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi,
    '$1 + $2'
  );
  // DATE_SUB(date, INTERVAL 1 DAY) → date - 1
  converted = converted.replace(
    /DATE_SUB\s*\(\s*(\w+)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi,
    '$1 - $2'
  );

  // ========== 移除 SQLite 不支持的语法 ==========
  // ON UPDATE CURRENT_TIMESTAMP
  converted = converted.replace(/ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '');
  // ENGINE=... 和 CHARSET=...
  converted = converted.replace(/ENGINE\s*=\s*\w+\s*/gi, '');
  converted = converted.replace(/CHARSET\s*=\s*\w+\s*/gi, '');

  // ========== 处理 CREATE TABLE 语句：提取内联 INDEX 为独立 CREATE INDEX ==========
  // 匹配每个完整的 CREATE TABLE ... ) 块（支持带或不带反引号、ENGINE等）
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|"|)(\w+)(?:`|"|)\s*\(([\s\S]*?)\)\s*(?:ENGINE\s*=\s*\w+[^;]*)?;/gi;
  const extractedIndexes = [];

  converted = converted.replace(createTableRegex, (match, tableName, body) => {
    return processCreateTableBlock(tableName, body, extractedIndexes);
  });

  // 处理不带ENGINE的CREATE TABLE（动态DDL可能没有ENGINE）
  const createTableRegex2 = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|"|)(\w+)(?:`|"|)\s*\(([\s\S]*?)\);/gi;
  converted = converted.replace(createTableRegex2, (match, tableName, body) => {
    // 如果已经有处理过的痕迹，跳过
    if (match.includes('ENGINE')) return match;
    return processCreateTableBlock(tableName, body, extractedIndexes);
  });

  // 追加提取的索引语句到 SQL 末尾
  if (extractedIndexes.length > 0) {
    converted += '\n-- ===== Extracted Indexes =====\n';
    converted += extractedIndexes.join('\n') + '\n';
  }

  // 替换剩余的反引号为双引号
  converted = converted.replace(/`(\w+)`/g, '"$1"');

  // INSERT IGNORE → INSERT OR IGNORE
  converted = converted.replace(/\bINSERT\s+IGNORE\b/gi, 'INSERT OR IGNORE');

  // 移除 Navicat 注释头
  converted = converted.replace(/\/\*[\s\S]*?\*\//g, '');

  // 清理多余空行
  converted = converted.replace(/\n\s*\n\s*\n/g, '\n\n');
  // 清理多余空格
  converted = converted.replace(/  +/g, ' ');

  return converted.trim();
}

/**
 * 处理单个 CREATE TABLE 块，提取内联 INDEX
 */
function processCreateTableBlock(tableName, body, extractedIndexes) {
  // 先按逗号分割（但要保留括号内的内容）
  const parts = splitColumns(body);
  const columnDefs = [];
  const primaryKeys = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // 检测 PRIMARY KEY 独立定义
    if (/^\s*PRIMARY\s+KEY\s*\(/i.test(trimmed)) {
      // 移除 PRIMARY KEY 中的 USING BTREE
      let cleanPk = trimmed.replace(/\s+USING\s+BTREE/gi, '');
      // 替换反引号
      cleanPk = cleanPk.replace(/`(\w+)`/g, '"$1"');
      primaryKeys.push(cleanPk);
      continue;
    }

    // 检测 INDEX/KEY 定义（MySQL 内联索引）
    const indexMatch = trimmed.match(/^\s*(UNIQUE\s+)?(?:INDEX|KEY)\s+`?(\w+)`?\s*\(([^)]+)\)/i);
    if (indexMatch) {
      const isUnique = !!indexMatch[1];
      const idxName = indexMatch[2];
      const cols = indexMatch[3].split(',').map(c => c.trim().replace(/`/g, ''));
      const uniquePrefix = isUnique ? 'UNIQUE ' : '';
      extractedIndexes.push(
        `CREATE ${uniquePrefix}INDEX "${idxName}" ON "${tableName}" (${cols.map(c => `"${c}"`).join(', ')})`
      );
      continue;
    }

    // 普通列定义或 CONSTRAINT
    columnDefs.push(convertColumnDef(trimmed));
  }

  // 构建 CREATE TABLE 语句
  const allDefs = [...columnDefs, ...primaryKeys];
  return `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${allDefs.join(',\n  ')}\n);`;
}

/**
 * 按逗号分割 CREATE TABLE 的列定义（不分割括号内的逗号）
 */
function splitColumns(body) {
  const parts = [];
  let current = '';
  let depth = 0;

  for (const ch of body) {
    if (ch === '(') {
      depth++;
      current += ch;
    } else if (ch === ')') {
      depth--;
      current += ch;
    } else if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    parts.push(current);
  }

  return parts;
}

/**
 * 转换单个列定义
 */
function convertColumnDef(colDef) {
  let def = colDef;

  // 移除 AUTO_INCREMENT
  def = def.replace(/\bAUTO_INCREMENT\b/gi, '');

  // TINYINT(1) → INTEGER
  def = def.replace(/TINYINT\s*\(\s*1\s*\)/gi, 'INTEGER');
  def = def.replace(/TINYINT\s+UNSIGNED/gi, 'INTEGER');
  def = def.replace(/TINYINT/gi, 'INTEGER');

  // INT → INTEGER
  def = def.replace(/\bINT\b(?!EGER)/gi, 'INTEGER');

  // 移除 UNSIGNED
  def = def.replace(/\bUNSIGNED\b/gi, '');

  // ENUM → TEXT
  def = def.replace(
    /enum\s*\([^)]+\)\s*(CHARACTER\s+SET\s+\w+\s+COLLATE\s+\w+)?/gi,
    'TEXT'
  );

  // JSON → TEXT
  def = def.replace(/\bJSON\b/gi, 'TEXT');

  // DATETIME/TIMESTAMP/DATE → TEXT
  def = def.replace(/\bDATETIME\b/gi, 'TEXT');
  def = def.replace(/\bTIMESTAMP\b/gi, 'TEXT');
  def = def.replace(/\bDATE\b(?!\s*FORMAT)/gi, 'TEXT');

  // DECIMAL(p,s) → REAL
  def = def.replace(/DECIMAL\s*\(\s*\d+\s*,\s*\d+\s*\)/gi, 'REAL');

  // FLOAT/DOUBLE → REAL
  def = def.replace(/\bFLOAT\b/gi, 'REAL');
  def = def.replace(/\bDOUBLE\b/gi, 'REAL');

  // 移除 ON UPDATE CURRENT_TIMESTAMP
  def = def.replace(/ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '');

  // 移除 CHARACTER SET / COLLATE 子句
  def = def.replace(/\s+CHARACTER\s+SET\s+\w+(\s+COLLATE\s+\w+)?/gi, '');

  // 移除 USING BTREE / USING HASH（跨行匹配）
  def = def.replace(/\s+USING\s+BTREE/gi, '');
  def = def.replace(/\s+USING\s+HASH/gi, '');

  // 移除 COMMENT '...'（跨行匹配，支持多行注释）
  def = def.replace(/\s+COMMENT\s+['"].*?['"]/gis, '');

  // 替换反引号
  def = def.replace(/`(\w+)`/g, '"$1"');

  // 清理多余空格
  def = def.replace(/  +/g, ' ').trim();

  return def;
}

/**
 * 转换 MySQL 参数化查询为 SQLite 格式
 *
 * 主要处理：
 * - ? 占位符在 SQLite 中也用 ?（兼容）
 * - INSERT ... SET ? → INSERT INTO ... VALUES (...)
 * - LIMIT ?, ? 语法兼容
 *
 * @param {string} sql - SQL 查询
 * @param {Array} params - 参数数组
 * @returns {{ sql: string, params: Array }} 转换后的查询和参数
 */
function convertQuery(sql, params) {
  let converted = sql;
  let convertedParams = params || [];

  // ========== MySQL 函数 → SQLite 函数转换（SELECT/INSERT/UPDATE 等查询都会用到）==========
  converted = converted.replace(/\bCURDATE\s*\(\s*\)/gi, "DATE('now')");
  converted = converted.replace(/\bNOW\s*\(\s*\)/gi, "DATETIME('now')");
  converted = converted.replace(/\bCURRENT_DATE\b/gi, "DATE('now')");
  converted = converted.replace(/\bCURRENT_TIMESTAMP\b/gi, "DATETIME('now')");
  converted = converted.replace(
    /DATE_ADD\s*\(\s*(\w+)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi,
    '$1 + $2'
  );
  converted = converted.replace(
    /DATE_SUB\s*\(\s*(\w+)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi,
    '$1 - $2'
  );
  converted = converted.replace(/\bRAND\s*\(\s*\)/gi, 'RANDOM()');

  // 处理 INSERT INTO table SET ? 格式（MySQL 特有）
  const setMatch = converted.match(/INSERT\s+INTO\s+`?(\w+)`?\s+SET\s+\?/i);
  if (setMatch) {
    const tableName = setMatch[1];
    const data = convertedParams[0];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const keys = Object.keys(data);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => data[k]);
      converted = `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`;
      convertedParams = values;
    }
  }

  // 处理 INSERT INTO table (cols) VALUES ? 格式（批量插入）
  const valuesMatch = converted.match(
    /INSERT\s+(?:OR\s+IGNORE\s+)?INTO\s+`?(\w+)`?\s*\(([^)]+)\)\s*VALUES\s+\?/i
  );
  if (valuesMatch && Array.isArray(convertedParams[0])) {
    const tableName = valuesMatch[1];
    const cols = valuesMatch[2].split(',').map(c => c.trim().replace(/`/g, ''));
    const rows = convertedParams[0];
    const placeholders = rows
      .map(row => {
        if (Array.isArray(row)) {
          return `(${row.map(() => '?').join(', ')})`;
        }
        return `(${cols.map(() => '?').join(', ')})`;
      })
      .join(', ');
    const flatParams = [];
    rows.forEach(row => {
      if (Array.isArray(row)) {
        flatParams.push(...row);
      } else {
        cols.forEach(col => flatParams.push(row[col]));
      }
    });
    converted = `INSERT INTO "${tableName}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES ${placeholders}`;
    convertedParams = flatParams;
  }

  // 替换表名和列名中的反引号为双引号
  converted = converted.replace(/`(\w+)`/g, '"$1"');

  return { sql: converted, params: convertedParams };
}

// =============================================================================
// 初始化
// =============================================================================

/**
 * 初始化 SQLite 数据库
 *
 * 1. 加载 sql.js WASM
 * 2. 如果数据库文件存在则加载，否则创建新数据库
 * 3. 读取并执行 MySQL schema SQL
 * 4. 启用 WAL 模式提升性能
 *
 * @returns {Promise<void>}
 */
async function initialize() {
  if (initialized) return;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 确保 data 目录存在
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      // 加载 sql.js（显式指定 WASM 路径，兼容 pkg 打包）
      const sqlJsDir = path.dirname(require.resolve('sql.js'));
      const wasmPath = path.join(sqlJsDir, 'sql-wasm.wasm');
      const SQL = await initSqlJs({
        locateFile: () => wasmPath
      });

      // 加载或创建数据库
      if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
        console.log(`[SQLite] 已加载现有数据库: ${DB_PATH}`);

        // 检查是否有表，如果没有则执行schema
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        if (!tables.length || !tables[0].values.length) {
          console.log('[SQLite] 数据库为空，执行schema初始化');
          await loadSchema();
        }
      } else {
        db = new SQL.Database();
        console.log(`[SQLite] 已创建新数据库: ${DB_PATH}`);

        // 首次创建时执行 schema
        await loadSchema();
      }

      // 启用 WAL 模式提升并发性能
      db.run('PRAGMA journal_mode=WAL');
      db.run('PRAGMA foreign_keys=ON');
      db.run('PRAGMA busy_timeout=5000');

      initialized = true;
      console.log('[SQLite] 数据库初始化完成');

      // 定期自动保存到磁盘
      setInterval(() => saveToDisk(), 30000); // 每 30 秒保存一次

    } catch (err) {
      console.error('[SQLite] 初始化失败:', err.message);
      throw err;
    }
  })();

  return initPromise;
}

/**
 * 加载 MySQL schema 并转换为 SQLite 格式执行
 *
 * @returns {Promise<void>}
 */
async function loadSchema() {
  const schemaPath = path.join(PROJECT_ROOT, 'ops', 'database', 'sql', 'edu_smart.sql');

  if (!fs.existsSync(schemaPath)) {
    console.warn(`[SQLite] Schema 文件不存在: ${schemaPath}，跳过初始化`);
    return;
  }

  const mysqlSQL = fs.readFileSync(schemaPath, 'utf8');
  const sqliteSQL = convertMySQLToSQLite(mysqlSQL);

  const statements = sqliteSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let executed = 0;
  let errors = 0;

  for (const stmt of statements) {
    try {
      db.run(stmt + ';');
      executed++;
    } catch (err) {
      if (!err.message.includes('no such table') && !err.message.includes('already exists')) {
        if (errors < 3) {
          console.warn(`[SQLite] Schema 语句执行警告: ${err.message.substring(0, 80)}`);
        }
        errors++;
      }
    }
  }

  console.log(`[SQLite] Schema 加载完成: ${executed} 条语句执行, ${errors} 条跳过`);
  
  // 验证表是否真的被创建了
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  const tableCount = tables.length && tables[0].values ? tables[0].values.length : 0;
  console.log(`[SQLite] 验证: 数据库中共有 ${tableCount} 张表`);
  
  saveToDisk();
}

/**
 * 将数据库保存到磁盘
 */
function saveToDisk() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('[SQLite] 保存数据库失败:', err.message);
  }
}

// =============================================================================
// 公开接口 - 模拟 MySQL pool
// =============================================================================

/**
 * 执行 SQL 查询
 *
 * 模拟 mysql2/promise 的 pool.query() 接口：
 * - 返回 [rows, fields] 数组
 * - rows: 查询结果数组
 * - fields: 列信息数组
 *
 * @param {string} sql - SQL 查询语句
 * @param {Array|Object} [params] - 查询参数
 * @returns {Promise<Array>} [rows, fields]
 *
 * @example
 *   const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [1]);
 *   const [result] = await pool.query('INSERT INTO users SET ?', [{ name: 'test' }]);
 */
async function query(sql, params) {
  await initialize();

  const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);

  try {
    // 判断查询类型
    const trimmed = convertedSql.trim().toUpperCase();

    if (
      trimmed.startsWith('SELECT') ||
      trimmed.startsWith('WITH') ||
      trimmed.startsWith('SHOW') ||
      trimmed.startsWith('DESCRIBE') ||
      trimmed.startsWith('EXPLAIN')
    ) {
      // SELECT 类查询
      return executeSelect(convertedSql, convertedParams);
    } else if (trimmed.startsWith('INSERT')) {
      // INSERT 查询
      return executeInsert(convertedSql, convertedParams);
    } else if (
      trimmed.startsWith('UPDATE') ||
      trimmed.startsWith('DELETE') ||
      trimmed.startsWith('REPLACE')
    ) {
      // UPDATE/DELETE 查询
      return executeUpdate(convertedSql, convertedParams);
    } else if (
      trimmed.startsWith('CREATE') ||
      trimmed.startsWith('ALTER') ||
      trimmed.startsWith('DROP') ||
      trimmed.startsWith('PRAGMA')
    ) {
      // DDL 查询 - 需要额外转换MySQL语法
      const ddlConverted = convertMySQLToSQLite(convertedSql);
      db.run(ddlConverted, convertedParams);
      saveToDisk();
      return [[], []];
    } else if (trimmed.startsWith('SHOW')) {
      // SHOW 语句需要特殊处理
      return handleShowStatement(convertedSql);
    } else {
      // 其他（如 SET、BEGIN、COMMIT 等）
      try {
        db.run(convertedSql, convertedParams);
      } catch (e) {
        // 忽略不支持的语句
      }
      return [[], []];
    }
  } catch (err) {
    // 转换为 mysql2 风格的错误
    const error = new Error(err.message);
    error.code = 'SQLITE_ERROR';
    error.sql = convertedSql;
    error.sqlMessage = err.message;
    throw error;
  }
}

/**
 * 执行 SELECT 类查询
 *
 * @param {string} sql
 * @param {Array} params
 * @returns {[Array, Array]}
 */
function executeSelect(sql, params) {
  // 处理 SHOW 语句
  if (sql.trim().toUpperCase().startsWith('SHOW')) {
    return handleShowStatement(sql);
  }

  // 处理 DESCRIBE 语句
  if (sql.trim().toUpperCase().startsWith('DESCRIBE')) {
    return handleDescribeStatement(sql);
  }

  let stmt;
  try {
    stmt = db.prepare(sql);
    stmt.bind(params);
  } catch (err) {
    // 如果 prepare 失败，尝试直接执行
    const results = [];
    db.each(sql, params, (row) => results.push(row));
    return [results, getFields(results)];
  }

  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();

  const fields = getFields(rows);
  return [rows, fields];
}

/**
 * 执行 INSERT 查询
 *
 * @param {string} sql
 * @param {Array} params
 * @returns {[Object, Array]}
 */
function executeInsert(sql, params) {
  db.run(sql, params);

  // 获取最后插入的 ID
  const lastIdResult = db.exec('SELECT last_insert_rowid() AS insertId');
  const insertId = lastIdResult.length > 0 ? lastIdResult[0].values[0][0] : 0;

  // 获取影响行数
  const changesResult = db.exec('SELECT changes() AS affectedRows');
  const affectedRows = changesResult.length > 0 ? changesResult[0].values[0][0] : 0;

  saveToDisk();

  const result = {
    fieldCount: 0,
    affectedRows: affectedRows,
    insertId: insertId,
    info: '',
    serverStatus: 2,
    warningStatus: 0,
  };

  return [result, []];
}

/**
 * 执行 UPDATE/DELETE 查询
 *
 * @param {string} sql
 * @param {Array} params
 * @returns {[Object, Array]}
 */
function executeUpdate(sql, params) {
  db.run(sql, params);

  const changesResult = db.exec('SELECT changes() AS affectedRows');
  const affectedRows = changesResult.length > 0 ? changesResult[0].values[0][0] : 0;

  saveToDisk();

  const result = {
    fieldCount: 0,
    affectedRows: affectedRows,
    insertId: 0,
    info: '',
    serverStatus: 2,
    warningStatus: 0,
  };

  return [result, []];
}

/**
 * 处理 SHOW 语句（MySQL 特有，模拟常见 SHOW 命令）
 *
 * @param {string} sql
 * @returns {[Array, Array]}
 */
function handleShowStatement(sql) {
  const upper = sql.trim().toUpperCase();

  if (upper.includes('SHOW TABLES')) {
    const result = db.exec(
      "SELECT name AS Tables_in_db FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    const rows = resultToRows(result);
    return [rows, [{ name: 'Tables_in_db' }]];
  }

  if (upper.includes('SHOW COLUMNS') || upper.includes('SHOW FIELDS')) {
    // 提取表名
    const match = sql.match(/FROM\s+["`]?(\w+)["`]?/i);
    if (match) {
      const tableName = match[1];
      const result = db.exec(`PRAGMA table_info("${tableName}")`);
      const raw = resultToRows(result);
      const rows = raw.map(r => ({
        Field: r.name,
        Type: r.type,
        Null: r.notnull === 0 ? 'YES' : 'NO',
        Key: r.pk === 1 ? 'PRI' : '',
        Default: r.dflt_value,
        Extra: '',
      }));
      return [rows, [{ name: 'Field' }, { name: 'Type' }]];
    }
  }

  if (upper.includes('SHOW CREATE TABLE')) {
    const match = sql.match(/TABLE\s+["`]?(\w+)["`]?/i);
    if (match) {
      const tableName = match[1];
      const result = db.exec(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name="${tableName}"`
      );
      const rows = resultToRows(result);
      return [
        [{ 'Create Table': rows[0]?.sql || '' }],
        [{ name: 'Create Table' }],
      ];
    }
  }

  // 其他 SHOW 语句返回空
  return [[], []];
}

/**
 * 处理 DESCRIBE 语句
 */
function handleDescribeStatement(sql) {
  const match = sql.match(/DESCRIBE\s+["`]?(\w+)["`]?/i);
  if (match) {
    const tableName = match[1];
    const result = db.exec(`PRAGMA table_info("${tableName}")`);
    const raw = resultToRows(result);
    const rows = raw.map(r => ({
      Field: r.name,
      Type: r.type,
      Null: r.notnull === 0 ? 'YES' : 'NO',
      Key: r.pk === 1 ? 'PRI' : '',
      Default: r.dflt_value,
      Extra: '',
    }));
    return [rows, []];
  }
  return [[], []];
}

// =============================================================================
// 工具函数
// =============================================================================

/**
 * 将 sql.js exec 结果转换为行数组
 *
 * @param {Array} results - db.exec() 的结果
 * @returns {Array<Object>}
 */
function resultToRows(results) {
  if (!results || results.length === 0) return [];
  const { columns, values } = results[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

/**
 * 从行数据中提取字段信息
 *
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
function getFields(rows) {
  if (!rows || rows.length === 0) return [];
  return Object.keys(rows[0]).map(name => ({ name }));
}

/**
 * 获取数据库连接（模拟 pool.getConnection）
 *
 * @returns {Promise<{query: Function, release: Function}>}
 */
async function getConnection() {
  await initialize();
  return {
    query: async (sql, params) => {
      return query(sql, params);
    },
    release: () => {
      // SQLite 无需释放连接
    },
    beginTransaction: async () => {
      db.run('BEGIN TRANSACTION');
    },
    commit: async () => {
      db.run('COMMIT');
      saveToDisk();
    },
    rollback: async () => {
      db.run('ROLLBACK');
    },
  };
}

/**
 * 健康检查
 *
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  try {
    await initialize();
    db.exec('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * 关闭数据库连接（保存到磁盘）
 */
function close() {
  if (db) {
    saveToDisk();
    db.close();
    db = null;
    initialized = false;
    initPromise = null;
  }
}

// =============================================================================
// 导出 - 模拟 pool 对象
// =============================================================================

const pool = {
  query,
  getConnection,
  healthCheck,
  close,
  // 进程退出时自动保存
  _saveOnExit: () => saveToDisk(),
};

// 进程退出时保存数据库
process.on('exit', () => {
  if (db) {
    try {
      saveToDisk();
    } catch (e) {
      // ignore
    }
  }
});

process.on('SIGINT', () => {
  close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  close();
  process.exit(0);
});

module.exports = pool;
