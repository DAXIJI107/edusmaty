/**
 * =============================================================================
 * 讯飞开放平台配置
 * =============================================================================
 *
 * @file       src/config/xfyun.js
 * @module     Config/Xfyun
 * @description
 *   讯飞开放平台（iFlytek）相关服务配置。
 *   包括语音合成（TTS）、语音识别（IAT）、图片生成、PPT 生成、OCR 识别等。
 *
 *   ⚠️ 所有讯飞服务需要在 https://console.xfyun.cn/ 创建应用获取凭证。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 config.js 独立拆分
 *
 * @env XFYUN_APP_ID         - 讯飞应用 ID
 * @env XFYUN_API_KEY        - 讯飞 API Key
 * @env XFYUN_API_SECRET     - 讯飞 API Secret
 * @env XFYUN_IAT_WS_API     - 语音识别 WebSocket 地址
 * @env XFYUN_IMAGE_WS_API   - 图片生成 WebSocket 地址
 * @env XFYUN_PPT_API_URL    - PPT 生成 API 地址
 * @env XFYUN_OCR_APP_ID     - OCR 专用 AppID
 * @env XFYUN_OCR_API_KEY    - OCR 专用 API Key
 * @env XFYUN_OCR_API_SECRET - OCR 专用 API Secret
 * @env XFYUN_OCR_API_URL    - OCR API 地址
 * @env XFYUN_TTS_WS_API     - TTS WebSocket 地址
 * @env XFYUN_TTS_VOICE      - TTS 默认发音人
 *
 * =============================================================================
 */

/**
 * 讯飞开放平台主配置
 *
 * @type {Object}
 * @property {string} appId      - 应用 ID
 * @property {string} apiKey     - API Key
 * @property {string} apiSecret  - API Secret
 * @property {string} iatWsApi   - 语音识别 WebSocket 地址
 * @property {string} imageWsApi - 图片生成 WebSocket 地址
 * @property {string} pptApiUrl  - PPT 生成 HTTP 地址
 */
const xfyun = {
  /** 讯飞控制台应用 ID */
  appId: process.env.XFYUN_APP_ID || '',

  /** 讯飞 API Key */
  apiKey: process.env.XFYUN_API_KEY || '',

  /** 讯飞 API Secret（用于 HMAC 签名） */
  apiSecret: process.env.XFYUN_API_SECRET || '',

  /**
   * 语音听写 WebSocket 接口
   * 文档: https://www.xfyun.cn/doc/asr/voicedictation/API.html
   */
  iatWsApi: process.env.XFYUN_IAT_WS_API || 'wss://iat-api.xfyun.cn/v2/iat',

  /**
   * AI 图片生成 WebSocket 接口
   * 文档: https://www.xfyun.cn/doc/images/images/API.html
   */
  imageWsApi:
    process.env.XFYUN_IMAGE_WS_API ||
    'wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image',

  /**
   * AI PPT 生成 HTTP 接口
   * 文档: https://www.xfyun.cn/doc/p/pt/v2/API.html
   */
  pptApiUrl:
    process.env.XFYUN_PPT_API_URL ||
    'https://zwapi.xfyun.cn/api/ppt/v2/create',
};

/**
 * 讯飞 OCR 识别配置
 * 用于试卷扫描、文字提取等场景
 *
 * @type {Object}
 * @property {string} appId     - OCR 专用 AppID
 * @property {string} apiKey    - OCR 专用 API Key
 * @property {string} apiSecret - OCR 专用 API Secret
 * @property {string} apiUrl    - OCR API 地址
 */
const ocr = {
  /** OCR 应用 ID（可复用主应用 ID） */
  appId:
    process.env.XFYUN_OCR_APP_ID || process.env.XFYUN_APP_ID || '',

  /** OCR API Key（可复用主 API Key） */
  apiKey:
    process.env.XFYUN_OCR_API_KEY || process.env.XFYUN_API_KEY || '',

  /** OCR API Secret（可复用主 API Secret） */
  apiSecret:
    process.env.XFYUN_OCR_API_SECRET || process.env.XFYUN_API_SECRET || '',

  /** OCR API 地址 */
  apiUrl:
    process.env.XFYUN_OCR_API_URL ||
    'https://cbm01.cn-huabei-1.xf-yun.com/v1/private/se75ocrbm',
};

/**
 * TTS 语音合成配置
 *
 * @type {Object}
 * @property {string} appId         - TTS 应用 ID
 * @property {string} apiKey        - TTS API Key
 * @property {string} apiSecret     - TTS API Secret
 * @property {string} wsApi         - TTS WebSocket 地址
 * @property {string} defaultVoice  - 默认发音人
 * @property {number} defaultSpeed  - 默认语速（0-100）
 * @property {number} defaultVolume - 默认音量（0-100）
 * @property {number} defaultPitch  - 默认音高（0-100）
 */
const tts = {
  /** TTS 应用 ID（可复用主应用 ID） */
  appId:
    process.env.XFYUN_TTS_APP_ID || process.env.XFYUN_APP_ID || '',

  /** TTS API Key（可复用主 API Key） */
  apiKey:
    process.env.XFYUN_TTS_API_KEY || process.env.XFYUN_API_KEY || '',

  /** TTS API Secret（可复用主 API Secret） */
  apiSecret:
    process.env.XFYUN_TTS_API_SECRET || process.env.XFYUN_API_SECRET || '',

  /**
   * 语音合成 WebSocket 接口
   * 文档: https://www.xfyun.cn/doc/tts/online_tts/API.html
   */
  wsApi:
    process.env.XFYUN_TTS_WS_API || 'wss://tts-api.xfyun.cn/v2/tts',

  /** 默认发音人：x4_lingxiaoxuan 为讯飞中文女声 */
  defaultVoice: process.env.XFYUN_TTS_VOICE || 'x4_lingxiaoxuan',

  /** 默认语速，范围 0-100，50 为正常 */
  defaultSpeed: 50,

  /** 默认音量，范围 0-100 */
  defaultVolume: 50,

  /** 默认音高，范围 0-100 */
  defaultPitch: 50,
};

module.exports = { xfyun, ocr, tts };
