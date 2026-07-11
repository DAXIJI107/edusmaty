const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");

router.use(authenticateJWT);

async function ensureTables() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('path_assigned','path_completed','path_unlocked','step_due','scheduled','system') DEFAULT 'system',
    is_read TINYINT DEFAULT 0,
    related_id INT,
    link VARCHAR(300),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link VARCHAR(300)");
}

let _tablesReady = false;
router.use(async (req, res, next) => {
  if (!_tablesReady) {
    _tablesReady = true;
    await ensureTables().catch(() => {});
  }
  next();
});

router.get("/", async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const [notifications] = await pool.query(
            "SELECT id, title, content, type, is_read, related_id, link, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [req.user.id, parseInt(limit), parseInt(offset)]
        );
        const [[countResult]] = await pool.query(
            "SELECT COUNT(*) as total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread FROM notifications WHERE user_id = ?",
            [req.user.id]
        );
        res.json({ success: true, notifications, total: countResult.total, unread: countResult.unread || 0 });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/unread-count", async (req, res) => {
    try {
        const [[result]] = await pool.query(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
            [req.user.id]
        );
        res.json({ success: true, count: result.count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/:id/read", async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [
            req.params.id,
            req.user.id
        ]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/mark-all-read", async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0", [req.user.id]);
        res.json({ success: true, message: "全部已读" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

async function createNotification(userId, title, content, type, relatedId = null, link = null) {
    try {
        await pool.query(
            "INSERT INTO notifications (user_id, title, content, type, related_id, link) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, title, content, type, relatedId, link]
        );
    } catch (e) {
        /* silent */
    }
}

module.exports = router;
module.exports.createNotification = createNotification;
module.exports.ensureTables = ensureTables;
