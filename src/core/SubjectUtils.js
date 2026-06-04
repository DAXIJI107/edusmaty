function normalizeQuestionType(optionsJson) {
    try {
        if (!optionsJson) return 'fill';
        const opts = typeof optionsJson === 'string' ? JSON.parse(optionsJson) : optionsJson;
        if (!Array.isArray(opts) || opts.length === 0) return 'fill';
        if (opts.length === 2) {
            const labels = opts.map(o => {
                if (typeof o === 'string') return o;
                if (o && typeof o === 'object') return o.label || o.text || String(o.value || '');
                return '';
            });
            const lowerLabels = labels.map(l => String(l).toLowerCase().trim());
            if (lowerLabels.includes('对') && lowerLabels.includes('错')) return 'judge';
            if (lowerLabels.includes('正确') && lowerLabels.includes('错误')) return 'judge';
            if (lowerLabels.includes('true') && lowerLabels.includes('false')) return 'judge';
            if (lowerLabels.includes('是') && lowerLabels.includes('否')) return 'judge';
        }
        return 'single';
    } catch (e) {
        return 'fill';
    }
}

function normalizeAnswerForCompare(type, answer) {
    if (answer === null || answer === undefined) return '';
    if (['single', 'judge', 'fill'].includes(type)) {
        return String(answer).trim();
    }
    if (type === 'multiple') {
        if (Array.isArray(answer)) return answer.map(a => String(a).trim()).sort();
        try {
            const parsed = JSON.parse(answer);
            if (Array.isArray(parsed)) return parsed.map(a => String(a).trim()).sort();
        } catch (e) {}
        return String(answer).trim().replace(/[\,\;\s]+/g, '').split('').sort();
    }
    return String(answer).trim();
}

function difficultyLabel(dif) {
    if (!dif) return '中等';
    const d = String(dif).toLowerCase();
    if (d === 'easy' || d === '1' || d === '简单') return '简单';
    if (d === 'hard' || d === '3' || d === '困难') return '困难';
    return '中等';
}

function getQuestionTypeFromOptions(optionsJson) {
    return normalizeQuestionType(optionsJson);
}

function masteryLevel(accuracy) {
    if (accuracy >= 85) return { level: '熟练掌握', color: '#10b981', emoji: '🌟' };
    if (accuracy >= 70) return { level: '基本掌握', color: '#3b82f6', emoji: '✅' };
    if (accuracy >= 50) return { level: '发展中', color: '#f59e0b', emoji: '📈' };
    if (accuracy >= 30) return { level: '薄弱', color: '#f97316', emoji: '⚠️' };
    return { level: '未掌握', color: '#ef4444', emoji: '🔴' };
}

// 根据知识点名称推断所属学科
function inferSubjectByName(name) {
    if (!name) return 'math';
    const text = name.toLowerCase();

    const patterns = [
        { code: 'software_engineering', keywords: ['软件工程', '需求分析', '软件过程', '过程模型', '瀑布模型', '原型模型', '敏捷开发', '软件设计', '软件测试', '测试用例', '用例建模', 'srs'] },
        { code: 'physics', keywords: ['物理', '力学', '电磁', '光学', '热学', '量子', '相对论', '牛顿', '电场', '磁场', '电路', '欧姆', '运动', '引力', '动量', '能量守恒', '波', '声', '磁'] },
        { code: 'chemistry', keywords: ['化学', '元素', '反应', '分子', '原子', '离子', '酸碱', '氧化', '还原', '有机', '无机', '催化', '电解', '共价键', '离子键', '配位', '平衡'] },
        { code: 'biology', keywords: ['生物', '细胞', '基因', '遗传', '进化', '生态', '光合', '呼吸', '酶', 'DNA', 'RNA', '蛋白质', '物种', '免疫', '神经', '激素', '解剖', '微生物'] },
        { code: 'english', keywords: ['英语', 'english', '语法', '词汇', '听力', '口语', '阅读', '写作', '翻译', '时态', '从句', '作文', '阅读理解'] },
        { code: 'programming', keywords: ['编程', 'python', 'java', 'c++', 'c语言', 'javascript', 'typescript', 'rust', 'golang', '前端', '后端', '数据库', 'sql', '算法', '数据结构', '设计模式', '面向对象', '函数', '变量', '循环', '数组', '链表', '递归', '排序', '二叉树', '哈希', '操作系统', '计算机网络', '编译', '编译器', 'linux', 'git', 'docker', '计算机', '软件', '架构', '软件开发', '需求', '项目管理', '软件测试', 'devops', '软件工程', '栈', '队列', '图论', '动态规划', 'dp', '二分', '回溯', '贪心', '搜索'] },
        { code: 'math', keywords: ['数学', '函数', '方程', '几何', '代数', '概率', '统计', '微积分', '线性代数', '导数', '积分', '三角', '向量', '矩阵', '数列', '不等式', '平面', '立体', '坐标系'] }
    ];

    for (const { code, keywords } of patterns) {
        if (keywords.some(kw => text.includes(kw))) return code;
    }

    return 'math'; // 默认数学
}

// 学科代码转中文标签
function subjectLabel(code) {
    const map = {
        math: '数学',
        physics: '物理',
        chemistry: '化学',
        biology: '生物',
        english: '英语',
        programming: '编程',
        software_engineering: '软件工程',
        computer: '计算机基础',
        'data-structure': '数据结构与算法',
        database: '数据库',
        network: '计算机网络',
        'software-engineering': '软件工程'
    };
    return map[code] || code || '未知学科';
}

// 难度值标准化
function normalizeDifficulty(dif) {
    if (!dif) return 'medium';
    const d = String(dif).toLowerCase().trim();
    if (d === 'easy' || d === '1' || d === '简单' || d === '基础') return 'easy';
    if (d === 'hard' || d === '3' || d === '困难' || d === '进阶' || d === '高级') return 'hard';
    return 'medium';
}

module.exports = {
    normalizeQuestionType,
    normalizeAnswerForCompare,
    difficultyLabel,
    masteryLevel,
    getQuestionTypeFromOptions,
    inferSubjectByName,
    subjectLabel,
    normalizeDifficulty
};
