/* 个人中心页 pages/usercenter/index ← index(沉浸式绿色头卡 + 我的订单 + 菜单)
 * 顶部固定渐变头卡:头像(可点击换头像:选图 dataURL 预览/保存/恢复默认)+ 昵称,整卡点击进资料页
 * 我的订单组(5 状态入口,数字角标来自 mock)+ 菜单两组(地址/优惠券/积分/帮助/客服)
 * 客服热线底部弹层(服务时间 + 电话客服拨打 + 在线客服占位);头像弹层(预览/选图/恢复/保存)
 * 源 wx.chooseMedia/wx.saveFile 无 web 等价:用 file 输入读 dataURL,dataURL 直接视为可保存路径
 */
(function () {
  var DEFAULT_AVATAR =
    'https://tdesign.gtimg.com/miniprogram/template/retail/usercenter/icon-user-center-avatar@2x.png';

  var menuData = [
    [
      { title: '收货地址', tit: '', type: 'address' },
      { title: '优惠券', tit: '', type: 'coupon' },
      { title: '积分', tit: '', type: 'point' },
    ],
    [
      { title: '帮助中心', tit: '', type: 'help-center' },
      { title: '客服热线', tit: '', type: 'service', icon: 'service' },
    ],
  ];
  var orderTagInfos = [
    { title: '待付款', iconName: 'wallet', orderNum: 0, tabType: 5 },
    { title: '待发货', iconName: 'deliver', orderNum: 0, tabType: 10 },
    { title: '待收货', iconName: 'package', orderNum: 0, tabType: 40 },
    { title: '待评价', iconName: 'comment', orderNum: 0, tabType: 60 },
    { title: '退款/售后', iconName: 'exchang', orderNum: 0, tabType: 0 },
  ];

  function ic(name, sizePx, color, extraCls) {
    return '<i class="wr wr-' + name + (extraCls ? ' ' + extraCls : '') + '"' +
      ' style="font-size:' + sizePx + 'px;color:' + color + ';font-style:normal;line-height:1"></i>';
  }
  function gradientIcon(name, sizePx) {
    /* order 组图标:灰渐变文字填充(tdesign customStyle 等价) */
    return '<i class="wr wr-' + name + ' uc-o-icon" style="font-size:' + sizePx + 'px">' +
      '</i>';
  }
  function menuRowHtml(m) {
    var right = '';
    if (m.tit) right += '<span class="uc-cell-note">' + m.tit + '</span>';
    if (m.icon) right += ic(m.icon, 22, '#999999');
    else right += ic('arrow_right', 18, '#c8c9cc', 'uc-cell-arrow');
    return '<div class="uc-cell" data-act="menu" data-type="' + m.type + '">' +
      '<span class="uc-cell-title">' + m.title + '</span>' +
      '<div class="uc-cell-right">' + right + '</div></div>';
  }
  function orderItemHtml(o, idx) {
    var badge = o.orderNum > 0
      ? '<span class="uc-o-badge">' + (o.orderNum > 99 ? '99+' : o.orderNum) + '</span>' : '';
    return '<div class="uc-o-item" data-act="oitem" data-type="' + o.tabType + '">' +
      '<div class="uc-o-icon-wrap">' + gradientIcon(o.iconName, 28) + badge + '</div>' +
      '<span class="uc-o-title">' + o.title + '</span></div>';
  }
  function render() {
    var d = this.data;
    var u = d.userInfo || {};
    var avatarUrl = u.avatarUrl || DEFAULT_AVATAR;
    var orderHtml = '';
    d.orderTagInfos.forEach(function (o, i) { orderHtml += orderItemHtml(o, i); });
    var menus = '';
    d.menuData.forEach(function (group) {
      var rows = '';
      group.forEach(function (m) { rows += menuRowHtml(m); });
      menus += '<div class="uc-cell-box">' + rows + '</div>';
    });
    var sheetRows = '';
    if (d.customerServiceInfo && d.customerServiceInfo.serviceTimeDuration) {
      sheetRows += '<div class="uc-sheet-title">服务时间: ' + d.customerServiceInfo.serviceTimeDuration + '</div>';
    }
    sheetRows += '<div class="uc-sheet-row" data-act="callrow">电话客服</div>' +
      '<div class="uc-sheet-row" data-act="onlinrow">在线客服</div>' +
      '<div class="uc-sheet-row uc-sheet-cancel" data-act="sclose">取消</div>';

    return '<div class="uc-page">' +
      /* 沉浸式渐变头卡 */
      '<div class="uc-hero">' +
      '<div class="uc-hero-in">' +
      '<div class="uc-hero-head" data-act="useredit">' +
      '<div class="uc-avatar-wrap" data-act="avatarconf">' +
      '<img class="uc-avatar" src="' + avatarUrl + '" alt="" onerror="this.onerror=null;' +
      "this.src='" + DEFAULT_AVATAR + "'" + '"/></div>' +
      '<div class="uc-hero-name">' + (u.nickName || '微信用户') + '</div>' +
      '</div></div></div>' +
      /* 主内容 */
      '<div class="uc-body">' +
      '<div class="uc-orders">' +
      '<div class="uc-o-top" data-act="allorders">' +
      '<span class="uc-o-top-title">我的订单</span>' +
      '<span class="uc-o-top-note">全部订单</span>' +
      ic('arrow_right', 18, '#c8c9cc', 'uc-cell-arrow') +
      '</div>' +
      '<div class="uc-o-grid">' + orderHtml + '</div></div>' +
      menus +
      '</div>' +
      /* 客服热线底部弹层 */
      '<div class="uc-sheet-mask">' +
      '<div class="uc-sheet">' + sheetRows + '</div></div>' +
      /* 设置头像居中弹层 */
      '<div class="uc-av-mask">' +
      '<div class="uc-av-pop">' +
      '<div class="uc-av-head">' +
      '<span class="uc-av-title">设置头像</span>' +
      '<div class="uc-av-close" data-act="avclose">' + ic('close', 20, '#1F1F1F') + '</div></div>' +
      '<div class="uc-av-body">' +
      '<div class="uc-av-preview" data-act="avpreview">' +
      (d.avatarDraftUrl && !d.avatarDraftFailed
        ? '<img class="uc-av-img" src="' + d.avatarDraftUrl + '" alt="" data-avimg="1"/>'
        : '<div class="uc-av-ph" data-avph="1">' + ic('person_filled', 32, '#999999') + '</div>') +
      '</div>' +
      '<div class="uc-av-tips">支持从相册选择或拍照上传</div></div>' +
      '<div class="uc-av-actions">' +
      '<div class="uc-btn-out" data-act="avchoose">选择图片</div>' +
      '<div class="uc-btn-out" data-act="avreset">恢复默认</div>' +
      '<div class="uc-btn-save' + (d.avatarDraftUrl ? '' : ' disabled') + '" data-act="avsave">保存</div>' +
      '</div></div></div>' +
      '</div>';
  }

  /* ---------- 头像弹层内部 patch ---------- */
  function avSetPreview(inst) {
    var d = inst.data;
    var pop = inst.root.querySelector('.uc-av-pop');
    if (!pop) return;
    var pv = pop.querySelector('.uc-av-preview');
    var showImg = d.avatarDraftUrl && !d.avatarDraftFailed;
    var img = pop.querySelector('[data-avimg]');
    var ph = pop.querySelector('[data-avph]');
    if (showImg) {
      if (!img) {
        if (ph) ph.remove();
        var n = document.createElement('img');
        n.className = 'uc-av-img';
        n.setAttribute('data-avimg', '1');
        n.src = d.avatarDraftUrl;
        n.alt = '';
        n.addEventListener('error', function () {
          inst.data.avatarDraftFailed = true;
          avSetPreview(inst);
        });
        pv.appendChild(n);
      }
      if (ph) ph.style.display = 'none';
    } else {
      if (!ph) {
        if (img) img.remove();
        var d2 = document.createElement('div');
        d2.className = 'uc-av-ph';
        d2.setAttribute('data-avph', '1');
        d2.innerHTML = ic('person_filled', 32, '#999999');
        pv.appendChild(d2);
      } else {
        ph.style.display = '';
      }
      if (img) img.style.display = 'none';
    }
    var save = pop.querySelector('[data-act="avsave"]');
    if (save) save.className = 'uc-btn-save' + (d.avatarDraftUrl ? '' : ' disabled');
  }
  function openAvatarPopup(inst) {
    var d = inst.data;
    d.avatarDraftUrl = d.userInfo.avatarUrl || wx.getStorageSync('qianxiang_user_avatar_url_v1') || '';
    d.avatarDraftFailed = false;
    avSetPreview(inst);
    var m = inst.root.querySelector('.uc-av-mask');
    if (m) m.classList.add('show');
  }
  function closeAvatarPopup(inst) {
    inst.data.avatarDraftFailed = false;
    var m = inst.root.querySelector('.uc-av-mask');
    if (m) {
      m.classList.remove('show');
      inst.data.avatarDraftUrl = '';
    }
  }
  function pickAvatar(inst) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (f) {
        var reader = new FileReader();
        reader.onload = function () {
          inst.data.avatarDraftUrl = reader.result;
          inst.data.avatarDraftFailed = false;
          avSetPreview(inst);
        };
        reader.readAsDataURL(f);
      }
      input.remove();
    });
    input.click();
  }
  function resetAvatar(inst) {
    wx.removeStorageSync('qianxiang_user_avatar_url_v1');
    inst.data.avatarDraftUrl = '';
    inst.data.avatarDraftFailed = false;
    inst.data.userInfo = Object.assign({}, inst.data.userInfo, { avatarUrl: '' });
    var img = inst.root.querySelector('.uc-avatar');
    if (img) img.src = DEFAULT_AVATAR;
    avSetPreview(inst);
    wx.showToast({ title: '已恢复默认头像', icon: 'none' });
  }
  function saveAvatar(inst) {
    var url = inst.data.avatarDraftUrl;
    if (!url) return;
    /* 源 wx.saveFile 将本地临时文件落地;web dataURL 自带内容,直接视为可保存路径 */
    wx.setStorageSync('qianxiang_user_avatar_url_v1', url);
    inst.data.userInfo = Object.assign({}, inst.data.userInfo, { avatarUrl: url });
    var img = inst.root.querySelector('.uc-avatar');
    if (img) img.src = url;
    closeAvatarPopup(inst);
    wx.showToast({ title: '头像已保存', icon: 'success' });
  }
  /* ---------- 客服热线弹层 ---------- */
  function openSheet(inst) {
    var m = inst.root.querySelector('.uc-sheet-mask');
    if (m) m.classList.add('show');
  }
  function closeSheet(inst) {
    var m = inst.root.querySelector('.uc-sheet-mask');
    if (m) m.classList.remove('show');
  }
  /* ---------- 菜单/订单跳转 ---------- */
  function onClickCell(inst, type) {
    if (type === 'address') {
      APP.go('/pages/user/address/list/index', 'push');
    } else if (type === 'service') {
      openSheet(inst);
    } else if (type === 'help-center') {
      wx.showToast({ title: '你点击了帮助中心', icon: 'none' });
    } else if (type === 'point') {
      wx.showToast({ title: '你点击了积分菜单', icon: 'none' });
    } else if (type === 'coupon') {
      APP.go('/pages/coupon/coupon-list/index', 'push');
    } else {
      wx.showToast({ title: '未知跳转', icon: 'none' });
    }
  }

  function onTap(e) {
    var inst = instRef;
    var t = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'menu') {
      onClickCell(inst, t.getAttribute('data-type'));
    } else if (act === 'allorders') {
      APP.go('/pages/order/order-list/index', 'push');
    } else if (act === 'oitem') {
      var st = Number(t.getAttribute('data-type'));
      if (st === 0) {
        APP.go('/pages/order/after-service-list/index', 'push');
      } else {
        APP.go('/pages/order/order-list/index?status=' + st, 'push');
      }
    } else if (act === 'callrow') {
      var phone = (inst.data.customerServiceInfo && inst.data.customerServiceInfo.servicePhone) || '';
      if (phone) wx.makePhoneCall({ phoneNumber: phone });
      closeSheet(inst);
    } else if (act === 'onlinrow') {
      wx.showToast({ title: '在线客服入口待接入', icon: 'none' });
    } else if (act === 'sclose') {
      closeSheet(inst);
    } else if (act === 'avatarconf') {
      openAvatarPopup(inst);
    } else if (act === 'useredit') {
      APP.go('/pages/user/person-info/index', 'push');
    } else if (act === 'avclose') {
      closeAvatarPopup(inst);
    } else if (act === 'avchoose') {
      pickAvatar(inst);
    } else if (act === 'avreset') {
      resetAvatar(inst);
    } else if (act === 'avsave') {
      saveAvatar(inst);
    } else if (act === 'avpreview') {
      var u2 = inst.data.avatarDraftUrl;
      if (u2) wx.previewImage({ current: u2, urls: [u2] });
    }
  }
  function onMaskClick(e) {
    var inst = instRef;
    var sheet = inst.root.querySelector('.uc-sheet-mask');
    var av = inst.root.querySelector('.uc-av-mask');
    if (sheet && e.target === sheet) closeSheet(inst);
    if (av && e.target === av) closeAvatarPopup(inst);
  }

  var instRef = null;
  APP.reg('/pages/usercenter/index', {
    title: '个人中心',
    nav: 'custom',
    tab: true,
    data: {
      currAuthStep: 1,
      userInfo: { avatarUrl: '', nickName: '', phoneNumber: '' },
      customerServiceInfo: {},
      avatarDraftUrl: '',
      avatarDraftFailed: false,
    },
    init: function () {
      var inst = this;
      instRef = inst;
      return SVC.fetchUserCenter().then(function (res) {
        var countsData = res.countsData || [];
        /* 菜单数字角标注入(countsData 仅有 coupon/point,address 无则留空) */
        menuData[0].forEach(function (v) {
          countsData.forEach(function (c) {
            if (c.type === v.type) v.tit = c.num;
          });
        });
        var info = orderTagInfos.map(function (v, i) {
          var o = (res.orderTagInfos || [])[i] || {};
          return Object.assign({}, v, o);
        });
        var storedAvatar = wx.getStorageSync('qianxiang_user_avatar_url_v1') || '';
        var userInfo = storedAvatar
          ? Object.assign({}, res.userInfo, { avatarUrl: storedAvatar })
          : res.userInfo;
        inst.data.userInfo = userInfo;
        inst.data.menuData = JSON.parse(JSON.stringify(menuData));
        inst.data.orderTagInfos = info;
        inst.data.customerServiceInfo = res.customerServiceInfo || {};
        inst.data.currAuthStep = 2;
        return inst;
      });
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
      root.addEventListener('click', onMaskClick);
    },
  });
})();
