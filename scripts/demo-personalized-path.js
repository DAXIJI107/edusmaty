const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'demo-walkthrough');
fs.mkdirSync(outDir, { recursive: true });

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(root, '.demo-chrome-profile');
const baseUrl = 'http://localhost:3020';
const debugPort = 9223;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function connectCdp() {
  for (let i = 0; i < 30; i += 1) {
    try {
      const pages = await getJson(`http://localhost:${debugPort}/json`);
      const page = pages.find(item => item.type === 'page' && item.webSocketDebuggerUrl) || pages[0];
      if (page?.webSocketDebuggerUrl) return new WebSocket(page.webSocketDebuggerUrl);
    } catch {
      await sleep(500);
    }
  }
  throw new Error('无法连接 Chrome 调试端口');
}

function createClient(ws) {
  let id = 0;
  const callbacks = new Map();
  ws.on('message', raw => {
    const msg = JSON.parse(raw);
    if (callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result || {});
    }
  });
  return {
    send(method, params = {}) {
      const msgId = ++id;
      ws.send(JSON.stringify({ id: msgId, method, params }));
      return new Promise((resolve, reject) => callbacks.set(msgId, { resolve, reject }));
    }
  };
}

async function run() {
  if (!fs.existsSync(chrome)) {
    throw new Error(`未找到 Chrome: ${chrome}`);
  }

  const browser = spawn(chrome, [
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    '--new-window',
    '--window-size=1440,980',
    baseUrl
  ], { detached: true, stdio: 'ignore' });
  browser.unref();

  const ws = await connectCdp();
  await new Promise(resolve => ws.once('open', resolve));
  const cdp = createClient(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  async function evalJs(expression, awaitPromise = true) {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue: true
    });
    return result.result && result.result.value;
  }

  async function navigate(url) {
    await cdp.send('Page.navigate', { url });
    await sleep(1200);
  }

  async function waitFor(selector, timeout = 10000) {
    const safe = JSON.stringify(selector);
    const ok = await evalJs(`new Promise(resolve => {
      const started = Date.now();
      const tick = () => {
        if (document.querySelector(${safe})) return resolve(true);
        if (Date.now() - started > ${timeout}) return resolve(false);
        setTimeout(tick, 120);
      };
      tick();
    })`);
    if (!ok) throw new Error(`等待元素超时: ${selector}`);
  }

  async function caption(text, selector = '') {
    await evalJs(`(() => {
      document.querySelectorAll('.codex-demo-caption,.codex-demo-ring').forEach(n => n.remove());
      const cap = document.createElement('div');
      cap.className = 'codex-demo-caption';
      cap.textContent = ${JSON.stringify(text)};
      Object.assign(cap.style, {
        position:'fixed', left:'28px', bottom:'28px', zIndex:999999,
        background:'#fff', color:'#10203f', padding:'14px 18px',
        border:'2px solid #2f6bff', borderRadius:'12px',
        boxShadow:'0 18px 50px rgba(15,23,42,.22)', font:'600 18px system-ui'
      });
      document.body.appendChild(cap);
      const target = ${selector ? `document.querySelector(${JSON.stringify(selector)})` : 'null'};
      if (target) {
        const r = target.getBoundingClientRect();
        const ring = document.createElement('div');
        ring.className = 'codex-demo-ring';
        Object.assign(ring.style, {
          position:'fixed', left:(r.left-8)+'px', top:(r.top-8)+'px',
          width:(r.width+16)+'px', height:(r.height+16)+'px',
          border:'3px solid #ff9500', borderRadius:'12px',
          zIndex:999998, pointerEvents:'none', boxShadow:'0 0 0 9999px rgba(0,0,0,.18)'
        });
        document.body.appendChild(ring);
      }
    })()`);
    await sleep(900);
  }

  async function shot(name) {
    const result = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(result.data, 'base64'));
  }

  async function click(selector) {
    await waitFor(selector);
    await caption(`点击：${selector}`, selector);
    await evalJs(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await sleep(900);
  }

  async function fill(selector, value) {
    await waitFor(selector);
    await caption(`填写：${value}`, selector);
    await evalJs(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      el.focus();
      el.value = ${JSON.stringify(value)};
      el.dispatchEvent(new Event('input', { bubbles:true }));
      el.dispatchEvent(new Event('change', { bubbles:true }));
    })()`);
    await sleep(500);
  }

  async function login(username) {
    await navigate(baseUrl);
    await evalJs(`localStorage.removeItem('edusmart_user'); document.cookie='token=; Max-Age=0; path=/';`);
    await navigate(baseUrl);
    await waitFor('#login-form');
    await fill('input[name="username"]', username);
    await fill('input[name="password"]', '123456');
    await caption(`登录${username === 'teacher' ? '教师端' : '学生端'}：${username} / 123456`, '#login-form button');
    await evalJs(`document.querySelector('#login-form').requestSubmit()`);
    await sleep(2200);
  }

  const pathName = `演示个性化路径-${Date.now().toString().slice(-5)}`;

  await login('teacher');
  await shot('01-teacher-login');
  await click('[data-view="teacherWorkbench"]');
  await click('[data-teacher-tab="paths"]');
  await shot('02-teacher-path-tab');
  await click('[data-teacher-action="create-path"]');
  await fill('#path-name', pathName);
  await fill('#path-desc', '演示：教师从项目资源中组合学习资源、知识点、题目和笔记，部署给学生后监控进度。');
  await click('[data-resource-pick]');
  await click('#resource-type-filter');
  await evalJs(`document.querySelector('#resource-type-filter').value='knowledge'; document.querySelector('#resource-type-filter').dispatchEvent(new Event('change', { bubbles:true }))`);
  await sleep(1200);
  await click('.pick-resource-item');
  await shot('03-teacher-create-path');
  await click('#btn-add-step');
  await fill('.path-step-edit:nth-child(2) .path-step-title', '完成一道诊断练习题');
  await evalJs(`document.querySelector('.path-step-edit:nth-child(2) .path-step-type').value='exercise'; document.querySelector('.path-step-edit:nth-child(2) .path-step-type').dispatchEvent(new Event('change', { bubbles:true }))`);
  await fill('.path-step-edit:nth-child(2) .path-step-content', '请用自己的话解释这个知识点，并写出一个容易出错的例子。');
  await caption('保存教师创建的个性化学习路径', '#btn-save-path');
  await evalJs(`document.querySelector('#btn-save-path').click()`);
  await sleep(1800);
  await shot('04-teacher-path-saved');
  await click('.teacher-path-card:first-child [data-teacher-path-assign]');
  await click('.path-assign-check');
  await caption('选择学生后发布，学生端会被锁定到这条路径', '#btn-confirm-assign');
  await evalJs(`document.querySelector('#btn-confirm-assign').click()`);
  await sleep(1800);
  await shot('05-teacher-assign-path');
  await click('.teacher-path-card:first-child [data-teacher-view-path]');
  await shot('06-teacher-monitor');

  await navigate(baseUrl);
  await evalJs(`localStorage.removeItem('edusmart_user'); document.cookie='token=; Max-Age=0; path=/'; location.href='/'`);
  await sleep(1200);
  await login('zhangsan');
  await sleep(1600);
  await shot('07-student-locked-card');
  await caption('学生端：只有亮色路径卡片可以操作，其它功能灰显锁住', '.guided-path-card');
  await click('[data-path-complete]');
  await sleep(1400);
  await shot('08-student-next-step');
  await fill('[data-path-exercise-answer]', '我会先说概念定义，再给出一个反例来检查自己是否真正理解。');
  await caption('学生提交最后一步，完成后自动解锁', '[data-path-submit-answer]');
  await evalJs(`document.querySelector('[data-path-submit-answer]').click()`);
  await sleep(1800);
  await shot('09-student-unlocked');
  await caption('演示完成：教师端发布与监控，学生端锁定学习与完成解锁都走完了');

  console.log(`演示完成。截图目录: ${outDir}`);
  ws.close();
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
