const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware');
const pool = require('../db');

async function ensurePreferenceTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id INT NOT NULL PRIMARY KEY,
      preferences JSON NULL,
      notifications JSON NULL,
      delete_reason TEXT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function resolveDeactivateStatusValue() {
  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM users LIKE 'status'");
    const type = String(rows?.[0]?.Type || '').toLowerCase();
    // ENUM('active','inactive') / ENUM('active','disabled') / 其他字符串列
    const enumMatch = type.match(/^enum\((.*)\)$/);
    if (!enumMatch) return 'inactive';
    const values = enumMatch[1]
      .split(',')
      .map(item => item.trim().replace(/^'/, '').replace(/'$/, ''));
    if (values.includes('inactive')) return 'inactive';
    if (values.includes('disabled')) return 'disabled';
    if (values.includes('inactive_user')) return 'inactive_user';
    // 兜底：优先选第一个非 active 值，避免数据截断
    const fallback = values.find(v => v !== 'active');
    return fallback || 'inactive';
  } catch (error) {
    console.error('解析用户状态枚举失败，使用默认值 inactive:', error.message);
    return 'inactive';
  }
}

// 更新用户资料
router.put('/profile', authenticateJWT, async (req, res) => {
  const { name, nickname, email, phone, gender, birthday, bio, interests } = req.body;
  try {
    await pool.query(
      `UPDATE users SET name=?, nickname=?, email=?, phone=?, gender=?, birthday=?, bio=?, interests=? WHERE id=?`,
      [name, nickname, email, phone, gender, birthday, bio, JSON.stringify(interests), req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 修改密码
router.put('/password', authenticateJWT, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '请提供当前密码和新密码' });
  }
  try {
    // 验证当前密码
    const [rows] = await pool.query('SELECT password FROM users WHERE id=?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '用户未找到' });
    }
    const user = rows[0];
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '当前密码错误' });
    }
    // 更新密码
    const hashed = bcrypt.hashSync(newPassword, 10);
    await pool.query('UPDATE users SET password=? WHERE id=?', [hashed, req.user.id]);
    res.json({ success: true, message: '密码修改成功' });
  } catch (e) {
    console.error('修改密码错误:', e);
    res.status(500).json({ success: false, message: '修改失败' });
  }
});

// 上传头像
router.post('/avatar', authenticateJWT, async (req, res) => {
  const { avatar } = req.body;
  try {
    await pool.query('UPDATE users SET avatar=? WHERE id=?', [avatar, req.user.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

router.get('/preferences', authenticateJWT, async (req, res) => {
  try {
    await ensurePreferenceTable();
    const [rows] = await pool.query('SELECT preferences, notifications FROM user_preferences WHERE user_id=?', [req.user.id]);
    res.json({
      success: true,
      preferences: rows[0]?.preferences || {},
      notifications: rows[0]?.notifications || {}
    });
  } catch (e) {
    console.error('读取偏好失败:', e);
    res.status(500).json({ success: false, message: '读取失败' });
  }
});

router.put('/preferences', authenticateJWT, async (req, res) => {
  try {
    await ensurePreferenceTable();
    const { preferences = {}, notifications = {} } = req.body;
    await pool.query(
      `INSERT INTO user_preferences (user_id, preferences, notifications)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE preferences=VALUES(preferences), notifications=VALUES(notifications)`,
      [req.user.id, JSON.stringify(preferences), JSON.stringify(notifications)]
    );
    res.json({ success: true, message: '设置已保存' });
  } catch (e) {
    console.error('保存偏好失败:', e);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

router.delete('/account', authenticateJWT, async (req, res) => {
  try {
    await ensurePreferenceTable();
    const { reason = '' } = req.body || {};
    const inactiveValue = await resolveDeactivateStatusValue();
    await pool.query(
      `INSERT INTO user_preferences (user_id, delete_reason)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE delete_reason=VALUES(delete_reason)`,
      [req.user.id, reason]
    );
    await pool.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      [inactiveValue, req.user.id]
    );
    res.clearCookie('token');
    res.json({ success: true, message: '账户已注销' });
  } catch (e) {
    console.error('注销账户失败:', e);
    res.status(500).json({ success: false, message: '注销失败' });
  }
});

module.exports = router;
