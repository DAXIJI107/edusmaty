/**
 * =============================================================================
 * 业务枚举常量
 * =============================================================================
 *
 * @file       src/constants/enums.js
 * @module     Constants/Enums
 * @description
 *   系统所有业务枚举值的统一定义。
 *   包括用户角色、账号状态、学习状态、题目类型等。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 新增模块
 *
 * =============================================================================
 */

/**
 * 用户角色枚举
 *
 * @enum {string}
 * @readonly
 */
const USER_ROLE = {
  /** 学生 */
  STUDENT: 'student',
  /** 教师 */
  TEACHER: 'teacher',
  /** 管理员 */
  ADMIN: 'admin',
};

/**
 * 账号状态枚举
 *
 * @enum {string}
 * @readonly
 */
const USER_STATUS = {
  /** 激活 */
  ACTIVE: 'active',
  /** 停用 */
  DISABLED: 'disabled',
  /** 待激活 */
  PENDING: 'pending',
};

/**
 * 学习路径状态枚举
 *
 * @enum {string}
 * @readonly
 */
const PATH_STATUS = {
  /** 未开始 */
  NOT_STARTED: 'not_started',
  /** 进行中 */
  IN_PROGRESS: 'in_progress',
  /** 已完成 */
  COMPLETED: 'completed',
  /** 已暂停 */
  PAUSED: 'paused',
};

/**
 * 题目类型枚举
 *
 * @enum {string}
 * @readonly
 */
const QUESTION_TYPE = {
  /** 单选题 */
  SINGLE_CHOICE: 'single_choice',
  /** 多选题 */
  MULTI_CHOICE: 'multi_choice',
  /** 判断题 */
  TRUE_FALSE: 'true_false',
  /** 填空题 */
  FILL_BLANK: 'fill_blank',
  /** 简答题 */
  SHORT_ANSWER: 'short_answer',
  /** 编程题 */
  CODING: 'coding',
};

/**
 * 难度等级枚举
 *
 * @enum {string}
 * @readonly
 */
const DIFFICULTY = {
  /** 简单 */
  EASY: 'easy',
  /** 中等 */
  MEDIUM: 'medium',
  /** 困难 */
  HARD: 'hard',
};

/**
 * LLM Provider 枚举
 *
 * @enum {string}
 * @readonly
 */
const LLM_PROVIDER = {
  /** 本地部署模型 */
  LOCAL: 'local',
  /** 讯飞星火 */
  SPARK: 'spark',
  /** Herdsman 本地模型管理 */
  HERDSMAN: 'herdsman',
};

/**
 * 通知类型枚举
 *
 * @enum {string}
 * @readonly
 */
const NOTIFICATION_TYPE = {
  /** 系统通知 */
  SYSTEM: 'system',
  /** 学习提醒 */
  LEARNING: 'learning',
  /** 每日摘要 */
  DAILY_DIGEST: 'daily_digest',
  /** 会员通知 */
  MEMBERSHIP: 'membership',
};

module.exports = {
  USER_ROLE,
  USER_STATUS,
  PATH_STATUS,
  QUESTION_TYPE,
  DIFFICULTY,
  LLM_PROVIDER,
  NOTIFICATION_TYPE,
};
