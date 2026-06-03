# 团队项目协作编程功能编码提示词

你正在维护 EduSmart 智能化学习平台重构版。项目是 Node.js + Express + MySQL 后端，前端是原生 HTML/CSS/JS 单页应用，主要入口为 `server.js`、`api/*`、`js/edusmart-app.js`、`css/edusmart-pro.css`。请基于现有 `/api/compiler` 与 `/api/code-repo` 能力，实现一个“学生组队开发完整项目”的编程协作功能。

## 功能目标

实现一个面向教学场景的“企业级团队项目开发”模块，让 4 名学生以类似真实软件团队的方式协作开发一个可以落地的项目：

- 1 号学生负责前端模块。
- 2 号学生负责后端模块。
- 3 号学生负责测试与质量保障。
- 4 号学生负责实施、部署与运维。
- 每位学生可在平台内查看自己的角色、负责模块、任务说明、交付物和进度。
- 每次代码保存都同步进入平台代码仓库，并记录修改人、修改文件、修改时间、修改位置、提交说明、变更行数和所属模块。
- 老师或团队成员可以查看项目看板、成员分工、文件目录、代码内容、提交时间线、实时活动流和模块粒度统计。

## 数据设计

新增或自动初始化以下 MySQL 表：

- `team_projects`：团队项目主表，字段包含 `id`、`owner_id`、`name`、`description`、`repository_name`、`status`、`progress`、`created_at`、`updated_at`。
- `team_project_members`：项目成员表，字段包含 `id`、`project_id`、`user_id`、`role_key`、`role_name`、`module_name`、`responsibility`、`status`、`created_at`。
- `team_project_files`：项目文件表，字段包含 `id`、`project_id`、`module_key`、`path`、`language`、`content`、`owner_user_id`、`last_editor_id`、`size_bytes`、`version`、`created_at`、`updated_at`。
- `team_project_commits`：提交记录表，字段包含 `id`、`project_id`、`file_id`、`user_id`、`message`、`module_key`、`position_label`、`changed_lines`、`snapshot`、`created_at`。
- `team_project_events`：实时活动流表，字段包含 `id`、`project_id`、`user_id`、`event_type`、`title`、`detail`、`created_at`。

## 后端要求

新增 `api/team-code.js` 并在 `server.js` 中挂载为 `/api/team-code`。

接口至少包括：

- `GET /api/team-code/summary`：返回当前用户可见的项目列表、推荐角色模板、项目统计。
- `POST /api/team-code/demo`：创建一个示例 4 人项目，自动生成成员、前端/后端/测试/部署示例文件和初始化提交。
- `POST /api/team-code/projects`：创建项目，并支持传入成员分工。
- `GET /api/team-code/projects/:id`：返回项目详情，包含成员、文件、提交时间线、活动流和模块统计。
- `GET /api/team-code/projects/:id/files/:fileId`：返回文件完整内容。
- `POST /api/team-code/projects/:id/files/save`：保存或新建文件，生成提交记录和活动流，记录 `positionLabel`、`changedLines`、`moduleKey`、`message`。

接口必须使用现有 `authenticateJWT`，并校验用户是否是项目 owner 或成员。SQL 使用参数化查询。Demo 模式下允许用数据库已有学生补齐 4 人团队。

## 前端要求

在 `js/edusmart-app.js` 中新增视图 `teamCode`：

- 路由 `/team-code` 映射到该视图。
- 导航“编程实践”里增加“团队项目”入口。
- 页面布局包含：
  - 顶部项目概览：项目数、成员数、文件数、提交数。
  - 项目列表：可切换项目，可一键创建示例项目。
  - 角色分工看板：前端、后端、测试、部署四类角色，以模块粒度展示负责人和职责。
  - 文件协作区：文件列表、当前文件编辑器、模块选择、保存说明、修改位置。
  - 提交时间线：展示修改人、文件、模块、时间、变更行数。
  - 活动流：展示实时协作动态。
- 保存文件时调用 `/api/team-code/projects/:id/files/save`，保存后刷新项目详情。
- 不做复杂实时 WebSocket，先用保存后刷新和“活动流”模拟准实时协作。

## 样式要求

在 `css/edusmart-pro.css` 中新增团队项目页面样式。风格应与现有 EduSmart 控制台一致，偏工程化、清晰、可扫描，不要做营销页。移动端需要能单列展示，文本不能溢出。

## 验收标准

- `npm run check` 通过。
- 访问 `/team-code` 能打开团队项目页面。
- 点击“创建示例项目”后能看到 4 个角色、示例文件、提交记录和活动流。
- 打开文件、修改内容、填写提交说明和修改位置后点击保存，文件版本、更新时间、提交时间线和活动流都会更新。
- 后端 API 在数据库不可用时正常返回错误，不导致服务启动失败。
