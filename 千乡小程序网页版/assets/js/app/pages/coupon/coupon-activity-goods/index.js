/* 优惠券活动商品页 pages/coupon/coupon-activity-goods/index ← 源(index.js/wxml/wxss) + goods-list/goods-card/floating-button
 * 提示条:以下商品可使用 {couponTypeDesc} 优惠券 + 帮助图标 → 底部弹层 规则详情(detail.timeLimit/desc/useNotes)
 * 商品网格 fetchGoodsList(id)(源语义:以 id 为起始下标切片);卡点击 → goods/details?spuId;加购 → Toast
 * 浮动购物车按钮(count=2,源写死)→ switchTab 消息页;couponTypeDesc 分支源与 detail.type 字符串归一不匹配恒为空(1:1)
 */
(function () {
  var instRef = null;
  var PAGE = '/pages/coupon/coupon-activity-goods/index';
  function cardHtml(g, i) {
    var tags = (g.tags || []).map(function (t) {
      return '<span class="goods-card__tag">' + t + '</span>';
    }).join('');
    var thumb = g.thumb
      ? '<div class="goods-card__thumb"><img src="' + g.thumb + '" alt="" loading="lazy" onerror="this.parentNode.style.visibility=\'hidden\'"/></div>'
      : '';
    var mainPrice = UP.ph(g.price, 'spec-for-price');
    var origin = g.originPrice && g.originPrice > g.price
      ? '<span class="goods-card__origin-price">' + UP.ph(g.originPrice, 'price--delthrough') + '</span>'
      : '';
    return '<div class="goods-card" data-act="card" data-i="' + i + '">' +
      '<div class="goods-card__main">' + thumb +
      '<div class="goods-card__body">' +
      '<div class="goods-card__upper">' +
      (g.title ? '<div class="goods-card__title">' + g.title + '</div>' : '') +
      (tags ? '<div class="goods-card__tags">' + tags + '</div>' : '') +
      '</div>' +
      '<div class="goods-card__down">' + mainPrice + origin +
      '<i class="wr wr-cartAdd goods-card__add-cart" data-act="addcart" data-i="' + i + '"></i>' +
      '</div></div></div></div>';
  }
  function popupHtml(d) {
    if (!d.showStoreInfoList) return '';
    var rows = '';
    if (d.detail && d.detail.timeLimit) {
      rows += '<div class="cpa-item"><div class="cpa-item-t">优惠券有效时间</div><div class="cpa-item-l">' + d.detail.timeLimit + '</div></div>';
    }
    if (d.detail && d.detail.desc) {
      rows += '<div class="cpa-item"><div class="cpa-item-t">优惠券说明</div><div class="cpa-item-l">' + d.detail.desc + '</div></div>';
    }
    if (d.detail && d.detail.useNotes) {
      rows += '<div class="cpa-item"><div class="cpa-item-t">使用须知</div><div class="cpa-item-l">' + d.detail.useNotes + '</div></div>';
    }
    return '<div class="cpa-mask" data-act="close-pop"></div>' +
      '<div class="cpa-sheet">' +
      '<i class="wr wr-close cpa-close" data-act="close-pop"></i>' +
      '<div class="cpa-sheet-t">规则详情</div>' +
      '<div class="cpa-sheet-b">' + rows + '</div>' +
      '</div>';
  }
  function render() {
    var d = this.data;
    var cards = '';
    for (var i = 0; i < d.goods.length; i++) cards += cardHtml(d.goods[i], i);
    var bar = d.detail && d.detail.couponTypeDesc
      ? '以下商品可使用<span class="cpa-light">' + d.detail.couponTypeDesc + '</span>优惠券'
      : '以下商品可使用优惠券';
    return '<div class="cpa-page">' +
      '<div class="cpa-notice">' +
      '<div class="cpa-notice-t">' + bar + '</div>' +
      '<i class="wr wr-help cpa-help" data-act="open-pop"></i>' +
      '</div>' +
      '<div class="cpa-grid"><div class="goods-list-wrap">' + cards + '</div></div>' +
      '<div class="cpa-float" data-act="float">' +
      '<div class="cpa-float-in"><i class="wr wr-notify cpa-float-ico"></i></div>' +
      '<div class="cpa-float-n">' + d.cartNum + '</div>' +
      '</div>' +
      popupHtml(d) +
      '</div>';
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    var i = Number(t.getAttribute('data-i'));
    if (act === 'card') {
      var g = inst.data.goods[i];
      if (g) APP.go('/pages/goods/details/index?spuId=' + encodeURIComponent(g.spuId), 'push');
    } else if (act === 'addcart') {
      var gc = inst.data.goods[i];
      if (gc && gc.spuId != null) Cart.pickAndAdd(gc);
    } else if (act === 'open-pop') {
      inst.data.showStoreInfoList = true;
      inst.refresh();
    } else if (act === 'close-pop') {
      inst.data.showStoreInfoList = false;
      inst.refresh();
    } else if (act === 'float') {
      /* 源 floating-button goToCart → switchTab 消息 */
      APP.go('/pages/message/message', 'tab');
    }
  }

  APP.reg(PAGE, {
    title: '活动商品',
    nav: 'default',
    reinitOnQuery: true,
    data: { goods: [], detail: null, couponTypeDesc: '', showStoreInfoList: false, cartNum: 2 },
    init: function (query) {
      var inst = this;
      instRef = inst;
      var id = query && /^\d+$/.test('' + query.id) ? Number(query.id) : 0;
      inst.id = id;
      inst.data.goods = [];
      inst.data.detail = null;
      inst.data.couponTypeDesc = '';
      inst.data.showStoreInfoList = false;
      return Promise.all([
        SVC.fetchCouponDetail(id).then(function (res) {
          var detail = res && res.detail;
          inst.data.detail = detail;
          /* 源分支(数字比较),detail.type 已归一字符串 → mock 下恒不命中 */
          if (detail) {
            if (detail.type === 2) {
              inst.data.couponTypeDesc = detail.base > 0
                ? '满' + detail.base / 100 + '元' + detail.value + '折'
                : detail.value + '折';
            } else if (detail.type === 1) {
              inst.data.couponTypeDesc = detail.base > 0
                ? '满' + detail.base / 100 + '元减' + detail.value / 100 + '元'
                : '减' + detail.value / 100 + '元';
            }
          }
          return inst;
        }),
        SVC.fetchGoodsList(id).then(function (list) {
          inst.data.goods = list || [];
          return inst;
        }),
      ]).then(function () {
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
