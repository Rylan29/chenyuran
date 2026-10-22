# i5 前端专项代码评审报告（移动端底部导航 · 字体图标版）

| 项 | 内容 |
|---|---|
| 评审对象 | 任务 i5：iconfont-3.html 移动端固定底部导航（Font Awesome 字体方案） |
| 评审文件 | `iconfont-3.html`（抽查 `cdn/fontawesome/css/all.min.css` 确认 4 个图标类有效） |
| 评审方式 | 独立评审代理静态审查（只读）+ 主流程复核 |
| 评审维度 | fixed 定位与安全区、flex 等宽、角标实现、语义与可访问性、命名合规、离线可用性 |
| 评审结论 | **可进入人工验证**（Critical 0 / Important 0 / Minor 3：1 修复 + 1 修复 + 1 保留） |

---

## 一、优点

1. fixed 布局规范：`bottom/left/right` 全 0，高度含 `env(safe-area-inset-bottom)`；`flex: 1 1 0` 实现严格等宽；图标容器 relative + 角标 absolute 定位干净，红点用 `--dot` 修饰符复用良好。
2. 可访问性达标：`nav` + `aria-label`、激活态颜色与 `aria-current="page"` 双通道、装饰性图标与红点 `aria-hidden`。
3. 命名全合规（`cyr_` 前缀，`fa-*` 库专用未污染）；仅本地相对路径引用，无 JS，`file://` 离线可用。

## 二、问题清单与处理

| 级别 | 编号 | 问题 | 处理 |
|---|---|---|---|
| Minor | M-1 | viewport 缺 `viewport-fit=cover`，`env()` 在 iOS 上恒为 0，安全区代码形同虚设；且内容区 padding 未随安全区联动，iPhone 下最后卡片会被遮约 2px | ✅ 已补 `viewport-fit=cover`，内容区 padding 改为 `calc(56px + env(...) + 16px)` 联动 |
| Minor | M-2 | `.cyr_badge` 的 `font-style: normal` 作用于 `<span>`，属防御性冗余 | ✅ 保留（为将来把徽章换回 `<i>`/斜体上下文兜底，成本一行注释内） |
| Minor | M-3 | 四个导航项未定制 `:focus-visible`（UA 默认 outline 尚可） | ✅ 已与返回链接合并为统一键盘焦点样式，保持项目一致性 |

## 三、复核

- 三处修改均为样式/元信息层面，未触及结构与语义。
- `fa-house` / `fa-comment-dots` / `fa-cart-shopping` / `fa-user` 均为 FA 6.x Free 有效类名。

## 四、结论

Critical 0、Important 0、Minor 3（2 修复、1 保留说明）。**i5 通过评审，进入人工页面验证。**
