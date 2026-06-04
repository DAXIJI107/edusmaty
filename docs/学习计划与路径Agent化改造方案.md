# 学习计划与个性化学习路径 Agent 化改造方案

## 一、现状分析

### 1.1 系统架构全景

```
┌─────────────────────────────────────────────────────────────────────┐
│                          前端页面层                                    │
├───────────────┬───────────────┬────────────────┬──────────────────────┤
│ 学习计划页      │ 学习路径页      │ Agent学习中心    │ Obsidian/RAG知识库   │
│ studyPlanView │ pathView       │ agentCenterView│ obsidianView/ragSearchView│
└───────┬───────┴───────┬───────┴────────┬───────┴──────────────────────┘
        │               │                │
        ▼               ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API 层                                       │
├─────────────────────┬──────────────────────┬─────────────────────────┤
│ /api/closed-loop     │ /api/ai               │ /api/agent               │
│ study-plan           │ ai-path               │ profile/initialize       │
│ study-plan/generate  │ today-card            │ profile/process-input    │
│ study-plan/progress  │ learning-list         │ profile/summary          │
└─────────┬───────────┴──────────┬───────────┴───────────┬─────────────┘
          │                      │                       │
          ▼                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      核心引擎层                                        │
├─────────────────┬─────────────────┬────────────────┬─────────────────┤
│ StudyPlanEngine │ DynamicLearning │ AIPathGenerator│ ProfileAgent    │
│ (硬编码模板)      │ Path (规则引擎)  │ (画像+规则+LLM)  │ (画像分析)       │
├─────────────────┼─────────────────┼────────────────┼─────────────────┤
│ AgenticLearning │ Orchestrator    │ DemoDataSeeder │                 │
│ Agent (LLM推理)  │ Agent (调度)     │ (种子数据)       │                 │
└─────────────────┴─────────────────┴────────────────┴─────────────────┘
          │                      │                       │
          ▼                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         数据库层                                       │
├────────────┬────────────┬───────────────┬─────────────┬──────────────┤
│ study_plans│ knowledge_ │ student_      │ questions   │ user_answers │
│ (学习计划)   │ nodes      │ profiles      │ (题目)       │ (答题记录)     │
│            │ (知识点)     │ (画像JSON)     │             │              │
└────────────┴────────────┴───────────────┴─────────────┴──────────────┘
```

### 1.2 各模块详细分析

#### 1.2.1 StudyPlanEngine — 完全硬编码

**文件**: `src/core/StudyPlanEngine.js`

| 方法                         | 生成方式                      | 个性化程度           |
| ---------------------------- | ----------------------------- | -------------------- |
| `buildTasks()`               | 固定7个任务模板               | 仅替换知识点名称     |
| `defaultMaterials()`         | 硬编码4个固定URL              | 零个性化             |
| `defaultPracticeQuestions()` | 硬编码5道固定题目             | 零个性化             |
| `defaultNoteTemplate()`      | 硬编码6个固定段落             | 零个性化             |
| `generateDaily()`            | `collectSignals()` + 模板填充 | 仅薄弱知识点名称不同 |

**核心问题**:

- 第355-363行: `buildTasks()` 始终以第一个 `weakNodes` 节点为主题
- 所有用户的每日计划结构完全相同（预习→课程→学习→练习→基础练习→错题→笔记→间隔复习）
- 不读取 `student_profiles` 中的画像数据（学习风格、每日可用时间、专注时长）
- 不根据用户水平调整任务密度和难度
- 学习材料URL完全固定，不根据学习风格推荐

#### 1.2.2 DynamicLearningPath — 规则引擎

**文件**: `src/core/DynamicLearningPath.js`

| 方法                | 机制                       | 评估                      |
| ------------------- | -------------------------- | ------------------------- |
| `generatePath()`    | 掌握度 → 优先级 → 拓扑排序 | 基于规则的排序，无LLM推理 |
| `assessUserLevel()` | `AVG(mastery)` 分4级       | 简单阈值分档              |
| `planPath()`        | mastery×0.6 + chapter×0.4  | 固定公式                  |
| `adjustPath()`      | errorRate/accuracy/fatigue | 基于性能指标的规则调整    |

**评估**:

- 是系统中最接近"个性化"的模块，但仍是固定公式
- 不受 Agent 画像影响
- 生成结果不持久化到数据库

#### 1.2.3 AIPathGenerator — 画像驱动规则 + 可选LLM增强

**文件**: `src/core/AIPathGenerator.js`

| 方法                  | 机制                                | LLM依赖 |
| --------------------- | ----------------------------------- | ------- |
| `generate()`          | 画像+掌握度+拓扑排序                | 不依赖  |
| `generateWithLLM()`   | 规则引擎 + LLM调整排序              | 需要LLM |
| `generateWithAgent()` | 规则引擎 + AgenticLearningAgent推荐 | 需要LLM |
| `buildResources()`    | VARK学习风格权重                    | 不依赖  |

**优势**:

- 已集成 VARK 学习风格权重（visual/auditory/reading/kinesthetic）
- 已读取 `student_profiles.profile_json` 画像数据
- 已根据专注时长分段会话（`needsBreak`/`sessionIndex`）
- 已有 LLM 和 Agent 增强接口

**不足**:

- 仅在 `/api/ai/ai-path` 端点使用，**不与学习计划页面互通**
- `generateWithAgent()` 仅临时返回，**不写入数据库**
- `generateWithLLM()` 依赖 LLM 可用性

#### 1.2.4 Agent Center — 画像分析独立运转

**文件**: `src/modules/agent.js`, `src/core/ProfileAgent.js`, `src/core/OrchestratorAgent.js`

| 端点                          | 功能                            | 写入数据库 |
| ----------------------------- | ------------------------------- | ---------- |
| `POST /profile/initialize`    | 初始化画像 → `student_profiles` | 仅画像JSON |
| `POST /profile/process-input` | 处理用户输入 → 返回画像         | 仅画像JSON |
| `GET /profile/summary`        | 返回画像摘要                    | 不写入     |

**核心问题**:

- Agent 生成的学习画像和推荐**从不写入 `study_plans` 表**
- Agent 推荐的前置知识点**不影响 `study_plans` 的任务排序**
- `ProfileAgent.processDialogueInput()` 分析用户输入后仅返回 profile JSON，不做任何计划层面操作

#### 1.2.5 AgenticLearningAgent — LLM推理但不落盘

**文件**: `src/core/AgenticLearningAgent.js`

| 方法                     | 功能           | 持久化                 |
| ------------------------ | -------------- | ---------------------- |
| `init()`                 | 加载知识状态   | 不写入                 |
| `reasonNextStep()`       | LLM推理下一步  | 仅内存                 |
| `generateLearningPlan()` | LLM生成7天计划 | **仅返回JSON，不写入** |
| `adjustPath()`           | 根据反馈调整   | **不写入**             |

**关键发现**:

- `generateLearningPlan()` (第293行) 用 LLM 生成了完整的7天学习计划（每日主题、任务类型、时长、方法）
- 但这个计划的输出仅作为 `agentPlan` 状态显示在 Agent 中心页面
- **从未调用 `StudyPlanEngine.generateDaily()` 写入 `study_plans` 表**
- **从未调用任何接口更新学习路径**

### 1.3 数据流断裂分析

```
                         ┌── 孤岛 ──┐
    Agent Center         │          │        学习计划页面
    /api/agent/profile   │          │    /api/closed-loop/study-plan
          │              │          │              │
          ▼              │          │              ▼
    ProfileAgent         │          │    StudyPlanEngine
     → student_profiles  │          │     → study_plans
     (仅画像JSON)         │   ❌无连接 │     (固定模板)
                         │          │
                         └──────────┘


                         ┌── 孤岛 ──┐
    AIPathGenerator       │          │        StudyPlanEngine
    /api/ai/ai-path       │          │    /api/closed-loop/study-plan
          │               │          │              │
          ▼               │          │              ▼
    AIPathGenerator       │          │    buildTasks()
     → 临时JSON响应        │   ❌无连接 │     → study_plans
     (不持久化)            │          │     (不读取画像)
                          └──────────┘


                         ┌── 孤岛 ──┐
    AgenticLearningAgent  │          │        学习路径
    generateLearningPlan()│          │    /api/ai/learning-path
          │               │          │              │
          ▼               │          │              ▼
     → agentPlan状态       │   ❌无连接 │    DynamicLearningPath
     (仅前端显示)          │          │     → 临时返回
                          └──────────┘
```

**总结**: 系统存在 **3条完全断裂的数据流**:

1. **Agent画像 → 学习计划**: Agent分析了画像但学习计划不读取
2. **AIPathGenerator → study_plans**: 画像驱动路径仅作为API临时返回
3. **AgenticLearningAgent → 学习路径**: LLM生成计划仅在前端显示，不落库

## 二、方案对比：硬编码 vs Agent 动态生成

### 2.1 当前硬编码方案

**优势**:

- 确定性输出，行为可预测
- 无需 LLM，响应快
- 新人用户体验一致

**劣势**:

- 所有用户看到相同的任务结构
- 不感知学习风格（visual/auditory/reading/kinesthetic）
- 不根据学习进度调整任务密度
- 材料固定，不支持个性化推荐
- 每次生成内容相同，无真正"个性化"

### 2.2 Agent 动态生成方案

**优势**:

- 真正基于用户画像（学习风格、掌握度、可用时间、专注时长）生成
- 任务类型、时长、顺序均可个性化
- 可根据答题表现动态调整
- LLM 可推荐更合适的资源和方法
- 与 Agent 推荐的知识点联动

**劣势**:

- 依赖 LLM 可用性
- 响应可能稍慢（1-3秒）
- LLM 输出需要验证和解析

### 2.3 推荐方案：混合策略（画像驱动为主 + Agent 增强为辅）

```
                    ┌──────────────┐
                    │  用户画像      │
                    │ (ProfileAgent) │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    画像驱动规则引擎      │ ← AIPathGenerator.generate()
              │  (VARK学习风格权重)      │   Step 1: 确定性规则
              │  (掌握度+拓扑排序)       │   不依赖LLM，兜底方案
              │  (专注时长分段)          │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Agent增强审查          │ ← AgenticLearningAgent
              │  (LLM调整排序/难度)       │   Step 2: LLM增强
              │  (推荐最佳起始点)         │   可选，LLM可用时生效
              │  (个性化方法建议)         │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   写入学习计划数据库       │ ← 关键改进
              │   study_plans           │   持久化Agent结果
              │   student_knowledge     │   更新掌握度关联
              │   learning_list         │   写入学习列表
              └────────────────────────┘
```

**核心设计原则**:

1. **兜底 + 增强**: 规则引擎始终可用，LLM 可用时自动增强
2. **持久化**: Agent 生成结果必须写入 `study_plans` 表
3. **双向闭环**: 答题反馈 → 更新画像 → 重新生成计划
4. **可追溯**: 每个计划记录生成策略（rule/llm/agent）

## 三、改造方案设计

### 3.1 改造目标

| 目标           | 改造前              | 改造后                           |
| -------------- | ------------------- | -------------------------------- |
| 学习计划个性化 | 固定7任务模板       | 基于画像动态生成任务数和顺序     |
| 学习材料       | 硬编码4个URL        | 根据VARK风格推荐 + LLM补充       |
| Agent联动      | Agent画像不影响计划 | Agent画像→驱动计划生成           |
| 路径持久化     | 临时JSON返回        | 写入 study_plans + learning_list |
| 学习风格感知   | 无                  | VARK权重驱动资源推荐             |
| 时间自适应     | 固定时长            | 根据每日可用时间/专注时长分段    |
| 生成策略透明   | 无记录              | 记录 rule/llm/agent 来源         |

### 3.2 改造步骤

#### 步骤1: 增强 StudyPlanEngine — 融合画像数据

**文件**: `src/core/StudyPlanEngine.js`

**改动**:

- `generateDaily()` 新增参数读取 `student_profiles`
- `buildTasks()` 根据画像调整任务数量和类型
- `collectSignals()` 新增 Agent 推荐的薄弱节点优先级

```javascript
// 新增: 融合画像生成计划
async generateDailyWithProfile(pool, { userId, date, title, duration }) {
    // 1. 加载画像
    const aiPathGenerator = new (require('./AIPathGenerator'))();
    const profile = await aiPathGenerator.loadUserProfile(userId, pool);
    const dailyMinutes = aiPathGenerator.getDailyMinutes(profile);
    const attentionSpan = aiPathGenerator.getAttentionSpan(profile);
    const styleWeights = aiPathGenerator.getStyleWeights(profile);

    // 2. 根据画像调整任务密度
    const taskCount = Math.max(3, Math.min(8, Math.round(dailyMinutes / 45)));

    // 3. 收集薄弱节点 (含Agent推荐优先级)
    const signals = await this.collectSignals(pool, userId);

    // 4. 尝试 Agent 增强（LLM可用时）
    let agentSuggestions = null;
    try {
        const AgenticLearningAgent = require('./AgenticLearningAgent');
        const agent = new AgenticLearningAgent(userId, pool);
        agentSuggestions = await agent.reasonNextStep();
    } catch (e) { /* 降级 */ }

    // 5. 画像驱动构建任务
    const tasks = this.buildTasksWithProfile(signals, {
        dailyMinutes, attentionSpan, styleWeights,
        taskCount, agentSuggestions
    });

    // 6. 写入数据库并记录策略
    return this.savePlan(pool, { userId, date, tasks, strategy: 'profile-aware' });
}
```

#### 步骤2: AIPathGenerator 输出持久化

**文件**: `src/core/AIPathGenerator.js`

**改动**: 新增 `savePathToStudyPlans()` 方法，将生成路径写入 `study_plans`

```javascript
async savePathToStudyPlans(userId, pool, pathResult) {
    const StudyPlanEngine = require('./StudyPlanEngine');
    const engine = new StudyPlanEngine();

    // 将路径步骤转换为学习计划任务
    const steps = pathResult.steps || [];
    const tasks = steps.slice(0, 8).map((step, i) => ({
        time: `Session ${i + 1}`,
        title: step.name,
        nodeId: step.id,
        subject: step.subject,
        difficulty: step.difficulty,
        estimatedMinutes: step.estimate,
        resources: step.resources || [],
        type: step.mastery < 50 ? 'remedial' : step.mastery < 70 ? 'learn' : 'practice',
        priority: step.isRemedial ? 'high' : 'medium',
        profileAware: true,
        generatedBy: pathResult.strategy?.rule || 'profile-aware'
    }));

    await engine.savePlan(pool, { userId, tasks, strategy: pathResult.strategy });
}
```

#### 步骤3: Agent Center 联动学习计划

**文件**: `src/modules/agent.js`

**改动**: `POST /profile/process-input` 增加计划持久化

```javascript
router.post("/profile/process-input", authenticateJWT, async (req, res) => {
    const userId = getUserId(req);
    const { content, type = "text" } = req.body;

    await ensurePathData(pool, userId);

    const profileAgent = new ProfileAgent(userId, pool);
    await profileAgent.initializeProfile();
    const profile = await profileAgent.processMultimodalInput(type, content || "");

    // 新增: 用Agent画像驱动学习计划生成
    let studyPlan = null;
    try {
        const StudyPlanEngine = require("../core/StudyPlanEngine");
        const engine = new StudyPlanEngine();
        studyPlan = await engine.generateDailyWithProfile(pool, { userId });
    } catch (e) {
        console.warn("画像驱动计划生成失败(降级):", e.message);
    }

    res.json({
        success: true,
        profile,
        studyPlan, // 新增: 返回生成的学习计划
        hasPlanUpdated: Boolean(studyPlan)
    });
});
```

#### 步骤4: 前端 Agent Center 显示联动结果

**文件**: `apps/web/public/js/edusmart-app.js`

**改动**: `agentCenterView` 增加"应用到学习计划"按钮和状态显示

```html
<!-- 在 Agent推理结果卡片中增加 -->
<div class="agent-reasoning-actions">
    <button class="btn-violet" data-view="studyPlan">查看学习计划</button>
    <button class="btn-teal" data-agent-apply-plan>应用并更新计划</button>
    <span class="agent-plan-status"> 计划状态: 已同步到今日学习计划 </span>
</div>
```

#### 步骤5: 新增 API 端点 `POST /api/agent/apply-plan`

**文件**: `src/modules/agent.js`

```javascript
// 将Agent生成的计划写入 study_plans
router.post("/apply-plan", authenticateJWT, async (req, res) => {
    const userId = getUserId(req);

    try {
        const StudyPlanEngine = require("../core/StudyPlanEngine");
        const engine = new StudyPlanEngine();
        const plan = await engine.generateDailyWithProfile(pool, { userId });

        res.json({
            success: true,
            plan,
            message: "学习计划已更新为Agent个性化版本"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
```

### 3.3 数据流改造后全景

```
                         Agent Center
                    /api/agent/profile/process-input
                              │
                              ▼
                    ┌─────────────────┐
                    │  ProfileAgent    │
                    │  → student_profiles│
                    └────────┬────────┘
                             │ 画像就绪
                             ▼
              ┌──────────────────────────┐
              │ StudyPlanEngine           │
              │ generateDailyWithProfile() │ ← 新增
              │  ├─ 读取 student_profiles  │
              │  ├─ 读取 student_knowledge │
              │  ├─ AgenticLearningAgent   │ (可选)
              │  └─ AIPathGenerator        │ (可选)
              └──────────┬───────────────┘
                         │
                ┌────────┼────────┐
                ▼        ▼        ▼
         study_plans  learning_list  student_knowledge
         (个性化任务)   (推荐节点)     (掌握度关联)

              ┌──────────────────────────┐
              │ 前端联动显示               │
              │ ├─ Agent学习中心: 查看画像  │
              │ ├─ 学习计划页: 显示Agent任务│
              │ └─ 学习路径页: 显示推荐路径 │
              └──────────────────────────┘
```

### 3.4 降级策略

| 场景                    | 行为                                                 |
| ----------------------- | ---------------------------------------------------- |
| LLM 不可用              | 回退到画像驱动规则引擎（AIPathGenerator.generate()） |
| student_profiles 无数据 | 使用默认画像（每日60分钟、30分钟专注、综合风格）     |
| Agent 推理失败          | 跳过Agent增强，规则引擎直接生成                      |
| 数据库写入失败          | 返回rule-based结果，记录错误日志                     |

### 3.5 生成策略标记

每条学习计划记录将标记生成策略来源：

```javascript
// study_plans 表新增字段
ALTER TABLE study_plans ADD COLUMN generation_strategy VARCHAR(30) DEFAULT 'template';
// 值: template(旧硬编码) | profile-aware(画像驱动) | llm-enhanced(LLM增强) | agent-driven(Agent驱动)
```

前端可据此显示：

- 模板生成 → 普通任务卡片
- 画像驱动 → "基于个性化画像" 标签
- LLM增强 → "AI智能优化" 标签
- Agent驱动 → "Agent深度定制" 标签 + 紫色高亮

## 四、改造优先级与风险评估

| 步骤  | 描述                    | 优先级 | 风险 | 工作量 |
| ----- | ----------------------- | ------ | ---- | ------ |
| 步骤1 | StudyPlanEngine融合画像 | P0     | 低   | 中     |
| 步骤2 | AIPathGenerator持久化   | P0     | 低   | 小     |
| 步骤3 | Agent Center联动计划    | P0     | 中   | 中     |
| 步骤4 | 前端联动显示            | P1     | 低   | 小     |
| 步骤5 | 新增API端点             | P1     | 低   | 小     |

## 五、预期效果

| 维度       | 改造前                  | 改造后                                      |
| ---------- | ----------------------- | ------------------------------------------- |
| 任务个性化 | 所有用户相同的7任务模板 | 基于画像动态生成3-8个任务                   |
| 学习材料   | 固定URL                 | 根据VARK风格推荐+Agent补充                  |
| Agent联动  | Agent画像为孤岛         | Agent画像自动驱动计划                       |
| 可见性     | 无生成策略标记          | 标记 rule/llm/agent 来源                    |
| 时间适配   | 固定30分钟/任务         | 根据每日可用时间和专注时长分段              |
| 学习风格   | 不感知                  | visual/auditory/reading/kinesthetic权重驱动 |
| 持续改进   | 无反馈                  | 答题→更新画像→重新生成                      |

## 六、总结

当前系统的学习计划和路径生成存在**三重断裂**:

1. Agent分析了画像但不写入学习计划
2. AIPathGenerator有画像驱动能力但不持久化
3. AgenticLearningAgent的LLM推理仅前端展示不落库

推荐采用**混合策略**：以画像驱动规则引擎为基底（始终可用），Agent/LLM作为增强层（可选），结果统一写入 `study_plans` 表。这样既保证了离线可用性，又能在LLM可用时获得真正的智能个性化。
