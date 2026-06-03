const { inferSubjectByName } = require('./SubjectUtils');

const DEFAULT_SOURCES = [
    ['SRC_0001', 'MIT OpenCourseWare', 'https://ocw.mit.edu', 'CC BY-NC-SA 4.0', 'Y'],
    ['SRC_0002', 'OpenStax', 'https://openstax.org', 'CC BY 4.0', 'Y'],
    ['SRC_0003', 'MDN Web Docs', 'https://developer.mozilla.org', 'CC BY-SA', 'Y'],
    ['SRC_0004', 'Python Docs', 'https://docs.python.org/3', 'PSF License', 'Y'],
    ['SRC_0005', 'PostgreSQL Docs', 'https://www.postgresql.org/docs', 'PostgreSQL License', 'Y']
];

async function tableExists(pool, tableName) {
    const [rows] = await pool.query('SHOW TABLES LIKE ?', [tableName]);
    return rows.length > 0;
}

async function columnNames(pool, tableName) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
    return new Set(rows.map(row => row.Field));
}

async function ensureRagTables(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS rag_sources (
            source_id VARCHAR(32) PRIMARY KEY,
            source_name VARCHAR(255) NOT NULL,
            base_url VARCHAR(500) NOT NULL,
            license_type VARCHAR(128) NOT NULL,
            approved ENUM('Y','N') DEFAULT 'Y',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS rag_documents (
            doc_id VARCHAR(32) PRIMARY KEY,
            source_id VARCHAR(32) NOT NULL,
            title VARCHAR(500) NOT NULL,
            url VARCHAR(1000) NOT NULL,
            subject VARCHAR(64) NOT NULL,
            course VARCHAR(128) NOT NULL,
            chapter VARCHAR(255) NOT NULL,
            knowledge_point VARCHAR(255) NOT NULL,
            summary TEXT,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rag_doc_subject_course (subject, course),
            CONSTRAINT fk_rag_doc_source FOREIGN KEY (source_id) REFERENCES rag_sources(source_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS rag_chunks (
            chunk_id VARCHAR(32) PRIMARY KEY,
            doc_id VARCHAR(32) NOT NULL,
            chunk_index INT NOT NULL,
            chunk_text TEXT NOT NULL,
            subject VARCHAR(64) NOT NULL,
            course VARCHAR(128) NOT NULL,
            knowledge_point VARCHAR(255) NOT NULL,
            quality_score DECIMAL(3,2) DEFAULT 4.50,
            is_active TINYINT DEFAULT 1,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rag_chunk_subject_course (subject, course),
            CONSTRAINT fk_rag_chunk_doc FOREIGN KEY (doc_id) REFERENCES rag_documents(doc_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS rag_query_logs (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            query_text TEXT NOT NULL,
            subject VARCHAR(64) NULL,
            hit_count INT DEFAULT 0,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rag_query_user_created (user_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

function pickCourseBySubject(subject) {
    switch (subject) {
        case 'programming': return 'software_engineering';
        case 'math': return 'data_structures_algorithms';
        case 'physics': return 'computer_networks';
        case 'chemistry': return 'database_systems';
        case 'english': return 'software_project_management';
        case 'biology': return 'software_testing';
        default: return 'software_engineering';
    }
}

async function ensureRagData(pool) {
    await ensureRagTables(pool);

    const [[sourceTotal]] = await pool.query('SELECT COUNT(*) AS total FROM rag_sources');
    if (Number(sourceTotal.total || 0) === 0) {
        await pool.query(
            'INSERT INTO rag_sources (source_id, source_name, base_url, license_type, approved) VALUES ?',
            [DEFAULT_SOURCES]
        );
    }

    const [[chunkTotal]] = await pool.query('SELECT COUNT(*) AS total FROM rag_chunks');
    if (Number(chunkTotal.total || 0) >= 600) return;

    if (!await tableExists(pool, 'knowledge_nodes')) return;
    if (!await tableExists(pool, 'questions')) return;

    const [nodes] = await pool.query(
        'SELECT id, name, description, subject, difficulty FROM knowledge_nodes ORDER BY id LIMIT 400'
    );
    if (!nodes.length) return;

    const questionColumns = await columnNames(pool, 'questions');
    const questionTextColumn = questionColumns.has('content') ? 'content' : questionColumns.has('question') ? 'question' : null;
    const nodeColumn = questionColumns.has('node_id') ? 'node_id' : questionColumns.has('knowledge_id') ? 'knowledge_id' : null;
    const answerColumn = questionColumns.has('answer') ? 'answer' : null;
    const questions = questionTextColumn && nodeColumn
        ? (await pool.query(
            `SELECT id,
                    \`${questionTextColumn}\` AS content,
                    ${answerColumn ? `\`${answerColumn}\`` : 'NULL'} AS answer,
                    ${questionColumns.has('subject') ? 'subject' : 'NULL AS subject'},
                    \`${nodeColumn}\` AS node_id
             FROM questions
             ORDER BY id
             LIMIT 1000`
        ))[0]
        : [];
    const questionMap = questions.reduce((acc, q) => {
        const key = Number(q.node_id || 0);
        if (!acc[key]) acc[key] = [];
        if (acc[key].length < 4) acc[key].push(q);
        return acc;
    }, {});

    const [docExistingRows] = await pool.query('SELECT doc_id FROM rag_documents');
    const existingDocs = new Set(docExistingRows.map(item => item.doc_id));

    const docRows = [];
    const chunkRows = [];
    let docCounter = 1;
    let chunkCounter = 1;

    for (const node of nodes) {
        const nodeId = Number(node.id);
        const subject = node.subject || inferSubjectByName(node.name);
        const course = pickCourseBySubject(subject);
        const chapter = `${course}·核心章节`;
        const kp = node.name;
        const did = `DOC_SE_${String(docCounter).padStart(6, '0')}`;
        docCounter += 1;
        if (existingDocs.has(did)) continue;

        const summary = `${kp}是${course}中的关键知识点，重点覆盖定义、实现流程、常见错误与排错方法。`;
        docRows.push([
            did,
            DEFAULT_SOURCES[(nodeId - 1) % DEFAULT_SOURCES.length][0],
            `${kp}知识讲解`,
            `https://edu.local/knowledge/${nodeId}`,
            subject,
            course,
            chapter,
            kp,
            summary
        ]);

        const relatedQuestions = questionMap[nodeId] || [];
        const qText = relatedQuestions.map((q, idx) => `题${idx + 1}:${q.content} 参考:${q.answer || '开放题'}`).join(' ');
        const chunkA = `${summary} 概念描述：${node.description || '暂无描述'}。`;
        const chunkB = `学习建议：先理解边界条件，再做最小样例，最后复盘错题。${qText}`;

        chunkRows.push([
            `CHK_SE_${String(chunkCounter).padStart(7, '0')}`,
            did,
            1,
            chunkA,
            subject,
            course,
            kp,
            4.6,
            1
        ]);
        chunkCounter += 1;

        chunkRows.push([
            `CHK_SE_${String(chunkCounter).padStart(7, '0')}`,
            did,
            2,
            chunkB,
            subject,
            course,
            kp,
            4.7,
            1
        ]);
        chunkCounter += 1;
    }

    if (docRows.length) {
        await pool.query(
            `INSERT INTO rag_documents
             (doc_id, source_id, title, url, subject, course, chapter, knowledge_point, summary)
             VALUES ?`,
            [docRows]
        );
    }
    if (chunkRows.length) {
        await pool.query(
            `INSERT INTO rag_chunks
             (chunk_id, doc_id, chunk_index, chunk_text, subject, course, knowledge_point, quality_score, is_active)
             VALUES ?`,
            [chunkRows]
        );
    }
}

module.exports = {
    ensureRagData
};
