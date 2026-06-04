const fs = require("fs");
const path = require("path");

const VAULT = path.join(__dirname, "..", "obsidian-vault", "01-共享知识库", "学科课程");

const COURSE_NAMES = {
    software_engineering: "软件工程",
    devops_ci_cd: "DevOps与CI/CD",
    requirements_engineering: "需求工程",
    software_architecture: "软件架构",
    software_testing: "软件测试",
    software_project_management: "软件项目管理",
    software_security: "软件安全",
    operating_systems: "操作系统",
    computer_networks: "计算机网络",
    data_structures_algorithms: "数据结构与算法",
    database_systems: "数据库系统",
    programming_foundations: "编程基础",
    artificial_intelligence: "人工智能"
};

function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath);
        } else if (entry.name.endsWith(".md")) {
            fixCourseName(fullPath);
        }
    }
}

function fixCourseName(filePath) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) return;

    // Check if course_code exists and course_name is empty
    const ccMatch = fmMatch[1].match(/course_code:\s*"([^"]+)"/);
    if (!ccMatch) return;

    const courseCode = ccMatch[1];
    const cnMatch = fmMatch[1].match(/course_name:\s*"([^"]*)"/);
    if (!cnMatch) return;

    if (cnMatch[1] === "" && COURSE_NAMES[courseCode]) {
        const newRaw = raw.replace(/course_name:\s*""/, `course_name: "${COURSE_NAMES[courseCode]}"`);
        fs.writeFileSync(filePath, newRaw, "utf-8");
        console.log(`  Fixed: ${path.basename(filePath)} -> ${COURSE_NAMES[courseCode]}`);
    }
}

console.log("修复空 course_name...\n");
walkDir(VAULT);
console.log("\n完成!");
