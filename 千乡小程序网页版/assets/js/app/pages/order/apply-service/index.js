/* 申请售后页 pages/order/apply-service/index ← 源 apply-service(index.js/wxml/wxss)+ order-goods-card + reason-sheet + amount dialog
 * 入口:订单详情 商品级按钮 4(APPLY_REFUND)带 orderNo/skuId/spuId/orderStatus/logisticsNo/price/num/.../canApplyReturn=true
 * 商品卡(预览 fetchRightsPreview:thumb/title/specs + ¥paidAmountEach + x boughtQuantity)→ 类型选择(仅退款 icon goods_refund / 退货退款)
 * 仅退款:置 serviceRequireType=REFUND_MONEY + 收货状态=未收到货(switchReceiptStatus(0))→ 拉 4 条未收货原因;serviceType 保持 null(源 bug 1:1,提交归为仅退款)
 * 退货退款:orderStatus=40 先确认收货(confirmDialog→dispatchConfirmReceived)→ serviceType=10 → 收货状态=已收到货 + 5 条原因
 * 表单:收货状态行(reason-sheet,仅换状态不重拉原因,源行为)+ 退款原因行(仅 canApplyReturn 渲染;同一 sheet)→ 数量 stepper(min1/max numOfSkuAvailable)
 * 金额行(desc=amountTip;点击 → 居中金额 dialog:¥ + digit 过滤 / blur 归一 clamp / 确定 current=temp*100)→ 退款说明 textarea(200,计数) → 上传凭证(3 张)
 * 上传:源 handleSuccess 误写 sessionFrom.rightsImageUrls 导致提交恒空;web 统一写入 serviceFrom.rightsImageUrls(意图对齐,否则凭证功能坏死)
 * 提交:submitCheck(validateRes)失败 Toast(msg)→ dispatchApplyService → Toast '申请成功' → redirectTo 售后详情(replace 语义)
 * validate 1:1 源:type 空→'请填写退款原因';amount.current 空→'请填写退款金额';amount.current<=0 无条件覆盖 '退款金额必须大于0'
 * 收货状态弹层 popup(showReceiptStatusDialog 死控件)与 input-dialog 死实例不渲染
 */
(function () {
  var instRef = null;
  var RECEIPT_LIST = [
    { desc: '未收到货', status: 2 },
    { desc: '已收到货', status: 1 },
  ];
  function yuan(fen) { return (Math.round((Number(fen) || 0) * 100) / 100 / 100).toFixed(2); }
  function priceHtml(fen, extra) { return UP.ph(fen, extra); }
  function cellRow(title, note, act) {
    return '<div class="aps-row aps-tap" data-act="' + (act || '') + '">' +
      '<span class="aps-rlb">' + title + '</span>' +
      (note != null ? '<span class="aps-rnote">' + note + '</span>' : '') +
      '<i class="wr wr-arrow_right aps-rarw"></i>' +
      '</div>';
  }
  function uploadHtml(d) {
    var files = d.serviceFrom.rightsImageUrls || [];
    var tiles = files.map(function (url, i) {
      return '<div class="aps-utile" data-act="rmimg" data-i="' + i + '">' +
        '<img src="' + url + '" alt=""/>' +
        '<i class="aps-udel">×</i></div>';
    }).join('');
    var add = files.length >= 3 ? '' :
      '<div class="aps-utile aps-uadd" data-act="pickimg">' +
      '<i class="wr wr-add aps-uaddico"></i>' +
      '<div class="aps-udesc">上传凭证<br/>（最多3张）</div>' +
      '</div>';
    return '<div class="aps-up">' + tiles + add + '<input class="aps-file" type="file" accept="image/*" multiple="multiple" data-act="filepick"/></div>';
  }
  function sheetHtml(d) {
    if (!d.sheet) return '';
    var opts = (d.sheet.options || []).map(function (o, i) {
      return '<div class="aps-opt' + (o.checked ? ' on' : '') + '" data-opt="' + i + '">' +
        '<span class="aps-opt-t">' + o.title + '</span>' +
        '<i class="wr ' + (o.checked ? 'wr-check' : 'wr-uncheck') + ' aps-opt-ck"></i>' +
        '</div>';
    }).join('');
    return '<div class="aps-mask" data-act="sheet-cancel"></div>' +
      '<div class="aps-sheet">' +
      '<div class="aps-sh-h">' + d.sheet.title + '</div>' +
      '<div class="aps-sh-opts">' + opts + '</div>' +
      '<div class="aps-sh-btn" data-act="sheet-ok">确定</div>' +
      '</div>';
  }
  function dlgHtml(d) {
    if (!d.inputDialogVisible) return '';
    return '<div class="aps-dmask"></div>' +
      '<div class="aps-dlg">' +
      '<div class="aps-dt">退款金额</div>' +
      '<div class="aps-db">' +
      '<span class="aps-dsign">¥</span>' +
      '<input class="aps-dinput" type="text" inputmode="decimal" value="' + d.serviceFrom.amount.temp + '" data-act="amt-input"/>' +
      '</div>' +
      '<div class="aps-dtips">' + d.amountTip + '</div>' +
      '<div class="aps-dbtns">' +
      '<div class="aps-dbtn" data-act="amt-cancel">取消</div>' +
      '<div class="aps-dbtn aps-dbtn--ok" data-act="amt-ok">确定</div>' +
      '</div></div>';
  }
  function render() {
    var d = this.data;
    var g = d.goodsInfo || {};
    var specHtml = (g.specs || []).length ? '<div class="aps-specs">' + g.specs.join(',') + '</div>' : '';
    var goods = '<div class="aps-card aps-goods">' +
      '<div class="aps-gmain">' +
      (g.thumb ? '<div class="aps-thumb"><img src="' + g.thumb + '" alt="" onerror="this.parentNode.style.visibility=\'hidden\'"/></div>' : '') +
      '<div class="aps-gbody">' +
      '<div class="aps-title">' + (g.title || '') + '</div>' + specHtml +
      '<div class="aps-gfoot">' + priceHtml(g.paidAmountEach, 'aps-gprice') +
      '<span class="aps-gnum">x ' + (g.boughtQuantity != null ? g.boughtQuantity : '') + '</span></div>' +
      '</div></div></div>';
    var body;
    if (!d.serviceRequireType) {
      var cellReturn = '<div class="aps-cell aps-cell--choice' + (d.canApplyReturn ? '' : ' aps-cell--off') + '"' +
        (d.canApplyReturn ? ' data-act="type" data-type="return"' : '') + '>' +
        '<i class="wr wr-goods_return aps-ico"></i>' +
        '<div class="aps-ct"><div class="aps-cell-t">退货退款</div>' +
        '<div class="aps-cell-d">' + (d.canApplyReturn ? '已收到货，需要退还收到的商品' : '该商品不支持退货') + '</div></div>' +
        (d.canApplyReturn ? '<i class="wr wr-arrow_right aps-arw"></i>' : '') +
        '</div>';
      body = '<div class="aps-choice">' +
        '<div class="aps-cell aps-cell--choice" data-act="type" data-type="money">' +
        '<i class="wr wr-goods_refund aps-ico"></i>' +
        '<div class="aps-ct"><div class="aps-cell-t">申请退款（无需退货）</div>' +
        '<div class="aps-cell-d">没收到货，或与商家协商同意不用退货只退款</div></div>' +
        '<i class="wr wr-arrow_right aps-arw"></i></div>' +
        cellReturn + '</div>';
    } else {
      var reasonCell = d.canApplyReturn
        ? cellRow('退款原因', d.serviceFrom.applyReason.desc || '请选择', 'reason')
        : '';
      var numSel = '<div class="aps-stepper">' +
        '<i class="aps-step-btn' + (d.serviceFrom.returnNum <= 1 ? ' off' : '') + '" data-act="num" data-d="-1">−</i>' +
        '<span class="aps-step-val">' + d.serviceFrom.returnNum + '</span>' +
        '<i class="aps-step-btn' + (d.serviceFrom.returnNum >= d.maxApplyNum ? ' off' : '') + '" data-act="num" data-d="1">＋</i>' +
        '</div>';
      body = '<div class="aps-form">' +
        '<div class="aps-card aps-fg">' +
        '<div class="aps-row aps-tap" data-act="receipt">' +
        '<span class="aps-rlb">商品收货状态</span><span class="aps-rnote">' +
        (d.serviceFrom.receiptStatus.desc || '请选择') + '</span><i class="wr wr-arrow_right aps-rarw"></i></div>' +
        reasonCell + '</div>' +
        '<div class="aps-card aps-fg">' +
        '<div class="aps-row aps-row--num">' +
        '<span class="aps-rlb">退款商品数量</span>' + numSel + '</div>' +
        '<div class="aps-row aps-row--amt" data-act="amt-tap">' +
        '<div class="aps-amtlb">' +
        '<div class="aps-amt-t">退款金额</div>' +
        '<div class="aps-amt-desc">' + d.amountTip + '</div>' +
        '</div>' +
        '<div class="aps-amt-note">' + priceHtml(d.serviceFrom.amount.current, 'aps-amt-price') +
        '<span class="aps-amt-mod">修改<i class="wr wr-arrow_right"></i></span></div>' +
        '</div></div>' +
        '<div class="aps-card aps-tx">' +
        '<div class="aps-tx-lb">退款说明</div>' +
        '<div class="aps-tx-wrap"><textarea class="aps-txa" maxlength="200" placeholder="退款说明（选填）" data-act="remark">' +
        (d.serviceFrom.remark || '') + '</textarea>' +
        '<span class="aps-tx-count">' + ((d.serviceFrom.remark || '').length || 0) + '/200</span></div>' +
        '</div>' +
        '<div class="aps-card aps-upcard">' +
        '<div class="aps-up-t">上传凭证</div>' + uploadHtml(d) + '</div>' +
        '<div class="aps-bar"><div class="aps-submit' + (d.submitting ? ' loading' : '') +
        (d.validateRes.valid && !d.uploading ? '' : ' off') + '" data-act="submit">' +
        (d.submitting ? '<span class="aps-spin"></span>提交中' : '提交') + '</div></div>' +
        '</div>';
    }
    return '<div class="aps-page">' + goods + body + sheetHtml(d) + dlgHtml(d) + '</div>';
  }
  function fmtTemp(v) {
    var m = String(v).match(/\d+(\.?\d*)?/);
    return m ? m[0] : '';
  }
  function normTemp(v) {
    var m = String(v).match(/\d+(\.?\d+)?/);
    var n = parseFloat(m ? m[0] : '0') * 100;
    var inst = instRef;
    var max = Number(inst.data.serviceFrom.amount.max) || 0;
    if (n > max) n = max;
    return n;
  }
  function validate() {
    var inst = instRef;
    var sf = inst.data.serviceFrom;
    var valid = true;
    var msg = '';
    if (!sf.applyReason.type) {
      valid = false;
      msg = '请填写退款原因';
    } else if (!sf.amount.current) {
      valid = false;
      msg = '请填写退款金额';
    }
    if (sf.amount.current <= 0) {
      valid = false;
      msg = '退款金额必须大于0';
    }
    inst.data.validateRes = { valid: valid, msg: msg };
    inst.refresh();
  }
  /* ---- reasonSheet 等价(底部弹层 Promise) ---- */
  function openSheet(title, list, emptyTip) {
    var inst = instRef;
    return new Promise(function (resolve, reject) {
      inst._sheetResolve = resolve;
      inst._sheetReject = reject;
      inst.data.sheet = {
        title: title,
        emptyTip: emptyTip || '请选择',
        options: list.map(function (o) {
          return { title: o.title, checked: !!o.checked };
        }),
      };
      inst.refresh();
    });
  }
  function closeSheet() {
    var inst = instRef;
    if (!inst.data.sheet) return;
    inst.data.sheet = null;
    inst.refresh();
  }
  function sheetPick(i) {
    var inst = instRef;
    var sheet = inst.data.sheet;
    if (!sheet) return;
    sheet.options.forEach(function (o, idx) { o.checked = idx === i; });
    inst.refresh();
  }
  /* ---- 收货状态切换 ---- */
  function switchReceipt(i) {
    var inst = instRef;
    var st = RECEIPT_LIST[i];
    var cur = inst.data.serviceFrom.receiptStatus.status;
    if (!st) {
      inst.data.serviceFrom.receiptStatus = { desc: '请选择', status: null };
      inst.data.serviceFrom.applyReason = { desc: '请选择', type: null };
      inst.data.applyReasons = [];
      inst.refresh();
      return;
    }
    if (st.status === cur) return;
    SVC.fetchApplyReasonList({ rightsReasonType: st.status }).then(function (res) {
      inst.data.serviceFrom.receiptStatus = st;
      inst.data.serviceFrom.applyReason = { desc: '请选择', type: null };
      inst.data.applyReasons = ((res && res.data && res.data.rightsReasonList) || []).map(function (r) {
        return { desc: r.desc, type: r.id };
      });
      validate();
    });
  }
  /* ---- 商品预览 ---- */
  function refresh() {
    var inst = instRef;
    var q = inst.query;
    return SVC.fetchRightsPreview({
      orderNo: q.orderNo, skuId: q.skuId, spuId: q.spuId,
      numOfSku: Number(inst.data.serviceFrom.returnNum) || 1,
    }).then(function (res) {
      var d = (res && res.data) || {};
      var gi = d.goodsInfo || {};
      var row = (gi.specInfo || []).map(function (s) { return s.specValue; });
      inst.data.goodsInfo = {
        thumb: gi.skuImage, title: gi.goodsName, specs: row,
        paidAmountEach: d.paidAmountEach, boughtQuantity: d.boughtQuantity,
        skuId: d.skuId, spuId: d.spuId,
      };
      inst.data.serviceFrom.returnNum = Number(d.numOfSku) || 1;
      inst.data.serviceFrom.amount = {
        max: d.refundableAmount, current: d.refundableAmount, temp: yuan(d.refundableAmount), focus: false,
      };
      inst.data.maxApplyNum = Number(d.numOfSkuAvailable) || 1;
      inst.data.amountTip = '最多可申请退款¥ ' + yuan(d.refundableAmount) +
        '，含发货运费¥ ' + yuan(d.shippingFeeIncluded || 0);
      validate();
      return inst;
    });
  }
  function onType(type) {
    var inst = instRef;
    var q = inst.query;
    if (type === 'money') {
      APP.setNavTitle('申请退款');
      inst.data.serviceRequireType = 'REFUND_MONEY';
      switchReceipt(0);
    } else {
      APP.setNavTitle('申请退货退款');
      inst.data.serviceRequireType = 'REFUND_GOODS';
      var done = function () {
        inst.data.serviceType = 10;
        switchReceipt(1);
      };
      if (Number(q.orderStatus) === 40) {
        wx.showModal({
          title: '订单商品是否已经收到货',
          content: '',
          confirmText: '确认收货，并申请退货',
          cancelText: '未收到货',
        }).then(function (r) {
          if (!r.confirm) return;
          SVC.dispatchConfirmReceived({
            parameter: { logisticsNo: q.logisticsNo || '', orderNo: q.orderNo },
          }).then(done);
        });
      } else {
        done();
      }
    }
  }
  /* ---- 上传 ---- */
  function pickImages() {
    var inst = instRef;
    var inp = inst.root && inst.root.querySelector('input.aps-file[type=file]');
    if (!inp) return;
    inp.value = '';
    inp.click();
  }
  function handleFiles(list) {
    var inst = instRef;
    inst.data.uploading = true;
    inst.refresh();
    var files = inst.data.serviceFrom.rightsImageUrls || [];
    /* 读图走微任务,保持 uploading 状态可渲染(源组件 select-change→success 同样异步) */
    setTimeout(function () {
      for (var i = 0; i < list.length && files.length < 3; i++) {
        var f = list[i];
        if (!f || !/^image\//.test(f.type)) continue;
        files.push(URL.createObjectURL(f));
      }
      inst.data.serviceFrom.rightsImageUrls = files;
      inst.data.uploading = false;
      validate();
    }, 60);
  }
  function removeImage(i) {
    var inst = instRef;
    var files = (inst.data.serviceFrom.rightsImageUrls || []).slice();
    files.splice(i, 1);
    inst.data.serviceFrom.rightsImageUrls = files;
    validate();
  }
  /* ---- 金额 dialog ---- */
  function openAmtDialog() {
    var inst = instRef;
    inst.data.serviceFrom.amount.temp = yuan(Number(inst.data.serviceFrom.amount.current) || 0);
    inst.data.inputDialogVisible = true;
    inst.refresh();
    var inp = inst.root && inst.root.querySelector('.aps-dinput');
    if (inp) setTimeout(function () { inp.focus(); }, 30);
  }
  function closeAmtDialog(commit) {
    var inst = instRef;
    if (!inst.data.inputDialogVisible) return;
    var sf = inst.data.serviceFrom;
    if (commit) {
      var v = normTemp(sf.amount.temp);
      sf.amount.current = v;
      sf.amount.temp = yuan(v);
      sf.amount.focus = false;
    }
    inst.data.inputDialogVisible = false;
    inst.refresh();
    validate();
  }
  /* ---- 提交 ---- */
  function onSubmit() {
    var inst = instRef;
    var vr = inst.data.validateRes;
    if (!vr.valid) {
      wx.showToast({ title: vr.msg || '请完善信息', icon: 'none' });
      return;
    }
    if (inst.data.submitting) return;
    var sf = inst.data.serviceFrom;
    var q = inst.query;
    var params = {
      rights: {
        orderNo: q.orderNo,
        refundRequestAmount: Number(sf.amount.current) || 0,
        rightsImageUrls: sf.rightsImageUrls || [],
        rightsReasonDesc: sf.applyReason.desc,
        rightsReasonType: sf.receiptStatus.status,
        rightsType: inst.data.serviceType,
      },
      rightsItem: [{
        itemTotalAmount: Number(sf.amount.current) || 0,
        rightsQuantity: Number(sf.returnNum) || 1,
        skuId: q.skuId, spuId: q.spuId,
      }],
      refundMemo: undefined,
    };
    inst.data.submitting = true;
    inst.refresh();
    SVC.dispatchApplyService(params).then(function (res) {
      inst.data.submitting = false;
      wx.showToast({ title: '申请成功', icon: 'none' });
      var no = (res && res.data && res.data.rightsNo) || '';
      APP.go('/pages/order/after-service-detail/index?rightsNo=' + encodeURIComponent(no), 'replace');
    }).catch(function () {
      inst.data.submitting = false;
      inst.refresh();
    });
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    if (act === 'type') {
      onType(t.getAttribute('data-type'));
    } else if (act === 'receipt') {
      openSheet('请选择收货状态', RECEIPT_LIST.map(function (r) {
        return { title: r.desc, checked: r.status === inst.data.serviceFrom.receiptStatus.status };
      }), '请选择收货状态').then(function (i) {
        inst.data.serviceFrom.receiptStatus = RECEIPT_LIST[i];
        validate();
      }).catch(function () {});
    } else if (act === 'reason') {
      var opts = (inst.data.applyReasons || []).map(function (r) {
        return { title: r.desc, checked: r.type === inst.data.serviceFrom.applyReason.type };
      });
      openSheet('选择退款原因', opts, '请选择退款原因').then(function (i) {
        inst.data.serviceFrom.applyReason = inst.data.applyReasons[i];
        validate();
      }).catch(function () {});
    } else if (act === 'num') {
      var d = Number(t.getAttribute('data-d')) || 0;
      var v = (Number(inst.data.serviceFrom.returnNum) || 1) + d;
      if (v < 1) v = 1;
      if (v > Number(inst.data.maxApplyNum)) v = inst.data.maxApplyNum;
      if (v !== inst.data.serviceFrom.returnNum) {
        inst.data.serviceFrom.returnNum = v;
        /* 数量变化 → 重拉预览:可退金额/运费随数量联动(源 refresh 语义) */
        refresh().catch(function () {});
      }
    } else if (act === 'amt-tap') {
      openAmtDialog();
    } else if (act === 'amt-input') {
      var iv = t.value;
      t.value = fmtTemp(iv);
      inst.data.serviceFrom.amount.temp = t.value;
    } else if (act === 'amt-ok') {
      closeAmtDialog(true);
    } else if (act === 'amt-cancel') {
      closeAmtDialog(false);
    } else if (act === 'remark') {
      /* input/textarea 输入均走事件委托之外的本地监听,占位避免重复绑定 */
    } else if (act === 'pickimg') {
      pickImages();
    } else if (act === 'rmimg') {
      removeImage(Number(t.getAttribute('data-i')));
    } else if (act === 'submit') {
      onSubmit();
    } else if (act === 'sheet-ok') {
      var sheet = inst.data.sheet;
      var picked = -1;
      if (sheet) sheet.options.forEach(function (o, idx) { if (o.checked) picked = idx; });
      if (picked < 0) {
        wx.showToast({ title: (sheet && sheet.emptyTip) || '请选择', icon: 'none' });
        return;
      }
      closeSheet();
      if (inst._sheetResolve) { var r = inst._sheetResolve; inst._sheetResolve = null; inst._sheetReject = null; r(picked); }
    } else if (act === 'sheet-cancel') {
      closeSheet();
      if (inst._sheetReject) { var j = inst._sheetReject; inst._sheetResolve = null; inst._sheetReject = null; j(new Error('cancel')); }
    }
  }
  function onOptTap(e) {
    var t = e.target.closest('[data-opt]');
    if (!t) return;
    sheetPick(Number(t.getAttribute('data-opt')));
  }
  /* textarea 与金额输入框的连续输入走实例监听 */
  function onInput(e) {
    var t = e.target;
    var inst = instRef;
    if (t && t.getAttribute && t.getAttribute('data-act') === 'remark') {
      inst.data.serviceFrom.remark = t.value;
      var c = inst.root && inst.root.querySelector('.aps-tx-count');
      if (c) c.textContent = (t.value || '').length + '/200';
    }
  }
  function onBlur(e) {
    var t = e.target;
    var inst = instRef;
    if (t && t.getAttribute && t.getAttribute('data-act') === 'amt-input') {
      var v = normTemp(t.value);
      t.value = yuan(v);
      inst.data.serviceFrom.amount.temp = yuan(v);
      inst.data.serviceFrom.amount.focus = false;
    }
  }

  APP.reg('/pages/order/apply-service/index', {
    title: '选择售后类型',
    nav: 'default',
    reinitOnQuery: true,
    data: {
      uploading: false, canApplyReturn: true,
      goodsInfo: {}, serviceType: null, serviceRequireType: '',
      serviceFrom: {
        returnNum: 1,
        receiptStatus: { desc: '请选择', status: null },
        applyReason: { desc: '请选择', type: null },
        amount: { max: 0, current: 0, temp: '0.00', focus: false },
        remark: '',
        rightsImageUrls: [],
      },
      maxApplyNum: 1, amountTip: '', validateRes: { valid: false, msg: '' },
      submitting: false, inputDialogVisible: false,
      applyReasons: [], sheet: null,
    },
    init: function (query) {
      var inst = this;
      instRef = inst;
      inst.query = query || {};
      /* reinit 复用实例:复位上一轮选择状态与静态标题(标题曾被 onType 的 setNavTitle 改写) */
      Object.assign(inst.data, JSON.parse(JSON.stringify(APP.PAGES[inst.path].data)));
      APP.setNavTitle('选择售后类型');
      inst.data.canApplyReturn = query && query.canApplyReturn === 'true';
      if (!query || !query.orderNo) {
        wx.showModal({
          title: '请先选择订单', content: '', showCancel: false, confirmText: '确认',
        }).then(function () {
          APP.go('/pages/order/order-list/index', 'replace');
        });
      } else if (!query.skuId) {
        wx.showModal({
          title: '请先选择商品', content: '', showCancel: false, confirmText: '确认',
        }).then(function () {
          APP.go('/pages/order/order-detail/index?orderNo=' + encodeURIComponent(query.orderNo), 'replace');
        });
      }
      if (query && query.orderNo && query.skuId) return refresh();
      return Promise.resolve(inst);
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      inst.root = root;
      root.addEventListener('click', onTap);
      root.addEventListener('click', onOptTap);
      root.addEventListener('input', onInput);
      root.addEventListener('blur', onBlur, true);
      root.addEventListener('change', function (e) {
        var t = e.target;
        if (t && t.getAttribute && t.getAttribute('data-act') === 'filepick') {
          handleFiles(t.files);
        }
      });
    },
  });
})();
