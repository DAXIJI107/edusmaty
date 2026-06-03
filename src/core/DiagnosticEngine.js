// core/DiagnosticEngine.js
// 新生学习诊断引擎 - 支持输入式诊断 + 结构化问卷

const { masteryLevel } = require('./SubjectUtils');

class DiagnosticEngine {
    constructor(pool) {
        this.pool = pool;
    }

    getQuestionnaire() {
        return {
            id: 'new_user_diagnostic_v2',
            title: '新生学习诊断',
            description: '通过几个简单问题，帮你生成专属学习画像和路径建议',
            estimatedMinutes: 5,
            steps: [
                {
                    id: 'step_basic',
                    title: '基本信息',
                    icon: 'user',
                    description: '先了解一下你的基本情况',
                    questions: [
                        { id: 'q_major', type: 'single_choice', label: '你的专业方向是什么？', options: [
                            { value: 'computer', label: '计算机科学 / 软件工程' },
                            { value: 'math', label: '数学 / 统计' },
                            { value: 'engineering', label: '电子信息 / 机械 / 土木等工科' },
                            { value: 'science', label: '物理 / 化学 / 生物等理科' },
                            { value: 'finance', label: '金融 / 经济学 / 管理' },
                            { value: 'other', label: '其他专业' }
                        ] },
                        { id: 'q_year', type: 'single_choice', label: '你目前的年级？', options: [
                            { value: 'freshman', label: '大一' },
                            { value: 'sophomore', label: '大二' },
                            { value: 'junior', label: '大三' },
                            { value: 'senior', label: '大四' },
                            { value: 'graduate', label: '研究生及以上' },
                            { value: 'other', label: '其他 / 已毕业' }
                        ] },
                        { id: 'q_goals', type: 'multi_choice', label: '你当前的学习目标？（可多选）', options: [
                            { value: 'exam_prep', label: '考研 / 升学考试' },
                            { value: 'job_hunt', label: '找工作 / 提升就业竞争力' },
                            { value: 'skill_up', label: '提升专业技能 / 考证' },
                            { value: 'grade_up', label: '提升课程成绩' },
                            { value: 'interest', label: '兴趣驱动 / 拓展知识面' }
                        ] }
                    ]
                },
                {
                    id: 'step_style',
                    title: '学习风格',
                    icon: 'brain',
                    description: '了解你的学习偏好，智能匹配内容形式',
                    questions: [
                        { id: 'q_learn_prefer', type: 'single_choice', label: '学习新知识时，哪种方式让你最容易理解？', options: [
                            { value: 'visual', label: '看视频、图表、动画演示' },
                            { value: 'auditory', label: '听讲解、播客、讨论交流' },
                            { value: 'reading', label: '阅读教材、文档、做笔记' },
                            { value: 'kinesthetic', label: '动手操作、做实验、写代码' }
                        ] },
                        { id: 'q_review_habit', type: 'single_choice', label: '复习时你最常做什么？', options: [
                            { value: 'visual', label: '画思维导图、看笔记总结' },
                            { value: 'auditory', label: '复述讲解、录音回顾' },
                            { value: 'reading', label: '反复阅读、整理重点' },
                            { value: 'kinesthetic', label: '刷题练习、做项目验证' }
                        ] }
                    ]
                },
                {
                    id: 'step_habits',
                    title: '学习习惯',
                    icon: 'clock',
                    description: '了解你的学习节奏和习惯',
                    questions: [
                        { id: 'q_daily_time', type: 'single_choice', label: '你每天能投入多少时间学习？', options: [
                            { value: 'lt_30', label: '不到 30 分钟', meta: { minutes: 20 } },
                            { value: '30_60', label: '30 - 60 分钟', meta: { minutes: 45 } },
                            { value: '60_120', label: '1 - 2 小时', meta: { minutes: 90 } },
                            { value: '120_180', label: '2 - 3 小时', meta: { minutes: 150 } },
                            { value: 'gt_180', label: '3 小时以上', meta: { minutes: 210 } }
                        ] },
                        { id: 'q_best_time', type: 'single_choice', label: '你觉得哪个时段学习效率最高？', options: [
                            { value: 'morning', label: '早晨 / 上午' },
                            { value: 'afternoon', label: '下午' },
                            { value: 'evening', label: '晚上' },
                            { value: 'night', label: '深夜' }
                        ] },
                        { id: 'q_attention', type: 'single_choice', label: '一次能持续专注多长时间？', options: [
                            { value: 'lt_15', label: '不到 15 分钟' },
                            { value: '15_30', label: '15 - 30 分钟' },
                            { value: '30_60', label: '30 - 60 分钟' },
                            { value: '60_120', label: '1 - 2 小时' }
                        ] }
                    ]
                },
                {
                    id: 'step_self_assess',
                    title: '能力自评',
                    icon: 'chart',
                    description: '快速评估你的当前知识基础',
                    questions: [
                        { id: 'q_math_level', type: 'scale', label: '请自评你的数学/逻辑基础', min: 1, max: 5 },
                        { id: 'q_cs_level', type: 'scale', label: '请自评你的计算机/编程基础', min: 1, max: 5 },
                        { id: 'q_eng_level', type: 'scale', label: '请自评你的英语水平', min: 1, max: 5 },
                        { id: 'q_self_discipline', type: 'scale', label: '请自评你的自学能力和自律性', min: 1, max: 5 }
                    ]
                },
                {
                    id: 'step_motivation',
                    title: '目标与动机',
                    icon: 'target',
                    description: '最后，说说你的期待',
                    questions: [
                        { id: 'q_motivation', type: 'single_choice', label: '驱动你学习的主要动力是什么？', options: [
                            { value: 'intrinsic', label: '对知识本身的好奇和热爱' },
                            { value: 'career', label: '明确的职业规划和目标' },
                            { value: 'score', label: '考试成绩和排名压力' },
                            { value: 'self_improve', label: '自我提升和成长的需要' }
                        ] },
                        { id: 'q_path_prefer', type: 'single_choice', label: '你希望的学习路径节奏？', options: [
                            { value: 'intensive', label: '高强度冲刺，快速见效' },
                            { value: 'steady', label: '稳步推进，打好基础' },
                            { value: 'flexible', label: '灵活安排，随学随用' },
                            { value: 'guided', label: '希望有老师/导师全程指导' }
                        ] }
                    ]
                }
            ]
        };
    }

    async processDiagnostic(answers = {}, freeText = '', userId = null) {
        const profile = this.buildProfile(answers, freeText);
        const analysis = this.analyzeProfile(profile, answers);
        const recommendations = this.generateRecommendations(profile, analysis, answers);
        const result = {
            profile,
            analysis,
            recommendations,
            radarData: this.buildRadarData(profile, analysis),
            persona: analysis.persona,
            summary: analysis.summary
        };
        if (userId) await this.saveDiagnosticResult(userId, answers, result);
        return result;
    }

    buildProfile(answers, freeText) {
        return {
            version: 2,
            basicInfo: this.buildBasicInfo(answers),
            knowledgeBase: this.buildKnowledgeBase(answers),
            cognitiveStyle: this.buildCognitiveStyle(answers),
            learningPatterns: this.buildLearningPatterns(answers),
            emotionalTraits: this.buildEmotionalTraits(answers),
            multimodalPreferences: this.buildMultimodalPreferences(answers),
            learningContext: {
                preferredEnvironment: answers.q_environment || 'quiet',
                devicePreference: 'desktop',
                socialLearning: answers.q_environment === 'group'
            },
            freeText,
            updatedAt: new Date().toISOString()
        };
    }

    buildBasicInfo(answers) {
        const majorMap = {
            computer: '计算机科学与技术',
            math: '数学',
            engineering: '电子工程',
            science: '理科',
            finance: '金融学',
            other: ''
        };
        const goalMap = {
            exam_prep: '考研',
            job_hunt: '就业',
            skill_up: '提升技能',
            grade_up: '提升成绩',
            interest: '兴趣探索'
        };
        const goals = Array.isArray(answers.q_goals) ? answers.q_goals : (answers.q_goals ? [answers.q_goals] : []);
        return {
            major: majorMap[answers.q_major] || '',
            year: answers.q_year || '',
            learningGoals: goals.map(g => goalMap[g] || g),
            interests: [],
            skills: []
        };
    }

    buildCognitiveStyle(answers) {
        const styles = [answers.q_learn_prefer, answers.q_review_habit, answers.q_memory_style].filter(Boolean);
        const counts = {};
        styles.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
        const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'visual';
        return {
            type: dominant,
            preference: styles.length >= 2 && new Set(styles).size >= 3 ? 'balanced' : 'focused',
            processingSpeed: ['lt_15', '15_30'].includes(answers.q_attention) ? 'fast' : 'medium'
        };
    }

    buildLearningPatterns(answers) {
        const attnMap = { lt_15: 10, '15_30': 22, '30_60': 45, '60_120': 75 };
        return {
            易错知识点: [],
            学习速度: answers.q_path_prefer === 'intensive' ? 'fast' : answers.q_path_prefer === 'guided' ? 'slow' : 'medium',
            注意力持续时间: attnMap[answers.q_attention] || 30,
            最佳学习时间: answers.q_best_time || 'morning',
            学习习惯: []
        };
    }

    buildEmotionalTraits(answers) {
        const discipline = Number(answers.q_self_discipline || 3);
        return {
            学习韧性: Math.min(1, Math.max(0.2, discipline * 0.2)),
            焦虑水平: answers.q_motivation === 'score' ? 0.55 : 0.3,
            动机水平: answers.q_motivation === 'intrinsic' ? 0.9 : answers.q_motivation === 'career' ? 0.85 : 0.7,
            stressResistance: Math.min(1, discipline * 0.22)
        };
    }

    buildMultimodalPreferences(answers) {
        const style = answers.q_learn_prefer || 'visual';
        return {
            视觉: style === 'visual' ? 0.9 : 0.5,
            听觉: style === 'auditory' ? 0.9 : 0.5,
            触觉: style === 'kinesthetic' ? 0.9 : 0.4,
            阅读: style === 'reading' ? 0.9 : 0.55,
            互动: 0.5
        };
    }

    buildKnowledgeBase(answers) {
        return {
            '数学基础': Number(answers.q_math_level || 3) * 0.2,
            '编程基础': Number(answers.q_cs_level || 2) * 0.2,
            '英语能力': Number(answers.q_eng_level || 3) * 0.2
        };
    }

    analyzeProfile(profile, answers) {
        const discipline = Number(answers.q_self_discipline || 3);
        const dailyMinutes = this.minutesFromOption(answers.q_daily_time);
        const persona = this.classifyPersona(answers, discipline, dailyMinutes);
        const dimensionScores = this.calcDimensionScores(answers, discipline, dailyMinutes);
        return {
            persona: persona.primary,
            personaTag: persona.tag,
            score: this.calcFitScore(answers),
            dimensionScores,
            summary: {
                dailyStudyMinutes: dailyMinutes,
                recommendedDailyMinutes: dailyMinutes >= 60 ? Math.round(dailyMinutes * 1.3) : Math.round(dailyMinutes * 1.6),
                attentionMinutes: profile.learningPatterns.注意力持续时间,
                bestStudyTime: answers.q_best_time || 'morning',
                selfDiscipline: discipline,
                readinessLevel: discipline >= 4 ? '高' : discipline >= 2 ? '中' : '低',
                suggestedIntensity: answers.q_path_prefer || 'steady'
            }
        };
    }

    classifyPersona(answers, discipline, dailyMinutes) {
        if (answers.q_path_prefer === 'intensive' && discipline >= 4) return { primary: '冲刺突破型', tag: '高投入·快节奏' };
        if (answers.q_motivation === 'career' && ['computer', 'engineering', 'finance'].includes(answers.q_major)) return { primary: '职业导向型', tag: '目标明确·技能驱动' };
        if (discipline <= 2 && dailyMinutes < 30) return { primary: '起步探索型', tag: '低投入·待激活' };
        if (answers.q_learn_prefer === 'kinesthetic') return { primary: '实践成长型', tag: '动手实践·项目驱动' };
        if (answers.q_motivation === 'intrinsic') return { primary: '兴趣驱动型', tag: '好奇心导向·广度优先' };
        if (answers.q_path_prefer === 'steady') return { primary: '稳步积累型', tag: '循序渐进·扎实基础' };
        return { primary: '均衡发展型', tag: '多维探索·灵活适配' };
    }

    calcFitScore(answers) {
        const discipline = Number(answers.q_self_discipline || 3);
        const math = Number(answers.q_math_level || 3);
        const cs = Number(answers.q_cs_level || 2);
        const eng = Number(answers.q_eng_level || 3);
        let score = 50 + (discipline - 3) * 6 + (math - 3) * 4 + (cs - 3) * 4 + (eng - 3) * 3;
        if (answers.q_path_prefer === 'intensive') score += 5;
        if (answers.q_motivation === 'intrinsic' || answers.q_motivation === 'career') score += 8;
        return Math.min(96, Math.max(30, score));
    }

    calcDimensionScores(answers, discipline, dailyMinutes) {
        const math = Number(answers.q_math_level || 3);
        const cs = Number(answers.q_cs_level || 2);
        const eng = Number(answers.q_eng_level || 3);
        return {
            概念理解: Math.round(math * 20),
            实践能力: Math.round(cs * 20),
            学习持续: Math.min(95, Math.round(discipline * 19)),
            执行效率: Math.min(90, Math.round((discipline + (dailyMinutes >= 90 ? 1 : 0)) * 18)),
            迁移应用: Math.round((math + cs) * 12),
            语言基础: Math.round(eng * 18)
        };
    }

    buildRadarData(profile, analysis) {
        const ds = analysis.dimensionScores || {};
        return {
            labels: ['概念理解', '实践能力', '学习持续', '执行效率', '迁移应用', '语言基础'],
            datasets: [{
                label: '诊断画像',
                data: [ds.概念理解 || 50, ds.实践能力 || 40, ds.学习持续 || 50, ds.执行效率 || 50, ds.迁移应用 || 45, ds.语言基础 || 50],
                backgroundColor: 'rgba(95,88,238,0.15)',
                borderColor: '#5f58ee'
            }]
        };
    }

    generateRecommendations(profile, analysis, answers) {
        const path = this.matchLearningPath(answers);
        const minutes = analysis.summary?.dailyStudyMinutes || 60;
        const recs = [
            path,
            {
                type: 'daily_plan',
                title: '每日学习方案',
                description: `建议安排 ${Math.max(1, Math.floor(minutes / (analysis.summary?.attentionMinutes || 30)))} 个学习块。`,
                action: '查看详细日程',
                target: 'daily_schedule',
                priority: 'medium',
                reason: '匹配你的注意力时长和总投入时间'
            },
            this.recommendResources(answers)
        ];
        if (Number(answers.q_self_discipline || 3) <= 2) {
            recs.push({ type: 'habit', title: '习惯养成计划', description: '从每天专注15分钟开始，逐步建立学习节奏', action: '开始 21 天挑战', target: 'study_habit', priority: 'high', reason: '自评自律性偏低' });
        }
        return recs;
    }

    matchLearningPath(answers) {
        const map = {
            computer: ['计算机核心能力路径', ['数据结构与算法', '计算机网络', '操作系统', '数据库系统'], '数据结构 → 网络 → OS → 数据库 → 项目实战'],
            math: ['数学深度学习路径', ['高等数学', '线性代数', '概率统计', '数学建模'], '高数回顾 → 线代强化 → 概率统计 → 建模实战'],
            engineering: ['工程能力提升路径', ['电路分析', '信号处理', '嵌入式开发', '控制系统'], '理论复习 → 实验验证 → 项目设计'],
            other: ['通用能力提升路径', ['逻辑思维', '高效学习', '沟通表达', '项目管理'], '认知提升 → 方法优化 → 技能练习']
        };
        const [title, subjects, stack] = map[answers.q_major] || map.other;
        const discipline = Number(answers.q_self_discipline || 3);
        const weeks = discipline >= 3 ? 4 : 8;
        return {
            type: 'learning_path',
            title,
            description: `推荐 ${weeks} 周路径：${stack}`,
            subjects,
            weeks,
            action: '生成详细计划',
            target: 'path',
            priority: 'high',
            reason: '根据你的专业方向匹配'
        };
    }

    recommendResources(answers) {
        const style = answers.q_learn_prefer || 'visual';
        const resourceMap = {
            visual: ['视频+图解学习包', '精选视频课程 × 思维导图 × 知识卡片'],
            auditory: ['音频+讨论学习包', '播客讲解 × 讨论引导 × 语音笔记'],
            reading: ['文档+笔记学习包', '精选教材 × 结构化笔记 × 阅读理解'],
            kinesthetic: ['实践+项目学习包', '交互练习 × 编程项目 × 动手实验']
        };
        const resource = resourceMap[style] || resourceMap.visual;
        return {
            type: 'resource',
            title: resource[0],
            description: resource[1],
            action: '获取推荐资源',
            target: 'resources',
            priority: 'medium',
            reason: '根据你的学习风格匹配'
        };
    }

    async quickDiagnose(text, userId = null) {
        const features = this.extractFromText(text);
        const answers = this.textToAnswers(features);
        return this.processDiagnostic(answers, text, userId);
    }

    extractFromText(text) {
        const features = {};
        if (/计算机|软件|编程|cs|代码|算法/i.test(text)) features.major = 'computer';
        else if (/数学|统计|math/i.test(text)) features.major = 'math';
        else if (/电子|机械|土木|工程/i.test(text)) features.major = 'engineering';
        const goals = [];
        if (/考研|升学|研究生/i.test(text)) goals.push('exam_prep');
        if (/就业|工作|找工|面试/i.test(text)) goals.push('job_hunt');
        if (/技能|考证|证书/i.test(text)) goals.push('skill_up');
        features.goals = goals;
        if (/视频|看|图|可视化|图解/i.test(text)) features.learnStyle = 'visual';
        else if (/听|讲|讨论|播客|语音/i.test(text)) features.learnStyle = 'auditory';
        else if (/读|笔记|教材|文档|书/i.test(text)) features.learnStyle = 'reading';
        else if (/做|实践|动手|练|写|项目|代码/i.test(text)) features.learnStyle = 'kinesthetic';
        const match = text.match(/(\d+)\s*(分钟|小时)/);
        if (match) features.dailyMinutes = match[2] === '小时' ? Number(match[1]) * 60 : Number(match[1]);
        if (/自律|坚持|专注|规律/i.test(text)) features.discipline = 4;
        else if (/拖延|分心|不自律/i.test(text)) features.discipline = 2;
        if (/快|冲刺|短期|急|马上/i.test(text)) features.pace = 'intensive';
        else if (/稳|基础|打牢|系统|全面/i.test(text)) features.pace = 'steady';
        return features;
    }

    textToAnswers(features) {
        return {
            q_major: features.major || 'other',
            q_year: features.year || 'other',
            q_goals: features.goals || ['skill_up'],
            q_learn_prefer: features.learnStyle || 'visual',
            q_review_habit: features.learnStyle || 'visual',
            q_memory_style: features.learnStyle || 'visual',
            q_daily_time: this.minutesToTimeOption(features.dailyMinutes || 60),
            q_best_time: 'evening',
            q_environment: 'quiet_alone',
            q_attention: '30_60',
            q_math_level: 3,
            q_cs_level: features.major === 'computer' ? 3 : 2,
            q_eng_level: 3,
            q_self_discipline: features.discipline || 3,
            q_motivation: 'self_improve',
            q_path_prefer: features.pace || 'steady'
        };
    }

    minutesFromOption(value) {
        const map = { lt_30: 20, '30_60': 45, '60_120': 90, '120_180': 150, gt_180: 210 };
        return map[value] || 60;
    }

    minutesToTimeOption(minutes) {
        if (minutes < 30) return 'lt_30';
        if (minutes <= 60) return '30_60';
        if (minutes <= 120) return '60_120';
        if (minutes <= 180) return '120_180';
        return 'gt_180';
    }

    async saveDiagnosticResult(userId, answers, result) {
        try {
            await this.pool.query(
                `INSERT INTO diagnostic_results
                 (user_id, questionnaire_id, answers_json, profile_json, analysis_json, recommendations_json, radar_json)
                 VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON))`,
                [userId, 'new_user_diagnostic_v2', JSON.stringify(answers), JSON.stringify(result.profile), JSON.stringify(result.analysis), JSON.stringify(result.recommendations), JSON.stringify(result.radarData)]
            );
            await this.pool.query(
                `INSERT INTO student_profiles (user_id, profile_json, version, updated_at)
                 VALUES (?, ?, 1, NOW())
                 ON DUPLICATE KEY UPDATE profile_json = VALUES(profile_json), version = version + 1, updated_at = NOW()`,
                [userId, JSON.stringify(result.profile)]
            );
        } catch (error) {
            console.error('保存诊断结果失败:', error);
        }
    }

    async getLatestResult(userId) {
        try {
            const [rows] = await this.pool.query('SELECT * FROM diagnostic_results WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
            if (!rows.length) return null;
            return {
                answers: this.parseJson(rows[0].answers_json),
                profile: this.parseJson(rows[0].profile_json),
                analysis: this.parseJson(rows[0].analysis_json),
                recommendations: this.parseJson(rows[0].recommendations_json),
                radarData: this.parseJson(rows[0].radar_json),
                createdAt: rows[0].created_at
            };
        } catch (error) {
            console.error('获取诊断结果失败:', error);
            return null;
        }
    }

    parseJson(value) {
        if (!value || typeof value !== 'string') return value;
        try { return JSON.parse(value); } catch (e) { return value; }
    }

    async saveSubjectDiagnosticResult(userId, subject, answers, gradedQuestions, analysis) {
        try {
            await this.pool.query(
                `INSERT INTO diagnostic_results
                 (user_id, questionnaire_id, answers_json, profile_json, analysis_json, recommendations_json, radar_json)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, `subject_${subject}`, JSON.stringify({ subject, answers }), JSON.stringify(analysis.profile || {}), JSON.stringify(analysis), JSON.stringify(analysis.recommendations || []), JSON.stringify(analysis.radarData || [])]
            );
        } catch (error) {
            console.error('保存学科诊断结果失败:', error);
        }
    }

    analyzeSubjectResults(subject, gradedQuestions, accuracy) {
        const nodeMap = {};
        gradedQuestions.forEach(q => {
            const nid = q.nodeId || 'unknown';
            if (!nodeMap[nid]) nodeMap[nid] = { nodeId: nid, total: 0, correct: 0, questions: [] };
            nodeMap[nid].total += 1;
            if (q.correct) nodeMap[nid].correct += 1;
            nodeMap[nid].questions.push(q);
        });
        const nodeResults = Object.values(nodeMap).map(n => ({
            nodeId: n.nodeId,
            nodeName: (n.questions[0] && n.questions[0].nodeName) || n.nodeId,
            total: n.total,
            correct: n.correct,
            accuracy: Math.round((n.correct / n.total) * 100)
        }));
        const weakNodes = nodeResults.filter(n => n.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
        const strongNodes = nodeResults.filter(n => n.accuracy >= 75).sort((a, b) => b.accuracy - a.accuracy);
        const master = masteryLevel(accuracy);
        const recommendations = weakNodes.length ? [{
            priority: 'high',
            title: `${subject}薄弱知识点`,
            detail: `建议优先复习：${weakNodes.map(n => n.nodeName).join('、')}`,
            action: '专项练习'
        }] : [];
        recommendations.push({
            priority: accuracy >= 70 ? 'low' : 'medium',
            title: accuracy >= 70 ? '进阶挑战' : '基础巩固',
            detail: accuracy >= 70 ? '表现不错，可以挑战更高难度的试题检验水平' : '建议从基础题型开始，逐步提升难度',
            action: accuracy >= 70 ? '智能组卷' : '基础练习'
        });
        const radarData = nodeResults.map(n => ({ name: n.nodeName, value: n.accuracy, fullMark: 100 }));
        const profile = this.classifySubjectProfile(subject, accuracy, nodeResults);
        return {
            subject,
            accuracy,
            mastery: master,
            nodeResults,
            weakNodes,
            strongNodes,
            rootCause: weakNodes.length ? `在${subject}学科中，${weakNodes.map(n => n.nodeName).join('、')}等知识点掌握不足` : `在${subject}学科中表现良好，各知识点掌握较为均衡`,
            recommendations,
            radarData,
            profile,
            gradedQuestions
        };
    }

    classifySubjectProfile(subject, accuracy, nodeResults) {
        const strongRatio = nodeResults.filter(n => n.accuracy >= 75).length / Math.max(1, nodeResults.length);
        if (accuracy >= 85 && strongRatio >= 0.7) return { subject, personaLabel: '学科先锋', personaDescription: `在${subject}中表现优异，多个知识点掌握牢固，具备较强的学科能力`, level: 4 };
        if (accuracy >= 70 && strongRatio >= 0.5) return { subject, personaLabel: '稳健进取型', personaDescription: `${subject}基础扎实，部分知识点还需巩固`, level: 3 };
        if (accuracy >= 50) return { subject, personaLabel: '均衡发展型', personaDescription: `${subject}各知识点发展较为均衡，持续练习可稳步提升`, level: 2 };
        if (accuracy >= 30) return { subject, personaLabel: '基础建设型', personaDescription: `${subject}基础需要加强，建议从核心知识点开始系统学习`, level: 1 };
        return { subject, personaLabel: '起步探索型', personaDescription: `${subject}刚刚起步，需要从头建立知识体系`, level: 0 };
    }
}

module.exports = DiagnosticEngine;
