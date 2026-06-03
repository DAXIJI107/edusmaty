class EssayGrader {
    async grade(userId, question, answer, pool, options = {}) {
        const result = {
            score: 0,
            feedback: [],
            dimensions: {},
            suggestions: [],
            errorAnalysis: null
        };

        if (options.type === 'objective') {
            return this.gradeObjective(question, answer);
        }

        if (options.type === 'code') {
            return this.gradeCode(question, answer);
        }

        return this.gradeSubjective(question, answer, options);
    }

    gradeObjective(question, userAnswer) {
        const isCorrect = String(userAnswer).trim() === String(question.answer).trim();
        return {
            score: isCorrect ? 100 : 0,
            isCorrect,
            correctAnswer: question.answer,
            feedback: isCorrect
                ? [{ type: 'correct', message: '回答正确！' }]
                : [{ type: 'incorrect', message: `回答错误，正确答案是：${question.answer}` }]
        };
    }

    gradeCode(question, code) {
        const checks = {
            hasSyntax: this.checkSyntax(code),
            hasComments: /\/\/|\/\*|\*\/|#/.test(code),
            hasFunction: /function|def|class|const.*=|let.*=|var.*=/.test(code),
            hasReturn: /return|print|console\.log/.test(code),
            hasInput: /input|readline|prompt|scanf|cin/.test(code),
            hasLoop: /for|while|do\s*\{/.test(code),
            hasCondition: /if|else|switch|case/.test(code)
        };

        const passedChecks = Object.values(checks).filter(Boolean).length;
        const totalChecks = Object.keys(checks).length;
        const score = Math.round((passedChecks / totalChecks) * 100);

        const feedback = [];
        if (!checks.hasFunction) feedback.push({ type: 'warning', message: '建议定义函数或方法来组织代码' });
        if (!checks.hasComments) feedback.push({ type: 'info', message: '添加注释可以提高代码可读性' });
        if (!checks.hasReturn) feedback.push({ type: 'info', message: '确保代码有输出或返回结果' });

        return {
            score,
            checks,
            feedback,
            suggestions: [
                '检查代码是否处理了边界情况',
                '考虑添加输入验证',
                '尝试优化算法复杂度'
            ]
        };
    }

    gradeSubjective(question, answer, options) {
        const dimensions = {
            relevance: this.evaluateRelevance(answer, question),
            clarity: this.evaluateClarity(answer),
            structure: this.evaluateStructure(answer),
            depth: this.evaluateDepth(answer),
            evidence: this.evaluateEvidence(answer)
        };

        const totalScore = Math.round(
            (dimensions.relevance * 0.3 + dimensions.clarity * 0.2 +
             dimensions.structure * 0.2 + dimensions.depth * 0.15 +
             dimensions.evidence * 0.15)
        );

        const feedback = this.generateFeedback(dimensions, answer);
        const suggestions = this.generateSuggestions(dimensions, answer);

        return {
            score: totalScore,
            dimensions,
            feedback,
            suggestions,
            highlights: this.generateHighlights(answer),
            errorAnalysis: this.analyzeErrors(answer)
        };
    }

    evaluateRelevance(answer, question) {
        const keywords = this.extractKeywords(question);
        const matchedCount = keywords.filter(k => answer.includes(k)).length;
        return Math.min(100, Math.round((matchedCount / Math.max(keywords.length, 1)) * 100));
    }

    evaluateClarity(text) {
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim());
        if (sentences.length === 0) return 0;

        const avgLength = sentences.reduce((s, sen) => s + sen.length, 0) / sentences.length;
        if (avgLength > 80) return 40;
        if (avgLength > 50) return 60;
        if (avgLength > 20) return 80;
        return 90;
    }

    evaluateStructure(text) {
        let score = 40;
        if (text.includes('首先') || text.includes('第一')) score += 15;
        if (text.includes('其次') || text.includes('第二')) score += 15;
        if (text.includes('最后') || text.includes('总之') || text.includes('综上所述')) score += 15;
        if (text.split('\n').filter(p => p.trim()).length > 1) score += 15;
        return Math.min(100, score);
    }

    evaluateDepth(text) {
        let score = 30;
        const depthIndicators = ['因为', '所以', '因此', '本质', '根源', '影响', '意义',
            '原理', '机制', '分析', '对比', '类比', '例如', '比如'];
        const matched = depthIndicators.filter(i => text.includes(i)).length;
        score += matched * 5;
        if (text.length > 200) score += 10;
        if (text.length > 500) score += 10;
        return Math.min(100, score);
    }

    evaluateEvidence(text) {
        let score = 20;
        if (/\d+/.test(text)) score += 20;
        if (text.includes('例如') || text.includes('比如') || text.includes('如')) score += 20;
        if (text.includes('研究表明') || text.includes('数据显示') || text.includes('据统计')) score += 20;
        if (text.includes('"') || text.includes('「') || text.includes('《')) score += 20;
        return Math.min(100, score);
    }

    generateFeedback(dimensions, answer) {
        const feedback = [];

        if (dimensions.relevance < 50) {
            feedback.push({
                type: 'warning',
                dimension: '相关性',
                message: '回答与问题的相关性不足，建议紧扣题目要求作答'
            });
        }

        if (dimensions.clarity < 60) {
            feedback.push({
                type: 'suggestion',
                dimension: '清晰度',
                message: '部分句子过长，建议拆分以提高可读性'
            });
        }

        if (dimensions.structure < 60) {
            feedback.push({
                type: 'suggestion',
                dimension: '结构',
                message: '建议使用"首先、其次、最后"等连接词来组织内容'
            });
        }

        if (dimensions.depth < 50) {
            feedback.push({
                type: 'warning',
                dimension: '深度',
                message: '分析较浅，建议深入探讨原因和影响'
            });
        }

        if (dimensions.evidence < 50) {
            feedback.push({
                type: 'suggestion',
                dimension: '论据',
                message: '建议补充具体例子或数据来支持论点'
            });
        }

        if (feedback.length === 0) {
            feedback.push({ type: 'praise', message: '回答质量较高，继续保持！' });
        }

        return feedback;
    }

    generateSuggestions(dimensions, answer) {
        const suggestions = [];

        if (dimensions.structure < 70) {
            suggestions.push({
                type: 'structure',
                title: '结构优化示例',
                content: '你可以这样组织：首先阐述核心概念，其次分析关键机制，最后总结应用意义。'
            });
        }

        if (dimensions.evidence < 60) {
            suggestions.push({
                type: 'evidence',
                title: '论据补充建议',
                content: '尝试加入具体案例或数据支持，例如"根据XX研究显示..."'
            });
        }

        return suggestions;
    }

    generateHighlights(text) {
        const highlights = [];
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim());

        for (const sentence of sentences) {
            if (this.isKeySentence(sentence)) {
                highlights.push({
                    text: sentence.trim(),
                    type: 'key_point',
                    color: 'yellow'
                });
            }
            if (sentence.length < 20 && sentence.includes('是')) {
                highlights.push({
                    text: sentence.trim(),
                    type: 'definition',
                    color: 'blue'
                });
            }
        }

        return highlights;
    }

    analyzeErrors(text) {
        const errors = [];
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim());

        for (let i = 0; i < sentences.length - 1; i++) {
            const current = sentences[i];
            const next = sentences[i + 1];
            if (!current.includes('首先') && !current.includes('第一') &&
                !next.includes('其次') && !next.includes('第二') &&
                !next.includes('最后') && !next.includes('总之')) {
                if (current.length > 30 && next.length > 30) {
                    errors.push({
                        type: 'transition',
                        location: `第${i + 1}段到第${i + 2}段`,
                        suggestion: '段落之间建议添加过渡语句'
                    });
                }
            }
        }

        return errors.length > 0 ? { errors, count: errors.length } : null;
    }

    extractKeywords(text) {
        const stopWords = ['的', '了', '是', '在', '和', '就', '都', '而', '及', '与'];
        const chars = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
        const words = chars.split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w));
        return [...new Set(words)];
    }

    isKeySentence(sentence) {
        const indicators = ['因此', '所以', '总之', '综上所述', '关键', '核心', '本质', '重要'];
        return indicators.some(i => sentence.includes(i));
    }
}

module.exports = EssayGrader;