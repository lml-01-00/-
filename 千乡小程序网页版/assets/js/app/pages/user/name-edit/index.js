/* 昵称编辑页 pages/user/name-edit/index ← 源 name-edit(index.js/wxml/wxss)
 * query name 回填;保存(有内容才可点)→ 写 storage('userNick') 供个人资料 onShow 回显 → back
 * 源 onSubmit 仅 navigateBack(backRefresh 无实际回显),web 端补齐昵称落地
 */
(function () {
  var instRef = null;
  function render() {
    var d = this.data;
    return '<div class="ne-page">' +
      '<div class="ne-form">' +
      '<input class="ne-input" id="neNameInput" value="' + d.nameValue.replace(/"/g, '&quot;') + '" placeholder="请输入文字" maxlength="15"/>' +
      (d.nameValue ? '<i class="wr wr-close ne-clear" data-act="clear" style="font-style:normal"></i>' : '') +
      '</div>' +
      '<div class="ne-desc">最多可输入15个字</div>' +
      '<div class="ne-submit-wrap">' +
      '<div class="ne-submit' + (d.nameValue ? '' : ' disabled') + '" data-act="sure">保存</div></div>' +
      '</div>';
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'clear') {
      instRef.data.nameValue = '';
      instRef.refresh();
      var inp = document.getElementById('neNameInput');
      if (inp) setTimeout(function () { inp.focus(); }, 0);
    } else if (act === 'sure') {
      var v = ((document.getElementById('neNameInput') || {}).value || '').trim();
      if (!v) return;
      instRef.data.nameValue = v;
      wx.setStorageSync('userNick', v);
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(function () { APP.back(1); }, 400);
    }
  }
  function onInput(e) {
    var v = e.target.value;
    var btn = document.querySelector('.ne-submit');
    var has = !!v;
    instRef.data.nameValue = v;
    if (btn && v !== '') btn.classList.remove('disabled');
    // 清空时重绘以显示 clear icon
    if (v === '') instRef.refresh();
  }

  APP.reg('/pages/user/name-edit/index', {
    title: '昵称',
    nav: 'default',
    reinitOnQuery: true,
    data: { nameValue: '' },
    init: function (query) {
      var inst = this;
      instRef = inst;
      inst.data.nameValue = (query && query.name) || '';
      return inst;
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
      root.addEventListener('input', onInput);
    },
  });
})();
