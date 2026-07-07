/**
 * =============================================================================
 * EduSmart Express 应用创建
 * =============================================================================
 *
 * @file       src/server/app.js
 * @module     Server/App
 * @description
 *   Express 应用工厂函数。
 *   负责中间件注册、静态资源托管、API 路由挂载、SPA 前端路由。
 *   所有路由注册通过 route-manifest.js 清单集中管理。
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 更新引用路径至新模块体系
 *
 * =============================================================================
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// 配置（新路径：src/config/）
const config = require('../config');

// 中间件（新路径：src/middleware/）
const { requestLogger, errorHandler } = require('../middleware');

// 路由清单
const routeManifest = require('./route-manifest');

// 独立路由注册
const { registerHealthRoutes } = require('./health-routes');
const { registerLegacyApiRoutes } = require('./legacy-api-routes');
const { registerWebRoutes } = require('./web-routes');

// ========== 路径常量 ==========

/** 项目根目录（edusmart-rebuild/） */
const projectRoot = path.join(__dirname, '..', '..');

/** Web 前端静态资源根目录 */
const webRoot = path.join(projectRoot, 'apps', 'web', 'public');

/** SPA 入口 HTML 文件 */
const appHtml = path.join(webRoot, 'html', 'app.html');

// ========== 路由挂载 ==========

/**
 * 从 route-manifest.js 清单自动挂载所有 API 路由
 *
 * 遍历清单中的 [prefix, modulePath] 对，
 * 动态 require 模块并挂载到对应前缀。
 * 加载失败的模块会被跳过并打印警告，不阻断启动。
 *
 * @param {express.Application} app - Express 应用实例
 */
function mountApiRoutes(app) {
  for (const [prefix, router] of routeManifest) {
    try {
      app.use(prefix, router);
    } catch (error) {
      console.warn(`[Route] 跳过 ${prefix}: ${error.message}`);
    }
  }
}

// ========== 应用工厂 ==========

/**
 * 创建并配置 Express 应用
 *
 * 执行顺序：
 *   1. 通用中间件（JSON 解析、Cookie、CORS、日志）
 *   2. 静态资源托管（CSS、JS、图片、RAG 知识库）
 *   3. API 路由挂载
 *   4. 健康检查 / 兼容 API / SPA 前端路由
 *   5. 全局错误处理（必须在所有路由之后）
 *
 * @returns {express.Application} 配置完成的 Express 应用
 */
function createApp() {
  const app = express();

  // ---- 通用中间件 ----
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors({ origin: config.server.corsOrigin, credentials: true }));
  app.use(requestLogger);

  // ---- 静态资源 ----
  app.use('/css', express.static(path.join(webRoot, 'css')));
  app.use('/js', express.static(path.join(webRoot, 'js')));
  app.use('/images', express.static(path.join(webRoot, 'images')));
  app.use('/public', express.static(webRoot));
  app.use(
    '/rag_software_engineering_bundle',
    express.static(path.join(projectRoot, 'rag_software_engineering_bundle'))
  );

  // ---- API 路由 ----
  mountApiRoutes(app);
  registerHealthRoutes(app);
  registerLegacyApiRoutes(app);

  // ---- SPA 前端路由（兜底） ----
  registerWebRoutes(app, appHtml);

  // ---- 全局错误处理（最后注册） ----
  app.use(errorHandler);

  return app;
}

module.exports = { createApp, projectRoot, webRoot };
