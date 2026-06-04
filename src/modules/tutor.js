const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const router = express.Router();
const pool = require("../db");
const config = require("../config");
const { authenticateJWT } = require("../middleware");
const { ensureKnowledgeData } = require("../core/DemoDataSeeder");
const llmGateway = require("../core/llm/LlmGateway");

function detectInputType({ text, imageData, fileName }) {
    const content = String(text || "").toLowerCase();
    const name = String(fileName || "").toLowerCase();
    if (imageData && (content.includes("报错") || content.includes("error") || name.includes("code")))
        return "code_image";
    if (imageData) return "formula_image";
    if (
        content.includes("error") ||
        content.includes("exception") ||
        content.includes("报错") ||
        content.includes("代码")
    )
        return "code";
    return "text";
}

function buildOcrPlaceholder({ text, fileName, inputType }) {
    if (!fileName) return "";
    const hint = inputType.includes("code")
        ? "已接收代码/报错截图，可在生产环境接入讯飞OCR提取完整错误栈。"
        : "已接收公式截图，可在生产环境接入讯飞OCR提取公式文本。";
    return `${hint}\n附件: ${fileName}\n学生补充说明: ${text || "无"}`;
}

function parseDataUrlImage(imageData) {
    const value = String(imageData || "");
    const match = value.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
        return {
            encoding: match[1] === "jpg" ? "jpg" : match[1],
            base64: match[2]
        };
    }
    return { encoding: "jpg", base64: value };
}

function buildXfyunAuthUrl(rawUrl) {
    const url = new URL(rawUrl);
    const date = new Date().toUTCString();
    const requestLine = `POST ${url.pathname} HTTP/1.1`;
    const signatureOrigin = `host: ${url.host}\ndate: ${date}\n${requestLine}`;
    const signature = crypto.createHmac("sha256", config.ocr.apiSecret).update(signatureOrigin).digest("base64");
    const authorizationOrigin = `api_key="${config.ocr.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString("base64");

    url.searchParams.set("authorization", authorization);
    url.searchParams.set("host", url.host);
    url.searchParams.set("date", date);
    return url.toString();
}

function decodeOcrPayloadText(result = {}) {
    const text = result.text || "";
    if (!text) return "";
    const decoded = Buffer.from(text, "base64").toString(result.encoding || "utf8");
    if (result.format === "json") {
        try {
            return JSON.stringify(JSON.parse(decoded), null, 2);
        } catch (error) {
            return decoded;
        }
    }
    return decoded;
}

function extractOcrText(responseData) {
    const header = responseData?.header || {};
    if (Number(header.code || 0) !== 0) {
        throw new Error(header.message || `OCR返回异常: ${header.code}`);
    }
    const result = responseData?.payload?.result || {};
    return decodeOcrPayloadText(result).trim();
}

async function callXfyunOcr(imageData, inputType) {
    const { encoding, base64 } = parseDataUrlImage(imageData);
    if (!base64) return "";
    if (!config.ocr?.appId || !config.ocr?.apiKey || !config.ocr?.apiSecret) {
        throw new Error("缺少讯飞OCR配置");
    }

    const authUrl = buildXfyunAuthUrl(config.ocr.apiUrl);
    const response = await axios.post(
        authUrl,
        {
            header: {
                app_id: config.ocr.appId,
                status: 0
            },
            parameter: {
                ocr: {
                    result_option: "normal",
                    result_format: "json,markdown",
                    output_type: "one_shot",
                    exif_option: "0",
                    markdown_element_option:
                        inputType === "formula_image"
                            ? "watermark=0,page_header=0,page_footer=0,page_number=0,formula=1,code=1"
                            : "watermark=0,page_header=0,page_footer=0,page_number=0,code=1,formula=1",
                    alpha_option: "0",
                    rotation_min_angle: 5,
                    result: {
                        encoding: "utf8",
                        compress: "raw",
                        format: "plain"
                    }
                }
            },
            payload: {
                image: {
                    encoding,
                    image: base64,
                    status: 0,
                    seq: 0
                }
            }
        },
        {
            headers: { "Content-Type": "application/json" },
            timeout: 30000
        }
    );

    return extractOcrText(response.data);
}

function splitKeywords(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, " ")
        .split(/\s+/)
        .map(item => item.trim())
        .filter(item => item.length >= 2)
        .slice(0, 8);
}

function scoreNode(node, keywords, rawText) {
    const haystack = `${node.name || ""} ${node.description || ""}`.toLowerCase();
    let score = 0;
    if (rawText && haystack.includes(rawText.toLowerCase())) score += 5;
    keywords.forEach(keyword => {
        if (haystack.includes(keyword)) score += 2;
    });
    return score;
}

async function locateKnowledge(subject, query) {
    let nodes = [];
    const params = [];
    let whereClause = "WHERE is_active = 1";
    if (subject && subject !== "all") {
        whereClause += " AND subject = ?";
        params.push(subject);
    }
    try {
        await ensureKnowledgeData(pool);
        [nodes] = await pool.query(
            `SELECT id, name, description, difficulty, subject
             FROM knowledge_nodes
             ${whereClause}
             ORDER BY id
             LIMIT 200`,
            params
        );
    } catch (error) {
        const fallbackParams = [];
        const fallbackWhere = [];
        if (subject && subject !== "all") {
            fallbackWhere.push("subject = ?");
            fallbackParams.push(subject);
        }
        const fallbackSql = `
            SELECT id,
                   title AS name,
                   COALESCE(summary, title) AS description,
                   COALESCE(difficulty, '中等') AS difficulty,
                   subject
            FROM knowledge_points
            ${fallbackWhere.length ? `WHERE ${fallbackWhere.join(" AND ")}` : ""}
            ORDER BY mastery ASC, id
            LIMIT 200`;
        [nodes] = await pool.query(fallbackSql, fallbackParams).catch(() => [[]]);
    }
    const keywords = splitKeywords(query);
    const ranked = nodes
        .map(node => ({ ...node, score: scoreNode(node, keywords, query) }))
        .sort((a, b) => b.score - a.score);
    const top = ranked[0];
    if (!top || top.score <= 0) return null;

    const [edges] = await pool
        .query(
            `SELECT p.prereq_id AS source, p.node_id AS target, k1.name AS sourceName, k2.name AS targetName
         FROM prerequisites p
         JOIN knowledge_nodes k1 ON k1.id = p.prereq_id
         JOIN knowledge_nodes k2 ON k2.id = p.node_id
         WHERE p.node_id = ? OR p.prereq_id = ?
         LIMIT 12`,
            [top.id, top.id]
        )
        .catch(() => [[]]);

    return {
        id: top.id,
        name: top.name,
        subject: top.subject,
        difficulty: top.difficulty,
        description: top.description,
        score: top.score,
        neighbors: edges
    };
}

async function callSpark(messages) {
    try {
        return await llmGateway.chatText({ messages, temperature: 0.45, maxTokens: 1600 });
    } catch (error) {
        console.warn("智能辅导模型调用失败，使用兜底回答:", error.message);
        return "";
    }
}

function fallbackAnswer(inputType, located, question) {
    const topic = located?.name || "当前问题";
    if (inputType.includes("code")) {
        return `我先按代码排错思路帮你定位：\n1. 先确认报错类型和第一行错误位置；\n2. 再检查变量名、依赖版本、输入输出格式；\n3. 最后用最小可复现代码验证。\n\n这个问题可能关联「${topic}」。你可以继续补充完整错误栈，我会帮你逐行拆。`;
    }
    return `这个问题可能关联「${topic}」。建议先抓住三个层次：定义是什么、条件是什么、典型题/案例怎么用。你可以先尝试说出你卡住的是概念、公式变形还是例题步骤，我会继续往下引导。`;
}

router.post("/ask", authenticateJWT, async (req, res) => {
    try {
        const text = String(req.body?.text || "").trim();
        const subject = String(req.body?.subject || "all").trim();
        const imageData = req.body?.imageData || "";
        const fileName = req.body?.fileName || "";
        if (!text && !imageData) {
            return res.status(400).json({ success: false, message: "请输入文字或上传图片" });
        }

        const inputType = detectInputType({ text, imageData, fileName });
        let ocrText = "";
        if (imageData) {
            try {
                ocrText = await callXfyunOcr(imageData, inputType);
            } catch (error) {
                console.warn("讯飞OCR调用失败，使用占位文本:", error.message);
                ocrText = buildOcrPlaceholder({ text, fileName, inputType });
            }
        }
        const mergedQuery = [text, ocrText].filter(Boolean).join("\n");
        const located = await locateKnowledge(subject, mergedQuery);
        const agent = inputType.includes("code") ? "CodeAgent" : "DocumentAgent";

        const systemPrompt = `你是EduSmart智能辅导编排器下的${agent}。请用中文回答，要求：
1. 先给出直接可执行的解释或排错路径；
2. 给出知识图谱定位；
3. 给出一个适合制作难点动图的演示脚本；
4. 给出一个1分钟短视频回讲提纲；
5. 不编造不可验证的截图OCR内容，若OCR只是占位需明确让学生补充关键信息。`;
        const userPrompt = `学科: ${subject}
输入类型: ${inputType}
知识点定位: ${located ? `${located.name}(${located.subject})` : "未定位"}
学生问题:
${mergedQuery}`;

        const modelAnswer = await callSpark([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ]);
        const answer = modelAnswer || fallbackAnswer(inputType, located, mergedQuery);

        res.json({
            success: true,
            data: {
                inputType,
                routedAgent: agent,
                ocr: {
                    enabled: Boolean(imageData),
                    provider:
                        ocrText && !ocrText.includes("可在生产环境接入讯飞OCR")
                            ? "xfyun-ocr-large-model"
                            : "xfyun-ocr-fallback",
                    text: ocrText
                },
                answer,
                graphLocation: located,
                animation: {
                    type: "gif-script",
                    title: located ? `${located.name}难点动图` : "难点变化动图",
                    script: located
                        ? `用3帧展示「${located.name}」：概念输入 -> 中间变化 -> 结果反馈。`
                        : "用3帧展示问题输入、关键变化和最终结论。"
                },
                recapVideo: {
                    duration: 60,
                    title: located ? `${located.name} 1分钟回讲` : "1分钟问题回讲",
                    outline: ["问题复述", "关键概念", "最小例子", "下一步练习"]
                }
            }
        });
    } catch (error) {
        console.error("智能辅导失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

module.exports = router;
