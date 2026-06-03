class DynamicLearningPath {
    async generatePath(userId, goal, pool) {
        const userLevel = await this.assessUserLevel(userId, pool);
        const goalNodes = await this.parseGoal(goal, pool);
        const allNodes = await this.buildNodeGraph(goalNodes, pool);
        const userMastery = await this.getUserMasteryMap(userId, pool);

        const path = this.planPath(allNodes, userMastery, userLevel);
        const enrichedPath = await this.enrichPath(path, pool);

        return {
            goal,
            userLevel,
            totalNodes: enrichedPath.length,
            estimatedHours: enrichedPath.reduce((s, n) => s + n.estimatedHours, 0),
            difficulty: this.assessPathDifficulty(enrichedPath),
            nodes: enrichedPath,
            milestones: this.identifyMilestones(enrichedPath),
            alternatives: this.generateAlternatives(enrichedPath, userLevel)
        };
    }

    async assessUserLevel(userId, pool) {
        const [rows] = await pool.query(
            'SELECT AVG(mastery) as avg_mastery FROM student_knowledge WHERE user_id = ?',
            [userId]
        );
        const avg = rows[0]?.avg_mastery || 0;
        if (avg < 30) return { level: 'beginner', avgMastery: avg };
        if (avg < 55) return { level: 'elementary', avgMastery: avg };
        if (avg < 75) return { level: 'intermediate', avgMastery: avg };
        return { level: 'advanced', avgMastery: avg };
    }

    async parseGoal(goal, pool) {
        const keywords = this.extractKeywords(goal);
        const nodes = [];

        for (const keyword of keywords) {
            const [rows] = await pool.query(
                `SELECT id, name, subject, chapter, description FROM knowledge_nodes
                 WHERE (name LIKE ? OR description LIKE ? OR subject LIKE ?) AND is_active = 1
                 LIMIT 5`,
                [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
            );
            nodes.push(...rows);
        }

        return nodes.slice(0, 10);
    }

    extractKeywords(text) {
        const stopWords = ['的', '了', '是', '在', '和', '就', '都', '而', '及', '与',
            '不', '挂', '科', '想', '要', '学', '习', '通过', '考试'];
        const chars = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
        const words = chars.split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w));
        return [...new Set(words)];
    }

    async buildNodeGraph(goalNodes, pool) {
        if (goalNodes.length === 0) {
            const [allNodes] = await pool.query(
                'SELECT id, name, subject, chapter, description FROM knowledge_nodes WHERE is_active = 1 LIMIT 20'
            );
            return allNodes;
        }

        const subjectNodes = {};
        for (const node of goalNodes) {
            if (!subjectNodes[node.subject]) subjectNodes[node.subject] = [];
            subjectNodes[node.subject].push(node);
        }

        const allNodes = [];
        for (const [subject, nodes] of Object.entries(subjectNodes)) {
            const [prerequisites] = await pool.query(
                `SELECT id, name, subject, chapter, description FROM knowledge_nodes
                 WHERE subject = ? AND is_active = 1
                 ORDER BY FIELD(chapter, ${nodes.map(n => `'${n.chapter}'`).join(',')}) ASC
                 LIMIT 15`,
                [subject]
            );
            allNodes.push(...prerequisites);
        }

        return [...new Map(allNodes.map(n => [n.id, n])).values()];
    }

    async getUserMasteryMap(userId, pool) {
        const [rows] = await pool.query(
            'SELECT node_id, mastery FROM student_knowledge WHERE user_id = ?',
            [userId]
        );
        const map = {};
        for (const row of rows) {
            map[row.node_id] = row.mastery;
        }
        return map;
    }

    planPath(nodes, userMastery, userLevel) {
        const planned = nodes.map(node => {
            const mastery = userMastery[node.id] || 0;
            const priority = this.calculatePriority(mastery, node);
            const difficulty = this.calculateNodeDifficulty(mastery, userLevel.level);

            return {
                ...node,
                mastery,
                priority,
                difficulty,
                status: mastery >= 80 ? 'mastered' : mastery >= 50 ? 'in_progress' : 'pending',
                estimatedHours: this.estimateHours(mastery, difficulty),
                color: this.getNodeColor(mastery)
            };
        });

        planned.sort((a, b) => {
            if (a.status === 'mastered' && b.status !== 'mastered') return 1;
            if (a.status !== 'mastered' && b.status === 'mastered') return -1;
            return b.priority - a.priority;
        });

        return planned;
    }

    calculatePriority(mastery, node) {
        const masteryScore = (100 - mastery) / 100;
        const dependencyScore = node.chapter ? parseInt(node.chapter.replace('CH', '')) / 10 : 0.5;
        return Math.round((masteryScore * 0.6 + dependencyScore * 0.4) * 100);
    }

    calculateNodeDifficulty(mastery, level) {
        if (mastery >= 80) return 'easy';
        if (mastery >= 50) return 'medium';
        if (level === 'beginner' && mastery < 30) return 'hard';
        return 'medium';
    }

    estimateHours(mastery, difficulty) {
        if (mastery >= 80) return 0.5;
        if (difficulty === 'hard') return 3;
        if (difficulty === 'medium') return 2;
        return 1;
    }

    getNodeColor(mastery) {
        if (mastery >= 80) return '#22c55e';
        if (mastery >= 50) return '#eab308';
        return '#ef4444';
    }

    async enrichPath(path, pool) {
        const enriched = [];
        for (const node of path) {
            const [resources] = await pool.query(
                `SELECT id, title, type, url FROM course_materials
                 WHERE node_id = ? LIMIT 3`,
                [node.id]
            );

            enriched.push({
                ...node,
                resources: resources.map(r => ({
                    id: r.id,
                    title: r.title,
                    type: r.type,
                    url: r.url
                })),
                tips: this.getLearningTips(node.difficulty, node.mastery)
            });
        }
        return enriched;
    }

    getLearningTips(difficulty, mastery) {
        if (mastery >= 80) return '已掌握，可直接进入下一阶段';
        if (difficulty === 'hard') return '难度较高，建议先打好基础，多花时间理解';
        if (difficulty === 'medium') return '适中难度，建议结合练习巩固';
        return '基础内容，快速学习即可';
    }

    assessPathDifficulty(nodes) {
        const hardCount = nodes.filter(n => n.difficulty === 'hard').length;
        const totalCount = nodes.length;
        if (hardCount / totalCount > 0.3) return 'challenging';
        if (hardCount / totalCount > 0.15) return 'moderate';
        return 'manageable';
    }

    identifyMilestones(nodes) {
        const milestones = [];
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].difficulty === 'hard' || (i > 0 && nodes[i].chapter !== nodes[i - 1].chapter)) {
                milestones.push({
                    nodeIndex: i,
                    nodeName: nodes[i].name,
                    type: nodes[i].difficulty === 'hard' ? 'challenge' : 'chapter_transition',
                    message: nodes[i].difficulty === 'hard'
                        ? `即将进入难点：${nodes[i].name}，建议预留充足时间`
                        : `进入新章节：${nodes[i].name}`
                });
            }
        }
        return milestones;
    }

    generateAlternatives(nodes, userLevel) {
        if (userLevel.level === 'beginner') {
            return [{
                type: 'gentle',
                description: '基础薄弱版：延长学习时间，增加基础练习',
                estimatedHours: nodes.reduce((s, n) => s + n.estimatedHours, 0) * 1.5
            }];
        }
        if (userLevel.level === 'advanced') {
            return [{
                type: 'accelerated',
                description: '快速版：跳过已掌握内容，聚焦难点',
                estimatedHours: nodes.filter(n => n.mastery < 80).reduce((s, n) => s + n.estimatedHours, 0) * 0.8
            }];
        }
        return [{
            type: 'standard',
            description: '标准版：按推荐顺序学习',
            estimatedHours: nodes.reduce((s, n) => s + n.estimatedHours, 0)
        }];
    }

    async adjustPath(userId, pathId, performance, pool) {
        const adjustments = [];

        if (performance.errorRate > 0.5) {
            adjustments.push({
                type: 'pause_and_review',
                message: '检测到你在当前知识点上遇到困难，建议暂停并回顾前置知识',
                suggestedAction: '复习前置知识点',
                affectedNodes: performance.weakNodes
            });
        }

        if (performance.accuracy > 0.9 && performance.speed < performance.expectedSpeed * 0.7) {
            adjustments.push({
                type: 'skip_ahead',
                message: '你掌握得很好！建议跳过剩余基础练习，直接进入进阶内容',
                estimatedTimeSaved: '约20分钟',
                skipNodes: performance.masteredNodes
            });
        }

        if (performance.fatigueScore > 70) {
            adjustments.push({
                type: 'rest_suggestion',
                message: '检测到疲劳度较高，建议休息或切换到轻松的学习模式',
                suggestedAction: '休息15分钟或浏览知识卡片'
            });
        }

        return {
            pathId,
            adjustments,
            hasChanges: adjustments.length > 0,
            updatedPath: adjustments.length > 0 ? await this.generatePath(userId, 'adjusted', pool) : null
        };
    }
}

module.exports = DynamicLearningPath;