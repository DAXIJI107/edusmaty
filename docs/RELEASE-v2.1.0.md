# EduSmart v2.1.0 发布说明

**发布日期：** 2026-08-21  
**Git 标签：** `v2.1.0`  
**基线提交：** `b479afb`（`master`）  
**仓库：** https://github.com/DAXIJI107/edusmaty  

## 一句话说明

本版在上游「文档格式选择 + 讯飞星火」能力之上，修复并强化了**个性化学习路径**：打开路径页即可自动生成可用计划，演示模式可稳定出任务，并补充回滚备份与说明文档。

## 相对上一正式基线（`39a8e70`）的主要变化

### 1. 个性化学习路径（核心）

- 打开「个性化学习路径」页时，若尚无 Agent 计划，**自动调用生成接口**，无需先点按钮。
- 演示模式（`DEMO_MODE=true`）下写入基线掌握度，跳过「必须先答诊断题」门槛，便于演示。
- Agent / LLM 超时或失败时，用 **3 天规则兜底计划**写入 `study_tasks`，避免空路径。
- 前端 Toast 按阶段提示（`needs_clarification` / `diagnosis_required` / `plan_ready`），修复「已生成 undefined 天」。
- 目标「系统掌握计算机核心能力」等宽泛表述可匹配到基础知识点（如计算机科学导论）。

### 2. 数据库兼容

- `LearningLoopService`、应用路径相关接口改为 **MySQL / MariaDB** 语法（去掉 SQLite 专用写法）。
- 路径中心只展示 Agent / 学习闭环写入的真实任务。

### 3. P0 能力增强（已合入）

- WorkspaceIngestor、ResourceQualityGate、ConversationalProfileEngine
- ResourceAgent / SafetyAgent 相关收紧与演示知识包脚本
- `npm run test:p0`、`npm run db:seed-demo-pack`

### 4. 讯飞星火

- 支持 `LLM_PROVIDER=spark`（密钥仅存本地 `.env`，**不入库**）
- `npm run test:spark` 联调脚本

### 5. 文档与回滚

- `docs/ROLLBACK-learning-path.md`：备份分支 / 标签与回滚步骤
- 本文件：`docs/RELEASE-v2.1.0.md`

## 备份与回滚

| 类型 | 名称 | 用途 |
|------|------|------|
| 合并前备份分支 | `backup/master-before-learning-path-fix` | 回退到 `39a8e70` 快照 |
| 合并前备份标签 | `backup/master-39a8e70-20260711` | 同上 |
| 本版发布标签 | `v2.1.0` | 当前完整新版锚点 |

回退到本版发布前（星火合并点）：

```bash
git fetch origin --tags
git checkout master
git reset --hard backup/master-39a8e70-20260711
git push --force-with-lease origin master
```

回退「仅撤销路径相关大提交」可用 `git revert`（详见回滚文档）。

## 本地运行（简要）

1. 配置 `.env`（参考 `.env.example`；勿提交密钥）
2. 启动 MariaDB（示例 datadir：`C:\Users\EDY\Tools\mariadb-data`，端口 `3306`）
3. `npm install`（如需）→ `npm start`（默认 http://localhost:3020 ）
4. 演示账号：`zhangsan` / `123456`

## 建议验证清单

- [ ] 登录后打开「个性化学习路径」，无需手动点击即可出现计划
- [ ] Toast 不再出现 `undefined` 天数
- [ ] `/api/app/path/center` 能返回今日任务
- [ ] （可选）`npm run test:spark` / `npm run test:p0`

## 相关提交（节选）

- `4ab23a5` — 路径生成修复、演示兜底、MySQL 兼容、P0
- `2a08d80` — 回滚说明文档
- `b479afb` — 打开路径页自动生成
- （本发布）文档与版本标注 `v2.1.0`
