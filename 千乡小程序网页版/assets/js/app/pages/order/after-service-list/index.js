/* 退款/售后列表页 pages/order/after-service-list/index ← 源 after-service-list(index.js/wxml/wxss) + order-card/goods-card/after-service-button-bar
 * tabs:全部-1/待审核10/已审核20/已完成50/已关闭60(源 js 有 tabs 逻辑但 wxml 未渲染 tab 栏,web 补齐,query.status 直达)
 * 卡片:店名+右侧 类型(退货/退款 图标) → 商品行(底部 退款金额 + x数量) → 灰底状态说明 → 服务按钮行
 * 服务按钮 type:2 撤销(确认→cancelRights 本地置关闭)→ 3 填写运单号 / 4 修改运单号 → fill-tracking-no;5 查看物流 → delivery-detail?source=2
 * 分页每页 10;源 getRightsList pageNum>3 返回空;onReachBottom → 滚动触底续载
 * 1:1 保留源 mapping quirks:goodsList.rightsQuantity 误取 itemRefundAmount → 数量列显示 x {退款金额}(列表每商品行仅 1 行价格即 itemRefundAmount)
 * 下拉刷新源 t-pull-down-refresh web 不实现;空态文案 '暂无退款或售后申请记录'
 */
(function () {
  var instRef = null;
  var TABS = [
    { key: -1, text: '全部' },
    { key: 10, text: '待审核' },
    { key: 20, text: '已审核' },
    { key: 50, text: '已完成' },
    { key: 60, text: '已关闭' },
  ];
  function goodsRow(g) {
    return '<div class="as-grow">' +
      '<div class="ol-thumb"><img src="' + g.thumb + '" alt="" loading="lazy" onerror="this.parentNode.style.visibility=\'hidden\'"/></div>' +
      '<div class="as-gbd">' +
      '<div class="ol-title">' + g.title + '</div>' +
      (g.specs && g.specs.length ? '<div class="ol-specs">' + g.specs.join(',') + '</div>' : '') +
      '</div>' +
      '<div class="as-gside">' +
      '<div class="as-gamt">' + UP.ph(g.itemRefundAmount, 'as-g-price') + '</div>' +
      '<div class="as-gnum">x&nbsp;' + g.num + '</div>' +
      '</div></div>';
  }
  function serviceBtnHtml(b, no) {
    return '<div class="srv-btn' + (b.primary ? ' srv-btn--primary' : '') + '" data-sbt="' + b.type + '" data-sno="' + no + '">' + b.name + '</div>';
  }
  function cardHtml(o) {
    var goods = (o.goodsList || []).map(goodsRow).join('');
    var btns = (o.buttons || []).map(function (b) { return serviceBtnHtml(b, o.id); }).join('');
    return '<div class="as-card" data-no="' + o.id + '">' +
      '<div class="as-hd">' +
      '<div class="as-sn"><i class="wr wr-store"></i><span class="as-sn-t">' + o.storeName + '</span></div>' +
      '<div class="as-rt"><i class="wr wr-goods_refund"></i>' + o.typeDesc + '</div>' +
      '</div>' +
      '<div class="as-goods">' + goods + '</div>' +
      '<div class="as-more">' +
      '<div class="as-cond">' + o.statusDesc + '</div>' +
      (btns ? '<div class="as-btns">' + btns + '</div>' : '') +
      '</div></div>';
  }
  function render() {
    var d = this.data;
    var tabsHtml = TABS.map(function (t) {
      return '<div class="ol-tab' + (t.key === d.curTab ? ' on' : '') + '" data-tab="' + t.key + '">' + t.text + '</div>';
    }).join('');
    var body;
    if (d.listLoading === 1 && !d.dataList.length) {
      body = '<div class="ol-empty"><div class="ol-loading-spin"></div><div class="ol-empty-txt">加载中...</div></div>';
    } else if (!d.dataList.length && d.listLoading !== 3) {
      body = '<div class="ol-empty">' +
        '<img class="ol-empty-img" src="https://tdesign.gtimg.com/miniprogram/template/retail/order/empty-order-list.png" alt="" onerror="this.style.display=\'none\'"/>' +
        '<div class="ol-empty-txt">暂无退款或售后申请记录</div></div>';
    } else if (!d.dataList.length && d.listLoading === 3) {
      body = '<div class="ol-empty"><div class="ol-empty-txt">加载失败</div>' +
        '<div class="ol-btn ol-btn--line" data-retry="1">点击重试</div></div>';
    } else {
      body = '<div class="as-cards">' + d.dataList.map(cardHtml).join('') + '</div>' +
        (d.more
          ? '<div class="ol-more"><div class="ol-loading-spin"></div><span>加载中...</span></div>'
          : '<div class="ol-more ol-more--end">没有更多了</div>');
    }
    return '<div class="as-page">' +
      '<div class="as-tabs">' + tabsHtml + '</div>' +
      body + '</div>';
  }
  function fetchList(status, reset) {
    var inst = instRef;
    var params = { parameter: { pageSize: 10, pageNum: inst.asPage.num } };
    if (status !== -1) params.parameter.afterServiceStatus = status;
    inst.data.listLoading = 1;
    inst.refresh();
    return SVC.fetchAfterRightsList(params).then(function (res) {
      var rd = res && res.data;
      var rows = ((rd && rd.dataList) || []).map(function (x) {
        var rights = x.rights || {};
        return {
          id: rights.rightsNo,
          serviceNo: rights.rightsNo,
          storeName: rights.storeName,
          type: rights.rightsType,
          typeDesc: rights.rightsType === 10 ? '退货' : (rights.rightsType === 30 ? '支付后取消' : '退款'),
          status: rights.rightsStatus,
          statusName: rights.userRightsStatusName,
          statusDesc: rights.userRightsStatusDesc,
          amount: rights.refundAmount,
          goodsList: (x.rightsItem || []).map(function (item, i) {
            return {
              id: i,
              thumb: item.goodsPictureUrl,
              title: item.goodsName,
              specs: (item.specInfo || []).map(function (s) { return s.specValues || ''; }),
              itemRefundAmount: item.itemRefundAmount,
              /* 源 mapping 将 rightsQuantity 误取为 itemRefundAmount → 行内数量即退款金额(1:1) */
              num: item.itemRefundAmount,
            };
          }),
          buttons: x.buttonVOs || [],
          logisticsNo: (x.logisticsVO || {}).logisticsNo,
          logisticsCompanyName: (x.logisticsVO || {}).logisticsCompanyName,
          logisticsCompanyCode: (x.logisticsVO || {}).logisticsCompanyCode,
          remark: (x.logisticsVO || {}).remark,
          logisticsVO: x.logisticsVO,
        };
      });
      if (reset) inst.data.dataList = [];
      inst.asPage.num++;
      inst.data.dataList = inst.data.dataList.concat(rows);
      inst.data.more = rows.length === 10;
      inst.data.listLoading = rows.length || inst.data.dataList.length ? 0 : 2;
      inst.refresh();
      return inst;
    }).catch(function () {
      inst.data.listLoading = 3;
      inst.refresh();
      return inst;
    });
  }
  function refreshTab(status) {
    var inst = instRef;
    inst.asPage = { num: 1 };
    inst.data.curTab = status;
    inst.data.dataList = [];
    return fetchList(status, true);
  }
  function onScroll() {
    var inst = instRef;
    if (!inst || inst.data.listLoading === 1 || inst.data.listLoading === 2 || !inst.data.dataList.length) return;
    var doc = document.documentElement;
    if (window.innerHeight + (window.scrollY || 0) >= (doc.scrollHeight || 0) - 60) {
      fetchList(inst.data.curTab, false);
    }
  }
  /* 服务按钮分发(对齐源 after-service-button-bar/index.js) */
  function handleSvcBt(e) {
    var t = e.target.closest('[data-sbt]');
    if (!t) return;
    var type = Number(t.getAttribute('data-sbt'));
    var no = t.getAttribute('data-sno');
    var inst = instRef;
    var svc = inst.data.dataList.filter(function (o) { return String(o.id) === String(no); })[0];
    if (!svc) return;
    if (type === 2) {
      wx.showModal({
        title: '是否撤销退货申请？',
        content: '',
        confirmText: '撤销申请',
        cancelText: '不撤销',
      }).then(function (r) {
        if (!r.confirm) return;
        SVC.cancelRights({ rightsNo: svc.id }).then(function () {
          wx.showToast({ title: '你确认撤销申请', icon: 'none' });
          return refreshTab(inst.data.curTab);
        });
      });
    } else if (type === 3) {
      APP.go('/pages/order/fill-tracking-no/index?rightsNo=' + encodeURIComponent(svc.id), 'push');
    } else if (type === 4) {
      APP.go('/pages/order/fill-tracking-no/index?rightsNo=' + encodeURIComponent(svc.id) +
        '&logisticsNo=' + encodeURIComponent(svc.logisticsNo || '') +
        '&logisticsCompanyName=' + encodeURIComponent(svc.logisticsCompanyName || '') +
        '&logisticsCompanyCode=' + encodeURIComponent(svc.logisticsCompanyCode || '') +
        '&remark=' + encodeURIComponent(svc.remark || ''), 'push');
    } else if (type === 5) {
      APP.go('/pages/order/delivery-detail/index?data=' +
        encodeURIComponent(JSON.stringify(svc.logisticsVO || svc.logistics)) + '&source=2', 'push');
    }
  }
  function onTap(e) {
    var t = e.target.closest('[data-tab],[data-sbt],[data-retry],[data-no]');
    if (!t) return;
    var inst = instRef;
    var tab = t.getAttribute('data-tab');
    if (tab != null) {
      var k = Number(tab);
      if (inst.data.curTab !== k) refreshTab(k);
    } else if (t.getAttribute('data-retry') != null) {
      fetchList(inst.data.curTab, true);
    } else if (t.getAttribute('data-sbt') != null) {
      e.stopPropagation();
      handleSvcBt(e);
    } else if (t.hasAttribute('data-no')) {
      APP.go('/pages/order/after-service-detail/index?rightsNo=' + encodeURIComponent(t.getAttribute('data-no')), 'push');
    }
  }

  APP.reg('/pages/order/after-service-list/index', {
    title: '退款/售后',
    nav: 'default',
    reinitOnQuery: true,
    data: { curTab: -1, dataList: [], listLoading: 0, more: false },
    init: function (query) {
      var inst = this;
      instRef = inst;
      var qs = query && query.status != null ? parseInt(query.status, 10) : -1;
      inst.data.curTab = TABS.some(function (t) { return t.key === qs; }) ? qs : -1;
      inst.asPage = { num: 1 };
      inst.data.dataList = [];
      inst._skipShowOnce = true; /* init 后的首次 show 不重拉(数据已在 init 加载) */
      window.addEventListener('scroll', onScroll, { passive: true });
      return fetchList(inst.data.curTab, true);
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
    show: function () {
      /* 新申请/撤销可能发生在他页:从其它页面返回本页时静默刷新当前 tab(不置 loading,避免闪烁)
       * 需走 refreshTab 复位分页页码:APP 单页可能触发两次 startInstance/show,
       * 裸 fetchList(reset) 会带着递增后的 pageNum 重拉而清空列表 */
      if (this._skipShowOnce) { this._skipShowOnce = false; return; }
      var inst = this;
      instRef = inst;
      refreshTab(inst.data.curTab);
    },
    leave: function () {
      window.removeEventListener('scroll', onScroll);
    },
  });
})();
