class SmartPaperGenerator {
    async generate(pool, { userId, subject, difficulty, questionCount = 20, focusNodes = [] }) {
        const targetDifficulty = difficulty || "medium";
        const count = questionCount || 20;

        const [knowledge] = await pool.query(
            `SELECT node_id, mastery FROM student_knowledge 
             WHERE user_id = ? AND node_id IN (
                 SELECT id FROM knowledge_nodes WHERE subject = ? AND is_active = 1
             )`,
            [userId, subject]
        );

        const masteryMap = {};
        knowledge.forEach(k => {
            masteryMap[k.node_id] = k.mastery || 50;
        });

        const [allNodes] = await pool.query(
            `SELECT id, name, difficulty FROM knowledge_nodes WHERE subject = ? AND is_active = 1`,
            [subject]
        );

        const nodeDifficultyMap = {};
        allNodes.forEach(n => {
            nodeDifficultyMap[n.id] = n.difficulty || "medium";
        });

        const weakNodes = [];
        const mediumNodes = [];
        const strongNodes = [];

        allNodes.forEach(node => {
            const m = masteryMap[node.id];
            if (m === undefined || m < 40) weakNodes.push(node.id);
            else if (m < 70) mediumNodes.push(node.id);
            else strongNodes.push(node.id);
        });

        let selectedNodeList = [];
        if (focusNodes.length > 0) {
            selectedNodeList = focusNodes.filter(id => allNodes.some(n => n.id === id));
        }

        if (weakNodes.length === 0 && mediumNodes.length === 0) {
            selectedNodeList = allNodes.map(n => n.id);
        }

        const typeDistribution = { single: 0.4, multiple: 0.2, judge: 0.2, essay: 0.2 };
        const questions = [];

        for (let i = 0; i < count; i++) {
            let nodePool;
            const rand = Math.random();
            if (weakNodes.length > 0 && rand < 0.5) {
                nodePool = weakNodes.length > 0 ? weakNodes : allNodes.map(n => n.id);
            } else if (mediumNodes.length > 0 && rand < 0.85) {
                nodePool =
                    mediumNodes.length > 0 ? mediumNodes : weakNodes.length > 0 ? weakNodes : allNodes.map(n => n.id);
            } else {
                nodePool = strongNodes.length > 0 ? strongNodes : allNodes.map(n => n.id);
            }
            if (nodePool.length === 0) nodePool = allNodes.map(n => n.id);

            const pickNodeId = nodePool[Math.floor(Math.random() * nodePool.length)];

            let wantedType = "single";
            const t = Math.random();
            if (t < 0.4) wantedType = "single";
            else if (t < 0.6) wantedType = "multiple";
            else if (t < 0.8) wantedType = "judge";
            else wantedType = "essay";

            const nodeDiff = nodeDifficultyMap[pickNodeId] || "medium";
            const typeDiff = targetDifficulty === "easy" ? "easy" : targetDifficulty === "hard" ? "hard" : nodeDiff;

            const [available] = await pool.query(
                `SELECT id, content, options, answer, score, difficulty, type, node_id FROM questions 
                 WHERE node_id = ? AND type = ? AND difficulty = ? AND is_active = 1
                 ORDER BY RAND() LIMIT 1`,
                [pickNodeId, wantedType, typeDiff]
            );

            if (available.length > 0) {
                const q = available[0];
                if (!questions.find(existing => existing.id === q.id)) {
                    questions.push({
                        id: q.id,
                        type: q.type,
                        content: q.content,
                        options: q.options,
                        answer: q.answer,
                        score: parseFloat(q.score),
                        difficulty: q.difficulty,
                        nodeId: q.node_id
                    });
                }
            }
        }

        if (questions.length < 5) {
            const [fallback] = await pool.query(
                `SELECT id, content, options, answer, score, difficulty, type, node_id FROM questions 
                 WHERE node_id IN (${allNodes.map(() => "?").join(",")}) AND is_active = 1
                 ORDER BY RAND() LIMIT ?`,
                [...allNodes.map(n => n.id), count]
            );
            fallback.forEach(q => {
                if (!questions.find(existing => existing.id === q.id)) {
                    questions.push({
                        id: q.id,
                        type: q.type,
                        content: q.content,
                        options: q.options,
                        answer: q.answer,
                        score: parseFloat(q.score),
                        difficulty: q.difficulty,
                        nodeId: q.node_id
                    });
                }
            });
        }

        const totalScore = questions.reduce((s, q) => s + q.score, 0);
        const coveredNodeIds = [...new Set(questions.map(q => q.nodeId))];

        return {
            subject,
            difficulty: targetDifficulty,
            totalQuestions: questions.length,
            totalScore,
            knowledgeCoverage: coveredNodeIds.length,
            weaknessFocus: [...new Set(weakNodes)].length,
            questions
        };
    }
}

module.exports = SmartPaperGenerator;
