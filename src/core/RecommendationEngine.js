class RecommendationEngine {
    async afterExam(pool, { userId, examRecordId }) {
        const [answers] = await pool.query(
            `SELECT ua.question_id, ua.answer as user_ans, q.answer as correct_ans, 
                    q.node_id, q.subject, q.difficulty, kn.name as node_name
             FROM user_answers ua
             JOIN questions q ON ua.question_id = q.id
             LEFT JOIN knowledge_nodes kn ON q.node_id = kn.id
             WHERE ua.user_exam_id = ?`,
            [examRecordId]
        );

        const wrongQuestions = answers.filter(a => {
            const userAns = (a.user_ans || '').trim();
            const correctAns = (a.correct_ans || '').trim();
            return userAns !== correctAns;
        });

        const nodeErrorMap = {};
        wrongQuestions.forEach(q => {
            if (!q.node_id) return;
            if (!nodeErrorMap[q.node_id]) {
                nodeErrorMap[q.node_id] = { nodeId: q.node_id, nodeName: q.node_name, subject: q.subject, errors: [], count: 0 };
            }
            nodeErrorMap[q.node_id].errors.push(q.question_id);
            nodeErrorMap[q.node_id].count++;
        });

        const weakPoints = Object.values(nodeErrorMap).sort((a, b) => b.count - a.count).slice(0, 5);

        const courseRecommendations = [];
        for (const wp of weakPoints) {
            const [courses] = await pool.query(
                `SELECT id, name, description, difficulty FROM knowledge_nodes 
                 WHERE id = ? AND is_active = 1`,
                [wp.nodeId]
            );
            if (courses.length > 0) {
                courseRecommendations.push({
                    nodeId: wp.nodeId,
                    nodeName: wp.nodeName,
                    subject: wp.subject,
                    errorCount: wp.count,
                    course: courses[0]
                });
            }
        }

        const practiceQuestions = [];
        for (const wp of weakPoints.slice(0, 3)) {
            const [questions] = await pool.query(
                `SELECT id, content, type, difficulty, options FROM questions 
                 WHERE node_id = ? AND is_active = 1
                 ORDER BY RAND() LIMIT 5`,
                [wp.nodeId]
            );
            practiceQuestions.push({ nodeId: wp.nodeId, nodeName: wp.nodeName, questions });
        }

        const autoErrors = wrongQuestions.map(q => ({
            question_id: q.question_id,
            wrong_answer: q.user_ans,
            correct_answer: q.correct_ans,
            knowledge_node_id: q.node_id,
            subject: q.subject
        }));

        const subjectMap = {};
        wrongQuestions.forEach(q => {
            if (q.subject) subjectMap[q.subject] = (subjectMap[q.subject] || 0) + 1;
        });

        const totalWrong = wrongQuestions.length;
        const totalAnswered = answers.length;
        const accuracy = totalAnswered > 0 ? ((totalAnswered - totalWrong) / totalAnswered * 100) : 100;

        return {
            summary: {
                totalAnswered,
                totalWrong,
                accuracy,
                subjectBreakdown: subjectMap
            },
            weakPoints,
            courseRecommendations,
            practiceRecommendations: practiceQuestions,
            autoErrors,
            aiPrompt: `该学生在最近一次考试中正确率${accuracy.toFixed(1)}%，共有${totalWrong}道错题。主要薄弱知识点：${weakPoints.map(w => w.nodeName).join('、')}。`
        };
    }

    async daily(pool, { userId }) {
        const now = new Date();
        const [knowledge] = await pool.query(
            `SELECT sk.node_id, sk.mastery, kn.name, kn.subject
             FROM student_knowledge sk
             JOIN knowledge_nodes kn ON sk.node_id = kn.id
             WHERE sk.user_id = ? AND sk.mastery < 60 AND kn.is_active = 1
             ORDER BY sk.mastery ASC LIMIT 5`,
            [userId]
        );

        const [errors] = await pool.query(
            `SELECT DISTINCT knowledge_node_id FROM error_book 
             WHERE user_id = ? AND status = 'unsolved' AND knowledge_node_id IS NOT NULL
             LIMIT 3`,
            [userId]
        );

        const recommendedNodes = knowledge.map(k => ({
            nodeId: k.node_id,
            nodeName: k.name,
            subject: k.subject,
            mastery: k.mastery
        }));

        return {
            date: now.toISOString().split('T')[0],
            recommendedNodes,
            errorNodesToReview: errors.map(e => e.knowledge_node_id),
            suggestion: `今日建议重点复习：${recommendedNodes.map(n => n.nodeName).join('、')}`
        };
    }
}

module.exports = RecommendationEngine;
