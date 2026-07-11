/**
 * =============================================================================
 * 向量嵌入配置
 * =============================================================================
 *
 * @file       src/config/embedding.js
 * @module     Config/Embedding
 * @description
 *   文本向量嵌入服务配置。
 *   用于将文本转换为向量，支持 RAG 语义检索。
 *   当前默认使用本地部署的 text2vec-base-chinese 模型。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 *
 * @env EMBEDDING_PROVIDER   - 嵌入服务提供商（默认 local）
 * @env EMBEDDING_BASE_URL   - 嵌入 API 基地址
 * @env EMBEDDING_MODEL      - 嵌入模型名称
 * @env EMBEDDING_API_KEY    - API 密钥
 * @env EMBEDDING_TIMEOUT_MS - 请求超时（毫秒）
 * @env EMBEDDING_DIMENSIONS - 向量维度
 *
 * =============================================================================
 */

/**
 * 向量嵌入配置
 *
 * @type {Object}
 * @property {string} provider - 提供商标识
 * @property {Object} local    - 本地嵌入模型配置
 */
module.exports = {
  /** 嵌入提供商，当前仅支持 'local' */
  provider: process.env.EMBEDDING_PROVIDER || 'local',

  /** 本地嵌入模型配置 */
  local: {
    /** 嵌入服务 API 地址 */
    baseUrl: process.env.EMBEDDING_BASE_URL || 'http://127.0.0.1:11434/v1',

    /** 嵌入模型名称，中文场景推荐 text2vec-base-chinese */
    model: process.env.EMBEDDING_MODEL || 'text2vec-base-chinese',

    /** API 密钥 */
    apiKey: process.env.EMBEDDING_API_KEY || 'local',

    /** 请求超时（毫秒），嵌入计算较慢，给 30s */
    timeoutMs: Number(process.env.EMBEDDING_TIMEOUT_MS || 30000),

    /** 输出向量维度，text2vec-base-chinese 为 768 */
    dimensions: Number(process.env.EMBEDDING_DIMENSIONS || 768),
  },
};
