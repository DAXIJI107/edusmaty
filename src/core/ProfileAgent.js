// core/ProfileAgent.js
// 学习画像智能体 - 支持多模态输入，自然语言特征抽取

class ProfileAgent {
    constructor(userId, pool) {
        this.userId = userId;
        this.pool = pool;
        this.profile = null;
        this.knowledgeMappings = null;
    }

    async loadKnowledgeMappings() {
        if (this.knowledgeMappings) return this.knowledgeMappings;
        try {
            const [rows] = await this.pool.query(
                'SELECT id, name, subject, difficulty, type FROM knowledge_nodes WHERE is_active = 1'
            );
            this.knowledgeMappings = rows;
        } catch (_) {
            this.knowledgeMappings = [];
        }
        return this.knowledgeMappings;
    }

    normalizeMajorName(rawMajor = '') {
        const text = String(rawMajor || '')
            .replace(/[，。,.；;：:、\n\r\t]/g, ' ')
            .replace(/^(我是|我学|学的是|专业是|目前是|本人|一个|一名|学生|大学生)+/g, '')
            .replace(/(的学生|学生|本科|研究生|硕士|博士|方向|专业)$/g, '')
            .trim();
        if (!text) return '';

        const aliases = [
            { pattern: /(软件工程|software\s*engineering)/i, major: '软件工程' },
            { pattern: /(计算机科学与技术|计算机|cs|computer\s*science)/i, major: '计算机科学与技术' },
            { pattern: /(艺术设计|视觉传达|环境设计|产品设计|数字媒体艺术|设计学|design)/i, major: '艺术设计' },
            { pattern: /(数学与应用数学|数学|math)/i, major: '数学' },
            { pattern: /(工商管理|管理|management)/i, major: '管理工程' },
            { pattern: /(英语|english)/i, major: '英语' },
            { pattern: /(物理学|物理|physics)/i, major: '物理学' },
            { pattern: /(化学工程与工艺|应用化学|化学|chemistry)/i, major: '化学' },
            { pattern: /(生物科学|生物工程|生物|biology)/i, major: '生物学' },
            { pattern: /(电子信息|电子工程|电子|electronics)/i, major: '电子工程' },
            { pattern: /(机械工程|机械|mechanical)/i, major: '机械工程' },
            { pattern: /(土木工程|土木|civil)/i, major: '土木工程' },
            { pattern: /(临床医学|医学|medicine)/i, major: '医学' },
            { pattern: /(经济学|经济|economics)/i, major: '经济学' },
            { pattern: /(金融学|金融|finance)/i, major: '金融学' },
            { pattern: /(教育学|教育|education)/i, major: '教育学' }
        ];
        const hit = aliases.find(item => item.pattern.test(text));
        return hit ? hit.major : text.slice(0, 24);
    }

    extractMajor(text = '') {
        const source = String(text || '').trim();
        const explicitPatterns = [
            /(?:我是|我是一名|我是一个|本人是|目前是|当前是)\s*([\u4e00-\u9fa5A-Za-z\s]{2,30}?)(?:专业|方向)?(?:的)?(?:学生|本科生|研究生|硕士|博士)?(?:[，。,.；;\n]|$)/i,
            /(?:专业|专业背景|所学专业|我的专业)\s*(?:是|为|:|：)?\s*([\u4e00-\u9fa5A-Za-z\s]{2,30}?)(?:[，。,.；;\n]|$)/i,
            /([\u4e00-\u9fa5A-Za-z\s]{2,30}?专业)(?:[，。,.；;\n]|$)/i,
            /(?:学|学习|就读)\s*([\u4e00-\u9fa5A-Za-z\s]{2,30}?)(?:专业|方向)?(?:[，。,.；;\n]|$)/i
        ];

        for (const pattern of explicitPatterns) {
            const match = source.match(pattern);
            if (match && match[1]) {
                const major = this.normalizeMajorName(match[1]);
                if (major) return major;
            }
        }

        return this.normalizeMajorName(source);
    }

    // 初始化画像
    async initializeProfile() {
        try {
            const [rows] = await this.pool.query(
                'SELECT * FROM student_profiles WHERE user_id = ?',
                [this.userId]
            );

            if (rows.length > 0) {
                this.profile = JSON.parse(rows[0].profile_json);
            } else {
                // 创建默认画像
                this.profile = this.getDefaultProfile();
                await this.saveProfile();
            }

            return this.profile;
        } catch (error) {
            console.error('初始化学习画像失败:', error);
            // 失败时返回默认画像
            this.profile = this.getDefaultProfile();
            return this.profile;
        }
    }

    // 默认画像结构
    getDefaultProfile() {
        return {
            version: 2,
            basicInfo: {
                major: '',
                year: '',
                learningGoals: [],
                interests: [],
                skills: []
            },
            knowledgeBase: {}, // 按学科细分的知识基础
            cognitiveStyle: {
                type: 'visual', // visual, auditory, kinesthetic
                preference: 'balanced', // balanced, focused
                processingSpeed: 'medium' // slow, medium, fast
            },
            learningPatterns: {
               易错知识点: [],
               学习速度: 'medium', // slow, medium, fast
               注意力持续时间: 30, // 分钟
               最佳学习时间: 'morning', // morning, afternoon, evening
               学习习惯: []
            },
            emotionalTraits: {
                学习韧性: 0.7,
                焦虑水平: 0.3,
                动机水平: 0.8,
                stressResistance: 0.6
            },
            multimodalPreferences: {
                视觉: 0.8,
                听觉: 0.6,
                触觉: 0.4,
                阅读: 0.7,
                互动: 0.5
            },
            learningContext: {
                preferredEnvironment: 'quiet', // quiet, collaborative, flexible
                devicePreference: 'desktop', // desktop, mobile, tablet
                socialLearning: false
            },
            updatedAt: new Date().toISOString()
        };
    }

    // 处理对话输入（增强版：支持知识短板检测、易错点偏好、对话引导）
    async processDialogueInput(message) {
        try {
            await this.loadKnowledgeMappings();
            const extractedFeatures = this.extractFeaturesFromMessage(message);
            const weakPoints = await this.detectWeakPoints(message);
            if (weakPoints.length) {
                extractedFeatures.learningPatterns = extractedFeatures.learningPatterns || {};
                extractedFeatures.learningPatterns['易错知识点'] = weakPoints;
            }
            const subjectGuess = this.guessSubjectFromMessage(message);
            if (subjectGuess) {
                extractedFeatures.basicInfo = extractedFeatures.basicInfo || {};
                if (!extractedFeatures.basicInfo.major && subjectGuess === 'computer') {
                    extractedFeatures.basicInfo.major = '计算机科学与技术';
                }
                extractedFeatures._subjectHint = subjectGuess;
            }
            this.updateProfile(extractedFeatures);
            await this.saveProfile();
            return this.profile;
        } catch (error) {
            console.error('处理对话输入失败:', error);
            return this.profile;
        }
    }

    guessSubjectFromMessage(message) {
        const text = String(message || '').toLowerCase();
        if (/计算机|编程|代码|python|java|c\+\+|前端|后端|算法|数据结构/i.test(text)) return 'computer';
        if (/数学|函数|微积分|线性代数|概率|几何/i.test(text)) return 'math';
        if (/英语|英文|语法|单词|阅读|写作/i.test(text)) return 'english';
        if (/物理|力学|电磁|光学|热学/i.test(text)) return 'physics';
        if (/化学|反应|分子|元素/i.test(text)) return 'chemistry';
        return null;
    }

    async detectWeakPoints(message) {
        const text = String(message || '');
        const weakPoints = [];
        if (/不会|不懂|不理解|很难|太难|弄不明白|搞不清楚|经常错|老是错|总是错/i.test(text)) {
            const mappings = await this.loadKnowledgeMappings();
            for (const node of mappings) {
                if (text.includes(node.name)) {
                    weakPoints.push(node.name);
                }
            }
            if (!weakPoints.length) {
                const guessed = [];
                for (const node of mappings) {
                    const keywords = node.name.split(/[，。,\s、]+/);
                    if (keywords.some(kw => kw.length >= 2 && text.includes(kw))) {
                        guessed.push(node.name);
                    }
                }
                if (guessed.length) weakPoints.push(...guessed.slice(0, 3));
            }
        }
        // 支持"我不擅长X"句式
        const badAtMatch = text.match(/(?:不擅长|薄弱|差|不好|不行)\s*(?:的)?\s*([\u4e00-\u9fa5]{2,15})/);
        if (badAtMatch) weakPoints.push(badAtMatch[1]);
        return [...new Set(weakPoints)];
    }

    // 从消息中提取特征
    extractFeaturesFromMessage(message) {
        console.log('提取特征:', message);
        const text = String(message || '');
        const lowerMessage = text.toLowerCase();
        const features = {};

        // 提取专业：支持“艺术设计专业”“我是护理专业学生”等开放表达。
        const major = this.extractMajor(text);
        if (major && /专业|我是|我学|学习|就读|计算机|软件|艺术|设计|医学|护理|会计|法学|建筑|新闻|传媒|电气|自动化|汉语言|心理|物流|市场营销|土木|机械|金融|经济|教育|英语|数学|物理|化学|生物/i.test(text)) {
            features.basicInfo = { ...features.basicInfo, major };
            console.log('提取到专业:', major);
        }

        // 提取年级
        const yearPatterns = [
            { pattern: /(大一| freshman)/i, year: 'freshman' },
            { pattern: /(大二| sophomore)/i, year: 'sophomore' },
            { pattern: /(大三| junior)/i, year: 'junior' },
            { pattern: /(大四| senior)/i, year: 'senior' },
            { pattern: /(研究生|graduate)/i, year: 'graduate' }
        ];

        const yearHit = yearPatterns.find(item => item.pattern.test(text));
        if (yearHit) {
            features.basicInfo = { ...features.basicInfo, year: yearHit.year };
            console.log('提取到年级:', yearHit.year);
        }

        // 提取学习目标
        const goalCandidates = [
            { hit: /(考研|graduate)/i, goal: '考研' },
            { hit: /(就业|找工作|job)/i, goal: '就业' },
            { hit: /(出国|留学|overseas)/i, goal: '出国留学' },
            { hit: /(竞赛|比赛|olympiad)/i, goal: '学科竞赛' },
            { hit: /(提升成绩|提分|提高)/i, goal: '提升成绩' },
            { hit: /(考证|certificate)/i, goal: '考证' },
            { hit: /(科研|research)/i, goal: '科研' },
            { hit: /(创业|startup)/i, goal: '创业' }
        ];
        const learningGoals = goalCandidates.filter(item => item.hit.test(text)).map(item => item.goal);
        if (learningGoals.length) {
            features.basicInfo = {
                ...features.basicInfo,
                learningGoals: learningGoals
            };
            console.log('提取到学习目标:', learningGoals);
        }

        // 提取兴趣爱好
        const interests = [];
        if (/电影|movie/i.test(text)) {
            interests.push('电影');
            console.log('提取到兴趣: 电影');
        }
        if (/游戏|game/i.test(text)) {
            interests.push('游戏');
            console.log('提取到兴趣: 游戏');
        }
        if (/音乐|music/i.test(text)) {
            interests.push('音乐');
            console.log('提取到兴趣: 音乐');
        }
        if (/阅读|读书|reading/i.test(text)) {
            interests.push('阅读');
            console.log('提取到兴趣: 阅读');
        }
        if (/运动|健身|sport/i.test(text)) {
            interests.push('运动');
            console.log('提取到兴趣: 运动');
        }
        if (/编程|代码|coding|programming/i.test(text)) {
            interests.push('编程');
            console.log('提取到兴趣: 编程');
        }
        if (/旅游|travel/i.test(text)) {
            interests.push('旅游');
            console.log('提取到兴趣: 旅游');
        }
        if (/美食|food/i.test(text)) {
            interests.push('美食');
            console.log('提取到兴趣: 美食');
        }
        if (/艺术|art/i.test(text)) {
            interests.push('艺术');
            console.log('提取到兴趣: 艺术');
        }
        if (interests.length > 0) {
            features.basicInfo = {
                ...features.basicInfo,
                interests: [...new Set(interests)]
            };
            console.log('提取到兴趣列表:', interests);
        }

        // 提取技能
        const skills = [];
        if (/编程|coding|programming/i.test(text)) {
            skills.push('编程');
        }
        if (/英语|english/i.test(text)) {
            skills.push('英语');
        }
        if (/写作|writing/i.test(text)) {
            skills.push('写作');
        }
        if (/演讲|speaking/i.test(text)) {
            skills.push('演讲');
        }
        if (/设计|design/i.test(text)) {
            skills.push('设计');
        }
        if (skills.length > 0) {
            features.basicInfo = {
                ...features.basicInfo,
                skills: [...new Set(skills)]
            };
            console.log('提取到技能:', skills);
        }

        // 提取认知风格
        if (/看|视频|图|visual|图片/i.test(text)) {
            features.cognitiveStyle = {
                ...features.cognitiveStyle,
                type: 'visual'
            };
            console.log('提取到认知风格: visual');
        } else if (/听|音频|auditory|听力/i.test(text)) {
            features.cognitiveStyle = {
                ...features.cognitiveStyle,
                type: 'auditory'
            };
            console.log('提取到认知风格: auditory');
        } else if (/做|实践|动手|kinesthetic|实验/i.test(text)) {
            features.cognitiveStyle = {
                ...features.cognitiveStyle,
                type: 'kinesthetic'
            };
            console.log('提取到认知风格: kinesthetic');
        }

        // 提取学习模式
        if (/快|迅速|fast/i.test(text)) {
            features.learningPatterns = {
                ...features.learningPatterns,
                学习速度: 'fast'
            };
            console.log('提取到学习速度: fast');
        } else if (/慢|仔细|slow/i.test(text)) {
            features.learningPatterns = {
                ...features.learningPatterns,
                学习速度: 'slow'
            };
            console.log('提取到学习速度: slow');
        }

        // 提取最佳学习时间
        if (/上午|morning/i.test(text)) {
            features.learningPatterns = {
                ...features.learningPatterns,
                最佳学习时间: 'morning'
            };
            console.log('提取到最佳学习时间: morning');
        } else if (/下午|afternoon/i.test(text)) {
            features.learningPatterns = {
                ...features.learningPatterns,
                最佳学习时间: 'afternoon'
            };
            console.log('提取到最佳学习时间: afternoon');
        } else if (/晚上|evening|night/i.test(text)) {
            features.learningPatterns = {
                ...features.learningPatterns,
                最佳学习时间: 'evening'
            };
            console.log('提取到最佳学习时间: evening');
        }

        // 提取学习环境偏好
        if (/安静|quiet/i.test(text)) {
            features.learningContext = {
                ...features.learningContext,
                preferredEnvironment: 'quiet'
            };
            console.log('提取到学习环境偏好: quiet');
        } else if (/合作|collaborative|小组/i.test(text)) {
            features.learningContext = {
                ...features.learningContext,
                preferredEnvironment: 'collaborative',
                socialLearning: true
            };
            console.log('提取到学习环境偏好: collaborative');
        }

        console.log('提取的特征:', features);
        return features;
    }

    // 处理多模态输入
    async processMultimodalInput(type, data) {
        try {
            switch (type) {
                case 'voice':
                    // 语音输入处理
                    return await this.processVoiceInput(data);
                case 'image':
                    // 图像处理
                    return await this.processImageInput(data);
                case 'text':
                    // 文本处理
                    return await this.processDialogueInput(data);
                case 'video':
                    // 视频处理
                    return await this.processVideoInput(data);
                default:
                    throw new Error('Unsupported input type');
            }
        } catch (error) {
            console.error('处理多模态输入失败:', error);
            return this.profile;
        }
    }

    // 处理语音输入
    async processVoiceInput(audioData) {
        try {
            const recognizedText = typeof audioData === 'string'
                ? audioData
                : (audioData && audioData.transcript) ? audioData.transcript : '';
            if (!recognizedText) return this.profile;
            
            // 分析语音特征
            const voiceFeatures = this.analyzeVoiceFeatures(audioData);
            const textFeatures = this.extractFeaturesFromMessage(recognizedText);
            
            // 合并特征
            const combinedFeatures = {
                ...textFeatures,
                ...voiceFeatures
            };
            
            this.updateProfile(combinedFeatures);
            await this.saveProfile();
            return this.profile;
        } catch (error) {
            console.error('处理语音输入失败:', error);
            return this.profile;
        }
    }

    // 分析语音特征
    analyzeVoiceFeatures(audioData) {
        const features = {};
        
        // 模拟语音特征分析
        if (audioData && typeof audioData === 'object') {
            // 基于语音速度分析学习速度
            if (audioData.speechRate && audioData.speechRate > 150) {
                features.learningPatterns = {
                    ...features.learningPatterns,
                    学习速度: 'fast'
                };
            } else if (audioData.speechRate && audioData.speechRate < 100) {
                features.learningPatterns = {
                    ...features.learningPatterns,
                    学习速度: 'slow'
                };
            }
            
            // 基于语音情绪分析学习情绪
            if (audioData.emotion) {
                features.emotionalTraits = {
                    ...features.emotionalTraits,
                    焦虑水平: audioData.emotion.anxiety || 0.3,
                    动机水平: audioData.emotion.motivation || 0.8
                };
            }
        }
        
        // 语音输入默认增强听觉偏好
        features.multimodalPreferences = {
            ...features.multimodalPreferences,
            听觉: Math.min(1.0, (this.profile?.multimodalPreferences?.听觉 || 0.6) + 0.1)
        };
        
        return features;
    }

    // 处理图像输入
    async processImageInput(imageData) {
        try {
            const imageAnalysis = {
                cognitiveStyle: { type: 'visual' },
                learningPatterns: { 学习速度: 'medium' },
                multimodalPreferences: {
                    视觉: Math.min(1.0, (this.profile?.multimodalPreferences?.视觉 || 0.8) + 0.1)
                }
            };
            
            if (imageData && typeof imageData === 'object') {
                // 基于图像内容分析学习场景
                if (imageData.scene === 'classroom') {
                    imageAnalysis.learningContext = {
                        preferredEnvironment: 'collaborative',
                        socialLearning: true
                    };
                } else if (imageData.scene === 'library') {
                    imageAnalysis.learningContext = {
                        preferredEnvironment: 'quiet'
                    };
                }
                
                // 基于图像分析学习速度
                if (imageData.learningSpeed) {
                    imageAnalysis.learningPatterns.学习速度 = imageData.learningSpeed;
                }
            }
            
            this.updateProfile(imageAnalysis);
            await this.saveProfile();
            return this.profile;
        } catch (error) {
            console.error('处理图像输入失败:', error);
            return this.profile;
        }
    }

    // 处理视频输入
    async processVideoInput(videoData) {
        try {
            // 视频输入综合了视觉和听觉特征
            const videoAnalysis = {
                cognitiveStyle: { type: 'visual' },
                multimodalPreferences: {
                    视觉: Math.min(1.0, (this.profile?.multimodalPreferences?.视觉 || 0.8) + 0.1),
                    听觉: Math.min(1.0, (this.profile?.multimodalPreferences?.听觉 || 0.6) + 0.1),
                    互动: Math.min(1.0, (this.profile?.multimodalPreferences?.互动 || 0.5) + 0.1)
                }
            };
            
            if (videoData && typeof videoData === 'object' && videoData.transcript) {
                // 分析视频中的文本内容
                const textFeatures = this.extractFeaturesFromMessage(videoData.transcript);
                Object.assign(videoAnalysis, textFeatures);
            }
            
            this.updateProfile(videoAnalysis);
            await this.saveProfile();
            return this.profile;
        } catch (error) {
            console.error('处理视频输入失败:', error);
            return this.profile;
        }
    }

    // 更新画像
    updateProfile(updates) {
        if (!this.profile) {
            this.profile = this.getDefaultProfile();
        }
        this.profile = this.deepMerge(this.profile, updates);
        this.profile.updatedAt = new Date().toISOString();
    }

    // 深度合并对象
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (Array.isArray(source[key])) {
                    result[key] = source[key];
                } else if (typeof source[key] === 'object' && source[key] !== null) {
                    if (!result[key]) {
                        result[key] = {};
                    }
                    result[key] = this.deepMerge(result[key], source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }

    // 保存画像到数据库
    async saveProfile() {
        try {
            await this.pool.query(
                `INSERT INTO student_profiles (user_id, profile_json, version, updated_at) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 profile_json = VALUES(profile_json), 
                 version = version + 1, 
                 updated_at = VALUES(updated_at)`,
                [this.userId, JSON.stringify(this.profile), this.profile.version, new Date()]
            );
        } catch (error) {
            console.error('保存学习画像失败:', error);
        }
    }

    // 获取画像
    getProfile() {
        return this.profile;
    }

    // 生成画像摘要（增强版：含雷达图数据）
    generateProfileSummary() {
        if (!this.profile) {
            return { message: '画像尚未初始化', radarData: null };
        }

        const summary = {
            专业: this.profile.basicInfo.major || '未设置',
            年级: this.getYearText(),
            学习目标: this.profile.basicInfo.learningGoals.join('、') || '未设置',
            兴趣爱好: this.profile.basicInfo.interests.join('、') || '未设置',
            认知风格: this.getCognitiveStyleText(),
            最佳学习时间: this.getBestStudyTimeText(),
            学习环境偏好: this.getEnvironmentText(),
            多模态偏好: this.getMultimodalPreferencesText(),
            易错知识点: (this.profile.learningPatterns?.['易错知识点'] || []).join('、') || '暂无',
            学习韧性: `${Math.round((this.profile.emotionalTraits?.['学习韧性'] || 0.7) * 100)}%`,
            动机水平: `${Math.round((this.profile.emotionalTraits?.['动机水平'] || 0.8) * 100)}%`,
            学习速度: this.profile.learningPatterns?.['学习速度'] || 'medium'
        };

        summary.radarData = this.getRadarChartData();

        return summary;
    }

    getRadarChartData() {
        const p = this.profile;
        if (!p) return null;
        return {
            labels: ['知识基础', '认知能力', '学习韧性', '动机水平', '视觉偏好', '听觉偏好', '实践能力', '阅读能力'],
            datasets: [{
                label: '学习画像',
                data: [
                    this.calcKnowledgeScore(),
                    this.calcCognitiveScore(),
                    Math.round((p.emotionalTraits?.['学习韧性'] || 0.7) * 100),
                    Math.round((p.emotionalTraits?.['动机水平'] || 0.8) * 100),
                    Math.round((p.multimodalPreferences?.['视觉'] || 0.5) * 100),
                    Math.round((p.multimodalPreferences?.['听觉'] || 0.5) * 100),
                    Math.round((p.multimodalPreferences?.['触觉'] || 0.3) * 100),
                    Math.round((p.multimodalPreferences?.['阅读'] || 0.5) * 100)
                ]
            }]
        };
    }

    calcKnowledgeScore() {
        const kb = this.profile.knowledgeBase;
        if (!kb || Object.keys(kb).length === 0) return 50;
        const values = Object.values(kb).filter(v => typeof v === 'number');
        if (!values.length) return 50;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100);
    }

    calcCognitiveScore() {
        const map = { slow: 40, medium: 65, fast: 85 };
        return map[this.profile.learningPatterns?.['学习速度']] || 65;
    }

    // 获取年级文本
    getYearText() {
        const yearMap = {
            freshman: '大一',
            sophomore: '大二',
            junior: '大三',
            senior: '大四',
            graduate: '研究生'
        };
        return yearMap[this.profile.basicInfo.year] || '未设置';
    }

    // 获取认知风格文本
    getCognitiveStyleText() {
        const styleMap = {
            visual: '视觉型',
            auditory: '听觉型',
            kinesthetic: '动觉型'
        };
        return styleMap[this.profile.cognitiveStyle.type] || '未知';
    }

    // 获取最佳学习时间文本
    getBestStudyTimeText() {
        const timeMap = {
            morning: '上午',
            afternoon: '下午',
            evening: '晚上'
        };
        return timeMap[this.profile.learningPatterns.最佳学习时间] || '未知';
    }

    // 获取学习环境文本
    getEnvironmentText() {
        const envMap = {
            quiet: '安静环境',
            collaborative: '合作环境',
            flexible: '灵活环境'
        };
        return envMap[this.profile.learningContext?.preferredEnvironment] || '未设置';
    }

    // 获取多模态偏好文本
    getMultimodalPreferencesText() {
        const preferences = this.profile.multimodalPreferences;
        const sorted = Object.entries(preferences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, value]) => key)
            .join('、');
        return sorted || '未设置';
    }

    // 处理消息
    async handleMessage(message) {
        console.log('ProfileAgent received message:', message);
        try {
            switch (message.type) {
                case 'process_input':
                    await this.initializeProfile();
                    return await this.processDialogueInput(message.content);
                case 'process_multimodal':
                    await this.initializeProfile();
                    return await this.processMultimodalInput(message.content.type, message.content.data);
                case 'get_profile':
                    await this.initializeProfile();
                    return this.getProfile();
                case 'get_profile_summary':
                    await this.initializeProfile();
                    return this.generateProfileSummary();
                default:
                    throw new Error('Unsupported message type');
            }
        } catch (error) {
            console.error('处理消息失败:', error);
            return { error: error.message };
        }
    }
}

module.exports = ProfileAgent;
