const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");

router.use(authenticateJWT);

// POST / - 记录 Agent 决策
router.post("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            session_id,
            decision_type,
            trigger_event,
            observation_json,
            reasoning,
            tools_called,
            decision_summary,
            decision_detail,
            confidence
        } = req.body;

        if (!decision_type) {
            return res.status(400).json({ success: false, message: "decision_type 不能为空" });
        }

        const [result] = await pool.query(
            `INSERT INTO agent_decisions 
             (user_id, session_id, decision_type, trigger_event, 
              observation_json, reasoning, tools_called,
              decision_summary, decision_detail, confidence)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                userId,
                session_id || null,
                decision_type,
                trigger_event || null,
                observation_json ? JSON.stringify(observation_json) : null,
                reasoning || null,
                tools_called ? JSON.stringify(tools_called) : null,
                decision_summary || null,
                decision_detail ? JSON.stringify(decision_detail) : null,
                confidence || null
            ]
        );

        res.json({ success: true, id: result.insertId });
    } catch (e) {
        console.error("记录Agent决策失败:", e);
        res.status(500).json({ success: false, message: "记录失败" });
    }
});

// PUT /:id/follow-up - 更新决策后续结果
router.put("/:id/follow-up", async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { follow_up_result, status } = req.body;

        const [result] = await pool.query(
            `UPDATE agent_decisions 
             SET follow_up_result = ?, follow_up_checked_at = NOW(), status = ?
             WHERE id = ? AND user_id = ?`,
            [follow_up_result ? JSON.stringify(follow_up_result) : null, status || "confirmed", id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "决策不存在" });
        }

        res.json({ success: true });
    } catch (e) {
        console.error("更新决策结果失败:", e);
        res.status(500).json({ success: false, message: "更新失败" });
    }
});

// GET / - 查询决策历史
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { decision_type, limit = 20, offset = 0 } = req.query;

        let where = "WHERE user_id = ?";
        const params = [userId];

        if (decision_type) {
            where += " AND decision_type = ?";
            params.push(decision_type);
        }

        const [rows] = await pool.query(
            `SELECT id, decision_type, trigger_event, decision_summary, confidence, status, created_at
             FROM agent_decisions ${where} 
             ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        res.json({ success: true, data: rows });
    } catch (e) {
        console.error("查询决策历史失败:", e);
        res.status(500).json({ success: false, message: "查询失败" });
    }
});

// GET /:id - 获取单次决策详情（含完整推理链）
router.get("/:id", async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [rows] = await pool.query(`SELECT * FROM agent_decisions WHERE id = ? AND user_id = ?`, [id, userId]);

        if (!rows.length) {
            return res.status(404).json({ success: false, message: "决策不存在" });
        }

        res.json({ success: true, data: rows[0] });
    } catch (e) {
        console.error("获取决策详情失败:", e);
        res.status(500).json({ success: false, message: "获取失败" });
    }
});

module.exports = router;
