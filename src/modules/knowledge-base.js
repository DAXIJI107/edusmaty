const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

router.use(authenticateJWT);

function likeTerm(value) {
    return `%${String(value || '').trim()}%`;
}

function cleanTitle(value, fallback = '知识资料') {
    const text = String(value || '').replace(/[-\r\n]+/g, ' ').trim();
    return text && text !== '---' ? text.slice(0, 120) : fallback;
}

router.get('/overview', async (req, res, next) => {
    try {
        const query = String(req.query.q || '').trim();
        const subject = String(req.query.subject || 'all').trim();
        const hasQuery = query.length > 0;
        const subjectFilter = subject && subject !== 'all';

        const [[kpCount]] = await pool.query('SELECT COUNT(*) AS total FROM knowledge_points');
        const [[docCount]] = await pool.query('SELECT COUNT(*) AS total FROM rag_documents');
        const [[chunkCount]] = await pool.query('SELECT COUNT(*) AS total FROM rag_chunks WHERE is_active = 1');
        const [[questionCount]] = await pool.query('SELECT COUNT(*) AS total FROM questions WHERE is_active = 1 OR is_active IS NULL');

        const [subjects] = await pool.query(
            `SELECT subject,
                    COUNT(*) AS knowledgeCount,
                    ROUND(AVG(mastery)) AS mastery,
                    SUM(mastery < 60) AS weakCount
             FROM knowledge_points
             WHERE subject IS NOT NULL AND subject <> ''
             GROUP BY subject
             ORDER BY knowledgeCount DESC, weakCount DESC`
        );

        const pointParams = [];
        const pointWhere = [];
        if (subjectFilter) {
            pointWhere.push('kp.subject = ?');
            pointParams.push(subject);
        }
        if (hasQuery) {
            pointWhere.push('(kp.title LIKE ? OR kp.summary LIKE ? OR kp.subject LIKE ?)');
            pointParams.push(likeTerm(query), likeTerm(query), likeTerm(query));
        }
        const [points] = await pool.query(
            `SELECT kp.id, kp.title, kp.subject, kp.mastery, kp.summary, kp.source_name, kp.source_url,
                    COUNT(DISTINCT q.id) AS questionCount,
                    COUNT(DISTINCT c.id) AS courseCount
             FROM knowledge_points kp
             LEFT JOIN questions q ON q.knowledge_id = kp.id AND (q.is_active = 1 OR q.is_active IS NULL)
             LEFT JOIN courses c ON c.subject = kp.subject
             ${pointWhere.length ? `WHERE ${pointWhere.join(' AND ')}` : ''}
             GROUP BY kp.id, kp.title, kp.subject, kp.mastery, kp.summary, kp.source_name, kp.source_url
             ORDER BY kp.mastery ASC, questionCount DESC, kp.id
             LIMIT 24`,
            pointParams
        );

        const docParams = [];
        const docWhere = [];
        if (subjectFilter) {
            docWhere.push('d.subject = ?');
            docParams.push(subject);
        }
        if (hasQuery) {
            docWhere.push('(d.title LIKE ? OR d.course LIKE ? OR d.knowledge_point LIKE ?)');
            docParams.push(likeTerm(query), likeTerm(query), likeTerm(query));
        }
        const [documents] = await pool.query(
            `SELECT d.doc_id, d.title, d.subject, d.course, d.chapter, d.knowledge_point, d.url,
                    (SELECT COUNT(*) FROM rag_chunks c WHERE c.doc_id = d.doc_id AND c.is_active = 1) AS chunks
             FROM rag_documents d
             ${docWhere.length ? `WHERE ${docWhere.join(' AND ')}` : ''}
             ORDER BY d.created_at DESC, d.doc_id DESC
             LIMIT 18`,
            docParams
        );

        const chunkParams = [];
        const chunkWhere = ['c.is_active = 1'];
        if (subjectFilter) {
            chunkWhere.push('c.subject = ?');
            chunkParams.push(subject);
        }
        if (hasQuery) {
            chunkWhere.push('(c.chunk_text LIKE ? OR c.course LIKE ? OR c.knowledge_point LIKE ?)');
            chunkParams.push(likeTerm(query), likeTerm(query), likeTerm(query));
        }
        const [chunks] = await pool.query(
            `SELECT c.chunk_id, c.subject, c.course, c.knowledge_point, c.chunk_text, c.quality_score
             FROM rag_chunks c
             WHERE ${chunkWhere.join(' AND ')}
             ORDER BY c.quality_score DESC, c.chunk_id
             LIMIT 12`,
            chunkParams
        );

        const courseParams = [];
        const courseWhere = [];
        if (subjectFilter) {
            courseWhere.push('subject = ?');
            courseParams.push(subject);
        }
        if (hasQuery) {
            courseWhere.push('(title LIKE ? OR provider LIKE ? OR subject LIKE ?)');
            courseParams.push(likeTerm(query), likeTerm(query), likeTerm(query));
        }
        const [courses] = await pool.query(
            `SELECT id, title, provider, subject, difficulty, progress, source_url
             FROM courses
             ${courseWhere.length ? `WHERE ${courseWhere.join(' AND ')}` : ''}
             ORDER BY progress ASC, id
             LIMIT 12`,
            courseParams
        );

        const questionParams = [];
        const questionWhere = ['(q.is_active = 1 OR q.is_active IS NULL)'];
        if (subjectFilter) {
            questionWhere.push('kp.subject = ?');
            questionParams.push(subject);
        }
        if (hasQuery) {
            questionWhere.push('(q.question LIKE ? OR kp.title LIKE ? OR kp.subject LIKE ?)');
            questionParams.push(likeTerm(query), likeTerm(query), likeTerm(query));
        }
        const [questions] = await pool.query(
            `SELECT q.id, q.question, q.difficulty, q.correct_answer,
                    kp.id AS knowledgeId, kp.title AS knowledgeTitle, kp.subject
             FROM questions q
             LEFT JOIN knowledge_points kp ON kp.id = q.knowledge_id
             WHERE ${questionWhere.join(' AND ')}
             ORDER BY q.id
             LIMIT 12`,
            questionParams
        );

        res.json({
            success: true,
            data: {
                query,
                selectedSubject: subject || 'all',
                stats: {
                    knowledgePoints: Number(kpCount.total || 0),
                    documents: Number(docCount.total || 0),
                    chunks: Number(chunkCount.total || 0),
                    questions: Number(questionCount.total || 0)
                },
                subjects: subjects.map(item => ({
                    subject: item.subject,
                    knowledgeCount: Number(item.knowledgeCount || 0),
                    mastery: Number(item.mastery || 0),
                    weakCount: Number(item.weakCount || 0)
                })),
                points: points.map(item => ({
                    id: item.id,
                    title: item.title,
                    subject: item.subject,
                    mastery: Number(item.mastery || 0),
                    summary: String(item.summary || '').slice(0, 260),
                    sourceName: item.source_name || 'EduSmart 中文知识库',
                    sourceUrl: item.source_url || '',
                    questionCount: Number(item.questionCount || 0),
                    courseCount: Number(item.courseCount || 0)
                })),
                documents: documents.map(item => ({
                    id: item.doc_id,
                    title: cleanTitle(item.title, item.knowledge_point || item.course || '知识资料'),
                    subject: item.subject || '通用',
                    course: cleanTitle(item.course, item.subject || '课程资料'),
                    chapter: cleanTitle(item.chapter, '章节'),
                    knowledgePoint: cleanTitle(item.knowledge_point, item.course || '知识点'),
                    url: item.url || '',
                    chunks: Number(item.chunks || 0)
                })),
                chunks: chunks.map(item => ({
                    id: item.chunk_id,
                    subject: item.subject || '通用',
                    course: cleanTitle(item.course, item.subject || '课程'),
                    knowledgePoint: cleanTitle(item.knowledge_point, '知识片段'),
                    text: String(item.chunk_text || '').slice(0, 320),
                    qualityScore: Number(item.quality_score || 0)
                })),
                courses,
                questions: questions.map(item => ({
                    id: item.id,
                    question: item.question,
                    difficulty: item.difficulty || 'medium',
                    correctAnswer: item.correct_answer,
                    knowledgeId: item.knowledgeId,
                    knowledgeTitle: item.knowledgeTitle || '未关联知识点',
                    subject: item.subject || '综合'
                }))
            }
        });
    } catch (error) {
        next(error);
    }
});

router.use((error, req, res, next) => {
    console.error('knowledge-base api error:', error);
    res.status(500).json({ success: false, message: '知识库接口异常', detail: error.message });
});

module.exports = router;
