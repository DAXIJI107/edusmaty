exports.up = async db => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS agent_sessions (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(80) NOT NULL UNIQUE,
            user_id INT NOT NULL,
            status VARCHAR(24) DEFAULT 'active',
            goal VARCHAR(500),
            summary TEXT,
            planner_source VARCHAR(40),
            token_usage INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_as_user_time (user_id, created_at),
            INDEX idx_as_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS agent_session_messages (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(80) NOT NULL,
            role VARCHAR(24) NOT NULL,
            content MEDIUMTEXT NOT NULL,
            provider VARCHAR(40),
            model VARCHAR(120),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_asm_session_time (session_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS agent_working_memory (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(80) NOT NULL,
            memory_key VARCHAR(120) NOT NULL,
            value_json JSON,
            expires_at TIMESTAMP NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_awm_session_key (session_id, memory_key),
            INDEX idx_awm_expiry (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS agent_memory_items (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            memory_type VARCHAR(40) NOT NULL,
            content TEXT NOT NULL,
            confidence DECIMAL(4,3) DEFAULT 0.500,
            source VARCHAR(80) NOT NULL,
            source_ref VARCHAR(160),
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_ami_user_type (user_id, memory_type),
            INDEX idx_ami_expiry (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS agent_memory_links (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            memory_id BIGINT NOT NULL,
            target_type VARCHAR(40) NOT NULL,
            target_id VARCHAR(120) NOT NULL,
            strength DECIMAL(4,3) DEFAULT 0.500,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uk_aml_target (memory_id, target_type, target_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS agent_evaluations (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_id VARCHAR(80) NOT NULL,
            tools_called JSON,
            fallback_used TINYINT(1) DEFAULT 0,
            writeback_count INT DEFAULT 0,
            evidence_count INT DEFAULT 0,
            missing_inputs JSON,
            score DECIMAL(5,2),
            latency_ms INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ae_session (session_id),
            INDEX idx_ae_user_time (user_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("  -> Agent session, memory and evaluation tables created");
};

exports.down = async db => {
    for (const table of [
        "agent_evaluations",
        "agent_memory_links",
        "agent_memory_items",
        "agent_working_memory",
        "agent_session_messages",
        "agent_sessions"
    ]) {
        await db.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    console.log("  <- Agent session, memory and evaluation tables removed");
};
