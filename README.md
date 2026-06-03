# EduSmart Rebuild

这是从旧版 `new/public` 独立出来的重构项目。旧项目和本项目互不依赖、可分别运行。

## 目录说明

- `apps/web/public/`: 当前浏览器端单页应用，只保留一个 HTML 入口和对应 CSS/JS。
- `src/server/`: Express 组合根，负责中间件、静态资源、API 挂载、健康检查和前端路由兜底。
- `src/modules/`: 业务 API 模块，包括认证、考试、课程、报告、RAG、教师端、智能体等。
- `src/core/`: 智能学习核心能力，包括画像、推荐、学习路径、BKT、认知诊断、错题/笔记、TTS 等。
- `src/services/`, `src/utils/`: 外部服务适配器与共享工具。
- `ops/database/`: 数据库迁移和 SQL 资产。
- `scripts/`: 数据重建、导入、同步和检查脚本。
- `docs/architecture/`: 架构说明，入口文档见 `docs/architecture/project-structure.md`。

根目录的 `server.js`、`config.js`、`db.js`、`middleware.js` 只是兼容旧脚本的转发文件，新代码应优先放入 `src/`。

## 启动

```bash
npm start
```

默认端口：`3020`

演示账号：

```text
zhangsan / 123456
teacher / 123456
```

## 计算机知识库数据

项目数据已收敛为计算机相关内容。执行下面命令会联网抓取中文公开知识摘要，并重建计算机学习平台数据库：

```bash
npm run db:rebuild
```

当前重建脚本会写入：

- 计算机知识点：计算机基础、数据结构与算法、操作系统、计算机网络、数据库、软件工程、程序设计、人工智能、云计算与大数据、网络安全。
- 计算机课程：基于中文公开知识摘要与中国高校计算机教育 MOOC 入口生成课程目录。
- 中文题库：围绕每个知识点生成入门理解、掌握度更新、自适应练习、费曼评估、知识图谱、复习沉淀等题型。
- AI 闭环数据：学习任务、推荐、知识图谱、多模态内容、间隔复习、能力雷达、智能笔记卡、数字人导师对话。

数据来源会在脚本输出中打印，例如中文维基百科 REST API、中国高校计算机教育 MOOC 联盟入口与 EduSmart 中文计算机题库生成器。

## 环境变量

可复制 `.env.example` 为 `.env` 后按需配置数据库、大模型、讯飞等服务。

## 新版 AI 闭环能力

- 认知诊断：`cognitive_profiles` 记录 IRT 能力值、薄弱概念、目标拆解图谱。
- 自适应路径：`knowledge_points` + `knowledge_edges` + `study_tasks` 共同驱动路径和任务。
- 数字人导师：`digital_humans`、`tutor_sessions`、`tutor_messages` 支持苏格拉底追问与长期记忆。
- 智能笔记：`notes`、`note_cards` 支持概念卡、误区卡、反向链接和主动回忆。
- 多模态内容：`multimodal_contents` 为同一知识点存储解释、类比、案例、可视化。
- 间隔复习：`spaced_reviews` 记录下次复习时间、间隔、编码深度。
- 多维评估：`ability_radar` 记录记忆、理解、应用、分析、迁移、创造六维能力。
- 费曼训练：`feynman_reviews` 写入用户解释，返回清晰度、准确度和遗漏点。

核心接口：

```text
GET  /api/app/intelligence
POST /api/app/diagnosis/submit
POST /api/app/tutor/message
POST /api/app/notes/generate-card
POST /api/app/feynman/review
```
