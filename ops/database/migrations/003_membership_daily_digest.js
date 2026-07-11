exports.up = async db => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS membership_plans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(60) NOT NULL UNIQUE,
            name VARCHAR(120) NOT NULL,
            description TEXT,
            price_cents INT DEFAULT 0,
            currency VARCHAR(12) DEFAULT 'CNY',
            billing_cycle VARCHAR(30) DEFAULT 'monthly',
            is_active TINYINT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS membership_entitlements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            plan_code VARCHAR(60) NOT NULL,
            feature_key VARCHAR(100) NOT NULL,
            feature_name VARCHAR(120) NOT NULL,
            config_json JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_plan_feature (plan_code, feature_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS user_memberships (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            plan_code VARCHAR(60) NOT NULL,
            status VARCHAR(30) DEFAULT 'active',
            started_at DATETIME NOT NULL,
            expires_at DATETIME NULL,
            source VARCHAR(40) DEFAULT 'manual',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_status (user_id, status),
            INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS user_email_bindings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            email VARCHAR(180) NOT NULL,
            verified TINYINT DEFAULT 0,
            verify_code_hash VARCHAR(128) NULL,
            verify_expires_at DATETIME NULL,
            push_enabled TINYINT DEFAULT 0,
            push_time VARCHAR(20) DEFAULT '08:00',
            unsubscribed_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_user_email (user_id, email),
            INDEX idx_push_enabled (push_enabled, verified)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS personal_knowledge_cards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(220) NOT NULL,
            summary TEXT,
            subject VARCHAR(80) NULL,
            knowledge_point VARCHAR(160) NULL,
            recall_question TEXT,
            source_type VARCHAR(60) NOT NULL,
            source_id VARCHAR(120) NULL,
            mastery_state VARCHAR(40) DEFAULT 'new',
            priority_score DECIMAL(6,2) DEFAULT 0,
            next_review_at DATETIME NULL,
            last_reviewed_at DATETIME NULL,
            metadata_json JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_review (user_id, next_review_at),
            INDEX idx_user_priority (user_id, priority_score)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS daily_digest_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            digest_date DATE NOT NULL,
            title VARCHAR(220) NOT NULL,
            summary TEXT,
            recommended_points_json JSON NULL,
            cards_json JSON NULL,
            recall_questions_json JSON NULL,
            next_actions_json JSON NULL,
            status VARCHAR(30) DEFAULT 'generated',
            generated_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_user_digest_date (user_id, digest_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS email_push_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            digest_id INT NULL,
            email VARCHAR(180) NOT NULL,
            status VARCHAR(30) DEFAULT 'pending',
            provider VARCHAR(60) NULL,
            provider_message_id VARCHAR(160) NULL,
            error_message TEXT NULL,
            sent_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_created (user_id, created_at),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS billing_orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_no VARCHAR(80) NOT NULL UNIQUE,
            user_id INT NOT NULL,
            plan_code VARCHAR(60) NOT NULL,
            amount_cents INT NOT NULL,
            currency VARCHAR(12) DEFAULT 'CNY',
            status VARCHAR(30) DEFAULT 'created',
            payment_provider VARCHAR(40) DEFAULT 'manual',
            paid_at DATETIME NULL,
            metadata_json JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_status (user_id, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        INSERT INTO membership_plans (code, name, description, price_cents, billing_cycle)
        VALUES ('student_pro', 'Pro 学习教练', '测试阶段免费启用：每日知识推送、个人知识卡片和深度复盘。', 0, 'free_test')
        ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price_cents = 0, billing_cycle = VALUES(billing_cycle)
    `);

    const entitlements = [
        ["daily_knowledge_push", "每日知识推送"],
        ["personal_knowledge_auto_cards", "个人知识卡片自动沉淀"],
        ["pro_weekly_report", "Pro 周报"],
        ["pro_monthly_report", "Pro 月报"],
        ["advanced_screenshot_analysis", "高级截图解析"],
        ["mistake_training_camp", "智能错题训练营"],
        ["multi_agent_study_group", "多智能体学习小组"],
        ["teacher_class_insight", "教师班级洞察"]
    ];
    for (const [featureKey, featureName] of entitlements) {
        await db.query(
            `INSERT INTO membership_entitlements (plan_code, feature_key, feature_name)
             VALUES ('student_pro', ?, ?)
             ON DUPLICATE KEY UPDATE feature_name = VALUES(feature_name)`,
            [featureKey, featureName]
        );
    }

    console.log("  -> Membership, personal knowledge and daily digest tables created");
};

exports.down = async db => {
    for (const table of [
        "billing_orders",
        "email_push_logs",
        "daily_digest_logs",
        "personal_knowledge_cards",
        "user_email_bindings",
        "user_memberships",
        "membership_entitlements",
        "membership_plans"
    ]) {
        await db.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    console.log("  <- Membership and daily digest tables removed");
};
