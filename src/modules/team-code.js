const express = require("express");
const zlib = require("zlib");
const axios = require("axios");
const router = express.Router();
const pool = require("../db");
const { authenticateJWT } = require("../middleware");
const AIDevOpsOrchestrator = require("../core/AIDevOpsOrchestrator");

const aiDevOps = new AIDevOpsOrchestrator();

const ROLE_TEMPLATES = [
    {
        roleKey: "frontend",
        roleName: "页面体验负责人",
        moduleName: "页面与交互",
        responsibility: "负责把学习项目做成清晰可用的页面，练习布局、交互和接口联调。",
        defaultPath: "frontend/App.js",
        language: "javascript"
    },
    {
        roleKey: "backend",
        roleName: "功能逻辑负责人",
        moduleName: "业务逻辑",
        responsibility: "负责项目规则、数据处理和权限判断，练习把需求转成稳定功能。",
        defaultPath: "backend/api.js",
        language: "javascript"
    },
    {
        roleKey: "testing",
        roleName: "质量复盘负责人",
        moduleName: "测试与验收",
        responsibility: "负责测试用例、问题记录、验收标准和复盘反馈。",
        defaultPath: "tests/project.test.js",
        language: "javascript"
    },
    {
        roleKey: "deployment",
        roleName: "发布展示负责人",
        moduleName: "展示与发布",
        responsibility: "负责运行说明、展示流程、环境检查和成果汇报。",
        defaultPath: "deploy/README.md",
        language: "markdown"
    }
];

const REQUIREMENT_TEMPLATES = [
    {
        id: "REQ-101",
        moduleKey: "frontend",
        title: "项目首页与任务看板",
        status: "doing",
        priority: "P0",
        acceptance: "能展示项目目标、成员分工、需求卡片和最新提交。"
    },
    {
        id: "REQ-102",
        moduleKey: "backend",
        title: "任务与提交记录接口",
        status: "review",
        priority: "P0",
        acceptance: "保存代码后产生版本、修改位置、操作者和时间记录。"
    },
    {
        id: "REQ-103",
        moduleKey: "testing",
        title: "核心流程自动化验收",
        status: "todo",
        priority: "P1",
        acceptance: "覆盖创建项目、打开文件、保存同步、AI 审查四条路径。"
    },
    {
        id: "REQ-104",
        moduleKey: "deployment",
        title: "演示环境与发布清单",
        status: "todo",
        priority: "P1",
        acceptance: "包含环境变量、启动命令、健康检查和演示 URL。"
    }
];

const EXTERNAL_TOOLS = aiDevOps.listTools();

function sanitizeTarPath(value) {
    return (
        String(value || "file.txt")
            .replace(/\\/g, "/")
            .split("/")
            .filter(part => part && part !== "." && part !== "..")
            .join("/")
            .slice(0, 220) || "file.txt"
    );
}

function writeTarString(buffer, value, offset, length) {
    buffer.write(String(value || "").slice(0, length), offset, length, "utf8");
}

function writeTarOctal(buffer, value, offset, length) {
    const text =
        Math.max(0, Number(value) || 0)
            .toString(8)
            .padStart(length - 1, "0") + "\0";
    buffer.write(text.slice(-length), offset, length, "ascii");
}

function createTarGz(files) {
    const chunks = [];
    files.forEach(file => {
        const name = sanitizeTarPath(file.path);
        const body = Buffer.from(String(file.content || ""), "utf8");
        const header = Buffer.alloc(512, 0);
        writeTarString(header, name, 0, 100);
        writeTarOctal(header, 0o100644, 100, 8);
        writeTarOctal(header, 0, 108, 8);
        writeTarOctal(header, 0, 116, 8);
        writeTarOctal(header, body.length, 124, 12);
        writeTarOctal(header, Math.floor(new Date(file.updated_at || Date.now()).getTime() / 1000), 136, 12);
        header.fill(" ", 148, 156);
        header.write("0", 156, 1, "ascii");
        writeTarString(header, "ustar", 257, 6);
        writeTarString(header, "00", 263, 2);
        let checksum = 0;
        for (const byte of header) checksum += byte;
        writeTarOctal(header, checksum, 148, 8);
        chunks.push(header, body);
        const padding = (512 - (body.length % 512)) % 512;
        if (padding) chunks.push(Buffer.alloc(padding, 0));
    });
    chunks.push(Buffer.alloc(1024, 0));
    return zlib.gzipSync(Buffer.concat(chunks));
}

function getUserId(req) {
    return req.user.id;
}

async function ensureTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            owner_id INT NOT NULL,
            name VARCHAR(160) NOT NULL,
            description VARCHAR(800) DEFAULT '',
            repository_name VARCHAR(160) DEFAULT '',
            status VARCHAR(32) DEFAULT 'active',
            progress INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_owner (owner_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_project_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            user_id INT NOT NULL,
            role_key VARCHAR(40) NOT NULL,
            role_name VARCHAR(80) NOT NULL,
            module_name VARCHAR(120) NOT NULL,
            responsibility VARCHAR(800) DEFAULT '',
            status VARCHAR(32) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
            INDEX idx_project (project_id),
            INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_project_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            module_key VARCHAR(40) NOT NULL,
            path VARCHAR(260) NOT NULL,
            language VARCHAR(40) DEFAULT 'javascript',
            content LONGTEXT,
            owner_user_id INT NULL,
            last_editor_id INT NULL,
            size_bytes INT DEFAULT 0,
            version INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
            UNIQUE KEY uniq_project_path (project_id, path),
            INDEX idx_project_module (project_id, module_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_project_commits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            file_id INT NOT NULL,
            user_id INT NOT NULL,
            message VARCHAR(512) DEFAULT '',
            module_key VARCHAR(40) DEFAULT '',
            position_label VARCHAR(160) DEFAULT '',
            changed_lines INT DEFAULT 0,
            snapshot LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
            FOREIGN KEY (file_id) REFERENCES team_project_files(id) ON DELETE CASCADE,
            INDEX idx_project_time (project_id, created_at),
            INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_project_events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            user_id INT NOT NULL,
            event_type VARCHAR(40) NOT NULL,
            title VARCHAR(160) NOT NULL,
            detail VARCHAR(800) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
            INDEX idx_project_time (project_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_project_ai_runs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            user_id INT NOT NULL,
            run_type VARCHAR(40) NOT NULL,
            provider VARCHAR(40) DEFAULT 'local',
            target_path VARCHAR(260) DEFAULT '',
            module_key VARCHAR(40) DEFAULT '',
            status VARCHAR(40) DEFAULT 'completed',
            score INT DEFAULT 0,
            result_json JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
            INDEX idx_project_time (project_id, created_at),
            INDEX idx_run_type (run_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_project_briefs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            user_id INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            description LONGTEXT,
            optimized LONGTEXT,
            status VARCHAR(32) DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
            INDEX idx_project (project_id, updated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_project_bots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            name VARCHAR(120) DEFAULT 'CodeBot',
            enabled TINYINT(1) DEFAULT 0,
            github_repo VARCHAR(260) DEFAULT '',
            github_branch VARCHAR(120) DEFAULT 'main',
            github_token VARCHAR(260) DEFAULT '',
            database_name VARCHAR(120) DEFAULT '',
            last_pull_at DATETIME NULL,
            last_push_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
            UNIQUE KEY uniq_project (project_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS team_project_bot_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bot_id INT NOT NULL,
            project_id INT NOT NULL,
            user_id INT NOT NULL,
            username VARCHAR(80) DEFAULT '',
            can_pull TINYINT(1) DEFAULT 0,
            can_push TINYINT(1) DEFAULT 0,
            can_bind TINYINT(1) DEFAULT 0,
            can_toggle TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (bot_id) REFERENCES team_project_bots(id) ON DELETE CASCADE,
            UNIQUE KEY uniq_bot_user (bot_id, user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

let _tablesReady = false;
router.use(async (req, res, next) => {
  if (!_tablesReady) {
    _tablesReady = true;
    await ensureTables().catch(() => {});
  }
  next();
});

async function assertProjectAccess(projectId, userId) {
    const [[project]] = await pool.query("SELECT * FROM team_projects WHERE id = ?", [projectId]);
    if (!project) return null;
    if (Number(project.owner_id) === Number(userId)) return project;
    const [[member]] = await pool.query(
        "SELECT id FROM team_project_members WHERE project_id = ? AND user_id = ? LIMIT 1",
        [projectId, userId]
    );
    return member ? project : null;
}

// 机器人接口的访问判定：项目创建者 / 项目成员 / 机器人被授权者 均可进入
async function assertBotProjectAccess(projectId, userId) {
    const project = await assertProjectAccess(projectId, userId);
    if (project) return project;
    const [[bot]] = await pool.query("SELECT * FROM team_project_bots WHERE project_id = ? LIMIT 1", [projectId]);
    if (!bot) return null;
    const [[botMember]] = await pool.query(
        "SELECT id FROM team_project_bot_members WHERE bot_id = ? AND user_id = ? LIMIT 1",
        [bot.id, userId]
    );
    if (!botMember) return null;
    const [[p]] = await pool.query("SELECT * FROM team_projects WHERE id = ?", [projectId]);
    return p || null;
}

async function listProjectIds(userId) {
    const [rows] = await pool.query(
        `
        SELECT p.id, MAX(p.updated_at) AS latest_updated_at
        FROM team_projects p
        LEFT JOIN team_project_members m ON m.project_id = p.id
        WHERE p.owner_id = ? OR m.user_id = ?
        GROUP BY p.id
        ORDER BY latest_updated_at DESC
    `,
        [userId, userId]
    );
    return rows.map(row => row.id);
}

function demoContent(roleKey) {
    const samples = {
        frontend: `export function renderDashboard(project) {
  return project.tasks.map(task => ({
    title: task.title,
    owner: task.owner,
    status: task.done ? "done" : "todo"
  }));
}

console.log(renderDashboard({ tasks: [{ title: "首页看板", owner: "前端", done: false }] }));`,
        backend: `function createTask({ title, module, owner }) {
  if (!title || !module) throw new Error("任务标题和模块不能为空");
  return { id: Date.now(), title, module, owner, status: "open" };
}

console.log(createTask({ title: "保存提交记录", module: "backend", owner: "后端" }));`,
        testing: `const cases = [
  { name: "创建任务需要标题", passed: true },
  { name: "保存代码产生提交记录", passed: true },
  { name: "成员只能编辑自己的模块", passed: false }
];

console.log(cases.map(item => item.name + ": " + (item.passed ? "PASS" : "TODO")).join("\\n"));`,
        deployment: `# 部署说明

1. 配置数据库连接和 JWT 密钥。
2. 执行 npm install。
3. 使用 npm start 启动服务。
4. 验证 /api/health、团队项目页和提交时间线。
`
    };
    return samples[roleKey] || "";
}

function inferCodeReview({ content = "", moduleKey = "frontend", path = "" }) {
    const lines = String(content || "").split(/\r?\n/);
    const nonEmptyLines = lines.filter(line => line.trim()).length;
    const findings = [];
    const suggestions = [];
    let score = 88;

    if (!content.trim()) {
        findings.push("文件内容为空，无法形成可验收的模块产出。");
        suggestions.push("先提交最小可运行版本，并补充模块职责说明。");
        score -= 26;
    }
    if (nonEmptyLines > 120) {
        findings.push("单文件代码偏长，建议按组件、服务或测试用例拆分。");
        suggestions.push("将核心逻辑拆到独立函数，并为公共函数补充单元测试。");
        score -= 8;
    }
    if (/console\.log/.test(content) && moduleKey !== "testing") {
        findings.push("存在调试输出，发布前需要改为可控日志或移除。");
        suggestions.push("为关键行为设计结构化日志，避免泄露调试信息。");
        score -= 5;
    }
    if (/TODO|FIXME|待完善/i.test(content)) {
        findings.push("存在未闭环 TODO，需要转成需求卡片或验收项。");
        suggestions.push("把 TODO 写入需求池，标注负责人、优先级和完成标准。");
        score -= 7;
    }
    if (moduleKey === "backend" && !/throw|try|catch|status|Error/i.test(content)) {
        findings.push("后端逻辑缺少明显的异常处理或状态返回。");
        suggestions.push("补充参数校验、错误分支和接口返回约定。");
        score -= 10;
    }
    if (moduleKey === "testing" && !/assert|expect|passed|PASS|test/i.test(content)) {
        findings.push("测试模块缺少可执行或可追踪的断言表达。");
        suggestions.push("至少覆盖正常路径、异常路径和权限边界。");
        score -= 10;
    }
    if (moduleKey === "deployment" && !/npm|start|env|deploy|健康|health/i.test(content)) {
        findings.push("部署文档缺少启动、环境或健康检查信息。");
        suggestions.push("补齐环境变量、启动命令、回滚方案和验收截图。");
        score -= 10;
    }
    if (!findings.length) {
        findings.push("未发现高风险问题，当前提交可以进入同伴评审。");
        suggestions.push("继续补充验收标准，并请相邻模块负责人做一次接口对齐。");
    }

    return {
        score: Math.max(55, Math.min(98, score)),
        level: score >= 90 ? "优秀" : score >= 80 ? "可合并" : score >= 70 ? "需复查" : "需返工",
        summary: `${path || "当前文件"} 已完成 ${nonEmptyLines} 行有效内容扫描，重点检查了模块职责、可维护性、测试/部署闭环和发布风险。`,
        findings,
        suggestions,
        nextActions: [
            "补齐本模块与上下游模块的接口契约",
            "把未完成事项同步到需求卡片并标注负责人",
            "保存后由 AI 审查和同伴评审各过一遍"
        ]
    };
}

async function pickDemoUsers(currentUserId) {
    const [students] = await pool.query(
        'SELECT id FROM users WHERE role = "student" AND status = "active" ORDER BY id LIMIT 4'
    );
    const ids = students.map(row => row.id);
    if (!ids.includes(currentUserId)) ids.unshift(currentUserId);
    return ids.slice(0, 4);
}

async function createProjectWithDefaults(userId, payload = {}) {
    const name = (payload.name || "校园二手交易平台团队项目").trim();
    const description = (
        payload.description || "学生在教师指导下分工完成一个可展示的学习项目，覆盖页面、功能、测试和成果发布。"
    ).trim();
    const repositoryName = (payload.repositoryName || `${name.replace(/\s+/g, "-").toLowerCase()}-repo`).slice(0, 150);
    const memberUserIds = payload.memberUserIds?.length ? payload.memberUserIds : await pickDemoUsers(userId);
    const [projectResult] = await pool.query(
        "INSERT INTO team_projects (owner_id, name, description, repository_name, progress) VALUES (?, ?, ?, ?, ?)",
        [userId, name, description, repositoryName, 15]
    );
    const projectId = projectResult.insertId;

    for (let i = 0; i < ROLE_TEMPLATES.length; i += 1) {
        const role = ROLE_TEMPLATES[i];
        const memberUserId = memberUserIds[i] || userId;
        await pool.query(
            "INSERT INTO team_project_members (project_id, user_id, role_key, role_name, module_name, responsibility) VALUES (?, ?, ?, ?, ?, ?)",
            [projectId, memberUserId, role.roleKey, role.roleName, role.moduleName, role.responsibility]
        );
        const content = demoContent(role.roleKey);
        const [fileResult] = await pool.query(
            "INSERT INTO team_project_files (project_id, module_key, path, language, content, owner_user_id, last_editor_id, size_bytes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                projectId,
                role.roleKey,
                role.defaultPath,
                role.language,
                content,
                memberUserId,
                memberUserId,
                Buffer.byteLength(content, "utf-8")
            ]
        );
        await pool.query(
            "INSERT INTO team_project_commits (project_id, file_id, user_id, message, module_key, position_label, changed_lines, snapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                projectId,
                fileResult.insertId,
                memberUserId,
                `初始化${role.moduleName}模块`,
                role.roleKey,
                role.defaultPath,
                content.split(/\r?\n/).length,
                content
            ]
        );
    }
    await pool.query(
        "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, ?, ?, ?)",
        [projectId, userId, "project_created", "团队项目已创建", "已生成 4 个学习角色、示例代码文件和过程记录。"]
    );
    return projectId;
}

async function projectDetail(projectId) {
    const [[project]] = await pool.query("SELECT * FROM team_projects WHERE id = ?", [projectId]);
    const [members] = await pool.query(
        `
        SELECT m.*, u.username, u.name AS full_name
        FROM team_project_members m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.project_id = ?
        ORDER BY FIELD(m.role_key, 'frontend', 'backend', 'testing', 'deployment'), m.id
    `,
        [projectId]
    );
    const [files] = await pool.query(
        `
        SELECT f.id, f.project_id, f.module_key, f.path, f.language, f.content, f.owner_user_id, f.last_editor_id, f.size_bytes, f.version, f.created_at, f.updated_at,
               owner.username AS owner_username, editor.username AS last_editor_username
        FROM team_project_files f
        LEFT JOIN users owner ON owner.id = f.owner_user_id
        LEFT JOIN users editor ON editor.id = f.last_editor_id
        WHERE f.project_id = ?
        ORDER BY FIELD(f.module_key, 'frontend', 'backend', 'testing', 'deployment'), f.path
    `,
        [projectId]
    );
    const [commits] = await pool.query(
        `
        SELECT c.id, c.project_id, c.file_id, c.user_id, c.message, c.module_key, c.position_label, c.changed_lines, c.created_at,
               f.path, u.username
        FROM team_project_commits c
        LEFT JOIN team_project_files f ON f.id = c.file_id
        LEFT JOIN users u ON u.id = c.user_id
        WHERE c.project_id = ?
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT 30
    `,
        [projectId]
    );
    const [events] = await pool.query(
        `
        SELECT e.*, u.username
        FROM team_project_events e
        LEFT JOIN users u ON u.id = e.user_id
        WHERE e.project_id = ?
        ORDER BY e.created_at DESC, e.id DESC
        LIMIT 30
    `,
        [projectId]
    );
    let aiRuns = [];
    try {
        [aiRuns] = await pool.query(
            `
            SELECT id, run_type, provider, target_path, module_key, status, score, created_at
            FROM team_project_ai_runs
            WHERE project_id = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 12
        `,
            [projectId]
        );
    } catch (error) {
        console.warn("AI run history skipped:", error.message);
    }
    const moduleStats = ROLE_TEMPLATES.map(role => ({
        ...role,
        fileCount: files.filter(file => file.module_key === role.roleKey).length,
        commitCount: commits.filter(commit => commit.module_key === role.roleKey).length
    }));
    const latestCommit = commits[0];
    const repoHealth = {
        branch: "main",
        openRequirements: REQUIREMENT_TEMPLATES.filter(item => item.status !== "done").length,
        reviewScore: files.length ? Math.min(96, 72 + Math.min(18, commits.length * 2)) : 0,
        deploymentStage: project.progress >= 80 ? "预发布" : project.progress >= 45 ? "联调中" : "开发中",
        lastSyncAt: latestCommit?.created_at || project.updated_at
    };
    const agents = aiDevOps.listAgents();
    return {
        project,
        members,
        files,
        commits,
        events,
        aiRuns,
        moduleStats,
        requirements: REQUIREMENT_TEMPLATES,
        tools: EXTERNAL_TOOLS,
        repoHealth,
        agents
    };
}

async function resolvePipelineInput(projectId, body = {}) {
    const fileId = Number(body.fileId || 0);
    let content = String(body.content ?? "");
    let moduleKey = String(body.moduleKey || "frontend");
    let filePath = String(body.path || "当前编辑区");
    let file = null;
    if (fileId) {
        const [[found]] = await pool.query("SELECT * FROM team_project_files WHERE id = ? AND project_id = ?", [
            fileId,
            projectId
        ]);
        if (found) {
            file = found;
            content = content || found.content || "";
            moduleKey = found.module_key || moduleKey;
            filePath = found.path || filePath;
        }
    }
    return { fileId, file, content, moduleKey, path: filePath };
}

async function recordAiRun({ projectId, userId, runType, result, targetPath, moduleKey }) {
    try {
        await pool.query(
            "INSERT INTO team_project_ai_runs (project_id, user_id, run_type, provider, target_path, module_key, status, score, result_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                projectId,
                userId,
                runType,
                result.provider || "local",
                targetPath || "",
                moduleKey || "",
                result.status || "completed",
                Number(result.review?.score || result.score || 0),
                JSON.stringify(result)
            ]
        );
    } catch (error) {
        console.warn("AI run record skipped:", error.message);
    }
}

router.get("/summary", authenticateJWT, async (req, res) => {
    try {
        const userId = getUserId(req);
        const ids = await listProjectIds(userId);
        let projects = [];
        if (ids.length) {
            const [rows] = await pool.query(
                `
                SELECT p.*,
                       (SELECT COUNT(*) FROM team_project_members m WHERE m.project_id = p.id) AS member_count,
                       (SELECT COUNT(*) FROM team_project_files f WHERE f.project_id = p.id) AS file_count,
                       (SELECT COUNT(*) FROM team_project_commits c WHERE c.project_id = p.id) AS commit_count
                FROM team_projects p
                WHERE p.id IN (?)
                ORDER BY p.updated_at DESC
            `,
                [ids]
            );
            projects = rows;
        }
        res.json({ success: true, data: { projects, roles: ROLE_TEMPLATES } });
    } catch (error) {
        console.error("团队项目概览失败:", error);
        res.status(500).json({ success: false, message: "团队项目概览加载失败" });
    }
});

router.post("/demo", authenticateJWT, async (req, res) => {
    try {
        const projectId = await createProjectWithDefaults(getUserId(req), req.body || {});
        res.json({ success: true, data: await projectDetail(projectId) });
    } catch (error) {
        console.error("创建示例团队项目失败:", error);
        res.status(500).json({ success: false, message: "创建示例团队项目失败" });
    }
});

router.post("/projects", authenticateJWT, async (req, res) => {
    try {
        const projectId = await createProjectWithDefaults(getUserId(req), req.body || {});
        res.json({ success: true, data: await projectDetail(projectId) });
    } catch (error) {
        console.error("创建团队项目失败:", error);
        res.status(500).json({ success: false, message: "创建团队项目失败" });
    }
});

router.delete("/projects/:id", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        if (Number(project.owner_id) !== Number(userId)) {
            return res.status(403).json({ success: false, message: "只有项目创建者可以删除项目" });
        }
        await pool.query("DELETE FROM team_projects WHERE id = ?", [projectId]);
        res.json({ success: true, message: "团队项目已删除" });
    } catch (error) {
        console.error("删除团队项目失败:", error);
        res.status(500).json({ success: false, message: "删除团队项目失败" });
    }
});

router.get("/projects/:id", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const project = await assertProjectAccess(projectId, getUserId(req));
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        res.json({ success: true, data: await projectDetail(projectId) });
    } catch (error) {
        console.error("团队项目详情失败:", error);
        res.status(500).json({ success: false, message: "团队项目详情加载失败" });
    }
});

router.get("/projects/:id/files/:fileId", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const fileId = Number(req.params.fileId);
        const project = await assertProjectAccess(projectId, getUserId(req));
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const [[file]] = await pool.query("SELECT * FROM team_project_files WHERE id = ? AND project_id = ?", [
            fileId,
            projectId
        ]);
        if (!file) return res.status(404).json({ success: false, message: "文件不存在" });
        res.json({ success: true, data: file });
    } catch (error) {
        console.error("团队项目文件读取失败:", error);
        res.status(500).json({ success: false, message: "文件读取失败" });
    }
});

router.get("/projects/:id/download", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const project = await assertProjectAccess(projectId, getUserId(req));
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const [files] = await pool.query(
            "SELECT path, content, updated_at FROM team_project_files WHERE project_id = ? ORDER BY path ASC",
            [projectId]
        );
        const readme = files.some(file => /^readme\.md$/i.test(file.path));
        const exportFiles = readme
            ? files
            : [
                  {
                      path: "README.md",
                      content: `# ${project.name}\n\n${project.description || "团队项目代码仓库"}\n\n## 拉取代码\n\n在团队项目页面点击 Code，可查看 clone、pull、上传与提交说明。\n`
                  },
                  ...files
              ];
        const archive = createTarGz(exportFiles);
        const safeName = sanitizeTarPath(project.repository_name || project.name || "team-repo").replace(/\//g, "-");
        res.setHeader("Content-Type", "application/gzip");
        res.setHeader("Content-Disposition", `attachment; filename="${safeName}.tar.gz"`);
        res.send(archive);
    } catch (error) {
        console.error("团队项目下载失败:", error);
        res.status(500).json({ success: false, message: "团队项目下载失败" });
    }
});

router.post("/projects/:id/files/save", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });

        const moduleKey = String(req.body.moduleKey || "frontend").trim();
        const filePath = String(req.body.path || "").trim();
        const content = String(req.body.content ?? "");
        const language = String(req.body.language || "javascript").toLowerCase();
        const message = String(req.body.message || "同步代码修改").trim();
        const positionLabel = String(req.body.positionLabel || filePath || "未标记位置").trim();
        if (!filePath) return res.status(400).json({ success: false, message: "文件路径不能为空" });

        const size = Buffer.byteLength(content, "utf-8");
        const [[existing]] = await pool.query("SELECT * FROM team_project_files WHERE project_id = ? AND path = ?", [
            projectId,
            filePath
        ]);
        let fileId;
        let version = 1;
        if (existing) {
            fileId = existing.id;
            version = Number(existing.version || 1) + 1;
            await pool.query(
                "UPDATE team_project_files SET module_key = ?, language = ?, content = ?, last_editor_id = ?, size_bytes = ?, version = ?, updated_at = NOW() WHERE id = ?",
                [moduleKey, language, content, userId, size, version, fileId]
            );
        } else {
            const [result] = await pool.query(
                "INSERT INTO team_project_files (project_id, module_key, path, language, content, owner_user_id, last_editor_id, size_bytes, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [projectId, moduleKey, filePath, language, content, userId, userId, size, 1]
            );
            fileId = result.insertId;
        }
        const changedLines = Number(req.body.changedLines) || Math.max(1, content.split(/\r?\n/).length);
        await pool.query(
            "INSERT INTO team_project_commits (project_id, file_id, user_id, message, module_key, position_label, changed_lines, snapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [projectId, fileId, userId, message, moduleKey, positionLabel, changedLines, content]
        );
        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, ?, ?, ?)",
            [projectId, userId, "code_saved", "学习项目代码已保存", `${filePath} · ${positionLabel} · v${version}`]
        );
        await pool.query(
            "UPDATE team_projects SET updated_at = NOW(), progress = LEAST(100, progress + 3) WHERE id = ?",
            [projectId]
        );

        res.json({ success: true, data: { fileId, version, detail: await projectDetail(projectId) } });
    } catch (error) {
        console.error("团队代码保存失败:", error);
        res.status(500).json({ success: false, message: "团队代码保存失败" });
    }
});

// ==================== 代码机器人 ====================

const KNOWN_DATABASES = [{ name: "edu_smart", label: "EduSmart 主库" }];
const GITHUB_API = "https://api.github.com";
const BOT_ROLE_NAMES = { frontend: "页面与交互", backend: "业务逻辑", testing: "测试与验收", deployment: "展示与发布" };

function teamRoleName(key) {
    return BOT_ROLE_NAMES[key] || key || "未知模块";
}

function githubHeaders(token) {
    const headers = { "User-Agent": "EduSmart-CodeBot", Accept: "application/vnd.github+json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

function inferModuleKey(path) {
    const p = String(path).toLowerCase();
    if (/^(tests?|spec)\//.test(p) || /\.(test|spec)\./.test(p)) return "testing";
    if (/^(deploy|docs|ops)\//.test(p)) return "deployment";
    if (/^(backend|server|api)\//.test(p)) return "backend";
    return "frontend";
}

function pathForApi(path) {
    return String(path)
        .split("/")
        .map(encodeURIComponent)
        .join("/");
}

async function getOrCreateBot(projectId) {
    const [[bot]] = await pool.query("SELECT * FROM team_project_bots WHERE project_id = ? LIMIT 1", [projectId]);
    if (bot) return bot;
    await pool.query("INSERT INTO team_project_bots (project_id, name) VALUES (?, 'CodeBot')", [projectId]);
    const [[created]] = await pool.query("SELECT * FROM team_project_bots WHERE project_id = ? LIMIT 1", [projectId]);
    return created;
}

async function getBotAccess(bot, userId) {
    const [[project]] = await pool.query("SELECT * FROM team_projects WHERE id = ?", [bot.project_id]);
    const isOwner = Number(project.owner_id) === Number(userId);
    const [[member]] = await pool.query(
        "SELECT * FROM team_project_bot_members WHERE bot_id = ? AND user_id = ? LIMIT 1",
        [bot.id, userId]
    );
    return {
        bot,
        project,
        isOwner,
        member: member || null,
        canConfig: isOwner,
        canManage: isOwner,
        canToggle: isOwner || Number(member?.can_toggle) === 1,
        canPull: isOwner || Number(member?.can_pull) === 1,
        canPush: isOwner || Number(member?.can_push) === 1,
        canBind: isOwner || Number(member?.can_bind) === 1
    };
}

function botActionGuard(bot) {
    return bot.enabled ? null : "机器人开关已关闭，请先打开开关";
}

// 机器人接口统一解析真实身份（需在 authenticateJWT 之后挂载）：
// 按 username 从 users 表取真实 id（防止演示模式 token id 与真实用户 id 撞车导致权限误判），
// 演示账号（users 表中不存在）直接拒绝使用机器人。
async function requireBotActor(req, res, next) {
    try {
        const [[row]] = await pool.query("SELECT id, username, role FROM users WHERE username = ? LIMIT 1", [req.user?.username]);
        if (!row) return res.status(403).json({ success: false, message: "演示账号无法使用代码机器人，请使用正式账号登录" });
        req.user.id = row.id;
        next();
    } catch (error) {
        console.error("机器人身份解析失败:", error);
        res.status(500).json({ success: false, message: "机器人身份解析失败" });
    }
}

router.get("/projects/:id/bot", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const [members] = await pool.query("SELECT * FROM team_project_bot_members WHERE bot_id = ? ORDER BY id", [bot.id]);
        const access = await getBotAccess(bot, userId);
        res.json({
            success: true,
            data: {
                bot: { ...bot, github_token: bot.github_token ? "******" : "" },
                members,
                access: {
                    isOwner: access.isOwner,
                    member: Boolean(access.member),
                    canConfig: access.canConfig,
                    canManage: access.canManage,
                    canToggle: access.canToggle,
                    canPull: access.canPull,
                    canPush: access.canPush,
                    canBind: access.canBind
                }
            }
        });
    } catch (error) {
        console.error("读取机器人配置失败:", error);
        res.status(500).json({ success: false, message: "机器人配置加载失败" });
    }
});

router.post("/projects/:id/bot", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const access = await getBotAccess(bot, userId);
        if (!access.canConfig) return res.status(403).json({ success: false, message: "只有项目创建者可以修改机器人配置" });
        const { name, github_repo, github_branch, github_token, database_name } = req.body || {};
        const updates = [];
        const params = [];
        if (name !== undefined) { updates.push("name = ?"); params.push(String(name).trim().slice(0, 120) || "CodeBot"); }
        if (github_repo !== undefined) { updates.push("github_repo = ?"); params.push(String(github_repo).trim().slice(0, 260)); }
        if (github_branch !== undefined) { updates.push("github_branch = ?"); params.push(String(github_branch).trim().slice(0, 120) || "main"); }
        if (github_token !== undefined && github_token !== "******") { updates.push("github_token = ?"); params.push(String(github_token).trim().slice(0, 260)); }
        if (database_name !== undefined) { updates.push("database_name = ?"); params.push(String(database_name).trim().slice(0, 120)); }
        if (updates.length) {
            params.push(bot.id);
            await pool.query(`UPDATE team_project_bots SET ${updates.join(", ")} WHERE id = ?`, params);
        }
        const [[updated]] = await pool.query("SELECT * FROM team_project_bots WHERE id = ?", [bot.id]);
        res.json({ success: true, message: "机器人配置已保存", data: { bot: { ...updated, github_token: updated.github_token ? "******" : "" } } });
    } catch (error) {
        console.error("保存机器人配置失败:", error);
        res.status(500).json({ success: false, message: "机器人配置保存失败" });
    }
});

router.post("/projects/:id/bot/toggle", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const access = await getBotAccess(bot, userId);
        if (!access.canToggle) return res.status(403).json({ success: false, message: "没有机器人开关的权限" });
        const next = bot.enabled ? 0 : 1;
        await pool.query("UPDATE team_project_bots SET enabled = ? WHERE id = ?", [next, bot.id]);
        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, 'bot_toggle', ?, ?)",
            [projectId, userId, next ? "代码机器人已开启" : "代码机器人已关闭", `操作人: ${req.user.username || userId}`]
        );
        res.json({ success: true, message: next ? "机器人已开启" : "机器人已关闭", data: { enabled: next } });
    } catch (error) {
        console.error("机器人开关失败:", error);
        res.status(500).json({ success: false, message: "机器人开关操作失败" });
    }
});

router.post("/projects/:id/bot/members", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const access = await getBotAccess(bot, userId);
        if (!access.canManage) return res.status(403).json({ success: false, message: "只有项目创建者可以分配机器人权限" });
        const { username, can_pull, can_push, can_bind, can_toggle } = req.body || {};
        if (!String(username || "").trim()) return res.status(400).json({ success: false, message: "请填写要授权的用户名" });
        const [[user]] = await pool.query("SELECT id, username FROM users WHERE username = ? LIMIT 1", [String(username).trim()]);
        if (!user) return res.status(404).json({ success: false, message: `用户 ${username} 不存在` });
        await pool.query(
            `INSERT INTO team_project_bot_members (bot_id, project_id, user_id, username, can_pull, can_push, can_bind, can_toggle)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE can_pull = VALUES(can_pull), can_push = VALUES(can_push), can_bind = VALUES(can_bind), can_toggle = VALUES(can_toggle)`,
            [bot.id, projectId, user.id, user.username, Number(can_pull) ? 1 : 0, Number(can_push) ? 1 : 0, Number(can_bind) ? 1 : 0, Number(can_toggle) ? 1 : 0]
        );
        res.json({ success: true, message: `已为 ${user.username} 更新机器人权限` });
    } catch (error) {
        console.error("机器人权限分配失败:", error);
        res.status(500).json({ success: false, message: "机器人权限分配失败" });
    }
});

router.delete("/projects/:id/bot/members/:memberId", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const access = await getBotAccess(bot, userId);
        if (!access.canManage) return res.status(403).json({ success: false, message: "只有项目创建者可以移除机器人权限" });
        await pool.query("DELETE FROM team_project_bot_members WHERE id = ? AND bot_id = ?", [Number(req.params.memberId), bot.id]);
        res.json({ success: true, message: "已移除该人员的机器人权限" });
    } catch (error) {
        console.error("移除机器人权限失败:", error);
        res.status(500).json({ success: false, message: "移除机器人权限失败" });
    }
});

router.post("/projects/:id/bot/pull", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const access = await getBotAccess(bot, userId);
        if (!access.canPull && !access.isOwner) return res.status(403).json({ success: false, message: "没有拉取代码的权限，请联系项目创建者分配" });
        const guard = botActionGuard(bot);
        if (guard) return res.status(400).json({ success: false, message: guard });
        if (!bot.github_repo) return res.status(400).json({ success: false, message: "请先绑定 GitHub 仓库（格式：owner/repo）" });

        const branch = bot.github_branch || "main";
        const treeRes = await axios.get(
            `${GITHUB_API}/repos/${bot.github_repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
            { headers: githubHeaders(bot.github_token), timeout: 30000 }
        );
        const blobs = (treeRes.data?.tree || []).filter(item => item.type === "blob");
        const skipExt = /\.(png|jpe?g|gif|svg|ico|woff2?|ttf|eot|mp4|mp3|zip|gz|pdf|exe|dll|so|dylib|class|jar|lock)$/i;
        const targets = blobs.filter(b => Number(b.size || 0) <= 512 * 1024 && !skipExt.test(b.path)).slice(0, 200);
        let saved = 0;
        const failed = [];
        for (const blob of targets) {
            try {
                const raw = await axios.get(
                    `https://raw.githubusercontent.com/${bot.github_repo}/${encodeURIComponent(branch)}/${pathForApi(blob.path)}`,
                    { headers: githubHeaders(bot.github_token), timeout: 30000, responseType: "text" }
                );
                const content = typeof raw.data === "string" ? raw.data : String(raw.data ?? "");
                const fileName = blob.path.split("/").pop() || "file.txt";
                const ext = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "txt";
                const lang = ext === "js" ? "javascript" : ext === "md" ? "markdown" : ext === "py" ? "python" : ext;
                await pool.query(
                    `INSERT INTO team_project_files (project_id, module_key, path, language, content, size_bytes, version)
                     VALUES (?, ?, ?, ?, ?, ?, 1)
                     ON DUPLICATE KEY UPDATE content = VALUES(content), size_bytes = VALUES(size_bytes), version = version + 1, updated_at = NOW()`,
                    [projectId, inferModuleKey(blob.path), blob.path, lang, content, Buffer.byteLength(content, "utf8")]
                );
                saved++;
            } catch (e) {
                failed.push(`${blob.path}: ${e.message}`);
            }
        }
        await pool.query("UPDATE team_project_bots SET last_pull_at = NOW() WHERE id = ?", [bot.id]);
        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, 'bot_pull', '机器人拉取代码完成', ?)",
            [projectId, userId, `${bot.github_repo}@${branch} · 更新 ${saved} 个文件${failed.length ? ` · 失败 ${failed.length}` : ""}`]
        );
        res.json({
            success: true,
            message: `拉取完成：更新 ${saved} 个文件${failed.length ? `，失败 ${failed.length} 个` : ""}`,
            data: { saved, total: targets.length, failed: failed.slice(0, 10) }
        });
    } catch (error) {
        const status = error.response?.status;
        console.error("机器人拉取代码失败:", error.message);
        res.status(500).json({
            success: false,
            message: status === 404 ? "仓库或分支不存在（私有仓库需要在绑定中配置 Token）" : `拉取失败: ${error.message}`
        });
    }
});

router.post("/projects/:id/bot/push", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const access = await getBotAccess(bot, userId);
        if (!access.canPush && !access.isOwner) return res.status(403).json({ success: false, message: "没有推送代码的权限，请联系项目创建者分配" });
        const guard = botActionGuard(bot);
        if (guard) return res.status(400).json({ success: false, message: guard });
        if (!bot.github_repo) return res.status(400).json({ success: false, message: "请先绑定 GitHub 仓库（格式：owner/repo）" });
        if (!bot.github_token) return res.status(400).json({ success: false, message: "推送到 GitHub 需要配置 Token（需 repo 写权限）" });

        const branch = bot.github_branch || "main";
        const [files] = await pool.query(
            "SELECT path, content FROM team_project_files WHERE project_id = ? ORDER BY path ASC LIMIT 100",
            [projectId]
        );
        if (!files.length) return res.status(400).json({ success: false, message: "仓库中暂无代码文件可推送" });
        let pushed = 0;
        const failed = [];
        for (const file of files) {
            try {
                let sha = null;
                try {
                    const head = await axios.get(
                        `${GITHUB_API}/repos/${bot.github_repo}/contents/${pathForApi(file.path)}?ref=${encodeURIComponent(branch)}`,
                        { headers: githubHeaders(bot.github_token), timeout: 30000 }
                    );
                    sha = head.data?.sha || null;
                } catch (e) {
                    sha = null;
                }
                await axios.put(
                    `${GITHUB_API}/repos/${bot.github_repo}/contents/${pathForApi(file.path)}`,
                    {
                        message: `CodeBot sync: ${file.path}`,
                        content: Buffer.from(String(file.content || ""), "utf8").toString("base64"),
                        branch,
                        ...(sha ? { sha } : {})
                    },
                    { headers: githubHeaders(bot.github_token), timeout: 30000 }
                );
                pushed++;
            } catch (e) {
                failed.push(`${file.path}: ${e.response?.status || ""} ${e.message}`.trim());
            }
        }
        await pool.query("UPDATE team_project_bots SET last_push_at = NOW() WHERE id = ?", [bot.id]);
        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, 'bot_push', '机器人推送代码完成', ?)",
            [projectId, userId, `${bot.github_repo}@${branch} · 推送 ${pushed} 个文件${failed.length ? ` · 失败 ${failed.length}` : ""}`]
        );
        res.json({
            success: true,
            message: `推送完成：${pushed} 个文件${failed.length ? `，失败 ${failed.length} 个` : ""}`,
            data: { pushed, total: files.length, failed: failed.slice(0, 10) }
        });
    } catch (error) {
        console.error("机器人推送代码失败:", error.message);
        res.status(500).json({ success: false, message: `推送失败: ${error.message}` });
    }
});

router.post("/projects/:id/bot/bind-db", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const access = await getBotAccess(bot, userId);
        if (!access.canBind && !access.isOwner) return res.status(403).json({ success: false, message: "没有绑定数据库的权限，请联系项目创建者分配" });
        const guard = botActionGuard(bot);
        if (guard) return res.status(400).json({ success: false, message: guard });
        const { databaseName } = req.body || {};
        const known = KNOWN_DATABASES.find(db => db.name === String(databaseName || "").trim());
        if (!known) return res.status(400).json({ success: false, message: "未知的数据库，请从列表中选择" });
        const [tables] = await pool.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
        await pool.query("UPDATE team_project_bots SET database_name = ? WHERE id = ?", [known.name, bot.id]);
        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, 'bot_bind_db', '机器人绑定数据库成功', ?)",
            [projectId, userId, `${known.label}（${known.name}）· ${tables.length} 张表`]
        );
        res.json({
            success: true,
            message: `已绑定数据库 ${known.label}（${tables.length} 张表）`,
            data: { databaseName: known.name, label: known.label, tables: tables.map(t => t.name) }
        });
    } catch (error) {
        console.error("机器人绑定数据库失败:", error);
        res.status(500).json({ success: false, message: "绑定数据库失败" });
    }
});

router.post("/projects/:id/bot/analyze", authenticateJWT, requireBotActor, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertBotProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const bot = await getOrCreateBot(projectId);
        const access = await getBotAccess(bot, userId);
        const assigned = access.isOwner || access.member;
        if (!assigned) return res.status(403).json({ success: false, message: "只有项目创建者或被分配的人员可以使用机器人读取代码与需求" });
        if (!bot.enabled) return res.status(400).json({ success: false, message: "机器人开关已关闭，请先打开开关" });

        const [files] = await pool.query(
            "SELECT module_key, path, size_bytes, updated_at FROM team_project_files WHERE project_id = ? ORDER BY updated_at DESC",
            [projectId]
        );
        const [briefs] = await pool.query(
            "SELECT title, optimized, updated_at FROM team_project_briefs WHERE project_id = ? ORDER BY updated_at DESC",
            [projectId]
        );
        const moduleStats = {};
        let totalSize = 0;
        files.forEach(f => {
            moduleStats[f.module_key] = moduleStats[f.module_key] || { count: 0, size: 0 };
            moduleStats[f.module_key].count++;
            moduleStats[f.module_key].size += Number(f.size_bytes || 0);
            totalSize += Number(f.size_bytes || 0);
        });
        const lines = [];
        lines.push(`# 代码机器人巡检报告`);
        lines.push(``);
        lines.push(`- 项目：${project.name}`);
        lines.push(`- 机器人：${bot.name}（${bot.enabled ? "已开启" : "已关闭"}）`);
        lines.push(`- GitHub：${bot.github_repo ? `${bot.github_repo}@${bot.github_branch || "main"}` : "未绑定"}`);
        lines.push(`- 数据库：${bot.database_name ? `已绑定 ${bot.database_name}` : "未绑定"}`);
        lines.push(``);
        lines.push(`## 代码资产`);
        lines.push(`共 ${files.length} 个文件，约 ${(totalSize / 1024).toFixed(1)} KB。`);
        Object.entries(moduleStats).forEach(([key, stat]) => {
            lines.push(`- ${teamRoleName(key)}：${stat.count} 个文件 / ${(stat.size / 1024).toFixed(1)} KB`);
        });
        lines.push(``);
        lines.push(`## 最近更新的文件`);
        files.slice(0, 8).forEach(f => lines.push(`- ${f.path}（${teamRoleName(f.module_key)} · ${f.updated_at}）`));
        if (!files.length) lines.push("- 暂无代码文件，可通过一键拉取或上传代码补充");
        lines.push(``);
        lines.push(`## 需求清单`);
        if (briefs.length) {
            briefs.forEach(b => lines.push(`- ${b.title}（${b.optimized ? "已优化" : "草稿"} · ${b.updated_at}）`));
        } else {
            lines.push("- 暂无需求描述，可在「需求描述」页面新增");
        }
        lines.push(``);
        lines.push(`## 机器人建议`);
        if (!bot.github_repo) lines.push("- 尚未绑定 GitHub，绑定后可一键拉取/推送代码");
        if (!bot.database_name) lines.push("- 尚未绑定数据库，绑定后机器人可读取库表结构");
        if (!briefs.length) lines.push("- 建议先在「需求描述」中沉淀需求，再用 AI 优化");
        if (!files.some(f => f.module_key === "testing")) lines.push("- 测试模块暂无文件，建议补充测试用例");

        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, 'bot_analyze', '机器人读取代码与需求完成', ?)",
            [projectId, userId, `代码 ${files.length} 个文件 · 需求 ${briefs.length} 条`]
        );
        res.json({ success: true, data: { report: lines.join("\n"), stats: { files: files.length, briefs: briefs.length, modules: moduleStats } } });
    } catch (error) {
        console.error("机器人读取失败:", error);
        res.status(500).json({ success: false, message: "机器人读取失败" });
    }
});

// ==================== 需求描述（需求简报） ====================

router.get("/projects/:id/briefs", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const project = await assertProjectAccess(projectId, getUserId(req));
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const [rows] = await pool.query(
            "SELECT * FROM team_project_briefs WHERE project_id = ? ORDER BY updated_at DESC, id DESC",
            [projectId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("需求描述列表失败:", error);
        res.status(500).json({ success: false, message: "需求描述加载失败" });
    }
});

router.post("/projects/:id/briefs", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const { title, description, optimized } = req.body || {};
        if (!String(title || "").trim()) return res.status(400).json({ success: false, message: "请填写需求标题" });
        if (!String(description || "").trim()) return res.status(400).json({ success: false, message: "请填写需求描述" });
        const [result] = await pool.query(
            "INSERT INTO team_project_briefs (project_id, user_id, title, description, optimized, status) VALUES (?, ?, ?, ?, ?, 'draft')",
            [projectId, userId, String(title).trim().slice(0, 200), String(description), optimized ? String(optimized) : null]
        );
        res.json({ success: true, data: { id: result.insertId }, message: "需求已保存" });
    } catch (error) {
        console.error("需求描述保存失败:", error);
        res.status(500).json({ success: false, message: "需求描述保存失败" });
    }
});

router.put("/projects/:id/briefs/:briefId", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const briefId = Number(req.params.briefId);
        const project = await assertProjectAccess(projectId, getUserId(req));
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        const { title, description, optimized } = req.body || {};
        if (!String(title || "").trim()) return res.status(400).json({ success: false, message: "请填写需求标题" });
        if (!String(description || "").trim()) return res.status(400).json({ success: false, message: "请填写需求描述" });
        const [result] = await pool.query(
            "UPDATE team_project_briefs SET title = ?, description = ?, optimized = ? WHERE id = ? AND project_id = ?",
            [String(title).trim().slice(0, 200), String(description), optimized ? String(optimized) : null, briefId, projectId]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "需求不存在" });
        res.json({ success: true, message: "需求已更新" });
    } catch (error) {
        console.error("需求描述更新失败:", error);
        res.status(500).json({ success: false, message: "需求描述更新失败" });
    }
});

router.delete("/projects/:id/briefs/:briefId", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const briefId = Number(req.params.briefId);
        const project = await assertProjectAccess(projectId, getUserId(req));
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });
        await pool.query("DELETE FROM team_project_briefs WHERE id = ? AND project_id = ?", [briefId, projectId]);
        res.json({ success: true, message: "需求已删除" });
    } catch (error) {
        console.error("需求描述删除失败:", error);
        res.status(500).json({ success: false, message: "需求描述删除失败" });
    }
});

router.post("/projects/:id/ai-review", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });

        const { content, moduleKey, path: filePath } = await resolvePipelineInput(projectId, req.body);
        const review = await aiDevOps.reviewCode({ content, moduleKey, path: filePath, project });
        await recordAiRun({ projectId, userId, runType: "ai-review", result: review, targetPath: filePath, moduleKey });
        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, ?, ?, ?)",
            [projectId, userId, "ai_review", "AI 代码审查完成", `${filePath} · ${review.level} · ${review.score}分`]
        );
        res.json({ success: true, data: review });
    } catch (error) {
        console.error("AI 代码审查失败:", error);
        res.status(500).json({ success: false, message: "AI 代码审查失败" });
    }
});

router.post("/projects/:id/ai-pipeline", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });

        const input = await resolvePipelineInput(projectId, req.body);
        const mode = String(req.body.mode || "full");
        let result;
        if (mode === "review") result = await aiDevOps.reviewCode({ ...input, project });
        else if (mode === "test") result = await aiDevOps.generateTests({ ...input, project });
        else if (mode === "fix") result = await aiDevOps.suggestFix({ ...input, project });
        else result = await aiDevOps.runPipeline({ ...input, project });

        await recordAiRun({
            projectId,
            userId,
            runType: `ai-${mode}`,
            result,
            targetPath: input.path,
            moduleKey: input.moduleKey
        });
        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, ?, ?, ?)",
            [
                projectId,
                userId,
                "ai_pipeline",
                "AI DevOps 流水线完成",
                `${input.path} · ${mode} · ${result.provider || "local"}`
            ]
        );
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("AI DevOps 流水线失败:", error);
        res.status(500).json({ success: false, message: "AI DevOps 流水线失败" });
    }
});

router.post("/projects/:id/tools/run", authenticateJWT, async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const userId = getUserId(req);
        const project = await assertProjectAccess(projectId, userId);
        if (!project) return res.status(404).json({ success: false, message: "项目不存在或无权限访问" });

        const tool = String(req.body.tool || "mcp");
        const roleKey = String(req.body.roleKey || "frontend");
        const task = String(req.body.task || "").trim();
        const result = await aiDevOps.runTool({ tool, roleKey, task, project });
        await pool.query(
            "INSERT INTO team_project_events (project_id, user_id, event_type, title, detail) VALUES (?, ?, ?, ?, ?)",
            [projectId, userId, "tool_run", "外部工具调用完成", `${tool} · ${roleKey} · ${task || "默认任务"}`]
        );
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("外部工具调用失败:", error);
        res.status(500).json({ success: false, message: "外部工具调用失败" });
    }
});

module.exports = router;
