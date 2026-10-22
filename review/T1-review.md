# T1 前端专项代码评审报告

| 项 | 内容 |
|---|---|
| 评审对象 | T1 页面骨架与静态视觉 |
| 评审文件 | `index.html`、`css/style.css` |
| 评审方式 | 独立评审代理静态审查（只读，不改文件）+ 主流程复核 |
| 评审维度 | 命名规范、可读性、CSS 冗余、Flex/Grid 布局规范性、HTML 语义与可访问性、兼容性隐患、潜在缺陷 |
| 评审结论 | **需修改后进入下一任务** → 修复后 **可进入 T2** |

---

## 一、优点

1. 语义化结构清晰：`header.status-bar` / `main.game-area` / `section.result-panel`，按钮均为原生 `<button type="button">`，具备基本可访问性。
2. 三文件分离，零第三方资源引用；`viewport` meta、`font-family: inherit` 等基础细节齐备。
3. CSS 变量统一管理配色与关键尺寸，改色成本低。
4. `font-variant-numeric: tabular-nums` 避免倒计时数字变化导致的文本宽度抖动。
5. 按钮 `min-height: 44px` 满足触屏点击热区要求，hover / active / focus-visible 三态反馈完整。

## 二、问题清单与处理

### Critical
- 无。

### Important（进入下一任务前必须处理）

| 编号 | 问题 | 处理 |
|---|---|---|
| I-1 | `.guide` 与 `.result-panel` 重复 8 条定位与居中声明，属实质冗余 | ✅ 已抽取公共基类 `.overlay`，`.guide` 仅保留 `gap`，`.result-panel` 仅保留 `gap` 与背景色 |
| I-2 | `html, body { height: 100% }` 在移动端地址栏伸缩时视口计算不准，叠加 `overflow: hidden` 易裁切内容 | ✅ 已在 `@supports (height: 100dvh)` 中改用 `100dvh`，不支持的内核自动回退 `100%` |
| I-3 | `.guide` 同为 absolute + flex，T2/T3 用 `hidden` 切换时会与 `.result-panel` 重演 `hidden` 失效问题 | ✅ 已改为全局 `[hidden] { display: none !important; }` 统一兜底，并删除原先仅针对结算面板的补丁规则 |

### Minor（记录，酌情处理）

| 编号 | 问题 | 处理 |
|---|---|---|
| M-1 | `--ball-size` 在 T1 未被引用（T4 才使用） | ✅ 保留：该变量是 spec §5 明确的设计令牌，T4 立即使用，删除后还要再加回来 |
| M-2 | 媒体查询内直接写 `height: 56px` 而非修改变量 | ✅ 已改为在媒体查询内覆写 `--status-bar-height: 56px`，保持单一数据源 |
| M-3 | `inset: 0` 需 Safari ≥ 14.1 | ⏸ 保留：目标浏览器为「近两个大版本」的现代浏览器，Safari 14.1（2021 年）已在范围内 |
| M-4 | `.button` 为通用块名，易与他人样式冲突 | ✅ 已重命名为 `.btn`（HTML 与 CSS 同步） |
| M-5 | `.game-area { user-select: none }` 会连带禁用引导文案的文本选中 | ⏸ 保留：游戏进行中防止连点选中文本的收益更高；引导文案无需被复制 |

## 三、修复后复核

- 修复项均未改变 T1 的可验收行为，未引入新的样式层叠冲突。
- `[hidden]` 统一兜底后，`.overlay` 的 `display: flex` 不再有覆盖 `hidden` 的风险。
- 修复后的 T1 仍满足原验收清单 1–6 条，无需回退任何需求。

## 四、结论

Critical 0 项、Important 3 项已全部修复、Minor 5 项中 3 项修复、2 项保留并说明理由。**T1 通过评审，可进入人工页面验证。**
