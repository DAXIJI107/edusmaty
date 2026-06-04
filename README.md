# EduSmart Rebuild

EduSmart 是一个面向计算机学习场景的 AI 个性化学习平台。系统围绕“诊断画像 → 知识库/RAG → 个性化路径 → 今日任务 → 笔记复盘 → 间隔复习”的闭环工作，帮助学生把课程、题库、笔记和智能体建议串成可执行的学习计划。

![EduSmart 登录页](docs/screenshots/showcase/01-login.png)

## 项目亮点

- 学习画像先行：新用户先完成文本诊断、结构化问卷和学科测试，再生成画像与路径。
- Agent 个性化路径：根据目标、薄弱点、掌握度、可用时间和学习偏好生成学习路径。
- RAG 知识引擎：接入计算机知识点、课程、题库、RAG 文档和 Obsidian 知识库。
- 智能笔记与知识图谱：把问答、练习和课程内容沉淀为可复习、可关联的知识资产。
- 编程实践闭环：支持代码实践、算法可视化、团队编程和 AI 代码审查。
- Apple 风格界面：页面采用毛玻璃卡片、清晰分组、轻量动效和响应式布局。

## 页面截图

完整页面展示与功能讲解见：[docs/PROJECT_SHOWCASE.md](docs/PROJECT_SHOWCASE.md)

| 页面 | 截图 |
| --- | --- |
| 学习中心首页 | ![学习中心首页](docs/screenshots/showcase/02-home.png) |
| 智能诊断 | ![智能诊断](docs/screenshots/showcase/03-diagnostic.png) |
| 学习画像 | ![学习画像](docs/screenshots/showcase/04-profile.png) |
| 个性化学习路径 | ![个性化学习路径](docs/screenshots/showcase/05-path.png) |
| 今日学习计划 | ![今日学习计划](docs/screenshots/showcase/06-study-plan.png) |
| RAG 智能检索 | ![RAG 智能检索](docs/screenshots/showcase/08-rag-search.png) |
| 账户中心 | ![账户中心](docs/screenshots/showcase/15-account.png) |

## 技术栈

- 前端：HTML、CSS、Vanilla JavaScript、Canvas、响应式布局
- 后端：Node.js、Express、模块化 API
- 数据库：MySQL、迁移脚本、计算机知识库种子数据
- 认证：JWT、HttpOnly Cookie、演示账号
- AI/RAG：LLM Gateway、RAG 检索、学习 Agent、错题与笔记闭环
- 自动化：Chrome DevTools Protocol 自动截图脚本

## 目录说明

- `apps/web/public/`：浏览器端单页应用入口、样式和脚本。
- `src/server/`：Express 组合根，负责中间件、静态资源、API 挂载和前端路由兜底。
- `src/modules/`：认证、考试、课程、报告、RAG、教师端、智能体等业务 API。
- `src/core/`：画像、推荐、学习路径、BKT、认知诊断、错题/笔记、TTS 等核心能力。
- `src/services/`、`src/utils/`：外部服务适配器与共享工具。
- `ops/database/`：数据库迁移和 SQL 资产。
- `scripts/`：数据重建、导入、同步、语法检查和截图脚本。
- `docs/`：架构文档、功能方案、页面截图和展示说明。

根目录的 `server.js`、`config.js`、`db.js`、`middleware.js` 是兼容旧脚本的转发文件，新代码优先放入 `src/`。

## 启动项目

安装依赖：

```bash
npm install
```

复制环境变量：

```bash
cp .env.example .env
```

启动服务：

```bash
npm start
```

默认地址：

```text
http://localhost:3020
```

演示账号：

```text
zhangsan / 123456
teacher / 123456
```

## 数据库与知识库

执行下面命令可重建计算机学习平台数据：

```bash
npm run db:rebuild
```

当前数据包含：

- 计算机知识点：计算机基础、数据结构与算法、操作系统、计算机网络、数据库、软件工程、程序设计、人工智能、云计算与大数据、网络安全。
- 计算机课程：中文公开知识摘要与计算机教育公开课程目录。
- 中文题库：围绕知识点生成诊断题、自适应练习、费曼评估、知识图谱和复习题。
- AI 闭环数据：学习任务、推荐、知识图谱、多模态内容、间隔复习、能力雷达、智能笔记卡和导师对话。

## 自动生成截图

启动服务后运行：

```bash
node scripts/capture-screenshots.js
```

截图输出目录：

```text
docs/screenshots/showcase/
```

如果需要指定 Chrome：

```bash
EDUSMART_BROWSER="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" node scripts/capture-screenshots.js
```

## 常用脚本

```bash
npm start              # 启动服务
npm run check          # 语法检查
npm run db:rebuild     # 重建数据库与知识库数据
npm run format         # 格式化项目
```

## 核心接口

```text
GET  /api/app/intelligence
POST /api/app/diagnosis/submit
POST /api/app/tutor/message
POST /api/app/notes/generate-card
POST /api/app/feynman/review
GET  /api/app/account/dashboard
```
