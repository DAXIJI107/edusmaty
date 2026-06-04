const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT, requireTeacher } = require("../middleware");
const { createNotification } = require("./notifications");

router.use(authenticateJWT);
router.use(requireTeacher);

async function ensureTeacherTables() {
    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        student_id INT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_teacher (teacher_id),
        INDEX idx_student (student_id),
        INDEX idx_subject (subject)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_exams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'medium',
        duration INT DEFAULT 60,
        description TEXT,
        is_published TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_teacher (teacher_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_exam_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_id INT NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'choice',
        options JSON,
        correct_answer TEXT,
        score INT DEFAULT 5,
        sort_order INT DEFAULT 0,
        INDEX idx_exam (exam_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_exam_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_id INT NOT NULL,
        student_id INT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        score DECIMAL(5,2),
        submit_time DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_exam (exam_id),
        INDEX idx_student (student_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        tags VARCHAR(500) DEFAULT '',
        is_published TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_teacher (teacher_id),
        INDEX idx_subject (subject)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_note_reads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        student_id INT NOT NULL,
        read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_note (note_id),
        INDEX idx_student (student_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_learning_paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        subject VARCHAR(100) NOT NULL,
        is_published TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_teacher (teacher_id),
        INDEX idx_subject (subject)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_path_steps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        type ENUM('text','video','quiz','code','exercise') DEFAULT 'text',
        content TEXT NOT NULL,
        options_json JSON,
        correct_answer TEXT,
        duration_minutes INT DEFAULT 10,
        sort_order INT DEFAULT 0,
        INDEX idx_path (path_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_path_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path_id INT NOT NULL,
        student_id INT NOT NULL,
        status ENUM('in_progress','completed','locked') DEFAULT 'in_progress',
        current_step INT DEFAULT 1,
        total_steps INT DEFAULT 0,
        completed_steps INT DEFAULT 0,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        INDEX idx_path (path_id),
        INDEX idx_student (student_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_path_step_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        step_id INT NOT NULL,
        status ENUM('pending','in_progress','completed') DEFAULT 'pending',
        answer TEXT,
        is_correct TINYINT,
        started_at DATETIME,
        completed_at DATETIME,
        INDEX idx_assignment (assignment_id),
        INDEX idx_step (step_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query("ALTER TABLE teacher_learning_paths ADD COLUMN version INT DEFAULT 1").catch(() => {});
    await pool.query("ALTER TABLE teacher_path_assignments ADD COLUMN scheduled_at DATETIME").catch(() => {});
    await pool.query("ALTER TABLE teacher_path_assignments ADD COLUMN deadline_at DATETIME").catch(() => {});
    await pool
        .query(
            "ALTER TABLE teacher_path_assignments MODIFY status ENUM('in_progress','completed','locked','scheduled') DEFAULT 'in_progress'"
        )
        .catch(() => {});
    await pool
        .query("ALTER TABLE teacher_path_assignments ADD UNIQUE KEY uniq_path_student (path_id, student_id)")
        .catch(() => {});
    await pool.query("ALTER TABLE teacher_path_steps ADD COLUMN resource_id INT").catch(() => {});
    await pool.query("ALTER TABLE teacher_path_steps ADD COLUMN resource_type VARCHAR(50)").catch(() => {});

    await pool.query(`CREATE TABLE IF NOT EXISTS teacher_path_version_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path_id INT NOT NULL,
        version INT NOT NULL,
        name VARCHAR(200),
        description TEXT,
        subject VARCHAR(100),
        steps_json JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_path (path_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

router.use(async (req, res, next) => {
    try {
        await ensureTeacherTables();
    } catch (e) {
        /* ignore */
    }
    next();
});

// ========== 教师仪表盘概览 ==========
router.get("/overview", async (req, res) => {
    try {
        const [studentCount] = await pool.query(
            "SELECT COUNT(*) as total FROM users WHERE role = 'student' AND status = 'active'"
        );
        const [examCount] = await pool.query("SELECT COUNT(*) as total FROM teacher_exams WHERE teacher_id = ?", [
            req.user.id
        ]);
        const [noteCount] = await pool.query("SELECT COUNT(*) as total FROM teacher_notes WHERE teacher_id = ?", [
            req.user.id
        ]);
        const [assignCount] = await pool.query(
            "SELECT COUNT(*) as total FROM teacher_assignments WHERE teacher_id = ?",
            [req.user.id]
        );
        const [recentExams] = await pool.query(
            `SELECT ua.id, ua.is_correct, ua.answered_at as created_at, u.username, u.nickname, q.question as exam_name, kp.subject
             FROM user_answers ua
             JOIN users u ON ua.user_id = u.id
             LEFT JOIN questions q ON ua.question_id = q.id
             LEFT JOIN knowledge_points kp ON q.knowledge_id = kp.id
             ORDER BY ua.answered_at DESC LIMIT 10`
        );
        const [subjectStats] = await pool.query(
            `SELECT kp.subject, COUNT(*) as total, AVG(ua.is_correct = 1) * 100 as avg_score
             FROM user_answers ua
             JOIN questions q ON ua.question_id = q.id
             JOIN knowledge_points kp ON q.knowledge_id = kp.id
             GROUP BY kp.subject`
        );
        res.json({
            success: true,
            overview: {
                studentCount: studentCount[0]?.total || 0,
                examCount: examCount[0]?.total || 0,
                noteCount: noteCount[0]?.total || 0,
                assignCount: assignCount[0]?.total || 0,
                recentSubmissionCount: recentExams.length
            },
            recentExams,
            subjectStats
        });
    } catch (error) {
        console.error("教师概览失败:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取所有学科列表 ==========
router.get("/subjects", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT DISTINCT subject FROM knowledge_points WHERE subject IS NOT NULL AND subject != '' ORDER BY subject"
        );
        const subjects = rows.map(r => r.subject);
        const defaultSubjects = [
            "数据结构与算法",
            "计算机网络",
            "操作系统",
            "数据库",
            "程序设计",
            "前端开发",
            "人工智能",
            "软件工程"
        ];
        const merged = [...new Set([...defaultSubjects, ...subjects])];
        res.json({ success: true, subjects: merged });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 学生管理 ==========
router.get("/students", async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let where = "WHERE u.role = 'student' AND u.status = 'active'";
        const params = [];
        if (search) {
            where += " AND (u.username LIKE ? OR u.nickname LIKE ? OR u.email LIKE ?)";
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const [students] = await pool.query(
            `SELECT u.id, u.username, u.nickname, u.email, u.study_hours, u.completed_courses, 
                    u.knowledge_mastery, u.correct_answers, u.continuous_days,
                    (SELECT COUNT(*) FROM user_answers WHERE user_id = u.id) as exam_count,
                    (SELECT AVG(is_correct = 1) * 100 FROM user_answers WHERE user_id = u.id) as avg_score,
                    (SELECT GROUP_CONCAT(DISTINCT subject SEPARATOR ', ') FROM teacher_assignments WHERE student_id = u.id) as assigned_subjects
             FROM users u ${where}
             ORDER BY u.id ASC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
            params
        );
        const [[countResult]] = await pool.query(`SELECT COUNT(*) as total FROM users u ${where}`, params);
        res.json({
            success: true,
            students,
            total: countResult.total,
            page: parseInt(page),
            totalPages: Math.ceil(countResult.total / parseInt(limit))
        });
    } catch (error) {
        console.error("获取学生列表失败:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 分配学科给学生 ==========
router.post("/assign-subject", async (req, res) => {
    try {
        const { student_id, subject, note } = req.body;
        if (!student_id || !subject) {
            return res.status(400).json({ success: false, message: "学生ID和学科不能为空" });
        }
        const [[student]] = await pool.query(
            "SELECT id, username, nickname FROM users WHERE id = ? AND role = 'student'",
            [student_id]
        );
        if (!student) return res.status(404).json({ success: false, message: "学生未找到" });
        const [existing] = await pool.query(
            "SELECT id FROM teacher_assignments WHERE teacher_id = ? AND student_id = ? AND subject = ?",
            [req.user.id, student_id, subject]
        );
        if (existing.length) {
            return res.json({ success: true, message: `该学生已在学习「${subject}」` });
        }
        await pool.query(
            "INSERT INTO teacher_assignments (teacher_id, student_id, subject, note) VALUES (?, ?, ?, ?)",
            [req.user.id, student_id, subject, note || ""]
        );
        res.json({ success: true, message: `已指定 ${student.nickname || student.username} 学习「${subject}」` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取分配列表 ==========
router.get("/assignments", async (req, res) => {
    try {
        const { subject, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let where = "WHERE ta.teacher_id = ?";
        const params = [req.user.id];
        if (subject) {
            where += " AND ta.subject = ?";
            params.push(subject);
        }
        const [rows] = await pool.query(
            `SELECT ta.id, ta.subject, ta.note, ta.created_at,
                    u.id as student_id, u.username, u.nickname, u.knowledge_mastery, u.study_hours
             FROM teacher_assignments ta
             JOIN users u ON ta.student_id = u.id
             ${where}
             ORDER BY ta.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
            params
        );
        const [[countResult]] = await pool.query(
            `SELECT COUNT(*) as total FROM teacher_assignments ta ${where}`,
            params
        );
        res.json({ success: true, assignments: rows, total: countResult.total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 删除分配 ==========
router.delete("/assignments/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM teacher_assignments WHERE id = ? AND teacher_id = ?", [
            req.params.id,
            req.user.id
        ]);
        res.json({ success: true, message: "已取消分配" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 创建试卷 ==========
router.post("/exams/create", async (req, res) => {
    try {
        const { name, subject, difficulty, duration, description, questions } = req.body;
        if (!name || !subject) return res.status(400).json({ success: false, message: "试卷名称和学科不能为空" });
        const [result] = await pool.query(
            "INSERT INTO teacher_exams (teacher_id, name, subject, difficulty, duration, description) VALUES (?, ?, ?, ?, ?, ?)",
            [req.user.id, name, subject, difficulty || "medium", duration || 60, description || ""]
        );
        const examId = result.insertId;
        if (questions && Array.isArray(questions) && questions.length > 0) {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                await pool.query(
                    "INSERT INTO teacher_exam_questions (exam_id, content, type, options, correct_answer, score, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [
                        examId,
                        q.content,
                        q.type || "choice",
                        JSON.stringify(q.options || []),
                        q.correct_answer || "",
                        q.score || 5,
                        i + 1
                    ]
                );
            }
        }
        res.json({ success: true, message: `试卷「${name}」创建成功`, examId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取教师试卷列表 ==========
router.get("/exams", async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const [exams] = await pool.query(
            `SELECT te.*,
                    (SELECT COUNT(*) FROM teacher_exam_questions WHERE exam_id = te.id) as question_count,
                    (SELECT COUNT(*) FROM teacher_exam_assignments WHERE exam_id = te.id) as assign_count,
                    (SELECT COUNT(*) FROM teacher_exam_assignments WHERE exam_id = te.id AND status = 'submitted') as submit_count
             FROM teacher_exams te WHERE te.teacher_id = ?
             ORDER BY te.id DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
            [req.user.id]
        );
        const [[countResult]] = await pool.query("SELECT COUNT(*) as total FROM teacher_exams WHERE teacher_id = ?", [
            req.user.id
        ]);
        res.json({ success: true, exams, total: countResult.total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取试卷详情(含题目) ==========
router.get("/exams/:id", async (req, res) => {
    try {
        const [[exam]] = await pool.query("SELECT * FROM teacher_exams WHERE id = ? AND teacher_id = ?", [
            req.params.id,
            req.user.id
        ]);
        if (!exam) return res.status(404).json({ success: false, message: "试卷未找到" });
        const [questions] = await pool.query(
            "SELECT * FROM teacher_exam_questions WHERE exam_id = ? ORDER BY sort_order",
            [req.params.id]
        );
        const [assignments] = await pool.query(
            `SELECT tea.*, u.username, u.nickname
             FROM teacher_exam_assignments tea
             JOIN users u ON tea.student_id = u.id
             WHERE tea.exam_id = ? ORDER BY tea.created_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, exam, questions, assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 发布试卷给学生 ==========
router.post("/exams/:id/publish", async (req, res) => {
    try {
        const { student_ids } = req.body;
        const examId = req.params.id;
        const [[exam]] = await pool.query("SELECT * FROM teacher_exams WHERE id = ? AND teacher_id = ?", [
            examId,
            req.user.id
        ]);
        if (!exam) return res.status(404).json({ success: false, message: "试卷未找到" });
        if (student_ids && Array.isArray(student_ids) && student_ids.length > 0) {
            for (const sid of student_ids) {
                const [existing] = await pool.query(
                    "SELECT id FROM teacher_exam_assignments WHERE exam_id = ? AND student_id = ?",
                    [examId, sid]
                );
                if (!existing.length) {
                    await pool.query("INSERT INTO teacher_exam_assignments (exam_id, student_id) VALUES (?, ?)", [
                        examId,
                        sid
                    ]);
                }
            }
        }
        await pool.query("UPDATE teacher_exams SET is_published = 1 WHERE id = ?", [examId]);
        res.json({ success: true, message: `试卷「${exam.name}」已发布给 ${student_ids?.length || 0} 名学生` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取试卷提交记录 ==========
router.get("/exams/:id/submissions", async (req, res) => {
    try {
        const [submissions] = await pool.query(
            `SELECT tea.id, tea.status, tea.score, tea.submit_time, tea.created_at, u.username, u.nickname
             FROM teacher_exam_assignments tea
             JOIN users u ON tea.student_id = u.id
             WHERE tea.exam_id = ?
             ORDER BY tea.status ASC, tea.score DESC`,
            [req.params.id]
        );
        res.json({ success: true, submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 删除试卷 ==========
router.delete("/exams/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM teacher_exam_questions WHERE exam_id = ?", [req.params.id]);
        await pool.query("DELETE FROM teacher_exam_assignments WHERE exam_id = ?", [req.params.id]);
        await pool.query("DELETE FROM teacher_exams WHERE id = ? AND teacher_id = ?", [req.params.id, req.user.id]);
        res.json({ success: true, message: "试卷已删除" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 资源搜索 ==========
router.get("/resources/search", async (req, res) => {
    try {
        const { q = "", type = "", page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const results = [];
        if (!type || type === "resource") {
            const [rows] = await pool.query(
                "SELECT id, name, category, subcategory, description, type as resource_type, difficulty, url FROM learning_resources WHERE (name LIKE ? OR description LIKE ?) LIMIT ? OFFSET ?",
                [`%${q}%`, `%${q}%`, parseInt(limit), offset]
            );
            rows.forEach(r => {
                r._kind = "resource";
                results.push(r);
            });
        }
        if (!type || type === "exam") {
            const [rows] = await pool.query(
                "SELECT id, name, subject, difficulty, question_count FROM teacher_exams WHERE teacher_id = ? AND name LIKE ? LIMIT ? OFFSET ?",
                [req.user.id, `%${q}%`, parseInt(limit), offset]
            );
            rows.forEach(r => {
                r._kind = "exam";
                results.push(r);
            });
        }
        if (!type || type === "question") {
            const [rows] = await pool.query(
                "SELECT id, title as name, category, difficulty, tags FROM coding_problems WHERE title LIKE ? LIMIT ? OFFSET ?",
                [`%${q}%`, parseInt(limit), offset]
            );
            rows.forEach(r => {
                r._kind = "question";
                results.push(r);
            });
        }
        if (!type || type === "knowledge") {
            const [rows] = await pool.query(
                "SELECT id, title as name, subject, summary as description, mastery as difficulty FROM knowledge_points WHERE title LIKE ? OR summary LIKE ? LIMIT ? OFFSET ?",
                [`%${q}%`, `%${q}%`, parseInt(limit), offset]
            );
            rows.forEach(r => {
                r._kind = "knowledge";
                results.push(r);
            });
        }
        if (!type || type === "note") {
            const [rows] = await pool.query(
                "SELECT id, title as name, subject, content as description, tags FROM teacher_notes WHERE teacher_id = ? AND (title LIKE ? OR content LIKE ? OR tags LIKE ?) LIMIT ? OFFSET ?",
                [req.user.id, `%${q}%`, `%${q}%`, `%${q}%`, parseInt(limit), offset]
            );
            rows.forEach(r => {
                r._kind = "note";
                results.push(r);
            });
        }
        res.json({ success: true, resources: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 发布笔记 ==========
router.post("/notes/publish", async (req, res) => {
    try {
        const { title, content, subject, tags } = req.body;
        if (!title || !content) return res.status(400).json({ success: false, message: "标题和内容不能为空" });
        const [result] = await pool.query(
            "INSERT INTO teacher_notes (teacher_id, title, content, subject, tags) VALUES (?, ?, ?, ?, ?)",
            [req.user.id, title, content, subject || "综合", tags || ""]
        );
        res.json({ success: true, message: `笔记「${title}」已发布`, noteId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取笔记列表 ==========
router.get("/notes", async (req, res) => {
    try {
        const { subject, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let where = "WHERE tn.teacher_id = ?";
        const params = [req.user.id];
        if (subject && subject !== "all") {
            where += " AND tn.subject = ?";
            params.push(subject);
        }
        const [notes] = await pool.query(
            `SELECT tn.*,
                    (SELECT COUNT(*) FROM teacher_note_reads WHERE note_id = tn.id) as read_count
             FROM teacher_notes tn ${where}
             ORDER BY tn.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
            params
        );
        const [[countResult]] = await pool.query(`SELECT COUNT(*) as total FROM teacher_notes tn ${where}`, params);
        res.json({ success: true, notes, total: countResult.total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取笔记详情 ==========
router.get("/notes/:id", async (req, res) => {
    try {
        const [[note]] = await pool.query("SELECT * FROM teacher_notes WHERE id = ? AND teacher_id = ?", [
            req.params.id,
            req.user.id
        ]);
        if (!note) return res.status(404).json({ success: false, message: "笔记未找到" });
        const [readers] = await pool.query(
            `SELECT tnr.read_at, u.id, u.username, u.nickname
             FROM teacher_note_reads tnr
             JOIN users u ON tnr.student_id = u.id
             WHERE tnr.note_id = ? ORDER BY tnr.read_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, note, readers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 删除笔记 ==========
router.delete("/notes/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM teacher_note_reads WHERE note_id = ?", [req.params.id]);
        await pool.query("DELETE FROM teacher_notes WHERE id = ? AND teacher_id = ?", [req.params.id, req.user.id]);
        res.json({ success: true, message: "笔记已删除" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取学生详情(综合学情) ==========
router.get("/student/:id/detail", async (req, res) => {
    try {
        const { id } = req.params;
        const [[user]] = await pool.query(
            `SELECT id, username, nickname, email, study_hours, completed_courses, 
                    knowledge_mastery, correct_answers, study_efficiency, continuous_days, created_at
             FROM users WHERE id = ? AND role = 'student'`,
            [id]
        );
        if (!user) return res.status(404).json({ success: false, message: "学生未找到" });

        const [exams] = await pool.query(
            `SELECT ua.id, ua.is_correct, ua.answered_at as created_at, q.question as exam_name, kp.subject
             FROM user_answers ua
             LEFT JOIN questions q ON ua.question_id = q.id
             LEFT JOIN knowledge_points kp ON q.knowledge_id = kp.id
             WHERE ua.user_id = ? ORDER BY ua.answered_at DESC LIMIT 20`,
            [id]
        );

        const [knowledge] = await pool.query(
            `SELECT kp.id as node_id, COALESCE(kp.mastery, 0) as mastery, kp.title as name, kp.subject
             FROM knowledge_points kp
             WHERE kp.subject IS NOT NULL
             ORDER BY mastery ASC`,
            []
        );

        const [errors] = await pool.query(
            `SELECT kp.subject, COUNT(*) as count FROM user_answers ua
             JOIN questions q ON ua.question_id = q.id
             JOIN knowledge_points kp ON q.knowledge_id = kp.id
             WHERE ua.user_id = ? AND ua.is_correct = 0 GROUP BY kp.subject`,
            [id]
        );

        const [assignedSubjects] = await pool.query(
            "SELECT subject, note, created_at FROM teacher_assignments WHERE student_id = ? ORDER BY created_at DESC",
            [id]
        );

        const [teacherExams] = await pool.query(
            `SELECT tea.status, tea.score, tea.submit_time, te.name, te.subject
             FROM teacher_exam_assignments tea
             JOIN teacher_exams te ON tea.exam_id = te.id
             WHERE tea.student_id = ? ORDER BY tea.created_at DESC`,
            [id]
        );

        const [readNotes] = await pool.query(
            `SELECT tnr.read_at, tn.title, tn.subject
             FROM teacher_note_reads tnr
             JOIN teacher_notes tn ON tnr.note_id = tn.id
             WHERE tnr.student_id = ? ORDER BY tnr.read_at DESC`,
            [id]
        );

        res.json({ success: true, student: user, exams, knowledge, errors, assignedSubjects, teacherExams, readNotes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取学生考试记录 ==========
router.get("/student/:id/exams", async (req, res) => {
    try {
        const { id } = req.params;
        const [exams] = await pool.query(
            `SELECT ua.id, ua.is_correct as score, ua.answered_at as created_at, ua.answered_at as submit_time, q.question as exam_name, kp.subject
             FROM user_answers ua
             LEFT JOIN questions q ON ua.question_id = q.id
             LEFT JOIN knowledge_points kp ON q.knowledge_id = kp.id
             WHERE ua.user_id = ? ORDER BY ua.answered_at DESC`,
            [id]
        );
        res.json({ success: true, exams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取学生学习统计 ==========
router.get("/student/:id/stats", async (req, res) => {
    try {
        const { id } = req.params;
        const [dailyStats] = await pool.query(
            `SELECT DATE(answered_at) as date, COUNT(*) as count, AVG(is_correct = 1) * 100 as avg_score
             FROM user_answers WHERE user_id = ?
             GROUP BY DATE(answered_at) ORDER BY date DESC LIMIT 30`,
            [id]
        );
        const [subjectMastery] = await pool.query(
            `SELECT kp.subject, AVG(COALESCE(kp.mastery, 0)) as avg_mastery, COUNT(*) as node_count
             FROM knowledge_points kp
             WHERE kp.subject IS NOT NULL AND kp.subject != ''
             GROUP BY kp.subject`,
            []
        );
        res.json({ success: true, dailyStats, subjectMastery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 移除学生（软删除：设置 status = 'inactive'） ==========
router.put("/students/:id/deactivate", async (req, res) => {
    try {
        const { id } = req.params;
        const [[student]] = await pool.query(
            "SELECT id, username, nickname FROM users WHERE id = ? AND role = 'student'",
            [id]
        );
        if (!student) return res.status(404).json({ success: false, message: "学生未找到" });
        await pool.query("UPDATE users SET status = 'inactive' WHERE id = ?", [id]);
        res.json({ success: true, message: `学生「${student.nickname || student.username}」已移除` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 批量导入学生 ==========
router.post("/students/batch-import", async (req, res) => {
    try {
        const { students } = req.body;
        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ success: false, message: "请提供学生列表" });
        }
        const bcrypt = require("bcryptjs");
        let imported = 0,
            skipped = 0;
        for (const s of students) {
            const username = (s.username || "").trim();
            const nickname = (s.nickname || username).trim();
            if (!username) {
                skipped++;
                continue;
            }
            const [[exists]] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
            if (exists) {
                skipped++;
                continue;
            }
            const hashed = await bcrypt.hash(username + "123456", 10);
            await pool.query(
                "INSERT INTO users (username, nickname, password, role, status) VALUES (?, ?, ?, 'student', 'active')",
                [username, nickname, hashed]
            );
            imported++;
        }
        res.json({
            success: true,
            message: `成功导入 ${imported} 名学生，跳过 ${skipped} 名（重复或无用户名）`,
            imported,
            skipped
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
//  ============== 学习路径管理 (强行干预模式) ==============
// ============================================================

// ========== 创建学习路径 ==========
router.post("/paths/create", async (req, res) => {
    try {
        const { name, description, subject, steps } = req.body;
        if (!name || !subject) return res.status(400).json({ success: false, message: "路径名称和学科不能为空" });
        const [result] = await pool.query(
            "INSERT INTO teacher_learning_paths (teacher_id, name, description, subject) VALUES (?, ?, ?, ?)",
            [req.user.id, name, description || "", subject]
        );
        const pathId = result.insertId;
        if (steps && Array.isArray(steps) && steps.length > 0) {
            for (let i = 0; i < steps.length; i++) {
                const s = steps[i];
                await pool.query(
                    "INSERT INTO teacher_path_steps (path_id, title, type, content, options_json, correct_answer, duration_minutes, sort_order, resource_id, resource_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        pathId,
                        s.title,
                        s.type || "text",
                        s.content || "",
                        s.options_json || JSON.stringify(s.options || []),
                        s.correct_answer || "",
                        s.duration_minutes || 10,
                        i + 1,
                        s.resource_id || null,
                        s.resource_type || null
                    ]
                );
            }
        }
        res.json({ success: true, message: `学习路径「${name}」创建成功`, pathId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取教师的学习路径列表 ==========
router.get("/paths", async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const [paths] = await pool.query(
            `SELECT lp.*, 
                    (SELECT COUNT(*) FROM teacher_path_steps WHERE path_id = lp.id) as step_count,
                    (SELECT COUNT(*) FROM teacher_path_assignments WHERE path_id = lp.id) as assign_count,
                    (SELECT COUNT(*) FROM teacher_path_assignments WHERE path_id = lp.id AND status = 'completed') as completed_count,
                    (SELECT COUNT(*) FROM teacher_path_assignments WHERE path_id = lp.id AND status = 'in_progress') as in_progress_count
             FROM teacher_learning_paths lp WHERE lp.teacher_id = ?
             ORDER BY lp.id DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
            [req.user.id]
        );
        const [[countResult]] = await pool.query(
            "SELECT COUNT(*) as total FROM teacher_learning_paths WHERE teacher_id = ?",
            [req.user.id]
        );
        res.json({ success: true, paths, total: countResult.total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 获取学习路径详情(含步骤) ==========
router.get("/paths/:id", async (req, res) => {
    try {
        const [[path]] = await pool.query("SELECT * FROM teacher_learning_paths WHERE id = ? AND teacher_id = ?", [
            req.params.id,
            req.user.id
        ]);
        if (!path) return res.status(404).json({ success: false, message: "学习路径未找到" });
        const [steps] = await pool.query("SELECT * FROM teacher_path_steps WHERE path_id = ? ORDER BY sort_order", [
            req.params.id
        ]);
        const [assignments] = await pool.query(
            `SELECT tpa.*, u.username, u.nickname
             FROM teacher_path_assignments tpa
             JOIN users u ON tpa.student_id = u.id
             WHERE tpa.path_id = ? ORDER BY tpa.started_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, path, steps, assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 更新学习路径 ==========
router.put("/paths/:id", async (req, res) => {
    try {
        const { name, description, subject, steps } = req.body;
        const [[current]] = await pool.query(
            "SELECT id, version, name, description, subject FROM teacher_learning_paths WHERE id = ? AND teacher_id = ?",
            [req.params.id, req.user.id]
        );
        if (!current) return res.status(404).json({ success: false, message: "路径未找到" });
        const [[stepRows]] = await pool.query(
            "SELECT JSON_ARRAYAGG(JSON_OBJECT('title', title, 'type', type, 'content', content, 'options_json', options_json, 'correct_answer', correct_answer, 'duration_minutes', duration_minutes, 'sort_order', sort_order, 'resource_id', resource_id, 'resource_type', resource_type) ORDER BY sort_order) as steps FROM teacher_path_steps WHERE path_id = ?",
            [req.params.id]
        );
        await pool.query(
            "INSERT INTO teacher_path_version_history (path_id, version, name, description, subject, steps_json) VALUES (?, ?, ?, ?, ?, ?)",
            [
                req.params.id,
                current.version,
                current.name,
                current.description,
                current.subject,
                stepRows?.steps || "[]"
            ]
        );
        const newVersion = current.version + 1;
        await pool.query(
            "UPDATE teacher_learning_paths SET name = ?, description = ?, subject = ?, version = ? WHERE id = ?",
            [name, description, subject, newVersion, req.params.id]
        );
        if (steps && Array.isArray(steps)) {
            await pool.query("DELETE FROM teacher_path_steps WHERE path_id = ?", [req.params.id]);
            for (let i = 0; i < steps.length; i++) {
                const s = steps[i];
                await pool.query(
                    "INSERT INTO teacher_path_steps (path_id, title, type, content, options_json, correct_answer, duration_minutes, sort_order, resource_id, resource_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        req.params.id,
                        s.title,
                        s.type || "text",
                        s.content || "",
                        s.options_json || JSON.stringify(s.options || []),
                        s.correct_answer || "",
                        s.duration_minutes || 10,
                        i + 1,
                        s.resource_id || null,
                        s.resource_type || null
                    ]
                );
            }
        }
        res.json({ success: true, message: "学习路径已更新", version: newVersion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 重新排序路径步骤 ==========
router.put("/paths/:id/steps/reorder", async (req, res) => {
    try {
        const { steps } = req.body;
        if (!steps || !Array.isArray(steps)) {
            return res.status(400).json({ success: false, message: "steps 参数必须是数组" });
        }
        for (const step of steps) {
            await pool.query("UPDATE teacher_path_steps SET sort_order = ? WHERE id = ? AND path_id = ?", [
                step.sort_order,
                step.id,
                req.params.id
            ]);
        }
        res.json({ success: true, message: "步骤顺序已更新" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 删除学习路径 ==========
router.delete("/paths/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM teacher_path_version_history WHERE path_id = ?", [req.params.id]);
        await pool.query(
            "DELETE FROM teacher_path_step_progress WHERE assignment_id IN (SELECT id FROM teacher_path_assignments WHERE path_id = ?)",
            [req.params.id]
        );
        await pool.query("DELETE FROM teacher_path_assignments WHERE path_id = ?", [req.params.id]);
        await pool.query("DELETE FROM teacher_path_steps WHERE path_id = ?", [req.params.id]);
        await pool.query("DELETE FROM teacher_learning_paths WHERE id = ? AND teacher_id = ?", [
            req.params.id,
            req.user.id
        ]);
        res.json({ success: true, message: "学习路径已删除" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 将学习路径分配给指定学生（强行锁定） ==========
router.post("/paths/:id/assign", async (req, res) => {
    try {
        const { student_ids, deadline_at } = req.body;
        const pathId = req.params.id;
        const [[path]] = await pool.query("SELECT * FROM teacher_learning_paths WHERE id = ? AND teacher_id = ?", [
            pathId,
            req.user.id
        ]);
        if (!path) return res.status(404).json({ success: false, message: "学习路径未找到" });
        const [[stepCount]] = await pool.query("SELECT COUNT(*) as total FROM teacher_path_steps WHERE path_id = ?", [
            pathId
        ]);
        let assigned = 0;
        if (student_ids && Array.isArray(student_ids)) {
            for (const sid of student_ids) {
                const [[student]] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'student'", [sid]);
                if (!student) continue;
                const [existing] = await pool.query(
                    "SELECT id FROM teacher_path_assignments WHERE path_id = ? AND student_id = ?",
                    [pathId, sid]
                );
                if (existing.length) {
                    const assignId = existing[0].id;
                    await pool.query(
                        "UPDATE teacher_path_assignments SET status = 'in_progress', current_step = 1, completed_steps = 0, started_at = NOW(), completed_at = NULL, deadline_at = ? WHERE id = ?",
                        [deadline_at || null, assignId]
                    );
                    await pool.query("DELETE FROM teacher_path_step_progress WHERE assignment_id = ?", [assignId]);
                    const [firstStep] = await pool.query(
                        "SELECT id FROM teacher_path_steps WHERE path_id = ? ORDER BY sort_order LIMIT 1",
                        [pathId]
                    );
                    if (firstStep.length) {
                        await pool.query(
                            "INSERT INTO teacher_path_step_progress (assignment_id, step_id, status) VALUES (?, ?, 'in_progress')",
                            [assignId, firstStep[0].id]
                        );
                    }
                } else {
                    const [ins] = await pool.query(
                        "INSERT INTO teacher_path_assignments (path_id, student_id, total_steps, deadline_at) VALUES (?, ?, ?, ?)",
                        [pathId, sid, stepCount.total, deadline_at || null]
                    );
                    const assignId = ins.insertId;
                    const [firstStep] = await pool.query(
                        "SELECT id FROM teacher_path_steps WHERE path_id = ? ORDER BY sort_order LIMIT 1",
                        [pathId]
                    );
                    if (firstStep.length) {
                        await pool.query(
                            "INSERT INTO teacher_path_step_progress (assignment_id, step_id, status) VALUES (?, ?, 'in_progress')",
                            [assignId, firstStep[0].id]
                        );
                    }
                }
                assigned++;
                createNotification(
                    sid,
                    "新的学习路径",
                    `老师已将学习路径「${path.name}」分配给你，共 ${stepCount.total} 个步骤，请开始学习。`,
                    "path_assigned",
                    null,
                    "/home"
                );
            }
        }
        await pool.query("UPDATE teacher_learning_paths SET is_published = 1 WHERE id = ?", [pathId]);
        res.json({
            success: true,
            message: `学习路径「${path.name}」已发布给 ${assigned} 名学生，学生将被锁定直到完成全部步骤`,
            assignedCount: assigned
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 从路径中移除单个学生（学生立即解除该路径锁定） ==========
router.delete("/paths/:pathId/assignments/:assignmentId", async (req, res) => {
    try {
        const [[assignment]] = await pool.query(
            `SELECT tpa.id, tpa.student_id, lp.name
             FROM teacher_path_assignments tpa
             JOIN teacher_learning_paths lp ON tpa.path_id = lp.id
             WHERE tpa.id = ? AND tpa.path_id = ? AND lp.teacher_id = ?`,
            [req.params.assignmentId, req.params.pathId, req.user.id]
        );
        if (!assignment) return res.status(404).json({ success: false, message: "路径学生记录未找到" });
        await pool.query("DELETE FROM teacher_path_step_progress WHERE assignment_id = ?", [assignment.id]);
        await pool.query("DELETE FROM teacher_path_assignments WHERE id = ?", [assignment.id]);
        createNotification(
            assignment.student_id,
            "学习路径已调整",
            `老师已将你从学习路径「${assignment.name}」中移除，学习功能已恢复。`,
            "path_unlocked",
            req.params.pathId,
            "/home"
        );
        res.json({ success: true, message: "已从该学习路径中移除学生并解除锁定" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 查看某条路径的学生进度 ==========
router.get("/paths/:id/progress", async (req, res) => {
    try {
        const [progress] = await pool.query(
            `SELECT tpa.*, u.username, u.nickname,
                    (SELECT COUNT(*) FROM teacher_path_step_progress WHERE assignment_id = tpa.id AND status = 'completed') as actual_completed
             FROM teacher_path_assignments tpa
             JOIN users u ON tpa.student_id = u.id
             WHERE tpa.path_id = ? ORDER BY tpa.status ASC, tpa.completed_steps DESC`,
            [req.params.id]
        );
        res.json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 解锁单个学生 ==========
router.post("/paths/unlock", async (req, res) => {
    try {
        const { student_id } = req.body;
        if (!student_id) return res.status(400).json({ success: false, message: "学生ID不能为空" });
        await pool.query(
            "UPDATE teacher_path_assignments SET status = 'locked', completed_at = NOW() WHERE student_id = ? AND status = 'in_progress'",
            [student_id]
        );
        res.json({ success: true, message: "学生已解锁，可以自由学习" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 查看教师所有路径分配情况(概览用) ==========
router.get("/path-assignments", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT tpa.*, u.username, u.nickname, lp.name as path_name, lp.subject
             FROM teacher_path_assignments tpa
             JOIN teacher_learning_paths lp ON tpa.path_id = lp.id
             JOIN users u ON tpa.student_id = u.id
             WHERE lp.teacher_id = ?
             ORDER BY tpa.status ASC, tpa.started_at DESC LIMIT 100`,
            [req.user.id]
        );
        res.json({ success: true, assignments: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 版本历史查询 ==========
router.get("/paths/:id/versions", async (req, res) => {
    try {
        const [versions] = await pool.query(
            "SELECT id, version, name, description, steps_json, created_at FROM teacher_path_version_history WHERE path_id = ? ORDER BY version DESC",
            [req.params.id]
        );
        res.json({ success: true, versions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 定时发布路径 ==========
router.put("/paths/:id/schedule", async (req, res) => {
    try {
        const { student_ids, scheduled_at, deadline_at } = req.body;
        if (!scheduled_at || !student_ids || !Array.isArray(student_ids)) {
            return res.status(400).json({ success: false, message: "参数不完整" });
        }
        const [[pathInfo]] = await pool.query("SELECT name FROM teacher_learning_paths WHERE id = ?", [req.params.id]);
        const pathName = pathInfo?.name || "学习路径";
        let assigned = 0;
        for (const sid of student_ids) {
            const [[student]] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'student'", [sid]);
            if (!student) continue;
            const [[path]] = await pool.query(
                "SELECT total_steps FROM (SELECT COUNT(*) as total_steps FROM teacher_path_steps WHERE path_id = ?) t",
                [req.params.id]
            );
            await pool.query(
                "INSERT INTO teacher_path_assignments (path_id, student_id, status, total_steps, scheduled_at, deadline_at) VALUES (?, ?, 'scheduled', ?, ?, ?) ON DUPLICATE KEY UPDATE status = 'scheduled', scheduled_at = VALUES(scheduled_at), deadline_at = VALUES(deadline_at)",
                [req.params.id, sid, path?.total_steps || 0, scheduled_at, deadline_at || null]
            );
            assigned++;
            createNotification(
                sid,
                "学习路径定时发布",
                `学习路径「${pathName}」已安排于 ${scheduled_at} 自动发布，届时会在相关学习页面提示下一步。`,
                "scheduled",
                null,
                "/home"
            );
        }
        res.json({ success: true, message: `已为 ${assigned} 名学生安排定时发布`, scheduledAt: scheduled_at });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== 定时任务：每分钟检查并激活到期路径 ==========
const cron = require("node-cron");
cron.schedule("* * * * *", async () => {
    try {
        const [dueAssignments] = await pool.query(
            `SELECT tpa.id, tpa.path_id, tpa.student_id FROM teacher_path_assignments tpa
             WHERE tpa.status = 'scheduled' AND tpa.scheduled_at <= NOW()`
        );
        for (const a of dueAssignments) {
            const [[stepCount]] = await pool.query(
                "SELECT COUNT(*) as total FROM teacher_path_steps WHERE path_id = ?",
                [a.path_id]
            );
            await pool.query(
                "UPDATE teacher_path_assignments SET status = 'in_progress', current_step = 1, completed_steps = 0, started_at = NOW(), total_steps = ? WHERE id = ?",
                [stepCount.total, a.id]
            );
            await pool.query("DELETE FROM teacher_path_step_progress WHERE assignment_id = ?", [a.id]);
            const [firstStep] = await pool.query(
                "SELECT id FROM teacher_path_steps WHERE path_id = ? ORDER BY sort_order LIMIT 1",
                [a.path_id]
            );
            if (firstStep.length) {
                await pool.query(
                    "INSERT INTO teacher_path_step_progress (assignment_id, step_id, status) VALUES (?, ?, 'in_progress')",
                    [a.id, firstStep[0].id]
                );
            }
            const [[pathInfo]] = await pool.query("SELECT name FROM teacher_learning_paths WHERE id = ?", [a.path_id]);
            const pathName = pathInfo?.name || "学习路径";
            createNotification(
                a.student_id,
                "学习路径已发布",
                `学习路径「${pathName}」已自动发布，共 ${stepCount.total} 个步骤，请按页面顶部提示完成下一步。`,
                "path_unlocked",
                null,
                "/home"
            );
        }
    } catch (e) {
        /* cron silent fail */
    }
});

// ========== 知识掌握热力图 ==========
router.get("/knowledge-graph", async (req, res) => {
    try {
        const { subject } = req.query;
        let knowledgeQuery = `
            SELECT 
                COALESCE(kp.title, q.question) as name,
                kp.subject as subject,
                COUNT(DISTINCT ua.user_id) as student_count,
                COUNT(ua.id) as exam_count,
                ROUND(AVG(CASE WHEN ua.is_correct = 1 THEN 100 ELSE 0 END), 1) as avg_score
            FROM questions q
            LEFT JOIN knowledge_points kp ON q.knowledge_id = kp.id
            LEFT JOIN user_answers ua ON ua.question_id = q.id
            WHERE q.is_active = 1
        `;
        const params = [];
        if (subject) {
            knowledgeQuery += " AND kp.subject = ?";
            params.push(subject);
        }
        knowledgeQuery +=
            " GROUP BY COALESCE(kp.title, q.question), kp.subject HAVING exam_count > 0 ORDER BY avg_score ASC LIMIT 30";

        const [nodes] = await pool.query(knowledgeQuery, params);

        const graphNodes = (nodes || []).map((n, i) => ({
            id: `kg-${i}`,
            label: n.name,
            subject: n.subject,
            avgScore: n.avg_score || 0,
            studentCount: n.student_count || 0,
            examCount: n.exam_count || 0
        }));

        // 查找薄弱学生
        for (const node of graphNodes) {
            try {
                const [weakStudents] = await pool.query(
                    `SELECT u.id, u.username, u.nickname, 
                            ROUND(AVG(CASE WHEN ua.is_correct = 1 THEN 100 ELSE 0 END), 1) as score
                     FROM user_answers ua
                     JOIN users u ON ua.user_id = u.id
                     JOIN questions q ON ua.question_id = q.id
                     LEFT JOIN knowledge_points kp ON q.knowledge_id = kp.id
                     WHERE (COALESCE(kp.title, q.question) = ?)
                       AND u.role = 'student'
                     GROUP BY u.id
                     HAVING score < 60
                     LIMIT 10`,
                    [node.label]
                );
                node.weakStudents = weakStudents || [];
            } catch (e) {
                node.weakStudents = [];
            }
        }

        // 简单的边：相同 subject 的节点互相连接
        const edges = [];
        const subjectGroups = {};
        graphNodes.forEach(n => {
            const subj = n.subject || "综合";
            if (!subjectGroups[subj]) subjectGroups[subj] = [];
            subjectGroups[subj].push(n);
        });
        Object.values(subjectGroups).forEach(group => {
            for (let i = 0; i < group.length - 1; i++) {
                edges.push({ source: group[i].id, target: group[i + 1].id, type: "same-subject" });
            }
        });

        res.json({ success: true, data: { nodes: graphNodes, edges } });
    } catch (error) {
        console.error("知识图谱获取失败:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
