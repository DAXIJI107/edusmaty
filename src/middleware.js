/**
 * =============================================================================
 * 兼容转发：src/middleware.js → src/middleware/index.js
 * =============================================================================
 *
 * @file       src/middleware.js
 * @description
 *   旧代码兼容入口，所有 require('../middleware') 自动转发到新的中间件模块。
 *   Phase 2 重构完成后可移除此文件。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 改为兼容转发
 * =============================================================================
 */

module.exports = require('./middleware/index');
