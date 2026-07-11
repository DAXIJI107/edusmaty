/**
 * =============================================================================
 * 讯飞开放平台 HMAC 鉴权工具
 * =============================================================================
 *
 * @file       src/utils/xfyun-auth.js
 * @module     Utils/XfyunAuth
 * @description
 *   讯飞开放平台 API 的 HMAC-SHA256 签名工具。
 *   支持 WebSocket 连接 URL 生成和 HTTP 请求头签名。
 *
 *   讯飞大部分 API（TTS、IAT、图片生成等）使用此签名算法。
 *
 *   签名流程：
 *   1. 构造签名原始串：host + date + request-line
 *   2. 使用 API Secret 进行 HMAC-SHA256 签名
 *   3. 组装 Authorization 头
 *
 *   参考文档: https://www.xfyun.cn/doc/platform/quickguide.html
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 从 src/utils/xfyunAuth.js 迁移，添加完整注释
 *
 * =============================================================================
 */

const crypto = require('crypto');

/**
 * 生成讯飞 WebSocket 鉴权 URL
 *
 * 用于 TTS、IAT 等 WebSocket 接口的握手鉴权。
 *
 * @param {string} host      - API 主机名（如 tts-api.xfyun.cn）
 * @param {string} path      - API 路径（如 /v2/tts）
 * @param {string} apiKey    - 讯飞 API Key
 * @param {string} apiSecret - 讯飞 API Secret
 * @returns {string} 带鉴权参数的 WebSocket URL
 *
 * @example
 *   const wsUrl = generateAuthUrl(
 *     'tts-api.xfyun.cn',
 *     '/v2/tts',
 *     'your_api_key',
 *     'your_api_secret'
 *   );
 *   const ws = new WebSocket(wsUrl);
 */
function generateAuthUrl(host, path, apiKey, apiSecret) {
  // 1. 生成 RFC 1123 格式时间戳
  const date = new Date().toUTCString();

  // 2. 构造签名原始串
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;

  // 3. HMAC-SHA256 签名
  const signatureSha = crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');

  // 4. 组装 Authorization 参数
  const authorization = [
    `api_key="${apiKey}"`,
    'algorithm="hmac-sha256"',
    'headers="host date request-line"',
    `signature="${signatureSha}"`,
  ].join(', ');

  // 5. 构建最终 URL
  const url =
    `wss://${host}${path}` +
    `?authorization=${Buffer.from(authorization).toString('base64')}` +
    `&date=${encodeURIComponent(date)}` +
    `&host=${host}`;

  return url;
}

/**
 * 生成讯飞 HTTP API 鉴权请求头
 *
 * 用于 PPT 生成等 HTTP 接口的请求鉴权。
 *
 * @param {string} host      - API 主机名
 * @param {string} path      - API 路径
 * @param {string} method    - HTTP 方法（GET/POST，默认 POST）
 * @param {string} apiKey    - 讯飞 API Key
 * @param {string} apiSecret - 讯飞 API Secret
 * @returns {{ host: string, date: string, authorization: string }} 请求头对象
 *
 * @example
 *   const headers = generateHttpAuthHeaders(
 *     'zwapi.xfyun.cn',
 *     '/api/ppt/v2/create',
 *     'POST',
 *     'your_api_key',
 *     'your_api_secret'
 *   );
 *   // 将 headers 作为 HTTP 请求头发送
 */
function generateHttpAuthHeaders(host, path, method, apiKey, apiSecret) {
  // 1. RFC 1123 时间戳
  const date = new Date().toUTCString();

  // 2. 请求行
  const requestLine = `${String(method || 'POST').toUpperCase()} ${path} HTTP/1.1`;

  // 3. 签名原始串
  const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;

  // 4. HMAC-SHA256 签名
  const signatureSha = crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');

  // 5. Authorization 参数
  const authorization = [
    `api_key="${apiKey}"`,
    'algorithm="hmac-sha256"',
    'headers="host date request-line"',
    `signature="${signatureSha}"`,
  ].join(', ');

  return {
    host,
    date,
    authorization: Buffer.from(authorization).toString('base64'),
  };
}

/**
 * 生成讯飞 HTTP API 鉴权查询字符串
 *
 * 适用于需要将鉴权参数放在 URL query string 的场景。
 *
 * @param {string} host      - API 主机名
 * @param {string} path      - API 路径
 * @param {string} method    - HTTP 方法
 * @param {string} apiKey    - 讯飞 API Key
 * @param {string} apiSecret - 讯飞 API Secret
 * @returns {string} URL 查询字符串
 *
 * @example
 *   const query = generateHttpAuthQuery(
 *     'api.xfyun.cn', '/v1/xxx', 'POST', key, secret
 *   );
 *   // 'authorization=...&date=...&host=...'
 */
function generateHttpAuthQuery(host, path, method, apiKey, apiSecret) {
  const headers = generateHttpAuthHeaders(host, path, method, apiKey, apiSecret);
  return new URLSearchParams({
    authorization: headers.authorization,
    date: headers.date,
    host: headers.host,
  }).toString();
}

module.exports = {
  generateAuthUrl,
  generateHttpAuthHeaders,
  generateHttpAuthQuery,
};
