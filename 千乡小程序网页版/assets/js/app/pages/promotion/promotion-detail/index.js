/* 营销详情页 pages/promotion/promotion-detail/index ← promotion-detail(index.js + goods-list 卡)
 * query promotion_id;SVC.fetchPromotion 返回 banner(图下展示倒计时条:距结束仅剩 DD天 HH:mm:ss + 规则详情)
 * 商品竖卡列表(复用 goods-card 行卡结构与 class):点卡 → 商品详情;点加购 → toast
 * banner 文案点击 → toast 点击规则详情;倒计时每秒 tick(源 count-down 20h 静态起算)
 */
(function () {
  var instRef = null;
  var remainMs = 0; // 倒计时剩余毫秒(源 mock time = 20h)
  var timer = null;
  var fmt2 = function (n) { return n < 10 ? '0' + n : '' + n; };

  function goodsCardHtml(g, idx) {
    var tags = '';
    if (g.tags && g.tags.length) {
      tags = '<div class="goods-card__tags">' + g.tags.map(function (t) {
        return '<span class="goods-card__tag">' + t + '</span>';
      }).join('') + '</div>';
    }
    var mainPrice = UP.ph(g.price, 'goods-card__price');
    var origin = g.originPrice
      ? '<span class="goods-card__origin-price">' + UP.ph(g.originPrice, 'price--delthrough') + '</span>' : '';
    return '<div class="goods-card" data-act="card" data-i="' + idx + '">' +
      '<div class="goods-card__main">' +
      '<div class="goods-card__thumb"><img src="' + g.thumb + '" alt="" loading="lazy" data-i="' + idx + '" data-act="card"/></div>' +
      '<div class="goods-card__body">' +
      '<div class="goods-card__upper">' +
      '<div class="goods-card__title">' + g.title + '</div>' + tags +
      '</div>' +
      '<div class="goods-card__down">' + mainPrice + origin +
      '<i class="wr wr-cartAdd goods-card__add-cart" data-act="addcart" data-i="' + idx + '"></i>' +
      '</div></div></div></div>';
  }
  function countdownTxt() {
    var ms = remainMs;
    var sec = Math.max(0, Math.floor(ms / 1000));
    var dd = Math.floor(sec / 86400);
    sec -= dd * 86400;
    var hh = Math.floor(sec / 3600);
    sec -= hh * 3600;
    var mm = Math.floor(sec / 60);
    sec -= mm * 60;
    return fmt2(dd) + '天 ' + fmt2(hh) + ':' + fmt2(mm) + ':' + fmt2(sec);
  }
  function render() {
    var d = this.data;
    var listHtml = '';
    (d.list || []).forEach(function (g, i) { listHtml += goodsCardHtml(g, i); });
    var hasBanner = !!d.banner;
    return '<div class="pd-page">' +
      (hasBanner ? '<div class="pd-banner-box">' +
        '<img class="pd-banner" src="' + d.banner + '" alt="" data-act="banner"/>' +
        (d.showBannerDesc || d.time >= 0 || d.statusTag === 'finish'
          ? '<div class="pd-countdown' + (d.showBannerDesc ? '' : ' pd-countdown--over') + '">' +
            (d.statusTag === 'finish'
              ? '<span class="pd-status finish">已结束</span><span class="pd-cd-label">活动已结束</span>'
              : (d.statusTag === 'before'
                ? '<span class="pd-status before">未开始</span><span class="pd-cd-label">距结束仅剩</span>'
                : '<span class="pd-cd-label">距结束仅剩</span>') +
                '<span class="pd-cd-num" data-cd="1">' + countdownTxt() + '</span>') +
            '<span class="pd-rule" data-act="rule">规则详情<i class="wr wr-arrow_right" style="font-size:14px;color:#999;font-style:normal"></i></span>' +
            '</div>' : '') +
        '</div>' : '') +
      '<div class="pd-list">' + listHtml + '</div></div>';
  }
  function startTick(inst) {
    if (timer) clearInterval(timer);
    if (inst.data.statusTag !== 'running' || !(inst.data.time > 0)) return;
    timer = setInterval(function () {
      remainMs -= 1000;
      if (remainMs <= 0) {
        clearInterval(timer);
        timer = null;
        remainMs = 0;
      }
      var el = instRef && instRef.root && instRef.root.querySelector('[data-cd]');
      if (el) el.textContent = countdownTxt();
    }, 1000);
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    if (act === 'card') {
      var i = Number(t.getAttribute('data-i'));
      var g = (inst.data.list || [])[i];
      if (g && g.spuId) APP.go('/pages/goods/details/index?spuId=' + encodeURIComponent(g.spuId), 'push');
    } else if (act === 'addcart') {
      var i0 = Number(t.getAttribute('data-i'));
      var gp = (inst.data.list || [])[i0];
      if (gp && gp.spuId) Cart.pickAndAdd(gp);
    } else if (act === 'banner') {
      wx.showToast({ title: '点击规则详情', icon: 'none' });
    } else if (act === 'rule') {
      wx.showToast({ title: '点击规则详情', icon: 'none' });
    }
  }

  APP.reg('/pages/promotion/promotion-detail/index', {
    title: '营销详情',
    nav: 'default',
    data: { list: [], banner: '', time: 0, showBannerDesc: false, statusTag: '' },
    init: function (query) {
      var inst = this;
      instRef = inst;
      var pid = parseInt(query && query.promotion_id, 10) || 0;
      return SVC.fetchPromotion(pid).then(function (res) {
        inst.data.list = (res.list || []).map(function (item) {
          return Object.assign({}, item, { tags: (item.tags || []).map(function (v) { return typeof v === 'string' ? v : v.title; }) });
        });
        inst.data.banner = res.banner || '';
        inst.data.time = res.time || 0;
        inst.data.showBannerDesc = !!res.showBannerDesc;
        inst.data.statusTag = res.statusTag || 'running';
        remainMs = inst.data.time;
        return inst;
      });
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
      startTick(inst);
    },
  });
})();
