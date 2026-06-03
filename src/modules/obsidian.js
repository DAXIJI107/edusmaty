const express = require('express');
const pool = require('../db');
const { authenticateJWT, requireTeacher } = require('../middleware');
const {
    buildVaultIndex,
    buildVaultGraph,
    getVaultNote,
    parseObsidianQuestionBank,
    searchVault,
    syncObsidianQuestions,
    writeLearningPathMarkdown,
    writeVaultMarkdown
} = require('../core/ObsidianQuestionSync');

const router = express.Router();

router.use(authenticateJWT);

router.get('/knowledge-base', async (req, res) => {
    try {
        const index = buildVaultIndex();
        res.json({
            success: true,
            data: {
                vaultDir: index.vaultDir,
                stats: index.stats,
                folders: index.folders,
                tags: Object.entries(index.tags)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 30)
                    .map(([tag, total]) => ({ tag, total })),
                kinds: index.kinds,
                isolated: index.isolated,
                unresolved: index.unresolved,
                recent: index.recent,
                notes: index.notes.slice(0, 120).map(note => ({
                    path: note.path,
                    title: note.title,
                    folder: note.folder,
                    kind: note.kind,
                    tags: note.tags.slice(0, 6),
                    links: note.links.slice(0, 10),
                    updatedAt: note.updatedAt,
                    preview: note.preview,
                    obsidianUri: `obsidian://open?path=${encodeURIComponent(note.absolutePath)}`
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || '读取 Obsidian 知识库失败' });
    }
});

router.get('/graph', async (req, res) => {
    try {
        res.json({ success: true, data: buildVaultGraph(undefined, { limit: req.query.limit || 260 }) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || '生成 Obsidian 图谱失败' });
    }
});

router.get('/search', async (req, res) => {
    try {
        res.json({ success: true, data: searchVault(req.query.q || '') });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || '搜索 Obsidian 知识库失败' });
    }
});

router.get('/note', async (req, res) => {
    try {
        const note = getVaultNote(req.query.path || '');
        res.json({ success: true, data: note });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message || '笔记不存在' });
    }
});

router.post('/notes/write', async (req, res) => {
    try {
        const { title, body, folder, tags, links } = req.body || {};
        const requestedFolder = String(folder || '').trim();
        const safeFolder = requestedFolder && !/[?<>:*"|]/.test(requestedFolder) ? requestedFolder : '智能笔记';
        const note = writeVaultMarkdown({
            title: title || 'EduSmart 智能笔记',
            body: body || '',
            folder: safeFolder,
            tags: Array.isArray(tags) ? tags : String(tags || '智能笔记,edusmart').split(/[,，]/),
            links: Array.isArray(links) ? links : String(links || '').split(/[,，]/)
        });
        res.json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || '写入 Obsidian 笔记失败' });
    }
});

router.post('/paths/write', async (req, res) => {
    try {
        const note = writeLearningPathMarkdown(req.body || {});
        res.json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || '写入 Obsidian 学习路径失败' });
    }
});

router.get('/status', async (req, res) => {
    try {
        const parsed = parseObsidianQuestionBank();
        res.json({
            success: true,
            data: {
                vaultDir: parsed.vaultDir,
                files: parsed.files.length,
                questions: parsed.questions.length,
                subjects: parsed.subjects,
                courses: parsed.courses,
                sample: parsed.questions.slice(0, 5).map(item => ({
                    externalId: item.externalId,
                    subject: item.subject,
                    course: item.course,
                    knowledgePoint: item.knowledgePoint,
                    question: item.question
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || '读取 Obsidian 题库失败' });
    }
});

router.post('/sync/questions', requireTeacher, async (req, res) => {
    try {
        const result = await syncObsidianQuestions(pool);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Obsidian题库同步失败:', error);
        res.status(500).json({ success: false, message: error.message || 'Obsidian题库同步失败' });
    }
});

// POST /api/obsidian/sync-rag — 将 Obsidian Vault 同步到 RAG 知识库
router.post('/sync-rag', authenticateJWT, async (req, res) => {
    try {
        const ObsidianRagSync = require('../core/ObsidianRagSync');
        const syncer = new ObsidianRagSync(pool);
        const stats = await syncer.fullSync();
        res.json({ success: true, message: 'Obsidian Vault 已同步到 RAG', stats });
    } catch (error) {
        console.error('Obsidian同步RAG失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/obsidian/stats — 查看 Obsidian vault 文件统计
router.get('/stats', authenticateJWT, async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const vaultDir = path.join(__dirname, '..', '..', 'obsidian-vault');
        function countFiles(dir) {
            let count = 0;
            if (!fs.existsSync(dir)) return 0;
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                if (entry.name.startsWith('.')) continue;
                if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
                else if (entry.name.endsWith('.md')) count++;
            }
            return count;
        }
        res.json({ success: true, data: { mdFiles: countFiles(vaultDir), vaultPath: vaultDir } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
