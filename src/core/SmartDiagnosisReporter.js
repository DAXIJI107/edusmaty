// core/SmartDiagnosisReporter.js
// 智能诊断报告生成器 - 融合CAT+BKT+DINA+Cognitive的多维报告

const KnowledgeTracingEngine = require('./KnowledgeTracingEngine');
const CognitiveDiagnosis = require('./CognitiveDiagnosis');

class SmartDiagnosisReporter {
    constructor(pool) {
        this.pool = pool;
        this.bkt = new KnowledgeTracingEngine();
        this.cognitive = new CognitiveDiagnosis();
    }

    /**
     * 生成综合智能诊断报告
     * @param {Object} options
     * @param {number} options.userId
     * @param {Object} options.catResult - CAT自适应测试结果
     * @param {Object} options.profile - 学生画像
     * @param {string} options.subject - 学科过滤(可选)
     */
    async generateReport({ userId, catResult, profile, subject }) {
        // 1. BKT知识追踪
        const bktMastery = await this.bkt.batchEstimateMastery(this.pool, userId);

        // 2. DINA认知诊断
        const cognitiveResult = await this.cognitive.batchDiagnoseBySubject(this.pool, userId);

        // 3. 生成各维度报告
        const radar = this.generateRadarData(catResult, profile, cognitiveResult, bktMastery);
        const knowledgeHeatmap = this.generateKnowledgeHeatmap(bktMastery, subject);
        const bloomPyramid = this.generateBloomPyramid(cognitiveResult, catResult);
        const misconceptionCards = this.generateMisconceptionCards(cognitiveResult);
        const strengthAnalysis = this.generateStrengthAnalysis(catResult, cognitiveResult, bktMastery);
        const learningPathSuggestion = this.generateLearningPathSuggestion(
            catResult, cognitiveResult, bktMastery, profile
        );
        const progressProjection = this.generateProgressProjection(bktMastery, profile);

        const summary = this.generateSummary(
            catResult, cognitiveResult, radar, strengthAnalysis
        );

        return {
            timestamp: new Date().toISOString(),
            userId,
            subject: subject || 'all',
            summary,
            radar,
            knowledgeHeatmap,
            bloomPyramid,
            misconceptionCards,
            strengthAnalysis,
            learningPathSuggestion,
            progressProjection,
            diagnosisQuality: this.calculateOverallQuality(catResult, cognitiveResult, bktMastery),
            generatedAt: new Date().toISOString()
        };
    }

    // ===== 多维度雷达图数据 =====

    generateRadarData(catResult, profile, cognitiveResult, bktMastery) {
        const dimensions = {
            labels: [
                '知识掌握', '认知能力', '学习韧性',
                '逻辑推理', '计算能力', '概念理解',
                '应用能力', '元认知'
            ],
            datasets: [{
                label: '当前诊断',
                data: [
                    this.calcKnowledgeScore(bktMastery),
                    this.calcCognitiveScore(catResult, cognitiveResult),
                    this.calcResilienceScore(profile),
                    this.calcLogicScore(cognitiveResult),
                    this.calcComputationScore(cognitiveResult),
                    this.calcConceptScore(cognitiveResult),
                    this.calcApplicationScore(cognitiveResult),
                    this.calcMetaCognitionScore(catResult, profile)
                ],
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderColor: 'rgba(99, 102, 241, 0.8)',
                borderWidth: 2
            }]
        };

        // 如果有历史数据，添加对比
        if (profile && profile._previousReport) {
            dimensions.datasets.push({
                label: '上次诊断',
                data: profile._previousReport.radar?.datasets?.[0]?.data || [],
                backgroundColor: 'rgba(156, 163, 175, 0.1)',
                borderColor: 'rgba(156, 163, 175, 0.5)',
                borderWidth: 1.5,
                borderDash: [4, 4]
            });
        }

        return dimensions;
    }

    calcKnowledgeScore(bktMastery) {
        const values = Object.values(bktMastery).map(v => v.mastery || 0);
        if (!values.length) return 50;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100);
    }

    calcCognitiveScore(catResult, cognitiveResult) {
        if (catResult) return Math.round((catResult.abilityEstimate + 3) / 6 * 100);
        return 50;
    }

    calcResilienceScore(profile) {
        return Math.round((profile?.emotionalTraits?.['学习韧性'] || 0.7) * 100);
    }

    calcLogicScore(cognitiveResult) {
        if (!cognitiveResult) return 50;
        const logicAttrs = Object.entries(cognitiveResult)
            .filter(([subject]) => subject === '编程' || subject === '数学')
            .flatMap(([, data]) => data.dina?.attributeMastery || {});
        const logicScores = Object.entries(logicAttrs)
            .filter(([k]) => k === '逻辑推理')
            .map(([, v]) => v.mastery || 0);
        return logicScores.length > 0
            ? Math.round(logicScores.reduce((a, b) => a + b, 0) / logicScores.length)
            : 50;
    }

    calcComputationScore(cognitiveResult) {
        if (!cognitiveResult) return 50;
        const allAttrs = Object.values(cognitiveResult)
            .flatMap(d => Object.entries(d.dina?.attributeMastery || {}));
        const compScores = allAttrs
            .filter(([k]) => k === '计算能力' || k === '公式应用')
            .map(([, v]) => v.mastery || 0);
        return compScores.length > 0
            ? Math.round(compScores.reduce((a, b) => a + b, 0) / compScores.length)
            : 50;
    }

    calcConceptScore(cognitiveResult) {
        if (!cognitiveResult) return 50;
        const allAttrs = Object.values(cognitiveResult)
            .flatMap(d => Object.entries(d.dina?.attributeMastery || {}));
        const conceptScores = allAttrs
            .filter(([k]) => k === '概念理解' || k === '记忆检索')
            .map(([, v]) => v.mastery || 0);
        return conceptScores.length > 0
            ? Math.round(conceptScores.reduce((a, b) => a + b, 0) / conceptScores.length)
            : 50;
    }

    calcApplicationScore(cognitiveResult) {
        if (!cognitiveResult) return 50;
        const allBlooms = Object.values(cognitiveResult)
            .flatMap(d => Object.entries(d.bloom?.levels || {}));
        const appScores = allBlooms
            .filter(([k]) => k === '应用' || k === '分析' || k === '创造')
            .map(([, v]) => v.mastery || 0);
        return appScores.length > 0
            ? Math.round(appScores.reduce((a, b) => a + b, 0) / appScores.length)
            : 50;
    }

    calcMetaCognitionScore(catResult, profile) {
        const se = catResult?.abilitySE || 2;
        const reliability = Math.max(0, 1 - se / 2);
        const selfAwareness = profile?.learningPatterns?.['学习习惯']?.length > 0 ? 0.7 : 0.4;
        return Math.round((reliability * 0.6 + selfAwareness * 0.4) * 100);
    }

    // ===== 知识热度图 =====

    generateKnowledgeHeatmap(bktMastery, filterSubject) {
        const nodes = Object.values(bktMastery);
        if (!nodes.length) return { nodes: [], summary: '暂无知识追踪数据' };

        const filtered = filterSubject
            ? nodes.filter(n => n.subject === filterSubject)
            : nodes;

        const heatmapNodes = filtered
            .sort((a, b) => (a.mastery || 0) - (b.mastery || 0))
            .map(n => ({
                id: n.knowledgeId,
                title: n.title || '未命名知识点',
                subject: n.subject || '综合',
                mastery: Math.round((n.mastery || 0) * 100),
                state: n.state || 'beginner',
                confidence: Math.round((n.confidence || 0) * 100),
                observationCount: n.observationCount || 0,
                color: (n.mastery || 0) >= 0.85 ? '#22c55e' :
                       (n.mastery || 0) >= 0.6 ? '#6366f1' :
                       (n.mastery || 0) >= 0.3 ? '#f59e0b' : '#ef4444'
            }));

        const masteredCount = heatmapNodes.filter(n => n.state === 'mastered').length;
        const learningCount = heatmapNodes.filter(n => n.state === 'learning').length;
        const beginnerCount = heatmapNodes.filter(n => n.state === 'beginner' || n.state === 'not_started').length;

        return {
            nodes: heatmapNodes.slice(0, 30), // 最多30个
            summary: `共${heatmapNodes.length}个知识点: 已掌握${masteredCount}个, 学习中${learningCount}个, 待学习${beginnerCount}个`,
            stats: {
                total: heatmapNodes.length,
                mastered: masteredCount,
                learning: learningCount,
                beginner: beginnerCount,
                overallMastery: heatmapNodes.length > 0
                    ? Math.round(heatmapNodes.reduce((s, n) => s + n.mastery, 0) / heatmapNodes.length)
                    : 0
            }
        };
    }

    // ===== Bloom认知金字塔 =====

    generateBloomPyramid(cognitiveResult, catResult) {
        // 聚合所有学科的Bloom数据
        const aggregated = { '记忆': 0, '理解': 0, '应用': 0, '分析': 0, '评价': 0, '创造': 0 };
        const aggregatedCorrect = { '记忆': 0, '理解': 0, '应用': 0, '分析': 0, '评价': 0, '创造': 0 };

        if (cognitiveResult) {
            for (const [, data] of Object.entries(cognitiveResult)) {
                if (data.bloom?.levels) {
                    for (const [level, levelData] of Object.entries(data.bloom.levels)) {
                        aggregated[level] = (aggregated[level] || 0) + (levelData.count || 0);
                        aggregatedCorrect[level] = (aggregatedCorrect[level] || 0) +
                            Math.round((levelData.accuracy || 0) / 100 * (levelData.count || 0));
                    }
                }
            }
        }

        const pyramidLevels = [
            { level: '创造', color: '#8b5cf6', icon: 'sparkles' },
            { level: '评价', color: '#06b6d4', icon: 'scale' },
            { level: '分析', color: '#22c55e', icon: 'search' },
            { level: '应用', color: '#f59e0b', icon: 'wrench' },
            { level: '理解', color: '#6366f1', icon: 'book-open' },
            { level: '记忆', color: '#ef4444', icon: 'brain' }
        ];

        const levels = pyramidLevels.map(({ level, color, icon }) => {
            const count = aggregated[level] || 0;
            const correct = aggregatedCorrect[level] || 0;
            const mastery = count > 0 ? Math.round(correct / count * 100) : 0;
            return {
                level,
                count,
                mastery,
                color,
                icon,
                status: mastery >= 75 ? 'strong' : mastery >= 50 ? 'moderate' : mastery >= 25 ? 'weak' : 'undeveloped'
            };
        });

        // 计算总分
        const totalScore = levels.reduce((s, l) => s + l.mastery * (l.count || 1), 0);
        const totalWeight = levels.reduce((s, l) => s + (l.count || 1), 0);
        const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

        return {
            levels,
            overallScore,
            dominantLevel: levels.reduce((best, l) =>
                l.mastery > (best?.mastery || 0) ? l : best, null)?.level || '记忆',
            interpretation: this.interpretBloomPyramid(levels)
        };
    }

    interpretBloomPyramid(levels) {
        const strongCount = levels.filter(l => l.status === 'strong').length;
        const weakCount = levels.filter(l => l.status === 'weak' || l.status === 'undeveloped').length;

        if (strongCount >= 4) {
            return '认知层次发展均衡，高阶思维能力较强，可以挑战创新性问题';
        } else if (strongCount >= 2) {
            return '中阶认知能力较好，但高阶思维（分析/评价/创造）尚需加强';
        } else if (weakCount >= 3) {
            return '认知层次集中在低阶（记忆/理解），建议逐步提升到应用和分析层次';
        } else {
            return '认知层次处于发展初期，建议先巩固记忆和理解层次';
        }
    }

    // ===== 误区卡片 =====

    generateMisconceptionCards(cognitiveResult) {
        if (!cognitiveResult) return { cards: [], summary: '暂无误区数据' };

        const allMisconceptions = [];
        for (const [subject, data] of Object.entries(cognitiveResult)) {
            if (data.misconceptions?.categories) {
                for (const cat of data.misconceptions.categories) {
                    allMisconceptions.push({
                        ...cat,
                        subject
                    });
                }
            }
        }

        allMisconceptions.sort((a, b) => b.count - a.count);

        const cards = allMisconceptions.slice(0, 10).map((mc, index) => ({
            id: `mc-${index}`,
            category: mc.category,
            subject: mc.subject,
            count: mc.count,
            percentage: mc.percentage,
            severity: mc.severity,
            sampleQuestions: (mc.sampleQuestions || []).map(q => ({
                content: q.content,
                userAnswer: q.userAnswer,
                correctAnswer: q.correctAnswer,
                hint: q.hint
            })),
            suggestion: this.getMisconceptionSuggestion(mc.category),
            severityColor: mc.severity === 'critical' ? '#ef4444' :
                           mc.severity === 'moderate' ? '#f59e0b' : '#6366f1'
        }));

        return {
            cards,
            totalCount: allMisconceptions.length,
            criticalCount: allMisconceptions.filter(m => m.severity === 'critical').length,
            topCategory: cards[0]?.category || '无',
            summary: cards.length > 0
                ? `发现${allMisconceptions.length}类误区，${allMisconceptions.filter(m => m.severity === 'critical').length}个为严重级别`
                : '未检测到明显误区'
        };
    }

    getMisconceptionSuggestion(category) {
        const suggestions = {
            '概念混淆': '制作对比表，将易混淆概念并列比较，标注核心区别',
            '运算错误': '培养分步验算习惯，每道题完成后用替代方法验证',
            '审题不清': '使用"三遍读题法"：读题→画关键词→用自己的话复述题意',
            '公式误用': '整理公式适用条件表，每个公式标注"使用前提"',
            '逻辑跳跃': '强制写出完整推理步骤，即使简单的推导也要写全',
            '单位/符号错误': '做题前先列出已知量和单位，统一换算后再计算',
            '先验知识不足': '回到前置知识点，先用20分钟复习基础再继续',
            '未分类': '记录错题详细信息，积累更多数据后可精确分类'
        };
        return suggestions[category] || '记录错题，定期回顾错误模式';
    }

    // ===== 优劣势分析 =====

    generateStrengthAnalysis(catResult, cognitiveResult, bktMastery) {
        const strengths = [];
        const weaknesses = [];

        // CAT分析
        if (catResult?.subjectAnalysis) {
            for (const [subject, data] of Object.entries(catResult.subjectAnalysis)) {
                if (data.state === 'strong') {
                    strengths.push({ type: 'subject', item: subject, detail: `正确率 ${data.accuracy}%` });
                } else if (data.state === 'weak') {
                    weaknesses.push({ type: 'subject', item: subject, detail: `正确率 ${data.accuracy}%` });
                }
            }
        }

        // BKT分析
        const masteredNodes = Object.values(bktMastery)
            .filter(n => n.state === 'mastered')
            .slice(0, 3);
        const weakNodes = Object.values(bktMastery)
            .filter(n => n.state === 'beginner' || n.state === 'not_started')
            .slice(0, 3);

        for (const node of masteredNodes) {
            strengths.push({
                type: 'knowledge',
                item: node.title,
                detail: `掌握度 ${Math.round(node.mastery * 100)}%`
            });
        }
        for (const node of weakNodes) {
            weaknesses.push({
                type: 'knowledge',
                item: node.title,
                detail: `掌握度 ${Math.round(node.mastery * 100)}%`
            });
        }

        // 认知属性分析
        if (cognitiveResult) {
            const allAttrs = Object.values(cognitiveResult)
                .flatMap(d => Object.entries(d.dina?.attributeMastery || {}));
            const strongAttrs = allAttrs.filter(([, v]) => v.state === 'mastered').slice(0, 2);
            const weakAttrs = allAttrs.filter(([, v]) => v.state === 'weak' || v.state === 'beginner').slice(0, 2);

            for (const [attr, data] of strongAttrs) {
                if (!strengths.find(s => s.item === attr)) {
                    strengths.push({ type: 'attribute', item: attr, detail: `概率 ${data.probability}` });
                }
            }
            for (const [attr, data] of weakAttrs) {
                if (!weaknesses.find(w => w.item === attr)) {
                    weaknesses.push({ type: 'attribute', item: attr, detail: `概率 ${data.probability}` });
                }
            }
        }

        return {
            strengths: strengths.slice(0, 5),
            weaknesses: weaknesses.slice(0, 5),
            ratio: strengths.length / Math.max(1, weaknesses.length),
            trend: strengths.length > weaknesses.length ? 'positive' :
                   strengths.length === weaknesses.length ? 'balanced' : 'needs_improvement'
        };
    }

    // ===== 学习路径建议 =====

    generateLearningPathSuggestion(catResult, cognitiveResult, bktMastery, profile) {
        const suggestions = [];

        // 从BKT找出最需要学习的3个知识点
        const sortedNodes = Object.values(bktMastery)
            .sort((a, b) => (a.mastery || 0) - (b.mastery || 0));

        const urgentNodes = sortedNodes.slice(0, 3);
        for (const node of urgentNodes) {
            const mastery = node.mastery || 0;
            suggestions.push({
                type: 'knowledge_gap',
                priority: mastery < 0.3 ? 'critical' : mastery < 0.6 ? 'high' : 'medium',
                target: node.title,
                subject: node.subject,
                currentMastery: Math.round(mastery * 100),
                action: mastery < 0.3
                    ? `从${node.title}的基础概念开始学习，使用视频+概念图`
                    : `进行${node.title}专项练习，目标掌握度70%`,
                estimatedTime: mastery < 0.3 ? '45分钟' : '25分钟',
                resources: ['概念导学', '基础练习', '进阶应用']
            });
        }

        // 从认知诊断找弱势Bloom层次
        if (cognitiveResult) {
            const allBlooms = Object.values(cognitiveResult)
                .flatMap(d => Object.entries(d.bloom?.levels || {}));
            const aggregatedBlooms = {};
            for (const [level, data] of allBlooms) {
                if (!aggregatedBlooms[level]) aggregatedBlooms[level] = { mastery: 0, count: 0 };
                aggregatedBlooms[level].mastery += data.mastery || 0;
                aggregatedBlooms[level].count++;
            }

            const weakBlooms = Object.entries(aggregatedBlooms)
                .filter(([, d]) => d.count > 0 && d.mastery / d.count < 50)
                .sort(([, a], [, b]) => (a.mastery / a.count) - (b.mastery / b.count))
                .slice(0, 2);

            for (const [level, data] of weakBlooms) {
                suggestions.push({
                    type: 'cognitive_development',
                    priority: 'medium',
                    target: level,
                    currentMastery: Math.round(data.mastery / data.count),
                    action: `通过${level}层级专项训练提升认知能力`,
                    estimatedTime: '30分钟',
                    resources: [`${level}层例题`, '变式练习', '反思总结']
                });
            }
        }

        return {
            suggestions,
            totalSteps: suggestions.length,
            estimatedTotalTime: suggestions.reduce((sum, s) => {
                const mins = parseInt(s.estimatedTime) || 0;
                return sum + mins;
            }, 0),
            nextAction: suggestions[0] || null
        };
    }

    // ===== 进度预测 =====

    generateProgressProjection(bktMastery, profile) {
        const nodes = Object.values(bktMastery);
        if (!nodes.length) return { projection: [], confidence: 'low' };

        const currentMastery = nodes.reduce((s, n) => s + (n.mastery || 0), 0) / nodes.length;

        // 简单线性投影: 基于当前学习速度估计
        const weeklyImprovement = profile?.learningPatterns?.['学习速度'] === 'fast'
            ? 0.1 : profile?.learningPatterns?.['学习速度'] === 'slow' ? 0.03 : 0.06;

        const projection = [];
        const weeks = [1, 2, 4, 8, 12];
        for (const week of weeks) {
            const projectedMastery = Math.min(0.99, currentMastery + weeklyImprovement * week);
            projection.push({
                week,
                projectedMastery: Math.round(projectedMastery * 100),
                label: week === 1 ? '1周后' : week === 4 ? '1个月后' : week === 12 ? '3个月后' : `${week}周后`
            });
        }

        const targetMastery = 0.8;
        const weeksToTarget = currentMastery < targetMastery
            ? Math.ceil((targetMastery - currentMastery) / weeklyImprovement)
            : 0;

        return {
            projection,
            currentOverallMastery: Math.round(currentMastery * 100),
            weeklyImprovementRate: Math.round(weeklyImprovement * 100),
            weeksToTarget,
            estimatedTargetDate: weeksToTarget > 0
                ? new Date(Date.now() + weeksToTarget * 7 * 86400000).toISOString().split('T')[0]
                : '已达到目标',
            confidence: nodes.length >= 15 ? 'high' : nodes.length >= 8 ? 'medium' : 'low'
        };
    }

    // ===== 报告摘要 =====

    generateSummary(catResult, cognitiveResult, radar, strengthAnalysis) {
        const overallScore = radar?.datasets?.[0]?.data
            ? Math.round(radar.datasets[0].data.reduce((a, b) => a + b, 0) / radar.datasets[0].data.length)
            : 0;

        const grade = overallScore >= 85 ? 'A (优秀)' :
                      overallScore >= 70 ? 'B (良好)' :
                      overallScore >= 55 ? 'C (中等)' :
                      overallScore >= 40 ? 'D (需努力)' : 'E (需重点帮助)';

        const primaryStrength = strengthAnalysis?.strengths?.[0]?.item || '待评估';
        const primaryWeakness = strengthAnalysis?.weaknesses?.[0]?.item || '待评估';

        let description = '';
        if (overallScore >= 85) {
            description = `整体表现优秀。${primaryStrength}方面表现突出，可以挑战更高难度内容。持续保持并关注${primaryWeakness}的细微提升空间。`;
        } else if (overallScore >= 70) {
            description = `整体表现良好。${primaryStrength}是优势领域，但${primaryWeakness}需要针对性强化，建议制定专项提升计划。`;
        } else if (overallScore >= 55) {
            description = `处于中等水平。${primaryStrength}有一定基础，但${primaryWeakness}薄弱影响整体表现，建议优先补强。`;
        } else {
            description = `基础较薄弱，尤其在${primaryWeakness}方面。建议从基础知识开始系统学习，建立扎实根基。`;
        }

        return {
            grade,
            overallScore,
            primaryStrength,
            primaryWeakness,
            description,
            keyTakeaways: [
                strengthAnalysis?.strengths?.[0]
                    ? `优势领域: ${strengthAnalysis.strengths[0].item}`
                    : '暂无明显优势领域',
                strengthAnalysis?.weaknesses?.[0]
                    ? `待加强: ${strengthAnalysis.weaknesses[0].item}`
                    : '暂无明显薄弱领域',
                `综合评分: ${overallScore}/100 (${grade})`
            ]
        };
    }

    // ===== 整体诊断质量 =====

    calculateOverallQuality(catResult, cognitiveResult, bktMastery) {
        const bktNodes = Object.keys(bktMastery).length;
        const cognitiveSubjects = cognitiveResult ? Object.keys(cognitiveResult).length : 0;
        const catQuestions = catResult?.questionsAnswered || 0;

        const dataRichness = bktNodes >= 10 && cognitiveSubjects >= 2 && catQuestions >= 8
            ? 'rich' : bktNodes >= 5 ? 'adequate' : 'sparse';

        const reliability = (catResult?.abilitySE || 2) < 0.35
            ? 'high' : (catResult?.abilitySE || 2) < 0.55 ? 'medium' : 'low';

        return {
            overall: reliability === 'high' && dataRichness === 'rich' ? 'high' :
                     reliability === 'low' || dataRichness === 'sparse' ? 'low' : 'medium',
            catReliability: reliability,
            dataRichness,
            metrics: {
                bktKnowledgeNodes: bktNodes,
                cognitiveDiagnosisSubjects: cognitiveSubjects,
                catQuestionsAnswered: catQuestions,
                catStandardError: catResult?.abilitySE ? Math.round(catResult.abilitySE * 100) / 100 : null
            }
        };
    }
}

module.exports = SmartDiagnosisReporter;