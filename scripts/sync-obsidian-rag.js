// scripts/sync-obsidian-rag.js
// 独立脚本：将 Obsidian Vault 同步到 RAG 知识库
const pool = require('../db');
const ObsidianRagSync = require('../src/core/ObsidianRagSync');

async function main() {
    console.log('开始同步 Obsidian Vault → RAG 知识库...\n');
    const syncer = new ObsidianRagSync(pool);
    const stats = await syncer.fullSync();

    console.log(`扫描文件: ${stats.scanned}`);
    console.log(`新增文档: ${stats.synced}`);
    console.log(`更新文档: ${stats.skipped}`);
    console.log(`知识块  : ${stats.chunks}`);
    console.log('\n同步完成');
    await pool.end();
}

main().catch(err => {
    console.error('同步失败:', err.message);
    pool.end();
    process.exit(1);
});
