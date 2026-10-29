# T5 前端专项代码评审报告（点中球 +2 · 换位 · 得分飘字）

| 项 | 内容 |
|---|---|
| 评审对象 | 任务 T5：点中球 +2 分、球换位、+2 飘字动画 |
| 评审文件 | `js/game.js` / `css/style.css` |
| 评审方式 | 独立评审代理静态审查（只读）+ 主流程修复复核 |
| 评审维度 | 事件委托正确性、飘字回收机制、飘字定位坐标系、命名合规/T6 共存 |
| 评审结论 | **可进入人工验证**（Critical 0 / Important 1 已修复 / Minor 2：1 修复 + 1 保留并说明理由） |

---

## 一、优点

1. 事件委托单绑定点：只在 `#cyr_game-area` 绑一次 click，首行状态守卫 `if (cyr_gameState !== CYR_STATE.RUNNING) return;` 杜绝结算面板冒泡误触发；`event.target === cyr_ball` 严格相等分流，不用 `stopPropagation`。
2. 飘字回收可靠：`animationend` 回调先 `removeEventListener` 再 `.remove()`，比 `setTimeout` 更抗动画时长变更；换位前取球 `offsetLeft + CYR_BALL_SIZE/2`，保证飘字出现在**原点击位置**而非球的新位置。
3. 视觉/交互细节到位：`.cyr_score-popup` 加 `pointer-events: none` 防飘字抢点击、`z-index: 10` 防新球遮挡飘字、`translateX(-50%)` 全程居中。

## 二、问题清单与处理

| 级别 | 编号 | 问题 | 处理 |
|---|---|---|---|
| Important | I-1 | `cyr_resetGame()` 未清理飘字 DOM：若游戏 0.7s 飘字动画未播完即 reset → start，旧飘字短暂出现在新游戏 | ✅ 已修复：reset 末尾加 `cyr_gameArea.querySelectorAll('.cyr_score-popup').forEach(p => p.remove())` |
| Minor | M-1 | L202 注释「无需 CSS 再转换」措辞不准——CSS 仍有 `translateX(-50%)` 居中 | ✅ 已修正为「left/top 坐标由 JS 直接写入，水平居中由 CSS 的 translateX(-50%) 实现」 |
| Minor | M-2 | 飘字 top 取球顶而非球中心上方，球中心上方视觉更佳 | ❌ 保留：需求未指定飘字起始 y，球顶上方 36px 视觉上已足够，改动无必要 |

## 三、复核

- `cyr_resetGame` 的飘字清理同时覆盖「时间到 → 结算面板 → 重新开始」和「运行中直接点重开（虽然按钮在结算面板里）」两条路径。
- 飘字定位：left 用球中心横坐标（`offsetLeft + size/2`）经 `translateX(-50%)` 水平居中，top 用球顶，组合正确。
- T6 else 留空注释清晰，无冗余。

## 四、结论

Critical 0、Important 1 已修复、Minor 1 修复 + 1 保留说明。**T5 通过评审，进入人工页面验证。**
