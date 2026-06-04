const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");
const DiagnosticEngine = require("../core/DiagnosticEngine");
const CognitiveDiagnosis = require("../core/CognitiveDiagnosis");
const KnowledgeTracingEngine = require("../core/KnowledgeTracingEngine");
const AdaptiveDiagnosticEngine = require("../core/AdaptiveDiagnosticEngine");
const SmartDiagnosisReporter = require("../core/SmartDiagnosisReporter");
const {
    normalizeQuestionType,
    normalizeAnswerForCompare,
    getQuestionTypeFromOptions
} = require("../core/SubjectUtils");

// 内存中的CAT会话存储 (生产环境应使用Redis/DB)
const catSessions = new Map();
const CAT_SESSION_TTL = 30 * 60 * 1000; // 30分钟过期

function getUserId(req) {
    return req.user.id;
}

function getCatSession(userId) {
    const session = catSessions.get(userId);
    if (session && Date.now() - session.createdAt > CAT_SESSION_TTL) {
        catSessions.delete(userId);
        return null;
    }
    return session;
}

router.get("/questionnaire", authenticateJWT, async (req, res) => {
    try {
        const engine = new DiagnosticEngine(pool);
        const questionnaire = engine.getQuestionnaire();
        res.json({ success: true, data: questionnaire });
    } catch (error) {
        console.error("获取问卷失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.post("/submit", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { answers, freeText } = req.body;

        if (!answers || typeof answers !== "object" || !Object.keys(answers).length) {
            return res.status(400).json({ success: false, message: "请至少填写一项问卷内容" });
        }

        const engine = new DiagnosticEngine(pool);
        const result = await engine.processDiagnostic(answers, freeText || "", userId);

        res.json({
            success: true,
            data: {
                profile: result.profile,
                analysis: result.analysis,
                recommendations: result.recommendations,
                radarData: result.radarData
            }
        });
    } catch (error) {
        console.error("提交诊断失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.post("/quick", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { text } = req.body;

        if (!text || !String(text).trim()) {
            return res.status(400).json({ success: false, message: "请输入你的学习状态描述" });
        }

        const engine = new DiagnosticEngine(pool);
        const result = await engine.quickDiagnose(String(text).trim(), userId);

        res.json({
            success: true,
            data: {
                profile: result.profile,
                analysis: result.analysis,
                recommendations: result.recommendations,
                radarData: result.radarData
            }
        });
    } catch (error) {
        console.error("快速诊断失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/result", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const engine = new DiagnosticEngine(pool);
        const result = await engine.getLatestResult(userId);

        if (!result) {
            return res.json({ success: true, data: null, message: "尚未进行诊断" });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error("获取诊断结果失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/history", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const [rows] = await pool.query(
            `SELECT id, questionnaire_id, answers_json, analysis_json, recommendations_json, created_at
             FROM diagnostic_results
             WHERE user_id = ?
             ORDER BY id DESC
             LIMIT 10`,
            [userId]
        );

        const history = rows.map(row => ({
            id: row.id,
            questionnaireId: row.questionnaire_id,
            answers: typeof row.answers_json === "string" ? JSON.parse(row.answers_json) : row.answers_json,
            analysis: typeof row.analysis_json === "string" ? JSON.parse(row.analysis_json) : row.analysis_json,
            recommendations:
                typeof row.recommendations_json === "string"
                    ? JSON.parse(row.recommendations_json)
                    : row.recommendations_json,
            createdAt: row.created_at
        }));

        res.json({ success: true, data: history });
    } catch (error) {
        console.error("获取诊断历史失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/profile", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const [rows] = await pool.query(
            `SELECT profile_json, version, updated_at
             FROM student_profiles
             WHERE user_id = ?`,
            [userId]
        );

        if (!rows.length) {
            return res.json({ success: true, data: null, message: "尚无诊断画像" });
        }

        const profile =
            typeof rows[0].profile_json === "string" ? JSON.parse(rows[0].profile_json) : rows[0].profile_json;

        res.json({
            success: true,
            data: {
                profile,
                version: rows[0].version,
                updatedAt: rows[0].updated_at
            }
        });
    } catch (error) {
        console.error("获取诊断画像失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/subjects", authenticateJWT, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT kp.subject, COUNT(DISTINCT q.id) AS questionCount,
                    COUNT(DISTINCT kp.id) AS nodeCount,
                    ROUND(AVG(CASE WHEN q.difficulty='easy' THEN 1 WHEN q.difficulty='medium' THEN 2 ELSE 3 END), 1) AS avgDifficulty
             FROM questions q
             JOIN knowledge_points kp ON q.knowledge_id = kp.id
             WHERE kp.subject IS NOT NULL AND kp.subject != ''
             GROUP BY kp.subject
             ORDER BY questionCount DESC`
        );
        res.json({
            success: true,
            data: rows.map(r => ({
                subject: r.subject,
                questionCount: r.questionCount,
                nodeCount: r.nodeCount,
                avgDifficulty: parseFloat(r.avgDifficulty)
            }))
        });
    } catch (error) {
        console.error("获取诊断学科列表失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/subject-test", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const subject = String(req.query.subject || "");
        if (!subject) {
            return res.status(400).json({ success: false, message: "请指定学科" });
        }

        const maxQ = Math.max(8, Math.min(20, Number(req.query.count || 12)));

        const [rows] = await pool.query(
            `SELECT q.id, q.question AS content, q.options_json, q.correct_answer, q.difficulty,
                    q.knowledge_id AS node_id, kp.subject, kp.title AS node_name
             FROM questions q
             JOIN knowledge_points kp ON q.knowledge_id = kp.id
             WHERE kp.subject = ?
             ORDER BY
               CASE q.difficulty WHEN 'easy' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
               q.knowledge_id, q.id
             LIMIT ${maxQ}`,
            [subject]
        );

        if (!rows.length) {
            return res.json({
                success: true,
                data: { subject, questions: [], tip: "该学科暂无诊断题目，请联系教师添加" }
            });
        }

        const difficultyScore = { easy: 1, medium: 2, hard: 3 };
        const questions = rows.map(q => {
            let options = q.options_json;
            if (typeof options === "string") {
                try {
                    options = JSON.parse(options);
                } catch (e) {
                    options = [];
                }
            }
            if (!Array.isArray(options)) options = [];
            const type = getQuestionTypeFromOptions(q.options_json);
            if (type === "judge" && options.length === 0) {
                options = ["正确", "错误"];
            }
            const diff = q.difficulty || "medium";
            return {
                id: q.id,
                content: q.content,
                type,
                options,
                difficulty: diff,
                score: difficultyScore[diff] || 2,
                nodeId: q.node_id,
                nodeName: q.node_name || ""
            };
        });

        const nodes = {};
        rows.forEach(r => {
            const key = r.node_id || "unknown";
            if (!nodes[key]) nodes[key] = { id: r.node_id, name: r.node_name || "未分类", count: 0 };
            nodes[key].count += 1;
        });

        res.json({
            success: true,
            data: {
                subject,
                questionCount: questions.length,
                questions,
                nodes: Object.values(nodes),
                duration: Math.max(8, Math.ceil(questions.length * 1.5))
            }
        });
    } catch (error) {
        console.error("获取学科诊断试题失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.post("/subject-submit", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { subject, answers } = req.body;

        if (!subject || !Array.isArray(answers) || !answers.length) {
            return res.status(400).json({ success: false, message: "请提供学科和答案" });
        }

        const questionIds = answers.map(a => a.questionId);
        const placeholders = questionIds.map(() => "?").join(",");
        const [questions] = await pool.query(
            `SELECT q.id, q.question AS content, q.options_json, q.correct_answer, q.difficulty,
                    q.knowledge_id AS node_id, kp.subject, kp.title AS node_name
             FROM questions q
             JOIN knowledge_points kp ON q.knowledge_id = kp.id
             WHERE q.id IN (${placeholders})`,
            questionIds
        );

        const answerMap = new Map(answers.map(a => [Number(a.questionId), a.answer]));
        const qMap = new Map(questions.map(q => [Number(q.id), q]));

        let correctCount = 0;
        let totalScore = 0;
        let maxScore = 0;
        let totalAnswered = 0;
        const gradedQuestions = [];

        for (const q of questions) {
            const rawAnswer = answerMap.get(Number(q.id));
            const type = getQuestionTypeFromOptions(q.options_json);
            const hasAnswer = rawAnswer !== null && rawAnswer !== undefined && String(rawAnswer).trim() !== "";

            let options = q.options_json;
            if (typeof options === "string") {
                try {
                    options = JSON.parse(options);
                } catch (e) {
                    options = [];
                }
            }
            if (!Array.isArray(options)) options = [];

            let isCorrect = false;
            const userAnswerStr = String(rawAnswer || "").trim();

            if (type === "single") {
                const optIndex = userAnswerStr.charCodeAt(0) - 65;
                if (optIndex >= 0 && optIndex < options.length) {
                    isCorrect = String(options[optIndex]).trim() === String(q.correct_answer).trim();
                }
            } else if (type === "judge") {
                const mapped = userAnswerStr === "T" ? "正确" : userAnswerStr === "F" ? "错误" : userAnswerStr;
                isCorrect = String(mapped).trim() === String(q.correct_answer).trim();
            } else if (type === "multiple") {
                const userLetters = userAnswerStr
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean);
                const userTexts = userLetters
                    .map(l => {
                        const idx = l.charCodeAt(0) - 65;
                        return idx >= 0 && idx < options.length ? String(options[idx]).trim() : l;
                    })
                    .sort();
                let correctTexts = [];
                try {
                    const parsed =
                        typeof q.correct_answer === "string" ? JSON.parse(q.correct_answer) : q.correct_answer;
                    correctTexts = (Array.isArray(parsed) ? parsed : [String(q.correct_answer)])
                        .map(s => String(s).trim())
                        .sort();
                } catch (e) {
                    correctTexts = [String(q.correct_answer).trim()];
                }
                isCorrect = JSON.stringify(userTexts) === JSON.stringify(correctTexts);
            } else {
                isCorrect = userAnswerStr === String(q.correct_answer).trim();
            }

            const score = 5;
            maxScore += score;
            if (hasAnswer) totalAnswered++;
            if (isCorrect) {
                correctCount++;
                totalScore += score;
            }

            gradedQuestions.push({
                questionId: q.id,
                content: q.content,
                type,
                difficulty: q.difficulty || "medium",
                nodeId: q.node_id,
                nodeName: q.node_name || "",
                correct: isCorrect,
                score: isCorrect ? score : 0,
                userAnswer: rawAnswer || "",
                correctAnswer: q.correct_answer
            });
        }

        const accuracy = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

        const engine = new DiagnosticEngine(pool);
        const analysis = engine.analyzeSubjectResults(subject, gradedQuestions, accuracy);

        await engine.saveSubjectDiagnosticResult(userId, subject, answers, gradedQuestions, analysis);

        res.json({
            success: true,
            data: {
                subject,
                correctCount,
                totalCount: questions.length,
                totalScore,
                maxScore,
                accuracy,
                gradedQuestions,
                analysis
            }
        });
    } catch (error) {
        console.error("提交学科诊断失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

// ===== VARK学习风格问卷 =====

router.get("/vark-questionnaire", authenticateJWT, async (req, res) => {
    const questionnaire = {
        title: "VARK学习风格快速测评",
        description: "了解你的学习风格偏好，以便系统为你定制最优学习方案",
        sections: [
            {
                title: "视觉偏好 (Visual)",
                questions: [
                    {
                        id: "v1",
                        text: "我喜欢通过图表、流程图来理解概念",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    },
                    {
                        id: "v2",
                        text: "看书时我习惯用不同颜色标记重点",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    },
                    {
                        id: "v3",
                        text: "我喜欢看教学视频而不是纯文字教程",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    }
                ]
            },
            {
                title: "听觉偏好 (Auditory)",
                questions: [
                    {
                        id: "a1",
                        text: "听老师讲解比看教材更容易让我理解",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    },
                    {
                        id: "a2",
                        text: "我喜欢通过讨论学习新知识",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    },
                    {
                        id: "a3",
                        text: "朗读或听到自己的声音能帮我记忆",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    }
                ]
            },
            {
                title: "读写偏好 (Read/Write)",
                questions: [
                    {
                        id: "r1",
                        text: "我喜欢用文字笔记整理学习内容",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    },
                    {
                        id: "r2",
                        text: "我更偏向通过阅读教材来学习",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    },
                    {
                        id: "r3",
                        text: "把学到的东西写下来能帮我更好地记住",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    }
                ]
            },
            {
                title: "动觉偏好 (Kinesthetic)",
                questions: [
                    {
                        id: "k1",
                        text: "动手操作让我学得更快",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    },
                    {
                        id: "k2",
                        text: "我喜欢通过做实验/练习来验证知识",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    },
                    {
                        id: "k3",
                        text: "坐着不动学习让我容易走神",
                        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符"]
                    }
                ]
            }
        ],
        scoring: { 非常符合: 5, 比较符合: 4, 一般: 3, 不太符合: 2, 完全不符: 1 }
    };
    res.json({ success: true, data: questionnaire });
});

// ===== CAT自适应测试接口 =====

router.post("/smart-start", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { subject, subjects } = req.body;

        // 清除旧会话
        catSessions.delete(userId);

        const subjectList = subject ? [subject] : subjects || [];

        const engine = new AdaptiveDiagnosticEngine(userId, pool, {
            subjects: subjectList,
            minQuestions: 8,
            maxQuestions: 25,
            targetSE: 0.35
        });

        const firstQuestion = await engine.selectNextQuestion();
        if (!firstQuestion) {
            return res.status(404).json({
                success: false,
                message: "暂无可用题目，请联系管理员录入试题"
            });
        }

        catSessions.set(userId, {
            engine,
            createdAt: Date.now(),
            subject: subjectList
        });

        res.json({
            success: true,
            data: {
                question: firstQuestion,
                sessionInfo: {
                    questionIndex: 1,
                    minQuestions: 8,
                    maxQuestions: 25,
                    ability: 0,
                    abilitySE: 2.0
                }
            }
        });
    } catch (error) {
        console.error("启动CAT诊断失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.post("/smart-next-question", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const session = getCatSession(userId);

        if (!session) {
            return res.status(400).json({
                success: false,
                message: "诊断会话已过期，请重新开始"
            });
        }

        const nextQuestion = await session.engine.selectNextQuestion();
        if (!nextQuestion) {
            return res.json({
                success: true,
                data: {
                    finished: true,
                    message: "诊断测试已完成，可以查看报告"
                }
            });
        }

        res.json({
            success: true,
            data: {
                question: nextQuestion,
                finished: false
            }
        });
    } catch (error) {
        console.error("获取下一题失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.post("/smart-submit-answer", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { questionId, isCorrect, timeMs } = req.body;

        const session = getCatSession(userId);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "诊断会话已过期，请重新开始"
            });
        }

        if (questionId === undefined || !session.engine.questionsUsed.has(questionId)) {
            return res.status(400).json({
                success: false,
                message: "无效的题目ID"
            });
        }

        const result = await session.engine.submitAnswer(questionId, Boolean(isCorrect), timeMs || 0);

        if (!result.shouldContinue) {
            // 诊断完成，生成报告并清理会话
            const catResult = await session.engine.generateReport();
            catSessions.delete(userId);

            return res.json({
                success: true,
                data: {
                    finished: true,
                    ability: result.ability,
                    abilitySE: result.abilitySE,
                    progress: 100,
                    catResult
                }
            });
        }

        res.json({
            success: true,
            data: {
                finished: false,
                ability: result.ability,
                abilitySE: result.abilitySE,
                progress: result.progress,
                recentAccuracy: result.recentAccuracy,
                shouldContinue: true
            }
        });
    } catch (error) {
        console.error("提交CAT答案失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

router.get("/smart-status", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const session = getCatSession(userId);

        if (!session) {
            return res.json({
                success: true,
                data: { active: false, message: "无活跃的诊断会话" }
            });
        }

        res.json({
            success: true,
            data: {
                active: true,
                questionsAnswered: session.engine.responses.length,
                ability: Math.round(session.engine.ability * 100) / 100,
                abilitySE: Math.round(session.engine.abilitySE * 100) / 100
            }
        });
    } catch (error) {
        console.error("获取CAT状态失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

// ===== 智能综合诊断报告 =====

router.get("/smart-report", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { subject } = req.query;

        // 检查是否有活跃的CAT会话
        const session = getCatSession(userId);
        let catResult = null;
        if (session && session.engine.responses.length >= session.engine.minQuestions) {
            catResult = await session.engine.generateReport();
            catSessions.delete(userId);
        }

        // 获取学生画像
        let profile = null;
        try {
            const [rows] = await pool.query("SELECT profile_json FROM student_profiles WHERE user_id = ?", [userId]);
            if (rows.length > 0) {
                profile =
                    typeof rows[0].profile_json === "string" ? JSON.parse(rows[0].profile_json) : rows[0].profile_json;
            }
        } catch (e) {
            console.error("获取画像失败:", e.message);
        }

        const reporter = new SmartDiagnosisReporter(pool);
        const report = await reporter.generateReport({
            userId,
            catResult,
            profile,
            subject: subject || null
        });

        res.json({ success: true, data: report });
    } catch (error) {
        console.error("生成智能报告失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

// ===== BKT知识追踪 =====

router.get("/knowledge-tracing", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const bkt = new KnowledgeTracingEngine();
        const mastery = await bkt.batchEstimateMastery(pool, userId);

        const summary = {
            total: Object.keys(mastery).length,
            mastered: Object.values(mastery).filter(v => v.state === "mastered").length,
            learning: Object.values(mastery).filter(v => v.state === "learning").length,
            beginner: Object.values(mastery).filter(v => v.state === "beginner" || v.state === "not_started").length,
            overallMastery:
                Object.keys(mastery).length > 0
                    ? Math.round(
                          (Object.values(mastery).reduce((s, v) => s + v.mastery, 0) / Object.keys(mastery).length) *
                              100
                      )
                    : 0
        };

        res.json({
            success: true,
            data: {
                mastery,
                summary,
                userParams: await bkt.fitUserParams(pool, userId)
            }
        });
    } catch (error) {
        console.error("知识追踪失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

// ===== 误区检测 =====

router.get("/misconceptions", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const cognitive = new CognitiveDiagnosis();
        const result = await cognitive.batchDiagnoseBySubject(pool, userId);

        const allMisconceptions = [];
        for (const [subject, data] of Object.entries(result)) {
            if (data.misconceptions?.categories) {
                for (const cat of data.misconceptions.categories) {
                    allMisconceptions.push({ ...cat, subject });
                }
            }
        }
        allMisconceptions.sort((a, b) => b.count - a.count);

        res.json({
            success: true,
            data: {
                misconceptions: allMisconceptions,
                totalCategories: allMisconceptions.length,
                criticalCount: allMisconceptions.filter(m => m.severity === "critical").length,
                bySubject: result
            }
        });
    } catch (error) {
        console.error("误区检测失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

// ===== 认知画像 =====

router.get("/cognitive-profile", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const cognitive = new CognitiveDiagnosis();
        const result = await cognitive.batchDiagnoseBySubject(pool, userId);

        // 聚合所有学科的认知数据
        const aggregatedAttrs = {};
        const aggregatedBlooms = {};
        let totalAnswers = 0;
        let totalCorrect = 0;

        for (const [, data] of Object.entries(result)) {
            totalAnswers += data.answerCount || 0;
            totalCorrect += Math.round(((data.accuracy || 0) / 100) * (data.answerCount || 0));

            if (data.dina?.attributeMastery) {
                for (const [attr, attrData] of Object.entries(data.dina.attributeMastery)) {
                    if (!aggregatedAttrs[attr]) aggregatedAttrs[attr] = { mastery: 0, count: 0, state: "" };
                    aggregatedAttrs[attr].mastery += attrData.mastery || 0;
                    aggregatedAttrs[attr].count++;
                }
            }
            if (data.bloom?.levels) {
                for (const [level, levelData] of Object.entries(data.bloom.levels)) {
                    if (!aggregatedBlooms[level]) aggregatedBlooms[level] = { mastery: 0, count: 0 };
                    aggregatedBlooms[level].mastery += levelData.mastery || 0;
                    aggregatedBlooms[level].count++;
                }
            }
        }

        // 计算平均
        for (const [attr, data] of Object.entries(aggregatedAttrs)) {
            data.mastery = Math.round(data.mastery / data.count);
            data.state =
                data.mastery >= 75
                    ? "mastered"
                    : data.mastery >= 50
                      ? "developing"
                      : data.mastery >= 25
                        ? "beginner"
                        : "weak";
        }
        for (const [level, data] of Object.entries(aggregatedBlooms)) {
            data.mastery = Math.round(data.mastery / data.count);
        }

        res.json({
            success: true,
            data: {
                cognitiveAttributes: aggregatedAttrs,
                bloomLevels: aggregatedBlooms,
                overallAccuracy: totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
                totalAnswers,
                bySubject: result
            }
        });
    } catch (error) {
        console.error("获取认知画像失败:", error);
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

module.exports = router;
