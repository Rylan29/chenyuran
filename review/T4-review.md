# T4 前端专项代码评审报告（随机小球生成）

| 项 | 内容 |
|---|---|
| 评审对象 | 任务 T4：随机小球生成、位置约束与出现动画 |
| 评审文件 | `js/game.js`、`index.html`、`css/style.css` |
| 评审方式 | 独立评审代理静态审查（只读）+ 主流程复核 |
| 评审维度 | 随机算法正确性、动画重触发手法、状态机联动、层叠与遮挡、命名与可读性 |
| 评审结论 | **可进入人工验证**（Critical 0 / Important 0 / Minor 3，均已处理） |

---

## 一、优点

1. 边界公式带 `Math.max(..., 0)` 保护，极小窗口不产生负坐标、不越界；距离约束按中心点语义计算并配 `Math.hypot`，正确。
2. 状态联动完备：`startGame` 生成、`finishGame` / `resetGame` 均隐藏，`cyr_lastBallX/Y` 在 `resetGame` 复位；`spawnBall` 先记录位置再显示，对 T5 换位复用友好。
3. 小球节点置于遮罩层之前，`hidden` 靠全局兜底规则可靠切换，无遮挡问题；`transform` 动画不参与布局，`overflow: hidden` 防溢出；命名全部合规。

## 二、问题清单与处理

| 级别 | 编号 | 问题 | 处理 |
|---|---|---|---|
| Minor | M-1 | `void offsetWidth` 强制回流发生在元素仍 `hidden`（display:none）时无效，当前仅靠「解除 hidden 触发渲染」才碰巧正确；T5 可见态换位将真正依赖该手法 | ✅ 已调整顺序：先 `hidden = false`，再「移除类 → 强制回流 → 加类」，为 T5 铺路 |
| Minor | M-2 | 兜底 20 次耗尽后可能返回违反距离约束的位置，属可接受降级但未注明 | ✅ 已补注释说明 |
| Minor | M-3 | dx/dy 两侧同加半径可相消，表达式冗长 | ✅ 已化简为 `cyr_x - cyr_lastBallX`（语义等价，注释说明） |

## 三、复核

- 调整后的 `cyr_spawnBall` 顺序：定位 → 记录 last 位置 → `hidden=false` → 重触发动画。T4 场景（首次出现）与 T5 场景（可见态换位）均能正确重启动画。
- 其余验收判定条件未受影响。

## 四、结论

Critical 0、Important 0、Minor 3（均已修复）。**T4 通过评审，进入人工页面验证。**
