// api/xfyun.js
const express = require('express');
const router = express.Router();
const { generateAuthUrl, generateHttpAuthHeaders, generateHttpAuthQuery } = require('../utils/xfyunAuth');
const axios = require('axios');
const config = require('../config');
const llmGateway = require('../core/llm/LlmGateway');

// 从配置文件读取凭证
const APP_ID = config.xfyun.appId;
const API_KEY = config.xfyun.apiKey;
const API_SECRET = config.xfyun.apiSecret;

if (!APP_ID || !API_KEY || !API_SECRET) {
    console.error('❌ 请在 .env 中配置 XFYUN_APP_ID, XFYUN_API_KEY, XFYUN_API_SECRET');
}

function credentialReady(serviceConfig = config.xfyun) {
    return Boolean(serviceConfig.appId && serviceConfig.apiKey && serviceConfig.apiSecret);
}

function parseServiceUrl(rawUrl) {
    const url = new URL(rawUrl);
    return {
        host: url.host,
        path: `${url.pathname}${url.search || ''}`,
        origin: `${url.protocol}//${url.host}`
    };
}

function stripDataUrl(value = '') {
    return String(value || '').replace(/^data:[^;]+;base64,/, '');
}

function buildOcrPayload(imageBase64, options = {}) {
    return {
        header: {
            app_id: config.ocr.appId,
            status: 3
        },
        parameter: {
            se75ocrbm: {
                category: options.category || 'ch_en_public_cloud',
                result: {
                    encoding: 'utf8',
                    compress: 'raw',
                    format: 'json'
                }
            }
        },
        payload: {
            image: {
                encoding: options.encoding || 'jpg',
                image: stripDataUrl(imageBase64),
                status: 3
            }
        }
    };
}

router.get('/capabilities', (req, res) => {
    res.json({
        success: true,
        data: [
            { key: 'iat', name: '语音听写', type: 'WebSocket', ready: credentialReady(), endpoint: config.xfyun.iatWsApi },
            { key: 'ocr', name: '通用文档识别 OCR 大模型', type: 'WebApi', ready: credentialReady(config.ocr), endpoint: config.ocr.apiUrl },
            { key: 'image', name: '图片理解', type: 'WebSocket', ready: credentialReady(), endpoint: config.xfyun.imageWsApi },
            { key: 'ppt', name: '智能 PPT 生成', type: 'WebApi', ready: credentialReady(), endpoint: config.xfyun.pptApiUrl },
            { key: 'tts', name: '语音合成', type: 'WebSocket', ready: credentialReady(config.tts), endpoint: config.tts.wsApi }
        ]
    });
});

// ========== 1. 英语口语评测 (ISE) ==========
router.get('/ise-url', (req, res) => {
    try {
        const host = 'ise-api.xfyun.cn';
        const path = '/v2/open-ise';      // 流式版口语评测接口路径
        const url = generateAuthUrl(host, path, API_KEY, API_SECRET);
        res.json({ url, appId: APP_ID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== 2. 实时语音转写（标准版，iat 接口）==========
router.get('/asr-url', (req, res) => {
    try {
        const parsed = parseServiceUrl(config.xfyun.iatWsApi);
        const host = parsed.host;
        const path = parsed.path;
        const url = generateAuthUrl(host, path, API_KEY, API_SECRET);
        res.json({ url, appId: APP_ID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/iat-url', (req, res) => {
    try {
        const parsed = parseServiceUrl(config.xfyun.iatWsApi);
        const url = generateAuthUrl(parsed.host, parsed.path, API_KEY, API_SECRET);
        res.json({ success: true, data: { url, appId: APP_ID } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ========== 3. 实时语音转写大模型（你截图中的私有化地址）==========
router.get('/rta-bigmodel-url', (req, res) => {
    try {
        // 注意：该地址为私有化部署，需确保网络可达，且鉴权方式与标准一致
        const host = 'office-api-ast-dx.iflyai.com';
        const path = '/ast/communicate/v1';
        const url = generateAuthUrl(host, path, API_KEY, API_SECRET);
        res.json({ url, appId: APP_ID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== 4. 翻译接口（使用本地大模型）==========
router.post('/translate', async (req, res) => {
    const { text, from, to } = req.body;
    if (!text) {
        return res.status(400).json({ error: '缺少 text 参数' });
    }
    try {
        console.log('翻译请求:', { text, from, to });
        
        // 使用本地大模型进行翻译
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的翻译助手，能够准确地将中文翻译成英文，将英文翻译成中文。请直接输出翻译结果，不要添加任何额外的解释或说明。'
            },
            {
                role: 'user',
                content: `请将以下文本从${from === 'cn' ? '中文' : '英文'}翻译成${to === 'en' ? '英文' : '中文'}：\n\n${text}`
            }
        ];
        
        console.log('发送给本地大模型的消息:', messages);
        
        try {
            const translation = await llmGateway.chatText({ messages, temperature: 0.2, maxTokens: 1000 });
            console.log('翻译结果:', translation);
            
            res.json({ translation });
        } catch (modelError) {
            console.error('本地模型翻译调用失败:', modelError.message);
            res.status(500).json({ error: '翻译服务异常' });
        }
    } catch (error) {
        console.error('翻译失败:', error.message);
        console.error('错误堆栈:', error.stack);
        console.error('响应数据:', error.response?.data);
        console.error('响应状态:', error.response?.status);
        console.error('响应头:', error.response?.headers);
        res.status(500).json({ error: '翻译服务异常' });
    }
});

// ========== 5. 语音合成 (TTS) ==========
router.get('/tts-url', (req, res) => {
    try {
        const host = 'tts-api.xfyun.cn';
        const path = '/v2/tts';
        const url = generateAuthUrl(host, path, API_KEY, API_SECRET);
        res.json({ url, appId: APP_ID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== 6. 通用文档识别 OCR 大模型 ==========
router.post('/ocr/document', async (req, res) => {
    try {
        if (!credentialReady(config.ocr)) {
            return res.status(400).json({ success: false, message: '请先配置 XFYUN_OCR_APP_ID / API_KEY / API_SECRET' });
        }
        const { imageBase64, fileName, category, encoding } = req.body || {};
        if (!imageBase64) return res.status(400).json({ success: false, message: '缺少 imageBase64 参数' });

        const parsed = parseServiceUrl(config.ocr.apiUrl);
        const headers = generateHttpAuthHeaders(parsed.host, parsed.path, 'POST', config.ocr.apiKey, config.ocr.apiSecret);
        const response = await axios.post(config.ocr.apiUrl, buildOcrPayload(imageBase64, { category, encoding }), {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Host': headers.host,
                'Date': headers.date,
                'Authorization': headers.authorization
            }
        });
        const resultText = response.data?.payload?.result?.text
            ? Buffer.from(response.data.payload.result.text, 'base64').toString('utf8')
            : '';
        res.json({ success: true, data: { fileName, raw: response.data, text: resultText } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'OCR识别失败', error: error.response?.data || error.message });
    }
});

// ========== 7. 图片理解 WebSocket 鉴权URL ==========
router.get('/image-understanding-url', (req, res) => {
    try {
        const parsed = parseServiceUrl(config.xfyun.imageWsApi);
        const url = generateAuthUrl(parsed.host, parsed.path, API_KEY, API_SECRET);
        res.json({ success: true, data: { url, appId: APP_ID } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ========== 8. 智能PPT生成 ==========
router.post('/ppt/create', async (req, res) => {
    try {
        if (!credentialReady()) {
            return res.status(400).json({ success: false, message: '请先配置 XFYUN_APP_ID / API_KEY / API_SECRET' });
        }
        const { query, outline, title, author } = req.body || {};
        if (!query && !outline && !title) return res.status(400).json({ success: false, message: '缺少 PPT 主题或大纲' });

        const parsed = parseServiceUrl(config.xfyun.pptApiUrl);
        const authQuery = generateHttpAuthQuery(parsed.host, parsed.path, 'POST', API_KEY, API_SECRET);
        const separator = config.xfyun.pptApiUrl.includes('?') ? '&' : '?';
        const response = await axios.post(`${config.xfyun.pptApiUrl}${separator}${authQuery}`, {
            appId: APP_ID,
            query: query || title,
            outline,
            author: author || 'EduSmart',
            language: 'cn'
        }, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'PPT生成调用失败', error: error.response?.data || error.message });
    }
});

module.exports = router;
