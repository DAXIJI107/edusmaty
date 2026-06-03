-- diagnostic_tables.sql
-- 新用户诊断系统数据库表

CREATE TABLE IF NOT EXISTS diagnostic_results (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    questionnaire_id VARCHAR(60) NOT NULL DEFAULT 'new_user_diagnostic_v2',
    answers_json JSON NULL,
    profile_json JSON NULL,
    analysis_json JSON NULL,
    recommendations_json JSON NULL,
    radar_json JSON NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_diagnostic_user_time (user_id, created_at),
    INDEX idx_diagnostic_questionnaire (questionnaire_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
