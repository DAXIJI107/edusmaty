const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware");
const pool = require("../db");

function toCsv(headers, rows) {
    const head = headers.join(",");
    const body = rows
        .map(row =>
            row
                .map(cell => {
                    const value = String(cell ?? "");
                    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                })
                .join(",")
        )
        .join("\n");
    return `${head}\n${body}\n`;
}

router.post("/export-report", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const format = String(req.body?.format || "csv").toLowerCase();
        const [columnRows] = await pool.query("SHOW COLUMNS FROM student_daily_features LIKE 'session_count'");
        const sessionColumn = columnRows.length ? "session_count" : "active_days";

        const [rows] = await pool.query(
            `SELECT DATE(date) AS date, study_duration, avg_accuracy, help_count,
                    COALESCE(${sessionColumn}, 0) AS session_count
             FROM student_daily_features
             WHERE user_id = ?
             ORDER BY date DESC
             LIMIT 60`,
            [userId]
        );

        const headers = ["date", "study_duration", "avg_accuracy", "help_count", "session_count"];
        const dataRows = rows.map(item => [
            item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
            Number(item.study_duration || 0),
            Number(item.avg_accuracy || 0),
            Number(item.help_count || 0),
            Number(item.session_count || 0)
        ]);
        const csv = toCsv(headers, dataRows);

        if (format === "pdf") {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="study-report.pdf"');
            const text = `Study Report\n\n${csv}`;
            return res.end(Buffer.from(text, "utf8"));
        }

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="study-report.${format === "excel" ? "csv" : "csv"}"`
        );
        res.end("\uFEFF" + csv);
    } catch (error) {
        console.error("导出报告失败:", error);
        res.status(500).json({ success: false, message: "导出失败" });
    }
});

module.exports = router;
