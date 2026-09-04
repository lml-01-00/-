/* 应用核心:hash 路由 + 页面注册与生命周期 + 导航条/TabBar 渲染
 * 路由形如 #/pages/home/home 或 #/pages/goods/details/index?spuId=1
 * 页面模块按需加载 assets/js/app/<路由>.js
 */
(function () {
  var TABS = [
    { url: '/pages/home/home', icon: 'wr-home', text: '首页' },
    { url: '/pages/category/index', icon: 'wr-sort', text: '分类' },
    { url: '/pages/gongsheng/gongsheng', icon: 'wr-group', text: '共生' },
    { url: '/pages/message/message', icon: 'wr-notify', text: '消息' },
    { url: '/pages/usercenter/index', icon: 'wr-person', text: '个人中心' },
  ];
  var HOME = TABS[0].url;

  var APP = {
    PAGES: {},          // path -> conf(注册表)
    instances: {},      // path -> 实例(状态缓存)
    stack: [],          // [{url, path, query}] 栈顶为当前页
    cur: null,          // 当前 {path, query}
    booted: false,
    pendingPath: null,  // 脚本加载中等待渲染的 path
  };

  function parseHash() {
    var h = location.hash || '';
    if (h.charAt(0) === '#') h = h.slice(1);
    if (h.charAt(0) === '/') h = h.slice(1);
    if (!h) return null;
    var q = h.split('?');
    var query = {};
    if (q[1]) {
      q[1].split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        var k = decodeURIComponent(p[0]);
        var v = p.length > 1 ? decodeURIComponent(p.slice(1).join('=')) : '';
        if (k) query[k] = v;
      });
    }
    return { url: h, path: '/' + q[0], query: query };
  }
  function isTabPath(path) {
    for (var i = 0; i < TABS.length; i++) if (TABS[i].url === path) return true;
    return false;
  }

  /* ---------- 页面脚本按需加载 ---------- */
  function loadScript(src, onload, onerror) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = onload;
    s.onerror = function () { onerror && onerror(); };
    document.body.appendChild(s);
  }
  function ensurePage(path, cb, fail) {
    if (APP.PAGES[path]) return cb();
    APP.pendingPath = path;
    loadScript('assets/js/app' + path + '.js', function () {
      if (APP.PAGES[path]) return cb();
      fail && fail(new Error('注册失败'));
    }, function () { fail && fail(new Error('加载失败')); });
  }

  /* ---------- 页面模块注册 ----------
   * conf = {
   *   title, nav: 'default'|'custom'|'gradient', tab: bool,
   *   data: 初始数据(可选),
   *   init(query): 加载数据,this=实例(this.data 可用),可返回 Promise,
   *   render(): 返回页面 HTML(读 this.data),
   *   events(root): 绑定事件(推荐委托;每次渲染后调用,重复绑定同一函数引用无害),
   *   destroy(): 页面卸载时清理(可选)
   * }
   */
  APP.reg = function (path, conf) {
    APP.PAGES[path] = conf;
    if (APP.pendingPath === path) {
      APP.pendingPath = null;
      renderCurrent();
    }
  };

  function ensureInstance(path, query) {
    if (APP.instances[path]) {
      APP.instances[path].query = query;
      return APP.instances[path];
    }
    var conf = APP.PAGES[path];
    var inst = {
      path: path,
      query: query,
      data: {},
      conf: conf,
      _inited: false,
      _initing: null,
      root: null,
      setData: function (patch) {
        Object.assign(this.data, patch);
        renderInstance(inst);
      },
      refresh: function () { renderInstance(inst); },
      navTo: function (url) { APP.go(url, 'push'); },
      back: function () { APP.back(1); },
    };
    if (conf.data) Object.assign(inst.data, JSON.parse(JSON.stringify(conf.data)));
    APP.instances[path] = inst;
    return inst;
  }

  /* ---------- 导航 ---------- */
  APP.go = function (url, mode) {
    url = (url || '').replace(/^\/+/, '');
    if (!url) return;
    var u = parseHash();
    var curUrl = u && u.url;
    if (url === curUrl) { renderCurrent(); return; }
    if (mode === 'tab') {
      location.hash = '#' + url;
      return;
    }
    location.hash = '#' + url;
  };

  APP.back = function (delta) {
    delta = delta || 1;
    if (APP.stack.length > 1) {
      var target = APP.stack[Math.max(0, APP.stack.length - 1 - delta)] || APP.stack[0];
      location.hash = '#' + target.url;
      return;
    }
    location.hash = '#' + HOME;
  };

  APP.setNavTitle = function (title) {
    if (APP.cur && APP.PAGES[APP.cur.path]) {
      APP.PAGES[APP.cur.path].title = title;
      var t = document.querySelector('#navbarRoot .nav-title');
      if (t) t.textContent = title;
      document.title = title;
    }
  };

  function onHash() {
    var u = parseHash();
    if (!u) return;
    var last = APP.stack.length ? APP.stack[APP.stack.length - 1] : null;
    if (last && last.url === u.url) return;
    // 页面离开钩子:离开当前页前通知(用于地址选择等 promise 桥的取消/落地)
    fireLifecycle(APP.cur && APP.cur.path, 'leave');
    // 目标在历史栈中(物理返回/前进)→ 截断到该位置;否则压栈
    var ix = -1;
    for (var i = 0; i < APP.stack.length; i++) if (APP.stack[i].url === u.url) { ix = i; break; }
    if (ix >= 0) {
      APP.stack.length = ix + 1;
    } else {
      if (isTabPath(u.path)) APP.stack = [];
      APP.stack.push({ url: u.url, path: u.path, query: u.query });
    }
    renderCurrent();
  }
  function fireLifecycle(path, phase) {
    if (!path) return;
    var inst = APP.instances[path];
    if (!inst || !inst.conf || typeof inst.conf[phase] !== 'function') return;
    try {
      inst.conf[phase].call(inst);
    } catch (e) {
      console.error('[page ' + phase + ']', path, e);
    }
  }

  /* ---------- 渲染 ---------- */
  function renderCurrent() {
    var u = parseHash();
    if (!u) { location.replace('#' + HOME); return; }
    APP.cur = { path: u.path, query: u.query };
    APP.cur.url = u.url;
    if (!APP.PAGES[u.path]) {
      showPageLoading();
      ensurePage(u.path, function () {
        var inst = ensureInstance(u.path, u.query);
        startInstance(inst);
      }, function (err) {
        showPageError(u.path, err && err.message);
      });
      return;
    }
    var inst = ensureInstance(u.path, u.query);
    startInstance(inst);
  }

  function startInstance(inst) {
    var conf = inst.conf;
    // navbar / tabbar 呈现
    renderNavbar(inst);
    renderTabbar(inst);
    window.scrollTo(0, 0);
    var queryChanged = conf.reinitOnQuery && !sameQuery(inst.query, inst.lastQuery);
    if (!inst._inited || queryChanged) {
      inst._inited = true;
      inst.lastQuery = cloneQuery(inst.query);
      var r = null;
      try {
        r = conf.init ? conf.init.call(inst, inst.query) : null;
      } catch (e) {
        console.error('[page init]', inst.path, e);
      }
      if (r && typeof r.then === 'function') {
        showPageLoading();
        r.then(function () { renderInstance(inst); showLifecycle(inst); }).catch(function (e) {
          console.error('[page init fail]', inst.path, e);
          renderInstance(inst);
          showLifecycle(inst);
        });
      } else {
        renderInstance(inst);
        showLifecycle(inst);
      }
    } else {
      renderInstance(inst);
      showLifecycle(inst);
    }
  }
  function showLifecycle(inst) { fireLifecycle(inst.path, 'show'); }

  function sameQuery(a, b) {
    if (a === b) return true;
    return JSON.stringify(a || {}) === JSON.stringify(b || {});
  }
  function cloneQuery(q) {
    var o = {};
    if (q) for (var k in q) { if (Object.prototype.hasOwnProperty.call(q, k)) o[k] = q[k]; }
    return o;
  }

  function pageRoot() { return document.getElementById('pageRoot'); }

  // 页面实例常驻缓存、root 固定;events 委托只需绑定一次(每 render 重绑会使监听器
  // 累积,一次点击被多个副本各执行一遍,交互呈倍数放大)
  var evBoundOnce = {};

  function renderInstance(inst) {
    var root = pageRoot();
    if (!root) return;
    var conf = inst.conf;
    var html = '';
    try {
      html = conf.render.call(inst);
    } catch (e) {
      console.error('[page render]', inst.path, e);
      html = '<div style="padding:30px 16px;color:#999;font-size:13px;text-align:center">渲染出错:' + e.message + '</div>';
    }
    inst.root = root;
    var pageCls = 'page' + (conf.tab ? ' page--tab' : '') + (conf.nav === 'fullscreen' ? ' page--fullscreen' : '');
    root.innerHTML = '<div class="' + pageCls + '" data-path="' + inst.path + '">' + html + '</div>';
    if (conf.events && !evBoundOnce[inst.path]) {
      evBoundOnce[inst.path] = true;
      try {
        conf.events.call(inst, root, inst);
      } catch (e) {
        console.error('[page events]', inst.path, e);
      }
    }
  }

  function showPageLoading() {
    pageRoot().innerHTML =
      '<div class="page" style="min-height:50vh;display:flex;align-items:center;justify-content:center">' +
      '<div class="t-loading"><i class="t-loading__spinner"></i><span class="t-loading__text">加载中...</span></div></div>';
  }
  function showPageError(path, msg) {
    pageRoot().innerHTML =
      '<div style="padding:40px 24px;text-align:center;color:#999;font-size:13px">' +
      '<div style="font-size:40px;color:#dcdcdc;margin-bottom:12px">⚠</div>' +
      '<div>' + path + '</div><div style="margin-top:6px">页面文件' + (msg || '缺失') + ',请确认 assets/js/app' + path + '.js 已生成</div></div>';
  }

  /* ---------- navbar ---------- */
  var lastTabPath = HOME; // 桌面通栏高亮:非 tab 页继承最近 tab
  function isDesktop() { return window.innerWidth >= 1024; }
  function isTabUrl(url) {
    for (var i = 0; i < TABS.length; i++) if (TABS[i].url === url) return true;
    return false;
  }

  // 桌面版顶部通栏:品牌 + 主导航(5 tab)+ 搜索 + 购物车
  function renderPcTopbar(inst) {
    var box = document.getElementById('navbarRoot');
    var cur = inst.path;
    if (isTabPath(cur)) lastTabPath = cur;
    var active = isTabPath(cur) ? cur : lastTabPath;
    var html = '<div class="pc-topbar"><div class="pc-topbar__in">' +
      '<div class="pc-brand" data-url="' + HOME + '" title="回到首页">' +
      '<span class="pc-brand__logo">千</span><span class="pc-brand__name">千乡一链</span></div>' +
      '<nav class="pc-nav">';
    TABS.forEach(function (t) {
      html += '<div class="pc-nav__item' + (t.url === active ? ' active' : '') + '" data-url="' + t.url + '">' + t.text + '</div>';
    });
    html += '</nav>' +
      '<div class="pc-cms" data-url="/cloud-monitor/index" title="进入云监控系统(全屏)">' +
      '<span class="pc-cms__ic">◉</span><span>云监控</span></div>' +
      '<div class="pc-search" data-url="/pages/goods/search/index">' +
      '<i class="wr wr-search pc-search__icon"></i><span class="pc-search__text">搜索农家好物</span></div>' +
      '<div class="pc-cart" data-url="/pages/cart/index">' +
      '<i class="wr wr-cartAdd pc-cart__icon"></i><span class="pc-cart__num hidden">0</span>' +
      '<span class="pc-cart__text">购物车</span></div>' +
      '</div></div>';
    box.innerHTML = html;
    document.title = inst.conf.title || '';
    if (!box.__pcBound) {
      box.__pcBound = true;
      box.addEventListener('click', function (e) {
        var el = e.target.closest('[data-url]');
        if (!el) return;
        var url = el.getAttribute('data-url');
        if (isTabUrl(url)) APP.go(url, 'tab');
        else APP.go(url, 'push');
      });
    }
    if (window.Cart) Cart.syncBadge();
  }

  function renderNavbar(inst) {
    var box = document.getElementById('navbarRoot');
    var confF = inst.conf;
    // 全屏页(如云监控子应用):任何宽度都不渲染导航壳,页面整屏接管
    if (confF.nav === 'fullscreen') { box.innerHTML = ''; document.title = confF.title || ''; return; }
    if (isDesktop()) { renderPcTopbar(inst); return; }
    var conf = inst.conf;
    var nav = conf.nav || 'default';
    if (nav === 'custom') { box.innerHTML = ''; return; }
    var isTab = conf.tab;
    var backIcon = isTab ? '' : '<i class="wr wr-arrow_back" style="font-size:20px"></i>';
    var cls = 'navbar' + (nav === 'gradient' ? ' navbar--gradient' : '');
    box.innerHTML =
      '<div class="' + cls + '">' +
      '<div class="nav-back' + (isTab ? ' hidden' : '') + '" id="navBackBtn">' + backIcon + '</div>' +
      '<div class="nav-title' + (isTab ? ' navbar--wechat' : '') + '">' + (conf.title || '') + '</div>' +
      '<div class="nav-right">' +
      '<div class="nav-cart" id="navCartBtn"><i class="wr wr-cartAdd"></i><span class="nav-cart__num hidden">0</span></div>' +
      '</div></div>';
    document.title = conf.title || '';
    var b = document.getElementById('navBackBtn');
    if (b) b.addEventListener('click', function () { APP.back(1); });
    var c = document.getElementById('navCartBtn');
    if (c) c.addEventListener('click', function () { APP.go('/pages/cart/index', 'push'); });
    if (window.Cart) Cart.syncBadge();
  }

  /* ---------- tabbar ---------- */
  function renderTabbar(inst) {
    var box = document.getElementById('tabbarRoot');
    var conf = inst.conf;
    if (!conf.tab) { box.innerHTML = ''; return; }
    var cur = inst.path;
    var html = '<div class="tabbar">';
    TABS.forEach(function (t) {
      var active = t.url === cur ? ' active' : '';
      html += '<div class="tab' + active + '" data-url="' + t.url + '">' +
        '<div class="tb-badge"><i class="wr ' + t.icon + ' tb-icon"></i></div>' +
        '<span>' + t.text + '</span></div>';
    });
    html += '</div>';
    box.innerHTML = '<div class="tabbar-root">' + html + '</div>';
    var root = box.firstChild;
    if (root) {
      root.addEventListener('click', function (e) {
        var tab = e.target.closest('.tab');
        if (!tab) return;
        var url = tab.getAttribute('data-url');
        if (url === APP.cur.path) {
          renderCurrent();
          return;
        }
        APP.go(url, 'tab');
      });
    }
  }

  /* ---------- 启动 ---------- */
  APP.boot = function () {
    if (APP.booted) return;
    APP.booted = true;
    window.addEventListener('hashchange', onHash);
    if (!location.hash) {
      location.replace('#' + HOME);
      return;
    }
    onHash();
  };

  window.APP = APP;
  window.__APP_TABS__ = TABS;
})();
