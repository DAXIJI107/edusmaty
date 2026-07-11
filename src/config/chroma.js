/**
 * =============================================================================
 * ChromaDB 向量数据库配置
 * =============================================================================
 *
 * @file       src/config/chroma.js
 * @module     Config/Chroma
 * @description
 *   ChromaDB 向量数据库连接配置。
 *   ChromaDB 是开源的向量数据库，用于存储和检索文本嵌入向量，
 *   是 RAG（检索增强生成）系统的核心存储组件。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 *
 * @env CHROMA_URL        - ChromaDB 服务地址（默认 http://127.0.0.1:8000）
 * @env CHROMA_COLLECTION - 集合名称（默认 edusmart_rag）
 * @env CHROMA_TIMEOUT_MS - 请求超时（毫秒，默认 30000）
 *
 * =============================================================================
 */

/**
 * ChromaDB 配置
 *
 * @type {Object}
 * @property {string} url            - 服务地址
 * @property {string} collectionName - 向量集合名称
 * @property {number} timeoutMs      - HTTP 请求超时
 */
module.exports = {
  /** ChromaDB HTTP API 地址 */
  url: process.env.CHROMA_URL || 'http://127.0.0.1:8000',

  /** 向量集合名称，RAG 文档统一存入此集合 */
  collectionName: process.env.CHROMA_COLLECTION || 'edusmart_rag',

  /** 请求超时时间（毫秒），向量检索可能较慢 */
  timeoutMs: Number(process.env.CHROMA_TIMEOUT_MS || 30000),
};
