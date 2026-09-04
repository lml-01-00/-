/* 搜索结果页 pages/goods/result/index ← result/index + t-search + filter + filter-popup + goods-list
 * 顶部可改词回车重新搜索;综合/价格排序切换;筛选弹层(价格区间,确定后清空区间);
 * 分页触底加载;空态"暂无相关商品";卡片点击进详情/加购 toast
 */
(function () {
  var pageNum = 1;
  var pageSize = 30;
  var total = 0;
  var listInited = false; // 滚动监听初始化

  function cardHtml(g, idx) {
    var tags = (g.tags || []).map(function (t) {
      return '<span class="goods-card__tag">' + t + '</span>';
    }).join('');
    var thumb = '<div class="goods-card__thumb"><img src="' + g.thumb + '" alt="" loading="lazy" data-i="' + idx + '" data-act="card"/></div>';
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
    if (!d.goodsList.length && d.hasLoaded) {
      listArea = emptyHtml('暂无相关商品');
    } else if (d.goodsList.length) {
      var cards = '';
      for (var i = 0; i < d.goodsList.length; i++) cards += cardHtml(d.goodsList[i], i);
      listArea = '<div class="category-goods-list"><div class="goods-list-wrap glist">' + cards + '</div></div>';
    }

    var activeCls = d.overall === 1 ? ' fl-active' : '';
    var upCls = d.sorts === 'asc' ? 'style="color:#FA550F"' : '';
    var downCls = d.sorts === 'desc' ? 'style="color:#FA550F"' : '';
    var priceTextCls = d.sorts ? 'style="color:#FA550F"' : '';
    var cleanStyle = d.keywords ? '' : 'style="display:none"';

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

    return '<div class="result-container">' +
      '<div class="t-search">' +
      '<div class="t-search__input-container">' +
      '<i class="wr wr-search t-search__left-icon" style="font-size:20px"></i>' +
      '<input class="t-search__input" type="text" placeholder="iPhone12pro" value="' + d.keywords + '" data-act="kw"/>' +
      '<i class="wr wr-close t-search__clean" data-act="kw-clear" ' + cleanStyle + '></i>' +
      '</div></div>' +
      '<div class="fl-bar">' +
      '<div class="fl-item' + activeCls + '" data-act="overall">综合</div>' +
      '<div class="fl-item" data-act="price-sort">' +
      '<span ' + priceTextCls + '>价格</span>' +
      '<span class="fl-arrows"><i class="wr wr-arrow_drop_up" ' + upCls + '></i>' +
      '<i class="wr wr-arrow_drop_down" ' + downCls + '></i></span></div>' +
      '<div class="fl-item" data-act="open-filter">筛选<i class="wr wr-filter fl-filter-icon"></i></div>' +
      '</div>' +
      '<div class="result-body">' + listArea +
      (d.goodsList.length ? loadMoreHtml(d.loadMoreStatus) : '') + '</div>' +
      popup +
      '</div>';
  }

  /* ---- 查询(等价 Page.init / onReachBottom) ---- */
  function query(reset) {
    var inst = APP.instances['/pages/goods/result/index'];
    if (inst.data.loadMoreStatus === 1) return Promise.resolve();
    var params = buildParams(reset);
    inst.setData({ loadMoreStatus: 1, loading: true });
    return SVC.fetchGoodList(params).then(function (result) {
      var spuList = result && result.spuList ? result.spuList : [];
      var totalCount = typeof result.totalCount === 'number' ? result.totalCount : spuList.length;
      if (!totalCount && reset) {
        total = 0;
        inst.setData({ hasLoaded: true, loadMoreStatus: 0, loading: false, goodsList: [] });
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
      /* 源码失败分支仅结束 loading(本地 mock 不会失败,归零以防状态卡死) */
      inst.setData({ loading: false, hasLoaded: true, loadMoreStatus: 0 });
    });
  }

  function buildParams(reset) {
    var d = APP.instances['/pages/goods/result/index'].data;
    var params = {
      sort: 0,
      pageNum: 1,
      pageSize: 30,
      keyword: d.keywords,
    };
    if (d.sorts) {
      params.sort = 1;
      params.sortType = d.sorts === 'desc' ? 1 : 0;
    }
    if (d.overall) {
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
    var inst = APP.instances['/pages/goods/result/index'];
    var act = target.getAttribute('data-act');
    var i = Number(target.getAttribute('data-i'));
    if (act === 'kw-clear') {
      var kw = target.parentNode.querySelector('.t-search__input');
      if (kw) kw.value = '';
      target.style.display = 'none';
    } else if (act === 'overall') {
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
      var pageRoot = e.target.closest('.fl-popup');
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

  /* 筛选变更(等价 handleFilterChange:有过结果才重查) */
  function applyFilter() {
    var inst = APP.instances['/pages/goods/result/index'];
    pageNum = 1;
    inst.setData({ goodsList: [], loadMoreStatus: 0 });
    if (total) query(true);
  }

  /* 价格区间确定(源码同文案;确定后区间重置为空) */
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
    inst.setData({
      show: false,
      minVal: '',
      maxVal: '',
      goodsList: [],
      loadMoreStatus: 0,
    });
    query(true);
  }

  /* 输入框:关键词(临时,不重绘)/筛选价 */
  function onInput(e) {
    var t = e.target;
    var act = t.getAttribute('data-act');
    if (act === 'kw') {
      var clean = t.parentNode.querySelector('.t-search__clean');
      if (clean) clean.style.display = t.value ? '' : 'none';
      return;
    }
    if (act !== 'min' && act !== 'max') return;
    var inst = APP.instances['/pages/goods/result/index'];
    if (act === 'min') inst.data.minVal = t.value;
    else inst.data.maxVal = t.value;
  }

  /* 键盘提交(等价 handleSubmit:输入法组词回车忽略) */
  function onKeyDown(e) {
    if (e.key !== 'Enter' || e.isComposing) return;
    var value = e.target.value;
    var inst = APP.instances['/pages/goods/result/index'];
    if (value === inst.data.keywords) return;
    inst.setData({ keywords: value, goodsList: [], loadMoreStatus: 0 });
    query(true);
  }

  /* 触底加载(等价 onReachBottom) */
  function initScroll() {
    if (listInited) return;
    listInited = true;
    function onScroll() {
      var inst = APP.instances['/pages/goods/result/index'];
      if (!inst) return;
      if (APP.cur && APP.cur.path !== '/pages/goods/result/index') return;
      if (!inst.data.hasLoaded) return;
      if (inst.data.goodsList.length >= total && inst.data.goodsList.length) {
        if (inst.data.loadMoreStatus !== 2) inst.setData({ loadMoreStatus: 2 });
        return;
      }
      if (inst.data.loadMoreStatus !== 0) return;
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

  APP.reg('/pages/goods/result/index', {
    title: '搜索',
    nav: 'default',
    reinitOnQuery: true,
    data: {
      goodsList: [],
      sorts: '',
      overall: 1,
      show: false,
      minVal: '',
      maxVal: '',
      filter: { overall: 1, sorts: '' },
      hasLoaded: false,
      keywords: '',
      loadMoreStatus: 0,
      loading: true,
    },
    init: function (queryOptions) {
      var inst = this;
      var options = queryOptions || {};
      inst.setData({ keywords: options.searchValue || '' });
      initScroll();
      return query(true);
    },
    render: render,
    events: function (root) {
      root.addEventListener('click', onTap);
      root.addEventListener('input', onInput);
      root.addEventListener('keydown', onKeyDown);
    },
    destroy: function () {
      if (APP.__stopListScroll) APP.__stopListScroll();
    },
  });
})();
