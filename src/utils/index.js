/**
 * =============================================================================
 * 通用工具函数集合
 * =============================================================================
 *
 * @file       src/utils/index.js
 * @module     Utils
 * @description
 *   工具函数统一导出入口。
 *   所有共享的工具函数通过此文件集中暴露。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，统一工具函数入口
 *
 * =============================================================================
 */

const response = require('./response');
const logger = require('./logger');
const pagination = require('./pagination');
const xfyunAuth = require('./xfyun-auth');

module.exports = {
  // 响应工具
  ...response,

  // 日志工具
  logger,

  // 分页工具
  pagination,

  // 讯飞鉴权
  xfyunAuth,
};
