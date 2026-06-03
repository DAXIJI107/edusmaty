# EduSmart AI + 知识管理融合功能设计文档

**文档版本**: v1.0  
**创建日期**: 2026-05-25  
**适用项目**: EduSmart Learning Platform  
**设计作者**: System Architect  

---

## 目录

1. [需求分析](#一-需求分析)
2. [设计目标](#二-设计目标)
3. [功能设计详解](#三-功能设计详解)
   - 3.1 知识网络图谱
   - 3.2 概念画布
   - 3.3 每日学习日记
   - 3.4 多 Agent 协作学习
   - 3.5 ReAct 思考链可视化
   - 3.6 自定义工具注册
   - 3.7 AI Agent 微课程
   - 3.8 知识掌握热力图谱（教师端）
4. [技术架构](#四-技术架构)
5. [数据库设计](#五-数据库设计)
6. [API 接口设计](#六-api-接口设计)
7. [前端页面设计](#七-前端页面设计)
8. [实施计划](#八-实施计划)

---

## 一、需求分析

### 1.1 背景

基于用户提供的三个工具分析文档（Hello-Agents、AgentScope、Obsidian），结合 EduSmart 现有功能，需要提取其核心理念进行融合升级：

| 工具 | 类型 | 核心理念 | 可借鉴点 |
|------|------|----------|----------|
| Hello-Agents | AI Agent 教程 | 系统学习 Agent 原理与实践 | ReAct 范式、Agent 教育课程 |
| AgentScope | Agent 开发框架 | 多 Agent 协作、工具调用、ReAct | MsgHub、Pipeline、工具注册 |
| Obsidian | 知识管理软件 | 双向链接、图谱、Canvas | 知识图谱、每日笔记、画布 |

### 1.2 现有功能分析

EduSmart 已具备：
- AI 学习智能体控制台 (`intelligenceView`)
- AI 助手 (`aiAssistantView`) - 5 种模式问答
- 智能笔记系统 (`smartNotesView`)
- RAG 知识库、元认知学习、教师工作台、学习路径等

### 1.3 缺失能力

| 维度 | 缺失能力 | 影响 |
|------|----------|------|
| 知识管理 | 双向链接、图谱可视化、Canvas | 笔记孤立，无法形成知识网络 |
| 智能体 | 多 Agent 协作、ReAct 透明化、工具系统 | AI 回答是黑盒，无法展示思考过程 |
| AI 素养 | Agent 原理教育、交互沙盒 | 学生只知用 AI，不懂 AI 原理 |
| 教师端 | 知识掌握热力图 | 难以及时发现班级薄弱点 |

---

## 二、设计目标

### 2.1 核心目标

将 EduSmart 从「学习管理工具」升级为「AI 驱动的知识管理 + 协作学习平台」

### 2.2 设计原则

1. **渐进增强**：不破坏现有功能，新增功能作为扩展
2. **用户体验优先**：可视化、交互友好
3. **技术复用**：充分利用现有技术栈（Express、Vanilla JS、MySQL）
4. **可扩展性**：支持未来新增 Agent 能力和知识管理功能

### 2.3 功能优先级

| 优先级 | 功能 | 理由 |
|--------|------|------|
| P0 | 知识网络图谱、多 Agent 协作、知识热力图 | 核心体验升级，直接提升学习/教学效率 |
| P1 | 概念画布、ReAct 可视化、AI 课程 | 差异化竞争力，打造特色功能 |
| P2 | 每日日记、工具注册 | 锦上添花，完善知识管理闭环 |

---

## 三、功能设计详解

### 3.1 知识网络图谱

**设计理念**: Obsidian Graph View + 双向链接

**功能描述**:
- 笔记支持 `[[知识点名]]` 双向链接语法
- 自动解析链接，建立笔记间关联关系
- 可视化图谱展示：节点=笔记/知识点，连线=引用关系
- 节点颜色表示掌握度（绿/黄/红），大小表示重要程度

**用户流程**:
1. 学生在笔记中输入 `[[二分查找]]` 创建链接
2. 系统自动识别并建立关联
3. 点击「知识图谱」查看可视化网络
4. 点击节点跳转对应笔记

**实现效果**:
- 学生的笔记不再孤立，形成知识网络
- 可视化展示知识点之间的联系
- 帮助学生建立系统化认知

---

### 3.2 概念画布

**设计理念**: Obsidian Canvas

**功能描述**:
- 拖拽式画布界面
- 支持拖入笔记、知识点、题目、课程章节
- 用连线建立关系（前置知识、容易混淆、举例等）
- 画布可保存、分享、导出

**用户流程**:
1. 进入「概念画布」页面
2. 从侧边栏拖入知识点卡片
3. 拖拽调整位置
4. 用连线连接相关概念
5. 保存画布

**实现效果**:
- 视觉化组织学习材料
- 适合考前复习、项目规划、论文大纲
- 直观展示概念间关系

---

### 3.3 每日学习日记

**设计理念**: Obsidian Daily Notes

**功能描述**:
- 每天自动生成日记模板
- 自动汇总当日学习数据：课程、练习、笔记、AI 对话
- 预留反思区供手动补充
- 支持按日期归档查看

**用户流程**:
1. 每日首次打开自动生成日记
2. 系统填充当日学习数据
3. 学生补充反思内容
4. 保存并查看历史日记

**实现效果**:
- 形成持续的学习记录
- 方便期末复习和复盘
- 记录学习进步轨迹

---

### 3.4 多 Agent 协作学习

**设计理念**: AgentScope MsgHub + Pipeline

**功能描述**:
- 一个学习任务由多 Agent 协作完成：
  - **规划 Agent**: 拆解学习目标
  - **教学 Agent**: 生成讲解内容
  - **出题 Agent**: 生成验证题目
  - **评估 Agent**: 分析答题结果
- 展示 Agent 之间的协作对话

**用户流程**:
1. 学生输入学习目标（如"我想学二分查找"）
2. 规划 Agent 拆解知识点
3. 教学 Agent 生成讲解
4. 出题 Agent 生成练习
5. 评估 Agent 分析结果

**实现效果**:
- 模拟真实的多教师协作教学
- 形成完整的学习闭环
- 不只是问答，而是系统性教学

---

### 3.5 ReAct 思考链可视化

**设计理念**: AgentScope ReAct Agent + Hello-Agents 教学

**功能描述**:
- AI 回答时展示思考链：思考→行动→观察→结论
- 可折叠展开的步骤卡片
- 透明展示 AI 推理过程

**用户流程**:
1. 学生提问
2. AI 返回结构化回答（含思考链）
3. 学生展开查看每一步推理
4. 理解 AI 的思考方法

**实现效果**:
- AI 不再是黑盒
- 学生学会 AI 的推理方法
- 提升学习深度

---

### 3.6 自定义工具注册

**设计理念**: AgentScope Toolkit

**功能描述**:
- 预设工具库：代码执行、数学计算、翻译、天气等
- 学生可启用/禁用工具
- 教师可创建自定义工具

**用户流程**:
1. 进入「工具中心」页面
2. 选择需要的工具启用
3. 与 AI 交互时自动调用工具

**实现效果**:
- AI 能力可扩展
- 支持实际任务操作
- 提升学习实用性

---

### 3.7 AI Agent 微课程

**设计理念**: Hello-Agents 系统课程

**功能描述**:
- 5 节微课程：什么是 Agent → ReAct → 工具调用 → 记忆 → 多 Agent
- 每节包含：教程 + ReAct 沙盒演示 + 测验
- 完成后获得「AI 素养」徽章

**用户流程**:
1. 进入课程系统选择「AI Agent」分类
2. 按顺序学习各章节
3. 在沙盒中实践 ReAct
4. 完成测验获得徽章

**实现效果**:
- 提升学生 AI 素养
- 从工具使用者变为 AI 理解者
- 培养未来竞争力

---

### 3.8 知识掌握热力图谱（教师端）

**设计理念**: Obsidian 图谱 + AgentScope 评估

**功能描述**:
- 展示全班知识掌握情况的热力图
- 节点颜色=平均掌握度，大小=考试频次
- 点击节点查看学生明细
- 一键分配补救练习

**用户流程**:
1. 教师进入「知识图谱」Tab
2. 查看班级知识掌握热力图
3. 发现薄弱点节点
4. 点击查看学生明细
5. 一键分配补救练习

**实现效果**:
- 数据驱动教学决策
- 快速发现班级薄弱点
- 精准干预提升教学效率

---

## 四、技术架构

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端层 (Vanilla JS)                    │
│  ┌─────────────┬─────────────┬─────────────────────────┐   │
│  │ 笔记系统     │ AI 助手      │ 教师工作台              │   │
│  │ +图谱视图    │ +ReAct可视化 │ +知识热力图             │   │
│  └─────────────┴─────────────┴─────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      API 层 (Express.js)                   │
│  ┌─────────────┬─────────────┬─────────────────────────┐   │
│  │ knowledge   │ agent       │ teacher                 │   │
│  │ +graph      │ +collaborate│ +knowledge-graph        │   │
│  │ +journal    │ +react-log  │                         │   │
│  │ +canvas     │ +tools      │                         │   │
│  └─────────────┴─────────────┴─────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    数据层 (MySQL)                           │
│  ┌─────────────┬─────────────┬─────────────────────────┐   │
│  │ note_links  │ agent_tools │ daily_journals          │   │
│  │ canvases    │ react_logs  │ agent_courses           │   │
│  └─────────────┴─────────────┴─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端 | Vanilla JS | ES6+ |
| 样式 | CSS3 | - |
| 后端 | Express.js | 4.x |
| 数据库 | MySQL | 8.x |
| AI 服务 | Spark API / 讯飞 OCR | - |

---

## 五、数据库设计

### 5.1 新增表结构

#### 表：`note_links`（笔记链接关系）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY AUTO_INCREMENT | 主键 |
| source_note_id | INT | FOREIGN KEY | 源笔记ID |
| target_title | VARCHAR(255) | NOT NULL | 目标链接标题（用于搜索匹配） |
| target_note_id | INT | NULL | 匹配到的目标笔记ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 表：`canvases`（概念画布）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY AUTO_INCREMENT | 主键 |
| user_id | INT | NOT NULL | 用户ID |
| name | VARCHAR(255) | NOT NULL | 画布名称 |
| data | LONGTEXT | NULL | 画布数据（JSON格式） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 表：`daily_journals`（每日学习日记）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY AUTO_INCREMENT | 主键 |
| user_id | INT | NOT NULL | 用户ID |
| date | DATE | NOT NULL UNIQUE | 日记日期 |
| auto_summary | TEXT | NULL | 系统自动汇总内容 |
| manual_note | TEXT | NULL | 用户手动补充 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 表：`agent_tools`（Agent 工具）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY AUTO_INCREMENT | 主键 |
| name | VARCHAR(100) | NOT NULL | 工具名称 |
| description | VARCHAR(500) | NULL | 工具描述 |
| type | VARCHAR(50) | NOT NULL | 工具类型（预设/自定义） |
| config | TEXT | NULL | 工具配置（JSON） |
| is_active | TINYINT | DEFAULT 1 | 是否启用 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 表：`agent_collaboration_logs`（Agent 协作日志）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY AUTO_INCREMENT | 主键 |
| user_id | INT | NOT NULL | 用户ID |
| task_id | VARCHAR(50) | NOT NULL | 任务ID |
| agent_name | VARCHAR(100) | NOT NULL | Agent 名称 |
| step_type | VARCHAR(50) | NOT NULL | 步骤类型（plan/teach/quiz/evaluate） |
| content | TEXT | NULL | 步骤内容 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 表：`ai_courses`（AI Agent 微课程）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY AUTO_INCREMENT | 主键 |
| title | VARCHAR(255) | NOT NULL | 课程标题 |
| order_num | INT | NOT NULL | 排序号 |
| content | LONGTEXT | NULL | 课程内容（Markdown） |
| sandbox_data | TEXT | NULL | 沙盒演示数据 |
| quiz_data | TEXT | NULL | 测验数据（JSON） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

## 六、API 接口设计

### 6.1 知识网络图谱接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/knowledge/graph` | GET | 获取知识图谱数据 |
| `/api/knowledge/links` | POST | 创建笔记链接 |
| `/api/knowledge/links/:id` | DELETE | 删除链接 |

### 6.2 概念画布接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/knowledge/canvas` | GET | 获取画布列表 |
| `/api/knowledge/canvas` | POST | 创建画布 |
| `/api/knowledge/canvas/:id` | GET | 获取画布详情 |
| `/api/knowledge/canvas/:id` | PUT | 更新画布 |
| `/api/knowledge/canvas/:id` | DELETE | 删除画布 |

### 6.3 每日日记接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/knowledge/journal` | GET | 获取日记列表 |
| `/api/knowledge/journal/today` | GET | 获取今日日记 |
| `/api/knowledge/journal` | POST | 创建/更新日记 |

### 6.4 多 Agent 协作接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/agent/collaborate` | POST | 启动多 Agent 协作任务 |
| `/api/agent/collaborate/:taskId` | GET | 获取任务进度 |
| `/api/agent/collaborate/logs` | GET | 获取协作日志 |

### 6.5 ReAct 思考链接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/agent/react` | POST | 获取带思考链的回答 |

### 6.6 工具管理接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/agent/tools` | GET | 获取工具列表 |
| `/api/agent/tools` | POST | 创建自定义工具 |
| `/api/agent/tools/:id` | PUT | 更新工具状态 |
| `/api/agent/tools/:id` | DELETE | 删除工具 |

### 6.7 AI 课程接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/courses/ai-agent` | GET | 获取 AI Agent 课程列表 |
| `/api/courses/ai-agent/:id` | GET | 获取课程详情 |
| `/api/courses/ai-agent/:id/quiz` | POST | 提交测验答案 |

### 6.8 教师知识图谱接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/teacher/knowledge-graph` | GET | 获取班级知识掌握图谱 |
| `/api/teacher/knowledge-graph/:nodeId` | GET | 获取知识点详情 |

---

## 七、前端页面设计

### 7.1 知识图谱页面

**路径**: `/knowledge-graph`

**布局**:
- 左侧：笔记列表 + 搜索
- 中间：图谱画布（Canvas/SVG）
- 右侧：选中节点详情 + 快捷操作

**交互**:
- 拖拽缩放图谱
- 点击节点查看详情
- 双击节点跳转笔记

### 7.2 概念画布页面

**路径**: `/concept-canvas`

**布局**:
- 顶部：工具栏（保存、分享、导出）
- 左侧：可拖拽元素库（笔记、知识点、题目）
- 中间：画布区域
- 右侧：属性面板

**交互**:
- 拖入元素到画布
- 拖拽调整位置
- 创建连线
- 双击编辑元素内容

### 7.3 AI Agent 课程页面

**路径**: `/courses/ai-agent`

**布局**:
- 左侧：课程目录导航
- 中间：课程内容区（Markdown 渲染）
- 右侧：ReAct 沙盒/测验面板

**交互**:
- 阅读教程
- 在沙盒中体验 ReAct
- 完成测验

### 7.4 教师知识热力图

**位置**: 教师工作台新增「知识图谱」Tab

**布局**:
- 顶部：筛选器（学科、时间范围）
- 中间：热力图展示
- 底部：选中节点的学生明细

**交互**:
- 点击节点查看详情
- 一键分配补救练习

---

## 八、实施计划

### 8.1 里程碑计划

| 阶段 | 时间 | 功能 | 交付物 |
|------|------|------|--------|
| P0 | 第1-2周 | 知识网络图谱 | 数据库表、API、前端视图 |
| P0 | 第2-3周 | 多 Agent 协作学习 | API、前端集成 |
| P0 | 第3-4周 | 知识掌握热力图 | 教师端视图、API |
| P1 | 第5-6周 | 概念画布 | 数据库表、API、前端视图 |
| P1 | 第6-7周 | ReAct 可视化 | API、前端集成 |
| P1 | 第7-8周 | AI Agent 课程 | 课程内容、前端页面 |
| P2 | 第9周 | 每日学习日记 | 数据库表、API、前端集成 |
| P2 | 第10周 | 自定义工具注册 | 数据库表、API、前端页面 |

### 8.2 资源需求

| 角色 | 人数 | 职责 |
|------|------|------|
| 后端开发 | 1 | API 开发、数据库设计 |
| 前端开发 | 1 | 页面开发、交互实现 |
| UI/UX | 0.5 | 界面设计 |
| 内容编辑 | 0.5 | AI Agent 课程内容 |

---

## 附录

### 参考文档

1. Hello-Agents GitHub: https://github.com/datawhalechina/hello-agents
2. AgentScope GitHub: https://github.com/agentscope-ai/agentscope
3. Obsidian 官网: https://obsidian.md/
4. 现有文档: [agent-tools-and-obsidian-guide.md](file:///d:/Desktop/new/edusmart-rebuild/docs/agent-tools-and-obsidian-guide.md)

### 相关代码文件

| 文件 | 路径 | 用途 |
|------|------|------|
| 主应用 | `js/edusmart-app.js` | 添加新视图 |
| 教师工作台 | `js/edusmart-app.js` (teacherWorkbenchView) | 新增知识图谱 Tab |
| AI 助手 | `js/edusmart-app.js` (aiAssistantView) | 添加 ReAct 可视化 |
| 笔记系统 | `js/edusmart-app.js` (smartNotesView) | 添加链接解析 |
| 知识 API | `api/knowledge.js` | 新增图谱/日记/画布接口 |
| Agent API | `api/agent.js` | 新增协作/工具接口 |
| 教师 API | `api/teacher.js` | 新增知识热力图接口 |
| 样式 | `css/edusmart-pro.css` | 新增图谱/画布样式 |