const CourseDesignTool = require("./CourseDesignTool");
const MasteryTool = require("./MasteryTool");
const NoteTool = require("./NoteTool");
const PathTool = require("./PathTool");
const PracticeTool = require("./PracticeTool");
const ProfileTool = require("./ProfileTool");
const PublicSourceTool = require("./PublicSourceTool");
const RagTool = require("./RagTool");
const ResourceTool = require("./ResourceTool");
const ToolRegistry = require("./ToolRegistry");

const definitions = [
    ["profile", "读取学习画像、掌握度和近期行为", "low", ProfileTool],
    ["resource", "匹配平台课程和题库资源", "low", ResourceTool],
    ["practice", "按薄弱点生成练习并记录完成结果", "medium", PracticeTool],
    ["note", "生成并写回复盘任务卡", "medium", NoteTool],
    ["path", "生成并写回学习路径任务", "medium", PathTool],
    ["courseDesign", "生成并保存多日课程设计", "medium", CourseDesignTool],
    ["mastery", "读取和更新知识掌握度", "high", MasteryTool],
    ["rag", "从平台知识库执行混合检索", "low", RagTool],
    ["publicSource", "抓取公开资料并写入知识库", "high", PublicSourceTool]
];

function createToolRegistry(pool) {
    const registry = new ToolRegistry();
    for (const [name, description, riskLevel, ToolClass] of definitions) {
        registry.register(
            {
                name,
                description,
                riskLevel,
                inputSchema: { type: "object" },
                outputSchema: { type: "object" }
            },
            new ToolClass(pool)
        );
    }
    return registry;
}

module.exports = createToolRegistry;
