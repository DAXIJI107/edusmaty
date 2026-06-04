const fs = require("fs");
const path = require("path");

const DEFAULT_VAULT_DIR = path.join(__dirname, "..", "..", "obsidian-vault");
const QUESTION_BANK_DIR = path.join(DEFAULT_VAULT_DIR, "07-试题库");
const GENERATED_DIRS = {
    notes: "智能笔记",
    reviews: "错题复盘",
    paths: "学习路径"
};

const SUBJECT_LABELS = {
    software_engineering: "软件工程",
    programming_foundations: "程序设计基础",
    computer_networks: "计算机网络",
    operating_systems: "操作系统",
    data_structures_algorithms: "数据结构与算法",
    databases: "数据库",
    artificial_intelligence: "人工智能"
};

function normalizeText(value) {
    return String(value || "")
        .replace(/\r\n/g, "\n")
        .trim();
}

function slugify(value) {
    return (
        String(value || "note")
            .trim()
            .replace(/[\\/:*?"<>|]/g, "-")
            .replace(/\s+/g, "-")
            .slice(0, 80) || "note"
    );
}

function readMarkdownFile(filePath, vaultDir = DEFAULT_VAULT_DIR) {
    const markdown = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(vaultDir, filePath).replace(/\\/g, "/");
    const frontmatter = readFrontmatter(markdown);
    const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
    const title =
        normalizeText(body.match(/^#\s+(.+)$/m)?.[1]) ||
        normalizeText(frontmatter.title) ||
        path.basename(filePath, ".md");
    const wikilinks = [...body.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)]
        .map(match => normalizeText(match[1]))
        .filter(Boolean);
    const tags = [
        ...String(frontmatter.tags || "")
            .replace(/[\[\]]/g, "")
            .split(","),
        ...[...body.matchAll(/(^|\s)#([\u4e00-\u9fa5A-Za-z0-9_/-]+)/g)].map(match => match[2])
    ]
        .map(item => normalizeText(item).replace(/^#/, ""))
        .filter(Boolean);
    const headings = [...body.matchAll(/^(#{1,4})\s+(.+)$/gm)].map(match => ({
        level: match[1].length,
        title: normalizeText(match[2])
    }));
    const stat = fs.statSync(filePath);
    const folder = relativePath.includes("/") ? relativePath.split("/")[0] : "根目录";
    const kind = inferNoteKind(relativePath, tags);

    return {
        id: relativePath,
        path: relativePath,
        absolutePath: filePath,
        title,
        folder,
        kind,
        frontmatter,
        tags: [...new Set(tags)],
        links: [...new Set(wikilinks)],
        headings,
        size: stat.size,
        updatedAt: stat.mtime,
        createdAt: stat.birthtime,
        preview: normalizeText(body.replace(/```[\s\S]*?```/g, "").replace(/[#>*_\-[\]()`]/g, " ")).slice(0, 220),
        content: markdown
    };
}

function inferNoteKind(relativePath, tags = []) {
    if (relativePath.includes("07-试题库")) return "question";
    if (relativePath.includes("08-知识图谱")) return "graph";
    if (relativePath.includes("09-课程大纲")) return "path";
    if (relativePath.includes("10-项目文档")) return "project";
    if (relativePath.includes(GENERATED_DIRS.notes)) return "smart-note";
    if (relativePath.includes(GENERATED_DIRS.reviews)) return "review";
    if (relativePath.includes(GENERATED_DIRS.paths)) return "path";
    if (tags.includes("question-bank")) return "question";
    if (tags.includes("course")) return "course";
    return "knowledge";
}

function readFrontmatter(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) return {};
    const data = {};
    for (const line of match[1].split("\n")) {
        const pair = line.match(/^([A-Za-z0-9_-]+):\s*"?([^"\n]+)"?\s*$/);
        if (pair) data[pair[1]] = pair[2];
    }
    return data;
}

function subjectLabel(value) {
    const normalized = String(value || "").trim();
    return SUBJECT_LABELS[normalized] || normalized || "计算机综合";
}

function extractField(block, label) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`- \\*\\*${escaped}\\*\\*：([\\s\\S]*?)(?=\\n- \\*\\*|\\n### |$)`);
    const match = block.match(pattern);
    return normalizeText(match?.[1] || "");
}

function buildChoiceOptions(answer, knowledgePoint) {
    const correct = normalizeText(answer).slice(0, 360);
    const point = normalizeText(knowledgePoint) || "该知识点";
    return [
        correct,
        `只记住“${point}”的名称，不需要结合场景或排错过程。`,
        `遇到“${point}”相关问题时，应先跳过概念分析，直接套用任意模板。`,
        `“${point}”与工程实践无关，通常不需要验证输入、流程和边界条件。`
    ];
}

function parseQuestionMarkdown(filePath) {
    const markdown = fs.readFileSync(filePath, "utf8");
    const frontmatter = readFrontmatter(markdown);
    const subject = subjectLabel(frontmatter.subject || path.basename(filePath).replace(/_试题库\.md$/i, ""));
    const relativePath = path.relative(DEFAULT_VAULT_DIR, filePath).replace(/\\/g, "/");
    const blocks = markdown.split(/\n(?=###\s+Q\d+\s+\[[^\]]+\])/g);
    const questions = [];

    for (const block of blocks) {
        const head = block.match(/^###\s+Q(\d+)\s+\[([^\]]+)\]/m);
        if (!head) continue;
        const knowledgePoint = extractField(block, "知识点");
        const course = extractField(block, "课程");
        const question = extractField(block, "问题");
        const answer = extractField(block, "答案");
        if (!question || !answer) continue;
        questions.push({
            externalId: head[2],
            order: Number(head[1]),
            subject,
            course,
            knowledgePoint: knowledgePoint || course || subject,
            question,
            answer,
            options: buildChoiceOptions(answer, knowledgePoint),
            difficulty: "medium",
            sourceName: "Obsidian试题库",
            sourceUrl: `obsidian://${relativePath}#${head[2]}`
        });
    }

    return questions;
}

function listQuestionFiles(vaultDir = DEFAULT_VAULT_DIR) {
    const dir = path.join(vaultDir, "07-试题库");
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter(name => name.endsWith(".md") && !name.includes("总览"))
        .map(name => path.join(dir, name));
}

function listMarkdownFiles(vaultDir = DEFAULT_VAULT_DIR) {
    const files = [];
    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name === ".obsidian" || entry.name === "node_modules") continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                files.push(fullPath);
            }
        }
    }
    walk(vaultDir);
    return files;
}

function buildVaultIndex(vaultDir = DEFAULT_VAULT_DIR) {
    const notes = listMarkdownFiles(vaultDir).map(file => readMarkdownFile(file, vaultDir));
    const byTitle = new Map();
    for (const note of notes) {
        byTitle.set(note.title, note);
        byTitle.set(path.basename(note.path, ".md"), note);
    }

    const edges = [];
    const unresolved = new Set();
    for (const note of notes) {
        for (const targetTitle of note.links) {
            const target = byTitle.get(targetTitle);
            if (target) {
                edges.push({ source: note.path, target: target.path, type: "wikilink", label: "双链" });
            } else {
                unresolved.add(targetTitle);
                edges.push({
                    source: note.path,
                    target: `virtual:${targetTitle}`,
                    type: "unresolved",
                    label: "待创建"
                });
            }
        }
    }

    const folders = {};
    const tags = {};
    const kinds = {};
    for (const note of notes) {
        folders[note.folder] = (folders[note.folder] || 0) + 1;
        kinds[note.kind] = (kinds[note.kind] || 0) + 1;
        for (const tag of note.tags) tags[tag] = (tags[tag] || 0) + 1;
    }

    const linkedTargets = new Set(edges.map(edge => edge.target).filter(item => !item.startsWith("virtual:")));
    const linkedSources = new Set(edges.map(edge => edge.source));
    const isolated = notes
        .filter(note => !linkedTargets.has(note.path) && !linkedSources.has(note.path))
        .map(note => ({ path: note.path, title: note.title, kind: note.kind, folder: note.folder }))
        .slice(0, 40);

    return {
        vaultDir,
        notes,
        edges,
        unresolved: [...unresolved].slice(0, 80),
        stats: {
            notes: notes.length,
            links: edges.length,
            unresolved: unresolved.size,
            folders: Object.keys(folders).length,
            tags: Object.keys(tags).length,
            isolated: isolated.length
        },
        folders,
        tags,
        kinds,
        isolated,
        recent: [...notes]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 12)
            .map(summarizeNote)
    };
}

function summarizeNote(note) {
    return {
        path: note.path,
        title: note.title,
        folder: note.folder,
        kind: note.kind,
        tags: note.tags.slice(0, 8),
        links: note.links.slice(0, 12),
        headings: note.headings.slice(0, 8),
        updatedAt: note.updatedAt,
        preview: note.preview,
        obsidianUri: `obsidian://open?path=${encodeURIComponent(note.absolutePath)}`
    };
}

function buildVaultGraph(vaultDir = DEFAULT_VAULT_DIR, options = {}) {
    const index = buildVaultIndex(vaultDir);
    const limit = Math.min(Number(options.limit || 260), 600);
    const important = [...index.notes]
        .sort((a, b) => b.links.length + b.headings.length - (a.links.length + a.headings.length))
        .slice(0, limit);
    const allowed = new Set(important.map(note => note.path));
    const nodes = important.map(note => ({
        id: note.path,
        label: note.title,
        title: note.title,
        group: note.kind,
        kind: note.kind,
        folder: note.folder,
        value: Math.max(4, Math.min(22, 6 + note.links.length + note.headings.length)),
        tags: note.tags.slice(0, 6),
        preview: note.preview,
        obsidianUri: `obsidian://open?path=${encodeURIComponent(note.absolutePath)}`
    }));
    const edges = index.edges.filter(edge => allowed.has(edge.source) && allowed.has(edge.target)).slice(0, limit * 3);
    return {
        stats: index.stats,
        nodes,
        edges,
        isolated: index.isolated,
        unresolved: index.unresolved,
        folders: index.folders,
        kinds: index.kinds
    };
}

function getVaultNote(relativePath, vaultDir = DEFAULT_VAULT_DIR) {
    const safePath = normalizeRelativeVaultPath(relativePath);
    const fullPath = path.resolve(vaultDir, safePath);
    const root = path.resolve(vaultDir);
    if (!fullPath.startsWith(root) || !fs.existsSync(fullPath)) {
        throw new Error("笔记不存在或路径不安全");
    }
    return summarizeNote(readMarkdownFile(fullPath, vaultDir));
}

function searchVault(query, vaultDir = DEFAULT_VAULT_DIR) {
    const keyword = normalizeText(query).toLowerCase();
    const index = buildVaultIndex(vaultDir);
    if (!keyword) return index.recent;
    return index.notes
        .map(note => {
            const haystack = `${note.title}\n${note.path}\n${note.tags.join(" ")}\n${note.preview}`.toLowerCase();
            const score =
                (note.title.toLowerCase().includes(keyword) ? 8 : 0) +
                (note.path.toLowerCase().includes(keyword) ? 4 : 0) +
                (note.tags.some(tag => tag.toLowerCase().includes(keyword)) ? 3 : 0) +
                (haystack.includes(keyword) ? 2 : 0);
            return { note, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 30)
        .map(item => summarizeNote(item.note));
}

function normalizeRelativeVaultPath(relativePath) {
    const clean = String(relativePath || "")
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");
    if (!clean || clean.includes("..")) throw new Error("路径不安全");
    return clean;
}

function ensureVaultDir(vaultDir, relativeDir) {
    const safeDir = normalizeRelativeVaultPath(relativeDir);
    const fullDir = path.resolve(vaultDir, safeDir);
    const root = path.resolve(vaultDir);
    if (!fullDir.startsWith(root)) throw new Error("目录不安全");
    fs.mkdirSync(fullDir, { recursive: true });
    return fullDir;
}

function writeVaultMarkdown({
    title,
    body,
    folder = GENERATED_DIRS.notes,
    tags = [],
    links = [],
    vaultDir = DEFAULT_VAULT_DIR
}) {
    const dir = ensureVaultDir(vaultDir, folder);
    const now = new Date();
    const filename = `${now.toISOString().slice(0, 10)}-${slugify(title)}.md`;
    const fullPath = path.join(dir, filename);
    const uniqueLinks = [...new Set(links.map(normalizeText).filter(Boolean))];
    const uniqueTags = [...new Set(tags.map(normalizeText).filter(Boolean))];
    const markdown = [
        "---",
        `title: "${String(title || "智能笔记").replace(/"/g, '\\"')}"`,
        `created: "${now.toISOString()}"`,
        `source: "edusmart"`,
        `tags: [${uniqueTags.map(tag => `"${tag.replace(/"/g, '\\"')}"`).join(", ")}]`,
        "---",
        "",
        `# ${title || "智能笔记"}`,
        "",
        uniqueLinks.length ? `关联：${uniqueLinks.map(link => `[[${link}]]`).join(" ")}` : "",
        "",
        normalizeText(body),
        "",
        "## 后续动作",
        "- [ ] 复习本条笔记",
        "- [ ] 关联至少一道练习题",
        "- [ ] 更新对应知识点掌握状态",
        ""
    ]
        .filter((line, index, arr) => line || arr[index - 1])
        .join("\n");
    fs.writeFileSync(fullPath, markdown, "utf8");
    return summarizeNote(readMarkdownFile(fullPath, vaultDir));
}

function writeLearningPathMarkdown({ title, goal, steps = [], links = [], vaultDir = DEFAULT_VAULT_DIR }) {
    const body = [
        `目标：${goal || title || "完成学习路径"}`,
        "",
        "## 路径步骤",
        ...steps.map((step, index) => {
            const stepTitle = normalizeText(step.title || step);
            const target = normalizeText(step.link || stepTitle);
            return `- [ ] ${index + 1}. [[${target}]]${step.desc ? `：${step.desc}` : ""}`;
        }),
        "",
        "## 项目回写",
        "- 由 EduSmart 根据 Obsidian 知识库和学习画像生成",
        "- 完成状态可以在 Obsidian 中继续维护"
    ].join("\n");
    return writeVaultMarkdown({
        title: title || "学习路径",
        body,
        folder: GENERATED_DIRS.paths,
        tags: ["learning-path", "edusmart"],
        links,
        vaultDir
    });
}

function parseObsidianQuestionBank(vaultDir = DEFAULT_VAULT_DIR) {
    const files = listQuestionFiles(vaultDir);
    const questions = files.flatMap(parseQuestionMarkdown);
    const subjects = {};
    const courses = {};
    for (const item of questions) {
        subjects[item.subject] = (subjects[item.subject] || 0) + 1;
        if (item.course) courses[item.course] = (courses[item.course] || 0) + 1;
    }
    return { vaultDir, files, questions, subjects, courses };
}

async function tableExists(pool, tableName) {
    const [rows] = await pool.query("SHOW TABLES LIKE ?", [tableName]);
    return rows.length > 0;
}

async function columnExists(pool, tableName, columnName) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
    return rows.length > 0;
}

async function detectQuestionSchema(pool) {
    if (
        (await tableExists(pool, "knowledge_points")) &&
        (await columnExists(pool, "questions", "knowledge_id")) &&
        (await columnExists(pool, "questions", "question")) &&
        (await columnExists(pool, "questions", "correct_answer"))
    ) {
        return "app";
    }
    if (
        (await tableExists(pool, "knowledge_nodes")) &&
        (await columnExists(pool, "questions", "content")) &&
        (await columnExists(pool, "questions", "answer"))
    ) {
        return "legacy";
    }
    return "unknown";
}

async function findOrCreateKnowledgePoint(pool, item) {
    const title = item.knowledgePoint || item.course || item.subject;
    const [existing] = await pool.query("SELECT id FROM knowledge_points WHERE title = ? AND subject = ? LIMIT 1", [
        title,
        item.subject
    ]);
    if (existing.length) return existing[0].id;
    const [result] = await pool.query(
        "INSERT INTO knowledge_points (title, subject, summary, mastery, source_name, source_url) VALUES (?, ?, ?, ?, ?, ?)",
        [
            title,
            item.subject,
            `${item.course || item.subject}：来自 Obsidian 的试题关联知识点。`,
            50,
            item.sourceName,
            item.sourceUrl
        ]
    );
    return result.insertId;
}

async function findOrCreateKnowledgeNode(pool, item) {
    const name = item.knowledgePoint || item.course || item.subject;
    const [existing] = await pool.query("SELECT id FROM knowledge_nodes WHERE name = ? LIMIT 1", [name]);
    if (existing.length) return existing[0].id;
    const hasSubject = await columnExists(pool, "knowledge_nodes", "subject");
    if (hasSubject) {
        const [result] = await pool.query(
            "INSERT INTO knowledge_nodes (name, description, difficulty, type, subject, video_platform) VALUES (?, ?, ?, ?, ?, ?)",
            [
                name,
                `${item.course || item.subject}：来自 Obsidian 的试题关联知识点。`,
                "medium",
                "practice",
                item.subject,
                "local"
            ]
        );
        return result.insertId;
    }
    const [result] = await pool.query(
        "INSERT INTO knowledge_nodes (name, description, difficulty, type, video_platform) VALUES (?, ?, ?, ?, ?)",
        [name, `${item.course || item.subject}：来自 Obsidian 的试题关联知识点。`, "medium", "practice", "local"]
    );
    return result.insertId;
}

async function upsertAppQuestion(pool, item) {
    const knowledgeId = await findOrCreateKnowledgePoint(pool, item);
    const [existing] = await pool.query("SELECT id FROM questions WHERE source_url = ? LIMIT 1", [item.sourceUrl]);
    const values = [
        knowledgeId,
        item.question,
        item.answer,
        JSON.stringify(item.options),
        item.difficulty,
        item.sourceName,
        item.sourceUrl
    ];
    if (existing.length) {
        await pool.query(
            `UPDATE questions
             SET knowledge_id = ?, question = ?, correct_answer = ?, options_json = ?, difficulty = ?, source_name = ?, source_url = ?
             WHERE id = ?`,
            [...values, existing[0].id]
        );
        return "updated";
    }
    await pool.query(
        "INSERT INTO questions (knowledge_id, question, correct_answer, options_json, difficulty, source_name, source_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        values
    );
    return "inserted";
}

async function upsertLegacyQuestion(pool, item) {
    const nodeId = await findOrCreateKnowledgeNode(pool, item);
    const [existing] = await pool.query("SELECT id FROM questions WHERE content = ? LIMIT 1", [item.question]);
    const values = [
        null,
        "single",
        item.question,
        JSON.stringify(item.options),
        item.answer,
        5,
        item.difficulty,
        item.subject,
        nodeId
    ];
    if (existing.length) {
        await pool.query(
            `UPDATE questions
             SET exam_id = ?, type = ?, content = ?, options = ?, answer = ?, score = ?, difficulty = ?, subject = ?, node_id = ?
             WHERE id = ?`,
            [...values, existing[0].id]
        );
        return "updated";
    }
    await pool.query(
        "INSERT INTO questions (exam_id, type, content, options, answer, score, difficulty, subject, node_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        values
    );
    return "inserted";
}

async function syncObsidianQuestions(pool, options = {}) {
    const parsed = parseObsidianQuestionBank(options.vaultDir || DEFAULT_VAULT_DIR);
    const schema = await detectQuestionSchema(pool);
    if (schema === "unknown") {
        throw new Error("未识别到项目题库表结构，请先运行 npm run db:rebuild 初始化数据库。");
    }

    const result = {
        schema,
        vaultDir: parsed.vaultDir,
        files: parsed.files.length,
        parsed: parsed.questions.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        subjects: parsed.subjects,
        courses: parsed.courses
    };

    for (const item of parsed.questions) {
        try {
            const action =
                schema === "app" ? await upsertAppQuestion(pool, item) : await upsertLegacyQuestion(pool, item);
            result[action] += 1;
        } catch (error) {
            result.skipped += 1;
            if (options.failFast) throw error;
        }
    }

    return result;
}

module.exports = {
    DEFAULT_VAULT_DIR,
    QUESTION_BANK_DIR,
    GENERATED_DIRS,
    buildVaultIndex,
    buildVaultGraph,
    getVaultNote,
    searchVault,
    writeVaultMarkdown,
    writeLearningPathMarkdown,
    parseObsidianQuestionBank,
    syncObsidianQuestions
};
