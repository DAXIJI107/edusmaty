/**
 * 本地演示知识包：不依赖外网爬取，写入一批可检索的计算机知识点正文到 rag_*。
 * 用法：node scripts/seed-demo-knowledge-pack.js
 */
const pool = require("../src/db");
const { ingestWorkspaceDocument } = require("../src/core/WorkspaceIngestor");

const PACK = [
    {
        title: "哈希表核心讲义",
        knowledgePoint: "哈希表",
        subject: "数据结构与算法",
        content: `# 哈希表
哈希表通过哈希函数把键映射到桶（bucket），从而在平均情况下实现近似 O(1) 的查找、插入与删除。
## 定义
哈希函数 h(k) 将键 k 映射到 [0, m) 的整数地址。理想情况下不同键均匀分布。
## 冲突处理
常见方法：链地址法（separate chaining）与开放寻址法（open addressing）。
## 负载因子
负载因子 α = n/m。当 α 过高时需要扩容并 rehash，否则冲突增多导致性能退化。
## 常见误区
- 以为最坏情况也是 O(1)
- 忽略哈希函数质量与扩容策略
- 在开放寻址中删除元素未正确标记 tombstone`
    },
    {
        title: "B+树索引讲义",
        knowledgePoint: "B+树",
        subject: "数据库",
        content: `# B+树
B+树是数据库索引的主流结构，所有记录都在叶子节点，内部节点只存键与子树指针。
## 为什么适合磁盘
扇出大、树高低，能减少随机 I/O。叶子节点通常串成链表，利于范围查询。
## 与 B 树差异
B 树内部节点也可存数据；B+树把数据下沉到叶子，查询路径更稳定。
## 实践要点
选好页大小、填充因子，关注页分裂与合并对写放大的影响。`
    },
    {
        title: "进程与线程讲义",
        knowledgePoint: "进程与线程",
        subject: "操作系统",
        content: `# 进程与线程
进程是资源分配单位，线程是 CPU 调度单位。同进程线程共享地址空间，通信成本低但需同步。
## 上下文切换
保存/恢复寄存器与调度信息。切换过频会降低有效吞吐。
## 同步原语
互斥锁、条件变量、信号量。要避免死锁：破坏互斥、占有且等待、不可抢占、循环等待四条件之一。
## 常见误区
把多线程等同于一定更快；忽略假共享与锁竞争。`
    },
    {
        title: "TCP三次握手讲义",
        knowledgePoint: "TCP三次握手",
        subject: "计算机网络",
        content: `# TCP 三次握手
客户端与服务端通过 SYN、SYN+ACK、ACK 三次交互建立连接，同步双方初始序列号。
## 目的
确认双向可达，协商初始序列号，避免旧重复 SYN 造成混乱。
## 四次挥手
连接释放需要双向半关闭，因此常见四次挥手；若一方合并也可出现三次挥手结束。
## 常见面试点
为什么不是两次？两次无法让双方都确认对方收到了自己的初始序列号。`
    },
    {
        title: "事务ACID讲义",
        knowledgePoint: "事务ACID",
        subject: "数据库",
        content: `# 事务与 ACID
原子性、一致性、隔离性、持久性是事务的基本性质。
## 隔离级别
读未提交、读已提交、可重复读、串行化。级别越高异常越少，并发性能通常越低。
## 常见异常
脏读、不可重复读、幻读。InnoDB 默认 RR，并通过 MVCC 与间隙锁缓解幻读。
## 实践
短事务、合适隔离级别、避免长事务持锁。`
    }
];

async function main() {
    const userId = Number(process.env.SEED_USER_ID || 1);
    const results = [];
    for (const item of PACK) {
        const result = await ingestWorkspaceDocument(pool, {
            userId,
            ...item,
            course: "demo_cs_pack"
        });
        results.push({ title: item.title, docId: result.docId, chunks: result.chunkCount });
        console.log(`入库: ${item.title} -> ${result.chunkCount} chunks`);
    }
    console.log(JSON.stringify({ success: true, count: results.length, results }, null, 2));
    await pool.end();
}

main().catch(async err => {
    console.error("seed-demo-knowledge-pack failed:", err.message);
    try {
        await pool.end();
    } catch (_) {}
    process.exit(1);
});
