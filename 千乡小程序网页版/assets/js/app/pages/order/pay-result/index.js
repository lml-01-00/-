/* 支付结果页 pages/order/pay-result/index ← pay-result(index.js/wxml/wxss)
 * 源 json 为 custom + t-navbar,本项目导航统一 default(绿条返回+标题),页面主体白底
 * 对勾 + 支付成功 + 微信支付金额 + 两个按钮(查看订单→order-list?orderNo / 返回首页→tab home)
 * onTapReturn 的 order 分支(order-detail)与 groupon 等字段源未接线,仅保留 orderList/home
 */
(function () {
  function render() {
    var d = this.data;
    var money = '';
    if (d.totalPaid) {
      money = '<div class="pr-money">微信支付:' + UP.ph(d.totalPaid, 'pr-money-price') + '</div>';
    }
    return '<div class="pr-page">' +
      '<div class="pr-status"><i class="wr wr-check pr-check"></i><span>支付成功</span></div>' +
      money +
      '<div class="pr-btns">' +
      '<div class="pr-btn" data-act="orderList">查看订单</div>' +
      '<div class="pr-btn" data-act="home">返回首页</div>' +
      '</div></div>';
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'home') {
      APP.go('/pages/home/home', 'tab');
    } else if (act === 'orderList') {
      APP.go('/pages/order/order-list/index?orderNo=' + encodeURIComponent(instRef.data.orderNo), 'push');
    }
  }
  var instRef = null;
  APP.reg('/pages/order/pay-result/index', {
    title: '支付结果',
    nav: 'default',
    reinitOnQuery: true,
    data: { totalPaid: 0, orderNo: '', groupId: '' },
    init: function (query) {
      var inst = this;
      instRef = inst;
      inst.data.totalPaid = query.totalPaid ? Number(query.totalPaid) : 0;
      inst.data.orderNo = query.orderNo || '';
      inst.data.groupId = query.groupId || '';
      return inst;
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
  });
})();
