// core/ObsidianRagSync.js
// Obsidian Vault → RAG 知识库同步引擎
// 扫描 obsidian-vault/ 下所有 .md 文件，解析 frontmatter，按标题分块入库
// 兼容 rag_sources/documents/chunks 使用 VARCHAR(32) 主键的表结构
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VAULT_DIR = path.join(__dirname, '..', '..', 'obsidian-vault');
const IGNORE_DIRS = new Set(['.obsidian', 'attachments', 'templates', '.trash']);
const OBSIDIAN_SOURCE_ID = 'obsidian_vault';

function hashId(str) {
    return crypto.createHash('md5').update(String(str)).digest('hex').slice(0, 12);
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { meta: {}, body: content };
    const yamlBlock = match[1];
    const meta = {};
    for (const line of yamlBlock.split('\n')) {
        const ci = line.indexOf(':');
        if (ci === -1) continue;
        const key = line.slice(0, ci).trim();
        let value = line.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
        if (value.startsWith('[') && value.endsWith(']'))
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        meta[key] = value;
    }
    return { meta, body: content.slice(match[0].length).trim() };
}

function cleanWikiLinks(text) {
    return String(text).replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1');
}

function chunkByHeadings(content, maxSize = 800) {
    const chunks = [];
    const lines = content.split('\n');
    let heading = '', text = '';
    for (const line of lines) {
        if (/^#{1,3}\s/.test(line)) {
            if (heading || text.trim()) chunks.push({ heading: cleanWikiLinks(heading), text: cleanWikiLinks(text.trim()) });
            heading = line.replace(/^#+\s*/, '').trim();
            text = '';
        } else {
            text += line + '\n';
            if (text.length > maxSize) { chunks.push({ heading: cleanWikiLinks(heading), text: cleanWikiLinks(text.trim()) }); text = ''; }
        }
    }
    if (heading || text.trim()) chunks.push({ heading: cleanWikiLinks(heading), text: cleanWikiLinks(text.trim()) });
    return chunks.filter(c => c.text.length > 10);
}

function scanMDFiles(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        const fp = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...scanMDFiles(fp));
        else if (entry.name.endsWith('.md')) results.push(fp);
    }
    return results;
}

function inferSubject(fp, meta) {
    const rel = path.relative(VAULT_DIR, fp).replace(/\\/g, '/');
    const dir = rel.split('/')[0] || '';
    const map = {
        '01-计算机基础': '计算机基础', '02-编程语言': '编程语言', '02-数据库': '数据库',
        '03-数据结构与算法': '数据结构与算法', '03-编程语言': '编程语言', '04-数据库': '数据库',
        '04-运维与工具': '运维工具', '05-软件工程': '软件工程', '06-人工智能': '人工智能',
        '07-试题库': '试题库', '08-知识图谱': '知识图谱', '09-课程大纲': '课程大纲',
    };
    return map[dir] || meta.subject || meta.course_code || '通用';
}

class ObsidianRagSync {
    constructor(pool) {
        this.pool = pool;
        this.stats = { scanned: 0, synced: 0, skipped: 0, chunks: 0 };
    }

    async ensureObsidianSource() {
        const [existing] = await this.pool.query(
            "SELECT source_id FROM rag_sources WHERE source_id = ? LIMIT 1",
            [OBSIDIAN_SOURCE_ID]
        );
        if (existing.length > 0) return OBSIDIAN_SOURCE_ID;

        await this.pool.query(
            `INSERT INTO rag_sources (source_id, source_name, base_url, license_type, approved)
             VALUES (?, 'Obsidian Vault', 'local://obsidian-vault', 'Personal', 'Y')`,
            [OBSIDIAN_SOURCE_ID]
        );
        return OBSIDIAN_SOURCE_ID;
    }

    async fullSync() {
        const sourceId = await this.ensureObsidianSource();
        const files = scanMDFiles(VAULT_DIR);
        this.stats = { scanned: files.length, synced: 0, skipped: 0, chunks: 0 };

        for (const filePath of files) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8').trim();
                if (!content) continue;

                const { meta, body } = parseFrontmatter(content);
                const subject = inferSubject(filePath, meta);
                const h1 = cleanWikiLinks(body.split('\n')[0]?.replace(/^#+\s*/, '') || path.basename(filePath, '.md'));
                const title = meta.title || h1;
                const course = meta.course_code || subject;
                const chapter = meta.chapter_code || '';
                const docId = hashId(filePath);

                const [existing] = await this.pool.query(
                    'SELECT doc_id FROM rag_documents WHERE doc_id = ? LIMIT 1', [docId]
                );

                if (existing.length > 0) {
                    await this.pool.query(
                        `UPDATE rag_documents SET title=?, url=?, subject=?, course=?, chapter=?, knowledge_point=?
                         WHERE doc_id=?`,
                        [title, filePath, subject, course, chapter, title, docId]
                    );
                    await this.pool.query('DELETE FROM rag_chunks WHERE doc_id = ?', [docId]);
                    this.stats.skipped++;
                } else {
                    await this.pool.query(
                        `INSERT INTO rag_documents (doc_id, source_id, title, url, subject, course, chapter, knowledge_point)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [docId, sourceId, title, filePath, subject, course, chapter, title]
                    );
                    this.stats.synced++;
                }

                const chunks = chunkByHeadings(body);
                for (let i = 0; i < chunks.length; i++) {
                    const ch = chunks[i];
                    const chunkId = hashId(`${filePath}:${i}`);
                    await this.pool.query(
                        `INSERT INTO rag_chunks (chunk_id, doc_id, chunk_index, chunk_text, subject, course, knowledge_point, quality_score, is_active)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                        [chunkId, docId, i, ch.text, subject, course, ch.heading || title, 0.7]
                    );
                    this.stats.chunks++;
                }
            } catch (error) {
                console.warn(`同步失败 ${filePath}:`, error.message);
            }
        }
        return { ...this.stats };
    }
}

module.exports = ObsidianRagSync;
