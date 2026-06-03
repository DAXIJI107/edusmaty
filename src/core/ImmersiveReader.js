class ImmersiveReader {
    async analyzeText(text, options = {}) {
        return {
            original: text,
            annotations: this.generateAnnotations(text),
            vocabulary: this.extractVocabulary(text),
            structure: this.analyzeStructure(text),
            readability: this.calculateReadability(text)
        };
    }

    generateAnnotations(text) {
        const annotations = [];
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim());

        for (const sentence of sentences) {
            const difficultWords = this.findDifficultWords(sentence);
            if (difficultWords.length > 0) {
                annotations.push({
                    type: 'vocabulary',
                    sentence: sentence.trim(),
                    words: difficultWords
                });
            }

            if (this.isKeySentence(sentence)) {
                annotations.push({
                    type: 'key_point',
                    sentence: sentence.trim(),
                    reason: '包含核心观点或结论'
                });
            }
        }

        return annotations;
    }

    findDifficultWords(text) {
        const difficultWords = [];
        const words = text.split(/[\s,，、；;]+/);

        for (const word of words) {
            if (word.length > 4 && /[\u4e00-\u9fa5]/.test(word)) {
                difficultWords.push({
                    word: word,
                    difficulty: 'medium',
                    suggestion: `"${word}"是一个专业术语，建议结合上下文理解`
                });
            }
        }

        return difficultWords;
    }

    isKeySentence(sentence) {
        const indicators = [
            '因此', '所以', '总之', '综上所述', '关键', '核心', '本质',
            '重要', '必须', '一定', '总是', '永远', '不可能', '必然',
            'therefore', 'thus', 'consequently', 'key', 'essential', 'important'
        ];
        return indicators.some(i => sentence.includes(i));
    }

    extractVocabulary(text) {
        const words = text.split(/[\s,，、；;.。！!?？\n]+/).filter(w => w.length > 0);
        const wordSet = new Set(words);
        const vocabulary = [];

        for (const word of wordSet) {
            if (word.length >= 4 && /[\u4e00-\u9fa5]/.test(word)) {
                vocabulary.push({
                    word,
                    length: word.length,
                    type: this.classifyWord(word),
                    context: this.findContext(text, word)
                });
            }
        }

        return vocabulary.sort((a, b) => b.length - a.length).slice(0, 20);
    }

    classifyWord(word) {
        const technicalIndicators = ['定理', '定律', '公式', '原理', '效应', '方程', '函数', '算法'];
        if (technicalIndicators.some(i => word.includes(i))) return 'technical';
        if (word.length > 6) return 'complex';
        return 'normal';
    }

    findContext(text, word) {
        const idx = text.indexOf(word);
        if (idx === -1) return '';
        const start = Math.max(0, idx - 20);
        const end = Math.min(text.length, idx + word.length + 20);
        return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
    }

    analyzeStructure(text) {
        const paragraphs = text.split('\n').filter(p => p.trim());
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim());

        return {
            paragraphCount: paragraphs.length,
            sentenceCount: sentences.length,
            totalChars: text.length,
            avgSentenceLength: sentences.length > 0
                ? Math.round(sentences.reduce((s, sen) => s + sen.length, 0) / sentences.length)
                : 0,
            structure: this.identifyStructure(paragraphs)
        };
    }

    identifyStructure(paragraphs) {
        const structure = [];
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            if (i === 0 && p.length < 100) {
                structure.push({ index: i, role: 'title', content: p.slice(0, 50) });
            } else if (p.startsWith('第') || p.startsWith('一、') || p.startsWith('二、') || p.startsWith('1.') || p.startsWith('2.')) {
                structure.push({ index: i, role: 'heading', content: p.slice(0, 50) });
            } else if (p.length > 200) {
                structure.push({ index: i, role: 'body', content: p.slice(0, 50) });
            } else {
                structure.push({ index: i, role: 'paragraph', content: p.slice(0, 50) });
            }
        }
        return structure;
    }

    calculateReadability(text) {
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim());
        const words = text.split(/[\s,，、；;.。！!?？\n]+/).filter(w => w.length > 0);

        const totalSentences = sentences.length || 1;
        const totalWords = words.length || 1;
        const totalChars = text.length;

        const avgSentenceLength = totalChars / totalSentences;
        const avgWordLength = totalChars / totalWords;

        let difficulty = 'medium';
        if (avgSentenceLength > 50 || avgWordLength > 3) difficulty = 'hard';
        if (avgSentenceLength < 20 && avgWordLength < 2) difficulty = 'easy';

        return {
            score: Math.round(100 - (avgSentenceLength * 0.5 + avgWordLength * 10)),
            difficulty,
            avgSentenceLength: Math.round(avgSentenceLength),
            avgWordLength: Math.round(avgWordLength * 10) / 10,
            suggestion: difficulty === 'hard'
                ? '建议将长句拆分为短句，适当增加分段'
                : difficulty === 'easy'
                ? '文本易于理解'
                : '文本难度适中'
        };
    }

    async translate(text, targetLang = 'zh') {
        return {
            original: text,
            translation: `[翻译] ${text}`,
            language: targetLang,
            timestamp: new Date()
        };
    }

    async generateFlashcard(text, source) {
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim());
        const keySentences = sentences.filter(s => this.isKeySentence(s));

        return {
            source,
            cards: keySentences.slice(0, 5).map(s => ({
                front: s.trim(),
                back: `关键知识点：${s.trim()}`,
                source: 'reading'
            })),
            createdAt: new Date()
        };
    }
}

module.exports = ImmersiveReader;