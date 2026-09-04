/* 微信 API 模拟层:将 wx.* 调用映射到 DOM/路由,供页面转换代码直接使用 */
(function () {
  var overlays = null;
  function root() {
    if (!overlays) overlays = document.getElementById('overlayRoot');
    return overlays;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function toastIconName(icon) {
    return icon === 'success' ? 'wr-succeed' : icon === 'error' ? 'wr-error' : icon === 'warning' ? 'wr-info' : '';
  }

  var ui = {
    toastTimer: null,
    /** 轻提示(替代 t-toast + Toast) */
    showToast: function (opt) {
      if (typeof opt === 'string') opt = { title: opt };
      opt = opt || {};
      ui.hideToast();
      var R = root();
      var icon = toastIconName(opt.icon);
      var w = el('div', 't-toast-wrap' + (icon ? '' : ' t-toast-wrap--iconless'));
      if (icon) w.appendChild(el('i', 't-toast__icon ' + opt.icon + ' wr ' + icon));
      w.appendChild(el('div', 't-toast__text', (opt.title || '').replace(/\n/g, '<br/>')));
      R.appendChild(w);
      ui.toastTimer = setTimeout(function () {
        w.classList.add('t-toast-fadeout');
        setTimeout(function () { w.remove(); }, 220);
      }, opt.duration || 1500);
    },
    hideToast: function () {
      if (ui.toastTimer) clearTimeout(ui.toastTimer);
      var arr = root().querySelectorAll('.t-toast-wrap');
      for (var i = 0; i < arr.length; i++) arr[i].remove();
    },
    showLoading: function (title) {
      ui.hideToast();
      var w = el('div', 't-toast-wrap');
      w.appendChild(el('div', 't-loading'));
      w.querySelector('.t-loading').appendChild(el('i', 't-loading__spinner'));
      if (title) w.appendChild(el('div', 't-toast__text', title));
      w.style.pointerEvents = 'auto';
      root().appendChild(w);
      ui._loadingEl = w;
    },
    hideLoading: function () {
      if (ui._loadingEl) { ui._loadingEl.remove(); ui._loadingEl = null; }
      ui.hideToast();
    },
    /** 对话框(对齐 wx.showModal,支持 success 回调与 Promise) */
    showModal: function (opt) {
      opt = opt || {};
      return new Promise(function (resolve) {
        var R = root();
        var mask = el('div', 't-mask');
        var box = el('div', 't-dialog');
        var body = el('div', 't-dialog__body');
        if (opt.title) body.appendChild(el('div', 't-dialog__title', opt.title));
        var content = el('div', 't-dialog__content', (opt.content || '').replace(/\n/g, '<br/>'));
        if (opt.title) content.style.marginTop = '10px';
        body.appendChild(content);
        box.appendChild(body);
        var foot = el('div', 't-dialog__footer');
        var cancelTxt = opt.cancelText || '取消';
        var confirmTxt = opt.confirmText || '确定';
        if (!opt.showCancel) {
          var okBtn = el('div', 't-dialog__btn t-dialog__btn-confirm', confirmTxt);
          okBtn.addEventListener('click', function () {
            close();
            var r = { confirm: true, cancel: false };
            if (opt.success) opt.success(r);
            resolve(r);
          });
          foot.appendChild(okBtn);
        } else {
          var cBtn = el('div', 't-dialog__btn t-dialog__btn-cancel', cancelTxt);
          cBtn.addEventListener('click', function () {
            close();
            var r = { confirm: false, cancel: true };
            if (opt.success) opt.success(r);
            resolve(r);
          });
          var fBtn = el('div', 't-dialog__btn t-dialog__btn-confirm', confirmTxt);
          fBtn.addEventListener('click', function () {
            close();
            var r = { confirm: true, cancel: false };
            if (opt.success) opt.success(r);
            resolve(r);
          });
          foot.appendChild(cBtn);
          foot.appendChild(fBtn);
        }
        box.appendChild(foot);
        mask.addEventListener('click', function () {
          if (opt.cancelOnMask === false) return;
          close();
          var r = { confirm: false, cancel: true };
          if (opt.success) opt.success(r);
          resolve(r);
        });
        R.appendChild(mask);
        R.appendChild(box);
        function close() { mask.remove(); box.remove(); }
      });
    },
    /** 操作面板(对齐 wx.showActionSheet) */
    showActionSheet: function (opt) {
      opt = opt || {};
      return new Promise(function (resolve) {
        var R = root();
        var mask = el('div', 't-mask');
        var pop = el('div', 't-popup t-action-sheet');
        var list = opt.itemList || [];
        list.forEach(function (txt, idx) {
          var item = el('div', 't-action-sheet__item', txt);
          item.addEventListener('click', function () {
            close();
            var r = { tapIndex: idx, cancel: false };
            if (opt.success) opt.success(r);
            resolve(r);
          });
          pop.appendChild(item);
        });
        var cancel = el('div', 't-action-sheet__cancel', '取消');
        cancel.addEventListener('click', function () {
          close();
          if (opt.fail) opt.fail({ errMsg: 'showActionSheet:fail cancel' });
          var r = { cancel: true };
          if (opt.success) opt.success(r);
          resolve(r);
        });
        pop.appendChild(cancel);
        mask.addEventListener('click', function () {
          close();
          var r = { cancel: true };
          if (opt.success) opt.success(r);
          resolve(r);
        });
        R.appendChild(mask);
        R.appendChild(pop);
        function close() { mask.remove(); pop.remove(); }
      });
    },
    /** 图片预览(对齐 wx.previewImage) */
    previewImage: function (opt) {
      var urls = opt.urls || [opt.current];
      var current = opt.current || (urls.length ? urls[0] : '');
      var idx = Math.max(0, urls.indexOf(current));
      var R = root();
      var mask = el('div', 't-mask');
      mask.style.background = 'rgba(0,0,0,.95)';
      mask.style.zIndex = '1200';
      var img = el('img', '');
      img.src = urls[idx];
      img.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);max-width:100vw;max-height:100vh;z-index:1201;background:#000';
      mask.addEventListener('click', function () { mask.remove(); img.remove(); });
      if (urls.length > 1) {
        var prev = el('div', '', '‹');
        var next = el('div', '', '›');
        prev.style.cssText = next.style.cssText = 'position:fixed;top:50%;transform:translateY(-50%);z-index:1202;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:26px;display:flex;align-items:center;justify-content:center;cursor:pointer';
        prev.style.left = '6px';
        next.style.right = '6px';
        function show(n) {
          idx = (idx + n + urls.length) % urls.length;
          img.src = urls[idx];
        }
        prev.addEventListener('click', function (e) { e.stopPropagation(); show(-1); });
        next.addEventListener('click', function (e) { e.stopPropagation(); show(1); });
        R.appendChild(prev);
        R.appendChild(next);
      }
      R.appendChild(mask);
      R.appendChild(img);
    },
    makePhoneCall: function (opt) {
      if (opt && opt.phoneNumber) window.location.href = 'tel:' + opt.phoneNumber;
    },
  };

  /* ---------- 全局 wx shim ---------- */
  var wx = {
    showToast: function (o) { ui.showToast(o); },
    hideToast: function () { ui.hideToast(); },
    showLoading: function (o) { ui.showLoading(o && o.title); },
    hideLoading: function () { ui.hideLoading(); },
    showModal: function (o) { return ui.showModal(o); },
    showActionSheet: function (o) { return ui.showActionSheet(o); },
    previewImage: function (o) { ui.previewImage(o); },
    makePhoneCall: function (o) { ui.makePhoneCall(o); },
    /** 选择微信收货地址(web 模拟:延时返回一份"微信地址"样本;字段与 chooseAddress ok 回调一致) */
    chooseAddress: function (o) {
      o = o || {};
      setTimeout(function () {
        o.success && o.success({
          errMsg: 'chooseAddress:ok',
          userName: '微信用户小满',
          telNumber: '13800138000',
          provinceName: '广东省', cityName: '广州市', countyName: '天河区',
          detailInfo: '花城大道 88 号 3301 室',
        });
      }, 500);
    },
    /** 地图选点(web 模拟:返回 source genAddress(0) 同坐标的周边点,便于演示) */
    chooseLocation: function (o) {
      o = o || {};
      setTimeout(function () {
        o.success && o.success({
          name: '松日鼎盛大厦',
          address: '甘肃省甘南藏族自治州碌曲县松日鼎盛大厦',
          latitude: 34.59103,
          longitude: 102.48699,
        });
      }, 500);
    },
    /** 选择图片(web 模拟:弹系统文件选择;路径以文件名呈现,大小 10MB 上限对齐源) */
    chooseImage: function (o) {
      o = o || {};
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.cssText = 'position:fixed;left:-9999px;top:-99px';
      input.addEventListener('change', function () {
        var f = input.files && input.files[0];
        input.remove();
        if (!f) { o.fail && o.fail({ errMsg: 'chooseImage:fail cancel' }); return; }
        if (f.size > 10485760) {
          o.fail && o.fail({ errMsg: '图片大小超出限制，请重新上传' });
          return;
        }
        o.success && o.success({
          tempFiles: [{ path: f.name, size: f.size }],
          tempFilePaths: [f.name],
        });
      });
      document.body.appendChild(input);
      input.click();
    },
    setClipboardData: function (o) {
      var text = o && o.data != null ? String(o.data) : '';
      function done() { if (o.success) o.success({}); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove();
        done();
      }
    },
    pageScrollTo: function (o) {
      var top = (o && o.scrollTop) || 0;
      window.scrollTo({ top: top, behavior: (o && o.duration ? 'smooth' : 'auto') });
    },
    stopPullDownRefresh: function () {},
    startPullDownRefresh: function () {},
    getSystemInfoSync: function () {
      // 桌面断点(≥1024px)放开 375 锁,弹层/预览类尺寸按真实视口计算
      var vw = Math.min(window.innerWidth, 375);
      if (window.innerWidth >= 1024) vw = window.innerWidth;
      return {
        screenWidth: vw,
        screenHeight: window.innerHeight,
        windowWidth: vw,
        windowHeight: window.innerHeight,
        pixelRatio: 1,
        platform: 'web',
      };
    },
    setNavigationBarTitle: function (o) { window.APP && APP.setNavTitle(o.title); },
    setNavigationBarColor: function () {},
    navigateTo: function (o) { window.APP && APP.go(o.url, 'push'); },
    redirectTo: function (o) { window.APP && APP.go(o.url, 'replace'); },
    reLaunch: function (o) { window.APP && APP.go(o.url, 'replace'); },
    switchTab: function (o) { window.APP && APP.go(o.url, 'tab'); },
    navigateBack: function (o) { window.APP && APP.back((o && o.delta) || 1); },
    storage: {
      set: function (k, v) { try { localStorage.setItem('app:' + k, JSON.stringify(v)); } catch (e) {} },
      get: function (k) { try { var s = localStorage.getItem('app:' + k); return s == null ? null : JSON.parse(s); } catch (e) { return null; } },
      remove: function (k) { try { localStorage.removeItem('app:' + k); } catch (e) {} },
    },
    setStorageSync: function (k, v) { wx.storage.set(k, v); },
    getStorageSync: function (k) { return wx.storage.get(k); },
    removeStorageSync: function (k) { wx.storage.remove(k); },
    clearStorageSync: function () { try { localStorage.clear(); } catch (e) {} },
    showTabBar: function () {},
    hideTabBar: function () {},
    showShareMenu: function () {},
    hideShareMenu: function () {},
  };

  window.WX = ui;
  window.wx = wx;
  window.$ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  window.$$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  /* 金额格式化:mock 数据单位为分,展示转元 */
  window.UP = {
    fen: function (v) {
      var n = Math.round((Number(v) || 0) * 100) / 100;
      return (n / 100).toFixed(2);
    },
    parts: function (v) {
      var s = UP.fen(v).split('.');
      return { int: s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','), dec: s[1] };
    },
    /** 价格 span(符号默认 ¥) */
    ph: function (v, extraClass) {
      var p = UP.parts(v);
      return '<span class="price' + (extraClass ? ' ' + extraClass : '') + '"><span class="symbol">¥</span>' +
        '<span class="pprice"><span class="integer">' + p.int + '</span><span class="decimal">.' + p.dec + '</span></span></span>';
    },
  };
})();
