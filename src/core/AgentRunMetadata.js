function detectMissingInputs({ profile, rag, resources, message, context = {} }) {
    const missing = [];
    if (!String(message || context.goal || "").trim()) missing.push("goal");
    if (!profile?.weakPoints?.length && !profile?.answerStats?.total) missing.push("learning_profile");
    if (rag && !rag.hitCount) missing.push("rag_evidence");
    if (!resources?.courses?.length && !resources?.questions?.length) missing.push("learning_resources");
    return [...new Set(missing)];
}

function buildAgentRunMetadata({
    sessionId,
    config,
    profile,
    rag,
    resources,
    message,
    context,
    plannerSource = "rule_fallback"
}) {
    const missingInputs = detectMissingInputs({ profile, rag, resources, message, context });
    const evidenceCount = Number(rag?.hitCount || 0);
    const fallbackUsed = plannerSource !== "llm" || rag?.searchMode === "bm25_only";
    const confidence = Math.max(0.35, Math.min(0.9, 0.82 - missingInputs.length * 0.12 + (evidenceCount ? 0.05 : 0)));

    return {
        source: plannerSource,
        provider: plannerSource === "llm" ? config.llm.provider : "rules",
        model: plannerSource === "llm" ? config.llm.local.model : null,
        fallbackUsed,
        evidenceCount,
        traceId: sessionId,
        confidence: Number(confidence.toFixed(2)),
        uncertainty: missingInputs.length ? "insufficient_data" : "normal",
        missingInputs,
        demoMode: config.app.demoMode
    };
}

module.exports = { buildAgentRunMetadata, detectMissingInputs };
