# EduSmart Backend 源码结构

> 最后更新: 2026-06-27 (架构重构 v2.1)

## 目录架构

```
src/
├── index.js                    # 应用入口（通过 src/server/index.js 启动）
├── app.js                      # Express 应用工厂
│
├── config/                     # 配置层（环境变量 → 结构化配置）
│   ├── index.js                #   配置聚合导出
│   ├── app.js                  #   应用基础（名称、模式）
│   ├── server.js               #   服务器（端口、CORS）
│   ├── database.js             #   数据库连接池配置
│   ├── auth.js                 #   JWT 认证配置
│   ├── llm.js                  #   LLM 大模型配置
│   ├── embedding.js            #   向量嵌入配置
│   ├── chroma.js               #   ChromaDB 配置
│   ├── email.js                #   邮件发送配置
│   └── xfyun.js                #   讯飞开放平台配置
│
├── middleware/                  # 中间件层（请求拦截/处理）
│   ├── index.js                #   中间件聚合导出
│   ├── auth.js                 #   JWT 认证 + 角色校验
│   ├── error-handler.js        #   全局错误处理
│   ├── request-logger.js       #   HTTP 请求日志
│   ├── rate-limit.js           #   API 限流
│   └── validate.js             #   请求参数校验
│
├── routes/                     # 路由层（HTTP 端点定义）
│   └── user.js                 #   用户相关路由（兼容旧版）
│
├── modules/                    # 模块层（Express Router 业务模块）
│   ├── auth.js                 #   认证：登录/注册/登出
│   ├── app.js                  #   核心应用接口
│   ├── diagnostic.js           #   智能诊断
│   ├── learning-loop.js        #   学习闭环
│   ├── knowledge.js            #   知识库
│   ├── agent.js                #   Agent 管理
│   ├── rag.js                  #   RAG 检索
│   ├── tutor.js                #   AI 导师
│   ├── teacher.js              #   教师端
│   ├── admin.js                #   管理端
│   └── ... (52 个模块)
│
├── core/                       # 核心引擎层（领域逻辑，待拆分至 services/）
│   ├── agent-tools/            #   Agent 工具注册
│   ├── llm/                    #   LLM 网关
│   ├── DiagnosticEngine.js     #   诊断引擎
│   ├── LearningAgent.js        #   学习 Agent
│   ├── RagSearchService.js     #   RAG 检索
│   └── ... (65 个文件)
│
├── services/                   # 服务层（可复用业务服务）
│   ├── dailyDigestService.js   #   每日摘要
│   ├── emailService.js         #   邮件发送
│   ├── membershipService.js    #   会员服务
│   └── ... (6 个文件)
│
├── database/                   # 数据库管理
│   ├── index.js                #   数据库模块入口
│   ├── connection.js           #   MySQL 连接池
│   └── migrations/             #   数据库迁移脚本
│       └── 006_smart_diagnosis.sql
│
├── constants/                  # 常量定义
│   ├── index.js                #   常量聚合导出
│   ├── enums.js                #   业务枚举（角色、状态、类型）
│   ├── error-codes.js          #   错误码定义
│   ├── api-paths.js            #   API 路径常量
│   └── defaults.js             #   系统默认值
│
└── utils/                      # 工具函数库
    ├── index.js                #   工具聚合导出
    ├── response.js             #   统一 API 响应格式
    ├── logger.js               #   日志工具
    ├── pagination.js           #   分页工具
    └── xfyun-auth.js           #   讯飞 HMAC 鉴权
```

## 分层架构

```
HTTP Request
    │
    ▼
routes/ + modules/    ← 路由层：URL → 处理函数映射
    │
    ▼
middleware/           ← 横切关注点：认证、日志、限流、校验
    │
    ▼
core/ → services/     ← 业务逻辑层：领域规则、编排
    │
    ▼
database/             ← 数据访问层：MySQL 连接池
    │
    ▼
MySQL
```

## 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 配置 | `{domain}.js` | `database.js` |
| 中间件 | `{功能}.js` | `auth.js` |
| 路由 | `{domain}.routes.js` | `auth.routes.js` |
| 模块 | `{domain}.js` | `auth.js` |
| 引擎 | `{Name}Engine.js` | `DiagnosticEngine.js` |
| 服务 | `{domain}Service.js` | `emailService.js` |
| 工具 | `{功能}.js` | `response.js` |
| 常量 | `{分类}.js` | `enums.js` |
| 迁移 | `{NNN}_{描述}.sql` | `006_smart_diagnosis.sql` |

## 兼容文件

根目录以下文件为旧脚本兼容转发：

- `server.js` → `src/server/index.js`
- `config.js` → `src/config/index.js`
- `db.js` → `src/database/connection.js`
- `middleware.js` → `src/middleware/index.js`

新代码请直接引用 `src/` 下的模块路径。
