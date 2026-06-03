-- 创建学生学习画像表
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    profile_json TEXT NOT NULL,
    version INT DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建智能体权限表（如果不存在）
CREATE TABLE IF NOT EXISTS agent_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    allow_auto_tutor BOOLEAN DEFAULT TRUE,
    allow_auto_group BOOLEAN DEFAULT TRUE,
    allow_auto_review BOOLEAN DEFAULT TRUE,
    allow_auto_purchase BOOLEAN DEFAULT FALSE,
    budget_limit DECIMAL(10,2) DEFAULT 0,
    require_review_for_purchase BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id)
);

-- 创建智能体执行日志表（如果不存在）
CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    params TEXT,
    result TEXT,
    status VARCHAR(20) DEFAULT 'success',
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建辅导会话表（如果不存在）
CREATE TABLE IF NOT EXISTS tutor_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    scheduled_time DATETIME NOT NULL,
    created_by VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);