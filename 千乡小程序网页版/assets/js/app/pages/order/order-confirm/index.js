/* 订单确认页 pages/order/order-confirm/index ← order-confirm(index.js + address-card + noGoods + selectCoupons)
 * 入参 goodsRequestList=JSON(源 goods/details 立即购买跳转);SVC.fetchSettleDetail 出店铺/商品/金额汇总
 * 页面:地址卡(点击进地址选择页) + 门店商品卡 + 金额明细 + 底部微信支付条(提交订单)
 * 备注弹层(每店 50 字 textarea,确认写入 storeInfoList.remark 后全量重绘)
 * 优惠券底弹层:1 张 5.5 折券,点选即发 sure → 重算结算(coupon 45% 抵扣)
 * 发票行点击 → receipt 页;返回时 storage invoiceData 在 render 时同步进 data
 * 提交成功 → wx.redirectTo pay-result?totalPaid&orderNo(源 pay.js paySuccess)
 * 源 order-confirm model/orderConfirm.js 缺失,mock 结算数据由 api.js buildSettle 自建
 */
(function () {
  var instRef = null;
  var noteInfo = [];     // 输入中备注(逐店)
  var tempNoteInfo = []; // 打开弹层时的快照(取消还原)
  var payLock = false;

  /* ---------- 小工具 ---------- */
  function ic(name, sizePx, color, extraCls) {
    return '<i class="wr wr-' + name + (extraCls ? ' ' + extraCls : '') + '"' +
      ' style="font-size:' + sizePx + 'px;color:' + color + ';font-style:normal;line-height:1"></i>';
  }
  function fmtAddrPhone(p) {
    return p && p.length >= 7 ? p.substring(0, 3) + '****' + p.substring(7) : (p || '');
  }
  function isInvalidSettle(data) {
    return (data.limitGoodsList && data.limitGoodsList.length > 0) ||
      (data.abnormalDeliveryGoodsList && data.abnormalDeliveryGoodsList.length > 0) ||
      (data.inValidGoodsList && data.inValidGoodsList.length > 0);
  }
  function invalidTitle(data) {
    if (data.limitGoodsList && data.limitGoodsList.length) return ['限购商品信息', '以下商品限购数量，建议您修改商品数量'];
    if (data.abnormalDeliveryGoodsList && data.abnormalDeliveryGoodsList.length) return ['不支持配送', '以下店铺的商品不支持配送，请更改地址或去掉对应店铺商品再进行结算'];
    return ['全部商品库存不足或失效', '请返回购物车重新选择商品'];
  }
  /* 发票描述(handleInvoice.wxs) */
  function invoiceTxt(inv) {
    if (!inv || inv.invoiceType == 0 || inv.invoiceType == null) return '暂不开发票';
    if (inv.invoiceType === 5) {
      var title = inv.titleType == 2 ? '公司' : '个人';
      var content = inv.contentType == 2 ? '商品类别' : '商品明细';
      return inv.email ? '电子普通发票 (' + content + ' - ' + title + ')' : '暂不开发票';
    }
    return '暂不开发票';
  }
  /* 同步 receipt 页保存的发票(源 onShow 读 storage 后即删) */
  function syncInvoiceData(inst) {
    var inv = wx.getStorageSync('invoiceData');
    if (inv) {
      inst.data.invoiceData = Object.assign({ invoiceType: 0 }, inst.data.invoiceData, inv);
      wx.removeStorageSync('invoiceData');
    }
  }

  /* ---------- HTML 片段 ---------- */
  function addrCardHtml(a) {
    var addr = a || {};
    if (addr && addr.detailAddress) {
      var tag = addr.addressTag
        ? '<span class="oc-addr-tag">' + addr.addressTag + '</span>' : '';
      return '<div class="oc-addr" data-act="addr">' +
        ic('location', 20, '#333333') +
        '<div class="oc-addr-body">' +
        '<div class="oc-addr-title">' + tag +
        '<span>' + (addr.provinceName || '') + ' ' + (addr.cityName || '') + ' ' + (addr.districtName || '') + '</span></div>' +
        '<div class="oc-addr-detail">' + addr.detailAddress + '</div>' +
        '<div class="oc-addr-info">' + (addr.name || '') + ' ' + fmtAddrPhone(addr.phone) + '</div>' +
        '</div>' +
        ic('arrow_right', 20, '#BBBBBB') +
        '</div>';
    }
    return '<div class="oc-addr oc-addr--add" data-act="addr">' +
      ic('add_circle', 20, '#333333') + '<span class="oc-addr-addtxt">添加收货地址</span></div>';
  }
  function specText(g) {
    var list = g.skuSpecLst || g.specs || [];
    return list.map(function (s) { return typeof s === 'string' ? s : (s.specValue || ''); })
      .filter(function (v) { return v; }).join(',');
  }
  function goodsRowHtml(g) {
    var price = UP.ph(g.tagPrice || g.settlePrice || 0, 'oc-g-price');
    return '<div class="oc-goods">' +
      '<div class="oc-g-imgbox"><img class="oc-g-img" src="' + (g.image || g.thumb || '') + '" alt="" onerror="this.style.visibility=\'hidden\'"/></div>' +
      '<div class="oc-g-body">' +
      '<div class="oc-g-title">' + (g.titlePrefixTags && g.titlePrefixTags.length ? '[' + g.titlePrefixTags[0].text + ']' : '') +
      (g.goodsName || g.title || '') + '</div>' +
      '<div class="oc-g-spec">' + specText(g) + '</div>' +
      '</div>' +
      '<div class="oc-g-right">' + price + '<span class="oc-g-num">x' + g.num + '</span></div>' +
      '</div>';
  }
  function moneyRow(label, contentHtml, rightCls) {
    return '<div class="oc-pay-item"><span class="oc-pay-label">' + label + '</span>' +
      '<div class="oc-pay-right' + (rightCls ? ' ' + rightCls : '') + '">' + contentHtml + '</div></div>';
  }
  function payRightMoney(v) { return UP.ph(v || 0, 'oc-ph'); }
  function payItemRowsHtml(d) {
    var s = d.settleDetailData || {};
    var html = moneyRow('商品总额', payRightMoney(s.totalSalePrice), 'bold');
    // 运费
    var feeHtml;
    if (s.totalDeliveryFee && Number(s.totalDeliveryFee) !== 0) {
      feeHtml = '<span style="color:#333">+</span>' + payRightMoney(s.totalDeliveryFee);
    } else {
      feeHtml = '免运费';
    }
    html += moneyRow('运费', feeHtml, 'bold');
    html += moneyRow('活动优惠',
      '<span style="color:#fa4126">-</span>' + payRightMoney(s.totalPromotionAmount), 'primary bold');
    // 优惠券行(每店首单 demo 单店)
    var storeId = (s.storeGoodsList && s.storeGoodsList[0]) ? s.storeGoodsList[0].storeId : '';
    var couponRight = (Number(s.totalCouponAmount) > 0)
      ? '<span style="color:#333">-</span>' + UP.ph(s.totalCouponAmount, 'oc-ph')
      : '<span class="oc-pick">选择优惠券</span>';
    html += moneyRow('优惠券',
      '<span class="oc-rowlink" data-act="coupons" data-storeid="' + storeId + '">' + couponRight +
      ic('arrow_right', 16, '#BBBBBB') + '</span>');
    // 发票
    if (s.invoiceSupport) {
      html += moneyRow('发票',
        '<span class="oc-rowlink" data-act="receipt">' + invoiceTxt(instRef ? instRef.data.invoiceData : null) +
        ic('arrow_right', 16, '#BBBBBB') + '</span>');
    }
    // 订单备注(源仅渲染 store 0)
    var remark = ((instRef && instRef.data.storeInfoList) || [])[0] && instRef.data.storeInfoList[0].remark;
    var remarkTxt = remark || '选填，建议先和商家沟通确认';
    html += moneyRow('订单备注',
      '<span class="oc-rowlink oc-remark" data-act="notes" data-storenoteindex="0">' + remarkTxt +
      ic('arrow_right', 16, '#BBBBBB') + '</span>');
    return html;
  }
  /* 优惠券卡片(selectCoupons sheet 内) */
  function couponCardHtml(c) {
    var radio = c.isSelected
      ? '<span class="oc-radio on">&#10003;</span>'
      : '<span class="oc-radio"></span>';
    return '<div class="oc-cp-card" data-act="coupick" data-key="' + c.key + '">' +
      '<div class="oc-cp-left"><span class="oc-cp-val">' + c.valueText + '</span><span class="oc-cp-unit">折</span>' +
      '<div class="oc-cp-desc">' + c.desc + '</div></div>' +
      '<div class="oc-cp-right">' +
      '<div class="oc-cp-info">' +
      '<div class="oc-cp-title">' + c.title + '</div>' +
      '<div class="oc-cp-time">' + c.timeLimit + '</div></div>' +
      '<div class="oc-cp-oper">' + radio + '</div></div></div>';
  }
  function invalidGoodsSheetHtml(d) {
    var data = d.settleDetailData || {};
    var anyInvalid = isInvalidSettle(data);
    if (!anyInvalid) return '';
    var t = invalidTitle(data);
    var list = (data.limitGoodsList || data.abnormalDeliveryGoodsList || data.inValidGoodsList || []);
    var rows = '';
    list.forEach(function (store, i) {
      var unS = (store && store.unSettlementGoods) || [];
      unS.forEach(function (g2) {
        rows += '<div class="oc-ng-row"><img class="oc-ng-img" src="' + (g2.image || '') + '" alt=""/>' +
          '<div class="oc-ng-name">' + (g2.goodsName || '') + '</div>' +
          '<div class="oc-ng-pay">¥' + UP.fen(g2.payPrice || 0) + '</div></div>';
      });
    });
    return '<div class="oc-ng-mask">' +
      '<div class="oc-ng-panel">' +
      '<div class="oc-ng-title">' + t[0] + '</div>' +
      '<div class="oc-ng-info">' + t[1] + '</div>' +
      (rows ? '<div class="oc-ng-list">' + rows + '</div>' : '') +
      '<div class="oc-ng-actions">' +
      '<div class="oc-ng-btn" data-act="ngcart">返回购物车</div>' +
      '</div></div></div>';
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var inst = this;
    instRef = inst;
    syncInvoiceData(inst);
    var d = inst.data;
    var s = d.settleDetailData || {};
    var a = d.userAddress;
    var storeHtml = '';
    (s.storeGoodsList || []).forEach(function (store, si) {
      var rows = '';
      ((d.orderCardList && d.orderCardList[si]) || { goodsList: [] }).goodsList.forEach(function (g) {
        rows += goodsRowHtml(g);
      });
      storeHtml += '<div class="oc-store-card">' +
        '<div class="oc-store-head">' + ic('store', 20, '#333333') +
        '<span class="oc-store-name">' + store.storeName + '</span></div>' +
        rows + '</div>';
    });
    var couponLine = payItemRowsHtml(d);

    var sheetList = '';
    (d.couponListData || []).forEach(function (c) { sheetList += couponCardHtml(c); });
    var cpShow = d.couponsShow ? ' show' : '';
    var notesShow = d.dialogShow ? ' show' : '';
    var selectedNum = 0;
    (d.couponListData || []).forEach(function (c) { if (c.isSelected) selectedNum++; });
    var cpInfo = selectedNum > 0
      ? '已选中' + selectedNum + '张推荐优惠券, 共抵扣 ' + UP.ph(1000, 'oc-cp-reduce')
      : '你有' + (d.couponListData || []).length + '张可用优惠券';

    return '<div class="oc-page">' +
      addrCardHtml(a) +
      '<div class="oc-stripe"></div>' +
      storeHtml +
      '<div class="oc-pay-detail">' + couponLine + '</div>' +
      '<div class="oc-amount-box"><div class="oc-amount">' +
      '<span class="oc-count">共' + (s.totalGoodsCount || 0) + '件</span>' +
      '<span class="oc-amount-label">小计</span>' + UP.ph(s.totalPayAmount || 0, 'oc-ph') +
      '</div></div>' +
      /* 底部支付条 */
      '<div class="oc-paybar"><div class="oc-paybar-in">' +
      '<div class="oc-paybar-money">' + UP.ph(s.totalPayAmount || 0, 'oc-pay-price') + '</div>' +
      '<div class="oc-submit' + (s.settleType === 1 ? '' : ' oc-submit--gray') + '" data-act="submit">提交订单</div>' +
      '</div></div>' +
      '<div class="oc-foot-space"></div>' +
      /* 备注弹层 */
      '<div class="oc-notes-mask' + notesShow + '">' +
      '<div class="oc-notes">' +
      '<div class="oc-notes-title">填写备注信息</div>' +
      '<textarea class="oc-notes-ta" maxlength="50" placeholder="备注信息" data-ta="1">' +
      escapeHtml(((d.storeInfoList || [])[0] || {}).remark || '') + '</textarea>' +
      '<div class="oc-notes-btns">' +
      '<div class="oc-notes-btn oc-notes-cancel" data-act="nt-cancel">取消</div>' +
      '<div class="oc-notes-btn oc-notes-ok" data-act="nt-ok">确认</div>' +
      '</div></div></div>' +
      /* 优惠券弹层 */
      '<div class="oc-cp-mask' + cpShow + '">' +
      '<div class="oc-cp-panel">' +
      '<div class="oc-cp-head">选择优惠券</div>' +
      '<div class="oc-cp-info-line">' + cpInfo + '</div>' +
      '<div class="oc-cp-list">' + sheetList + '</div>' +
      '<div class="oc-cp-bottom"></div>' +
      '</div></div>' +
      invalidGoodsSheetHtml(d) +
      '</div>';
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- 结算数据 → 页面卡片数据(源 handleResToGoodsCard) ---------- */
  function fetchSettle(inst, options) {
    inst.data._settleLoading = true;
    var reqList = inst.data.goodsRequestList;
    if (!reqList || !reqList.length) {
      wx.showToast({ title: '结算异常, 请稍后重试', icon: 'none' });
      setTimeout(function () { inst.back(); }, 1500);
      return;
    }
    var params = {
      goodsRequestList: reqList,
      couponList: options && options.couponList,
      userAddressReq: (options && options.userAddressReq) || inst.data._userAddressReq,
    };
    return SVC.fetchSettleDetail(params).then(function (res) {
      var data = res.data || {};
      var orderCardList = [];
      var storeInfoList = [];
      (data.storeGoodsList || []).forEach(function (ele, i) {
        var card = { id: ele.storeId, storeName: ele.storeName, status: 0, statusDesc: '', goodsList: [], amount: ele.storeTotalPayAmount };
        (ele.skuDetailVos || []).forEach(function (item, gix) {
          card.goodsList.push({
            id: gix,
            thumb: item.image,
            title: item.goodsName,
            specs: (item.skuSpecLst || []).map(function (sp) { return sp.specValue; }),
            price: item.tagPrice || item.settlePrice || '0',
            settlePrice: item.settlePrice,
            titlePrefixTags: item.tagText ? [{ text: item.tagText }] : [],
            num: item.quantity,
            skuId: item.skuId,
            spuId: item.spuId,
            storeId: item.storeId,
          });
        });
        orderCardList.push(card);
        storeInfoList.push({ storeId: ele.storeId, storeName: ele.storeName, remark: '' });
        if (!noteInfo[i]) noteInfo[i] = '';
        if (!tempNoteInfo[i]) tempNoteInfo[i] = '';
      });
      inst.data.settleDetailData = data;
      inst.data.userAddress = data.userAddress;
      inst.data.orderCardList = orderCardList;
      inst.data.storeInfoList = storeInfoList;
      inst.data._userAddressReq = data.userAddress;
      inst.data._settleLoading = false;
      return inst;
    });
  }

  /* ---------- 优惠券弹层数据(selectCoupons mock:1 张 5.5 折券) ---------- */
  var COUPON_TIME = '2020-03-18-2020-03-18';
  function openCouponSheet(inst) {
    // orderSureCouponList 为空数组(源 data.couponList 从未赋值)→ 必返 1 张可用券
    if (!inst.data.couponListData || !inst.data.couponListData.length) {
      inst.data.couponListData = [{
        key: 11,
        title: '折扣券',
        isSelected: false,
        valueText: '5.5',
        desc: '满200元可用',
        timeLimit: COUPON_TIME,
        type: 2,
        tag: '',
      }];
    }
    inst.data.couponsShow = true;
    inst.refresh();
  }
  function toggleCoupon(inst, key) {
    var changed = false;
    (inst.data.couponListData || []).forEach(function (c) {
      if (String(c.key) === String(key)) { c.isSelected = !c.isSelected; changed = true; }
    });
    if (!changed) return;
    // 模拟源 selectCoupon → triggerEvent sure(onCoupons:整店 couponList=selectedList → 重取结算)
    var selected = [];
    (inst.data.couponListData || []).forEach(function (c) {
      if (c.isSelected) {
        selected.push({ couponId: c.key, promotionId: 11, storeId: inst.data.currentStoreId });
      }
    });
    inst.data.couponsShow = false;
    inst.refresh();
    fetchSettle(inst, { couponList: selected }).then(function () {
      inst.refresh();
    });
  }

  /* ---------- 事件 ---------- */
  function onTap(e) {
    var t = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    if (act === 'addr') {
      // 源 onGotoAddress:先注册地址选择 promise,list 选中 resolve / 取消 reject
      SVC.ADDR_SELECT.wait().then(function (addr) {
        inst.data._userAddressReq = Object.assign({}, addr, { checked: true });
        fetchSettle(inst, { userAddressReq: inst.data._userAddressReq }).then(function () {
          // 回到本页且仍为当前页时刷新;选择页展示期间不触碰 pageRoot
          if (APP.cur && APP.cur.path === '/pages/order/order-confirm/index') inst.refresh();
        });
      }).catch(function () {});
      var id = (inst.data.userAddress && inst.data.userAddress.id) || '';
      APP.go('/pages/user/address/list/index?selectMode=1&isOrderSure=1&id=' + id, 'push');
    } else if (act === 'coupons') {
      inst.data.currentStoreId = t.getAttribute('data-storeid');
      openCouponSheet(inst);
    } else if (act === 'coupick') {
      toggleCoupon(inst, t.getAttribute('data-key'));
    } else if (act === 'receipt') {
      var inv = inst.data.invoiceData || {};
      var q = encodeURIComponent(JSON.stringify(inv));
      APP.go('/pages/order/receipt/index?invoiceData=' + q, 'push');
    } else if (act === 'notes') {
      var idx = Number(t.getAttribute('data-storenoteindex')) || 0;
      inst.data.storeNoteIndex = idx;
      tempNoteInfo[idx] = noteInfo[idx];
      inst.data.dialogShow = true;
      inst.refresh();
    } else if (act === 'nt-ok') {
      onNoteConfirm(inst);
    } else if (act === 'nt-cancel') {
      var idx2 = inst.data.storeNoteIndex || 0;
      noteInfo[idx2] = tempNoteInfo[idx2];
      inst.data.dialogShow = false;
      inst.refresh();
    } else if (act === 'submit') {
      submitOrder(inst);
    } else if (act === 'ngcart') {
      APP.go('/pages/cart/index', 'push');
    }
  }
  function onNoteConfirm(inst) {
    var idx = inst.data.storeNoteIndex || 0;
    inst.data.storeInfoList[idx].remark = noteInfo[idx];
    inst.data.dialogShow = false;
    inst.refresh();
  }
  function toastMsg(msg) { wx.showToast({ title: msg, icon: 'none' }); }
  function submitOrder(inst) {
    var d = inst.data;
    var s = d.settleDetailData || {};
    if (!d.userAddress) {
      toastMsg('请添加收货地址');
      return;
    }
    if (payLock || !s.settleType || !s.totalAmount) return;
    payLock = true;
    // 当前所选优惠券(handleCouponList(submitCouponList) 拍平语义)
    var resCouponList = [];
    if (d.couponListData) {
      d.couponListData.forEach(function (c) {
        if (c.isSelected) resCouponList.push({ couponId: c.key, promotionId: 11 });
      });
    }
    var params = {
      goodsRequestList: d.goodsRequestList,
      userAddressReq: d.userAddress,
      userName: d.userAddress.name,
      totalAmount: s.totalPayAmount,
      storeInfoList: d.storeInfoList || [],
      couponList: resCouponList,
    };
    var inv = d.invoiceData;
    if (inv && inv.email) params.invoiceRequest = inv;
    SVC.dispatchCommitPay(params).then(function (res) {
      payLock = false;
      var data = res.data || {};
      if (isInvalidSettle(data)) {
        // 提交后仍失效:显示弹窗(mock 正常流程不出现)
        return;
      }
      if (res.code === 'Success') {
        var payInfo = {
          payInfo: data.payInfo,
          orderId: data.tradeNo,
          orderAmt: s.totalAmount,
          payAmt: s.totalPayAmount,
          interactId: data.interactId,
          tradeNo: data.tradeNo,
          transactionId: data.transactionId,
        };
        // demo 微信支付直付成功(pay.js wechatPayOrder → paySuccess)
        inst._afterPay = true; /* 下次 show(自支付结果返回)复位为新结算页,对齐微信 navigateTo 新实例 */
        if (inst.data.cartKeys && inst.data.cartKeys.length) Cart.removeCheckedKeys(inst.data.cartKeys);
        wx.showToast({ title: '支付成功', icon: 'success' });
        setTimeout(function () {
          wx.redirectTo({ url: '/pages/order/pay-result/index?totalPaid=' + payInfo.payAmt + '&orderNo=' + payInfo.tradeNo });
        }, 600);
      } else {
        toastMsg(res.msg || '提交订单超时，请稍后重试');
        setTimeout(function () { inst.back(); }, 2000);
      }
    });
  }

  APP.reg('/pages/order/order-confirm/index', {
    title: '订单确认',
    nav: 'default',
    reinitOnQuery: true,
    data: {
      settleDetailData: {
        storeGoodsList: [], outOfStockGoodsList: [], abnormalDeliveryGoodsList: [],
        inValidGoodsList: [], limitGoodsList: [],
      },
      orderCardList: [],
      invoiceData: { invoiceType: 0, email: '' },
      storeInfoList: [],
      storeNoteIndex: 0,
      dialogShow: false,
      couponsShow: false,
      couponListData: [],
      currentStoreId: null,
      userAddress: null,
      goodsRequestList: [],
    },
    init: function (query) {
      var inst = this;
      instRef = inst;
      /* 复位实例(对齐微信 navigateTo 新页 onLoad:备注/弹层/券/地址全回默认) */
      Object.assign(inst.data, JSON.parse(JSON.stringify(APP.PAGES[inst.path].data)));
      noteInfo = [];
      tempNoteInfo = [];
      payLock = false;
      var req = query && query.goodsRequestList;
      var list = [];
      if (req) {
        try { list = JSON.parse(req); } catch (e) { list = []; }
      }
      if (!Array.isArray(list)) list = [];
      inst.data.goodsRequestList = list;
      /* 购物车结算来源:携带 cartKeys(下单成功据此清购) */
      var ck = query && query.cartKeys;
      inst.data.cartKeys = ck ? String(ck).split(',').filter(Boolean) : [];
      return Promise.resolve(fetchSettle(inst)).then(function () {
        inst.data._ready = true;
        return inst;
      });
    },
    show: function () {
      var inst = this;
      /* 支付成功后重入本页(自 pay-result 返回/再次结算):复位为新结算态 */
      if (!inst._afterPay) return;
      inst._afterPay = false;
      inst.data._ready = false;
      Promise.resolve(inst.conf.init.call(inst, inst.query)).then(function () {
        inst.refresh();
      });
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
      // 备注输入即时写入(避免逐键重渲染)
      var ta = root.querySelector('.oc-notes-ta');
      if (ta) {
        ta.addEventListener('input', function () {
          var idx = inst.data.storeNoteIndex || 0;
          noteInfo[idx] = ta.value;
        });
      }
      var m = root.querySelector('.oc-notes-mask');
      if (m) m.addEventListener('click', function (e) { if (e.target === m) { inst.data.dialogShow = false; inst.refresh(); } });
      var cm = root.querySelector('.oc-cp-mask');
      if (cm) cm.addEventListener('click', function (e) { if (e.target === cm) { inst.data.couponsShow = false; inst.refresh(); } });
      var ng = root.querySelector('.oc-ng-mask');
      if (ng) ng.addEventListener('click', function (e) { if (e.target === ng) { inst.refresh(); } });
    },
  });
})();
