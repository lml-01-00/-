/* 个人资料页 pages/user/person-info/index ← 源 person-info(index.js + t-cell + t-select-picker)
 * 行:头像(点击选图,仅提示文件名,源不真正上传)/ 昵称(→name-edit?name=)/ 性别(底部弹层 男/女)/ 手机号(展示加密)
 * 昵称编辑返回:name-edit 保存写 storage('userNick'),onShow 读取覆盖(源 backRefresh 无回显闭环,web 补齐)
 * 底部:切换账号登录(源 openUnbindConfirm 未接弹窗 → web 弹说明)
 */
(function () {
  var instRef = null;
  function maskPhone(p) {
    return String(p || '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  function render() {
    var p = this.data.personInfo;
    return '<div class="pi-page">' +
      '<div class="pi-card">' +
      '<div class="pi-row" data-act="avatar">' +
      '<span class="pi-label">头像</span>' +
      '<img class="pi-avatar" src="' + (p.avatarUrl || '') + '" alt="" onerror="this.style.visibility=\'hidden\'"/>' +
      '<i class="wr wr-arrow_right" style="font-size:14px;color:#ccc;font-style:normal"></i></div>' +
      '<div class="pi-row" data-act="name">' +
      '<span class="pi-label">昵称</span><span class="pi-note">' + (p.nickName || '') + '</span>' +
      '<i class="wr wr-arrow_right" style="font-size:14px;color:#ccc;font-style:normal"></i></div>' +
      '<div class="pi-row" data-act="gender">' +
      '<span class="pi-label">性别</span><span class="pi-note">' + (['', '男', '女'][Number(p.gender)] || '') + '</span>' +
      '<i class="wr wr-arrow_right" style="font-size:14px;color:#ccc;font-style:normal"></i></div>' +
      '<div class="pi-row pi-row--last" data-act="phone">' +
      '<span class="pi-label">手机号</span><span class="pi-note">' + (p.phoneNumber || '去绑定手机号') + '</span>' +
      '<i class="wr wr-arrow_right" style="font-size:14px;color:#ccc;font-style:normal"></i></div>' +
      '</div>' +
      '<div class="pi-bottom"><div class="pi-logout" data-act="logout">切换账号登录</div></div>' +
      '</div>';
  }

  /* 性别选择(源 t-select-picker 底部弹层;web 复用 wx.showActionSheet 单列点选) */
  function pickGender() {
    wx.showActionSheet({
      itemList: ['男', '女'],
      success: function (res) {
        var g = res.tapIndex === 0 ? 1 : 2;
        instRef.data.personInfo.gender = g;
        instRef.refresh();
        wx.showToast({ title: '设置成功', icon: 'success' });
      },
    });
  }
  /* 头像(源 toModifyAvatar:仅选图提示,不真正上传) */
  function toModifyAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var f = (res.tempFiles && res.tempFiles[0]) || {};
        var name = String(f.path || '').split('/').pop() || '图片';
        wx.showToast({ title: '已选择图片-' + name, icon: 'success' });
      },
      fail: function (err) {
        if (err && err.errMsg === 'chooseImage:fail cancel') return;
        wx.showToast({ title: (err && (err.errMsg || err.msg)) || '修改头像出错了', icon: 'none' });
      },
    });
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'avatar') {
      toModifyAvatar();
    } else if (act === 'name') {
      APP.go('/pages/user/name-edit/index?name=' + encodeURIComponent(instRef.data.personInfo.nickName || ''), 'push');
    } else if (act === 'gender') {
      pickGender();
    } else if (act === 'logout') {
      wx.showModal({
        title: '切换账号登录',
        content: '网页演示版内置演示账号,暂不支持多账号切换',
        showCancel: false,
        confirmText: '知道了',
      });
    }
  }

  APP.reg('/pages/user/person-info/index', {
    title: '个人资料',
    nav: 'default',
    data: {
      personInfo: { avatarUrl: '', nickName: '', gender: 0, phoneNumber: '' },
    },
    init: function () {
      var inst = this;
      instRef = inst;
      return SVC.fetchPerson().then(function (info) {
        inst.data.personInfo = {
          avatarUrl: info.avatarUrl || '',
          nickName: info.nickName || '',
          gender: Number(info.gender) || 0,
          phoneNumber: maskPhone(info.phoneNumber || ''),
        };
        var nick = wx.getStorageSync('userNick');
        if (nick) inst.data.personInfo.nickName = nick;
        return inst;
      });
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
    show: function () {
      // name-edit 保存返回后回显新昵称(源无回显闭环,web 以 storage 传递)
      if (!instRef) return;
      var nick = wx.getStorageSync('userNick');
      if (nick && instRef.data.personInfo.nickName !== nick) {
        instRef.data.personInfo.nickName = nick;
        instRef.refresh();
      }
    },
  });
})();
