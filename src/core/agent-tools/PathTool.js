const MasteryTool = require("./MasteryTool");

class PathTool {
    constructor(pool) {
        this.pool = pool;
        this.masteryTool = new MasteryTool(pool);
    }

    /**
     * 动态路径生成
     * 基于：掌握度、先修关系、错题记录、知识图谱
     */
    async run({ userId, goal, subject = "all", intensity = "normal", weakPoints = [], resources = {}, practice = {} }) {
        // 1. 获取所有相关知识点及其真实掌握度
        const allPoints = await this._getAllRelevantPoints(userId, subject, weakPoints);

        // 2. 如果没有足够数据，生成基线任务
        if (!allPoints.length || (weakPoints.length === 0 && allPoints.length < 2)) {
            return this._generateBaselineTasks(userId, goal, subject);
        }

        // 3. 基于先修关系拓扑排序
        const sortedPoints = await this._topologicalSort(userId, allPoints);

        // 4. 根据强度筛选
        const limit = intensity === "light" ? 2 : intensity === "intense" ? 5 : 3;
        const selected = sortedPoints.slice(0, limit);

        // 5. 清除旧的 Agent 任务
        await this.pool
            .query('DELETE FROM study_tasks WHERE user_id = ? AND task_date = CURDATE() AND source = "agent-runtime"', [
                userId
            ])
            .catch(() => {});

        // 6. 生成路径节点和任务
        const pathNodes = [];
        let order = 1;

        for (const point of selected) {
            const mastery = point.realMastery;
            const prereqs = point.prerequisites || [];
            const errors = point.errorCount || 0;

            // 匹配课程资源
            const course = (resources.courses || []).find(c => c.subject === point.subject) || resources.courses?.[0];

            // 匹配练习题数量
            const questionCount = (practice.questions || []).filter(
                q => Number(q.knowledge_id) === Number(point.id)
            ).length;

            // 根据掌握度决定任务强度
            let tasks;
            if (mastery < 40) {
                // 低掌握度：需要完整的学习路径
                tasks = [
                    {
                        icon: "book",
                        title: `预习先修：${prereqs.join("、") || "基础概念"}`,
                        minutes: 20,
                        subtitle: "补足前置知识"
                    },
                    {
                        icon: "video",
                        title: `课程学习：${point.title}`,
                        minutes: 30,
                        subtitle: course ? `推荐：${course.title}` : "先看概念讲解"
                    },
                    {
                        icon: "exam",
                        title: `基础练习：${point.title}`,
                        minutes: 25,
                        subtitle: `${questionCount || 3} 道基础题 · 做完后更新掌握度`
                    },
                    {
                        icon: "pen",
                        title: `整理笔记：${point.title}`,
                        minutes: 15,
                        subtitle: "记录核心概念、常见错误和理解误区"
                    }
                ];
            } else if (mastery < 70) {
                tasks = [
                    {
                        icon: "exam",
                        title: `巩固练习：${point.title}`,
                        minutes: 20,
                        subtitle: `${questionCount || 3} 道进阶题`
                    },
                    {
                        icon: "pen",
                        title: `错题复盘：${point.title}`,
                        minutes: 15,
                        subtitle: errors > 0 ? `已累计 ${errors} 道错题，重点纠正` : "梳理易错点"
                    },
                    {
                        icon: "book",
                        title: `拓展阅读：${point.title}`,
                        minutes: 15,
                        subtitle: course ? `参考：${course.title}` : "查阅资料深化理解"
                    }
                ];
            } else {
                tasks = [
                    {
                        icon: "exam",
                        title: `挑战练习：${point.title}`,
                        minutes: 15,
                        subtitle: `${questionCount || 2} 道难题 · 检验掌握程度`
                    },
                    {
                        icon: "pen",
                        title: `迁移笔记：${point.title}`,
                        minutes: 10,
                        subtitle: "总结可迁移的解题模式和技巧"
                    }
                ];
            }

            const selectedTasks = intensity === "light" ? tasks.slice(0, 2) : tasks;

            // 写入任务
            for (const task of selectedTasks) {
                await this.pool
                    .query(
                        `INSERT INTO study_tasks
                        (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, color, soft_color, source)
                     VALUES (?, ?, ?, ?, ?, ?, 'pending', CURDATE(), ?, '#2f6bff', 'rgba(47,107,255,.12)', 'agent-runtime')`,
                        [userId, point.id, task.title, task.subtitle, task.icon, task.minutes, order]
                    )
                    .catch(() => {});
                order += 1;
            }

            // 生成路径节点说明
            const reason = this._generateReason(mastery, errors, point.trend, prereqs);

            pathNodes.push({
                knowledgeId: point.id,
                title: point.title,
                subject: point.subject,
                mastery,
                trend: point.trend,
                reason,
                evidence: {
                    goal: goal || "智能学习闭环",
                    questionCount,
                    course: course ? course.title : "无匹配课程",
                    errorCount: errors,
                    prerequisites: prereqs,
                    trend: point.trend,
                    estimatedMinutes: selectedTasks.reduce((sum, t) => sum + t.minutes, 0)
                },
                tasks: selectedTasks
            });
        }

        // 7. 记录活动
        await this.pool
            .query(
                `INSERT INTO activities (user_id, icon, title, time_label, badge, color, soft_color)
             VALUES (?, 'robot', ?, '刚刚', '动态路径', '#2f6bff', 'rgba(47,107,255,.12)')`,
                [userId, `智能体基于掌握度和错题生成了 ${pathNodes.length} 个节点的学习路径`]
            )
            .catch(() => {});

        return {
            generated: order - 1,
            pathNodes,
            summary: `已写入 ${order - 1} 个今日学习任务，覆盖 ${pathNodes.length} 个知识点。基于实际掌握度和错题记录动态生成。`
        };
    }

    /**
     * 获取知识点及其真实掌握度、先修关系、错题记录
     */
    async _getAllRelevantPoints(userId, subject, weakPoints) {
        // 如果有 weakPoints，使用它们
        const ids = weakPoints.map(p => Number(p.id)).filter(Boolean);

        if (ids.length) {
            // 批量获取掌握度
            const masteryMap = await this.masteryTool.batchGet(userId, ids);

            const [prereqs] = await this.pool
                .query(
                    `SELECT p.node_id, GROUP_CONCAT(kp.title SEPARATOR '，') as prereq_titles
                 FROM prerequisites p
                 JOIN knowledge_points kp ON kp.id = p.prereq_id
                 WHERE p.node_id IN (${ids.map(() => "?").join(",")})
                 GROUP BY p.node_id`,
                    ids
                )
                .catch(() => [[]]);

            const prereqMap = {};
            prereqs.forEach(r => {
                prereqMap[r.node_id] = r.prereq_titles ? r.prereq_titles.split("，") : [];
            });

            return weakPoints.map(p => ({
                id: Number(p.id),
                title: p.title,
                subject: p.subject,
                realMastery: masteryMap[Number(p.id)]?.mastery || p.mastery || 0,
                trend: masteryMap[Number(p.id)]?.trend || "unknown",
                errorCount: masteryMap[Number(p.id)]?.errorCount || 0,
                prerequisites: prereqMap[Number(p.id)] || []
            }));
        }

        // 否则查询学科下所有知识点
        const where = subject && subject !== "all" ? "WHERE kp.subject = ?" : "";
        const params = subject && subject !== "all" ? [subject] : [];

        const [points] = await this.pool
            .query(
                `SELECT kp.id, kp.title, kp.subject, kp.mastery
             FROM knowledge_points kp
             ${where}
             ORDER BY kp.mastery ASC
             LIMIT 20`,
                params
            )
            .catch(() => [[]]);

        if (!points.length) return [];

        const allIds = points.map(p => p.id);
        const masteryMap = await this.masteryTool.batchGet(userId, allIds);

        const [prereqs] = await this.pool
            .query(
                `SELECT p.node_id, GROUP_CONCAT(kp.title SEPARATOR '，') as prereq_titles
             FROM prerequisites p
             JOIN knowledge_points kp ON kp.id = p.prereq_id
             WHERE p.node_id IN (${allIds.map(() => "?").join(",")})
             GROUP BY p.node_id`,
                allIds
            )
            .catch(() => [[]]);

        const prereqMap = {};
        prereqs.forEach(r => {
            prereqMap[r.node_id] = r.prereq_titles ? r.prereq_titles.split("，") : [];
        });

        return points.map(p => ({
            id: p.id,
            title: p.title,
            subject: p.subject,
            realMastery: masteryMap[p.id]?.mastery || p.mastery || 0,
            trend: masteryMap[p.id]?.trend || "unknown",
            errorCount: masteryMap[p.id]?.errorCount || 0,
            prerequisites: prereqMap[p.id] || []
        }));
    }

    /**
     * 基于先修关系拓扑排序
     * 优先安排：有先修关系且掌握度低的知识点 → 错题多的知识点 → 掌握度低的
     */
    async _topologicalSort(userId, points) {
        const sorted = [...points];

        // 优先级评分 = 先修权重 + 错题权重 + 掌握度权重
        const score = p => {
            const prereqWeight = p.prerequisites.length > 0 ? 1.5 : 1.0;
            const errorWeight = Math.min(2.0, 0.5 + Math.log2(1 + p.errorCount));
            const masteryInverse = (100 - p.realMastery) / 100;
            return prereqWeight * 2 + errorWeight * 1.5 + masteryInverse * 3;
        };

        sorted.sort((a, b) => score(b) - score(a));
        return sorted;
    }

    /**
     * 生成路径节点的理由说明
     */
    _generateReason(mastery, errorCount, trend, prereqs) {
        const parts = [];

        if (mastery < 40) {
            parts.push(`掌握度仅 ${mastery}%，处于入门阶段，需要完整学习路径。`);
        } else if (mastery < 70) {
            parts.push(`掌握度 ${mastery}%，已入门但需要巩固和纠错。`);
        } else {
            parts.push(`掌握度 ${mastery}%，安排挑战练习和知识迁移。`);
        }

        if (errorCount > 3) {
            parts.push(`累计 ${errorCount} 道错题，优先安排错题复盘。`);
        } else if (errorCount > 0) {
            parts.push(`有 ${errorCount} 道错题记录，建议关注薄弱环节。`);
        }

        if (trend === "declining") {
            parts.push("近期掌握度下降，可能是遗忘导致，建议立即复习。");
        } else if (trend === "improving") {
            parts.push("近期掌握度上升，趁热打铁安排进阶练习。");
        }

        if (prereqs.length > 0) {
            parts.push(`先修知识：${prereqs.join("、")}。`);
        }

        return parts.join(" ");
    }

    /**
     * 生成基线任务（画像数据不足时）
     */
    async _generateBaselineTasks(userId, goal, subject) {
        await this.pool
            .query(
                `INSERT INTO study_tasks
                (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, color, soft_color, source)
             VALUES
                (?, NULL, ?, ?, 'brain', 20, 'pending', CURDATE(), 1, '#2f6bff', 'rgba(47,107,255,.12)', 'agent-runtime'),
                (?, NULL, ?, ?, 'exam', 20, 'pending', CURDATE(), 2, '#ff9500', 'rgba(255,149,0,.12)', 'agent-runtime'),
                (?, NULL, ?, ?, 'pen', 12, 'pending', CURDATE(), 3, '#7c4dff', 'rgba(124,77,255,.12)', 'agent-runtime')`,
                [
                    userId,
                    `建立诊断画像：${goal || subject}`,
                    "智能体缺少足够画像数据，先完成一次快速诊断。",
                    userId,
                    `基线小测：${goal || subject}`,
                    "用少量题目建立初始掌握度。",
                    userId,
                    `学习目标卡：${goal || subject}`,
                    "写下目标、截止时间和当前最不确定的问题。"
                ]
            )
            .catch(() => {});

        return {
            generated: 3,
            pathNodes: [
                {
                    knowledgeId: null,
                    title: goal || subject || "建立学习画像",
                    subject,
                    mastery: null,
                    reason: "当前画像数据不足，智能体先安排诊断、小测和目标卡，完成后再生成精细路径。",
                    evidence: {
                        goal: goal || "智能学习闭环",
                        message: "缺少足够知识点数据，需要建立掌握度基线"
                    },
                    tasks: []
                }
            ],
            summary: "画像数据不足，已写入 3 个基线任务用于建立智能学习起点。"
        };
    }
}

module.exports = PathTool;
