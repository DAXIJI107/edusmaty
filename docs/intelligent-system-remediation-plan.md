# EduSmart 智能系统整改开发方案

## 1. 背景与目标

当前项目已经具备 AI 助手、学习路径、智能诊断、智能笔记、知识图谱、团队项目、Agent 研究中心等功能入口，但整体体验仍然更像“AI 功能集合”和“页面跳转导航”，还没有形成真正的智能学习系统。

本次整改目标不是继续增加页面，而是让 EduSmart 具备真实的智能体闭环：

```text
学生目标 / 行为数据
  -> 学习画像与掌握度分析
  -> 智能体推理与课程设计
  -> 调用工具生成路径、练习、笔记、项目任务
  -> 写回系统并追踪结果
  -> 根据学习结果动态调整下一步
```

最终效果：

- 学生输入“我要准备操作系统期末复习”，系统能自动分析当前掌握度，设计课程路径，安排练习、笔记和复习。
- 学生做题或学习后，系统能更新掌握度并调整路径。
- AI 助手不只是回答问题，而是能调用平台工具完成学习任务。
- Agent 研究中心不只是 GitHub 链接，而是把开源资料转为项目中的课程包、实训模板、智能体工具和项目任务。
- 前端不再大量硬编码学习路径、默认目标、Agent 内容和模板，而由后端配置、数据库和 Agent Runtime 驱动。

## 2. 当前主要问题

### 2.1 智能体没有成为系统中枢

项目中已有多个 Agent 类：

- `core/OrchestratorAgent.js`
- `core/ProfileAgent.js`
- `core/ResourceAgent.js`
- `core/LearningAgent.js`
- `core/SupervisorAgent.js`
- `core/SocraticTutor.js`
- `core/DynamicLearningPath.js`

但这些能力分散在不同 API 和页面逻辑里，没有统一运行时负责“感知、推理、工具调用、写回、复盘”。因此 AI 功能更多是局部规则或接口拼接，缺少一个能持续推进学习的智能体大脑。

### 2.2 前端硬编码过多

`js/edusmart-app.js` 中存在大量产品逻辑和默认配置，例如：

- 默认用户、默认学科、默认路径目标。
- 导航结构。
- AI 助手模式。
- Agent 研究中心内容。
- GitHub 开源项目映射。
- 编程模板。
- 团队项目角色和示例项目。
- 学习路线和功能卡片。

这会导致页面看起来智能，但关键决策其实写死在前端，后续无法根据学校、课程、学生画像或教师配置动态变化。

### 2.3 学习路径还不是真正动态生成

目前已有：

- `core/DynamicLearningPath.js`
- `core/AIPathGenerator.js`
- `core/StudyPlanEngine.js`
- `core/MasteryCalculator.js`

但路径生成还没有稳定地基于以下数据综合决策：

- 学生目标。
- 当前掌握度。
- 先修知识关系。
- 错题记录。
- 学习行为事件。
- 课程资源。
- 笔记质量。
- 近期任务完成情况。

路径更像“推荐列表”，还不是“智能课程设计”。

### 2.4 缺少统一知识模型

课程、题目、错题、笔记、知识图谱、项目任务之间需要共享统一的知识点 ID。否则系统无法判断：

- 这道题训练的是哪个知识点。
- 这节课补的是哪个能力。
- 这条笔记能否帮助某个薄弱点。
- 这个项目任务验证了哪些技能。

缺少统一知识模型会直接削弱路径生成、掌握度计算和 RAG 问答质量。

### 2.5 缺少事件流和决策记忆

系统需要记录学习行为事件，例如：

- 看课。
- 答题。
- 错题。
- 保存笔记。
- 向 AI 提问。
- 运行代码。
- 完成项目任务。
- 教师干预。

同时需要记录 Agent 决策过程：

```text
观察到了什么
为什么这么判断
调用了什么工具
生成了什么任务
执行结果如何
下一步如何调整
```

没有事件流和决策记忆，Agent 每次都像一次性聊天，无法形成持续辅导。

### 2.6 GitHub 开源内容没有转化为项目能力

目前 Agent 研究中心中的开源内容更多是说明和入口。正确方式应是把开源资料转化为：

- 课程包。
- 实训模板。
- Agent 工具。
- 项目任务。
- 评估标准。
- 可运行示例。

否则 GitHub 内容仍然只是外链，无法体现到 EduSmart 的智能系统中。

## 3. 整改总体架构

建议新增一层“智能体运行层”，让原有功能变成可调用工具。

```text
Frontend UI
  AI学习助手 / 学习路径 / Agent研究中心 / 智能笔记 / 团队项目

API Layer
  /api/agent-runtime/*
  /api/config/*
  /api/course-design/*
  /api/learning-events/*

Agent Runtime
  感知上下文
  规划步骤
  选择工具
  执行工具
  记录 trace
  写回学习系统

Agent Tools
  ProfileTool
  PathTool
  CourseDesignTool
  PracticeTool
  NoteTool
  ResourceTool
  ProjectTool
  TeacherInterventionTool

Learning Data Layer
  learning_events
  agent_traces
  knowledge_nodes
  course_units
  questions
  notes
  mastery_records
  learning_paths
  project_tasks
```

## 4. 数据库整改

### 4.1 新增学习事件表

用于记录所有学习行为，作为 Agent 感知基础。

```sql
CREATE TABLE learning_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    subject VARCHAR(100),
    knowledge_node_id BIGINT,
    target_type VARCHAR(64),
    target_id BIGINT,
    payload JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

典型 `event_type`：

- `course_viewed`
- `practice_answered`
- `question_wrong`
- `note_created`
- `ai_question_asked`
- `path_node_completed`
- `code_run`
- `project_task_submitted`
- `teacher_intervention`

### 4.2 新增 Agent 执行轨迹表

用于展示智能体思考和工具调用过程。

```sql
CREATE TABLE agent_traces (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(80) NOT NULL,
    agent_name VARCHAR(80) NOT NULL,
    step_type VARCHAR(40) NOT NULL,
    title VARCHAR(200),
    content TEXT,
    tool_name VARCHAR(100),
    tool_input JSON,
    tool_output JSON,
    confidence DECIMAL(5, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

典型 `step_type`：

- `observe`
- `reason`
- `plan`
- `tool_call`
- `tool_result`
- `write_back`
- `reflection`

### 4.3 新增 Agent 工具配置表

```sql
CREATE TABLE agent_tools (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tool_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    input_schema JSON,
    output_schema JSON,
    enabled TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 新增开源资源映射表

```sql
CREATE TABLE open_source_integrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    repo_url VARCHAR(500),
    category VARCHAR(80),
    license_name VARCHAR(80),
    summary TEXT,
    integration_mode VARCHAR(80),
    mapped_modules JSON,
    implementation_status VARCHAR(40) DEFAULT 'planned',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

`integration_mode` 示例：

- `course_package`
- `code_template`
- `agent_tool`
- `rag_knowledge_base`
- `project_template`
- `assessment_model`

### 4.5 新增课程设计表

```sql
CREATE TABLE ai_course_designs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    goal VARCHAR(300) NOT NULL,
    subject VARCHAR(100),
    duration_days INT,
    design_json JSON,
    status VARCHAR(40) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

`design_json` 应包含：

- 课程目标。
- 先修知识。
- 阶段安排。
- 课程材料。
- 练习任务。
- 笔记任务。
- 项目任务。
- 测评标准。
- Agent 决策理由。

## 5. 后端整改

### 5.1 新增 Agent Runtime

新增文件：

```text
core/AgentRuntime.js
```

职责：

- 接收用户目标、页面上下文和当前学习状态。
- 读取学习事件、画像、掌握度、错题、课程、笔记。
- 调用 LLM 或本地规则生成计划。
- 选择并执行工具。
- 写入 `agent_traces`。
- 返回下一步行动和可解释过程。

建议核心接口：

```js
class AgentRuntime {
    async run({ userId, intent, message, context }) {}
    async designCourse({ userId, goal, subject, durationDays }) {}
    async analyzePath({ userId, pathId }) {}
    async nextAction({ userId }) {}
    async recordTrace(trace) {}
}

module.exports = AgentRuntime;
```

### 5.2 新增 Agent 工具层

新增目录：

```text
core/agent-tools/
```

建议第一批工具：

```text
ProfileTool.js
PathTool.js
CourseDesignTool.js
PracticeTool.js
NoteTool.js
ResourceTool.js
ProjectTool.js
TeacherInterventionTool.js
```

各工具职责：

- `ProfileTool`：读取学习画像、掌握度、薄弱点、学习偏好。
- `PathTool`：生成、更新、重排学习路径。
- `CourseDesignTool`：按目标生成课程单元、阶段任务和测评标准。
- `PracticeTool`：根据知识点生成练习、错题变式和小测。
- `NoteTool`：生成结构化笔记、复习卡、知识图谱链接。
- `ResourceTool`：匹配课程、视频、文档、开源资料。
- `ProjectTool`：生成项目任务、角色分工、代码模板、验收标准。
- `TeacherInterventionTool`：生成教师干预建议、班级风险预警。

### 5.3 新增 API

新增文件：

```text
api/agent-runtime.js
api/config.js
api/course-design.js
api/learning-events.js
```

建议接口：

```text
POST /api/agent-runtime/run
POST /api/agent-runtime/design-course
POST /api/agent-runtime/analyze-path
GET  /api/agent-runtime/next-action
GET  /api/agent-runtime/traces/:sessionId

GET  /api/config/navigation
GET  /api/config/ai-assistant-modes
GET  /api/config/code-templates
GET  /api/config/team-role-templates

POST /api/learning-events
GET  /api/learning-events/recent
GET  /api/learning-events/summary

POST /api/course-design/generate
POST /api/course-design/:id/apply-to-path
GET  /api/course-design/:id
```

### 5.4 改造现有路径 API

重点改：

- `api/app.js` 中 `/path/generate`
- `core/DynamicLearningPath.js`
- `core/StudyPlanEngine.js`
- `core/MasteryCalculator.js`

生成路径时必须包含：

```json
{
    "title": "掌握哈希表冲突处理",
    "reason": "你在哈希表开放寻址题上错误率较高",
    "prerequisites": ["数组", "时间复杂度"],
    "resources": [],
    "practice": [],
    "noteTask": "整理开放寻址与链地址法对比",
    "projectTask": "实现一个简单 HashMap",
    "estimatedMinutes": 45,
    "agentDecision": {
        "confidence": 0.84,
        "evidence": ["错题 3 道", "掌握度 58%", "最近未复习"]
    }
}
```

## 6. 前端整改

### 6.1 `js/edusmart-app.js` 减负

需要从前端移除或后端化：

- `navGroups()` 中的固定导航配置。
- AI 助手模式数组。
- Agent 研究中心的路线、开源项目、功能卡片。
- 编程模板。
- 团队角色模板。
- 默认学习目标和默认学科。
- 示例项目和示例代码。

前端保留：

- 状态管理。
- 页面渲染。
- 用户交互。
- 调用 API。

后端负责：

- 返回可配置内容。
- 生成路径和课程设计。
- 返回 Agent trace。
- 提供模板和开源资源映射。

### 6.2 AI 学习助手页面改造

当前页面需要从“聊天页”升级为“智能任务工作台”。

新增区域：

- 当前学习状态摘要。
- Agent 执行步骤时间线。
- 工具调用结果。
- 下一步行动卡片。
- 可一键应用的课程计划、练习、笔记和复习任务。

用户输入示例：

```text
我 7 天后要考操作系统，帮我制定复习课。
```

预期流程：

```text
观察：读取操作系统掌握度、错题、笔记和课程进度
推理：发现进程同步、内存管理、文件系统薄弱
工具：生成 7 天课程设计
工具：匹配课程资源和练习题
工具：创建学习路径
写回：保存路径和每日任务
输出：展示课程安排和调整理由
```

### 6.3 Agent 研究中心改造

Agent 研究中心要从“资料展示页”变成“开源能力落地中心”。

每个开源项目卡片必须包含：

- 来源项目。
- 可借鉴能力。
- 对应 EduSmart 模块。
- 已落地内容。
- 待开发内容。
- 一键生成课程包 / 实训模板 / 项目任务。

例如：

```text
OpenMAIC
  借鉴能力：多智能体互动课堂
  落地模块：AI课程设计、AI学习助手、课堂讨论模拟
  操作：生成一个多智能体课堂
```

## 7. GitHub 开源资料接入计划

### 7.1 第一优先级

#### OATutor

地址：[https://github.com/CAHLR/OATutor-LLM-Learner](https://github.com/CAHLR/OATutor-LLM-Learner)

接入方式：

- 借鉴 BKT 掌握度模型。
- 建立技能模型 `skillModel`。
- 改造自适应选题逻辑。
- 记录学习日志。

落地模块：

- 智能诊断。
- 学习路径。
- 专项练习。
- 掌握度仪表盘。

#### OpenMAIC

地址：[https://openmaic.chat/](https://openmaic.chat/)

接入方式：

- 借鉴多智能体课堂模式。
- 输入主题或文档，生成 AI 教师、助教、同学、测验和讨论。
- 加入课程设计工具。

落地模块：

- AI 学习助手。
- AI 课程设计。
- Agent 研究中心。

#### NexusRAG

地址：[https://github.com/LeDat98/NexusRAG](https://github.com/LeDat98/NexusRAG)

接入方式：

- 借鉴混合检索、知识图谱 RAG、引用溯源、Agent 步骤时间线。
- 课程资料、笔记、错题、项目文档进入知识库。

落地模块：

- 智能笔记。
- 知识图谱。
- AI 助手问答。
- 课程资料问答。

#### Langchain-Chatchat

地址：[https://github.com/chatchat-space/Langchain-Chatchat](https://github.com/chatchat-space/Langchain-Chatchat)

接入方式：

- 借鉴中文本地知识库问答。
- 支持学校私有资料、课程文档、教材 PDF 的离线问答。

落地模块：

- RAG 知识库。
- 智能笔记。
- 课程问答。

### 7.2 第二优先级

#### LAMB

地址：[https://lamb-project.org/en/](https://lamb-project.org/en/)

接入方式：

- 借鉴教师创建课程助手的方式。
- 教师上传资料，生成学科专属 AI 助手。

落地模块：

- 教师工作台。
- 课程助手配置。
- 班级 AI 助教。

#### AITutorAgent

地址：[https://github.com/Ebimsv/AITutorAgent](https://github.com/Ebimsv/AITutorAgent)

接入方式：

- 借鉴 LangGraph 教学流程。
- 讲解、提问、评估、补救形成状态机。

落地模块：

- AI 学习助手。
- 苏格拉底问答。
- 知识评估。

#### Dify

地址：[https://github.com/langgenius/dify](https://github.com/langgenius/dify)

接入方式：

- 借鉴可视化工作流、Agent 编排、RAG Pipeline 和执行观测。
- 后期可做简化版 Agent 工作流配置。

落地模块：

- Agent Runtime 管理。
- 教师工作台。
- 后台配置中心。

#### AutoGen

地址：[https://github.com/microsoft/autogen](https://github.com/microsoft/autogen)

接入方式：

- 借鉴多智能体协作和角色对话。
- 教师 Agent、诊断 Agent、资源 Agent、练习 Agent、监督 Agent 协同。

落地模块：

- 多 Agent 协作。
- 团队项目。
- 课堂讨论模拟。

### 7.3 课程内容型资料

#### Datawhale Hello-Agents

地址：[https://github.com/datawhalechina/hello-agents](https://github.com/datawhalechina/hello-agents)

接入方式：

- 转成 AI Agent 学习路径。
- 每章生成课程、练习、笔记和实训。

#### Microsoft AI Agents for Beginners

地址：[https://github.com/microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners)

接入方式：

- 转成双语 Agent 课程。
- 作为进阶实训内容。

#### Hugging Face Agents Course

地址：[https://github.com/huggingface/agents-course](https://github.com/huggingface/agents-course)

接入方式：

- 拆成实验任务。
- 接入 AI 编程舱和项目任务。

## 8. 分阶段实施计划

### 阶段 1：去硬编码与配置后端化

周期：1 到 2 周。

任务：

- 新增 `api/config.js`。
- 新增配置数据表或 JSON 配置源。
- 将导航、AI 模式、Agent 研究中心、代码模板、团队角色模板移出前端。
- 前端通过 API 拉取配置。
- 保持现有页面不大改。

验收标准：

- `js/edusmart-app.js` 不再直接维护大段 Agent 研究内容。
- 默认目标、默认学科、模板内容可以从后端配置修改。
- 修改配置后无需改前端代码。

### 阶段 2：学习事件流与 Agent Trace

周期：1 到 2 周。

任务：

- 新增 `learning_events` 表。
- 新增 `agent_traces` 表。
- 新增 `api/learning-events.js`。
- 在看课、答题、保存笔记、AI 提问、路径节点完成处写入事件。
- AI 助手页面展示 Agent trace。

验收标准：

- 任意一次 AI 任务能看到完整步骤。
- 系统能基于最近学习事件生成下一步建议。

### 阶段 3：Agent Runtime MVP

周期：2 周。

任务：

- 新增 `core/AgentRuntime.js`。
- 新增第一批工具：`ProfileTool`、`PathTool`、`PracticeTool`、`NoteTool`、`ResourceTool`。
- 新增 `api/agent-runtime.js`。
- AI 学习助手接入 `/api/agent-runtime/run`。

验收标准：

- 用户输入学习目标后，Agent 能生成计划并调用至少 2 个工具。
- Agent 过程可被记录和展示。
- 至少能写回学习路径或学习任务。

### 阶段 4：AI 课程设计器

周期：2 到 3 周。

任务：

- 新增 `CourseDesignTool`。
- 新增 `api/course-design.js`。
- 输入目标、周期、学科后生成课程设计。
- 支持一键应用为学习路径。
- 课程设计包含讲解、练习、笔记、复习和评估。

验收标准：

- 输入“7 天操作系统复习”能生成完整课程计划。
- 计划能落地到路径、练习和笔记任务。
- 每个节点有生成理由和证据。

### 阶段 5：开源资料资产化

周期：2 周。

任务：

- 新增 `open_source_integrations` 表。
- Agent 研究中心读取后端数据。
- 将 Hello-Agents、AI Agents for Beginners、Hugging Face Agents Course 转为课程包。
- 将 OpenMAIC、OATutor、NexusRAG 转为系统能力映射。

验收标准：

- 每个 GitHub 项目都能看到对应项目模块和落地状态。
- 至少 1 个开源课程能生成学习路径。
- 至少 1 个开源项目能生成实训模板。

### 阶段 6：动态路径调整

周期：2 周。

任务：

- 路径节点完成后自动分析结果。
- 做题、看课、保存笔记后更新掌握度。
- 根据事件流重排后续路径。
- 页面展示调整原因。

验收标准：

- 学生答错某知识点后，路径自动插入补救任务。
- 学生连续掌握某部分后，路径能跳过低价值重复任务。
- 每次调整都有解释。

## 9. 关键文件修改清单

### 新增文件

```text
api/agent-runtime.js
api/config.js
api/course-design.js
api/learning-events.js

core/AgentRuntime.js
core/agent-tools/ProfileTool.js
core/agent-tools/PathTool.js
core/agent-tools/CourseDesignTool.js
core/agent-tools/PracticeTool.js
core/agent-tools/NoteTool.js
core/agent-tools/ResourceTool.js
core/agent-tools/ProjectTool.js
core/agent-tools/TeacherInterventionTool.js

sql/intelligent-system-migration.sql
```

### 重点修改文件

```text
server.js
api/app.js
api/agent.js
api/ai-learning.js
api/closed-loop.js
api/student-paths.js
api/team-code.js

core/DynamicLearningPath.js
core/StudyPlanEngine.js
core/MasteryCalculator.js
core/SocraticTutor.js
core/SmartNoteEngine.js

js/edusmart-app.js
css/edusmart-pro.css
```

## 10. UI 体验目标

### AI 学习助手

从聊天窗口升级为智能任务台：

- 左侧：对话与输入。
- 中间：Agent 步骤时间线。
- 右侧：下一步行动、学习证据、可应用任务。

### 学习路径

从静态路径升级为动态路径：

- 每个节点展示推荐理由。
- 每个节点展示关联知识点、资源、练习和笔记。
- 支持“为什么安排这个任务”。
- 支持“根据最新表现重新规划”。

### Agent 研究中心

从资源页升级为开源能力落地中心：

- 开源项目。
- 借鉴能力。
- 项目内模块。
- 落地状态。
- 一键生成课程包 / 实训模板 / 项目任务。

### 教师工作台

加入：

- 班级 Agent 预警。
- 学生路径偏离分析。
- AI 课程助手配置。
- 一键为学生发布个性化任务。

## 11. 验收指标

### 智能系统感指标

- 用户输入目标后，系统能自动生成可执行学习计划。
- Agent 每次执行都有步骤、理由和工具调用记录。
- 学习行为能影响后续路径。
- 开源资料能转化为课程包或实训任务。
- 教师能看到 AI 为什么推荐某个干预。

### 工程指标

- 前端硬编码内容减少 60% 以上。
- 学习路径生成逻辑集中到后端。
- Agent 工具调用有统一接口。
- 所有 Agent 决策可追踪。
- 核心配置可通过数据库或后端配置修改。

## 12. 优先级建议

最高优先级：

1. 去硬编码。
2. 建学习事件流。
3. 建 Agent Runtime。
4. AI 助手接入 Agent Runtime。
5. 学习路径动态生成。

中优先级：

1. 开源资料资产化。
2. 课程设计器。
3. Agent trace 可视化。
4. 教师干预建议。

后续增强：

1. 多智能体课堂。
2. 可视化 Agent 工作流配置。
3. 本地 RAG 和知识图谱增强。
4. 班级级智能调度。

## 13. 结论

EduSmart 当前的基础并不差，问题在于智能能力分散，页面承担了太多配置和决策，后端缺少统一的智能体运行层。整改的关键不是继续堆页面，而是把项目改成数据驱动、工具驱动和闭环驱动。

最小可行路径是：

```text
去硬编码
  -> 学习事件流
  -> Agent Runtime
  -> AI 课程设计
  -> 动态学习路径
  -> 开源资料资产化
```

完成这些后，项目才会从“AI 功能入口集合”升级为真正的“智能学习系统”。
