/* 购物车 pages/cart/index(桌面版新增完整实现:源小程序该页为未实现占位)
 * 数据源 Cart(core/cart.js,localStorage 持久);render 直接读 Cart.list(),事件后 refresh()
 */
(function () {
  var DETAIL = '/pages/goods/details/index';
  var HOME = '/pages/home/home';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function toast(title) { wx.showToast({ title: title, icon: 'none', duration: 1200 }); }
  function money(v) { return '¥' + UP.fen(v); }

  /* ---------- 行渲染 ---------- */
  function rowHtml(it) {
    var spec = it.specText
      ? '<div class="cart-row__spec">' + esc(it.specText) + '</div>'
      : '';
    var sub = money(it.price * it.quantity);
    return '<div class="cart-row" data-key="' + esc(it.key) + '">' +
      '<div class="cart-ck' + (it.checked ? ' cart-ck--on' : '') + '" data-act="check"><i class="wr wr-check"></i></div>' +
      '<div class="cart-row__thumb" data-act="card"><img src="' + esc(it.thumb) + '" alt="" loading="lazy"/></div>' +
      '<div class="cart-row__info">' +
      '<div class="cart-row__head">' +
      '<div class="cart-row__title" data-act="card">' + esc(it.title) + '</div>' +
      '<div class="cart-row__del" data-act="del"><i class="wr wr-delete"></i>删除</div>' +
      '</div>' + spec +
      '<div class="cart-row__foot">' +
      '<div class="cart-row__price">' + money(it.price) + '</div>' +
      '<div class="cart-stepper">' +
      '<span class="cart-stepper__btn" data-act="minus"><i class="wr wr-minus"></i></span>' +
      '<span class="cart-stepper__num">' + it.quantity + '</span>' +
      '<span class="cart-stepper__btn" data-act="plus"><i class="wr wr-add"></i></span>' +
      '</div>' +
      '<div class="cart-row__sub">小计 <b>' + sub + '</b></div>' +
      '</div>' +
      '</div></div>';
  }

  function render() {
    var items = Cart.list();
    var html = '<div class="cart-page">';
    if (!items.length) {
      return '<div class="cart-page"><div class="cart-empty">' +
        '<div class="cart-empty__icon"><i class="wr wr-cartAdd"></i></div>' +
        '<div class="cart-empty__text">购物车还是空的,去挑点农家好物吧</div>' +
        '<div class="cart-empty__btn" data-act="go-shop">去逛逛</div>' +
        '</div></div>';
    }
    var checked = items.filter(function (it) { return it.checked; });
    var sum = checked.reduce(function (n, it) { return n + it.price * it.quantity; }, 0);
    var total = items.reduce(function (n, it) { return n + (Number(it.quantity) || 0); }, 0);
    html += '<div class="cart-toolbar">' +
      '<div class="cart-ck' + (Cart.allChecked() ? ' cart-ck--on' : '') + '" data-act="all"><i class="wr wr-check"></i></div>' +
      '<span class="cart-toolbar__txt">全选</span>' +
      '<span class="cart-toolbar__count">共 ' + total + ' 件</span>' +
      '</div>';
    html += '<div class="cart-list">' + items.map(rowHtml).join('') + '</div>';
    html += '<div class="cart-page__bar cart-bar">' +
      '<div class="cart-bar__sum"><span class="cart-bar__sum-label">合计:</span>' +
      '<span class="cart-bar__sum-num">' + money(sum) + '</span>' +
      '<span class="cart-bar__count">已选 ' + checked.length + ' 件</span></div>' +
      '<div class="cart-bar__btn' + (checked.length ? '' : ' cart-bar__btn--dim') + '" data-act="settle">去结算</div>' +
      '</div>';
    return html + '</div>';
  }

  function toCheckout() {
    var checked = Cart.checkedList();
    if (!checked.length) { toast('请先勾选商品'); return; }
    var req = checked.map(function (it) {
      return {
        quantity: it.quantity,
        storeId: it.storeId || '1',
        spuId: it.spuId,
        goodsName: it.title,
        skuId: it.skuId || '',
        available: 1,
        price: it.price,
        specInfo: (it.specInfo || []).map(function (s) {
          return { specTitle: s.specName || s.specTitle || '', specValue: s.specValue || '' };
        }).filter(function (s) { return s.specValue; }),
        primaryImage: it.thumb,
        thumb: it.thumb,
        title: it.title,
      };
    });
    var keys = checked.map(function (it) { return it.key; }).join(',');
    APP.go('/pages/order/order-confirm/index?goodsRequestList=' +
      encodeURIComponent(JSON.stringify(req)) + '&cartKeys=' + encodeURIComponent(keys), 'push');
  }

  function removeKey(key) {
    wx.showModal({
      title: '移除商品',
      content: '确定将该商品移出购物车吗?',
      confirmText: '移除',
      success: function (r) { if (r.confirm) { Cart.remove(key); inst.refresh(); } },
    });
  }

  var inst = null;
  function events(root) {
    inst = APP.instances['/pages/cart/index'];
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]');
      if (!t) return;
      var act = t.getAttribute('data-act');
      var row = t.closest('.cart-row');
      var key = row ? row.getAttribute('data-key') : '';
      if (act === 'all') {
        Cart.toggleAll(!Cart.allChecked());
        inst.refresh();
      } else if (act === 'check') {
        Cart.toggle(key, !(row && row.querySelector('.cart-ck').classList.contains('cart-ck--on')));
        inst.refresh();
      } else if (act === 'card') {
        var it = Cart.list().filter(function (x) { return x.key === key; })[0];
        if (it) APP.go(DETAIL + '?spuId=' + it.spuId, 'push');
      } else if (act === 'del') {
        removeKey(key);
      } else if (act === 'minus') {
        var m = Cart.list().filter(function (x) { return x.key === key; })[0];
        if (m && m.quantity <= 1) { removeKey(key); return; }
        Cart.setQty(key, (m ? m.quantity : 2) - 1);
        inst.refresh();
      } else if (act === 'plus') {
        var p = Cart.list().filter(function (x) { return x.key === key; })[0];
        if (p && p.quantity >= Math.min(99, Math.max(1, p.stockQty || 99))) { toast('已达可购上限'); return; }
        Cart.setQty(key, (p ? p.quantity : 1) + 1);
        inst.refresh();
      } else if (act === 'settle') {
        toCheckout();
      } else if (act === 'go-shop') {
        APP.go(HOME, 'tab');
      }
    });
  }

  APP.reg('/pages/cart/index', {
    title: '购物车',
    nav: 'default',
    data: {},
    init: function () { return this; },
    render: render,
    events: events,
  });
})();
