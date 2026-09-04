/* 收货地址列表页 pages/user/address/list/index ← 源 address/list(index.js + ui-address-item + t-location + t-empty)
 * query: selectMode=1(选择模式,点行回传地址给 order-confirm)/ isOrderSure=1 / id=已选地址 id(勾选高亮)
 * 行=姓名+隐藏手机号+标签(默认/公司)+拼接地址;非选择模式点行→编辑;选择模式点行→resolve 桥 + 返回
 * 微信地址导入:wx.chooseAddress mock → selectMode 下直接 resolve;否则存 storage 进编辑页预填
 * 新建/编辑前注册 ADDR_EDIT 桥(源 waitForNewAddress + getAddressPromise);leave 未选择时 reject ADDR_SELECT
 * 源 ui-address-item 为左滑删除,web 端删除按钮常驻行尾;行高亮勾在 extraSpace(选择模式)下展示
 */
(function () {
  var instRef = null;
  var selectMode = false; // 源 Page 属性(selectMode 不经 data)
  var hasSelect = false;  // 已选过,离开时不再 reject(源 onUnload 判断)

  function maskPhone(p) {
    var s = String(p || '');
    return s.length >= 11 ? s.substring(0, 3) + '****' + s.substring(7) : s;
  }
  function rowHtml(a, idx, total, showCheck) {
    var cls = idx + 1 < total ? ' al-item--line' : '';
    var check = showCheck
      ? '<span class="al-check' + (a.checked ? ' on' : '') + '"><i class="wr wr-check"></i></span>' : '';
    var defTag = Number(a.isDefault) === 1 ? '<span class="al-tag al-tag--default">默认</span>' : '';
    var tag = a.tag ? '<span class="al-tag al-tag--plain">' + a.tag + '</span>' : '';
    return '<div class="al-item' + cls + '" data-act="select" data-i="' + idx + '">' + check +
      '<div class="al-body">' +
      '<div class="al-title"><span class="al-name">' + a.name + '</span><span class="al-phone">' + maskPhone(a.phoneNumber || a.phone) + '</span></div>' +
      '<div class="al-tags">' + defTag + tag +
      '<span class="al-addr">' + (a.address || '') + '</span></div>' +
      '</div>' +
      '<div class="al-tools">' +
      '<span class="al-del" data-act="del" data-i="' + idx + '">删除</span>' +
      '<span class="al-edit" data-act="edit" data-i="' + idx + '"><i class="wr wr-edit"></i></span>' +
      '</div></div>';
  }
  function render() {
    var d = this.data;
    var list = d.addressList || [];
    var html = '';
    list.forEach(function (a, i) { html += rowHtml(a, i, list.length, selectMode); });
    var emptyHtml = '<div class="al-empty">' +
      '<div class="al-empty-box"></div><div class="al-empty-txt">暂无收货地址,赶快添加吧</div></div>';
    var reachedMax = list.length >= 20;
    return '<div class="al-page">' +
      '<div class="al-list">' + (list.length ? html : emptyHtml) + '</div>' +
      '<div class="al-bottom">' +
      '<div class="al-btnrow">' +
      '<div class="al-loc' + (reachedMax ? ' disabled' : '') + '" data-act="weixin">' +
      '<i class="wr wr-wechat" style="color:#0ABF5B;font-style:normal"></i><span>微信地址导入</span></div>' +
      '<div class="al-add' + (reachedMax ? ' disabled' : '') + '" data-act="add">' +
      '<i class="wr wr-add" style="font-style:normal"></i><span>新建收货地址</span></div>' +
      '</div>' +
      (reachedMax ? '<div class="al-foot">最多支持添加20个收货地址</div>' : '') +
      '</div></div>';
  }

  /* ---------- 编辑保存后合并(源 waitForNewAddress then) ---------- */
  function mergeNewAddress(inst, n) {
    var list = (inst.data.addressList || []).slice();
    n.phoneNumber = n.phone;
    n.address = (n.provinceName || '') + (n.cityName || '') + (n.districtName || '') + (n.detailAddress || '');
    n.tag = n.addressTag;
    if (!n.addressId) {
      n.id = '' + list.length;
      n.addressId = '' + list.length;
      if (Number(n.isDefault) === 1) {
        list.forEach(function (a) { a.isDefault = 0; });
      } else {
        n.isDefault = 0;
      }
      list.push(n);
    } else {
      list = list.map(function (a) { return String(a.addressId) === String(n.addressId) ? n : a; });
    }
    list.sort(function (a, b) {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
    inst.data.addressList = list;
  }
  function isListCur() {
    return APP.cur && APP.cur.path === '/pages/user/address/list/index';
  }
  function goEdit(id) {
    // 源 editAddressHandle/createHandle:先 getAddressPromise 再跳转,编辑保存/取消后回到此处处理
    SVC.ADDR_EDIT.wait().then(function (payload) {
      mergeNewAddress(instRef, payload);
      if (isListCur()) instRef.refresh();
    }).catch(function () {});
    var url = id != null && id !== '' && id !== undefined
      ? '/pages/user/address/edit/index?id=' + encodeURIComponent(id)
      : '/pages/user/address/edit/index';
    APP.go(url, 'push');
  }
  /* 微信地址导入(源 t-location getWxLocation + list 页 onWeixinAddressPassed 链路) */
  function importWeixin(inst) {
    if ((inst.data.addressList || []).length >= 20) return; // 源 isDisabledBtn
    wx.chooseAddress({
      success: function (res) {
        var phone = res.telNumber || '';
        var phoneReg = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\d|9\d)\d{8}$/;
        if (!phoneReg.test(phone)) {
          wx.showToast({ title: '请填写正确的手机号', icon: 'none' });
          return;
        }
        var area = SVC.parseArea(res.provinceName, res.cityName, res.countyName);
        if (!area) {
          wx.showToast({ title: '地址解析出错,请稍后再试', icon: 'none' });
          return;
        }
        var params = {
          name: res.userName, phone: phone,
          countryName: '中国', countryCode: 'chn',
          detailAddress: res.detailInfo,
          provinceName: res.provinceName, provinceCode: area.provinceCode,
          cityName: res.cityName, cityCode: area.cityCode,
          districtName: res.countyName, districtCode: area.districtCode,
          isDefault: false, addressTag: '微信地址',
          latitude: '', longitude: '',
        };
        if (inst.data.isOrderSure) {
          // 源 onHandleSubmit:确认下单页存在 → resolve + 返回
          hasSelect = true;
          SVC.ADDR_SELECT.resolve(params);
          APP.back(1);
        } else {
          // 源 navigateUrl 路线:进编辑页由微信数据预填(源 eventChannel 未接线,web 以 storage 传递)
          wx.setStorageSync('wxImportAddress', params);
          goEdit(undefined);
        }
      },
    });
  }

  /* ---------- 事件 ---------- */
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    var i = Number(t.getAttribute('data-i')) || 0;
    if (act === 'select') {
      var item = (inst.data.addressList || [])[i];
      if (!item) return;
      if (selectMode) {
        hasSelect = true;
        SVC.ADDR_SELECT.resolve(item);
        APP.back(1);
      } else {
        goEdit(item.id);
      }
    } else if (act === 'edit') {
      var it = (inst.data.addressList || [])[i];
      if (it) goEdit(it.id);
    } else if (act === 'del') {
      // 源 swipe 删除按钮 deleteAddressHandle:filter 即删
      inst.data.addressList = (inst.data.addressList || []).filter(function (_, k) { return k !== i; });
      inst.refresh();
    } else if (act === 'add') {
      if ((inst.data.addressList || []).length >= 20) return;
      goEdit(undefined);
    } else if (act === 'weixin') {
      importWeixin(inst);
    }
  }

  APP.reg('/pages/user/address/list/index', {
    title: '收货地址',
    nav: 'default',
    reinitOnQuery: true,
    data: { addressList: [], isOrderSure: false },
    init: function (query) {
      var inst = this;
      instRef = inst;
      query = query || {};
      selectMode = !!query.selectMode;
      hasSelect = false;
      inst.data.isOrderSure = !!query.isOrderSure;
      return SVC.fetchAddressList().then(function (list) {
        var id = query.id != null ? String(query.id) : '';
        list.forEach(function (a) {
          if (id && String(a.id) === id) a.checked = true;
        });
        inst.data.addressList = list;
        return inst;
      });
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
    },
    leave: function () {
      // 源 onUnload:选择模式且未选择才拒绝(避免 oc 侧悬空 promise)
      if (selectMode && !hasSelect) SVC.ADDR_SELECT.reject(new Error('cancel'));
    },
  });
})();
