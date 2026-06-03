# EduSmart Obsidian 后端API接口设计

## 1. 架构设计

```
EduSmart Web App
    ↕ HTTP REST API
EduSmart Backend (Node.js/Express)
    ↕
Obsidian Integration Layer
    ├── 直接文件读取（本地obsidian-vault）
    ├── obsidian-local-rest-api (HTTP:27123)
    └── ObsidianObsidianPlugin (社区插件)
    ↕
Obsidian Vault (Markdown文件)
```

## 2. 核心API接口

### 2.1 题库接口

#### GET /api/obsidian/questions
获取题库列表，支持分页和筛选

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| course | string | 否 | 按课程筛选 |
| difficulty | string | 否 | 按难度筛选 |
| question_type | string | 否 | 题型筛选 |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**响应：**
```json
{
  "success": true,
  "data": {
    "total": 200,
    "page": 1,
    "pageSize": 20,
    "questions": [
      {
        "id": "Q-NET-001",
        "question_type": "single-choice",
        "content": "在OSI七层模型中...",
        "options": ["A. 网络层", "B. 传输层", "C. 数据链路层", "D. 应用层"],
        "answer": "B",
        "difficulty": "easy",
        "course": "computer_networks",
        "chapter": "CH01",
        "related_kps": ["KP-NET-001"],
        "keywords": ["OSI", "传输层"],
        "file_path": "01-共享知识库/试题库/章节练习/计算机网络基础练习.md"
      }
    ]
  }
}
```

#### GET /api/obsidian/questions/:id
获取单个题目详情

#### POST /api/obsidian/questions
创建新题目（写入Obsidian）

**请求体：**
```json
{
  "course_code": "computer_networks",
  "chapter_code": "CH01",
  "question_type": "single-choice",
  "difficulty": "easy",
  "content": "题目内容",
  "options": ["A", "B", "C", "D"],
  "answer": "B",
  "explanation": "解析内容",
  "related_kps": ["KP-NET-001"]
}
```

---

### 2.2 知识点接口

#### GET /api/obsidian/knowledge-points
获取知识点列表

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| course | string | 按课程筛选 |
| chapter | string | 按章节筛选 |
| difficulty | string | 按难度 |
| keyword | string | 关键词搜索 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "kp_code": "KP-NET-001",
      "kp_name": "网络分层模型",
      "course_code": "computer_networks",
      "course_name": "计算机网络",
      "chapter_code": "CH01",
      "chapter_name": "基础概念",
      "difficulty": "beginner",
      "importance": "core",
      "summary": "理解OSI七层模型和TCP/IP四层模型...",
      "keywords": ["OSI", "TCP/IP", "网络分层"],
      "prerequisites": [],
      "file_path": "01-共享知识库/学科课程/01-计算机基础/计算机网络/CH01-基础概念/KP-NET-001-网络分层模型.md"
    }
  ]
}
```

#### GET /api/obsidian/knowledge-points/:kpCode
获取单个知识点完整内容

#### GET /api/obsidian/knowledge-points/:kpCode/related
获取关联知识点（基于双向链接）

---

### 2.3 搜索接口（RAG入口）

#### GET /api/obsidian/search
全文搜索Obsidian知识库

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| q | string | 搜索关键词 |
| type | string | 内容类型：all/knowledge/questions/resources |
| limit | number | 返回数量，默认10 |

**响应：**
```json
{
  "success": true,
  "data": {
    "query": "TCP三次握手",
    "results": [
      {
        "type": "knowledge-point",
        "kp_code": "KP-NET-007",
        "title": "TCP可靠传输机制",
        "snippet": "TCP三次握手建立连接...",
        "score": 0.95,
        "file_path": "..."
      },
      {
        "type": "question",
        "question_id": "Q-NET-002",
        "title": "TCP三次握手标志位",
        "snippet": "第二次握手服务器发送...",
        "score": 0.89,
        "file_path": "..."
      }
    ]
  }
}
```

---

### 2.4 用户空间接口

#### GET /api/obsidian/user/:userId/profile
获取用户画像

#### GET /api/obsidian/user/:userId/notes
获取用户笔记列表

#### POST /api/obsidian/user/:userId/notes
创建用户笔记（写入Obsidian用户空间）

**请求体：**
```json
{
  "title": "学习笔记",
  "content": "笔记内容...",
  "related_kps": ["KP-NET-001"],
  "tags": ["计算机网络"]
}
```

#### GET /api/obsidian/user/:userId/errors
获取错题本

#### POST /api/obsidian/user/:userId/errors
记录错题

**请求体：**
```json
{
  "question_id": "Q-NET-001",
  "wrong_answer": "A",
  "correct_answer": "B",
  "error_reason": "概念混淆",
  "notes": "我的理解..."
}
```

#### GET /api/obsidian/user/:userId/progress
获取学习进度（汇总各课程掌握度）

---

### 2.5 同步接口

#### POST /api/obsidian/sync
触发同步（EduSmart ↔ Obsidian双向）

**请求体：**
```json
{
  "user_id": "demo-001",
  "direction": "both",
  "sync_types": ["profile", "notes", "errors", "path"]
}
```

#### GET /api/obsidian/sync/status/:userId
查询同步状态

---

### 2.6 课程接口

#### GET /api/obsidian/courses
获取所有课程列表

#### GET /api/obsidian/courses/:courseCode
获取单个课程详情（章节、知识点）

#### GET /api/obsidian/courses/:courseCode/chapters
获取课程章节树

---

## 3. 后端实现方案

### 3.1 Obsidian客户端封装

```javascript
// src/core/ObsidianClient.js
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class ObsidianClient {
  constructor(vaultPath) {
    this.vaultPath = vaultPath;
  }

  // 读取并解析Markdown文件
  async readMarkdownFile(relativePath) {
    const fullPath = path.join(this.vaultPath, relativePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const { data, content: body } = matter(content);
    return { metadata: data, content: body, file_path: relativePath };
  }

  // 搜索目录下所有.md文件
  async scanDirectory(dirPath, recursive = true) {
    const fullPath = path.join(this.vaultPath, dirPath);
    const files = [];
    const scan = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory() && recursive) {
          await scan(entryPath);
        } else if (entry.name.endsWith('.md')) {
          files.push(entryPath);
        }
      }
    };
    await scan(fullPath);
    return files;
  }

  // 解析frontmatter
  async getKnowledgePoints(course = null) {
    const baseDir = '01-共享知识库/学科课程';
    const files = await this.scanDirectory(baseDir);
    const kps = [];
    
    for (const file of files) {
      const { metadata } = await this.readMarkdownFile(
        path.relative(this.vaultPath, file)
      );
      if (metadata.kp_code) {
        kps.push(metadata);
      }
    }
    
    return kps;
  }

  // 获取题库
  async getQuestions(course = null) {
    const files = await this.scanDirectory('01-共享知识库/试题库/章节练习');
    // 解析每个文件中的题目...
  }

  // 搜索功能
  async search(query) {
    const results = [];
    const searchDirs = [
      '01-共享知识库/学科课程',
      '01-共享知识库/试题库',
      '01-共享知识库/学习资料'
    ];
    
    for (const dir of searchDirs) {
      const files = await this.scanDirectory(dir);
      for (const file of files) {
        const { metadata, content } = await this.readMarkdownFile(
          path.relative(this.vaultPath, file)
        );
        if (content.includes(query) || 
            JSON.stringify(metadata).includes(query)) {
          results.push({ metadata, snippet: content.slice(0, 200) });
        }
      }
    }
    
    return results;
  }
}
```

### 3.2 路由注册

```javascript
// src/modules/obsidian-api.js
const express = require('express');
const router = express.Router();
const ObsidianClient = require('../core/ObsidianClient');

const obsidian = new ObsidianClient(
  path.join(__dirname, '../../obsidian-vault')
);

// 题库接口
router.get('/questions', async (req, res) => {
  const { course, difficulty, page = 1, pageSize = 20 } = req.query;
  // ...
});

router.get('/questions/:id', async (req, res) => {
  // ...
});

// 知识点接口
router.get('/knowledge-points', async (req, res) => {
  const kps = await obsidian.getKnowledgePoints(req.query.course);
  res.json({ success: true, data: kps });
});

// 搜索接口
router.get('/search', async (req, res) => {
  const results = await obsidian.search(req.query.q);
  res.json({ success: true, data: { query: req.query.q, results } });
});

module.exports = router;
```

### 3.3 主服务器注册

```javascript
// src/server.js 中添加：
const obsidianApi = require('./modules/obsidian-api');
app.use('/api/obsidian', obsidianApi);
```

## 4. 前端调用示例

```javascript
// 获取计算机网络题库
const response = await fetch('/api/obsidian/questions?course=computer_networks');
const { data } = await response.json();

// 搜索知识点
const searchResult = await fetch('/api/obsidian/search?q=TCP三次握手');
```