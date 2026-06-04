const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");
const { ensureLearningTables, ensurePathData, ensureQuestionData } = require("../core/DemoDataSeeder");
const { subjectLabel } = require("../core/SubjectUtils");

function parseKnowledgeId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function ensureCourseData(userId) {
    await ensureLearningTables(pool);
    await ensurePathData(pool, userId);
    await ensureQuestionData(pool);
}

function difficultyMinutes(difficulty) {
    if (difficulty === "hard") return 90;
    if (difficulty === "medium") return 60;
    return 30;
}

function difficultyLabel(difficulty) {
    if (difficulty === "hard") return "进阶";
    if (difficulty === "medium") return "提高";
    return "基础";
}

function buildLearningGoals(course, questions = []) {
    const goals = [
        `理解「${course.name}」的核心概念与适用边界`,
        `能用自己的话解释「${course.name}」并举出一个例子`,
        `完成本节 ${Math.min(5, Math.max(questions.length, 1))} 道相关练习并复盘错因`
    ];
    if (course.difficulty === "hard") goals.push("能把本节知识迁移到综合题或项目场景");
    if (course.difficulty === "medium") goals.push("能识别常见题型中的关键条件与陷阱");
    return goals;
}

async function loadCatalog(userId, course) {
    const [children] = await pool.query(
        `SELECT child.id, child.name, child.description, child.difficulty, child.subject, COALESCE(sk.mastery, 0) AS mastery
         FROM prerequisites p
         JOIN knowledge_nodes child ON child.id = p.node_id
         LEFT JOIN student_knowledge sk ON sk.node_id = child.id AND sk.user_id = ?
         WHERE p.prereq_id = ?
           AND (child.is_active = 1 OR child.is_active IS NULL)
         ORDER BY child.id
         LIMIT 12`,
        [userId, course.id]
    );
    if (children.length) return children;

    const [siblings] = await pool.query(
        `SELECT k.id, k.name, k.description, k.difficulty, k.subject, COALESCE(sk.mastery, 0) AS mastery
         FROM knowledge_nodes k
         LEFT JOIN student_knowledge sk ON sk.node_id = k.id AND sk.user_id = ?
         WHERE k.subject = ?
           AND k.id <> ?
           AND (k.is_active = 1 OR k.is_active IS NULL)
         ORDER BY COALESCE(sk.mastery, 0), k.id
         LIMIT 12`,
        [userId, course.subject, course.id]
    );
    return siblings;
}

async function loadResources(course) {
    const [docs] = await pool.query(
        `SELECT doc_id, title, url, course, chapter, knowledge_point, summary
         FROM rag_documents
         WHERE subject = ?
           AND (knowledge_point LIKE ? OR title LIKE ? OR course = ?)
         ORDER BY created_at DESC
         LIMIT 6`,
        [course.subject, `%${course.name}%`, `%${course.name}%`, course.subject]
    );
    if (docs.length) {
        return docs.map(doc => ({
            id: doc.doc_id,
            title: doc.title,
            url: doc.url,
            type: "document",
            course: doc.course,
            chapter: doc.chapter,
            knowledgePoint: doc.knowledge_point,
            summary: doc.summary
        }));
    }

    return [
        {
            id: `resource_${course.id}`,
            title: `${course.name}学习讲义`,
            url: course.content_url || "",
            type: "document",
            course: subjectLabel(course.subject),
            chapter: course.name,
            knowledgePoint: course.name,
            summary: course.description || ""
        }
    ];
}

async function loadQuestions(course) {
    const [rows] = await pool.query(
        `SELECT id, content, type, difficulty, score
         FROM questions
         WHERE (is_active = 1 OR is_active IS NULL)
           AND (node_id = ? OR subject = ?)
         ORDER BY node_id = ? DESC, RAND()
         LIMIT 5`,
        [course.id, course.subject, course.id]
    );
    return rows;
}

async function loadSafeComments(knowledgeId) {
    try {
        const [rows] = await pool.query(
            `SELECT cc.id, cc.content, cc.created_at, u.username
             FROM course_comments cc
             LEFT JOIN users u ON u.id = cc.user_id
             WHERE cc.knowledge_node_id = ?
             ORDER BY cc.created_at DESC
             LIMIT 20`,
            [knowledgeId]
        );
        return rows;
    } catch (error) {
        const [rows] = await pool.query(
            `SELECT id, content, created_at
             FROM course_comments
             WHERE knowledge_node_id = ?
             ORDER BY created_at DESC
             LIMIT 20`,
            [knowledgeId]
        );
        return rows;
    }
}

router.get("/first/available", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const subject = String(req.query?.subject || "").trim();
        await ensureCourseData(userId);

        const params = [userId];
        let subjectWhere = "";
        if (subject && subject !== "all") {
            subjectWhere = "AND k.subject = ?";
            params.push(subject);
        }

        const [rows] = await pool.query(
            `SELECT k.id
             FROM knowledge_nodes k
             LEFT JOIN student_knowledge sk ON sk.node_id = k.id AND sk.user_id = ?
             WHERE (k.is_active = 1 OR k.is_active IS NULL)
               ${subjectWhere}
             ORDER BY COALESCE(sk.mastery, 0), k.id
             LIMIT 1`,
            params
        );

        if (!rows.length) return res.status(404).json({ success: false, message: "暂无可学习课程" });
        res.json({ success: true, data: { knowledgeId: rows[0].id } });
    } catch (error) {
        console.error("读取默认课程失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/notes/mine", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const subject = String(req.query?.subject || "all").trim();
        await ensureLearningTables(pool);

        const params = [userId];
        let subjectWhere = "";
        if (subject && subject !== "all") {
            subjectWhere = "AND cn.subject = ?";
            params.push(subject);
        }

        const [subjectRows] = await pool.query(
            `SELECT COALESCE(subject, 'unknown') AS code, COUNT(*) AS count
             FROM course_notes
             WHERE user_id = ?
             GROUP BY COALESCE(subject, 'unknown')
             ORDER BY count DESC`,
            [userId]
        );

        const [notes] = await pool.query(
            `SELECT cn.id, cn.knowledge_node_id, cn.subject, cn.content, cn.progress_snapshot,
                    cn.last_section, cn.created_at, cn.updated_at,
                    k.name AS knowledge_name, k.description AS knowledge_description,
                    k.difficulty, k.bvid
             FROM course_notes cn
             LEFT JOIN knowledge_nodes k ON k.id = cn.knowledge_node_id
             WHERE cn.user_id = ?
               ${subjectWhere}
             ORDER BY cn.updated_at DESC
             LIMIT 100`,
            params
        );

        res.json({
            success: true,
            data: {
                subjects: subjectRows.map(item => ({
                    code: item.code,
                    label: item.code === "unknown" ? "未分类" : subjectLabel(item.code),
                    count: Number(item.count || 0)
                })),
                notes: notes.map(note => ({
                    ...note,
                    subjectLabel: note.subject ? subjectLabel(note.subject) : "未分类"
                }))
            }
        });
    } catch (error) {
        console.error("读取我的笔记失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.put("/notes/:noteId", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const noteId = Number(req.params.noteId);
        const content = String(req.body?.content || "").trim();
        if (!Number.isInteger(noteId) || noteId <= 0) {
            return res.status(400).json({ success: false, message: "noteId必须是有效数字" });
        }
        if (!content) {
            return res.status(400).json({ success: false, message: "请输入笔记内容" });
        }

        await ensureLearningTables(pool);
        const [result] = await pool.query(
            `UPDATE course_notes
             SET content = ?, updated_at = NOW()
             WHERE id = ? AND user_id = ?`,
            [content, noteId, userId]
        );
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: "笔记不存在或无权限" });
        }
        res.json({ success: true, message: "笔记已更新" });
    } catch (error) {
        console.error("更新我的笔记失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.delete("/notes/:noteId", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const noteId = Number(req.params.noteId);
        if (!Number.isInteger(noteId) || noteId <= 0) {
            return res.status(400).json({ success: false, message: "noteId必须是有效数字" });
        }

        await ensureLearningTables(pool);
        const [result] = await pool.query("DELETE FROM course_notes WHERE id = ? AND user_id = ?", [noteId, userId]);
        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: "笔记不存在或无权限" });
        }
        res.json({ success: true, message: "笔记已删除" });
    } catch (error) {
        console.error("删除我的笔记失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/:knowledgeId/detail", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const knowledgeId = parseKnowledgeId(req.params.knowledgeId);
        if (!knowledgeId) {
            return res.status(400).json({ success: false, message: "knowledgeId必须是有效数字" });
        }
        await ensureCourseData(userId);

        const [[course]] = await pool.query(
            `SELECT k.id, k.name, k.description, k.difficulty, k.type, k.subject, k.content_url, k.bvid, k.video_platform,
                    COALESCE(sk.mastery, 0) AS mastery
             FROM knowledge_nodes k
             LEFT JOIN student_knowledge sk ON sk.node_id = k.id AND sk.user_id = ?
             WHERE k.id = ? AND (k.is_active = 1 OR k.is_active IS NULL)`,
            [userId, knowledgeId]
        );

        if (!course) {
            return res.status(404).json({ success: false, message: "课程不存在" });
        }

        const [catalog, resources, questions, comments, interactions, subjectNotes, currentNotes] = await Promise.all([
            loadCatalog(userId, course),
            loadResources(course),
            loadQuestions(course),
            loadSafeComments(knowledgeId),
            pool
                .query(
                    `SELECT action_type, COUNT(*) AS total
                 FROM course_interactions
                 WHERE knowledge_node_id = ?
                 GROUP BY action_type`,
                    [knowledgeId]
                )
                .then(([rows]) => rows),
            pool
                .query(
                    `SELECT cn.id, cn.knowledge_node_id, cn.subject, cn.content, cn.progress_snapshot, cn.last_section,
                        cn.updated_at, k.name AS knowledge_name
                 FROM course_notes cn
                 LEFT JOIN knowledge_nodes k ON k.id = cn.knowledge_node_id
                 WHERE cn.user_id = ? AND cn.subject = ?
                 ORDER BY cn.updated_at DESC
                 LIMIT 12`,
                    [userId, course.subject]
                )
                .then(([rows]) => rows),
            pool
                .query(
                    `SELECT id, content, progress_snapshot, last_section, updated_at
                 FROM course_notes
                 WHERE user_id = ? AND knowledge_node_id = ?
                 ORDER BY updated_at DESC
                 LIMIT 1`,
                    [userId, knowledgeId]
                )
                .then(([rows]) => rows)
        ]);

        const [[mine]] = await pool.query(
            `SELECT
                MAX(action_type = 'like') AS liked,
                MAX(action_type = 'complete') AS completed,
                MAX(action_type = 'start') AS started
             FROM course_interactions
             WHERE user_id = ? AND knowledge_node_id = ?`,
            [userId, knowledgeId]
        );

        const completeCount = interactions.find(item => item.action_type === "complete")?.total || 0;
        const likeCount = interactions.find(item => item.action_type === "like")?.total || 0;
        const progress = Math.max(Number(course.mastery || 0), mine?.completed ? 100 : 0);

        res.json({
            success: true,
            data: {
                course: {
                    ...course,
                    subjectLabel: subjectLabel(course.subject),
                    difficultyLabel: difficultyLabel(course.difficulty),
                    estimateMinutes: difficultyMinutes(course.difficulty),
                    progress
                },
                metrics: {
                    progress,
                    estimateMinutes: difficultyMinutes(course.difficulty),
                    learners: Number(completeCount || 0),
                    likes: Number(likeCount || 0),
                    noteCount: subjectNotes.length
                },
                catalog,
                resources,
                questions,
                goals: buildLearningGoals(course, questions),
                currentNote: currentNotes[0] || null,
                subjectNotes,
                comments,
                interactions,
                mine: {
                    liked: !!mine?.liked,
                    completed: !!mine?.completed,
                    started: !!mine?.started
                }
            }
        });
    } catch (error) {
        console.error("读取课程详情失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.post("/:knowledgeId/interactions", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const knowledgeId = parseKnowledgeId(req.params.knowledgeId);
        if (!knowledgeId) {
            return res.status(400).json({ success: false, message: "knowledgeId必须是有效数字" });
        }
        const { actionType, payload = {} } = req.body;
        const allowed = new Set(["start", "like", "share", "complete", "download", "ask_ai", "progress"]);
        if (!allowed.has(actionType)) {
            return res.status(400).json({ success: false, message: "不支持的操作" });
        }

        await ensureCourseData(userId);
        await pool.query(
            `INSERT INTO course_interactions (user_id, knowledge_node_id, action_type, payload)
             VALUES (?, ?, ?, ?)`,
            [userId, knowledgeId, actionType, JSON.stringify(payload)]
        );

        if (actionType === "complete") {
            await pool.query(
                `INSERT INTO student_knowledge (user_id, node_id, mastery)
                 VALUES (?, ?, 100)
                 ON DUPLICATE KEY UPDATE mastery = GREATEST(mastery, 100), last_updated = NOW()`,
                [userId, knowledgeId]
            );
        } else if (actionType === "progress") {
            const mastery = Math.max(0, Math.min(99, Number(payload.mastery || 0)));
            await pool.query(
                `INSERT INTO student_knowledge (user_id, node_id, mastery)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE mastery = GREATEST(mastery, VALUES(mastery)), last_updated = NOW()`,
                [userId, knowledgeId, mastery]
            );
        }

        res.json({ success: true, message: "操作已保存" });
    } catch (error) {
        console.error("保存课程操作失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

async function saveCurrentNote(req, res) {
    try {
        const userId = req.user.id;
        const knowledgeId = parseKnowledgeId(req.params.knowledgeId);
        if (!knowledgeId) {
            return res.status(400).json({ success: false, message: "knowledgeId必须是有效数字" });
        }
        const content = String(req.body?.content || "").trim();
        const progress = Math.max(0, Math.min(100, Number(req.body?.progress || 0)));
        if (!content) {
            return res.status(400).json({ success: false, message: "请输入笔记内容" });
        }

        await ensureCourseData(userId);
        const [[course]] = await pool.query("SELECT subject, name FROM knowledge_nodes WHERE id = ?", [knowledgeId]);
        if (!course) return res.status(404).json({ success: false, message: "课程不存在" });

        const [[existing]] = await pool.query(
            "SELECT id FROM course_notes WHERE user_id = ? AND knowledge_node_id = ? ORDER BY updated_at DESC LIMIT 1",
            [userId, knowledgeId]
        );

        if (existing) {
            await pool.query(
                `UPDATE course_notes
                 SET subject = ?, content = ?, progress_snapshot = ?, last_section = ?, updated_at = NOW()
                 WHERE id = ? AND user_id = ?`,
                [course.subject, content, progress, course.name, existing.id, userId]
            );
            await pool.query(
                `INSERT INTO student_knowledge (user_id, node_id, mastery)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE mastery = GREATEST(mastery, VALUES(mastery)), last_updated = NOW()`,
                [userId, knowledgeId, Math.min(99, progress)]
            );
            return res.json({ success: true, noteId: existing.id, message: "笔记已更新" });
        }

        const [result] = await pool.query(
            `INSERT INTO course_notes (user_id, knowledge_node_id, subject, content, progress_snapshot, last_section)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, knowledgeId, course.subject, content, progress, course.name]
        );
        await pool.query(
            `INSERT INTO student_knowledge (user_id, node_id, mastery)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE mastery = GREATEST(mastery, VALUES(mastery)), last_updated = NOW()`,
            [userId, knowledgeId, Math.min(99, progress)]
        );
        res.json({ success: true, noteId: result.insertId, message: "笔记已保存" });
    } catch (error) {
        console.error("保存课程笔记失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
}

router.put("/:knowledgeId/notes/current", authenticateJWT, saveCurrentNote);

router.post("/:knowledgeId/notes", authenticateJWT, saveCurrentNote);

router.post("/:knowledgeId/comments", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const knowledgeId = parseKnowledgeId(req.params.knowledgeId);
        if (!knowledgeId) {
            return res.status(400).json({ success: false, message: "knowledgeId必须是有效数字" });
        }
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "请输入评论内容" });
        }

        await ensureCourseData(userId);
        const [result] = await pool.query(
            `INSERT INTO course_comments (user_id, knowledge_node_id, content)
             VALUES (?, ?, ?)`,
            [userId, knowledgeId, content.trim()]
        );
        res.json({ success: true, commentId: result.insertId, message: "评论已发布" });
    } catch (error) {
        console.error("发布课程评论失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

module.exports = router;
