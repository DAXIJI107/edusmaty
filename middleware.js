/**
 * =============================================================================
 * 兼容转发：middleware.js → src/middleware/index.js
 * =============================================================================
 *
 * @file       middleware.js (根目录)
 * @description
 *   旧脚本兼容入口，直接转发到新的中间件模块 src/middleware/index.js。
 *   新代码请直接 require('./src/middleware')。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 更新注释，标注兼容用途
 * =============================================================================
 */

module.exports = require('./src/middleware');
