/**
 * =============================================================================
 * 兼容旧版 API 路由
 * =============================================================================
 *
 * @file       src/server/legacy-api-routes.js
 * @module     Server/LegacyApiRoutes
 * @description
 *   保留旧版项目的 API 端点，确保向后兼容。
 *   包括：
 *   - POST /api/questions/search-by-image  图片搜题
 *   - POST /api/spark-proxy                 星火大模型代理
 *   - POST /v1/chat/completions             OpenAI 兼容 Chat API（内部走星火）
 *
 *   新功能应通过 src/modules/ 或 src/routes/ 注册，
 *   此文件仅保留历史兼容端点，后续版本可能移除。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 更新引用路径至新模块体系
 *
 * =============================================================================
 */

const pool = require('../database/connection');
const config = require('../config');
const { authenticateJWT } = require('../middleware/auth');
const llmGateway = require('../core/llm/LlmGateway');

/**
 * 注册兼容旧版 API 路由
 *
 * @param {express.Application} app - Express 应用实例
 */
function registerLegacyApiRoutes(app) {
  // ========== 图片搜题（旧版兼容） ==========
  app.post('/api/questions/search-by-image', authenticateJWT, async (req, res) => {
    // 默认兜底题目（数据库不可用时的回退数据）
    const fallbackQuestions = [
      {
        id: 'demo-1',
        content: '时间复杂度 O(n log n) 通常对应哪种排序算法？',
        knowledge_name: '算法复杂度',
      },
      {
        id: 'demo-2',
        content: '氧化还原反应中失去电子的过程称为什么？',
        knowledge_name: '化学反应',
      },
      {
        id: 'demo-3',
        content: '导数的几何意义是什么？',
        knowledge_name: '微积分',
      },
    ];

    try {
      // 关键词模糊匹配搜索
      const keywords = ['函数', '算法', '反应', '导数', '语法'];
      const likeConditions = keywords
        .map(() => '(content LIKE ? OR knowledge_name LIKE ?)')
        .join(' OR ');
      const queryParams = keywords.flatMap((keyword) => [
        `%${keyword}%`,
        `%${keyword}%`,
      ]);

      const [questions] = await pool.query(
        `SELECT * FROM questions WHERE ${likeConditions} LIMIT 8`,
        queryParams
      );

      res.json({
        success: true,
        questions: questions.length ? questions : fallbackQuestions,
      });
    } catch (error) {
      // 数据库不可用时返回兜底数据
      res.json({ success: true, demoMode: true, questions: fallbackQuestions });
    }
  });

  // ========== 星火大模型代理（旧版兼容） ==========
  app.post('/api/spark-proxy', authenticateJWT, async (req, res) => {
    try {
      const {
        messages,
        temperature = 0.7,
        max_tokens: maxTokens,
      } = req.body;

      // 参数校验
      if (!messages || !Array.isArray(messages) || !messages.length) {
        return res
          .status(400)
          .json({ success: false, message: 'messages 参数缺失或格式错误' });
      }

      // 调用 LLM 网关
      const result = await llmGateway.chat({
        messages,
        temperature,
        maxTokens,
      });

      // 组装 OpenAI 兼容格式的响应
      res.json({
        id: `spark_${Date.now()}`,
        object: 'chat.completion',
        model: result.model || config.spark.model,
        provider: result.provider,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: result.content || '',
            },
            finish_reason: 'stop',
          },
        ],
        usage: result.usage || null,
      });
    } catch (error) {
      // LLM 不可用时的兜底响应
      const question = String(
        req.body?.messages?.at(-1)?.content || ''
      ).trim();

      res.json({
        fallback: true,
        provider: 'spark',
        message: '大模型服务暂时不可用，已返回本地学习助手兜底内容。',
        choices: [
          {
            message: {
              content: question
                ? `我先帮你拆解这个问题：${question}。建议先定位相关概念，再列出已知条件，最后用例题验证。`
                : '请先输入你想解决的学习问题。',
            },
          },
        ],
      });
    }
  });

  // ========== OpenAI 兼容 Chat Completions API ==========
  // 对外暴露标准 OpenAI /v1/chat/completions 接口
  // 内部路由到讯飞星火大模型
  app.post('/v1/chat/completions', async (req, res) => {
    try {
      const {
        messages,
        model,
        temperature = 0.7,
        max_tokens: maxTokens = 2048,
        stream = false,
      } = req.body;

      // 参数校验
      if (!messages || !Array.isArray(messages) || !messages.length) {
        return res
          .status(400)
          .json({ error: { message: 'messages 参数缺失或格式错误', type: 'invalid_request_error' } });
      }

      // 不支持流式响应（星火 lite 模型非流式更稳定）
      if (stream) {
        return res
          .status(400)
          .json({ error: { message: '当前不支持 stream 模式，请设置 stream=false', type: 'invalid_request_error' } });
      }

      // 调用 LLM 网关（内部走星火大模型）
      const result = await llmGateway.chat({
        messages,
        temperature,
        maxTokens,
      });

      // 返回标准 OpenAI 格式
      res.json({
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model || result.model || config.spark.model,
        provider: result.provider,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: result.content || '',
            },
            finish_reason: 'stop',
          },
        ],
        usage: result.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      });
    } catch (error) {
      console.error('[Spark API] 调用失败:', error.message);
      res.status(500).json({
        error: {
          message: `大模型服务异常: ${error.message}`,
          type: 'server_error',
        },
      });
    }
  });
}

module.exports = { registerLegacyApiRoutes };
