const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware');

router.use(authenticateJWT);

function getUserId(req) { return req.user.id; }

async function ensureTables() {
    await pool.query(`CREATE TABLE IF NOT EXISTS learning_resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(64) NOT NULL,
        subcategory VARCHAR(64) DEFAULT '',
        name VARCHAR(256) NOT NULL,
        url VARCHAR(1024) NOT NULL,
        description VARCHAR(1024) DEFAULT '',
        icon VARCHAR(64) DEFAULT 'link',
        type ENUM('tutorial','video','practice','reference','tool','community') DEFAULT 'reference',
        difficulty ENUM('beginner','intermediate','advanced','all') DEFAULT 'all',
        language VARCHAR(32) DEFAULT 'zh',
        is_free TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        click_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_type (type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.query(`CREATE TABLE IF NOT EXISTS coding_problems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(256) NOT NULL,
        category VARCHAR(64) DEFAULT '',
        difficulty ENUM('easy','medium','hard') DEFAULT 'easy',
        description TEXT,
        examples JSON,
        template_code JSON,
        tags VARCHAR(512) DEFAULT '',
        source VARCHAR(128) DEFAULT 'internal',
        source_url VARCHAR(1024) DEFAULT '',
        click_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_difficulty (difficulty)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

ensureTables().catch(e => console.warn('resources table init:', e.message));

router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT category, COUNT(*) as count, GROUP_CONCAT(DISTINCT subcategory) as subcategories
             FROM learning_resources GROUP BY category ORDER BY MAX(sort_order)`
        );
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error('获取分类失败:', e);
        res.status(500).json({ success: false, message: '获取分类失败' });
    }
});

router.get('/list', async (req, res) => {
    try {
        const { category, type, difficulty, page = 1, limit = 50, search } = req.query;
        let sql = 'SELECT * FROM learning_resources WHERE 1=1';
        const params = [];
        if (category) { sql += ' AND category = ?'; params.push(category); }
        if (type) { sql += ' AND type = ?'; params.push(type); }
        if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
        if (search) { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        sql += ' ORDER BY sort_order ASC, click_count DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), (Number(page) - 1) * Number(limit));
        const [rows] = await pool.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error('获取资源失败:', e);
        res.status(500).json({ success: false, message: '获取资源失败' });
    }
});

router.post('/click/:id', async (req, res) => {
    try {
        await pool.query('UPDATE learning_resources SET click_count = click_count + 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

router.get('/problems', async (req, res) => {
    try {
        const { category, difficulty, page = 1, limit = 50, search } = req.query;
        let sql = 'SELECT id, title, category, difficulty, tags, source, click_count, created_at FROM coding_problems WHERE 1=1';
        const params = [];
        if (category) { sql += ' AND category = ?'; params.push(category); }
        if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
        if (search) { sql += ' AND (title LIKE ? OR tags LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        sql += ' ORDER BY difficulty ASC, id ASC LIMIT ? OFFSET ?';
        params.push(Number(limit), (Number(page) - 1) * Number(limit));
        const [rows] = await pool.query(sql, params);
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM coding_problems WHERE 1=1 ${category ? 'AND category = ?' : ''} ${difficulty ? 'AND difficulty = ?' : ''}`,
            params.filter(() => category || difficulty)
        );
        res.json({ success: true, data: rows, total: countResult[0]?.total || 0 });
    } catch (e) {
        console.error('获取题目失败:', e);
        res.status(500).json({ success: false, message: '获取题目失败' });
    }
});

router.get('/problems/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM coding_problems WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: '题目不存在' });
        await pool.query('UPDATE coding_problems SET click_count = click_count + 1 WHERE id = ?', [req.params.id]);
        const problem = rows[0];
        if (typeof problem.examples === 'string') { try { problem.examples = JSON.parse(problem.examples); } catch { problem.examples = []; } }
        if (typeof problem.template_code === 'string') { try { problem.template_code = JSON.parse(problem.template_code); } catch { problem.template_code = {}; } }
        res.json({ success: true, data: problem });
    } catch (e) {
        console.error('获取题目详情失败:', e);
        res.status(500).json({ success: false, message: '获取题目详情失败' });
    }
});

const seedResources = [
    { category: '编程入门', subcategory: '教程', name: '菜鸟教程', url: 'https://www.runoob.com', description: '最受欢迎的编程技术教程网站，涵盖HTML/CSS/JS/Python/Java等几乎所有主流语言', icon: 'book', type: 'tutorial', difficulty: 'beginner', sort_order: 1 },
    { category: '编程入门', subcategory: '教程', name: 'W3School 中文', url: 'https://www.w3school.com.cn', description: 'Web开发技术参考，HTML/CSS/JavaScript 基础教程', icon: 'layers', type: 'tutorial', difficulty: 'beginner', sort_order: 2 },
    { category: '编程入门', subcategory: '教程', name: 'MDN Web Docs', url: 'https://developer.mozilla.org/zh-CN', description: 'Mozilla 官方 Web 技术文档，最权威的 HTML/CSS/JS 参考', icon: 'book', type: 'reference', difficulty: 'all', sort_order: 3 },
    { category: '编程入门', subcategory: '教程', name: 'C语言中文网', url: 'https://c.biancheng.net', description: 'C语言、C++、Python、Linux、数据结构系统教程', icon: 'code', type: 'tutorial', difficulty: 'beginner', sort_order: 4 },
    { category: '算法与数据结构', subcategory: '刷题', name: '力扣 LeetCode', url: 'https://leetcode.cn', description: '全球最大的算法题库，支持多语言在线编码，面试必刷', icon: 'code', type: 'practice', difficulty: 'all', sort_order: 1 },
    { category: '算法与数据结构', subcategory: '刷题', name: '牛客网', url: 'https://www.nowcoder.com', description: '国内最大的IT笔试面试题库，含算法/数据结构/公司真题', icon: 'exam', type: 'practice', difficulty: 'all', sort_order: 2 },
    { category: '算法与数据结构', subcategory: '刷题', name: 'Codeforces', url: 'https://codeforces.com', description: '全球顶级算法竞赛平台，周赛题目质量极高', icon: 'code', type: 'practice', difficulty: 'advanced', sort_order: 3 },
    { category: '算法与数据结构', subcategory: '教程', name: 'Hello 算法', url: 'https://www.hello-algo.com', description: '动画图解、一键运行的数据结构与算法教程', icon: 'brain', type: 'tutorial', difficulty: 'beginner', sort_order: 4 },
    { category: '算法与数据结构', subcategory: '教程', name: 'OI Wiki', url: 'https://oi-wiki.org', description: '编程竞赛知识整合站点，涵盖算法/数据结构/数学', icon: 'book', type: 'reference', difficulty: 'advanced', sort_order: 5 },
    { category: '前端开发', subcategory: '教程', name: 'Vue.js 官方文档', url: 'https://cn.vuejs.org', description: '渐进式 JavaScript 框架官方中文文档', icon: 'layers', type: 'reference', difficulty: 'intermediate', sort_order: 1 },
    { category: '前端开发', subcategory: '教程', name: 'React 官方文档', url: 'https://zh-hans.react.dev', description: 'React 框架官方中文文档', icon: 'code', type: 'reference', difficulty: 'intermediate', sort_order: 2 },
    { category: '前端开发', subcategory: '教程', name: 'TypeScript 中文网', url: 'https://www.tslang.cn', description: 'TypeScript 语言官方中文站', icon: 'code', type: 'reference', difficulty: 'intermediate', sort_order: 3 },
    { category: '前端开发', subcategory: '工具', name: 'CodePen', url: 'https://codepen.io', description: '在线前端代码编辑器与社区，实时预览HTML/CSS/JS', icon: 'code', type: 'tool', difficulty: 'all', sort_order: 4 },
    { category: '后端开发', subcategory: '教程', name: 'Node.js 中文网', url: 'https://nodejs.cn', description: 'Node.js 官方中文文档与入门教程', icon: 'code', type: 'reference', difficulty: 'intermediate', sort_order: 1 },
    { category: '后端开发', subcategory: '教程', name: 'Spring 中文', url: 'https://springdoc.cn', description: 'Spring 框架中文参考文档', icon: 'book', type: 'reference', difficulty: 'intermediate', sort_order: 2 },
    { category: '后端开发', subcategory: '教程', name: 'Django 文档', url: 'https://docs.djangoproject.com/zh-hans', description: 'Django Web 框架官方中文文档', icon: 'book', type: 'reference', difficulty: 'intermediate', sort_order: 3 },
    { category: '后端开发', subcategory: '社区', name: 'Stack Overflow', url: 'https://stackoverflow.com', description: '全球最大的程序员问答社区', icon: 'chat', type: 'community', difficulty: 'all', sort_order: 5 },
    { category: '数据库', subcategory: '教程', name: 'MySQL 教程', url: 'https://www.runoob.com/mysql/mysql-tutorial.html', description: '菜鸟教程 MySQL 入门到精通', icon: 'db', type: 'tutorial', difficulty: 'beginner', sort_order: 1 },
    { category: '数据库', subcategory: '教程', name: 'Redis 中文', url: 'https://redis.com.cn', description: 'Redis 中文教程与命令参考', icon: 'db', type: 'reference', difficulty: 'intermediate', sort_order: 2 },
    { category: '数据库', subcategory: '工具', name: 'SQL Fiddle', url: 'http://sqlfiddle.com', description: '在线 SQL 练习工具，支持 MySQL/PostgreSQL/SQLite', icon: 'db', type: 'tool', difficulty: 'all', sort_order: 3 },
    { category: '人工智能', subcategory: '教程', name: 'PyTorch 中文', url: 'https://pytorch.panchuang.net', description: 'PyTorch 深度学习框架中文教程', icon: 'brain', type: 'tutorial', difficulty: 'intermediate', sort_order: 1 },
    { category: '人工智能', subcategory: '教程', name: 'TensorFlow 中文', url: 'https://tensorflow.google.cn', description: 'TensorFlow 官方中文站点', icon: 'brain', type: 'tutorial', difficulty: 'intermediate', sort_order: 2 },
    { category: '人工智能', subcategory: '教程', name: 'Scikit-learn 中文', url: 'https://scikit-learn.org/stable', description: 'Python 机器学习库官方文档', icon: 'code', type: 'reference', difficulty: 'intermediate', sort_order: 3 },
    { category: '人工智能', subcategory: '教程', name: '机器学习速成课', url: 'https://developers.google.com/machine-learning/crash-course', description: 'Google 官方机器学习入门课程', icon: 'book', type: 'tutorial', difficulty: 'beginner', sort_order: 4 },
    { category: '操作系统与网络', subcategory: '教程', name: 'Linux 命令大全', url: 'https://www.runoob.com/linux/linux-command-manual.html', description: 'Linux 命令参考手册', icon: 'terminal', type: 'reference', difficulty: 'beginner', sort_order: 1 },
    { category: '操作系统与网络', subcategory: '教程', name: '计算机基础教程', url: 'https://www.runoob.com/w3cnote_genre/computer', description: '计算机基础/网络/操作系统入门教程', icon: 'book', type: 'tutorial', difficulty: 'beginner', sort_order: 2 },
    { category: '操作系统与网络', subcategory: '社区', name: 'GitHub', url: 'https://github.com', description: '全球最大的代码托管平台，学习开源项目最佳资源', icon: 'folder', type: 'community', difficulty: 'all', sort_order: 3 },
    { category: '操作系统与网络', subcategory: '教程', name: 'Git 中文教程', url: 'https://git-scm.com/book/zh/v2', description: 'Pro Git 官方中文版', icon: 'book', type: 'tutorial', difficulty: 'beginner', sort_order: 4 },
    { category: '视频教程', subcategory: '综合', name: 'B站 编程区', url: 'https://www.bilibili.com/v/popular/programming', description: 'B站编程开发热门视频，含各类语言/框架/项目实战', icon: 'play', type: 'video', difficulty: 'all', sort_order: 1 },
    { category: '视频教程', subcategory: '综合', name: '中国大学MOOC', url: 'https://www.icourse163.org', description: '中国大学计算机专业课，含数据结构/操作系统/网络', icon: 'play', type: 'video', difficulty: 'all', sort_order: 2 },
    { category: '视频教程', subcategory: '综合', name: '学堂在线', url: 'https://www.xuetangx.com', description: '清华大学出品，计算机课程资源丰富', icon: 'play', type: 'video', difficulty: 'all', sort_order: 3 },
    { category: '视频教程', subcategory: '综合', name: '慕课网', url: 'https://www.imooc.com', description: '程序员的实战视频课，前端/后端/移动端全覆盖', icon: 'play', type: 'video', difficulty: 'all', sort_order: 4 },
    { category: '视频教程', subcategory: '综合', name: 'YouTube CS', url: 'https://www.youtube.com', description: 'CS50/FreeCodeCamp/TheNetNinja 等顶级编程频道', icon: 'play', type: 'video', difficulty: 'all', sort_order: 5 },
];

const seedProblems = [
    { title: '两数之和', category: '数组', difficulty: 'easy', description: '给定一个整数数组 nums 和一个整数目标值 target，请在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。\n\n你可以按任意顺序返回答案。', examples: JSON.stringify([{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }, { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }]), template_code: JSON.stringify({ javascript: 'function twoSum(nums, target) {\n    \n}', python: 'def two_sum(nums, target):\n    pass', java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}' }), tags: '数组,哈希表', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/two-sum' },
    { title: '反转链表', category: '链表', difficulty: 'easy', description: '给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。', examples: JSON.stringify([{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }]), template_code: JSON.stringify({ javascript: 'function reverseList(head) {\n    \n}', python: 'def reverse_list(head):\n    pass', java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}' }), tags: '链表,递归', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/reverse-linked-list' },
    { title: '有效的括号', category: '栈', difficulty: 'easy', description: '给定一个只包括 \'(\'、\')\'、\'{\'、\'}\'、\'[\'、\']\' 的字符串 s，判断字符串是否有效。\n\n有效字符串需满足：左括号必须用相同类型的右括号闭合；左括号必须以正确的顺序闭合。', examples: JSON.stringify([{ input: 's = "()"', output: 'true' }, { input: 's = "()[]{}"', output: 'true' }, { input: 's = "(]"', output: 'false' }]), template_code: JSON.stringify({ javascript: 'function isValid(s) {\n    \n}', python: 'def is_valid(s):\n    pass', java: 'class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}' }), tags: '栈,字符串', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/valid-parentheses' },
    { title: '合并两个有序链表', category: '链表', difficulty: 'easy', description: '将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。', examples: JSON.stringify([{ input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }]), template_code: JSON.stringify({ javascript: 'function mergeTwoLists(list1, list2) {\n    \n}', python: 'def merge_two_lists(list1, list2):\n    pass', java: 'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        \n    }\n}' }), tags: '链表,递归', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/merge-two-sorted-lists' },
    { title: '二分查找', category: '数组', difficulty: 'easy', description: '给定一个 n 个元素有序的（升序）整型数组 nums 和一个目标值 target，写一个函数搜索 nums 中的 target，如果目标值存在返回下标，否则返回 -1。', examples: JSON.stringify([{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }, { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }]), template_code: JSON.stringify({ javascript: 'function search(nums, target) {\n    \n}', python: 'def search(nums, target):\n    pass', java: 'class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}' }), tags: '数组,二分查找', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/binary-search' },
    { title: '二叉树的中序遍历', category: '树', difficulty: 'easy', description: '给定一个二叉树的根节点 root，返回它的中序遍历。', examples: JSON.stringify([{ input: 'root = [1,null,2,3]', output: '[1,3,2]' }]), template_code: JSON.stringify({ javascript: 'function inorderTraversal(root) {\n    \n}', python: 'def inorder_traversal(root):\n    pass', java: 'class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        \n    }\n}' }), tags: '树,递归,栈', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/binary-tree-inorder-traversal' },
    { title: '爬楼梯', category: '动态规划', difficulty: 'easy', description: '假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？', examples: JSON.stringify([{ input: 'n = 2', output: '2' }, { input: 'n = 3', output: '3' }]), template_code: JSON.stringify({ javascript: 'function climbStairs(n) {\n    \n}', python: 'def climb_stairs(n):\n    pass', java: 'class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}' }), tags: '动态规划,记忆化', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/climbing-stairs' },
    { title: '最大子数组和', category: '动态规划', difficulty: 'medium', description: '给你一个整数数组 nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。', examples: JSON.stringify([{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '连续子数组 [4,-1,2,1] 的和最大为 6' }]), template_code: JSON.stringify({ javascript: 'function maxSubArray(nums) {\n    \n}', python: 'def max_sub_array(nums):\n    pass', java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}' }), tags: '动态规划,数组', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/maximum-subarray' },
    { title: '排序数组', category: '排序', difficulty: 'medium', description: '给你一个整数数组 nums，请你将该数组升序排列。你可以使用任意排序算法。', examples: JSON.stringify([{ input: 'nums = [5,2,3,1]', output: '[1,2,3,5]' }]), template_code: JSON.stringify({ javascript: 'function sortArray(nums) {\n    \n}', python: 'def sort_array(nums):\n    pass', java: 'class Solution {\n    public int[] sortArray(int[] nums) {\n        \n    }\n}' }), tags: '排序,数组,分治', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/sort-an-array' },
    { title: '全排列', category: '回溯', difficulty: 'medium', description: '给定一个不含重复数字的数组 nums，返回其所有可能的全排列。你可以按任意顺序返回答案。', examples: JSON.stringify([{ input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }]), template_code: JSON.stringify({ javascript: 'function permute(nums) {\n    \n}', python: 'def permute(nums):\n    pass', java: 'class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        \n    }\n}' }), tags: '回溯,递归', source: 'LeetCode', source_url: 'https://leetcode.cn/problems/permutations' },
];

router.post('/seed', async (req, res) => {
    try {
        for (const r of seedResources) {
            const [existing] = await pool.query('SELECT id FROM learning_resources WHERE name = ? AND url = ?', [r.name, r.url]);
            if (!existing.length) {
                await pool.query('INSERT INTO learning_resources SET ?', [r]);
            }
        }
        for (const p of seedProblems) {
            const [existing] = await pool.query('SELECT id FROM coding_problems WHERE title = ?', [p.title]);
            if (!existing.length) {
                await pool.query('INSERT INTO coding_problems SET ?', [p]);
            }
        }
        res.json({ success: true, message: `已种子 ${seedResources.length} 个资源, ${seedProblems.length} 道题目` });
    } catch (e) {
        console.error('种子数据失败:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;