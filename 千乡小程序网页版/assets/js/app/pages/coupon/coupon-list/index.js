/* 我的优惠券页 pages/coupon/coupon-list/index ← 源 coupon-list(index.js/wxml/wxss) + coupon-card/ui-coupon-card
 * tabs:可使用/已使用/已失效 → fetchCouponList('default'|'useless'|'disabled') 各 10 张同款券(源 getCouponList 行为)
 * 卡视觉:左金额区(type1 满减元/type2 折扣折)/右标题+时限+去使用按钮;非 default 态置灰底图+右上角印章、按钮隐藏
 * 卡点击→coupon-detail?id=key;去使用→coupon-activity-goods?id=key;底部固定 领券中心 → Toast(源仅提示)
 * 源 t-pull-down-refresh 下拉手势 web 不实现(数据一次性加载,换 tab 即重取)
 * 金额显示:value 单位分(MJ)/折(ZK),源 wxs isBigValue 拆分大数分支 mock 恒不触发,web 简化取整
 */
(function () {
  var instRef = null;
  var TABS = [
    { text: '可使用', key: 0 },
    { text: '已使用', key: 1 },
    { text: '已失效', key: 2 },
  ];
  var STATUS_KEY = ['default', 'useless', 'disabled'];
  var SEAL = { useless: 'https://tdesign.gtimg.com/miniprogram/template/retail/coupon/seal-used.png', disabled: 'https://tdesign.gtimg.com/miniprogram/template/retail/coupon/coupon-expired.png' };
  /* type:1 满减(元,分/100) 2 折扣(折) 3 免邮 4 礼品图;detail 页 type 被源归一为字符串→左区空(1:1 保留) */
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
      (c.status === 'default'
        ? '<div class="cp-op" data-act="use" data-key="' + c.key + '">去使用</div>'
        : '') +
      '</div>' +
      (useless ? '<img class="cp-seal" src="' + SEAL[c.status] + '" alt="" onerror="this.style.display=\'none\'"/>' : '') +
      '</div>';
  }
  function render() {
    var d = this.data;
    var tabsHtml = TABS.map(function (t) {
      return '<div class="cp-tab' + (t.key === d.status ? ' on' : '') + '" data-tab="' + t.key + '">' + t.text + '</div>';
    }).join('');
    var listHtml = d.couponList.length
      ? '<div class="cp-list">' + d.couponList.map(couponCardHtml).join('') + '</div>'
      : '';
    return '<div class="cp-page">' +
      '<div class="cp-tabs">' + tabsHtml + '</div>' +
      listHtml +
      '<div class="cp-center" data-act="center">' +
      '<span>领券中心</span><i class="wr wr-arrow_right cp-center-ico"></i>' +
      '</div>' +
      '</div>';
  }
  function fetchList(status) {
    var inst = instRef;
    return SVC.fetchCouponList(STATUS_KEY[status]).then(function (list) {
      inst.data.couponList = list || [];
      inst.refresh();
      return inst;
    });
  }
  function onTap(e) {
    var t = e.target.closest('[data-tab],[data-key],[data-act]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    var tab = t.getAttribute('data-tab');
    var key = t.getAttribute('data-key');
    if (tab != null) {
      var k = Number(tab);
      if (inst.data.status === k) return;
      inst.data.status = k;
      inst.data.couponList = [];
      inst.refresh();
      fetchList(k);
    } else if (act === 'use') {
      e.stopPropagation();
      APP.go('/pages/coupon/coupon-activity-goods/index?id=' + encodeURIComponent(key), 'push');
    } else if (act === 'center') {
      /* 源 goCouponCenterHandle 仅 Toast 提示,无跳转 */
      wx.showToast({ title: '去领券中心', icon: 'none' });
    } else if (key != null) {
      APP.go('/pages/coupon/coupon-detail/index?id=' + encodeURIComponent(key), 'push');
    }
  }

  APP.reg('/pages/coupon/coupon-list/index', {
    title: '优惠券',
    nav: 'default',
    reinitOnQuery: true,
    data: { status: 0, couponList: [] },
    init: function (query) {
      var inst = this;
      instRef = inst;
      var qs = query && query.status != null ? parseInt(query.status, 10) : 0;
      inst.data.status = TABS.some(function (t) { return t.key === qs; }) ? qs : 0;
      inst.data.couponList = [];
      return fetchList(inst.data.status);
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
  });
})();
