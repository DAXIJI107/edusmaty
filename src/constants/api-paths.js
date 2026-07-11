/**
 * =============================================================================
 * API 路径常量
 * =============================================================================
 *
 * @file       src/constants/api-paths.js
 * @module     Constants/ApiPaths
 * @description
 *   所有 API 路径的集中定义。
 *   路由注册和前端调用统一引用此文件，避免硬编码路径分散各处。
 *
 *   路径变更时只需修改此处，IDE 可自动追踪所有引用位置。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块
 *
 * =============================================================================
 */

const API_PREFIX = '/api';

module.exports = {
  /** API 前缀 */
  PREFIX: API_PREFIX,

  // ========== 认证 ==========
  AUTH: {
    BASE: `${API_PREFIX}/auth`,
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    REFRESH: `${API_PREFIX}/auth/refresh`,
  },

  // ========== 用户 ==========
  USER: {
    BASE: `${API_PREFIX}/user`,
    PROFILE: `${API_PREFIX}/user/profile`,
    PASSWORD: `${API_PREFIX}/user/password`,
    AVATAR: `${API_PREFIX}/user/avatar`,
    CURRENT: `${API_PREFIX}/user/auth/user`,
  },

  // ========== 诊断 ==========
  DIAGNOSTIC: {
    BASE: `${API_PREFIX}/diagnostic`,
    SUBMIT: `${API_PREFIX}/diagnostic/submit`,
    REPORT: `${API_PREFIX}/diagnostic/report`,
  },

  // ========== 学习 ==========
  LEARNING: {
    PATH: `${API_PREFIX}/ai`,
    PLAN: `${API_PREFIX}/app/study-plan`,
    LOOP: `${API_PREFIX}/learning-loop`,
    EVENTS: `${API_PREFIX}/learning-events`,
    INTELLIGENCE: `${API_PREFIX}/app/intelligence`,
  },

  // ========== 知识 ==========
  KNOWLEDGE: {
    BASE: `${API_PREFIX}/knowledge`,
    GRAPH: `${API_PREFIX}/knowledge-graph`,
    NOTES: `${API_PREFIX}/app/notes`,
    PERSONAL: `${API_PREFIX}/personal-knowledge`,
  },

  // ========== 考试 ==========
  EXAM: {
    BASE: `${API_PREFIX}/exams`,
    QUESTIONS: `${API_PREFIX}/questions`,
    USER_EXAMS: `${API_PREFIX}/user-exams`,
    ANSWERS: `${API_PREFIX}/user-answers`,
  },

  // ========== 课程 ==========
  COURSE: {
    BASE: `${API_PREFIX}/course`,
  },

  // ========== Agent ==========
  AGENT: {
    BASE: `${API_PREFIX}/agent`,
    RUNTIME: `${API_PREFIX}/agent-runtime`,
    COLLABORATE: `${API_PREFIX}/agent-collaborate`,
    DECISIONS: `${API_PREFIX}/agent-decisions`,
  },

  // ========== RAG ==========
  RAG: {
    BASE: `${API_PREFIX}/rag`,
  },

  // ========== 导师 ==========
  TUTOR: {
    BASE: `${API_PREFIX}/tutor`,
    AI: `${API_PREFIX}/ai-tutor`,
    MESSAGE: `${API_PREFIX}/app/tutor/message`,
  },

  // ========== AI ==========
  AI: {
    CONFIG: `${API_PREFIX}/ai-config`,
    LOGS: `${API_PREFIX}/ai-logs`,
    EXPLAIN: `${API_PREFIX}/ai-explain`,
    LEARNING: `${API_PREFIX}/ai-learning`,
    SPARK_PROXY: `${API_PREFIX}/spark-proxy`,
  },

  // ========== 会员 ==========
  MEMBERSHIP: {
    BASE: `${API_PREFIX}/membership`,
  },

  // ========== 通知 ==========
  NOTIFICATION: {
    BASE: `${API_PREFIX}/notifications`,
    DAILY_DIGEST: `${API_PREFIX}/daily-digest`,
  },

  // ========== 教师端 ==========
  TEACHER: {
    BASE: `${API_PREFIX}/teacher`,
    STUDENT_PATHS: `${API_PREFIX}/student-paths`,
  },

  // ========== 管理端 ==========
  ADMIN: {
    BASE: `${API_PREFIX}/admin`,
    CONFIG: `${API_PREFIX}/config`,
  },

  // ========== 协作 ==========
  COLLABORATION: {
    COMPILER: `${API_PREFIX}/compiler`,
    CODE_REPO: `${API_PREFIX}/code-repo`,
    TEAM_CODE: `${API_PREFIX}/team-code`,
  },

  // ========== 多媒体 ==========
  MEDIA: {
    TTS: `${API_PREFIX}/tts`,
    VIRTUAL_HUMAN: `${API_PREFIX}/virtual-human`,
    XFYUN: `${API_PREFIX}/xfyun`,
  },

  // ========== 其他 ==========
  OBSIDIAN: `${API_PREFIX}/obsidian`,
  PAPER_SCAN: `${API_PREFIX}/paper-scan`,
  CONCEPT_CANVAS: `${API_PREFIX}/concept-canvas`,
  RESOURCES: `${API_PREFIX}/resources`,
  REPORT: `${API_PREFIX}/report`,
  ACCOUNT: `${API_PREFIX}/app/account`,
  HEALTH: `${API_PREFIX}/health`,

  // ========== 学习辅助 ==========
  METACOGNITIVE: `${API_PREFIX}/metacognitive`,
  RHYTHM: `${API_PREFIX}/rhythm`,
  EMOTION: `${API_PREFIX}/emotion`,
  CLOSED_LOOP: `${API_PREFIX}/closed-loop`,
  IOT: `${API_PREFIX}/iot`,
  EXPORT_REPORT: `${API_PREFIX}/export-report`,
};
