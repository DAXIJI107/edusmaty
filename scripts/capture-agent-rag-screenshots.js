const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const BASE_URL = process.env.BASE_URL || "http://localhost:3020";
const DEBUG_PORT = Number(process.env.CHROME_DEBUG_PORT || 9333);
const CHROME = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = path.join(__dirname, "..", "demo-walkthrough");

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`${url} failed: ${response.status}`);
    return response.json();
}

async function login() {
    const json = await requestJson(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "zhangsan", password: "123456" })
    });
    if (!json.token) throw new Error("login did not return token");
    return json.token;
}

async function waitForChrome() {
    for (let i = 0; i < 60; i += 1) {
        try {
            const pages = await requestJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
            const page = Array.isArray(pages) && pages.find(item => item.type === "page" && item.webSocketDebuggerUrl);
            if (page) return page.webSocketDebuggerUrl;
        } catch {}
        await wait(250);
    }
    throw new Error("Chrome DevTools endpoint is not ready");
}

function createCdp(wsUrl) {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();

    ws.on("message", raw => {
        const msg = JSON.parse(raw.toString());
        if (msg.id && pending.has(msg.id)) {
            const { resolve, reject } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) reject(new Error(msg.error.message));
            else resolve(msg.result || {});
        }
    });

    return new Promise((resolve, reject) => {
        ws.on("open", () => {
            resolve({
                send(method, params = {}) {
                    id += 1;
                    ws.send(JSON.stringify({ id, method, params }));
                    return new Promise((res, rej) => pending.set(id, { resolve: res, reject: rej }));
                },
                close() {
                    ws.close();
                }
            });
        });
        ws.on("error", reject);
    });
}

async function saveScreenshot(cdp, filename) {
    const result = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: true
    });
    const file = path.join(OUT_DIR, filename);
    fs.writeFileSync(file, Buffer.from(result.data, "base64"));
    return file;
}

async function saveElementScreenshot(cdp, selector, filename) {
    const rectResult = await cdp.send("Runtime.evaluate", {
        expression: `
            (() => {
                const el = document.querySelector(${JSON.stringify(selector)});
                if (!el) return null;
                el.scrollIntoView({ block: 'center', inline: 'center' });
                const r = el.getBoundingClientRect();
                return { x: r.x, y: r.y, width: r.width, height: r.height, dpr: window.devicePixelRatio || 1 };
            })()
        `,
        returnByValue: true
    });
    await wait(800);
    const rect = rectResult.result?.value;
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    const result = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        clip: {
            x: Math.max(0, rect.x - 12),
            y: Math.max(0, rect.y - 12),
            width: Math.min(1400, rect.width + 24),
            height: Math.min(1100, rect.height + 24),
            scale: 1
        }
    });
    const file = path.join(OUT_DIR, filename);
    fs.writeFileSync(file, Buffer.from(result.data, "base64"));
    return file;
}

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const token = await login();
    const profileDir = path.join(__dirname, "..", ".codex-screenshot-profile");
    const chrome = spawn(
        CHROME,
        [
            "--headless=new",
            `--remote-debugging-port=${DEBUG_PORT}`,
            `--user-data-dir=${profileDir}`,
            "--window-size=1440,1200",
            "--hide-scrollbars",
            "--disable-gpu",
            "--no-first-run",
            "about:blank"
        ],
        { stdio: "ignore" }
    );

    let cdp;
    try {
        cdp = await createCdp(await waitForChrome());
        await cdp.send("Page.enable");
        await cdp.send("Runtime.enable");
        await cdp.send("Network.enable");
        await cdp.send("Network.setCookie", {
            name: "token",
            value: token,
            url: BASE_URL,
            path: "/"
        });

        await cdp.send("Page.navigate", { url: `${BASE_URL}/agent-research` });
        await wait(5500);
        const researchShot = await saveScreenshot(cdp, "agent-rag-01-research-center.png");

        await cdp.send("Runtime.evaluate", {
            expression: `
                (() => {
                    const buttons = Array.from(document.querySelectorAll('[data-agent-source-plan]'));
                    const target = buttons.find(btn => (btn.dataset.agentSourcePlan || '').includes('Hello-Agents')) || buttons[0];
                    if (target) target.click();
                    return !!target;
                })()
            `,
            awaitPromise: true
        });
        await wait(14000);
        const assistantShot = await saveScreenshot(cdp, "agent-rag-02-assistant-result.png");

        await cdp.send("Runtime.evaluate", {
            expression: `window.scrollTo(0, Math.max(0, document.body.scrollHeight * 0.35)); true`
        });
        await wait(1000);
        const evidenceShot = await saveScreenshot(cdp, "agent-rag-03-evidence-chain.png");
        const evidenceCardShot = await saveElementScreenshot(cdp, ".assistant-rag-card", "agent-rag-04-rag-card.png");

        console.log(JSON.stringify({ researchShot, assistantShot, evidenceShot, evidenceCardShot }, null, 2));
    } finally {
        if (cdp) cdp.close();
        chrome.kill();
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
