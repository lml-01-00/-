/* 全部评价页 pages/goods/comments/index ← comments/index + t-tag + comments-card(+images-videos)
 * 顶部评价 tab(全部/带图/好评/中评/差评;自己标签 uidCount=0 不显示),tab 切换重置分页重查;
 * 评论卡:头像/昵称/时间/星级/规格信息/文字/图片视频九宫格/店家回复;触底翻页加载
 */
(function () {
  var totalCount = 0; // 数据总量(闭包;源码 Page.data.total 从不更新,滚动判定用总量)

  function formatTime(input, template) {
    template = template || 'YYYY/MM/DD HH:mm';
    var date = new Date(Number(input));
    if (isNaN(date.getTime())) return '';
    function pad2(n) { return n < 10 ? '0' + n : '' + n; }
    var map = {
      YYYY: '' + date.getFullYear(),
      MM: pad2(date.getMonth() + 1),
      DD: pad2(date.getDate()),
      HH: pad2(date.getHours()),
      mm: pad2(date.getMinutes()),
      ss: pad2(date.getSeconds()),
    };
    return template.replace(/YYYY|MM|DD|HH|mm|ss/g, function (token) { return map[token] || token; });
  }

  /* 星级(源码 t-rate:14rpx 星、2rpx 间隙,#ffc51c/#ddd) */
  function rateHtml(score) {
    var s = '';
    var n = Math.max(0, Math.min(5, Number(score) || 0));
    for (var i = 0; i < 5; i++) {
      s += '<i class="wr ' + (i < n ? 'wr-star_filled' : 'wr-star') + '" style="color:' +
        (i < n ? '#ffc51c' : '#ddd') + ';font-size:7px;margin-right:1px;font-style:normal"></i>';
    }
    return s;
  }

  /* 评价图/视频九宫格(等价 images-videos:1 单大图,2 双图,3+ 三列) */
  function resourcesHtml(resources) {
    var arr = Array.isArray(resources) ? resources : [];
    if (!arr.length) return '';
    var cls = arr.length === 1 ? 'single' : (arr.length === 2 ? 'double' : 'multiple');
    var items = '';
    for (var i = 0; i < arr.length; i++) {
      var r = arr[i];
      var inner = r.type === 'video'
        ? '<img class="cm-res-img" src="' + (r.coverSrc || r.src) + '" alt=""/><i class="cm-play">&#9654;</i>'
        : '<img class="cm-res-img" src="' + r.src + '" alt=""/>';
      items += '<div class="cm-res cm-res-' + cls + '">' + inner + '</div>';
    }
    return '<div class="cm-images cm-images-' + cls + '">' + items + '</div>';
  }

  function cardHtml(c) {
    var reply = c.sellerReply
      ? '<div class="comments-card-reply"><span class="prefix">店家回复:</span><span class="content">' +
        c.sellerReply + '</span></div>'
      : '';
    var spec = c.goodsDetailInfo
      ? '<div class="goods-info-text">' + c.goodsDetailInfo + '</div>'
      : '';
    return '<div class="comments-card-item">' +
      '<div class="comments-card-item-container">' +
      '<div class="comments-title">' +
      (c.userHeadUrl ? '<div class="comments-card-item-userImg"><img class="userImg" src="' + c.userHeadUrl + '" alt=""/></div>' : '') +
      '<span class="userName">' + (c.userName || '') + '</span>' +
      '<span class="commentTime">' + c.commentTime + '</span>' +
      '</div>' +
      '<div class="comments-info">' +
      '<span class="rate">' + rateHtml(c.commentScore) + '</span>' + spec +
      '</div>' +
      '<div class="comments-card-item-container-content">' +
      '<div class="content-text">' + c.commentContent + '</div>' +
      '</div>' +
      resourcesHtml(c.commentResources) +
      reply +
      '</div></div>';
  }

  function render() {
    var d = this.data;
    var c = d.countObj || {};
    var cards = '';
    for (var i = 0; i < d.commentList.length; i++) cards += cardHtml(d.commentList[i]);
    var selfTag = String(c.uidCount || '0') !== '0'
      ? '<span class="comments-header-tag' + (d.commentType === '5' ? ' comments-header-active' : '') +
        '" data-commenttype="5">自己(' + c.uidCount + ')</span>'
      : '';
    return '<div class="comments-page">' +
      '<div class="comments-header">' +
      '<span class="comments-header-tag' + (d.commentType === '' ? ' comments-header-active' : '') +
        '" data-commenttype="">全部(' + c.commentCount + ')</span>' + selfTag +
      '<span class="comments-header-tag' + (d.commentType === '4' ? ' comments-header-active' : '') +
        '" data-commenttype="4">带图(' + c.hasImageCount + ')</span>' +
      '<span class="comments-header-tag' + (d.commentType === '3' ? ' comments-header-active' : '') +
        '" data-commenttype="3">好评(' + c.goodCount + ')</span>' +
      '<span class="comments-header-tag' + (d.commentType === '2' ? ' comments-header-active' : '') +
        '" data-commenttype="2">中评(' + c.middleCount + ')</span>' +
      '<span class="comments-header-tag' + (d.commentType === '1' ? ' comments-header-active' : '') +
        '" data-commenttype="1">差评(' + c.badCount + ')</span>' +
      '</div>' +
      '<div class="comments-card-list">' + cards +
      loadMoreHtml(d.loadMoreStatus) +
      '</div></div>';
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

  function buildParams(reset) {
    var d = APP.instances['/pages/goods/comments/index'].data;
    var params = { pageNum: 1, pageSize: 30, queryParameter: { spuId: d.spuId } };
    if (d.commentLevel === '1' || d.commentLevel === '2' || d.commentLevel === '3') {
      params.queryParameter.commentLevel = Number(d.commentLevel);
    }
    if (d.hasImage && d.hasImage === '1') params.queryParameter.hasImage = true;
    if (reset) return params;
    params.pageNum = d.pageNum + 1;
    params.pageSize = d.pageSize;
    return params;
  }

  /* 拉取评论(等价 Page.init) */
  function query(reset) {
    var inst = APP.instances['/pages/goods/comments/index'];
    if (inst.data.loadMoreStatus !== 0) return Promise.resolve();
    inst.setData({ loadMoreStatus: 1 });
    var params = buildParams(reset);
    return SVC.fetchComments(params).then(function (data) {
      var pageList = data && Array.isArray(data.pageList) ? data.pageList : [];
      var total = data && data.totalCount != null ? Number(data.totalCount) : pageList.length;
      pageList.forEach(function (item) {
        item.commentTime = formatTime(item.commentTime, 'YYYY/MM/DD HH:mm');
      });
      if (total === 0 && reset) {
        inst.setData({ commentList: [], hasLoaded: true, totalCount: 0, loadMoreStatus: 2 });
        return;
      }
      var next = reset ? pageList : inst.data.commentList.concat(pageList);
      totalCount = total;
      inst.setData({
        commentList: next,
        pageNum: params.pageNum || 1,
        totalCount: total,
        loadMoreStatus: next.length === total ? 2 : 0,
        hasLoaded: true,
      });
    }).catch(function () {
      inst.setData({ hasLoaded: true, loadMoreStatus: 0 });
    });
  }

  /* tab 切换(等价 changeTag;'5' 自己-源码无数据源) */
  function changeTag(ct) {
    var inst = APP.instances['/pages/goods/comments/index'];
    if (inst.data.commentType === ct) return;
    inst.setData({
      loadMoreStatus: 0,
      commentList: [],
      pageNum: 1,
      hasLoaded: false,
    });
    if (ct === '' || ct === '5') {
      inst.setData({ hasImage: '', commentLevel: '' });
    } else if (ct === '4') {
      inst.setData({ hasImage: '1', commentLevel: '' });
    } else {
      inst.setData({ hasImage: '', commentLevel: ct });
    }
    inst.setData({ commentType: ct });
    if (ct !== '5') query(true);
  }

  function onTap(e) {
    var target = e.target.closest('[data-commenttype]');
    if (!target) return;
    changeTag(target.getAttribute('data-commenttype'));
  }

  /* 触底翻页(等价 onReachBottom) */
  var scrollInited = false;
  function initScroll() {
    if (scrollInited) return;
    scrollInited = true;
    function onScroll() {
      var inst = APP.instances['/pages/goods/comments/index'];
      if (!inst || !inst.data.hasLoaded) return;
      if (APP.cur && APP.cur.path !== '/pages/goods/comments/index') return;
      if (inst.data.commentList.length >= totalCount && inst.data.commentList.length) {
        if (inst.data.loadMoreStatus !== 2) inst.setData({ loadMoreStatus: 2 });
        return;
      }
      if (inst.data.loadMoreStatus !== 0) return;
      var doc = document.documentElement;
      if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 5) query(false);
    }
    window.addEventListener('scroll', onScroll);
    if (APP.__stopCommentsScroll) APP.__stopCommentsScroll();
    APP.__stopCommentsScroll = function () {
      window.removeEventListener('scroll', onScroll);
      scrollInited = false;
    };
  }

  APP.reg('/pages/goods/comments/index', {
    title: '全部评价',
    nav: 'default',
    reinitOnQuery: true,
    data: {
      pageLoading: false,
      commentList: [],
      pageNum: 1,
      myPageNum: 1,
      pageSize: 10,
      total: 0,
      myTotal: 0,
      hasLoaded: false,
      layoutText: 'vertical',
      loadMoreStatus: 0,
      myLoadStatus: 0,
      spuId: '1060004',
      commentLevel: '',
      hasImage: '',
      commentType: '',
      totalCount: 0,
      countObj: {
        badCount: '0',
        commentCount: '0',
        goodCount: '0',
        middleCount: '0',
        hasImageCount: '0',
        uidCount: '0',
      },
    },
    init: function (queryOptions) {
      var inst = this;
      var options = queryOptions || {};
      var spuId = options.spuId || '';
      var commentLevel = options.commentLevel || '';
      var hasImage = options.hasImage || '';
      inst.setData({
        spuId: spuId,
        commentLevel: commentLevel !== '' && commentLevel !== '-1' ? commentLevel : inst.data.commentLevel,
        hasImage: hasImage || '',
        commentType: hasImage ? '4' : '',
      });
      initScroll();
      SVC.fetchCommentsCount().then(function (res) {
        if (res && typeof res === 'object') inst.setData({ countObj: res });
      }).catch(function () {});
      if (spuId) return query(true);
      return Promise.resolve(inst);
    },
    render: render,
    events: function (root) {
      root.addEventListener('click', onTap);
    },
    destroy: function () {
      if (APP.__stopCommentsScroll) APP.__stopCommentsScroll();
    },
  });
})();
