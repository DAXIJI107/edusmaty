-- ============================================================
-- 迁移脚本: 智能诊断系统表结构
-- 版本: 006
-- 说明: 创建CAT诊断记录、知识追踪参数、误区检测结果等表
-- ============================================================

-- 1. CAT自适应诊断会话记录
CREATE TABLE IF NOT EXISTS diagnosis_records (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(64) NOT NULL COMMENT '会话唯一标识',
    subject_filter VARCHAR(500) NULL COMMENT '学科过滤(JSON array)',
    ability_estimate DECIMAL(6,3) NULL COMMENT 'θ能力估计值',
    ability_se DECIMAL(6,3) NULL COMMENT '标准误',
    questions_answered INT NULL DEFAULT 0 COMMENT '答题数',
    overall_accuracy DECIMAL(5,2) NULL COMMENT '整体正确率(%)',
    responses_json JSON NULL COMMENT '所有答题记录',
    subject_analysis_json JSON NULL COMMENT '学科分析',
    cognitive_levels_json JSON NULL COMMENT 'Bloom认知层次',
    response_pattern VARCHAR(30) NULL COMMENT '答题模式',
    estimated_grade VARCHAR(20) NULL COMMENT '估计等级',
    diagnosis_quality_json JSON NULL COMMENT '诊断质量',
    started_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    INDEX idx_dr_user (user_id),
    INDEX idx_dr_session (session_id),
    INDEX idx_dr_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CAT自适应诊断记录';

-- 2. 个性化BKT知识追踪参数
CREATE TABLE IF NOT EXISTS knowledge_tracing_params (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    knowledge_id INT NULL COMMENT '知识点ID(NULL=全局参数)',
    param_prior DECIMAL(5,3) NOT NULL DEFAULT 0.300 COMMENT 'P(L₀) 初始掌握概率',
    param_learn DECIMAL(5,3) NOT NULL DEFAULT 0.150 COMMENT 'P(T) 学习概率',
    param_guess DECIMAL(5,3) NOT NULL DEFAULT 0.200 COMMENT 'P(G) 猜测概率',
    param_slip  DECIMAL(5,3) NOT NULL DEFAULT 0.100 COMMENT 'P(S) 失误概率',
    sample_count INT NULL DEFAULT 0 COMMENT '拟合样本数',
    last_fitted_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ktp_user_knowledge (user_id, knowledge_id),
    INDEX idx_ktp_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='BKT知识追踪个性化参数';

-- 3. 误区检测结果
CREATE TABLE IF NOT EXISTS misconceptions (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject VARCHAR(30) NULL COMMENT '学科',
    category VARCHAR(60) NOT NULL COMMENT '误区类别',
    severity ENUM('critical','moderate','minor') NULL DEFAULT 'minor' COMMENT '严重程度',
    error_count INT NULL DEFAULT 0 COMMENT '错误次数',
    error_percentage DECIMAL(5,1) NULL COMMENT '错误占比(%)',
    sample_questions_json JSON NULL COMMENT '样本题目',
    detected_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    resolved TINYINT(1) NULL DEFAULT 0 COMMENT '是否已纠正',
    resolved_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    INDEX idx_mc_user (user_id),
    INDEX idx_mc_category (category),
    INDEX idx_mc_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='误区检测结果';

-- 4. 综合诊断报告存档
CREATE TABLE IF NOT EXISTS diagnosis_reports (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject_filter VARCHAR(100) NULL COMMENT '学科过滤',
    report_json JSON NOT NULL COMMENT '完整报告JSON',
    overall_score INT NULL COMMENT '综合评分(0-100)',
    grade VARCHAR(20) NULL COMMENT '评级',
    radar_data_json JSON NULL COMMENT '雷达图数据',
    knowledge_heatmap_json JSON NULL COMMENT '知识热度图',
    bloom_pyramid_json JSON NULL COMMENT 'Bloom金字塔',
    misconception_cards_json JSON NULL COMMENT '误区卡片',
    strength_analysis_json JSON NULL COMMENT '优劣势分析',
    learning_path_json JSON NULL COMMENT '学习路径建议',
    progress_projection_json JSON NULL COMMENT '进度预测',
    diagnosis_quality_json JSON NULL COMMENT '诊断质量',
    generated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_drep_user (user_id),
    INDEX idx_drep_generated (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='综合诊断报告';

-- 5. 认知属性追踪
CREATE TABLE IF NOT EXISTS cognitive_attributes (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    attribute_name VARCHAR(40) NOT NULL COMMENT '认知属性名',
    mastery_score DECIMAL(5,1) NULL COMMENT '掌握度(0-100)',
    probability DECIMAL(5,3) NULL COMMENT 'DINA后验概率',
    confidence DECIMAL(5,3) NULL COMMENT '置信度',
    state ENUM('mastered','developing','beginner','weak','unknown') NULL DEFAULT 'unknown',
    sample_size INT NULL DEFAULT 0,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ca_user_attr (user_id, attribute_name),
    INDEX idx_ca_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='认知属性追踪';

-- 6. Bloom认知层次追踪
CREATE TABLE IF NOT EXISTS bloom_levels (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject VARCHAR(30) NULL,
    level_name VARCHAR(20) NOT NULL COMMENT 'Bloom层次: 记忆/理解/应用/分析/评价/创造',
    question_count INT NULL DEFAULT 0,
    accuracy DECIMAL(5,1) NULL COMMENT '正确率(%)',
    mastery_score DECIMAL(5,1) NULL COMMENT '掌握度(0-100)',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bl_user_subject_level (user_id, subject, level_name),
    INDEX idx_bl_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bloom认知层次追踪';