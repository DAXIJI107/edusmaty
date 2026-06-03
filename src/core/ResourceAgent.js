// core/ResourceAgent.js
// 资源生成智能体 - 支持多种类型的个性化学习资源生成

class ResourceAgent {
    constructor(userId, pool) {
        this.userId = userId;
        this.pool = pool;
        this.resourceTypes = {
            document: this.generateDocument.bind(this),
            ppt: this.generatePptOutline.bind(this),
            quiz: this.generateQuiz.bind(this),
            video: this.generateVideo.bind(this),
            mindmap: this.generateMindMap.bind(this),
            reading: this.generateReading.bind(this),
            practice: this.generatePracticeCase.bind(this)
        };
    }

    async handleMessage(message) {
        console.log('ResourceAgent received message:', message);
        try {
            switch (message.type) {
                case 'generate':
                    return await this.generateResources(message.content);
                case 'get_types':
                    return this.getAvailableTypes();
                default:
                    throw new Error('Unsupported message type');
            }
        } catch (error) {
            console.error('ResourceAgent error:', error);
            return { error: error.message };
        }
    }

    getAvailableTypes() {
        return [
            { id: 'document', name: '课程讲解文档', description: '专业知识点详解文档' },
            { id: 'ppt', name: 'PPT大纲', description: '课堂演示型幻灯片大纲' },
            { id: 'quiz', name: '练习题目', description: '针对性练习题目生成' },
            { id: 'video', name: '教学视频', description: '知识点讲解视频推荐' },
            { id: 'mindmap', name: '思维导图', description: '知识结构思维导图' },
            { id: 'reading', name: '拓展阅读', description: '相关文献和扩展资料' },
            { id: 'practice', name: '实操案例', description: '代码实操和实践项目' }
        ];
    }

    async generateResources(params) {
        const { knowledgePoint, types = [], profile = {} } = params;
        
        if (!knowledgePoint) {
            return { success: false, error: '请指定知识点' };
        }

        const requestedTypes = types.length > 0 ? types : Object.keys(this.resourceTypes);
        const results = [];

        for (const type of requestedTypes) {
            if (this.resourceTypes[type]) {
                try {
                    const resource = await this.resourceTypes[type](knowledgePoint, profile);
                    results.push(resource);
                } catch (error) {
                    console.error(`生成${type}资源失败:`, error);
                    results.push({
                        type: type,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        return {
            success: true,
            knowledgePoint: knowledgePoint,
            resources: results
        };
    }

    async tableExists(tableName) {
        const [rows] = await this.pool.query('SHOW TABLES LIKE ?', [tableName]);
        return rows.length > 0;
    }

    async columnExists(tableName, columnName) {
        const [rows] = await this.pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
        return rows.length > 0;
    }

    async findKnowledge(knowledgePoint) {
        const keyword = `%${knowledgePoint}%`;
        if (await this.tableExists('knowledge_points')) {
            const [rows] = await this.pool.query(
                `SELECT id, title AS name, summary AS description, subject, source_url, source_name, mastery
                 FROM knowledge_points
                 WHERE title LIKE ? OR summary LIKE ? OR subject LIKE ?
                 ORDER BY
                    CASE WHEN title = ? THEN 0 WHEN title LIKE ? THEN 1 ELSE 2 END,
                    mastery ASC, id
                 LIMIT 1`,
                [keyword, keyword, keyword, knowledgePoint, keyword]
            );
            if (rows.length) return { ...rows[0], schema: 'new' };
        }

        if (await this.tableExists('knowledge_nodes')) {
            const [rows] = await this.pool.query(
                'SELECT id, name, description, subject, bvid, video_platform FROM knowledge_nodes WHERE name LIKE ? LIMIT 1',
                [keyword]
            );
            if (rows.length) return { ...rows[0], schema: 'legacy' };
        }

        return {
            id: null,
            name: knowledgePoint,
            description: `${knowledgePoint}的核心概念、应用场景与常见误区。`,
            subject: this.inferSubject(knowledgePoint),
            schema: 'fallback'
        };
    }

    inferSubject(text) {
        const source = String(text || '').toLowerCase();
        if (/python|javascript|java|node|编程|代码|函数|循环|变量/.test(source)) return '程序设计';
        if (/算法|数据结构|数组|链表|树|动态规划/.test(source)) return '数据结构与算法';
        if (/sql|mysql|redis|数据库/.test(source)) return '数据库';
        if (/网络|tcp|http|linux|操作系统/.test(source)) return '系统与网络';
        if (/ai|机器学习|深度学习|人工智能/.test(source)) return '人工智能';
        return '计算机科学';
    }

    async generateDocument(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);

        const cognitiveStyle = profile.cognitiveStyle?.type || 'visual';
        const depth = profile.learningPatterns?.学习速度 === 'slow' ? '详细版' : '标准版';

        return {
            type: 'document',
            title: `${knowledgePoint}知识点详解${depth}`,
            description: node?.description || `${knowledgePoint}的核心概念与应用`,
            content: await this.generateDocumentContent(knowledgePoint, node, cognitiveStyle),
            format: 'markdown',
            estimatedReadingTime: cognitiveStyle === 'slow' ? '15分钟' : '8分钟',
            relatedKnowledge: await this.getRelatedKnowledge(knowledgePoint)
        };
    }

    async generateDocumentContent(knowledgePoint, node, cognitiveStyle) {
        const content = `# ${knowledgePoint}\n\n` +
            `## 一、核心概念\n\n` +
            `${node?.description || '待补充详细说明'}\n\n` +
            `## 二、关键知识点\n\n` +
            `- 定义与内涵\n` +
            `- 核心原理\n` +
            `- 应用场景\n` +
            `- 常见误区\n\n` +
            `## 三、学习建议\n\n` +
            `${this.getLearningTips(cognitiveStyle)}\n\n` +
            `## 四、拓展阅读\n\n` +
            `推荐参考教材和学术论文...`;
        
        return content;
    }

    async generatePptOutline(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);
        const related = await this.getRelatedKnowledgeNames(knowledgePoint);
        const audience = profile.basicInfo?.major || node?.subject || this.inferSubject(knowledgePoint);
        const slides = [
            {
                title: `${knowledgePoint}学习目标`,
                subtitle: `面向${audience}的课堂导入`,
                bullets: [
                    `说清${knowledgePoint}的定义与使用边界`,
                    '建立从概念到案例的学习路线',
                    '用一个检查题确认理解程度'
                ],
                speakerNotes: `从学生已有经验切入，先问一个和${knowledgePoint}相关的真实问题。`
            },
            {
                title: '核心概念拆解',
                bullets: [
                    node?.description || `${knowledgePoint}的核心概念、应用场景与常见误区。`,
                    '关键术语：定义、输入输出、约束条件',
                    '判断标准：什么时候该用、什么时候不该用'
                ],
                speakerNotes: '用“定义-例子-反例”的节奏讲解，避免只背概念。'
            },
            {
                title: '知识结构图',
                bullets: [
                    '前置知识：基础语法、抽象思维、问题分解',
                    `关联知识：${related.slice(0, 3).join('、') || '典型例题、常见误区、项目实践'}`,
                    '后续迁移：练习题、项目任务、复盘笔记'
                ],
                speakerNotes: '这一页配合思维导图展示，强调知识之间的连接。'
            },
            {
                title: '课堂示例与推演',
                bullets: [
                    `选择一个${knowledgePoint}小案例`,
                    '先手算或口述流程，再落到代码/步骤',
                    '标出最容易出错的一步'
                ],
                speakerNotes: '教师边推演边停顿，让学生预测下一步。'
            },
            {
                title: '随堂练习',
                bullets: [
                    '基础题：识别概念或判断正误',
                    '进阶题：解释一个边界情况',
                    '实践题：完成一个最小可运行任务'
                ],
                speakerNotes: '练习完成后收集错误类型，为下一轮补救资源提供证据。'
            },
            {
                title: '总结与课后任务',
                bullets: [
                    `用一句话复述${knowledgePoint}`,
                    '整理一张主动回忆卡',
                    '完成实操案例并记录问题'
                ],
                speakerNotes: '收束到可提交产物，方便系统跟踪学习闭环。'
            }
        ];

        return {
            type: 'ppt',
            title: `${knowledgePoint}课堂PPT大纲`,
            description: `已生成${slides.length}页课堂讲解型幻灯片结构`,
            slides,
            format: 'outline',
            audience,
            estimatedDuration: '20-30分钟'
        };
    }

    getLearningTips(cognitiveStyle) {
        const tips = {
            visual: '建议配合思维导图和图示进行学习，可视化有助于理解抽象概念。',
            auditory: '建议结合讲解视频或有声读物，通过听觉加深记忆。',
            kinesthetic: '建议通过实践练习和案例操作来巩固知识点。'
        };
        return tips[cognitiveStyle] || tips.visual;
    }

    async generateQuiz(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);

        let difficulty = 'medium';
        if (profile.knowledgeBase?.[knowledgePoint] > 0.7) {
            difficulty = 'hard';
        } else if (profile.knowledgeBase?.[knowledgePoint] < 0.3) {
            difficulty = 'easy';
        }

        let questions = [];
        if (await this.tableExists('questions')) {
            const hasKnowledgeId = await this.columnExists('questions', 'knowledge_id');
            const hasNodeId = await this.columnExists('questions', 'node_id');
            const hasQuestion = await this.columnExists('questions', 'question');
            const hasContent = await this.columnExists('questions', 'content');
            const activeFilter = await this.columnExists('questions', 'is_active') ? 'AND COALESCE(is_active, 1) = 1' : '';
            if (hasKnowledgeId && node.id) {
                const [rows] = await this.pool.query(
                    `SELECT id,
                            ${hasQuestion ? 'question' : 'content'} AS content,
                            'single' AS type,
                            options_json AS options,
                            correct_answer AS answer,
                            5 AS score
                     FROM questions
                     WHERE knowledge_id = ? AND (difficulty = ? OR difficulty IS NULL) ${activeFilter}
                     ORDER BY RAND() LIMIT 5`,
                    [node.id, difficulty]
                );
                questions = rows;
            } else if (hasNodeId && hasContent && node.id) {
                const [rows] = await this.pool.query(
                    `SELECT id, content, type, options, answer, score
                     FROM questions
                     WHERE node_id = ? AND (difficulty = ? OR difficulty IS NULL) ${activeFilter}
                     ORDER BY RAND() LIMIT 5`,
                    [node.id, difficulty]
                );
                questions = rows;
            }
        }

        if (questions.length === 0) {
            return {
                type: 'quiz',
                title: `${knowledgePoint}专项练习`,
                description: '暂无匹配题目，已生成示例题目',
                questions: this.generateMockQuestions(knowledgePoint, difficulty),
                difficulty: difficulty,
                totalQuestions: 5
            };
        }

        return {
            type: 'quiz',
            title: `${knowledgePoint}专项练习`,
            description: `共${questions.length}道${difficulty === 'easy' ? '基础' : difficulty === 'medium' ? '中等' : '困难'}难度题目`,
            questions: questions,
            difficulty: difficulty,
            totalQuestions: questions.length
        };
    }

    generateMockQuestions(knowledgePoint, difficulty) {
        const difficultyLabel = difficulty === 'easy' ? '基础' : difficulty === 'medium' ? '中等' : '困难';
        return [
            {
                id: -1,
                type: 'single',
                content: `关于「${knowledgePoint}」，下列说法正确的是？`,
                options: JSON.stringify(['选项A', '选项B', '选项C', '选项D']),
                answer: '选项A',
                score: 5
            },
            {
                id: -2,
                type: 'judge',
                content: `「${knowledgePoint}」是${difficultyLabel}难度知识点。`,
                options: JSON.stringify(['正确', '错误']),
                answer: '正确',
                score: 5
            },
            {
                id: -3,
                type: 'single',
                content: `「${knowledgePoint}」的核心特点是什么？`,
                options: JSON.stringify(['特点A', '特点B', '特点C', '特点D']),
                answer: '特点A',
                score: 5
            }
        ];
    }

    async generateVideo(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);

        const videos = [];
        if (node?.bvid) {
            videos.push({
                title: `${node.name}讲解视频`,
                url: `https://www.bilibili.com/video/${node.bvid}`,
                platform: 'bilibili',
                duration: '约15分钟'
            });
        }

        videos.push({
            title: `${knowledgePoint}核心概念速讲`,
            url: node?.source_url || `/course-detail?knowledgeId=${node?.id || ''}`,
            platform: '平台内课程',
            duration: '约10分钟'
        });

        return {
            type: 'video',
            title: `${knowledgePoint}视频资源`,
            description: `找到${videos.length}个相关视频资源`,
            videos: videos,
            recommendedDuration: profile.learningPatterns?.注意力持续时间 || 30
        };
    }

    async generateMindMap(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);

        const mindmap = {
            root: knowledgePoint,
            children: [
                {
                    name: '核心概念',
                    children: ['定义', '特点', '原理']
                },
                {
                    name: '相关知识点',
                    children: await this.getRelatedKnowledgeNames(knowledgePoint)
                },
                {
                    name: '应用场景',
                    children: ['场景1', '场景2', '场景3']
                },
                {
                    name: '学习路径',
                    children: ['基础', '进阶', '实践']
                }
            ]
        };

        return {
            type: 'mindmap',
            title: `${knowledgePoint}知识结构图`,
            description: '基于知识点关联自动生成的学习路径图',
            mindmap: mindmap,
            nodeId: node?.id
        };
    }

    async getRelatedKnowledgeNames(knowledgePoint) {
        const node = await this.findKnowledge(knowledgePoint);
        if (node.schema === 'new' && await this.tableExists('knowledge_points')) {
            const [nodes] = await this.pool.query(
                'SELECT title AS name FROM knowledge_points WHERE subject = ? AND title <> ? ORDER BY mastery ASC, id LIMIT 5',
                [node.subject, node.name]
            );
            return nodes.map(n => n.name);
        }
        if (await this.tableExists('knowledge_nodes')) {
            const [nodes] = await this.pool.query(
                'SELECT name FROM knowledge_nodes WHERE subject IN (SELECT subject FROM knowledge_nodes WHERE name LIKE ?) LIMIT 5',
                [`%${knowledgePoint}%`]
            );
            return nodes.map(n => n.name).filter(n => n !== knowledgePoint);
        }
        return ['前置概念', '典型例题', '常见误区', '项目实践'];
    }

    async generateReading(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);
        const subject = node.subject || this.inferSubject(knowledgePoint);

        const readingList = [
            {
                title: `${knowledgePoint}深度解析`,
                type: '学术论文',
                source: 'CNKI',
                relevance: 'high'
            },
            {
                title: `${knowledgePoint}入门到精通`,
                type: '教材章节',
                source: '高等教育出版社',
                relevance: 'medium'
            },
            {
                title: `${knowledgePoint}最新研究进展`,
                type: '综述文章',
                source: 'ResearchGate',
                relevance: 'medium'
            },
            {
                title: `${knowledgePoint}常见问题解答`,
                type: '技术博客',
                source: 'CSDN',
                relevance: 'low'
            }
        ];

        return {
            type: 'reading',
            title: `${knowledgePoint}拓展阅读`,
            description: `为您推荐${readingList.length}篇相关阅读材料`,
            readings: readingList,
            subject: subject
        };
    }

    async generatePracticeCase(knowledgePoint, profile) {
        const node = await this.findKnowledge(knowledgePoint);

        let cases = [];
        
        if (/programming|程序|编程|Python|JavaScript|Java|代码|函数|循环/i.test(`${node?.subject || ''} ${knowledgePoint}`)) {
            cases = [
                {
                    title: `${knowledgePoint}基础实践`,
                    type: '代码示例',
                    difficulty: 'easy',
                    estimatedTime: '30分钟',
                    content: `# ${knowledgePoint}实践案例\n\n## 目标\n学习${knowledgePoint}的基本用法\n\n## 步骤\n1. 环境准备\n2. 基础实现\n3. 进阶优化\n\n## 代码框架\n\`\`\`python\n# 在这里编写代码\n\`\`\``
                },
                {
                    title: `${knowledgePoint}综合项目`,
                    type: '项目实战',
                    difficulty: 'hard',
                    estimatedTime: '2小时',
                    content: `# ${knowledgePoint}综合项目\n\n## 项目描述\n基于${knowledgePoint}实现完整功能\n\n## 需求分析\n...`
                }
            ];
        } else {
            cases = [
                {
                    title: `${knowledgePoint}应用题解`,
                    type: '例题解析',
                    difficulty: 'medium',
                    estimatedTime: '15分钟',
                    content: `# ${knowledgePoint}例题详解\n\n## 题目描述\n...\n\n## 解题思路\n...\n\n## 答案解析\n...`
                },
                {
                    title: `${knowledgePoint}实验报告`,
                    type: '实验指导',
                    difficulty: 'hard',
                    estimatedTime: '1小时',
                    content: `# ${knowledgePoint}实验报告\n\n## 实验目的\n...\n\n## 实验步骤\n...\n\n## 数据记录\n...`
                }
            ];
        }

        return {
            type: 'practice',
            title: `${knowledgePoint}实操案例`,
            description: `为您推荐${cases.length}个实践项目`,
            cases: cases,
            subject: node?.subject
        };
    }

    async getRelatedKnowledge(knowledgePoint) {
        return (await this.getRelatedKnowledgeNames(knowledgePoint)).slice(0, 3);
    }
}

module.exports = ResourceAgent;
