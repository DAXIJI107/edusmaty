// core/ObsidianKnowledgeLinker.js
// Obsidian 双向链接知识推荐器
// 利用 Obsidian 的 [[wikilinks]] 双向链接构建知识图谱，实现智能关联推荐
// 参考: obsidian-local-rest-api 方案
//
// 核心功能:
//   1. 解析 Obsidian vault 中的 [[wikilinks]] 链接
//   2. 构建知识点之间的关联图谱
//   3. 基于当前学习内容推荐关联知识点
//   4. 生成学习路径建议

const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, '..', '..', 'obsidian-vault');
const SHARED_KB = path.join(VAULT_DIR, '01-共享知识库');

// 忽略目录
const IGNORE_DIRS = new Set(['.obsidian', 'attachments', 'templates', '.trash', '09-系统管理', '06-可视化']);

class ObsidianKnowledgeLinker {
    constructor() {
        /** @type {Map<string, { title: string, links: string[], backlinks: string[], path: string, tags: string[] }>} */
        this.nodeMap = new Map();
        /** @type {Map<string, string[]>} 邻接表 */
        this.adjacencyList = new Map();
        this.indexBuilt = false;
        this.stats = { totalFiles: 0, totalLinks: 0, totalBacklinks: 0 };
    }

    /**
     * 构建知识图谱索引（扫描所有.md文件解析wikilinks）
     */
    buildIndex() {
        if (this.indexBuilt) return this.stats;

        this.nodeMap.clear();
        this.adjacencyList.clear();

        const files = this._scanMDFiles(SHARED_KB);
        this.stats.totalFiles = files.length;

        // 第一遍：收集所有文件的标题和出链
        const fileInfos = [];
        for (const filePath of files) {
            const info = this._parseFile(filePath);
            if (info) {
                fileInfos.push(info);
                this.nodeMap.set(info.title, info);
                // 也用标准化标题做key
                const normalized = this._normalizeTitle(info.title);
                if (normalized !== info.title) {
                    this.nodeMap.set(normalized, info);
                }
            }
        }

        // 第二遍：计算入链（backlinks）
        for (const info of fileInfos) {
            for (const link of info.links) {
                const normalized = this._normalizeTitle(link);
                const target = this.nodeMap.get(link) || this.nodeMap.get(normalized);
                if (target) {
                    target.backlinks.push(info.title);
                    this.stats.totalBacklinks++;
                }
                this.stats.totalLinks++;
            }
        }

        // 构建邻接表
        for (const [title, info] of this.nodeMap) {
            this.adjacencyList.set(title, [
                ...new Set([...info.links, ...info.backlinks])
            ]);
        }

        this.indexBuilt = true;
        return this.stats;
    }

    /**
     * 基于双向链接找到关联知识点
     * @param {string} topic - 知识点名称
     * @param {number} depth - 遍历深度（1=直接关联, 2=二级关联）
     * @returns {Array<{ title: string, relation: string, depth: number, tags: string[] }>}
     */
    findRelated(topic, depth = 1) {
        if (!this.indexBuilt) this.buildIndex();

        const normalized = this._normalizeTitle(topic);
        const node = this.nodeMap.get(topic) || this.nodeMap.get(normalized);

        if (!node) {
            // 尝试模糊匹配
            const matches = this._fuzzyMatch(topic);
            return matches.map(m => ({
                title: m.title,
                relation: '可能相关',
                depth: 1,
                tags: m.tags || []
            }));
        }

        const result = [];
        const visited = new Set([node.title]);

        // 第一层：直接关联
        const directLinks = [...new Set([...node.links, ...node.backlinks])];
        for (const linkTitle of directLinks) {
            if (visited.has(linkTitle)) continue;
            visited.add(linkTitle);
            const linkedNode = this.nodeMap.get(linkTitle);
            const isOutgoing = node.links.includes(linkTitle);
            const isIncoming = node.backlinks.includes(linkTitle);
            const relation = isOutgoing && isIncoming ? '双向关联'
                : isOutgoing ? '前置知识' : '后续知识';

            result.push({
                title: linkTitle,
                relation,
                depth: 1,
                tags: linkedNode?.tags || [],
                path: linkedNode?.path || ''
            });
        }

        // 第二层：间接关联
        if (depth >= 2) {
            for (const linkTitle of directLinks) {
                const linkedNode = this.nodeMap.get(linkTitle);
                if (!linkedNode) continue;

                const indirectLinks = [...linkedNode.links, ...linkedNode.backlinks]
                    .filter(l => !visited.has(l) && l !== node.title);

                for (const indirectTitle of [...new Set(indirectLinks)].slice(0, 5)) {
                    visited.add(indirectTitle);
                    const indirectNode = this.nodeMap.get(indirectTitle);
                    result.push({
                        title: indirectTitle,
                        relation: `通过「${linkTitle}」间接关联`,
                        depth: 2,
                        tags: indirectNode?.tags || [],
                        path: indirectNode?.path || ''
                    });
                }
            }
        }

        return result;
    }

    /**
     * 构建学习知识图谱（用于可视化）
     * @returns {object} { nodes: [], edges: [] }
     */
    buildLearningGraph(topic = null, maxNodes = 50) {
        if (!this.indexBuilt) this.buildIndex();

        const nodes = [];
        const edges = [];
        const nodeIds = new Map();

        let entries;
        if (topic) {
            const related = this.findRelated(topic, 2);
            const titles = new Set([topic, ...related.map(r => r.title)]);
            entries = Array.from(this.nodeMap.entries())
                .filter(([title]) => titles.has(title));
        } else {
            entries = Array.from(this.nodeMap.entries()).slice(0, maxNodes);
        }

        for (const [title, info] of entries) {
            if (nodes.length >= maxNodes) break;
            const id = `n${nodes.length}`;
            nodeIds.set(title, id);
            nodes.push({
                id,
                label: title,
                tags: info.tags?.slice(0, 3) || [],
                path: info.path,
                linkCount: info.links.length + info.backlinks.length
            });
        }

        // 构建边
        for (const [title, info] of entries) {
            const sourceId = nodeIds.get(title);
            if (!sourceId) continue;

            for (const link of info.links) {
                const targetId = nodeIds.get(link);
                if (targetId) {
                    edges.push({
                        source: sourceId,
                        target: targetId,
                        type: 'outgoing'
                    });
                }
            }
        }

        return { nodes, edges };
    }

    /**
     * 基于当前知识点推荐学习路径
     * @param {string} topic - 起始知识点
     * @param {number} steps - 推荐步数
     */
    suggestPath(topic, steps = 5) {
        if (!this.indexBuilt) this.buildIndex();

        const path = [];
        const visited = new Set();
        let current = topic;

        for (let i = 0; i < steps; i++) {
            const related = this.findRelated(current, 1);
            // 优先推荐前置知识（incoming links），然后后续知识
            const prereqs = related.filter(r => r.relation === '前置知识');
            const nextTopics = related.filter(r => r.relation !== '前置知识');
            const candidates = [...prereqs, ...nextTopics]
                .filter(r => !visited.has(r.title));

            if (candidates.length === 0) break;

            const next = candidates[0];
            visited.add(next.title);
            path.push({
                step: i + 1,
                topic: next.title,
                relation: next.relation,
                tags: next.tags,
                from: current
            });
            current = next.title;
        }

        return path;
    }

    /**
     * 获取知识图谱统计
     */
    getStats() {
        if (!this.indexBuilt) this.buildIndex();
        return this.stats;
    }

    // ==================== 私有方法 ====================

    _scanMDFiles(dir) {
        const results = [];
        if (!fs.existsSync(dir)) return results;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (IGNORE_DIRS.has(entry.name)) continue;
            const fp = path.join(dir, entry.name);
            if (entry.isDirectory()) results.push(...this._scanMDFiles(fp));
            else if (entry.name.endsWith('.md')) results.push(fp);
        }
        return results;
    }

    _parseFile(filePath) {
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const fm = this._parseFrontmatter(raw);
            const body = fm.body || '';

            // 提取wikilinks: [[xxx]] 或 [[xxx|alias]]
            const links = [];
            const linkRegex = /\[\[([^\]|#]+)(?:[|#][^\]]+)?\]\]/g;
            let match;
            while ((match = linkRegex.exec(body)) !== null) {
                const linkTitle = match[1].trim();
                if (linkTitle && !links.includes(linkTitle)) {
                    links.push(linkTitle);
                }
            }

            const title = fm.meta?.title
                || fm.meta?.alias
                || path.basename(filePath, '.md');

            const tags = fm.meta?.tags
                ? (Array.isArray(fm.meta.tags) ? fm.meta.tags : String(fm.meta.tags).split(/[,，]/).map(t => t.trim()))
                : [];

            return {
                title,
                links,
                backlinks: [],
                path: filePath,
                tags,
                folder: path.relative(SHARED_KB, filePath).split(path.sep)[0]
            };
        } catch (e) {
            return null;
        }
    }

    _parseFrontmatter(content) {
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!match) return { meta: {}, body: content };
        const yamlBlock = match[1];
        const meta = {};
        for (const line of yamlBlock.split('\n')) {
            const ci = line.indexOf(':');
            if (ci === -1) continue;
            const key = line.slice(0, ci).trim();
            let value = line.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
            // 处理数组
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            }
            meta[key] = value;
        }
        return { meta, body: content.slice(match[0].length).trim() };
    }

    _normalizeTitle(title) {
        return String(title || '')
            .toLowerCase()
            .replace(/[【】\[\]《》"']/g, '')
            .replace(/[\s_-]+/g, '')
            .trim();
    }

    _fuzzyMatch(query) {
        const normalized = this._normalizeTitle(query);
        const results = [];
        for (const [title, info] of this.nodeMap) {
            if (this._normalizeTitle(title).includes(normalized) ||
                normalized.includes(this._normalizeTitle(title))) {
                results.push(info);
            }
        }
        return results.slice(0, 10);
    }
}

module.exports = ObsidianKnowledgeLinker;