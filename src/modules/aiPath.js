const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware');
const pool = require('../db');
const AIPathGenerator = require('../core/AIPathGenerator');
const { ensurePathData } = require('../core/DemoDataSeeder');

async function ensureLearningListTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS learning_list (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      knowledge_node_id INT NOT NULL,
      card JSON NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_learning_list_user_node (user_id, knowledge_node_id),
      INDEX idx_learning_list_user_status (user_id, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function loadQuestionSet(subject, nodeId) {
  const params = [];
  let whereClause = 'WHERE (q.is_active = 1 OR q.is_active IS NULL)';
  if (nodeId) {
    whereClause += ' AND q.knowledge_id = ?';
    params.push(nodeId);
  }
  if (subject && subject !== 'all') {
    whereClause += ' AND kp.subject = ?';
    params.push(subject);
  }

  let [rows] = await pool.query(
    `SELECT q.id,
            q.question AS content,
            CASE
              WHEN JSON_LENGTH(q.options_json) = 2 THEN 'judge'
              WHEN JSON_LENGTH(q.options_json) > 0 THEN 'single'
              ELSE 'essay'
            END AS type,
            q.options_json AS options,
            q.difficulty,
            5 AS score,
            q.knowledge_id AS node_id
     FROM questions q
     LEFT JOIN knowledge_points kp ON kp.id = q.knowledge_id
     ${whereClause}
     ORDER BY RAND()
     LIMIT 5`,
    params
  );

  if (rows.length < 5) {
    const [fallback] = await pool.query(
      `SELECT q.id,
              q.question AS content,
              CASE
                WHEN JSON_LENGTH(q.options_json) = 2 THEN 'judge'
                WHEN JSON_LENGTH(q.options_json) > 0 THEN 'single'
                ELSE 'essay'
              END AS type,
              q.options_json AS options,
              q.difficulty,
              5 AS score,
              q.knowledge_id AS node_id
       FROM questions q
       LEFT JOIN knowledge_points kp ON kp.id = q.knowledge_id
       WHERE (q.is_active = 1 OR q.is_active IS NULL)
       ${subject && subject !== 'all' ? 'AND kp.subject = ?' : ''}
       ORDER BY RAND()
       LIMIT ?`,
      subject && subject !== 'all' ? [subject, 5 - rows.length] : [5 - rows.length]
    );
    rows = rows.concat(fallback);
  }

  if (rows.length < 5) {
    const [anyRows] = await pool.query(
      `SELECT q.id,
              q.question AS content,
              CASE
                WHEN JSON_LENGTH(q.options_json) = 2 THEN 'judge'
                WHEN JSON_LENGTH(q.options_json) > 0 THEN 'single'
                ELSE 'essay'
              END AS type,
              q.options_json AS options,
              q.difficulty,
              5 AS score,
              q.knowledge_id AS node_id
       FROM questions q
       WHERE (q.is_active = 1 OR q.is_active IS NULL)
       ORDER BY RAND()
       LIMIT ?`,
      [5 - rows.length]
    );
    rows = rows.concat(anyRows);
  }

  return rows.slice(0, 5).map(row => ({
    id: row.id,
    content: row.content,
    type: row.type,
    difficulty: row.difficulty || 'medium',
    score: row.score || 5
  }));
}

async function loadLectureDoc(step) {
  try {
    const [rows] = await pool.query(
      `SELECT doc_id, title, url, course, chapter, knowledge_point
       FROM rag_documents
       WHERE (subject = ? OR ? = 'all')
         AND (knowledge_point LIKE ? OR title LIKE ? OR course LIKE ?)
       ORDER BY created_at DESC
       LIMIT 1`,
      [step.subject, step.subject, `%${step.name}%`, `%${step.name}%`, `%${step.name}%`]
    );
    if (rows.length) {
      return {
        id: rows[0].doc_id,
        title: rows[0].title,
        url: rows[0].url || '',
        course: rows[0].course || '',
        chapter: rows[0].chapter || '',
        knowledgePoint: rows[0].knowledge_point || step.name
      };
    }
  } catch (error) {
    console.warn('加载RAG讲稿失败:', error.message);
  }

  return {
    id: null,
    title: `${step.name}讲稿与知识梳理`,
    url: '',
    course: step.subject,
    chapter: '今日学习',
    knowledgePoint: step.name
  };
}

async function buildTodayCard(step) {
  const [lecture, questions] = await Promise.all([
    loadLectureDoc(step),
    loadQuestionSet(step.subject, step.id)
  ]);

  return {
    id: `card_${step.id}_${new Date().toISOString().slice(0, 10)}`,
    date: new Date().toISOString().slice(0, 10),
    knowledge: {
      id: step.id,
      name: step.name,
      subject: step.subject,
      mastery: step.mastery,
      masteryBand: step.masteryBand,
      reason: step.reason,
      isRemedial: step.isRemedial
    },
    lecture,
    video: {
      title: `${step.name} 10分钟精讲`,
      duration: 10,
      platform: step.bvid ? 'bilibili' : 'local',
      bvid: step.bvid,
      url: step.bvid ? `https://www.bilibili.com/video/${step.bvid}` : ''
    },
    exercises: questions,
    lab: {
      title: `${step.name}微实验`,
      description: `用一个最小案例验证「${step.name}」的核心概念，并记录现象、结论和一个易错点。`,
      duration: step.difficulty === 'hard' ? 35 : 20
    },
    actions: {
      addToList: true,
      startUrl: `/course-detail.html?knowledgeId=${step.id}`
    }
  };
}

// POST /api/ai/learning-path
router.post('/learning-path', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const subject = req.body?.subject || req.query?.subject || null;
    await ensurePathData(pool, userId);
    const generator = new AIPathGenerator();
    const result = await generator.generate(userId, pool, subject);
    const steps = result.steps || [];
    const total = steps.length;
    const mastered = steps.filter(s => s.mastery >= 80).length;
    res.json({
      success: true,
      data: {
        steps,
        links: result.links || [],
        subjects: result.subjects || [],
        profileContext: result.profileContext || {},
        strategy: result.strategy || {},
        stats: {
          total,
          mastered,
          toLearn: total - mastered,
          estimateTime: Math.round(steps.reduce((s, i) => s + i.estimate, 0) / 60)
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// GET /api/ai/today-card?subject=math
router.get('/today-card', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const subject = req.query?.subject || 'all';
    await ensurePathData(pool, userId);
    const generator = new AIPathGenerator();
    const result = await generator.generate(userId, pool, subject);
    const candidate = (result.steps || []).find(step => step.mastery < 80) || result.steps?.[0];
    if (!candidate) {
      return res.json({ success: true, data: null, message: '暂无可推送学习卡片' });
    }
    const card = await buildTodayCard(candidate);
    res.json({ success: true, data: card });
  } catch (err) {
    console.error('生成今日学习卡片失败:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// POST /api/ai/learning-list
router.post('/learning-list', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const card = req.body?.card || null;
    const knowledgeId = Number(req.body?.knowledgeId || card?.knowledge?.id);
    if (!knowledgeId) {
      return res.status(400).json({ success: false, message: 'knowledgeId不能为空' });
    }

    await ensureLearningListTable();
    await pool.query(
      `INSERT INTO learning_list (user_id, knowledge_node_id, card, status)
       VALUES (?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE card = VALUES(card), status = 'pending', created_at = CURRENT_TIMESTAMP`,
      [userId, knowledgeId, JSON.stringify(card || {})]
    );

    res.json({ success: true, message: '已加入学习列表' });
  } catch (err) {
    console.error('加入学习列表失败:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// GET /api/ai/learning-list
router.get('/learning-list', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureLearningListTable();
    const [rows] = await pool.query(
      `SELECT ll.id, ll.knowledge_node_id, ll.card, ll.status, ll.created_at,
              kn.name AS node_name, kn.subject, kn.difficulty
       FROM learning_list ll
       LEFT JOIN knowledge_nodes kn ON ll.knowledge_node_id = kn.id
       WHERE ll.user_id = ?
       ORDER BY ll.created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('获取学习列表失败:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// DELETE /api/ai/learning-list/:id
router.delete('/learning-list/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query(
      `DELETE FROM learning_list WHERE id = ? AND user_id = ?`,
      [req.params.id, userId]
    );
    res.json({ success: true, message: '已移除' });
  } catch (err) {
    console.error('移除学习列表失败:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// PUT /api/ai/learning-list/:id/done
router.put('/learning-list/:id/done', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query(
      `UPDATE learning_list SET status = 'done' WHERE id = ? AND user_id = ?`,
      [req.params.id, userId]
    );
    res.json({ success: true, message: '已标记完成' });
  } catch (err) {
    console.error('标记完成失败:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
