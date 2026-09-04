/* 首页 pages/home/home.js ← home.wxml + home.js + home.wxss */
(function () {
  var swiperTimer = null;
  var scrollInited = false;
  var tabIndex = 0;        // privateData.tabIndex
  var pagination = { index: 0, num: 20 };   // goodListPagination
  var swiperIdx = 0;       // 轮播当前位置(模块级,不触发重绘)
  var swiperEls = null;    // {track, dots[]}

  function fmtPrice(v) {
    if (v == null || v === '') return '';
    /* mock 价格单位为分(与 goods-list UP.ph 一致),首页展示转元 */
    var n = Number(v) / 100;
    var s = Math.abs(n).toFixed(2);
    var neg = n < 0 ? '-' : '';
    return { neg: neg, int: s.split('.')[0], dec: s.split('.')[1] };
  }

  function priceHtml(v, cls, symbol) {
    if (v == null || v === '') return '';
    var p = fmtPrice(v);
    return '<span class="price ' + cls + '"><span class="symbol">' + (symbol || '¥') + '</span>' +
      '<span class="pprice"><span class="integer">' + p.neg + p.int + '</span><span class="decimal">.' + p.dec + '</span></span></span>';
  }

  function cardHtml(item, index) {
    var tags = (item.tags || []).map(function (t) {
      return '<span class="goods-card__tag">' + t + '</span>';
    }).join('');
    var thumb = item.thumb
      ? '<div class="goods-card__thumb"><img src="' + item.thumb + '" alt="" loading="lazy" data-i="' + index + '" data-act="good"/></div>'
      : '<div class="goods-card__thumb goods-card__thumb--empty"></div>';
    var origin = item.originPrice && item.originPrice > item.price
      ? '<span class="goods-card__origin-price"><span class="symbol">¥</span>' +
        (function (p) { return p.int + '.' + p.dec; })(fmtPrice(item.originPrice)) + '</span>'
      : '';
    return '<div class="goods-card" data-act="good" data-i="' + index + '">' +
      '<div class="goods-card__main">' + thumb +
      '<div class="goods-card__body">' +
      '<div class="goods-card__upper">' +
      (item.title ? '<div class="goods-card__title">' + item.title + '</div>' : '') +
      (tags ? '<div class="goods-card__tags">' + tags + '</div>' : '') +
      '</div>' +
      '<div class="goods-card__down">' +
      priceHtml(item.price, 'goods-card__price', '¥') + origin +
      '<i class="wr wr-cartAdd goods-card__add-cart" data-act="addcart" data-i="' + index + '"></i>' +
      '</div></div></div></div>';
  }

  function listHtml(items) {
    var html = '';
    for (var i = 0; i < items.length; i++) html += cardHtml(items[i], i);
    return '<div class="goods-list-wrap">' + html + '</div>';
  }

  function loadMoreHtml() {
    var st = this.data.loadStatus;
    if (this.data.goodsList.length === 0 && (st === 0 || st === 2)) return '';
    var body = '';
    if (st === 1) {
      body = '<div class="t-loading" style="justify-content:center"><i class="t-loading__spinner" style="border-top-color:var(--color-primary)"></i>' +
        '<span class="t-loading__text">加载中...</span></div>';
    } else if (st === 2) {
      body = '<div class="t-divider"><span>没有更多了</span></div>';
    } else if (st === 3) {
      body = '<div class="load-more__error"><span>加载失败</span><span class="load-more__refresh-btn" data-act="retry">刷新</span></div>';
    }
    return '<div class="load-more">' + body + '</div>';
  }

  function render() {
    var s = this.data;
    var tabs = s.tabList.map(function (t, i) {
      return '<div class="t-tabs__item' + (i === tabIndex ? ' active' : '') + '" data-act="tab" data-i="' + i + '">' +
        t.text + '<span class="t-tabs__track"></span></div>';
    }).join('');
    var dots = s.imgSrcs.map(function (_, i) {
      return '<i class="t-swiper__dot' + (i === swiperIdx ? ' active' : '') + '"></i>';
    }).join('');
    var swiper = s.imgSrcs.length ? '<div class="t-swiper" data-act="swiper">' +
      '<div class="t-swiper__track" style="transform:translateX(' + (-swiperIdx * 100) + '%)">' +
      s.imgSrcs.map(function (src, i) {
        return '<div class="t-swiper__item" data-i="' + i + '"><img src="' + src + '" alt=""/></div>';
      }).join('') +
      '</div><div class="t-swiper__nav">' + dots + '</div></div>' : '';

    var goods = s.goodsList.length ? listHtml(s.goodsList) : '';
    return '<div class="page-home">' +
      '<div class="home-page-header">' +
      '<div class="search" data-act="search">' +
      '<div class="t-search"><div class="t-search__input-container">' +
      '<i class="wr wr-search t-search__left-icon"></i>' +
      '<div class="t-search__input">' + (s.searchText || '共生养殖') + '</div>' +
      '</div></div></div>' +
      (swiper ? '<div class="swiper-wrap">' + swiper + '</div>' : '') +
      '</div>' +
      '<div class="home-page-container">' +
      '<div class="home-page-tabs"><div class="t-tabs"><div class="t-tabs__scroll">' + tabs + '</div></div></div>' +
      '<div class="goods-list-container">' + goods + '</div>' +
      loadMoreHtml.call(this) +
      '</div></div>';
  }

  function events(root) {
    root.addEventListener('click', onTap);
    initSwiper(root);
    initScroll(root);
  }

  function onTap(e) {
    var target = e.target.closest('[data-act]');
    if (!target) return;
    var act = target.getAttribute('data-act');
    var inst = APP.instances['/pages/home/home'];
    var i = target.getAttribute('data-i');
    if (act === 'search') {
      APP.go('/pages/goods/search/index', 'push');
    } else if (act === 'good') {
      var g = inst.data.goodsList[Number(i)];
      if (g) APP.go('/pages/goods/details/index?spuId=' + g.spuId, 'push');
    } else if (act === 'addcart') {
      var ga = inst.data.goodsList[Number(i)];
      if (ga && ga.spuId != null) Cart.pickAndAdd(ga);
    } else if (act === 'tab') {
      i = Number(i);
      if (i === tabIndex) return;
      tabIndex = i;
      syncSwiperUI();
      inst.refresh();
      loadGoodsList(true);
    } else if (act === 'retry') {
      loadGoodsList(false);
    } else if (act === 'swiper' || target.classList.contains('t-swiper__item')) {
      var item = e.target.closest('.t-swiper__item');
      if (item) {
        var idx = Number(item.getAttribute('data-i')) || 0;
        APP.go('/pages/promotion/promotion-detail/index?promotion_id=' + idx, 'push');
      }
    }
  }

  /* swiper 轮播(等价 t-swiper autoplay interval=5000 duration=500) */
  function syncSwiperUI() {
    if (!swiperEls) return;
    var track = swiperEls.track;
    var count = swiperEls.count;
    if (!track || !count) return;
    track.style.transform = 'translateX(' + (-swiperIdx * 100) + '%)';
    for (var k = 0; k < swiperEls.dots.length; k++) swiperEls.dots[k].classList.toggle('active', k === swiperIdx);
  }
  function initSwiper(root) {
    var track = root.querySelector('.t-swiper__track');
    if (!track) return;
    var dots = Array.prototype.slice.call(root.querySelectorAll('.t-swiper__dot'));
    var items = root.querySelectorAll('.t-swiper__item').length;
    if (!items) return;
    swiperEls = { track: track, dots: dots, count: items };
    swiperIdx = Math.min(swiperIdx, items - 1);
    syncSwiperUI();
    if (swiperTimer) return;
    swiperTimer = setInterval(function () {
      swiperIdx = (swiperIdx + 1) % items;
      syncSwiperUI();
    }, 5000);
    APP.__stopHomeTimers = function () { clearInterval(swiperTimer); swiperTimer = null; scrollInited = false; swiperEls = null; };
  }

  /* 触底加载(onReachBottom,距离 5px) */
  function initScroll(root) {
    if (scrollInited) return;
    scrollInited = true;
    function onScroll() {
      var inst = APP.instances['/pages/home/home'];
      if (!inst) return;
      var curPath = APP.cur && APP.cur.path;
      if (curPath !== '/pages/home/home') return;
      if (inst.data.loadStatus !== 0) return;
      var doc = document.documentElement;
      if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 5) {
        loadGoodsList(false);
      }
    }
    window.addEventListener('scroll', onScroll);
    if (APP.__stopHomeScroll) APP.__stopHomeScroll();
    APP.__stopHomeScroll = function () {
      window.removeEventListener('scroll', onScroll);
      scrollInited = false;
    };
  }

  /* 商品列表加载(等价 loadGoodsList,status: 0正常/1加载/3失败) */
  function loadGoodsList(fresh) {
    fresh = !!fresh;
    var inst = APP.instances['/pages/home/home'];
    if (fresh) wx.pageScrollTo({ scrollTop: 0 });
    inst.setData({ loadStatus: 1 });
    var pageSize = pagination.num;
    var pageIndex = tabIndex * pageSize + pagination.index + 1;
    if (fresh) pageIndex = 0;
    SVC.fetchGoodsList(pageIndex, pageSize).then(function (nextList) {
      inst.setData({
        goodsList: fresh ? nextList : inst.data.goodsList.concat(nextList),
        loadStatus: 0,
      });
      pagination.index = pageIndex;
      pagination.num = pageSize;
    }).catch(function () {
      inst.setData({ loadStatus: 3 });
    });
  }

  APP.reg('/pages/home/home', {
    title: '首页',
    tab: true,
    data: {
      imgSrcs: [],
      tabList: [],
      goodsList: [],
      loadStatus: 0,
      current: 0,
      searchText: '',
    },
    init: function () {
      var inst = this;
      inst.data.searchText = wx.getStorageSync('searchKeyword') || '';
      return SVC.fetchHome().then(function (res) {
        inst.setData({ tabList: res.tabList, imgSrcs: res.swiper });
        loadGoodsList(true);
        return inst;
      });
    },
    render: render,
    events: events,
  });
})();
