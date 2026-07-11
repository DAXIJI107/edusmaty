/**
 * =============================================================================
 * 中央 API 路由清单
 * =============================================================================
 *
 * @file       src/server/route-manifest.js
 * @module     Server/RouteManifest
 * @description
 *   所有 API 路由的集中注册清单。
 *   每个条目为 [路由前缀, 模块相对路径] 的二元组。
 *
 *   优势：
 *   - 新增模块只需在此添加一行，无需修改 app.js
 *   - 人类和 AI 都能快速了解项目的 API 全景
 *   - 启动时动态 require，加载失败不影响其他模块
 *
 *   约定：
 *   - 模块文件位于 src/modules/ 或 src/routes/ 目录
 *   - 每个模块文件导出一个 Express Router
 *   - 路由前缀以 /api 开头
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 添加完整注释，标注模块职责
 *
 * =============================================================================
 */

// ========== 静态模块映射（pkg 静态分析需要所有 require 为字面量） ==========
const _modules = {
  // 认证与用户
  '../modules/auth': require('../modules/auth'),
  '../modules/user': require('../modules/user'),
  // 核心应用
  '../modules/app': require('../modules/app'),
  // 考试系统
  '../modules/exams': require('../modules/exams'),
  '../modules/questions': require('../modules/questions'),
  '../modules/userExams': require('../modules/userExams'),
  '../modules/userAnswers': require('../modules/userAnswers'),
  // 诊断系统
  '../modules/diagnostic': require('../modules/diagnostic'),
  '../modules/metacognitive': require('../modules/metacognitive'),
  // 学习系统
  '../modules/aiPath': require('../modules/aiPath'),
  '../modules/learning-events': require('../modules/learning-events'),
  '../modules/learning-loop': require('../modules/learning-loop'),
  '../modules/closed-loop': require('../modules/closed-loop'),
  '../modules/rhythm': require('../modules/rhythm'),
  '../modules/emotion': require('../modules/emotion'),
  // 知识系统
  '../modules/knowledge': require('../modules/knowledge'),
  '../modules/knowledge-base': require('../modules/knowledge-base'),
  '../modules/knowledge-graph': require('../modules/knowledge-graph'),
  '../modules/concept-canvas': require('../modules/concept-canvas'),
  '../modules/personal-knowledge': require('../modules/personal-knowledge'),
  // 课程系统
  '../modules/course': require('../modules/course'),
  '../modules/resources': require('../modules/resources'),
  // Agent 系统
  '../modules/agent': require('../modules/agent'),
  '../modules/agent-runtime': require('../modules/agent-runtime'),
  '../modules/agent-collaborate': require('../modules/agent-collaborate'),
  '../modules/agent-decisions': require('../modules/agent-decisions'),
  // AI 服务
  '../modules/ai-explain': require('../modules/ai-explain'),
  '../modules/ai-config': require('../modules/ai-config'),
  '../modules/ai-logs': require('../modules/ai-logs'),
  '../modules/ai-learning': require('../modules/ai-learning'),
  '../modules/ai-tutor': require('../modules/ai-tutor'),
  // RAG 系统
  '../modules/rag': require('../modules/rag'),
  // 导师系统
  '../modules/tutor': require('../modules/tutor'),
  // 教师端
  '../modules/teacher': require('../modules/teacher'),
  '../modules/student-paths': require('../modules/student-paths'),
  // 管理端
  '../modules/admin': require('../modules/admin'),
  '../modules/config': require('../modules/config'),
  '../modules/supervisor': require('../modules/supervisor'),
  // 会员与通知
  '../modules/membership': require('../modules/membership'),
  '../modules/notifications': require('../modules/notifications'),
  '../modules/daily-digest': require('../modules/daily-digest'),
  // 多媒体
  '../modules/tts': require('../modules/tts'),
  '../modules/virtual-human': require('../modules/virtual-human'),
  '../modules/xfyun': require('../modules/xfyun'),
  // 协作编程
  '../modules/compiler': require('../modules/compiler'),
  '../modules/code-repo': require('../modules/code-repo'),
  '../modules/team-code': require('../modules/team-code'),
  // 集成
  '../modules/obsidian': require('../modules/obsidian'),
  '../modules/paper-scan': require('../modules/paper-scan'),
  '../modules/report': require('../modules/report'),
  '../modules/iot': require('../modules/iot'),
  // 兼容旧路由
  '../modules/export-report': require('../modules/export-report'),
  '../routes/user': require('../routes/user'),
};

module.exports = [
  // ========== 认证与用户 ==========
  ['/api/auth', _modules['../modules/auth']],
  ['/api/user', _modules['../modules/user']],

  // ========== 核心应用 ==========
  ['/api/app', _modules['../modules/app']],

  // ========== 考试系统 ==========
  ['/api/exams', _modules['../modules/exams']],
  ['/api/questions', _modules['../modules/questions']],
  ['/api/user-exams', _modules['../modules/userExams']],
  ['/api/user-answers', _modules['../modules/userAnswers']],

  // ========== 诊断系统 ==========
  ['/api/diagnostic', _modules['../modules/diagnostic']],
  ['/api/metacognitive', _modules['../modules/metacognitive']],

  // ========== 学习系统 ==========
  ['/api/ai', _modules['../modules/aiPath']], // 学习路径
  ['/api/learning-events', _modules['../modules/learning-events']],
  ['/api/learning-loop', _modules['../modules/learning-loop']],
  ['/api/closed-loop', _modules['../modules/closed-loop']],
  ['/api/rhythm', _modules['../modules/rhythm']],
  ['/api/emotion', _modules['../modules/emotion']],

  // ========== 知识系统 ==========
  ['/api/knowledge', _modules['../modules/knowledge']],
  ['/api/knowledge-base', _modules['../modules/knowledge-base']],
  ['/api/knowledge-graph', _modules['../modules/knowledge-graph']],
  ['/api/concept-canvas', _modules['../modules/concept-canvas']],
  ['/api/personal-knowledge', _modules['../modules/personal-knowledge']],

  // ========== 课程系统 ==========
  ['/api/course', _modules['../modules/course']],
  ['/api/resources', _modules['../modules/resources']],

  // ========== Agent 系统 ==========
  ['/api/agent', _modules['../modules/agent']],
  ['/api/agent-runtime', _modules['../modules/agent-runtime']],
  ['/api/agent-collaborate', _modules['../modules/agent-collaborate']],
  ['/api/agent-decisions', _modules['../modules/agent-decisions']],

  // ========== AI 服务 ==========
  ['/api/ai-explain', _modules['../modules/ai-explain']],
  ['/api/ai-config', _modules['../modules/ai-config']],
  ['/api/ai-logs', _modules['../modules/ai-logs']],
  ['/api/ai-learning', _modules['../modules/ai-learning']],
  ['/api/ai-tutor', _modules['../modules/ai-tutor']],

  // ========== RAG 系统 ==========
  ['/api/rag', _modules['../modules/rag']],

  // ========== 导师系统 ==========
  ['/api/tutor', _modules['../modules/tutor']],

  // ========== 教师端 ==========
  ['/api/teacher', _modules['../modules/teacher']],
  ['/api/student-paths', _modules['../modules/student-paths']],

  // ========== 管理端 ==========
  ['/api/admin', _modules['../modules/admin']],
  ['/api/config', _modules['../modules/config']],
  ['/api/supervisor', _modules['../modules/supervisor']],

  // ========== 会员与通知 ==========
  ['/api/membership', _modules['../modules/membership']],
  ['/api/notifications', _modules['../modules/notifications']],
  ['/api/daily-digest', _modules['../modules/daily-digest']],

  // ========== 多媒体 ==========
  ['/api/tts', _modules['../modules/tts']],
  ['/api/virtual-human', _modules['../modules/virtual-human']],
  ['/api/xfyun', _modules['../modules/xfyun']],

  // ========== 协作编程 ==========
  ['/api/compiler', _modules['../modules/compiler']],
  ['/api/code-repo', _modules['../modules/code-repo']],
  ['/api/team-code', _modules['../modules/team-code']],

  // ========== 集成 ==========
  ['/api/obsidian', _modules['../modules/obsidian']],
  ['/api/paper-scan', _modules['../modules/paper-scan']],
  ['/api/report', _modules['../modules/report']],
  ['/api/iot', _modules['../modules/iot']],

  // ========== 兼容旧路由（可能冲突，注意注册顺序） ==========
  ['/api', _modules['../modules/export-report']],
  ['/api', _modules['../routes/user']],
];
