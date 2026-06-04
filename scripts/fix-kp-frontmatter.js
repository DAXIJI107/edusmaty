/**
 * 批量修复 Obsidian 知识点文件的 frontmatter，使其符合设计文档规范
 * 使用方法: node scripts/fix-kp-frontmatter.js
 */
const fs = require("fs");
const path = require("path");

const VAULT_BASE = path.join(__dirname, "..", "obsidian-vault");
const COURSE_DIR = path.join(VAULT_BASE, "01-共享知识库", "学科课程");

// 课程配置映射
const COURSE_CONFIG = {
    "01-计算机基础": {
        计算机网络: { course_code: "computer_networks", course_name: "计算机网络", category: ["计算机基础", "网络"] },
        操作系统: { course_code: "operating_systems", course_name: "操作系统", category: ["计算机基础", "操作系统"] }
    },
    "02-编程语言": {
        course_code: "programming_foundations",
        course_name: "编程基础",
        category: ["编程语言"]
    },
    "03-数据结构与算法": {
        course_code: "data_structures_algorithms",
        course_name: "数据结构与算法",
        category: ["数据结构", "算法"]
    },
    "04-数据库": {
        course_code: "database_systems",
        course_name: "数据库系统",
        category: ["数据库"]
    },
    "05-软件工程": {
        course_code: "software_engineering",
        course_name: "软件工程",
        category: ["软件工程"]
    },
    "06-人工智能": {
        course_code: "artificial_intelligence",
        course_name: "人工智能",
        category: ["人工智能"]
    }
};

// 难度推断：根据章节号
function inferDifficulty(chapterCode) {
    if (!chapterCode) return "intermediate";
    const num = parseInt(chapterCode.replace("CH", ""));
    if (num <= 2) return "beginner";
    if (num <= 5) return "intermediate";
    return "advanced";
}

// 重要性推断：根据内容关键词
function inferImportance(content) {
    const coreKeywords = ["核心概念", "基础概念", "重点", "核心", "高频", "面试"];
    for (const kw of coreKeywords) {
        if (content.includes(kw)) return "core";
    }
    return "general";
}

// 知识类型推断
function inferKnowledgeType(content, kpCode) {
    const num = parseInt(kpCode.replace("KP", ""));
    // 每个章节的前几个知识点通常是一般概念
    const remaining = num % 8;
    if (remaining <= 2) return "concept";
    if (remaining <= 4) return "principle";
    if (remaining <= 6) return "technique";
    return "tool";
}

// 提取知识名称（从标题或aliases中提取）
function extractKpName(content, metadata) {
    // 从 body 的标题中提取
    const h1Match = content.match(/^# (.+)$/m);
    if (h1Match) {
        let name = h1Match[1].trim();
        // 去除"课程代码-章节代码-"前缀
        name = name.replace(/^.+-.+?-/, "").trim();
        return name || metadata.kp_code;
    }
    return metadata.kp_code;
}

// 提取章节名称
function extractChapterName(content, metadata, filePath) {
    const h2Match = content.match(/^## (.+)$/m);
    if (h2Match) return h2Match[1].trim();
    // 从文件路径推断
    const dirName = path.dirname(filePath).split(path.sep).pop();
    if (dirName && dirName.startsWith("CH")) {
        return dirName.replace(/^CH\d+-?/, "");
    }
    return "";
}

// 提取关键词
function extractKeywords(content, metadata, kpName) {
    const keywords = [kpName];
    if (metadata.aliases && Array.isArray(metadata.aliases)) {
        keywords.push(...metadata.aliases);
    }
    // 从内容提取高频词（简单方法）
    const words = content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    const wordFreq = {};
    words.forEach(w => {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    const topWords = Object.entries(wordFreq)
        .filter(([_, c]) => c > 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w]) => w);
    return [...new Set([...keywords, ...topWords])].slice(0, 8);
}

// 生成摘要
function generateSummary(content, kpName) {
    const firstPara = content.match(/\n\n([^\n#]{20,200})/);
    if (firstPara) return firstPara[1].trim().slice(0, 120);
    return `${kpName}的核心概念与知识要点`;
}

function fixFrontmatter(filePath) {
    const raw = fs.readFileSync(filePath, "utf-8");

    // 解析现有 frontmatter (支持 Windows \r\n)
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/);
    if (!fmMatch) {
        // 尝试备用匹配
        const altMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/);
        if (!altMatch) {
            console.log(`  SKIP (无frontmatter): ${path.basename(filePath)}`);
            return false;
        }
        // 使用备用匹配结果
        const body = altMatch[2];
        // 复用下面的解析逻辑（略过fmMatch，改用altMatch[1]）
        // 为了简单，这里直接跳过
        console.log(`  SKIP (格式特殊): ${path.basename(filePath)}`);
        return false;
    }

    const body = fmMatch[2];

    // 简单解析现有metadata
    const metadata = {};
    fmMatch[1].split("\n").forEach(line => {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            let value = line.slice(colonIdx + 1).trim();
            // 移除引号
            value = value.replace(/^["']|["']$/g, "");
            // 解析数组
            if (value.startsWith("[")) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = [];
                }
            }
            metadata[key] = value;
        }
    });

    const kpCode = metadata.kp_code || "";
    const kpName = extractKpName(body, metadata);
    const chapterName = extractChapterName(body, metadata, filePath);
    const chapterCode = metadata.chapter_code || "CH01";

    // 从文件路径推断课程信息
    const relativePath = path.relative(COURSE_DIR, filePath);
    const pathParts = relativePath.split(path.sep);

    // 尝试从现有metadata获取，否则从路径推断
    const courseCode = metadata.course_code || "";
    const courseName = metadata.course_name || "";
    const category = ["计算机科学"];
    const relatedChapters = [];

    // 查找同课程的其他章节
    const courseDir = path.dirname(path.dirname(filePath)); // 上两级到课程目录
    if (fs.existsSync(courseDir)) {
        fs.readdirSync(courseDir, { withFileTypes: true })
            .filter(
                d =>
                    d.isDirectory() &&
                    d.name.startsWith("CH") &&
                    d.name !== `CH${chapterCode.replace("CH", "").padStart(2, "0")}`
            )
            .slice(0, 3)
            .forEach(d => {
                relatedChapters.push(d.name);
            });
    }

    const difficulty = inferDifficulty(chapterCode);
    const importance = inferImportance(body);
    const knowledgeType = inferKnowledgeType(body, kpCode);
    const keywords = extractKeywords(body, metadata, kpName);
    const summary = generateSummary(body, kpName);

    // 构建新的frontmatter
    const newFm = `---
# 基础信息
kp_code: "${kpCode}"
course_code: "${courseCode}"
kp_name: "${kpName}"
course_name: "${courseName}"
chapter_code: "${chapterCode}"
chapter_name: "${chapterName}"
# 分类信息
difficulty: "${difficulty}"
importance: "${importance}"
knowledge_type: "${knowledgeType}"
category: ${JSON.stringify(category)}
# 关系信息
prerequisites: []
related_kps: []
related_chapters: ${JSON.stringify(relatedChapters)}
related_courses: []
# RAG 优化字段
summary: "${summary}"
keywords: ${JSON.stringify(keywords)}
rag_weight: 1.0
is_public: true
# 元数据
created: "${metadata.created || "2026-05-27"}"
updated: "${metadata.created || "2026-05-27"}"
author: "EduSmart Team"
version: "1.0"
# Obsidian 标签
tags: [knowledge-point, ${courseCode}]
---`;

    const newContent = newFm + "\n" + body;
    fs.writeFileSync(filePath, newContent, "utf-8");
    return true;
}

// 主执行
function main() {
    console.log("开始批量修复 frontmatter...\n");

    let total = 0;
    let fixed = 0;
    let skipped = 0;

    function walkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith(".")) continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walkDir(fullPath);
            } else if (entry.name.endsWith(".md") && entry.name !== "课程总览.md") {
                total++;
                const relPath = path.relative(VAULT_BASE, fullPath);
                try {
                    if (fixFrontmatter(fullPath)) {
                        console.log(`  OK: ${relPath}`);
                        fixed++;
                    } else {
                        skipped++;
                    }
                } catch (e) {
                    console.log(`  ERR: ${relPath} - ${e.message}`);
                    skipped++;
                }
                if (total % 50 === 0) {
                    console.log(`  ... 已处理 ${total} 个文件\n`);
                }
            }
        }
    }

    walkDir(COURSE_DIR);

    console.log(`\n========== 完成 ==========`);
    console.log(`总计: ${total} 文件`);
    console.log(`已修复: ${fixed} 文件`);
    console.log(`跳过: ${skipped} 文件`);
}

main();
