const pool = require('../db');
const config = require('../config');
const llmGateway = require('../core/llm/LlmGateway');

function registerHealthRoutes(app) {
    app.get('/api/health', async (req, res) => {
        const health = {
            success: true,
            service: 'edusmart-rebuild',
            time: new Date().toISOString(),
            demoMode: config.app.demoMode,
            database: 'unknown',
            llm: {
                provider: config.llm.provider,
                model: config.llm.local.model,
                status: 'unknown'
            }
        };

        try {
            await pool.query('SELECT 1');
            health.database = 'connected';
        } catch (error) {
            health.database = 'unavailable';
            health.databaseMessage = error.message;
        }

        try {
            const llmHealth = await llmGateway.health();
            health.llm = {
                provider: llmHealth.provider,
                model: llmHealth.model,
                status: llmHealth.ok ? 'connected' : 'unavailable',
                endpoint: config.llm.provider === 'spark' ? config.spark.httpApi : config.llm.local.baseUrl,
                message: llmHealth.error || undefined
            };
        } catch (error) {
            health.llm.status = 'unavailable';
            health.llm.message = error.message;
        }

        res.json(health);
    });
}

module.exports = { registerHealthRoutes };
