/**
 * =============================================================================
 * 数据库管理 API 模块
 * =============================================================================
 *
 * @file       src/modules/database.js
 * @description
 *   提供数据库在线查询、表结构浏览、数据变更审批等功能。
 *   所有登录用户可访问；数据查询仅支持 SELECT；
 *   数据变更（INSERT/UPDATE/DELETE）以工单形式提交，必须填写备注，
 *   仅管理员审批通过后才由系统执行。
 *
 *   接口清单：
 *   - GET  /api/database/databases        获取库列表（主库）
 *   - GET  /api/database/tables           获取所有表名
 *   - GET  /api/database/schema/:table    获取指定表的结构
 *   - POST /api/database/query            执行 SQL 查询（仅 SELECT/WITH/PRAGMA/EXPLAIN）
 *   - GET  /api/database/preview/:table   预览表数据（前 100 行）
 *   - POST /api/database/change-orders    提交数据变更工单（需备注）
 *   - GET  /api/database/change-orders    工单列表（admin 见全部，其他人见自己提交的）
 *   - POST /api/database/change-orders/:id/approve  管理员批准并执行
 *   - POST /api/database/change-orders/:id/reject   管理员驳回
 *
 * =============================================================================
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

/** 本地时间字符串（YYYY-MM-DD HH:MM:SS） */
function nowStr() {
    return new Date().toLocaleString('sv-SE').replace('T', ' ');
}

/**
 * 按 username 解析当前用户（避免 demo 模式 token id 与真实用户 id 撞车导致权限误判）
 * @returns {object} { id, username, role, status, isDemo }
 */
async function resolveDbUser(req) {
    const username = req.user?.username;
    const [[row]] = await pool.query('SELECT id, username, role, status FROM users WHERE username = ? LIMIT 1', [username]);
    if (row) return { ...row, isDemo: false };
    // users 表中不存在（演示账号）：以 token 信息为准，角色仅信任 token
    return { id: req.user.id, username, role: req.user.role || 'student', status: 'active', isDemo: true };
}

/**
 * 登录用户校验中间件（数据库管理页面向所有登录用户开放）
 */
async function requireLogin(req, res, next) {
    try {
        if (!req.user?.id || !req.user?.username) {
            return res.status(401).json({ success: false, message: '未登录' });
        }
        const dbUser = await resolveDbUser(req);
        if (dbUser.status && dbUser.status !== 'active') {
            return res.status(403).json({ success: false, message: '账号已停用' });
        }
        req.dbUser = dbUser;
        next();
    } catch (error) {
        console.error('[Database] 鉴权失败:', error.message);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
}

/**
 * 管理员权限校验中间件（审批类接口专用）
 */
async function requireAdmin(req, res, next) {
    try {
        const dbUser = await resolveDbUser(req);
        if (dbUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: '需要管理员权限：仅管理员可审批变更工单' });
        }
        req.dbUser = dbUser;
        next();
    } catch (error) {
        console.error('[Database] 管理员鉴权失败:', error.message);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
}

// 所有接口均需登录；审批接口额外校验管理员
router.use(authenticateJWT, requireLogin);

/** 变更工单表（模块加载时确保存在；测试阶段重建以同步最新结构） */
let ordersTableReady = false;
async function ensureOrdersTable() {
    if (ordersTableReady) return;
    await pool.query('DROP TABLE IF EXISTS db_change_orders');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS db_change_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            submitter_username VARCHAR(64) NOT NULL,
            database_name VARCHAR(64) NOT NULL,
            table_name VARCHAR(128) NOT NULL,
            sql_text TEXT NOT NULL,
            remark TEXT NOT NULL,
            status VARCHAR(24) NOT NULL DEFAULT 'pending',
            reviewer_username VARCHAR(64),
            review_remark TEXT,
            created_at TEXT,
            reviewed_at TEXT,
            executed_at TEXT,
            exec_error TEXT
        )
    `);
    ordersTableReady = true;
}
ensureOrdersTable().catch(err => console.error('[Database] 工单表初始化失败:', err.message));

/**
 * 获取库列表（当前为单一主库）
 * GET /api/database/databases
 */
router.get('/databases', async (req, res) => {
    res.json({ success: true, data: [{ name: 'edu_smart', label: 'EduSmart 主库' }] });
});

/**
 * 获取所有表名
 * GET /api/database/tables
 */
router.get('/tables', async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        );
        const tables = rows.map(r => ({
            name: r.name,
            ddl: r.sql ? r.sql.substring(0, 500) : ''
        }));
        res.json({ success: true, data: tables });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

/**
 * 获取指定表的结构（列信息）
 * GET /api/database/schema/:table
 */
router.get('/schema/:table', async (req, res) => {
    try {
        const table = req.params.table;
        // PRAGMA table_info 返回列结构
        const [columns] = await pool.query(`PRAGMA table_info("${table}")`);
        // 获取行数
        const [countRes] = await pool.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
        const rowCount = countRes[0]?.cnt || 0;

        res.json({
            success: true,
            data: {
                table,
                columns: columns.map(c => ({
                    cid: c.cid,
                    name: c.name,
                    type: c.type,
                    notnull: c.notnull,
                    dflt_value: c.dflt_value,
                    pk: c.pk
                })),
                rowCount
            }
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

/**
 * 执行 SQL 查询
 * POST /api/database/query
 * @body { sql: string, database?: string, table?: string }
 *
 * 安全策略：
 * - 仅允许 SELECT / WITH / PRAGMA / EXPLAIN 查询语句
 * - 写操作请通过「数据变更」页提交工单，由管理员审批后执行
 */
router.post('/query', async (req, res) => {
    try {
        const { sql } = req.body;
        if (!sql || !sql.trim()) {
            return res.json({ success: false, message: 'SQL 语句不能为空' });
        }

        const trimmed = sql.trim().toUpperCase();
        const allowed = ['SELECT', 'WITH', 'PRAGMA', 'EXPLAIN'];
        const isAllowed = allowed.some(kw => trimmed.startsWith(kw));

        if (!isAllowed) {
            return res.json({
                success: false,
                message: '数据查询仅允许 SELECT / WITH / PRAGMA / EXPLAIN。数据修改请切换到「数据变更」页提交工单，由管理员审批后执行。'
            });
        }

        // 执行查询，限制最多返回 1000 行
        const [rows, fields] = await pool.query(sql);
        const limited = rows.slice(0, 1000);

        res.json({
            success: true,
            data: {
                rows: limited,
                fields: fields || [],
                totalRows: rows.length,
                truncated: rows.length > 1000
            }
        });
    } catch (err) {
        res.json({ success: false, message: err.message, sql: err.sql });
    }
});

/**
 * 预览表数据
 * GET /api/database/preview/:table?page=1&pageSize=50
 */
router.get('/preview/:table', async (req, res) => {
    try {
        const table = req.params.table;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(200, Math.max(1, parseInt(req.query.pageSize) || 50));
        const offset = (page - 1) * pageSize;

        const [countRes] = await pool.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
        const total = countRes[0]?.cnt || 0;

        const [rows] = await pool.query(`SELECT * FROM "${table}" LIMIT ? OFFSET ?`, [pageSize, offset]);
        const [columns] = await pool.query(`PRAGMA table_info("${table}")`);

        res.json({
            success: true,
            data: {
                table,
                rows,
                columns: columns.map(c => c.name),
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

/**
 * 校验数据变更 SQL（工单提交与审批执行前共用）
 * @returns {string|null} 错误信息，null 表示通过
 */
function validateDmlSql(sql, tableName) {
    const t = sql.trim().replace(/;\s*$/, '');
    if (!t) return 'SQL 语句不能为空';
    if (/;\s*\S/.test(t)) return '一次只能提交一条 SQL 语句';

    const kw = t.toUpperCase();
    if (!(kw.startsWith('INSERT') || kw.startsWith('UPDATE') || kw.startsWith('DELETE'))) {
        return '数据变更仅支持 INSERT / UPDATE / DELETE 语句';
    }

    const banned = /\b(DROP|ALTER|CREATE|TRUNCATE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX|GRANT|REPLACE\s+INTO)\b/i;
    if (banned.test(t)) return '变更语句中禁止包含 DDL / 危险关键字';

    // 提取目标表名并与页面所选表比对
    const m = t.match(/(?:INSERT\s+OR\s+\w+\s+INTO|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+["'`]?([A-Za-z_][A-Za-z0-9_]*)["'`]?/i);
    if (!m) return '无法从语句中识别目标表';
    if (tableName && m[1].toLowerCase() !== String(tableName).toLowerCase()) {
        return `SQL 目标表（${m[1]}）与所选表（${tableName}）不一致`;
    }
    return null;
}

/**
 * 提交数据变更工单
 * POST /api/database/change-orders
 * @body { databaseName: string, tableName: string, sqlText: string, remark: string }
 */
router.post('/change-orders', async (req, res) => {
    try {
        await ensureOrdersTable();
        const { databaseName, tableName, sqlText, remark } = req.body || {};

        if (!databaseName || !tableName) {
            return res.json({ success: false, message: '必须先选择数据库和数据表' });
        }
        if (!sqlText || !sqlText.trim()) {
            return res.json({ success: false, message: 'SQL 语句不能为空' });
        }
        if (!remark || !String(remark).trim()) {
            return res.json({ success: false, message: '变更备注为必填项，请说明修改原因与影响范围' });
        }

        const err = validateDmlSql(sqlText, tableName);
        if (err) return res.json({ success: false, message: err });

        // 所选表必须真实存在
        const [exists] = await pool.query('SELECT name FROM sqlite_master WHERE type=? AND name=?', ['table', tableName]);
        if (!exists.length) return res.json({ success: false, message: `所选表「${tableName}」不存在` });

        await pool.query(
            `INSERT INTO db_change_orders (user_id, submitter_username, database_name, table_name, sql_text, remark, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [req.dbUser.id, req.dbUser.username, databaseName, tableName, sqlText.trim(), String(remark).trim(), nowStr()]
        );

        res.json({ success: true, message: '工单已提交，等待管理员审批后执行' });
    } catch (err) {
        console.error('[Database] 提交工单失败:', err.message);
        res.json({ success: false, message: err.message });
    }
});

/**
 * 工单列表：管理员可见全部，其他用户仅见自己提交的
 * GET /api/database/change-orders
 */
router.get('/change-orders', async (req, res) => {
    try {
        await ensureOrdersTable();
        const isAdmin = req.dbUser.role === 'admin';
        const where = isAdmin ? '' : 'WHERE o.submitter_username = ?';
        const params = isAdmin ? [] : [req.dbUser.username];

        const [rows] = await pool.query(
            `SELECT o.id, o.submitter_username, o.database_name, o.table_name, o.sql_text, o.remark,
                    o.status, o.review_remark, o.created_at, o.reviewed_at, o.executed_at, o.exec_error,
                    u.nickname AS submitter_name, u.role AS submitter_role,
                    r.nickname AS reviewer_name
             FROM db_change_orders o
             LEFT JOIN users u ON u.username = o.submitter_username
             LEFT JOIN users r ON r.username = o.reviewer_username
             ${where}
             ORDER BY o.id DESC
             LIMIT 100`,
            params
        );

        res.json({ success: true, data: rows, isAdmin });
    } catch (err) {
        console.error('[Database] 工单列表失败:', err.message);
        res.json({ success: false, message: err.message });
    }
});

/**
 * 管理员批准并执行工单
 * POST /api/database/change-orders/:id/approve
 */
router.post('/change-orders/:id/approve', requireAdmin, async (req, res) => {
    try {
        await ensureOrdersTable();
        const id = Number(req.params.id);
        const [[order]] = await pool.query('SELECT * FROM db_change_orders WHERE id = ? LIMIT 1', [id]);
        if (!order) return res.status(404).json({ success: false, message: '工单不存在' });
        if (order.status !== 'pending') {
            return res.json({ success: false, message: `该工单当前状态为「${order.status}」，仅待审批工单可执行` });
        }

        const err = validateDmlSql(order.sql_text, order.table_name);
        if (err) {
            await pool.query(
                `UPDATE db_change_orders SET status='failed', reviewer_username=?, review_remark=?, reviewed_at=? WHERE id=?`,
                [req.dbUser.username, `系统校验未通过：${err}`, nowStr(), id]
            );
            return res.json({ success: false, message: err });
        }

        try {
            await pool.query(order.sql_text);
        } catch (execErr) {
            await pool.query(
                `UPDATE db_change_orders SET status='failed', reviewer_username=?, review_remark=?, reviewed_at=?, exec_error=? WHERE id=?`,
                [req.dbUser.username, `执行失败：${execErr.message}`, nowStr(), execErr.message, id]
            );
            return res.json({ success: false, message: `执行失败：${execErr.message}` });
        }

        await pool.query(
            `UPDATE db_change_orders SET status='executed', reviewer_username=?, reviewed_at=?, executed_at=? WHERE id=?`,
            [req.dbUser.username, nowStr(), nowStr(), id]
        );

        res.json({ success: true, message: '工单已批准并执行成功' });
    } catch (err) {
        console.error('[Database] 审批工单失败:', err.message);
        res.json({ success: false, message: err.message });
    }
});

/**
 * 管理员驳回工单
 * POST /api/database/change-orders/:id/reject
 * @body { reviewRemark?: string }
 */
router.post('/change-orders/:id/reject', requireAdmin, async (req, res) => {
    try {
        await ensureOrdersTable();
        const id = Number(req.params.id);
        const [[order]] = await pool.query('SELECT * FROM db_change_orders WHERE id = ? LIMIT 1', [id]);
        if (!order) return res.status(404).json({ success: false, message: '工单不存在' });
        if (order.status !== 'pending') {
            return res.json({ success: false, message: `该工单当前状态为「${order.status}」，仅待审批工单可驳回` });
        }

        const reviewRemark = (req.body && req.body.reviewRemark) ? String(req.body.reviewRemark).trim() : '';
        await pool.query(
            `UPDATE db_change_orders SET status='rejected', reviewer_username=?, review_remark=?, reviewed_at=? WHERE id=?`,
            [req.dbUser.username, reviewRemark || '管理员驳回', nowStr(), id]
        );

        res.json({ success: true, message: '工单已驳回' });
    } catch (err) {
        console.error('[Database] 驳回工单失败:', err.message);
        res.json({ success: false, message: err.message });
    }
});

module.exports = router;
