// UserBindingContext.js — 将当前请求用户的 API 绑定信息透传给 LlmGateway
// 通过 AsyncLocalStorage 贯穿整个请求异步链，所有 AI 功能自动使用用户绑定的模型
const { AsyncLocalStorage } = require("async_hooks");
const pool = require("../../database/connection");

const userBindingStorage = new AsyncLocalStorage();

// 每用户绑定信息缓存（30 秒 TTL，避免每个请求都查库）
const cache = new Map();
const CACHE_TTL = 30 * 1000;

/**
 * 加载用户启用的 API 绑定
 * @param {number} userId
 * @returns {Promise<{providerName, baseUrl, modelName, modelVersion, apiKey}|null>}
 */
async function loadUserBinding(userId) {
    if (!userId) return null;
    const hit = cache.get(userId);
    if (hit && hit.expiresAt > Date.now()) return hit.binding;
    let binding = null;
    try {
        const [rows] = await pool.query(
            "SELECT provider, base_url, model_name, model_version, api_key FROM user_api_bindings WHERE user_id = ? AND enabled = 1 LIMIT 1",
            [userId]
        );
        if (rows && rows[0] && rows[0].base_url && rows[0].api_key && rows[0].model_name) {
            binding = {
                providerName: rows[0].provider || "自定义模型",
                baseUrl: rows[0].base_url,
                modelName: rows[0].model_name,
                modelVersion: rows[0].model_version || "",
                apiKey: rows[0].api_key
            };
        }
    } catch (error) {
        // 表不存在或库异常时静默降级为系统默认模型
    }
    cache.set(userId, { binding, expiresAt: Date.now() + CACHE_TTL });
    return binding;
}

/** 在携带用户绑定的上下文中执行后续中间件 */
function runWithUserBinding(binding, fn) {
    return userBindingStorage.run(binding, fn);
}

/** LlmGateway 内部读取当前请求的用户绑定 */
function getUserBinding() {
    return userBindingStorage.getStore() || null;
}

/** 绑定变更后立即失效缓存（保存/启停/解绑时调用） */
function invalidateUserBinding(userId) {
    if (userId) cache.delete(userId);
    else cache.clear();
}

module.exports = { loadUserBinding, runWithUserBinding, getUserBinding, invalidateUserBinding, userBindingStorage };
