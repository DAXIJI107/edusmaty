const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

function getUserId(req) {
    return req.user.id;
}

async function ensureTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS code_repositories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(128) NOT NULL,
            description VARCHAR(512) DEFAULT '',
            language VARCHAR(32) DEFAULT 'javascript',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS code_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            repository_id INT NOT NULL,
            filename VARCHAR(256) NOT NULL,
            content LONGTEXT,
            language VARCHAR(32) DEFAULT 'javascript',
            size_bytes INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (repository_id) REFERENCES code_repositories(id) ON DELETE CASCADE,
            INDEX idx_repo (repository_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

ensureTables().catch(e => console.warn('code-repo tables init:', e.message));

router.post('/create', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, description, language } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: '仓库名称不能为空' });
        }
        const [result] = await pool.query(
            'INSERT INTO code_repositories (user_id, name, description, language) VALUES (?, ?, ?, ?)',
            [userId, name.trim(), (description || '').trim(), (language || 'javascript').toLowerCase()]
        );
        res.json({
            success: true,
            data: { id: result.insertId, name: name.trim(), description: description || '', language: (language || 'javascript').toLowerCase(), fileCount: 0 }
        });
    } catch (error) {
        console.error('创建仓库失败:', error);
        res.status(500).json({ success: false, message: '创建仓库失败' });
    }
});

router.get('/list', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const [repos] = await pool.query(
            'SELECT r.*, (SELECT COUNT(*) FROM code_files f WHERE f.repository_id = r.id) AS file_count FROM code_repositories r WHERE r.user_id = ? ORDER BY r.updated_at DESC',
            [userId]
        );
        res.json({ success: true, data: repos });
    } catch (error) {
        console.error('获取仓库列表失败:', error);
        res.status(500).json({ success: false, message: '获取仓库列表失败' });
    }
});

router.get('/:id/files', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const repoId = Number(req.params.id);
        const [repos] = await pool.query('SELECT * FROM code_repositories WHERE id = ? AND user_id = ?', [repoId, userId]);
        if (!repos.length) {
            return res.status(404).json({ success: false, message: '仓库不存在' });
        }
        const [files] = await pool.query(
            'SELECT id, repository_id, filename, language, size_bytes, created_at, updated_at FROM code_files WHERE repository_id = ? ORDER BY filename',
            [repoId]
        );
        res.json({ success: true, data: { repo: repos[0], files } });
    } catch (error) {
        console.error('获取文件列表失败:', error);
        res.status(500).json({ success: false, message: '获取文件列表失败' });
    }
});

router.get('/:id/file/:fileId', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const repoId = Number(req.params.id);
        const fileId = Number(req.params.fileId);
        const [repos] = await pool.query('SELECT * FROM code_repositories WHERE id = ? AND user_id = ?', [repoId, userId]);
        if (!repos.length) {
            return res.status(404).json({ success: false, message: '仓库不存在' });
        }
        const [files] = await pool.query('SELECT * FROM code_files WHERE id = ? AND repository_id = ?', [fileId, repoId]);
        if (!files.length) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }
        res.json({ success: true, data: files[0] });
    } catch (error) {
        console.error('获取文件失败:', error);
        res.status(500).json({ success: false, message: '获取文件失败' });
    }
});

router.post('/:id/upload', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const repoId = Number(req.params.id);
        const [repos] = await pool.query('SELECT * FROM code_repositories WHERE id = ? AND user_id = ?', [repoId, userId]);
        if (!repos.length) {
            return res.status(404).json({ success: false, message: '仓库不存在' });
        }
        const { filename, content, language } = req.body;
        if (!filename || !filename.trim()) {
            return res.status(400).json({ success: false, message: '文件名不能为空' });
        }
        if (content === undefined || content === null) {
            return res.status(400).json({ success: false, message: '文件内容不能为空' });
        }
        const safeName = filename.trim();
        const fileLang = (language || repos[0].language || 'javascript').toLowerCase();
        const size = Buffer.byteLength(String(content), 'utf-8');

        const [existing] = await pool.query(
            'SELECT id FROM code_files WHERE repository_id = ? AND filename = ?',
            [repoId, safeName]
        );
        if (existing.length) {
            await pool.query(
                'UPDATE code_files SET content = ?, language = ?, size_bytes = ?, updated_at = NOW() WHERE id = ?',
                [String(content), fileLang, size, existing[0].id]
            );
            return res.json({
                success: true,
                data: { id: existing[0].id, filename: safeName, language: fileLang, size_bytes: size, updated: true }
            });
        }

        const [result] = await pool.query(
            'INSERT INTO code_files (repository_id, filename, content, language, size_bytes) VALUES (?, ?, ?, ?, ?)',
            [repoId, safeName, String(content), fileLang, size]
        );
        res.json({
            success: true,
            data: { id: result.insertId, filename: safeName, language: fileLang, size_bytes: size, updated: false }
        });
    } catch (error) {
        console.error('上传文件失败:', error);
        res.status(500).json({ success: false, message: '上传文件失败' });
    }
});

router.delete('/:id/file/:fileId', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const repoId = Number(req.params.id);
        const fileId = Number(req.params.fileId);
        const [repos] = await pool.query('SELECT * FROM code_repositories WHERE id = ? AND user_id = ?', [repoId, userId]);
        if (!repos.length) {
            return res.status(404).json({ success: false, message: '仓库不存在' });
        }
        await pool.query('DELETE FROM code_files WHERE id = ? AND repository_id = ?', [fileId, repoId]);
        res.json({ success: true, message: '文件已删除' });
    } catch (error) {
        console.error('删除文件失败:', error);
        res.status(500).json({ success: false, message: '删除文件失败' });
    }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const repoId = Number(req.params.id);
        const [repos] = await pool.query('SELECT * FROM code_repositories WHERE id = ? AND user_id = ?', [repoId, userId]);
        if (!repos.length) {
            return res.status(404).json({ success: false, message: '仓库不存在' });
        }
        await pool.query('DELETE FROM code_repositories WHERE id = ?', [repoId]);
        res.json({ success: true, message: '仓库已删除' });
    } catch (error) {
        console.error('删除仓库失败:', error);
        res.status(500).json({ success: false, message: '删除仓库失败' });
    }
});

module.exports = router;