# 自习室个人知识库（2026-08-21）

## 摘要

将 `/study-room`「我的知识库」从 localStorage 原型升级为服务端持久化文档库。

## 能力

- 五种固定模板：普通文档、结构化文档、学习笔记、学习报告、学习日记
- 私密 / 链接只读分享（`/study-room/shared/<token>`）
- 导入 Markdown、JSON；导出 MD / JSON / Word
- 插入链接、图片、笔记引用、知识库文档引用
- 首次打开自动迁移本地旧文档

## 技术

- API：`/api/personal-docs`（[`src/modules/personal-docs.js`](../src/modules/personal-docs.js)）
- 表：`personal_documents`
- 前端：[`apps/web/public/js/edusmart-app.js`](../apps/web/public/js/edusmart-app.js)

## 回滚

```bash
git revert <本提交 SHA>
# 或保留表不动，仅回退代码到上一 master
```
