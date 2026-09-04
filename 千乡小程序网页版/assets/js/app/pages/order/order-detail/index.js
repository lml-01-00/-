/* 订单详情页 pages/order/order-detail/index ← 源 order-detail(index.js/wxml/wxss) + order-card/order-goods-card/order-button-bar
 * header 状态区(status 白字 + desc:待付款倒计时/其余 orderStatusRemark)+ 物流卡(首个节点)+ 收货地址(可编辑时 修改)
 * 金额明细:商品总额/运费/活动优惠/优惠券/应付|实付(按 paymentVO.paySuccessTime)
 * 订单信息卡:订单编号(复制)/下单时间/发票(查看)/备注/联系客服(storeDetail.storeTel)
 * 按钮分发同列表;地址修改走 ADDR_SELECT 桥(选择返回回填)
 * 源 onGoodsCardTap→商品详情 / onDeliveryClick→delivery-detail / 发票查看→invoice 为未转换页面,暂保留原路由语义
 */
(function () {
  var instRef = null;
  var APP_CUR = '/pages/order/order-detail/index';
  function cdPad(n) { return n < 10 ? '0' + n : '' + n; }
  function countdownText(ms) {
    if (ms == null || ms <= 0) return '';
    var s = Math.ceil(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return cdPad(h) + '小时' + cdPad(m) + '分' + cdPad(sec) + '秒';
  }
  function goodHtml(g) {
    return '<div class="od-grow" data-spu="' + g.spuId + '">' +
      '<div class="od-grow-main">' +
      '<div class="ol-thumb"><img src="' + g.thumb + '" alt="" onerror="this.parentNode.style.visibility=\'hidden\'"/></div>' +
      '<div class="ol-gbd">' +
      '<div class="ol-gmain"><div class="ol-title">' + g.title + '</div>' +
      (g.specs && g.specs.length ? '<div class="ol-specs">' + g.specs.join(',') + '</div>' : '') +
      '</div>' +
      '<div class="ol-gside">' +
      UP.ph(g.price, 'ol-g-price') +
      '<div class="ol-num">x&nbsp;' + g.num + '</div>' +
      '</div></div>' +
      '</div>' +
      (g.buttons.length
        ? '<div class="od-gbar"><div class="ol-btn ol-btn--line" data-gbt="4" data-gidx="' + g.gi + '">' + g.buttons[0].name + '</div></div>'
        : '') +
      '</div>';
  }
  function render() {
    var d = this.data;
    var o = d.order || {};
    var v = d._order || {};
    var heroDesc = '';
    /* 倒计时以结束时刻推算,缓存重入/后台停留后仍准确 */
    var cd = d.countDownTime;
    if (cd != null && cd > 0 && this._cdEnd) cd = Math.max(0, this._cdEnd - Date.now());
    if (o.holdStatus === 1) {
      heroDesc = '拼团进行中';
    } else if (d.countDownTime == null) {
      heroDesc = o.orderStatusRemark || '';
    } else if (cd > 0) {
      heroDesc = '剩 <span class="od-cd" id="odCd">' + countdownText(cd) + '</span> 支付，过时订单将会取消';
    } else {
      heroDesc = '超时未支付';
    }
    var logi = d.logisticsNodes[0];
    var addrRow = o.logisticsVO || {};
    var payItem = function (label, rightHtml, rightCls) {
      return '<div class="od-payrow"><span>' + label + '</span><span class="od-payv' + (rightCls ? ' ' + rightCls : '') + '">' + rightHtml + '</span></div>';
    };
    var hasPay = !!o.paymentVO && !!o.paymentVO.paySuccessTime;
    return '<div class="od-page">' +
      /* 顶部白段:hero 状态卡 + 物流 + 收货地址(源 .header) */
      '<div class="od-hwrap">' +
      '<div class="od-hero"><div class="od-hero-t">' + v.statusDesc + '</div>' +
      '<div class="od-hero-d">' + heroDesc + '</div></div>' +
      /* 物流(首节点)+ 收货地址 */
      (logi
        ? '<div class="od-logi" data-act="logi"><i class="wr wr-deliver od-lico"></i>' +
          '<div class="od-lbd"><div>' + logi.desc + '</div><div class="od-ltime">' + logi.date + '</div></div>' +
          '<i class="wr wr-arrow_forward od-larr"></i></div>' +
          '<div class="od-sep"></div>'
        : '') +
      '<div class="od-logi"><i class="wr wr-location od-lico"></i>' +
      '<div class="od-lbd"><div>' + (addrRow.receiverName || '') + ' ' + (addrRow.receiverPhone || '') + '</div>' +
      '<div class="od-ltime">' + v.receiverAddress + '</div></div>' +
      (d.addressEditable ? '<div class="od-edit" data-act="editAddr">修改</div>' : '') +
      '</div>' +
      '</div>' +
      /* 店铺 + 商品 + 金额卡 */
      '<div class="od-card">' +
      '<div class="od-store"><i class="wr wr-store od-slogo"></i><span class="od-sname">' + v.storeName + '</span></div>' +
      '<div class="od-goods">' + (v.goodsList || []).map(goodHtml).join('') + '</div>' +
      '<div class="od-sep"></div>' +
      '<div class="od-pay">' +
      payItem('商品总额', UP.ph(o.totalAmount || '0', 'od-fw')) +
      payItem('运费', o.freightFee ? '+' + UP.ph(o.freightFee, 'od-fw') : '<span>免运费</span>', 'od-fw') +
      payItem('活动优惠', o.discountAmount ? '-' + UP.ph(o.discountAmount || 0) : '-' + UP.ph(0), 'od-red') +
      payItem('优惠券', o.couponAmount ? '-' + UP.ph(o.couponAmount) : '<span>无可用</span>') +
      payItem(hasPay ? '实付' : '应付', UP.ph(o.paymentAmount || '0', 'od-fw'), 'od-red') +
      '</div></div>' +
      /* 订单信息卡 */
      '<div class="od-card od-info">' +
      '<div class="od-irow"><span>订单编号</span><span class="od-ir" data-act="copyNo"><b class="od-no">' + o.orderNo + '</b><span class="od-cp">复制</span></span></div>' +
      '<div class="od-irow"><span>下单时间</span><span class="od-ir"><b class="od-no">' + d.formatCreateTime + '</b></span></div>' +
      '<div class="od-sep"></div>' +
      '<div class="od-irow"><span>发票</span><span class="od-ir" data-act="invoice"><b class="od-no">' + d.invoiceType + '</b><span class="od-cp">查看</span></span></div>' +
      '<div class="od-irow"><span>备注</span><span class="od-ir"><b class="od-no">' + (o.remark || '-') + '</b></span></div>' +
      '<div class="od-sep"></div>' +
      (d.storeTel
        ? '<div class="od-service" data-act="service"><i class="wr wr-service" style="font-size:20px"></i><span>&nbsp;联系客服</span></div>'
        : '') +
      '</div></div>' +
      /* 底部操作栏(有按钮时;fixed 独立于页面流) */
      (v.buttons && v.buttons.length
        ? '<div class="od-bbar"><div class="od-bbar-in">' +
          (v.buttons.filter(function (b) { return b.type === 7; }).map(function (b) {
            return '<div class="ol-btn ol-btn--ghost" data-bt="7">' + b.name + '</div>';
          }).join('')) +
          '<span class="od-bbar-r">' +
          v.buttons.filter(function (b) { return b.type !== 7; }).map(function (b) {
            return '<div class="ol-btn ol-btn--lg' + (b.primary ? ' ol-btn--primary' : ' ol-btn--line') + '" data-bt="' + b.type + '">' + b.name + '</div>';
          }).join('') +
          '</span></div></div>'
        : '');
  }
  function toastOk(t) { wx.showToast({ title: t, icon: 'success' }); }
  /* 源组件按钮分发(单级 order / 商品级 goods) */
  function handleOrderBt(type, gidx) {
    var inst = instRef;
    var v = inst.data._order;
    var o = inst.data.order || {};
    if (type === 1) {
      toastOk('你点击了去支付');
    } else if (type === 2) {
      toastOk('你点击了取消订单');
    } else if (type === 3) {
      wx.showModal({
        title: '确认是否已经收到货？',
        content: '',
        confirmText: '确认收货',
        cancelText: '取消',
      }).then(function (r) {
        toastOk(r.confirm ? '你确认了确认收货' : '你取消了确认收货');
      });
    } else if (type === 4) {
      var goods = gidx == null ? null : (v.goodsList || [])[gidx];
      var q = 'orderNo=' + v.orderNo +
        '&skuId=' + ((goods && goods.skuId) || '19384938948343') +
        '&spuId=' + ((goods && goods.spuId) || '28373847384343') +
        '&orderStatus=' + v.status + '&logisticsNo=' + v.logisticsNo +
        '&price=' + ((goods && goods.price) || 89) + '&num=' + ((goods && goods.num) || 89) +
        '&createTime=' + v.createTime + '&orderAmt=' + v.totalAmount + '&payAmt=' + v.amount + '&canApplyReturn=true';
      APP.go('/pages/order/apply-service/index?' + q, 'push');
    } else if (type === 7) {
      /* web 补齐:源 onDelete 缺失,确认后移除订单并返回列表
       * 与列表本地删除同语义(刷新后按 mock 重现):同步过滤已缓存列表实例,
       * 仅改 data 不 refresh——返回列表渲染时自然消费新数据 */
      wx.showModal({
        title: '删除订单',
        content: '确定删除该订单吗？',
        confirmText: '删除',
      }).then(function (r) {
        if (!r.confirm) return;
        var li = APP.instances['/pages/order/order-list/index'];
        if (li && li.data && li.data.orderList) {
          li.data.orderList = li.data.orderList.filter(function (o) { return o.orderNo !== v.orderNo; });
          if (!li.data.orderList.length) li.data.more = false;
        }
        toastOk('订单已删除');
        setTimeout(function () { APP.back(1); }, 500);
      });
    } else if (type === 9) {
      toastOk('你点击了再次购买');
    }
  }
  function onTap(e) {
    var t = e.target.closest('[data-act],[data-bt],[data-gbt],[data-spu]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    var bt = t.getAttribute('data-bt');
    var gbt = t.getAttribute('data-gbt');
    var spu = t.getAttribute('data-spu');
    var inst = instRef;
    if (act === 'copyNo') {
      wx.setClipboardData({
        data: inst.data.order.orderNo,
        success: function () { wx.showToast({ title: '复制成功', icon: 'success' }); },
      });
    } else if (act === 'invoice') {
      APP.go('/pages/order/invoice/index?orderNo=' + encodeURIComponent(inst.data._order.orderNo), 'push');
    } else if (act === 'service') {
      toastOk('您点击了联系客服');
    } else if (act === 'editAddr') {
      /* 源:先挂地址选择回填,再进地址列表选择模式 */
      SVC.ADDR_SELECT.wait().then(function (addr) {
        var d = inst.data;
        if (d.order && d.order.logisticsVO) {
          d.order.logisticsVO.receiverName = addr.name;
          d.order.logisticsVO.receiverPhone = addr.phone;
        }
        if (d._order) d._order.receiverAddress = addr.address || addr.provinceName + addr.cityName + addr.districtName + addr.detailAddress;
        if (APP.cur && APP.cur.path === APP_CUR) inst.refresh();
      }).catch(function () {});
      APP.go('/pages/user/address/list/index?selectMode=1', 'push');
    } else if (act === 'logi') {
      /* 源 onDeliveryClick → delivery-detail?data=(轨迹序列化);页面未转换,保留路由语义 */
      var nodes = inst.data.logisticsNodes || [];
      var lv = (inst.data.order && inst.data.order.logisticsVO) || {};
      var payload = {
        nodes: nodes,
        company: lv.logisticsCompanyName,
        logisticsNo: lv.logisticsNo,
        phoneNumber: lv.logisticsCompanyTel,
      };
      APP.go('/pages/order/delivery-detail/index?data=' + encodeURIComponent(JSON.stringify(payload)), 'push');
    } else if (gbt != null || bt != null) {
      e.stopPropagation();
      handleOrderBt(Number(gbt != null ? gbt : bt), gbt != null ? Number(t.getAttribute('data-gidx')) : null);
    } else if (spu) {
      e.stopPropagation();
      APP.go('/pages/goods/details/index?spuId=' + encodeURIComponent(spu), 'push');
    }
  }
  /* 倒计时走秒:以结束时刻 _cdEnd 推算剩余,后台停留后重入仍准确 */
  function startCd() {
    var inst = instRef;
    if (!inst || inst._cdT) return;
    inst._cdT = setInterval(function () {
      var d = inst.data;
      var rem = d.countDownTime == null ? null : Math.max(0, inst._cdEnd - Date.now());
      if (rem == null) return;
      d.countDownTime = rem;
      var el = document.getElementById('odCd');
      if (el) {
        if (rem <= 0) {
          el.parentNode.textContent = '超时未支付';
          el = null;
        } else {
          el.textContent = countdownText(rem);
        }
      }
    }, 1000);
  }
  function mapGoods(ov, gi) {
    var g = Object.assign({}, ov);
    g.id = ov.id;
    g.thumb = ov.goodsPictureUrl;
    g.title = ov.goodsName;
    g.skuId = ov.skuId;
    g.spuId = ov.spuId;
    g.specs = (ov.specifications || []).map(function (s) { return s.specValue; }).filter(Boolean);
    g.price = ov.tagPrice ? ov.tagPrice : ov.actualPrice;
    g.num = ov.buyQuantity;
    g.titlePrefixTags = ov.tagText ? [{ text: ov.tagText }] : [];
    g.buttons = ov.buttonVOs || [];
    g.gi = gi;
    return g;
  }
  function composeAddress(order) {
    var l = order.logisticsVO || {};
    return [l.receiverCity, l.receiverCountry, l.receiverArea, l.receiverAddress].filter(function (s) { return !!s; }).join(' ');
  }
  function flattenNodes(nodes) {
    var res = [];
    (nodes || []).forEach(function (node) {
      ((node && node.nodes) || []).forEach(function (sub, index) {
        res.push({
          title: index === 0 ? (node.title || '') : '',
          desc: sub.status,
          date: (function () {
            var d = new Date(Number(sub.timestamp));
            var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
            return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) +
              ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
          })(),
          icon: index === 0 ? '' : '',
        });
      });
    });
    return res;
  }
  function fmtTime(ms, tpl) {
    var d = new Date(Number(ms));
    var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
    var map = { YYYY: '' + d.getFullYear(), MM: p2(d.getMonth() + 1), DD: p2(d.getDate()), HH: p2(d.getHours()), mm: p2(d.getMinutes()), ss: p2(d.getSeconds()) };
    return String(tpl || 'YYYY-MM-DD HH:mm:ss').replace(/YYYY|MM|DD|HH|mm|ss/g, function (tok) { return map[tok] || tok; });
  }
  function loadDetail() {
    var inst = instRef;
    var orderNo = inst.query.orderNo;
    inst.data.pageLoading = true;
    return SVC.fetchOrderDetail({ parameter: orderNo }).then(function (res) {
      var order = res.data;
      var v = {
        id: order.orderId,
        orderNo: order.orderNo,
        parentOrderNo: order.parentOrderNo,
        storeId: order.storeId,
        storeName: order.storeName,
        status: order.orderStatus,
        statusDesc: order.orderStatusName,
        amount: order.paymentAmount,
        totalAmount: order.goodsAmountApp,
        logisticsNo: (order.logisticsVO || {}).logisticsNo,
        goodsList: (order.orderItemVOs || []).map(function (g, gi) { return mapGoods(g, gi); }),
        buttons: order.buttonVOs || [],
        createTime: order.createTime,
        receiverAddress: composeAddress(order),
        groupInfoVo: order.groupInfoVo,
      };
      var cd = null;
      if (order.orderStatus === 5) {
        var ac = Number(order.autoCancelTime) || 0;
        cd = Math.max(0, ac > 1577808000000 ? ac - Date.now() : ac);
      }
      inst._cdEnd = cd != null ? Date.now() + cd : 0;
      inst.data.order = order;
      inst.data._order = v;
      inst.data.formatCreateTime = fmtTime(parseFloat('' + order.createTime), 'YYYY-MM-DD HH:mm');
      inst.data.countDownTime = cd;
      inst.data.addressEditable = (order.orderStatus === 5 || order.orderStatus === 10) && order.orderSubStatus !== -1;
      inst.data.isPaid = !!(order.paymentVO && order.paymentVO.paySuccessTime);
      inst.data.invoiceType = order.invoiceVO && order.invoiceVO.invoiceType === 5 ? '电子普通发票' : '不开发票';
      inst.data.logisticsNodes = flattenNodes(order.trajectoryVos || []);
      inst.data.pageLoading = false;
      startCd();
      return SVC.fetchBusinessTime().then(function (bt) {
        var sd = bt.data || {};
        inst.data.storeTel = sd.telphone || '';
        return inst;
      });
    });
  }

  APP.reg('/pages/order/order-detail/index', {
    title: '订单详情',
    nav: 'default',
    reinitOnQuery: true,
    data: { order: {}, _order: {}, pageLoading: true, formatCreateTime: '', countDownTime: null, addressEditable: false, isPaid: false, invoiceType: '', logisticsNodes: [], storeTel: '' },
    init: function (query) {
      var inst = this;
      instRef = inst;
      inst.data.countDownTime = null;
      return loadDetail();
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
    show: function () {
      /* 缓存重入时重启倒计时(leave 已清 timer;_cdEnd 仍在,展示由 render 校正) */
      instRef = this;
      startCd();
    },
    leave: function () {
      if (this._cdT) {
        clearInterval(this._cdT);
        this._cdT = null;
      }
    },
  });
})();
