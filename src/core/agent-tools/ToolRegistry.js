class ToolRegistry {
    constructor() {
        this.entries = new Map();
    }

    register(definition, tool) {
        if (!definition?.name || typeof tool?.run !== "function") {
            throw new Error("Tool registration requires a name and run() implementation");
        }
        if (this.entries.has(definition.name)) {
            throw new Error(`Tool already registered: ${definition.name}`);
        }

        this.entries.set(definition.name, {
            definition: {
                description: "",
                inputSchema: { type: "object" },
                outputSchema: { type: "object" },
                riskLevel: "low",
                timeoutMs: 30000,
                ...definition
            },
            tool
        });
        return this;
    }

    has(name) {
        return this.entries.has(name);
    }

    get(name) {
        const entry = this.entries.get(name);
        if (!entry) throw new Error(`Unknown agent tool: ${name}`);
        return entry.tool;
    }

    describe(names = null) {
        const allowed = names ? new Set(names) : null;
        return [...this.entries.values()]
            .map(entry => entry.definition)
            .filter(definition => !allowed || allowed.has(definition.name));
    }

    validatePlan(plan) {
        const unknownTools = (plan || []).map(step => step.tool).filter(name => !this.has(name));
        if (unknownTools.length) {
            throw new Error(`Execution plan contains unknown tools: ${[...new Set(unknownTools)].join(", ")}`);
        }
        return plan;
    }
}

module.exports = ToolRegistry;
