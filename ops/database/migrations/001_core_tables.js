// migrations/001_core_tables.js
// 核心表结构 — 首次迁移

exports.up = async db => {
    // ========== 用户与认证 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('student','teacher','admin') DEFAULT 'student',
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 知识点 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS knowledge_nodes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            subject VARCHAR(80),
            chapter VARCHAR(80),
            difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
            type VARCHAR(40) DEFAULT 'concept',
            bvid VARCHAR(40),
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_kn_subject (subject),
            INDEX idx_kn_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS knowledge_points (
            id INT AUTO_INCREMENT PRIMARY KEY,
            subject VARCHAR(80),
            title VARCHAR(200) NOT NULL,
            description TEXT,
            difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_kp_subject (subject)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS knowledge_edges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            source_id INT NOT NULL,
            target_id INT NOT NULL,
            relation VARCHAR(40) DEFAULT 'prerequisite',
            weight FLOAT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ke_source (source_id),
            INDEX idx_ke_target (target_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS prerequisites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            node_id INT NOT NULL,
            prereq_id INT NOT NULL,
            UNIQUE KEY uk_prereq (node_id, prereq_id),
            INDEX idx_pr_node (node_id),
            INDEX idx_pr_prereq (prereq_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 试题 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            content TEXT NOT NULL,
            type VARCHAR(30) DEFAULT 'single_choice',
            options JSON,
            correct_answer VARCHAR(500),
            difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
            score INT DEFAULT 5,
            node_id INT,
            knowledge_id INT,
            subject VARCHAR(80),
            skill_codes VARCHAR(200),
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_q_node (node_id),
            INDEX idx_q_subject (subject),
            INDEX idx_q_difficulty (difficulty)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 考试 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS exams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            subject VARCHAR(80),
            duration INT DEFAULT 60,
            total_score INT DEFAULT 100,
            status VARCHAR(20) DEFAULT 'published',
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_exam_subject (subject)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS exam_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            exam_id INT,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            score FLOAT,
            completed TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_er_user (user_id),
            INDEX idx_er_exam (exam_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS user_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            question_id INT NOT NULL,
            user_exam_id INT,
            answer VARCHAR(500),
            is_correct TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ua_user (user_id),
            INDEX idx_ua_question (question_id),
            INDEX idx_ua_exam (user_exam_id),
            INDEX idx_ua_time (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 学生画像 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS student_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            profile_json JSON,
            version INT DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sp_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 学生知识掌握度 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS student_knowledge (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            node_id INT NOT NULL,
            mastery INT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_sk_user_node (user_id, node_id),
            INDEX idx_sk_user (user_id),
            INDEX idx_sk_node (node_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 诊断 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS diagnostic_results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            questionnaire_id VARCHAR(60) DEFAULT 'new_user_diagnostic_v2',
            answers_json JSON,
            profile_json JSON,
            analysis_json JSON,
            recommendations_json JSON,
            radar_json JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_dr_user_time (user_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== RAG ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS rag_sources (
            source_id INT AUTO_INCREMENT PRIMARY KEY,
            source_name VARCHAR(200) NOT NULL,
            base_url VARCHAR(500),
            license_type VARCHAR(80),
            approved ENUM('Y','N') DEFAULT 'N',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS rag_documents (
            doc_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(300) NOT NULL,
            url VARCHAR(500),
            subject VARCHAR(80),
            course VARCHAR(100),
            chapter VARCHAR(100),
            knowledge_point VARCHAR(200),
            source_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rd_subject (subject),
            INDEX idx_rd_source (source_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS rag_chunks (
            chunk_id INT AUTO_INCREMENT PRIMARY KEY,
            doc_id INT NOT NULL,
            chunk_text MEDIUMTEXT NOT NULL,
            subject VARCHAR(80),
            course VARCHAR(100),
            knowledge_point VARCHAR(200),
            quality_score FLOAT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rc_doc (doc_id),
            INDEX idx_rc_subject (subject),
            INDEX idx_rc_active (is_active),
            FULLTEXT INDEX ft_rc_chunk (chunk_text)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS rag_query_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            query_text VARCHAR(500),
            subject VARCHAR(80),
            hit_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rql_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 学习事件 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS learning_events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_id VARCHAR(60),
            event_type VARCHAR(50) NOT NULL,
            page VARCHAR(100),
            subject VARCHAR(80),
            knowledge_id INT,
            target_id INT,
            target_type VARCHAR(40),
            duration_ms INT DEFAULT 0,
            context_json JSON,
            client_ts BIGINT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_le_user (user_id),
            INDEX idx_le_type (event_type),
            INDEX idx_le_time (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 通知 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            body TEXT,
            type VARCHAR(40) DEFAULT 'info',
            ref_id INT,
            ref_url VARCHAR(300),
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_notif_user_read (user_id, is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 错题本 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS error_book (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            question_id INT NOT NULL,
            exam_record_id INT,
            wrong_answer VARCHAR(500),
            correct_answer VARCHAR(500),
            knowledge_node_id INT,
            subject VARCHAR(80),
            status VARCHAR(20) DEFAULT 'unsolved',
            review_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_eb_user (user_id),
            INDEX idx_eb_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 反馈闭环 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS feedback_loop (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            cycle_start DATE,
            cycle_end DATE,
            exam_record_id INT,
            weak_points JSON,
            recommended_courses JSON,
            error_solved_count INT DEFAULT 0,
            improvement_score FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_fl_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // ========== 课程材料 ==========
    await db.query(`
        CREATE TABLE IF NOT EXISTS course_materials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(300) NOT NULL,
            type VARCHAR(40) DEFAULT 'document',
            url VARCHAR(500),
            node_id INT,
            subject VARCHAR(80),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_cm_node (node_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("  → 核心表创建完成");
};

exports.down = async db => {
    const tables = [
        "feedback_loop",
        "error_book",
        "notifications",
        "learning_events",
        "rag_query_logs",
        "rag_chunks",
        "rag_documents",
        "rag_sources",
        "diagnostic_results",
        "student_knowledge",
        "student_profiles",
        "user_answers",
        "exam_records",
        "exams",
        "questions",
        "prerequisites",
        "knowledge_edges",
        "knowledge_points",
        "knowledge_nodes",
        "course_materials"
    ];
    for (const table of tables) {
        await db.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    await db.query("DROP TABLE IF EXISTS users");
    console.log("  ← 核心表已移除");
};
