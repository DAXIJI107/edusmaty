/**
 * =============================================================================
 * 团队项目模块综合测试脚本
 * =============================================================================
 *
 * @file       scripts/test-team-project.js
 * @description
 *   对团队项目模块进行端到端测试，覆盖以下功能：
 *   1. 登录获取 JWT Token
 *   2. 创建示例团队项目（自动生成角色、文件、提交、事件）
 *   3. 获取项目概览列表
 *   4. 获取项目详情（成员、文件、提交、事件、AI 运行记录）
 *   5. 读取单个文件
 *   6. 保存/修改文件
 *   7. AI 代码审查
 *   8. AI DevOps 流水线
 *   9. 下载项目源代码包
 *  10. 删除项目
 *
 *   同时验证数据库表结构和数据完整性。
 *
 * @author     EduSmart Team
 * @since      v2.2.0
 *
 * =============================================================================
 */

const http = require('http');

const BASE_URL = 'http://localhost:3020';
const TIMEOUT = 10000;
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;
const results = [];

function colorize(text, color) {
  return `${COLORS[color] || ''}${text}${COLORS.reset}`;
}

function logStep(step, message) {
  console.log(`\n${colorize('▶', 'cyan')} ${colorize(`Step ${step}`, 'bold')}: ${message}`);
}

function logTest(name, fn) {
  const result = { name, status: 'pending', duration: 0, error: null };
  const start = Date.now();
  try {
    fn();
    result.status = 'passed';
    passed++;
    console.log(`${colorize('  ✓', 'green')} ${colorize(name, 'white')}`);
  } catch (err) {
    result.status = 'failed';
    result.error = err.message;
    failed++;
    console.log(`${colorize('  ✗', 'red')} ${colorize(name, 'white')} - ${colorize(err.message, 'yellow')}`);
  }
  result.duration = Date.now() - start;
  results.push(result);
  return result;
}

async function logTestAsync(name, fn) {
  const result = { name, status: 'pending', duration: 0, error: null };
  const start = Date.now();
  try {
    await fn();
    result.status = 'passed';
    passed++;
    console.log(`${colorize('  ✓', 'green')} ${colorize(name, 'white')}`);
  } catch (err) {
    result.status = 'failed';
    result.error = err.message;
    failed++;
    console.log(`${colorize('  ✗', 'red')} ${colorize(name, 'white')} - ${colorize(err.message, 'yellow')}`);
  }
  result.duration = Date.now() - start;
  results.push(result);
  return result;
}

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const hasBody = body !== undefined && body !== null;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      timeout: TIMEOUT,
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => {
        clearTimeout(timer);
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          const json = JSON.parse(raw);
          resolve({ statusCode: res.statusCode, data: json, raw });
        } catch {
          resolve({ statusCode: res.statusCode, data: null, raw });
        }
      });
    });

    req.on('error', reject);

    const timer = setTimeout(() => {
      req.destroy();
      reject(new Error('请求超时'));
    }, TIMEOUT);

    if (hasBody) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ========== 测试主流程 ==========

async function main() {
  console.log(colorize('\n╔══════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║    EduSmart 团队项目模块综合测试                     ║', 'cyan'));
  console.log(colorize('╚══════════════════════════════════════════════════════╝\n', 'cyan'));

  let token = null;
  let projectId = null;
  let fileId = null;

  // ===== Step 1: 登录获取 JWT Token =====
  logStep(1, '登录获取 JWT Token');

  await logTestAsync('使用 admin/123456 登录', async () => {
    const res = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: '123456',
    });
    if (res.statusCode !== 200) throw new Error(`登录失败: HTTP ${res.statusCode}`);
    if (!res.data.success) throw new Error(`登录失败: ${res.data.message}`);
    if (!res.data.token) throw new Error('登录成功但未返回 token');
    token = res.data.token;
    console.log(`    ${colorize('用户:', 'gray')} ${res.data.user.username} (${res.data.user.role})`);
  });

  // ===== Step 2: 创建示例团队项目 =====
  logStep(2, '创建示例团队项目');

  await logTestAsync('POST /api/team-code/demo - 创建示例项目', async () => {
    const res = await request('POST', '/api/team-code/demo', {
      name: '校园二手交易平台测试项目',
      description: '用于测试的校园二手交易平台团队项目',
      repositoryName: 'campus-market-test',
    }, { Authorization: `Bearer ${token}` });

    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}: ${res.raw}`);
    if (!res.data.success) throw new Error(`创建失败: ${res.data.message}`);
    if (!res.data.data?.project) throw new Error('返回数据缺少 project');

    projectId = res.data.data.project.id;
    console.log(`    ${colorize('项目ID:', 'gray')} ${projectId}`);
    console.log(`    ${colorize('项目名称:', 'gray')} ${res.data.data.project.name}`);
    console.log(`    ${colorize('成员数:', 'gray')} ${res.data.data.members.length}`);
    console.log(`    ${colorize('文件数:', 'gray')} ${res.data.data.files.length}`);
    console.log(`    ${colorize('提交数:', 'gray')} ${res.data.data.commits.length}`);
    console.log(`    ${colorize('事件数:', 'gray')} ${res.data.data.events.length}`);

    if (res.data.data.members.length !== 4) {
      throw new Error(`期望 4 个成员角色，实际 ${res.data.data.members.length}`);
    }
    if (res.data.data.files.length !== 4) {
      throw new Error(`期望 4 个文件，实际 ${res.data.data.files.length}`);
    }
    if (res.data.data.commits.length < 4) {
      throw new Error(`期望至少 4 条提交记录，实际 ${res.data.data.commits.length}`);
    }

    const roles = res.data.data.members.map(m => m.role_key);
    const expectedRoles = ['frontend', 'backend', 'testing', 'deployment'];
    for (const role of expectedRoles) {
      if (!roles.includes(role)) {
        throw new Error(`缺少角色: ${role}`);
      }
    }

    const modules = res.data.data.moduleStats.map(m => m.roleKey);
    for (const role of expectedRoles) {
      if (!modules.includes(role)) {
        throw new Error(`缺少模块统计: ${role}`);
      }
    }

    // 保存第一个文件的 ID 供后续测试
    if (res.data.data.files.length > 0) {
      fileId = res.data.data.files[0].id;
    }
  });

  // ===== Step 3: 获取项目概览列表 =====
  logStep(3, '获取项目概览列表');

  await logTestAsync('GET /api/team-code/summary - 获取所有项目', async () => {
    const res = await request('GET', '/api/team-code/summary', null, {
      Authorization: `Bearer ${token}`,
    });

    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    if (!res.data.success) throw new Error(res.data.message);
    if (!Array.isArray(res.data.data.projects)) throw new Error('返回数据缺少 projects 数组');
    if (!Array.isArray(res.data.data.roles)) throw new Error('返回数据缺少 roles 数组');

    console.log(`    ${colorize('项目数:', 'gray')} ${res.data.data.projects.length}`);
    console.log(`    ${colorize('角色模板数:', 'gray')} ${res.data.data.roles.length}`);

    const project = res.data.data.projects.find(p => p.id === projectId);
    if (!project) throw new Error('概览列表中找不到刚创建的项目');
    if (project.member_count < 4) throw new Error(`项目成员数异常: ${project.member_count}`);
    if (project.file_count < 4) throw new Error(`项目文件数异常: ${project.file_count}`);
  });

  // ===== Step 4: 获取项目详情 =====
  logStep(4, '获取项目详情');

  await logTestAsync(`GET /api/team-code/projects/${projectId} - 获取项目详情`, async () => {
    const res = await request('GET', `/api/team-code/projects/${projectId}`, null, {
      Authorization: `Bearer ${token}`,
    });

    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    if (!res.data.success) throw new Error(res.data.message);

    const data = res.data.data;
    console.log(`    ${colorize('项目:', 'gray')} ${data.project.name}`);
    console.log(`    ${colorize('仓库健康:', 'gray')} ${JSON.stringify(data.repoHealth)}`);
    console.log(`    ${colorize('Agent数:', 'gray')} ${data.agents?.length || 0}`);
    console.log(`    ${colorize('需求数:', 'gray')} ${data.requirements?.length || 0}`);
    console.log(`    ${colorize('工具数:', 'gray')} ${data.tools?.length || 0}`);

    if (!data.project) throw new Error('缺少 project');
    if (!data.members) throw new Error('缺少 members');
    if (!data.files) throw new Error('缺少 files');
    if (!data.commits) throw new Error('缺少 commits');
    if (!data.events) throw new Error('缺少 events');
    if (!data.moduleStats) throw new Error('缺少 moduleStats');
    if (!data.repoHealth) throw new Error('缺少 repoHealth');
    if (!data.requirements) throw new Error('缺少 requirements');
    if (!data.agents) throw new Error('缺少 agents');
    if (!data.tools) throw new Error('缺少 tools');

    if (data.repoHealth.reviewScore <= 0) throw new Error('仓库健康评分异常');
  });

  // ===== Step 5: 读取单个文件 =====
  logStep(5, '读取单个文件');

  await logTestAsync(`GET /api/team-code/projects/${projectId}/files/${fileId} - 读取文件`, async () => {
    const res = await request('GET', `/api/team-code/projects/${projectId}/files/${fileId}`, null, {
      Authorization: `Bearer ${token}`,
    });

    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    if (!res.data.success) throw new Error(res.data.message);

    const file = res.data.data;
    console.log(`    ${colorize('文件路径:', 'gray')} ${file.path}`);
    console.log(`    ${colorize('模块:', 'gray')} ${file.module_key}`);
    console.log(`    ${colorize('语言:', 'gray')} ${file.language}`);
    console.log(`    ${colorize('版本:', 'gray')} v${file.version}`);
    console.log(`    ${colorize('内容长度:', 'gray')} ${file.content?.length || 0} 字符`);

    if (!file.path) throw new Error('缺少文件路径');
    if (!file.content) throw new Error('文件内容为空');
    if (!file.module_key) throw new Error('缺少模块标识');
  });

  // ===== Step 6: 保存/修改文件 =====
  logStep(6, '保存/修改文件');

  let newFileId = null;

  await logTestAsync('POST /api/team-code/projects/:id/files/save - 更新已有文件', async () => {
    const res = await request('POST', `/api/team-code/projects/${projectId}/files/save`, {
      moduleKey: 'frontend',
      path: 'frontend/App.js',
      content: `export function renderDashboard(project) {\n  const tasks = project.tasks || [];\n  const done = tasks.filter(t => t.done).length;\n  return { total: tasks.length, done, progress: tasks.length ? Math.round(done / tasks.length * 100) : 0 };\n}\n\nconst result = renderDashboard({ tasks: [{ title: "首页看板", done: true }, { title: "任务列表", done: false }] });\nconsole.log(JSON.stringify(result));`,
      language: 'javascript',
      message: '更新前端任务看板逻辑',
      changedLines: 8,
      positionLabel: 'renderDashboard()',
    }, { Authorization: `Bearer ${token}` });

    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}: ${res.raw}`);
    if (!res.data.success) throw new Error(res.data.message);

    const detail = res.data.data.detail;
    console.log(`    ${colorize('版本:', 'gray')} v${res.data.data.version}`);
    console.log(`    ${colorize('项目进度:', 'gray')} ${detail.project.progress}%`);

    if (res.data.data.version < 2) throw new Error('版本号未递增');
  });

  await logTestAsync('POST /api/team-code/projects/:id/files/save - 创建新文件', async () => {
    const res = await request('POST', `/api/team-code/projects/${projectId}/files/save`, {
      moduleKey: 'testing',
      path: 'tests/integration.test.js',
      content: `const assert = require('assert');\n\n// 测试: 创建项目\nconst project = createProject({ name: '测试项目' });\nassert(project.id, '项目应有ID');\nassert(project.progress === 0, '初始进度应为0');\n\nconsole.log('All integration tests passed!');`,
      language: 'javascript',
      message: '新增集成测试文件',
      changedLines: 6,
      positionLabel: 'integration test',
    }, { Authorization: `Bearer ${token}` });

    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}: ${res.raw}`);
    if (!res.data.success) throw new Error(res.data.message);

    newFileId = res.data.data.fileId;
    console.log(`    ${colorize('新文件ID:', 'gray')} ${newFileId}`);
    console.log(`    ${colorize('版本:', 'gray')} v${res.data.data.version}`);
  });

  // ===== Step 7: AI 代码审查 =====
  logStep(7, 'AI 代码审查');

  await logTestAsync(`POST /api/team-code/projects/${projectId}/ai-review - AI 审查`, async () => {
    const res = await request('POST', `/api/team-code/projects/${projectId}/ai-review`, {
      fileId: fileId,
      content: `export function renderDashboard(project) {\n  const tasks = project.tasks || [];\n  const done = tasks.filter(t => t.done).length;\n  return { total: tasks.length, done, progress: tasks.length ? Math.round(done / tasks.length * 100) : 0 };\n}\n\nconst result = renderDashboard({ tasks: [{ title: "首页看板", done: true }] });\nconsole.log(JSON.stringify(result));`,
      moduleKey: 'frontend',
      path: 'frontend/App.js',
    }, { Authorization: `Bearer ${token}` });

    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}: ${res.raw}`);
    if (!res.data.success) throw new Error(res.data.message);

    const review = res.data.data;
    console.log(`    ${colorize('评分:', 'gray')} ${review.score}分`);
    console.log(`    ${colorize('等级:', 'gray')} ${review.level}`);
    console.log(`    ${colorize('摘要:', 'gray')} ${review.summary?.slice(0, 80)}...`);
    console.log(`    ${colorize('发现数:', 'gray')} ${review.findings?.length || 0}`);
    console.log(`    ${colorize('建议数:', 'gray')} ${review.suggestions?.length || 0}`);

    if (!review.score) throw new Error('缺少评分');
    if (!review.level) throw new Error('缺少等级');
  });

  // ===== Step 8: AI DevOps 流水线 =====
  logStep(8, 'AI DevOps 流水线');

  await logTestAsync(`POST /api/team-code/projects/${projectId}/ai-pipeline - 全流程`, async () => {
    const res = await request('POST', `/api/team-code/projects/${projectId}/ai-pipeline`, {
      fileId: fileId,
      moduleKey: 'frontend',
      path: 'frontend/App.js',
      mode: 'full',
    }, { Authorization: `Bearer ${token}` });

    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}: ${res.raw}`);
    if (!res.data.success) throw new Error(res.data.message);

    const result = res.data.data;
    console.log(`    ${colorize('提供商:', 'gray')} ${result.provider}`);
    console.log(`    ${colorize('状态:', 'gray')} ${result.status}`);
    console.log(`    ${colorize('结果类型:', 'gray')} ${typeof result}`);
  });

  // ===== Step 9: 下载项目源代码包 =====
  logStep(9, '下载项目源代码包');

  await logTestAsync(`GET /api/team-code/projects/${projectId}/download - 下载 tar.gz`, async () => {
    const result = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3020,
        path: `/api/team-code/projects/${projectId}/download`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        timeout: TIMEOUT,
      }, (res) => {
        const chunks = [];
        res.on('data', (chunk) => { chunks.push(chunk); });
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            contentType: res.headers['content-type'],
            contentDisposition: res.headers['content-disposition'],
            size: body.length,
            bodyStr: body.toString('utf8'),
          });
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`    ${colorize('HTTP状态:', 'gray')} ${result.statusCode}`);
    console.log(`    ${colorize('Content-Type:', 'gray')} ${result.contentType}`);
    console.log(`    ${colorize('Content-Disposition:', 'gray')} ${result.contentDisposition}`);

    if (result.statusCode !== 200) {
      try {
        const json = JSON.parse(result.bodyStr);
        throw new Error(`HTTP ${result.statusCode}: ${json.message || result.bodyStr}`);
      } catch {
        throw new Error(`HTTP ${result.statusCode}: ${result.bodyStr}`);
      }
    }

    if (!result.contentType || !result.contentType.includes('application/gzip')) {
      throw new Error(`Content-Type 异常: ${result.contentType}`);
    }

    console.log(`    ${colorize('文件大小:', 'gray')} ${(result.size / 1024).toFixed(2)} KB`);
    if (result.size < 100) throw new Error('下载文件过小，可能内容不完整');
  });

  // ===== Step 10: 验证 API 权限控制 =====
  logStep(10, '验证 API 权限控制');

  await logTestAsync('未登录访问项目列表应返回 401', async () => {
    const res = await request('GET', '/api/team-code/summary');
    if (res.statusCode !== 401) throw new Error(`期望 401，实际 ${res.statusCode}`);
  });

  await logTestAsync('使用无效 Token 应返回 403', async () => {
    const res = await request('GET', '/api/team-code/summary', null, {
      Authorization: 'Bearer invalid-token-here',
    });
    if (res.statusCode !== 403) throw new Error(`期望 403，实际 ${res.statusCode}`);
  });

  // ===== Step 11: 验证文件保存的错误处理 =====
  logStep(11, '验证错误处理');

  await logTestAsync('保存文件时缺少路径应返回 400', async () => {
    const res = await request('POST', `/api/team-code/projects/${projectId}/files/save`, {
      content: 'test',
      moduleKey: 'frontend',
    }, { Authorization: `Bearer ${token}` });
    if (res.statusCode !== 400) throw new Error(`期望 400，实际 ${res.statusCode}`);
    if (res.data.success !== false) throw new Error(`期望 success=false，实际 ${res.data.success}`);
    if (!res.data.message || !res.data.message.includes('路径')) throw new Error(`错误消息不符合预期: ${res.data.message}`);
    console.log(`    ${colorize('错误消息:', 'gray')} ${res.data.message}`);
  });

  await logTestAsync('访问不存在的项目应返回 404', async () => {
    const res = await request('GET', '/api/team-code/projects/99999', null, {
      Authorization: `Bearer ${token}`,
    });
    if (res.statusCode !== 404) throw new Error(`期望 404，实际 ${res.statusCode}`);
  });

  // ===== Step 12: 再次获取项目详情验证数据完整性 =====
  logStep(12, '验证数据完整性');

  await logTestAsync('创建后项目详情数据完整', async () => {
    const res = await request('GET', `/api/team-code/projects/${projectId}`, null, {
      Authorization: `Bearer ${token}`,
    });
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);

    const data = res.data.data;
    const fileCount = data.files.length;
    const commitCount = data.commits.length;
    const eventCount = data.events.length;

    console.log(`    ${colorize('总文件数:', 'gray')} ${fileCount}`);
    console.log(`    ${colorize('总提交数:', 'gray')} ${commitCount}`);
    console.log(`    ${colorize('总事件数:', 'gray')} ${eventCount}`);

    if (fileCount < 5) throw new Error(`文件数不足，期望 >=5 (4初始+1新增)，实际 ${fileCount}`);
    if (commitCount < 5) throw new Error(`提交数不足，期望 >=5 (4初始+1更新+1新增)，实际 ${commitCount}`);
    if (eventCount < 4) throw new Error(`事件数不足，期望 >=4 (1创建+2保存+1审查)，实际 ${eventCount}`);
  });

  // ===== Step 13: 删除项目 =====
  logStep(13, '删除项目');

  await logTestAsync(`DELETE /api/team-code/projects/${projectId} - 删除项目`, async () => {
    const res = await request('DELETE', `/api/team-code/projects/${projectId}`, null, {
      Authorization: `Bearer ${token}`,
    });
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}: ${res.raw}`);
    if (!res.data.success) throw new Error(res.data.message);
    console.log(`    ${colorize('消息:', 'gray')} ${res.data.message}`);
  });

  await logTestAsync('删除后访问项目应返回 404', async () => {
    const res = await request('GET', `/api/team-code/projects/${projectId}`, null, {
      Authorization: `Bearer ${token}`,
    });
    if (res.statusCode !== 404) throw new Error(`期望 404，实际 ${res.statusCode}`);
  });

  // ===== 总结 =====
  console.log(colorize('\n╔══════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║                      测试总结                         ║', 'cyan'));
  console.log(colorize('╚══════════════════════════════════════════════════════╝', 'cyan'));

  const total = passed + failed;
  console.log(`\n  ${colorize('总测试数:', 'white')} ${total}`);
  console.log(`  ${colorize('通过:', 'green')} ${passed}`);
  console.log(`  ${colorize('失败:', 'red')} ${failed}`);
  console.log(`  ${colorize('通过率:', 'yellow')} ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log(colorize('\n  失败详情:', 'red'));
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`    ${colorize('✗', 'red')} ${r.name} - ${r.error}`);
    });
  }

  console.log('');
  if (failed === 0) {
    console.log(colorize('  🎉 所有测试通过！团队项目模块功能正常。\n', 'green'));
  } else {
    console.log(colorize('  ❌ 部分测试失败，请查看上方详情。\n', 'red'));
  }

  process.exit(failed > 0 ? 1 : 0);
}

// 错误处理
process.on('unhandledRejection', (reason) => {
  console.error(colorize('未处理的 Promise 拒绝:', 'red'), reason);
  process.exit(1);
});

main().catch((err) => {
  console.error(colorize('测试脚本异常:', 'red'), err);
  process.exit(1);
});