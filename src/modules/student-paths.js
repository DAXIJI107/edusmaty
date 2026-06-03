const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');
const { createNotification } = require('./notifications');

router.use(authenticateJWT);

pool.query("ALTER TABLE teacher_path_step_progress ADD COLUMN notes TEXT").catch(() => {});

// ========== 保存/更新步骤笔记 ==========
router.post('/notes', async (req, res) => {
    try {
        const { assignment_id, step_id, notes } = req.body;
        if (!assignment_id || !step_id) {
            return res.status(400).json({ success: false, message: '参数不完整' });
        }
        const [[progress]] = await pool.query(
            "SELECT id FROM teacher_path_step_progress WHERE assignment_id = ? AND step_id = ?",
            [assignment_id, step_id]
        );
        if (!progress) return res.status(404).json({ success: false, message: '未找到步骤进度记录' });
        await pool.query(
            "UPDATE teacher_path_step_progress SET notes = ? WHERE id = ?",
            [notes || '', progress.id]
        );
        res.json({ success: true, message: '笔记已保存' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取路径笔记 ==========
router.get('/notes/:assignmentId', async (req, res) => {
    try {
        const [notes] = await pool.query(
            `SELECT tsps.id, tsps.step_id, tsps.notes, tsps.completed_at, tps.title
             FROM teacher_path_step_progress tsps
             JOIN teacher_path_steps tps ON tsps.step_id = tps.id
             WHERE tsps.assignment_id = ? AND tsps.notes IS NOT NULL AND tsps.notes != ''
             ORDER BY tps.sort_order`,
            [req.params.assignmentId]
        );
        res.json({ success: true, notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 检查学生是否有活跃的锁定路径 ==========
router.get('/active', async (req, res) => {
    try {
        if (req.user.role === 'teacher' || req.user.role === 'admin') {
            return res.json({ success: true, active: false });
        }
        const [[active]] = await pool.query(
            `SELECT tpa.id, tpa.path_id, tpa.status, tpa.current_step, tpa.total_steps,
                    tpa.completed_steps, tpa.started_at, tpa.deadline_at, tpa.scheduled_at,
                    lp.name, lp.subject
             FROM teacher_path_assignments tpa
             JOIN teacher_learning_paths lp ON tpa.path_id = lp.id
             WHERE tpa.student_id = ? AND tpa.status = 'in_progress'
             ORDER BY tpa.started_at DESC LIMIT 1`,
            [req.user.id]
        );
        if (!active) return res.json({ success: true, active: false });

        const [currentStep] = await pool.query(
            "SELECT *, resource_id, resource_type FROM teacher_path_steps WHERE path_id = ? ORDER BY sort_order LIMIT 1 OFFSET ?",
            [active.path_id, active.current_step - 1]
        );
        const [allSteps] = await pool.query(
            "SELECT id, title, type, duration_minutes, sort_order, resource_id, resource_type FROM teacher_path_steps WHERE path_id = ? ORDER BY sort_order",
            [active.path_id]
        );
        const [stepProgress] = await pool.query(
            `SELECT tsps.*, tps.title
             FROM teacher_path_step_progress tsps
             JOIN teacher_path_steps tps ON tsps.step_id = tps.id
             WHERE tsps.assignment_id = ? ORDER BY tps.sort_order`,
            [active.id]
        );

        res.json({
            success: true,
            active: true,
            assignmentId: active.id,
            pathId: active.path_id,
            pathName: active.name,
            subject: active.subject,
            currentStep: active.current_step,
            totalSteps: active.total_steps,
            completedSteps: active.completed_steps,
            deadlineAt: active.deadline_at,
            scheduledAt: active.scheduled_at,
            currentStepData: currentStep[0] || null,
            allSteps,
            stepProgress
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取指定路径的完整内容(含所有步骤) ==========
router.get('/:pathId/content', async (req, res) => {
    try {
        const [[assignment]] = await pool.query(
            `SELECT tpa.*, lp.name, lp.subject
             FROM teacher_path_assignments tpa
             JOIN teacher_learning_paths lp ON tpa.path_id = lp.id
             WHERE tpa.path_id = ? AND tpa.student_id = ? AND tpa.status = 'in_progress'`,
            [req.params.pathId, req.user.id]
        );
        if (!assignment) return res.status(404).json({ success: false, message: '未找到活跃路径' });

        const [steps] = await pool.query(
            "SELECT * FROM teacher_path_steps WHERE path_id = ? ORDER BY sort_order",
            [req.params.pathId]
        );
        const [stepProgress] = await pool.query(
            `SELECT tsps.* FROM teacher_path_step_progress tsps
             WHERE tsps.assignment_id = ? ORDER BY tsps.id`,
            [assignment.id]
        );

        res.json({
            success: true,
            assignment,
            steps,
            stepProgress,
            currentStepIndex: assignment.current_step - 1
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 完成一个步骤并推进到下一步 ==========
router.post('/step-complete', async (req, res) => {
    try {
        const { assignment_id, step_id, answer } = req.body;
        if (!assignment_id || !step_id) {
            return res.status(400).json({ success: false, message: '参数不完整' });
        }
        const [[assignment]] = await pool.query(
            "SELECT * FROM teacher_path_assignments WHERE id = ? AND student_id = ? AND status = 'in_progress'",
            [assignment_id, req.user.id]
        );
        if (!assignment) return res.status(404).json({ success: false, message: '未找到活跃的路径任务' });

        const [[step]] = await pool.query(
            "SELECT * FROM teacher_path_steps WHERE id = ? AND path_id = ?",
            [step_id, assignment.path_id]
        );
        if (!step) return res.status(404).json({ success: false, message: '步骤未找到' });

        const isQuiz = step.type === 'quiz' || step.type === 'code' || step.type === 'exercise';
        let is_correct = null;
        if (isQuiz && step.correct_answer) {
            is_correct = (answer || '').trim().toLowerCase() === step.correct_answer.trim().toLowerCase() ? 1 : 0;
        }

        await pool.query(
            "UPDATE teacher_path_step_progress SET status = 'completed', answer = ?, is_correct = ?, completed_at = NOW() WHERE assignment_id = ? AND step_id = ?",
            [answer || '', is_correct, assignment_id, step_id]
        );

        const newStep = assignment.current_step + 1;
        const newCompleted = assignment.completed_steps + 1;
        let pathCompleted = false;
        let nextStepData = null;

        if (newCompleted >= assignment.total_steps) {
            await pool.query(
                "UPDATE teacher_path_assignments SET status = 'completed', completed_steps = ?, current_step = ?, completed_at = NOW() WHERE id = ?",
                [newCompleted, newStep, assignment_id]
            );
            pathCompleted = true;
            const [[pathInfo]] = await pool.query(
                "SELECT name, teacher_id FROM teacher_learning_paths WHERE id = ?", [assignment.path_id]
            );
            const pathName = pathInfo?.name || '学习路径';
            createNotification(req.user.id, '学习路径完成', `恭喜！你已完成学习路径「${pathName}」的全部步骤。`, 'path_completed', assignment.path_id, '/home');
            if (pathInfo?.teacher_id) {
                createNotification(pathInfo.teacher_id, '学生完成路径', `学生已完成学习路径「${pathName}」的全部步骤。`, 'path_completed', assignment.path_id, `/teacher/paths/${assignment.path_id}`);
            }
        } else {
            await pool.query(
                "UPDATE teacher_path_assignments SET completed_steps = ?, current_step = ? WHERE id = ?",
                [newCompleted, newStep, assignment_id]
            );
            const [nextStep] = await pool.query(
                "SELECT * FROM teacher_path_steps WHERE path_id = ? ORDER BY sort_order LIMIT 1 OFFSET ?",
                [assignment.path_id, newStep - 1]
            );
            nextStepData = nextStep[0] || null;
            if (nextStepData) {
                await pool.query(
                    "INSERT INTO teacher_path_step_progress (assignment_id, step_id, status) VALUES (?, ?, 'in_progress') ON DUPLICATE KEY UPDATE status = 'in_progress'",
                    [assignment_id, nextStepData.id]
                );
            }
        }

        res.json({
            success: true,
            message: pathCompleted ? '🎉 恭喜！你已完成全部学习路径，已解锁自由学习模式！' : `步骤 ${newCompleted}/${assignment.total_steps} 已完成，进入下一步`,
            pathCompleted,
            currentStep: newStep,
            completedSteps: newCompleted,
            totalSteps: assignment.total_steps,
            nextStep: nextStepData ? { id: nextStepData.id, title: nextStepData.title, type: nextStepData.type } : null,
            is_correct
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 学生路径仪表盘 ==========
router.get('/dashboard', async (req, res) => {
    try {
        const [activeAssignments] = await pool.query(
            `SELECT tpa.id, tpa.path_id, tpa.status, tpa.current_step, tpa.total_steps,
                    tpa.completed_steps, tpa.started_at, tpa.completed_at,
                    lp.name, lp.subject, lp.description
             FROM teacher_path_assignments tpa
             JOIN teacher_learning_paths lp ON tpa.path_id = lp.id
             WHERE tpa.student_id = ? AND tpa.status = 'in_progress'
             ORDER BY tpa.started_at DESC`,
            [req.user.id]
        );

        const [completedAssignments] = await pool.query(
            `SELECT tpa.id, tpa.path_id, tpa.status, tpa.current_step, tpa.total_steps,
                    tpa.completed_steps, tpa.started_at, tpa.completed_at,
                    lp.name, lp.subject, lp.description,
                    (SELECT AVG(tsps.is_correct) * 100 FROM teacher_path_step_progress tsps
                     JOIN teacher_path_steps tps ON tsps.step_id = tps.id
                     WHERE tsps.assignment_id = tpa.id AND tps.type IN ('quiz', 'code', 'exercise')) as score
             FROM teacher_path_assignments tpa
             JOIN teacher_learning_paths lp ON tpa.path_id = lp.id
             WHERE tpa.student_id = ? AND tpa.status = 'completed'
             ORDER BY tpa.completed_at DESC
             LIMIT 20`,
            [req.user.id]
        );

        res.json({
            success: true,
            active: activeAssignments,
            completed: completedAssignments,
            upcoming: []
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
