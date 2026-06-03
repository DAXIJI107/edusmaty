/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3306
 Source Schema         : edu_smart

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 25/04/2026 11:04:29
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for agent_actions
-- ----------------------------
DROP TABLE IF EXISTS `agent_actions`;
CREATE TABLE `agent_actions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '动作类型：BOOK_TUTOR, FORM_STUDY_GROUP, SCHEDULE_REVIEW, PURCHASE_COURSE',
  `params` json NULL COMMENT '动作参数',
  `result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '执行结果',
  `status` enum('pending','success','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of agent_actions
-- ----------------------------
INSERT INTO `agent_actions` VALUES (1, 1, 'BOOK_TUTOR', '{\"topic\": \"三角函数\"}', '预约成功', 'success', '2026-04-25 00:01:16');
INSERT INTO `agent_actions` VALUES (2, 50, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"导数\", \"积分\"]}', '已安排复习', 'success', '2026-04-25 00:01:16');
INSERT INTO `agent_actions` VALUES (3, 52, 'PURCHASE_COURSE', '{\"course\": \"线性代数\"}', '购买成功', 'success', '2026-04-25 00:01:16');
INSERT INTO `agent_actions` VALUES (4, 2, 'FORM_STUDY_GROUP', '{\"topic\": \"英语语法\"}', '已创建小组', 'success', '2026-04-25 00:01:16');
INSERT INTO `agent_actions` VALUES (5, 3, 'BOOK_TUTOR', '{\"topic\": \"化学平衡\"}', '预约成功', 'success', '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for agent_execution_logs
-- ----------------------------
DROP TABLE IF EXISTS `agent_execution_logs`;
CREATE TABLE `agent_execution_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `params` json NULL,
  `result` json NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'success',
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 34 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of agent_execution_logs
-- ----------------------------
INSERT INTO `agent_execution_logs` VALUES (1, 50, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/3/16 19:00:00\", \"success\": true, \"sessionId\": 1}', 'success', '2026-03-16 16:48:22');
INSERT INTO `agent_execution_logs` VALUES (2, 50, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-03-16 16:48:24');
INSERT INTO `agent_execution_logs` VALUES (3, 50, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-03-17T08:48:24.568Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-03-17T08:48:24.568Z\"}], \"success\": true}', 'success', '2026-03-16 16:48:24');
INSERT INTO `agent_execution_logs` VALUES (4, 50, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/3/16 19:00:00\", \"success\": true, \"sessionId\": 2}', 'success', '2026-03-16 17:11:10');
INSERT INTO `agent_execution_logs` VALUES (5, 50, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-03-17T09:11:11.660Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-03-17T09:11:11.660Z\"}], \"success\": true}', 'success', '2026-03-16 17:11:11');
INSERT INTO `agent_execution_logs` VALUES (6, 50, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-03-17T09:11:11.891Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-03-17T09:11:11.891Z\"}], \"success\": true}', 'success', '2026-03-16 17:11:11');
INSERT INTO `agent_execution_logs` VALUES (7, 50, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/3/16 19:00:00\", \"success\": true, \"sessionId\": 3}', 'success', '2026-03-16 17:11:18');
INSERT INTO `agent_execution_logs` VALUES (8, 50, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-03-16 17:11:19');
INSERT INTO `agent_execution_logs` VALUES (9, 50, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-03-16 17:11:19');
INSERT INTO `agent_execution_logs` VALUES (10, 50, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-03-17T09:11:19.891Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-03-17T09:11:19.891Z\"}], \"success\": true}', 'success', '2026-03-16 17:11:19');
INSERT INTO `agent_execution_logs` VALUES (11, 50, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/3/16 19:00:00\", \"success\": true, \"sessionId\": 4}', 'success', '2026-03-16 17:16:15');
INSERT INTO `agent_execution_logs` VALUES (12, 50, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/3/16 19:00:00\", \"success\": true, \"sessionId\": 5}', 'success', '2026-03-16 17:16:21');
INSERT INTO `agent_execution_logs` VALUES (13, 50, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-03-17T09:16:21.552Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-03-17T09:16:21.552Z\"}], \"success\": true}', 'success', '2026-03-16 17:16:21');
INSERT INTO `agent_execution_logs` VALUES (14, 50, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-03-16 17:16:22');
INSERT INTO `agent_execution_logs` VALUES (15, 50, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/3/16 19:00:00\", \"success\": true, \"sessionId\": 6}', 'success', '2026-03-16 17:18:07');
INSERT INTO `agent_execution_logs` VALUES (16, 50, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-03-16 17:18:07');
INSERT INTO `agent_execution_logs` VALUES (17, 50, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-03-17T09:18:08.304Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-03-17T09:18:08.304Z\"}], \"success\": true}', 'success', '2026-03-16 17:18:08');
INSERT INTO `agent_execution_logs` VALUES (18, 50, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/3/20 19:00:00\", \"success\": true, \"sessionId\": 7}', 'success', '2026-03-20 10:00:36');
INSERT INTO `agent_execution_logs` VALUES (19, 50, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/3/20 19:00:00\", \"success\": true, \"sessionId\": 8}', 'success', '2026-03-20 10:19:44');
INSERT INTO `agent_execution_logs` VALUES (20, 50, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-03-21T02:19:45.474Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-03-21T02:19:45.474Z\"}], \"success\": true}', 'success', '2026-03-20 10:19:45');
INSERT INTO `agent_execution_logs` VALUES (21, 50, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"已创建学习小组「微积分」，邀请已发送给 同学A, 同学B\", \"success\": true}', 'success', '2026-03-20 10:19:46');
INSERT INTO `agent_execution_logs` VALUES (22, 52, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/4/24 19:00:00\", \"success\": true, \"sessionId\": 9}', 'success', '2026-04-24 00:20:03');
INSERT INTO `agent_execution_logs` VALUES (23, 52, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-04-24 00:20:04');
INSERT INTO `agent_execution_logs` VALUES (24, 52, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-04-24T16:20:05.091Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-04-24T16:20:05.091Z\"}], \"success\": true}', 'success', '2026-04-24 00:20:05');
INSERT INTO `agent_execution_logs` VALUES (25, 52, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/4/24 19:00:00\", \"success\": true, \"sessionId\": 10}', 'success', '2026-04-24 08:42:12');
INSERT INTO `agent_execution_logs` VALUES (26, 52, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-04-25T00:42:13.911Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-04-25T00:42:13.911Z\"}], \"success\": true}', 'success', '2026-04-24 08:42:13');
INSERT INTO `agent_execution_logs` VALUES (27, 52, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-04-24 08:42:14');
INSERT INTO `agent_execution_logs` VALUES (28, 52, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/4/24 19:00:00\", \"success\": true, \"sessionId\": 11}', 'success', '2026-04-24 23:56:25');
INSERT INTO `agent_execution_logs` VALUES (29, 52, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-04-24 23:56:26');
INSERT INTO `agent_execution_logs` VALUES (30, 52, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-04-25T15:56:26.657Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-04-25T15:56:26.657Z\"}], \"success\": true}', 'success', '2026-04-24 23:56:26');
INSERT INTO `agent_execution_logs` VALUES (31, 52, 'BOOK_TUTOR', '{\"topic\": \"导数\"}', '{\"message\": \"已为您预约「导数」辅导，时间：2026/4/25 19:00:00\", \"success\": true, \"sessionId\": 14}', 'success', '2026-04-25 00:01:55');
INSERT INTO `agent_execution_logs` VALUES (32, 52, 'FORM_STUDY_GROUP', '{\"peers\": [\"同学A\", \"同学B\"], \"topic\": \"微积分\"}', '{\"message\": \"学习小组创建成功（模拟）\", \"success\": true}', 'success', '2026-04-25 00:01:55');
INSERT INTO `agent_execution_logs` VALUES (33, 52, 'SCHEDULE_REVIEW', '{\"knowledgePoints\": [\"函数\", \"极限\"]}', '{\"message\": \"已为您安排2个知识点的复习计划\", \"reviews\": [{\"point\": \"函数\", \"reviewDate\": \"2026-04-25T16:01:56.212Z\"}, {\"point\": \"极限\", \"reviewDate\": \"2026-04-25T16:01:56.212Z\"}], \"success\": true}', 'success', '2026-04-25 00:01:56');

-- ----------------------------
-- Table structure for agent_permissions
-- ----------------------------
DROP TABLE IF EXISTS `agent_permissions`;
CREATE TABLE `agent_permissions`  (
  `user_id` int NOT NULL,
  `allow_auto_tutor` tinyint(1) NULL DEFAULT 1,
  `allow_auto_group` tinyint(1) NULL DEFAULT 1,
  `allow_auto_review` tinyint(1) NULL DEFAULT 1,
  `allow_auto_purchase` tinyint(1) NULL DEFAULT 0,
  `budget_limit` decimal(10, 2) NULL DEFAULT 0.00,
  `require_review_for_purchase` tinyint(1) NULL DEFAULT 1,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of agent_permissions
-- ----------------------------
INSERT INTO `agent_permissions` VALUES (50, 1, 1, 1, 1, 0.00, 1, '2026-03-16 17:11:16');
INSERT INTO `agent_permissions` VALUES (52, 1, 1, 1, 0, 0.00, 1, '2026-04-24 08:42:09');

-- ----------------------------
-- Table structure for ai_usage_logs
-- ----------------------------
DROP TABLE IF EXISTS `ai_usage_logs`;
CREATE TABLE `ai_usage_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action_type` enum('question_analysis','answer_explanation','knowledge_point','practice_suggestion','exam_strategy','error_analysis') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `usage_time` float NULL DEFAULT NULL COMMENT '使用时间（秒）',
  `tokens_used` int NULL DEFAULT NULL,
  `cost` decimal(10, 4) NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_action_type`(`action_type` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_ai_logs_user_time`(`user_id` ASC, `created_at` ASC) USING BTREE,
  CONSTRAINT `ai_usage_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_usage_logs
-- ----------------------------
INSERT INTO `ai_usage_logs` VALUES (1, 1, 'question_analysis', '分析第1题的解题思路', '这道题主要考察文言文读音，需要注意多音字和形近字的辨析...', 5.2, 150, NULL, '2025-12-07 19:05:06');
INSERT INTO `ai_usage_logs` VALUES (2, 1, 'answer_explanation', '解释选项C为什么正确', '选项C是正确的因为\"忏悔\"读chàn，\"纤维\"读xiān，\"酗酒\"读xù...', 3.8, 120, NULL, '2025-12-07 18:05:06');
INSERT INTO `ai_usage_logs` VALUES (3, 2, 'knowledge_point', '讲解三角函数的知识点', '三角函数包括正弦、余弦、正切等，它们在直角三角形中的定义是...', 7.5, 200, NULL, '2025-12-05 19:05:06');
INSERT INTO `ai_usage_logs` VALUES (4, 3, 'practice_suggestion', '提高英语阅读的建议', '建议每天阅读一篇英文文章，先快速浏览了解大意，再精读分析长难句...', 4.2, 180, NULL, '2025-12-04 19:05:06');
INSERT INTO `ai_usage_logs` VALUES (5, 4, 'exam_strategy', '物理考试答题技巧', '先做选择题，后做大题；注意单位换算；画图帮助理解题意...', 6.1, 220, NULL, '2025-12-06 19:05:06');

-- ----------------------------
-- Table structure for attention_logs
-- ----------------------------
DROP TABLE IF EXISTS `attention_logs`;
CREATE TABLE `attention_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `time_seconds` int NOT NULL COMMENT '观看时间点',
  `attention_status` enum('focusing','distracted','away') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of attention_logs
-- ----------------------------
INSERT INTO `attention_logs` VALUES (1, 1, 1, 120, 'focusing', '2026-04-24 23:36:47');
INSERT INTO `attention_logs` VALUES (2, 1, 1, 300, 'distracted', '2026-04-24 23:36:47');
INSERT INTO `attention_logs` VALUES (3, 1, 1, 480, 'focusing', '2026-04-24 23:36:47');
INSERT INTO `attention_logs` VALUES (4, 1, 1, 720, 'away', '2026-04-24 23:36:47');
INSERT INTO `attention_logs` VALUES (5, 1, 1, 900, 'focusing', '2026-04-24 23:36:47');
INSERT INTO `attention_logs` VALUES (6, 2, 1, 300, 'away', '2026-04-24 23:36:47');
INSERT INTO `attention_logs` VALUES (7, 2, 1, 720, 'distracted', '2026-04-24 23:36:47');
INSERT INTO `attention_logs` VALUES (8, 1, 1, 100, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (9, 1, 1, 250, 'distracted', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (10, 1, 1, 500, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (11, 2, 1, 120, 'away', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (12, 2, 1, 300, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (13, 2, 1, 720, 'distracted', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (14, 50, 2, 200, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (15, 50, 2, 400, 'distracted', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (16, 52, 3, 150, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (17, 52, 3, 350, 'away', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (18, 1, 4, 100, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (19, 2, 4, 500, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (20, 50, 5, 60, 'distracted', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (21, 50, 5, 200, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (22, 52, 6, 250, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (23, 52, 6, 400, 'distracted', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (24, 1, 7, 100, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (25, 2, 8, 300, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (26, 50, 9, 200, 'distracted', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (27, 52, 10, 300, 'away', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (28, 1, 11, 150, 'focusing', '2026-04-25 00:01:16');
INSERT INTO `attention_logs` VALUES (29, 2, 12, 80, 'focusing', '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for courses
-- ----------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of courses
-- ----------------------------
INSERT INTO `courses` VALUES (1, '高等数学(上)', '函数与极限、导数与微分、积分学', '2026-04-24 11:09:15');
INSERT INTO `courses` VALUES (2, '高等数学(下)', '多元函数微积分、级数、微分方程', '2026-04-24 11:09:15');
INSERT INTO `courses` VALUES (3, '大学物理(上)', '力学、热学、电磁学', '2026-04-24 11:09:15');
INSERT INTO `courses` VALUES (4, '线性代数', '矩阵论、线性空间、特征值理论', '2026-04-24 11:09:15');
INSERT INTO `courses` VALUES (5, '概率论与数理统计', '概率基础、随机变量、统计推断', '2026-04-24 11:09:15');
INSERT INTO `courses` VALUES (6, '初中数学衔接', '集合、函数初步、不等式', '2026-04-24 11:16:59');
INSERT INTO `courses` VALUES (7, '高中数学必修一', '集合与函数、基本初等函数', '2026-04-24 11:16:59');
INSERT INTO `courses` VALUES (8, '高中数学选修2-2', '导数及其应用、推理与证明', '2026-04-24 11:16:59');
INSERT INTO `courses` VALUES (9, '大学物理简明教程', '力学、热学、电磁学', '2026-04-24 11:16:59');
INSERT INTO `courses` VALUES (10, '化学选修4：化学反应原理', '化学反应方向、速率与平衡', '2026-04-24 11:16:59');
INSERT INTO `courses` VALUES (11, '生物必修2：遗传与进化', '遗传规律、基因表达与突变', '2026-04-24 11:16:59');
INSERT INTO `courses` VALUES (12, 'Python入门到实战', '变量、循环、项目实战', '2026-04-24 11:16:59');

-- ----------------------------
-- Table structure for device_operation_logs
-- ----------------------------
DROP TABLE IF EXISTS `device_operation_logs`;
CREATE TABLE `device_operation_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `operation_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作名称，如extrude, read_temp',
  `parameters` json NULL COMMENT '操作参数',
  `start_time` datetime NULL DEFAULT NULL,
  `end_time` datetime NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of device_operation_logs
-- ----------------------------
INSERT INTO `device_operation_logs` VALUES (1, 'printer-001', 'print', '{\"model\": \"cube\"}', '2026-04-24 00:01:16', '2026-04-25 00:01:16', 1, '2026-04-25 00:01:16');
INSERT INTO `device_operation_logs` VALUES (2, 'arduino-101', 'read_temp', '{}', '2026-04-23 00:01:16', '2026-04-25 00:01:16', 50, '2026-04-25 00:01:16');
INSERT INTO `device_operation_logs` VALUES (3, 'sensor-temp', 'read_temp', '{\"unit\": \"celsius\"}', '2026-04-22 00:01:16', '2026-04-25 00:01:16', 2, '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for devices
-- ----------------------------
DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `device_type` enum('3d_printer','arduino','sensor','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` enum('online','offline','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'offline',
  `user_id` int NOT NULL COMMENT '所属用户ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `device_id`(`device_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of devices
-- ----------------------------
INSERT INTO `devices` VALUES (1, 'printer-001', '3d_printer', '3D打印机一号', 'online', 1, '2026-04-25 00:01:16', '2026-04-25 00:01:16');
INSERT INTO `devices` VALUES (2, 'arduino-101', 'arduino', 'Arduino套件', 'online', 50, '2026-04-25 00:01:16', '2026-04-25 00:01:16');
INSERT INTO `devices` VALUES (3, 'sensor-temp', 'sensor', '温度传感器', 'offline', 2, '2026-04-25 00:01:16', '2026-04-25 00:01:16');
INSERT INTO `devices` VALUES (4, 'cam-ai', 'other', 'AI摄像头', 'online', 52, '2026-04-25 00:01:16', '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for emotion_logs
-- ----------------------------
DROP TABLE IF EXISTS `emotion_logs`;
CREATE TABLE `emotion_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `emotion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `confidence` float NULL DEFAULT NULL,
  `text` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `response_time` int NULL DEFAULT NULL,
  `error_count` int NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 65 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of emotion_logs
-- ----------------------------
INSERT INTO `emotion_logs` VALUES (1, 50, NULL, 'happy', NULL, NULL, NULL, NULL, '2026-03-15 16:50:18');
INSERT INTO `emotion_logs` VALUES (2, 50, NULL, 'frustrated', NULL, NULL, NULL, NULL, '2026-03-14 16:50:18');
INSERT INTO `emotion_logs` VALUES (3, 50, NULL, 'neutral', NULL, NULL, NULL, NULL, '2026-03-13 16:50:18');
INSERT INTO `emotion_logs` VALUES (4, 50, NULL, 'distracted', NULL, NULL, NULL, NULL, '2026-03-12 16:50:18');
INSERT INTO `emotion_logs` VALUES (5, 50, NULL, 'happy', NULL, NULL, NULL, NULL, '2026-03-11 16:50:18');
INSERT INTO `emotion_logs` VALUES (6, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-03-20 10:17:15');
INSERT INTO `emotion_logs` VALUES (7, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-03-20 10:17:18');
INSERT INTO `emotion_logs` VALUES (8, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-03-20 10:17:19');
INSERT INTO `emotion_logs` VALUES (9, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-03-20 10:17:19');
INSERT INTO `emotion_logs` VALUES (10, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-03-20 10:17:19');
INSERT INTO `emotion_logs` VALUES (11, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-03-20 10:17:19');
INSERT INTO `emotion_logs` VALUES (12, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-03-20 10:17:19');
INSERT INTO `emotion_logs` VALUES (13, 50, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-03-25 11:54:03');
INSERT INTO `emotion_logs` VALUES (14, 50, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-03-25 11:54:03');
INSERT INTO `emotion_logs` VALUES (15, 50, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-03-25 11:54:06');
INSERT INTO `emotion_logs` VALUES (16, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-03-25 11:55:01');
INSERT INTO `emotion_logs` VALUES (17, 50, 'unknown', 'neutral', 0.5, '牛顿第二定律怎么用', 0, 0, '2026-03-26 09:37:49');
INSERT INTO `emotion_logs` VALUES (18, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-15 13:49:55');
INSERT INTO `emotion_logs` VALUES (19, 50, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-04-15 13:49:57');
INSERT INTO `emotion_logs` VALUES (20, 50, 'unknown', 'frustrated', 0.8, '我不懂极限', 0, 0, '2026-04-15 13:50:00');
INSERT INTO `emotion_logs` VALUES (21, 50, 'unknown', 'neutral', 0.5, '牛顿第二定律怎么用', 0, 0, '2026-04-15 13:50:03');
INSERT INTO `emotion_logs` VALUES (22, 50, 'unknown', 'frustrated', 0.8, '我不懂极限', 0, 0, '2026-04-15 13:50:07');
INSERT INTO `emotion_logs` VALUES (23, 50, 'unknown', 'frustrated', 0.8, '我不懂极限', 0, 0, '2026-04-15 13:50:07');
INSERT INTO `emotion_logs` VALUES (24, 50, 'unknown', 'frustrated', 0.8, '我不懂极限', 0, 0, '2026-04-15 13:50:07');
INSERT INTO `emotion_logs` VALUES (25, 50, 'unknown', 'frustrated', 0.8, '我不懂极限', 0, 0, '2026-04-15 13:50:08');
INSERT INTO `emotion_logs` VALUES (26, 50, 'unknown', 'frustrated', 0.8, '我不懂极限', 0, 0, '2026-04-15 13:50:08');
INSERT INTO `emotion_logs` VALUES (27, 50, 'unknown', 'frustrated', 0.8, '我不懂极限', 0, 0, '2026-04-15 13:50:08');
INSERT INTO `emotion_logs` VALUES (28, 50, 'unknown', 'frustrated', 0.8, '我不懂极限', 0, 0, '2026-04-15 13:50:08');
INSERT INTO `emotion_logs` VALUES (29, 50, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-04-15 13:50:09');
INSERT INTO `emotion_logs` VALUES (30, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-15 13:50:11');
INSERT INTO `emotion_logs` VALUES (31, 50, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-15 13:50:16');
INSERT INTO `emotion_logs` VALUES (32, 50, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-04-15 13:50:22');
INSERT INTO `emotion_logs` VALUES (33, 52, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-04-23 13:35:53');
INSERT INTO `emotion_logs` VALUES (34, 52, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-04-23 23:28:04');
INSERT INTO `emotion_logs` VALUES (35, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-23 23:35:11');
INSERT INTO `emotion_logs` VALUES (36, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-23 23:35:44');
INSERT INTO `emotion_logs` VALUES (37, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-23 23:42:58');
INSERT INTO `emotion_logs` VALUES (38, 52, 'unknown', 'neutral', 0.5, '给我生成一篇关于李白的诗词', 0, 0, '2026-04-23 23:43:54');
INSERT INTO `emotion_logs` VALUES (39, 52, 'unknown', 'neutral', 0.5, '蜀道难', 0, 0, '2026-04-23 23:44:15');
INSERT INTO `emotion_logs` VALUES (40, 52, 'unknown', 'neutral', 0.5, '直接生成诗词', 0, 0, '2026-04-23 23:44:34');
INSERT INTO `emotion_logs` VALUES (41, 52, 'unknown', 'neutral', 0.5, '给我生成完整的《蜀道难》', 0, 0, '2026-04-23 23:45:22');
INSERT INTO `emotion_logs` VALUES (42, 52, 'unknown', 'neutral', 0.5, '直接生成，不要废话了', 0, 0, '2026-04-23 23:45:52');
INSERT INTO `emotion_logs` VALUES (43, 52, 'unknown', 'neutral', 0.5, '我让你直接生成蜀道难我要背', 0, 0, '2026-04-23 23:46:24');
INSERT INTO `emotion_logs` VALUES (44, 52, 'unknown', 'neutral', 0.5, '李白', 0, 0, '2026-04-23 23:46:45');
INSERT INTO `emotion_logs` VALUES (45, 52, 'unknown', 'neutral', 0.5, '现在什么都不要问我，直接生成完整的李白的蜀道难', 0, 0, '2026-04-23 23:47:48');
INSERT INTO `emotion_logs` VALUES (46, 52, 'unknown', 'neutral', 0.5, '？', 0, 0, '2026-04-23 23:48:04');
INSERT INTO `emotion_logs` VALUES (47, 52, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-04-24 00:03:59');
INSERT INTO `emotion_logs` VALUES (48, 52, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-04-24 00:04:43');
INSERT INTO `emotion_logs` VALUES (49, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-24 00:09:25');
INSERT INTO `emotion_logs` VALUES (50, 52, 'unknown', 'neutral', 0.5, '静夜思', 0, 0, '2026-04-24 00:09:54');
INSERT INTO `emotion_logs` VALUES (51, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-24 00:13:53');
INSERT INTO `emotion_logs` VALUES (52, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-24 08:33:35');
INSERT INTO `emotion_logs` VALUES (53, 52, 'unknown', 'neutral', 0.5, '函数的定义', 0, 0, '2026-04-24 08:33:59');
INSERT INTO `emotion_logs` VALUES (54, 52, 'unknown', 'frustrated', 0.8, '不会', 0, 0, '2026-04-24 08:34:38');
INSERT INTO `emotion_logs` VALUES (55, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-24 11:47:24');
INSERT INTO `emotion_logs` VALUES (56, 52, 'unknown', 'frustrated', 0.8, '我不懂导数', 0, 0, '2026-04-24 14:09:08');
INSERT INTO `emotion_logs` VALUES (57, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-24 16:23:34');
INSERT INTO `emotion_logs` VALUES (58, 52, 'unknown', 'frustrated', 0.8, '我不懂函数', 0, 0, '2026-04-24 20:59:17');
INSERT INTO `emotion_logs` VALUES (59, 52, 'unknown', 'neutral', 0.5, '李白的蜀道难', 0, 0, '2026-04-24 20:59:36');
INSERT INTO `emotion_logs` VALUES (60, 52, 'unknown', 'neutral', 0.5, '直接生成蜀道难全文', 0, 0, '2026-04-24 21:00:13');
INSERT INTO `emotion_logs` VALUES (61, 1, 'sess_new1', 'frustrated', 0.7, '不懂极限', 1500, 2, '2026-04-25 00:01:16');
INSERT INTO `emotion_logs` VALUES (62, 2, 'sess_new2', 'happy', 0.8, '完成练习', 500, 0, '2026-04-25 00:01:16');
INSERT INTO `emotion_logs` VALUES (63, 50, 'sess_new3', 'confused', 0.6, '？', 200, 1, '2026-04-25 00:01:16');
INSERT INTO `emotion_logs` VALUES (64, 52, 'sess_new4', 'neutral', 0.5, '开始学习', 300, 0, '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for exam_records
-- ----------------------------
DROP TABLE IF EXISTS `exam_records`;
CREATE TABLE `exam_records`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `exam_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `submit_time` datetime NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'in_progress',
  `score` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `exam_id`(`exam_id` ASC) USING BTREE,
  CONSTRAINT `exam_records_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 67 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of exam_records
-- ----------------------------
INSERT INTO `exam_records` VALUES (1, 1, 1, '2025-12-29 14:26:17', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (2, 2, 2, '2025-12-29 14:26:17', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (3, 1, 3, '2025-12-29 14:26:17', NULL, 'submitted', 0);
INSERT INTO `exam_records` VALUES (4, 3, 1, '2025-12-29 14:26:17', NULL, 'submitted', 0);
INSERT INTO `exam_records` VALUES (5, 50, 1, '2025-12-29 14:26:37', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (6, 50, 1, '2025-12-29 14:26:39', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (7, 50, 2, '2025-12-29 14:26:41', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (8, 50, 2, '2025-12-29 14:26:41', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (9, 50, 2, '2025-12-29 14:26:41', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (10, 50, 2, '2025-12-29 14:26:41', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (11, 50, 2, '2025-12-29 14:26:41', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (12, 50, 2, '2025-12-29 14:26:41', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (13, 50, 1, '2025-12-29 14:27:25', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (14, 50, 1, '2025-12-29 14:27:25', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (15, 50, 1, '2025-12-29 14:27:26', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (16, 50, 1, '2025-12-29 14:27:29', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (17, 50, 1, '2025-12-29 14:27:29', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (18, 50, 4, '2025-12-29 14:27:30', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (19, 50, 4, '2025-12-29 14:27:31', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (20, 50, 1, '2025-12-29 14:29:34', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (21, 50, 1, '2025-12-29 14:29:34', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (22, 50, 1, '2025-12-29 14:29:34', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (23, 50, 1, '2025-12-29 14:29:35', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (24, 50, 1, '2025-12-29 14:32:50', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (25, 50, 1, '2025-12-29 14:32:50', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (26, 50, 1, '2025-12-29 14:32:50', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (27, 50, 1, '2025-12-29 14:33:22', '2025-12-29 14:33:35', 'submitted', 0);
INSERT INTO `exam_records` VALUES (28, 50, 1, '2025-12-29 14:33:37', '2025-12-29 14:33:57', 'submitted', 10);
INSERT INTO `exam_records` VALUES (29, 50, 1, '2025-12-29 14:34:00', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (30, 50, 1, '2025-12-29 15:12:53', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (31, 50, 1, '2025-12-29 15:12:56', '2025-12-29 15:12:58', 'submitted', 0);
INSERT INTO `exam_records` VALUES (32, 50, 2, '2025-12-29 15:13:03', '2025-12-29 15:13:06', 'submitted', 0);
INSERT INTO `exam_records` VALUES (33, 50, 3, '2025-12-30 11:09:27', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (34, 50, 3, '2025-12-30 11:09:27', '2025-12-30 11:09:32', 'submitted', 10);
INSERT INTO `exam_records` VALUES (35, 50, 3, '2025-12-30 11:09:41', '2025-12-30 11:09:51', 'submitted', 0);
INSERT INTO `exam_records` VALUES (36, 50, 1, '2026-03-12 10:29:31', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (37, 50, 1, '2026-03-12 10:29:31', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (38, 50, 1, '2026-03-12 10:29:31', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (39, 50, 1, '2026-03-12 10:29:31', '2026-03-12 10:29:42', 'submitted', 0);
INSERT INTO `exam_records` VALUES (40, 51, 3, '2026-03-12 11:08:25', '2026-03-12 11:09:24', 'submitted', 0);
INSERT INTO `exam_records` VALUES (41, 51, 5, '2026-03-12 11:13:31', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (42, 50, 4, '2026-03-16 13:30:07', '2026-03-16 13:30:17', 'submitted', 0);
INSERT INTO `exam_records` VALUES (43, 50, 1, '2026-03-16 15:51:47', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (44, 50, 1, '2026-03-16 15:51:47', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (45, 50, 1, '2026-03-16 17:05:30', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (46, 50, 1, '2026-03-16 17:05:32', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (47, 50, 2, '2026-03-16 17:05:35', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (48, 50, 2, '2026-03-16 17:05:36', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (49, 50, 2, '2026-03-16 17:05:36', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (50, 50, 4, '2026-03-16 17:05:38', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (51, 50, 4, '2026-03-16 17:05:38', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (52, 50, 4, '2026-03-16 17:05:39', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (53, 50, 1, '2026-04-15 13:50:37', '2026-04-15 13:50:40', 'submitted', 0);
INSERT INTO `exam_records` VALUES (54, 52, 1, '2026-04-24 00:16:02', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (55, 1, 11, '2026-04-22 10:00:00', '2026-04-22 11:40:00', 'submitted', 87);
INSERT INTO `exam_records` VALUES (56, 1, 15, '2026-04-21 14:00:00', '2026-04-21 14:45:00', 'submitted', 92);
INSERT INTO `exam_records` VALUES (57, 50, 12, '2026-04-22 14:30:00', '2026-04-22 15:30:00', 'submitted', 75);
INSERT INTO `exam_records` VALUES (58, 50, 16, '2026-04-22 16:00:00', '2026-04-22 16:45:00', 'submitted', 82);
INSERT INTO `exam_records` VALUES (59, 52, 11, '2026-04-23 09:00:00', '2026-04-23 10:30:00', 'submitted', 68);
INSERT INTO `exam_records` VALUES (60, 52, 14, '2026-04-23 11:00:00', '2026-04-23 11:55:00', 'submitted', 78);
INSERT INTO `exam_records` VALUES (61, 2, 18, '2026-04-20 14:00:00', '2026-04-20 16:00:00', 'submitted', 95);
INSERT INTO `exam_records` VALUES (62, 4, 13, '2026-04-21 08:00:00', '2026-04-21 09:30:00', 'submitted', 81);
INSERT INTO `exam_records` VALUES (63, 52, 1, '2026-04-25 00:02:07', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (64, 52, 1, '2026-04-25 00:02:08', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (65, 52, 1, '2026-04-25 00:02:09', NULL, 'in_progress', 0);
INSERT INTO `exam_records` VALUES (66, 52, 1, '2026-04-25 00:02:10', NULL, 'in_progress', 0);

-- ----------------------------
-- Table structure for exams
-- ----------------------------
DROP TABLE IF EXISTS `exams`;
CREATE TABLE `exams`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `difficulty` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `duration` int NOT NULL DEFAULT 30,
  `is_publish` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of exams
-- ----------------------------
INSERT INTO `exams` VALUES (1, '数学期末考试', '中等', 60, 1);
INSERT INTO `exams` VALUES (2, '英语单元测试', '简单', 45, 1);
INSERT INTO `exams` VALUES (3, '物理竞赛', '困难', 90, 1);
INSERT INTO `exams` VALUES (4, '化学实验考试', '中等', 60, 1);
INSERT INTO `exams` VALUES (5, '历史知识竞赛', '简单', 30, 1);
INSERT INTO `exams` VALUES (6, '高等数学期中测试', '中等', 90, 1);
INSERT INTO `exams` VALUES (7, '线性代数期末', '中等', 120, 1);
INSERT INTO `exams` VALUES (8, '大学物理竞赛模拟', '困难', 150, 1);
INSERT INTO `exams` VALUES (9, '英语综合能力测验', '简单', 60, 1);
INSERT INTO `exams` VALUES (10, '化学专题练习', '中等', 45, 1);
INSERT INTO `exams` VALUES (11, '高中数学必修一期末', '中等', 120, 1);
INSERT INTO `exams` VALUES (12, '物理必修一期末', '中等', 90, 1);
INSERT INTO `exams` VALUES (13, '化学必修一综合', '中等', 90, 1);
INSERT INTO `exams` VALUES (14, '生物必修二单元测验', '简单', 60, 1);
INSERT INTO `exams` VALUES (15, '英语时态专项练习', '简单', 45, 1);
INSERT INTO `exams` VALUES (16, 'Python基础测验', '简单', 45, 1);
INSERT INTO `exams` VALUES (17, '导数综合练习', '困难', 60, 1);
INSERT INTO `exams` VALUES (18, '线性代数进阶测试', '困难', 120, 1);
INSERT INTO `exams` VALUES (19, '大学物理·电磁学', '困难', 150, 1);
INSERT INTO `exams` VALUES (20, '数据结构与算法', '中等', 90, 1);

-- ----------------------------
-- Table structure for hardware_operations
-- ----------------------------
DROP TABLE IF EXISTS `hardware_operations`;
CREATE TABLE `hardware_operations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `device_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备类型',
  `operation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作描述',
  `knowledge_nodes` json NULL COMMENT '映射的知识点列表',
  `theory_recommendations` json NULL COMMENT '推荐的理论内容',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_device_id`(`device_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hardware_operations
-- ----------------------------
INSERT INTO `hardware_operations` VALUES (1, 1, 'printer-001', '3d_printer', 'print cube', '[\"力学基础\"]', '[\"牛顿运动定律\"]', '2026-04-25 00:01:16');
INSERT INTO `hardware_operations` VALUES (2, 50, 'arduino-101', 'arduino', 'read_temp', '[\"热力学\"]', '[\"温度传感器原理\"]', '2026-04-25 00:01:16');
INSERT INTO `hardware_operations` VALUES (3, 2, 'sensor-temp', 'sensor', 'read_temp', '[\"热力学\"]', '[\"误差分析\"]', '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for interaction_logs
-- ----------------------------
DROP TABLE IF EXISTS `interaction_logs`;
CREATE TABLE `interaction_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '会话ID',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('self_explain','question','answer','reflect','hint') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `metadata` json NULL COMMENT '额外数据如响应时间等',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 33 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of interaction_logs
-- ----------------------------
INSERT INTO `interaction_logs` VALUES (1, 50, 'unknown', '2026-03-20 10:17:15', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (2, 50, 'unknown', '2026-03-20 10:17:18', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (3, 50, 'unknown', '2026-03-20 10:17:19', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (4, 50, 'unknown', '2026-03-20 10:17:19', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (5, 50, 'unknown', '2026-03-20 10:17:19', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (6, 50, 'unknown', '2026-03-20 10:17:19', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (7, 50, 'unknown', '2026-03-20 10:17:19', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (8, 50, 'unknown', '2026-03-25 11:54:03', 'question', '我不懂导数', NULL);
INSERT INTO `interaction_logs` VALUES (9, 50, 'unknown', '2026-03-25 11:54:03', 'question', '我不懂导数', NULL);
INSERT INTO `interaction_logs` VALUES (10, 50, 'unknown', '2026-03-25 11:54:06', 'question', '我不懂导数', NULL);
INSERT INTO `interaction_logs` VALUES (11, 50, 'unknown', '2026-03-25 11:55:01', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (12, 50, 'unknown', '2026-03-26 09:37:49', 'question', '牛顿第二定律怎么用', NULL);
INSERT INTO `interaction_logs` VALUES (13, 50, 'unknown', '2026-04-15 13:49:55', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (14, 50, 'unknown', '2026-04-15 13:49:57', 'question', '我不懂导数', NULL);
INSERT INTO `interaction_logs` VALUES (15, 50, 'unknown', '2026-04-15 13:50:00', 'question', '我不懂极限', NULL);
INSERT INTO `interaction_logs` VALUES (16, 50, 'unknown', '2026-04-15 13:50:03', 'question', '牛顿第二定律怎么用', NULL);
INSERT INTO `interaction_logs` VALUES (17, 50, 'unknown', '2026-04-15 13:50:07', 'question', '我不懂极限', NULL);
INSERT INTO `interaction_logs` VALUES (18, 50, 'unknown', '2026-04-15 13:50:07', 'question', '我不懂极限', NULL);
INSERT INTO `interaction_logs` VALUES (19, 50, 'unknown', '2026-04-15 13:50:07', 'question', '我不懂极限', NULL);
INSERT INTO `interaction_logs` VALUES (20, 50, 'unknown', '2026-04-15 13:50:08', 'question', '我不懂极限', NULL);
INSERT INTO `interaction_logs` VALUES (21, 50, 'unknown', '2026-04-15 13:50:08', 'question', '我不懂极限', NULL);
INSERT INTO `interaction_logs` VALUES (22, 50, 'unknown', '2026-04-15 13:50:08', 'question', '我不懂极限', NULL);
INSERT INTO `interaction_logs` VALUES (23, 50, 'unknown', '2026-04-15 13:50:08', 'question', '我不懂极限', NULL);
INSERT INTO `interaction_logs` VALUES (24, 50, 'unknown', '2026-04-15 13:50:09', 'question', '我不懂导数', NULL);
INSERT INTO `interaction_logs` VALUES (25, 50, 'unknown', '2026-04-15 13:50:11', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (26, 50, 'unknown', '2026-04-15 13:50:16', 'question', '我不懂函数', NULL);
INSERT INTO `interaction_logs` VALUES (27, 50, 'unknown', '2026-04-15 13:50:22', 'question', '我不懂导数', NULL);
INSERT INTO `interaction_logs` VALUES (28, 52, 'unknown', '2026-04-23 13:35:53', 'question', '我不懂导数', NULL);
INSERT INTO `interaction_logs` VALUES (29, 1, 'sess_inter1', '2026-04-25 00:01:16', 'question', '如何求导？', NULL);
INSERT INTO `interaction_logs` VALUES (30, 1, 'sess_inter1', '2026-04-25 00:01:16', 'answer', '导数是...', NULL);
INSERT INTO `interaction_logs` VALUES (31, 50, 'sess_inter2', '2026-04-25 00:01:16', 'self_explain', '我认为积分就是...', NULL);
INSERT INTO `interaction_logs` VALUES (32, 52, 'sess_inter3', '2026-04-25 00:01:16', 'reflect', '这次学习我学会了极限', NULL);

-- ----------------------------
-- Table structure for knowledge_nodes
-- ----------------------------
DROP TABLE IF EXISTS `knowledge_nodes`;
CREATE TABLE `knowledge_nodes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '知识点名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '知识点描述',
  `difficulty` enum('easy','medium','hard') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'medium',
  `type` enum('theory','practice') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'theory',
  `content_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '关联的学习资源链接',
  `bvid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'B站视频BV号',
  `video_platform` enum('bilibili','local','youtube') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'bilibili',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 85 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of knowledge_nodes
-- ----------------------------
INSERT INTO `knowledge_nodes` VALUES (1, '函数的概念', '理解函数定义、定义域、值域、表示方法', 'easy', 'theory', NULL, 'BV1Se4y167hs', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (2, '函数的极限', '极限的定义、左极限右极限、无穷小与无穷大', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (3, '导数的定义', '导数的概念、几何意义、可导与连续的关系', 'medium', 'theory', NULL, 'BV1kx4y1N7xx', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (4, '基本求导公式', '常数、幂函数、指数函数、对数函数、三角函数的导数', 'easy', 'practice', NULL, 'BV1wm421378f', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (5, '三角函数公式变换', '和差化积、积化和差、倍角公式、半角公式', 'medium', 'practice', NULL, 'BV1ke411m75J', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (6, '复合函数求导', '链式法则及应用', 'medium', 'practice', NULL, 'BV1UW4y1j7uL', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (7, '隐函数求导', '隐函数及参数方程求导', 'hard', 'practice', NULL, 'BV1dP4y1g7yi', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (8, '不定积分的概念', '原函数、不定积分的定义与性质', 'medium', 'theory', NULL, 'BV1yE411o7NH', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (9, '基本积分法', '直接积分法、凑微分法', 'easy', 'practice', NULL, 'BV1hbr6Y6EAQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (10, '换元积分法', '第一类换元法、第二类换元法', 'hard', 'practice', NULL, 'BV1AVU5Y3Eda', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (11, '定积分的概念', '分割、近似、求和、取极限', 'medium', 'theory', NULL, 'BV1nP4y1s7DM', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (12, '牛顿-莱布尼茨公式', '微积分基本公式的应用', 'medium', 'practice', NULL, 'BV1GQcFzrE2d', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (13, '数列的极限', '数列极限定义与收敛性', 'medium', 'theory', NULL, 'BV1fT411m7dN', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (14, '无穷级数', '级数收敛与发散、幂级数', 'hard', 'theory', NULL, 'BV13w4m1S7Rx', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (15, '空间解析几何', '向量代数、空间曲面与曲线', 'hard', 'theory', NULL, 'BV1EW411H7Vj', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (16, '多元函数微分', '偏导数、全微分、方向导数与梯度', 'hard', 'theory', NULL, 'BV1CMsNegECG', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (17, '重积分', '二重积分、三重积分的概念与计算', 'hard', 'practice', NULL, 'BV1EE411t7Vj', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (18, '曲线积分', '第一类曲线积分、第二类曲线积分', 'hard', 'practice', NULL, 'BV1UW4y1j7uL', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (19, '曲面积分', '第一类曲面积分、第二类曲面积分', 'hard', 'practice', NULL, 'BV1VB4y1u7wK', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (20, '概率论基础', '随机事件、概率的定义、条件概率', 'easy', 'theory', NULL, 'BV17G4y1T7FB', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (21, '线性代数', '矩阵、行列式、线性方程组', 'medium', 'theory', NULL, 'BV1oZ8cz4EyC', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (22, '力学基础', '牛顿定律、动量、能量', 'easy', 'theory', NULL, 'BV1kx411S7f3', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (23, '电磁学', '电场、磁场、电磁感应', 'medium', 'theory', NULL, 'BV1Wx41117zL', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (24, '光学', '几何光学、波动光学', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (25, '热力学', '热力学第一、第二定律', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (26, '现代物理', '相对论、量子物理基础', 'hard', 'theory', NULL, 'BV1kx411S7f3', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (27, '英语语法', '时态、语态、从句', 'easy', 'practice', NULL, 'BV1Qh4y1J7Uu', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (28, '英语词汇', '词根词缀、高频词汇', 'easy', 'practice', NULL, 'BV1Qh4y1J7Uu', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (29, '英语阅读理解', '快速阅读、推理判断', 'medium', 'theory', NULL, NULL, 'local');
INSERT INTO `knowledge_nodes` VALUES (30, '无机化学', '元素周期律、化学键', 'medium', 'theory', NULL, NULL, 'local');
INSERT INTO `knowledge_nodes` VALUES (31, '有机化学', '烃类、官能团反应', 'hard', 'theory', NULL, 'BV1aJ411W7Nx', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (32, '生物细胞学', '细胞结构、细胞分裂', 'easy', 'theory', NULL, NULL, 'local');
INSERT INTO `knowledge_nodes` VALUES (33, '遗传学', '基因分离定律、自由组合定律', 'medium', 'theory', NULL, 'BV1ex411y7Td', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (34, '生态学', '种群、群落、生态系统', 'easy', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (35, '实验操作', '常见仪器使用、误差分析', 'easy', 'practice', NULL, 'BV1Eb411u7Fw', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (36, '集合与逻辑', '集合的基本概念、交并补运算、命题与量词', 'easy', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (37, '不等式', '一元二次不等式、含绝对值不等式、基本不等式的应用', 'easy', 'practice', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (38, '数列', '等差数列与等比数列的通项与求和', 'easy', 'practice', NULL, 'BV1vx411z7Lk', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (39, '三角函数图像与性质', '正弦、余弦、正切函数的图像、周期性、单调性', 'medium', 'theory', NULL, 'BV1k5411Y7en', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (40, '平面向量', '向量的线性运算、数量积、坐标表示', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (41, '导数应用', '切线方程、函数的单调性与极值、最优化问题', 'hard', 'practice', NULL, 'BV1gJ411x7h7', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (42, '定积分的应用', '求面积、旋转体体积、物理应用', 'hard', 'practice', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (43, '微分方程初步', '可分离变量的微分方程、一阶线性微分方程', 'hard', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (44, '空间向量', '空间直角坐标系、向量的点乘与叉乘', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (45, '计数原理', '分类加法原理、分步乘法原理、排列组合', 'easy', 'practice', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (46, '概率分布', '二项分布、超几何分布、正态分布', 'medium', 'theory', NULL, 'BV1Zb411q7M7', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (47, '统计初步', '抽样方法、用样本估计总体、线性回归', 'easy', 'practice', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (48, '复数', '复数的概念、代数形式、几何意义', 'easy', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (49, '坐标系与参数方程', '极坐标与参数方程互换', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (50, '框图与算法', '程序框图、基本算法语句', 'easy', 'practice', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (51, '牛顿运动定律', '牛顿三大定律及其应用', 'easy', 'theory', NULL, 'BV1pd4y1w75r', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (52, '曲线运动与万有引力', '平抛运动、圆周运动、万有引力定律', 'medium', 'theory', NULL, 'BV1Wx41117zL', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (53, '机械能守恒', '功、功率、动能定理、机械能守恒定律', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (54, '动量守恒', '动量、冲量、动量守恒定律', 'medium', 'theory', NULL, 'BV1yx41117z9', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (55, '静电场', '电场强度、电势、电势差、电容器', 'medium', 'theory', NULL, 'BV1W44y1D7tW', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (56, '恒定电流', '欧姆定律、电阻定律、电功率、焦耳定律', 'easy', 'practice', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (57, '磁场', '安培力、洛伦兹力、带电粒子在磁场中的运动', 'hard', 'theory', NULL, 'BV1aW411R7rM', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (58, '电磁感应', '法拉第电磁感应定律、楞次定律、自感互感', 'hard', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (59, '交变电流', '正弦交流电、变压器、远距离输电', 'medium', 'practice', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (60, '原子物理', '氢原子光谱、能级跃迁、原子核', 'easy', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (61, '化学计量', '物质的量、阿伏伽德罗常数、摩尔质量', 'easy', 'practice', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (62, '离子反应', '电解质、离子方程式书写', 'easy', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (63, '氧化还原反应', '氧化剂、还原剂、电子转移', 'medium', 'theory', NULL, 'BV1aJ411W7Nx', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (64, '元素周期律', '原子结构与元素周期表', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (65, '化学键', '离子键、共价键、分子间作用力', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (66, '化学反应速率与化学平衡', '影响速率的因素、勒夏特列原理', 'hard', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (67, '水溶液中的离子平衡', '弱电解质电离、水的电离、盐类水解', 'hard', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (68, '有机化学基础', '烷烃、烯烃、苯及其同系物、官能团性质', 'hard', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (69, '生物细胞呼吸', '有氧呼吸、无氧呼吸的过程与场所', 'easy', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (70, '光合作用', '光反应与暗反应、C3/C4途径', 'medium', 'theory', NULL, 'BV1ex411y7Td', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (71, '细胞分裂', '有丝分裂、减数分裂的过程与意义', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (72, '遗传规律', '基因分离定律、自由组合定律、伴性遗传', 'hard', 'theory', NULL, 'BV1Ex411y7V3', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (73, 'DNA复制与表达', '转录、翻译、中心法则', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (74, '稳态与调节', '神经调节、体液调节、免疫调节', 'medium', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (75, '生态系统', '种群、群落、生态系统的结构与功能', 'easy', 'theory', NULL, 'BV1bu41157SQ', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (76, '英语语法·时态', '一般现在/过去/将来、完成时、进行时', 'easy', 'practice', NULL, 'BV1Qh4y1J7Uu', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (77, '英语语法·从句', '定语从句、名词性从句、状语从句', 'medium', 'theory', NULL, 'BV1Qh4y1J7Uu', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (78, '英语语法·虚拟语气', 'if虚拟、wish/should用法', 'hard', 'theory', NULL, 'BV1Qh4y1J7Uu', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (79, '英语词汇辨析', '易混淆词、短语动词', 'easy', 'practice', NULL, 'BV1Qh4y1J7Uu', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (80, '英语写作', '应用文、议论文、图表作文', 'medium', 'practice', NULL, 'BV1Qh4y1J7Uu', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (81, '程序设计·Python基础', '变量、数据类型、控制结构', 'easy', 'practice', NULL, 'BV1xs411Q799', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (82, '数据结构·链表', '单链表、双向链表的基本操作', 'medium', 'theory', NULL, 'BV1xs411Q799', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (83, '计算机网络', 'TCP/IP协议、HTTP、DNS', 'medium', 'theory', NULL, 'BV1c4411d7jb', 'bilibili');
INSERT INTO `knowledge_nodes` VALUES (84, '数据库基础', '关系模型、SQL查询', 'easy', 'practice', NULL, 'BV1xs411Q799', 'bilibili');

-- ----------------------------
-- Table structure for knowledges
-- ----------------------------
DROP TABLE IF EXISTS `knowledges`;
CREATE TABLE `knowledges`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `difficulty` enum('easy','medium','hard') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'medium',
  `mastery` int NULL DEFAULT 0 COMMENT '掌握度百分比',
  `bvid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT 'B站视频BV号',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 48 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of knowledges
-- ----------------------------
INSERT INTO `knowledges` VALUES (1, '函数与集合', '函数概念、定义域、值域、集合基本运算', 'easy', 20, 'BV1GJ411x7Fw', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (2, '极限的概念与计算', '数列极限、函数极限、两个重要极限', 'medium', 35, 'BV1Eb411u7Fw', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (3, '导数与微分', '导数定义、求导法则、高阶导数', 'medium', 40, 'BV1sJ411W7nE', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (4, '导数的应用', '单调性、极值、最值、凹凸性', 'medium', 0, 'BV1KJ411Y7Nx', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (6, '不定积分', '不定积分概念、基本积分表、第一类换元', 'hard', 0, 'BV1iJ411e7sH', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (8, '定积分', '定积分概念、微积分基本定理、定积分应用', 'hard', 0, 'BV1LE411v7N1', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (11, '空间解析几何', '向量、平面、直线、曲面方程', 'medium', 0, 'BV1sW411H7Xm', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (13, '数列极限及单调有界准则', '介绍数列极限的概念、单调有界准则及其在高等数学中的应用', 'medium', 35, 'BV1Eb411u7Fw', '2026-04-25 11:00:56');
INSERT INTO `knowledges` VALUES (16, '质点运动学', '位移、速度、加速度、匀变速运动', 'easy', 0, 'BV1VW411a7Bx', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (18, '功和能', '功、动能定理、机械能守恒', 'medium', 0, 'BV1cW411B7rJ', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (20, '电场强度', '库仑定律、电场强度、电场线', 'medium', 0, 'BV1rW411W7wW', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (21, '线性代数基础', '矩阵运算、行列式、逆矩阵', 'medium', 0, 'BV1ox411d7Pu', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (22, '牛顿运动定律', '牛顿三定律、受力分析、力学问题', 'medium', 0, 'BV1JW411V7nE', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (23, '电磁学基础', '电场、磁场、电磁感应', 'hard', 0, 'BV1JW411V7nE', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (24, '波动光学', '光的干涉、衍射、偏振', 'hard', 0, 'BV1hW411b7Qd', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (25, '热力学基础', '热力学第一定律、理想气体状态方程', 'medium', 0, 'BV1Rt411s7Pq', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (26, '近代物理', '相对论、量子物理基础', 'hard', 0, 'BV1vx411e7SB', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (27, '英语语法基础', '时态、语态、情态动词', 'easy', 0, 'BV1bW411H7Nx', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (28, '英语词汇与搭配', '常用词汇、短语、习惯用法', 'easy', 0, 'BV1Hs411n7Qk', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (29, '英语写作与表达', '段落结构、句型变换、书信写作', 'medium', 0, 'BV1SW411Y7rB', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (30, '化学基本概念', '元素周期律、化学键、化学反应类型', 'easy', 0, 'BV1DW411C7YN', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (31, '有机化学基础', '烃、官能团、同分异构', 'medium', 0, 'BV1dW411C7iN', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (33, '无机化学', '主族元素、过渡元素性质', 'medium', 0, 'BV1gW411c7Ad', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (35, '细胞生物学', '细胞结构、细胞代谢', 'medium', 0, 'BV1pE411k7tN', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (36, '遗传与进化', '孟德尔定律、DNA复制、自然选择', 'medium', 0, 'BV1iE411k7Gk', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (37, '分子生物学', '中心法则、基因表达调控', 'hard', 0, 'BV1QE411k7Vy', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (42, '初中英语语法', '基础时态、简单句', 'easy', 0, 'BV1B4411N7cG', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (43, '高中英语从句', '定语从句、名词性从句', 'medium', 0, 'BV1V4411N7Lw', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (44, '虚拟语气', 'if条件句、wish用法', 'medium', 0, 'BV1e4411N7Tp', '2026-04-25 10:52:55');
INSERT INTO `knowledges` VALUES (47, 'Python编程基础', '变量、数据类型、流程控制', 'easy', 0, 'BV1w4411q7MU', '2026-04-25 10:52:55');

-- ----------------------------
-- Table structure for learning_behavior_logs
-- ----------------------------
DROP TABLE IF EXISTS `learning_behavior_logs`;
CREATE TABLE `learning_behavior_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `behavior_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `start_time` datetime NULL DEFAULT NULL,
  `end_time` datetime NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of learning_behavior_logs
-- ----------------------------
INSERT INTO `learning_behavior_logs` VALUES (1, 1, 'video_watch', '2026-04-22 08:00:00', '2026-04-22 08:50:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (2, 1, 'quiz', '2026-04-22 09:00:00', '2026-04-22 09:45:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (3, 1, 'reading', '2026-04-22 10:00:00', '2026-04-22 10:30:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (4, 50, 'video_watch', '2026-04-22 14:00:00', '2026-04-22 14:35:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (5, 50, 'quiz', '2026-04-22 15:00:00', '2026-04-22 15:25:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (6, 52, 'reading', '2026-04-22 11:00:00', '2026-04-22 11:40:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (7, 52, 'practice', '2026-04-22 13:00:00', '2026-04-22 13:55:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (8, 2, 'video_watch', '2026-04-21 19:00:00', '2026-04-21 19:55:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (9, 4, 'quiz', '2026-04-21 20:00:00', '2026-04-21 20:30:00', '2026-04-24 11:16:59');
INSERT INTO `learning_behavior_logs` VALUES (10, 1, 'video_watch', '2026-04-23 00:01:16', '2026-04-23 00:41:16', '2026-04-25 00:01:16');
INSERT INTO `learning_behavior_logs` VALUES (11, 50, 'practice', '2026-04-24 00:01:16', '2026-04-24 00:26:16', '2026-04-25 00:01:16');
INSERT INTO `learning_behavior_logs` VALUES (12, 52, 'quiz', '2026-04-22 00:01:16', '2026-04-22 00:31:16', '2026-04-25 00:01:16');
INSERT INTO `learning_behavior_logs` VALUES (13, 2, 'reading', '2026-04-21 00:01:16', '2026-04-21 00:56:16', '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for metacognitive_scores
-- ----------------------------
DROP TABLE IF EXISTS `metacognitive_scores`;
CREATE TABLE `metacognitive_scores`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `score` tinyint UNSIGNED NOT NULL,
  `details` json NULL COMMENT '各维度得分',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of metacognitive_scores
-- ----------------------------
INSERT INTO `metacognitive_scores` VALUES (1, 1, 'sess_001', 78, '{\"reflect\": 1, \"self_explain\": 2, \"question_depth\": 12}', '2026-04-25 00:01:16');
INSERT INTO `metacognitive_scores` VALUES (2, 1, 'sess_002', 85, '{\"reflect\": 2, \"self_explain\": 3, \"question_depth\": 15}', '2026-04-25 00:01:16');
INSERT INTO `metacognitive_scores` VALUES (3, 2, 'sess_003', 65, '{\"reflect\": 0, \"self_explain\": 1, \"question_depth\": 8}', '2026-04-25 00:01:16');
INSERT INTO `metacognitive_scores` VALUES (4, 50, 'sess_004', 72, '{\"reflect\": 1, \"self_explain\": 2, \"question_depth\": 10}', '2026-04-25 00:01:16');
INSERT INTO `metacognitive_scores` VALUES (5, 52, 'sess_005', 80, '{\"reflect\": 1, \"self_explain\": 4, \"question_depth\": 14}', '2026-04-25 00:01:16');
INSERT INTO `metacognitive_scores` VALUES (6, 3, 'sess_006', 55, '{\"reflect\": 0, \"self_explain\": 1, \"question_depth\": 5}', '2026-04-25 00:01:16');
INSERT INTO `metacognitive_scores` VALUES (7, 4, 'sess_007', 90, '{\"reflect\": 2, \"self_explain\": 5, \"question_depth\": 20}', '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for missed_nodes
-- ----------------------------
DROP TABLE IF EXISTS `missed_nodes`;
CREATE TABLE `missed_nodes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `node_id` int NOT NULL,
  `course_id` int NOT NULL,
  `reviewed` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `node_id`(`node_id` ASC) USING BTREE,
  CONSTRAINT `missed_nodes_ibfk_1` FOREIGN KEY (`node_id`) REFERENCES `rhythm_nodes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of missed_nodes
-- ----------------------------
INSERT INTO `missed_nodes` VALUES (1, 1, 2, 1, 0, '2026-04-25 00:01:16');
INSERT INTO `missed_nodes` VALUES (2, 2, 3, 1, 0, '2026-04-25 00:01:16');
INSERT INTO `missed_nodes` VALUES (3, 50, 1, 2, 0, '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('system','exam','result','reminder') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'system',
  `is_read` tinyint(1) NULL DEFAULT 0,
  `related_id` int NULL DEFAULT NULL COMMENT '相关ID（如考试ID、成绩ID等）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_is_read`(`is_read` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notifications
-- ----------------------------
INSERT INTO `notifications` VALUES (1, 1, '考试完成通知', '您已成功完成\"高一语文期中考试\"，成绩：120分', 'result', 0, 1, '2025-12-07 19:05:06');
INSERT INTO `notifications` VALUES (2, 2, '考试提醒', '您有未完成的考试：\"古诗词鉴赏测试\"', 'reminder', 1, 2, '2025-12-06 19:05:06');
INSERT INTO `notifications` VALUES (3, 3, '系统通知', '系统升级完成，新增AI智能辅导功能', 'system', 0, NULL, '2025-12-04 19:05:06');
INSERT INTO `notifications` VALUES (4, 1, '成绩分析', '您的数学成绩有显著提升，继续保持！', 'exam', 0, 2, '2025-12-05 19:05:06');
INSERT INTO `notifications` VALUES (5, 4, '错题提醒', '您有5道错题需要复习', 'reminder', 1, NULL, '2025-12-06 19:05:06');

-- ----------------------------
-- Table structure for operation_knowledge_mapping
-- ----------------------------
DROP TABLE IF EXISTS `operation_knowledge_mapping`;
CREATE TABLE `operation_knowledge_mapping`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `operation_pattern` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作名称或正则',
  `knowledge_node_id` int NOT NULL COMMENT '关联的知识点ID',
  `weight` float NULL DEFAULT 1 COMMENT '关联权重',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of operation_knowledge_mapping
-- ----------------------------
INSERT INTO `operation_knowledge_mapping` VALUES (1, '3d_printer', 'print', 22, 1, '2026-04-24 23:54:11');
INSERT INTO `operation_knowledge_mapping` VALUES (2, 'arduino', 'read_temp', 25, 0.8, '2026-04-24 23:54:11');
INSERT INTO `operation_knowledge_mapping` VALUES (3, 'sensor', 'read_temp', 25, 0.8, '2026-04-24 23:54:11');
INSERT INTO `operation_knowledge_mapping` VALUES (4, '3d_printer', 'print', 22, 1, '2026-04-25 00:01:16');
INSERT INTO `operation_knowledge_mapping` VALUES (5, 'arduino', 'read_temp', 25, 0.8, '2026-04-25 00:01:16');
INSERT INTO `operation_knowledge_mapping` VALUES (6, 'sensor', 'read_temp', 25, 0.8, '2026-04-25 00:01:16');
INSERT INTO `operation_knowledge_mapping` VALUES (7, '3d_printer', 'extrude', 6, 0.7, '2026-04-25 00:01:16');
INSERT INTO `operation_knowledge_mapping` VALUES (8, 'arduino', 'led_blink', 1, 0.5, '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for prerequisites
-- ----------------------------
DROP TABLE IF EXISTS `prerequisites`;
CREATE TABLE `prerequisites`  (
  `node_id` int NOT NULL,
  `prereq_id` int NOT NULL,
  PRIMARY KEY (`node_id`, `prereq_id`) USING BTREE,
  INDEX `prereq_id`(`prereq_id` ASC) USING BTREE,
  CONSTRAINT `prerequisites_ibfk_1` FOREIGN KEY (`node_id`) REFERENCES `knowledge_nodes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `prerequisites_ibfk_2` FOREIGN KEY (`prereq_id`) REFERENCES `knowledge_nodes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of prerequisites
-- ----------------------------
INSERT INTO `prerequisites` VALUES (2, 1);
INSERT INTO `prerequisites` VALUES (3, 2);
INSERT INTO `prerequisites` VALUES (4, 3);
INSERT INTO `prerequisites` VALUES (6, 3);
INSERT INTO `prerequisites` VALUES (16, 3);
INSERT INTO `prerequisites` VALUES (5, 4);
INSERT INTO `prerequisites` VALUES (8, 4);
INSERT INTO `prerequisites` VALUES (7, 6);
INSERT INTO `prerequisites` VALUES (9, 8);
INSERT INTO `prerequisites` VALUES (10, 8);
INSERT INTO `prerequisites` VALUES (11, 8);
INSERT INTO `prerequisites` VALUES (12, 11);
INSERT INTO `prerequisites` VALUES (14, 13);
INSERT INTO `prerequisites` VALUES (17, 16);
INSERT INTO `prerequisites` VALUES (18, 17);
INSERT INTO `prerequisites` VALUES (19, 18);
INSERT INTO `prerequisites` VALUES (23, 22);
INSERT INTO `prerequisites` VALUES (26, 22);
INSERT INTO `prerequisites` VALUES (31, 30);
INSERT INTO `prerequisites` VALUES (33, 32);

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NULL DEFAULT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `options` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `score` int NOT NULL DEFAULT 5,
  `difficulty` enum('easy','medium','hard') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'medium',
  `subject` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'math' COMMENT '学科',
  `node_id` int NULL DEFAULT NULL COMMENT '关联知识点ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `exam_id`(`exam_id` ASC) USING BTREE,
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 90 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of questions
-- ----------------------------
INSERT INTO `questions` VALUES (1, 1, 'single', '函数 f(x)=1/x 的定义域是？', '[\"x≠0\",\"x≥0\",\"x>0\",\"x≠1\"]', '1', 5, 'easy', 'math', 1);
INSERT INTO `questions` VALUES (2, 1, 'single', '极限 lim(x→0) sinx/x 的值是？', '[\"0\",\"1\",\"-1\",\"不存在\"]', '2', 5, 'medium', 'math', 2);
INSERT INTO `questions` VALUES (3, 1, 'judge', '可导函数一定连续。', '[\"正确\",\"错误\"]', '正确', 5, 'hard', 'math', 3);
INSERT INTO `questions` VALUES (4, 1, 'multiple', '下列哪些是基本初等函数？', '[\"幂函数\",\"指数函数\",\"对数函数\",\"三角函数\"]', '[\"幂函数\",\"指数函数\",\"对数函数\",\"三角函数\"]', 10, 'medium', 'math', 1);
INSERT INTO `questions` VALUES (5, 1, 'essay', '简述导数的几何意义。', NULL, '函数在某点的导数等于曲线在该点切线的斜率', 10, 'easy', 'math', 3);
INSERT INTO `questions` VALUES (6, 1, 'single', '∫x² dx 的结果是？', '[\"x³+C\",\"x³/3+C\",\"2x+C\",\"x\"]', '2', 5, 'hard', 'math', 8);
INSERT INTO `questions` VALUES (7, 1, 'judge', '∫(1/x) dx = ln|x| + C', '[\"正确\",\"错误\"]', '正确', 5, 'medium', 'math', 8);
INSERT INTO `questions` VALUES (8, 1, 'multiple', '关于不定积分，正确的有：', '[\"是求导的逆运算\",\"结果包含任意常数C\",\"定积分可借助原函数计算\",\"所有函数都能求不定积分\"]', '[\"是求导的逆运算\",\"结果包含任意常数C\",\"定积分可借助原函数计算\"]', 10, 'hard', 'math', 8);
INSERT INTO `questions` VALUES (9, 1, 'essay', '求极限 lim(x→∞) (1+1/x)^x', NULL, 'e', 10, 'hard', 'math', 2);
INSERT INTO `questions` VALUES (10, 1, 'single', '设 y=sin(2x)，则 dy/dx = ？', '[\"cos2x\",\"2cos2x\",\"cos2x/2\",\"-sin2x\"]', '2', 5, 'medium', 'math', 6);
INSERT INTO `questions` VALUES (11, 2, 'single', 'English: What is the past tense of \"go\"?', '[\"went\",\"gone\",\"goed\",\"going\"]', '1', 5, 'easy', 'english', 27);
INSERT INTO `questions` VALUES (12, 2, 'judge', '\"He don\'t like apples\" is grammatically correct.', '[\"True\",\"False\"]', 'False', 5, 'easy', 'english', 27);
INSERT INTO `questions` VALUES (13, 2, 'multiple', 'Which of the following are modal verbs?', '[\"can\",\"eat\",\"must\",\"should\"]', '[\"can\",\"must\",\"should\"]', 10, 'medium', 'english', 27);
INSERT INTO `questions` VALUES (14, 2, 'essay', 'Rewrite the sentence in passive voice: They built the house in 1990.', NULL, 'The house was built in 1990.', 10, 'medium', 'english', 27);
INSERT INTO `questions` VALUES (15, 2, 'single', 'Choose the correct word: It is _____ hot today.', '[\"too\",\"to\",\"two\",\"tow\"]', '1', 5, 'easy', 'english', 28);
INSERT INTO `questions` VALUES (16, 2, 'single', 'The word \"information\" is _____ noun.', '[\"a countable\",\"an uncountable\",\"a plural\",\"a proper\"]', '2', 5, 'easy', 'english', 28);
INSERT INTO `questions` VALUES (17, 2, 'judge', '\"She has been studying for three hours\" is present perfect continuous tense.', '[\"True\",\"False\"]', 'True', 5, 'easy', 'english', 27);
INSERT INTO `questions` VALUES (18, 2, 'multiple', 'Select the correct sentences:', '[\"I have seen him yesterday.\",\"I saw him yesterday.\",\"She has just arrived.\",\"They have lived here since 2005.\"]', '[\"I saw him yesterday.\",\"She has just arrived.\",\"They have lived here since 2005.\"]', 10, 'medium', 'english', 27);
INSERT INTO `questions` VALUES (19, 2, 'essay', 'Explain the difference between \"affect\" and \"effect\".', NULL, 'Affect is usually a verb meaning to influence; Effect is usually a noun meaning result.', 10, 'medium', 'english', 28);
INSERT INTO `questions` VALUES (20, 2, 'single', 'Which sentence is correct?', '[\"If I was you, I would go.\",\"If I were you, I would go.\",\"If I am you, I would go.\",\"If I be you, I would go.\"]', '2', 5, 'medium', 'english', 27);
INSERT INTO `questions` VALUES (21, 3, 'single', '光子能量 E 与频率 ν 的关系是？', '[\"E=mv²\",\"E=hν\",\"E=mc²\",\"E=1/2kx²\"]', '2', 5, 'hard', 'physics', 26);
INSERT INTO `questions` VALUES (22, 3, 'judge', '电磁波在真空中的传播速度是 3×10⁸ m/s。', '[\"正确\",\"错误\"]', '正确', 5, 'medium', 'physics', 23);
INSERT INTO `questions` VALUES (23, 3, 'multiple', '下列哪些属于电磁波？', '[\"可见光\",\"X射线\",\"声波\",\"无线电波\"]', '[\"可见光\",\"X射线\",\"无线电波\"]', 10, 'hard', 'physics', 23);
INSERT INTO `questions` VALUES (24, 3, 'essay', '简述牛顿第二定律并写出公式。', NULL, '物体加速度与合外力成正比，与质量成反比。F=ma', 10, 'hard', 'physics', 22);
INSERT INTO `questions` VALUES (25, 3, 'single', '一个质量为2kg的物体受到4N的力，加速度是多少？', '[\"0.5 m/s²\",\"2 m/s²\",\"8 m/s²\",\"4 m/s²\"]', '2', 5, 'hard', 'physics', 22);
INSERT INTO `questions` VALUES (26, 3, 'single', '光的干涉现象证明光具有：', '[\"粒子性\",\"波动性\",\"量子性\",\"偏振性\"]', '2', 5, 'medium', 'physics', 24);
INSERT INTO `questions` VALUES (27, 3, 'judge', '物体的惯性大小与速度有关。', '[\"正确\",\"错误\"]', '错误', 5, 'easy', 'physics', 22);
INSERT INTO `questions` VALUES (28, 3, 'multiple', '关于热力学第一定律，正确的说法是：', '[\"是能量守恒定律\",\"内能变化等于吸热与做功之和\",\"热量不能完全转化为功\",\"熵增原理\"]', '[\"是能量守恒定律\",\"内能变化等于吸热与做功之和\"]', 10, 'hard', 'physics', 25);
INSERT INTO `questions` VALUES (29, 3, 'essay', '解释光电效应的实验规律。', NULL, '存在截止频率、瞬时性、光电子最大初动能与光强无关', 10, 'hard', 'physics', 26);
INSERT INTO `questions` VALUES (30, 3, 'single', '电容的单位是：', '[\"欧姆\",\"法拉\",\"亨利\",\"特斯拉\"]', '2', 5, 'medium', 'physics', 23);
INSERT INTO `questions` VALUES (31, 4, 'single', '水的化学式是：', '[\"H₂O\",\"CO₂\",\"NaCl\",\"HCl\"]', '1', 5, 'easy', 'chemistry', 30);
INSERT INTO `questions` VALUES (32, 4, 'judge', '酸和碱反应生成盐和水。', '[\"正确\",\"错误\"]', '正确', 5, 'easy', 'chemistry', 30);
INSERT INTO `questions` VALUES (33, 4, 'essay', '什么是氧化还原反应？', NULL, '有电子转移的反应，表现为化合价变化', 10, 'medium', 'chemistry', 30);
INSERT INTO `questions` VALUES (34, 4, 'multiple', '下列属于碱金属的是：', '[\"锂\",\"钠\",\"钙\",\"钾\"]', '[\"锂\",\"钠\",\"钾\"]', 10, 'medium', 'chemistry', 30);
INSERT INTO `questions` VALUES (35, 4, 'single', '有机化合物中，最简单的烃是：', '[\"甲烷\",\"乙烷\",\"苯\",\"乙烯\"]', '1', 5, 'easy', 'chemistry', 31);
INSERT INTO `questions` VALUES (36, 4, 'judge', '催化剂能改变化学平衡。', '[\"正确\",\"错误\"]', '错误', 5, 'easy', 'chemistry', 30);
INSERT INTO `questions` VALUES (37, 4, 'essay', '写出甲烷燃烧的化学方程式。', NULL, 'CH₄ + 2O₂ → CO₂ + 2H₂O', 10, 'medium', 'chemistry', 31);
INSERT INTO `questions` VALUES (38, 5, 'single', '矩阵A的行列式det(A)=0，则A：', '[\"可逆\",\"不可逆\",\"满秩\",\"正定\"]', '2', 5, 'medium', 'math', 21);
INSERT INTO `questions` VALUES (39, 5, 'judge', '(AB)^T = B^T A^T', '[\"正确\",\"错误\"]', '正确', 5, 'medium', 'math', 21);
INSERT INTO `questions` VALUES (40, 5, 'essay', '求方程组 x+y=3, 2x-y=0 的解。', NULL, 'x=1, y=2', 10, 'medium', 'math', 21);
INSERT INTO `questions` VALUES (41, 5, 'multiple', '下列哪些是正交矩阵？', '[\"单位矩阵\",\"旋转矩阵\",\"投影矩阵\",\"反射矩阵\"]', '[\"单位矩阵\",\"旋转矩阵\",\"反射矩阵\"]', 10, 'medium', 'math', 21);
INSERT INTO `questions` VALUES (42, 6, 'single', '极限 lim(x→0) (e^x - 1)/x = ?', '[\"0\",\"1\",\"e\",\"不存在\"]', '2', 5, 'hard', 'math', 2);
INSERT INTO `questions` VALUES (43, 6, 'single', '函数 y=x³−3x 的驻点个数是：', '[\"0\",\"1\",\"2\",\"3\"]', '4', 5, 'medium', 'math', 3);
INSERT INTO `questions` VALUES (44, 6, 'judge', '拐点一定是二阶导数为零的点。', '[\"正确\",\"错误\"]', '错误', 5, 'medium', 'math', 3);
INSERT INTO `questions` VALUES (45, 6, 'essay', '求函数 y=x² 在区间[0,2]上的定积分。', NULL, '8/3', 10, 'hard', 'math', 11);
INSERT INTO `questions` VALUES (46, 6, 'multiple', '关于无穷小量，正确的有：', '[\"有限个无穷小之和仍为无穷小\",\"有界函数与无穷小之积为无穷小\",\"无穷大与无穷小互为倒数\",\"两个无穷小之商可能不是无穷小\"]', '[\"有限个无穷小之和仍为无穷小\",\"有界函数与无穷小之积为无穷小\",\"两个无穷小之商可能不是无穷小\"]', 10, 'hard', 'math', 2);
INSERT INTO `questions` VALUES (47, 7, 'single', '方阵 A 的特征值之积等于：', '[\"迹\",\"行列式\",\"秩\",\"0\"]', '2', 5, 'medium', 'math', 21);
INSERT INTO `questions` VALUES (48, 7, 'judge', '相似矩阵有相同的特征值。', '[\"正确\",\"错误\"]', '正确', 5, 'medium', 'math', 21);
INSERT INTO `questions` VALUES (49, 7, 'essay', '求矩阵 [[1,2],[3,4]] 的逆矩阵。', NULL, '[[-2,1],[1.5,-0.5]]', 10, 'hard', 'math', 21);
INSERT INTO `questions` VALUES (50, 8, 'single', '在狭义相对论中，长度收缩公式 L = L₀√(1-β²) 中 β 代表：', '[\"v/c\",\"c/v\",\"v²/c²\",\"c²/v²\"]', '1', 5, 'hard', 'physics', 26);
INSERT INTO `questions` VALUES (51, 8, 'single', '黑体辐射的峰值波长与温度的关系遵循：', '[\"维恩位移定律\",\"斯特藩-玻尔兹曼定律\",\"普朗克定律\",\"瑞利-金斯公式\"]', '1', 5, 'hard', 'physics', 26);
INSERT INTO `questions` VALUES (52, 8, 'essay', '写出爱因斯坦光电方程并解释各物理量含义。', NULL, 'hν = W₀ + ½mv²', 10, 'hard', 'physics', 26);
INSERT INTO `questions` VALUES (53, 9, 'single', 'Which word means \"very happy\"?', '[\"sad\",\"angry\",\"elated\",\"tired\"]', '3', 5, 'easy', 'english', 28);
INSERT INTO `questions` VALUES (54, 9, 'judge', '\"Neither he nor I are going\" is correct.', '[\"True\",\"False\"]', 'False', 5, 'easy', 'english', 27);
INSERT INTO `questions` VALUES (55, 9, 'essay', 'Write a short paragraph (3-4 sentences) about your hobby.', NULL, 'My hobby is reading...', 15, 'medium', 'english', 29);
INSERT INTO `questions` VALUES (56, 10, 'single', '下列哪种气体不属于温室气体？', '[\"CO₂\",\"CH₄\",\"N₂\",\"H₂O\"]', '3', 5, 'easy', 'chemistry', 30);
INSERT INTO `questions` VALUES (57, 10, 'essay', '简述离子键和共价键的区别。', NULL, '离子键是电子得失形成的静电作用；共价键是共用电子对', 10, 'medium', 'chemistry', 30);
INSERT INTO `questions` VALUES (58, 10, 'multiple', '下列哪些是化学变化？', '[\"铁生锈\",\"水沸腾\",\"食物腐烂\",\"蜡烛燃烧\"]', '[\"铁生锈\",\"食物腐烂\",\"蜡烛燃烧\"]', 10, 'medium', 'chemistry', 30);
INSERT INTO `questions` VALUES (59, 1, 'single', '设 f(x)=3x²+2，则 f‘(x)=？', '[\"6x\",\"3x²\",\"6x+2\",\"x²\"]', '1', 5, 'easy', 'math', 4);
INSERT INTO `questions` VALUES (60, 1, 'judge', '常数函数的导数为0。', '[\"正确\",\"错误\"]', '正确', 5, 'easy', 'math', 4);
INSERT INTO `questions` VALUES (61, 11, 'single', '已知集合A={1,2,3}，B={2,3,4}，则A∩B等于？', '[\"{1,4}\",\"{2,3}\",\"{1,2,3,4}\",\"{1}\"]', '2', 5, 'easy', 'math', 1);
INSERT INTO `questions` VALUES (62, 11, 'single', '不等式x² - 4x + 3 ≤ 0的解集是？', '[\"(1,3)\",\"[1,3]\",\"(-∞,1]∪[3,+∞)\",\"(0,3)\"]', '2', 5, 'medium', 'math', 2);
INSERT INTO `questions` VALUES (63, 11, 'judge', '空集是任何集合的子集。', '[\"正确\",\"错误\"]', '正确', 5, 'easy', 'math', 1);
INSERT INTO `questions` VALUES (64, 11, 'multiple', '下列函数中，在区间(0, +∞)上为增函数的有：', '[\"y = 2^x\",\"y = log2(x)\",\"y = x²\",\"y = 1/x\"]', '[\"y = 2^x\",\"y = log2(x)\",\"y = x²\"]', 10, 'medium', 'math', 3);
INSERT INTO `questions` VALUES (65, 11, 'essay', '解不等式 |2x - 1| < 5，并写出解集。', NULL, '(-2, 3)', 10, 'medium', 'math', 2);
INSERT INTO `questions` VALUES (66, 12, 'single', '已知匀加速直线运动，初速度为2m/s，加速度为3m/s²，2s末的速度为？', '[\"8m/s\",\"10m/s\",\"6m/s\",\"12m/s\"]', '1', 5, 'medium', 'physics', 16);
INSERT INTO `questions` VALUES (67, 12, 'judge', '力是改变物体运动状态的原因。', '[\"正确\",\"错误\"]', '正确', 5, 'easy', 'physics', 16);
INSERT INTO `questions` VALUES (68, 12, 'multiple', '关于能量守恒，正确的有：', '[\"能量不能凭空产生\",\"能量不能凭空消失\",\"机械能总是守恒\",\"能量可以相互转化\"]', '[\"能量不能凭空产生\",\"能量不能凭空消失\",\"能量可以相互转化\"]', 10, 'medium', 'physics', 18);
INSERT INTO `questions` VALUES (69, 12, 'essay', '用动能定理计算一个质量为2kg的物体从静止开始，在5N水平力作用下移动3m后的速度。', NULL, 'v = √(2*5*3/2) = √15 m/s', 10, 'hard', 'physics', 18);
INSERT INTO `questions` VALUES (70, 13, 'single', '下列物质中，属于电解质的是？', '[\"酒精\",\"食盐水\",\"蔗糖\",\"铜\"]', '2', 5, 'easy', 'chemistry', 27);
INSERT INTO `questions` VALUES (71, 13, 'judge', 'SO₂能使品红溶液褪色，加热后恢复红色。', '[\"正确\",\"错误\"]', '正确', 5, 'easy', 'chemistry', 33);
INSERT INTO `questions` VALUES (72, 13, 'multiple', '在氧化还原反应中，下列说法正确的有：', '[\"氧化剂被还原\",\"还原剂被氧化\",\"电子从氧化剂转移到还原剂\",\"氧化剂得电子\"]', '[\"氧化剂被还原\",\"还原剂被氧化\",\"氧化剂得电子\"]', 10, 'medium', 'chemistry', 28);
INSERT INTO `questions` VALUES (73, 14, 'single', 'DNA复制方式为：', '[\"全保留复制\",\"半保留复制\",\"分散复制\",\"任意复制\"]', '2', 5, 'medium', 'biology', 37);
INSERT INTO `questions` VALUES (74, 14, 'judge', '有氧呼吸的第二阶段在线粒体基质中进行。', '[\"正确\",\"错误\"]', '正确', 5, 'easy', 'biology', 35);
INSERT INTO `questions` VALUES (75, 14, 'essay', '描述减数分裂过程中染色体数目减半的原因。', NULL, '同源染色体分离，分别进入两个子细胞', 10, 'medium', 'biology', 36);
INSERT INTO `questions` VALUES (76, 15, 'single', 'She _____ to Paris three times.', '[\"has been\",\"went\",\"goes\",\"is going\"]', '1', 5, 'easy', 'english', 42);
INSERT INTO `questions` VALUES (77, 15, 'judge', '\"If I were you, I would study harder.\" 这句话语法正确。', '[\"True\",\"False\"]', 'True', 5, 'easy', 'english', 44);
INSERT INTO `questions` VALUES (78, 15, 'multiple', '下列哪些是名词性从句？', '[\"What he said is true.\",\"I know that he is right.\",\"The book which I read.\",\"It is important that we finish it.\"]', '[\"What he said is true.\",\"I know that he is right.\",\"It is important that we finish it.\"]', 10, 'medium', 'english', 43);
INSERT INTO `questions` VALUES (79, 16, 'single', 'Python中print(3+5)的输出是？', '[\"3+5\",\"8\",\"35\",\"报错\"]', '2', 5, 'easy', 'math', 47);
INSERT INTO `questions` VALUES (80, 16, 'judge', '在Python中，列表(list)的元素不能修改。', '[\"正确\",\"错误\"]', '错误', 5, 'easy', 'math', 47);
INSERT INTO `questions` VALUES (81, 16, 'essay', '编写Python代码：定义一个函数，接收一个列表，返回列表中所有偶数的和。', NULL, 'def sum_even(lst):\n    return sum(x for x in lst if x%2==0)', 10, 'medium', 'math', 47);
INSERT INTO `questions` VALUES (82, 17, 'single', '函数y=x³在x=1处的切线斜率是？', '[\"1\",\"3\",\"x³\",\"0\"]', '2', 5, 'medium', 'math', 3);
INSERT INTO `questions` VALUES (83, 17, 'single', '函数f(x)=sinx在区间[0,π]上的单调性是？', '[\"先增后减\",\"一直增\",\"一直减\",\"先减后增\"]', '1', 5, 'medium', 'math', 4);
INSERT INTO `questions` VALUES (84, 17, 'judge', '若f\'(x₀)=0，则x₀一定是极值点。', '[\"正确\",\"错误\"]', '错误', 5, 'medium', 'math', 6);
INSERT INTO `questions` VALUES (85, 17, 'essay', '求函数y=x³-3x²-9x+5的极值点。', NULL, '极小值点x=3，极大值点x=-1', 10, 'hard', 'math', 6);
INSERT INTO `questions` VALUES (86, 18, 'single', '矩阵A可逆的充要条件是？', '[\"A为方阵\",\"det(A)≠0\",\"A的秩为0\",\"A有特征值\"]', '2', 5, 'medium', 'math', 21);
INSERT INTO `questions` VALUES (87, 18, 'multiple', '下列关于正交矩阵性质正确的有：', '[\"行列式为±1\",\"列向量两两正交\",\"可逆\",\"正交矩阵的逆等于其转置\"]', '[\"行列式为±1\",\"列向量两两正交\",\"可逆\",\"正交矩阵的逆等于其转置\"]', 10, 'medium', 'math', 21);
INSERT INTO `questions` VALUES (88, 19, 'single', '真空中两个点电荷，距离增大为原来的2倍，库仑力变为原来的？', '[\"2倍\",\"4倍\",\"1/2\",\"1/4\"]', '4', 5, 'medium', 'physics', 20);
INSERT INTO `questions` VALUES (89, 19, 'essay', '用安培力公式计算：长1m、通有2A电流的直导线，垂直于0.5T的匀强磁场放置，受到的安培力大小。', NULL, 'F = BIL = 0.5*2*1 = 1N', 10, 'hard', 'physics', 22);

-- ----------------------------
-- Table structure for resilience_predictions
-- ----------------------------
DROP TABLE IF EXISTS `resilience_predictions`;
CREATE TABLE `resilience_predictions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `prediction_date` date NOT NULL,
  `risk_score` decimal(5, 3) NOT NULL,
  `features` json NULL,
  `intervention` json NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_date`(`user_id` ASC, `prediction_date` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of resilience_predictions
-- ----------------------------
INSERT INTO `resilience_predictions` VALUES (1, 1, '2026-04-25', 0.350, '{\"total_help\": 8, \"avg_accuracy\": 0.72}', '{\"type\": \"LOW_RISK\", \"message\": \"继续保持\"}', '2026-04-25 00:01:16');
INSERT INTO `resilience_predictions` VALUES (2, 2, '2026-04-25', 0.550, '{\"total_help\": 12, \"avg_accuracy\": 0.58}', '{\"type\": \"MEDIUM_RISK\", \"message\": \"建议基础练习\"}', '2026-04-25 00:01:16');
INSERT INTO `resilience_predictions` VALUES (3, 50, '2026-04-25', 0.450, '{\"total_help\": 5, \"avg_accuracy\": 0.68}', '{\"type\": \"MEDIUM_RISK\", \"message\": \"注意薄弱点\"}', '2026-04-25 00:01:16');
INSERT INTO `resilience_predictions` VALUES (4, 52, '2026-04-25', 0.620, '{\"total_help\": 22, \"avg_accuracy\": 0.51}', '{\"type\": \"MEDIUM_RISK\", \"message\": \"需要重点关注\"}', '2026-04-25 00:01:16');
INSERT INTO `resilience_predictions` VALUES (5, 3, '2026-04-25', 0.780, '{\"total_help\": 25, \"avg_accuracy\": 0.41}', '{\"type\": \"HIGH_RISK\", \"message\": \"建议联系导师\"}', '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for rhythm_analysis
-- ----------------------------
DROP TABLE IF EXISTS `rhythm_analysis`;
CREATE TABLE `rhythm_analysis`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NULL DEFAULT NULL,
  `video_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `key_nodes` json NULL COMMENT '关键节点列表（时间、主题）',
  `attention_missing` json NULL COMMENT '注意力缺失片段',
  `review_recommendations` json NULL COMMENT '复习推荐',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rhythm_analysis
-- ----------------------------
INSERT INTO `rhythm_analysis` VALUES (1, 1, 1, NULL, '[{\"time\": 300, \"topic\": \"定义域\"}]', '[300, 400]', '[\"复习定义域\"]', '2026-04-25 00:01:16');
INSERT INTO `rhythm_analysis` VALUES (2, 50, 2, NULL, '[{\"time\": 200, \"topic\": \"多元函数\"}]', '[200, 300]', '[\"复习偏导数\"]', '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for rhythm_nodes
-- ----------------------------
DROP TABLE IF EXISTS `rhythm_nodes`;
CREATE TABLE `rhythm_nodes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `time_seconds` int NOT NULL COMMENT '节点在课程中的时间点（秒）',
  `node_type` enum('teacher_emphasis','student_interaction','transition','quiz') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `importance` float NULL DEFAULT NULL COMMENT '重要性分数 0-1',
  `topic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '关联知识点',
  `video_fragment_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '对应的视频片段链接',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `course_id`(`course_id` ASC) USING BTREE,
  CONSTRAINT `rhythm_nodes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 35 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rhythm_nodes
-- ----------------------------
INSERT INTO `rhythm_nodes` VALUES (1, 1, 120, 'teacher_emphasis', 0.9, '函数定义域', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (2, 1, 300, 'quiz', 0.7, '定义域练习', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (3, 1, 480, 'transition', 0.5, '极限引入', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (4, 1, 720, 'teacher_emphasis', 0.95, '极限的ε-δ定义', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (5, 1, 900, 'student_interaction', 0.6, '极限计算互动', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (6, 2, 180, 'teacher_emphasis', 0.85, '多元函数概念', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (7, 2, 360, 'quiz', 0.7, '偏导数计算', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (8, 2, 540, 'transition', 0.4, '全微分', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (9, 2, 800, 'teacher_emphasis', 0.92, '方向导数与梯度', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (10, 2, 1000, 'student_interaction', 0.65, '梯度应用讨论', NULL, '2026-04-24 23:37:11');
INSERT INTO `rhythm_nodes` VALUES (11, 1, 120, 'teacher_emphasis', 0.9, '函数定义域', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (12, 1, 300, 'quiz', 0.7, '定义域练习', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (13, 1, 480, 'transition', 0.5, '极限引入', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (14, 1, 720, 'teacher_emphasis', 0.95, '极限的ε-δ定义', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (15, 1, 900, 'student_interaction', 0.6, '极限计算互动', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (16, 2, 180, 'teacher_emphasis', 0.85, '多元函数概念', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (17, 2, 360, 'quiz', 0.7, '偏导数计算', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (18, 2, 540, 'transition', 0.4, '全微分', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (19, 2, 800, 'teacher_emphasis', 0.92, '方向导数与梯度', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (20, 2, 1000, 'student_interaction', 0.65, '梯度应用讨论', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (21, 3, 90, 'teacher_emphasis', 0.88, '牛顿第一定律', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (22, 3, 250, 'quiz', 0.6, '惯性判断题', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (23, 3, 400, 'transition', 0.5, '加速度概念', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (24, 4, 150, 'teacher_emphasis', 0.9, '矩阵定义', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (25, 4, 420, 'quiz', 0.75, '行列式计算', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (26, 5, 60, 'teacher_emphasis', 0.8, '概率公理', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (27, 6, 200, 'teacher_emphasis', 0.75, '集合概念', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (28, 6, 500, 'student_interaction', 0.55, '集合运算练习', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (29, 7, 300, 'teacher_emphasis', 0.82, '函数单调性', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (30, 8, 400, 'quiz', 0.68, '导数计算测验', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (31, 9, 120, 'teacher_emphasis', 0.8, '电场强度', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (32, 10, 150, 'teacher_emphasis', 0.77, '化学平衡', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (33, 11, 180, 'teacher_emphasis', 0.85, '基因分离定律', NULL, '2026-04-25 00:01:16');
INSERT INTO `rhythm_nodes` VALUES (34, 12, 100, 'quiz', 0.5, 'Python基础测验', NULL, '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for student_daily_features
-- ----------------------------
DROP TABLE IF EXISTS `student_daily_features`;
CREATE TABLE `student_daily_features`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `avg_accuracy` decimal(5, 2) NULL DEFAULT NULL COMMENT '平均正确率',
  `help_count` int NULL DEFAULT 0 COMMENT '求助次数',
  `study_duration` int NULL DEFAULT 0 COMMENT '学习时长(秒)',
  `emotion_volatility` decimal(4, 3) NULL DEFAULT NULL COMMENT '情绪波动(0-1)',
  `active_days` int NULL DEFAULT 1 COMMENT '连续活跃天数',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_date`(`user_id` ASC, `date` ASC) USING BTREE,
  INDEX `idx_date`(`date` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 806 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of student_daily_features
-- ----------------------------
INSERT INTO `student_daily_features` VALUES (1, 1, '2026-04-24', 0.39, 8, 943, 0.420, 27);
INSERT INTO `student_daily_features` VALUES (2, 2, '2026-04-23', 0.47, 21, 4430, 0.401, 26);
INSERT INTO `student_daily_features` VALUES (3, 3, '2026-04-22', 0.41, 8, 5384, 0.567, 5);
INSERT INTO `student_daily_features` VALUES (4, 4, '2026-04-21', 0.42, 12, 3698, 0.576, 4);
INSERT INTO `student_daily_features` VALUES (5, 5, '2026-04-20', 0.34, 26, 1284, 0.034, 23);
INSERT INTO `student_daily_features` VALUES (6, 6, '2026-04-19', 0.80, 24, 3726, 0.443, 14);
INSERT INTO `student_daily_features` VALUES (7, 7, '2026-04-18', 0.34, 26, 1526, 0.245, 21);
INSERT INTO `student_daily_features` VALUES (8, 8, '2026-04-17', 0.79, 28, 2388, 0.785, 27);
INSERT INTO `student_daily_features` VALUES (9, 9, '2026-04-16', 0.48, 22, 4862, 0.719, 6);
INSERT INTO `student_daily_features` VALUES (10, 10, '2026-04-15', 0.88, 5, 5652, 0.173, 1);
INSERT INTO `student_daily_features` VALUES (11, 1, '2026-04-14', 0.77, 21, 1647, 0.856, 20);
INSERT INTO `student_daily_features` VALUES (12, 2, '2026-04-13', 0.85, 15, 4682, 0.273, 2);
INSERT INTO `student_daily_features` VALUES (13, 3, '2026-04-12', 0.69, 29, 732, 0.126, 16);
INSERT INTO `student_daily_features` VALUES (14, 4, '2026-04-11', 0.54, 9, 3040, 0.270, 29);
INSERT INTO `student_daily_features` VALUES (15, 5, '2026-04-10', 0.40, 24, 4039, 0.712, 19);
INSERT INTO `student_daily_features` VALUES (16, 6, '2026-04-09', 0.37, 18, 4766, 0.988, 18);
INSERT INTO `student_daily_features` VALUES (17, 7, '2026-04-08', 0.40, 28, 2158, 0.568, 29);
INSERT INTO `student_daily_features` VALUES (18, 8, '2026-04-07', 0.40, 27, 1380, 0.927, 6);
INSERT INTO `student_daily_features` VALUES (19, 9, '2026-04-06', 0.44, 16, 5959, 0.357, 24);
INSERT INTO `student_daily_features` VALUES (20, 10, '2026-04-05', 0.87, 10, 5731, 0.661, 13);
INSERT INTO `student_daily_features` VALUES (21, 1, '2026-04-04', 0.47, 2, 3624, 0.542, 0);
INSERT INTO `student_daily_features` VALUES (22, 2, '2026-04-03', 0.61, 15, 1073, 0.842, 28);
INSERT INTO `student_daily_features` VALUES (23, 3, '2026-04-02', 0.42, 5, 2046, 0.815, 8);
INSERT INTO `student_daily_features` VALUES (24, 4, '2026-04-01', 0.84, 21, 5076, 0.022, 18);
INSERT INTO `student_daily_features` VALUES (25, 5, '2026-03-31', 0.33, 10, 3920, 0.029, 9);
INSERT INTO `student_daily_features` VALUES (26, 6, '2026-03-30', 0.55, 5, 3904, 0.547, 26);
INSERT INTO `student_daily_features` VALUES (27, 7, '2026-03-29', 0.81, 17, 2195, 0.764, 27);
INSERT INTO `student_daily_features` VALUES (28, 8, '2026-03-28', 0.52, 1, 1706, 0.831, 16);
INSERT INTO `student_daily_features` VALUES (29, 9, '2026-03-27', 0.42, 12, 2888, 0.895, 6);
INSERT INTO `student_daily_features` VALUES (30, 10, '2026-03-26', 0.50, 1, 1722, 0.922, 29);
INSERT INTO `student_daily_features` VALUES (301, 1, '2026-04-25', 0.86, 26, 3826, 0.360, 0);
INSERT INTO `student_daily_features` VALUES (302, 2, '2026-04-24', 0.87, 22, 5753, 0.475, 15);
INSERT INTO `student_daily_features` VALUES (303, 3, '2026-04-23', 0.39, 5, 2923, 0.636, 26);
INSERT INTO `student_daily_features` VALUES (304, 4, '2026-04-22', 0.63, 1, 4156, 0.114, 17);
INSERT INTO `student_daily_features` VALUES (305, 5, '2026-04-21', 0.68, 11, 5921, 0.798, 1);
INSERT INTO `student_daily_features` VALUES (306, 1, '2026-04-20', 0.77, 23, 3538, 0.399, 10);
INSERT INTO `student_daily_features` VALUES (307, 2, '2026-04-19', 0.67, 0, 1678, 0.962, 6);
INSERT INTO `student_daily_features` VALUES (308, 3, '2026-04-18', 0.40, 5, 2942, 0.616, 23);
INSERT INTO `student_daily_features` VALUES (309, 4, '2026-04-17', 0.32, 26, 1794, 0.501, 25);
INSERT INTO `student_daily_features` VALUES (310, 5, '2026-04-16', 0.72, 0, 5609, 0.609, 7);
INSERT INTO `student_daily_features` VALUES (311, 1, '2026-04-15', 0.59, 18, 4414, 0.638, 2);
INSERT INTO `student_daily_features` VALUES (312, 2, '2026-04-14', 0.56, 28, 3088, 0.451, 26);
INSERT INTO `student_daily_features` VALUES (313, 3, '2026-04-13', 0.31, 13, 1448, 0.471, 26);
INSERT INTO `student_daily_features` VALUES (314, 4, '2026-04-12', 0.30, 11, 5108, 0.067, 24);
INSERT INTO `student_daily_features` VALUES (315, 5, '2026-04-11', 0.87, 7, 2666, 0.180, 22);
INSERT INTO `student_daily_features` VALUES (316, 1, '2026-04-10', 0.43, 25, 3985, 0.556, 26);
INSERT INTO `student_daily_features` VALUES (317, 2, '2026-04-09', 0.80, 12, 4240, 0.081, 11);
INSERT INTO `student_daily_features` VALUES (318, 3, '2026-04-08', 0.71, 7, 1427, 0.054, 24);
INSERT INTO `student_daily_features` VALUES (319, 4, '2026-04-07', 0.83, 29, 1864, 0.247, 15);
INSERT INTO `student_daily_features` VALUES (320, 5, '2026-04-06', 0.85, 0, 2111, 0.374, 0);
INSERT INTO `student_daily_features` VALUES (321, 1, '2026-04-05', 0.31, 0, 834, 0.152, 18);
INSERT INTO `student_daily_features` VALUES (322, 2, '2026-04-04', 0.72, 18, 5868, 0.028, 6);
INSERT INTO `student_daily_features` VALUES (323, 3, '2026-04-03', 0.89, 8, 3294, 0.619, 17);
INSERT INTO `student_daily_features` VALUES (324, 4, '2026-04-02', 0.38, 26, 5699, 0.117, 22);
INSERT INTO `student_daily_features` VALUES (325, 5, '2026-04-01', 0.54, 22, 3752, 0.646, 14);
INSERT INTO `student_daily_features` VALUES (326, 1, '2026-03-31', 0.57, 24, 4285, 0.999, 28);
INSERT INTO `student_daily_features` VALUES (327, 2, '2026-03-30', 0.74, 24, 5563, 0.126, 26);
INSERT INTO `student_daily_features` VALUES (328, 3, '2026-03-29', 0.90, 10, 4888, 0.901, 3);
INSERT INTO `student_daily_features` VALUES (329, 4, '2026-03-28', 0.85, 5, 1415, 0.229, 20);
INSERT INTO `student_daily_features` VALUES (330, 5, '2026-03-27', 0.77, 24, 4755, 0.381, 17);
INSERT INTO `student_daily_features` VALUES (801, 52, '2026-04-20', 0.32, 13, 1758, 0.569, 17);
INSERT INTO `student_daily_features` VALUES (802, 52, '2026-03-31', 0.34, 16, 3757, 0.953, 2);
INSERT INTO `student_daily_features` VALUES (803, 52, '2026-04-05', 0.81, 6, 4171, 0.021, 2);
INSERT INTO `student_daily_features` VALUES (804, 51, '2026-04-10', 0.73, 3, 2749, 0.523, 16);
INSERT INTO `student_daily_features` VALUES (805, 51, '2026-04-18', 0.67, 6, 3535, 0.079, 18);

-- ----------------------------
-- Table structure for student_knowledge
-- ----------------------------
DROP TABLE IF EXISTS `student_knowledge`;
CREATE TABLE `student_knowledge`  (
  `user_id` int NOT NULL,
  `node_id` int NOT NULL,
  `mastery` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '掌握度 0-100',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `node_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of student_knowledge
-- ----------------------------
INSERT INTO `student_knowledge` VALUES (1, 1, 85, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (1, 2, 70, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (1, 3, 60, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (1, 4, 80, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (1, 5, 88, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (1, 6, 82, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (1, 8, 55, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (1, 10, 75, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (1, 11, 80, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (1, 16, 90, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (1, 20, 85, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (2, 21, 95, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (2, 47, 92, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (2, 48, 88, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (2, 49, 85, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (3, 27, 55, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (3, 28, 60, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (3, 30, 50, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (3, 31, 48, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (4, 35, 65, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (4, 36, 70, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (4, 37, 60, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 1, 90, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (50, 2, 75, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (50, 3, 40, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (50, 4, 85, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (50, 5, 65, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 6, 55, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 8, 30, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (50, 9, 40, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 10, 30, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 11, 45, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 12, 50, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 16, 70, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 20, 62, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 27, 60, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 28, 78, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 42, 85, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (50, 47, 90, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (52, 1, 88, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (52, 2, 65, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (52, 3, 45, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (52, 4, 78, '2026-04-24 11:10:19');
INSERT INTO `student_knowledge` VALUES (52, 5, 72, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (52, 6, 50, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (52, 11, 40, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (52, 16, 80, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (52, 20, 65, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (52, 27, 55, '2026-04-24 11:16:59');
INSERT INTO `student_knowledge` VALUES (52, 47, 75, '2026-04-24 11:16:59');

-- ----------------------------
-- Table structure for student_practice_mastery
-- ----------------------------
DROP TABLE IF EXISTS `student_practice_mastery`;
CREATE TABLE `student_practice_mastery`  (
  `user_id` int NOT NULL,
  `knowledge_node_id` int NOT NULL,
  `mastery` tinyint NULL DEFAULT 0 COMMENT '0-100',
  `last_practice_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`, `knowledge_node_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of student_practice_mastery
-- ----------------------------
INSERT INTO `student_practice_mastery` VALUES (1, 1, 85, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (1, 2, 70, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (1, 3, 60, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (2, 4, 75, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (2, 5, 82, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (3, 27, 55, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (3, 28, 60, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (50, 1, 90, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (50, 3, 40, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (52, 1, 88, '2026-04-25 00:01:16');
INSERT INTO `student_practice_mastery` VALUES (52, 2, 65, '2026-04-25 00:01:16');

-- ----------------------------
-- Table structure for subjects
-- ----------------------------
DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NULL DEFAULT 0,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_by` int NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `created_by`(`created_by` ASC) USING BTREE,
  INDEX `idx_name`(`name` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE,
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of subjects
-- ----------------------------
INSERT INTO `subjects` VALUES (1, '语文', '包括文言文、现代文阅读、作文等', '📚', 1, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (2, '数学', '代数、几何、概率统计等', '🔢', 2, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (3, '英语', '听力、阅读、写作、语法等', '🔤', 3, 1, 7, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (4, '物理', '力学、电磁学、光学等', '⚡', 4, 1, 15, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (5, '化学', '无机化学、有机化学、分析化学等', '🧪', 5, 1, 15, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (6, '生物', '细胞生物学、遗传学、生态学等', '🧬', 6, 1, 15, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (7, '历史', '中国古代史、世界历史、近代史等', '📜', 7, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (8, '地理', '自然地理、人文地理、区域地理等', '🌍', 8, 1, 7, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (9, '政治', '政治学、经济学、哲学等', '⚖️', 9, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (10, '信息技术', '编程基础、数据库、网络技术等', '💻', 10, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (11, '体育', '体育运动与健康知识', '⚽', 11, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (12, '美术', '绘画、设计、艺术欣赏', '🎨', 12, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (13, '音乐', '乐理、声乐、乐器', '🎵', 13, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (14, '科学', '自然科学综合', '🔬', 14, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `subjects` VALUES (15, '编程', '计算机编程语言', '👨‍💻', 15, 1, 3, '2025-12-07 19:05:06', '2025-12-07 19:05:06');

-- ----------------------------
-- Table structure for system_config
-- ----------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_public` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `config_key`(`config_key` ASC) USING BTREE,
  INDEX `idx_config_key`(`config_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_config
-- ----------------------------
INSERT INTO `system_config` VALUES (1, 'site_name', 'EduSmart 智能学习平台', '网站名称', 1, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (2, 'site_description', '随时随地参加考试，提升学习效果', '网站描述', 1, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (3, 'exam_time_warning', '10', '考试剩余时间警告（分钟）', 1, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (4, 'max_exam_duration', '300', '最长考试时间（分钟）', 1, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (5, 'min_exam_duration', '5', '最短考试时间（分钟）', 1, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (6, 'default_page_size', '20', '默认分页大小', 0, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (7, 'allow_exam_retake', '1', '允许重考', 1, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (8, 'auto_submit_enabled', '1', '启用自动提交', 1, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (9, 'cheating_detection', '0', '启用防作弊检测', 0, '2025-12-07 18:58:10', '2025-12-07 18:58:10');
INSERT INTO `system_config` VALUES (10, 'ai_assistant_enabled', '1', '启用AI助手', 1, '2025-12-07 18:58:10', '2025-12-07 18:58:10');

-- ----------------------------
-- Table structure for tutor_sessions
-- ----------------------------
DROP TABLE IF EXISTS `tutor_sessions`;
CREATE TABLE `tutor_sessions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `topic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `scheduled_time` datetime NULL DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'scheduled',
  `created_by` enum('user','agent') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'user',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tutor_sessions
-- ----------------------------
INSERT INTO `tutor_sessions` VALUES (1, 50, '导数', '2026-03-16 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (2, 50, '导数', '2026-03-16 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (3, 50, '导数', '2026-03-16 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (4, 50, '导数', '2026-03-16 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (5, 50, '导数', '2026-03-16 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (6, 50, '导数', '2026-03-16 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (7, 50, '导数', '2026-03-20 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (8, 50, '导数', '2026-03-20 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (9, 52, '导数', '2026-04-24 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (10, 52, '导数', '2026-04-24 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (11, 52, '导数', '2026-04-24 19:00:00', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (12, 1, '矩阵运算', '2026-04-26 00:01:16', 'scheduled', 'user');
INSERT INTO `tutor_sessions` VALUES (13, 50, '积分应用', '2026-04-27 00:01:16', 'scheduled', 'agent');
INSERT INTO `tutor_sessions` VALUES (14, 52, '导数', '2026-04-25 19:00:00', 'scheduled', 'agent');

-- ----------------------------
-- Table structure for user_answers
-- ----------------------------
DROP TABLE IF EXISTS `user_answers`;
CREATE TABLE `user_answers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_exam_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_exam_id`(`user_exam_id` ASC) USING BTREE,
  INDEX `question_id`(`question_id` ASC) USING BTREE,
  CONSTRAINT `user_answers_ibfk_1` FOREIGN KEY (`user_exam_id`) REFERENCES `exam_records` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 47 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_answers
-- ----------------------------
INSERT INTO `user_answers` VALUES (1, 1, 1, '4');
INSERT INTO `user_answers` VALUES (2, 1, 2, '2,3,5');
INSERT INTO `user_answers` VALUES (3, 1, 3, '对');
INSERT INTO `user_answers` VALUES (4, 1, 4, 'a²+b²=c²');
INSERT INTO `user_answers` VALUES (5, 2, 5, '苹果');
INSERT INTO `user_answers` VALUES (6, 2, 6, '对');
INSERT INTO `user_answers` VALUES (7, 3, 7, '牛');
INSERT INTO `user_answers` VALUES (8, 4, 1, '3');
INSERT INTO `user_answers` VALUES (9, 27, 1, '4');
INSERT INTO `user_answers` VALUES (10, 27, 2, '2');
INSERT INTO `user_answers` VALUES (11, 27, 3, '1');
INSERT INTO `user_answers` VALUES (12, 27, 4, '2');
INSERT INTO `user_answers` VALUES (13, 28, 1, '4');
INSERT INTO `user_answers` VALUES (14, 28, 2, '2,3,5');
INSERT INTO `user_answers` VALUES (15, 28, 3, '错');
INSERT INTO `user_answers` VALUES (16, 28, 4, '22');
INSERT INTO `user_answers` VALUES (17, 29, 1, '');
INSERT INTO `user_answers` VALUES (18, 31, 1, '');
INSERT INTO `user_answers` VALUES (19, 31, 2, '');
INSERT INTO `user_answers` VALUES (20, 31, 3, '');
INSERT INTO `user_answers` VALUES (21, 31, 4, '');
INSERT INTO `user_answers` VALUES (22, 32, 5, '');
INSERT INTO `user_answers` VALUES (23, 32, 6, '');
INSERT INTO `user_answers` VALUES (24, 34, 7, '牛');
INSERT INTO `user_answers` VALUES (25, 35, 7, '牛,焦耳');
INSERT INTO `user_answers` VALUES (26, 39, 1, '\n');
INSERT INTO `user_answers` VALUES (27, 39, 2, '3');
INSERT INTO `user_answers` VALUES (28, 39, 3, '');
INSERT INTO `user_answers` VALUES (29, 39, 4, '');
INSERT INTO `user_answers` VALUES (30, 40, 7, '焦耳');
INSERT INTO `user_answers` VALUES (31, 42, 8, '是');
INSERT INTO `user_answers` VALUES (32, 55, 11, '1');
INSERT INTO `user_answers` VALUES (33, 55, 12, '2');
INSERT INTO `user_answers` VALUES (34, 55, 13, '正确');
INSERT INTO `user_answers` VALUES (35, 55, 14, '[\"y = 2^x\",\"y = log2(x)\",\"y = x²\"]');
INSERT INTO `user_answers` VALUES (36, 55, 15, '(-2, 3)');
INSERT INTO `user_answers` VALUES (37, 57, 16, '1');
INSERT INTO `user_answers` VALUES (38, 57, 17, '正确');
INSERT INTO `user_answers` VALUES (39, 57, 18, '[\"能量不能凭空产生\",\"能量不能凭空消失\",\"能量可以相互转化\"]');
INSERT INTO `user_answers` VALUES (40, 57, 19, 'v = √15 m/s');
INSERT INTO `user_answers` VALUES (41, 58, 20, '2');
INSERT INTO `user_answers` VALUES (42, 58, 21, '错误');
INSERT INTO `user_answers` VALUES (43, 58, 22, 'def sum_even(lst):...');
INSERT INTO `user_answers` VALUES (44, 60, 23, '1');
INSERT INTO `user_answers` VALUES (45, 60, 24, '正确');
INSERT INTO `user_answers` VALUES (46, 60, 25, '同源染色体分离');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone_display` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'male',
  `birthday` date NULL DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `interests` json NULL,
  `study_hours` int NULL DEFAULT 0,
  `completed_courses` int NULL DEFAULT 0,
  `knowledge_mastery` float NULL DEFAULT 0,
  `correct_answers` int NULL DEFAULT 0,
  `study_efficiency` float NULL DEFAULT 0,
  `continuous_days` int NULL DEFAULT 0,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('student','teacher','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'student',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('active','inactive','banned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_email`(`email` ASC) USING BTREE,
  INDEX `idx_role`(`role` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 54 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, '张三', '张三', NULL, 'zhangsan@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 5, 1, 0, 20, 0, 1, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2026-04-24 11:16:59');
INSERT INTO `users` VALUES (2, '李四', NULL, NULL, 'lisi@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 1, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2026-04-24 11:16:59');
INSERT INTO `users` VALUES (3, '王五', NULL, NULL, 'wangwu@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (4, '赵六', NULL, NULL, 'zhaoliu@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 1, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2026-04-24 11:16:59');
INSERT INTO `users` VALUES (5, '钱七', NULL, NULL, 'qianqi@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (6, '孙八', NULL, NULL, 'sunba@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (7, '周九', NULL, NULL, 'zhoujiu@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (8, '吴十', NULL, NULL, 'wushi@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (9, '郑十一', NULL, NULL, 'zheng11@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'admin', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (10, '王十二', NULL, NULL, 'wang12@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (11, '李十三', NULL, NULL, 'li13@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (12, '张十四', NULL, NULL, 'zhang14@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (13, '刘十五', NULL, NULL, 'liu15@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (14, '陈十六', NULL, NULL, 'chen16@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (15, '杨十七', NULL, NULL, 'yang17@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (16, '黄十八', NULL, NULL, 'huang18@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (17, '朱十九', NULL, NULL, 'zhu19@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (18, '何二十', NULL, NULL, 'he20@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash1234567890ABCDEF', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (19, 'student_01', NULL, NULL, 'student01@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (20, 'student_02', NULL, NULL, 'student02@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (21, 'student_03', NULL, NULL, 'student03@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (22, 'student_04', NULL, NULL, 'student04@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (23, 'student_05', NULL, NULL, 'student05@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (24, 'student_06', NULL, NULL, 'student06@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (25, 'student_07', NULL, NULL, 'student07@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (26, 'student_08', NULL, NULL, 'student08@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (27, 'student_09', NULL, NULL, 'student09@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (28, 'student_10', NULL, NULL, 'student10@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (29, 'student_11', NULL, NULL, 'student11@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (30, 'student_12', NULL, NULL, 'student12@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (31, 'student_13', NULL, NULL, 'student13@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (32, 'student_14', NULL, NULL, 'student14@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (33, 'student_15', NULL, NULL, 'student15@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (34, 'student_16', NULL, NULL, 'student16@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (35, 'student_17', NULL, NULL, 'student17@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (36, 'student_18', NULL, NULL, 'student18@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (37, 'student_19', NULL, NULL, 'student19@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (38, 'student_20', NULL, NULL, 'student20@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (39, 'teacher_01', NULL, NULL, 'teacher01@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (40, 'teacher_02', NULL, NULL, 'teacher02@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (41, 'teacher_03', NULL, NULL, 'teacher03@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (42, 'teacher_04', NULL, NULL, 'teacher04@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (43, 'teacher_05', NULL, NULL, 'teacher05@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (44, 'admin_01', NULL, NULL, 'admin01@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'admin', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (45, 'admin_02', NULL, NULL, 'admin02@test.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'admin', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (46, 'test_user', NULL, NULL, 'test@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (47, 'demo_student', NULL, NULL, 'demo@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'student', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (48, 'demo_teacher', NULL, NULL, 'demo_teacher@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'teacher', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (49, 'demo_admin', NULL, NULL, 'demo_admin@edusmart.com', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2a$10$TestHash', 'admin', NULL, 'active', NULL, '2025-12-07 19:05:06', '2025-12-07 19:05:06');
INSERT INTO `users` VALUES (50, 'guiziyao', NULL, NULL, '123@123', NULL, NULL, 'male', NULL, NULL, NULL, 5, 1, 0, 15, 0, 1, '$2b$10$jcN8CiHnZhtqL.hSsUsGwO/NKBkIxJtEiAB3wUQDd1sBqO0jLInji', 'student', NULL, 'active', NULL, '2025-12-07 19:17:50', '2026-04-24 11:16:59');
INSERT INTO `users` VALUES (51, '康迪', NULL, NULL, '12311@123', NULL, NULL, 'male', NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, '$2b$10$wo6soklk92ANZRtkKL1MEeUmjaqDh3z55XTBkojjDHMLNe/HdLMde', 'student', NULL, 'active', NULL, '2025-12-28 11:59:34', '2025-12-28 11:59:34');
INSERT INTO `users` VALUES (52, 'gui', '小米', '小米', '3415647252@qq.com', '1111', '1111', 'male', '2000-05-15', '', NULL, 5, 1, 0, 10, 0, 1, '$2b$10$4nutxK1ji9uFqPyoNwlDN.PnXqfsjRCBg14Jbp/B.PJkWP8bkSj.e', 'student', NULL, 'active', NULL, '2026-04-23 13:34:16', '2026-04-24 16:46:19');

-- ----------------------------
-- Table structure for video_clips
-- ----------------------------
DROP TABLE IF EXISTS `video_clips`;
CREATE TABLE `video_clips`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `node_id` int NOT NULL,
  `start_time` int NOT NULL,
  `end_time` int NOT NULL,
  `clip_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `node_id`(`node_id` ASC) USING BTREE,
  CONSTRAINT `video_clips_ibfk_1` FOREIGN KEY (`node_id`) REFERENCES `rhythm_nodes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of video_clips
-- ----------------------------

-- ----------------------------
-- Procedure structure for generate_daily_features
-- ----------------------------
DROP PROCEDURE IF EXISTS `generate_daily_features`;
delimiter ;;
CREATE PROCEDURE `generate_daily_features`()
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE uid INT;
  DECLARE dt DATE;
  DECLARE acc DECIMAL(5,2);
  DECLARE help INT;
  DECLARE dur INT;
  DECLARE vol DECIMAL(4,3);
  DECLARE active INT;
  WHILE i < 500 DO
    SET uid = (i % 5) + 1; -- 用户ID 1-5 (存在)
    SET dt = DATE_SUB(CURDATE(), INTERVAL (i % 30) DAY);
    SET acc = 0.3 + RAND() * 0.6;
    SET help = FLOOR(RAND() * 30);
    SET dur = 600 + FLOOR(RAND() * 5400);
    SET vol = RAND();
    SET active = FLOOR(RAND() * 30);
    INSERT IGNORE INTO student_daily_features (user_id, date, avg_accuracy, help_count, study_duration, emotion_volatility, active_days)
    VALUES (uid, dt, acc, help, dur, vol, active);
    SET i = i + 1;
  END WHILE;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
