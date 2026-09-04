/* 搜索页 pages/goods/search/index ← t-search + 历史/热门词 + 删除确认 dialog
 * 行为:输入提交→结果页;点历史/热门词→结果页;清除/长按删除→confirm dialog
 */
(function () {
  var longPressTimer = null;
  var longPressFired = false;

  function chipHtml(list, act) {
    var h = '';
    for (var i = 0; i < list.length; i++) {
      h += '<span class="search-item" data-act="' + act + '" data-i="' + i + '">' + list[i] + '</span>';
    }
    return h;
  }

  function render() {
    var d = this.data;
    return '<div class="search-page">' +
      '<div class="t-search sp-search">' +
      '<div class="t-search__input-container">' +
      '<i class="wr wr-search t-search__left-icon"></i>' +
      '<input class="t-search__input" type="text" placeholder="iPhone12pro" value="" autofocus data-act="kw"/>' +
      '</div></div>' +
      '<div class="search-wrap">' +
      (d.historyWords.length ? '<div class="history-wrap">' +
        '<div class="search-header"><span class="search-title">历史搜索</span>' +
        '<span class="search-clear" data-act="clear">清除</span></div>' +
        '<div class="search-content">' + chipHtml(d.historyWords, 'hist') + '</div></div>' : '') +
      '<div class="popular-wrap">' +
      '<div class="search-header"><span class="search-title">热门搜索</span></div>' +
      '<div class="search-content">' + chipHtml(d.popularWords, 'popular') + '</div>' +
      '</div></div></div>';
  }

  function onTap(e) {
    var target = e.target.closest('[data-act]');
    if (!target) return;
    var inst = APP.instances['/pages/goods/search/index'];
    var act = target.getAttribute('data-act');
    var i = Number(target.getAttribute('data-i'));
    if (act === 'kw') {
      /* 输入框:首次点击时定位光标(autofocus 已做) */
    } else if (act === 'hist' || act === 'popular') {
      if (longPressFired) { longPressFired = false; return; }
      var list = act === 'hist' ? inst.data.historyWords : inst.data.popularWords;
      var v = list[i] || '';
      if (v) APP.go('/pages/goods/result/index?searchValue=' + encodeURIComponent(v), 'push');
    } else if (act === 'clear') {
      askDelete(inst, -1);
    }
  }

  /* 长按删除(等价 bindlongpress deleteCurr)与桌面右键等效 */
  function bindLongPress(root) {
    root.addEventListener('touchstart', function (e) {
      var t = e.target.closest('[data-act="hist"]');
      if (!t) return;
      longPressFired = false;
      longPressTimer = setTimeout(function () {
        longPressFired = true;
        askDelete(APP.instances['/pages/goods/search/index'], Number(t.getAttribute('data-i')));
      }, 500);
    }, { passive: true });
    root.addEventListener('touchend', function () { clearTimer(); });
    root.addEventListener('touchmove', function () { clearTimer(); });
    root.addEventListener('touchcancel', function () { clearTimer(); });
    root.addEventListener('contextmenu', function (e) {
      var t = e.target.closest('[data-act="hist"]');
      if (!t) return;
      e.preventDefault();
      askDelete(APP.instances['/pages/goods/search/index'], Number(t.getAttribute('data-i')));
    });
  }
  function clearTimer() {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
  }

  /* 删除确认(源码 t-dialog:同文案) */
  function askDelete(inst, index) {
    var isAll = index < 0;
    var message = isAll ? '确认删除所有历史记录' : '确认删除当前历史记录';
    wx.showModal({ title: '', content: message, confirmText: '确定', cancelText: '取消', showCancel: true })
      .then(function (r) {
        if (!r.confirm) return;
        if (isAll) {
          inst.setData({ historyWords: [] });
        } else {
          var arr = inst.data.historyWords.slice();
          arr.splice(index, 1);
          inst.setData({ historyWords: arr });
        }
      });
  }

  /* 键盘提交(等价 handleSubmit) */
  function onKeyDown(e) {
    if (e.key !== 'Enter') return;
    var value = (e.target.value || '').trim();
    if (!value.length) return;
    APP.go('/pages/goods/result/index?searchValue=' + encodeURIComponent(value), 'push');
  }

  APP.reg('/pages/goods/search/index', {
    title: '搜索',
    nav: 'default',
    data: { historyWords: [], popularWords: [], searchValue: '' },
    init: function () {
      var inst = this;
      return SVC.fetchSearchHistory().then(function (res) {
        inst.setData({
          historyWords: res.historyWords || [],
          popularWords: res.popularWords || [],
        });
        return inst;
      });
    },
    render: render,
    events: function (root) {
      root.addEventListener('click', onTap);
      root.addEventListener('keydown', onKeyDown);
      bindLongPress(root);
    },
  });
})();
