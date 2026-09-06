# 学习流程页面联动改造计划

## Context（为什么改）

用户反馈：学习相关页面（首页、学习中心、15分钟冲刺、练习、画像）目前各自为政，页面里有大量写死的 mock 假数据（假任务、假课程、假画像、假周历），页面之间没有真实联动。目标：**清除 mock → 全部用真实数据库数据，并把「首页 → 学习中心 → 领取15分钟冲刺任务 → 带任务上下文进练习 → 提交练习自动完成任务/回写掌握度 → 路径/周历/动态刷新」串成一条完整闭环**。

已核实：后端 `/api/app/overview`（src/modules/app.js L338-460）与 `/api/app/path/center`（L2061-2208）读的是**同一张 study\_tasks 表**，`/practice/submit-set`（L3043-3113）已回写掌握度/动态——数据本身同源，断点主要在前端 mock 兜底和缺少上下文传递。

## 改动文件

1. `src/modules/app.js`（后端，4 处）
2. `apps/web/public/js/edusmart-app.js`（前端主体）
3. `apps/web/public/html/app.html`（版本号 → `v=20260906-link1`）
4. `apps/web/public/css/edusmart-pro.css`（练习上下文横幅样式，末尾追加）

***

## 一、后端（src/modules/app.js）

### B1+B2. 提取共用函数 completeStudyTask + toggle 复用

在 `POST /tasks/:id/toggle`（L1055）前新增 `completeStudyTask(userId, taskId)`：查任务→已 done 幂等返回→否则置 done + `users.study_hours/study_efficiency` 更新 + 写 activities。toggle 路由保留「取消完成」分支，完成分支改调此函数（对外行为不变）。

### B3. `/practice/submit-set`（L3043-3131）集成 taskId

* L3046 解构增加 `taskId = null`

* score 计算完成后：`if (taskId && score >= 60)` 调 `completeStudyTask`（try/catch 包裹，失败不阻塞提交）

* 响应增加 `taskMarkedDone`、`task: {id, title}`

* 注意：`learningGoalId` 提前 return 分支（L3047-3057）不处理 taskId，保持现状

### B4. `/overview` 增加 `weekTasks`（真实周历数据）

recommendations 查询（L384）后：JS 计算本周一\~周日日期（**本地时区格式化，不用 toISOString**，日期边界 JS 算，SQL 只按 task\_date 区间 GROUP BY，避免 sqlite 方言问题），查 study\_tasks（同 tasks 的 source 过滤）按天聚合 total/done，返回 `weekTasks: [{date, weekday, total, done, isToday}]`。

## 二、前端（edusmart-app.js）

### 数据层

* **F1** `defaultData()`：新增 `practiceContext: null, weekTasks: []`

* **F2** `loadData()`（L544-556）：映射 `weekTasks: json.weekTasks || []`

* **F3+F9** `assessmentSubject(mode)`（L8134-8136）重写：`onlineExam → "all"`，否则 `state.data.practiceContext?.subject || (mode==="test" ? selectedSubject : "all")`（assessmentKey/loadQuestionSet 自动跟随；**F3 与 F9 必须同一批改**，影响缓存键）；新增 `practiceContextBanner()` 横幅渲染（含 `data-clear-practice-context` 取消按钮），插入 assessmentStartView 与 assessmentFocusView 顶部

* **F14** `loadStudyPlan()`（L589-590）：`actionUrl: "/path"` → `"/practice"`，`actionLabel` → `"去练习巩固"`（studyPlanTaskCard 按钮自动变为练习入口）

* **F18** `render()` L23065：`profile` 视图的 loadProfileInsight ensure 扩到 `home` 视图（try/catch）

### 联动链路（practiceContext 数据流）

* **写入**（重写 `data-plan-action` handler L16146-16151）：**废弃** **`window.location.href`** **整页跳转**，改用现成 `routeToView()`（L460-508）解析 actionUrl → `setView()`；目标是 practice/test/onlineExam 时写 `state.data.practiceContext = { taskId, subject, knowledgeTitle, title }`（从按钮的 data-plan-task-id/data-plan-title/data-plan-subject/data-plan-knowledge 读取），并清对应 questionSets 缓存、`assessmentStarted[view]=false`

* **按钮带上下文**：planCard 任务行（F4）、studyPlanTaskCard（L2492/L2504）、studyPlanView Agent 分支「开始当前任务」（L3937）、冲刺页「去练习巩固」（F10）统一追加 `data-plan-task-id/title/subject/knowledge` 属性

* **消费**：`data-submit-question-set`（L19942-19981）payload 增加 `taskId: practiceContext?.taskId || null`；成功后若 `result.taskMarkedDone` → toast「今日任务已完成」；清 practiceContext + pathCenter/studyPlan + `loadStudyPlan(true)` 再 render（周历/任务/路径同步刷新）

* **清理**：新增 `data-clear-practice-context` handler（清 practiceContext + render）

* **冲刺页打卡**（`data-sprint-complete` handler，L16038-16080 附近）：补 `await loadData(true)`（修复打卡后首页任务陈旧）；完成后追加「去练习巩固」按钮（不带 taskId，打卡时已置空防重复标记）

### 清除 mock → 真实空状态

| 位置                                                            | 现状                             | 改法                                                                                                                                                                                              |
| ------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `planCard()` L2204-2243                                       | 4 条假任务                         | 删；空时渲染空态卡 +「调用 Agent 生成今日计划」(`data-study-plan-agent-generate`) +「进入学习中心」按钮，隐藏进度条行                                                                                                               |
| `activityCard()` L2266-2285                                   | 2 条假动态                         | 删；空态「完成任务或练习后会自动记录在这里」                                                                                                                                                                          |
| `homeView()` L2328、L2341-2351                                 | getMockProfileInsight + 3 条假课程 | L2328 改 `state.data.profileInsight \|\| emptyProfileInsight()`（新增安全空对象小工具 `emptyProfileInsight()`）；课程空态 + `data-view="course"` 引导                                                               |
| `homeView()` hero KPI L2359-2363                              | 假值 78%/14/5                    | 真实值：`state.data.metrics[1]?.[2]`（知识掌握度，**metrics 是数组**，用 `[1]?.[2]` 不是 `.value`）、`metrics[3]?.[2]`（连续天数）、`weakPoints.length`；L2329 焦点兜底「动态规划」→「薄弱知识点」                                           |
| `profileView()` L6335                                         | getMockProfileInsight          | 同 homeView 改法，下游字段全部安全兜底                                                                                                                                                                        |
| `studyPlanView()` 非 Agent 分支 L3868-3929                       | 假课程/假路径四步/假错题/假周历              | 路径节点改 `state.data.pathCenter?.pathNodes`（loadStudyPlan 已加载）；错题复盘改 `recommendations`，空时回退 `weakPoints` 真实数据；周历改 `state.data.weekTasks`（按 weekday/done/total/isToday 渲染，今日高亮）；全部空态带 Agent 生成/跳转按钮 |
| `subjectTestSelector()` L8353-8355                            | 假学科占位                          | 空态「题库暂无可用学科」                                                                                                                                                                                    |
| `getMockProfileInsight()` L23545-23595                        | 整个假画像                          | 整体删除（仅 L2328/L6335 两处引用，均已改）                                                                                                                                                                    |
| **F16** `data-study-plan-agent-generate` handler L16221-16259 | 生成后首页不刷新                       | `loadStudyPlan(true)` 后补 `await loadData(true)`（try/catch）                                                                                                                                      |

## 三、CSS + 版本号

* edusmart-pro.css 末尾追加 `.practice-context-banner` 横幅样式（flex 横条 + pill + ghost 取消按钮，参考既有 `.scope-banner` 视觉）

* app.html：L11 css `v=20260905-bot6` → `v=20260906-link1`；L17 js `v=20260905-sprint1` → `v=20260906-link1`

## 实施顺序

1. 后端 B1+B2（toggle 重构）→ B4（weekTasks）→ B3（submit-set，依赖 B1）
2. 重启服务器（端口 3020，先清端口），API 验证：toggle 正常、submit-set 带 taskId 返回 taskMarkedDone、overview 返回 weekTasks
3. 前端数据层（F1/F2/F3+F9/F14/F18）→ 联动链路（F12/F13/F15/F17/F10/F11）→ mock 清除（F4/F5/F6/F7/F8/F16/F19/F20）
4. CSS + 版本号，浏览器全流程手测

## 验证（浏览器手测）

**老用户（admin/123456）**：

1. 首页 KPI 与指标卡/薄弱点数一致（无 78/14/5）；任务卡真实任务
2. 任务卡「练习」→ 无整页刷新进 /practice，顶部横幅「正在完成今日任务：xxx」，题目按任务学科组卷
3. 答题 ≥60 分提交 → toast 得分+任务完成 → 学习中心任务打勾、动态+2 条、周历今日 done+1
4. 冲刺页打卡 → 首页任务同步变 done（原 bug 修复）→「去练习巩固」可跳带横幅
5. 回归：onlineExam 全学科抽题、test 分科切换、data-task-id 取消完成、无 learningGoalId 时直接提交正常

**新用户（空数据）**：无任何假数据；任务卡空态按钮可一键 Agent 生成 → 首页任务出现；空态均有引导入口

**测试纪律**：完成任务会真实写库，测试后用 API 把 study\_tasks 切回 pending（禁止脚本直写 DB）；涉及 localStorage（`edusmart_sprint15_v1`）每轮先清理；改完需 Ctrl+Shift+R 强刷。

## 风险

* `assessmentSubject` 改动影响题集缓存键，F3+F9 必须同批提交

* metrics 是数组结构，KPI 取值用 `metrics[1]?.[2]`

* `completeStudyTask` 中 NOW()/LEAST 等 MySQL 方言由 sqlite-adapter 自动转换（已有先例）

