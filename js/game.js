/**
 * 抓小球小游戏 — 游戏逻辑
 *
 * 命名约定：所有变量与函数以 cyr_ 开头；大写常量以 CYR_ 开头。
 * 组织顺序：常量 → DOM 引用 → 游戏状态 → 初始化 → 开始游戏 → 倒计时
 *           → 结算与重新开始 → 小球生成 → 状态栏刷新
 * 当前进度：T1–T4 已完成（骨架、开始与倒计时、结算与重新开始、小球生成）；
 *          计分逻辑在 T5 / T6 引入，resize 适配在 T7 引入。
 */
(function () {
  'use strict';

  /* ---------------- 常量 ---------------- */
  const CYR_GAME_DURATION_SECONDS = 120;
  const CYR_BALL_SIZE = 60;
  // 随机位置最多尝试次数：防止极小窗口下满足距离约束的循环无法退出
  const CYR_MAX_POSITION_ATTEMPTS = 20;

  /* ---------------- DOM 引用 ---------------- */
  const cyr_scoreDisplay = document.getElementById('cyr_score-display');
  const cyr_timerDisplay = document.getElementById('cyr_timer-display');
  const cyr_gameArea = document.getElementById('cyr_game-area');
  const cyr_ball = document.getElementById('cyr_ball');
  const cyr_guide = document.getElementById('cyr_guide');
  const cyr_startButton = document.getElementById('cyr_start-button');
  const cyr_resultPanel = document.getElementById('cyr_result-panel');
  const cyr_finalScore = document.getElementById('cyr_final-score');
  const cyr_restartButton = document.getElementById('cyr_restart-button');

  /* ---------------- 游戏状态 ---------------- */
  const CYR_STATE = {
    IDLE: 'idle',
    RUNNING: 'running',
    FINISHED: 'finished',
  };

  let cyr_gameState = CYR_STATE.IDLE;
  let cyr_score = 0;
  let cyr_remainingSeconds = CYR_GAME_DURATION_SECONDS;
  let cyr_startTimestamp = 0;
  let cyr_countdownTimerId = 0;
  // 上一位置（左上角坐标，px）：用于随机换位时保证与旧位置的中心距离
  let cyr_lastBallX = null;
  let cyr_lastBallY = null;

  /* ---------------- 初始化 ---------------- */
  function cyr_init() {
    cyr_startButton.addEventListener('click', cyr_startGame);
    cyr_restartButton.addEventListener('click', cyr_resetGame);
    document.addEventListener('visibilitychange', cyr_handleVisibilityChange);
    // 事件委托：所有游戏区内点击经此分流（T5 点球得分 / T6 点空白扣分）
    cyr_gameArea.addEventListener('click', cyr_handleAreaClick);
    cyr_updateHud();
  }

  // 后台标签页中定时器会被浏览器节流，回到前台时立即校正一次显示与状态
  function cyr_handleVisibilityChange() {
    if (!document.hidden && cyr_gameState === CYR_STATE.RUNNING) {
      cyr_updateCountdown();
    }
  }

  /* ---------------- 开始游戏 ---------------- */
  function cyr_startGame() {
    if (cyr_gameState !== CYR_STATE.IDLE) {
      return;
    }

    cyr_gameState = CYR_STATE.RUNNING;
    cyr_score = 0;
    cyr_remainingSeconds = CYR_GAME_DURATION_SECONDS;
    cyr_startTimestamp = Date.now();
    cyr_guide.hidden = true;

    cyr_spawnBall();
    cyr_updateHud();
    cyr_countdownTimerId = window.setInterval(cyr_updateCountdown, 1000);
  }

  /* ---------------- 倒计时 ---------------- */
  // 以起始时间戳反推剩余秒数，而非累加计数，避免 setInterval 的累积误差与后台节流影响
  function cyr_updateCountdown() {
    const cyr_elapsedSeconds = Math.floor((Date.now() - cyr_startTimestamp) / 1000);
    cyr_remainingSeconds = Math.max(CYR_GAME_DURATION_SECONDS - cyr_elapsedSeconds, 0);

    cyr_updateHud();

    if (cyr_remainingSeconds === 0) {
      cyr_finishGame();
    }
  }

  /* ---------------- 结算与重新开始 ---------------- */
  // 时间到：停止计时，进入 finished 状态并展示最终分数
  function cyr_finishGame() {
    window.clearInterval(cyr_countdownTimerId);
    cyr_countdownTimerId = 0;
    cyr_gameState = CYR_STATE.FINISHED;

    cyr_ball.hidden = true;
    cyr_finalScore.textContent = String(cyr_score);
    cyr_resultPanel.hidden = false;
  }

  // 重新开始：恢复到未开始状态，分数与时间双双归位
  function cyr_resetGame() {
    window.clearInterval(cyr_countdownTimerId);
    cyr_countdownTimerId = 0;
    cyr_startTimestamp = 0;

    cyr_score = 0;
    cyr_remainingSeconds = CYR_GAME_DURATION_SECONDS;
    cyr_gameState = CYR_STATE.IDLE;

    cyr_ball.hidden = true;
    cyr_lastBallX = null;
    cyr_lastBallY = null;
    cyr_resultPanel.hidden = true;
    cyr_guide.hidden = false;

    // 清掉残留飘字：防止 reset 后 0.7s 动画未播完的旧飘字短暂出现在新游戏
    cyr_gameArea.querySelectorAll('.cyr_score-popup').forEach(function cyr_cleanPopups(cyr_popup) {
      cyr_popup.remove();
    });

    cyr_updateHud();
  }

  /* ---------------- 小球生成 ---------------- */
  // 在游戏区内随机生成一个不越界的位置；若存在上一位置，则尽量保证中心距离不小于球直径
  function cyr_randomBallPosition() {
    const cyr_maxX = Math.max(cyr_gameArea.clientWidth - CYR_BALL_SIZE, 0);
    const cyr_maxY = Math.max(cyr_gameArea.clientHeight - CYR_BALL_SIZE, 0);

    let cyr_x = 0;
    let cyr_y = 0;

    for (let cyr_attempt = 0; cyr_attempt < CYR_MAX_POSITION_ATTEMPTS; cyr_attempt++) {
      cyr_x = Math.random() * cyr_maxX;
      cyr_y = Math.random() * cyr_maxY;

      if (cyr_lastBallX === null) {
        break;
      }

      // 中心距离约束：等价于左上角坐标差（半径相消）；尝试耗尽后接受当前解，属可接受降级
      const cyr_dx = cyr_x - cyr_lastBallX;
      const cyr_dy = cyr_y - cyr_lastBallY;

      if (Math.hypot(cyr_dx, cyr_dy) >= CYR_BALL_SIZE) {
        break;
      }
    }

    return { x: cyr_x, y: cyr_y };
  }

  // 显示小球：随机定位并播放出现动画
  function cyr_spawnBall() {
    const cyr_position = cyr_randomBallPosition();

    cyr_lastBallX = cyr_position.x;
    cyr_lastBallY = cyr_position.y;
    cyr_ball.style.left = cyr_position.x + 'px';
    cyr_ball.style.top = cyr_position.y + 'px';

    // 先解除隐藏（display:none 期间强制回流无效），再重触发动画，保证可见态换位时动画也能重启
    cyr_ball.hidden = false;
    cyr_ball.classList.remove('cyr_ball--in');
    void cyr_ball.offsetWidth;
    cyr_ball.classList.add('cyr_ball--in');
  }

  /* ---------------- T5 / T6 事件委托 ---------------- */
  // 游戏区内点击统一入口：首行状态守卫，target 分流到 T5 点球 / T6 点空白
  function cyr_handleAreaClick(event) {
    // 只有游戏进行中才处理，结算与引导层点击一律忽略（含重新开始按钮冒泡）
    if (cyr_gameState !== CYR_STATE.RUNNING) {
      return;
    }

    if (event.target === cyr_ball) {
      cyr_onBallHit();
    } else {
      cyr_onMiss(event);
    }
  }

  // 点中球：+2、换位、飘字
  function cyr_onBallHit() {
    cyr_score += 2;
    cyr_updateHud();

    // 飘字定位用球当前的 offsetLeft/offsetTop（换位前取值，保证飘字在原地而非新位置）
    const cyr_popX = cyr_ball.offsetLeft + CYR_BALL_SIZE / 2;
    const cyr_popY = cyr_ball.offsetTop;
    cyr_spawnScorePopup('+2', cyr_popX, cyr_popY, false);

    cyr_spawnBall();
  }

  // 点空白：−1、球不动、红色飘字
  function cyr_onMiss(event) {
    cyr_score -= 1;
    cyr_updateHud();

    // 飘字定位用点击坐标（相对 game-area）：clientX/Y 减去 game-area 自身偏移
    const cyr_gameAreaRect = cyr_gameArea.getBoundingClientRect();
    const cyr_popX = event.clientX - cyr_gameAreaRect.left;
    const cyr_popY = event.clientY - cyr_gameAreaRect.top;
    cyr_spawnScorePopup('-1', cyr_popX, cyr_popY, true);
  }

  // 创建得分飘字：动画结束后自动从 DOM 移除，避免累积
  // cyr_isMiss 区分命中（蓝色 +2）与未命中（红色 −1），CSS 用 --miss 变体覆盖颜色
  function cyr_spawnScorePopup(cyr_text, cyr_centerX, cyr_centerY, cyr_isMiss) {
    const cyr_popup = document.createElement('span');
    cyr_popup.className = 'cyr_score-popup' + (cyr_isMiss ? ' cyr_score-popup--miss' : '');
    cyr_popup.textContent = cyr_text;

    // 相对游戏区定位：left/top 坐标由 JS 直接写入，水平居中由 CSS 的 translateX(-50%) 实现
    cyr_popup.style.left = cyr_centerX + 'px';
    cyr_popup.style.top = cyr_centerY + 'px';

    // 动画结束后移除节点（比 setTimeout 更可靠：动画时长改了不会失同步）
    cyr_popup.addEventListener('animationend', function cyr_removePopup() {
      cyr_popup.removeEventListener('animationend', cyr_removePopup);
      cyr_popup.remove();
    });

    cyr_gameArea.appendChild(cyr_popup);
  }

  /* ---------------- 状态栏刷新 ---------------- */
  function cyr_updateHud() {
    cyr_scoreDisplay.textContent = '分数：' + cyr_score;
    cyr_timerDisplay.textContent = cyr_formatTime(cyr_remainingSeconds);
  }

  function cyr_formatTime(cyr_totalSeconds) {
    const cyr_minutes = Math.floor(cyr_totalSeconds / 60);
    const cyr_seconds = cyr_totalSeconds % 60;
    return cyr_minutes + ':' + (cyr_seconds < 10 ? '0' : '') + cyr_seconds;
  }

  cyr_init();
})();
