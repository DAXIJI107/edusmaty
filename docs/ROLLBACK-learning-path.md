# 回滚说明：学习路径生成修复

## 基线

- 上游 GitHub `master` 提交：`39a8e7080a52e0f320260f8210ef07c0ec36df1b`
- 本地记录文件：`UPSTREAM_COMMIT.txt`
- 功能分支：`fix/learning-path-generate`（不直接改远程 `master`，便于回滚）

## 本次改动摘要

1. **学习路径生成**：目标匹配、演示模式跳过诊断门槛、Agent 失败时 3 天规则兜底写入 `study_tasks`
2. **MySQL/MariaDB 兼容**：`LearningLoopService` / `app.js` 去掉 SQLite 专用语法
3. **前端 Toast**：按 `needs_clarification` / `diagnosis_required` / `plan_ready` 提示，避免「已生成 undefined 天」
4. **P0 能力**：WorkspaceIngestor、ResourceQualityGate、ConversationalProfileEngine 等
5. **讯飞星火**：`.env.example` / `scripts/test-spark.js`（密钥仅在本地 `.env`，不入库）

## 回滚方式（推荐）

### A. 未合并到 master：直接删分支

```bash
git push origin --delete fix/learning-path-generate
```

### B. 已合并到 master：用 revert（保留历史）

```bash
git checkout master
git pull
git revert -m 1 <merge_commit_sha>
git push origin master
```

### C. 硬回退到上游基线（慎用，需协作确认）

```bash
git fetch origin
git checkout master
git reset --hard 39a8e7080a52e0f320260f8210ef07c0ec36df1b
git push --force-with-lease origin master
```

## 本地密钥

`.env` 已在 `.gitignore` 中，推送不会包含星火/数据库密钥。回滚代码不影响本机 `.env`。
