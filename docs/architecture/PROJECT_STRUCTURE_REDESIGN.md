# EduSmart 项目架构重构方案

> 版本: v1.0 | 日期: 2026-06-27 | 状态: 待评审

---

## 1. 设计原则

本方案参照阿里巴巴、字节跳动等大厂 Node.js 项目的目录规范，遵循以下原则：

- **关注点分离**: 按业务领域垂直切分，按技术层次水平切分
- **单一职责**: 每个文件只做一件事，每个目录只收一类文件
- **依赖倒置**: 高层模块不依赖低层模块，都依赖抽象接口
- **约定优于配置**: 目录名即契约，一眼看懂项目结构
- **可测试性**: 每个模块独立可测，不依赖全局状态

---

## 2. 目标目录结构

```
edusmart/
├── .github/                        # CI/CD 工作流 (新增)
│   └── workflows/
│       ├── ci.yml                  # 持续集成
│       └── deploy.yml              # 部署流水线
│
├── apps/                           # 前端应用 (重构)
│   └── web/                        # Web 单页应用
│       ├── public/                 # 静态资源根目录
│       │   ├── index.html          # SPA 入口 (原 app.html)
│       │   ├── favicon.ico
│       │   ├── css/                # 样式表
│       │   │   ├── base/           #   基础样式 (reset, variables, typography)
│       │   │   ├── components/     #   组件样式 (button, card, modal, ...)
│       │   │   ├── pages/          #   页面样式 (login, dashboard, ...)
│       │   │   └── themes/         #   主题 (dark, light, apple)
│       │   ├── js/                 # 脚本
│       │   │   ├── core/           #   核心框架 (router, store, api-client)
│       │   │   ├── components/     #   可复用组件
│       │   │   ├── pages/          #   页面逻辑
│       │   │   ├── services/       #   业务服务 (auth, diagnosis, ...)
│       │   │   └── utils/          #   工具函数
│       │   ├── images/             # 图片资源
│       │   │   ├── brand/          #   Logo、品牌素材
│       │   │   ├── login/          #   登录页素材
│       │   │   └── icons/          #   图标
│       │   └── fonts/              # 字体
│       └── README.md
│
├── packages/                       # 共享包/库 (新增)
│   ├── shared/                     # 前后端共享类型/常量
│   │   ├── src/
│   │   │   ├── constants/          #   业务常量 (API路径、状态码、枚举)
│   │   │   └── types/              #   TypeScript/JSDoc 类型定义
│   │   └── package.json
│   └── database/                   # 数据库独立包
│       ├── src/
│       │   ├── schema/             #   表结构定义
│       │   ├── migrations/         #   迁移脚本 (版本化)
│       │   ├── seeds/              #   种子数据
│       │   └── queries/            #   SQL 查询模板
│       └── package.json
│
├── src/                            # 后端主代码 (重构)
│   ├── index.js                    # 应用入口 (原 src/server/index.js)
│   ├── app.js                      # Express 应用创建 (原 src/server/app.js)
│   ├── config/                     # 配置管理
│   │   ├── index.js                #   配置聚合导出
│   │   ├── app.js                  #   应用配置 (port, cors, demo)
│   │   ├── database.js             #   数据库配置
│   │   ├── auth.js                 #   JWT 配置
│   │   ├── llm.js                  #   LLM 配置
│   │   ├── embedding.js            #   向量嵌入配置
│   │   ├── chroma.js               #   ChromaDB 配置
│   │   ├── email.js                #   邮件配置
│   │   └── xfyun.js                #   讯飞配置
│   │
│   ├── middleware/                  # 中间件
│   │   ├── index.js                #   中间件聚合注册
│   │   ├── auth.js                 #   JWT 认证
│   │   ├── role.js                 #   角色权限 (teacher, admin)
│   │   ├── rate-limit.js           #   限流
│   │   ├── request-logger.js       #   请求日志
│   │   ├── error-handler.js        #   全局错误处理
│   │   └── validate.js             #   请求参数校验
│   │
│   ├── routes/                     # 路由层 (统一合并 modules + routes)
│   │   ├── index.js                #   路由清单 & 自动挂载
│   │   ├── auth.routes.js          #   认证: 登录/注册/登出/刷新Token
│   │   ├── user.routes.js          #   用户: 个人信息/设置/画像
│   │   ├── diagnostic.routes.js    #   诊断: 文本诊断/问卷/测试/报告
│   │   ├── learning.routes.js      #   学习: 路径/计划/任务/进度
│   │   ├── knowledge.routes.js     #   知识: 知识库/图谱/笔记
│   │   ├── exam.routes.js          #   考试: 试卷/答题/批改/成绩
│   │   ├── course.routes.js        #   课程: 课程管理/资源
│   │   ├── agent.routes.js         #   Agent: 运行时/协作/决策/工具
│   │   ├── rag.routes.js           #   RAG: 检索/索引/文档管理
│   │   ├── tutor.routes.js         #   导师: AI导师/苏格拉底式问答
│   │   ├── teacher.routes.js       #   教师端: 班级/学生/教学管理
│   │   ├── admin.routes.js         #   管理端: 系统配置/日志/监控
│   │   ├── ai.routes.js            #   AI能力: 配置/日志/解释/学习
│   │   ├── membership.routes.js    #   会员: 增值服务/权益
│   │   ├── notification.routes.js  #   通知: 消息/每日摘要/邮件
│   │   ├── collaboration.routes.js #   协作: 团队编程/代码仓库
│   │   ├── tts.routes.js           #   TTS/语音/虚拟人
│   │   ├── obsidian.routes.js      #   Obsidian集成
│   │   ├── compiler.routes.js      #   在线编译器
│   │   ├── paper-scan.routes.js    #   试卷扫描/OCR
│   │   └── health.routes.js        #   健康检查/监控
│   │
│   ├── controllers/                # 控制器层 (从 routes 分离业务逻辑)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── diagnostic.controller.js
│   │   ├── learning.controller.js
│   │   ├── knowledge.controller.js
│   │   ├── exam.controller.js
│   │   ├── course.controller.js
│   │   ├── agent.controller.js
│   │   ├── rag.controller.js
│   │   ├── tutor.controller.js
│   │   ├── teacher.controller.js
│   │   ├── admin.controller.js
│   │   ├── ai.controller.js
│   │   ├── membership.controller.js
│   │   ├── notification.controller.js
│   │   ├── collaboration.controller.js
│   │   ├── tts.controller.js
│   │   └── paper-scan.controller.js
│   │
│   ├── services/                   # 业务服务层 (核心业务逻辑)
│   │   ├── auth/                   #   认证服务
│   │   │   ├── auth.service.js
│   │   │   └── token.service.js
│   │   ├── user/                   #   用户服务
│   │   │   ├── user.service.js
│   │   │   └── profile.service.js
│   │   ├── diagnostic/             #   诊断服务
│   │   │   ├── diagnostic.service.js
│   │   │   ├── cognitive-diagnosis.service.js
│   │   │   └── smart-report.service.js
│   │   ├── learning/               #   学习服务
│   │   │   ├── learning-path.service.js
│   │   │   ├── study-plan.service.js
│   │   │   ├── learning-assessment.service.js
│   │   │   ├── learning-dashboard.service.js
│   │   │   ├── learning-loop.service.js
│   │   │   ├── mastery-calculator.service.js
│   │   │   └── forgetting-curve.service.js
│   │   ├── knowledge/              #   知识服务
│   │   │   ├── knowledge-base.service.js
│   │   │   ├── knowledge-graph.service.js
│   │   │   ├── smart-note.service.js
│   │   │   └── personal-knowledge.service.js
│   │   ├── exam/                   #   考试服务
│   │   │   ├── exam.service.js
│   │   │   ├── question.service.js
│   │   │   ├── essay-grader.service.js
│   │   │   └── paper-generator.service.js
│   │   ├── course/                 #   课程服务
│   │   │   └── course.service.js
│   │   ├── agent/                  #   Agent 服务
│   │   │   ├── agent-runtime.service.js
│   │   │   ├── agent-communicator.service.js
│   │   │   ├── agent-run-metadata.service.js
│   │   │   ├── orchestrator-agent.service.js
│   │   │   ├── learning-agent.service.js
│   │   │   ├── profile-agent.service.js
│   │   │   ├── resource-agent.service.js
│   │   │   ├── safety-agent.service.js
│   │   │   ├── supervisor-agent.service.js
│   │   │   ├── tts-agent.service.js
│   │   │   └── agentic-learning.service.js
│   │   ├── rag/                    #   RAG 服务
│   │   │   ├── rag-search.service.js
│   │   │   ├── embedding.service.js
│   │   │   ├── chroma-client.service.js
│   │   │   └── public-rag-ingestor.service.js
│   │   ├── tutor/                  #   导师服务
│   │   │   ├── socratic-tutor.service.js
│   │   │   └── ai-tutor.service.js
│   │   ├── ai/                     #   AI 通用服务
│   │   │   ├── ai-config.service.js
│   │   │   ├── ai-interaction-store.service.js
│   │   │   ├── ai-path-generator.service.js
│   │   │   └── ai-devops-orchestrator.service.js
│   │   ├── llm/                    #   LLM 网关
│   │   │   ├── llm-gateway.service.js
│   │   │   └── local-llm-client.service.js
│   │   ├── recommendation/         #   推荐服务
│   │   │   ├── recommendation.service.js
│   │   │   └── adaptive-practice.service.js
│   │   ├── assessment/             #   评估服务
│   │   │   ├── bkt-model.service.js
│   │   │   ├── knowledge-tracing.service.js
│   │   │   ├── metacognitive.service.js
│   │   │   └── resilience-predictor.service.js
│   │   ├── membership/             #   会员服务
│   │   │   └── membership.service.js
│   │   ├── notification/           #   通知服务
│   │   │   ├── email.service.js
│   │   │   ├── daily-digest.service.js
│   │   │   └── notification.service.js
│   │   ├── collaboration/          #   协作服务
│   │   │   ├── code-repo.service.js
│   │   │   └── team-code.service.js
│   │   ├── media/                  #   多媒体服务
│   │   │   ├── tts.service.js
│   │   │   ├── virtual-human.service.js
│   │   │   └── immersive-reader.service.js
│   │   ├── obsidian/               #   Obsidian 集成
│   │   │   ├── obsidian-sync.service.js
│   │   │   ├── obsidian-rag-sync.service.js
│   │   │   └── obsidian-linker.service.js
│   │   ├── compiler/               #   在线编译
│   │   │   └── compiler.service.js
│   │   └── paper-scan/             #   试卷扫描
│   │       └── paper-scan.service.js
│   │
│   ├── repositories/               # 数据访问层 (Repository 模式)
│   │   ├── base.repository.js      #   基础 Repository (CRUD 模板)
│   │   ├── user.repository.js
│   │   ├── exam.repository.js
│   │   ├── question.repository.js
│   │   ├── course.repository.js
│   │   ├── knowledge.repository.js
│   │   ├── note.repository.js
│   │   ├── learning-path.repository.js
│   │   ├── study-plan.repository.js
│   │   ├── agent-run.repository.js
│   │   ├── rag-document.repository.js
│   │   ├── membership.repository.js
│   │   ├── notification.repository.js
│   │   └── diagnostic.repository.js
│   │
│   ├── database/                   # 数据库管理 (集中管理)
│   │   ├── connection.js           #   连接池 (原 src/db.js)
│   │   ├── migrations/             #   迁移脚本 (版本化命名)
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_agent_foundation.sql
│   │   │   ├── ...
│   │   │   └── 006_smart_diagnosis.sql
│   │   ├── seeds/                  #   种子数据
│   │   │   ├── seed-users.js
│   │   │   ├── seed-knowledge-points.js
│   │   │   ├── seed-courses.js
│   │   │   ├── seed-questions.js
│   │   │   └── seed-rag.js
│   │   ├── migrate.js              #   迁移执行器
│   │   └── rebuild.js              #   数据库重建脚本
│   │
│   ├── domain/                     # 领域模型/实体 (新增)
│   │   ├── user.model.js
│   │   ├── exam.model.js
│   │   ├── question.model.js
│   │   ├── course.model.js
│   │   ├── knowledge-point.model.js
│   │   ├── learning-path.model.js
│   │   ├── study-plan.model.js
│   │   ├── note.model.js
│   │   └── diagnostic.model.js
│   │
│   ├── agent/                      # Agent 系统 (从 core 独立)
│   │   ├── runtime/                #   Agent 运行时
│   │   │   ├── agent-runtime.js
│   │   │   ├── agent-communicator.js
│   │   │   └── agent-run-metadata.js
│   │   ├── agents/                 #   各类 Agent
│   │   │   ├── orchestrator.agent.js
│   │   │   ├── learning.agent.js
│   │   │   ├── profile.agent.js
│   │   │   ├── resource.agent.js
│   │   │   ├── safety.agent.js
│   │   │   ├── supervisor.agent.js
│   │   │   ├── tts.agent.js
│   │   │   └── agentic-learning.agent.js
│   │   ├── tools/                  #   Agent 工具
│   │   │   ├── tool-registry.js
│   │   │   ├── course-design.tool.js
│   │   │   ├── mastery.tool.js
│   │   │   ├── note.tool.js
│   │   │   ├── path.tool.js
│   │   │   ├── practice.tool.js
│   │   │   ├── profile.tool.js
│   │   │   ├── public-source.tool.js
│   │   │   ├── rag.tool.js
│   │   │   └── resource.tool.js
│   │   └── index.js                #   Agent 系统入口
│   │
│   ├── llm/                        # LLM 网关 (从 core 独立)
│   │   ├── llm-gateway.js
│   │   ├── local-llm-client.js
│   │   ├── ai-interaction-store.js
│   │   └── index.js
│   │
│   ├── rag/                        # RAG 系统 (从 core 独立)
│   │   ├── chroma-client.js
│   │   ├── embedding-service.js
│   │   ├── rag-search-service.js
│   │   ├── public-rag-ingestor.js
│   │   └── index.js
│   │
│   ├── utils/                      # 工具函数库 (扩充)
│   │   ├── response.js             #   统一响应格式
│   │   ├── logger.js               #   日志工具
│   │   ├── crypto.js               #   加密工具
│   │   ├── date.js                 #   日期工具
│   │   ├── validator.js            #   通用校验
│   │   ├── pagination.js           #   分页工具
│   │   ├── retry.js                #   重试机制
│   │   └── xfyun-auth.js           #   讯飞鉴权
│   │
│   ├── constants/                  # 常量定义 (新增)
│   │   ├── api-paths.js            #   API 路径常量
│   │   ├── error-codes.js          #   错误码
│   │   ├── enums.js                #   枚举 (角色、状态、类型)
│   │   └── defaults.js             #   默认值
│   │
│   └── types/                      # 类型定义 (新增，JSDoc 或 TypeScript)
│       ├── user.d.ts
│       ├── exam.d.ts
│       ├── learning.d.ts
│       └── agent.d.ts
│
├── tests/                          # 测试 (重构)
│   ├── unit/                       #   单元测试
│   │   ├── services/               #     服务层测试
│   │   ├── repositories/           #     数据访问层测试
│   │   └── utils/                  #     工具函数测试
│   ├── integration/                #   集成测试
│   │   ├── api/                    #     API 集成测试
│   │   ├── agent/                  #     Agent 集成测试
│   │   └── database/               #     数据库集成测试
│   ├── e2e/                        #   端到端测试
│   ├── fixtures/                   #   测试夹具/数据
│   └── helpers/                    #   测试辅助工具
│
├── scripts/                        # 脚本 (重构分类)
│   ├── dev/                        #   开发辅助
│   │   └── check-syntax.js
│   ├── database/                   #   数据库脚本
│   │   ├── migrate.js
│   │   ├── rebuild.js
│   │   ├── seed-cs-data.js
│   │   └── import-real-courses.js
│   ├── rag/                        #   RAG 脚本
│   │   └── import-rag-bundle.js
│   ├── obsidian/                   #   Obsidian 脚本
│   │   ├── sync-questions.js
│   │   └── sync-rag.js
│   ├── demo/                       #   演示脚本
│   │   ├── demo-agent.js
│   │   ├── demo-personalized-path.js
│   │   └── demo-finish-path-walkthrough.js
│   ├── screenshot/                 #   截图脚本
│   │   ├── capture-screenshots.js
│   │   └── capture-agent-rag-screenshots.js
│   ├── daily/                      #   定时任务
│   │   └── run-daily-digest.js
│   └── utils/                      #   工具脚本
│       ├── fix-course-name.js
│       └── fix-kp-frontmatter.js
│
├── docs/                           # 文档 (重构分类)
│   ├── architecture/               #   架构文档
│   │   ├── system-overview.md
│   │   ├── project-structure.md
│   │   └── data-flow.md
│   ├── features/                   #   功能设计文档
│   │   ├── diagnostic-system.md
│   │   ├── learning-path-agent.md
│   │   ├── knowledge-platform.md
│   │   ├── membership-system.md
│   │   ├── collaborative-coding.md
│   │   ├── obsidian-integration.md
│   │   └── local-llm-rag.md
│   ├── api/                        #   API 文档
│   │   ├── api-reference.md
│   │   └── api-demo-results.md
│   ├── product/                    #   产品文档
│   │   ├── project-plan.md
│   │   ├── implementation-report.md
│   │   └── remediation-plan.md
│   ├── screenshots/                #   截图
│   │   └── showcase/
│   ├── assets/                     #   文档素材
│   └── README.md                   #   文档索引
│
├── tools/                          # 工具/辅助 (新增，收纳根目录杂项)
│   ├── thesis/                     #   论文相关工具
│   │   ├── finalize-layout.py
│   │   ├── merge-versions.py
│   │   ├── render-pdf-qa.py
│   │   └── revise-thesis.py
│   └── installer/                  #   安装程序
│       └── setup.iss
│
├── .env.example                    # 环境变量模板
├── .gitignore
├── .prettierrc
├── package.json
├── package-lock.json
└── README.md
```

---

## 3. 分层架构图

```
┌─────────────────────────────────────────────────────────┐
│                    apps/web (前端)                        │
│  public/css/   public/js/   public/images/               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/WS
┌──────────────────────▼──────────────────────────────────┐
│                  src/routes/ (路由层)                     │
│  定义 HTTP 方法、路径、中间件、参数校验                    │
│  薄层: 只做路由注册和请求/响应映射                         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              src/controllers/ (控制器层)                  │
│  请求解析、参数提取、调用 Service、组装响应                │
│  薄层: 不做业务逻辑                                       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               src/services/ (业务服务层)                  │
│  核心业务逻辑、领域规则、跨模块编排                        │
│  厚层: 所有业务逻辑在此                                    │
│  ├── diagnostic/  ├── learning/  ├── agent/              │
│  ├── rag/         ├── llm/       ├── tutor/              │
│  └── ...          └── ...        └── ...                 │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│            src/repositories/ (数据访问层)                  │
│  封装数据库操作、SQL 查询、事务管理                         │
│  base.repository.js 提供通用 CRUD                         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               MySQL Database (外部)                       │
└─────────────────────────────────────────────────────────┘

横切关注点 (Cross-Cutting):
┌─────────────────────────────────────────────────────────┐
│  src/middleware/  │  src/utils/  │  src/constants/       │
│  src/config/      │  src/types/  │  src/domain/          │
└─────────────────────────────────────────────────────────┘

独立子系统 (Sub-Systems):
┌─────────────────────────────────────────────────────────┐
│  src/agent/  │  src/llm/  │  src/rag/  │  src/database/  │
└─────────────────────────────────────────────────────────┘
```

---

## 4. 数据流示意

```
HTTP Request
    │
    ▼
routes/auth.routes.js          ← 路由注册，绑定中间件
    │
    ▼
middleware/auth.js              ← JWT 校验
    │
    ▼
controllers/auth.controller.js ← 提取 req.body, 调用 service
    │
    ▼
services/auth/auth.service.js  ← 业务逻辑: 验证密码、生成Token
    │
    ▼
repositories/user.repository.js ← SQL: SELECT * FROM users WHERE...
    │
    ▼
database/connection.js          ← mysql2 连接池
    │
    ▼
MySQL
```

---

## 5. 关键变更清单

| # | 变更项 | 影响范围 | 优先级 |
|---|--------|----------|--------|
| 1 | `src/core/` → 拆分为 `services/` + `agent/` + `llm/` + `rag/` | 65个文件重组 | P0 |
| 2 | `src/modules/` + `src/routes/` → 统一 `routes/` + `controllers/` | 53个文件重组 | P0 |
| 3 | `src/config.js` → 拆分 `config/` 目录 | 1→8个文件 | P0 |
| 4 | `src/db.js` + `src/middleware.js` → 归入对应目录 | 2个文件移动 | P0 |
| 5 | `src/db/` → 扩展为 `src/database/` (迁移+种子+连接) | 增强 | P1 |
| 6 | 新增 `src/repositories/` 数据访问层 | 新增 | P1 |
| 7 | 新增 `src/controllers/` 控制器层 | 新增 | P1 |
| 8 | 新增 `src/domain/` 领域模型 | 新增 | P2 |
| 9 | 新增 `src/constants/` + `src/types/` | 新增 | P2 |
| 10 | `scripts/` → 按用途分类子目录 | 20个文件重组 | P1 |
| 11 | `docs/` → 按类型分类子目录 | 35+个文件重组 | P1 |
| 12 | `apps/web/` → 前端模块化重构 | 21个文件重组 | P2 |
| 13 | `test/` → `tests/` 按层级分类 | 4个文件重组 | P2 |
| 14 | 根目录清理 (Python脚本/PDF/图片→tools/) | 减少根目录噪音 | P1 |

---

## 6. 实施建议

### 分阶段执行

**Phase 1 - 基础设施重构 (P0)**
- 拆分 `src/config/` 目录
- 拆分 `src/middleware/` 目录
- 建立 `src/database/` 目录 (迁移+连接)
- 新增 `src/utils/` 基础工具
- 新增 `src/constants/` 常量定义

**Phase 2 - 业务代码重组 (P0)**
- `src/core/` → 按领域拆分到 `services/`、`agent/`、`llm/`、`rag/`
- `src/modules/` → 拆分为 `routes/` + `controllers/`
- 更新 `route-manifest.js` → 统一路由注册

**Phase 3 - 架构增强 (P1)**
- 新增 `src/repositories/` 数据访问层
- 新增 `src/domain/` 领域模型
- 脚本和文档目录重组

**Phase 4 - 前端 & 测试 (P2)**
- `apps/web/` 前端模块化
- `tests/` 测试体系重构
- CI/CD 流水线配置

---

## 7. 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 路由文件 | `{domain}.routes.js` | `auth.routes.js` |
| 控制器 | `{domain}.controller.js` | `auth.controller.js` |
| 服务 | `{domain}.service.js` | `auth.service.js` |
| 仓库 | `{domain}.repository.js` | `user.repository.js` |
| 模型 | `{domain}.model.js` | `user.model.js` |
| 中间件 | `{name}.js` | `auth.js` |
| Agent | `{name}.agent.js` | `learning.agent.js` |
| 工具 | `{name}.tool.js` | `rag.tool.js` |
| 常量 | `{name}.js` | `error-codes.js` |
| 配置 | `{name}.js` | `database.js` |
| SQL 迁移 | `{NNN}_{description}.sql` | `001_initial_schema.sql` |
