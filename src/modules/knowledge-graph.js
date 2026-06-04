const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");
const { buildVaultGraph } = require("../core/ObsidianQuestionSync");

router.use(authenticateJWT);

async function ensureNoteLinksTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS note_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            source_note_id INT NOT NULL,
            target_title VARCHAR(255) NOT NULL,
            target_note_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_source (source_note_id),
            INDEX idx_target (target_note_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

router.get("/", async (req, res) => {
    try {
        const graph = buildVaultGraph(undefined, { limit: req.query.limit || 260 });
        return res.json({
            success: true,
            data: {
                ...graph,
                nodes: graph.nodes.map(node => ({
                    ...node,
                    label: node.label || node.title,
                    type: node.kind || node.group || "knowledge",
                    subject: node.folder
                })),
                edges: graph.edges.map((edge, index) => ({
                    id: index + 1,
                    source: edge.source,
                    target: edge.target,
                    targetTitle: edge.target,
                    type: edge.type,
                    label: edge.label
                }))
            }
        });
    } catch (obsidianError) {
        console.warn("Obsidian图谱读取失败，回退数据库图谱:", obsidianError.message);
    }
    try {
        const userId = req.user.id;
        await ensureNoteLinksTable();

        const [notes] = await pool.query(
            `SELECT id, title, subject, updated_at
             FROM notes
             WHERE user_id = ?
             ORDER BY updated_at DESC`,
            [userId]
        );

        const noteIds = notes.map(note => note.id);
        let noteLinks = [];
        if (noteIds.length) {
            const placeholders = noteIds.map(() => "?").join(",");
            [noteLinks] = await pool.query(
                `SELECT id, source_note_id, target_title, target_note_id, created_at
                 FROM note_links
                 WHERE source_note_id IN (${placeholders})`,
                noteIds
            );
        }

        const [knowledgeNodes] = await pool.query(`SELECT id, name, subject FROM knowledge_nodes`);

        const nodes = [
            ...notes.map(note => ({
                id: `note-${note.id}`,
                label: note.title,
                type: "note",
                subject: note.subject,
                updatedAt: note.updated_at
            })),
            ...knowledgeNodes.map(kn => ({
                id: `knowledge-${kn.id}`,
                label: kn.name,
                type: "knowledge",
                subject: kn.subject
            }))
        ];

        const edges = noteLinks.map(link => ({
            id: link.id,
            source: `note-${link.source_note_id}`,
            target: link.target_note_id ? `note-${link.target_note_id}` : null,
            targetTitle: link.target_title,
            createdAt: link.created_at
        }));

        res.json({ success: true, data: { nodes, edges } });
    } catch (err) {
        console.error("获取知识图谱失败:", err);
        res.status(500).json({ success: false, message: "服务器内部错误" });
    }
});

router.post("/links", async (req, res) => {
    try {
        const sourceNoteId = req.body.source_note_id || req.body.sourceNoteId;
        const targetTitle = req.body.target_title || req.body.targetTitle;
        if (!sourceNoteId || !targetTitle) {
            return res.status(400).json({ success: false, message: "source_note_id 和 target_title 不能为空" });
        }
        await ensureNoteLinksTable();

        let targetNoteId = req.body.target_note_id || req.body.targetNoteId || null;
        if (!targetNoteId) {
            const [rows] = await pool.query(`SELECT id FROM notes WHERE title = ? LIMIT 1`, [targetTitle]);
            if (rows.length) {
                targetNoteId = rows[0].id;
            }
        }

        const [result] = await pool.query(
            `INSERT INTO note_links (source_note_id, target_title, target_note_id)
             VALUES (?, ?, ?)`,
            [sourceNoteId, targetTitle, targetNoteId]
        );

        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error("创建笔记链接失败:", err);
        res.status(500).json({ success: false, message: "服务器内部错误" });
    }
});

router.delete("/links/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: "无效的ID" });
        }
        await ensureNoteLinksTable();

        const [result] = await pool.query(`DELETE FROM note_links WHERE id = ?`, [id]);
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: "链接不存在" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("删除笔记链接失败:", err);
        res.status(500).json({ success: false, message: "服务器内部错误" });
    }
});

router.get("/note-links/:noteId", async (req, res) => {
    try {
        const { noteId } = req.params;
        if (!noteId || isNaN(parseInt(noteId))) {
            return res.status(400).json({ success: false, message: "无效的笔记ID" });
        }
        await ensureNoteLinksTable();

        const [rows] = await pool.query(
            `SELECT id, source_note_id, target_title, target_note_id, created_at
             FROM note_links
             WHERE source_note_id = ? OR target_note_id = ?
             ORDER BY created_at DESC`,
            [noteId, noteId]
        );

        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("查询笔记链接失败:", err);
        res.status(500).json({ success: false, message: "服务器内部错误" });
    }
});

module.exports = router;
