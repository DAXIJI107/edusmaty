const test = require("node:test");
const assert = require("node:assert/strict");
const pool = require("../src/db");
const LearningLoopService = require("../src/core/LearningLoopService");

test("TCP goal completes diagnosis, persists plan and adjusts after practice", async () => {
    const service = new LearningLoopService(pool);
    const marker = `loop_test_${Date.now()}`;
    let userId;
    let goalId;
    const questionIds = [];

    try {
        const [user] = await pool.query(
            "INSERT INTO users (username, email, password, role, status) VALUES (?, ?, 'test-only', 'student', 'active')",
            [marker, `${marker}@example.test`]
        );
        userId = user.insertId;

        const started = await service.start({ userId, goal: "我想学习 TCP", durationDays: 3 });
        assert.equal(started.stage, "diagnosis_required");
        assert.equal(started.questions.length, 5);
        goalId = started.goalId;
        const pending = await service.status(userId, goalId);
        assert.equal(pending.stage, "diagnosis_required");
        assert.equal(pending.questions.length, 5);

        const [rows] = await pool.query("SELECT id, correct_answer FROM questions WHERE id IN (?)", [
            started.questions.map(question => question.id)
        ]);
        const correctAnswers = Object.fromEntries(rows.map(row => [row.id, row.correct_answer]));
        rows.forEach(row => questionIds.push(row.id));

        const planned = await service.submitDiagnosis({ userId, goalId, answers: correctAnswers });
        assert.equal(planned.stage, "plan_ready");
        assert.equal(planned.plan.days.length, 3);

        const restored = await service.status(userId, goalId);
        assert.equal(restored.stage, "plan_ready");
        assert.equal(restored.tasks.length, 3);
        assert.ok(restored.mastery.evidenceCount >= 5);
        assert.equal(restored.questions.length, 0);

        const wrongAnswers = Object.fromEntries(questionIds.map(id => [id, "__wrong__"]));
        const adjusted = await service.submitPractice({ userId, goalId, answers: wrongAnswers });
        assert.equal(adjusted.stage, "plan_adjusted");
        assert.equal(adjusted.adjustment.type, "remediation");

        const [futureTasks] = await pool.query(
            `SELECT title FROM study_tasks
             WHERE user_id = ? AND source = 'agent-learning-loop' AND task_date > CURDATE()`,
            [userId]
        );
        assert.ok(futureTasks.every(task => task.title.startsWith("补救学习")));
    } finally {
        if (userId) {
            await pool.query("DELETE FROM study_tasks WHERE user_id = ?", [userId]);
            await pool.query("DELETE FROM user_answers WHERE user_id = ?", [userId]);
            await pool.query("DELETE FROM student_knowledge WHERE user_id = ?", [userId]);
            await pool.query("DELETE FROM agent_learning_plans WHERE user_id = ?", [userId]);
            await pool.query("DELETE FROM learning_goals WHERE user_id = ?", [userId]);
            await pool.query("DELETE FROM users WHERE id = ?", [userId]);
        }
        await pool.end();
    }
});
