/* 优惠券详情页 pages/coupon/coupon-detail/index ← 源 coupon-detail(index.js/wxml/wxss) + coupon-card/ui-coupon-card
 * 顶部白卡(couponDTO=detail)+ 规则说明/有效时间/适用范围/使用须知 单元格组 + 底部 查看可用商品 → coupon-activity-goods?id
 * 注意:detail 的 type 已被源服务归一成 'price'/'discount' 字符串 → 卡左金额区按源逻辑为空(1:1 保留,视觉同源)
 * 卡点击源 gotoDetail 跳自身(同 url 再次 push),web 亦保留;去使用 → 活动商品页
 */
(function () {
  var instRef = null;
  var instId = null;
  var CARD_PATH = '/pages/coupon/coupon-detail/index';
  function leftHtml(c) {
    if (c.type === 2) {
      return '<div class="cp-val cp-val--zk">' + c.value + '</div>' +
        '<div class="cp-unit">折</div>' +
        (c.desc ? '<div class="cp-ldesc">' + c.desc + '</div>' : '');
    }
    if (c.type === 1) {
      return '<div class="cp-val">' + (Number(c.value) / 100) + '</div>' +
        '<div class="cp-unit">元</div>' +
        (c.desc ? '<div class="cp-ldesc">' + c.desc + '</div>' : '');
    }
    if (c.type === 3) {
      return '<div class="cp-val cp-val--free">免邮</div>' + (c.desc ? '<div class="cp-ldesc">' + c.desc + '</div>' : '');
    }
    if (c.type === 4) {
      return '<img class="cp-gift" src="' + (c.image || '') + '" alt="" onerror="this.style.display=\'none\'"/>';
    }
    return '';
  }
  function couponCardHtml(c) {
    var useless = c.status === 'useless' || c.status === 'disabled';
    return '<div class="cp-card' + (useless ? ' cp-card--weak' : '') + '" data-key="' + c.key + '">' +
      '<div class="cp-left">' + leftHtml(c) + '</div>' +
      '<div class="cp-right">' +
      '<div class="cp-rt">' +
      (c.title ? '<div class="cp-title">' + c.title + '</div>' : '') +
      (c.timeLimit ? '<div class="cp-time">' + c.timeLimit + '</div>' : '') +
      '</div>' +
      (c.status === 'default' ? '<div class="cp-op" data-act="use">去使用</div>' : '') +
      '</div></div>';
  }
  function cellRow(title, note) {
    return '<div class="cpd-row"><span class="cpd-lb">' + title + '</span><span class="cpd-note">' + note + '</span></div>';
  }
  function render() {
    var d = this.data;
    var c = d.detail || {};
    var cells = '';
    if (c.desc) cells += cellRow('规则说明', c.desc);
    if (c.timeLimit) cells += cellRow('有效时间', c.timeLimit);
    if (c.storeAdapt) cells += cellRow('适用范围', c.storeAdapt);
    if (c.useNotes) cells += cellRow('使用须知', c.useNotes);
    return '<div class="cpd-page">' +
      '<div class="cpd-cardwrap">' + couponCardHtml(c) + '</div>' +
      '<div class="cpd-group">' + cells + '</div>' +
      '<div class="cpd-btnwrap"><div class="cpd-btn" data-act="goods">查看可用商品</div></div>' +
      '</div>';
  }
  function onTap(e) {
    var t = e.target.closest('[data-act],[data-key]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    var key = t.getAttribute('data-key');
    if (act === 'use') {
      e.stopPropagation();
      if (instId != null) APP.go('/pages/coupon/coupon-activity-goods/index?id=' + instId, 'push');
    } else if (act === 'goods') {
      /* 源 navGoodListHandle */
      if (instId != null) APP.go('/pages/coupon/coupon-activity-goods/index?id=' + instId, 'push');
    } else if (key != null && instId != null) {
      /* 源 gotoDetail:卡点击跳详情自身(同 url push) */
      APP.go(CARD_PATH + '?id=' + instId, 'push');
    }
  }

  APP.reg(CARD_PATH, {
    title: '优惠券详情',
    nav: 'default',
    reinitOnQuery: true,
    data: { detail: null },
    init: function (query) {
      var inst = this;
      instRef = inst;
      var id = query && /^\d+$/.test('' + query.id) ? Number(query.id) : 0;
      instId = id;
      inst.data.detail = null;
      return SVC.fetchCouponDetail(id).then(function (res) {
        inst.data.detail = res && res.detail;
        return inst;
      });
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
  });
})();
