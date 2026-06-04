const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("ws");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs", "screenshots", "showcase");
const baseUrl = process.env.EDUSMART_BASE_URL || "http://localhost:3020";
const browserPath =
    process.env.EDUSMART_BROWSER ||
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const pages = [
    ["01-login", "/", "登录与注册"],
    ["02-home", "/home", "学习中心首页"],
    ["03-diagnostic", "/diagnostic", "智能诊断"],
    ["04-profile", "/profile", "学习画像"],
    ["05-path", "/path", "个性化学习路径"],
    ["06-study-plan", "/study-plan", "今日学习计划"],
    ["07-knowledge-base", "/agent-center", "计算机知识库"],
    ["08-rag-search", "/rag-search", "RAG 智能检索"],
    ["09-smart-notes", "/smart-notes", "智能笔记"],
    ["10-knowledge-graph", "/knowledge-graph", "知识图谱"],
    ["11-concept-canvas", "/concept-canvas", "概念画布"],
    ["12-code-lab", "/code-lab", "编程实践"],
    ["13-team-code", "/team-code", "团队编程"],
    ["14-agent-research", "/agent-research", "Agent 研究中心"],
    ["15-account", "/account", "账户中心"]
];

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
    return new Promise((resolve, reject) => {
        http
            .get(url, res => {
                let body = "";
                res.on("data", chunk => (body += chunk));
                res.on("end", () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (error) {
                        reject(error);
                    }
                });
            })
            .on("error", reject);
    });
}

async function waitForDebugger(port) {
    for (let i = 0; i < 40; i++) {
        try {
            const targets = await getJson(`http://127.0.0.1:${port}/json/list`);
            const page = targets.find(target => target.type === "page" && target.webSocketDebuggerUrl);
            if (page) return page;
        } catch {
            await wait(250);
        }
    }
    throw new Error("Browser debugger did not become available.");
}

function createClient(wsUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        let id = 0;
        const pending = new Map();

        ws.on("open", () => {
            const client = {
                send(method, params = {}) {
                    const messageId = ++id;
                    ws.send(JSON.stringify({ id: messageId, method, params }));
                    return new Promise((res, rej) => {
                        const timer = setTimeout(() => {
                            pending.delete(messageId);
                            rej(new Error(`${method} timed out`));
                        }, 15000);
                        pending.set(messageId, {
                            res(result) {
                                clearTimeout(timer);
                                res(result);
                            },
                            rej(error) {
                                clearTimeout(timer);
                                rej(error);
                            }
                        });
                    });
                },
                close() {
                    ws.close();
                }
            };
            resolve(client);
        });

        ws.on("message", data => {
            const message = JSON.parse(data);
            if (!message.id || !pending.has(message.id)) return;
            const { res, rej } = pending.get(message.id);
            pending.delete(message.id);
            if (message.error) rej(new Error(message.error.message));
            else res(message.result);
        });

        ws.on("error", reject);
    });
}

async function capture(client, slug, route, title, loggedIn) {
    console.log(`capturing ${slug} ${route}`);
    await client.send("Page.navigate", { url: `${baseUrl}${route}` });
    await wait(2200);
    if (loggedIn) {
        await client.send("Runtime.evaluate", {
            expression: `
                localStorage.setItem("edusmart_user", JSON.stringify({
                    id: 1,
                    username: "zhangsan",
                    email: "zhangsan@edusmart.local",
                    role: "student",
                    isNewUser: false
                }));
            `
        });
        await client.send("Page.navigate", { url: `${baseUrl}${route}` });
        await wait(2600);
    }
    await client.send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
    await wait(500);
    const shot = await client.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
        fromSurface: true
    });
    fs.writeFileSync(path.join(outDir, `${slug}.png`), Buffer.from(shot.data, "base64"));
    console.log(`${slug}.png - ${title}`);
}

async function main() {
    fs.mkdirSync(outDir, { recursive: true });
    const port = 9223 + Math.floor(Math.random() * 1000);
    const profile = path.join(root, ".tmp", `screenshot-profile-${port}`);
    fs.mkdirSync(profile, { recursive: true });

    const browser = spawn(browserPath, [
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profile}`,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1440,1000",
        "about:blank"
    ]);

    browser.stderr.on("data", data => process.stderr.write(data));

    let client;
    try {
        const pageTarget = await waitForDebugger(port);
        client = await createClient(pageTarget.webSocketDebuggerUrl);
        await client.send("Page.enable");
        await client.send("Runtime.enable");
        await client.send("Network.enable");
        await client.send("Emulation.setDeviceMetricsOverride", {
            width: 1440,
            height: 1000,
            deviceScaleFactor: 1,
            mobile: false
        });

        await capture(client, pages[0][0], pages[0][1], pages[0][2], false);

        await client.send("Page.navigate", { url: `${baseUrl}/` });
        await wait(1000);
        const login = await client.send("Runtime.evaluate", {
            awaitPromise: true,
            expression: `
                fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: "zhangsan", password: "123456" })
                }).then(r => r.json()).then(json => {
                    localStorage.setItem("edusmart_user", JSON.stringify({
                        ...(json.user || {}),
                        isNewUser: false
                    }));
                    return json;
                })
            `
        });
        const token = login.result?.value?.token;
        if (token) {
            await client.send("Network.setCookie", {
                name: "token",
                value: token,
                url: baseUrl,
                path: "/",
                httpOnly: true,
                sameSite: "Lax"
            });
        }

        for (const [slug, route, title] of pages.slice(1)) {
            await capture(client, slug, route, title, true);
        }
    } finally {
        if (client) {
            await client.send("Browser.close").catch(() => null);
            client.close();
        }
        browser.kill();
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
