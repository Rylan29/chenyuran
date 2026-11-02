/*
  作者：陈禹燃
  建立时间：2026-11-02 13:40
  使用模型：Kimi-K3
  功能名称：可复用 tab 选项卡组件
  功能简介：通过事件委托实现选项卡切换，点击时先清除组内所有选项卡与面板的选中状态，再设置当前元素的选中状态；支持同一页面多个选项卡组复用。
*/

/**
 * 功能：初始化页面上所有匹配选择器的选项卡组，为每组绑定一次点击事件（事件委托）
 * 作者：陈禹燃
 * 建立时间：2026-11-02 13:40
 * @param {string} cyr_containerSelector - 选项卡组容器的 CSS 选择器，默认 ".cyr_tabs"
 * @returns {void} 无返回值
 */
function CYR_initTabs(cyr_containerSelector) {
  var cyr_selector = cyr_containerSelector || ".cyr_tabs";
  var cyr_containers = document.querySelectorAll(cyr_selector);

  cyr_containers.forEach(function (cyr_container) {
    var cyr_btnBox = cyr_container.querySelector(".cyr_tab-btns");
    if (!cyr_btnBox) return;
    cyr_btnBox.addEventListener("click", function (cyr_event) {
      CYR_handleTabClick(cyr_event, cyr_container);
    });
  });
}

/**
 * 功能：处理选项卡点击——先清除当前组内所有按钮和面板的选中状态，再设置当前元素为选中
 * 作者：陈禹燃
 * 建立时间：2026-11-02 13:40
 * @param {Event} cyr_event - 点击事件对象
 * @param {HTMLElement} cyr_container - 当前选项卡组容器元素
 * @returns {void} 无返回值
 */
function CYR_handleTabClick(cyr_event, cyr_container) {
  var cyr_btn = cyr_event.target.closest(".cyr_tab-btn");
  if (!cyr_btn || !cyr_container.contains(cyr_btn)) return;

  // 1) 清除当前组内所有选项卡按钮与面板的选中状态
  cyr_container.querySelectorAll(".cyr_tab-btn").forEach(function (cyr_b) {
    cyr_b.classList.remove("cyr_active");
  });
  cyr_container.querySelectorAll(".cyr_tab-panel").forEach(function (cyr_p) {
    cyr_p.classList.remove("cyr_active");
  });

  // 2) 设置当前点击元素及其对应面板的选中状态
  cyr_btn.classList.add("cyr_active");
  var cyr_target = cyr_btn.getAttribute("data-cyr-target");
  var cyr_panel = cyr_container.querySelector('[data-cyr-panel="' + cyr_target + '"]');
  if (cyr_panel) cyr_panel.classList.add("cyr_active");
}

/* 页面加载完成后自动初始化（DOMContentLoaded 监听） */
document.addEventListener("DOMContentLoaded", function () {
  CYR_initTabs(".cyr_tabs");
});
