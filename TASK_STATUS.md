# Specification Search Series 图片与 SPQ

| 项目 | 记录 |
| --- | --- |
| Goal / Scope | 4173 使用实际 FECS 图片与 SPQ，验证 PDF 下载、General、Automotive 与响应式 |
| Owner | Sol 统筹和终验。Luna Frontend 实现媒体解析。Luna Backend 实现 SPQ。Jev MCP 批量分类。 |
| Status | VERIFIED |
| Blockers | 无。3 条 General Series 缺图像及 PDF，168 条 Series 缺 SPQ。 |

- 使用 `seriesImage` 和共用媒体解析器。4173 通过 FECS 提供已验证的目录图片与规格书。图片缺失或 HTTP 404 使用本地回退。SPQ 保持现有列位置。
- 341 个唯一图片均通过 HTTP GET 和 SHA-256。495 个 PDF 均通过 HTTP HEAD。绝对、相对和 404 路径已核对。
- 浏览器验证 General 和 Automotive 的图片、SPQ、分类、筛选、SKU 搜索、数值排序和分页。1440/768/390px 布局及 80×80 图像尺寸与基线一致，两份实际下载的规格书逐字节一致。
- `npm run build:dev`、`npm run build:prod` 和各自 `npm run validate` 均通过，20 条路由。4173 使用隔离构建的 v106，原工作区生成文件 SHA-256 已复核。
- **Modified files** `src/app/features/spec-search/media-url.js`、`src/app/features/spec-search/render.js`、`scripts/dev.mjs`、`scripts/validate-artifact.mjs`、`src/pages/layouts/document.html`、`README.md`、`MEMORY.md`、`TASK_STATUS.md`。
- **Next Steps** 任务验收完成。源数据缺口已列于证据。
- [后端任务记录](../Foundational-Electronics-Core-Systems/TASK_STATUS.md) · [核对报告](%LOCALAPPDATA%/SpecSearch-QA/20261117-2020/VERIFICATION.md)

- **Last Updated** 2026-11-17 20:43:28 +08:00（Asia/Singapore）


## FECS Family 横幅 — 2026-11-19

- **Goal / Scope** 用 FECS 数据为 General 和 Automotive 的七个 Family 加载实物图，保留响应式图框和已有交互。
- **Status** VERIFIED。
- **Completed** 通过既有 `category_banner_image_media_id` hydration 加载七个真实 Media Library 公开别名。4173 已在 1440、768、390 px 验证 21 个横幅位置，均正确绑定、完整加载、无元件裁切或横向溢出。
- **Verification** 隔离执行 dev/prod 构建及各自 `npm run validate`，均通过 20 路由。真实浏览器的 Products 根页 32 个、General 24 个、Automotive 8 个已绑定分类图标通过。A4K、AQ4K 已实际下载并核对 SHA-256。Astra 独立复核完成。
- **Next Steps** 交付完成。
- **Last Updated** 2026-11-19 16:25:32+08:00（Asia/Singapore）。

[后端验收报告](../Foundational-Electronics-Core-Systems/tasks/product-family-banner-generation-2026-11-19/VERIFICATION_REPORT.md)


## FECS Family 横幅 v2

- **状态** VERIFIED。General 和 Automotive 的七张重设计横幅通过原有 FECS hydration 加载。
- **验证** 1440、768、390 px 共 21 个横幅位置正确映射，实际视口像素符合居中 cover。导航、分类图标和页面布局通过前后对账。
- **更新时间** 2026-11-24 09:34:34 +08:00（Asia/Singapore）。
- [v2 验收报告](../Foundational-Electronics-Core-Systems/tasks/product-family-banner-generation-2026-11-19/redesign-v2/VERIFICATION_REPORT.md)

## 2026-11-25 frontend recovery (Remote Desktop Commander)
- Canonical frontend: C:\laragon\www\superworld-web-design; preview http://127.0.0.1:4173/
- Preserved both source projects and Git histories at %LOCALAPPDATA%\Superworld-Recovery\20261125-115205 (node_modules excluded).
- Merged four market pages, 16 systems, 56 module controls into the newer frontend. Original 32 SCSS/protected application files byte-identical to backup. Live FECS retained; no backend writes.
- Production build, HTML formatting, diagnostics exclusion, and 24-route artifact/lifecycle checks passed. Browser: 75 route/width checks; 16 systems and 56 cards; test selector for 3D printers corrected and retested. 14 series API/image/PDF/parts checks passed.
- QA logs: %LOCALAPPDATA%\Superworld-Recovery\20261125-115205\final-browser-qa.jsonl and %LOCALAPPDATA%\Superworld-Recovery\20261125-115205\final-api-qa.json. Existing illustration quality and hotspot evidence remain a separate task. Recovery checkpoint: recovery/2026-11-25; do not overwrite or revert. Do not use lo-wireframe as current frontend.
