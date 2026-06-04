// core/MasteryFusion.js
// 掌握度融合引擎
// 整合 BKT(贝叶斯知识追踪) + MasteryCalculator(时间衰减) + CognitiveDiagnosis(IRT诊断)
// 生成加权融合结果 + 置信度评估 + 来源追踪

const BKTModel = require("./BKTModel");
const MasteryCalculator = require("./MasteryCalculator");
const CognitiveDiagnosis = require("./CognitiveDiagnosis");

// 融合权重配置（基于来源可靠性）
const SOURCE_WEIGHTS = {
    bkt: 0.35, // BKT 概率估计
    time_decay: 0.3, // 时间衰减加权正确率
    cognitive_diagnosis: 0.25, // IRT 认知诊断
    self_assessment: 0.1 // 用户自评（来自诊断问卷）
};

// 最小样本量要求
const MIN_SAMPLE_BKT = 3;
const MIN_SAMPLE_TIME_DECAY = 2;
const MIN_SAMPLE_COGNITIVE = 4;

class MasteryFusion {
    constructor(pool) {
        this.pool = pool;
        this.bkt = new BKTModel();
        this.masteryCalc = new MasteryCalculator();
        this.cognitiveDiag = new CognitiveDiagnosis();
    }

    /**
     * 对单个知识点进行多源融合掌握度计算
     * @returns {{ mastery: number, confidence: number, sources: object, diagnosis: string }}
     */
    async fuseForNode(userId, nodeId) {
        const results = {};

        // 1. BKT 估计
        try {
            const bktResult = await this.bkt.estimateMastery(userId, nodeId, this.pool);
            results.bkt = {
                mastery: bktResult.mastery,
                confidence: bktResult.confidence,
                attempts: bktResult.attempts || 0,
                weight: SOURCE_WEIGHTS.bkt,
                reliable: bktResult.attempts >= MIN_SAMPLE_BKT
            };
        } catch (error) {
            results.bkt = { mastery: null, confidence: 0, attempts: 0, weight: 0, reliable: false };
        }

        // 2. 时间衰减加权掌握度
        try {
            const timeDecayMastery = await this.masteryCalc.calculateNodeMastery(userId, nodeId, this.pool);
            // 获取最近30天该节点的答题次数来确定样本量
            const [countRows] = await this.pool.query(
                `SELECT COUNT(*) AS cnt FROM user_answers ua
                 JOIN questions q ON ua.question_id = q.id
                 WHERE ua.user_id = ? AND q.node_id = ?
                   AND ua.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
                [userId, nodeId]
            );
            const sampleCount = Number(countRows[0]?.cnt || 0);
            results.time_decay = {
                mastery: timeDecayMastery,
                confidence: Math.min(100, sampleCount * 15),
                attempts: sampleCount,
                weight: SOURCE_WEIGHTS.time_decay,
                reliable: sampleCount >= MIN_SAMPLE_TIME_DECAY
            };
        } catch (error) {
            results.time_decay = { mastery: null, confidence: 0, attempts: 0, weight: 0, reliable: false };
        }

        // 3. 认知诊断（从最近一次考试记录）
        try {
            const [examRows] = await this.pool.query(
                `SELECT ua.user_exam_id FROM user_answers ua
                 JOIN questions q ON ua.question_id = q.id
                 WHERE ua.user_id = ? AND q.node_id = ?
                 ORDER BY ua.created_at DESC LIMIT 1`,
                [userId, nodeId]
            );
            if (examRows.length > 0) {
                const diagnosis = await this.cognitiveDiag.diagnose(userId, examRows[0].user_exam_id, this.pool);
                if (diagnosis && diagnosis.skillMastery) {
                    // 取该节点相关的技能掌握度平均值
                    const skillValues = Object.values(diagnosis.skillMastery).map(s => s.mastery);
                    const avgSkillMastery =
                        skillValues.length > 0
                            ? Math.round(skillValues.reduce((a, b) => a + b, 0) / skillValues.length)
                            : null;
                    results.cognitive_diagnosis = {
                        mastery: avgSkillMastery,
                        confidence: Math.min(100, diagnosis.overallMastery ? 50 : 30),
                        attempts: Object.values(diagnosis.skillMastery).reduce((s, v) => s + v.sampleSize, 0),
                        weight: SOURCE_WEIGHTS.cognitive_diagnosis,
                        reliable: true
                    };
                }
            }
        } catch (error) {
            // 静默失败
        }
        if (!results.cognitive_diagnosis) {
            results.cognitive_diagnosis = { mastery: null, confidence: 0, attempts: 0, weight: 0, reliable: false };
        }

        // 4. 用户自评（从 student_profiles 或 diagnostic_results）
        try {
            const [profileRows] = await this.pool.query("SELECT profile_json FROM student_profiles WHERE user_id = ?", [
                userId
            ]);
            if (profileRows.length > 0) {
                const profile =
                    typeof profileRows[0].profile_json === "string"
                        ? JSON.parse(profileRows[0].profile_json)
                        : profileRows[0].profile_json;
                const selfAssess = profile.selfAssessment || profile.self_assessment || {};
                // 自评分数 1-5 映射到 0-100
                const rawScore = selfAssess.overall || selfAssess.csLevel || selfAssess.mathLevel;
                if (rawScore) {
                    const mappedMastery = Math.round((Number(rawScore) / 5) * 100);
                    results.self_assessment = {
                        mastery: mappedMastery,
                        confidence: 40, // 自评置信度低
                        attempts: 1,
                        weight: SOURCE_WEIGHTS.self_assessment,
                        reliable: false // 自评不可靠
                    };
                }
            }
        } catch (error) {
            // 静默失败
        }
        if (!results.self_assessment) {
            results.self_assessment = { mastery: null, confidence: 0, attempts: 0, weight: 0, reliable: false };
        }

        // 融合计算
        const fusion = this.computeFusion(results);

        // 写入 student_knowledge
        await this.pool.query(
            `INSERT INTO student_knowledge (user_id, node_id, mastery, updated_at)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE mastery = VALUES(mastery), updated_at = NOW()`,
            [userId, nodeId, fusion.mastery]
        );

        return {
            nodeId,
            ...fusion,
            sources: results
        };
    }

    /**
     * 加权融合计算，动态调整不可靠来源的权重
     */
    computeFusion(results) {
        const sources = Object.entries(results)
            .filter(([, data]) => data.mastery !== null && data.mastery !== undefined)
            .map(([name, data]) => ({
                name,
                mastery: data.mastery,
                confidence: data.confidence,
                attempts: data.attempts,
                weight: data.weight,
                reliable: data.reliable
            }));

        if (sources.length === 0) {
            return {
                mastery: 0,
                confidence: 0,
                diagnosis: "无数据 — 需要至少完成一次答题或诊断",
                sourceCount: 0,
                primarySource: null
            };
        }

        // 动态调整权重：不可靠来源权重减半
        let totalWeight = 0;
        let weightedSum = 0;
        let totalConfidence = 0;
        const sourceContributions = [];

        for (const src of sources) {
            const adjustedWeight = src.reliable ? src.weight : src.weight * 0.35;
            weightedSum += src.mastery * adjustedWeight;
            totalWeight += adjustedWeight;
            totalConfidence += src.confidence * adjustedWeight;
            sourceContributions.push({
                source: src.name,
                mastery: src.mastery,
                contribution: adjustedWeight
            });
        }

        const finalMastery = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
        const avgConfidence = totalWeight > 0 ? Math.round(totalConfidence / totalWeight) : 0;

        // 判断诊断等级
        let diagnosis;
        if (finalMastery < 30) diagnosis = "未掌握 — 需要从头学习";
        else if (finalMastery < 50) diagnosis = "薄弱 — 需要针对性练习";
        else if (finalMastery < 70) diagnosis = "发展中 — 继续巩固";
        else if (finalMastery < 85) diagnosis = "基本掌握 — 可进阶学习";
        else diagnosis = "熟练掌握 — 可进入下一阶段";

        // 确定主要来源
        const primarySource = sourceContributions.sort((a, b) => b.contribution - a.contribution)[0];

        return {
            mastery: finalMastery,
            confidence: avgConfidence,
            diagnosis,
            sourceCount: sources.length,
            primarySource: primarySource?.source || null,
            sourceContributions,
            reliableSourceCount: sources.filter(s => s.reliable).length
        };
    }

    /**
     * 批量融合用户全部知识点的掌握度
     */
    async fuseAllForUser(userId) {
        const [nodes] = await this.pool.query("SELECT id FROM knowledge_nodes WHERE is_active = 1");

        const results = [];
        for (const node of nodes) {
            try {
                const result = await this.fuseForNode(userId, node.id);
                results.push(result);
            } catch (error) {
                console.warn(`融合节点 ${node.id} 失败:`, error.message);
            }
        }

        // 计算汇总统计
        const masteryValues = results.map(r => r.mastery).filter(m => m > 0);
        const avgMastery =
            masteryValues.length > 0 ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length) : 0;

        return {
            userId,
            nodeCount: results.length,
            avgMastery,
            weakNodes: results
                .filter(r => r.mastery < 50)
                .map(r => ({
                    nodeId: r.nodeId,
                    mastery: r.mastery,
                    diagnosis: r.diagnosis
                })),
            details: results
        };
    }
}

module.exports = MasteryFusion;
