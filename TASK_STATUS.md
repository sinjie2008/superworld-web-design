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

## Application technical exploded views — 2026-11-25

- **Goal / Scope** 16 application systems, all 56 original circuit blocks, responsive browser behaviour and live FECS regression checks.
- **Status** VERIFIED.
- **Completed** 16 original engineering WebPs with 56 correctly registered hotspots. Removed 13 replaced and unreferenced assets. Kept the published cuffless pressure research image. Original source and retired assets are recoverable from the 9b33602 archive.
- **Verification** On v166 at 4173, all 144 system/viewport combinations passed. Chromium exercised 56 mouse and 56 touch actions, 112 rendered Series associations, and all 16 active system tabs at 320 px. Both local builds passed the 24-route validation. Latest v166 independently retained the separate FECS Summary work. The protected pages, four Product routes, A4K file, FECS fingerprints and Inquiry cart passed.
- **Next Steps** Acceptance complete.
- **Blockers** None. Technical part-level detail is best read from the full-size drawings or desktop images.
- **Last Updated** 2026-11-25 21:05:29 +08:00 (Asia/Singapore).
- [Final verification report](C:/Users/sIn.jie/AppData/Local/Superworld-Application-QA/20261125-4173/VERIFICATION_REPORT.md) · [56 complete mappings](C:/Users/sIn.jie/AppData/Local/Superworld-Application-QA/20261125-4173/HOTSPOT_MAPPING.json)

| System | Route | Original art | New art | Original blocks | Verified targets | Research / architecture | Replacement / mapping | Desktop / tablet / mobile | Functional | Independent review | Cleanup | Status |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| Speakers | /applications/consumer?system=speakers | speakers-exploded-view.webp | speakers-technical-exploded.webp | 4 | 4 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Hearable Products | /applications/consumer?system=hearables | hearables-board-disassembly.webp | hearables-technical-exploded.webp | 3 | 3 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Unmanned Aerial Vehicle | /applications/consumer?system=uav | uav-camera-disassembly.webp | uav-technical-exploded.webp | 4 | 4 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Robotic Cleaner | /applications/consumer?system=robotic-cleaner | Pending | robotic-cleaner-technical-exploded.webp | 6 | 6 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Air Purifier | /applications/consumer?system=air-purifier | air-purifier-control-assembly.webp | air-purifier-technical-exploded.webp | 4 | 4 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Blood Pressure Devices | /applications/healthcare?system=blood-pressure | blood-pressure-cuff-disassembly.webp | blood-pressure-technical-exploded.webp | 5 | 5 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Electronic Thermometer | /applications/healthcare?system=thermometer | thermometer-display-disassembly.webp | thermometer-technical-exploded.webp | 5 | 5 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Hearing Aid | /applications/healthcare?system=hearing-aid | Pending | hearing-aid-technical-exploded.webp | 1 | 1 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Industrial Robots | /applications/industrial?system=industrial-robots | kuka-controller-cabinet.webp | industrial-robots-technical-exploded.webp | 1 | 1 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| 3D Printers | /applications/industrial?system=3d-printers | 3d-printers-exploded-view.webp | 3d-printers-technical-exploded.webp | 4 | 4 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Security Products | /applications/industrial?system=security-products | security-camera-disassembly.webp | security-products-technical-exploded.webp | 4 | 4 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Smart Meter | /applications/industrial?system=smart-meter | openzmeter-assembly.webp | smart-meter-technical-exploded.webp | 3 | 3 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| LED Lighting | /applications/industrial?system=led-lighting | led-lighting-exploded-view.webp | led-lighting-technical-exploded.webp | 2 | 2 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Thermostat | /applications/smart-home?system=thermostat | thermostat-disassembly.webp | thermostat-technical-exploded.webp | 3 | 3 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Smart Coffee Machine | /applications/smart-home?system=coffee-machine | coffee-machine-control-assembly.webp | coffee-machine-technical-exploded.webp | 4 | 4 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| Keyless Entry Door Lock | /applications/smart-home?system=door-lock | Pending | door-lock-technical-exploded.webp | 3 | 3 | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |

## FECS Series Summary hydration — 2026-11-25

- **Goal / Scope** Bind seven product family tables and Series overviews to FECS Summary API, preserving the live Applications work.
- **Status** VERIFIED
- **Baseline** main 9b33602, pre-change 4173 and ongoing Applications edits preserved. Before screenshots and generated worker archived.
- **Verification** Live 4173 serves production app.js?v=166. Seven families and 499 rows match the API by ID/path and display. Independently checked 63 before and 63 after screenshots at nine widths, mobile column labels, A4K PDF bytes, failed requests, and rapid navigation. Development and production builds and 24-route validations pass.
- **Regression** Home, product index and groups, six Applications, A4K/SCI0402C, Spec Search, Inquiry and Support browser checks passed. Existing Applications HTML and 16 assets matched the preview baseline. Existing PDF downloads, A4K search, I²R loss, SCI pagination, cart quantity and removal, and Support validation verified.
- **Performance** Viewport sample v166 requests one batch per family with zero per-row Facets/Detail calls. General EMC first visible row median 763 → 321 ms over five comparable navigations.
- **Open data issues** Three existing unmapped image/PDF pairs render the unavailable state. No outstanding frontend integration blocker.
- [Implementation report](C:/Users/sIn.jie/AppData/Local/FECS-Series-Summary-QA/IMPLEMENTATION_REPORT.md)
- **Last Updated** 2026-11-25 20:43:31 +08:00 (Asia/Singapore)

## Dynamic Series Detail and section visibility — 2026-11-25

- **Goal / Scope** General / Automotive 的共享 API 详情渲染、规格列、媒体、sticky 导航和询价。
- **Status** VERIFIED。4173 使用生产 app v170、CSS v167。
- **Completed** Tree 路由和规范身份驱动同一个详情模板。使用 FECS Summary 显示尺寸、零件数和工程范围。Series metadata、已验证媒体及全系列 Facets 决定显示内容。保留分页、筛选、搜索及跨页选中。I²R 与实测曲线各自展示。
- **Verification** 499 个活动系列与 6,334 个零件全量核对。独立 Chromium 40/40，补充浏览器 9/9，A4K / SCI0402C 各八个宽度，稀疏布局、单图纸、320 px 指针与键盘、真实 PDF 哈希及受控 GLB 通过。开发与生产各 24 条路由校验通过，32 个保护的 Applications 源码及资产 SHA-256 一致。
- **Blockers** 无。现有目录中的三个缺图及 PDF 系列和零零件系列按实际资料显示。GLB、后页专属字段和产品 PDF 的情形经受控夹具验证。
- **Next Steps** 本地交付与验收完成。
- [完整验收报告](C:/Users/sIn.jie/AppData/Local/FECS-Dynamic-Series-QA/VERIFICATION.md) · [FECS 任务状态](../Foundational-Electronics-Core-Systems/TASK_STATUS.md)
- **Last Updated** 2026-11-26 03:39:30 +08:00 (Asia/Singapore).
