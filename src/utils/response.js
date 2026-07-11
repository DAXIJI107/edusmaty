/**
 * =============================================================================
 * 统一 API 响应格式
 * =============================================================================
 *
 * @file       src/utils/response.js
 * @module     Utils/Response
 * @description
 *   提供统一的 API 响应构建函数。
 *   所有控制器应使用这些函数返回标准格式的 JSON 响应，
 *   确保前端接收到的数据结构一致。
 *
 *   标准响应格式：
 *   成功: { success: true,  data: {...}, message: '...' }
 *   失败: { success: false, message: '...', errors: [...] }
 *   分页: { success: true,  data: [...], pagination: {...} }
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，规范 API 响应格式
 *
 * =============================================================================
 */

/**
 * 成功响应
 *
 * @param {Object}  res     - Express Response 对象
 * @param {*}       [data]  - 响应数据
 * @param {string}  [message] - 成功消息（默认 '操作成功'）
 * @param {number}  [statusCode=200] - HTTP 状态码
 *
 * @example
 *   return success(res, { user: {...} }, '登录成功');
 *   return success(res, null, '删除成功', 204);
 */
function success(res, data = null, message = '操作成功', statusCode = 200) {
  const body = { success: true, message };
  if (data !== null && data !== undefined) {
    body.data = data;
  }
  return res.status(statusCode).json(body);
}

/**
 * 失败响应
 *
 * @param {Object}  res       - Express Response 对象
 * @param {string}  message   - 错误消息
 * @param {number}  [statusCode=400] - HTTP 状态码
 * @param {Array}   [errors]  - 详细错误列表
 *
 * @example
 *   return fail(res, '用户名已存在', 409);
 *   return fail(res, '参数校验失败', 400, [{ field: 'email', message: '格式不正确' }]);
 */
function fail(res, message = '操作失败', statusCode = 400, errors = null) {
  const body = { success: false, message };
  if (errors) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
}

/**
 * 分页响应
 *
 * @param {Object} res        - Express Response 对象
 * @param {Array}  data       - 数据列表
 * @param {Object} pagination - 分页信息
 * @param {number} pagination.page       - 当前页码
 * @param {number} pagination.pageSize   - 每页条数
 * @param {number} pagination.total      - 总条数
 * @param {number} pagination.totalPages - 总页数
 * @param {string} [message] - 消息
 *
 * @example
 *   return paginated(res, users, {
 *     page: 1, pageSize: 20, total: 100, totalPages: 5
 *   });
 */
function paginated(res, data = [], pagination = {}, message = '查询成功') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || data.length,
      total: pagination.total || data.length,
      totalPages: pagination.totalPages || 1,
    },
  });
}

/**
 * 未授权响应
 *
 * @param {Object} res     - Express Response 对象
 * @param {string} [message] - 错误消息
 *
 * @example
 *   return unauthorized(res, '请先登录');
 */
function unauthorized(res, message = '未授权，请先登录') {
  return fail(res, message, 401);
}

/**
 * 禁止访问响应
 *
 * @param {Object} res     - Express Response 对象
 * @param {string} [message] - 错误消息
 *
 * @example
 *   return forbidden(res, '需要教师权限');
 */
function forbidden(res, message = '无权限访问') {
  return fail(res, message, 403);
}

/**
 * 未找到响应
 *
 * @param {Object} res     - Express Response 对象
 * @param {string} [message] - 错误消息
 *
 * @example
 *   return notFound(res, '用户不存在');
 */
function notFound(res, message = '资源不存在') {
  return fail(res, message, 404);
}

/**
 * 服务器错误响应
 *
 * @param {Object} res     - Express Response 对象
 * @param {string} [message] - 错误消息
 *
 * @example
 *   return serverError(res, '数据库连接失败');
 */
function serverError(res, message = '服务器内部错误') {
  return fail(res, message, 500);
}

module.exports = {
  success,
  fail,
  paginated,
  unauthorized,
  forbidden,
  notFound,
  serverError,
};
