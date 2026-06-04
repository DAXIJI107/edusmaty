class FeedbackLoopEngine {
    async recordCycle(pool, { userId, examRecordId }) {
        const [exam] = await pool.query(`SELECT * FROM exam_records WHERE id = ? AND user_id = ?`, [
            examRecordId,
            userId
        ]);
        if (exam.length === 0) return null;

        const [answers] = await pool.query(
            `SELECT ua.question_id, q.node_id, ua.created_at
             FROM user_answers ua
             JOIN questions q ON ua.question_id = q.id
             WHERE ua.user_exam_id = ?`,
            [examRecordId]
        );

        const nodeIds = [...new Set(answers.map(a => a.node_id).filter(Boolean))];

        const beforeMastery = {};
        for (const nodeId of nodeIds) {
            const [m] = await pool.query(`SELECT mastery FROM student_knowledge WHERE user_id = ? AND node_id = ?`, [
                userId,
                nodeId
            ]);
            beforeMastery[nodeId] = m.length > 0 ? m[0].mastery : 0;
        }

        const [errors] = await pool.query(
            `SELECT COUNT(*) as count FROM error_book 
             WHERE user_id = ? AND exam_record_id = ? AND status = 'solved'`,
            [userId, examRecordId]
        );

        const [recommendations] = await pool.query(
            `SELECT * FROM study_recommendations 
             WHERE user_id = ? AND trigger_id = ? AND trigger_type = 'after_exam'
             ORDER BY created_at DESC LIMIT 1`,
            [userId, examRecordId]
        );

        const weakPoints = nodeIds.map(id => ({ nodeId: id, masteryBefore: beforeMastery[id] || 0 }));

        const [result] = await pool.query(
            `INSERT INTO feedback_loop (user_id, cycle_start, exam_record_id, weak_points, recommended_courses, error_solved_count)
             VALUES (?, CURDATE(), ?, ?, ?, ?)`,
            [
                userId,
                examRecordId,
                JSON.stringify(weakPoints),
                JSON.stringify(recommendations.length > 0 ? recommendations[0] : {}),
                errors[0]?.count || 0
            ]
        );

        return { loopId: result.insertId, weakPoints, errorSolvedCount: errors[0]?.count || 0 };
    }

    async closeCycle(pool, { userId, loopId }) {
        const [loop] = await pool.query(`SELECT * FROM feedback_loop WHERE id = ? AND user_id = ?`, [loopId, userId]);
        if (loop.length === 0) return null;

        const weakPoints =
            typeof loop[0].weak_points === "string" ? JSON.parse(loop[0].weak_points) : loop[0].weak_points || [];

        const masteryImprovement = {};
        for (const wp of weakPoints) {
            const [m] = await pool.query(`SELECT mastery FROM student_knowledge WHERE user_id = ? AND node_id = ?`, [
                userId,
                wp.nodeId
            ]);
            const newMastery = m.length > 0 ? m[0].mastery : 0;
            masteryImprovement[wp.nodeId] = {
                before: wp.masteryBefore || 0,
                after: newMastery,
                improved: newMastery - (wp.masteryBefore || 0)
            };
        }

        const improvements = Object.values(masteryImprovement);
        const effectiveness =
            improvements.length > 0 ? improvements.reduce((s, v) => s + v.improved, 0) / improvements.length : 0;

        await pool.query(
            `UPDATE feedback_loop SET cycle_end = CURDATE(), mastery_improvement = ?, cycle_effectiveness = ? WHERE id = ?`,
            [JSON.stringify(masteryImprovement), effectiveness, loopId]
        );

        return { loopId, masteryImprovement, cycleEffectiveness: effectiveness };
    }

    async getUserLoops(pool, { userId, limit = 10 }) {
        const [rows] = await pool.query(
            `SELECT * FROM feedback_loop WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
            [userId, limit]
        );
        return rows.map(r => ({
            ...r,
            weak_points: typeof r.weak_points === "string" ? JSON.parse(r.weak_points) : r.weak_points,
            mastery_improvement:
                typeof r.mastery_improvement === "string" ? JSON.parse(r.mastery_improvement) : r.mastery_improvement
        }));
    }
}

module.exports = FeedbackLoopEngine;
