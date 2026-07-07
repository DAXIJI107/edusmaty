/**
 * =============================================================================
 * 请求参数校验中间件
 * =============================================================================
 *
 * @file       src/middleware/validate.js
 * @module     Middleware/Validate
 * @description
 *   轻量级请求参数校验中间件工厂。
 *   提供声明式的参数校验能力，不引入第三方库依赖。
 *   支持校验规则：required、type、minLength、maxLength、min、max、pattern。
 *
 *   校验失败时自动返回 400 + 错误详情。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块，规范 API 入参校验
 *
 * @example
 *   const loginRules = {
 *     username: { required: true, type: 'string', minLength: 2 },
 *     password: { required: true, type: 'string', minLength: 6 },
 *   };
 *   router.post('/login', validate(loginRules), loginHandler);
 *
 * =============================================================================
 */

/**
 * 创建参数校验中间件
 *
 * 校验规则定义：
 *   - required:   是否必填（默认 false）
 *   - type:       期望类型：'string' | 'number' | 'boolean' | 'array' | 'object'
 *   - minLength:  字符串/数组最小长度
 *   - maxLength:  字符串/数组最大长度
 *   - min:        数字最小值
 *   - max:        数字最大值
 *   - pattern:    正则表达式匹配
 *   - message:    自定义错误消息
 *
 * @param {Object} rules - 校验规则对象，key 为参数名，value 为规则配置
 * @returns {Function} Express 中间件函数
 *
 * @example
 *   validate({
 *     email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
 *     age: { type: 'number', min: 1, max: 150 },
 *   })
 */
function validate(rules = {}) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body?.[field] ?? req.query?.[field] ?? req.params?.[field];

      // 必填校验
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `参数 ${field} 为必填项`);
        continue;
      }

      // 可选字段且未提供：跳过后续校验
      if (value === undefined || value === null) continue;

      // 类型校验
      if (rule.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rule.type) {
          errors.push(rule.message || `参数 ${field} 类型应为 ${rule.type}，实际为 ${actualType}`);
          continue;
        }
      }

      // 字符串长度校验
      if (rule.type === 'string' || typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push(rule.message || `参数 ${field} 长度不能少于 ${rule.minLength}`);
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push(rule.message || `参数 ${field} 长度不能超过 ${rule.maxLength}`);
        }
      }

      // 数组长度校验
      if (Array.isArray(value)) {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push(rule.message || `参数 ${field} 至少需要 ${rule.minLength} 项`);
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push(rule.message || `参数 ${field} 最多 ${rule.maxLength} 项`);
        }
      }

      // 数字范围校验
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(rule.message || `参数 ${field} 不能小于 ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(rule.message || `参数 ${field} 不能大于 ${rule.max}`);
        }
      }

      // 正则校验
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push(rule.message || `参数 ${field} 格式不正确`);
        }
      }
    }

    // 有错误：返回 400
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: '请求参数校验失败',
        errors,
      });
    }

    next();
  };
}

module.exports = { validate };
