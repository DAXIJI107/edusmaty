class SmartNoteEngine {
    async enrichNote(userId, noteContent, pool) {
        const keywords = this.extractKeywords(noteContent);
        const relatedNodes = await this.findRelatedNodes(keywords, pool);
        const enriched = {
            original: noteContent,
            enriched: noteContent,
            annotations: [],
            relatedConcepts: [],
            suggestedTags: []
        };

        for (const node of relatedNodes) {
            enriched.annotations.push({
                concept: node.name,
                description: node.description || `${node.name}相关知识点`,
                nodeId: node.id,
                type: "knowledge_link"
            });
            enriched.relatedConcepts.push({
                name: node.name,
                id: node.id,
                subject: node.subject,
                relation: "related"
            });
        }

        enriched.suggestedTags = this.generateTags(noteContent, relatedNodes);
        enriched.enriched = this.insertAnnotations(noteContent, enriched.annotations);

        return enriched;
    }

    extractKeywords(text) {
        const stopWords = [
            "的",
            "了",
            "是",
            "在",
            "和",
            "就",
            "都",
            "而",
            "及",
            "与",
            "着",
            "或",
            "一个",
            "没有",
            "我们",
            "你们",
            "他们",
            "这个",
            "那个",
            "这些",
            "那些"
        ];
        const chars = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, " ");
        const words = chars.split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w));
        return [...new Set(words)].slice(0, 10);
    }

    async findRelatedNodes(keywords, pool) {
        const nodes = [];
        for (const keyword of keywords) {
            const [rows] = await pool.query(
                `SELECT id, name, subject, description FROM knowledge_nodes
                 WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1
                 LIMIT 3`,
                [`%${keyword}%`, `%${keyword}%`]
            );
            nodes.push(...rows);
        }
        return nodes.slice(0, 8);
    }

    generateTags(noteContent, relatedNodes) {
        const tags = [];
        const subjectMap = {};
        for (const node of relatedNodes) {
            if (node.subject) subjectMap[node.subject] = (subjectMap[node.subject] || 0) + 1;
        }
        for (const [subject, count] of Object.entries(subjectMap)) {
            if (count >= 2) tags.push(subject);
        }
        const keywords = this.extractKeywords(noteContent);
        tags.push(...keywords.slice(0, 3));
        return [...new Set(tags)];
    }

    insertAnnotations(text, annotations) {
        let result = text;
        for (const ann of annotations) {
            if (result.includes(ann.concept)) {
                result = result.replace(ann.concept, `${ann.concept}`);
            }
        }
        return result;
    }

    async generateMindMap(noteContent, pool) {
        const keywords = this.extractKeywords(noteContent);
        const nodes = await this.findRelatedNodes(keywords, pool);

        const mindMap = {
            root: { id: "root", label: "笔记主题", children: [] },
            nodes: [],
            edges: []
        };

        const subjectGroups = {};
        for (const node of nodes) {
            const subject = node.subject || "general";
            if (!subjectGroups[subject]) subjectGroups[subject] = [];
            subjectGroups[subject].push(node);
        }

        for (const [subject, subjectNodes] of Object.entries(subjectGroups)) {
            const subjectId = `subject_${subject}`;
            mindMap.nodes.push({
                id: subjectId,
                label: subject,
                type: "subject",
                children: []
            });
            mindMap.edges.push({ from: "root", to: subjectId });

            for (const node of subjectNodes) {
                const nodeId = `node_${node.id}`;
                mindMap.nodes.push({
                    id: nodeId,
                    label: node.name,
                    type: "concept",
                    nodeId: node.id,
                    description: node.description
                });
                mindMap.edges.push({ from: subjectId, to: nodeId });
            }
        }

        return mindMap;
    }

    async findRelatedNotes(noteId, pool) {
        const [note] = await pool.query("SELECT * FROM notes WHERE id = ?", [noteId]);
        if (note.length === 0) return null;

        const keywords = this.extractKeywords(note[0].content);
        const relatedNotes = [];

        for (const keyword of keywords) {
            const [notes] = await pool.query(
                `SELECT id, title, content, created_at FROM notes
                 WHERE (content LIKE ? OR title LIKE ?) AND id != ?
                 LIMIT 5`,
                [`%${keyword}%`, `%${keyword}%`, noteId]
            );
            relatedNotes.push(...notes);
        }

        const uniqueNotes = [];
        const seenIds = new Set();
        for (const n of relatedNotes) {
            if (!seenIds.has(n.id)) {
                seenIds.add(n.id);
                uniqueNotes.push({
                    id: n.id,
                    title: n.title,
                    preview: n.content.slice(0, 100),
                    createdAt: n.created_at,
                    relevance: this.calculateRelevance(n.content, note[0].content)
                });
            }
        }

        return uniqueNotes.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
    }

    calculateRelevance(content1, content2) {
        const words1 = new Set(this.extractKeywords(content1));
        const words2 = new Set(this.extractKeywords(content2));
        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union = new Set([...words1, ...words2]);
        return union.size > 0 ? Math.round((intersection.size / union.size) * 100) : 0;
    }

    async generateSummary(content) {
        const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 0);
        if (sentences.length <= 3) return content;

        const keywords = this.extractKeywords(content);
        const scoredSentences = sentences.map(s => {
            const score = keywords.filter(k => s.includes(k)).length;
            return { sentence: s, score };
        });

        scoredSentences.sort((a, b) => b.score - a.score);
        const topSentences = scoredSentences.slice(0, 3).map(s => s.sentence);
        return topSentences.join("。") + "。";
    }
}

module.exports = SmartNoteEngine;
