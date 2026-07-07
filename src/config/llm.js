/**
 * =============================================================================
 * LLM 大模型网关配置
 * =============================================================================
 *
 * @file       src/config/llm.js
 * @module     Config/LLM
 * @description
 *   大语言模型（LLM）网关配置。
 *   支持多 Provider 切换：local（本地部署）、spark（讯飞星火）、herdsman（本地模型管理）。
 *   allowSparkFallback 控制本地模型不可用时是否自动降级到星火。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 *
 * @env LLM_PROVIDER            - 主 LLM 提供商：'spark' | 'local' | 'herdsman'（默认 spark）
 * @env LLM_ALLOW_SPARK_FALLBACK - 当 provider 非 spark 时，是否允许回退到星火（默认 true）
 * @env AI_QUESTION_LOG_FILE    - AI 交互日志文件路径
 * @env LOCAL_LLM_BASE_URL      - 本地模型 API 地址
 * @env LOCAL_LLM_MODEL         - 本地模型名称
 * @env LOCAL_LLM_API_KEY       - 本地模型 API Key
 * @env LOCAL_LLM_TIMEOUT_MS    - 请求超时（毫秒）
 * @env LOCAL_LLM_MAX_TOKENS    - 最大生成 Token 数
 * @env LOCAL_LLM_TEMPERATURE   - 生成温度（0-1）
 * @env HERDSMAN_BASE_URL       - Herdsman 管理地址
 * @env HERDSMAN_MODEL          - Herdsman 模型名
 * @env HERDSMAN_API_KEY        - Herdsman API Key
 * @env HERDSMAN_MAX_TOKENS     - Herdsman 最大 Token
 * @env HERDSMAN_TEMPERATURE    - Herdsman 温度
 * @env HERDSMAN_TIMEOUT_MS     - Herdsman 超时
 *
 * =============================================================================
 */

const bool = (value) => String(value || '').toLowerCase() === 'true';

/**
 * LLM 网关配置
 *
 * @type {Object}
 * @property {string}  provider            - 主 Provider
 * @property {boolean} allowSparkFallback  - 是否启用星火降级
 * @property {string}  interactionLogFile  - 交互日志路径
 * @property {Object}  local               - 本地模型配置
 * @property {Object}  herdsman            - Herdsman 本地模型管理配置
 */
module.exports = {
  /**
   * 主 LLM Provider
   *   - 'spark'    → 讯飞星火大模型（推荐，无需本地 GPU）
   *   - 'local'    → 本地部署模型（OpenAI 兼容 API）
   *   - 'herdsman' → 本地模型管理服务
   */
  provider: process.env.LLM_PROVIDER || 'spark',

  /**
   * 当 provider 不是 spark 时，本地模型调用失败后
   * 是否自动回退到讯飞星火（保证服务可用性）
   */
  allowSparkFallback: bool(process.env.LLM_ALLOW_SPARK_FALLBACK || 'true'),

  /** AI 问答交互日志文件路径（JSONL 格式） */
  interactionLogFile:
    process.env.AI_QUESTION_LOG_FILE || 'data/ai-question-log.jsonl',

  // ========== 本地模型（通过 OpenAI 兼容 API 访问） ==========
  local: {
    /** 本地 LLM API 基地址，如 http://127.0.0.1:8080/v1 */
    baseUrl: process.env.LOCAL_LLM_BASE_URL || 'http://127.0.0.1:8080/v1',

    /** 模型标识符 */
    model:
      process.env.LOCAL_LLM_MODEL || 'DeepSeek-R1-Distill:Qwen-1.5B',

    /** API 密钥（本地部署通常为 'local'） */
    apiKey: process.env.LOCAL_LLM_API_KEY || 'local',

    /** HTTP 请求超时时间（毫秒） */
    timeoutMs: Number(process.env.LOCAL_LLM_TIMEOUT_MS || 60000),

    /** 单次生成最大 Token 数 */
    maxTokens: Number(process.env.LOCAL_LLM_MAX_TOKENS || 2048),

    /** 生成温度，值越低越确定性，越高越随机 */
    temperature: Number(process.env.LOCAL_LLM_TEMPERATURE || 0.4),
  },

  // ========== Herdsman 本地模型管理（覆盖 local 配置） ==========
  herdsman: {
    /** Herdsman 管理服务地址 */
    baseUrl:
      process.env.HERDSMAN_BASE_URL ||
      process.env.LOCAL_LLM_BASE_URL ||
      'http://127.0.0.1:8080/v1',

    /** Herdsman 管理的模型名称 */
    model:
      process.env.HERDSMAN_MODEL ||
      process.env.LOCAL_LLM_MODEL ||
      'local-model',

    /** API 密钥 */
    apiKey: process.env.HERDSMAN_API_KEY || 'local',

    /** 请求超时（Herdsman 可能加载模型较慢，默认 120s） */
    timeoutMs: Number(process.env.HERDSMAN_TIMEOUT_MS || 120000),

    /** 最大生成 Token */
    maxTokens: Number(process.env.HERDSMAN_MAX_TOKENS || 4096),

    /** 生成温度 */
    temperature: Number(process.env.HERDSMAN_TEMPERATURE || 0.4),
  },
};
