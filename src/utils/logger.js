/**
 * =============================================================================
 * 日志工具
 * =============================================================================
 *
 * @file       src/utils/logger.js
 * @module     Utils/Logger
 * @description
 *   统一日志输出工具。
 *   提供分级日志（info/warn/error/debug），生产环境可接入日志系统。
 *   当前为控制台输出，后续可替换为 winston/pino 等专业日志库。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，统一日志管理
 *
 * =============================================================================
 */

/**
 * 日志级别枚举
 *
 * @enum {number}
 * @readonly
 */
const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/** 当前日志级别，生产环境不输出 DEBUG */
const currentLevel =
  process.env.NODE_ENV === 'production' ? LEVELS.INFO : LEVELS.DEBUG;

/**
 * 格式化时间戳
 *
 * @returns {string} ISO 格式时间戳
 * @private
 */
function timestamp() {
  return new Date().toISOString();
}

/**
 * 构建日志前缀
 *
 * @param {string} level - 日志级别标签
 * @returns {string} 带颜色标记的前缀
 * @private
 */
function prefix(level) {
  const colors = { DEBUG: '\x1b[36m', INFO: '\x1b[32m', WARN: '\x1b[33m', ERROR: '\x1b[31m' };
  const reset = '\x1b[0m';
  return `${colors[level] || ''}[${level}]${reset} ${timestamp()}`;
}

/**
 * 格式化日志参数
 *
 * @param {...*} args - 日志内容
 * @returns {string} 格式化后的日志消息
 * @private
 */
function format(...args) {
  return args
    .map((arg) => {
      if (arg instanceof Error) return arg.stack || arg.message;
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
}

/**
 * 调试日志（仅开发环境输出）
 *
 * @param {...*} args - 日志内容
 *
 * @example
 *   logger.debug('用户查询参数:', { id: 1 });
 */
function debug(...args) {
  if (currentLevel <= LEVELS.DEBUG) {
    console.log(`${prefix('DEBUG')} ${format(...args)}`);
  }
}

/**
 * 信息日志
 *
 * @param {...*} args - 日志内容
 *
 * @example
 *   logger.info('服务启动成功，端口:', 3020);
 */
function info(...args) {
  if (currentLevel <= LEVELS.INFO) {
    console.log(`${prefix('INFO')} ${format(...args)}`);
  }
}

/**
 * 警告日志
 *
 * @param {...*} args - 日志内容
 *
 * @example
 *   logger.warn('数据库连接池使用率超过 80%');
 */
function warn(...args) {
  if (currentLevel <= LEVELS.WARN) {
    console.warn(`${prefix('WARN')} ${format(...args)}`);
  }
}

/**
 * 错误日志
 *
 * @param {...*} args - 日志内容
 *
 * @example
 *   logger.error('LLM 调用失败:', error);
 */
function error(...args) {
  if (currentLevel <= LEVELS.ERROR) {
    console.error(`${prefix('ERROR')} ${format(...args)}`);
  }
}

module.exports = { debug, info, warn, error };
