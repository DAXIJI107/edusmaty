# EduSmart 严格按计划书开发实施方案

## 1. 开发原则

本项目后续开发必须围绕一个核心判断：学生长期画像是平台的中枢，其他功能都应服务于画像的建立、使用和修正。

开发时不推翻现有功能，不删除已有接口，不破坏当前页面。先做数据和接口修复，再做闭环增强，最后做首页体验重构。

基本原则：

1. 先保存当前版本，再分阶段修改。
2. 先统一数据结构，再优化功能体验。
3. 先保证已有接口稳定，再开发新功能。
4. 先让画像能真实影响路径和计划，再做更复杂的 AI 陪伴。
5. 所有智能推荐必须能解释来源：来自画像、答题、路径、AI 对话、笔记或教师干预。

## 2. 已完成的安全措施

当前项目已初始化本地 git，并完成基线提交：

```text
de852d1 chore: save current project baseline
```

这个提交是修改前的安全回退点。后续每个阶段都会单独提交，避免一次性大改导致无法定位问题。

## 3. 开源项目学习与融合方向

### 3.1 DeepTutor

可学习点：

- Agent-native 学习助手。
- RAG、知识库、聊天、测验、笔记和学习空间统一。
- 多层记忆机制。
- 主动提醒和长期陪伴。

融合方式：

- 不直接复制 DeepTutor 的架构，而是在 EduSmart 中建立“画像记忆层 + 学习事件层 + AI 陪伴层”。
- AI 问答不再是孤立聊天，而是读取学生画像、当前路径、最近错题、笔记和 RAG 证据。
- 增加“陪伴状态”：今日未学习、复习到期、连续答错、计划延期。

### 3.2 OATutor

可学习点：

- 开源自适应辅导系统。
- 使用 Bayesian Knowledge Tracing 估计技能掌握度。
- 适合做技能级、知识点级掌握度追踪。

融合方式：

- 保留当前 `BKTModel`、`KnowledgeTracingEngine`，但统一输入事件。
- 每次答题、复习、费曼输出都转为 knowledge tracing signal。
- 输出不只给报告，也回写学生画像和学习路径优先级。

### 3.3 pyBKT

可学习点：

- BKT 模型参数化、可解释、适合教育场景。
- 可以对每个知识点维护掌握概率。

融合方式：

- 当前阶段不用引入 Python 服务，先用已有 JS BKT 能力。
- 后续如果需要更严谨的参数训练，可新增离线训练脚本，将结果写入 `knowledge_mastery_snapshots`。

### 3.4 Moodle / Canvas / Open edX

可学习点：

- 课程、班级、教师、作业、测评、学习记录是成熟 LMS 的基础结构。
- 教师端和学生端权限边界清晰。
- 课程内容和学习活动需要稳定的资源模型。

融合方式：

- 不把 EduSmart 改成传统 LMS，而是保留智能学习平台定位。
- 学习它们的资源、课程、作业、提交、评分、教师干预结构。
- 教师路径、学生任务、练习测评要有统一状态机。

### 3.5 Anki / FSRS

可学习点：

- 间隔复习的核心是长期记忆状态，而不是简单的“明天复习”。
- FSRS 用难度、稳定性、可回忆率等变量进行复习调度。

融合方式：

- 第一阶段先实现轻量复习调度：again/good/easy 映射 1/3/7 天。
- 第二阶段为每张卡维护 `difficulty`、`stability`、`retrievability`。
- 复习质量回写画像，影响长期掌握度。

## 4. 现有功能如何修改

### 4.1 画像诊断功能

现状：

- `student_profiles` 已存在。
- `/api/diagnostic/quick`、`/api/diagnostic/submit` 能写画像。
- `/api/app/diagnosis/submit` 写的是 `cognitive_profiles` 和 `learning_preferences`，没有同步主画像。

修改方式：

1. 新建统一画像服务 `StudentProfileService`。
2. 所有画像写入都走同一个服务。
3. 将 `student_profiles` 定义为长期画像主表。
4. `cognitive_profiles` 作为认知诊断快照。
5. `learning_preferences` 作为偏好证据表。
6. 增加 `student_profile_events` 表，记录画像变化来源。

预期效果：

- 问卷、自然语言、AI 对话、答题、复习都会修正同一份长期画像。
- 前端能展示画像变化历史。

### 4.2 个性化学习路径

现状：

- `/api/ai/learning-path` 能返回路径。
- `AIPathGenerator` 声称画像驱动，但读取字段和诊断画像字段不匹配。
- 视觉型学生仍可能得到默认读写型资源。

修改方式：

1. 修复 `AIPathGenerator.getStyleWeights()`，读取：
    - `profile.cognitiveStyle.type`
    - `profile.multimodalPreferences`
    - `profile.learningStyle`
2. 修复时间字段读取：
    - `learningPatterns.注意力持续时间`
    - `analysis.summary.dailyStudyMinutes`
    - `dailyTimeMinutes`
3. 返回 `profileContext` 到接口响应。
4. 每个路径节点加入 `personalizedReason`。
5. 将路径生成结果保存到 `study_plans` 或新的 `learning_paths` 快照表。

预期效果：

- 视觉型学生优先图解/视频。
- 实践型学生优先实验/项目。
- 时间少的学生任务更短。
- 专注时长短的学生任务自动拆分。

### 4.3 学习计划

现状：

- 已有 `study_tasks`、`study_plans`。
- 有计划生成接口，但与画像和路径耦合不够。

修改方式：

1. 学习计划必须从路径节点生成。
2. 每个任务绑定 `path_id`、`path_step_id`、`knowledge_id`。
3. 根据画像拆分任务时间。
4. 任务完成、延期、跳过都写入学习事件。
5. 计划失败时触发路径重规划建议。

预期效果：

- 首页显示真正个性化的今日计划。
- 计划执行情况反向修正执行力、学习习惯和风险状态。

### 4.4 AI 问答与陪伴

现状：

- 已有导师消息接口。
- 已有 RAG 问答。
- 已有本地 LLM。
- 对话与画像修正没有完全打通。

修改方式：

1. AI 回复前加载：
    - 学生画像
    - 当前路径
    - 今日计划
    - 最近错题
    - 最近笔记
    - RAG 证据
2. AI 回复后生成 `profileUpdateCandidate`。
3. 高频问题自动进入薄弱点候选。
4. 情绪词、拖延词、焦虑词进入陪伴状态。
5. 增加“下一步动作”，直接指向计划、练习或复习。

预期效果：

- AI 不再只是回答问题，而是持续陪伴学习。
- 学生问得越多，系统越了解学生。

### 4.5 练习、测评与错题

现状：

- 题库存在，但字段和部分接口不一致。
- 诊断、知识追踪、误区检测已有基础。

修改方式：

1. 修复 `questions` 字段兼容。
2. 建立题目到知识点的统一映射。
3. 答题结果写入统一学习事件。
4. 错因分类写入画像证据。
5. 错题自动生成复习卡。

预期效果：

- 测评直接影响掌握度、路径优先级和计划安排。

### 4.6 笔记、复习与长期记忆

现状：

- 已有 notes、note_cards、feynman_reviews。
- 复习调度较简单。

修改方式：

1. 每张卡绑定知识点和路径节点。
2. 增加复习调度字段。
3. 复习结果写入学习事件。
4. 费曼输出评分影响理解和表达维度。
5. 首页显示今日到期复习。

预期效果：

- 学习完成后不会结束，而是进入长期维护。

### 4.7 教师端

现状：

- 教师概览、学生列表、教师路径、教师知识图谱可用。

修改方式：

1. 教师端增加学生画像摘要。
2. 增加风险学生列表。
3. 教师路径分配写入学习事件。
4. 教师反馈写入画像证据。
5. 支持教师路径与 AI 路径合并或覆盖。

预期效果：

- 教师能看到学生为什么需要干预，而不只是看到分数。

### 4.8 首页

现状：

- 当前首页功能较多，但闭环表达不够强。

修改方式：

首页重构为学习驾驶舱：

1. 画像状态卡。
2. 今日学习计划。
3. 当前学习路径。
4. AI 陪伴入口。
5. 今日复习维护。
6. 本周学习趋势。

预期效果：

- 学生打开首页即可知道今天该做什么、为什么做、怎么做、完成后系统如何更新画像。

## 5. 优先级与开发顺序

### 阶段 1：基础修复与数据统一

目标：

- 修复当前 500 接口。
- 统一 schema。
- 建立画像服务。

任务：

1. 修复 `knowledge_nodes` 字段查询。
2. 修复 `questions` 字段查询。
3. 修复 `learning-list`。
4. 修复 `today-card`。
5. 新增 `StudentProfileService`。
6. 新增 `student_profile_events`。

验收：

- `GET /api/knowledge` 成功。
- `GET /api/ai/today-card` 成功。
- `GET /api/ai/learning-list` 成功。
- 画像诊断能写主画像和事件日志。

### 阶段 2：画像驱动路径和计划

目标：

- 让画像真实影响路径和计划。

任务：

1. 修复路径画像字段读取。
2. 增加 `profileContext`。
3. 增加节点推荐解释。
4. 学习计划从路径生成。
5. 学习计划状态回写画像。

验收：

- 视觉型、实践型、读写型学生得到不同资源组合。
- 不同每日时间配置得到不同任务节奏。

### 阶段 3：AI 陪伴闭环

目标：

- AI 问答能读画像，也能反向修正画像。

任务：

1. AI 上下文聚合。
2. 对话后画像更新候选。
3. 高频卡点识别。
4. 陪伴提醒。

验收：

- AI 回答中能引用当前路径和学生薄弱点。
- 多次询问同一知识点后，画像事件中出现薄弱点更新记录。

### 阶段 4：长期记忆与复习

目标：

- 建立复习调度和长期记忆维护。

任务：

1. 卡片复习状态。
2. 轻量 SRS 调度。
3. 费曼输出回写掌握度。
4. 首页复习区。

验收：

- 到期复习能出现在首页。
- 复习结果能改变长期记忆状态。

### 阶段 5：首页重构与教师增强

目标：

- 把闭环体验呈现在首页。
- 教师端能看画像和干预原因。

任务：

1. 首页学习驾驶舱。
2. 教师画像摘要。
3. 风险学生列表。
4. 教师反馈回写。

验收：

- 学生端闭环清晰。
- 教师端能根据画像和证据干预。

## 6. 技术实现结构

建议新增或改造的核心文件：

```text
src/core/StudentProfileService.js
src/core/LearningEventService.js
src/core/ProfileUpdateEngine.js
src/core/PersonalizationContext.js
src/core/SpacedReviewScheduler.js
src/modules/profile.js
src/modules/learning-dashboard.js
ops/database/migrations/002_profile_events_and_review_state.js
scripts/test-learning-closed-loop.js
```

核心服务职责：

- `StudentProfileService`：读取、合并、保存长期画像。
- `LearningEventService`：统一记录学习行为。
- `ProfileUpdateEngine`：根据事件生成画像更新。
- `PersonalizationContext`：为路径、计划、AI 问答提供统一上下文。
- `SpacedReviewScheduler`：负责复习调度。

## 7. 数据表建议

新增：

```text
student_profile_events
learning_path_snapshots
learning_event_logs
review_schedules
profile_update_candidates
```

关键设计：

- `student_profile_events` 记录画像变化证据。
- `learning_event_logs` 记录所有行为。
- `learning_path_snapshots` 保留历史路径，支持回滚和对比。
- `review_schedules` 管理长期复习。
- `profile_update_candidates` 允许 AI 建议画像更新，后续可以人工或规则确认。

## 8. 风险控制

1. 不一次性重构全部前端。
2. 不删除旧接口。
3. 不直接复制开源项目代码。
4. 先做兼容层，再逐步替换旧逻辑。
5. 每阶段都写接口测试。
6. 每阶段单独 git commit。

## 9. 我的实际开发方式

如果由我继续开发，我会按下面顺序动手：

1. 确认当前 git 干净。
2. 新建第一阶段分支或直接在本地 master 上小步提交。
3. 先修复 schema 漂移导致的 500。
4. 建立画像服务，接管已有画像写入。
5. 修复路径生成器，让画像真实影响路径。
6. 写一个闭环测试脚本：
    - 登录
    - 画像诊断
    - 读取画像
    - 生成路径
    - 生成今日计划
    - AI 问答
    - 提交练习
    - 复习卡生成
    - 检查画像事件
7. 再做首页体验。

这样做的好处是：先让系统真实闭环，再让界面好看；先让数据可信，再让 AI 聪明。

## 10. 第一阶段建议立即开始的任务清单

1. 修复 `GET /api/knowledge`。
2. 修复 `GET /api/ai/today-card`。
3. 修复 `GET /api/ai/learning-list`。
4. 新增 `StudentProfileService`。
5. 新增画像事件表。
6. 修改 `/api/diagnostic/quick` 和 `/api/app/diagnosis/submit`，统一写长期画像。
7. 修改 `AIPathGenerator` 的画像读取逻辑。
8. 给 `/api/ai/learning-path` 返回 `profileContext` 和推荐解释。

完成这 8 项后，项目就从“有很多 AI 功能”变成“真正围绕学生画像运行的智能学习闭环”。
