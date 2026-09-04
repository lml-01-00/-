/* 共生页 pages/gongsheng/gongsheng ← gongsheng(custom nav + swiper banner + 精选/网格)
 * 自绘导航(渐变绿底:返回/标题/搜索);banner 自动轮播 3500ms + 指示点;
 * 精选农产品横卡;4 个产品卡(2 列);产品卡跳 product-detail(源包外未注册页面);
 * mock 数据与源码文件内定义一致
 */
(function () {
  var BANNERS = [
    { id: 'b1', img: 'https://free.picui.cn/free/2026/03/11/69b1387e1697d.jpg' },
    { id: 'b2', img: 'https://free.picui.cn/free/2026/03/11/69b13c265230b.jpg' },
    { id: 'b3', img: 'https://free.picui.cn/free/2026/03/11/69b13c264a0db.jpg' },
  ];
  var FEATURED = {
    name: '无肥生菜',
    origin: '广东 · 东莞市',
    badges: ['绿色认证', '地理标志'],
    image: 'https://free.picui.cn/free/2026/06/02/6a1ec330e2d99.jpg',
    plantTime: '5月上旬',
    growStatus: '生长饱满，长势喜人',
  };
  var PRODUCTS = [
    { id: 'p1', name: '原生小葱', origin: '广东·广州市', province: '广东',
      image: 'https://free.picui.cn/free/2026/06/02/6a1ec3320b3ad.jpg', plantTime: '3月上旬',
      growStatus: '葱叶肥厚修长，成片铺展，绿意浓郁繁茂' },
    { id: 'p2', name: '辣椒', origin: '广东·广州市', province: '广州',
      image: 'https://free.picui.cn/free/2026/06/02/6a1ec330d8ec0.jpg', plantTime: '6月中旬',
      growStatus: '椒株枝繁叶茂，绿叶铺得浓密' },
    { id: 'p3', name: '茄子', origin: '广东·东莞市', province: '东莞',
      image: 'https://free.picui.cn/free/2026/06/02/6a1ec330aa5b4.jpg', plantTime: '4月中旬',
      growStatus: '茄棵枝叶铺展繁密，紫茄垂挂满枝，硕果累累' },
    { id: 'p4', name: '西红柿', origin: '广东·东莞市', province: '东莞',
      image: 'https://free.picui.cn/free/2026/06/02/6a1ec3318fb1b.jpg', plantTime: '4月中旬定植',
      growStatus: '挂果期，果实红艳，香气浓郁' },
  ];

  var bIdx = 0;
  var bTimer = null;
  var rootEl = null;

  function bannerHtml() {
    var slides = '';
    for (var i = 0; i < BANNERS.length; i++) {
      slides += '<div class="gs-banner-item">' +
        '<img class="gs-banner-bg" src="' + BANNERS[i].img + '" alt="" loading="lazy"/>' +
        '<div class="gs-banner-mask"></div>' +
        '<div class="gs-banner-copy">' +
        '<div class="gs-banner-title">千乡· 共生计划</div>' +
        '<div class="gs-banner-sub">来自中国农村的原生好物</div>' +
        '<div class="gs-banner-pill"><span class="gs-banner-pill-text">产地直供 · 绿色无公害</span></div>' +
        '</div></div>';
    }
    var dots = '';
    for (var j = 0; j < BANNERS.length; j++) {
      dots += '<i class="gs-banner-dot' + (j === bIdx ? ' active' : '') + '" data-b-idx="' + j + '"></i>';
    }
    return '<div class="gs-banner-swiper">' +
      '<div class="gs-banner-track" style="width:' + (BANNERS.length * 100) + '%;' +
      'transform:translateX(-' + (bIdx * (100 / BANNERS.length)) + '%)">' + slides + '</div>' +
      '<div class="gs-banner-dots">' + dots + '</div></div>';
  }

  function badgesHtml(list) {
    if (!list || !list.length) return '';
    var h = '';
    for (var i = 0; i < list.length; i++) {
      h += '<div class="gs-badge ' + (list[i] === '绿色认证' ? 'badge-green' : 'badge-geo') + '">' +
        list[i] + '</div>';
    }
    return '<div class="gs-badges">' + h + '</div>';
  }

  function render() {
    var f = FEATURED;
    var products = '';
    for (var i = 0; i < PRODUCTS.length; i++) {
      var p = PRODUCTS[i];
      products += '<div class="gs-product-card" data-act="product" data-id="' + p.id + '">' +
        '<div class="gs-product-media">' +
        '<img class="gs-product-img" src="' + p.image + '" alt="" loading="lazy"/>' +
        '<span class="gs-province-tag">' + p.province + '</span></div>' +
        '<div class="gs-product-body">' +
        '<div class="gs-product-name">' + p.name + '</div>' +
        '<div class="gs-product-origin">产地 · ' + p.origin + '</div>' +
        '<div class="gs-product-divider"></div>' +
        '<div class="gs-product-row"><span class="gs-row-icon">&#9201;</span>' +
        '<span class="gs-product-row-text">种植：' + p.plantTime + '</span></div>' +
        '<div class="gs-product-status"><i class="gs-dot"></i>' +
        '<span class="gs-product-status-text">' + p.growStatus + '</span></div>' +
        '</div></div>';
    }

    return '<div class="gs-page">' +
      '<div class="gs-navbar">' +
      '<div class="gs-nav-side" data-act="back"><i class="wr wr-arrow_back gs-nav-icon"></i></div>' +
      '<div class="gs-nav-center">' +
      '<div class="gs-nav-title">共生产品</div>' +
      '<div class="gs-nav-sub">千乡 · 农产品展示</div></div>' +
      '<div class="gs-nav-side" data-act="search"><i class="wr wr-search gs-nav-icon"></i></div>' +
      '</div>' +
      '<div class="gs-banner-wrapper">' + bannerHtml() + '</div>' +
      '<div class="gs-section-header">' +
      '<div class="gs-section-left"><i class="gs-section-bar"></i>' +
      '<span class="gs-section-title">精选农产品</span></div>' +
      '<span class="gs-section-link" data-act="viewall">查看全部›</span></div>' +
      '<div class="gs-featured-card">' +
      '<div class="gs-featured-img-wrap">' +
      '<img class="gs-featured-img" src="' + f.image + '" alt="" loading="lazy"/>' +
      badgesHtml(f.badges) + '</div>' +
      '<div class="gs-featured-info">' +
      '<div class="gs-featured-name">' + f.name + '</div>' +
      '<div class="gs-featured-origin">产地：' + f.origin + '</div>' +
      '<div class="gs-featured-divider"></div>' +
      '<div class="gs-info-row"><span class="gs-row-icon">&#9201;</span>' +
      '<span class="gs-row-label">种植时间：</span>' +
      '<span class="gs-row-value">' + f.plantTime + '</span></div>' +
      '<div class="gs-status-row"><i class="gs-status-dot"></i>' +
      '<span class="gs-row-label">生长状态：</span>' +
      '<span class="gs-row-value gs-row-value-wrap">' + f.growStatus + '</span></div>' +
      '</div></div>' +
      '<div class="gs-grid">' + products + '</div>' +
      '<div class="gs-bottom-space"></div></div>';
  }

  function gotoBanner(i) {
    bIdx = ((i % BANNERS.length) + BANNERS.length) % BANNERS.length;
    if (!rootEl) return;
    var track = rootEl.querySelector('.gs-banner-track');
    var dots = rootEl.querySelectorAll('.gs-banner-dot');
    if (track) {
      track.style.transform = 'translateX(-' + (bIdx * (100 / BANNERS.length)) + '%)';
    }
    for (var k = 0; k < dots.length; k++) {
      dots[k].className = 'gs-banner-dot' + (k === bIdx ? ' active' : '');
    }
  }

  function startCarousel() {
    if (bTimer) clearInterval(bTimer);
    bTimer = setInterval(function () {
      if (!rootEl || !rootEl.isConnected) return;
      gotoBanner(bIdx + 1);
    }, 3500);
  }

  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var inst = APP.instances['/pages/gongsheng/gongsheng'];
    var act = t.getAttribute('data-act');
    if (act === 'back') {
      inst.back();
    } else if (act === 'search') {
      APP.go('/pages/goods/search/index', 'push');
    } else if (act === 'viewall') {
      APP.go('/pages/goods/list/index', 'push');
    } else if (act === 'product') {
      var id = t.getAttribute('data-id');
      if (id) APP.go('/pages/product-detail/product-detail?id=' + encodeURIComponent(id), 'push');
    }
  }

  function onDotTap(e) {
    var d = e.target.closest('[data-b-idx]');
    if (!d) return;
    var i = Number(d.getAttribute('data-b-idx'));
    gotoBanner(i);
    startCarousel();
  }

  APP.reg('/pages/gongsheng/gongsheng', {
    title: '共生产品',
    nav: 'custom',
    tab: true,
    data: {},
    init: function () {
      var inst = this;
      return Promise.resolve(inst);
    },
    render: render,
    events: function (root) {
      rootEl = root;
      root.addEventListener('click', onTap);
      root.addEventListener('click', onDotTap);
      startCarousel();
    },
  });
})();
