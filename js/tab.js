/*
  作者：陈禹燃
  建立时间：2026-11-02 14:25
  使用模型：Kimi-K3
  功能名称：可复用 Tab 选项卡类
  功能简介：封装为 ES6 Tab 类，通过 addEventListener 监听 tab 按钮点击，切换时先清除所有 active 选中状态再给当前元素加 active；支持页面多实例复用。
*/

/**
 * Tab 可复用选项卡类
 * 作者：陈禹燃
 * 建立时间：2026-11-02 14:25
 *
 * 使用方式：
 *   new Tab('#tabs1');
 *   new Tab('#tabs2', { activeClass: 'my-active' });
 *
 * @param {string|HTMLElement} container - 选项卡容器（选择器或 DOM 元素）
 * @param {Object} [options] - 配置对象（可选）
 * @param {string} [options.btnSelector='.cyr_tab-btn']    - 按钮选择器
 * @param {string} [options.panelSelector='.cyr_tab-panel'] - 面板选择器
 * @param {string} [options.activeClass='cyr_active']      - 选中态类名
 */
class Tab {
  constructor(container, options) {
    /** @type {HTMLElement} */
    this.container = typeof container === "string"
      ? document.querySelector(container)
      : container;

    this.options = Object.assign({
      btnSelector: ".cyr_tab-btn",
      panelSelector: ".cyr_tab-panel",
      activeClass: "cyr_active"
    }, options || {});

    if (!this.container) return;
    this._bind();
  }

  /**
   * 功能：为每个按钮绑定 addEventListener 点击事件
   * 作者：陈禹燃
   * 建立时间：2026-11-02 14:25
   * @returns {void}
   */
  _bind() {
    var cyr_btns = this.container.querySelectorAll(this.options.btnSelector);
    var self = this;
    cyr_btns.forEach(function (cyr_btn) {
      cyr_btn.addEventListener("click", function () {
        self.switchTo(cyr_btn);
      });
    });
  }

  /**
   * 功能：切换到指定按钮——先清除所有 active 选中状态，再给当前元素加 active
   * 作者：陈禹燃
   * 建立时间：2026-11-02 14:25
   * @param {HTMLElement} cyr_btn - 被点击的 tab 按钮元素
   * @returns {void}
   */
  switchTo(cyr_btn) {
    var cyr_btnTarget = cyr_btn.getAttribute("data-cyr-target");
    var cls = this.options.activeClass;

    // 1) 清除所有按钮的选中状态
    this.container.querySelectorAll(this.options.btnSelector).forEach(function (b) {
      b.classList.remove(cls);
    });
    // 2) 清除所有面板的选中状态
    this.container.querySelectorAll(this.options.panelSelector).forEach(function (p) {
      p.classList.remove(cls);
    });
    // 3) 给当前按钮加选中状态
    cyr_btn.classList.add(cls);
    // 4) 给对应面板加选中状态
    var cyr_panel = this.container.querySelector(
      '[data-cyr-panel="' + cyr_btnTarget + '"]'
    );
    if (cyr_panel) cyr_panel.classList.add(cls);
  }
}
