/**
 * ConversationalProfileEngine — 对话式六维学习画像
 * 维度与 DiagnosticEngine 对齐：概念理解、实践能力、学习持续、执行效率、迁移应用、语言基础
 */
const DIMENSIONS = ["概念理解", "实践能力", "学习持续", "执行效率", "迁移应用", "语言基础"];

const SLOT_QUESTIONS = [
    {
        id: "goal",
        prompt: "你当前最想提升的计算机方向是什么？例如数据结构、操作系统、数据库或编程实践。",
        mapsTo: ["概念理解", "迁移应用"]
    },
    {
        id: "foundation",
        prompt: "你对自己的知识基础打几分（1-5）？哪些知识点最容易出错？",
        mapsTo: ["概念理解", "语言基础"]
    },
    {
        id: "style",
        prompt: "你更偏好看文档、看视频、还是边写代码边学？每天大概能投入多少分钟？",
        mapsTo: ["学习持续", "执行效率", "实践能力"]
    },
    {
        id: "practice",
        prompt: "最近做过哪些练习或项目？遇到卡点时通常怎么解决？",
        mapsTo: ["实践能力", "迁移应用", "执行效率"]
    },
    {
        id: "habit",
        prompt: "你更容易坚持短时高频学习，还是长时段集中学习？有没有经常拖延的情况？",
        mapsTo: ["学习持续", "执行效率"]
    },
    {
        id: "confirm",
        prompt: "我已根据对话整理出六维画像草稿，你确认后我会保存并用于路径与资源生成。还有要补充的吗？",
        mapsTo: DIMENSIONS
    }
];

function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(Number(n) || 0)));
}

function extractScoreHints(text) {
    const t = String(text || "");
    const scores = {};
    const numMatch = t.match(/([1-5])\s*分/);
    const base = numMatch ? Number(numMatch[1]) * 18 : null;

    if (/基础差|小白|零基础|不会|薄弱/.test(t)) scores.概念理解 = 35;
    if (/还行|一般|中等/.test(t)) scores.概念理解 = 55;
    if (/扎实|较强|精通|熟练/.test(t)) scores.概念理解 = 78;
    if (base != null) scores.概念理解 = clamp(base);

    if (/代码|刷题|项目|实验|动手|leetcode|编程/.test(t)) scores.实践能力 = 70;
    if (/只看不练|很少写代码|不会写/.test(t)) scores.实践能力 = 35;

    if (/每天|坚持|打卡|高频/.test(t)) scores.学习持续 = 75;
    if (/拖延|三天打鱼|很难坚持|懒得/.test(t)) scores.学习持续 = 35;

    const minutes = t.match(/(\d{2,3})\s*分钟/);
    if (minutes) {
        const m = Number(minutes[1]);
        scores.执行效率 = clamp(40 + Math.min(m, 120) / 2);
        scores.学习持续 = Math.max(scores.学习持续 || 50, clamp(45 + m / 3));
    }
    if (/短时|番茄|碎片/.test(t)) scores.执行效率 = Math.max(scores.执行效率 || 50, 68);
    if (/长时段|一口气|熬夜/.test(t)) scores.执行效率 = Math.max(scores.执行效率 || 50, 60);

    if (/迁移|应用|项目落地|综合/.test(t)) scores.迁移应用 = 72;
    if (/不会用|学了就忘|不会迁移/.test(t)) scores.迁移应用 = 38;

    if (/英语|英文文档|论文/.test(t) && /差|看不懂/.test(t)) scores.语言基础 = 40;
    if (/英语|英文文档/.test(t) && /还行|可以|习惯/.test(t)) scores.语言基础 = 70;

    if (/数据结构|算法|操作系统|数据库|网络|人工智能|机器学习/.test(t)) {
        scores.概念理解 = Math.max(scores.概念理解 || 50, 58);
        scores.迁移应用 = Math.max(scores.迁移应用 || 50, 55);
    }

    return scores;
}

function extractPreferences(text) {
    const t = String(text || "");
    const prefs = {
        cognitiveStyle: "balanced",
        dailyMinutes: 60,
        weakPoints: [],
        goals: [],
        errorPreference: "concept"
    };

    if (/视频/.test(t)) prefs.cognitiveStyle = "auditory";
    if (/文档|阅读|看书|笔记/.test(t)) prefs.cognitiveStyle = "visual";
    if (/代码|动手|实践|项目/.test(t)) prefs.cognitiveStyle = "kinesthetic";

    const minutes = t.match(/(\d{2,3})\s*分钟/);
    if (minutes) prefs.dailyMinutes = Number(minutes[1]);

    const goalMatch = t.match(/(数据结构|算法|操作系统|数据库|计算机网络|编程|人工智能|机器学习)/g);
    if (goalMatch) prefs.goals = [...new Set(goalMatch)];

    if (/易错|错题|粗心|边界|指针|递归|并发/.test(t)) {
        prefs.weakPoints = [...new Set((t.match(/指针|递归|并发|事务|死锁|索引|哈希|树|图/g) || []).concat(["易错点待确认"]))];
        prefs.errorPreference = "practice_error";
    }

    return prefs;
}

function mergeDimensions(current, hints) {
    const next = { ...current };
    for (const dim of DIMENSIONS) {
        if (hints[dim] != null) {
            // 对话增量：新证据与旧值加权
            next[dim] = clamp((Number(next[dim] || 50) * 0.45 + Number(hints[dim]) * 0.55));
        }
    }
    return next;
}

function defaultDimensions() {
    return {
        概念理解: 50,
        实践能力: 45,
        学习持续: 50,
        执行效率: 50,
        迁移应用: 45,
        语言基础: 50
    };
}

function buildRadar(dimensions) {
    return {
        labels: DIMENSIONS.slice(),
        datasets: [
            {
                label: "对话画像",
                data: DIMENSIONS.map(d => dimensions[d] || 50),
                backgroundColor: "rgba(95,88,238,0.15)",
                borderColor: "#5f58ee"
            }
        ]
    };
}

function completeness(dimensions, turns) {
    const filled = DIMENSIONS.filter(d => Number(dimensions[d]) !== 50).length;
    const turnBonus = Math.min(turns, 6);
    return clamp((filled / 6) * 70 + turnBonus * 5);
}

class ConversationalProfileEngine {
    constructor(pool) {
        this.pool = pool;
        this.sessions = new Map();
    }

    getSession(userId) {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, {
                turns: [],
                dimensions: defaultDimensions(),
                preferences: {
                    cognitiveStyle: "balanced",
                    dailyMinutes: 60,
                    weakPoints: [],
                    goals: [],
                    errorPreference: "concept"
                },
                stepIndex: 0,
                updatedAt: Date.now()
            });
        }
        return this.sessions.get(userId);
    }

    async processTurn(userId, message, { confirm = false } = {}) {
        const session = this.getSession(userId);
        const text = String(message || "").trim();
        if (!text) {
            return {
                success: false,
                message: "请先输入一段学习情况描述",
                nextQuestion: SLOT_QUESTIONS[session.stepIndex]?.prompt || SLOT_QUESTIONS[0].prompt
            };
        }

        const hints = extractScoreHints(text);
        const prefs = extractPreferences(text);
        session.dimensions = mergeDimensions(session.dimensions, hints);
        session.preferences = {
            ...session.preferences,
            ...prefs,
            goals: [...new Set([...(session.preferences.goals || []), ...(prefs.goals || [])])],
            weakPoints: [...new Set([...(session.preferences.weakPoints || []), ...(prefs.weakPoints || [])])]
        };
        session.turns.push({ role: "user", text, at: Date.now(), hints });
        session.stepIndex = Math.min(session.stepIndex + 1, SLOT_QUESTIONS.length - 1);
        session.updatedAt = Date.now();

        const complete = completeness(session.dimensions, session.turns.length);
        const readyToSave = confirm || complete >= 75 || session.stepIndex >= SLOT_QUESTIONS.length - 1;

        let saved = null;
        if (readyToSave && this.pool) {
            saved = await this.persist(userId, session);
        }

        const next = SLOT_QUESTIONS[Math.min(session.stepIndex, SLOT_QUESTIONS.length - 1)];
        return {
            success: true,
            dimensions: session.dimensions,
            radar: buildRadar(session.dimensions),
            preferences: session.preferences,
            completeness: complete,
            dimensionCount: DIMENSIONS.length,
            turns: session.turns.length,
            nextQuestion: next.prompt,
            nextQuestionId: next.id,
            saved,
            profileSummary: this.summarize(session)
        };
    }

    summarize(session) {
        const top = Object.entries(session.dimensions).sort((a, b) => b[1] - a[1])[0];
        const weak = Object.entries(session.dimensions).sort((a, b) => a[1] - b[1])[0];
        return {
            strongDimension: top?.[0],
            weakDimension: weak?.[0],
            goals: session.preferences.goals,
            dailyMinutes: session.preferences.dailyMinutes,
            cognitiveStyle: session.preferences.cognitiveStyle,
            text: `当前较强维度是「${top?.[0]}」，待加强是「${weak?.[0]}」。目标：${(session.preferences.goals || []).join("、") || "待明确"}；每日约 ${session.preferences.dailyMinutes} 分钟。`
        };
    }

    async persist(userId, session) {
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS student_profiles (
                user_id INT NOT NULL PRIMARY KEY,
                profile_json JSON NOT NULL,
                version INT DEFAULT 1,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        const profileJson = {
            source: "conversational_v1",
            dimensions: session.dimensions,
            preferences: session.preferences,
            radarLabels: DIMENSIONS,
            turns: session.turns.slice(-12),
            updatedAt: new Date().toISOString()
        };

        await this.pool.query(
            `INSERT INTO student_profiles (user_id, profile_json, version)
             VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE
                profile_json = VALUES(profile_json),
                version = version + 1,
                updated_at = CURRENT_TIMESTAMP`,
            [userId, JSON.stringify(profileJson)]
        );

        return { userId, versionBump: true, dimensions: session.dimensions };
    }
}

module.exports = {
    ConversationalProfileEngine,
    DIMENSIONS,
    SLOT_QUESTIONS,
    extractScoreHints,
    extractPreferences,
    mergeDimensions,
    defaultDimensions,
    buildRadar,
    completeness
};
