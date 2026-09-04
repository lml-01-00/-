/* 发票页 pages/order/receipt/index ← receipt(index.js + json/wxml/wxss)
 * 顶部行选发票类型(不开发票/电子发票);选电子发票后显示:抬头(个人/公司)、
 * 姓名或公司名称、手机号或纳税人识别号(公司时带 help)、电子邮箱、发票内容(明细/类别)
 * 底部固定"确定":校验通过后,有 orderNo → dispatchSupplementInvoice(补开)提示保存成功返回;
 * 无 orderNo(order-confirm 进入)→ 写 storage invoiceData 后返回,确认页显示"电子普通发票 (...)"
 * 发票须知/纳税人识别号说明:居中弹层(list 文本,仅确认按钮)
 * 输入即时上屏:输入框绑定 inst 数据 + DOM 级处理(不做整页重绘以免失焦)
 */
(function () {
  var instRef = null;
  var INVOICE_JSON = {
    info: [
      '1.根据当地税务局的要求，开具有效的企业发票需填写税务局登记证号。开具个人发票不需要填写纳税人识别码。 ',
      '2.电子普通发票： 电子普通发票是税局认可的有效首付款凭证，其法律效力、基本用途及使用规定同纸质发票，如需纸质发票可自行下载打印。 ',
      '3.增值税专用发票： 增值税发票暂时不可开，可查看《开局增值税发票》或致电400-633-6868。',
    ],
    codeTitle: [
      '1.什么是纳税人识别号/统一社会信用代码？ 纳税人识别号，一律由15位、17位、18或者20位码（字符型）组成，其中：企业、事业单位等组织机构纳税人，以国家质量监督检验检疫总局编制的9位码（其中区分主码位与校检位之间的“—”符省略不打印）并在其“纳税人识别号”。国家税务总局下达的纳税人代码为15位，其中：1—2位为省、市代码，3—6位为地区代码，7—8位为经济性质代码，9—10位行业代码，11—15位为各地区自设的顺序码。',
      '2.入户获取/知晓纳税人识别号/统一社会信用代码？ 纳税人识别号是税务登记证上的号码，通常简称为“税号”，每个企业的纳税人识别号都是唯一的。这个属于每个人自己且终身不变的数字代码很可能成为我们的第二张“身份证”。  ',
    ],
  };

  function isCompany() { return instRef.data.addressTagsIndex === 1; }
  function ic(name, sizePx, color) {
    return '<i class="wr wr-' + name + '" style="font-size:' + sizePx + 'px;color:' + color +
      ';font-style:normal;line-height:1"></i>';
  }
  function toggleRow(title, activeIdx, options) {
    var btns = '';
    options.forEach(function (o) {
      btns += '<span class="rc-btn' + (o.id === activeIdx ? ' active' : '') + '" data-act="label"' +
        ' data-group="' + o.group + '" data-id="' + o.id + '">' + o.title + '</span>';
    });
    return '<div class="rc-row"><span class="rc-label">' + title + '</span>' +
      '<div class="rc-btn-wrap">' + btns + '</div></div>';
  }
  function inputRowHtml(title, ph, value, key, extra) {
    return '<div class="rc-row rc-input-row">' +
      '<span class="rc-label">' + title + '</span>' +
      '<div class="rc-input-cell">' +
      '<input class="rc-input" data-key="' + key + '" value="' + escAttr(value) + '" placeholder="' + ph + '" maxlength="40"/>' +
      (extra || '') + '</div></div>';
  }
  function escAttr(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function textList(lines) {
    var h = '';
    lines.forEach(function (t) { h += '<div class="rc-dlg-line">' + t + '</div>'; });
    return h;
  }

  function render() {
    var d = this.data;
    var isElec = d.receiptIndex === 1;
    var body = '';
    if (isElec) {
      var helpIcon = isCompany()
        ? '<span class="rc-help" data-act="codehelp">' + ic('help', 15, '#fa4126') + '</span>' : '';
      body = toggleRow('发票抬头', d.addressTagsIndex, [
        { title: '个人', id: 0, group: 'tag' }, { title: '公司', id: 1, group: 'tag' },
      ]) +
      inputRowHtml(isCompany() ? '公司名称' : '姓名',
        isCompany() ? '请输入公司名称' : '请输入您的姓名',
        isCompany() ? d.componentName : d.name, 'name') +
      inputRowHtml(isCompany() ? '识别号' : '手机号',
        isCompany() ? '请输入纳税人识别号' : '请输入您的手机号',
        isCompany() ? d.code : d.phone, 'code', helpIcon) +
      '<div class="rc-divider"></div>' +
      inputRowHtml('电子邮箱', '请输入邮箱用于接收电子发票', d.email, 'email') +
      '<div class="rc-info-box">' +
      toggleRow('发票内容', d.goodsClassesIndex, [
        { title: '商品明细', id: 0, group: 'cls' }, { title: '商品类别', id: 1, group: 'cls' },
      ]) +
      '<div class="rc-info-tip">发票内容将显示详细商品名称与价格信息，发票金额为实际支付金额，不包含优惠等扣减金额</div>' +
      '</div>' +
      '<div class="rc-know" data-act="know">发票须知' + ic('help', 15, '#999999') + '</div>';
    }
    var show = d.dialogShow ? ' show' : '';
    var dlgTitle = d.codeShow ? '纳税人识别号说明' : '发票须知';
    var dlgLines = d.codeShow ? INVOICE_JSON.codeTitle : INVOICE_JSON.info;

    return '<div class="rc-page">' +
      '<div class="rc-card">' +
      toggleRow('发票', d.receiptIndex, [
        { title: '不开发票', id: 0, group: 'receipt' }, { title: '电子发票', id: 1, group: 'receipt' },
      ]) +
      '</div>' +
      body +
      '<div class="rc-foot-space"></div>' +
      '<div class="rc-bottom"><div class="rc-submit" data-act="sure">确定</div></div>' +
      /* 发票须知弹层 */
      '<div class="rc-dlg-mask' + show + '">' +
      '<div class="rc-dlg">' +
      '<div class="rc-dlg-title">' + dlgTitle + '</div>' +
      '<div class="rc-dlg-body">' + textList(dlgLines) + '</div>' +
      '<div class="rc-dlg-btn" data-act="knowclose">我知道了</div>' +
      '</div></div>' +
      '</div>';
  }

  function onLabel(inst, group, id) {
    if (group === 'receipt') inst.data.receiptIndex = id;
    else if (group === 'tag') inst.data.addressTagsIndex = id;
    else if (group === 'cls') inst.data.goodsClassesIndex = id;
    inst.refresh();
  }
  function setKey(key, value) {
    var d = instRef.data;
    if (key === 'name') {
      if (d.addressTagsIndex === 0) d.name = value; else d.componentName = value;
    } else if (key === 'code') {
      if (d.addressTagsIndex === 0) d.phone = value; else d.code = value;
    } else if (key === 'email') {
      d.email = value;
    }
  }
  function checkSure() {
    var d = instRef.data;
    if (d.receiptIndex === 0) return true;
    if (d.addressTagsIndex === 0) {
      if (!d.name.length || !d.phone.length) return false;
    } else if (!d.componentName.length || !d.code.length) {
      return false;
    }
    return !!d.email.length;
  }
  function onSure() {
    var inst = instRef;
    if (!checkSure()) {
      wx.showModal({ title: '请填写发票信息', content: '', confirmText: '确认', showCancel: false });
      return;
    }
    var d = inst.data;
    var data = {
      buyerName: d.addressTagsIndex === 0 ? d.name : d.componentName,
      buyerTaxNo: d.code,
      buyerPhone: d.phone,
      email: d.email,
      titleType: d.addressTagsIndex === 0 ? 1 : 2,
      contentType: d.goodsClassesIndex === 0 ? 1 : 2,
      invoiceType: d.receiptIndex === 1 ? 5 : 0,
    };
    if (inst.data._orderNo) {
      if (inst.data._submitting) return;
      inst.data._submitting = true;
      SVC.dispatchSupplementInvoice({
        parameter: { orderNo: inst.data._orderNo, invoiceVO: data },
      }).then(function () {
        wx.showToast({ title: '保存成功', icon: 'none' });
        setTimeout(function () {
          inst.data._submitting = false;
          inst.back();
        }, 1000);
      });
    } else {
      wx.setStorageSync('invoiceData', data);
      inst.back();
    }
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    if (act === 'label') {
      onLabel(inst, t.getAttribute('data-group'), Number(t.getAttribute('data-id')));
    } else if (act === 'sure') {
      onSure();
    } else if (act === 'know' || act === 'knowclose') {
      var close = act === 'knowclose';
      inst.data.dialogShow = !inst.data.dialogShow;
      if (close) inst.data.codeShow = false;
      inst.refresh();
    } else if (act === 'codehelp') {
      inst.data.dialogShow = true;
      inst.data.codeShow = true;
      inst.refresh();
    }
  }
  function onMaskTap(e) {
    var inst = instRef;
    var m = inst.root.querySelector('.rc-dlg-mask');
    if (m && e.target === m) {
      inst.data.dialogShow = false;
      inst.data.codeShow = false;
      inst.refresh();
    }
  }

  APP.reg('/pages/order/receipt/index', {
    title: '发票',
    nav: 'default',
    data: {
      receiptIndex: 0,
      addressTagsIndex: 0,
      goodsClassesIndex: 0,
      dialogShow: false,
      codeShow: false,
      name: '', componentName: '', code: '', phone: '', email: '',
    },
    init: function (query) {
      var inst = this;
      instRef = inst;
      var temp = {};
      if (query && query.invoiceData) {
        try { temp = JSON.parse(query.invoiceData); } catch (e) { temp = {}; }
      }
      inst.data._orderNo = (query && query.orderNo) || '';
      if (temp && typeof temp === 'object') {
        inst.data.receiptIndex = temp.invoiceType === 5 ? 1 : 0;
        inst.data.name = temp.buyerName || '';
        inst.data.email = temp.email || '';
        inst.data.phone = temp.buyerPhone || '';
        inst.data.addressTagsIndex = temp.titleType === 2 ? 1 : 0;
        inst.data.goodsClassesIndex = temp.contentType === 2 ? 1 : 0;
        inst.data.code = temp.buyerTaxNo || '';
        inst.data.componentName = temp.titleType === 2 ? temp.buyerName : '';
      }
      return inst;
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
      root.addEventListener('click', onMaskTap);
      // 输入即时写入 data(不重绘,保焦点)
      Array.prototype.forEach.call(root.querySelectorAll('.rc-input'), function (inp) {
        inp.addEventListener('input', function () {
          setKey(inp.getAttribute('data-key'), inp.value);
        });
      });
    },
  });
})();
