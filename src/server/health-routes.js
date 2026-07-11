/**
 * =============================================================================
 * 健康检查路由
 * =============================================================================
 *
 * @file       src/server/health-routes.js
 * @module     Server/HealthRoutes
 * @description
 *   服务健康检查 API。
 *   提供 GET /api/health 端点，返回服务状态、数据库连通性、LLM 状态。
 *
 *   用于：
 *   - Kubernetes/Docker 健康探针
 *   - 监控系统（Prometheus/Grafana）
 *   - 运维排障
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 更新引用路径至新模块体系
 *
 * =============================================================================
 */

const pool = require('../database/connection');
const config = require('../config');
const llmGateway = require('../core/llm/LlmGateway');

/**
 * 注册健康检查路由
 *
 * 响应格式：
 * {
 *   success: true,
 *   service: "edusmart-rebuild",
 *   time: "2026-06-27T...",
 *   demoMode: false,
 *   database: "connected" | "unavailable",
 *   llm: { provider, model, status, endpoint, message? }
 * }
 *
 * @param {express.Application} app - Express 应用实例
 */
function registerHealthRoutes(app) {
  app.get('/api/health', async (req, res) => {
    // 基础健康信息
    const health = {
      success: true,
      service: 'edusmart-rebuild',
      time: new Date().toISOString(),
      demoMode: config.app.demoMode,
      database: 'unknown',
      llm: {
        provider: config.llm.provider,
        model: config.llm.local.model,
        status: 'unknown',
      },
    };

    // 检查数据库连通性
    try {
      await pool.query('SELECT 1');
      health.database = 'connected';
    } catch (error) {
      health.database = 'unavailable';
      health.databaseMessage = error.message;
    }

    // 检查 LLM 网关状态
    try {
      const llmHealth = await llmGateway.health();
      health.llm = {
        provider: llmHealth.provider,
        model: llmHealth.model,
        status: llmHealth.ok ? 'connected' : 'unavailable',
        endpoint:
          config.llm.provider === 'spark'
            ? config.spark.httpApi
            : config.llm.local.baseUrl,
        message: llmHealth.error || undefined,
      };
    } catch (error) {
      health.llm.status = 'unavailable';
      health.llm.message = error.message;
    }

    res.json(health);
  });
}

module.exports = { registerHealthRoutes };
