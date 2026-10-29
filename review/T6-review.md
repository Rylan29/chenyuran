# T6 前端专项代码评审报告（点空白 −1 · 区域边界）

| 项 | 内容 |
|---|---|
| 评审对象 | 任务 T6：点空白 −1 分、红色飘字、球不动、区域边界守卫 |
| 评审文件 | `js/game.js` / `css/style.css` |
| 评审方式 | 独立评审代理静态审查（只读）+ 主流程修复复核 |
| 评审维度 | 事件委托 else 分支、飘字定位坐标系、颜色区分、区域边界覆盖、reset 清理覆盖 |
| 评审结论 | **可进入人工验证**（Critical 1 已修复；其余全绿） |

---

## 一、优点

1. 两套坐标系自洽：点球用 `offsetLeft/Top`（相对 game-area），点空白用 `clientX/Y - gameArea.getBoundingClientRect()` 映射到 game-area，飘字 `position: absolute` 以 game-area 为参考系，无误。
2. 状态守卫在委托首行，正确拦截结算面板冒泡与面板覆盖时的误操作；结算面板 hidden 时本身不占点击，面板可见时游戏已 finished，守卫双重保险。
3. `.cyr_score-popup--miss` 仅覆盖 `color` 变量，动画 keyframes 用 transform/opacity，互不干扰；CSS 变量命名合规。
4. `resetGame` 用 `querySelectorAll('.cyr_score-popup')` 选全类（含 miss 子类），清理无遗漏。

## 二、问题清单与处理

| 级别 | 编号 | 问题 | 处理 |
|---|---|---|---|
| Critical | C-1 | `cyr_handleAreaClick` L185 调 `cyr_onMiss()` 漏传 `event` 参数，L209 `event.clientX` 将抛 TypeError，扣分逻辑完全不可用 | ✅ 已修复：改为 `cyr_onMiss(event)` |

## 三、复核

- 两套飘字定位坐标系：点球用球 `offsetLeft + size/2`（JS 写内联 left）经 `translateX(-50%)` 水平居中；点空白用点击坐标经 `getBoundingClientRect()` 转换后直接写入——均以 game-area 为祖先，自洽。
- 状态守卫前置 `if (cyr_gameState !== CYR_STATE.RUNNING) return;` 覆盖：结算面板（finished 状态）、引导层（idle 状态）、重开按钮（冒泡到 game-area 时 finished/idle 守卫拦截）。

## 四、结论

Critical 1 已修复，Important/Minor 均为 0。**T6 通过评审，进入人工页面验证。**
