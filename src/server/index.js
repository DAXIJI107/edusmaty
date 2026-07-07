/**
 * =============================================================================
 * EduSmart 应用入口
 * =============================================================================
 *
 * @file       src/server/index.js
 * @module     Server/Index
 * @description
 *   应用启动入口。
 *   创建 Express 应用，启动 HTTP 服务器，自动打开浏览器。
 *
 *   启动流程：
 *   1. 加载配置（dotenv 已在 config/index.js 中加载）
 *   2. 创建 Express 应用
 *   3. 监听端口
 *   4. 自动打开浏览器（开发模式）
 *
 * @author     EduSmart Team
 * @since      v2.0.0
 * @refactored 2026-06-27 - 更新注释，引用路径规范化
 *
 * @requires   ../config
 * @requires   ./app
 *
 * =============================================================================
 */

const config = require('../config');
const { createApp } = require('./app');
const { exec } = require('child_process');

// 创建 Express 应用实例
const app = createApp();

// 服务端口
const PORT = config.server.port;

// 启动服务
app.listen(PORT, () => {
  console.log(`✓ EduSmart rebuild running at http://localhost:${PORT}`);
  console.log(`  环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  演示模式: ${config.app.demoMode ? '开启' : '关闭'}`);
  console.log(`  LLM Provider: ${config.llm.provider}`);

  // 开发环境下自动打开浏览器
  setTimeout(() => {
    const url = `http://localhost:${PORT}`;
    const platform = process.platform;
    let cmd;

    if (platform === 'win32') {
      cmd = `start "" "${url}"`;
    } else if (platform === 'darwin') {
      cmd = `open "${url}"`;
    } else {
      cmd = `xdg-open "${url}"`;
    }

    exec(cmd, (err) => {
      if (err) console.log('自动打开浏览器失败，请手动访问:', url);
    });
  }, 1000);
});

// 导出供测试使用
module.exports = app;
