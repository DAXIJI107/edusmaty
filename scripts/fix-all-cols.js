const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '123456', database: 'edu_smart' });

  // questions 表
  const qCols = {
    correct_answer: 'TEXT',
    skill_codes: 'VARCHAR(500)',
    source_url: 'VARCHAR(500)',
  };
  for (const [c, def] of Object.entries(qCols)) {
    try { await pool.query(`ALTER TABLE questions ADD COLUMN \`${c}\` ${def}`); console.log('added questions.' + c); }
    catch (e) { console.log('skip questions.' + c + ': ' + e.code); }
  }
  try {
    const [r] = await pool.query('UPDATE questions SET correct_answer = answer WHERE correct_answer IS NULL AND answer IS NOT NULL');
    console.log('synced correct_answer, affected:', r.affectedRows);
  } catch (e) { console.log('sync correct_answer err:', e.message); }

  // user_answers 表
  const uaCols = {
    is_correct: 'TINYINT(1) DEFAULT 0',
    answered_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    user_id: 'INT NOT NULL',
  };
  for (const [c, def] of Object.entries(uaCols)) {
    try { await pool.query(`ALTER TABLE user_answers ADD COLUMN \`${c}\` ${def}`); console.log('added user_answers.' + c); }
    catch (e) { console.log('skip user_answers.' + c + ': ' + e.code); }
  }

  // users 表
  const userCols = {
    phone: 'VARCHAR(30)',
    gender: 'VARCHAR(10)',
    birthday: 'DATE',
    bio: 'TEXT',
    interests: 'TEXT',
    avatar: 'VARCHAR(500)',
    completed_courses: 'INT DEFAULT 0',
  };
  for (const [c, def] of Object.entries(userCols)) {
    try { await pool.query(`ALTER TABLE users ADD COLUMN \`${c}\` ${def}`); console.log('added users.' + c); }
    catch (e) { console.log('skip users.' + c + ': ' + e.code); }
  }

  // courses 表
  const courseCols = {
    provider: 'VARCHAR(100)',
    subject: 'VARCHAR(80)',
    difficulty: 'VARCHAR(20) DEFAULT "medium"',
    progress: 'INT DEFAULT 0',
    source_url: 'VARCHAR(500)',
  };
  for (const [c, def] of Object.entries(courseCols)) {
    try { await pool.query(`ALTER TABLE courses ADD COLUMN \`${c}\` ${def}`); console.log('added courses.' + c); }
    catch (e) { console.log('skip courses.' + c + ': ' + e.code); }
  }

  // knowledge_points 表
  const kpCols = {
    mastery: 'INT DEFAULT 0',
    summary: 'TEXT',
    source_name: 'VARCHAR(200)',
    source_url: 'VARCHAR(500)',
  };
  for (const [c, def] of Object.entries(kpCols)) {
    try { await pool.query(`ALTER TABLE knowledge_points ADD COLUMN \`${c}\` ${def}`); console.log('added knowledge_points.' + c); }
    catch (e) { console.log('skip knowledge_points.' + c + ': ' + e.code); }
  }

  // admin 用户
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('123456', 10);
  await pool.query(
    'INSERT INTO users (username, email, password, role, status, nickname) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE password=VALUES(password), role=VALUES(role), status=VALUES(status), nickname=VALUES(nickname)',
    ['admin', 'admin@edusmart.com', hash, 'admin', 'active', '管理员']
  );
  console.log('admin user ensured');

  process.exit(0);
})();