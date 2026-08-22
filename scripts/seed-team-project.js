/**
 * =============================================================================
 * 团队项目演示数据种子脚本
 * =============================================================================
 *
 * @file       scripts/seed-team-project.js
 * @description
 *   为团队项目模块创建持久化演示数据，供前端页面直接展示。
 *   运行前请确保数据库已启动。
 *
 *   用法：node scripts/seed-team-project.js
 *
 * @author     EduSmart Team
 * @since      v2.2.0
 *
 * =============================================================================
 */

const pool = require('../src/db');

async function main() {
  console.log('团队项目演示数据种子脚本\n');

  // 优先查找 admin 用户作为项目拥有者，确保前端登录后能看到演示项目
  const [admins] = await pool.query(
    `SELECT id, username, role FROM users WHERE username = 'admin' AND status = 'active' LIMIT 1`
  );
  const [allUsers] = await pool.query(
    `SELECT id, username, role FROM users WHERE status = 'active' ORDER BY id LIMIT 10`
  );

  if (allUsers.length === 0) {
    console.log('错误: 未找到可用用户，请先初始化用户数据');
    process.exit(1);
  }

  const ownerId = admins.length > 0 ? admins[0].id : allUsers[0].id;
  const ownerName = admins.length > 0 ? admins[0].username : allUsers[0].username;
  console.log(`使用用户 ${ownerName} (ID: ${ownerId}) 作为项目拥有者`);

  const memberUsers = allUsers.filter(u => u.id !== ownerId);

  const demoProjects = [
    {
      name: '校园二手交易平台',
      description: '一个让学生发布和买卖二手物品的校园交易平台，包含商品浏览、发布、搜索和交易沟通等功能。',
      repositoryName: 'campus-market',
      progress: 65,
    },
    {
      name: '智能学习打卡系统',
      description: '基于 AI 的个性化学习打卡系统，根据学生的学习进度和目标自动生成每日学习计划和打卡任务。',
      repositoryName: 'smart-punch',
      progress: 40,
    },
    {
      name: '在线编程练习平台',
      description: '面向计算机专业学生的在线编程练习平台，支持多语言代码编写、自动评测和学习路径推荐。',
      repositoryName: 'code-practice',
      progress: 85,
    },
  ];

  const roleTemplates = [
    {
      roleKey: 'frontend',
      roleName: '页面体验负责人',
      moduleName: '页面与交互',
      responsibility: '负责把学习项目做成清晰可用的页面，练习布局、交互和接口联调。',
      defaultPath: 'frontend/App.js',
      language: 'javascript',
      demoContent: `// 校园二手交易平台 - 前端入口
export function renderProductCard(item) {
  return {
    id: item.id,
    title: item.title,
    price: '¥' + item.price,
    seller: item.seller,
    image: item.thumbnail || '/placeholder.png',
    condition: item.condition || '二手',
    location: item.location || '校内自取',
    postedAt: formatTime(item.created_at),
  };
}

export function renderSearchResults(items, query) {
  const filtered = items.filter(i =>
    !query || i.title.includes(query) || i.description.includes(query)
  );
  return {
    total: filtered.length,
    items: filtered.map(renderProductCard),
    hasMore: filtered.length >= 20,
  };
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  return days === 0 ? '今天' : days === 1 ? '昨天' : days + '天前';
}`
    },
    {
      roleKey: 'backend',
      roleName: '功能逻辑负责人',
      moduleName: '业务逻辑',
      responsibility: '负责项目规则、数据处理和权限判断，练习把需求转成稳定功能。',
      defaultPath: 'backend/api.js',
      language: 'javascript',
      demoContent: `// 校园二手交易平台 - 后端 API
const express = require('express');
const router = express.Router();

// 发布二手商品
router.post('/items', async (req, res) => {
  const { title, price, description, category, condition, location } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: '标题和价格必填' });
  }
  if (price < 0 || price > 99999) {
    return res.status(400).json({ success: false, message: '价格超出合理范围' });
  }
  const result = await db.query(
    'INSERT INTO market_items (seller_id, title, price, description, category, condition, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, "on_sale")',
    [req.user.id, title, price, description || '', category || '其他', condition || '二手', location || '校内']
  );
  res.json({ success: true, data: { id: result.insertId } });
});

// 搜索商品
router.get('/items/search', async (req, res) => {
  const { q, category, minPrice, maxPrice, sort = 'latest' } = req.query;
  let sql = 'SELECT * FROM market_items WHERE status = "on_sale"';
  const params = [];
  if (q) { sql += ' AND (title LIKE ? OR description LIKE ?)'; params.push(\`%\${q}%\`, \`%\${q}%\`); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (minPrice) { sql += ' AND price >= ?'; params.push(minPrice); }
  if (maxPrice) { sql += ' AND price <= ?'; params.push(maxPrice); }
  sql += sort === 'price_asc' ? ' ORDER BY price ASC' : sort === 'price_desc' ? ' ORDER BY price DESC' : ' ORDER BY created_at DESC';
  const [rows] = await db.query(sql, params);
  res.json({ success: true, data: rows });
});

module.exports = router;`
    },
    {
      roleKey: 'testing',
      roleName: '质量复盘负责人',
      moduleName: '测试与验收',
      responsibility: '负责测试用例、问题记录、验收标准和复盘反馈。',
      defaultPath: 'tests/project.test.js',
      language: 'javascript',
      demoContent: `// 校园二手交易平台 - 测试用例
const assert = require('assert');

// ========== 商品发布测试 ==========
function testCreateItem() {
  // 正常发布
  const item = createItem({
    title: '九成新自行车',
    price: 200,
    description: '毕业转让，车况良好',
    category: '代步工具',
  });
  assert(item.id, '发布应返回商品ID');
  assert(item.status === 'on_sale', '初始状态应为在售');

  // 缺少必填字段
  try { createItem({ price: 100 }); assert.fail('应拒绝缺少标题的请求'); }
  catch (e) { assert(e.message.includes('标题'), '错误应提及标题'); }

  // 价格边界
  try { createItem({ title: '测试', price: -1 }); assert.fail('应拒绝负价格'); }
  catch (e) { assert(e.message.includes('价格'), '错误应提及价格'); }

  console.log('✓ 商品发布测试通过');
}

// ========== 搜索功能测试 ==========
function testSearchItem() {
  // 关键词搜索
  const results = searchItems('自行车');
  assert(results.total >= 0, '搜索应返回结果数');

  // 空搜索返回全部
  const all = searchItems('');
  assert(all.total >= results.total, '空搜索应返回更多或相等结果');

  // 价格区间筛选
  const cheap = searchItems('', { maxPrice: 100 });
  cheap.items.forEach(i => assert(i.price <= 100, '价格应在筛选范围内'));

  console.log('✓ 搜索功能测试通过');
}

// ========== 集成测试 ==========
function testWorkflow() {
  const item = createItem({ title: '测试商品', price: 50 });
  const found = searchItems('测试商品');
  assert(found.items.some(i => i.id === item.id), '发布后应能搜索到商品');

  updateItem(item.id, { status: 'sold' });
  const after = searchItems('测试商品');
  assert(!after.items.some(i => i.id === item.id), '售出后不应出现在搜索结果');

  console.log('✓ 完整工作流测试通过');
}

// 运行所有测试
try {
  testCreateItem();
  testSearchItem();
  testWorkflow();
  console.log('\\n🎉 所有测试通过！');
} catch (e) {
  console.error('测试失败:', e.message);
  process.exit(1);
}`
    },
    {
      roleKey: 'deployment',
      roleName: '发布展示负责人',
      moduleName: '展示与发布',
      responsibility: '负责运行说明、展示流程、环境检查和成果汇报。',
      defaultPath: 'deploy/README.md',
      language: 'markdown',
      demoContent: `# 校园二手交易平台 - 部署说明

## 环境要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

## 快速启动

### 1. 安装依赖
\`\`\`bash
npm install
\`\`\`

### 2. 配置环境变量
复制 \`.env.example\` 为 \`.env\` 并修改以下配置：
- \`DB_HOST\`: 数据库地址
- \`DB_USER\`: 数据库用户名
- \`DB_PASSWORD\`: 数据库密码
- \`DB_NAME\`: 数据库名称
- \`JWT_SECRET\`: JWT 签名密钥

### 3. 初始化数据库
\`\`\`bash
npm run db:migrate
npm run db:seed-demo-pack
\`\`\`

### 4. 启动服务
\`\`\`bash
npm start
\`\`\`

### 5. 验证部署
访问以下地址验证服务正常：
- 健康检查: http://localhost:3020/api/health
- 登录页面: http://localhost:3020/
- API 文档: http://localhost:3020/api/docs

## 项目结构
\`\`\`
campus-market/
├── frontend/          # 前端代码
│   └── App.js         # 主入口
├── backend/           # 后端代码
│   └── api.js         # API 路由
├── tests/             # 测试代码
│   └── project.test.js
└── deploy/            # 部署文档
    └── README.md
\`\`\`

## 验收清单
- [x] 用户注册和登录
- [x] 商品发布和搜索
- [x] 商品分类筛选
- [x] 价格区间筛选
- [x] 商品详情查看
- [x] 收藏和分享
- [ ] 在线聊天（待开发）
- [ ] 订单支付（待开发）

## 演示说明
在团队项目页面点击「演示」按钮，可查看完整的项目运行演示，包括：
1. 商品发布流程
2. 搜索和筛选功能
3. 商品详情浏览
4. AI 代码审查结果`
    },
  ];

  let totalCreated = 0;

  for (const project of demoProjects) {
    console.log(`\n创建项目: ${project.name}`);

    const [result] = await pool.query(
      `INSERT INTO team_projects (owner_id, name, description, repository_name, status, progress)
       VALUES (?, ?, ?, ?, 'active', ?)`,
      [ownerId, project.name, project.description, project.repositoryName, project.progress]
    );
    const projectId = result.insertId;
    console.log(`  项目ID: ${projectId}`);

    // 为每个项目分配角色成员
    const shuffledUsers = [...memberUsers].sort(() => Math.random() - 0.5);

    for (let i = 0; i < roleTemplates.length; i++) {
      const role = roleTemplates[i];
      const memberUserId = shuffledUsers.length > 0
        ? shuffledUsers[i % shuffledUsers.length].id
        : ownerId;

      await pool.query(
        `INSERT INTO team_project_members (project_id, user_id, role_key, role_name, module_name, responsibility)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [projectId, memberUserId, role.roleKey, role.roleName, role.moduleName, role.responsibility]
      );

      const [fileResult] = await pool.query(
        `INSERT INTO team_project_files (project_id, module_key, path, language, content, owner_user_id, last_editor_id, size_bytes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          role.roleKey,
          role.defaultPath,
          role.language,
          role.demoContent,
          memberUserId,
          memberUserId,
          Buffer.byteLength(role.demoContent, 'utf-8'),
        ]
      );

      const lineCount = role.demoContent.split(/\r?\n/).length;
      await pool.query(
        `INSERT INTO team_project_commits (project_id, file_id, user_id, message, module_key, position_label, changed_lines, snapshot)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [projectId, fileResult.insertId, memberUserId, `初始化${role.moduleName}模块`, role.roleKey, role.defaultPath, lineCount, role.demoContent]
      );
    }

    // 添加项目创建事件
    await pool.query(
      `INSERT INTO team_project_events (project_id, user_id, event_type, title, detail)
       VALUES (?, ?, 'project_created', ?, ?)`,
      [projectId, ownerId, `${project.name} 已创建`, `已生成 4 个学习角色和示例代码`]
    );

    // 添加一些提交记录事件
    await pool.query(
      `INSERT INTO team_project_events (project_id, user_id, event_type, title, detail)
       VALUES (?, ?, 'code_saved', ?, ?)`,
      [projectId, ownerId, `代码已同步`, `前端/App.js · 保存更新`]
    );

    totalCreated++;
    console.log(`  ✓ 已完成 (4 成员 + 4 文件 + 4 提交 + 2 事件)`);
  }

  // 为第一个项目添加 AI 审查记录
  const [projects] = await pool.query('SELECT id FROM team_projects ORDER BY id DESC LIMIT 1');
  if (projects.length > 0) {
    const lastProjectId = projects[0].id;
    await pool.query(
      `INSERT INTO team_project_ai_runs (project_id, user_id, run_type, provider, target_path, module_key, status, score, result_json)
       VALUES (?, ?, 'ai-review', 'local', 'frontend/App.js', 'frontend', 'completed', 85, ?)`,
      [
        lastProjectId,
        ownerId,
        JSON.stringify({
          score: 85,
          level: '可合并',
          summary: '代码完成 45 行有效内容扫描',
          findings: ['存在调试输出，发布前需移除'],
          suggestions: ['为关键行为设计结构化日志'],
        }),
      ]
    );
  }

  console.log(`\n✓ 种子数据创建完成！共创建 ${totalCreated} 个团队项目。`);
  console.log('\n可以访问前端页面 http://localhost:3020/team-code 查看效果。');

  process.exit(0);
}

main().catch((err) => {
  console.error('种子数据创建失败:', err);
  process.exit(1);
});