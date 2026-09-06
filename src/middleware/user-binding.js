/**
 * 用户 API 绑定注入中间件
 * 在进入 API 路由前解析 Token 并加载用户绑定的大模型配置，
 * 通过 AsyncLocalStorage 注入请求上下文，使 LlmGateway 自动优先使用用户绑定的模型。
 * 注入失败不影响请求（静默降级为系统默认模型）。
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const { loadUserBinding, runWithUserBinding } = require('../core/llm/UserBindingContext');

function readToken(req) {
  if (req.cookies?.token) return req.cookies.token;
  const authorization = req.headers.authorization || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7);
  return '';
}

function attachUserBinding(req, res, next) {
  const token = readToken(req);
  if (!token) return next();
  let user;
  try {
    user = jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return next(); // Token 无效交给路由级认证处理
  }
  loadUserBinding(user.id)
    .then(binding => {
      if (process.env.UB_DEBUG) console.log(`[UserBinding] user=${user.id} loaded=${binding ? binding.providerName : "null"} path=${req.path}`);
      return runWithUserBinding(binding, () => next());
    })
    .catch(() => next());
}

module.exports = { attachUserBinding };
