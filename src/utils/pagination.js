/**
 * =============================================================================
 * 分页工具
 * =============================================================================
 *
 * @file       src/utils/pagination.js
 * @module     Utils/Pagination
 * @description
 *   数据库查询分页工具。
 *   从请求参数中提取分页信息，计算偏移量，生成分页元数据。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，统一分页逻辑
 *
 * =============================================================================
 */

/** 默认每页条数 */
const DEFAULT_PAGE_SIZE = 20;

/** 最大每页条数（防止恶意请求） */
const MAX_PAGE_SIZE = 200;

/**
 * 从请求中解析分页参数
 *
 * 支持的查询参数：
 *   - page:     页码（从 1 开始，默认 1）
 *   - pageSize: 每页条数（默认 20，最大 200）
 *   - offset:   偏移量（优先级高于 page）
 *
 * @param {express.Request} req - Express 请求对象
 * @returns {{ page: number, pageSize: number, offset: number }} 分页参数
 *
 * @example
 *   const { page, pageSize, offset } = parsePagination(req);
 *   const [rows] = await pool.query('SELECT * FROM users LIMIT ? OFFSET ?', [pageSize, offset]);
 */
function parsePagination(req) {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE;

  // 边界保护
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

  // 优先使用显式的 offset 参数
  const offset =
    req.query.offset !== undefined
      ? parseInt(req.query.offset, 10)
      : (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * 构建分页元数据
 *
 * @param {number} page     - 当前页码
 * @param {number} pageSize - 每页条数
 * @param {number} total    - 总记录数
 * @returns {{ page: number, pageSize: number, total: number, totalPages: number }}
 *
 * @example
 *   const meta = buildPaginationMeta(1, 20, 100);
 *   // { page: 1, pageSize: 20, total: 100, totalPages: 5 }
 */
function buildPaginationMeta(page, pageSize, total) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * 生成 SQL LIMIT/OFFSET 子句
 *
 * @param {number} pageSize - 每页条数
 * @param {number} offset   - 偏移量
 * @returns {{ limitClause: string, params: number[] }}
 *
 * @example
 *   const { limitClause, params } = buildLimitClause(20, 0);
 *   // { limitClause: 'LIMIT ? OFFSET ?', params: [20, 0] }
 */
function buildLimitClause(pageSize, offset) {
  return {
    limitClause: 'LIMIT ? OFFSET ?',
    params: [pageSize, offset],
  };
}

module.exports = {
  parsePagination,
  buildPaginationMeta,
  buildLimitClause,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
