/**
 * 端到端测试：验证 Agent 生成今日计划和学习路径按钮功能
 */
require('dotenv').config();

const http = require('http');
const jwt = require('jsonwebtoken');

// 生成测试用 JWT
const token = jwt.sign({ id: 1, username: 'test', role: 'student' }, process.env.JWT_SECRET || 'edusmart-dev-secret', { expiresIn: '1h' });

async function apiCall(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, 'http://localhost:3098');
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.setTimeout(60000, () => { req.destroy(); reject(new Error('timeout')); });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function main() {
    const { createApp } = require('./src/server/app');
    const app = createApp();

    const server = app.listen(3098, () => {
        console.log('服务器已启动: http://localhost:3098');
    });

    await new Promise(r => setTimeout(r, 1500));

    try {
        // 1. Health
        console.log('\n=== 测试1: Health Check ===');
        const health = await apiCall('/api/health');
        console.log('状态:', health.status);
        console.log('LLM:', JSON.stringify(health.data?.llm || {}).substring(0, 200));

        // 2. 测试生成今日计划 (默认 Agent 模式)
        console.log('\n=== 测试2: POST /api/app/plan/generate (Agent+LLM) ===');
        const planStart = Date.now();
        const planResult = await apiCall('/api/app/plan/generate', 'POST', {});
        const planTime = Date.now() - planStart;
        console.log('状态:', planResult.status, '耗时:', planTime + 'ms');
        console.log('success:', planResult.data?.success);
        console.log('generated:', planResult.data?.generated);
        console.log('strategy:', planResult.data?.strategy);
        if (planResult.data?.agentReasoning) {
            console.log('agentReasoning.topic:', planResult.data.agentReasoning.topic);
            console.log('agentReasoning.method:', planResult.data.agentReasoning.method);
            console.log('agentReasoning.estimatedMinutes:', planResult.data.agentReasoning.estimatedMinutes);
        }

        // 3. 测试生成学习路径
        console.log('\n=== 测试3: POST /api/app/path/generate (Agent+LLM) ===');
        const pathStart = Date.now();
        const pathResult = await apiCall('/api/app/path/generate', 'POST', {
            goal: '掌握Python编程',
            subject: 'all',
            durationDays: 3
        });
        const pathTime = Date.now() - pathStart;
        console.log('状态:', pathResult.status, '耗时:', pathTime + 'ms');
        console.log('success:', pathResult.data?.success);
        console.log('stage:', pathResult.data?.stage);
        console.log('generated:', pathResult.data?.generated);
        if (pathResult.data?.plan) {
            console.log('summary:', JSON.stringify(pathResult.data.plan.summary || '').substring(0, 150));
            console.log('strategy:', pathResult.data.plan.strategy);
            console.log('days:', (pathResult.data.plan.days || []).length);
        }

        // 4. 测试闭环运行
        console.log('\n=== 测试4: POST /api/app/closed-loop/run (Agent+LLM) ===');
        const loopStart = Date.now();
        const loopResult = await apiCall('/api/app/closed-loop/run', 'POST', { topic: 'Python' });
        const loopTime = Date.now() - loopStart;
        console.log('状态:', loopResult.status, '耗时:', loopTime + 'ms');
        console.log('success:', loopResult.data?.success);
        console.log('topic:', loopResult.data?.topic);
        if (loopResult.data?.agentReasoning) {
            console.log('agentReasoning topic:', loopResult.data.agentReasoning.topic);
        }
        console.log('effects:', JSON.stringify(loopResult.data?.effects));

        // 5. 验证 path/center
        console.log('\n=== 测试5: GET /api/app/path/center ===');
        const centerResult = await apiCall('/api/app/path/center?goal=掌握Python编程&subject=all');
        console.log('状态:', centerResult.status);
        console.log('tasks数量:', centerResult.data?.tasks?.length);
        if (centerResult.data?.tasks?.length) {
            centerResult.data.tasks.slice(0, 3).forEach(t => {
                console.log('  -', t.title, '|', t.subject, '| source:', t.source);
            });
        }

        // 6. 测试 rule 模式降级
        console.log('\n=== 测试6: POST /api/app/plan/generate?mode=rule (规则降级) ===');
        const ruleResult = await apiCall('/api/app/plan/generate?mode=rule', 'POST', {});
        console.log('状态:', ruleResult.status);
        console.log('success:', ruleResult.data?.success);
        console.log('generated:', ruleResult.data?.generated);

        console.log('\n=== ✅ 全部测试完成 ===');
    } catch (error) {
        console.error('测试失败:', error.message);
    } finally {
        server.close();
        await new Promise(r => setTimeout(r, 500));
        console.log('服务器已关闭');
        process.exit(0);
    }
}

main();
