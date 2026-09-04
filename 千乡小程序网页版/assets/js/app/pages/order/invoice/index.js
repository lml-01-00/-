/* 发票详情页 pages/order/invoice/index ← 源 invoice(index.js/wxml/wxss)
 * 入口:订单详情 发票行→查看(带 orderNo);fetchOrderDetail 同接口取 invoiceVO
 * mapping 1:1:invoiceType 5→'电子普通发票' else '不开发票';titleType 1→个人 else 公司;contentType 1→商品明细 else '2类别'
 * isInvoice = buyerName?'已开票':'未开票'(源 quirk:以抬头名判开票状态)
 * 两白卡:发票详情(类型/抬头/税号/内容/金额)+ 收票人信息(邮箱/手机/开票状态);空字段留白
 */
(function () {
  var instRef = null;
  function row(lb, val) {
    return '<div class="inv-row"><div class="inv-lb">' + lb + '</div><div class="inv-val">' +
      (val == null || val === '' ? '' : esc(val)) + '</div></div>';
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function card(title, rows) {
    return '<div class="inv-card"><div class="inv-title">' + title + '</div>' + rows + '</div>';
  }
  function render() {
    var i = this.data.invoice || {};
    var inner = card('发票详情',
      row('发票类型', i.invoiceType) +
      row('发票抬头', i.buyerName) +
      row('纳税人识别号', i.buyerTaxNo) +
      row('发票内容', i.contentType) +
      row('发票金额', i.money));
    var receiver = card('收票人信息',
      row('邮箱', i.email) +
      row('手机号', i.buyerPhone) +
      row('开票状态', i.isInvoice));
    return '<div class="inv-page">' + inner + receiver + '</div>';
  }
  function load() {
    var inst = instRef;
    return SVC.fetchOrderDetail({ parameter: inst.orderNo }).then(function (res) {
      var vo = ((res && res.data) || {}).invoiceVO || {};
      inst.data.invoice = {
        buyerName: vo.buyerName != null ? vo.buyerName : '',
        buyerTaxNo: vo.buyerTaxNo != null ? vo.buyerTaxNo : '',
        buyerPhone: vo.buyerPhone != null ? vo.buyerPhone : '',
        email: vo.email != null ? vo.email : '',
        titleType: vo.titleType === 1 ? '个人' : '公司',
        contentType: vo.contentType === 1 ? '商品明细' : '2类别',
        invoiceType: vo.invoiceType === 5 ? '电子普通发票' : '不开发票',
        isInvoice: vo.buyerName ? '已开票' : '未开票',
        money: vo.money != null ? vo.money : '',
      };
      return inst;
    });
  }

  APP.reg('/pages/order/invoice/index', {
    title: '发票详情',
    nav: 'default',
    reinitOnQuery: true,
    data: { invoice: {} },
    init: function (query) {
      var inst = this;
      instRef = inst;
      inst.orderNo = query && query.orderNo;
      return load();
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
    },
  });
})();
