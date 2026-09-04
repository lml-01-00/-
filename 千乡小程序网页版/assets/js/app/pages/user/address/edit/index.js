/* 新建/编辑收货地址页 pages/user/address/edit/index ← 源 address/edit(index.js + t-cell 表单 + t-cascader + t-location)
 * query: id=编辑回填;或列表微信导入经 storage('wxImportAddress') 预填后删除该键
 * 表单:收货人/手机号/地区(自绘三级级联弹层,源 t-cascader theme=tab)/详细地址/标签(家·公司·自定义)/默认地址开关
 * 保存:按 onVerifyInputLegal 七条校验 → resolveAddress(payload) 到 ADDR_EDIT 桥 → back
 * 校验即时反馈:非法时提交钮灰;仅输入不整页重绘(焦点),按钮态经 class 切换
 * 微信导入(chooseAddress)/地图选点(chooseLocation)为 web mock,解析地区名经 SVC.parseArea(源 addressParse)
 * 源 onSearchAddress 的 addressParse 事件未接线(地图点选不落表单),web 端直接填入省市区+门牌
 */
(function () {
  var instRef = null;
  var verifyTips = '';       // 源 privateData.verifyTips
  var hasSave = false;       // 源 hasSava
  var PHONE_RE = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';
  var NAME_RE = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$';

  function emptyState() {
    return {
      labelIndex: null, addressId: '', addressTag: '',
      cityCode: '', cityName: '', countryCode: '', countryName: '', detailAddress: '',
      districtCode: '', districtName: '', isDefault: false, name: '', phone: '',
      provinceCode: '', provinceName: '', latitude: '', longitude: '',
    };
  }
  function fmtArea() {
    var s = instRef.data.locationState;
    return (s.provinceName ? s.provinceName + '/' : '') +
      (s.cityName ? s.cityName + '/' : '') + (s.districtName || '');
  }
  /* ---------- 校验(源 onVerifyInputLegal,返回 {legal, tips}) ---------- */
  function verify() {
    var s = instRef.data.locationState;
    var name = s.name || '', phone = s.phone || '';
    var detail = s.detailAddress || '', dist = s.districtName || '';
    var nameReg = new RegExp(NAME_RE);
    var phoneReg = new RegExp(PHONE_RE);
    if (!name || !name.trim()) return { legal: false, tips: '请填写收货人' };
    if (!nameReg.test(name)) return { legal: false, tips: '收货人仅支持输入中文、英文(区分大小写)、数字' };
    if (!phone || !phone.trim()) return { legal: false, tips: '请填写手机号' };
    if (!phoneReg.test(phone)) return { legal: false, tips: '请填写正确的手机号' };
    if (!dist || !dist.trim()) return { legal: false, tips: '请选择省市区信息' };
    if (!detail || !detail.trim()) return { legal: false, tips: '请完善详细地址' };
    if (detail.trim().length > 50) return { legal: false, tips: '详细地址不能超过50个字' };
    return { legal: true, tips: '添加成功' };
  }
  function refreshSubmit() {
    var r = verify();
    verifyTips = r.tips;
    instRef.data.submitActive = r.legal;
    var btn = document.querySelector('.ae-submit');
    if (btn) btn.classList.toggle('disabled', !r.legal);
  }

  /* ---------- 渲染 ---------- */
  function cellHtml(label, key, type, ph, maxlen) {
    var s = instRef.data.locationState;
    var val = key === 'detailAddress' ? escapeAttr(s.detailAddress) : escapeAttr(s[key] || '');
    if (key === 'detailAddress') {
      return '<div class="ae-row">' +
        '<div class="ae-label"><span class="ae-label-txt">' + label + '</span></div>' +
        '<textarea class="ae-input ae-textarea" rows="2" data-key="' + key + '" maxlength="50" placeholder="门牌号等(例如:10栋1001号)">' + val + '</textarea></div>';
    }
    return '<div class="ae-row">' +
      '<div class="ae-label"><span class="ae-label-txt">' + label + '</span></div>' +
      '<input class="ae-input" type="' + (type || 'text') + '" data-key="' + key + '" value="' + val +
      '" placeholder="' + ph + '" maxlength="' + maxlen + '" autocomplete="off"/></div>';
  }
  function render() {
    var d = this.data;
    var s = d.locationState || emptyState();
    var labelsHtml = '';
    (d.labels || []).forEach(function (lb, idx) {
      var on = s.labelIndex === idx ? ' on' : '';
      labelsHtml += '<span class="ae-chip' + on + '" data-act="label" data-i="' + idx + '">' + lb.name + '</span>';
    });
    labelsHtml += '<span class="ae-chip ae-chip--add" data-act="addlabel"><i class="wr wr-add" style="font-style:normal"></i></span>';
    var areaVal = fmtArea();
    return '<div class="ae-page">' +
      '<div class="ae-wx" data-act="weixin"><span class="ae-wx-txt"><i class="wr wr-wechat" style="color:#0ABF5B;font-style:normal"></i>获取微信收货地址</span>' +
      '<i class="wr wr-arrow_right" style="font-size:15px;color:#bbb;font-style:normal"></i></div>' +
      '<div class="ae-stripe"></div>' +
      '<div class="ae-form">' +
      cellHtml('收货人', 'name', 'text', '您的姓名', 20) +
      cellHtml('手机号', 'phone', 'number', '联系您的手机号', 11) +
      '<div class="ae-row" data-act="area">' +
      '<div class="ae-label"><span class="ae-label-txt">地区</span></div>' +
      '<div class="ae-input ae-area"><span class="' + (areaVal ? '' : 'placeholder') + '">' + (areaVal || '省/市/区') + '</span>' +
      '<i class="wr wr-location" style="color:#9d9d9f;font-size:21px;font-style:normal" data-act="maploc"></i></div></div>' +
      cellHtml('详细地址', 'detailAddress', '', '门牌号等(例如:10栋1001号)', 50) +
      '</div>' +
      '<div class="ae-stripe"></div>' +
      '<div class="ae-form">' +
      '<div class="ae-row"><div class="ae-label"><span class="ae-label-txt">标签</span></div>' +
      '<div class="ae-tags">' + labelsHtml + '</div></div>' +
      '</div>' +
      '<div class="ae-stripe"></div>' +
      '<div class="ae-form">' +
      '<div class="ae-row"><div class="ae-label"><span class="ae-label-txt">设置为默认收货地址</span></div>' +
      '<span class="ae-switch' + (Number(s.isDefault) === 1 ? ' on' : '') + '" data-act="def"><i></i></span></div>' +
      '</div>' +
      '<div class="ae-submit-wrap">' +
      '<div class="ae-submit' + (d.submitActive ? '' : ' disabled') + '" data-act="sure">保存</div></div>' +
      (d.labelDlg ? labelDlgHtml(d) : '') +
      (d.areaPick ? areaPickHtml(d) : '') +
      '</div>';
  }
  function labelDlgHtml(d) {
    return '<div class="ae-mask" data-act="ldlg-close"></div>' +
      '<div class="ae-dlg"><div class="ae-dlg-title">填写标签名称</div>' +
      '<input class="ae-dlg-input" id="aeLabelInput" placeholder="请输入标签名称" maxlength="10"/>' +
      '<div class="ae-dlg-btns"><span class="ae-dlg-btn" data-act="ldlg-cancel">取消</span>' +
      '<span class="ae-dlg-btn primary" data-act="ldlg-ok">确定</span></div></div>';
  }
  function areaPickHtml(d) {
    var s = d.locationState;
    var st = d._area || {};
    var level = st.level == null ? 0 : st.level;
    var names = ['省', '市', '区县'];
    var tabs = ['请选择省份', '请选择城市', '请选择区县'];
    var picked = [st.provName || '', st.cityName || ''];
    var tabHtml = '';
    for (var i = 0; i < 3; i++) {
      var cls = i === level ? ' on' : '';
      var txt = i === 0 ? (picked[0] || tabs[0]) : i === 1 ? (picked[1] || tabs[1]) : tabs[2];
      tabHtml += '<span class="ae-area-tab' + cls + '" data-act="areatab" data-l="' + i + '">' + txt + '</span>';
    }
    var list = st.list || [];
    var listHtml = list.map(function (it) {
      var arrow = it.children && it.children.length ? '<i class="wr wr-arrow_right" style="font-style:normal"></i>' : '';
      return '<div class="ae-area-item' + (it.children && it.children.length ? '' : ' leaf') + '" data-act="areapick" data-v="' + it.value + '">' +
        '<span class="ae-area-name">' + it.label + '</span>' + arrow + '</div>';
    }).join('');
    return '<div class="ae-mask" data-act="areamask"></div>' +
      '<div class="ae-area-sheet"><div class="ae-area-head">' +
      '<span class="ae-area-title">选择地区</span>' +
      '<i class="wr wr-close" data-act="areamask" style="font-size:16px;font-style:normal"></i></div>' +
      '<div class="ae-area-tabs">' + tabHtml + '</div>' +
      '<div class="ae-area-list">' + listHtml + '</div></div>';
  }
  function escapeAttr(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  /* ---------- 级联地区(源 t-cascader theme=tab,数据 AREA_DATA) ---------- */
  function openArea() {
    var st = { level: 0, list: window.AREA_DATA || [], provName: '', cityName: '' };
    instRef.data._area = st;
    instRef.data.areaPick = true;
    instRef.refresh();
  }
  function pickAreaValue(v, it) {
    var d = instRef.data;
    var st = d._area;
    var s = d.locationState;
    if (it.children && it.children.length) {
      // 进下一级(源 cascader 切换 tab)
      var curLabel = it.label;
      if (st.level === 0) { st.provName = curLabel; s.provinceName = curLabel; s.provinceCode = it.value; }
      else if (st.level === 1) { st.cityName = curLabel; s.cityName = curLabel; s.cityCode = it.value; }
      st.level++;
      st.list = it.children;
    } else {
      // 叶子(区县)选中即完成
      if (st.level === 0) { s.provinceName = it.label; s.provinceCode = it.value; }
      else if (st.level === 1) { s.cityName = it.label; s.cityCode = it.value; }
      s.districtName = it.label;
      s.districtCode = it.value;
      d.areaPick = false;
      d._area = null;
      refreshSubmit();
    }
    instRef.refresh();
  }
  function areaTab(l) {
    var d = instRef.data;
    var st = d._area;
    if (!st) return;
    var s = d.locationState;
    if (l === 0) { st.list = window.AREA_DATA || []; st.provName = ''; st.cityName = ''; }
    else if (l === 1) {
      var prov = (window.AREA_DATA || []).filter(function (p) { return p.value === s.provinceCode; })[0];
      if (!prov) return;
      st.list = prov.children || [];
      st.provName = prov.label;
      st.cityName = '';
    } else if (l === 2) {
      var prv = (window.AREA_DATA || []).filter(function (p) { return p.value === s.provinceCode; })[0];
      if (!prv) return;
      var city = (prv.children || []).filter(function (c) { return c.value === s.cityCode; })[0];
      if (!city) return;
      st.list = city.children || [];
      st.provName = prv.label;
      st.cityName = city.label;
    }
    st.level = l;
    instRef.refresh();
  }

  /* ---------- 微信/地图导入(mock) ---------- */
  function fillFromWxAddress(res, phone) {
    var d = instRef.data;
    var area = SVC.parseArea(res.provinceName, res.cityName, res.countyName);
    if (!area) { wx.showToast({ title: '地址解析出错,请稍后再试', icon: 'none' }); return; }
    var s = d.locationState;
    Object.assign(s, {
      name: res.userName, phone: phone,
      provinceName: res.provinceName, provinceCode: area.provinceCode,
      cityName: res.cityName, cityCode: area.cityCode,
      districtName: res.countyName, districtCode: area.districtCode,
      detailAddress: res.detailInfo, isDefault: s.isDefault,
    });
    instRef.refresh();
    refreshSubmit();
  }
  function getWeixinAddress() {
    wx.chooseAddress({
      success: function (res) {
        var phone = res.telNumber || '';
        var phoneReg = new RegExp(PHONE_RE);
        if (!phoneReg.test(phone)) {
          wx.showToast({ title: '请填写正确的手机号', icon: 'none' });
          return;
        }
        fillFromWxAddress(res, phone);
      },
    });
  }
  /* 源 onSearchAddress:chooseLocation 成功后事件未接线 → 结果不落表单;web 直接填省市区与门牌 */
  function searchAddress() {
    wx.chooseLocation({
      success: function (res) {
        var s = instRef.data.locationState;
        if (!res.name) {
          wx.showToast({ title: '地点为空,请重新选择', icon: 'none' });
          return;
        }
        if (!s.provinceName) {
          var area = SVC.parseArea('甘肃省', '甘南藏族自治州', '碌曲县');
          if (area) {
            Object.assign(s, {
              provinceName: '甘肃省', provinceCode: area.provinceCode,
              cityName: '甘南藏族自治州', cityCode: area.cityCode,
              districtName: '碌曲县', districtCode: area.districtCode,
            });
          }
        }
        s.detailAddress = res.name;
        instRef.refresh();
        refreshSubmit();
      },
    });
  }

  /* ---------- 保存(源 formSubmit + resolveAddress payload) ---------- */
  function doSave() {
    var d = instRef.data;
    if (!d.submitActive) {
      wx.showToast({ title: verifyTips || '请完善地址信息', icon: 'none' });
      return;
    }
    var s = d.locationState;
    hasSave = true;
    SVC.ADDR_EDIT.resolve({
      saasId: '88888888', uid: '88888888205500', authToken: null,
      id: s.addressId, addressId: s.addressId,
      phone: s.phone, name: s.name,
      countryName: s.countryName || '中国', countryCode: s.countryCode || 'chn',
      provinceName: s.provinceName, provinceCode: s.provinceCode,
      cityName: s.cityName, cityCode: s.cityCode,
      districtName: s.districtName, districtCode: s.districtCode,
      detailAddress: s.detailAddress,
      isDefault: Number(s.isDefault) === 1 ? 1 : 0,
      addressTag: s.addressTag,
      latitude: s.latitude || '', longitude: s.longitude || '',
      storeId: null,
    });
    APP.back(1);
  }

  /* ---------- 事件 ---------- */
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    var d = inst.data;
    if (act === 'weixin') {
      getWeixinAddress();
    } else if (act === 'area') {
      openArea();
    } else if (act === 'maploc') {
      searchAddress();
    } else if (act === 'def') {
      d.locationState.isDefault = !d.locationState.isDefault;
      inst.refresh();
    } else if (act === 'label') {
      var li = Number(t.getAttribute('data-i'));
      var lb = (d.labels || [])[li];
      if (!lb) return;
      if (d.locationState.labelIndex === li) {
        d.locationState.labelIndex = null;
        d.locationState.addressTag = '';
      } else {
        d.locationState.labelIndex = li;
        d.locationState.addressTag = lb.name;
      }
      inst.refresh();
    } else if (act === 'addlabel') {
      d.labelDlg = true;
      inst.refresh();
      var input = document.getElementById('aeLabelInput');
      if (input) setTimeout(function () { input.focus(); }, 0);
    } else if (act === 'ldlg-close' || act === 'ldlg-cancel') {
      d.labelDlg = false;
      inst.refresh();
    } else if (act === 'ldlg-ok') {
      var v = (document.getElementById('aeLabelInput') || {}).value || '';
      if (v.trim()) {
        d.labels = d.labels.concat([{ id: d.labels.length, name: v.trim() }]);
      }
      d.labelDlg = false;
      inst.refresh();
    } else if (act === 'sure') {
      doSave();
    } else if (act === 'areatab') {
      areaTab(Number(t.getAttribute('data-l')));
    } else if (act === 'areapick') {
      var v = t.getAttribute('data-v');
      var list = (d._area && d._area.list) || [];
      var it = list.filter(function (x) { return String(x.value) === String(v); })[0];
      if (it) pickAreaValue(v, it);
    } else if (act === 'areamask') {
      d.areaPick = false;
      d._area = null;
      inst.refresh();
    }
  }
  function onInput(e) {
    var k = e.target.getAttribute('data-key');
    if (!k) return;
    var s = instRef.data.locationState;
    if (k === 'detailAddress') s.detailAddress = e.target.value;
    else s[k] = e.target.value;
    refreshSubmit();
  }

  APP.reg('/pages/user/address/edit/index', {
    title: '添加新地址',
    nav: 'default',
    reinitOnQuery: true,
    data: {
      locationState: emptyState(),
      labels: [{ id: 0, name: '家' }, { id: 1, name: '公司' }],
      submitActive: false,
      labelDlg: false,
      areaPick: false,
      _area: null,
    },
    init: function (query) {
      var inst = this;
      instRef = inst;
      hasSave = false;
      inst.data.locationState = emptyState();
      inst.data.submitActive = false;
      inst.data.labelDlg = false;
      inst.data.areaPick = false;
      inst.data._area = null;
      var q = query || {};
      // 列表微信导入预填(源 eventChannel 传参的 web 等价)
      var wxImp = wx.getStorageSync('wxImportAddress');
      if (wxImp && !q.id) {
        Object.assign(inst.data.locationState, wxImp);
        wx.removeStorageSync('wxImportAddress');
        return refreshAsync(inst);
      }
      if (q.id != null && q.id !== '') {
        return SVC.fetchAddressDetail(q.id).then(function (detail) {
          var s = inst.data.locationState;
          Object.assign(s, {
            addressId: detail.addressId, name: detail.name, phone: detail.phone,
            provinceName: detail.provinceName, provinceCode: detail.provinceCode,
            cityName: detail.cityName, cityCode: detail.cityCode,
            districtName: detail.districtName, districtCode: detail.districtCode,
            countryName: detail.countryName, countryCode: detail.countryCode,
            detailAddress: detail.detailAddress,
            isDefault: detail.isDefault,
            latitude: detail.latitude, longitude: detail.longitude,
          });
          if (detail.addressTag) {
            var hit = -1;
            inst.data.labels.forEach(function (lb, idx) { if (lb.name === detail.addressTag) hit = idx; });
            if (hit >= 0) {
              s.labelIndex = hit;
              s.addressTag = detail.addressTag;
            } else if (detail.addressTag === '微信地址') {
              inst.data.labels = inst.data.labels.concat([{ id: inst.data.labels.length, name: detail.addressTag }]);
              s.labelIndex = inst.data.labels.length - 1;
              s.addressTag = detail.addressTag;
            } else {
              s.labelIndex = null;
              s.addressTag = detail.addressTag;
            }
          }
          return refreshAsync(inst);
        });
      }
      return refreshAsync(inst);
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
      root.addEventListener('input', onInput);
    },
    leave: function () {
      // 源 onUnload:未保存离开 → rejectAddress('cancel')
      if (!hasSave) SVC.ADDR_EDIT.reject(new Error('cancel'));
    },
  });

  function refreshAsync(inst) {
    refreshSubmit();
    return Promise.resolve(inst);
  }
})();
