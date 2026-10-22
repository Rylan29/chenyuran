# T2 前端专项代码评审报告

| 项 | 内容 |
|---|---|
| 评审对象 | T2 开始按钮、状态机与 120 秒倒计时 |
| 评审文件 | `js/game.js`、`index.html` |
| 评审方式 | 独立评审代理静态审查（只读）+ 主流程复核 |
| 评审维度 | 命名规范、可读性与可维护性、JS 事件机制与绑定合理性、状态机严谨性、定时器管理、潜在缺陷与边界、与 spec 一致性 |
| 评审结论 | **可进入 T3**（Important 1 项已修复） |

---

## 一、优点

1. 结构与分区清晰（常量 → DOM → 状态 → 初始化 → 开始 → 倒计时 → 状态栏刷新），函数职责单一。
2. 时间戳校准公式正确：`Math.floor((Date.now() - startTimestamp) / 1000)` 配 `Math.max(..., 0)`，无累加漂移、无负数、无 off-by-one。
3. 状态守卫严谨：`startGame()` 首行 `gameState !== STATE.IDLE` 直接返回，快速双击不会启动第二个计时器。
4. 归零路径有 `clearInterval`，并同步置为 `finish` 状态，为 T3 的结算留好了状态入口。
5. IIFE + `'use strict'`，无全局变量污染。

## 二、问题清单与处理

### Critical
- 无。

### Important

| 编号 | 问题 | 处理 |
|---|---|---|
| I-1 | 显示刷新与 `finished` 收敛完全依赖 interval 回调；后台标签页被节流时界面会停留旧值，归零切换最多延迟一个节流周期 | ✅ 已新增 `visibilitychange` 监听，回到前台时立刻调用一次 `updateCountdown()` 校正显示与状态 |

### Minor

| 编号 | 问题 | 处理 |
|---|---|---|
| M-1 | 顶层直接取 DOM 引用，未包 `DOMContentLoaded` | ⏸ 保留：脚本位于 `</body>` 之前，DOM 必然就绪；提前包裹反而需要额外的延迟绑定与空值处理 |
| M-2 | `formatTime` 使用 `String.padStart`（ES2017），与 spec 声明的 ES6 口径不一致 | ✅ 已改写为 `(seconds < 10 ? '0' : '') + seconds`，消除版本口径差异 |
| M-3 | `0:00` 可能比真实 120 秒晚 ≤1 秒 | ⏸ 保留：间隔驱动只会晚不会早，误差在验收标准（≤1 秒）之内 |
| M-4 | plan 中 T2 常量含 `BALL_SIZE`，本文件未定义 | ⏸ 属 T4 范畴，已在 T2 交付说明中记录，T4 补入 |

## 三、修复后复核

- 新增的 `visibilitychange` 处理只在 `running` 状态下生效，不会干扰 `idle` / `finished` 状态。
- `updateCountdown()` 沿用同一归零逻辑，回到前台时同样能立即收敛到 `finished`。
- 上述修复未改变 T2 验收清单 1–6 条的判定条件。

## 四、结论

Critical 0 项、Important 1 项已修复、Minor 4 项中 1 项修复、3 项保留并说明理由。**T2 通过评审，可进入人工页面验证。**
