const fs = require("fs");
const path = require("path");
const { resolveDataPath } = require("../../utils/path-resolver");

const defaultLogFile = resolveDataPath("ai-question-log.jsonl");

function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeText(value, maxLength = 12000) {
    const text = String(value || "");
    return text.length > maxLength ? `${text.slice(0, maxLength)}...[truncated]` : text;
}

function normalizeMessages(messages = []) {
    return (Array.isArray(messages) ? messages : []).map(message => ({
        role: String(message.role || "user"),
        content: normalizeText(message.content)
    }));
}

function extractQuestion(messages = []) {
    const userMessages = normalizeMessages(messages).filter(message => message.role === "user");
    return userMessages.at(-1)?.content || "";
}

function resolveLogFile() {
    return path.resolve(process.env.AI_QUESTION_LOG_FILE || defaultLogFile);
}

function append(entry = {}) {
    const logFile = resolveLogFile();
    ensureDir(logFile);
    const record = {
        id: entry.id || `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: entry.timestamp || new Date().toISOString(),
        provider: entry.provider || "unknown",
        model: entry.model || "",
        status: entry.status || "unknown",
        durationMs: Number(entry.durationMs || 0),
        question: normalizeText(entry.question || extractQuestion(entry.messages)),
        messages: normalizeMessages(entry.messages),
        answer: normalizeText(entry.answer),
        usage: entry.usage || null,
        error: entry.error ? normalizeText(entry.error, 2000) : null
    };
    fs.appendFileSync(logFile, `${JSON.stringify(record)}\n`, "utf8");
    return record;
}

function readRecent(limit = 50) {
    const logFile = resolveLogFile();
    if (!fs.existsSync(logFile)) {
        return { file: logFile, items: [] };
    }
    const lines = fs
        .readFileSync(logFile, "utf8")
        .split(/\r?\n/)
        .filter(Boolean);
    const items = lines
        .slice(-Math.max(1, Math.min(Number(limit) || 50, 200)))
        .map(line => {
            try {
                return JSON.parse(line);
            } catch (error) {
                return { status: "parse-error", raw: line, error: error.message };
            }
        })
        .reverse();
    return { file: logFile, items };
}

module.exports = { append, readRecent, resolveLogFile };
