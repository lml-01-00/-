/* 物流详情页 pages/order/delivery-detail/index ← 源 delivery-detail(index.js/wxml/wxss)
 * 入口:订单详情查看物流(query.data=轨迹序列化,source 空)与 售后查看物流(source=2,data=logisticsVO)
 * source=2 → {company:logisticsCompanyName, logisticsNo, nodes} 映射;否则原样使用 data
 * 卡1(快递单号[复制]/物流公司[拨打 phoneNumber]);卡2 垂直时间轴节点(icon:http→img,字体名→wr 图标,空→锚点圆)
 * 锚点:首节点 #ffece9 其余 #f5f5f5(源 t-steps 默认 anchor);icon 字形首 #ef5433 其余 #bbb
 * 全部标题/说明被源 css !important 覆盖为 #333(非高亮),1:1
 */
(function () {
  var instRef = null;
  function iconPart(ic, isFirst) {
    if (!ic) return '';
    if (ic.indexOf('http') > -1) return '<img src="' + ic + '" alt=""/>';
    return '<i class="wr wr-' + ic + '"' + (isFirst ? ' style="color:#ef5433"' : ' style="color:#bbb"') + '></i>';
  }
  function render() {
    var d = this.data.logisticsData || {};
    var rows = '';
    if (d.logisticsNo) {
      rows += '<div class="dlv-row">' +
        '<span class="dlv-lb">快递单号</span>' +
        '<span class="dlv-val dlv-val--no">' + (d.logisticsNo || '') + '</span>' +
        '<span class="dlv-tbtn" data-act="copy">复制</span>' +
        '</div>';
    }
    if (d.company) {
      rows += '<div class="dlv-row">' +
        '<span class="dlv-lb">物流公司</span>' +
        '<span class="dlv-val">' + (d.company || '') + (d.phoneNumber ? '-' + d.phoneNumber : '') + '</span>' +
        (d.phoneNumber ? '<span class="dlv-tbtn" data-act="call">拨打</span>' : '') +
        '</div>';
    }
    var cell1 = (d.logisticsNo || d.company)
      ? '<div class="dlv-card dlv-cells">' + rows + '</div>'
      : '';
    var steps = (d.nodes || []).map(function (n, i) {
      var line = i < (d.nodes || []).length - 1 ? '<div class="dlv-line"></div>' : '';
      return '<div class="dlv-node' + (i === 0 ? ' cur' : '') + '">' +
        '<div class="dlv-side"><div class="dlv-anchor">' + iconPart(n.icon, i === 0) + '</div>' + line + '</div>' +
        '<div class="dlv-main">' +
        (n.title ? '<div class="dlv-title">' + n.title + '</div>' : '') +
        (n.desc ? '<div class="dlv-desc">' + n.desc + '</div>' : '') +
        (n.date ? '<div class="dlv-date">' + n.date + '</div>' : '') +
        '</div></div>';
    }).join('');
    var cell2 = steps ? '<div class="dlv-card dlv-steps">' + steps + '</div>' : '';
    return '<div class="dlv-page">' + cell1 + cell2 + '</div>';
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    var inst = instRef;
    if (act === 'copy') {
      wx.setClipboardData({ data: inst.data.logisticsData.logisticsNo || '' });
    } else if (act === 'call') {
      wx.makePhoneCall({ phoneNumber: inst.data.logisticsData.phoneNumber || '' });
    }
  }

  APP.reg('/pages/order/delivery-detail/index', {
    title: '物流信息',
    nav: 'default',
    reinitOnQuery: true,
    data: { logisticsData: { logisticsNo: '', nodes: [], company: '', phoneNumber: '' } },
    init: function (query) {
      var inst = this;
      instRef = inst;
      var data = null;
      try {
        data = JSON.parse(decodeURIComponent((query && query.data) || '{}'));
      } catch (err) {
        data = null;
      }
      if (Number(query && query.source) === 2) {
        inst.data.logisticsData = {
          company: (data && data.logisticsCompanyName) || '',
          logisticsNo: (data && data.logisticsNo) || '',
          nodes: (data && data.nodes) || [],
        };
      } else if (data) {
        inst.data.logisticsData = {
          logisticsNo: data.logisticsNo || '',
          company: data.company || '',
          phoneNumber: data.phoneNumber || '',
          nodes: data.nodes || [],
        };
      }
      return Promise.resolve(inst);
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
  });
})();
