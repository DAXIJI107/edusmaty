const crypto = require('crypto');

const PUBLIC_AGENT_SOURCES = [
    {
        id: 'SRC_AGENT_HELLO',
        name: 'Hello-Agents',
        baseUrl: 'https://github.com/datawhalechina/hello-agents',
        license: '公开 GitHub 项目',
        subject: 'AI Agent',
        course: 'agent_open_source',
        urls: [
            'https://raw.githubusercontent.com/datawhalechina/hello-agents/main/README.md'
        ]
    },
    {
        id: 'SRC_AGENT_OATUTOR',
        name: 'OATutor',
        baseUrl: 'https://github.com/CAHLR/OATutor-LLM-Learner',
        license: '公开 GitHub 项目',
        subject: 'AI Agent',
        course: 'adaptive_tutoring',
        urls: [
            'https://raw.githubusercontent.com/CAHLR/OATutor-LLM-Learner/main/README.md',
            'https://raw.githubusercontent.com/CAHLR/OATutor/main/README.md'
        ]
    },
    {
        id: 'SRC_AGENT_OPENMAIC',
        name: 'OpenMAIC',
        baseUrl: 'https://openmaic.chat/',
        license: '公开网页资料',
        subject: 'AI Agent',
        course: 'multi_agent_classroom',
        urls: [
            'https://openmaic.chat/'
        ]
    },
    {
        id: 'SRC_AGENT_NEXUSRAG',
        name: 'NexusRAG',
        baseUrl: 'https://github.com/LeDat98/NexusRAG',
        license: '公开 GitHub 项目',
        subject: 'AI Agent',
        course: 'rag_knowledge_graph',
        urls: [
            'https://raw.githubusercontent.com/LeDat98/NexusRAG/main/README.md'
        ]
    },
    {
        id: 'SRC_AGENT_AGENTSCOPE',
        name: 'AgentScope',
        baseUrl: 'https://github.com/modelscope/agentscope',
        license: '公开 GitHub 项目',
        subject: 'AI Agent',
        course: 'agent_runtime',
        urls: [
            'https://raw.githubusercontent.com/modelscope/agentscope/main/README.md'
        ]
    },
    {
        id: 'SRC_AGENT_HF',
        name: 'Hugging Face Agents Course',
        baseUrl: 'https://huggingface.co/learn/agents-course',
        license: '公开课程资料',
        subject: 'AI Agent',
        course: 'agent_course',
        urls: [
            'https://huggingface.co/learn/agents-course/unit0/introduction'
        ]
    }
];

function stableId(prefix, value, maxLength = 32) {
    const hash = crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, maxLength - prefix.length);
    return `${prefix}${hash}`.slice(0, maxLength);
}

function decodeEntities(text) {
    return String(text || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function stripHtml(text) {
    return decodeEntities(text)
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/[`*_>#|~]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractTitle(raw, fallback) {
    const text = String(raw || '');
    const markdownTitle = text.match(/^#\s+(.+)$/m);
    if (markdownTitle) return markdownTitle[1].trim().slice(0, 180);
    const htmlTitle = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (htmlTitle) return stripHtml(htmlTitle[1]).slice(0, 180);
    return fallback;
}

function chunkText(text, maxChars = 900, overlap = 120) {
    const cleaned = stripHtml(text);
    if (!cleaned) return [];
    const chunks = [];
    let start = 0;
    while (start < cleaned.length && chunks.length < 80) {
        let end = Math.min(cleaned.length, start + maxChars);
        const boundary = cleaned.lastIndexOf('。', end);
        if (boundary > start + 260) end = boundary + 1;
        chunks.push(cleaned.slice(start, end).trim());
        if (end >= cleaned.length) break;
        start = Math.max(0, end - overlap);
    }
    return chunks.filter(item => item.length >= 80);
}

async function ensurePublicRagSchema(pool) {
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
            INDEX idx_rag_doc_subject_course (subject, course)
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
            quality_score DECIMAL(3,2) DEFAULT 4.80,
            is_active TINYINT DEFAULT 1,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rag_chunk_subject_course (subject, course)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

function matchSources(sourceName) {
    const name = String(sourceName || '').trim().toLowerCase();
    if (!name || name === 'all' || name === 'agent') return PUBLIC_AGENT_SOURCES;
    return PUBLIC_AGENT_SOURCES.filter(source => {
        return source.name.toLowerCase().includes(name) ||
            source.course.toLowerCase().includes(name) ||
            source.baseUrl.toLowerCase().includes(name);
    });
}

async function fetchPublicText(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'EduSmartRebuild/2.0 public-rag-ingestor',
            'Accept': 'text/html,text/markdown,text/plain,application/json;q=0.8,*/*;q=0.5'
        },
        redirect: 'follow'
    });
    if (!response.ok) throw new Error(`fetch ${url} failed: ${response.status}`);
    return await response.text();
}

async function upsertSource(pool, source) {
    await pool.query(
        `INSERT INTO rag_sources (source_id, source_name, base_url, license_type, approved)
         VALUES (?, ?, ?, ?, 'Y')
         ON DUPLICATE KEY UPDATE
            source_name = VALUES(source_name),
            base_url = VALUES(base_url),
            license_type = VALUES(license_type),
            approved = 'Y'`,
        [source.id, source.name, source.baseUrl, source.license]
    );
}

async function writeDocument(pool, source, url, rawText) {
    const docId = stableId('DOC', `${source.id}:${url}`);
    const title = extractTitle(rawText, `${source.name} 公开资料`);
    const chunks = chunkText(rawText);
    if (!chunks.length) return { docId, title, url, chunks: 0, skipped: true };

    await pool.query(
        `INSERT INTO rag_documents
            (doc_id, source_id, title, url, subject, course, chapter, knowledge_point, summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            url = VALUES(url),
            subject = VALUES(subject),
            course = VALUES(course),
            chapter = VALUES(chapter),
            knowledge_point = VALUES(knowledge_point),
            summary = VALUES(summary)`,
        [
            docId,
            source.id,
            title,
            url,
            source.subject,
            source.course,
            `${source.name} 公开资料`,
            source.name,
            chunks[0].slice(0, 260)
        ]
    );

    await pool.query('UPDATE rag_chunks SET is_active = 0 WHERE doc_id = ?', [docId]);
    for (let index = 0; index < chunks.length; index += 1) {
        const chunkId = stableId('CHK', `${docId}:${index}:${chunks[index].slice(0, 40)}`);
        await pool.query(
            `INSERT INTO rag_chunks
                (chunk_id, doc_id, chunk_index, chunk_text, subject, course, knowledge_point, quality_score, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE
                chunk_text = VALUES(chunk_text),
                subject = VALUES(subject),
                course = VALUES(course),
                knowledge_point = VALUES(knowledge_point),
                quality_score = VALUES(quality_score),
                is_active = 1`,
            [chunkId, docId, index + 1, chunks[index], source.subject, source.course, source.name, 4.9]
        );
    }
    return { docId, title, url, chunks: chunks.length, skipped: false };
}

async function ingestPublicSources(pool, { sourceName = 'all', limit = 4 } = {}) {
    await ensurePublicRagSchema(pool);
    const sources = matchSources(sourceName).slice(0, Math.max(1, Number(limit || 4)));
    const documents = [];
    const errors = [];

    for (const source of sources) {
        await upsertSource(pool, source);
        let sourceWritten = false;
        for (const url of source.urls) {
            try {
                const rawText = await fetchPublicText(url);
                const result = await writeDocument(pool, source, url, rawText);
                documents.push({ source: source.name, ...result });
                sourceWritten = true;
                break;
            } catch (error) {
                errors.push({ source: source.name, url, message: error.message });
            }
        }
        if (!sourceWritten) {
            const fallback = `# ${source.name}\n${source.name} 是公开资料源，入口为 ${source.baseUrl}。本条记录用于保留来源索引，下一次联网成功后会替换为抓取到的 README 或公开网页内容。`;
            const result = await writeDocument(pool, source, source.baseUrl, fallback);
            documents.push({ source: source.name, fallback: true, ...result });
        }
    }

    return {
        success: true,
        requestedSource: sourceName,
        sourceCount: sources.length,
        documentCount: documents.length,
        chunkCount: documents.reduce((sum, doc) => sum + Number(doc.chunks || 0), 0),
        documents,
        errors
    };
}

module.exports = {
    PUBLIC_AGENT_SOURCES,
    ensurePublicRagSchema,
    ingestPublicSources,
    stripHtml,
    chunkText
};
