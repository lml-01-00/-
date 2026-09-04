/* 我的订单页 pages/order/order-list/index ← 源 order-list(index.js/wxml/wxss) + order-card/order-button-bar/specs-goods-card
 * tabs:全部/待付款/待发货/待收货/已完成(仅源 getOrdersCount 更新 info,徽标源未渲染 → web 不显)
 * 分页:源 onReachBottom 兜底逻辑 orderList.length>0 恒 0 会空翻页死循环,web 按"当页取满则续载"判定
 * 卡片点击 → order-detail?orderNo;按钮按 type 分发(源多为 Toast 提示,1:1)
 * DELETE:源 onDelete 方法缺失(点击即报错),web 补齐确认删除(本地移除,刷新后按 mock 重现)
 */
(function () {
  var instRef = null;
  var TABS = [
    { key: -1, text: '全部' },
    { key: 5, text: '待付款' },
    { key: 10, text: '待发货' },
    { key: 40, text: '待收货' },
    { key: 50, text: '已完成' },
  ];
  function orderNoHtml(o) {
    return '<span class="ol-no-label">订单号&nbsp;</span>' + o.orderNo;
  }
  function goodsHtml(g) {
    return '<div class="ol-good">' +
      '<div class="ol-thumb"><img src="' + g.thumb + '" alt="" onerror="this.parentNode.style.visibility=\'hidden\'"/></div>' +
      '<div class="ol-gbd">' +
      '<div class="ol-gmain"><div class="ol-title">' + g.title + '</div>' +
      (g.specs && g.specs.length ? '<div class="ol-specs">' + g.specs.join(',') + '</div>' : '') +
      '</div>' +
      '<div class="ol-gside">' +
      UP.ph(g.price, 'ol-g-price') +
      '<div class="ol-num">x&nbsp;' + g.num + '</div>' +
      '</div></div></div>';
  }
  function orderCard(o) {
    var goods = o.goodsList.map(function (g) { return goodsHtml(g); }).join('');
    var leftBtns = (o.buttons || []).filter(function (b) { return b.type === 7; });
    var rightBtns = (o.buttons || []).filter(function (b) { return b.type !== 7; });
    var rightHtml = rightBtns.map(function (b) {
      return '<div class="ol-btn' + (b.primary ? ' ol-btn--primary' : ' ol-btn--line') + '" data-bt="' + b.type + '" data-orderno="' + o.orderNo + '">' + b.name + '</div>';
    }).join('');
    return '<div class="ol-card" data-no="' + o.orderNo + '">' +
      '<div class="ol-hd">' +
      '<div class="ol-no">' + orderNoHtml(o) + '</div>' +
      '<div class="ol-st">' + o.statusDesc + '</div>' +
      '</div>' +
      '<div class="ol-goods">' + goods + '</div>' +
      '<div class="ol-foot">' +
      '<div class="ol-total"><span>总价</span>' + UP.ph(o.totalAmount) + '<span class="ol-freight">，运费</span>' +
      UP.ph(o.freightFee) + '<span class="ol-paid-lb">实付&nbsp;</span>' + UP.ph(o.amount, 'ol-paid') + '</div>' +
      (leftBtns.length || rightBtns.length
        ? '<div class="ol-btns">' +
          (leftBtns.map(function (b) { return '<div class="ol-btn ol-btn--ghost" data-bt="' + b.type + '" data-orderno="' + o.orderNo + '">' + b.name + '</div>'; }).join('')) +
          '<div class="ol-btns-r">' + rightHtml + '</div></div>'
        : '') +
      '</div></div>';
  }
  function render() {
    var d = this.data;
    var tabsHtml = TABS.map(function (t) {
      return '<div class="ol-tab' + (t.key === d.curTab ? ' on' : '') + '" data-tab="' + t.key + '">' + t.text + '</div>';
    }).join('');
    var body = '';
    if (d.listLoading === 1) {
      body = '<div class="ol-empty"><div class="ol-loading-spin"></div><div class="ol-empty-txt">加载中...</div></div>';
    } else if (!d.orderList.length) {
      body = '<div class="ol-empty">' +
        '<img class="ol-empty-img" src="https://tdesign.gtimg.com/miniprogram/template/retail/order/empty-order-list.png" alt="" onerror="this.style.display=\'none\'"/>' +
        '<div class="ol-empty-txt">暂无相关订单</div></div>';
    } else {
      body = '<div class="ol-cards">' + d.orderList.map(orderCard).join('') + '</div>' +
        (d.more
          ? '<div class="ol-more"><div class="ol-loading-spin"></div><span>加载中...</span></div>'
          : '<div class="ol-more ol-more--end">没有更多了</div>');
    }
    return '<div class="ol-page">' +
      '<div class="ol-tabs">' + tabsHtml + '</div>' +
      body + '</div>';
  }
  function toastOk(title) {
    wx.showToast({ title: title, icon: 'success' });
  }
  /* 源 onCancel/onPay/onBuyAgain 均为提示 Toast */
  function handleBt(e) {
    var b = e.target.closest('[data-bt]');
    if (!b) return;
    var type = Number(b.getAttribute('data-bt'));
    var orderNo = b.getAttribute('data-orderno');
    var order = instRef.data.orderList.filter(function (o) { return o.orderNo === orderNo; })[0];
    if (!order) return;
    if (type === 1) {
      toastOk('你点击了去支付');
    } else if (type === 2) {
      toastOk('你点击了取消订单');
    } else if (type === 3) {
      /* 源 confirmDialog then/catch → 两条 Toast */
      wx.showModal({
        title: '确认是否已经收到货？',
        content: '',
        confirmText: '确认收货',
        cancelText: '取消',
      }).then(function (r) {
        toastOk(r.confirm ? '你确认了确认收货' : '你取消了确认收货');
      });
    } else if (type === 4) {
      /* 源 onApplyRefund:单级无 goodsIndex,sku 走兜底值 */
      var g0 = order.goodsList[0] || {};
      var q = 'orderNo=' + orderNo + '&skuId=' + (g0.skuId || '19384938948343') + '&spuId=' + (g0.spuId || '28373847384343') +
        '&orderStatus=' + order.status + '&logisticsNo=' + order.logisticsNo + '&price=' + (g0.price || 89) +
        '&num=' + (g0.num || 89) + '&createTime=' + order.createTime + '&orderAmt=' + order.totalAmount +
        '&payAmt=' + order.amount + '&canApplyReturn=true';
      APP.go('/pages/order/apply-service/index?' + q, 'push');
    } else if (type === 7) {
      /* web 补齐:源 onDelete 方法缺失,此处确认后本地移除 */
      wx.showModal({
        title: '删除订单',
        content: '确定删除该订单吗？',
        confirmText: '删除',
      }).then(function (r) {
        if (!r.confirm) return;
        instRef.data.orderList = instRef.data.orderList.filter(function (o) { return o.orderNo !== orderNo; });
        if (!instRef.data.orderList.length) instRef.data.more = false;
        instRef.refresh();
        toastOk('订单已删除');
      });
    } else if (type === 9) {
      toastOk('你点击了再次购买');
    }
  }
  function onTap(e) {
    var t = e.target.closest('[data-act],[data-tab],[data-no],[data-bt]');
    if (!t) return;
    var tab = t.getAttribute('data-tab');
    var bt = t.getAttribute('data-bt');
    if (tab != null) {
      switchTab(Number(tab));
    } else if (bt != null) {
      e.stopPropagation();
      handleBt(e);
    } else if (t.hasAttribute('data-no')) {
      var no = t.getAttribute('data-no');
      APP.go('/pages/order/order-detail/index?orderNo=' + encodeURIComponent(no), 'push');
    }
  }
  function switchTab(key) {
    if (instRef.data.curTab === key) return;
    instRef.data.curTab = key;
    refreshList();
  }
  function refreshList() {
    var inst = instRef;
    inst.data.orderList = [];
    inst.data.listLoading = 1;
    inst.ol = { num: 1, size: 5 };
    inst.data.more = false;
    inst.refresh();
    return loadNext().then(function () {
      /* fetchOrdersCount 对齐源(仅更新 info,未渲染) */
      return SVC.fetchOrdersCount().then(function () { return inst; });
    });
  }
  function loadNext() {
    var inst = instRef;
    var st = inst.data.curTab;
    var params = { parameter: { pageSize: inst.ol.size, pageNum: inst.ol.num } };
    if (st !== -1) params.parameter.orderStatus = st;
    inst.data.listLoading = 1;
    return SVC.fetchOrders(params).then(function (res) {
      var rows = ((res && res.data && res.data.orders) || []).map(function (order) {
        return {
          id: order.orderId,
          orderNo: order.orderNo,
          parentOrderNo: order.parentOrderNo,
          storeId: order.storeId,
          storeName: order.storeName,
          status: order.orderStatus,
          statusDesc: order.orderStatusName,
          amount: order.paymentAmount,
          totalAmount: order.totalAmount,
          logisticsNo: (order.logisticsVO || {}).logisticsNo,
          createTime: order.createTime,
          goodsList: (order.orderItemVOs || []).map(function (goods) {
            return {
              id: goods.id,
              thumb: goods.goodsPictureUrl,
              title: goods.goodsName,
              skuId: goods.skuId,
              spuId: goods.spuId,
              specs: (goods.specifications || []).map(function (s) { return s.specValue; }).filter(Boolean),
              price: goods.tagPrice ? goods.tagPrice : goods.actualPrice,
              num: goods.buyQuantity,
              titlePrefixTags: goods.tagText ? [{ text: goods.tagText }] : [],
            };
          }),
          buttons: order.buttonVOs || [],
          groupInfoVo: order.groupInfoVo,
          freightFee: order.freightFee,
        };
      });
      inst.ol.num++;
      inst.data.orderList = inst.data.orderList.concat(rows);
      inst.data.more = rows.length === inst.ol.size;
      inst.data.listLoading = 0;
      inst.refresh();
      return inst;
    });
  }
  function onScroll() {
    var inst = instRef;
    if (!inst || inst.data.listLoading === 1 || !inst.data.more) return;
    var doc = document.documentElement;
    if (window.innerHeight + (window.scrollY || 0) >= (doc.scrollHeight || 0) - 60) {
      loadNext();
    }
  }

  APP.reg('/pages/order/order-list/index', {
    title: '我的订单',
    nav: 'default',
    reinitOnQuery: true,
    data: { curTab: -1, orderList: [], listLoading: 1, more: false },
    init: function (query) {
      var inst = this;
      instRef = inst;
      var qs = query && query.status != null ? parseInt(query.status, 10) : -1;
      inst.data.curTab = TABS.some(function (t) { return t.key === qs; }) ? qs : -1;
      inst.ol = { num: 1, size: 5 };
      inst.data.listLoading = 1;
      inst.data.orderList = [];
      inst.data.more = false;
      window.addEventListener('scroll', onScroll, { passive: true });
      return loadNext().then(function () {
        return SVC.fetchOrdersCount().then(function () { return inst; });
      });
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
    leave: function () {
      window.removeEventListener('scroll', onScroll);
    },
  });
})();
