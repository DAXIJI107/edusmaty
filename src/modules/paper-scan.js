// api/paper-scan.js — 试卷扫描识别
const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const config = require('../config');
const { generateHttpAuthHeaders } = require('../utils/xfyunAuth');
const llmGateway = require('../core/llm/LlmGateway');

function credentialReady(sc = config.ocr) {
    return Boolean(sc.appId && sc.apiKey && sc.apiSecret);
}

function parseServiceUrl(rawUrl) {
    const url = new URL(rawUrl);
    return { host: url.host, path: `${url.pathname}${url.search || ''}`, origin: `${url.protocol}//${url.host}` };
}

function stripDataUrl(value = '') {
    return String(value || '').replace(/^data:[^;]+;base64,/, '');
}

// ── 调用讯飞 OCR 获取图片文本 ──
async function callOcrApi(imageBase64) {
    const parsed = parseServiceUrl(config.ocr.apiUrl);
    const headers = generateHttpAuthHeaders(parsed.host, parsed.path, 'POST', config.ocr.apiKey, config.ocr.apiSecret);
    const payload = {
        header: { app_id: config.ocr.appId, status: 3 },
        parameter: {
            se75ocrbm: {
                category: 'ch_en_public_cloud',
                result: { encoding: 'utf8', compress: 'raw', format: 'json' }
            }
        },
        payload: {
            image: {
                encoding: 'jpg',
                image: stripDataUrl(imageBase64),
                status: 3
            }
        }
    };
    const response = await axios.post(config.ocr.apiUrl, payload, {
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
    return resultText;
}

// ── 调用本地 LLM 解析试卷文本为结构化题目 ──
async function parseQuestionsWithAI(rawText) {
    const prompt = `你是一个专业的试卷解析助手。请根据以下OCR识别出的试卷文本，提取所有题目并格式化为JSON数组。

要求：
1. 识别每道题的题干（content）、类型（type：single选择题 / multiple多选题 / fill填空 / short简答 / truefalse判断题）、选项（options，选择题才有）、正确答案（answer，如果有标注的话）、难度（difficulty：easy/medium/hard）、所属学科（subject）。
2. 如果没有标注答案，answer字段留空字符串。
3. 如果识别不出学科，根据题目内容推断，常见学科：math数学、chinese语文、english英语、physics物理、chemistry化学、biology生物、history历史、geography地理、politics政治。
4. 只输出JSON数组，不要任何其他文字。

OCR文本如下：
---
${rawText}
---`;

    let aiResult;
    try {
        aiResult = await llmGateway.chatText({
            messages: [
                { role: 'system', content: '你是一个专业的试卷解析助手。你只输出JSON数组，不输出任何额外文字。' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            maxTokens: 4096
        });
    } catch (e) {
        console.error('本地 AI 解析失败:', e.message);
        // 回退：返回原始文本作为一道简答题
        return [{ content: rawText, type: 'short', options: [], answer: '', difficulty: 'medium', subject: '' }];
    }

    // 尝试解析 JSON
    try {
        const cleaned = aiResult.replace(/```json\s*|```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed.map(q => ({
            content: q.content || q.题干 || '',
            type: q.type || q.题型 || 'single',
            options: Array.isArray(q.options) ? q.options : (Array.isArray(q.选项) ? q.选项 : []),
            answer: q.answer || q.答案 || q.正确答案 || '',
            difficulty: q.difficulty || q.难度 || 'medium',
            subject: q.subject || q.学科 || ''
        })) : [];
    } catch (e) {
        return [{ content: rawText, type: 'short', options: [], answer: '', difficulty: 'medium', subject: '' }];
    }
}

// ── 初始化 paper_scans 表 ──
async function ensureTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS paper_scans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            file_name VARCHAR(255),
            ocr_text LONGTEXT,
            parsed_questions JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// ── POST /scan — 上传试卷图片，OCR识别后AI解析 ──
router.post('/scan', async (req, res) => {
    try {
        if (!credentialReady()) {
            return res.status(400).json({ success: false, message: '请先配置讯飞OCR凭证' });
        }
        const { imageBase64, fileName } = req.body || {};
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: '请上传试卷图片' });
        }

        // Step 1: OCR 识别
        console.log('[paper-scan] 开始OCR识别...');
        const ocrText = await callOcrApi(imageBase64);
        if (!ocrText) {
            return res.json({ success: false, message: 'OCR未识别到文字，请确保图片清晰' });
        }
        console.log(`[paper-scan] OCR识别完成，文本长度: ${ocrText.length}`);

        // Step 2: AI 解析题目
        console.log('[paper-scan] 开始AI解析...');
        const questions = await parseQuestionsWithAI(ocrText);
        console.log(`[paper-scan] AI解析完成，识别到 ${questions.length} 道题`);

        // Step 3: 存储扫描记录
        await ensureTable();
        const userId = req.user?.id || 1;
        const [result] = await db.execute(
            `INSERT INTO paper_scans (user_id, file_name, ocr_text, parsed_questions) VALUES (?, ?, ?, ?)`,
            [userId, fileName || 'paper.jpg', ocrText, JSON.stringify(questions)]
        );

        res.json({
            success: true,
            data: {
                scanId: result.insertId,
                fileName: fileName || 'paper.jpg',
                ocrText,
                questions
            }
        });
    } catch (error) {
        console.error('[paper-scan] 扫描失败:', error.message);
        res.status(500).json({ success: false, message: '扫描识别失败', error: error.message });
    }
});

// ── GET /history — 获取扫描历史 ──
router.get('/history', async (req, res) => {
    try {
        await ensureTable();
        const userId = req.user?.id || 1;
        const [rows] = await db.query(
            `SELECT id, file_name, created_at FROM paper_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── GET /history/:id — 获取扫描详情 ──
router.get('/history/:id', async (req, res) => {
    try {
        await ensureTable();
        const [rows] = await db.query(`SELECT * FROM paper_scans WHERE id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: '记录不存在' });
        const row = rows[0];
        row.parsed_questions = typeof row.parsed_questions === 'string' ? JSON.parse(row.parsed_questions) : (row.parsed_questions || []);
        res.json({ success: true, data: row });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── POST /save — 保存识别的题目到题库 ──
router.post('/save', async (req, res) => {
    try {
        const { questions } = req.body || {};
        if (!Array.isArray(questions) || !questions.length) {
            return res.status(400).json({ success: false, message: '请提供要保存的题目列表' });
        }

        let saved = 0;
        for (const q of questions) {
            if (!q.content) continue;
            const type = q.type || 'single';
            const options = Array.isArray(q.options) ? JSON.stringify(q.options) : '[]';
            const answer = typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer || '');
            const difficulty = q.difficulty || 'medium';
            const subject = q.subject || '';
            const score = q.score || 5;

            await db.execute(
                `INSERT INTO questions (content, type, options, answer, difficulty, score, subject, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                [q.content, type, options, answer, difficulty, score, subject]
            );
            saved++;
        }

        res.json({ success: true, data: { saved } });
    } catch (error) {
        console.error('[paper-scan] 保存失败:', error.message);
        res.status(500).json({ success: false, message: '保存失败', error: error.message });
    }
});

module.exports = router;
