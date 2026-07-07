# EduSmart API 路由完整参考手册

> 自动生成于 2026-06-27 | 共 **250+** 个 API 路由 + **36** 个 SPA 前端路由

---

## 路由清单总览

| 模块 | 挂载前缀 | 路由数 |
|------|---------|--------|
| auth | `/api/auth` | 6 |
| user | `/api/user` | 6 |
| app | `/api/app` | 34 |
| exams | `/api/exams` | 4 |
| questions | `/api/questions` | 2 |
| userExams | `/api/user-exams` | 4 |
| userAnswers | `/api/user-answers` | 1 |
| diagnostic | `/api/diagnostic` | 18 |
| metacognitive | `/api/metacognitive` | 2 |
| aiPath | `/api/ai` | 6 |
| learning-events | `/api/learning-events` | 5 |
| learning-loop | `/api/learning-loop` | 4 |
| closed-loop | `/api/closed-loop` | 19 |
| rhythm | `/api/rhythm` | 4 |
| emotion | `/api/emotion` | 3 |
| knowledge | `/api/knowledge` | 2 |
| knowledge-base | `/api/knowledge-base` | 1 |
| knowledge-graph | `/api/knowledge-graph` | 4 |
| concept-canvas | `/api/concept-canvas` | 6 |
| personal-knowledge | `/api/personal-knowledge` | 3 |
| course | `/api/course` | 9 |
| resources | `/api/resources` | 6 |
| agent | `/api/agent` | 17 |
| agent-runtime | `/api/agent-runtime` | 6 |
| agent-collaborate | `/api/agent-collaborate` | 3 |
| agent-decisions | `/api/agent-decisions` | 4 |
| ai-explain | `/api/ai-explain` | 1 |
| ai-config | `/api/ai-config` | 1 |
| ai-logs | `/api/ai-logs` | 2 |
| ai-learning | `/api/ai-learning` | 34 |
| ai-tutor | `/api/ai-tutor` | 4 |
| rag | `/api/rag` | 9 |
| tutor | `/api/tutor` | 1 |
| teacher | `/api/teacher` | 37 |
| student-paths | `/api/student-paths` | 6 |
| admin | `/api/admin` | 20 |
| config | `/api/config` | 2 |
| supervisor | `/api/supervisor` | 9 |
| membership | `/api/membership` | 7 |
| notifications | `/api/notifications` | 4 |
| daily-digest | `/api/daily-digest` | 4 |
| tts | `/api/tts` | 3 |
| virtual-human | `/api/virtual-human` | 6 |
| xfyun | `/api/xfyun` | 10 |
| compiler | `/api/compiler` | 2 |
| code-repo | `/api/code-repo` | 7 |
| team-code | `/api/team-code` | 11 |
| obsidian | `/api/obsidian` | 10 |
| paper-scan | `/api/paper-scan` | 4 |
| report | `/api/report` | 2 |
| iot | `/api/iot` | 4 |
| export-report | `/api` | 1 |
| routes/user | `/api` | 4 |
| health | `/api/health` | 1 |
| legacy-api | (多个) | 3 |

---

## 详细路由列表

### 🔐 认证与用户

#### `/api/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/bootstrap-admin` | 初始化管理员 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/register-teacher` | 教师注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/user` | 获取当前用户 |
| POST | `/api/auth/logout` | 用户登出 |

#### `/api/user`
| 方法 | 路径 | 说明 |
|------|------|------|
| PUT | `/api/user/profile` | 更新个人信息 |
| PUT | `/api/user/password` | 修改密码 |
| POST | `/api/user/avatar` | 上传头像 |
| GET | `/api/user/preferences` | 获取偏好设置 |
| PUT | `/api/user/preferences` | 更新偏好设置 |
| DELETE | `/api/user/account` | 删除账户 |

---

### 📱 核心应用

#### `/api/app`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/app/overview` | 应用概览 |
| GET | `/api/app/intelligence` | 智能面板 |
| POST | `/api/app/intelligence/run-agent-flow` | 运行Agent流程 |
| GET | `/api/app/ai-assistant/status` | AI助手状态 |
| POST | `/api/app/ai-assistant/chat` | AI助手对话 |
| POST | `/api/app/tasks/:id/toggle` | 切换任务状态 |
| POST | `/api/app/practice/answer` | 提交练习答案 |
| GET | `/api/app/practice/set` | 获取练习题集 |
| GET | `/api/app/practice/subjects` | 获取练习科目 |
| GET | `/api/app/account` | 账户信息 |
| GET | `/api/app/profile/insight` | 学习洞察 |
| GET | `/api/app/teacher-dashboard` | 教师仪表盘 |
| POST | `/api/app/teacher/action` | 教师操作 |
| POST | `/api/app/closed-loop/run` | 运行闭环学习 |
| GET | `/api/app/path/center` | 学习路径中心 |
| POST | `/api/app/path/generate` | 生成学习路径 |
| POST | `/api/app/path/node/:id/start` | 开始路径节点 |
| POST | `/api/app/path/custom-task` | 自定义任务 |
| GET | `/api/app/account/dashboard` | 账户仪表盘 |
| POST | `/api/app/course/:id/progress` | 课程进度 |
| GET | `/api/app/notes/center` | 笔记中心 |
| POST | `/api/app/notes/save` | 保存笔记 |
| PUT | `/api/app/notes/:id` | 更新笔记 |
| DELETE | `/api/app/notes/:id` | 删除笔记 |
| POST | `/api/app/notes/:id/card` | 生成知识卡片 |
| POST | `/api/app/notes/:id/review` | 笔记复习 |
| POST | `/api/app/report/generate` | 生成报告 |
| POST | `/api/app/practice/submit-set` | 提交练习集 |
| POST | `/api/app/plan/generate` | 生成学习计划 |
| POST | `/api/app/diagnosis/submit` | 提交诊断 |
| POST | `/api/app/tutor/message` | 导师消息 |
| POST | `/api/app/notes/generate-card` | 生成卡片 |
| POST | `/api/app/feynman/review` | 费曼复习 |

---

### 📝 考试系统

#### `/api/exams`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/exams/` | 考试列表 |
| GET | `/api/exams/:examId/questions` | 考试题目 |
| GET | `/api/exams/smart-paper/preview` | 智能试卷预览 |
| POST | `/api/exams/smart-paper/start` | 开始智能试卷 |

#### `/api/questions`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions/search` | 搜索题目 |
| GET | `/api/questions/` | 题目列表 |

#### `/api/user-exams`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/user-exams/` | 创建考试记录 |
| GET | `/api/user-exams/` | 考试记录列表 |
| GET | `/api/user-exams/:id` | 考试记录详情 |
| POST | `/api/user-exams/:id/submit` | 提交考试 |

#### `/api/user-answers`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/user-answers/` | 提交答案 |

---

### 🔬 诊断系统

#### `/api/diagnostic`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/diagnostic/questionnaire` | 诊断问卷 |
| POST | `/api/diagnostic/submit` | 提交诊断 |
| POST | `/api/diagnostic/quick` | 快速诊断 |
| GET | `/api/diagnostic/result` | 诊断结果 |
| GET | `/api/diagnostic/history` | 诊断历史 |
| GET | `/api/diagnostic/profile` | 诊断画像 |
| GET | `/api/diagnostic/subjects` | 诊断科目 |
| GET | `/api/diagnostic/subject-test` | 科目测试 |
| POST | `/api/diagnostic/subject-submit` | 提交科目诊断 |
| GET | `/api/diagnostic/vark-questionnaire` | VARK问卷 |
| POST | `/api/diagnostic/smart-start` | 智能诊断开始 |
| POST | `/api/diagnostic/smart-next-question` | 智能下一题 |
| POST | `/api/diagnostic/smart-submit-answer` | 智能提交答案 |
| GET | `/api/diagnostic/smart-status` | 智能诊断状态 |
| GET | `/api/diagnostic/smart-report` | 智能诊断报告 |
| GET | `/api/diagnostic/knowledge-tracing` | 知识追踪 |
| GET | `/api/diagnostic/misconceptions` | 错误概念 |
| GET | `/api/diagnostic/cognitive-profile` | 认知画像 |

#### `/api/metacognitive`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/metacognitive/guidance` | 元认知引导 |
| POST | `/api/metacognitive/assess` | 元认知评估 |

---

### 📚 学习系统

#### `/api/ai` (学习路径)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/learning-path` | 生成学习路径 |
| GET | `/api/ai/today-card` | 今日卡片 |
| POST | `/api/ai/learning-list` | 创建学习项 |
| GET | `/api/ai/learning-list` | 学习列表 |
| DELETE | `/api/ai/learning-list/:id` | 删除学习项 |
| PUT | `/api/ai/learning-list/:id/done` | 完成学习项 |

#### `/api/learning-events`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/learning-events/` | 记录学习事件 |
| GET | `/api/learning-events/` | 学习事件列表 |
| GET | `/api/learning-events/stats` | 学习统计 |
| GET | `/api/learning-events/behaviors` | 学习行为 |
| POST | `/api/learning-events/sync-profile` | 同步学习画像 |

#### `/api/learning-loop`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/learning-loop/start` | 开始学习循环 |
| POST | `/api/learning-loop/diagnosis/submit` | 提交学习诊断 |
| POST | `/api/learning-loop/practice/submit` | 提交练习 |
| GET | `/api/learning-loop/status` | 学习循环状态 |

#### `/api/closed-loop`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/closed-loop/smart-paper` | 智能组卷 |
| POST | `/api/closed-loop/smart-paper/start` | 开始智能试卷 |
| GET | `/api/closed-loop/practice` | 练习列表 |
| POST | `/api/closed-loop/practice/submit` | 提交练习 |
| GET | `/api/closed-loop/recommend/after-exam/:examRecordId` | 考后推荐 |
| GET | `/api/closed-loop/recommend/daily` | 每日推荐 |
| GET | `/api/closed-loop/error-book` | 错题本 |
| POST | `/api/closed-loop/error-book/auto-collect` | 自动收集错题 |
| POST | `/api/closed-loop/error-book/redo` | 重做错题 |
| PUT | `/api/closed-loop/error-book/:id/status` | 更新错题状态 |
| GET | `/api/closed-loop/error-book/stats` | 错题统计 |
| GET | `/api/closed-loop/study-plan` | 学习计划 |
| GET | `/api/closed-loop/study-plan/progress` | 学习计划进度 |
| POST | `/api/closed-loop/study-plan/generate` | 生成学习计划 |
| PUT | `/api/closed-loop/study-plan/:id/complete` | 完成计划项 |
| PUT | `/api/closed-loop/study-plan/:id/uncomplete` | 取消完成 |
| GET | `/api/closed-loop/study-plan/:date` | 按日期查计划 |
| GET | `/api/closed-loop/feedback-loops` | 反馈循环 |
| POST | `/api/closed-loop/feedback-loop/:id/close` | 关闭反馈循环 |

#### `/api/rhythm`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/rhythm/analyze` | 分析学习节奏 |
| POST | `/api/rhythm/recommend-review` | 推荐复习 |
| GET | `/api/rhythm/:courseId/nodes` | 课程节点 |
| POST | `/api/rhythm/attention` | 注意力分析 |

#### `/api/emotion`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/emotion/recognize` | 情绪识别 |
| POST | `/api/emotion/predict-resilience` | 预测韧性 |
| GET | `/api/emotion/trends` | 情绪趋势 |

---

### 🧠 知识系统

#### `/api/knowledge`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/knowledge/` | 知识列表 |
| GET | `/api/knowledge/:id` | 知识详情 |

#### `/api/knowledge-base`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/knowledge-base/overview` | 知识库概览 |

#### `/api/knowledge-graph`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/knowledge-graph/` | 知识图谱 |
| POST | `/api/knowledge-graph/links` | 创建知识链接 |
| DELETE | `/api/knowledge-graph/links/:id` | 删除知识链接 |
| GET | `/api/knowledge-graph/note-links/:noteId` | 笔记关联 |

#### `/api/concept-canvas`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/concept-canvas/` | 概念画布列表 |
| POST | `/api/concept-canvas/` | 创建概念画布 |
| GET | `/api/concept-canvas/elements/search` | 搜索元素 |
| GET | `/api/concept-canvas/:id` | 画布详情 |
| PUT | `/api/concept-canvas/:id` | 更新画布 |
| DELETE | `/api/concept-canvas/:id` | 删除画布 |

#### `/api/personal-knowledge`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/personal-knowledge/cards` | 知识卡片列表 |
| POST | `/api/personal-knowledge/cards` | 创建知识卡片 |
| POST | `/api/personal-knowledge/cards/from-ai` | AI生成卡片 |

---

### 📖 课程系统

#### `/api/course`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/course/first/available` | 首个可用课程 |
| GET | `/api/course/notes/mine` | 我的笔记 |
| PUT | `/api/course/notes/:noteId` | 更新笔记 |
| DELETE | `/api/course/notes/:noteId` | 删除笔记 |
| GET | `/api/course/:knowledgeId/detail` | 课程详情 |
| POST | `/api/course/:knowledgeId/interactions` | 课程交互 |
| PUT | `/api/course/:knowledgeId/notes/current` | 更新当前笔记 |
| POST | `/api/course/:knowledgeId/notes` | 创建笔记 |
| POST | `/api/course/:knowledgeId/comments` | 课程评论 |

#### `/api/resources`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/resources/categories` | 资源分类 |
| GET | `/api/resources/list` | 资源列表 |
| POST | `/api/resources/click/:id` | 资源点击 |
| GET | `/api/resources/problems` | 问题资源 |
| GET | `/api/resources/problems/:id` | 问题详情 |
| POST | `/api/resources/seed` | 种子数据 |

---

### 🤖 Agent 系统

#### `/api/agent`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/agent/profile/initialize` | 初始化Agent画像 |
| POST | `/api/agent/profile/process-input` | 处理Agent输入 |
| GET | `/api/agent/profile/summary` | Agent画像摘要 |
| GET | `/api/agent/resources/generate-stream` | 流式生成资源 |
| POST | `/api/agent/resources/generate` | 生成资源 |
| GET | `/api/agent/resources/types` | 资源类型 |
| GET | `/api/agent/settings` | Agent设置 |
| POST | `/api/agent/settings` | 更新Agent设置 |
| POST | `/api/agent/execute` | 执行Agent |
| POST | `/api/agent/run-daily-plan` | 运行每日计划 |
| GET | `/api/agent/assessment` | Agent评估 |
| POST | `/api/agent/assessment/adjust-strategy` | 调整策略 |
| POST | `/api/agent/assessment/log-resource` | 记录资源 |
| POST | `/api/agent/assessment/log-study` | 记录学习 |
| GET | `/api/agent/logs` | Agent日志 |
| POST | `/api/agent/chat` | Agent对话 |
| POST | `/api/agent/apply-plan` | 应用计划 |

#### `/api/agent-runtime`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/agent-runtime/run` | 运行Agent |
| POST | `/api/agent-runtime/design-course` | 设计课程 |
| GET | `/api/agent-runtime/traces/:sessionId` | 追踪会话 |
| GET | `/api/agent-runtime/next-action` | 下一步动作 |
| POST | `/api/agent-runtime/practice-complete` | 练习完成 |
| GET | `/api/agent-runtime/analyze-path` | 分析路径 |

#### `/api/agent-collaborate`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/agent-collaborate/start` | 开始协作 |
| GET | `/api/agent-collaborate/history` | 协作历史 |
| GET | `/api/agent-collaborate/:taskId` | 协作任务详情 |

#### `/api/agent-decisions`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/agent-decisions/` | 记录决策 |
| PUT | `/api/agent-decisions/:id/follow-up` | 决策跟进 |
| GET | `/api/agent-decisions/` | 决策列表 |
| GET | `/api/agent-decisions/:id` | 决策详情 |

---

### 🧪 AI 服务

#### `/api/ai-explain`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai-explain/` | AI解释 |

#### `/api/ai-config`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ai-config/ai-intelligence` | AI智能配置 |

#### `/api/ai-logs`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ai-logs/` | AI日志列表 |
| GET | `/api/ai-logs/view` | AI日志查看 |

#### `/api/ai-learning`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ai-learning/dashboard` | AI学习仪表盘 |
| POST | `/api/ai-learning/bkt/estimate` | BKT评估 |
| POST | `/api/ai-learning/bkt/batch-update` | BKT批量更新 |
| POST | `/api/ai-learning/diagnose` | AI诊断 |
| GET | `/api/ai-learning/forgetting-curve` | 遗忘曲线 |
| GET | `/api/ai-learning/forgetting-curve/message` | 遗忘曲线消息 |
| POST | `/api/ai-learning/socratic/chat` | 苏格拉底对话 |
| POST | `/api/ai-learning/socratic/note` | 苏格拉底笔记 |
| POST | `/api/ai-learning/adaptive/practice` | 自适应练习 |
| POST | `/api/ai-learning/adaptive/analyze` | 自适应分析 |
| POST | `/api/ai-learning/adaptive/test` | 自适应测试 |
| POST | `/api/ai-learning/notes/enrich` | 笔记增强 |
| POST | `/api/ai-learning/notes/mindmap` | 笔记思维导图 |
| GET | `/api/ai-learning/notes/related/:noteId` | 相关笔记 |
| POST | `/api/ai-learning/notes/summary` | 笔记摘要 |
| POST | `/api/ai-learning/reader/analyze` | 阅读分析 |
| POST | `/api/ai-learning/reader/translate` | 阅读翻译 |
| POST | `/api/ai-learning/reader/flashcard` | 阅读闪卡 |
| POST | `/api/ai-learning/grade` | AI评分 |
| POST | `/api/ai-learning/learning-path` | 学习路径 |
| POST | `/api/ai-learning/learning-path/adjust` | 调整学习路径 |
| POST | `/api/ai-learning/ocr` | AI OCR |
| POST | `/api/ai-learning/voice/transcribe` | 语音转录 |
| POST | `/api/ai-learning/cross-module/link` | 跨模块链接 |
| GET | `/api/ai-learning/cross-module/links/:type/:id` | 跨模块链接查询 |
| POST | `/api/ai-learning/video/mark` | 视频标记 |
| GET | `/api/ai-learning/video/marks/:courseId` | 视频标记列表 |
| POST | `/api/ai-learning/calendar/plan` | 日历计划 |
| GET | `/api/ai-learning/calendar/plans/:date` | 按日期查计划 |
| GET | `/api/ai-learning/error-book/heatmap` | 错题热力图 |
| POST | `/api/ai-learning/mock-interview/start` | 模拟面试开始 |
| POST | `/api/ai-learning/mock-interview/evaluate` | 模拟面试评估 |
| GET | `/api/ai-learning/alerts` | AI预警 |
| POST | `/api/ai-learning/demo-loop` | 演示循环 |

#### `/api/ai-tutor`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai-tutor/start` | 开始辅导 |
| POST | `/api/ai-tutor/answer` | 辅导回答 |
| POST | `/api/ai-tutor/skip` | 跳过 |
| POST | `/api/ai-tutor/hint` | 提示 |

---

### 🔍 RAG 系统

#### `/api/rag`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/rag/status` | RAG状态 |
| GET | `/api/rag/public-sources` | 公开源列表 |
| POST | `/api/rag/ingest-public` | 导入公开源 |
| GET | `/api/rag/overview` | RAG概览 |
| POST | `/api/rag/overview` | 更新概览 |
| POST | `/api/rag/query` | RAG查询 |
| POST | `/api/rag/add-to-learning` | 添加到学习 |
| POST | `/api/rag/enrich-nodes` | 增强节点 |
| POST | `/api/rag/ask` | RAG问答 |

---

### 👨‍🏫 导师与教师系统

#### `/api/tutor`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/tutor/ask` | 导师问答 |

#### `/api/teacher`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/teacher/overview` | 教师概览 |
| GET | `/api/teacher/subjects` | 科目列表 |
| GET | `/api/teacher/students` | 学生列表 |
| POST | `/api/teacher/assign-subject` | 分配科目 |
| GET | `/api/teacher/assignments` | 作业列表 |
| DELETE | `/api/teacher/assignments/:id` | 删除作业 |
| POST | `/api/teacher/exams/create` | 创建考试 |
| GET | `/api/teacher/exams` | 考试列表 |
| GET | `/api/teacher/exams/:id` | 考试详情 |
| POST | `/api/teacher/exams/:id/publish` | 发布考试 |
| GET | `/api/teacher/exams/:id/submissions` | 考试提交 |
| DELETE | `/api/teacher/exams/:id` | 删除考试 |
| GET | `/api/teacher/resources/search` | 资源搜索 |
| POST | `/api/teacher/notes/publish` | 发布笔记 |
| GET | `/api/teacher/notes` | 笔记列表 |
| GET | `/api/teacher/notes/:id` | 笔记详情 |
| DELETE | `/api/teacher/notes/:id` | 删除笔记 |
| GET | `/api/teacher/student/:id/detail` | 学生详情 |
| GET | `/api/teacher/student/:id/exams` | 学生考试 |
| GET | `/api/teacher/student/:id/stats` | 学生统计 |
| PUT | `/api/teacher/students/:id/deactivate` | 停用学生 |
| POST | `/api/teacher/students/batch-import` | 批量导入学生 |
| POST | `/api/teacher/paths/create` | 创建路径 |
| GET | `/api/teacher/paths` | 路径列表 |
| GET | `/api/teacher/paths/:id` | 路径详情 |
| PUT | `/api/teacher/paths/:id` | 更新路径 |
| PUT | `/api/teacher/paths/:id/steps/reorder` | 重排步骤 |
| DELETE | `/api/teacher/paths/:id` | 删除路径 |
| POST | `/api/teacher/paths/:id/assign` | 分配路径 |
| DELETE | `/api/teacher/paths/:pathId/assignments/:assignmentId` | 取消分配 |
| GET | `/api/teacher/paths/:id/progress` | 路径进度 |
| POST | `/api/teacher/paths/unlock` | 解锁路径 |
| GET | `/api/teacher/path-assignments` | 路径分配列表 |
| GET | `/api/teacher/paths/:id/versions` | 路径版本 |
| PUT | `/api/teacher/paths/:id/schedule` | 路径排期 |
| GET | `/api/teacher/knowledge-graph` | 知识图谱 |

#### `/api/student-paths`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/student-paths/notes` | 学生笔记 |
| GET | `/api/student-paths/notes/:assignmentId` | 分配笔记 |
| GET | `/api/student-paths/active` | 活跃路径 |
| GET | `/api/student-paths/:pathId/content` | 路径内容 |
| POST | `/api/student-paths/step-complete` | 完成步骤 |
| GET | `/api/student-paths/dashboard` | 学生仪表盘 |

---

### ⚙️ 管理端

#### `/api/admin`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/knowledge` | 知识管理列表 |
| POST | `/api/admin/knowledge` | 创建知识 |
| PUT | `/api/admin/knowledge/:id` | 更新知识 |
| DELETE | `/api/admin/knowledge/:id` | 删除知识 |
| GET | `/api/admin/exams` | 考试管理 |
| POST | `/api/admin/exams` | 创建考试 |
| PUT | `/api/admin/exams/:id` | 更新考试 |
| DELETE | `/api/admin/exams/:id` | 删除考试 |
| GET | `/api/admin/questions` | 题目管理 |
| POST | `/api/admin/questions` | 创建题目 |
| PUT | `/api/admin/questions/:id` | 更新题目 |
| DELETE | `/api/admin/questions/:id` | 删除题目 |
| GET | `/api/admin/rag/sources` | RAG源管理 |
| POST | `/api/admin/rag/sources` | 创建RAG源 |
| PUT | `/api/admin/rag/sources/:id` | 更新RAG源 |
| DELETE | `/api/admin/rag/sources/:id` | 删除RAG源 |
| GET | `/api/admin/rag/documents` | RAG文档管理 |
| POST | `/api/admin/rag/documents` | 创建RAG文档 |
| PUT | `/api/admin/rag/documents/:id` | 更新RAG文档 |
| DELETE | `/api/admin/rag/documents/:id` | 删除RAG文档 |

#### `/api/config`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/config/` | 配置列表 |
| GET | `/api/config/:key` | 配置项 |

#### `/api/supervisor`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/supervisor/pomodoro/start` | 开始番茄钟 |
| POST | `/api/supervisor/pomodoro/pause` | 暂停番茄钟 |
| POST | `/api/supervisor/pomodoro/resume` | 恢复番茄钟 |
| POST | `/api/supervisor/pomodoro/complete` | 完成番茄钟 |
| GET | `/api/supervisor/pomodoro/state` | 番茄钟状态 |
| GET | `/api/supervisor/statistics` | 统计数据 |
| GET | `/api/supervisor/motivation` | 激励内容 |
| GET | `/api/supervisor/achievements` | 成就列表 |
| POST | `/api/supervisor/achievements/check` | 检查成就 |

---

### 💳 会员与通知

#### `/api/membership`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/membership/status` | 会员状态 |
| GET | `/api/membership/center` | 会员中心 |
| POST | `/api/membership/activate-demo` | 激活演示 |
| GET | `/api/membership/email` | 邮箱信息 |
| POST | `/api/membership/email/bind` | 绑定邮箱 |
| POST | `/api/membership/email/verify` | 验证邮箱 |
| POST | `/api/membership/push-settings` | 推送设置 |

#### `/api/notifications`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notifications/` | 通知列表 |
| GET | `/api/notifications/unread-count` | 未读计数 |
| PUT | `/api/notifications/:id/read` | 标记已读 |
| PUT | `/api/notifications/mark-all-read` | 全部已读 |

#### `/api/daily-digest`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/daily-digest/generate` | 生成日报 |
| GET | `/api/daily-digest/recent` | 最近日报 |
| GET | `/api/daily-digest/email-logs` | 邮件日志 |
| POST | `/api/daily-digest/send-test` | 测试发送 |

---

### 🎤 多媒体

#### `/api/tts`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/tts/speak` | 语音合成 |
| POST | `/api/tts/tutor-speak` | 导师语音 |
| GET | `/api/tts/voices` | 发音人列表 |

#### `/api/virtual-human`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/virtual-human/connect` | 连接虚拟人 |
| POST | `/api/virtual-human/disconnect` | 断开虚拟人 |
| POST | `/api/virtual-human/message` | 虚拟人消息 |
| GET | `/api/virtual-human/avatars` | 虚拟人形象 |
| GET | `/api/virtual-human/stream-url` | 流地址 |
| GET | `/api/virtual-human/status` | 虚拟人状态 |

#### `/api/xfyun`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/xfyun/capabilities` | 讯飞能力列表 |
| GET | `/api/xfyun/ise-url` | 口语评测URL |
| GET | `/api/xfyun/asr-url` | 语音识别URL |
| GET | `/api/xfyun/iat-url` | 语音听写URL |
| GET | `/api/xfyun/rta-bigmodel-url` | 实时转写URL |
| POST | `/api/xfyun/translate` | 翻译 |
| GET | `/api/xfyun/tts-url` | TTS鉴权URL |
| POST | `/api/xfyun/ocr/document` | OCR识别 |
| GET | `/api/xfyun/image-understanding-url` | 图片理解URL |
| POST | `/api/xfyun/ppt/create` | 创建PPT |

---

### 💻 协作编程

#### `/api/compiler`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/compiler/run` | 运行代码 |
| GET | `/api/compiler/status` | 编译器状态 |

#### `/api/code-repo`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/code-repo/create` | 创建仓库 |
| GET | `/api/code-repo/list` | 仓库列表 |
| GET | `/api/code-repo/:id/files` | 文件列表 |
| GET | `/api/code-repo/:id/file/:fileId` | 文件详情 |
| POST | `/api/code-repo/:id/upload` | 上传文件 |
| DELETE | `/api/code-repo/:id/file/:fileId` | 删除文件 |
| DELETE | `/api/code-repo/:id` | 删除仓库 |

#### `/api/team-code`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/team-code/summary` | 团队摘要 |
| POST | `/api/team-code/demo` | 演示项目 |
| POST | `/api/team-code/projects` | 创建项目 |
| DELETE | `/api/team-code/projects/:id` | 删除项目 |
| GET | `/api/team-code/projects/:id` | 项目详情 |
| GET | `/api/team-code/projects/:id/files/:fileId` | 项目文件 |
| GET | `/api/team-code/projects/:id/download` | 下载项目 |
| POST | `/api/team-code/projects/:id/files/save` | 保存文件 |
| POST | `/api/team-code/projects/:id/ai-review` | AI审查 |
| POST | `/api/team-code/projects/:id/ai-pipeline` | AI流水线 |
| POST | `/api/team-code/projects/:id/tools/run` | 运行工具 |

---

### 🔌 集成

#### `/api/obsidian`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/obsidian/knowledge-base` | 知识库 |
| GET | `/api/obsidian/graph` | 图谱 |
| GET | `/api/obsidian/search` | 搜索 |
| GET | `/api/obsidian/note` | 笔记 |
| POST | `/api/obsidian/notes/write` | 写笔记 |
| POST | `/api/obsidian/paths/write` | 写路径 |
| GET | `/api/obsidian/status` | 状态 |
| POST | `/api/obsidian/sync/questions` | 同步题目 |
| POST | `/api/obsidian/sync-rag` | 同步RAG |
| GET | `/api/obsidian/stats` | 统计 |

#### `/api/paper-scan`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/paper-scan/scan` | 扫描试卷 |
| GET | `/api/paper-scan/history` | 扫描历史 |
| GET | `/api/paper-scan/history/:id` | 扫描详情 |
| POST | `/api/paper-scan/save` | 保存扫描 |

#### `/api/report`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/report/behavior` | 行为报告 |
| POST | `/api/report/` | 生成报告 |

#### `/api/iot`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/iot/devices` | 设备列表 |
| GET | `/api/iot/logs` | 设备日志 |
| POST | `/api/iot/register-device` | 注册设备 |
| POST | `/api/iot/analyze-operation` | 分析操作 |

---

### 🏥 健康检查 & 兼容

#### 健康检查
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |

#### 旧版兼容API
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/questions/search-by-image` | 图片搜题 |
| POST | `/api/spark-proxy` | 星火代理 |
| POST | `/v1/chat/completions` | OpenAI兼容接口 |

#### 旧版路由 (挂载于 `/api`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/export-report` | 导出报告 |
| GET | `/api/auth/user` | 获取用户 |
| PUT | `/api/user/profile` | 更新资料 |
| PUT | `/api/user/password` | 修改密码 |
| POST | `/api/user/avatar` | 上传头像 |

---

### 🌐 SPA 前端路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 首页 |
| GET | `/home` | 主页 |
| GET | `/profile` | 个人资料 |
| GET | `/agent-profile` | Agent画像 |
| GET | `/study-report` | 学习报告 |
| GET | `/study-plan` | 学习计划 |
| GET | `/report` | 报告 |
| GET | `/exam` | 考试 |
| GET | `/practice` | 练习 |
| GET | `/test` | 测试 |
| GET | `/online-exam` | 在线考试 |
| GET | `/daily-challenge` | 每日挑战 |
| GET | `/course` | 课程 |
| GET | `/course-detail` | 课程详情 |
| GET | `/path` | 路径 |
| GET | `/ai-path` | AI路径 |
| GET | `/learning-path` | 学习路径 |
| GET | `/knowledge-base` | 知识库 |
| GET | `/asset` | 资源 |
| GET | `/my-notes` | 我的笔记 |
| GET | `/smart-notes` | 智能笔记 |
| GET | `/account` | 账户 |
| GET | `/me` | 个人中心 |
| GET | `/teacher-workbench` | 教师工作台 |
| GET | `/teacher` | 教师端 |
| GET | `/rag-knowledge` | RAG知识 |
| GET | `/error-book` | 错题本 |
| GET | `/ai-assistant` | AI助手 |
| GET | `/agent-research` | Agent研究 |
| GET | `/code-lab` | 代码实验室 |
| GET | `/team-code` | 团队编程 |
| GET | `/compiler` | 编译器 |
| GET | `/ai-learning` | AI学习 |
| GET | `/intelligence` | 智能面板 |
| GET | `/knowledge-graph` | 知识图谱 |
| GET | `/concept-canvas` | 概念画布 |

---

## 统计摘要

| 类别 | 数量 |
|------|------|
| API 路由总数 | **250+** |
| SPA 前端路由 | **36** |
| API 模块数 | **51** |
| 路由前缀数 | **48** |

---

> 📝 本文档由自动化脚本生成，基于 `src/server/route-manifest.js` 路由清单及各模块文件的 `router.get/post/put/delete` 声明。
