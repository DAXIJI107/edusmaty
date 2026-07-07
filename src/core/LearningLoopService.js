const RagSearchService = require("./RagSearchService");

class LearningLoopService {
    constructor(pool) {
        this.pool = pool;
        this.rag = new RagSearchService(pool);
    }

    async addColumnIfNotExists(tableName, columnName, columnType) {
        try {
            const [rows] = await this.pool.query(`PRAGMA table_info("${tableName}")`);
            if (!rows.some(row => row.name === columnName)) {
                await this.pool.query(`ALTER TABLE "${tableName}" ADD COLUMN ${columnName} ${columnType}`);
            }
        } catch (e) {
            // ignore - column may already exist
        }
    }

    async ensureSchema() {
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS learning_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                goal VARCHAR(500) NOT NULL,
                subject VARCHAR(80),
                knowledge_id INTEGER,
                status VARCHAR(32) DEFAULT 'diagnosis_required',
                duration_days INTEGER DEFAULT 3,
                created_at TEXT DEFAULT (DATETIME('now')),
                updated_at TEXT DEFAULT (DATETIME('now'))
            )
        `);
        await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_lg_user_status ON learning_goals (user_id, status)`);

        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS student_knowledge (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                node_id INTEGER NOT NULL,
                mastery INTEGER DEFAULT 0,
                confidence REAL DEFAULT 0.200,
                evidence_count INTEGER DEFAULT 0,
                trend VARCHAR(24) DEFAULT 'unknown',
                last_practice_at TEXT NULL,
                updated_at TEXT DEFAULT (DATETIME('now')),
                UNIQUE (user_id, node_id)
            )
        `);
        await this.addColumnIfNotExists('student_knowledge', 'confidence', 'REAL DEFAULT 0.200');
        await this.addColumnIfNotExists('student_knowledge', 'evidence_count', 'INTEGER DEFAULT 0');
        await this.addColumnIfNotExists('student_knowledge', 'trend', "VARCHAR(24) DEFAULT 'unknown'");
        await this.addColumnIfNotExists('student_knowledge', 'last_practice_at', 'TEXT NULL');
        await this.addColumnIfNotExists('student_knowledge', 'updated_at', "TEXT DEFAULT (DATETIME('now'))");
        await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_sk_user ON student_knowledge (user_id)`);

        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS agent_learning_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                goal_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                version INTEGER DEFAULT 1,
                status VARCHAR(24) DEFAULT 'active',
                plan_json TEXT NOT NULL,
                evidence_json TEXT,
                adjustment_json TEXT,
                created_at TEXT DEFAULT (DATETIME('now')),
                updated_at TEXT DEFAULT (DATETIME('now'))
            )
        `);
        await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_alp_user_status ON agent_learning_plans (user_id, status)`);
        await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_alp_goal ON agent_learning_plans (goal_id)`);
    }

    normalizeGoal(goal) {
        return String(goal || "")
            .trim()
            .slice(0, 500);
    }

    async resolveKnowledge(goal, subject = "all") {
        const normalized = this.normalizeGoal(goal);
        const keywords = normalized
            .replace(/我想|我要|学习|掌握|了解|入门|系统/g, " ")
            .split(/[\s，。、“”]+/)
            .map(item => item.trim())
            .filter(item => item.length >= 2)
            .slice(0, 8);
        const terms = [normalized, ...keywords];
        if (/tcp/i.test(normalized)) terms.unshift("TCP");

        for (const term of terms) {
            const params = [`%${term}%`, `%${term}%`];
            let subjectSql = "";
            if (subject && subject !== "all") {
                subjectSql = " AND subject = ?";
                params.push(subject);
            }
            const [[point]] = await this.pool.query(
                `SELECT id, title, subject, summary, source_name, source_url
                 FROM knowledge_points
                 WHERE (title LIKE ? OR summary LIKE ?)${subjectSql}
                 ORDER BY title LIKE ? DESC, id
                 LIMIT 1`,
                [...params, `%${term}%`]
            );
            if (point) return point;
        }
        return null;
    }

    async getQuestions(knowledgeId, limit = 5) {
        const [rows] = await this.pool.query(
            `SELECT id, question, options_json, difficulty, knowledge_id
             FROM questions
             WHERE knowledge_id = ? AND is_active = 1
             ORDER BY FIELD(difficulty, 'easy', 'medium', 'hard'), id
             LIMIT ?`,
            [knowledgeId, limit]
        );
        return rows.map(row => ({
            id: row.id,
            content: row.question,
            options: this.parseJson(row.options_json, []),
            difficulty: row.difficulty,
            knowledgeId: row.knowledge_id
        }));
    }

    parseJson(value, fallback) {
        if (value && typeof value === "object") return value;
        try {
            return JSON.parse(value || "");
        } catch {
            return fallback;
        }
    }

    async start({ userId, goal, subject = "all", durationDays = 3 }) {
        await this.ensureSchema();
        const normalizedGoal = this.normalizeGoal(goal);
        if (!normalizedGoal) throw new Error("请输入明确的学习目标");

        const knowledge = await this.resolveKnowledge(normalizedGoal, subject);
        if (!knowledge) {
            return {
                success: true,
                stage: "needs_clarification",
                missingInputs: ["knowledge_topic"],
                message: "知识库中没有匹配到该目标，请补充更具体的知识点，例如 TCP/IP、数据库索引或动态规划。"
            };
        }

        const [[existing]] = await this.pool.query(
            `SELECT * FROM learning_goals
             WHERE user_id = ? AND knowledge_id = ? AND status IN ('diagnosis_required', 'active')
             ORDER BY id DESC LIMIT 1`,
            [userId, knowledge.id]
        );
        let goalId = existing?.id;
        if (!goalId) {
            const [created] = await this.pool.query(
                `INSERT INTO learning_goals (user_id, goal, subject, knowledge_id, status, duration_days)
                 VALUES (?, ?, ?, ?, 'diagnosis_required', ?)`,
                [
                    userId,
                    normalizedGoal,
                    knowledge.subject,
                    knowledge.id,
                    Math.max(1, Math.min(7, Number(durationDays)))
                ]
            );
            goalId = created.insertId;
        }

        const [[mastery]] = await this.pool.query(
            "SELECT mastery, confidence, evidence_count, trend FROM student_knowledge WHERE user_id = ? AND node_id = ?",
            [userId, knowledge.id]
        );
        if (!mastery || Number(mastery.evidence_count) < 5) {
            const questions = await this.getQuestions(knowledge.id, 5);
            return {
                success: true,
                stage: "diagnosis_required",
                goalId,
                goal: normalizedGoal,
                knowledge,
                questions,
                missingInputs: ["knowledge_mastery"],
                confidence: mastery ? Number(mastery.confidence) : 0.2,
                message: `需要先完成 ${questions.length} 道 ${knowledge.title} 诊断题，再生成真实计划。`
            };
        }

        return this.generatePlan({ userId, goalId, knowledge, mastery, durationDays });
    }

    async gradeAnswers({ userId, knowledgeId, answers }) {
        const ids = Object.keys(answers || {})
            .map(Number)
            .filter(Boolean);
        if (!ids.length) throw new Error("请至少回答一道题");
        const placeholders = ids.map(() => "?").join(",");
        const [questions] = await this.pool.query(
            `SELECT id, correct_answer, difficulty, knowledge_id
             FROM questions
             WHERE id IN (${placeholders}) AND knowledge_id = ?`,
            [...ids, knowledgeId]
        );
        if (!questions.length) throw new Error("提交的题目不属于当前学习目标");

        let correct = 0;
        const details = [];
        for (const question of questions) {
            const answer = String(answers[question.id] || "").trim();
            const isCorrect = answer === String(question.correct_answer || "").trim();
            correct += isCorrect ? 1 : 0;
            await this.pool.query(
                "INSERT INTO user_answers (user_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?)",
                [userId, question.id, answer, isCorrect ? 1 : 0]
            );
            details.push({ questionId: question.id, isCorrect, difficulty: question.difficulty });
        }
        return {
            total: questions.length,
            correct,
            accuracy: Math.round((correct / questions.length) * 100),
            details
        };
    }

    calculateMastery(accuracy, previous = null, evidenceCount = 0) {
        const baseline = Math.round(20 + accuracy * 0.65);
        if (previous === null || previous === undefined) return Math.max(15, Math.min(85, baseline));
        const weight = Math.min(0.65, 0.25 + evidenceCount * 0.03);
        return Math.max(5, Math.min(95, Math.round(Number(previous) * (1 - weight) + baseline * weight)));
    }

    async submitDiagnosis({ userId, goalId, answers }) {
        await this.ensureSchema();
        const [[goal]] = await this.pool.query("SELECT * FROM learning_goals WHERE id = ? AND user_id = ?", [
            goalId,
            userId
        ]);
        if (!goal) throw new Error("学习目标不存在");

        const result = await this.gradeAnswers({ userId, knowledgeId: goal.knowledge_id, answers });
        const mastery = this.calculateMastery(result.accuracy);
        await this.pool.query(
            `INSERT INTO student_knowledge
                (user_id, node_id, mastery, confidence, evidence_count, trend, last_practice_at)
             VALUES (?, ?, ?, ?, ?, 'baseline', DATETIME('now'))
             ON CONFLICT(user_id, node_id) DO UPDATE SET 
                mastery = excluded.mastery, 
                confidence = excluded.confidence,
                evidence_count = evidence_count + excluded.evidence_count, 
                trend = 'baseline', 
                last_practice_at = DATETIME('now')`,
            [userId, goal.knowledge_id, mastery, Math.min(0.85, 0.35 + result.total * 0.08), result.total]
        );
        await this.pool.query("UPDATE learning_goals SET status = 'active' WHERE id = ?", [goalId]);
        const [[knowledge]] = await this.pool.query(
            "SELECT id, title, subject, summary, source_name, source_url FROM knowledge_points WHERE id = ?",
            [goal.knowledge_id]
        );
        return this.generatePlan({
            userId,
            goalId,
            knowledge,
            mastery: { mastery, confidence: Math.min(0.85, 0.35 + result.total * 0.08), evidence_count: result.total },
            durationDays: goal.duration_days,
            diagnosis: result
        });
    }

    buildPlanDays({ knowledge, mastery, durationDays }) {
        const level = mastery < 45 ? "foundation" : mastery < 70 ? "consolidation" : "advanced";
        const templates = {
            foundation: [
                ["建立概念地图", "理解协议分层、职责和核心术语", "book", 25],
                ["基础例题与诊断纠错", "完成 5 道基础题并逐题解释错因", "exam", 30],
                ["主动回忆与复述", "不看资料复述核心流程并记录卡点", "pen", 20]
            ],
            consolidation: [
                ["梳理关键机制", "对比相近概念并画出执行流程", "route", 25],
                ["变式练习", "完成 5 道中等题，识别常见误区", "exam", 30],
                ["费曼输出", "用自己的话解释并补充一个真实案例", "pen", 20]
            ],
            advanced: [
                ["边界条件与故障分析", "分析异常场景和设计权衡", "brain", 25],
                ["综合应用练习", "完成进阶题并说明每个判断依据", "exam", 30],
                ["迁移应用", "把知识应用到抓包、排障或系统设计案例", "code", 25]
            ]
        };
        return Array.from({ length: durationDays }, (_, index) => {
            const template = templates[level][Math.min(index, 2)];
            return {
                day: index + 1,
                title: `第 ${index + 1} 天：${knowledge.title} · ${template[0]}`,
                objective: template[1],
                task: {
                    title: `${template[0]}：${knowledge.title}`,
                    subtitle: `${knowledge.subject} · ${template[1]}`,
                    icon: template[2],
                    minutes: template[3],
                    status: "pending"
                }
            };
        });
    }

    async getEvidence(knowledge) {
        try {
            const result = await this.rag.search({
                query: `${knowledge.title} ${knowledge.summary || ""}`,
                subject: knowledge.subject,
                limit: 3
            });
            return {
                searchMode: "bm25",
                citations: (result.citations || []).slice(0, 3),
                fallbackUsed: false
            };
        } catch {
            return {
                searchMode: "knowledge_point_source",
                citations: knowledge.source_name
                    ? [{ source: { name: knowledge.source_name, url: knowledge.source_url || "" } }]
                    : [],
                fallbackUsed: true
            };
        }
    }

    async generatePlan({ userId, goalId, knowledge, mastery, durationDays = 3, diagnosis = null }) {
        const days = this.buildPlanDays({
            knowledge,
            mastery: Number(mastery.mastery),
            durationDays: Math.max(1, Math.min(3, Number(durationDays || 3)))
        });
        const evidence = await this.getEvidence(knowledge);
        const plan = {
            goalId,
            knowledge,
            mastery: Number(mastery.mastery),
            confidence: Number(mastery.confidence || 0.5),
            days,
            generatedAt: new Date().toISOString()
        };

        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(
                "UPDATE agent_learning_plans SET status = 'superseded' WHERE user_id = ? AND goal_id = ? AND status = 'active'",
                [userId, goalId]
            );
            const [[versionRow]] = await connection.query(
                "SELECT COALESCE(MAX(version), 0) + 1 AS version FROM agent_learning_plans WHERE goal_id = ?",
                [goalId]
            );
            const [created] = await connection.query(
                `INSERT INTO agent_learning_plans
                    (goal_id, user_id, version, status, plan_json, evidence_json, adjustment_json)
                 VALUES (?, ?, ?, 'active', CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON))`,
                [
                    goalId,
                    userId,
                    versionRow.version,
                    JSON.stringify(plan),
                    JSON.stringify(evidence),
                    JSON.stringify(diagnosis ? { type: "diagnosis", result: diagnosis } : {})
                ]
            );
            await connection.query(
                "DELETE FROM study_tasks WHERE user_id = ? AND source = 'agent-learning-loop' AND task_date >= CURDATE()",
                [userId]
            );
            for (const day of days) {
                await connection.query(
                    `INSERT INTO study_tasks
                        (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status,
                         task_date, sort_order, color, soft_color, source)
                     VALUES (?, ?, ?, ?, ?, ?, 'pending', DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, '#2f6bff',
                        'rgba(47,107,255,.12)', 'agent-learning-loop')`,
                    [
                        userId,
                        knowledge.id,
                        day.task.title,
                        day.task.subtitle,
                        day.task.icon,
                        day.task.minutes,
                        day.day - 1,
                        day.day
                    ]
                );
            }
            await connection.commit();
            return {
                success: true,
                stage: "plan_ready",
                planId: created.insertId,
                goalId,
                generated: days.length,
                plan,
                evidence,
                diagnosis,
                message: `已根据 ${diagnosis?.total || mastery.evidence_count || 0} 条学习证据生成 ${days.length} 天计划。`
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async submitPractice({ userId, goalId, answers }) {
        await this.ensureSchema();
        const [[goal]] = await this.pool.query("SELECT * FROM learning_goals WHERE id = ? AND user_id = ?", [
            goalId,
            userId
        ]);
        if (!goal) throw new Error("学习目标不存在");
        const [[before]] = await this.pool.query(
            "SELECT mastery, evidence_count FROM student_knowledge WHERE user_id = ? AND node_id = ?",
            [userId, goal.knowledge_id]
        );
        const result = await this.gradeAnswers({ userId, knowledgeId: goal.knowledge_id, answers });
        const nextMastery = this.calculateMastery(result.accuracy, before?.mastery, before?.evidence_count || 0);
        const trend = nextMastery > Number(before?.mastery || 0) ? "improving" : "declining";
        await this.pool.query(
            `UPDATE student_knowledge
             SET mastery = ?, confidence = LEAST(0.95, confidence + 0.08), evidence_count = evidence_count + ?,
                 trend = ?, last_practice_at = NOW()
             WHERE user_id = ? AND node_id = ?`,
            [nextMastery, result.total, trend, userId, goal.knowledge_id]
        );

        const adjustment =
            result.accuracy < 60
                ? {
                      type: "remediation",
                      reason: `练习正确率 ${result.accuracy}%，后续计划降低难度并增加概念补救。`,
                      titlePrefix: "补救学习"
                  }
                : {
                      type: "advance",
                      reason: `练习正确率 ${result.accuracy}%，后续计划加入进阶应用。`,
                      titlePrefix: "进阶挑战"
                  };
        await this.pool.query(
            `UPDATE study_tasks
             SET title = CONCAT(?, '：', SUBSTRING_INDEX(title, '：', -1)), subtitle = ?
             WHERE user_id = ? AND knowledge_id = ? AND source = 'agent-learning-loop'
               AND task_date > CURDATE() AND status = 'pending'`,
            [adjustment.titlePrefix, adjustment.reason, userId, goal.knowledge_id]
        );
        await this.pool.query(
            `UPDATE agent_learning_plans
             SET adjustment_json = CAST(? AS JSON), version = version + 1
             WHERE user_id = ? AND goal_id = ? AND status = 'active'`,
            [
                JSON.stringify({ ...adjustment, result, before: before?.mastery || 0, after: nextMastery }),
                userId,
                goalId
            ]
        );
        return {
            success: true,
            stage: "plan_adjusted",
            goalId,
            mode: "practice",
            total: result.total,
            correct: result.correct,
            score: result.accuracy,
            details: result.details,
            result,
            mastery: { before: Number(before?.mastery || 0), after: nextMastery, trend },
            adjustment
        };
    }

    async status(userId, goalId = null) {
        await this.ensureSchema();
        const params = [userId];
        let goalFilter = "";
        if (goalId) {
            goalFilter = " AND lg.id = ?";
            params.push(goalId);
        }
        const [[row]] = await this.pool.query(
            `SELECT lg.*, kp.title AS knowledge_title, kp.summary AS knowledge_summary,
                    sk.mastery, sk.confidence, sk.evidence_count, sk.trend,
                    alp.id AS plan_id, alp.version, alp.plan_json, alp.evidence_json, alp.adjustment_json
             FROM learning_goals lg
             LEFT JOIN knowledge_points kp ON kp.id = lg.knowledge_id
             LEFT JOIN student_knowledge sk ON sk.user_id = lg.user_id AND sk.node_id = lg.knowledge_id
             LEFT JOIN agent_learning_plans alp ON alp.goal_id = lg.id AND alp.status = 'active'
             WHERE lg.user_id = ?${goalFilter}
             ORDER BY lg.id DESC LIMIT 1`,
            params
        );
        if (!row) return { success: true, stage: "empty", goal: null };
        const questions = row.plan_id ? [] : await this.getQuestions(row.knowledge_id, 5);
        const [tasks] = await this.pool.query(
            `SELECT id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, source
             FROM study_tasks
             WHERE user_id = ? AND knowledge_id = ? AND source = 'agent-learning-loop'
             ORDER BY task_date, sort_order`,
            [userId, row.knowledge_id]
        );
        return {
            success: true,
            stage: row.plan_id ? "plan_ready" : "diagnosis_required",
            goal: {
                id: row.id,
                text: row.goal,
                subject: row.subject,
                knowledgeId: row.knowledge_id,
                status: row.status
            },
            mastery: {
                value: Number(row.mastery || 0),
                confidence: Number(row.confidence || 0),
                evidenceCount: Number(row.evidence_count || 0),
                trend: row.trend || "unknown"
            },
            planId: row.plan_id,
            version: row.version,
            plan: this.parseJson(row.plan_json, null),
            evidence: this.parseJson(row.evidence_json, {}),
            adjustment: this.parseJson(row.adjustment_json, {}),
            questions,
            knowledge: {
                id: row.knowledge_id,
                title: row.knowledge_title || row.goal,
                subject: row.subject
            },
            goalId: row.id,
            confidence: Number(row.confidence || 0.2),
            message: row.plan_id ? "学习计划已恢复。" : `需要先完成 ${questions.length} 道诊断题，再生成真实计划。`,
            tasks
        };
    }
}

module.exports = LearningLoopService;
