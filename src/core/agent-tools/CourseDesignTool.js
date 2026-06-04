class CourseDesignTool {
    constructor(pool) {
        this.pool = pool;
    }

    async run({ userId, goal, subject = "all", durationDays = 7, profile = {}, resources = {}, practice = {} }) {
        const weakPoints = profile.weakPoints || [];
        const focusPoints = weakPoints.slice(0, Math.min(5, Math.max(2, Number(durationDays || 7) >= 7 ? 5 : 3)));
        const days = Math.max(1, Math.min(14, Number(durationDays || 7)));
        const units = [];
        for (let day = 1; day <= days; day += 1) {
            const point = focusPoints[(day - 1) % Math.max(1, focusPoints.length)] || {};
            const course =
                (resources.courses || []).find(item => item.subject === point.subject) || resources.courses?.[0];
            units.push({
                day,
                title: point.title ? `第 ${day} 天：${point.title} 修复与迁移` : `第 ${day} 天：建立诊断画像`,
                objective: point.title
                    ? `把 ${point.title} 从识记推进到可做题、可复述、可迁移。`
                    : "完成诊断并生成个性化路径。",
                resource: course ? course.title : "平台题库与智能笔记",
                practiceCount:
                    (practice.questions || []).filter(item => Number(item.knowledge_id) === Number(point.id)).length ||
                    3,
                noteTask: point.title ? `写一张「${point.title}」主动回忆卡。` : "写一张学习目标卡。",
                assessment: "用 3 道检验题和 1 个口头复述判断是否进入下一阶段。",
                reason: point.mastery
                    ? `当前掌握度 ${point.mastery}%，需要安排讲解、练习、笔记闭环。`
                    : "缺少画像数据，先建立基线。"
            });
        }

        const design = {
            goal: goal || "完成智能学习闭环",
            subject: subject === "all" ? focusPoints[0]?.subject || "综合" : subject,
            durationDays: days,
            prerequisites: focusPoints
                .slice(0, 3)
                .map(item => item.title)
                .filter(Boolean),
            units,
            evaluation: [
                "每日完成课程任务和练习后更新掌握度。",
                "错题进入错题本并生成变式练习。",
                "每两天生成一次复盘卡和路径调整建议。"
            ],
            agentDecision: {
                confidence: focusPoints.length ? 0.82 : 0.58,
                evidence: [
                    profile.summary || "读取学习画像",
                    resources.summary || "匹配课程资源",
                    practice.summary || "生成练习计划"
                ]
            }
        };

        let designId = null;
        try {
            const [result] = await this.pool.query(
                `INSERT INTO ai_course_designs (user_id, goal, subject, duration_days, design_json, status)
                 VALUES (?, ?, ?, ?, CAST(? AS JSON), 'draft')`,
                [userId, design.goal, design.subject, days, JSON.stringify(design)]
            );
            designId = result.insertId;
        } catch (error) {
            designId = null;
        }

        return {
            designId,
            design,
            summary: `已生成 ${days} 天课程设计，包含 ${units.length} 个学习单元。`
        };
    }
}

module.exports = CourseDesignTool;
