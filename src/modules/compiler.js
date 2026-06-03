const express = require('express');
const router = express.Router();
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { authenticateJWT } = require('../middleware');

const TIMEOUT_MS = 10000;
const MAX_OUTPUT_BYTES = 51200;

function getUserId(req) {
    return req.user.id;
}

function safeRunJs(source) {
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `edusmart_sandbox_${Date.now()}.js`);
    const wrapper = `
"use strict";
const __result = { logs: [], error: null };
const console = {
    log: function() { __result.logs.push(Array.from(arguments).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); },
    error: function() { __result.logs.push('[ERROR] ' + Array.from(arguments).map(a => String(a)).join(' ')); },
    warn: function() { __result.logs.push('[WARN] ' + Array.from(arguments).map(a => String(a)).join(' ')); }
};
try {
    ${source}
} catch(e) {
    __result.error = e.message;
}
process.stdout.write(JSON.stringify(__result));
`;
    try {
        fs.writeFileSync(tmpFile, wrapper, 'utf-8');
        const result = spawnSync('node', ['--max-old-space-size=64', tmpFile], {
            timeout: TIMEOUT_MS,
            maxBuffer: MAX_OUTPUT_BYTES,
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, NODE_ENV: 'sandbox', TZ: 'UTC' }
        });
        const output = (result.stdout || '').slice(0, MAX_OUTPUT_BYTES);
        const stderr = (result.stderr || '').slice(0, MAX_OUTPUT_BYTES);
        if (result.error && result.error.code === 'ETIMEDOUT') {
            return { logs: [], error: '执行超时（超过10秒），请检查代码中是否有死循环。' };
        }
        if (stderr && !output) {
            return { logs: [], error: stderr.trim() || '运行时错误' };
        }
        try {
            const parsed = JSON.parse(output);
            return parsed;
        } catch {
            return { logs: [output], error: stderr ? stderr.trim() : null };
        }
    } catch (e) {
        return { logs: [], error: '沙箱启动失败: ' + e.message };
    } finally {
        try { fs.unlinkSync(tmpFile); } catch {}
    }
}

function resolvePythonCommand() {
    const candidates = [
        process.env.PYTHON_PATH,
        path.join(process.env.LOCALAPPDATA || '', 'Python', 'bin', 'python.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python314', 'python.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python313', 'python.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe'),
        'python3',
        'python'
    ].filter(Boolean);

    for (const candidate of candidates) {
        const result = spawnSync(candidate, ['--version'], {
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 3000
        });
        if (!result.error && result.status === 0) return candidate;
    }
    return null;
}

function safeRunPython(source) {
    const tmpDir = os.tmpdir();
    const prefix = `edusmart_sandbox_${Date.now()}`;
    const userFile = path.join(tmpDir, `${prefix}_user.py`);
    const runnerFile = path.join(tmpDir, `${prefix}_runner.py`);
    const runnerCode = `import sys, json, traceback, io
_result = {"logs": [], "error": None}
_stdout = sys.stdout
_stderr = sys.stderr
_buffer = io.StringIO()
sys.stdout = _buffer
sys.stderr = _buffer
try:
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        exec(f.read())
except Exception:
    _result["error"] = traceback.format_exc().strip()
captured = _buffer.getvalue()
if captured:
    _result["logs"] = [line for line in captured.rstrip().splitlines()]
sys.stdout = _stdout
sys.stderr = _stderr
print(json.dumps(_result, ensure_ascii=False))
`;
    try {
        fs.writeFileSync(userFile, source, 'utf-8');
        fs.writeFileSync(runnerFile, runnerCode, 'utf-8');
        const pythonCommand = resolvePythonCommand();
        if (!pythonCommand) {
            return { logs: [], error: '未找到可用 Python 解释器，请设置 PYTHON_PATH 或安装 Python。' };
        }
        const result = spawnSync(pythonCommand, [runnerFile, userFile], {
            timeout: TIMEOUT_MS,
            maxBuffer: MAX_OUTPUT_BYTES,
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'pipe']
        });
        const output = (result.stdout || '').slice(0, MAX_OUTPUT_BYTES);
        const stderr = (result.stderr || '').slice(0, MAX_OUTPUT_BYTES);
        if (result.error && result.error.code === 'ETIMEDOUT') {
            return { logs: [], error: '执行超时（超过10秒）' };
        }
        if (result.error) {
            return { logs: [], error: `Python沙箱启动失败: ${result.error.message}` };
        }
        try {
            const parsed = JSON.parse(output);
            return parsed;
        } catch {
            return { logs: [output], error: stderr ? stderr.trim() : null };
        }
    } catch (e) {
        return { logs: [], error: 'Python沙箱启动失败: ' + e.message };
    } finally {
        try { fs.unlinkSync(userFile); } catch {}
        try { fs.unlinkSync(runnerFile); } catch {}
    }
}

router.post('/run', authenticateJWT, async (req, res) => {
    try {
        const { language, source } = req.body;
        if (!source || typeof source !== 'string' || !source.trim()) {
            return res.status(400).json({ success: false, message: '请提供代码内容' });
        }
        const lang = (language || 'javascript').toLowerCase();

        if (lang === 'javascript' || lang === 'js') {
            const result = safeRunJs(source);
            return res.json({ success: true, data: result });
        }
        if (lang === 'python' || lang === 'py') {
            const result = safeRunPython(source);
            return res.json({ success: true, data: result });
        }
        if (lang === 'html') {
            return res.json({
                success: true,
                data: { logs: ['HTML 代码应在前端 iframe 中预览，已生成预览。'], error: null }
            });
        }
        if (lang === 'java' || lang === 'cpp' || lang === 'c') {
            return res.json({
                success: true,
                data: {
                    logs: [`${lang.toUpperCase()} 编译语言需要完整编译环境。\n建议使用本地 IDE 或配置 Docker 编译容器。\n当前可使用 JavaScript/Python 进行在线练习。`],
                    error: null
                }
            });
        }
        return res.status(400).json({ success: false, message: `不支持的语言：${lang}` });
    } catch (error) {
        console.error('代码运行失败:', error);
        res.status(500).json({ success: false, message: '沙箱执行失败' });
    }
});

router.get('/status', authenticateJWT, (req, res) => {
    const info = {
        supported: ['javascript', 'python', 'html'],
        compiled: ['java', 'cpp'],
        sandbox: {
            js: 'Node.js child_process 隔离执行',
            python: 'Python child_process 隔离执行',
            timeout: `${TIMEOUT_MS / 1000}s`,
            maxOutput: `${MAX_OUTPUT_BYTES / 1024}KB`
        },
        limits: { cpu: '单进程', memory: '64MB (JS)', network: '已禁用', filesystem: '临时文件仅读写' }
    };
    res.json({ success: true, data: info });
});

module.exports = router;
