// core/CognitiveDiagnosis.js
// DINA认知诊断引擎 + Bloom认知层次 + 误区识别

const KnowledgeTracingEngine = require("./KnowledgeTracingEngine");

class CognitiveDiagnosis {
    constructor() {
        this.bkt = new KnowledgeTracingEngine();
        this.slipBase = 0.12;
        this.guessBase = 0.18;

        // DINA属性-题目矩阵 (attribute x question)
        this.attributes = [
            "概念理解",
            "公式应用",
            "计算能力",
            "逻辑推理",
            "空间想象",
            "归纳抽象",
            "记忆检索",
            "问题表征"
        ];

        // Bloom认知层次权重
        this.bloomWeights = {
            记忆: { weight: 0.15, keywords: ["定义", "什么是", "列举", "识别", "回忆", "说出", "写出"] },
            理解: { weight: 0.2, keywords: ["解释", "说明", "归纳", "比较", "转换", "推断", "区别"] },
            应用: { weight: 0.25, keywords: ["计算", "求解", "应用", "使用", "执行", "实现", "操作"] },
            分析: { weight: 0.18, keywords: ["分析", "区分", "组织", "归因", "解构", "对比", "检查"] },
            评价: { weight: 0.12, keywords: ["评价", "判断", "论证", "批判", "评估", "权衡", "辩护"] },
            创造: { weight: 0.1, keywords: ["设计", "构建", "开发", "规划", "创作", "生成", "提出"] }
        };

        // 常见误区模式库
        this.misconceptionPatterns = {
            概念混淆: { keywords: ["混淆", "分不清"], weight: 0.3 },
            运算错误: { keywords: ["算错", "计算"], weight: 0.25 },
            审题不清: { keywords: ["看错", "没注意", "漏看"], weight: 0.2 },
            公式误用: { keywords: ["用错公式", "套错"], weight: 0.15 },
            逻辑跳跃: { keywords: ["跳步", "省略"], weight: 0.1 },
            "单位/符号错误": { keywords: ["单位", "符号"], weight: 0.08 },
            先验知识不足: { keywords: ["不知道", "没学过", "前置"], weight: 0.05 }
        };
    }

    // ===== 核心诊断方法 =====

    async diagnose(userId, examRecordId, pool) {
        const [answers] = await pool.query(
            `SELECT ua.question_id, ua.is_correct, ua.user_answer, q.node_id,
                    q.difficulty, q.question as content, q.skill_codes, q.correct_answer,
                    q.type as question_type
             FROM user_answers ua
             JOIN questions q ON ua.question_id = q.id
             WHERE ua.user_exam_id = ?`,
            [examRecordId]
        );

        if (answers.length === 0) return null;

        // 1. DINA认知诊断
        const dinaResult = this.dinaDiagnose(answers);

        // 2. Bloom认知层次分析
        const bloomResult = this.bloomAnalyze(answers);

        // 3. 误区识别
        const misconceptions = this.detectMisconceptions(answers);

        // 4. 知识技能矩阵
        const skillMastery = this.buildSkillMatrix(answers);

        // 5. 根因分析
        const rootCause = this.analyzeRootCause(answers, skillMastery, misconceptions);

        return {
            skillMastery,
            weakestSkills: Object.entries(skillMastery)
                .sort(([, a], [, b]) => a.mastery - b.mastery)
                .slice(0, 5)
                .map(([skill, data]) => ({ skill, ...data })),
            cognitiveProfile: {
                attributes: dinaResult.attributeMastery,
                bloomLevels: bloomResult.levels,
                dominantLevel: bloomResult.dominantLevel,
                cognitiveWidth: bloomResult.cognitiveWidth
            },
            misconceptions,
            rootCause,
            overallMastery: Math.round(
                Object.values(skillMastery).reduce((s, v) => s + v.mastery, 0) /
                    Math.max(1, Object.keys(skillMastery).length)
            ),
            recommendations: this.generateSmartRecommendations(dinaResult, bloomResult, misconceptions, skillMastery),
            diagnosisQuality: this.calculateDiagnosisQuality(answers, dinaResult)
        };
    }

    // ===== DINA认知诊断 =====

    dinaDiagnose(answers) {
        // DINA模型: 二元认知属性掌握矩阵
        // P(X=1|α) = g_i^(1-η_i) * (1-s_i)^η_i
        // η_ij = 布尔指示 K个属性是否都掌握

        const attributeMastery = {};
        const attributeScores = {};

        for (const attr of this.attributes) {
            attributeScores[attr] = { correct: 0, total: 0, wrong: 0, hardCorrect: 0, hardTotal: 0 };
        }

        for (const ans of answers) {
            // 根据题目类型和技能码推断考察的属性
            const attrs = this.inferQuestionAttributes(ans);
            for (const attr of attrs) {
                if (!attributeScores[attr]) {
                    attributeScores[attr] = { correct: 0, total: 0, wrong: 0, hardCorrect: 0, hardTotal: 0 };
                }
                attributeScores[attr].total++;
                if (ans.is_correct) {
                    attributeScores[attr].correct++;
                } else {
                    attributeScores[attr].wrong++;
                }
                if (ans.difficulty === "hard") {
                    attributeScores[attr].hardTotal++;
                    if (ans.is_correct) attributeScores[attr].hardCorrect++;
                }
            }
        }

        // DINA参数估计: 猜测g = 简单题答对率(低掌握)
        // 失误s = 困难题答错率(高掌握)
        for (const [attr, scores] of Object.entries(attributeScores)) {
            if (scores.total === 0) {
                attributeMastery[attr] = { mastery: 0, probability: 0, confidence: 0.1, state: "unknown" };
                continue;
            }

            const rawRate = scores.correct / scores.total;
            const guessEstimate = 0.2; // 猜测概率
            const slipEstimate = scores.hardTotal > 0 ? 1 - scores.hardCorrect / scores.hardTotal : 0.1;

            // DINA后验: P(掌握|答题) = 似然 × 先验
            // 使用所有答题更新信念
            let masteryProb = 0.5; // 先验
            for (let i = 0; i < scores.total; i++) {
                const isCorrect = i < scores.correct;
                const eta = masteryProb; // 掌握概率
                if (isCorrect) {
                    const P_correct = eta * (1 - slipEstimate) + (1 - eta) * guessEstimate;
                    masteryProb = (eta * (1 - slipEstimate)) / Math.max(P_correct, 0.01);
                } else {
                    const P_wrong = eta * slipEstimate + (1 - eta) * (1 - guessEstimate);
                    masteryProb = (eta * slipEstimate) / Math.max(P_wrong, 0.01);
                }
                masteryProb = Math.max(0.01, Math.min(0.99, masteryProb));
            }

            attributeMastery[attr] = {
                mastery: Math.round(rawRate * 100),
                probability: Math.round(masteryProb * 100) / 100,
                confidence: Math.min(1, scores.total / 15),
                sampleSize: scores.total,
                state:
                    masteryProb >= 0.75
                        ? "mastered"
                        : masteryProb >= 0.5
                          ? "developing"
                          : masteryProb >= 0.25
                            ? "beginner"
                            : "weak",
                correctCount: scores.correct
            };
        }

        return {
            attributeMastery,
            overallProbability:
                Object.values(attributeMastery).reduce((s, v) => s + v.probability, 0) /
                Math.max(1, Object.keys(attributeMastery).length),
            masteredCount: Object.values(attributeMastery).filter(v => v.state === "mastered").length,
            weakCount: Object.values(attributeMastery).filter(v => v.state === "weak").length
        };
    }

    inferQuestionAttributes(question) {
        const attrs = [];
        const content = String(question.content || "").toLowerCase();
        const skills = this.parseSkills(question.skill_codes);

        if (skills.includes("概念理解") || /定义|概念|什么是|属于|分类|含义/.test(content)) {
            attrs.push("概念理解");
        }
        if (skills.includes("公式应用") || /公式|定理|计算|求解|=|sin|cos|log/.test(content)) {
            attrs.push("公式应用", "计算能力");
        }
        if (skills.includes("逻辑推理") || /推理|证明|因为|所以|逻辑|条件|判断/.test(content)) {
            attrs.push("逻辑推理");
        }
        if (skills.includes("空间想象") || /图形|几何|空间|坐标|向量/.test(content)) {
            attrs.push("空间想象");
        }
        if (skills.includes("归纳抽象") || /归纳|抽象|模式|规律|总结/.test(content)) {
            attrs.push("归纳抽象");
        }
        if (skills.includes("记忆检索") || /复述|回忆|背诵|填写|默写/.test(content)) {
            attrs.push("记忆检索");
        }
        if (skills.includes("问题表征") || /转化|建模|表示|描述|场景/.test(content)) {
            attrs.push("问题表征");
        }

        // 如果没有推断出属性，使用技能码
        if (attrs.length === 0) {
            const skillAttrMap = {
                编程: ["逻辑推理", "计算能力", "归纳抽象"],
                数学: ["公式应用", "计算能力", "逻辑推理"],
                英语: ["记忆检索", "概念理解"],
                物理: ["公式应用", "概念理解", "逻辑推理"],
                化学: ["记忆检索", "概念理解", "计算能力"],
                生物: ["记忆检索", "概念理解"],
                语文: ["概念理解", "归纳抽象"],
                历史: ["记忆检索", "概念理解"],
                地理: ["空间想象", "记忆检索"]
            };
            for (const [subject, attrs_] of Object.entries(skillAttrMap)) {
                if (skills.some(s => s.includes(subject)) || content.includes(subject)) {
                    attrs.push(...attrs_);
                    break;
                }
            }
        }

        return attrs.length > 0 ? [...new Set(attrs)] : ["概念理解"];
    }

    // ===== Bloom认知层次分析 =====

    bloomAnalyze(answers) {
        const blooms = { 记忆: 0, 理解: 0, 应用: 0, 分析: 0, 评价: 0, 创造: 0 };
        const correctBlooms = { 记忆: 0, 理解: 0, 应用: 0, 分析: 0, 评价: 0, 创造: 0 };

        for (const ans of answers) {
            const levels = this.classifyBloomLevel(ans);
            for (const level of levels) {
                blooms[level] = (blooms[level] || 0) + 1;
                if (ans.is_correct) {
                    correctBlooms[level] = (correctBlooms[level] || 0) + 1;
                }
            }
        }

        const levels = {};
        for (const [level, count] of Object.entries(blooms)) {
            levels[level] = {
                count,
                accuracy: count > 0 ? Math.round(((correctBlooms[level] || 0) / count) * 100) : 0,
                mastery:
                    count > 0 ? Math.min(100, Math.round(((correctBlooms[level] || 0) / Math.max(count, 1)) * 100)) : 0,
                weight: this.bloomWeights[level]?.weight || 0.1
            };
        }

        // 主导认知层次
        let dominantLevel = "记忆";
        let maxScore = 0;
        for (const [level, data] of Object.entries(levels)) {
            const score = data.accuracy * (data.count / answers.length);
            if (score > maxScore) {
                maxScore = score;
                dominantLevel = level;
            }
        }

        // 认知宽度: 能到达的最高层次
        const orderedLevels = ["记忆", "理解", "应用", "分析", "评价", "创造"];
        let cognitiveWidth = "记忆";
        for (const level of orderedLevels.reverse()) {
            if (levels[level] && levels[level].count > 0) {
                cognitiveWidth = level;
                break;
            }
        }

        return { levels, dominantLevel, cognitiveWidth };
    }

    classifyBloomLevel(question) {
        const content = String(question.content || "").toLowerCase();
        const levels = [];

        for (const [level, config] of Object.entries(this.bloomWeights)) {
            for (const kw of config.keywords) {
                if (content.includes(kw)) {
                    levels.push(level);
                    break;
                }
            }
        }

        // 根据难度补充
        if (levels.length === 0) {
            if (question.difficulty === "easy") levels.push("记忆");
            else if (question.difficulty === "medium") levels.push("理解", "应用");
            else if (question.difficulty === "hard") levels.push("分析", "评价");
            else levels.push("理解");
        }

        return [...new Set(levels)];
    }

    // ===== 误区识别 =====

    detectMisconceptions(answers) {
        const wrongAnswers = answers.filter(a => !a.is_correct);
        if (wrongAnswers.length === 0) {
            return { categories: [], details: [], confidence: "high", message: "暂无错误，无法识别误区" };
        }

        const misconceptionMap = {};
        const details = [];

        for (const ans of wrongAnswers) {
            const content = String(ans.content || "");
            const userAnswer = String(ans.user_answer || "").toLowerCase();
            const correctAnswer = String(ans.correct_answer || "").toLowerCase();

            // 模式匹配
            let matched = false;
            for (const [category, config] of Object.entries(this.misconceptionPatterns)) {
                if (matched) break;
                for (const kw of config.keywords) {
                    if (content.includes(kw) || userAnswer.includes(kw)) {
                        if (!misconceptionMap[category]) misconceptionMap[category] = { count: 0, questions: [] };
                        misconceptionMap[category].count++;
                        misconceptionMap[category].questions.push({
                            questionId: ans.question_id,
                            content: content.slice(0, 60),
                            userAnswer: ans.user_answer,
                            correctAnswer: ans.correct_answer,
                            difficulty: ans.difficulty
                        });
                        matched = true;
                        break;
                    }
                }
            }

            // 高级检测: 对比用户答案和正确答案
            if (!matched) {
                const detection = this.advancedMisconceptionDetect(ans, content, userAnswer, correctAnswer);
                if (detection) {
                    const cat = detection.category;
                    if (!misconceptionMap[cat]) misconceptionMap[cat] = { count: 0, questions: [] };
                    misconceptionMap[cat].count++;
                    misconceptionMap[cat].questions.push({
                        questionId: ans.question_id,
                        content: content.slice(0, 60),
                        userAnswer: ans.user_answer,
                        correctAnswer: ans.correct_answer,
                        difficulty: ans.difficulty,
                        hint: detection.hint
                    });
                } else {
                    if (!misconceptionMap["未分类"]) misconceptionMap["未分类"] = { count: 0, questions: [] };
                    misconceptionMap["未分类"].count++;
                    misconceptionMap["未分类"].questions.push({
                        questionId: ans.question_id,
                        content: content.slice(0, 60),
                        userAnswer: ans.user_answer,
                        correctAnswer: ans.correct_answer,
                        difficulty: ans.difficulty
                    });
                }
            }
        }

        // 转换为数组
        const categories = Object.entries(misconceptionMap)
            .sort(([, a], [, b]) => b.count - a.count)
            .map(([category, data]) => ({
                category,
                count: data.count,
                percentage: Math.round((data.count / wrongAnswers.length) * 100),
                severity:
                    data.count / wrongAnswers.length >= 0.3
                        ? "critical"
                        : data.count / wrongAnswers.length >= 0.15
                          ? "moderate"
                          : "minor",
                sampleQuestions: data.questions.slice(0, 3).map(q => ({
                    questionId: q.questionId,
                    content: q.content,
                    userAnswer: q.userAnswer,
                    correctAnswer: q.correctAnswer,
                    difficulty: q.difficulty,
                    hint: q.hint || ""
                }))
            }));

        return {
            categories,
            totalErrors: wrongAnswers.length,
            uniqueCategories: categories.length,
            primaryMisconception: categories[0] || null,
            confidence: categories.length >= 2 ? "high" : categories.length >= 1 ? "medium" : "low"
        };
    }

    advancedMisconceptionDetect(ans, content, userAnswer, correctAnswer) {
        // 数值型答案检测
        if (/^[\d.\-+]+$/.test(userAnswer) && /^[\d.\-+]+$/.test(correctAnswer)) {
            const userNum = parseFloat(userAnswer);
            const correctNum = parseFloat(correctAnswer);
            if (!isNaN(userNum) && !isNaN(correctNum)) {
                const diff = Math.abs(userNum - correctNum);
                if (diff < 0.01) return null;
                // 10的幂次偏移 → 单位/符号错误
                const ratio = userNum / Math.max(0.0001, correctNum);
                if (ratio > 0.9 && ratio < 1.1) {
                    return {
                        category: "运算错误",
                        hint: `数值接近但略有偏差 (比率=${ratio.toFixed(3)})，检查计算精度或舍入`
                    };
                }
                if (ratio > 9 || ratio < 0.11) {
                    return {
                        category: "单位/符号错误",
                        hint: `数值偏差约${Math.round(Math.abs(Math.log10(ratio)))}个数量级，检查单位换算`
                    };
                }
                return {
                    category: "运算错误",
                    hint: `正确答案 ${correctAnswer}，你的答案是 ${userAnswer}，检查计算步骤`
                };
            }
        }

        // 正负/反向检测
        if (
            (userAnswer.includes("-") && !correctAnswer.includes("-")) ||
            (!userAnswer.includes("-") && correctAnswer.includes("-"))
        ) {
            return { category: "单位/符号错误", hint: "符号错误，检查正负号方向" };
        }

        // 选项型检测 (A/B/C/D)
        if (/^[a-d]$/.test(userAnswer) && /^[a-d]$/.test(correctAnswer)) {
            return {
                category: "概念混淆",
                hint: `选项选错，可能混淆了相关概念 | 你的答案:${userAnswer.toUpperCase()}，正确:${correctAnswer.toUpperCase()}`
            };
        }

        return null;
    }

    // ===== 知识技能矩阵 =====

    buildSkillMatrix(answers) {
        const skillMastery = {};
        const skillQuestions = {};

        for (const ans of answers) {
            const skills = this.parseSkills(ans.skill_codes);
            for (const skill of skills) {
                if (!skillQuestions[skill]) skillQuestions[skill] = [];
                skillQuestions[skill].push({
                    correct: Boolean(ans.is_correct),
                    difficulty: ans.difficulty,
                    questionId: ans.question_id
                });
            }
        }

        for (const [skill, items] of Object.entries(skillQuestions)) {
            const correctCount = items.filter(i => i.correct).length;
            const totalCount = items.length;
            const rawRate = correctCount / totalCount;

            const slipProb = this.slipBase * (1 + items.filter(i => i.difficulty === "hard").length * 0.1);
            const guessProb = this.guessBase * (1 + items.filter(i => i.difficulty === "easy").length * 0.1);

            const pMasteryGivenCorrect =
                (rawRate * (1 - slipProb)) / (rawRate * (1 - slipProb) + (1 - rawRate) * guessProb);

            skillMastery[skill] = {
                mastery: Math.round(Math.max(0, Math.min(100, pMasteryGivenCorrect * 100))),
                accuracy: Math.round(rawRate * 100),
                confidence: Math.min(100, totalCount * 20),
                sampleSize: totalCount,
                correctCount,
                diagnosis: this.getDiagnosis(pMasteryGivenCorrect * 100),
                difficultyDistribution: {
                    easy: items.filter(i => i.difficulty === "easy").length,
                    medium: items.filter(i => i.difficulty === "medium").length,
                    hard: items.filter(i => i.difficulty === "hard").length
                }
            };
        }

        return skillMastery;
    }

    // ===== 根因分析 =====

    analyzeRootCause(answers, skillMastery, misconceptions) {
        const wrongAnswers = answers.filter(a => !a.is_correct);
        if (wrongAnswers.length === 0) return { primary: null, chain: [], depth: "shallow" };

        // 按技能聚合错误
        const wrongSkills = {};
        for (const ans of wrongAnswers) {
            const skills = this.parseSkills(ans.skill_codes);
            for (const skill of skills) {
                wrongSkills[skill] = (wrongSkills[skill] || 0) + 1;
            }
        }

        const sorted = Object.entries(wrongSkills).sort(([, a], [, b]) => b - a);
        const primary = sorted[0]
            ? {
                  skill: sorted[0][0],
                  errorCount: sorted[0][1],
                  mastery: skillMastery[sorted[0][0]] || { mastery: 0 }
              }
            : null;

        // 因果链: 按认知层次排列
        const chain = sorted.slice(0, 4).map(([skill, count]) => {
            const mastery = skillMastery[skill];
            return {
                skill,
                errorCount: count,
                mastery: mastery ? mastery.mastery : 0,
                cognitiveLevel: mastery ? this.inferCognitiveLevel(skill) : "未知",
                isRoot: count >= 3
            };
        });

        // 分析深度: 是概念层还是应用层
        const depth =
            primary && primary.mastery.mastery < 40
                ? "deep"
                : primary && primary.errorCount >= 3
                  ? "moderate"
                  : "shallow";

        return {
            primary,
            chain,
            depth,
            summary:
                depth === "deep"
                    ? `根因深层次: ${primary?.skill || "未知"} 概念掌握不牢，建议从基础重新学习`
                    : depth === "moderate"
                      ? `根因中层次: ${primary?.skill || "未知"} 需要针对性强化练习`
                      : `根因浅层次: 多为粗心或审题问题`
        };
    }

    inferCognitiveLevel(skill) {
        const skillMap = {
            定义: "记忆",
            概念: "记忆",
            公式: "记忆",
            理解: "理解",
            解释: "理解",
            比较: "理解",
            计算: "应用",
            求解: "应用",
            实现: "应用",
            分析: "分析",
            推理: "分析",
            证明: "分析",
            评价: "评价",
            判断: "评价",
            设计: "创造"
        };
        for (const [kw, level] of Object.entries(skillMap)) {
            if (skill.includes(kw)) return level;
        }
        return "理解";
    }

    // ===== 智能推荐 =====

    generateSmartRecommendations(dinaResult, bloomResult, misconceptions, skillMastery) {
        const recommendations = [];

        // 1. 认知属性推荐
        const weakAttrs = Object.entries(dinaResult.attributeMastery)
            .filter(([, v]) => v.state === "weak" || v.state === "beginner")
            .slice(0, 3);
        for (const [attr, data] of weakAttrs) {
            recommendations.push({
                type: "cognitive_attribute",
                target: attr,
                priority: data.state === "weak" ? "critical" : "high",
                action: this.getAttributeTraining(attr),
                practiceCount: Math.max(5, Math.round((1 - data.probability) * 20))
            });
        }

        // 2. Bloom层次推荐
        const weakBloom = Object.entries(bloomResult.levels)
            .filter(([, v]) => v.mastery < 50 && v.count > 0)
            .sort(([, a], [, b]) => a.mastery - b.mastery)
            .slice(0, 2);
        for (const [level, data] of weakBloom) {
            recommendations.push({
                type: "cognitive_level",
                target: level,
                priority: data.mastery < 30 ? "critical" : "high",
                action: this.getBloomLevelTraining(level),
                practiceCount: Math.max(3, Math.round((100 - data.mastery) / 20))
            });
        }

        // 3. 误区推荐
        if (misconceptions && misconceptions.categories) {
            for (const cat of misconceptions.categories.slice(0, 2)) {
                recommendations.push({
                    type: "misconception",
                    target: cat.category,
                    priority: cat.severity === "critical" ? "critical" : "high",
                    action: `针对"${cat.category}"进行专项纠错练习，先理解正确概念再做题`,
                    practiceCount: cat.count * 3
                });
            }
        }

        // 4. 薄弱技能推荐
        const weakSkills = Object.entries(skillMastery)
            .filter(([, v]) => v.mastery < 50)
            .sort(([, a], [, b]) => a.mastery - b.mastery)
            .slice(0, 2);
        for (const [skill, data] of weakSkills) {
            if (!recommendations.some(r => r.target === skill)) {
                recommendations.push({
                    type: "skill",
                    target: skill,
                    priority: data.mastery < 30 ? "critical" : "high",
                    action: `建议从${skill}的基础概念开始重新学习，配合基础练习题`,
                    practiceCount: Math.max(5, Math.round((100 - data.mastery) / 10))
                });
            }
        }

        return recommendations;
    }

    getAttributeTraining(attr) {
        const trainingMap = {
            概念理解: "使用概念图和对比表梳理相关概念，标记易混淆点",
            公式应用: "整理公式速查卡，做5道变形题练习公式的多种用法",
            计算能力: "限时计算训练，重点检查步骤完整性和进位借位",
            逻辑推理: "做推理题阶梯训练，从2步推理开始逐步增加复杂度",
            空间想象: "使用3D模型和几何画板进行可视化练习",
            归纳抽象: "做模式识别题，从具体案例中提取通用规律",
            记忆检索: "使用间隔重复和主动回忆法强化记忆",
            问题表征: "练习将文字描述转化为数学/逻辑表达式"
        };
        return trainingMap[attr] || `针对${attr}进行专项训练`;
    }

    getBloomLevelTraining(level) {
        const trainingMap = {
            记忆: "使用Anki卡片和间隔复习，强化基础概念回忆",
            理解: "用自己的话复述概念，画概念图展示知识点之间的连接",
            应用: "做变式题练习，同一公式在不同场景下的应用",
            分析: "分析错题原因，对比相似题目的解法差异",
            评价: "对已学方法进行对比评价，选最优解法并说明理由",
            创造: "尝试用已学知识解决新问题，或设计变体题目"
        };
        return trainingMap[level] || `提升${level}层次的认知能力`;
    }

    // ===== 诊断质量评估 =====

    calculateDiagnosisQuality(answers, dinaResult) {
        const coverage = Math.min(1, Object.keys(dinaResult.attributeMastery).length / this.attributes.length);
        const sampleSize = answers.length;
        const depth = sampleSize >= 20 ? "deep" : sampleSize >= 10 ? "moderate" : "shallow";
        const reliability = sampleSize >= 15 ? "high" : sampleSize >= 8 ? "medium" : "low";

        return { coverage: Math.round(coverage * 100), sampleSize, depth, reliability };
    }

    // ===== 工具方法 =====

    parseSkills(skillCodes) {
        if (!skillCodes) return ["general"];
        try {
            const parsed = typeof skillCodes === "string" ? JSON.parse(skillCodes) : skillCodes;
            return Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
            return String(skillCodes)
                .split(",")
                .map(s => s.trim())
                .filter(Boolean);
        }
    }

    getDiagnosis(mastery) {
        if (mastery < 30) return { level: "未掌握", action: "需要从头学习基础知识", color: "red" };
        if (mastery < 50) return { level: "薄弱", action: "需要针对性练习和概念强化", color: "orange" };
        if (mastery < 70) return { level: "发展中", action: "需要更多练习来巩固", color: "yellow" };
        if (mastery < 85) return { level: "基本掌握", action: "可以进行进阶应用练习", color: "blue" };
        return { level: "熟练掌握", action: "可以进入下一阶段学习", color: "green" };
    }

    // ===== 批量诊断 (用于报告) =====

    async batchDiagnoseBySubject(pool, userId) {
        try {
            const [answers] = await pool.query(
                `SELECT ua.question_id, ua.is_correct, ua.user_answer, q.node_id,
                        q.difficulty, q.question as content, q.skill_codes, q.correct_answer,
                        kp.subject
                 FROM user_answers ua
                 JOIN questions q ON ua.question_id = q.id
                 JOIN knowledge_points kp ON q.knowledge_id = kp.id
                 WHERE ua.user_id = ?
                 ORDER BY ua.created_at DESC
                 LIMIT 300`,
                [userId]
            );

            if (!answers.length) return {};

            const bySubject = {};
            for (const ans of answers) {
                const subject = ans.subject || "general";
                if (!bySubject[subject]) bySubject[subject] = [];
                bySubject[subject].push(ans);
            }

            const results = {};
            for (const [subject, subjectAnswers] of Object.entries(bySubject)) {
                results[subject] = {
                    dina: this.dinaDiagnose(subjectAnswers),
                    bloom: this.bloomAnalyze(subjectAnswers),
                    misconceptions: this.detectMisconceptions(subjectAnswers),
                    skillMastery: this.buildSkillMatrix(subjectAnswers),
                    answerCount: subjectAnswers.length,
                    accuracy: Math.round(
                        (subjectAnswers.filter(a => a.is_correct).length / subjectAnswers.length) * 100
                    )
                };
            }

            return results;
        } catch (e) {
            console.error("批量学科诊断失败:", e.message);
            return {};
        }
    }
}

module.exports = CognitiveDiagnosis;
