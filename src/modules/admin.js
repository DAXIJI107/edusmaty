const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

async function requireAdmin(req, res, next) {
  try {
    const userId = req.user?.id;
    const [[row]] = await pool.query('SELECT role, status FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!row) return res.status(401).json({ success: false, message: '未授权' });
    if (row.status && row.status !== 'active') {
      return res.status(403).json({ success: false, message: '账号已停用' });
    }
    if (row.role !== 'admin') {
      return res.status(403).json({ success: false, message: '需要管理员权限' });
    }
    next();
  } catch (error) {
    console.error('管理员鉴权失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}

async function ensureCrudColumns() {
  // Soft-delete columns for safer CRUD.
  const checks = [
    { table: 'knowledge_nodes', column: 'is_active', ddl: "ALTER TABLE knowledge_nodes ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1" },
    { table: 'exams', column: 'is_active', ddl: "ALTER TABLE exams ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1" },
    { table: 'questions', column: 'is_active', ddl: "ALTER TABLE questions ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1" }
  ];
  for (const item of checks) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${item.table}\` LIKE ?`, [item.column]);
    if (!rows.length) {
      await pool.query(item.ddl);
    }
  }
}

function toInt(value, fallback) {
  const num = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeSubject(subject) {
  const value = String(subject || 'all').trim();
  const allowed = new Set(['all', 'math', 'physics', 'chemistry', 'biology', 'english', 'programming']);
  return allowed.has(value) ? value : 'all';
}

function normalizeDifficulty(difficulty) {
  const value = String(difficulty || 'medium').trim();
  const allowed = new Set(['easy', 'medium', 'hard']);
  return allowed.has(value) ? value : 'medium';
}

function normalizeKnowledgeType(type) {
  const value = String(type || 'theory').trim();
  const allowed = new Set(['theory', 'practice']);
  return allowed.has(value) ? value : 'theory';
}

function normalizeQuestionType(type) {
  const value = String(type || 'single').trim().toLowerCase();
  const allowed = new Set(['single', 'multiple', 'judge', 'essay']);
  return allowed.has(value) ? value : 'single';
}

function safeJson(value, fallback) {
  try {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  } catch {
    return fallback;
  }
}

// ===================== 知识点 CRUD =====================

router.get('/knowledge', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const subject = normalizeSubject(req.query.subject);
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, toInt(req.query.page, 1));
    const pageSize = Math.min(50, Math.max(5, toInt(req.query.pageSize, 10)));

    const params = [];
    let where = 'WHERE is_active = 1';
    if (subject !== 'all') {
      where += ' AND subject = ?';
      params.push(subject);
    }
    if (q) {
      where += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    const [[totalRow]] = await pool.query(`SELECT COUNT(*) AS total FROM knowledge_nodes ${where}`, params);
    const total = Number(totalRow.total || 0);
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT id, name, description, difficulty, type, subject, content_url, bvid, video_platform
       FROM knowledge_nodes
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.json({ success: true, data: rows, page, pageSize, total });
  } catch (error) {
    console.error('管理端查询知识点失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/knowledge', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim();
    const difficulty = normalizeDifficulty(req.body?.difficulty);
    const type = normalizeKnowledgeType(req.body?.type);
    const subject = normalizeSubject(req.body?.subject);
    const contentUrl = String(req.body?.content_url || '').trim() || null;
    const bvid = String(req.body?.bvid || '').trim() || null;
    const videoPlatform = String(req.body?.video_platform || '').trim() || (bvid ? 'bilibili' : null);

    if (!name) return res.status(400).json({ success: false, message: 'name不能为空' });
    if (subject === 'all') return res.status(400).json({ success: false, message: '请选择具体学科' });

    const [result] = await pool.query(
      `INSERT INTO knowledge_nodes
        (name, description, difficulty, type, subject, content_url, bvid, video_platform, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, description, difficulty, type, subject, contentUrl, bvid, videoPlatform]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('管理端新增知识点失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/knowledge/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });

    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim();
    const difficulty = normalizeDifficulty(req.body?.difficulty);
    const type = normalizeKnowledgeType(req.body?.type);
    const subject = normalizeSubject(req.body?.subject);
    const contentUrl = String(req.body?.content_url || '').trim() || null;
    const bvid = String(req.body?.bvid || '').trim() || null;
    const videoPlatform = String(req.body?.video_platform || '').trim() || (bvid ? 'bilibili' : null);

    if (!name) return res.status(400).json({ success: false, message: 'name不能为空' });
    if (subject === 'all') return res.status(400).json({ success: false, message: '请选择具体学科' });

    const [result] = await pool.query(
      `UPDATE knowledge_nodes
       SET name=?, description=?, difficulty=?, type=?, subject=?, content_url=?, bvid=?, video_platform=?
       WHERE id=?`,
      [name, description, difficulty, type, subject, contentUrl, bvid, videoPlatform, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '知识点不存在' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('管理端更新知识点失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/knowledge/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });
    const [result] = await pool.query('UPDATE knowledge_nodes SET is_active = 0 WHERE id=?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '知识点不存在' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('管理端删除知识点失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ===================== 考试 CRUD =====================

router.get('/exams', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const subject = normalizeSubject(req.query.subject);
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, toInt(req.query.page, 1));
    const pageSize = Math.min(50, Math.max(5, toInt(req.query.pageSize, 10)));

    const params = [];
    let where = 'WHERE is_active = 1';
    if (subject !== 'all') {
      where += ' AND subject = ?';
      params.push(subject);
    }
    if (q) {
      where += ' AND name LIKE ?';
      params.push(`%${q}%`);
    }

    const [[totalRow]] = await pool.query(`SELECT COUNT(*) AS total FROM exams ${where}`, params);
    const total = Number(totalRow.total || 0);
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT id, name, difficulty, subject, duration, is_publish
       FROM exams
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.json({ success: true, data: rows, page, pageSize, total });
  } catch (error) {
    console.error('管理端查询考试失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/exams', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const name = String(req.body?.name || '').trim();
    const difficulty = normalizeDifficulty(req.body?.difficulty);
    const subject = normalizeSubject(req.body?.subject);
    const duration = Math.max(10, toInt(req.body?.duration, 60));
    const isPublish = req.body?.is_publish ? 1 : 0;
    if (!name) return res.status(400).json({ success: false, message: 'name不能为空' });
    if (subject === 'all') return res.status(400).json({ success: false, message: '请选择具体学科' });

    const [result] = await pool.query(
      'INSERT INTO exams (name, difficulty, subject, duration, is_publish, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [name, difficulty, subject, duration, isPublish]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('管理端新增考试失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/exams/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });

    const name = String(req.body?.name || '').trim();
    const difficulty = normalizeDifficulty(req.body?.difficulty);
    const subject = normalizeSubject(req.body?.subject);
    const duration = Math.max(10, toInt(req.body?.duration, 60));
    const isPublish = req.body?.is_publish ? 1 : 0;

    if (!name) return res.status(400).json({ success: false, message: 'name不能为空' });
    if (subject === 'all') return res.status(400).json({ success: false, message: '请选择具体学科' });

    const [result] = await pool.query(
      'UPDATE exams SET name=?, difficulty=?, subject=?, duration=?, is_publish=? WHERE id=?',
      [name, difficulty, subject, duration, isPublish, id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '考试不存在' });
    res.json({ success: true });
  } catch (error) {
    console.error('管理端更新考试失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/exams/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });
    const [result] = await pool.query('UPDATE exams SET is_active = 0, is_publish = 0 WHERE id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '考试不存在' });
    res.json({ success: true });
  } catch (error) {
    console.error('管理端删除考试失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ===================== 题库 CRUD =====================

router.get('/questions', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const subject = normalizeSubject(req.query.subject);
    const difficulty = req.query.difficulty ? normalizeDifficulty(req.query.difficulty) : 'all';
    const type = req.query.type ? normalizeQuestionType(req.query.type) : 'all';
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, toInt(req.query.page, 1));
    const pageSize = Math.min(50, Math.max(5, toInt(req.query.pageSize, 10)));

    const params = [];
    let where = 'WHERE is_active = 1';
    if (subject !== 'all') {
      where += ' AND subject = ?';
      params.push(subject);
    }
    if (difficulty !== 'all') {
      where += ' AND difficulty = ?';
      params.push(difficulty);
    }
    if (type !== 'all') {
      where += ' AND type = ?';
      params.push(type);
    }
    if (q) {
      where += ' AND content LIKE ?';
      params.push(`%${q}%`);
    }

    const [[totalRow]] = await pool.query(`SELECT COUNT(*) AS total FROM questions ${where}`, params);
    const total = Number(totalRow.total || 0);
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT id, exam_id, type, content, options, answer, difficulty, score, node_id, subject
       FROM questions
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const data = rows.map(item => {
      const opts = safeJson(item.options, []);
      const ans = item.type === 'multiple' ? safeJson(item.answer, item.answer) : item.answer;
      return { ...item, options: Array.isArray(opts) ? opts : [], answer: ans };
    });
    res.json({ success: true, data, page, pageSize, total });
  } catch (error) {
    console.error('管理端查询题库失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/questions', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const examId = req.body?.exam_id ? toInt(req.body.exam_id, null) : null;
    const nodeId = req.body?.node_id ? toInt(req.body.node_id, null) : null;
    const type = normalizeQuestionType(req.body?.type);
    const content = String(req.body?.content || '').trim();
    const difficulty = normalizeDifficulty(req.body?.difficulty);
    const subject = normalizeSubject(req.body?.subject);
    const score = Math.max(1, toInt(req.body?.score, 5));

    let options = req.body?.options ?? [];
    if (typeof options === 'string') options = safeJson(options, []);
    if (!Array.isArray(options)) options = [];

    let answer = req.body?.answer ?? '';
    if (type === 'multiple') {
      if (typeof answer === 'string') {
        const parsed = safeJson(answer, null);
        answer = parsed ?? answer.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (!Array.isArray(answer)) answer = [];
      answer = JSON.stringify(answer);
    } else {
      answer = String(answer ?? '').trim();
    }

    if (!content) return res.status(400).json({ success: false, message: 'content不能为空' });
    if (subject === 'all') return res.status(400).json({ success: false, message: '请选择具体学科' });
    if (type !== 'essay' && (type === 'single' || type === 'multiple' || type === 'judge') && options.length === 0) {
      return res.status(400).json({ success: false, message: '选择题/判断题必须提供options' });
    }

    const [result] = await pool.query(
      `INSERT INTO questions
        (exam_id, type, content, options, answer, score, difficulty, subject, node_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [examId, type, content, JSON.stringify(options), answer, score, difficulty, subject, nodeId]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('管理端新增题目失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/questions/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });

    const examId = req.body?.exam_id ? toInt(req.body.exam_id, null) : null;
    const nodeId = req.body?.node_id ? toInt(req.body.node_id, null) : null;
    const type = normalizeQuestionType(req.body?.type);
    const content = String(req.body?.content || '').trim();
    const difficulty = normalizeDifficulty(req.body?.difficulty);
    const subject = normalizeSubject(req.body?.subject);
    const score = Math.max(1, toInt(req.body?.score, 5));

    let options = req.body?.options ?? [];
    if (typeof options === 'string') options = safeJson(options, []);
    if (!Array.isArray(options)) options = [];

    let answer = req.body?.answer ?? '';
    if (type === 'multiple') {
      if (typeof answer === 'string') {
        const parsed = safeJson(answer, null);
        answer = parsed ?? answer.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (!Array.isArray(answer)) answer = [];
      answer = JSON.stringify(answer);
    } else {
      answer = String(answer ?? '').trim();
    }

    if (!content) return res.status(400).json({ success: false, message: 'content不能为空' });
    if (subject === 'all') return res.status(400).json({ success: false, message: '请选择具体学科' });
    if (type !== 'essay' && (type === 'single' || type === 'multiple' || type === 'judge') && options.length === 0) {
      return res.status(400).json({ success: false, message: '选择题/判断题必须提供options' });
    }

    const [result] = await pool.query(
      `UPDATE questions
       SET exam_id=?, type=?, content=?, options=?, answer=?, score=?, difficulty=?, subject=?, node_id=?
       WHERE id=?`,
      [examId, type, content, JSON.stringify(options), answer, score, difficulty, subject, nodeId, id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '题目不存在' });
    res.json({ success: true });
  } catch (error) {
    console.error('管理端更新题目失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/questions/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await ensureCrudColumns();
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });
    const [result] = await pool.query('UPDATE questions SET is_active = 0 WHERE id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '题目不存在' });
    res.json({ success: true });
  } catch (error) {
    console.error('管理端删除题目失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ===================== RAG 来源/文档 CRUD =====================

router.get('/rag/sources', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT source_id, source_name, base_url, license_type, approved, created_at
       FROM rag_sources
       ORDER BY source_id DESC
       LIMIT 200`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('管理端查询RAG来源失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/rag/sources', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const sourceName = String(req.body?.source_name || '').trim();
    const baseUrl = String(req.body?.base_url || '').trim();
    const licenseType = String(req.body?.license_type || '').trim() || 'unknown';
    const approved = req.body?.approved ? 'Y' : 'N';
    if (!sourceName) return res.status(400).json({ success: false, message: 'source_name不能为空' });
    if (!baseUrl) return res.status(400).json({ success: false, message: 'base_url不能为空' });
    const [result] = await pool.query(
      'INSERT INTO rag_sources (source_name, base_url, license_type, approved) VALUES (?, ?, ?, ?)',
      [sourceName, baseUrl, licenseType, approved]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('管理端新增RAG来源失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/rag/sources/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });
    const sourceName = String(req.body?.source_name || '').trim();
    const baseUrl = String(req.body?.base_url || '').trim();
    const licenseType = String(req.body?.license_type || '').trim() || 'unknown';
    const approved = req.body?.approved ? 'Y' : 'N';
    if (!sourceName) return res.status(400).json({ success: false, message: 'source_name不能为空' });
    if (!baseUrl) return res.status(400).json({ success: false, message: 'base_url不能为空' });
    const [result] = await pool.query(
      'UPDATE rag_sources SET source_name=?, base_url=?, license_type=?, approved=? WHERE source_id=?',
      [sourceName, baseUrl, licenseType, approved, id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '来源不存在' });
    res.json({ success: true });
  } catch (error) {
    console.error('管理端更新RAG来源失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/rag/sources/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });
    // 保留记录，仅标记为未审核，避免影响历史文档引用
    const [result] = await pool.query('UPDATE rag_sources SET approved = \"N\" WHERE source_id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '来源不存在' });
    res.json({ success: true });
  } catch (error) {
    console.error('管理端下线RAG来源失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/rag/documents', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const subject = normalizeSubject(req.query.subject);
    const q = String(req.query.q || '').trim();
    const params = [];
    let where = '';
    if (subject !== 'all') {
      where = 'WHERE d.subject = ?';
      params.push(subject);
    }
    if (q) {
      where += where ? ' AND' : ' WHERE';
      where += ' (d.title LIKE ? OR d.knowledge_point LIKE ? OR d.chapter LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const [rows] = await pool.query(
      `SELECT d.doc_id, d.source_id, s.source_name, d.title, d.url, d.subject, d.course, d.chapter, d.knowledge_point, d.created_at
       FROM rag_documents d
       LEFT JOIN rag_sources s ON s.source_id = d.source_id
       ${where}
       ORDER BY d.doc_id DESC
       LIMIT 200`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('管理端查询RAG文档失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/rag/documents', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const sourceId = toInt(req.body?.source_id, 0);
    const title = String(req.body?.title || '').trim();
    const url = String(req.body?.url || '').trim();
    const subject = normalizeSubject(req.body?.subject);
    const course = String(req.body?.course || '').trim() || null;
    const chapter = String(req.body?.chapter || '').trim() || null;
    const knowledgePoint = String(req.body?.knowledge_point || '').trim() || null;
    if (!sourceId) return res.status(400).json({ success: false, message: 'source_id不能为空' });
    if (!title) return res.status(400).json({ success: false, message: 'title不能为空' });
    if (!url) return res.status(400).json({ success: false, message: 'url不能为空' });
    if (subject === 'all') return res.status(400).json({ success: false, message: '请选择具体学科' });

    const [result] = await pool.query(
      `INSERT INTO rag_documents
        (source_id, title, url, subject, course, chapter, knowledge_point)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sourceId, title, url, subject, course, chapter, knowledgePoint]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('管理端新增RAG文档失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/rag/documents/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });
    const sourceId = toInt(req.body?.source_id, 0);
    const title = String(req.body?.title || '').trim();
    const url = String(req.body?.url || '').trim();
    const subject = normalizeSubject(req.body?.subject);
    const course = String(req.body?.course || '').trim() || null;
    const chapter = String(req.body?.chapter || '').trim() || null;
    const knowledgePoint = String(req.body?.knowledge_point || '').trim() || null;
    if (!sourceId) return res.status(400).json({ success: false, message: 'source_id不能为空' });
    if (!title) return res.status(400).json({ success: false, message: 'title不能为空' });
    if (!url) return res.status(400).json({ success: false, message: 'url不能为空' });
    if (subject === 'all') return res.status(400).json({ success: false, message: '请选择具体学科' });

    const [result] = await pool.query(
      `UPDATE rag_documents
       SET source_id=?, title=?, url=?, subject=?, course=?, chapter=?, knowledge_point=?
       WHERE doc_id=?`,
      [sourceId, title, url, subject, course, chapter, knowledgePoint, id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '文档不存在' });
    res.json({ success: true });
  } catch (error) {
    console.error('管理端更新RAG文档失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.delete('/rag/documents/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const id = toInt(req.params.id, 0);
    if (!id) return res.status(400).json({ success: false, message: '无效ID' });
    // 删除文档不删除切片，改为下线切片以保护历史查询
    await pool.query('UPDATE rag_chunks SET is_active = 0 WHERE doc_id=?', [id]);
    const [result] = await pool.query('DELETE FROM rag_documents WHERE doc_id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: '文档不存在' });
    res.json({ success: true });
  } catch (error) {
    console.error('管理端删除RAG文档失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;

