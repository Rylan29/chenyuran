# T3 前端专项代码评审报告

| 项 | 内容 |
|---|---|
| 评审对象 | T3 倒计时归零结算与重新开始 |
| 评审文件 | `js/game.js`、`index.html` |
| 评审方式 | 独立评审代理静态审查（只读）+ 主流程复核 |
| 评审维度 | 命名规范、可读性与可维护性、事件绑定合理性、状态机严谨性、定时器管理、DOM 引用与 hidden 切换、冒泡副作用 |
| 评审结论 | **可进入 T4**（Important 1 项已修复） |

---

## 一、优点

1. 状态机职责单一：`finishGame()` 只负责收尾与展示，`resetGame()` 只负责复位，`updateHud()` 统一刷新视图。
2. 定时器管理严谨：`finishGame()` 内 `clearInterval` 后立即将 `countdownTimerId` 置零，配合 `startGame()` 的 `IDLE` 守卫，不存在重复计时器。
3. 命名与注释准确，函数职责可一眼读出。

## 二、问题清单与处理

### Critical
- 无。

### Important

| 编号 | 问题 | 处理 |
|---|---|---|
| I-1 | `resetGame()` 未清理计时器、未复位 `countdownTimerId` 与 `startTimestamp`，形成对「只能从 finished 进入」的隐式耦合；若日后从其他路径调用会遗留运行中的计时器 | ✅ 已在 `resetGame()` 首部补 `clearInterval` + `countdownTimerId = 0` + `startTimestamp = 0` |

### Minor

| 编号 | 问题 | 处理 |
|---|---|---|
| M-1 | `finishGame()` / `resetGame()` 无状态守卫 | ⏸ 保留：两者当前仅由「归零」与「重新开始按钮」两条受控路径触发，加守卫属对未来调用方的防御性假设；计时器泄漏风险已由 I-1 的清理动作覆盖 |
| M-2 | `finalScore.textContent = score` 依赖隐式类型转换 | ✅ 已改为显式 `String(score)` |

## 三、事件冒泡专项结论（对 T6 的约束）

结算面板位于 `main#game-area` 内部，而 T6 会在 `game-area` 上做事件委托计分。评审确认：

- 点击「重新开始」时，**目标阶段**先执行 `resetGame()`（状态变为 `idle`），随后事件才冒泡到 `game-area`。
- 因此 T6 的委托处理器**必须**以 `gameState === 'running'` 作为前置守卫，此时不会扣分，属于安全路径。
- **不得**采用「只判断是否命中球 → 否则一律 −1」的写法，也不得依赖 `stopPropagation` 兜底，否则点击重新开始会被误扣 1 分。

该约束已同步记录到 T6 的实现要点，将在 T6 评审时重点核查。

## 四、结论

Critical 0 项、Important 1 项已修复、Minor 2 项中 1 项修复、1 项保留并说明理由。**T3 通过评审，可进入人工页面验证。**
