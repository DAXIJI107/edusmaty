# 回滚说明：学习路径生成修复

## 基线与备份（2026-07-11）

| 类型 | 名称 | 说明 |
|------|------|------|
| 合并前 master | `39a8e708` | 上游「文档格式 + 讯飞星火」合并点 |
| 备份分支 | `backup/master-before-learning-path-fix` | 合并前 master 快照 |
| 备份标签 | `backup/master-39a8e70-20260711` | 同上，带注释 |
| 功能分支 | `fix/learning-path-generate` | 修复提交所在分支 |
| 已合入 master | `4ab23a5` | 学习路径 / DEMO 兜底 / MySQL / P0 |

## 本次改动摘要

1. **学习路径生成**：目标匹配、演示模式跳过诊断门槛、Agent 失败时 3 天规则兜底写入 `study_tasks`
2. **MySQL/MariaDB 兼容**：`LearningLoopService` / `app.js` 去掉 SQLite 专用语法
3. **前端 Toast**：按 `needs_clarification` / `diagnosis_required` / `plan_ready` 提示，避免「已生成 undefined 天」
4. **P0 能力**：WorkspaceIngestor、ResourceQualityGate、ConversationalProfileEngine 等
5. **讯飞星火**：`scripts/test-spark.js`（密钥仅在本地 `.env`，不入库）

## 回滚方式

### A. 推荐：硬回退到备份点（未有后续重要提交时）

```bash
git fetch origin
git checkout master
git reset --hard backup/master-39a8e70-20260711
git push --force-with-lease origin master
```

或：

```bash
git reset --hard origin/backup/master-before-learning-path-fix
git push --force-with-lease origin master
```

### B. 保留历史：revert 本次合入

```bash
git checkout master
git pull
git revert 4ab23a5
git push origin master
```

### C. 仅删功能分支（master 已合入时不够回滚代码）

```bash
git push origin --delete fix/learning-path-generate
```

## 本地密钥

`.env` 已在 `.gitignore` 中，推送不会包含星火/数据库密钥。回滚代码不影响本机 `.env`。
