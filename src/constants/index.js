/**
 * =============================================================================
 * 常量定义索引
 * =============================================================================
 *
 * @file       src/constants/index.js
 * @module     Constants
 * @description
 *   项目全局常量统一导出。
 *   所有魔法数字、硬编码字符串、业务枚举均在此定义。
 *
 *   规则：
 *   - 禁止在业务代码中直接使用字面量（如 'teacher', 200, 'active'）
 *   - 所有枚举值从 constants 中引用
 *   - 新增常量在此目录添加新文件并在 index.js 中导出
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，消除魔法值
 *
 * =============================================================================
 */

const enums = require('./enums');
const errorCodes = require('./error-codes');
const apiPaths = require('./api-paths');
const defaults = require('./defaults');

module.exports = {
  enums,
  errorCodes,
  apiPaths,
  defaults,
};
