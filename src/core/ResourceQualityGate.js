/**
 * ResourceQualityGate — 资源生成幻觉防控与质量评估
 */
const SafetyAgent = require("./SafetyAgent");

function flattenResourceText(resource) {
    if (!resource || typeof resource !== "object") return "";
    const parts = [resource.title, resource.description, resource.content, resource.script];
    if (Array.isArray(resource.questions)) {
        for (const q of resource.questions) parts.push(q.content || q.question || "");
    }
    if (Array.isArray(resource.slides)) {
        for (const s of resource.slides) {
            parts.push(s.title, ...(s.bullets || []), s.speakerNotes || "");
        }
    }
    if (resource.mindmap) parts.push(JSON.stringify(resource.mindmap));
    if (Array.isArray(resource.cases)) {
        for (const c of resource.cases) parts.push(c.title, c.content || "");
    }
    if (Array.isArray(resource.citations)) {
        for (const c of resource.citations) parts.push(c.excerpt || c.title || "");
    }
    return parts.filter(Boolean).join("\n");
}

function scoreCitations(citations = []) {
    if (!citations.length) return { citationScore: 35, note: "缺少引用，幻觉风险升高" };
    const withExcerpt = citations.filter(c => String(c.excerpt || "").length >= 20).length;
    const score = Math.min(95, 55 + withExcerpt * 12 + Math.min(citations.length, 5) * 4);
    return { citationScore: score, note: withExcerpt ? "已绑定知识片段引用" : "引用缺少摘录" };
}

function evaluateResource(resource, subject = "计算机科学") {
    const safety = new SafetyAgent();
    const text = flattenResourceText(resource);
    const validation = safety.validateContent(text || " ");
    const hallucination = safety.checkHallucination(text || "");
    const citation = scoreCitations(resource.citations || []);

    let qualityScore = 58;
    qualityScore += Math.min(18, Math.floor((text.length || 0) / 160));
    qualityScore = qualityScore * 0.5 + citation.citationScore * 0.5;
    if (!validation.valid) qualityScore -= 25;
    if (hallucination.riskLevel === "high") qualityScore -= 18;
    if (hallucination.riskLevel === "medium") qualityScore -= 6;
    if ((resource.citations || []).length >= 2) qualityScore += 8;
    if ((resource.citations || []).some(c => String(c.excerpt || "").length >= 20)) qualityScore += 4;
    qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

    // 有引用时允许 medium 风险通过；无引用则更严格
    const citationOk = (resource.citations || []).length > 0;
    const riskOk =
        hallucination.riskLevel === "low" ||
        hallucination.riskLevel === "medium" ||
        (citationOk && hallucination.riskLevel !== "high");
    const passed = validation.valid && riskOk && qualityScore >= 50 && (citationOk || qualityScore >= 62);

    return {
        passed,
        qualityScore,
        safetyPassed: validation.valid,
        hallucinationRisk: hallucination.riskLevel,
        citationScore: citation.citationScore,
        citationNote: citation.note,
        suggestion: passed
            ? "可通过：内容安全且具备基本溯源"
            : hallucination.suggestion || "建议补充引用或改写不确定表述",
        violations: validation.violations || [],
        subject
    };
}

function attachQuality(resource, subject) {
    const quality = evaluateResource(resource, subject);
    return {
        ...resource,
        success: resource.success !== false,
        quality,
        safetyPassed: quality.safetyPassed,
        hallucinationRisk: quality.hallucinationRisk,
        qualityScore: quality.qualityScore
    };
}

module.exports = {
    flattenResourceText,
    scoreCitations,
    evaluateResource,
    attachQuality
};
