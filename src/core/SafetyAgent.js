// core/SafetyAgent.js
// 安全智能体 - 负责内容安全过滤和防幻觉检测

class SafetyAgent {
    constructor() {
        this.forbiddenPatterns = [
            // 敏感内容
            /(敏感|违法|色情|暴力|赌博|毒品|政治)/i,
            /(攻击|辱骂|歧视|仇恨)/i,
            /(病毒|黑客|破解|入侵)/i,
            // 隐私信息
            /(\d{11,}|身份证号|护照号|银行卡号)/,
            /(手机号|电话|邮箱|地址)/i,
            // 危险指令
            /(删除|格式化|rm -rf|del)/i,
            /(执行|运行|启动).*(程序|脚本)/i,
            // 学术不端
            /(代写|代考|作弊|抄袭)/i,
            /(论文代写|作业代做)/i
        ];

        this.hallucinationKeywords = ["可能", "也许", "大概", "据说", "听说", "不一定", "可能是", "似乎", "好像"];

        this.academicFactCheck = {
            数学: ["定理", "公式", "证明", "推导"],
            物理: ["定律", "公式", "实验", "原理"],
            化学: ["反应", "方程式", "元素", "化合物"],
            英语: ["语法", "词汇", "时态", "句型"],
            编程: ["语法", "函数", "类", "算法"]
        };
    }

    async handleMessage(message) {
        console.log("SafetyAgent received message:", message);
        try {
            switch (message.type) {
                case "validate":
                    return this.validateContent(message.content);
                case "check_hallucination":
                    return this.checkHallucination(message.content);
                case "filter":
                    return this.filterContent(message.content);
                case "fact_check":
                    return this.factCheck(message.content, message.subject);
                default:
                    throw new Error("Unsupported message type");
            }
        } catch (error) {
            console.error("SafetyAgent error:", error);
            return { error: error.message };
        }
    }

    validateContent(content) {
        const violations = [];

        for (const pattern of this.forbiddenPatterns) {
            if (pattern.test(content)) {
                violations.push({
                    type: "content_filter",
                    message: `检测到敏感内容`,
                    pattern: pattern.toString()
                });
            }
        }

        // 检查内容长度
        if (content.length > 10000) {
            violations.push({
                type: "length_limit",
                message: "内容长度超出限制"
            });
        }

        // 检查内容为空
        if (!content.trim()) {
            violations.push({
                type: "empty_content",
                message: "内容为空"
            });
        }

        return {
            valid: violations.length === 0,
            violations: violations,
            contentLength: content.length
        };
    }

    checkHallucination(content) {
        const indicators = [];

        // 检查不确定性关键词
        for (const keyword of this.hallucinationKeywords) {
            if (content.includes(keyword)) {
                indicators.push({
                    type: "uncertainty",
                    keyword: keyword,
                    count: (content.match(new RegExp(keyword, "g")) || []).length
                });
            }
        }

        // 检查过度自信表述
        const overconfidencePatterns = [/(绝对|完全|一定|必然|无疑)/i, /(100%|百分之百)/i, /(唯一|最佳|顶级)/i];
        for (const pattern of overconfidencePatterns) {
            if (pattern.test(content)) {
                indicators.push({
                    type: "overconfidence",
                    pattern: pattern.toString()
                });
            }
        }

        // 检查事实性陈述
        const factPatterns = [/(研究表明|数据显示|科学证明)/i, /(根据.*研究|依据.*报告)/i];
        let hasFactualClaims = false;
        for (const pattern of factPatterns) {
            if (pattern.test(content)) {
                hasFactualClaims = true;
                indicators.push({
                    type: "factual_claim",
                    pattern: pattern.toString()
                });
            }
        }

        const riskLevel = this.calculateRiskLevel(indicators, hasFactualClaims);

        return {
            hasHallucinationRisk: riskLevel >= "medium",
            riskLevel: riskLevel,
            indicators: indicators,
            suggestion: this.getSuggestion(riskLevel)
        };
    }

    calculateRiskLevel(indicators, hasFactualClaims) {
        const uncertaintyCount = indicators.filter(i => i.type === "uncertainty").length;
        const overconfidenceCount = indicators.filter(i => i.type === "overconfidence").length;

        if (overconfidenceCount > 2) return "high";
        if (uncertaintyCount > 3 && hasFactualClaims) return "high";
        if (overconfidenceCount > 0 && hasFactualClaims) return "medium";
        if (uncertaintyCount > 2) return "medium";
        return "low";
    }

    getSuggestion(riskLevel) {
        const suggestions = {
            high: "内容存在较高幻觉风险，建议人工复核或引用权威来源验证",
            medium: "内容存在一定幻觉风险，建议标注不确定性或提供参考资料",
            low: "内容风险较低，可以正常使用"
        };
        return suggestions[riskLevel];
    }

    filterContent(content) {
        let filtered = content;

        // 替换敏感内容
        for (const pattern of this.forbiddenPatterns) {
            filtered = filtered.replace(pattern, "[内容已过滤]");
        }

        // 脱敏处理
        filtered = filtered.replace(/(\d{3})\d{4}(\d{4})/g, "$1****$2");
        filtered = filtered.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)/g, "***@***");

        return {
            originalLength: content.length,
            filteredLength: filtered.length,
            filteredContent: filtered,
            modified: filtered !== content
        };
    }

    async factCheck(content, subject) {
        const checks = [];

        if (!subject) {
            return {
                checked: false,
                message: "未指定学科，跳过事实检查"
            };
        }

        const expectedKeywords = this.academicFactCheck[subject] || [];
        const foundKeywords = [];

        for (const keyword of expectedKeywords) {
            if (content.includes(keyword)) {
                foundKeywords.push(keyword);
            }
        }

        checks.push({
            type: "keyword_check",
            subject: subject,
            expectedKeywords: expectedKeywords,
            foundKeywords: foundKeywords,
            coverage:
                expectedKeywords.length > 0
                    ? ((foundKeywords.length / expectedKeywords.length) * 100).toFixed(1)
                    : "N/A"
        });

        // 检查逻辑一致性
        const consistencyScore = this.checkLogicalConsistency(content);
        checks.push({
            type: "logical_consistency",
            score: consistencyScore,
            message: consistencyScore >= 70 ? "逻辑一致性良好" : "建议检查逻辑连贯性"
        });

        return {
            checked: true,
            checks: checks,
            overallScore: this.calculateOverallScore(checks)
        };
    }

    checkLogicalConsistency(content) {
        // 简单的逻辑一致性检查
        const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 5);

        if (sentences.length < 3) return 100;

        let consistentCount = 0;
        for (let i = 0; i < sentences.length - 1; i++) {
            const current = sentences[i].toLowerCase();
            const next = sentences[i + 1].toLowerCase();

            // 检查是否有明显矛盾
            const contradictingPairs = [
                ["正确", "错误"],
                ["是", "不是"],
                ["有", "没有"],
                ["可以", "不可以"]
            ];

            let isConsistent = true;
            for (const [positive, negative] of contradictingPairs) {
                if (current.includes(positive) && next.includes(negative)) {
                    isConsistent = false;
                    break;
                }
            }

            if (isConsistent) consistentCount++;
        }

        return Math.round((consistentCount / (sentences.length - 1)) * 100);
    }

    calculateOverallScore(checks) {
        let total = 0;
        let weightSum = 0;

        for (const check of checks) {
            if (check.type === "keyword_check") {
                total += parseFloat(check.coverage) * 0.6;
                weightSum += 0.6;
            } else if (check.type === "logical_consistency") {
                total += check.score * 0.4;
                weightSum += 0.4;
            }
        }

        return weightSum > 0 ? (total / weightSum).toFixed(1) : "N/A";
    }

    async validateAndFilter(content, subject = null) {
        const validation = this.validateContent(content);

        if (!validation.valid) {
            return {
                passed: false,
                reason: "内容验证失败",
                violations: validation.violations
            };
        }

        const hallucinationCheck = this.checkHallucination(content);
        const filtered = this.filterContent(content);

        let factCheckResult = null;
        if (subject) {
            factCheckResult = await this.factCheck(content, subject);
        }

        return {
            passed: hallucinationCheck.riskLevel !== "high",
            content: filtered.filteredContent,
            hallucinationRisk: hallucinationCheck.riskLevel,
            hallucinationSuggestion: hallucinationCheck.suggestion,
            factCheck: factCheckResult,
            modified: filtered.modified
        };
    }
}

module.exports = SafetyAgent;
