const express = require("express");
const zlib = require("zlib");
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
}

ensureTables().catch(e => console.warn("team-code tables init:", e.message));

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
