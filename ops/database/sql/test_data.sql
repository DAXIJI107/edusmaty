-- 学生学习画像表
CREATE TABLE IF NOT EXISTS `student_profiles` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `profile_json` JSON NOT NULL COMMENT '学习画像JSON数据',
    `version` INT DEFAULT 1 COMMENT '画像版本号',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_profile` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试画像数据（使用实际存在的用户ID）
INSERT INTO `student_profiles` (`user_id`, `profile_json`, `version`) VALUES
(1, '{"basicInfo":{"major":"计算机科学与技术","year":"大二","learningGoals":["考研","就业"],"interests":["人工智能","数据分析"]},"cognitiveStyle":{"type":"visual","preference":"balanced"},"learningPatterns":{"易错知识点":["积分","矩阵运算"],"学习速度":"medium","注意力持续时间":45,"最佳学习时间":"morning"},"emotionalTraits":{"学习韧性":0.85,"焦虑水平":0.3,"动机水平":0.9},"multimodalPreferences":{"视觉":0.9,"听觉":0.6,"触觉":0.5,"阅读":0.8},"updatedAt":"2026-04-25T10:00:00Z"}', 1),
(2, '{"basicInfo":{"major":"数学","year":"大三","learningGoals":["考研"],"interests":["基础数学","应用数学"]},"cognitiveStyle":{"type":"auditory","preference":"focused"},"learningPatterns":{"易错知识点":["泛函分析","拓扑学"],"学习速度":"slow","注意力持续时间":30,"最佳学习时间":"evening"},"emotionalTraits":{"学习韧性":0.7,"焦虑水平":0.5,"动机水平":0.75},"multimodalPreferences":{"视觉":0.6,"听觉":0.9,"触觉":0.4,"阅读":0.7},"updatedAt":"2026-04-25T09:30:00Z"}', 1),
(3, '{"basicInfo":{"major":"物理学","year":"大二","learningGoals":["考研","出国"],"interests":["理论物理","实验物理"]},"cognitiveStyle":{"type":"kinesthetic","preference":"balanced"},"learningPatterns":{"易错知识点":["量子力学","电磁学"],"学习速度":"fast","注意力持续时间":60,"最佳学习时间":"afternoon"},"emotionalTraits":{"学习韧性":0.9,"焦虑水平":0.2,"动机水平":0.95},"multimodalPreferences":{"视觉":0.7,"听觉":0.5,"触觉":0.9,"阅读":0.6},"updatedAt":"2026-04-25T08:45:00Z"}', 1),
(4, '{"basicInfo":{"major":"化学工程","year":"大四","learningGoals":["就业"],"interests":["有机化学","材料化学"]},"cognitiveStyle":{"type":"visual","preference":"focused"},"learningPatterns":{"易错知识点":["有机合成","反应机理"],"学习速度":"medium","注意力持续时间":40,"最佳学习时间":"morning"},"emotionalTraits":{"学习韧性":0.75,"焦虑水平":0.4,"动机水平":0.8},"multimodalPreferences":{"视觉":0.85,"听觉":0.5,"触觉":0.6,"阅读":0.75},"updatedAt":"2026-04-25T07:20:00Z"}', 1),
(5, '{"basicInfo":{"major":"英语","year":"大三","learningGoals":["考研","出国"],"interests":["文学","翻译"]},"cognitiveStyle":{"type":"auditory","preference":"balanced"},"learningPatterns":{"易错知识点":["语法","写作"],"学习速度":"medium","注意力持续时间":35,"最佳学习时间":"evening"},"emotionalTraits":{"学习韧性":0.8,"焦虑水平":0.35,"动机水平":0.85},"multimodalPreferences":{"视觉":0.5,"听觉":0.95,"触觉":0.3,"阅读":0.9},"updatedAt":"2026-04-25T11:15:00Z"}', 1),
(6, '{"basicInfo":{"major":"经济学","year":"大二","learningGoals":["就业","考研"],"interests":["宏观经济学","金融学"]},"cognitiveStyle":{"type":"visual","preference":"balanced"},"learningPatterns":{"易错知识点":["计量经济学","统计学"],"学习速度":"medium","注意力持续时间":50,"最佳学习时间":"morning"},"emotionalTraits":{"学习韧性":0.82,"焦虑水平":0.28,"动机水平":0.88},"multimodalPreferences":{"视觉":0.88,"听觉":0.62,"触觉":0.45,"阅读":0.78},"updatedAt":"2026-04-25T10:30:00Z"}', 1),
(7, '{"basicInfo":{"major":"机械工程","year":"大三","learningGoals":["就业"],"interests":["机械设计","自动化"]},"cognitiveStyle":{"type":"kinesthetic","preference":"focused"},"learningPatterns":{"易错知识点":["力学分析","材料力学"],"学习速度":"slow","注意力持续时间":55,"最佳学习时间":"afternoon"},"emotionalTraits":{"学习韧性":0.78,"焦虑水平":0.38,"动机水平":0.82},"multimodalPreferences":{"视觉":0.65,"听觉":0.48,"触觉":0.92,"阅读":0.58},"updatedAt":"2026-04-25T09:00:00Z"}', 1),
(8, '{"basicInfo":{"major":"生物医学工程","year":"大二","learningGoals":["考研","出国"],"interests":["生物材料","医学影像"]},"cognitiveStyle":{"type":"visual","preference":"balanced"},"learningPatterns":{"易错知识点":["信号处理","医学图像"],"学习速度":"medium","注意力持续时间":42,"最佳学习时间":"morning"},"emotionalTraits":{"学习韧性":0.84,"焦虑水平":0.32,"动机水平":0.86},"multimodalPreferences":{"视觉":0.92,"听觉":0.55,"触觉":0.52,"阅读":0.8},"updatedAt":"2026-04-25T08:00:00Z"}', 1),
(9, '{"basicInfo":{"major":"土木工程","year":"大四","learningGoals":["就业"],"interests":["结构工程","道路桥梁"]},"cognitiveStyle":{"type":"kinesthetic","preference":"balanced"},"learningPatterns":{"易错知识点":["结构力学","混凝土设计"],"学习速度":"fast","注意力持续时间":48,"最佳学习时间":"afternoon"},"emotionalTraits":{"学习韧性":0.77,"焦虑水平":0.42,"动机水平":0.79},"multimodalPreferences":{"视觉":0.68,"听觉":0.45,"触觉":0.88,"阅读":0.62},"updatedAt":"2026-04-25T07:45:00Z"}', 1),
(10, '{"basicInfo":{"major":"软件工程","year":"大三","learningGoals":["就业","创业"],"interests":["软件开发","项目管理"]},"cognitiveStyle":{"type":"visual","preference":"focused"},"learningPatterns":{"易错知识点":["系统设计","数据库优化"],"学习速度":"fast","注意力持续时间":60,"最佳学习时间":"morning"},"emotionalTraits":{"学习韧性":0.88,"焦虑水平":0.25,"动机水平":0.92},"multimodalPreferences":{"视觉":0.95,"听觉":0.58,"触觉":0.55,"阅读":0.82},"updatedAt":"2026-04-25T11:00:00Z"}', 1);

-- 为现有用户添加更多信息
UPDATE users SET interests = '["人工智能","软件开发","数据分析"]' WHERE id = 1;
UPDATE users SET interests = '["基础数学","应用数学","统计学"]' WHERE id = 2;
UPDATE users SET interests = '["理论物理","实验物理"]' WHERE id = 3;
UPDATE users SET study_hours = 120 WHERE id = 1;
UPDATE users SET study_hours = 85 WHERE id = 2;
UPDATE users SET study_hours = 150 WHERE id = 3;
UPDATE users SET knowledge_mastery = 75.5 WHERE id = 1;
UPDATE users SET knowledge_mastery = 68.2 WHERE id = 2;
UPDATE users SET knowledge_mastery = 82.0 WHERE id = 3;
UPDATE users SET completed_courses = 8 WHERE id = 1;
UPDATE users SET completed_courses = 5 WHERE id = 2;
UPDATE users SET completed_courses = 12 WHERE id = 3;
UPDATE users SET correct_answers = 456 WHERE id = 1;
UPDATE users SET correct_answers = 320 WHERE id = 2;
UPDATE users SET correct_answers = 580 WHERE id = 3;
UPDATE users SET study_efficiency = 85.0 WHERE id = 1;
UPDATE users SET study_efficiency = 72.5 WHERE id = 2;
UPDATE users SET study_efficiency = 90.0 WHERE id = 3;
UPDATE users SET continuous_days = 15 WHERE id = 1;
UPDATE users SET continuous_days = 7 WHERE id = 2;
UPDATE users SET continuous_days = 22 WHERE id = 3;