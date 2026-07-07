/**
 * =============================================================================
 * EduSmart 配置聚合入口
 * =============================================================================
 *
 * @file       src/config/index.js
 * @module     Config
 * @description
 *   加载 .env 环境变量，聚合所有子配置模块，对外导出统一配置对象。
 *   本模块是配置层的唯一入口，所有其他模块通过 require('./config') 获取配置。
 *
 *   dotenv 在此加载一次，后续子模块直接读取 process.env。
 *
 * @author     EduSmart Team
 * @since      v2.0.0 (original)
 * @refactored 2026-06-27 - 从单体 config.js 拆分为多文件配置体系
 *
 * @example
 *   const config = require('./config');
 *   console.log(config.server.port); // 3020
 *   console.log(config.database.host); // 'localhost'
 *
 * =============================================================================
 */

const path = require('path');

/** 
 * .env 文件路径
 * - 开发模式：项目根目录
 * - pkg打包后：exe所在目录
 */
const isPkg = typeof process.pkg !== 'undefined';
const envPath = isPkg 
  ? path.join(path.dirname(process.execPath), '.env')
  : path.resolve(__dirname, '..', '..', '.env');

require('dotenv').config({ path: envPath });

const appConfig = require('./app');
const serverConfig = require('./server');
const databaseConfig = require('./database');
const authConfig = require('./auth');
const llmConfig = require('./llm');
const embeddingConfig = require('./embedding');
const chromaConfig = require('./chroma');
const emailConfig = require('./email');
const xfyunConfig = require('./xfyun');

/**
 * 工具函数：将字符串转换为布尔值
 *
 * @param {string|undefined} value - 环境变量原始值
 * @returns {boolean} - 转换后的布尔值
 * @private
 */
const bool = (value) => String(value || '').toLowerCase() === 'true';

/**
 * EduSmart 全局配置对象
 *
 * 配置优先级（从高到低）：
 *   1. process.env 环境变量
 *   2. 各子模块的默认值
 *
 * @type {Object}
 * @property {Object}  app            - 应用基础配置（名称、模式）
 * @property {Object}  server         - 服务器配置（端口、CORS）
 * @property {Object}  database       - MySQL 数据库连接配置
 * @property {Object}  jwt            - JWT 认证配置
 * @property {Object}  spark          - 讯飞星火大模型配置（主 LLM）
 * @property {Object}  llm            - LLM 网关配置（provider 路由 + fallback 策略）
 * @property {Object}  search         - 搜索/星火 API 密码配置
 * @property {Object}  xfyun          - 讯飞开放平台配置（TTS/IAT/图片/PPT）
 * @property {Object}  ocr            - 讯飞 OCR 配置
 * @property {Object}  tts            - TTS 语音合成配置
 * @property {Object}  embedding      - 向量嵌入配置
 * @property {Object}  chroma         - ChromaDB 向量数据库配置
 * @property {Object}  digitalTutor   - 数字导师配置（名称、人设）
 */
module.exports = {
  // ========== 应用基础 ==========
  app: appConfig,

  // ========== 服务器 ==========
  server: serverConfig,

  // ========== 数据库 ==========
  database: databaseConfig,

  // ========== 认证 ==========
  jwt: authConfig,

  // ========== 讯飞星火大模型（主 LLM Provider） ==========
  // SPARK_API_KEY_SECRET 格式: {APIKey}:{APISecret}（冒号连接）
  // 在 https://console.xfyun.cn/ 创建应用获取
  spark: {
    /** 星火应用 ID */
    appId: process.env.SPARK_APP_ID || '',
    /** 星火 API Key */
    apiKey: process.env.SPARK_API_KEY || '',
    /** 星火 API Secret */
    apiSecret: process.env.SPARK_API_SECRET || '',
    /**
     * 星火大模型 HTTP API 地址（OpenAI 兼容格式）
     * 文档: https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html
     */
    httpApi:
      process.env.SPARK_HTTP_API ||
      'https://spark-api-open.xf-yun.com/v1/chat/completions',
    /** 模型版本: lite | generalv3 | pro-128k 等 */
    model: process.env.SPARK_MODEL || 'lite',
    /** WebSocket API（流式调用备用） */
    wsApi: process.env.SPARK_WS_API || '',
    /**
     * API Key + Secret 组合密钥
     * 格式: {SPARK_API_KEY}:{SPARK_API_SECRET}
     * 用于 Bearer Token 鉴权
     */
    apiKeySecret: process.env.SPARK_API_KEY_SECRET || '',
  },

  // ========== LLM 网关 ==========
  llm: llmConfig,

  // ========== 搜索服务 ==========
  search: {
    apiPassword:
      process.env.SEARCH_API_PASSWORD ||
      process.env.SPARK_API_KEY_SECRET ||
      '',
  },

  // ========== 讯飞开放平台 ==========
  xfyun: xfyunConfig.xfyun,

  // ========== 讯飞 OCR ==========
  ocr: xfyunConfig.ocr,

  // ========== TTS 语音合成 ==========
  tts: xfyunConfig.tts,

  // ========== 向量嵌入 ==========
  embedding: embeddingConfig,

  // ========== ChromaDB 向量数据库 ==========
  chroma: chromaConfig,

  // ========== 数字导师 ==========
  digitalTutor: {
    tutorName: '小星',
    tutorRole: 'AI学习导师',
    tutorPersonality: '耐心、专业、激励型',
    greeting: '你好！我是你的AI学习导师小星，很高兴为你提供学习帮助！',
    avatarUrl: '/images/tutor-avatar.svg',
  },
};
