const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");

router.use(authenticateJWT);

function getUserId(req) {
    return req.user.id;
}

async function ensureTables() {
    await pool.query(`CREATE TABLE IF NOT EXISTS canvases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

ensureTables().catch(e => console.warn("canvases table init:", e.message));

// GET / - Get all canvases for current user
router.get("/", async (req, res) => {
    try {
        const userId = getUserId(req);
        const [rows] = await pool.query(
            "SELECT id, name, created_at, updated_at FROM canvases WHERE user_id = ? ORDER BY updated_at DESC",
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error("获取画布列表失败:", e);
        res.status(500).json({ success: false, message: "获取画布列表失败" });
    }
});

// POST / - Create a new canvas
router.post("/", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, data } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "名称不能为空" });
        }
        const [result] = await pool.query("INSERT INTO canvases (user_id, name, data) VALUES (?, ?, ?)", [
            userId,
            name,
            data || null
        ]);
        res.json({ success: true, data: { id: result.insertId } });
    } catch (e) {
        console.error("创建画布失败:", e);
        res.status(500).json({ success: false, message: "创建画布失败" });
    }
});

// GET /elements/search - Search for elements to add to canvas
router.get("/elements/search", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { q } = req.query;
        if (!q) {
            return res.json({ success: true, data: [] });
        }
        const searchTerm = `%${q}%`;

        const [notes] = await pool.query(
            "SELECT id, title as name, 'note' as type, subject FROM notes WHERE (title LIKE ? OR body LIKE ?) AND user_id = ? LIMIT 10",
            [searchTerm, searchTerm, userId]
        );

        const [knowledgeNodes] = await pool.query(
            "SELECT id, name, 'knowledge' as type, subject FROM knowledge_nodes WHERE name LIKE ? LIMIT 10",
            [searchTerm]
        );

        const combined = [...notes, ...knowledgeNodes];
        res.json({ success: true, data: combined });
    } catch (e) {
        console.error("搜索元素失败:", e);
        res.status(500).json({ success: false, message: "搜索元素失败" });
    }
});

// GET /:id - Get canvas detail
router.get("/:id", async (req, res) => {
    try {
        const userId = getUserId(req);
        const [rows] = await pool.query("SELECT * FROM canvases WHERE id = ? AND user_id = ?", [req.params.id, userId]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: "画布不存在" });
        }
        const row = rows[0];
        if (row.data && typeof row.data === "string") {
            try {
                row.data = JSON.parse(row.data);
            } catch {
                /* keep as string */
            }
        }
        res.json({ success: true, data: row });
    } catch (e) {
        console.error("获取画布详情失败:", e);
        res.status(500).json({ success: false, message: "获取画布详情失败" });
    }
});

// PUT /:id - Update canvas
router.put("/:id", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, data } = req.body;
        const [result] = await pool.query(
            "UPDATE canvases SET name = ?, data = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
            [name, data, req.params.id, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "画布不存在" });
        }
        res.json({ success: true });
    } catch (e) {
        console.error("更新画布失败:", e);
        res.status(500).json({ success: false, message: "更新画布失败" });
    }
});

// DELETE /:id - Delete canvas
router.delete("/:id", async (req, res) => {
    try {
        const userId = getUserId(req);
        const [result] = await pool.query("DELETE FROM canvases WHERE id = ? AND user_id = ?", [req.params.id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "画布不存在" });
        }
        res.json({ success: true });
    } catch (e) {
        console.error("删除画布失败:", e);
        res.status(500).json({ success: false, message: "删除画布失败" });
    }
});

module.exports = router;
