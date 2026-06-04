/**
 * seed-cs-data.js
 * Seeds the EduSmart database with Computer Science educational data:
 *  - knowledge_nodes (30+ CS knowledge nodes)
 *  - questions       (15+ CS quiz questions)
 *  - ai_courses      (5 AI Agent mini-courses)
 *  - notes           (5 sample CS notes)
 */

const mysql = require("mysql2/promise");
const config = require("../config");

const pool = mysql.createPool(config.database);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function tableExists(tableName) {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.tables
         WHERE table_schema = ? AND table_name = ?`,
        [config.database.database, tableName]
    );
    return rows[0].cnt > 0;
}

async function tableIsEmpty(tableName) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`${tableName}\``);
    return rows[0].cnt === 0;
}

// ---------------------------------------------------------------------------
// 1. knowledge_nodes
// ---------------------------------------------------------------------------

const knowledgeNodes = [
    // Data Structures
    {
        name: "数组",
        description:
            "数组是一种线性数据结构，将相同类型的元素存储在连续的内存空间中，支持通过索引进行O(1)时间复杂度的随机访问。",
        difficulty: "easy",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "链表",
        description:
            "链表由一系列节点组成，每个节点包含数据和指向下一个节点的指针。链表支持高效的插入和删除操作，但不支持随机访问。",
        difficulty: "easy",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "栈",
        description:
            "栈是一种遵循后进先出（LIFO）原则的线性数据结构，只允许在栈顶进行插入（入栈）和删除（出栈）操作，常用于函数调用、表达式求值等场景。",
        difficulty: "easy",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "队列",
        description:
            "队列是一种遵循先进先出（FIFO）原则的线性数据结构，元素从队尾入队、从队头出队，广泛应用于任务调度、消息队列等场景。",
        difficulty: "easy",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "二叉树",
        description:
            "二叉树是每个节点最多有两个子节点（左子节点和右子节点）的树形数据结构，是二叉搜索树、堆、平衡树等高级数据结构的基础。",
        difficulty: "medium",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "二叉搜索树",
        description:
            "二叉搜索树是一种特殊的二叉树，满足左子树所有节点值小于根节点、右子树所有节点值大于根节点的性质，平均查找、插入、删除时间复杂度为O(log n)。",
        difficulty: "medium",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "堆",
        description:
            "堆是一种特殊的完全二叉树，分为最大堆（父节点值大于等于子节点）和最小堆（父节点值小于等于子节点），常用于实现优先队列和堆排序。",
        difficulty: "medium",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "哈希表",
        description:
            "哈希表通过哈希函数将键映射到存储位置，实现平均O(1)时间复杂度的查找、插入和删除操作，是大多数编程语言中字典/映射类型的底层实现。",
        difficulty: "medium",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "图",
        description:
            "图由顶点和边组成，用于表示对象之间的复杂关系。图可以是有向或无向的、带权或不带权的，广泛应用于社交网络、路径规划、网络拓扑等领域。",
        difficulty: "hard",
        type: "data_structure",
        subject: "数据结构"
    },
    {
        name: "字典树",
        description:
            "字典树（Trie）是一种用于高效存储和检索字符串的树形结构，每个节点代表一个字符，从根到某个节点的路径构成一个前缀或完整字符串，常用于自动补全和拼写检查。",
        difficulty: "medium",
        type: "data_structure",
        subject: "数据结构"
    },

    // Algorithms
    {
        name: "冒泡排序",
        description:
            '冒泡排序通过反复遍历数组，比较相邻元素并交换顺序错误的元素对，每次遍历将最大（或最小）元素"冒泡"到数组末尾，时间复杂度为O(n²)。',
        difficulty: "easy",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "快速排序",
        description:
            "快速排序采用分治策略，选择一个基准元素将数组分为两部分（小于基准和大于基准），递归地对两部分排序，平均时间复杂度为O(n log n)，是实际应用中最常用的排序算法之一。",
        difficulty: "medium",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "归并排序",
        description:
            "归并排序也是分治算法，将数组递归地分成两半，分别排序后再合并两个有序子数组，时间复杂度稳定为O(n log n)，需要额外的O(n)空间。",
        difficulty: "medium",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "二分查找",
        description:
            "二分查找在有序数组中通过不断将搜索范围缩小一半来查找目标值，时间复杂度为O(log n)，是一种经典的高效搜索算法。",
        difficulty: "easy",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "广度优先搜索",
        description:
            "广度优先搜索（BFS）从起始节点开始，逐层遍历图中所有可达节点，使用队列辅助实现，常用于最短路径查找、层级遍历等场景。",
        difficulty: "medium",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "深度优先搜索",
        description:
            "深度优先搜索（DFS）沿着一条路径尽可能深入地探索图，当无法继续时回溯到上一个分支点，使用栈或递归实现，常用于拓扑排序、连通分量检测等。",
        difficulty: "medium",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "动态规划",
        description:
            "动态规划通过将复杂问题分解为重叠子问题，并存储子问题的解来避免重复计算，核心要素包括最优子结构和状态转移方程，是解决最优化问题的强大方法。",
        difficulty: "hard",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "贪心算法",
        description:
            "贪心算法在每一步选择中都采取当前最优的选择，希望通过局部最优达到全局最优。贪心策略不一定总是能得到全局最优解，需要满足贪心选择性质。",
        difficulty: "medium",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "双指针",
        description:
            "双指针技术使用两个指针在数组或链表上以不同速度或方向移动，高效解决两数之和、链表环检测、有序数组合并等问题，时间复杂度通常为O(n)。",
        difficulty: "easy",
        type: "algorithm",
        subject: "算法"
    },
    {
        name: "滑动窗口",
        description:
            "滑动窗口技术在数组或字符串上维护一个可变大小的窗口，通过移动窗口的左右边界来高效解决子数组/子串问题，如最长无重复子串、最小覆盖子串等。",
        difficulty: "medium",
        type: "algorithm",
        subject: "算法"
    },

    // Database
    {
        name: "SQL基础",
        description:
            "SQL（结构化查询语言）是关系数据库的标准查询语言，包括数据定义（DDL）、数据操作（DML）、数据查询（DQL）和数据控制（DCL）四大类语句。",
        difficulty: "easy",
        type: "database",
        subject: "数据库"
    },
    {
        name: "连接操作",
        description:
            "JOIN操作用于根据相关列将两个或多个表中的行组合在一起，包括INNER JOIN、LEFT JOIN、RIGHT JOIN和FULL OUTER JOIN等类型，是关系数据库的核心操作。",
        difficulty: "medium",
        type: "database",
        subject: "数据库"
    },
    {
        name: "索引",
        description:
            "数据库索引是一种加速数据检索的数据结构（通常使用B+树），类似于书籍的目录。合理使用索引可以大幅提升查询性能，但不恰当的索引会增加写入开销。",
        difficulty: "medium",
        type: "database",
        subject: "数据库"
    },
    {
        name: "数据库范式",
        description:
            "数据库范式是关系数据库设计中减少数据冗余和避免更新异常的一系列规范，主要包括第一范式（1NF）到第三范式（3NF）以及BCNF等，是数据库设计的重要理论基础。",
        difficulty: "medium",
        type: "database",
        subject: "数据库"
    },
    {
        name: "事务",
        description:
            "事务是一组被视为单一工作单元的操作，要么全部执行成功（提交），要么全部撤销（回滚），确保数据库在并发操作和系统故障情况下保持一致性。",
        difficulty: "medium",
        type: "database",
        subject: "数据库"
    },
    {
        name: "ACID",
        description:
            "ACID是事务的四个基本特性：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）和持久性（Durability），是关系数据库保证数据可靠性的核心机制。",
        difficulty: "medium",
        type: "database",
        subject: "数据库"
    },

    // Networks
    {
        name: "OSI七层模型",
        description:
            "OSI（开放系统互连）模型将网络通信分为七层：物理层、数据链路层、网络层、传输层、会话层、表示层和应用层，是理解网络协议栈的理论框架。",
        difficulty: "medium",
        type: "network",
        subject: "计算机网络"
    },
    {
        name: "TCP/IP协议",
        description:
            "TCP/IP是互联网的核心协议族，TCP提供可靠、面向连接的传输服务，IP负责数据包的路由和寻址，两者共同构成了互联网通信的基础。",
        difficulty: "medium",
        type: "network",
        subject: "计算机网络"
    },
    {
        name: "HTTP/HTTPS",
        description:
            "HTTP（超文本传输协议）是Web应用的基础协议，采用请求-响应模型。HTTPS在HTTP基础上增加TLS/SSL加密层，确保数据传输的安全性和完整性。",
        difficulty: "easy",
        type: "network",
        subject: "计算机网络"
    },
    {
        name: "DNS",
        description:
            'DNS（域名系统）将人类可读的域名（如www.example.com）转换为机器可读的IP地址，是互联网的"电话簿"，采用分层分布式架构实现高效的域名解析。',
        difficulty: "medium",
        type: "network",
        subject: "计算机网络"
    },
    {
        name: "REST API",
        description:
            "REST（表述性状态转移）是一种基于HTTP协议的API设计风格，使用GET、POST、PUT、DELETE等方法操作资源，以JSON或XML格式传输数据，具有无状态、统一接口等特点。",
        difficulty: "easy",
        type: "network",
        subject: "计算机网络"
    },

    // Operating Systems
    {
        name: "进程",
        description:
            "进程是正在执行的程序的实例，拥有独立的地址空间、文件描述符等资源。操作系统通过进程调度和上下文切换实现多任务并发执行。",
        difficulty: "medium",
        type: "os",
        subject: "操作系统"
    },
    {
        name: "线程",
        description:
            "线程是进程内的执行单元，同一进程的多个线程共享地址空间和资源，线程的创建和切换开销比进程更小，是多核编程和并发处理的基本单位。",
        difficulty: "medium",
        type: "os",
        subject: "操作系统"
    },
    {
        name: "死锁",
        description:
            "死锁是指两个或多个进程（线程）互相等待对方释放资源而陷入无限等待的状态。死锁的四个必要条件是互斥、持有并等待、不可抢占和循环等待。",
        difficulty: "hard",
        type: "os",
        subject: "操作系统"
    },
    {
        name: "内存管理",
        description:
            "内存管理负责分配和回收内存资源，包括虚拟内存、分页、分段等核心技术。虚拟内存使程序可以使用超过物理内存大小的地址空间，提高系统利用率。",
        difficulty: "hard",
        type: "os",
        subject: "操作系统"
    },
    {
        name: "文件系统",
        description:
            "文件系统负责组织和管理磁盘上的数据，提供文件的创建、读写、删除等操作接口。常见文件系统包括NTFS、ext4、APFS等，涉及inode、目录结构、权限管理等概念。",
        difficulty: "medium",
        type: "os",
        subject: "操作系统"
    }
];

async function seedKnowledgeNodes() {
    const tn = "knowledge_nodes";
    const exists = await tableExists(tn);
    if (!exists) {
        await pool.query(`
            CREATE TABLE \`${tn}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(160) NOT NULL,
                description TEXT,
                difficulty VARCHAR(40),
                type VARCHAR(80),
                subject VARCHAR(80),
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log(`[knowledge_nodes] Table created.`);
    }

    const isEmpty = await tableIsEmpty(tn);
    if (!isEmpty) {
        console.log(`[knowledge_nodes] Table already has data, skipping insert.`);
        const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`${tn}\``);
        return rows[0].cnt;
    }

    const sql = `INSERT INTO \`${tn}\` (name, description, difficulty, type, subject, is_active) VALUES ?`;
    const values = knowledgeNodes.map(n => [n.name, n.description, n.difficulty, n.type, n.subject, 1]);
    const [result] = await pool.query(sql, [values]);
    console.log(`[knowledge_nodes] Inserted ${result.affectedRows} rows.`);
    return result.affectedRows;
}

// ---------------------------------------------------------------------------
// 2. questions
// ---------------------------------------------------------------------------

const questionData = [
    {
        content: "在时间复杂度分析中，二分查找的时间复杂度是多少？",
        options: ["A. O(1)", "B. O(n)", "C. O(log n)", "D. O(n²)"],
        answer: "C. O(log n)",
        difficulty: "easy",
        subject: "算法",
        type: "single",
        knowledge_name: "二分查找"
    },
    {
        content: "以下哪种数据结构遵循后进先出（LIFO）原则？",
        options: ["A. 队列", "B. 栈", "C. 链表", "D. 二叉树"],
        answer: "B. 栈",
        difficulty: "easy",
        subject: "数据结构",
        type: "single",
        knowledge_name: "栈"
    },
    {
        content: "TCP协议属于OSI模型的哪一层？",
        options: ["A. 应用层", "B. 网络层", "C. 传输层", "D. 数据链路层"],
        answer: "C. 传输层",
        difficulty: "easy",
        subject: "计算机网络",
        type: "single",
        knowledge_name: "OSI七层模型"
    },
    {
        content: "快速排序的平均时间复杂度是多少？",
        options: ["A. O(n)", "B. O(n log n)", "C. O(n²)", "D. O(log n)"],
        answer: "B. O(n log n)",
        difficulty: "medium",
        subject: "算法",
        type: "single",
        knowledge_name: "快速排序"
    },
    {
        content: "以下哪些是ACID事务的特性？（多选）",
        options: [
            "A. 原子性（Atomicity）",
            "B. 一致性（Consistency）",
            "C. 隔离性（Isolation）",
            "D. 持久性（Durability）"
        ],
        answer: "A. 原子性（Atomicity）,B. 一致性（Consistency）,C. 隔离性（Isolation）,D. 持久性（Durability）",
        difficulty: "medium",
        subject: "数据库",
        type: "multiple",
        knowledge_name: "ACID"
    },
    {
        content: "在数据库中，以下哪种索引结构最常用于关系型数据库的索引实现？",
        options: ["A. 哈希索引", "B. B+树索引", "C. 倒排索引", "D. 位图索引"],
        answer: "B. B+树索引",
        difficulty: "medium",
        subject: "数据库",
        type: "single",
        knowledge_name: "索引"
    },
    {
        content: "广度优先搜索（BFS）通常使用哪种数据结构辅助实现？",
        options: ["A. 栈", "B. 队列", "C. 堆", "D. 哈希表"],
        answer: "B. 队列",
        difficulty: "easy",
        subject: "算法",
        type: "single",
        knowledge_name: "广度优先搜索"
    },
    {
        content: '以下哪个HTTP状态码表示"请求成功"？',
        options: ["A. 200", "B. 301", "C. 404", "D. 500"],
        answer: "A. 200",
        difficulty: "easy",
        subject: "计算机网络",
        type: "single",
        knowledge_name: "HTTP/HTTPS"
    },
    {
        content: "动态规划算法的两个核心要素是什么？",
        options: ["A. 递归和分治", "B. 贪心选择和局部最优", "C. 最优子结构和重叠子问题", "D. 回溯和剪枝"],
        answer: "C. 最优子结构和重叠子问题",
        difficulty: "hard",
        subject: "算法",
        type: "single",
        knowledge_name: "动态规划"
    },
    {
        content: "在关系数据库中，JOIN操作用于什么目的？",
        options: ["A. 删除重复数据", "B. 将多个表中的行根据关联列组合在一起", "C. 创建新的数据库", "D. 修改表结构"],
        answer: "B. 将多个表中的行根据关联列组合在一起",
        difficulty: "easy",
        subject: "数据库",
        type: "single",
        knowledge_name: "连接操作"
    },
    {
        content: "以下关于进程和线程的描述，哪些是正确的？（多选）",
        options: [
            "A. 进程拥有独立的地址空间",
            "B. 同一进程的线程共享地址空间",
            "C. 线程切换的开销通常小于进程切换",
            "D. 一个进程只能包含一个线程"
        ],
        answer: "A. 进程拥有独立的地址空间,B. 同一进程的线程共享地址空间,C. 线程切换的开销通常小于进程切换",
        difficulty: "medium",
        subject: "操作系统",
        type: "multiple",
        knowledge_name: "进程,线程"
    },
    {
        content: "死锁产生的四个必要条件不包括以下哪一项？",
        options: ["A. 互斥条件", "B. 持有并等待", "C. 不可抢占", "D. 优先级反转"],
        answer: "D. 优先级反转",
        difficulty: "hard",
        subject: "操作系统",
        type: "single",
        knowledge_name: "死锁"
    },
    {
        content: "DNS的主要功能是什么？",
        options: ["A. 加密网络通信", "B. 将域名解析为IP地址", "C. 分配动态IP地址", "D. 过滤网络流量"],
        answer: "B. 将域名解析为IP地址",
        difficulty: "easy",
        subject: "计算机网络",
        type: "single",
        knowledge_name: "DNS"
    },
    {
        content: "哈希表的平均查找时间复杂度是多少？",
        options: ["A. O(1)", "B. O(log n)", "C. O(n)", "D. O(n log n)"],
        answer: "A. O(1)",
        difficulty: "easy",
        subject: "数据结构",
        type: "single",
        knowledge_name: "哈希表"
    },
    {
        content: "以下哪些数据结构属于线性结构？（多选）",
        options: ["A. 数组", "B. 链表", "C. 栈", "D. 二叉树"],
        answer: "A. 数组,B. 链表,C. 栈",
        difficulty: "easy",
        subject: "数据结构",
        type: "multiple",
        knowledge_name: "数组,链表,栈"
    },
    {
        content: "归并排序的空间复杂度是多少？",
        options: ["A. O(1)", "B. O(log n)", "C. O(n)", "D. O(n log n)"],
        answer: "C. O(n)",
        difficulty: "medium",
        subject: "算法",
        type: "single",
        knowledge_name: "归并排序"
    },
    {
        content: "在REST API设计中，用于创建新资源的HTTP方法是？",
        options: ["A. GET", "B. POST", "C. PUT", "D. DELETE"],
        answer: "B. POST",
        difficulty: "easy",
        subject: "计算机网络",
        type: "single",
        knowledge_name: "REST API"
    },
    {
        content: "数据库事务的隔离级别中，哪个级别可以防止脏读、不可重复读和幻读？",
        options: [
            "A. 读未提交（Read Uncommitted）",
            "B. 读已提交（Read Committed）",
            "C. 可重复读（Repeatable Read）",
            "D. 可串行化（Serializable）"
        ],
        answer: "D. 可串行化（Serializable）",
        difficulty: "hard",
        subject: "数据库",
        type: "single",
        knowledge_name: "事务"
    }
];

async function seedQuestions() {
    const tn = "questions";
    const exists = await tableExists(tn);
    let useLegacySchema = false;

    if (!exists) {
        // Create with the user's desired schema
        await pool.query(`
            CREATE TABLE \`${tn}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                content TEXT NOT NULL,
                type VARCHAR(40) DEFAULT 'single',
                options JSON,
                answer VARCHAR(500) NOT NULL,
                difficulty VARCHAR(40),
                score INT DEFAULT 5,
                subject VARCHAR(80),
                knowledge_name VARCHAR(160),
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log(`[questions] Table created.`);
    } else {
        // Check if this is the legacy rebuild-database schema (has knowledge_id FK)
        const [cols] = await pool.query(
            `SELECT COLUMN_NAME FROM information_schema.columns
             WHERE table_schema = ? AND table_name = ?`,
            [config.database.database, tn]
        );
        const colNames = cols.map(c => c.COLUMN_NAME);
        useLegacySchema = colNames.includes("knowledge_id");
        console.log(`[questions] Table exists (${useLegacySchema ? "legacy" : "custom"} schema).`);
    }

    const isEmpty = await tableIsEmpty(tn);
    if (!isEmpty) {
        console.log(`[questions] Table already has data, skipping insert.`);
        const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`${tn}\``);
        return rows[0].cnt;
    }

    if (useLegacySchema) {
        // Insert into legacy schema: map content→question, options→options_json, answer→correct_answer
        // knowledge_id must be provided; try to match knowledge_points, fall back to first row
        const [kpRows] = await pool.query("SELECT id, title FROM knowledge_points ORDER BY id");
        const kpMap = new Map(kpRows.map(r => [r.title, r.id]));
        const fallbackId = kpRows.length > 0 ? kpRows[0].id : null;

        let inserted = 0;
        for (const q of questionData) {
            const matchTitle = q.knowledge_name.split(",")[0].trim();
            const kid = kpMap.get(matchTitle) || fallbackId;
            if (kid === null) continue; // No knowledge_points at all

            await pool.query(
                `INSERT INTO \`${tn}\` (knowledge_id, question, correct_answer, options_json, difficulty)
                 VALUES (?, ?, ?, ?, ?)`,
                [kid, q.content, q.answer, JSON.stringify(q.options), q.difficulty]
            );
            inserted++;
        }
        console.log(`[questions] Inserted ${inserted} rows (legacy schema).`);
        return inserted;
    } else {
        // Insert into custom schema
        const sql = `INSERT INTO \`${tn}\` (content, type, options, answer, difficulty, score, subject, knowledge_name, is_active) VALUES ?`;
        const values = questionData.map(q => [
            q.content,
            q.type,
            JSON.stringify(q.options),
            q.answer,
            q.difficulty,
            5,
            q.subject,
            q.knowledge_name,
            1
        ]);
        const [result] = await pool.query(sql, [values]);
        console.log(`[questions] Inserted ${result.affectedRows} rows.`);
        return result.affectedRows;
    }
}

// ---------------------------------------------------------------------------
// 3. ai_courses
// ---------------------------------------------------------------------------

const aiCourses = [
    {
        title: "什么是AI Agent",
        order_num: 1,
        sandbox_data: JSON.stringify({
            demo: {
                type: "conversation",
                title: "AI Agent 对话演示",
                messages: [
                    { role: "user", content: "帮我查一下今天深圳的天气，然后安排一个户外活动建议。" },
                    {
                        role: "agent",
                        content:
                            "好的！我来帮你完成这个任务。\n\n第一步：查询深圳天气...\n查询结果：今天深圳多云转晴，气温22-28°C，微风，适合户外活动。\n\n第二步：基于天气信息，我建议你可以：\n1. 去深圳湾公园散步或骑行\n2. 爬莲花山，俯瞰城市风景\n3. 去大鹏半岛海边游玩\n\n需要我帮你规划具体路线吗？"
                    }
                ]
            }
        }),
        quiz_data: JSON.stringify({
            questions: [
                {
                    question: "AI Agent 的核心特征是什么？",
                    options: ["被动响应", "自主感知与决策", "仅执行固定脚本", "不需要环境信息"],
                    answer: 1
                },
                {
                    question: "以下哪项不是 AI Agent 的组成部分？",
                    options: ["感知模块", "决策模块", "执行模块", "财务报表模块"],
                    answer: 3
                }
            ]
        }),
        content: `# 什么是 AI Agent？

## 概念简介

AI Agent（人工智能代理）是一种能够自主感知环境、做出决策并采取行动以实现特定目标的智能系统。简单来说，它就像一个"数字助手"，能够理解你的需求，自主地规划和执行任务。

**一个形象的类比**：如果把普通程序比作一台"自动售货机"——你按什么按钮它就做什么，那么AI Agent就像一位"私人管家"——你告诉它想要什么，它会自己想办法去完成。

## AI Agent 的核心组成

一个典型的 AI Agent 包含以下关键模块：

- **感知模块（Perception）**：收集和处理来自环境的信息，包括用户的输入、API返回的数据、传感器信息等。
- **记忆模块（Memory）**：存储短期和长期信息，帮助Agent在连续的交互中保持上下文。
- **规划模块（Planning）**：将复杂任务分解为可执行的步骤序列。
- **执行模块（Action）**：调用工具、API或执行代码来完成具体操作。

## 工作流程

\`\`\`
用户输入 → 理解意图 → 制定计划 → 调用工具 → 整合结果 → 输出回复
\`\`\`

Agent 不是简单地一问一答，而是会经历"思考-行动-观察"的循环过程。当遇到不确定的情况时，它会进行反思和调整。

## 实际应用场景

- **智能客服**：理解用户问题，查询知识库，必要时转接人工
- **代码助手**：理解编程需求，自动编写、调试和优化代码
- **自动化办公**：处理邮件、安排日程、生成报告
- **数据分析**：理解分析需求，自动查询数据库并生成可视化报告

## 关键要点

1. AI Agent 是"主动型"的智能系统，而非被动响应的工具
2. 核心在于"感知-思考-行动"循环
3. 大语言模型（LLM）为Agent提供了强大的理解和推理能力
4. Agent的能力边界取决于它能调用哪些工具和获取哪些信息`
    },
    {
        title: "ReAct思考范式",
        order_num: 2,
        sandbox_data: JSON.stringify({
            demo: {
                type: "react_demo",
                title: "ReAct 推理演示",
                task: "小明有5个苹果，给了小红2个，又买了3个，现在有几个？",
                steps: [
                    {
                        thought: "思考：这是一个简单的加法问题，我需要计算 5 - 2 + 3",
                        action: "calculate",
                        observation: "计算结果：6"
                    },
                    {
                        thought: "思考：验证一下计算过程",
                        action: "verify",
                        observation: "验证通过：5 - 2 = 3, 3 + 3 = 6"
                    }
                ],
                final_answer: "小明现在有6个苹果。"
            }
        }),
        quiz_data: JSON.stringify({
            questions: [
                {
                    question: "ReAct 范式中的 Act 指的是什么？",
                    options: ["创建新任务", "执行具体的行动", "开始新的对话", "关闭系统"],
                    answer: 1
                },
                {
                    question: "ReAct 循环的正确顺序是什么？",
                    options: ["Act→Think→Observe", "Think→Act→Observe", "Observe→Act→Think", "Think→Observe→Act"],
                    answer: 1
                },
                {
                    question: "Observation 步骤的主要作用是什么？",
                    options: ["制定下一步计划", "输出最终结果", "获取行动结果作为反馈", "重启推理过程"],
                    answer: 2
                }
            ]
        }),
        content: `# ReAct 思考范式

## 什么是 ReAct？

ReAct（Reasoning + Acting）是一种将推理和行动交织进行的 AI 思考范式。它的核心思想是：**思考引导行动，行动结果反过来修正思考**。

**类比理解**：想象你在厨房做一道从未做过的菜。你不会一口气做完所有步骤，而是"看菜谱→做一步→检查结果→再看菜谱→做下一步"。ReAct 就是这种"边想边做、边做边调整"的模式。

## ReAct 的三个核心步骤

### 1. Think（思考）
Agent 分析当前状态，决定下一步做什么。这个阶段会考虑：
- 我目前知道什么？
- 我还需要什么信息？
- 下一步最合理的行动是什么？

### 2. Act（行动）
执行具体的操作，比如：
- 调用计算器进行数学计算
- 搜索数据库或知识库
- 调用外部API
- 执行一段代码

### 3. Observe（观察）
获取行动的结果，并根据结果调整推理方向：
- 行动成功了吗？
- 获得的信息是否足够？
- 是否需要改变策略？

## ReAct 循环示例

\`\`\`
[Task] 北京今天适合户外运动吗？

[Think] 我需要知道北京的天气信息
[Act] 调用天气查询API，参数：城市=北京
[Observe] 北京今天晴天，22°C，空气质量优

[Think] 天气条件很好，适合户外运动。我可以推荐几个运动项目
[Act] 搜索北京热门户外运动场所
[Observe] 获得5个推荐场所

[Think] 整合天气和场所信息，给出最终建议
[Final] 北京今天晴天22°C，非常适合户外运动！推荐：奥森公园跑步、香山徒步...
\`\`\`

## 为什么 ReAct 很重要？

1. **提高准确性**：通过观察实际结果来纠正错误推理
2. **增强可解释性**：每个步骤都有明确的思考和行动轨迹
3. **支持复杂任务**：可以动态调整策略应对意外情况
4. **减少幻觉**：依赖实际工具调用结果而非凭空猜测

## 关键要点

- ReAct = **Reasoning + Acting**，思考与行动交替进行
- Think→Act→Observe 是基础循环，可多次迭代
- 观察（Observe）是修正推理的关键环节
- 相比纯推理（Chain-of-Thought），ReAct 更依赖外部信息`
    },
    {
        title: "工具调用",
        order_num: 3,
        sandbox_data: JSON.stringify({
            demo: {
                type: "tool_calling",
                title: "工具调用演示",
                available_tools: [
                    { name: "search_web", description: "搜索互联网信息", parameters: { query: "string" } },
                    { name: "calculator", description: "执行数学计算", parameters: { expression: "string" } },
                    { name: "get_weather", description: "查询天气信息", parameters: { city: "string" } }
                ],
                scenario: {
                    user: "上海现在的温度是多少？如果高于30度，帮我推荐3个室内活动。",
                    calls: [
                        { tool: "get_weather", params: { city: "上海" }, result: { temp: 32, condition: "晴" } },
                        {
                            tool: "search_web",
                            params: { query: "上海室内活动推荐" },
                            result: ["博物馆", "室内攀岩", "密室逃脱"]
                        }
                    ]
                }
            }
        }),
        quiz_data: JSON.stringify({
            questions: [
                {
                    question: "Function Calling 的核心作用是什么？",
                    options: ["美化输出格式", "让AI调用外部工具和API", "加速模型推理", "加密用户数据"],
                    answer: 1
                },
                {
                    question: "工具描述（Tool Description）的作用是什么？",
                    options: [
                        "没有实际作用",
                        "帮助AI理解何时以及如何使用该工具",
                        "仅用于展示给用户",
                        "替代工具的代码实现"
                    ],
                    answer: 1
                }
            ]
        }),
        content: `# 工具调用（Tool Calling / Function Calling）

## 概念简介

工具调用（也称为 Function Calling）是让 AI Agent 能够使用外部工具和 API 的关键能力。它使 Agent 从"只会说话"升级为"能实际做事"的智能系统。

**类比理解**：如果把 AI 比作一位聪明的"大脑"，工具调用就是给这个大脑配上了"双手"。有了手，大脑不仅能思考，还能实际操作——去查资料、做计算、发邮件等。

## 工具调用机制

### 1. 工具定义
告诉 AI 有哪些工具可用，每个工具的功能和参数：

\`\`\`json
{
  "name": "search_database",
  "description": "在学生数据库中搜索信息",
  "parameters": {
    "type": "object",
    "properties": {
      "student_name": { "type": "string", "description": "学生姓名" },
      "grade": { "type": "string", "description": "年级" }
    },
    "required": ["student_name"]
  }
}
\`\`\`

### 2. AI 决策
AI 分析用户请求，决定是否需要调用工具、调用哪个、传什么参数。

### 3. 执行与反馈
系统执行工具调用，将结果返回给 AI，AI 整合结果后生成最终回复。

## 常见工具类型

| 工具类型 | 示例 | 用途 |
|---------|------|------|
| 搜索工具 | 网页搜索、数据库查询 | 获取实时信息 |
| 计算工具 | 数学计算、单位换算 | 精确数值计算 |
| API工具 | 天气API、地图API | 获取外部服务数据 |
| 代码执行 | Python解释器 | 运行代码片段 |
| 文件操作 | 读取、写入文件 | 处理本地数据 |

## 实际应用示例

\`\`\`
用户："帮我查一下张三的数学成绩，如果低于60分就给他发一封提醒邮件"

Agent 思考过程：
1. 调用 search_database(student_name="张三", grade="数学") 
2. 获取结果：张三数学成绩 = 55分
3. 判断：低于60分，需要发邮件
4. 调用 send_email(to="zhangsan@school.com", content="...")
5. 回复用户：已查询到张三数学成绩55分，提醒邮件已发送。
\`\`\`

## 关键要点

- 工具调用让 Agent 从"聊天"升级为"做事"
- 工具定义需要清晰的描述和参数说明
- AI 自主决定何时调用工具、调用什么工具
- 工具结果会反馈给 AI 用于后续推理和决策`
    },
    {
        title: "记忆系统",
        order_num: 4,
        sandbox_data: JSON.stringify({
            demo: {
                type: "memory_demo",
                title: "记忆系统演示",
                conversations: [
                    {
                        round: 1,
                        user: "我叫小明，我在学习数据结构这门课。",
                        agent: "你好小明！数据结构是一门很重要的课程。需要我帮你什么？",
                        memory_updated: {
                            short_term: "用户名叫小明，正在学习数据结构",
                            long_term: "用户：小明，兴趣：计算机科学"
                        }
                    },
                    {
                        round: 2,
                        user: "上次我学到二叉树了，能继续讲平衡树吗？",
                        agent: "当然！你之前在学数据结构，二叉树你已经了解了。现在我们来学习平衡树（AVL树）...",
                        memory_used: "回忆起用户正在学数据结构，已掌握二叉树知识"
                    }
                ]
            }
        }),
        quiz_data: JSON.stringify({
            questions: [
                {
                    question: "AI Agent 的记忆系统主要包括哪几种类型？",
                    options: ["只有短期记忆", "短期记忆和长期记忆", "只需要长期记忆", "不需要记忆"],
                    answer: 1
                },
                {
                    question: "短期记忆的主要作用是什么？",
                    options: ["永久保存所有信息", "维护当前对话的上下文", "替代数据库", "训练模型"],
                    answer: 1
                },
                {
                    question: "长期记忆通常存储哪些内容？",
                    options: [
                        "当前对话中的临时变量",
                        "用户偏好、历史对话摘要、重要事实",
                        "只存储时间戳",
                        "不需要长期记忆"
                    ],
                    answer: 1
                }
            ]
        }),
        content: `# 记忆系统（Memory System）

## 概念简介

记忆系统是 AI Agent 的"大脑存储层"，使 Agent 能够在多次交互中保持上下文、回忆历史信息并提供个性化的服务体验。

**类比理解**：如果把 AI 的每次对话比作一次见面，那么没有记忆的 AI 就像"鱼"（据说只有7秒记忆），每次见面都是"初次见面"。有了记忆系统，AI 就像一位老朋友——记得你叫什么、喜欢什么、上次聊到哪儿了。

## 记忆的两种类型

### 短期记忆（Short-term Memory）
- **作用**：维护当前对话的上下文
- **存储内容**：当前会话中的交换内容、中间推理步骤
- **生命周期**：仅在当前会话中有效
- **容量限制**：受上下文窗口限制

### 长期记忆（Long-term Memory）
- **作用**：跨会话保留重要信息
- **存储内容**：用户偏好、历史对话摘要、学过的知识点、个人资料
- **生命周期**：持久化存储
- **实现方式**：向量数据库、关系数据库、知识图谱

## 记忆工作流程

\`\`\`
[新对话开始]
  ↓
1. 检索相关长期记忆（"这个用户是谁？之前学过什么？"）
  ↓
2. 加载到当前上下文（短期记忆）
  ↓
3. 进行对话交互
  ↓
4. 从对话中提取重要信息
  ↓
5. 更新长期记忆
  ↓
[下次对话时重复]
\`\`\`

## 记忆在教育场景中的应用

| 记忆内容 | 应用方式 |
|---------|---------|
| 已掌握知识点 | 跳过已学内容，避免重复 |
| 薄弱知识点 | 针对性出题和讲解 |
| 学习偏好 | 调整教学风格和内容形式 |
| 错题记录 | 生成个性化复习计划 |
| 学习进度 | 推荐下一步学习内容 |

## 关键要点

- 短期记忆保证单次对话的连贯性
- 长期记忆保证跨会话的个性化体验
- 记忆检索 + 记忆更新 = 完整的记忆循环
- 好的记忆系统让 AI 越用越"懂你"`
    },
    {
        title: "多智能体协作",
        order_num: 5,
        sandbox_data: JSON.stringify({
            demo: {
                type: "multi_agent",
                title: "多智能体协作演示",
                task: "为一名学生制定个性化学习计划",
                agents: [
                    {
                        name: "诊断Agent",
                        role: "评估学生当前水平",
                        output: "学生数学基础较好（掌握度75%），英语较弱（掌握度45%）"
                    },
                    {
                        name: "规划Agent",
                        role: "制定学习计划",
                        output: "建议：每天30分钟英语专项训练，每周2次数学拔高练习"
                    },
                    {
                        name: "资源Agent",
                        role: "匹配学习资源",
                        output: "推荐：英语语法基础课（B站视频），数学竞赛入门题库"
                    },
                    {
                        name: "协调Agent",
                        role: "整合所有建议",
                        final_plan: "综合学习计划：周一至周五每天英语语法+阅读理解，周末数学拔高+综合测试"
                    }
                ]
            }
        }),
        quiz_data: JSON.stringify({
            questions: [
                {
                    question: "多智能体协作的主要优势是什么？",
                    options: ["让系统更复杂", "分工协作，每个Agent专注特定任务", "降低系统可靠性", "减少系统功能"],
                    answer: 1
                },
                {
                    question: "在多智能体系统中，协调Agent的主要作用是什么？",
                    options: [
                        "替代所有其他Agent",
                        "整合各Agent的输出，生成最终结果",
                        "只负责记录日志",
                        "不需要协调Agent"
                    ],
                    answer: 1
                },
                {
                    question: "以下哪个是多智能体系统的典型架构？",
                    options: ["单一巨型模型处理所有任务", "多个专用Agent分工协作", "单线程顺序执行", "不需要架构设计"],
                    answer: 1
                }
            ]
        }),
        content: `# 多智能体协作（Multi-Agent Collaboration）

## 概念简介

多智能体协作是指让多个 AI Agent 分工合作、协同完成复杂任务的架构模式。就像一支团队，每个 Agent 有自己的专长领域，通过协作达到"1+1>2"的效果。

**类比理解**：如果说单个 AI Agent 是"全能型选手"，那么多智能体系统就是一支"专业团队"——有分析师、规划师、执行者、检查员，每个人各司其职，配合默契。

## 为什么需要多智能体？

### 单智能体的局限
- 单个模型难以在所有领域都表现卓越
- 长流程任务容易出现注意力分散
- 缺乏自我校验和纠错机制
- 上下文窗口限制导致信息丢失

### 多智能体的优势
- **专业分工**：每个 Agent 专注于特定子任务
- **并行处理**：多个 Agent 可以同时工作
- **交叉验证**：一个 Agent 的输出可以被另一个 Agent 审核
- **灵活扩展**：可以根据需要增加或替换 Agent

## 常见的多智能体架构

### 1. 顺序流水线
\`\`\`
输入 → Agent A → Agent B → Agent C → 输出
\`\`\`
每个 Agent 完成一个阶段，传递给下一个。

### 2. 辩论式
\`\`\`
         → Agent A（观点1）↘
输入 → 协调者                 → 综合分析 → 输出
         → Agent B（观点2）↗
\`\`\`
多个 Agent 从不同角度分析，协调者综合判断。

### 3. 层级式
\`\`\`
          总控 Agent
         /    |    \\
    专家A   专家B   专家C
      |      |      |
    工具    工具    工具
\`\`\`
上层 Agent 负责任务分配和结果整合。

## 教育场景应用 — 智能教学团队

\`\`\`
[学生提问] "这道几何题我不会做"
         ↓
[诊断 Agent]  分析：学生不熟悉相似三角形的判定条件
         ↓
[讲解 Agent]  生成：相似三角形概念讲解 + 图解
         ↓
[练习 Agent]  生成：3道由易到难的相似三角形练习题
         ↓
[评估 Agent]  分析：学生前2题正确，第3题有误，需要讲解辅助线作法
         ↓
[辅导 Agent]  生成：辅助线作法的专项讲解
\`\`\`

## 关键要点

- 多智能体 = 团队协作，每个 Agent 专注自己擅长的
- 核心挑战是 Agent 间的通信和协作协议
- 适合处理复杂、多步骤、需要多角度分析的任务
- 交叉验证机制能有效减少错误和幻觉`
    }
];

async function seedAiCourses() {
    const tn = "ai_courses";
    const exists = await tableExists(tn);
    if (!exists) {
        await pool.query(`
            CREATE TABLE \`${tn}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(220) NOT NULL,
                order_num INT DEFAULT 0,
                content MEDIUMTEXT,
                sandbox_data JSON,
                quiz_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log(`[ai_courses] Table created.`);
    }

    const isEmpty = await tableIsEmpty(tn);
    if (!isEmpty) {
        console.log(`[ai_courses] Table already has data, skipping insert.`);
        const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`${tn}\``);
        return rows[0].cnt;
    }

    const sql = `INSERT INTO \`${tn}\` (title, order_num, content, sandbox_data, quiz_data) VALUES ?`;
    const values = aiCourses.map(c => [c.title, c.order_num, c.content, c.sandbox_data, c.quiz_data]);
    const [result] = await pool.query(sql, [values]);
    console.log(`[ai_courses] Inserted ${result.affectedRows} rows.`);
    return result.affectedRows;
}

// ---------------------------------------------------------------------------
// 4. notes
// ---------------------------------------------------------------------------

const noteData = [
    {
        title: "数组与链表的核心区别",
        body: `# 数组与链表的核心区别

## 内存布局

**数组**在内存中是**连续存储**的。这意味着所有元素紧挨在一起，像一排连在一起的储物柜。这种布局的优势是可以通过索引快速访问任意元素（O(1)），但插入和删除需要移动大量元素（O(n)）。

**链表**在内存中是**分散存储**的。每个节点可以存储在任意位置，通过指针串联起来。这种布局使得插入和删除非常高效（O(1)），但无法通过索引直接访问，需要从头遍历（O(n)）。

## 适用场景对比

| 场景 | 推荐结构 | 原因 |
|------|---------|------|
| 频繁随机访问 | 数组 | O(1)访问 |
| 频繁插入/删除 | 链表 | O(1)操作 |
| 固定大小数据 | 数组 | 内存紧凑 |
| 动态大小数据 | 链表 | 灵活扩展 |

## 实际开发建议

在大多数编程语言中，动态数组（如 Python 的 list、Java 的 ArrayList、JavaScript 的 Array）已经足够应对大部分场景。只有在需要频繁在中间位置插入删除时才考虑使用链表。

**记忆口诀**："数组读得快，链表改得快"`,
        subject: "数据结构",
        source_type: "manual",
        tags: "数据结构,数组,链表,基础知识"
    },
    {
        title: "动态规划入门：从斐波那契到背包问题",
        body: `# 动态规划入门

## 什么是动态规划？

动态规划（Dynamic Programming，DP）是一种通过**分解问题**和**记忆化**来高效求解的算法思想。它的名字听起来很高深，但核心思想其实很朴素：**不要重复计算相同的东西**。

## 经典例子：斐波那契数列

朴素递归的问题：
- fib(5) 需要计算 fib(4) 和 fib(3)
- fib(4) 又需要计算 fib(3) 和 fib(2)
- 注意 fib(3) 被计算了两次！

DP的解决方案：用一个数组存储已经计算过的结果。

\`\`\`python
# 自底向上的DP
def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`

## DP的两个核心要素

1. **最优子结构**：问题的最优解包含子问题的最优解
2. **重叠子问题**：相同的子问题会被反复计算

## 0-1背包问题

给定 n 个物品，每个物品有重量 w[i] 和价值 v[i]，背包容量为 W，求能装入的最大价值。

状态定义：dp[i][j] = 前 i 个物品，容量 j 时的最大价值
状态转移：dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i]] + v[i])

## 学习建议

1. 先理解斐波那契和爬楼梯等基础DP问题
2. 掌握"状态定义"和"状态转移方程"
3. 多做练习，DP是"看答案才能学"的算法类型`,
        subject: "算法",
        source_type: "manual",
        tags: "算法,动态规划,DP,斐波那契,背包问题"
    },
    {
        title: "HTTP协议核心概念梳理",
        body: `# HTTP协议核心概念

## HTTP是什么？

HTTP（HyperText Transfer Protocol）是Web应用的基础通信协议。它是**无状态**的请求-响应协议：客户端发送请求，服务器返回响应。

## 请求方法

| 方法 | 含义 | 幂等性 |
|------|------|--------|
| GET | 获取资源 | 是 |
| POST | 创建资源 | 否 |
| PUT | 完整更新资源 | 是 |
| PATCH | 部分更新资源 | 否 |
| DELETE | 删除资源 | 是 |

## 状态码分类

- **1xx**：信息性响应，请求正在处理
- **2xx**：成功 —— 200 OK、201 Created、204 No Content
- **3xx**：重定向 —— 301 永久、302 临时、304 未修改
- **4xx**：客户端错误 —— 400 请求错误、401 未授权、403 禁止、404 未找到
- **5xx**：服务器错误 —— 500 内部错误、502 网关错误、503 服务不可用

## HTTPS 与 HTTP 的区别

HTTPS = HTTP + TLS/SSL（加密层）

- **加密**：数据传输被加密，防止窃听
- **认证**：通过证书验证服务器身份
- **完整性**：防止数据在传输中被篡改

## RESTful API 设计要点

- 用名词表示资源：/users、/articles
- 用HTTP方法表示操作：GET读取、POST创建
- 用状态码表示结果：200成功、404不存在
- 保持无状态：每个请求包含所有必要信息`,
        subject: "计算机网络",
        source_type: "manual",
        tags: "计算机网络,HTTP,HTTPS,REST,API"
    },
    {
        title: "数据库索引原理与实践",
        body: `# 数据库索引原理与实践

## 索引是什么？

索引就像一本书的**目录**。没有目录，找某个内容需要翻遍整本书（全表扫描）；有了目录，可以直接定位到对应页面（索引查找）。

## 常见索引结构

### B+树索引（最常用）
- 所有数据存储在叶子节点
- 叶子节点之间通过指针连接，支持范围查询
- 查询时间复杂度 O(log n)
- MySQL InnoDB 的默认索引结构

### 哈希索引
- 基于哈希表实现
- 只支持等值查询（=），不支持范围查询
- 查询时间复杂度 O(1)
- 适用于等值查找场景

## 索引使用原则

### 应该建索引的场景
✅ WHERE 子句中频繁使用的列
✅ JOIN 关联的列
✅ ORDER BY 和 GROUP BY 的列
✅ 数据量大且查询频率高的表

### 不应该建索引的场景
❌ 经常增删改的表（维护索引有开销）
❌ 值很少的列（如性别：男/女）
❌ 小表（全表扫描更快）
❌ 很少出现在查询中的列

## 索引失效的常见情况

1. 在索引列上使用函数：\`WHERE YEAR(date) = 2024\`
2. 使用 LIKE 前缀模糊：\`WHERE name LIKE '%明'\`
3. 隐式类型转换：\`WHERE phone = 13800138000\`（phone是varchar）
4. OR 条件中有非索引列

## 一句总结

"索引是空间换时间的经典策略，合理使用能极大提升查询性能，但滥用会拖慢写入速度。"`,
        subject: "数据库",
        source_type: "manual",
        tags: "数据库,索引,B+树,MySQL,性能优化"
    },
    {
        title: "进程与线程：操作系统核心概念",
        body: `# 进程与线程

## 进程（Process）

**定义**：进程是正在执行的程序的实例，是操作系统资源分配的基本单位。

每个进程拥有：
- 独立的虚拟地址空间
- 文件描述符表
- 信号处理设置
- 至少一个线程（主线程）

## 线程（Thread）

**定义**：线程是进程内的执行单元，是CPU调度的基本单位。

同一进程的线程共享：
- 地址空间（堆、全局变量）
- 打开的文件
- 信号处理设置

每个线程独有：
- 自己的栈
- 寄存器状态
- 线程ID

## 核心区别

| 维度 | 进程 | 线程 |
|------|------|------|
| 资源 | 独立地址空间 | 共享地址空间 |
| 创建开销 | 大 | 小 |
| 切换开销 | 大 | 小 |
| 通信方式 | IPC（管道、消息队列等） | 直接读写共享内存 |
| 隔离性 | 强 | 弱 |
| 崩溃影响 | 不影响其他进程 | 可能导致整个进程崩溃 |

## 并发 vs 并行

- **并发**：多个任务在同一时间段内交替执行（单核CPU快速切换）
- **并行**：多个任务在同一时刻同时执行（多核CPU）

## 实际应用

- **计算密集型任务**：使用多进程，利用多核CPU
- **I/O密集型任务**：使用多线程或异步I/O
- **Web服务器**：通常采用进程池 + 线程池的混合模型`,
        subject: "操作系统",
        source_type: "manual",
        tags: "操作系统,进程,线程,并发,并行"
    }
];

async function seedNotes() {
    const tn = "notes";
    const exists = await tableExists(tn);
    let useLegacySchema = false;

    if (!exists) {
        await pool.query(`
            CREATE TABLE \`${tn}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(220) NOT NULL,
                body MEDIUMTEXT,
                subject VARCHAR(80),
                source_type VARCHAR(40) DEFAULT 'manual',
                tags VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log(`[notes] Table created.`);
    } else {
        const [cols] = await pool.query(
            `SELECT COLUMN_NAME FROM information_schema.columns
             WHERE table_schema = ? AND table_name = ?`,
            [config.database.database, tn]
        );
        const colNames = cols.map(c => c.COLUMN_NAME);
        useLegacySchema = colNames.includes("knowledge_id") || colNames.includes("tags_json");
        console.log(`[notes] Table exists (${useLegacySchema ? "legacy" : "custom"} schema).`);
    }

    const isEmpty = await tableIsEmpty(tn);
    if (!isEmpty) {
        console.log(`[notes] Table already has data, skipping insert.`);
        const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`${tn}\``);
        return rows[0].cnt;
    }

    if (useLegacySchema) {
        // Legacy schema has tags_json (JSON), review_status, next_review_at, knowledge_id
        let inserted = 0;
        for (const note of noteData) {
            const tagsArr = note.tags.split(",").map(t => t.trim());
            await pool.query(
                `INSERT INTO \`${tn}\` (user_id, title, body, subject, source_type, tags_json, review_status)
                 VALUES (?, ?, ?, ?, ?, CAST(? AS JSON), 'new')`,
                [1, note.title, note.body, note.subject, note.source_type, JSON.stringify(tagsArr)]
            );
            inserted++;
        }
        console.log(`[notes] Inserted ${inserted} rows (legacy schema).`);
        return inserted;
    } else {
        const sql = `INSERT INTO \`${tn}\` (user_id, title, body, subject, source_type, tags) VALUES ?`;
        const values = noteData.map(n => [1, n.title, n.body, n.subject, n.source_type, n.tags]);
        const [result] = await pool.query(sql, [values]);
        console.log(`[notes] Inserted ${result.affectedRows} rows.`);
        return result.affectedRows;
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log("=== EduSmart CS Seed Data ===");
    console.log(`Database: ${config.database.database}@${config.database.host}`);
    console.log("");

    let nodeCount = 0,
        questionCount = 0,
        courseCount = 0,
        noteCount = 0;

    try {
        // Test connection
        await pool.query("SELECT 1");
        console.log("[db] Connection OK.\n");

        // 1. knowledge_nodes
        console.log("--- 1. knowledge_nodes ---");
        nodeCount = await seedKnowledgeNodes();
        console.log("");

        // 2. questions
        console.log("--- 2. questions ---");
        questionCount = await seedQuestions();
        console.log("");

        // 3. ai_courses
        console.log("--- 3. ai_courses ---");
        courseCount = await seedAiCourses();
        console.log("");

        // 4. notes
        console.log("--- 4. notes ---");
        noteCount = await seedNotes();
        console.log("");

        console.log("========================================");
        console.log(
            `Seed complete: ${nodeCount} knowledge nodes, ${questionCount} questions, ${courseCount} courses, ${noteCount} notes inserted`
        );
        console.log("========================================");
    } catch (error) {
        console.error("Seed failed:", error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
