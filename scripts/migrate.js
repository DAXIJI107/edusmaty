// scripts/migrate.js
// 轻量数据库 Migration 运行器
// 用法: node scripts/migrate.js [up|down|status]
const path = require('path');
const fs = require('fs');
const pool = require('../db');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'ops', 'database', 'migrations');
const MIGRATIONS_TABLE = '_migrations';

async function ensureMigrationsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_migration_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

async function getAppliedMigrations() {
    const [rows] = await pool.query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id`);
    return new Set(rows.map(r => r.name));
}

function getMigrationFiles() {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        console.log('ops/database/migrations/ 目录不存在，无需迁移');
        return [];
    }
    return fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => /^\d{3}_.+\.js$/.test(f))
        .sort();
}

async function runUp() {
    await ensureMigrationsTable();
    const applied = await getAppliedMigrations();
    const files = getMigrationFiles();

    let count = 0;
    for (const file of files) {
        if (applied.has(file)) {
            console.log(`  ✓ ${file} (已应用)`);
            continue;
        }

        console.log(`  → 应用 ${file} ...`);
        const migration = require(path.join(MIGRATIONS_DIR, file));

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            await migration.up(conn);
            await conn.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (?)`, [file]);
            await conn.commit();
            console.log(`  ✓ ${file} 完成`);
            count++;
        } catch (error) {
            await conn.rollback();
            console.error(`  ✗ ${file} 失败: ${error.message}`);
            throw error;
        } finally {
            conn.release();
        }
    }

    console.log(count > 0 ? `\n成功应用 ${count} 个迁移` : '\n没有待应用的迁移');
}

async function runDown() {
    const applied = await getAppliedMigrations();
    const files = getMigrationFiles();
    const lastApplied = files.filter(f => applied.has(f)).pop();

    if (!lastApplied) {
        console.log('没有可回滚的迁移');
        return;
    }

    console.log(`  ← 回滚 ${lastApplied} ...`);
    const migration = require(path.join(MIGRATIONS_DIR, lastApplied));

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await migration.down(conn);
        await conn.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE name = ?`, [lastApplied]);
        await conn.commit();
        console.log(`  ✓ ${lastApplied} 已回滚`);
    } catch (error) {
        await conn.rollback();
        console.error(`  ✗ 回滚失败: ${error.message}`);
        throw error;
    } finally {
        conn.release();
    }
}

async function runStatus() {
    await ensureMigrationsTable();
    const applied = await getAppliedMigrations();
    const files = getMigrationFiles();

    console.log('迁移状态:\n');
    for (const file of files) {
        const status = applied.has(file) ? '✓ 已应用' : '○ 待应用';
        console.log(`  ${status}  ${file}`);
    }
}

async function main() {
    const cmd = process.argv[2] || 'up';

    try {
        switch (cmd) {
            case 'up':
                await runUp();
                break;
            case 'down':
                await runDown();
                break;
            case 'status':
                await runStatus();
                break;
            default:
                console.log('用法: node scripts/migrate.js [up|down|status]');
        }
    } catch (error) {
        console.error('\n迁移失败:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
