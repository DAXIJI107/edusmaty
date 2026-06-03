// utils/xfyunAuth.js
const crypto = require('crypto');

function generateAuthUrl(host, path, apiKey, apiSecret) {
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signatureSha = crypto.createHmac('sha256', apiSecret)
    .update(signatureOrigin).digest('base64');
  const authorization = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
  const url = `wss://${host}${path}?authorization=${Buffer.from(authorization).toString('base64')}&date=${encodeURIComponent(date)}&host=${host}`;
  return url;
}

function generateHttpAuthHeaders(host, path, method, apiKey, apiSecret) {
  const date = new Date().toUTCString();
  const requestLine = `${String(method || 'POST').toUpperCase()} ${path} HTTP/1.1`;
  const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;
  const signatureSha = crypto.createHmac('sha256', apiSecret)
    .update(signatureOrigin).digest('base64');
  const authorization = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
  return {
    host,
    date,
    authorization: Buffer.from(authorization).toString('base64')
  };
}

function generateHttpAuthQuery(host, path, method, apiKey, apiSecret) {
  const headers = generateHttpAuthHeaders(host, path, method, apiKey, apiSecret);
  return new URLSearchParams({
    authorization: headers.authorization,
    date: headers.date,
    host: headers.host
  }).toString();
}

module.exports = { generateAuthUrl, generateHttpAuthHeaders, generateHttpAuthQuery };
