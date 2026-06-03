const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

router.use(authenticateJWT);

// ========== 智能组卷 ==========
router.post('/smart-paper', async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, difficulty, questionCount, focusNodes } = req.body;
        const SmartPaperGenerator = require('../core/SmartPaperGenerator');
        const generator = new SmartPaperGenerator();
        const paper = await generator.generate(pool, { userId, subject, difficulty, questionCount, focusNodes });
        res.json({ success: true, paper });
    } catch (error) {
        console.error('智能组卷失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/smart-paper/start', async (req, res) => {
    try {
        const userId = req.user.id;
        const { paper } = req.body;
        if (!paper || !paper.questions || !paper.questions.length) {
            return res.status(400).json({ success: false, message: '试卷数据无效' });
        }
        const questionIds = paper.questions.map(q => q.id);
        const duration = Math.max(paper.totalQuestions * 2, 30);

        const [result] = await pool.query(
            `INSERT INTO exam_records (user_id, exam_id, question_ids, start_time, status, paper_type, knowledge_coverage)
             VALUES (?, NULL, ?, NOW(), 'in_progress', 'smart', ?)`,
            [userId, JSON.stringify(questionIds), JSON.stringify(paper.knowledgeCoverage || [])]
        );

        res.json({
            success: true,
            examRecordId: result.insertId,
            totalQuestions: paper.totalQuestions,
            duration,
            questions: paper.questions
        });
    } catch (error) {
        console.error('启动智能组卷失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 专项练习 ==========
router.get('/practice', async (req, res) => {
    try {
        const userId = req.user.id;
        const { nodeId, count = 10 } = req.query;

        let whereClause = 'WHERE q.is_active = 1';
        const params = [];

        if (nodeId) {
            whereClause += ' AND q.node_id = ?';
            params.push(parseInt(nodeId));
        } else {
            whereClause += ` AND q.node_id IN (
                SELECT node_id FROM student_knowledge 
                WHERE user_id = ? AND mastery < 50 ORDER BY mastery ASC LIMIT 5
            )`;
            params.push(userId);
        }

        const [questions] = await pool.query(
            `SELECT q.id, q.content, q.type, q.options, q.answer, q.score, q.difficulty, q.node_id, kn.name as node_name, kn.subject
             FROM questions q
             LEFT JOIN knowledge_nodes kn ON q.node_id = kn.id
             ${whereClause}
             ORDER BY RAND() LIMIT ?`,
            [...params, parseInt(count)]
        );

        if (questions.length === 0) {
            const [fallback] = await pool.query(
                `SELECT q.id, q.content, q.type, q.options, q.answer, q.score, q.difficulty, q.node_id, kn.name as node_name, kn.subject
                 FROM questions q
                 LEFT JOIN knowledge_nodes kn ON q.node_id = kn.id
                 WHERE q.is_active = 1
                 ORDER BY RAND() LIMIT ?`,
                [parseInt(count)]
            );
            return res.json({ success: true, questions: fallback, source: 'random' });
        }

        res.json({ success: true, questions, source: 'weakness' });
    } catch (error) {
        console.error('获取练习题失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/practice/submit', async (req, res) => {
    try {
        const userId = req.user.id;
        const { answers, knowledgeNodeId, duration } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: '答题数据无效' });
        }

        let correctCount = 0;
        const results = [];

        for (const ans of answers) {
            const [rows] = await pool.query(
                `SELECT answer, score, node_id FROM questions WHERE id = ? AND is_active = 1`,
                [ans.questionId]
            );
            if (rows.length === 0) continue;

            const correct = (ans.userAnswer || '').trim() === (rows[0].answer || '').trim();
            if (correct) correctCount++;

            results.push({
                questionId: ans.questionId,
                userAnswer: ans.userAnswer,
                correctAnswer: rows[0].answer,
                isCorrect: correct,
                score: correct ? parseFloat(rows[0].score) : 0,
                nodeId: rows[0].node_id
            });
        }

        const totalScore = results.reduce((s, r) => s + r.score, 0);
        const totalQuestions = results.length;
        const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions * 100) : 0;

        const [record] = await pool.query(
            `INSERT INTO practice_records (user_id, knowledge_node_id, question_ids, answers, score, total, duration, practice_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                knowledgeNodeId || null,
                JSON.stringify(answers.map(a => a.questionId)),
                JSON.stringify(results),
                totalScore,
                totalScore,
                duration || 0,
                knowledgeNodeId ? 'weakness' : 'random'
            ]
        );

        if (knowledgeNodeId) {
            await pool.query(
                `UPDATE student_knowledge SET last_practice_at = NOW() WHERE user_id = ? AND node_id = ?`,
                [userId, knowledgeNodeId]
            );
        }

        res.json({
            success: true,
            practiceRecordId: record.insertId,
            totalQuestions,
            correctCount,
            accuracy,
            totalScore,
            results
        });
    } catch (error) {
        console.error('提交练习失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 学习推荐 ==========
router.get('/recommend/after-exam/:examRecordId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { examRecordId } = req.params;
        const RecommendationEngine = require('../core/RecommendationEngine');
        const engine = new RecommendationEngine();
        const recommendation = await engine.afterExam(pool, { userId, examRecordId: parseInt(examRecordId) });

        await pool.query(
            `INSERT INTO study_recommendations (user_id, trigger_type, trigger_id, recommended_json)
             VALUES (?, 'after_exam', ?, ?)`,
            [userId, parseInt(examRecordId), JSON.stringify(recommendation)]
        );

        res.json({ success: true, recommendation });
    } catch (error) {
        console.error('考后推荐失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/recommend/daily', async (req, res) => {
    try {
        const userId = req.user.id;
        const RecommendationEngine = require('../core/RecommendationEngine');
        const engine = new RecommendationEngine();
        const recommendation = await engine.daily(pool, { userId });

        await pool.query(
            `INSERT INTO study_recommendations (user_id, trigger_type, recommended_json)
             VALUES (?, 'daily', ?)`,
            [userId, JSON.stringify(recommendation)]
        );

        res.json({ success: true, recommendation });
    } catch (error) {
        console.error('每日推荐失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 错题本增强 API ==========
router.get('/error-book', async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, status, limit = 50 } = req.query;
        let where = 'WHERE eb.user_id = ?';
        const params = [userId];

        if (subject && subject !== 'all') {
            where += ' AND eb.subject = ?';
            params.push(subject);
        }
        if (status && status !== 'all') {
            where += ' AND eb.status = ?';
            params.push(status);
        }

        const [errors] = await pool.query(
            `SELECT eb.*, q.content as question_content, q.type as question_type, 
                    q.options as question_options, q.answer as question_answer, q.difficulty as question_difficulty,
                    kn.name as node_name
             FROM error_book eb
             LEFT JOIN questions q ON eb.question_id = q.id
             LEFT JOIN knowledge_nodes kn ON eb.knowledge_node_id = kn.id
             ${where}
             ORDER BY eb.created_at DESC LIMIT ?`,
            [...params, parseInt(limit)]
        );

        const [stats] = await pool.query(
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN status = 'unsolved' THEN 1 ELSE 0 END) as unsolved,
                    SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) as solved
             FROM error_book WHERE user_id = ?`,
            [userId]
        );

        const total = stats[0].total || 0;
        const solved = stats[0].solved || 0;

        res.json({
            success: true,
            errors,
            stats: {
                total,
                unsolved: stats[0].unsolved || 0,
                solved,
                resolutionRate: total > 0 ? Math.round(solved / total * 100) : 0
            }
        });
    } catch (error) {
        console.error('获取错题失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/error-book/auto-collect', async (req, res) => {
    try {
        const userId = req.user.id;
        const { examRecordId } = req.body;
        const RecommendationEngine = require('../core/RecommendationEngine');
        const engine = new RecommendationEngine();
        const recommendation = await engine.afterExam(pool, { userId, examRecordId });

        let inserted = 0;
        for (const err of recommendation.autoErrors) {
            const [existing] = await pool.query(
                `SELECT id FROM error_book WHERE user_id = ? AND question_id = ?`,
                [userId, err.question_id]
            );
            if (existing.length === 0) {
                await pool.query(
                    `INSERT INTO error_book (user_id, question_id, exam_record_id, wrong_answer, correct_answer, knowledge_node_id, subject, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'unsolved')`,
                    [userId, err.question_id, examRecordId, err.wrong_answer, err.correct_answer, err.knowledge_node_id, err.subject]
                );
                inserted++;
            }
        }

        const FeedbackLoopEngine = require('../core/FeedbackLoopEngine');
        const fbEngine = new FeedbackLoopEngine();
        await fbEngine.recordCycle(pool, { userId, examRecordId });

        res.json({ success: true, inserted, totalErrors: recommendation.autoErrors.length });
    } catch (error) {
        console.error('自动收录错题失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/error-book/redo', async (req, res) => {
    try {
        const userId = req.user.id;
        const { errorIds } = req.body;

        let whereClause = 'WHERE eb.user_id = ?';
        const params = [userId];

        if (errorIds && errorIds.length > 0) {
            whereClause += ` AND eb.id IN (${errorIds.map(() => '?').join(',')})`;
            params.push(...errorIds);
        } else {
            whereClause += " AND eb.status = 'unsolved'";
        }

        const [errors] = await pool.query(
            `SELECT eb.id as error_id, eb.question_id, q.content, q.type, q.options, q.answer, q.score, q.difficulty, q.node_id
             FROM error_book eb
             JOIN questions q ON eb.question_id = q.id
             ${whereClause} LIMIT 20`,
            params
        );

        if (errors.length === 0) {
            return res.json({ success: false, message: '没有可重做的错题' });
        }

        res.json({ success: true, questions: errors, total: errors.length });
    } catch (error) {
        console.error('错题重做失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/error-book/:id/status', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status, redo_correct } = req.body;

        const updates = ['status = ?'];
        const params = [status || 'solved'];

        if (redo_correct !== undefined) {
            updates.push('redo_correct = ?');
            params.push(redo_correct ? 1 : 0);
        }

        const [result] = await pool.query(
            `UPDATE error_book SET ${updates.join(', ')}, redo_count = redo_count + 1, updated_at = NOW() WHERE id = ? AND user_id = ?`,
            [...params, parseInt(id), userId]
        );

        res.json({ success: true, affected: result.affectedRows });
    } catch (error) {
        console.error('更新错题状态失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/error-book/stats', async (req, res) => {
    try {
        const userId = req.user.id;

        const [overall] = await pool.query(
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) as solved,
                    SUM(CASE WHEN status = 'unsolved' THEN 1 ELSE 0 END) as unsolved
             FROM error_book WHERE user_id = ?`,
            [userId]
        );

        const [bySubject] = await pool.query(
            `SELECT subject, COUNT(*) as count, 
                    SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) as solved
             FROM error_book WHERE user_id = ? GROUP BY subject`,
            [userId]
        );

        const [byErrorType] = await pool.query(
            `SELECT error_type, COUNT(*) as count FROM error_book 
             WHERE user_id = ? AND error_type IS NOT NULL GROUP BY error_type`,
            [userId]
        );

        res.json({
            success: true,
            overall: overall[0],
            bySubject,
            byErrorType
        });
    } catch (error) {
        console.error('错题统计失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 学习计划 ==========
router.get('/study-plan', async (req, res) => {
    try {
        const userId = req.user.id;
        const { period } = req.query;
        const StudyPlanEngine = require('../core/StudyPlanEngine');
        const engine = new StudyPlanEngine();

        if (period === 'week') {
            const week = await engine.getWeekPlan(pool, { userId });
            return res.json({ success: true, ...week });
        }

        if (period === 'month') {
            const month = await engine.getMonthGoals(pool, { userId });
            return res.json({ success: true, ...month });
        }

        const plan = await engine.getPlan(pool, { userId, date: engine.today() });
        res.json({ success: true, plan, tasks: plan?.tasks || [], suggestion: plan?.ai_suggestion || plan?.aiSuggestion || '' });
    } catch (error) {
        console.error('获取学习计划失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/study-plan/progress', async (req, res) => {
    try {
        const userId = req.user.id;
        const StudyPlanEngine = require('../core/StudyPlanEngine');
        const engine = new StudyPlanEngine();
        const progress = await engine.getProgress(pool, { userId });
        res.json({ success: true, ...progress });
    } catch (error) {
        console.error('获取计划进度失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/study-plan/generate', async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, title, duration } = req.body;
        const StudyPlanEngine = require('../core/StudyPlanEngine');
        const engine = new StudyPlanEngine();
        const plan = await engine.generateDaily(pool, { userId, date, title, duration });
        res.json({ success: true, plan, tasks: plan?.tasks || [], suggestion: plan?.ai_suggestion || plan?.aiSuggestion || '' });
    } catch (error) {
        console.error('生成学习计划失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/study-plan/:id/complete', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const StudyPlanEngine = require('../core/StudyPlanEngine');
        const engine = new StudyPlanEngine();
        const result = await engine.completeTask(pool, { userId, taskId: id });
        res.json({ success: true, result });
    } catch (error) {
        console.error('完成任务失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/study-plan/:id/uncomplete', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const StudyPlanEngine = require('../core/StudyPlanEngine');
        const engine = new StudyPlanEngine();
        const result = await engine.setTaskCompletion(pool, { userId, taskId: id, completed: false });
        res.json({ success: true, result });
    } catch (error) {
        console.error('取消完成任务失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/study-plan/:date', async (req, res) => {
    try {
        const userId = req.user.id;
        const StudyPlanEngine = require('../core/StudyPlanEngine');
        const engine = new StudyPlanEngine();
        const plan = await engine.getPlan(pool, { userId, date: req.params.date });
        res.json({ success: true, plan, tasks: plan?.tasks || [], suggestion: plan?.ai_suggestion || plan?.aiSuggestion || '' });
    } catch (error) {
        console.error('获取学习计划失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 闭环反馈 ==========
router.get('/feedback-loops', async (req, res) => {
    try {
        const userId = req.user.id;
        const FeedbackLoopEngine = require('../core/FeedbackLoopEngine');
        const engine = new FeedbackLoopEngine();
        const loops = await engine.getUserLoops(pool, { userId });
        res.json({ success: true, loops });
    } catch (error) {
        console.error('获取闭环记录失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/feedback-loop/:id/close', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const FeedbackLoopEngine = require('../core/FeedbackLoopEngine');
        const engine = new FeedbackLoopEngine();
        const result = await engine.closeCycle(pool, { userId, loopId: parseInt(id) });
        res.json({ success: true, result });
    } catch (error) {
        console.error('关闭闭环失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
