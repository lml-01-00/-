/* 售后详情页 pages/order/after-service-detail/index ← 源 after-service-detail(index.js/wxml/wxss) + order-goods-card/after-service-button-bar
 * 白头卡(状态 icon+userRightsStatusName + desc)+ 已退款时 退款金额/原路退回明细卡 + 物流卡(logisticsNo 非空:公司+单号+服务按钮)
 * 退货地址卡(收货人手机源 bug 复用 name → 1:1)+ 商品卡(退款金额:x 数量) + 退款信息卡(订单编号/服务单号复制/退款原因/退款金额/申请时间)
 * 凭证卡仅 userRightsStatus=100(待审核)且有说明或凭证图:图 grid → 点击全屏大图
 * 服务按钮(物流卡内):2 撤销(确认→cancelRights)→ 3/4 填写/修改运单号 → 5 查看物流(source=2 data=logisticsVO)
 * 返回重入刷新:show() 重新拉取(申请/撤销/填单返回后数据最新);商品卡跳商品详情需 rightsItem.spuId,售后 mock 缺该字段 → 与源一致无跳转
 */
(function () {
  var instRef = null;
  var TITLE = { 10: '退货退款详情', 20: '退款详情', 30: '退款详情' };
  function ph(price) { return UP.ph(price, 'asd-p'); }
  function statusIcon(raw) {
    var us = (raw && raw.userRightsStatus) || 0;
    if (us === 160) return { cls: 'wr-succeed', color: 'asd-ico-ok' };
    if (us === 170) return { cls: 'wr-indent_close', color: 'asd-ico-close' };
    if (raw && raw.afterSaleRequireType === 'REFUND_MONEY') return { cls: 'wr-goods_refund', color: '' };
    return { cls: 'wr-goods_return', color: '' };
  }
  function svcBtnHtml(b) {
    return '<div class="srv-btn' + (b.primary ? ' srv-btn--primary' : '') + '" data-sbt="' + b.type + '">' + b.name + '</div>';
  }
  function cellRow(title, noteHtml, act) {
    return '<div class="asd-row"><span class="asd-rlb">' + title + '</span>' +
      '<span class="asd-rnote">' + noteHtml + '</span>' + (act ? act : '') + '</div>';
  }
  function render() {
    var d = this.data;
    var s = d.service || {};
    var raw = d.serviceRaw || {};
    var ico = d.statusIcon || { cls: '', color: '' };
    var goods = (s.goodsList || []).map(function (g, i) {
      return '<div class="asd-grow' + (d.hasSpu ? '' : '') + '" data-gi="' + i + '">' +
        '<div class="ol-thumb"><img src="' + g.thumb + '" alt="" loading="lazy" onerror="this.parentNode.style.visibility=\'hidden\'"/></div>' +
        '<div class="as-gbd">' +
        '<div class="ol-title">' + g.title + '</div>' +
        (g.specs && g.specs.length ? '<div class="ol-specs">' + g.specs.join(',') + '</div>' : '') +
        '<div class="asd-gfoot"><span class="asd-gamt">退款金额:' + ph(g.itemRefundAmount) + '</span>' +
        '<span class="asd-gnum">x&nbsp;' + g.rightsQuantity + '</span></div>' +
        '</div></div>';
    }).join('');
    var refundCard = '';
    if (s.isRefunded) {
      var methods = (s.refundMethodList || []).map(function (m) {
        return '<div class="asd-payrow"><span class="asd-plb">' + m.name + '</span><span class="asd-pnote">' + ph(m.amount) + '</span></div>';
      }).join('');
      refundCard = '<div class="asd-sec">' +
        '<div class="asd-payrow asd-payrow--first"><span class="asd-plb asd-plb--b">退款金额</span><span class="asd-pval">' + ph(s.refundRequestAmount) + '</span></div>' +
        methods +
        '<div class="asd-tip">说明：微信退款后，可以在微信支付账单查询，实际退款到时间可能受到银行处理时间的影响有一定延时，可以稍后查看</div>' +
        '</div>';
    }
    var logi = '';
    if (s.logisticsNo) {
      logi = '<div class="asd-sec">' +
        '<div class="asd-logi"><i class="wr wr-deliver"></i>' +
        '<div class="asd-lbd"><div class="asd-lt">' + s.logisticsCompanyName + ' ' + s.logisticsNo + '</div>' +
        '<div class="asd-ld">买家已寄出</div></div>' +
        '<i class="wr wr-arrow_forward asd-larr"></i></div>' +
        ((s.buttons || []).length ? '<div class="asd-lbar">' + s.buttons.map(svcBtnHtml).join('') + '</div>' : '') +
        '</div>';
    }
    var addr = '';
    if (s.receiverName) {
      addr = '<div class="asd-sec">' +
        '<div class="asd-logi"><i class="wr wr-location"></i>' +
        '<div class="asd-lbd asd-lbd--addr">' +
        '<div class="asd-addrl">' + s.receiverAddress + '</div>' +
        '<div class="asd-ld">收货人：' + s.receiverName + '</div>' +
        '<div class="asd-ld">收货人手机：' + s.receiverName + '</div>' +
        '</div>' +
        '<div class="text-btn" data-act="copyAddr">复制</div>' +
        '</div></div>';
    }
    var proofs = '';
    if (d.showProofs) {
      var imgs = (s.proofs || []).map(function (src, i) {
        return '<div class="asd-proof" data-proof="' + i + '"><img src="' + src + '" alt="" loading="lazy" onerror="this.style.display=\'none\'"/></div>';
      }).join('');
      proofs = '<div class="asd-sec asd-sec--proof">' +
        '<div class="asd-plb asd-plb--b">凭证/说明</div>' +
        (s.applyRemark ? '<div class="asd-rremark">' + s.applyRemark + '</div>' : '') +
        (imgs ? '<div class="asd-proofs">' + imgs + '</div>' : '') +
        '</div>';
    }
    var infoRows = [
      cellRow('订单编号', '<b>' + s.orderNo + '</b>'),
      cellRow('服务单号', '<b>' + s.rightsNo + '</b>', '<span class="text-btn" data-act="copyNo">复制</span>'),
      cellRow('退款原因', s.rightsReasonDesc || ''),
      cellRow('退款金额', ph(s.refundRequestAmount)),
      cellRow('申请时间', s.createTime || ''),
    ].join('');
    var gallery = d.galleryShow
      ? '<div class="asd-mask" data-act="closeGallery"></div>' +
        '<div class="asd-full"><img src="' + (d.gallerySrc || '') + '" alt="" data-act="closeGallery"/></div>'
      : '';
    return '<div class="asd-page">' +
      '<div class="asd-hero"><div class="asd-hero-t"><i class="wr ' + ico.cls + ' ' + ico.color + '"></i>' + (s.statusName || '') + '</div>' +
      '<div class="asd-hero-d">' + (s.statusDesc || '') + '</div></div>' +
      refundCard + logi + addr +
      (goods ? '<div class="asd-sec asd-sec--goods">' + goods + '</div>' : '') +
      '<div class="asd-sec"><div class="asd-info-t">退款信息</div>' + infoRows + '</div>' +
      proofs + gallery +
      '</div>';
  }
  function toService(raw) {
    var rights = raw.rights || {};
    var refund = raw.rightsRefund || {};
    var logi = raw.logisticsVO || {};
    var us = rights.userRightsStatus || 0;
    return {
      id: rights.rightsNo,
      serviceNo: rights.rightsNo,
      storeName: rights.storeName,
      type: rights.rightsType,
      typeDesc: rights.rightsType === 10 ? '退货' : (rights.rightsType === 30 ? '支付后取消' : '退款'),
      status: rights.rightsStatus,
      statusName: rights.userRightsStatusName,
      statusDesc: rights.userRightsStatusDesc,
      amount: rights.refundRequestAmount,
      orderNo: rights.orderNo,
      rightsNo: rights.rightsNo,
      rightsReasonDesc: rights.rightsReasonDesc,
      isRefunded: us === 160,
      refundMethodList: (raw.refundMethodList || []).map(function (m) {
        return { name: m.refundMethodName, amount: m.refundMethodAmount };
      }),
      refundRequestAmount: rights.refundRequestAmount,
      createTime: rights.createTime ? fmtTime(rights.createTime, 'YYYY-MM-DD HH:mm') : '',
      logisticsNo: logi.logisticsNo || '',
      logisticsCompanyName: logi.logisticsCompanyName || '',
      logisticsCompanyCode: logi.logisticsCompanyCode || '',
      remark: logi.remark || '',
      receiverName: logi.receiverName || '',
      receiverPhone: logi.receiverPhone || '',
      receiverAddress: composeAddress(raw),
      applyRemark: refund.refundDesc || '',
      goodsList: (raw.rightsItem || []).map(function (item, i) {
        return {
          id: i,
          thumb: item.goodsPictureUrl,
          title: item.goodsName,
          specs: (item.specInfo || []).map(function (s) { return s.specValues || ''; }),
          itemRefundAmount: item.itemRefundAmount,
          rightsQuantity: item.rightsQuantity,
        };
      }),
      buttons: raw.buttonVOs || [],
      proofs: rights.rightsImageUrls || [],
    };
  }
  function composeAddress(raw) {
    var l = (raw.logisticsVO || {});
    return [l.receiverProvince, l.receiverCity, l.receiverCountry, l.receiverArea, l.receiverAddress]
      .filter(function (s) { return !!s; }).join(' ');
  }
  function fmtTime(ms, tpl) {
    var d = new Date(Number(ms));
    if (isNaN(d.getTime())) return '';
    var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
    var map = { YYYY: '' + d.getFullYear(), MM: p2(d.getMonth() + 1), DD: p2(d.getDate()), HH: p2(d.getHours()), mm: p2(d.getMinutes()), ss: p2(d.getSeconds()) };
    return String(tpl || 'YYYY-MM-DD HH:mm:ss').replace(/YYYY|MM|DD|HH|mm|ss/g, function (tok) { return map[tok] || tok; });
  }
  function load(silent) {
    var inst = instRef;
    if (!silent) inst.data.pageLoading = true;
    return SVC.fetchAfterRightsDetail(inst.rightsNo).then(function (res) {
      var raw = (res && res.data) || {};
      var rights = raw.rights || {};
      inst.data.serviceRaw = raw;
      inst.data.service = toService(raw);
      inst.data.statusIcon = statusIcon(rights);
      inst.data.hasSpu = !!(raw.rightsItem || []).some(function (it) { return it.spuId; });
      inst.data.showProofs = rights.userRightsStatus === 100 &&
        (inst.data.service.applyRemark || inst.data.service.proofs.length > 0);
      inst.data.pageLoading = false;
      inst.refresh();
      var t = TITLE[inst.data.service.type];
      if (t) APP.setNavTitle(t);
      return inst;
    });
  }
  /* 服务按钮分发(与列表共用语义) */
  function handleSvcBt(e) {
    var t = e.target.closest('[data-sbt]');
    if (!t) return;
    var type = Number(t.getAttribute('data-sbt'));
    var inst = instRef;
    var s = inst.data.service;
    if (type === 2) {
      wx.showModal({
        title: '是否撤销退货申请？',
        content: '',
        confirmText: '撤销申请',
        cancelText: '不撤销',
      }).then(function (r) {
        if (!r.confirm) return;
        SVC.cancelRights({ rightsNo: s.id }).then(function () {
          wx.showToast({ title: '你确认撤销申请', icon: 'none' });
          return load(true);
        });
      });
    } else if (type === 3) {
      APP.go('/pages/order/fill-tracking-no/index?rightsNo=' + encodeURIComponent(s.id), 'push');
    } else if (type === 4) {
      APP.go('/pages/order/fill-tracking-no/index?rightsNo=' + encodeURIComponent(s.id) +
        '&logisticsNo=' + encodeURIComponent(s.logisticsNo || '') +
        '&logisticsCompanyName=' + encodeURIComponent(s.logisticsCompanyName || '') +
        '&logisticsCompanyCode=' + encodeURIComponent(s.logisticsCompanyCode || '') +
        '&remark=' + encodeURIComponent(s.remark || ''), 'push');
    } else if (type === 5) {
      var lv = inst.data.serviceRaw.logisticsVO;
      APP.go('/pages/order/delivery-detail/index?data=' + encodeURIComponent(JSON.stringify(lv)) + '&source=2', 'push');
    }
  }
  function onTap(e) {
    var t = e.target.closest('[data-act],[data-sbt],[data-gi],[data-proof]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    if (act === 'copyNo') {
      wx.setClipboardData({ data: inst.data.service.serviceNo });
    } else if (act === 'copyAddr') {
      var s = inst.data.service;
      wx.setClipboardData({ data: s.receiverName + '  ' + s.receiverPhone + '\n' + s.receiverAddress });
    } else if (act === 'closeGallery') {
      inst.data.galleryShow = false;
      inst.refresh();
    } else if (t.hasAttribute('data-proof')) {
      var p = Number(t.getAttribute('data-proof'));
      inst.data.gallerySrc = (inst.data.service.proofs || [])[p] || '';
      inst.data.galleryShow = true;
      inst.refresh();
    } else if (t.hasAttribute('data-sbt')) {
      e.stopPropagation();
      handleSvcBt(e);
    } else if (t.hasAttribute('data-gi')) {
      var item = (inst.data.serviceRaw.rightsItem || [])[Number(t.getAttribute('data-gi'))];
      if (!item) return;
      var detailQuery = item.spuId ? 'spuId=' + item.spuId : item.skuId ? 'skuId=' + item.skuId : '';
      if (detailQuery) APP.go('/pages/goods/details/index?' + detailQuery, 'push');
    }
  }

  APP.reg('/pages/order/after-service-detail/index', {
    title: '售后详情',
    nav: 'default',
    reinitOnQuery: true,
    data: { pageLoading: true, serviceRaw: {}, service: {}, statusIcon: {}, showProofs: false, galleryShow: false, gallerySrc: '', hasSpu: false },
    init: function (query) {
      var inst = this;
      instRef = inst;
      inst.rightsNo = query && query.rightsNo;
      inst._skipShowOnce = true;
      return load(false);
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
    show: function () {
      /* 填写/修改运单号返回、其它页 back 回来后刷新数据(数据以 store 为准,保证撤销/填单后最新) */
      if (this._skipShowOnce) { this._skipShowOnce = false; return; }
      instRef = this;
      load(true);
    },
  });
})();
