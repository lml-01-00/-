/* 填写/修改运单号页 pages/order/fill-tracking-no/index ← 源 fill-tracking-no(index.js/wxml/wxss) + reasonSheet(公司选择)
 * 入口:售后列表/详情服务按钮 3 填写(query 仅 rightsNo)/4 修改(+logisticsNo/logisticsCompanyName/logisticsCompanyCode/remark)
 * 修改态:navTitle '修改运单号'、回填公司/单号/备注、submitActived=true(1:1)
 * 校验:运单号空→'请填写运单号';公司空→'请选择物流公司';submitActived=!require,保存按钮按态置色
 * 保存:isChange(修改态)时走 create、新填走 update(源 api 命名即如此颠倒,1:1);web 两端均落库 store 物流字段,返回后详情/列表回显
 * 成功:Toast '保存成功'(icon '')→ 1s 后 navigateBack;失败静默复位(源 catch)
 * 扫码:wx.scanCode 不存在 → Web toast 说明(与全局 scan 策略一致)
 * sheet:共用底部选项弹层(reasonSheet 语义:单选勾选/确认返回下标/未选 Toast emptyTip/遮罩取消 reject)
 */
(function () {
  var instRef = null;
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
  function render() {
    var d = this.data;
    var co = d.deliveryCompany;
    var companyNote = co && co.name ? co.name : '请选择物流公司';
    var companyCls = co && co.name ? '' : ' ft-note--ph';
    var scan = '<i class="wr wr-scanning ft-scan" data-act="scan"></i>';
    return '<div class="ft-page">' +
      '<div class="ft-notice">请填写正确的退货包裹运单信息，以免影响退款进度</div>' +
      '<div class="ft-card ft-form">' +
      '<div class="ft-row">' +
      '<span class="ft-lb">运单号</span>' +
      '<input class="ft-input" type="text" maxlength="30" placeholder="请输入物流单号" data-act="no" value="' +
      escAttr(d.trackingNo) + '"/>' + scan + '</div>' +
      '<div class="ft-row" data-act="company">' +
      '<span class="ft-lb">物流公司</span>' +
      '<span class="ft-note' + companyCls + '">' + companyNote + '</span>' +
      '<i class="wr wr-arrow_right ft-arw"></i></div>' +
      '</div>' +
      '<div class="ft-card ft-remark">' +
      '<div class="ft-remark-lb">备注信息</div>' +
      '<textarea class="ft-txa" maxlength="140" placeholder="选填项，如有多个包裹寄回，请注明其运单信息" data-act="rmk">' +
      escHtml(d.remark || '') + '</textarea>' +
      '</div>' +
      '<div class="ft-bar"><div class="ft-save' + (d.submitting ? ' loading' : '') +
      (d.submitActived && !d.submitting ? '' : ' off') + '" data-act="save">' +
      (d.submitting ? '<span class="ft-spin"></span>' : '') + '保存</div></div>' +
      sheetHtml(d) +
      '</div>';
  }
  function escHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(s) {
    return escHtml(s).replace(/"/g, '&quot;');
  }
  function openSheet(title, list, emptyTip) {
    var inst = instRef;
    return new Promise(function (resolve, reject) {
      inst._sheetResolve = resolve;
      inst._sheetReject = reject;
      inst.data.sheet = { title: title, emptyTip: emptyTip || '请选择', options: list };
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
  function syncSaveBtn() {
    var inst = instRef;
    var on = inst.data.submitActived && !inst.data.submitting;
    var el = inst.root && inst.root.querySelector('.ft-save');
    if (el) el.classList.toggle('off', !on);
  }
  function checkParams() {
    var inst = instRef;
    var d = inst.data;
    var res = { msg: '', require: false };
    if (!d.trackingNo) {
      res.msg = '请填写运单号';
      res.require = true;
    } else if (!d.deliveryCompany) {
      res.msg = '请选择物流公司';
      res.require = true;
    }
    inst.data.submitActived = !res.require;
    syncSaveBtn();
    return res;
  }
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var inst = instRef;
    var act = t.getAttribute('data-act');
    if (act === 'scan') {
      wx.showToast({ title: '扫码功能请在微信小程序中体验', icon: 'none' });
    } else if (act === 'company') {
      if (!inst._companies) {
        inst.data.sheetLoading = true;
        SVC.fetchDeliverCompanyList().then(function (res) {
          inst._companies = (res && res.data) || [];
          inst.data.sheetLoading = false;
          pickCompany();
        });
      } else {
        pickCompany();
      }
    } else if (act === 'save') {
      onSubmit();
    } else if (act === 'sheet-ok') {
      var sheet = inst.data.sheet;
      var picked = -1;
      if (sheet) sheet.options.forEach(function (o, i) { if (o.checked) picked = i; });
      if (picked < 0) {
        wx.showToast({ title: (sheet && sheet.emptyTip) || '请选择', icon: 'none' });
        return;
      }
      var list = inst._companies || [];
      closeSheet();
      if (inst._sheetResolve) {
        var r = inst._sheetResolve;
        inst._sheetResolve = null;
        inst._sheetReject = null;
        r(list[picked]);
      }
    } else if (act === 'sheet-cancel') {
      closeSheet();
      if (inst._sheetReject) {
        var j = inst._sheetReject;
        inst._sheetResolve = null;
        inst._sheetReject = null;
        j(new Error('cancel'));
      }
    }
  }
  function pickCompany() {
    var inst = instRef;
    var cur = inst.data.deliveryCompany;
    openSheet('选择物流公司', (inst._companies || []).map(function (c) {
      return { title: c.name, checked: !!(cur && String(c.code) === String(cur.code)) };
    }), '请选择物流公司').then(function (company) {
      inst.data.deliveryCompany = company;
      checkParams();
      inst.refresh(); /* 整页重渲染:回填公司名并清掉已关闭的 sheet 残留 */
    }).catch(function () {});
  }
  function onOptTap(e) {
    var t = e.target.closest('[data-opt]');
    if (!t) return;
    sheetPick(Number(t.getAttribute('data-opt')));
  }
  function onInput(e) {
    var t = e.target;
    var inst = instRef;
    if (!t || !t.getAttribute) return;
    var act = t.getAttribute('data-act');
    if (act === 'no') {
      /* 输入期间不整页重建(保焦点);重算提交条件实时驱动保存按钮态 */
      inst.data.trackingNo = t.value;
      checkParams();
    } else if (act === 'rmk') {
      inst.data.remark = t.value;
    }
  }
  function onSubmit() {
    var inst = instRef;
    var c = checkParams();
    if (c.msg) {
      wx.showToast({ title: c.msg, icon: 'none' });
      return;
    }
    if (inst.data.submitting) return;
    var d = inst.data;
    var params = {
      rightsNo: inst.rightsNo,
      logisticsCompanyCode: d.deliveryCompany.code,
      logisticsCompanyName: d.deliveryCompany.name,
      logisticsNo: d.trackingNo,
      remark: d.remark,
    };
    inst.data.submitting = true;
    inst.refresh();
    /* 源 const api = this.isChange ? create : update(修改态调 create,新填调 update,命名反直觉 1:1) */
    var api = inst.isChange ? SVC.dispatchCreateTracking : SVC.dispatchUpdateTracking;
    api(params).then(function () {
      inst.data.submitting = false;
      wx.showToast({ title: '保存成功', icon: 'none' });
      setTimeout(function () { APP.back(1); }, 1000);
    }).catch(function () {
      inst.data.submitting = false;
      inst.refresh();
    });
  }

  APP.reg('/pages/order/fill-tracking-no/index', {
    title: '填写运单号',
    nav: 'default',
    reinitOnQuery: true,
    data: {
      trackingNo: '', remark: '', deliveryCompany: null,
      submitActived: false, submitting: false, sheet: null, sheetLoading: false,
    },
    init: function (query) {
      var inst = this;
      instRef = inst;
      inst.isChange = false;
      inst.rightsNo = query && query.rightsNo;
      /* reinit 复用实例:复位上一轮填写/标题,再按修改态 query 回填 */
      Object.assign(inst.data, JSON.parse(JSON.stringify(APP.PAGES[inst.path].data)));
      if (!inst.rightsNo) {
        APP.setNavTitle('填写运单号');
        wx.showModal({
          title: '请选择售后单？', content: '', showCancel: false, confirmText: '确认',
        }).then(function () {
          APP.back(1);
        });
        return Promise.resolve(inst);
      }
      if (query && query.logisticsNo) {
        APP.setNavTitle('修改运单号');
        inst.isChange = true;
        inst.data.deliveryCompany = {
          name: query.logisticsCompanyName || '',
          code: query.logisticsCompanyCode || '',
        };
        inst.data.trackingNo = query.logisticsNo || '';
        inst.data.remark = query.remark || '';
        inst.data.submitActived = true;
      } else {
        APP.setNavTitle('填写运单号');
      }
      return Promise.resolve(inst);
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onTap);
      root.addEventListener('click', onOptTap);
      root.addEventListener('input', onInput);
    },
  });
})();
