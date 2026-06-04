# EduSmart Obsidian知识库前端集成设计

## 概述

本文档详细说明如何将现有的Obsidian知识库集成到EduSmart前端平台中，利用已有的后端API，提供完整的知识库浏览、搜索、笔记管理和题库功能。

## 现有架构分析

### 前端结构

- **单页应用(SPA)**：原生JavaScript实现
- **路由系统**：`routeToView()`函数通过URL hash映射到视图
- **状态管理**：全局`state`对象存储所有状态
- **渲染机制**：`render()`函数调用对应的视图函数
- **已有视图**：home、smartNotes、knowledgeGraph、asset、path、intelligence等

### 已有的后端API

```javascript
// src/modules/obsidian.js 已注册的API
GET / api / obsidian / knowledge - base; // 获取知识库索引
GET / api / obsidian / graph; // 获取知识图谱
GET / api / obsidian / search; // 搜索
GET / api / obsidian / note; // 获取单个笔记
POST / api / obsidian / notes / write; // 写入笔记
POST / api / obsidian / paths / write; // 写入学习路径
GET / api / obsidian / status; // 获取题库状态
POST / api / obsidian / sync / questions; // 同步题库到数据库
POST / api / obsidian / sync - rag; // 同步到RAG
GET / api / obsidian / stats; // 知识库统计
```

## 设计方案

### 1. 新增导航入口

在"学习资源"导航组新增"Obsidian知识库"入口：

```javascript
// 在 navGroups() 函数中修改 "学习资源" 组
{
    label: "学习资源",
    icon: "layers",
    desc: "资源 · 教程 · 题库 · 视频",
    items: [
        { view: "resources", icon: "layers", label: "资源中心", desc: "编程学习资源汇总" },
        { view: "tutorials", icon: "book", label: "在线教程", desc: "菜鸟教程等在线资料" },
        { view: "problems", icon: "code", label: "编程题库", desc: "力扣风格在线刷题" },
        { view: "videos", icon: "play", label: "视频教程", desc: "B站/MOOC等课程视频" },
        { view: "obsidian", icon: "db", label: "Obsidian知识库", desc: "本地知识库与题库浏览" } // 新增
    ]
}
```

### 2. 新增路由映射

更新`routeToView()`函数：

```javascript
if (p.includes("obsidian")) return "obsidian";
```

### 3. 数据加载函数

新增以下数据加载函数：

```javascript
// 加载知识库索引
async function loadObsidianKnowledgeBase(force = false) {
    if (state.data.obsidianKnowledgeBase && !force) return state.data.obsidianKnowledgeBase;
    const json = await request("/api/obsidian/knowledge-base");
    state.data.obsidianKnowledgeBase = json.data || {};
    return json.data;
}

// 加载知识图谱
async function loadObsidianGraph(force = false) {
    if (state.data.obsidianGraph && !force) return state.data.obsidianGraph;
    const json = await request("/api/obsidian/graph");
    state.data.obsidianGraph = json.data || { nodes: [], edges: [] };
    return json.data;
}

// 搜索知识库
async function searchObsidian(query) {
    const searchParams = new URLSearchParams({ q: query });
    const json = await request(`/api/obsidian/search?${searchParams.toString()}`);
    return json.data;
}

// 获取单个笔记
async function loadObsidianNote(path) {
    const searchParams = new URLSearchParams({ path });
    const json = await request(`/api/obsidian/note?${searchParams.toString()}`);
    return json.data;
}

// 获取题库状态
async function loadObsidianStatus(force = false) {
    if (state.data.obsidianStatus && !force) return state.data.obsidianStatus;
    const json = await request("/api/obsidian/status");
    state.data.obsidianStatus = json.data || {};
    return json.data;
}

// 同步题库
async function syncObsidianQuestions() {
    const json = await request("/api/obsidian/sync/questions", {
        method: "POST",
        body: JSON.stringify({})
    });
    return json.data;
}

// 获取知识库统计
async function loadObsidianStats(force = false) {
    if (state.data.obsidianStats && !force) return state.data.obsidianStats;
    const json = await request("/api/obsidian/stats");
    state.data.obsidianStats = json.data || {};
    return json.data;
}
```

### 4. 新增视图函数：`obsidianView()`

设计分为以下几个区域：

#### 4.1 顶部区域

- 标题和简介
- 快速操作按钮
- 统计卡片

#### 4.2 标签切换区

- 知识库浏览
- 题库
- 知识图谱
- 我的笔记

#### 4.3 主内容区

根据标签显示对应内容

### 5. 完整视图函数代码

```javascript
function obsidianView() {
    const tab = ["knowledge", "questions", "graph", "myNotes"].includes(state.data.obsidianTab)
        ? state.data.obsidianTab
        : "knowledge";

    const kb = state.data.obsidianKnowledgeBase || {};
    const notes = kb.notes || [];
    const folders = kb.folders || [];
    const tags = kb.tags || [];
    const recent = kb.recent || [];

    const status = state.data.obsidianStatus || {};
    const qCount = status.questions || 0;
    const subjects = status.subjects || {};

    const graph = state.data.obsidianGraph || { nodes: [], edges: [] };

    // 标签内容
    const tabContent = {
        knowledge: obsidianKnowledgeTab(folders, notes, tags, recent),
        questions: obsidianQuestionsTab(status, subjects),
        graph: obsidianGraphTab(graph),
        myNotes: obsidianMyNotesTab(recent)
    };

    return `<main class="page obsidian-page">
        <section class="hero-row">
            <div class="hero">
                <h1>${icon("db", 24)} Obsidian 知识库</h1>
                <p>本地知识库集成，包含完整的学科课程、题库、笔记和学习路径，支持双链图谱展示和检索。</p>
                <div class="hero-actions">
                    <button class="btn primary glow" data-obsidian-refresh>${icon("refresh", 17)} 刷新知识库</button>
                    <button class="btn ghost" data-view="smartNotes">${icon("pen", 17)} 新建笔记</button>
                    <button class="btn ghost" data-obsidian-sync-questions>${icon("sync", 17)} 同步题库</button>
                </div>
            </div>
            ${obsidianMetricCards()}
        </section>
        
        <div class="tabs obsidian-tabs">
            <button class="${tab === "knowledge" ? "active" : ""}" data-obsidian-tab="knowledge">
                ${icon("book", 16)} 知识库
            </button>
            <button class="${tab === "questions" ? "active" : ""}" data-obsidian-tab="questions">
                ${icon("exam", 16)} 题库 (${qCount})
            </button>
            <button class="${tab === "graph" ? "active" : ""}" data-obsidian-tab="graph">
                ${icon("radar", 16)} 知识图谱
            </button>
            <button class="${tab === "myNotes" ? "active" : ""}" data-obsidian-tab="myNotes">
                ${icon("pen", 16)} 我的笔记
            </button>
        </div>
        
        <section class="obsidian-content">
            ${tabContent[tab]}
        </section>
    </main>`;
}

function obsidianMetricCards() {
    const stats = state.data.obsidianStats || {};
    const kb = state.data.obsidianKnowledgeBase || {};
    const status = state.data.obsidianStatus || {};

    return `<div class="metric-row">
        <article class="metric-card interactive">
            <div class="metric-top">
                <span class="metric-icon">${icon("file", 22)}</span>
                <div>
                    <div class="metric-label">笔记文件</div>
                    <div class="metric-value">${kb.stats?.notes || 0}<span>个</span></div>
                </div>
            </div>
            <div class="metric-sub">Markdown 文档</div>
        </article>
        <article class="metric-card interactive">
            <div class="metric-top">
                <span class="metric-icon">${icon("exam", 22)}</span>
                <div>
                    <div class="metric-label">题库</div>
                    <div class="metric-value">${status.questions || 0}<span>题</span></div>
                </div>
            </div>
            <div class="metric-sub">来自 ${Object.keys(status.subjects || {}).length} 个学科</div>
        </article>
        <article class="metric-card interactive">
            <div class="metric-top">
                <span class="metric-icon">${icon("layers", 22)}</span>
                <div>
                    <div class="metric-label">知识图谱</div>
                    <div class="metric-value">${kb.stats?.nodes || 0}<span>节点</span></div>
                </div>
            </div>
            <div class="metric-sub">${kb.stats?.edges || 0} 条双链关联</div>
        </article>
        <article class="metric-card interactive">
            <div class="metric-top">
                <span class="metric-icon">${icon("folder", 22)}</span>
                <div>
                    <div class="metric-label">目录</div>
                    <div class="metric-value">${Object.keys(kb.folders || {}).length}<span>个</span></div>
                </div>
            </div>
            <div class="metric-sub">按学科分类组织</div>
        </article>
    </div>`;
}

function obsidianKnowledgeTab(folders, notes, tags, recent) {
    const selectedNote = state.data.obsidianSelectedNote || null;
    const searchQuery = state.data.obsidianSearch || "";

    let filteredNotes = notes;
    if (searchQuery) {
        filteredNotes = notes.filter(
            note =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (note.preview && note.preview.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    // 筛选有内容的文件夹
    const folderList = Object.entries(folders)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    return `<div class="obsidian-grid">
        <aside class="side-card obsidian-sidebar">
            <article class="card">
                <div class="card-head">
                    <h2 class="section-title">${icon("search", 18)} 搜索</h2>
                </div>
                <div class="obsidian-search">
                    <input class="input" placeholder="搜索知识库..." 
                           data-obsidian-search value="${escapeHtml(searchQuery)}">
                </div>
            </article>
            
            <article class="card">
                <div class="card-head">
                    <h2 class="section-title">${icon("folder", 18)} 目录</h2>
                </div>
                <div class="list">
                    ${folderList
                        .map(
                            ([folder, count]) => `
                        <button class="list-row action-row" data-obsidian-folder="${escapeHtml(folder)}">
                            <span>${escapeHtml(folder)}<small>${count} 个文件</small></span>
                            <span class="pill">${count}</span>
                        </button>
                    `
                        )
                        .join("")}
                </div>
            </article>
            
            <article class="card">
                <div class="card-head">
                    <h2 class="section-title">${icon("list", 18)} 标签</h2>
                </div>
                <div class="tag-row">
                    ${tags
                        .slice(0, 15)
                        .map(
                            ([tag, count]) => `
                        <span class="pill interactive" data-obsidian-tag="${escapeHtml(tag)}">
                            ${escapeHtml(tag)} · ${count}
                        </span>
                    `
                        )
                        .join("")}
                </div>
            </article>
        </aside>
        
        <article class="card obsidian-main">
            <div class="card-head">
                <h2 class="section-title">${icon("file", 18)} 知识库文件</h2>
                <button class="btn tiny ghost" data-obsidian-refresh>
                    ${icon("refresh", 14)} 刷新
                </button>
            </div>
            <div class="obsidian-note-list">
                ${
                    filteredNotes.length
                        ? filteredNotes
                              .map(
                                  note => `
                    <button class="obsidian-note-item ${selectedNote?.path === note.path ? "active" : ""}"
                            data-obsidian-note="${escapeAttr(note.path)}">
                        <div class="note-item-header">
                            <span class="note-icon">${icon(note.kind === "question" ? "exam" : note.kind === "path" ? "route" : "file", 16)}</span>
                            <span class="note-title">${escapeHtml(note.title)}</span>
                        </div>
                        <small class="note-meta">
                            ${escapeHtml(note.folder)} · ${formatDate(note.updatedAt)}
                        </small>
                        <p class="note-preview">${escapeHtml(note.preview || "")}</p>
                        ${
                            note.tags?.length
                                ? `
                            <div class="tag-row compact">
                                ${note.tags
                                    .slice(0, 3)
                                    .map(tag => `<span class="pill tiny">${escapeHtml(tag)}</span>`)
                                    .join("")}
                            </div>
                        `
                                : ""
                        }
                    </button>
                `
                              )
                              .join("")
                        : `
                    <div class="empty-state">
                        <p>未找到匹配的笔记，尝试其他关键词。</p>
                    </div>
                `
                }
            </div>
        </article>
        
        ${
            selectedNote
                ? `
        <aside class="side-card obsidian-detail">
            <article class="card">
                <div class="card-head">
                    <h2 class="section-title">${escapeHtml(selectedNote.title)}</h2>
                    <button class="btn tiny ghost" data-obsidian-clear-note>
                        ${icon("x", 14)}
                    </button>
                </div>
                <div class="obsidian-note-meta">
                    <span class="pill">${escapeHtml(selectedNote.folder)}</span>
                    <span class="pill">${escapeHtml(selectedNote.kind || "笔记")}</span>
                    <small>更新于 ${formatDate(selectedNote.updatedAt)}</small>
                </div>
                <div class="obsidian-note-content markdown-preview">
                    ${renderMarkdownLite(selectedNote.content || selectedNote.preview || "")}
                </div>
                <div class="obsidian-note-links">
                    ${
                        selectedNote.links?.length
                            ? `
                        <h4>双链关联</h4>
                        <div class="tag-row">
                            ${selectedNote.links
                                .map(
                                    link => `
                                <span class="pill interactive" data-obsidian-note="${escapeAttr(link)}">
                                    ${escapeHtml(link)}
                                </span>
                            `
                                )
                                .join("")}
                        </div>
                    `
                            : ""
                    }
                </div>
                <div class="obsidian-note-actions">
                    <button class="btn ghost" data-obsidian-open-external="${escapeAttr(selectedNote.obsidianUri || "")}">
                        ${icon("external-link", 14)} 在 Obsidian 打开
                    </button>
                    <button class="btn primary" data-obsidian-add-note="${escapeAttr(selectedNote.path)}">
                        ${icon("pen", 14)} 转为我的笔记
                    </button>
                </div>
            </article>
        </aside>
        `
                : ""
        }
    </div>`;
}

function obsidianQuestionsTab(status, subjects) {
    const subjectList = Object.entries(subjects || {});
    const samples = status.sample || [];

    return `<div class="obsidian-grid">
        <aside class="side-card obsidian-sidebar">
            <article class="card">
                <div class="card-head">
                    <h2 class="section-title">${icon("db", 18)} 题库统计</h2>
                </div>
                <div class="list">
                    ${subjectList
                        .map(
                            ([subject, count]) => `
                        <div class="list-row">
                            <span>${escapeHtml(subject)}<small>${count} 道题</small></span>
                            <span class="pill">${count}</span>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </article>
            
            <article class="card">
                <div class="card-head">
                    <h2 class="section-title">${icon("settings", 18)} 操作</h2>
                </div>
                <div class="obsidian-question-actions">
                    <button class="btn primary" data-obsidian-sync-questions>
                        ${icon("refresh", 14)} 同步到数据库
                    </button>
                    <button class="btn ghost" data-view="practice">
                        ${icon("exam", 14)} 开始练习
                    </button>
                </div>
            </article>
        </aside>
        
        <article class="card obsidian-main">
            <div class="card-head">
                <h2 class="section-title">${icon("list", 18)} 题库预览</h2>
                <small>共 ${status.questions || 0} 道题</small>
            </div>
            <div class="obsidian-question-list">
                ${samples
                    .map(
                        (q, i) => `
                    <div class="obsidian-question-item">
                        <div class="question-header">
                            <span class="question-number">Q${i + 1}</span>
                            <span class="pill tiny">${escapeHtml(q.subject || "综合")}</span>
                            <span class="pill tiny">${escapeHtml(q.course || "")}</span>
                        </div>
                        <h3 class="question-title">${escapeHtml(q.knowledgePoint || "知识点")}</h3>
                        <p class="question-content">${escapeHtml(q.question || "")}</p>
                        <div class="question-answer">
                            <span class="pill">答案</span>
                            <code>${escapeHtml(q.answer || "")}</code>
                        </div>
                    </div>
                `
                    )
                    .join("")}
            </div>
        </article>
    </div>`;
}

function obsidianGraphTab(graph) {
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    return `<div class="obsidian-single">
        <article class="card">
            <div class="card-head">
                <h2 class="section-title">${icon("radar", 18)} 知识图谱</h2>
                <button class="btn tiny ghost" data-obsidian-graph-refresh>
                    ${icon("refresh", 14)} 刷新
                </button>
            </div>
            
            <div class="kg-container obsidian-kg">
                <div class="card kg-sidebar">
                    <div class="card-head">
                        <h3>${icon("list", 16)} 图例</h3>
                    </div>
                    <div class="kg-legend">
                        <div class="kg-legend-item"><span class="kg-dot note"></span> 笔记</div>
                        <div class="kg-legend-item"><span class="kg-dot knowledge"></span> 知识点</div>
                        <div class="kg-legend-item"><span class="kg-dot question"></span> 题目</div>
                        <div class="kg-legend-item"><span class="kg-line"></span> 双链</div>
                    </div>
                    <div class="kg-stats">
                        <div class="kg-stat"><b>${nodes.length}</b><span>节点</span></div>
                        <div class="kg-stat"><b>${edges.length}</b><span>连线</span></div>
                    </div>
                </div>
                
                <div class="card kg-canvas-wrapper">
                    <div class="kg-canvas" id="obsidian-kg-canvas">
                        <!-- 图谱将通过 JavaScript 渲染 -->
                        <div class="empty-state compact">
                            <p>点击刷新生成知识图谱可视化</p>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    </div>`;
}

function obsidianMyNotesTab(recent) {
    return `<div class="obsidian-single">
        <article class="card">
            <div class="card-head">
                <h2 class="section-title">${icon("pen", 18)} 我的笔记</h2>
                <button class="btn primary" data-new-note>
                    ${icon("pen", 14)} 新建笔记
                </button>
            </div>
            <div class="obsidian-my-notes">
                <div class="empty-state">
                    <p>这里将显示你在EduSmart中创建的笔记，它们会自动同步到Obsidian。</p>
                    <button class="btn ghost" data-view="smartNotes">
                        ${icon("book", 14)} 前往笔记中心
                    </button>
                </div>
            </div>
        </article>
    </div>`;
}
```

### 6. 更新状态对象

在`defaultData()`函数中添加：

```javascript
obsidianTab: "knowledge",
obsidianSearch: "",
obsidianSelectedNote: null,
obsidianKnowledgeBase: null,
obsidianGraph: null,
obsidianStatus: null,
obsidianStats: null
```

### 7. 事件处理函数

新增以下事件处理函数：

```javascript
// Obsidian 标签切换
function handleObsidianTab(tab) {
    state.data.obsidianTab = tab;
    render();
}

// 搜索知识库
function handleObsidianSearch(query) {
    state.data.obsidianSearch = query;
    render();
}

// 选择笔记
async function handleObsidianNote(path) {
    const note = await loadObsidianNote(path);
    state.data.obsidianSelectedNote = note;
    render();
}

// 清除笔记选择
function handleObsidianClearNote() {
    state.data.obsidianSelectedNote = null;
    render();
}

// 刷新知识库
async function handleObsidianRefresh() {
    state.data.obsidianKnowledgeBase = null;
    state.data.obsidianStats = null;
    await Promise.all([loadObsidianKnowledgeBase(true), loadObsidianStats(true)]);
    toast("知识库已刷新");
    render();
}

// 同步题库
async function handleObsidianSyncQuestions() {
    try {
        await syncObsidianQuestions();
        await loadObsidianStatus(true);
        toast("题库同步成功！");
        render();
    } catch (e) {
        toast("同步失败：" + e.message);
    }
}

// 在Obsidian打开
function handleObsidianOpenExternal(uri) {
    if (uri && uri.startsWith("obsidian://")) {
        window.open(uri, "_blank");
    }
}

// 添加笔记
function handleObsidianAddNote(path) {
    state.data._obsidianNotePath = path;
    state.view = "smartNotes";
    render();
}

// 知识图谱刷新
async function handleObsidianGraphRefresh() {
    await loadObsidianGraph(true);
    toast("图谱已刷新");
    render();
    // 初始化图谱可视化
    initObsidianGraph();
}
```

### 8. 更新事件监听器

在事件绑定区域添加：

```javascript
// Obsidian 标签切换
document.addEventListener("click", e => {
    const tabBtn = e.target.closest("[data-obsidian-tab]");
    if (tabBtn) {
        handleObsidianTab(tabBtn.dataset.obsidianTab);
    }

    const searchInput = e.target.closest("[data-obsidian-search]");
    if (searchInput) {
        // 防抖处理
        clearTimeout(state._obsidianSearchTimer);
        state._obsidianSearchTimer = setTimeout(() => {
            handleObsidianSearch(searchInput.value);
        }, 300);
    }

    const noteBtn = e.target.closest("[data-obsidian-note]");
    if (noteBtn) {
        handleObsidianNote(noteBtn.dataset.obsidianNote);
    }

    const clearNoteBtn = e.target.closest("[data-obsidian-clear-note]");
    if (clearNoteBtn) {
        handleObsidianClearNote();
    }

    const refreshBtn = e.target.closest("[data-obsidian-refresh]");
    if (refreshBtn) {
        handleObsidianRefresh();
    }

    const syncBtn = e.target.closest("[data-obsidian-sync-questions]");
    if (syncBtn) {
        handleObsidianSyncQuestions();
    }

    const openExtBtn = e.target.closest("[data-obsidian-open-external]");
    if (openExtBtn) {
        handleObsidianOpenExternal(openExtBtn.dataset.obsidianOpenExternal);
    }

    const addNoteBtn = e.target.closest("[data-obsidian-add-note]");
    if (addNoteBtn) {
        handleObsidianAddNote(addNoteBtn.dataset.obsidianAddNote);
    }

    const graphRefreshBtn = e.target.closest("[data-obsidian-graph-refresh]");
    if (graphRefreshBtn) {
        handleObsidianGraphRefresh();
    }
});

// 搜索框输入事件
document.addEventListener("input", e => {
    if (e.target.matches("[data-obsidian-search]")) {
        clearTimeout(state._obsidianSearchTimer);
        state._obsidianSearchTimer = setTimeout(() => {
            handleObsidianSearch(e.target.value);
        }, 300);
    }
});
```

### 9. 更新`render()`函数中的数据加载

在`render()`函数的初始化部分添加：

```javascript
if (state.view === "obsidian") {
    loadObsidianKnowledgeBase();
    loadObsidianStatus();
    loadObsidianStats();
    loadObsidianGraph();
}
```

### 10. 添加样式

在CSS中添加以下样式：

```css
/* Obsidian 页面样式 */
.obsidian-page {
}

.obsidian-tabs {
    margin-bottom: 20px;
}

.obsidian-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 20px;
}

.obsidian-grid.has-detail {
    grid-template-columns: 260px 1fr 380px;
}

.obsidian-sidebar {
}
.obsidian-main {
}
.obsidian-detail {
}
.obsidian-single {
}

.obsidian-search input {
    width: 100%;
}

.obsidian-note-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.obsidian-note-item {
    width: 100%;
    text-align: left;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    transition: all 0.2s;
}

.obsidian-note-item:hover {
    border-color: #635bff;
    background: #f8f9ff;
}

.obsidian-note-item.active {
    border-color: #635bff;
    background: linear-gradient(135deg, #635bff1a, #7c4dff1a);
}

.note-item-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.note-icon {
    color: #66708a;
}

.note-title {
    font-weight: 600;
    font-size: 16px;
    color: #10203f;
}

.note-meta {
    color: #66708a;
}

.note-preview {
    margin-top: 8px;
    color: #4a5568;
    font-size: 14px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.obsidian-note-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
}

.obsidian-note-content {
    max-height: 500px;
    overflow-y: auto;
}

.obsidian-note-links {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #eee;
}

.obsidian-note-links h4 {
    font-size: 14px;
    color: #66708a;
    margin-bottom: 8px;
}

.obsidian-note-actions {
    margin-top: 16px;
    display: flex;
    gap: 10px;
}

/* 题库样式 */
.obsidian-question-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.obsidian-question-item {
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fafcff;
}

.question-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.question-number {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    background: #635bff;
    color: white;
    border-radius: 8px;
    font-weight: 700;
    font-size: 14px;
}

.question-title {
    font-size: 16px;
    color: #10203f;
    margin-bottom: 8px;
}

.question-content {
    color: #4a5568;
    margin-bottom: 12px;
}

.question-answer {
    display: flex;
    align-items: center;
    gap: 10px;
}

.question-answer code {
    background: #eef3ff;
    padding: 4px 10px;
    border-radius: 4px;
    font-family: monospace;
}

/* 图谱样式 */
.obsidian-kg {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 20px;
}

.obsidian-question-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* Markdown 预览 */
.markdown-preview p {
    margin: 12px 0;
    line-height: 1.7;
}

.markdown-preview h1 {
    font-size: 24px;
    margin: 20px 0 12px;
    font-weight: 700;
}
.markdown-preview h2 {
    font-size: 20px;
    margin: 18px 0 10px;
    font-weight: 600;
}
.markdown-preview h3 {
    font-size: 18px;
    margin: 16px 0 8px;
    font-weight: 600;
}
.markdown-preview ul,
.markdown-preview ol {
    padding-left: 24px;
    margin: 10px 0;
}
.markdown-preview li {
    margin: 6px 0;
}
.markdown-preview code {
    background: #f0f3ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
}
.markdown-preview pre {
    background: #10203f;
    color: #e8f0ff;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
}
.markdown-preview pre code {
    background: none;
    color: inherit;
}
```

## 实现步骤

### 阶段 1：基础集成（1-2小时）

1. 添加导航入口
2. 添加路由映射
3. 创建基础视图函数
4. 添加状态字段
5. 添加数据加载函数

### 阶段 2：知识库浏览（2-3小时）

1. 完成知识库标签页
2. 实现搜索和筛选
3. 实现笔记选择和详情查看
4. 添加样式

### 阶段 3：题库和图谱（2-3小时）

1. 完成题库标签页
2. 完成知识图谱标签页
3. 完成我的笔记标签页
4. 添加所有事件处理

### 阶段 4：优化和测试（1-2小时）

1. 完善样式和交互
2. 添加加载状态
3. 测试所有功能
4. 错误处理

## 文件修改清单

需要修改/创建的文件：

| 文件                                   | 操作             |
| -------------------------------------- | ---------------- |
| `apps/web/public/js/edusmart-app.js`   | 修改：添加新功能 |
| `apps/web/public/css/edusmart-pro.css` | 添加：新样式     |
| `src/server/route-manifest.js`         | 已有，无需修改   |
| `src/modules/obsidian.js`              | 已有，无需修改   |

## 预期效果

### 1. 知识库浏览

- 可以浏览Obsidian知识库中的所有笔记
- 按文件夹、标签筛选
- 实时搜索
- 查看笔记详情
- 在Obsidian中打开笔记

### 2. 题库功能

- 查看题库统计
- 按学科筛选题目
- 预览题目内容
- 一键同步到数据库

### 3. 知识图谱

- 可视化双链图谱
- 查看节点关联
- 交互式浏览

### 4. 我的笔记

- 查看和管理用户笔记
- 新建笔记
- 从知识库添加笔记

## 注意事项

1. **向后兼容**：所有新功能都应该在不影响现有功能的前提下添加
2. **性能考虑**：知识库可能很大，搜索和筛选需要防抖和分页
3. **错误处理**：API调用失败需要友好的提示
4. **响应式**：确保在各种屏幕尺寸上正常显示
5. **状态持久化**：搜索词、选中标签等状态可以通过URL hash保存

## 扩展功能（可选）

### 1. RAG问答集成

在知识库页面添加问答功能，直接调用本地RAG。

### 2. 笔记编辑

支持直接在EduSmart中编辑Obsidian笔记。

### 3. 导入/导出

支持导入外部资料到Obsidian，或导出学习资料。

### 4. 学习路径生成

基于知识库自动生成学习路径。

## 总结

本设计方案利用EduSmart已有的Obsidian集成API，通过新增视图和交互，提供完整的知识库浏览和管理体验，是对现有功能的自然扩展。
