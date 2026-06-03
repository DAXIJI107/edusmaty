const fs = require('fs');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'demo-walkthrough');
fs.mkdirSync(outDir, { recursive: true });

const baseUrl = 'http://localhost:3020';
const debugPort = 9223;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function connect() {
  const pages = await getJson(`http://localhost:${debugPort}/json`);
  const page = pages.find(p => p.type === 'page' && p.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(resolve => ws.once('open', resolve));
  let id = 0;
  const callbacks = new Map();
  ws.on('message', raw => {
    const msg = JSON.parse(raw);
    if (callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  });
  const send = (method, params = {}) => {
    const msgId = ++id;
    ws.send(JSON.stringify({ id: msgId, method, params }));
    return new Promise(resolve => callbacks.set(msgId, resolve));
  };
  await send('Page.enable');
  await send('Runtime.enable');
  return { ws, send };
}

async function main() {
  const { ws, send } = await connect();
  const evalJs = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.error) throw new Error(r.error.message);
    return r.result?.result?.value;
  };
  const shot = async name => {
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(r.result.data, 'base64'));
  };
  const navigate = async url => {
    await send('Page.navigate', { url });
    await sleep(1600);
  };
  const waitFor = async selector => {
    const ok = await evalJs(`new Promise(resolve => {
      const started = Date.now();
      const tick = () => {
        if (document.querySelector(${JSON.stringify(selector)})) return resolve(true);
        if (Date.now() - started > 12000) return resolve(false);
        setTimeout(tick, 150);
      };
      tick();
    })`);
    if (!ok) throw new Error(`未找到元素: ${selector}`);
  };
  const caption = async (text, selector = '') => {
    await evalJs(`(() => {
      document.querySelectorAll('.codex-demo-caption,.codex-demo-ring').forEach(n => n.remove());
      const cap = document.createElement('div');
      cap.className = 'codex-demo-caption';
      cap.textContent = ${JSON.stringify(text)};
      Object.assign(cap.style, { position:'fixed', left:'28px', bottom:'28px', zIndex:999999, background:'#fff', color:'#10203f', padding:'14px 18px', border:'2px solid #2f6bff', borderRadius:'12px', boxShadow:'0 18px 50px rgba(15,23,42,.22)', font:'600 18px system-ui' });
      document.body.appendChild(cap);
      const target = ${selector ? `document.querySelector(${JSON.stringify(selector)})` : 'null'};
      if (target) {
        const r = target.getBoundingClientRect();
        const ring = document.createElement('div');
        ring.className = 'codex-demo-ring';
        Object.assign(ring.style, { position:'fixed', left:(r.left-8)+'px', top:(r.top-8)+'px', width:(r.width+16)+'px', height:(r.height+16)+'px', border:'3px solid #ff9500', borderRadius:'12px', zIndex:999998, pointerEvents:'none', boxShadow:'0 0 0 9999px rgba(0,0,0,.16)' });
        document.body.appendChild(ring);
      }
    })()`);
    await sleep(900);
  };
  const click = async selector => {
    await waitFor(selector);
    await caption(`点击这里：${selector}`, selector);
    await evalJs(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await sleep(1200);
  };

  await navigate(baseUrl);
  await evalJs(`localStorage.removeItem('edusmart_user'); document.cookie='token=; Max-Age=0; path=/'; location.href='/'`);
  await sleep(1200);
  await waitFor('#login-form');
  await evalJs(`document.querySelector('input[name="username"]').value='teacher'; document.querySelector('input[name="password"]').value='123456'; document.querySelector('#login-form').requestSubmit()`);
  await sleep(1800);

  const pathInfo = await evalJs(`(async () => {
    const created = await fetch('/api/teacher/paths/create', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        name:'完整操作演示路径',
        subject:'数据结构与算法',
        description:'教师发布给学生的个性化学习路径演示。',
        steps:[
          { title:'阅读知识点讲解', type:'text', content:'阅读哈希表的核心概念：键、值、哈希函数和冲突处理。', duration_minutes:10, resource_type:'knowledge' },
          { title:'完成反思练习', type:'exercise', content:'请说明哈希冲突是什么，并写出一种解决方法。', duration_minutes:8, resource_type:'question' }
        ]
      })
    }).then(r => r.json());
    await fetch('/api/teacher/paths/' + created.pathId + '/assign', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ student_ids:[1] })
    }).then(r => r.json());
    return created;
  })()`);

  await navigate(baseUrl + '/teacher-workbench');
  await click('[data-teacher-tab="paths"]');
  await caption('教师端：学习路径列表。这里可以创建路径、分配学生、查看详情。', '.teacher-path-grid');
  await shot('04-teacher-path-list-after-deploy');
  await click('.teacher-path-card:first-child [data-teacher-view-path]');
  await caption('教师端：路径详情监控。这里能看到已部署学生、进行中人数、完成数和平均进度。', '.teacher-path-monitor-grid');
  await shot('05-teacher-monitor-complete');

  await navigate(baseUrl);
  await evalJs(`localStorage.removeItem('edusmart_user'); document.cookie='token=; Max-Age=0; path=/'; location.href='/'`);
  await sleep(1200);
  await waitFor('#login-form');
  await evalJs(`document.querySelector('input[name="username"]').value='zhangsan'; document.querySelector('input[name="password"]').value='123456'; document.querySelector('#login-form').requestSubmit()`);
  await sleep(2200);
  await caption('学生端：老师发布路径后，只能操作这个亮色引导卡片，其它功能被锁住。', '.guided-path-card');
  await shot('06-student-locked-guided-card');
  await click('[data-path-complete]');
  await waitFor('[data-path-exercise-answer]');
  await caption('学生端：进入下一步后填写答案，再提交。', '[data-path-exercise-answer]');
  await evalJs(`document.querySelector('[data-path-exercise-answer]').value='哈希冲突是不同键映射到同一位置，可以用链地址法或开放定址法处理。'; document.querySelector('[data-path-exercise-answer]').dispatchEvent(new Event('input', { bubbles:true }));`);
  await shot('07-student-answer-step');
  await click('[data-path-submit-answer]');
  await sleep(1600);
  await caption('学生端：完成全部步骤后自动解锁，其他功能恢复可用。');
  await shot('08-student-completed-unlocked');

  console.log(`完成，截图目录: ${outDir}`);
  ws.close();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
