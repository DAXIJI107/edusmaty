const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');
const config = require('../config');
const { authenticateJWT } = require('../middleware');
const RagSearchService = require('../core/RagSearchService');
const { ingestPublicSources } = require('../core/PublicRagIngestor');
const llmGateway = require('../core/llm/LlmGateway');

const ragSearch = new RagSearchService(pool);

async function ensureTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS agent_collaboration_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            task_id VARCHAR(50) NOT NULL,
            agent_name VARCHAR(100) NOT NULL,
            step_type VARCHAR(50) NOT NULL,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_task (task_id),
            INDEX idx_user_time (user_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

function generateTaskId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function inferSourceName(topic) {
    const text = String(topic || '').toLowerCase();
    return ['Hello-Agents', 'OATutor', 'OpenMAIC', 'NexusRAG', 'AgentScope']
        .find(name => text.includes(name.toLowerCase())) || null;
}

async function callSparkAgent(systemPrompt, userPrompt) {
    try {
        return await llmGateway.chatText({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            maxTokens: 2048
        });
    } catch (error) {
        console.error('Local AI call failed:', error.message);
        return null;
    }
}

async function insertLog(userId, taskId, agentName, stepType, content) {
    await pool.query(
        `INSERT INTO agent_collaboration_logs (user_id, task_id, agent_name, step_type, content)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, taskId, agentName, stepType, content]
    );
}

// POST /start - Start multi-agent collaboration
router.post('/start', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, message: '请提供学习主题(topic)' });
        }

        await ensureTable();

        const taskId = generateTaskId();
        const sourceName = inferSourceName(topic);
        let ingestResult = null;
        if (sourceName || /开源|公开|github|rag|agent/i.test(topic)) {
            ingestResult = await ingestPublicSources(pool, { sourceName: sourceName || 'all', limit: sourceName ? 1 : 3 })
                .catch(error => ({ success: false, error: error.message }));
        }
        const ragResult = await ragSearch.search({
            query: topic,
            subject: 'AI Agent',
            sourceName,
            userId,
            limit: 4
        }).catch(error => ({ answer: '', citations: [], hitCount: 0, error: error.message }));
        const evidenceText = (ragResult.citations || [])
            .map((item, index) => `[${index + 1}] ${item.title} / ${item.source.name}: ${item.snippet}`)
            .join('\n');

        const agents = [
            {
                agent: '规划Agent',
                step_type: 'plan',
                role: '专业AI教育规划专家',
                prompt: `You are a professional AI education planning expert. Break down the following learning topic into 3-5 clear learning steps. Use the evidence when relevant and cite [1]/[2]. Output in Chinese.\nTopic: ${topic}\nEvidence:\n${evidenceText}`,
                fallback: `以下是「${topic}」的学习规划：\n1. 了解${topic}的基本概念和核心定义\n2. 掌握${topic}的关键原理和方法\n3. 通过实例练习巩固${topic}的应用\n4. 进行综合练习与错题分析\n5. 总结归纳，形成知识体系`
            },
            {
                agent: '教学Agent',
                step_type: 'teach',
                role: '专业AI教师',
                prompt: `You are a professional AI teacher. Provide a detailed, easy-to-understand explanation of the following topic. Use examples, analogies, and the evidence below. Cite evidence as [1]/[2]. Output in Chinese.\nTopic: ${topic}\nEvidence:\n${evidenceText}`,
                fallback: `关于「${topic}」的详细讲解：\n\n${topic}是一个重要的学习主题。让我们从基础概念开始，逐步深入理解。\n\n核心概念：${topic}涉及多个关键知识点，理解它们之间的联系非常重要。\n\n实例说明：通过实际案例可以更好地理解${topic}的应用场景和实际意义。\n\n建议：结合练习题目来巩固对${topic}的理解。`
            },
            {
                agent: '出题Agent',
                step_type: 'quiz',
                role: '专业出题专家',
                prompt: `You are a professional exam designer. Create 3 practice questions about the following topic. Base questions on the evidence where possible and include answers. Output in Chinese.\nTopic: ${topic}\nEvidence:\n${evidenceText}`,
                fallback: `关于「${topic}」的练习题：\n\n题目1：请简述${topic}的核心概念是什么？\n答案：${topic}的核心概念包括其基础定义和关键特征。\n\n题目2：${topic}在实际应用中有哪些常见场景？\n答案：${topic}广泛应用于教育、科研和工程实践中。\n\n题目3：请分析${topic}的一个典型问题并给出解决方案。\n答案：通过系统分析方法和实践验证来解决相关问题。`
            },
            {
                agent: '评估Agent',
                step_type: 'evaluate',
                role: '学习评估专家',
                prompt: `You are a learning evaluation expert. Based on the topic and evidence, suggest 3 key review points, measurable success criteria, and a study strategy. Output in Chinese.\nTopic: ${topic}\nEvidence:\n${evidenceText}`,
                fallback: `关于「${topic}」的复习建议：\n\n重点复习1：回顾${topic}的基础概念，确保对核心定义有清晰理解。\n重点复习2：针对薄弱环节进行专项练习，特别是容易混淆的知识点。\n重点复习3：结合实际案例进行应用练习，加深理解。\n\n学习策略：采用间隔复习法，将${topic}的知识点分阶段巩固，结合费曼学习法进行自我讲解和检测。`
            }
        ];

        const steps = [];

        for (const agentConfig of agents) {
            const content = await callSparkAgent(
                `You are the ${agentConfig.role}`,
                agentConfig.prompt
            );

            const finalContent = content || agentConfig.fallback;

            await insertLog(userId, taskId, agentConfig.agent, agentConfig.step_type, finalContent);

            steps.push({
                agent: agentConfig.agent,
                step_type: agentConfig.step_type,
                content: finalContent
            });
        }

        await pool.query(
            `INSERT INTO study_tasks
                (user_id, knowledge_id, title, subtitle, icon, estimated_minutes, status, task_date, sort_order, color, soft_color, source)
             VALUES
                (?, NULL, ?, ?, 'users', 25, 'pending', CURDATE(), 1, '#2f6bff', 'rgba(47,107,255,.12)', 'agent-collaboration'),
                (?, NULL, ?, ?, 'exam', 20, 'pending', CURDATE(), 2, '#7c4dff', 'rgba(124,77,255,.12)', 'agent-collaboration')`,
            [
                userId,
                `多Agent协作学习：${topic}`,
                `基于 ${ragResult.hitCount || 0} 条 RAG 证据完成规划、教学、出题、评估。`,
                userId,
                `完成协作练习：${topic}`,
                '根据出题Agent结果完成练习，并把错因写入笔记。'
            ]
        ).catch(() => {});

        res.json({
            success: true,
            data: {
                taskId,
                steps,
                rag: {
                    answer: ragResult.answer,
                    hitCount: ragResult.hitCount || 0,
                    citations: ragResult.citations || []
                },
                ingest: ingestResult
            }
        });
    } catch (error) {
        console.error('Multi-agent collaboration failed:', error);
        res.status(500).json({ success: false, message: '多智能体协作失败' });
    }
});

// GET /history - Get collaboration history
router.get('/history', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        await ensureTable();

        const [rows] = await pool.query(
            `SELECT task_id,
                    MIN(created_at) AS started_at,
                    COUNT(*) AS step_count,
                    GROUP_CONCAT(agent_name ORDER BY id SEPARATOR ', ') AS agents
             FROM agent_collaboration_logs
             WHERE user_id = ?
             GROUP BY task_id
             ORDER BY MAX(created_at) DESC
             LIMIT 10`,
            [userId]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Get collaboration history failed:', error);
        res.status(500).json({ success: false, message: '获取协作历史失败' });
    }
});

// GET /:taskId - Get collaboration detail
router.get('/:taskId', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId } = req.params;
        await ensureTable();

        const [rows] = await pool.query(
            `SELECT id, user_id, task_id, agent_name, step_type, content, created_at
             FROM agent_collaboration_logs
             WHERE task_id = ? AND user_id = ?
             ORDER BY id`,
            [taskId, userId]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Get collaboration detail failed:', error);
        res.status(500).json({ success: false, message: '获取协作详情失败' });
    }
});

module.exports = router;
