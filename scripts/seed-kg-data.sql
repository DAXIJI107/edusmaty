-- ============================================
-- 知识图谱测试数据种子脚本
-- ============================================

-- 创建 note_links 表（如果不存在）
CREATE TABLE IF NOT EXISTS note_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_note_id INT NOT NULL,
    target_title VARCHAR(255) NOT NULL,
    target_note_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_source (source_note_id),
    INDEX idx_target (target_note_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 插入测试笔记（zhangsan, user_id=1）
-- 知识点ID映射: 二分查找→13, 排序算法→12, 动态规划→15, 数组与链表→7,
--   树与二叉树→9, HTTP协议→19, TCP/IP→18, 索引原理→28, React→36, Git→31
-- ============================================
INSERT INTO notes (user_id, title, subject, body, tags_json, knowledge_id, source_type) VALUES
(1, '二分查找算法笔记', '编程', '## 二分查找\n\n二分查找是一种在有序数组中查找目标值的算法。\n\n### 核心思想\n- 每次取中间位置比较\n- 根据比较结果缩小一半搜索范围\n- 时间复杂度 O(log n)\n\n### 变体\n- 查找第一个等于 target 的位置\n- 查找最后一个等于 target 的位置', '["二分查找","算法","数据结构"]', 13, 'manual'),
(1, '快速排序原理', '编程', '## 快速排序\n\n快速排序使用分治策略。\n\n### 步骤\n1. 选择基准元素（pivot）\n2. 分区：小于基准放左边，大于基准放右边\n3. 递归排序左右子数组\n\n### 复杂度\n- 平均 O(n log n)\n- 最坏 O(n²)', '["快速排序","分治","算法"]', 12, 'manual'),
(1, '动态规划入门', '编程', '## 动态规划\n\n### 核心要素\n- 最优子结构\n- 重叠子问题\n- 状态转移方程\n\n### 经典问题\n- 斐波那契数列\n- 0-1 背包问题\n- 最长公共子序列', '["动态规划","DP","算法"]', 15, 'manual'),
(1, '链表操作总结', '数据结构', '## 链表\n\n### 类型\n- 单链表\n- 双向链表\n- 循环链表\n\n### 常见操作\n- 反转链表（迭代 + 递归）\n- 检测环（快慢指针）\n- 合并两个有序链表', '["链表","数据结构"]', 7, 'manual'),
(1, '二叉树遍历方法', '数据结构', '## 二叉树遍历\n\n### 深度优先\n- 前序遍历：根-左-右\n- 中序遍历：左-根-右\n- 后序遍历：左-右-根\n\n### 广度优先\n- 层序遍历（用队列实现）', '["二叉树","遍历","数据结构"]', 9, 'manual'),
(1, 'HTTP 协议基础', '网络', '## HTTP 协议\n\n### 请求方法\n- GET：获取资源\n- POST：创建资源\n- PUT：更新资源\n- DELETE：删除资源\n\n### 状态码\n- 2xx 成功\n- 3xx 重定向\n- 4xx 客户端错误\n- 5xx 服务端错误', '["HTTP","网络协议","Web"]', 19, 'manual'),
(1, 'TCP 三次握手和四次挥手', '网络', '## TCP 连接管理\n\n### 三次握手\n1. SYN：客户端请求建立连接\n2. SYN+ACK：服务端同意\n3. ACK：客户端确认\n\n### 四次挥手\n1. FIN：客户端请求断开\n2. ACK：服务端确认收到\n3. FIN：服务端请求断开\n4. ACK：客户端确认', '["TCP","网络协议","握手"]', 18, 'manual'),
(1, 'SQL 查询优化技巧', '数据库', '## SQL 优化\n\n### 索引优化\n- 使用 EXPLAIN 分析执行计划\n- 避免 SELECT *\n- 合理使用联合索引\n\n### 查询优化\n- 用 JOIN 替代子查询\n- 避免在 WHERE 子句中使用函数', '["SQL","数据库优化","索引"]', 28, 'manual'),
(1, 'React Hooks 使用笔记', '前端', '## React Hooks\n\n### 常用 Hooks\n- useState：状态管理\n- useEffect：副作用处理\n- useContext：上下文消费\n- useMemo / useCallback：性能优化', '["React","Hooks","前端","JavaScript"]', 36, 'manual'),
(1, 'Git 常用命令', '工具', '## Git 工作流\n\n### 基础命令\n- git clone / init\n- git add / commit / push\n- git branch / checkout\n- git merge / rebase\n\n### 协作流程\n1. Fork 仓库\n2. 创建 feature 分支\n3. 提交 PR\n4. Code Review', '["Git","版本控制","协作"]', 31, 'manual');

-- ============================================
-- 插入笔记关联 (note_links)
-- ============================================
INSERT INTO note_links (source_note_id, target_title, target_note_id) VALUES
(1, '快速排序原理', 2),
(1, '查找算法', NULL),
(1, '递归与分治', NULL),
(2, '二分查找算法笔记', 1),
(2, '动态规划入门', 3),
(3, '递归与分治', NULL),
(3, '贪心算法', NULL),
(4, '二叉树遍历方法', 5),
(4, '栈与队列', NULL),
(5, '链表操作总结', 4),
(5, '排序算法', NULL),
(6, 'TCP 三次握手和四次挥手', 7),
(6, 'DNS解析', NULL),
(6, 'HTTPS加密', NULL),
(7, 'HTTP 协议基础', 6),
(7, 'OSI七层模型', NULL),
(8, '数据库设计', NULL),
(8, '事务与锁', NULL),
(9, 'TypeScript', NULL),
(9, 'HTML/CSS', NULL),
(10, 'Docker容器', NULL),
(10, '单元测试', NULL);