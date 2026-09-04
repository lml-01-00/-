/* 商品列表页 pages/goods/list/index ← list/index + filter + filter-popup + goods-list 组件
 * 支持:综合/价格排序切换、筛选弹层(价格区间)、分页加载、空态/失败态、卡片点击/加购
 */
(function () {
  var pageNum = 1;
  var pageSize = 30;
  var total = 0;
  var listInited = false; // 滚动监听初始化

  var FILTER_COLOR = '#FA550F';

  function cardHtml(g, idx) {
    var tags = (g.tags || []).map(function (t) {
      return '<span class="goods-card__tag">' + t + '</span>';
    }).join('');
    var thumb = g.thumb
      ? '<div class="goods-card__thumb"><img src="' + g.thumb + '" alt="" loading="lazy" data-i="' + idx + '" data-act="card"/></div>'
      : '';
    var mainPrice = UP.ph(g.price, 'spec-for-price');
    var origin = g.originPrice && g.originPrice > g.price
      ? '<span class="goods-card__origin-price">' + UP.ph(g.originPrice, 'price--delthrough') + '</span>'
      : '';
    return '<div class="goods-card" data-act="card" data-i="' + idx + '">' +
      '<div class="goods-card__main">' + thumb +
      '<div class="goods-card__body">' +
      '<div class="goods-card__upper">' +
      (g.title ? '<div class="goods-card__title">' + g.title + '</div>' : '') +
      (tags ? '<div class="goods-card__tags">' + tags + '</div>' : '') +
      '</div>' +
      '<div class="goods-card__down">' + mainPrice + origin +
      '<i class="wr wr-cartAdd goods-card__add-cart" data-act="addcart" data-i="' + idx + '"></i>' +
      '</div></div></div></div>';
  }

  function emptyHtml(desc) {
    return '<div class="empty-wrap"><div class="t-empty">' +
      '<div class="t-empty__image"></div>' +
      '<div class="t-empty__text">' + desc + '</div></div></div>';
  }

  function loadMoreHtml(st) {
    if (st === 1) {
      return '<div class="load-more"><div class="t-loading" style="justify-content:center">' +
        '<i class="t-loading__spinner" style="border-top-color:var(--color-primary)"></i>' +
        '<span class="t-loading__text">加载中...</span></div></div>';
    }
    if (st === 2) {
      return '<div class="load-more"><div class="t-divider"><span>没有更多了</span></div></div>';
    }
    return '';
  }

  function render() {
    var d = this.data;
    var listArea = '';
    if (d.errorMessage) {
      listArea = emptyHtml(d.errorMessage);
    } else if (!d.goodsList.length && d.hasLoaded) {
      listArea = emptyHtml('暂无相关商品');
    } else if (d.goodsList.length) {
      var cards = '';
      for (var i = 0; i < d.goodsList.length; i++) cards += cardHtml(d.goodsList[i], i);
      listArea = '<div class="category-goods-list"><div class="goods-list-wrap glist">' + cards + '</div></div>';
    }

    var activeCls = d.overall === 1 ? ' fl-active' : '';
    var priceCls = '';
    var upCls = d.sorts === 'asc' ? 'style="color:' + FILTER_COLOR + '"' : '';
    var downCls = d.sorts === 'desc' ? 'style="color:' + FILTER_COLOR + '"' : '';
    var priceTextCls = d.sorts ? 'style="color:' + FILTER_COLOR + '"' : '';

    var popup = '';
    if (d.show) {
      popup =
        '<div class="fl-mask" data-act="close-filter"></div>' +
        '<div class="fl-popup">' +
        '<div class="price-container">' +
        '<div class="price-between">价格区间</div>' +
        '<div class="price-ipts-wrap">' +
        '<input class="price-ipt" type="number" inputmode="decimal" placeholder="最低价" value="' + d.minVal + '" data-act="min"/>' +
        '<span class="price-divided">-</span>' +
        '<input class="price-ipt" type="number" inputmode="decimal" placeholder="最高价" value="' + d.maxVal + '" data-act="max"/>' +
        '</div>' +
        '</div>' +
        '<div class="filter-btns-wrap">' +
        '<div class="filter-btn btn-reset" data-act="reset">重置</div>' +
        '<div class="filter-btn btn-confirm" data-act="confirm">确定</div>' +
        '</div></div>';
    }

    return '<div class="goods-list-page">' +
      '<div class="fl-bar">' +
      '<div class="fl-item' + activeCls + '" data-act="overall">综合</div>' +
      '<div class="fl-item' + priceCls + '" data-act="price-sort">' +
      '<span ' + priceTextCls + '>价格</span>' +
      '<span class="fl-arrows"><i class="wr wr-arrow_drop_up" ' + upCls + '></i>' +
      '<i class="wr wr-arrow_drop_down" ' + downCls + '></i></span></div>' +
      '<div class="fl-item" data-act="open-filter">筛选<i class="wr wr-filter fl-filter-icon"></i></div>' +
      '</div>' +
      '<div class="list-body">' + listArea + loadMoreHtml(d.loadMoreStatus) + '</div>' +
      popup +
      '</div>';
  }

  /* ---- 查询(等价 Page.init / onReachBottom) ---- */
  function query(reset) {
    var inst = APP.instances['/pages/goods/list/index'];
    var d = inst.data;
    if (d.loadMoreStatus === 1) return Promise.resolve();
    var params = buildParams(reset);
    inst.setData({ loadMoreStatus: 1, loading: true, errorMessage: '' });
    return SVC.fetchGoodList(params).then(function (result) {
      var spuList = result && result.spuList ? result.spuList : [];
      var totalCount = typeof result.totalCount === 'number' ? result.totalCount : spuList.length;
      if (!totalCount && reset) {
        total = 0;
        inst.setData({ errorMessage: '', hasLoaded: true, loadMoreStatus: 0, loading: false, goodsList: [] });
        return;
      }
      var nextList = reset ? spuList : inst.data.goodsList.concat(spuList);
      total = totalCount;
      pageNum = params.pageNum || 1;
      inst.setData({
        goodsList: nextList,
        loadMoreStatus: nextList.length === totalCount ? 2 : 0,
        hasLoaded: true,
        loading: false,
      });
    }).catch(function () {
      inst.setData({
        goodsList: reset ? [] : inst.data.goodsList,
        hasLoaded: true,
        loadMoreStatus: 0,
        loading: false,
        errorMessage: '商品列表加载失败，请稍后重试',
      });
      wx.showToast({ title: '商品列表加载失败', icon: 'none' });
    });
  }

  function buildParams(reset) {
    var d = APP.instances['/pages/goods/list/index'].data;
    var filter = d.filter || { sorts: '', overall: 1 };
    var sorts = d.sorts;
    var overall = d.overall;
    var params = {
      sort: 0,
      pageNum: 1,
      pageSize: 30,
      keyword: d.keywords,
      categoryId: d.categoryId,
      categoryName: d.categoryName,
      categoryPath: d.categoryPath,
    };
    if (sorts) {
      params.sort = 1;
      params.sortType = sorts === 'desc' ? 1 : 0;
    }
    if (overall) {
      params.sort = 0;
    } else {
      params.sort = 1;
    }
    params.minPrice = d.minVal ? Number(d.minVal) * 100 : 0;
    params.maxPrice = d.maxVal ? Number(d.maxVal) * 100 : undefined;
    if (reset) return params;
    params.pageNum = pageNum + 1;
    params.pageSize = pageSize;
    return params;
  }

  /* ---- 事件 ---- */
  function onTap(e) {
    var target = e.target.closest('[data-act]');
    if (!target) return;
    var inst = APP.instances['/pages/goods/list/index'];
    var act = target.getAttribute('data-act');
    var i = Number(target.getAttribute('data-i'));
    if (act === 'overall') {
      inst.data.overall = inst.data.overall === 1 ? 0 : 1;
      inst.data.sorts = '';
      applyFilter();
    } else if (act === 'price-sort') {
      inst.data.overall = 0;
      inst.data.sorts = inst.data.sorts === 'desc' ? 'asc' : 'desc';
      applyFilter();
    } else if (act === 'open-filter') {
      inst.data.show = true;
      inst.refresh();
    } else if (act === 'close-filter') {
      inst.data.show = false;
      inst.refresh();
    } else if (act === 'reset') {
      inst.data.minVal = '';
      inst.data.maxVal = '';
      var pageRoot = e.target.closest('.goods-list-page');
      if (pageRoot) {
        var ins = pageRoot.querySelectorAll('.price-ipt');
        for (var k = 0; k < ins.length; k++) ins[k].value = '';
      }
    } else if (act === 'confirm') {
      confirmFilter(inst);
    } else if (act === 'card') {
      var g = inst.data.goodsList[i];
      if (g) APP.go('/pages/goods/details/index?spuId=' + g.spuId, 'push');
    } else if (act === 'addcart') {
      var g0 = inst.data.goodsList[i];
      if (g0 && g0.spuId != null) Cart.pickAndAdd(g0);
    }
  }

  function applyFilter() {
    var inst = APP.instances['/pages/goods/list/index'];
    pageNum = 1;
    inst.setData({
      filter: { layout: 0, overall: inst.data.overall, sorts: inst.data.sorts },
      goodsList: [],
      loadMoreStatus: 0,
    });
    query(true);
  }

  /* 价格区间确定(等价 Page.confirm:校验文案与源码一字不差) */
  function confirmFilter(inst) {
    var minVal = inst.data.minVal;
    var maxVal = inst.data.maxVal;
    var message = '';
    if (minVal && !maxVal) {
      message = '价格最小是' + minVal;
    } else if (!minVal && maxVal) {
      message = '价格范围是0-' + maxVal;
    } else if (minVal && maxVal && Number(minVal) <= Number(maxVal)) {
      message = '价格范围' + minVal + '-' + maxVal;
    } else {
      message = '请输入正确范围';
    }
    if (message) wx.showToast({ title: message, icon: 'none' });
    pageNum = 1;
    inst.data.show = false;
    inst.setData({ goodsList: [], loadMoreStatus: 0 });
    query(true);
  }

  function onInput(e) {
    var t = e.target;
    var act = t.getAttribute('data-act');
    if (act !== 'min' && act !== 'max') return;
    var inst = APP.instances['/pages/goods/list/index'];
    if (act === 'min') inst.data.minVal = t.value;
    else inst.data.maxVal = t.value;
  }

  /* 触底加载(等价 onReachBottom) */
  function initScroll() {
    if (listInited) return;
    listInited = true;
    function onScroll() {
      var inst = APP.instances['/pages/goods/list/index'];
      if (!inst) return;
      if (APP.cur && APP.cur.path !== '/pages/goods/list/index') return;
      if (!inst.data.hasLoaded) return;
      var d = inst.data;
      if (d.goodsList.length >= total && d.goodsList.length) {
        if (d.loadMoreStatus !== 2) inst.setData({ loadMoreStatus: 2 });
        return;
      }
      if (d.loadMoreStatus !== 0) return;
      var doc = document.documentElement;
      if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 5) {
        query(false);
      }
    }
    window.addEventListener('scroll', onScroll);
    if (APP.__stopListScroll) APP.__stopListScroll();
    APP.__stopListScroll = function () {
      window.removeEventListener('scroll', onScroll);
      listInited = false;
    };
  }

  APP.reg('/pages/goods/list/index', {
    title: '商品列表',
    nav: 'default',
    reinitOnQuery: true,
    data: {
      goodsList: [],
      layout: 0,
      sorts: '',
      overall: 1,
      keywords: '',
      categoryId: '',
      categoryName: '',
      categoryPath: '',
      show: false,
      minVal: '',
      maxVal: '',
      filter: { layout: 0, overall: 1, sorts: '' },
      hasLoaded: false,
      loadMoreStatus: 0,
      loading: true,
      errorMessage: '',
    },
    init: function (queryOptions) {
      var inst = this;
      var options = queryOptions || {};
      var searchValue = options.searchValue || '';
      var categoryId = options.categoryId || '';
      var categoryName = options.categoryName || '';
      var categoryPath = options.categoryPath || '';
      var decodedName = categoryName ? decodeURIComponent(categoryName) : '';
      inst.setData({
        keywords: searchValue,
        categoryId: categoryId ? decodeURIComponent(categoryId) : '',
        categoryName: decodedName,
        categoryPath: categoryPath ? decodeURIComponent(categoryPath) : '',
      });
      if (decodedName) APP.setNavTitle(decodedName);
      initScroll();
      return query(true);
    },
    render: render,
    events: function (root) {
      root.addEventListener('click', onTap);
      root.addEventListener('input', onInput);
    },
    destroy: function () {
      if (APP.__stopListScroll) APP.__stopListScroll();
    },
  });
})();
