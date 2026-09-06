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

  // 移除 ON UPDATE CURRENT_TIMESTAMP（必须先于 CURRENT_TIMESTAMP 函数替换，
  // 否则会残留 "ON UPDATE DATETIME('now')" 导致建表失败）
  // 注意：query() 的 convertQuery 会先把 CURRENT_TIMESTAMP 转成 DATETIME('now')，
  // 因此这里需要同时匹配两种形态
  converted = converted.replace(/ON\s+UPDATE\s+(CURRENT_TIMESTAMP|DATETIME\s*\(\s*['"]now['"]\s*\))/gi, '');

  // 移除所有 COMMENT（跨行匹配）
  converted = converted.replace(/\s+COMMENT\s+['"].*?['"]/gis, '');

  // 移除 SET 语句（包括同一行的多个SET）
  converted = converted.replace(/SET\s+\w+.*?(?=;)/gi, '');
  converted = converted.replace(/SET\s+\w+.*?;/gi, '');

  // 合并无意义的换行（保留语句间的换行）。
  // 必须保证注释行独占一行：若把 "-- 注释" 与后续 SQL 合并，注释会吞掉其后的语句。
  const mergedLines = [];
  for (const rawLine of converted.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const isComment = line.startsWith('--') || line.startsWith('/*');
    const prev = mergedLines[mergedLines.length - 1];
    const prevIsComment = prev !== undefined && (prev.startsWith('--') || prev.startsWith('/*'));
    if (!isComment && !prevIsComment && prev !== undefined && !prev.endsWith(';')) {
      mergedLines[mergedLines.length - 1] = prev + ' ' + line;
    } else {
      mergedLines.push(line);
    }
  }
  converted = mergedLines.join('\n');

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
  // DATE_ADD/DATE_SUB(expr, INTERVAL n UNIT) → datetime()/date() 修饰符
  converted = convertDateIntervalArithmetic(converted);

  // ========== 移除 SQLite 不支持的语法 ==========
  // （ON UPDATE CURRENT_TIMESTAMP 已在最开始移除）
  // ALTER TABLE ... ADD COLUMN ... AFTER <col>：SQLite 不支持 AFTER，直接去掉
  converted = converted.replace(
    /(\bADD\s+COLUMN\b[^;]*?)\s+AFTER\s+(`[^`]+`|["\[][^"\]]+["\]]|\w+)/gi,
    '$1'
  );

  // ========== 处理 CREATE TABLE 语句：提取内联 INDEX 为独立 CREATE INDEX ==========
  // 匹配每个完整的 CREATE TABLE ... ) 块（支持带或不带反引号、ENGINE等）
  // 注意：ENGINE 的移除必须放在建表提取之后，否则 "…) ENGINE = …;" 的结尾锚点
  // 会失效，导致语句体越过真实表尾、吞掉后续 INSERT 数据
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|"|)(\w+)(?:`|"|)\s*\(([\s\S]*?)\)\s*(?:ENGINE\s*=\s*\w+[^;]*)?(?=;|$)/gi;
  const extractedIndexes = [];

  converted = converted.replace(createTableRegex, (match, tableName, body) => {
    return processCreateTableBlock(tableName, body, extractedIndexes);
  });

  // 处理不带ENGINE的CREATE TABLE（动态DDL可能没有ENGINE）
  const createTableRegex2 = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|"|)(\w+)(?:`|"|)\s*\(([\s\S]*?)\)\s*(?=;|$)/gi;
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

  // ENGINE=... 和 CHARSET=...（建表提取完成后清理残余）
  converted = converted.replace(/ENGINE\s*=\s*\w+\s*/gi, '');
  converted = converted.replace(/CHARSET\s*=\s*\w+\s*/gi, '');

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
      // 去掉反引号与 ASC/DESC 修饰（SQLite 建索引列名不能带引号内修饰词）
      const cols = indexMatch[3]
        .split(',')
        .map(c => c.trim().replace(/`/g, '').replace(/\s+(ASC|DESC)\s*$/i, ''))
        .filter(Boolean);
      const uniquePrefix = isUnique ? 'UNIQUE ' : '';
      // 语句必须以分号结尾，否则相邻索引语句会被拆分器并成一条
      extractedIndexes.push(
        `CREATE ${uniquePrefix}INDEX IF NOT EXISTS "${idxName}" ON "${tableName}" (${cols.map(c => `"${c}"`).join(', ')});`
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
  // 注意：先还原时间默认值。CURRENT_TIMESTAMP 经全局替换变成 DATETIME('now')/DATE('now')，
  // 若再被映射为 TEXT('now') 会成为非法 DDL；DEFAULT CURRENT_TIMESTAMP 是 SQLite 合法的列默认值
  def = def.replace(/DEFAULT\s+(?:DATETIME|DATE)\(\s*'now'\s*\)/gi, 'DEFAULT CURRENT_TIMESTAMP');
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
 * 按语句分割 SQL（字符串/注释感知）
 *
 * 普通 split(';') 会被字符串字面量中的分号破坏，
 * 且建表语句前的 -- 注释会导致 startsWith('--') 过滤误删整条 DDL。
 * 此拆分器只在字符串字面量与注释之外的 ';' 处分割。
 */
function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += ch;
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      current += ch;
      if (ch === '*' && next === '/') {
        current += next;
        i++;
        inBlockComment = false;
      }
      continue;
    }
    if (inSingle) {
      current += ch;
      // MySQL 反斜杠转义（\' 与 \"）：转义的引号不改变字符串状态
      if (ch === '\\' && next !== undefined) {
        current += next;
        i++;
        continue;
      }
      if (ch === "'") {
        if (next === "'") { current += next; i++; } // 转义 ''
        else inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      current += ch;
      if (ch === '\\' && next !== undefined) {
        current += next;
        i++;
        continue;
      }
      if (ch === '"') {
        if (next === '"') { current += next; i++; }
        else inDouble = false;
      }
      continue;
    }

    if (ch === '-' && next === '-') { inLineComment = true; current += ch; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; current += ch; continue; }
    if (ch === "'") { inSingle = true; current += ch; continue; }
    if (ch === '"') { inDouble = true; current += ch; continue; }
    if (ch === ';') {
      const s = current.trim();
      if (s) statements.push(s);
      current = '';
      continue;
    }
    current += ch;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);

  return statements;
}

/**
 * 预处理单条语句：去掉前导注释行；全为注释则返回空串
 */
function stripLeadingComments(stmt) {
  return stmt
    .replace(/^(?:\s*--[^\n]*\n|\s*\/\*[\s\S]*?\*\/\s*)+/, '')
    .trim();
}

/**
 * DATE_ADD/DATE_SUB(expr, INTERVAL n UNIT) → SQLite datetime()/date() 修饰符
 *
 * 支持：
 * - expr：NOW()/CURDATE() 已先被转换为 DATETIME('now')/DATE('now')，也兼容列名
 * - n：数字字面量或 ? 占位符（占位符转为 '+' || ? || ' unit' 修饰符拼接）
 * - UNIT：SECOND/MINUTE/HOUR/DAY/WEEK/MONTH/YEAR（含复数形式）
 *
 * 时间类单位（HOUR/MINUTE/SECOND）一律用 datetime()；
 * 日期类单位（DAY/WEEK/MONTH/YEAR）在 expr 为 DATE('now') 时用 date()
 * 以保持 YYYY-MM-DD 格式（如 plan_date 等纯日期列的比较与展示），其余用 datetime()。
 */
function convertDateIntervalArithmetic(sql) {
  return sql.replace(
    /\b(DATE_ADD|DATE_SUB)\s*\(\s*([\s\S]+?)\s*,\s*INTERVAL\s+(\?|\d+)\s+(SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR)S?\s*\)/gi,
    (match, fn, expr, amount, unit) => {
      const sign = /^DATE_SUB$/i.test(fn) ? '-' : '+';
      const unitLower = unit.toLowerCase();
      const isTimeUnit = ['second', 'minute', 'hour'].includes(unitLower);
      const func = !isTimeUnit && /DATE\(\s*'now'\s*\)/i.test(expr) ? 'date' : 'datetime';
      const modifier = amount === '?'
        ? `'${sign}' || ? || ' ${unitLower}'`
        : `'${sign}${amount} ${unitLower}'`;
      return `${func}(${expr}, ${modifier})`;
    }
  );
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
  // CHAR_LENGTH → LENGTH（SQLite 的 LENGTH 对文本返回字符数，语义与 MySQL CHAR_LENGTH 一致）
  converted = converted.replace(/\bCHAR_LENGTH\s*\(/gi, 'LENGTH(');
  // FIELD(expr, v1, v2, ..., vN) → CASE expr WHEN v1 THEN 1 ... WHEN vN THEN N ELSE N+1 END
  // （MySQL 自定义排序函数，SQLite 无对应函数；参数按顶层逗号切分，兼容引号内逗号）
  converted = converted.replace(/\bFIELD\s*\(([^()]*)\)/gi, (match, args) => {
    const parts = [];
    let cur = '', inQuote = null;
    for (let i = 0; i < args.length; i++) {
      const ch = args[i];
      if ((ch === "'" || ch === '"' || ch === '`') && args[i - 1] !== '\\') {
        if (inQuote === ch) inQuote = null;
        else if (!inQuote) inQuote = ch;
        cur += ch;
      } else if (ch === ',' && !inQuote) {
        parts.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.trim()) parts.push(cur.trim());
    if (parts.length < 2) return match;
    const expr = parts[0];
    const whens = parts.slice(1).map((v, i) => `WHEN ${v} THEN ${i + 1}`).join(' ');
    return `(CASE ${expr} ${whens} ELSE ${parts.length} END)`;
  });
  converted = convertDateIntervalArithmetic(converted);
  converted = converted.replace(/\bRAND\s*\(\s*\)/gi, 'RANDOM()');

  // ========== MySQL upsert → SQLite upsert ==========
  // INSERT ... ON DUPLICATE KEY UPDATE col = VALUES(col)
  //   → INSERT ... ON CONFLICT DO UPDATE SET col = excluded.col
  if (/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i.test(converted)) {
    converted = converted.replace(/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/gi, 'ON CONFLICT DO UPDATE SET');
    // VALUES(col) → excluded.col（仅匹配标识符参数，不影响 INSERT 的 VALUES (?, ?) 占位符）
    converted = converted.replace(/\bVALUES\s*\(\s*([a-zA-Z_]\w*)\s*\)/g, 'excluded.$1');
  }

  // ========== MySQL LEAST/GREATEST → SQLite min/max（任意语句通用）==========
  // SQLite 多参数 min/max 即 LEAST/GREATEST 语义
  converted = converted.replace(/\bGREATEST\s*\(/gi, 'max(');
  converted = converted.replace(/\bLEAST\s*\(/gi, 'min(');

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

  // 展开 SELECT 中的 IN (?) 数组参数（mysql2 兼容：数组参数自动展开为 IN (?, ?, ...)）
  if (Array.isArray(convertedParams) && convertedParams.some(p => Array.isArray(p))) {
    const tokens = converted.split('?');
    let out = tokens[0];
    const flatParams = [];
    let paramIdx = 0;
    for (let i = 1; i < tokens.length; i++) {
      const param = convertedParams[paramIdx++];
      const prevToken = tokens[i - 1];
      if (Array.isArray(param) && /\bIN\s*\(\s*$/i.test(prevToken) && /^\s*\)/.test(tokens[i])) {
        out += param.map(() => '?').join(', ') + tokens[i];
        flatParams.push(...param);
      } else {
        out += '?' + tokens[i];
        flatParams.push(param);
      }
    }
    converted = out;
    convertedParams = flatParams;
  }

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
        } else {
          // 非空库也需要增量同步：schema 可能随代码更新新增表/列
          console.log('[SQLite] 已加载现有数据库，执行 schema 增量同步');
          await syncSchema();
        }

        // 补充应用代码直接查询、但 edu_smart.sql 未定义的表
        await ensureAppTables();
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

  const statements = splitSqlStatements(sqliteSQL)
    .map(stripLeadingComments)
    .filter(s => s.length > 0);

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

  // 如果没有表或关键表缺失，强制 bootstrap
  if (tableCount === 0) {
    console.warn('[SQLite] 没有找到任何表，执行强制 bootstrap');
    await bootstrapEssentialTables();
  } else {
    // 检查关键表是否存在
    const tableNames = tables[0].values.map(r => r[0]);
    const needed = ['users'];
    for (const t of needed) {
      if (!tableNames.includes(t)) {
        console.warn(`[SQLite] 关键表 ${t} 缺失，补充创建`);
      }
    }
    if (!tableNames.includes('users')) {
      await bootstrapEssentialTables();
    }
  }

  // 确保 admin 用户存在
  await ensureAdminUser();

  saveToDisk();
}

/**
 * 对非空数据库执行 schema 增量同步（幂等）
 *
 * 1. 重新执行全部转换后的 DDL（CREATE TABLE IF NOT EXISTS，已存在的表自动跳过）
 * 2. 为已存在的表补齐 schema 中新增的列（ALTER TABLE ADD COLUMN）
 *
 * 与 loadSchema 的区别：不执行 bootstrap/ensureAdmin，可安全地在每次启动时调用
 */
async function syncSchema() {
  const schemaPath = path.join(PROJECT_ROOT, 'ops', 'database', 'sql', 'edu_smart.sql');

  if (!fs.existsSync(schemaPath)) {
    console.warn('[SQLite] Schema 文件不存在，跳过增量同步');
    return;
  }

  const mysqlSQL = fs.readFileSync(schemaPath, 'utf8');
  const sqliteSQL = convertMySQLToSQLite(mysqlSQL);

  const statements = splitSqlStatements(sqliteSQL)
    .map(stripLeadingComments)
    .filter(s => s.length > 0);

  let executed = 0;
  let errors = 0;
  let columnsAdded = 0;

  for (let stmt of statements) {
    // 增量同步绝不执行 DROP，防止清空现有表数据
    if (/^DROP\b/i.test(stmt)) {
      continue;
    }
    // 增量同步绝不执行 INSERT/REPLACE/UPDATE/DELETE，防止覆盖运行时数据
    if (/^(INSERT|REPLACE|UPDATE|DELETE)\b/i.test(stmt)) {
      continue;
    }
    // 索引语句改为幂等形式，避免重复创建报错
    stmt = stmt.replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+(?!IF\s+NOT\s+EXISTS)/i, 'CREATE $1INDEX IF NOT EXISTS ');
    try {
      db.run(stmt + ';');
      executed++;
    } catch (err) {
      if (errors < 3) {
        console.warn(`[SQLite] Schema 同步警告: ${err.message.substring(0, 80)}`);
      }
      errors++;
    }
  }

  // 为已存在的表补齐缺失列
  for (const stmt of statements) {
    columnsAdded += await addMissingColumnsFromDDL(stmt);
  }

  console.log(`[SQLite] Schema 增量同步完成: ${executed} 条语句执行, 新增列 ${columnsAdded} 个, 跳过 ${errors} 条`);
  saveToDisk();
}

/**
 * 从 CREATE TABLE DDL 语句中为已存在的表补齐缺失列
 *
 * @param {string} stmt - 形如 CREATE TABLE IF NOT EXISTS "name" (...) 的语句
 * @returns {Promise<number>} 实际新增的列数
 */
async function addMissingColumnsFromDDL(stmt) {
  const tableMatch = stmt.match(/^CREATE TABLE IF NOT EXISTS\s+"(\w+)"\s*\(/i);
  if (!tableMatch) return 0;
  const tableName = tableMatch[1];

  let colsRes;
  try {
    colsRes = db.exec(`PRAGMA table_info("${tableName}")`);
  } catch (err) {
    return 0;
  }
  // 表不存在则跳过（新建表已包含全部列）
  if (!colsRes.length || !colsRes[0].values.length) return 0;

  const existingCols = new Set(colsRes[0].values.map(v => String(v[1]).toLowerCase()));

  const body = stmt.slice(stmt.indexOf('(') + 1, stmt.lastIndexOf(')'));
  let columnsAdded = 0;
  for (const rawDef of splitColumns(body)) {
    const def = rawDef.trim();
    if (!def) continue;

    const colMatch = def.match(/^"?(\w+)"?\s*([\s\S]*)$/);
    if (!colMatch) continue;
    const colName = colMatch[1];
    const rest = colMatch[2].trim();

    // 跳过表级约束（PRIMARY KEY(...)、CONSTRAINT ... 等）
    if (/^(PRIMARY|UNIQUE|CHECK|FOREIGN|CONSTRAINT|INDEX|KEY)\b/i.test(colName)) continue;
    if (existingCols.has(colName.toLowerCase())) continue;

    // SQLite ADD COLUMN 不允许 PRIMARY KEY/UNIQUE/NOT NULL(无默认)/表达式默认值
    // 因此只保留类型与常量 DEFAULT
    const typeMatch = rest.match(/^(\w+)/);
    const colType = typeMatch ? typeMatch[1] : 'TEXT';
    let ddl = `ALTER TABLE "${tableName}" ADD COLUMN "${colName}" ${colType}`;

    const defaultMatch = rest.match(/DEFAULT\s+('(?:[^']|'')*'|[\w.+-]+)/i);
    if (defaultMatch) {
      const dv = defaultMatch[1];
      const isDynamicDefault = /^(CURRENT_TIME|CURRENT_DATE|CURRENT_TIMESTAMP)$/i.test(dv);
      if (!isDynamicDefault && !dv.startsWith('(')) {
        ddl += ` DEFAULT ${dv}`;
      }
    }

    try {
      db.run(ddl);
      columnsAdded++;
    } catch (err) {
      console.warn(`[SQLite] 补列失败 ${tableName}.${colName}: ${err.message.substring(0, 60)}`);
    }
  }
  return columnsAdded;
}

/**
 * 应用层补充表
 *
 * 这些表由应用代码直接读写，但 ops/database/sql/edu_smart.sql 中没有定义，
 * 其 DDL 仅存在于 scripts/rebuild-database.js（破坏性重建脚本，不能在启动时执行）。
 * 此处运行时提取该脚本中的 CREATE TABLE 语句，以幂等方式补齐缺失的表。
 */
async function ensureAppTables() {
  const rebuildScriptPath = path.join(PROJECT_ROOT, 'scripts', 'rebuild-database.js');
  if (!fs.existsSync(rebuildScriptPath)) return;

  const scriptText = fs.readFileSync(rebuildScriptPath, 'utf8');
  const blocks = [...scriptText.matchAll(/CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\n\s*\);/g)];
  if (!blocks.length) return;

  let created = 0;
  const names = [];
  for (const [, name, rawBody] of blocks) {
    try {
      const exists = db.exec(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`
      );
      const tableExists = exists.length && exists[0].values.length > 0;

      // 去掉外键约束：SQLite 外键开启后，缺少父表数据会导致应用写入失败
      const body = rawBody
        .split('\n')
        .filter(line => !/^\s*(FOREIGN KEY|CONSTRAINT)\b/i.test(line))
        .join('\n')
        .replace(/,(\s*)$/, '$1');

      // 结尾必须有分号，否则 convertMySQLToSQLite 的建表正则匹配不到、
      // MySQL 语法会原样透传给 SQLite
      const converted = convertMySQLToSQLite(`CREATE TABLE IF NOT EXISTS ${name} (${body});`);

      if (tableExists) {
        // 表已存在（可能来自旧版 edu_smart.sql，结构较旧）：补齐应用需要的缺失列
        await addMissingColumnsFromDDL(converted.replace(/;$/, ''));
      } else {
        db.run(converted);
        created++;
        names.push(name);
      }
    } catch (err) {
      console.warn(`[SQLite] 应用表 ${name} 创建失败: ${err.message.substring(0, 80)}`);
    }
  }
  if (created > 0) {
    console.log(`[SQLite] 应用补充表创建完成: ${created} 张 (${names.join(', ')})`);
    saveToDisk();
  }
}

/**
 * 强制创建关键表（schema 加载失败时的保底方案）
 */
async function bootstrapEssentialTables() {
  const essentialSQL = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      phone TEXT,
      password TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'student',
      status TEXT DEFAULT 'active',
      points INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak_days INTEGER DEFAULT 0,
      last_active_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      icon TEXT,
      color TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      title TEXT NOT NULL,
      content TEXT,
      problem_type TEXT DEFAULT 'choice',
      difficulty INTEGER DEFAULT 1,
      options TEXT,
      correct_answer TEXT,
      explanation TEXT,
      points INTEGER DEFAULT 10,
      tags TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS user_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      problem_id INTEGER,
      answer TEXT,
      is_correct INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS study_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject_id INTEGER,
      study_date TEXT,
      duration INTEGER DEFAULT 0,
      xp_earned INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      subject_id INTEGER,
      model TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER,
      role TEXT,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ];

  for (const sql of essentialSQL) {
    try {
      db.run(sql);
      console.log(`  [BOOTSTRAP] Created table`);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.warn(`  [BOOTSTRAP] Warning: ${err.message.substring(0, 80)}`);
      }
    }
  }
  console.log('[SQLite] Bootstrap essential tables done');
}

/**
 * 确保 admin 用户存在（默认密码 123456）
 */
async function ensureAdminUser() {
  try {
    const result = db.exec("SELECT id FROM users WHERE username = 'admin'");
    if (!result.length || !result[0].values.length) {
      // 使用 bcryptjs hash "123456"
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('123456', 10);
      db.run(
        `INSERT INTO users (username, password, nickname, role, status) VALUES ('admin', ?, 'EduSmart管理员', 'admin', 'active')`,
        [hash]
      );
      console.log('[SQLite] Created default admin user (password: 123456)');
    } else {
      console.log('[SQLite] admin user exists');
    }
  } catch (err) {
    console.warn(`[SQLite] ensureAdminUser: ${err.message}`);
  }
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
    } else if (trimmed.startsWith('PRAGMA')) {
      // PRAGMA：有结果集的（如 table_info / table_list）必须返回行，set/get 类执行即可
      try {
        const pragmaRes = db.exec(convertedSql);
        if (pragmaRes && pragmaRes.length && pragmaRes[0].columns && pragmaRes[0].columns.length) {
          const pragmaRows = pragmaRes[0].values.map(vals => {
            const obj = {};
            pragmaRes[0].columns.forEach((c, i) => { obj[c] = vals[i]; });
            return obj;
          });
          return [pragmaRows, pragmaRes[0].columns.map(c => ({ name: c }))];
        }
      } catch (pragmaErr) {
        // exec 失败时退回 run
      }
      db.run(convertedSql, convertedParams);
      return [[], []];
    } else if (
      trimmed.startsWith('CREATE') ||
      trimmed.startsWith('ALTER') ||
      trimmed.startsWith('DROP')
    ) {
      // DDL 查询 - 需要额外转换MySQL语法
      const ddlConverted = convertMySQLToSQLite(convertedSql);
      // 转换可能产出多条语句（如 MySQL 内联 INDEX 被拆成独立 CREATE INDEX），
      // 而 db.run 只执行第一条，必须拆分后逐条执行
      const ddlStatements = splitSqlStatements(ddlConverted)
        .map(stripLeadingComments)
        .filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));
      for (const stmt of ddlStatements) {
        db.run(stmt + ';', convertedParams);
      }
      saveToDisk();
      return [[], []];
    } else if (trimmed.startsWith('SHOW')) {
      // SHOW 语句需要特殊处理
      return handleShowStatement(convertedSql, convertedParams);
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
    return handleShowStatement(sql, params);
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
function handleShowStatement(sql, params) {
  const upper = sql.trim().toUpperCase();

  if (upper.includes('SHOW TABLES')) {
    const result = db.exec(
      "SELECT name AS Tables_in_db FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    let rows = resultToRows(result);

    // 支持 MySQL 的 LIKE 过滤（SHOW TABLES LIKE 'name' / LIKE ?）
    // 业务代码（tableExists 等）依赖此语义判断表是否存在
    const likeMatch = sql.match(/\bLIKE\s+(?:\?|'((?:[^']|'')*)')/i);
    if (likeMatch) {
      const pattern = likeMatch[1] !== undefined ? likeMatch[1] : String(params?.[0] ?? '');
      if (pattern) {
        const regexStr = pattern
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/%/g, '.*')
          .replace(/_/g, '.');
        const re = new RegExp(`^${regexStr}$`, 'i');
        rows = rows.filter(r => re.test(r.Tables_in_db));
      }
    }

    return [rows, [{ name: 'Tables_in_db' }]];
  }

  if (upper.includes('SHOW COLUMNS') || upper.includes('SHOW FIELDS')) {
    // 提取表名
    const match = sql.match(/FROM\s+["`]?(\w+)["`]?/i);
    if (match) {
      const tableName = match[1];
      const result = db.exec(`PRAGMA table_info("${tableName}")`);
      const raw = resultToRows(result);
      let rows = raw.map(r => ({
        Field: r.name,
        Type: r.type,
        Null: r.notnull === 0 ? 'YES' : 'NO',
        Key: r.pk === 1 ? 'PRI' : '',
        Default: r.dflt_value,
        Extra: '',
      }));

      // 支持 MySQL 的 LIKE 过滤（SHOW COLUMNS FROM t LIKE 'col' / LIKE ?）
      // 业务代码（ensureSchema/addColumn 等）依赖此语义判断列是否存在
      const likeMatch = sql.match(/\bLIKE\s+(?:\?|'((?:[^']|'')*)')/i);
      if (likeMatch) {
        const pattern = likeMatch[1] !== undefined ? likeMatch[1] : String(params?.[0] ?? '');
        if (pattern) {
          const regexStr = pattern
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/%/g, '.*')
            .replace(/_/g, '.');
          const re = new RegExp(`^${regexStr}$`, 'i');
          rows = rows.filter(r => re.test(r.Field));
        }
      }

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

// 内部工具导出（仅供诊断/脚本复用，不参与运行时查询）
module.exports._internals = {
  convertMySQLToSQLite,
  splitSqlStatements,
  stripLeadingComments,
  splitColumns,
  convertColumnDef
};
