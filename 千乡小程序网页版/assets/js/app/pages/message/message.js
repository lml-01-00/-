/* 消息页 pages/message/message ← message(message/社区 双 tab 自定义导航 + 搜索 + 会话列表 + 社区信息流)
 * 消息 tab:会话卡片(AI/共生提醒/物流/店铺/客服 分色头像 + 未读徽标);社区 tab:帖子流(图文/点赞/评论/分享)
 * 顶部自绘导航(渐变壳 + 双 tab 标题 + 搜索/新增按钮)+ 搜索框 + 服务快捷条(纯 CSS 渐变/太阳/山丘)
 * tab 切换:phase-leave 180ms 淡出 → 重建内容 → phase-enter 淡入;搜索逐字 DOM 过滤不重建(保 input 焦点)
 * 点赞/评论/分享/清未读 DOM 局部 patch;互动前模拟登录态(web 端默认已登录,注释:未来 usercenter 登出可置 false)
 */
(function () {
  var AUTH_KEY = 'qianxiang_authed_v1';
  var STATE_KEY = 'qianxiang_message_state_v1';
  var TAB_KEY = 'qianxiang_message_tab_v1';
  var POSTS_KEY = 'qianxiang_message_community_posts_v1';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function nowLabel() { return '刚刚'; }
  function withDelays(list) {
    return list.map(function (item, index) {
      item.delay = index * 60;
      return item;
    });
  }
  function filterSessions(sessions, keywords) {
    var q = String(keywords || '').trim();
    if (!q) return sessions;
    return sessions.filter(function (s) {
      return (s.title || '').indexOf(q) >= 0 || (s.lastMessage || '').indexOf(q) >= 0;
    });
  }
  function filterPosts(posts, keywords) {
    var q = String(keywords || '').trim();
    if (!q) return posts;
    return posts.filter(function (p) {
      return (p.author && p.author.name || '').indexOf(q) >= 0 || (p.content || '').indexOf(q) >= 0;
    });
  }
  function normalizePost(p) {
    return {
      id: p.id,
      author: p.author || { name: '', avatar: '' },
      time: p.time || '',
      content: p.content || '',
      images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
      likeCount: Number(p.likeCount || 0),
      commentCount: Number(p.commentCount || 0),
      shareCount: Number(p.shareCount || 0),
      liked: Boolean(p.liked),
    };
  }
  function normalizeSession(s) {
    var type = s.type ||
      (s.title === 'AI 智能客服' ? 'ai'
        : s.title === '共生提醒' ? 'cart'
          : s.title === '物流通知' ? 'logistics'
            : s.title === '客服小美' ? 'service' : 'shop');
    var preset = type === 'ai' ? { icon: 'member', iconColor: '#FFFFFF', tag: 'AI' }
      : type === 'cart' ? { icon: 'cart', iconColor: '#FFFFFF', tag: '' }
        : type === 'logistics' ? { icon: 'deliver', iconColor: '#FFFFFF', tag: '' }
          : type === 'service' ? { icon: 'service', iconColor: '#FFFFFF', tag: '' }
            : { icon: 'store', iconColor: '#1F1F1F', tag: '' };
    return {
      id: s.id, title: s.title || '', type: type,
      icon: s.icon || preset.icon,
      iconColor: s.iconColor || preset.iconColor,
      tag: typeof s.tag === 'string' ? s.tag : preset.tag,
      time: s.time || '', lastMessage: s.lastMessage || '',
      unread: Number(s.unread || 0),
      messages: Array.isArray(s.messages) ? s.messages : [],
    };
  }
  function getDefaultSessions() {
    return [
      { id: 1, title: 'AI 智能客服', type: 'ai', time: '刚刚',
        lastMessage: '您好！我是AI智能客服，有什么可以帮助您的？', unread: 0,
        messages: [{ mid: 'm_ai_1', from: 'other', text: '您好！我是AI智能客服，有什么可以帮助您的？' }] },
      { id: 2, title: '共生提醒', type: 'cart', time: '10分钟前',
        lastMessage: '您关注共生养殖产品现已经上架。', unread: 8,
        messages: [{ mid: 'm_cart_1', from: 'other', text: '您养殖的产品已经成熟' }] },
      { id: 3, title: '物流通知', type: 'logistics', time: '1小时前',
        lastMessage: '您的包裹已到达东莞配送站，预计今日送达', unread: 2,
        messages: [{ mid: 'm_log_1', from: 'other', text: '您的包裹已到达东莞配送站，预计今日送达' }] },
      { id: 4, title: '山水农田', type: 'shop', time: '昨天',
        lastMessage: '【新品上架】生态养殖纯粮食饲料共生鸡', unread: 0,
        messages: [{ mid: 'm_shop_1', from: 'other', text: '【新品上架】生态养殖纯粮食饲料共生鸡' }] },
      { id: 5, title: '客服小美', type: 'service', time: '2天前',
        lastMessage: '您好，您的退款申请已受理，预计3个工作日内完成', unread: 0,
        messages: [{ mid: 'm_srv_1', from: 'other', text: '您好，您的退款申请已受理，预计3个工作日内完成' }] },
    ];
  }
  function getDefaultCommunityPosts() {
    return [
      { id: 101,
        author: { name: '千乡 · 友缘农庄', avatar: 'https://free.picui.cn/free/2026/06/02/6a1ecc6ff2529.jpg' },
        time: '刚刚', content: '雨后上山采摘，松茸状态很棒，今天这一批鲜度拉满。',
        images: ['https://free.picui.cn/free/2026/06/02/6a1ecd16731ca.jpg',
          'https://free.picui.cn/free/2026/06/02/6a1ecd1676162.jpg',
          'https://free.picui.cn/free/2026/06/02/6a1ecd1674d4b.jpg'],
        likeCount: 128, commentCount: 26, shareCount: 9, liked: false },
      { id: 102,
        author: { name: '千乡 · 慧来农庄', avatar: 'https://free.picui.cn/free/2026/06/02/6a1ecc6fc41ee.jpg' },
        time: '25分钟前', content: '土豆长成啦，每个都非常饱满！！',
        images: ['https://free.picui.cn/free/2026/06/02/6a1ecda56542f.jpg'],
        likeCount: 306, commentCount: 41, shareCount: 17, liked: true },
    ];
  }
  function mergeSeedSessions(stored, defaults) {
    var storedArr = Array.isArray(stored) ? stored : [];
    var merged = storedArr.map(function (s) {
      var d = null;
      for (var i = 0; i < defaults.length; i++) if (defaults[i].id === s.id) { d = defaults[i]; break; }
      if (!d) return s;
      return {
        id: s.id, title: s.title, type: s.type,
        icon: s.icon, iconColor: s.iconColor, tag: s.tag,
        time: s.time || d.time, unread: Number(s.unread || 0),
        lastMessage: s.lastMessage || d.lastMessage,
        messages: Array.isArray(s.messages) ? s.messages : d.messages,
      };
    });
    defaults.forEach(function (d) {
      var has = merged.some(function (s) { return s.id === d.id; });
      if (!has) merged.push(d);
    });
    return merged;
  }
  function mergePosts(stored, defaults) {
    var storedArr = Array.isArray(stored) ? stored : [];
    var merged = storedArr.map(function (p) {
      var d = null;
      for (var i = 0; i < defaults.length; i++) if (defaults[i].id === p.id) { d = defaults[i]; break; }
      if (!d) return p;
      return { id: p.id, author: d.author, time: p.time || d.time, content: d.content, images: d.images,
        likeCount: Number(p.likeCount || 0), commentCount: Number(p.commentCount || 0),
        shareCount: Number(p.shareCount || 0), liked: Boolean(p.liked) };
    });
    defaults.forEach(function (d) {
      var has = merged.some(function (p) { return p.id === d.id; });
      if (!has) merged.push(d);
    });
    return merged;
  }
  function getStore(key, fallback) {
    var v = wx.getStorageSync(key);
    return v == null ? fallback : v;
  }
  function setStore(key, v) { wx.setStorageSync(key, v); }

  /* t-icon → wr 字体图标 */
  function ic(name, sizePx, color, extraCls) {
    return '<i class="wr wr-' + name + (extraCls ? ' ' + extraCls : '') + '"' +
      ' style="font-size:' + sizePx + 'px;color:' + color + ';font-style:normal;line-height:1"></i>';
  }
  /* 会话头像(分类型底色 + 图标) */
  function avatarHtml(s) {
    return '<div class="msp-avatar avatar-' + s.type + '">' +
      ic(s.icon, 22, s.iconColor) + '</div>';
  }
  function sessionCardHtml(s) {
    return '<div class="msp-msg-card msp-in" style="animation-delay:' + (s.delay || 0) + 'ms" data-id="' + s.id +
      '" data-q="' + esc((s.title || '') + (s.lastMessage || '')) + '">' +
      '<div class="msp-msg-left">' + avatarHtml(s) + '</div>' +
      '<div class="msp-msg-mid">' +
      '<div class="msp-msg-topline"><span class="msp-msg-title">' + esc(s.title) + '</span>' +
      (s.tag ? '<span class="msp-msg-tag">' + esc(s.tag) + '</span>' : '') + '</div>' +
      '<div class="msp-msg-content">' + esc(s.lastMessage) + '</div></div>' +
      '<div class="msp-msg-right">' +
      '<span class="msp-msg-time">' + esc(s.time) + '</span>' +
      (s.unread > 0 ? '<div class="msp-msg-unread"><span class="msp-msg-unread-text">' +
        (s.unread > 99 ? '99+' : s.unread) + '</span></div>' : '') +
      '</div></div>';
  }
  function postCardHtml(p) {
    var grid = '';
    var n = (p.images || []).length;
    if (n) {
      var cells = '';
      p.images.forEach(function (img, idx) {
        cells += '<div class="msp-media-item" data-preview="1" data-i="' + idx + '">' +
          '<img class="msp-media-img" src="' + img + '" alt="" loading="lazy"/></div>';
      });
      grid = '<div class="msp-media-grid media-' + (n > 3 ? 3 : n) + '">' + cells + '</div>';
    }
    return '<div class="msp-post-card msp-in" style="animation-delay:' + (p.delay || 0) + 'ms" data-id="' + p.id +
      '" data-q="' + esc((p.author.name || '') + (p.content || '')) + '">' +
      '<div class="msp-post-head">' +
      '<img class="msp-post-avatar" src="' + p.author.avatar + '" alt="" loading="lazy"/>' +
      '<div class="msp-post-meta">' +
      '<span class="msp-post-author">' + esc(p.author.name) + '</span>' +
      '<span class="msp-post-time">' + esc(p.time) + '</span></div></div>' +
      '<div class="msp-post-text">' + esc(p.content) + '</div>' +
      grid +
      '<div class="msp-post-actions">' +
      '<div class="msp-act-btn' + (p.liked ? ' msp-act-liked' : '') + '" data-act="like" data-id="' + p.id + '">' +
      ic('thumb_up', 18, p.liked ? '#2D5A27' : '#777777', 'msp-act-ic') +
      '<span class="msp-act-text msp-act-count" data-kind="like">' + p.likeCount + '</span></div>' +
      '<div class="msp-act-btn" data-act="comment" data-id="' + p.id + '">' +
      ic('comment', 18, '#777777', 'msp-act-ic') +
      '<span class="msp-act-text msp-act-count" data-kind="comment">' + p.commentCount + '</span></div>' +
      '<div class="msp-act-btn" data-act="share" data-id="' + p.id + '">' +
      ic('share', 18, '#777777', 'msp-act-ic') +
      '<span class="msp-act-text msp-act-count" data-kind="share">' + p.shareCount + '</span></div>' +
      '</div></div>';
  }

  function messageListHtml(sessions) {
    var h = '';
    sessions.forEach(function (s) { h += sessionCardHtml(s); });
    return '<div class="msp-msg-list">' + h + '</div>';
  }
  function communityHtml(posts) {
    var h = '<div class="msp-c-head">' +
      '<span class="msp-c-title">社区</span>' +
      '<span class="msp-c-sub">分享 · 交流 · 发现</span></div>';
    if (!posts.length) return h + '<div class="msp-post-empty">' +
      '<span class="msp-post-empty-text">暂无社区内容</span></div>';
    var list = '';
    posts.forEach(function (p) { list += postCardHtml(p); });
    /* 空态容器常驻(默认隐藏),供搜索过滤时切换显示 */
    return h + '<div class="msp-post-empty" style="display:none">' +
      '<span class="msp-post-empty-text">暂无社区内容</span></div>' +
      '<div class="msp-post-list">' + list + '</div>';
  }
  /* 列表始终全量渲染(过滤由 applyKeywordFilter 在渲染后执行,保证删字可恢复) */
  function contentHtml(inst) {
    var inner = inst.data.activeTab === 'community'
      ? communityHtml(inst.allPosts || [])
      : messageListHtml(withDelays(inst.allSessions || []));
    return '<div class="msp-content msp-phase-enter">' + inner + '</div>';
  }

  var instRef = null; /* 供无参函数取当前实例 */

  function buildTopHtml(d) {
    var msgActive = d.activeTab !== 'community';
    return '<div class="msp-top">' +
      '<div class="msp-navbar">' +
      '<div class="msp-nav-left">' +
      '<span class="msp-nav-tab' + (msgActive ? ' msp-nav-tab-active' : '') + '" data-act="tab" data-tab="message">消息</span>' +
      '<span class="msp-nav-tab' + (msgActive ? '' : ' msp-nav-tab-active') + '" data-act="tab" data-tab="community">社区</span>' +
      '</div>' +
      '<div class="msp-nav-actions">' +
      '<div class="msp-icon-btn" data-act="topsearch">' + ic('search', 20, '#FFFFFF') + '</div>' +
      '<div class="msp-icon-btn" data-act="addsession">' + ic('add', 20, '#FFFFFF') + '</div>' +
      '</div></div>' +
      '<div class="msp-search-wrap"><div class="msp-search-box">' +
      ic('search', 17, '#8BA58A', 'msp-search-ic') +
      '<input class="msp-search-input" type="text" placeholder="搜索消息与社区内容" value="' + esc(d.keywords) + '"/></div></div>' +
      '</div>' +
      '<div class="msp-quick">' +
      '<div class="msp-q-bg"></div><div class="msp-q-sun"></div><div class="msp-q-hills"></div>' +
      '<div class="msp-q-cards">' +
      '<div class="msp-q-card" data-act="callservice">' +
      '<div class="msp-q-icon">' + ic('telephone', 22, '#2D5A27') + '</div>' +
      '<div class="msp-q-text"><span class="msp-q-title">客服电话</span>' +
      '<span class="msp-q-sub">7×24小时在线</span></div></div>' +
      '<div class="msp-q-card" data-act="servicenotice">' +
      '<div class="msp-q-icon">' + ic('notify', 22, '#2D5A27') + '</div>' +
      '<div class="msp-q-text"><span class="msp-q-title">服务通知</span>' +
      '<span class="msp-q-sub">订单 / 退款 / 活动</span></div></div>' +
      '</div></div>';
  }
  function commentMaskHtml() {
    return '<div class="msp-cm-mask">' +
      '<div class="msp-cm-panel" data-act="cm-panel">' +
      '<div class="msp-cm-head"><span class="msp-cm-title">评论</span>' +
      '<div class="msp-icon-btn msp-cm-close" data-act="cm-close">' + ic('close', 20, '#1F1F1F') + '</div></div>' +
      '<input class="msp-cm-input" type="text" placeholder="写下你的评论" maxlength="140"/>' +
      '<div class="msp-cm-submit" data-act="cm-submit"><span class="msp-cm-submit-text">发送</span></div>' +
      '</div></div>';
  }
  function render() {
    var d = this.data;
    return '<div class="msp-page">' +
      buildTopHtml(d) +
      contentHtml(this) +
      commentMaskHtml() +
      '<div class="msp-top-btn" data-act="totop">' + ic('to_top', 22, '#2D5A27') + '</div>' +
      '</div>';
  }

  /* ---------- 数据突变后更新对应 DOM(小范围 patch,避免整页重渲染) ---------- */
  function findPostEl(root, id) {
    var cards = root.querySelectorAll('.msp-post-card');
    for (var i = 0; i < cards.length; i++) {
      if (Number(cards[i].getAttribute('data-id')) === id) return cards[i];
    }
    return null;
  }
  function patchLike(inst, id) {
    var card = findPostEl(inst.root, id);
    if (!card) return;
    var p = inst.allPosts.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var btn = card.querySelector('[data-act="like"]');
    btn.className = 'msp-act-btn' + (p.liked ? ' msp-act-liked' : '');
    var iEl = btn.querySelector('.wr-thumb_up');
    if (iEl) iEl.style.color = p.liked ? '#2D5A27' : '#777777';
    var cnt = btn.querySelector('[data-kind="like"]');
    if (cnt) cnt.textContent = String(p.likeCount);
  }
  function patchCount(inst, id, kind) {
    var card = findPostEl(inst.root, id);
    if (!card) return;
    var p = inst.allPosts.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var v = kind === 'comment' ? p.commentCount : p.shareCount;
    var cnt = card.querySelector('[data-kind="' + kind + '"]');
    if (cnt) cnt.textContent = String(v);
  }
  function clearUnread(inst, id) {
    var cards = inst.root.querySelectorAll('.msp-msg-card');
    for (var i = 0; i < cards.length; i++) {
      if (Number(cards[i].getAttribute('data-id')) === id) {
        var u = cards[i].querySelector('.msp-msg-unread');
        if (u) u.remove();
        break;
      }
    }
  }
  /* 搜索逐字过滤(直接 display 控制,保留输入焦点) */
  function applyKeywordFilter(inst) {
    var kw = inst.data.keywords;
    var q = String(kw || '').trim();
    if (inst.data.activeTab === 'community') {
      var cards = inst.root.querySelectorAll('.msp-post-card');
      var matched = 0;
      for (var i = 0; i < cards.length; i++) {
        var text = cards[i].getAttribute('data-q') || '';
        var show = !q || text.indexOf(q) >= 0;
        cards[i].style.display = show ? '' : 'none';
        if (show) matched++;
      }
      var empty = inst.root.querySelector('.msp-post-empty');
      if (empty) empty.style.display = matched ? 'none' : '';
      if (!cards.length) {
        if (!q && empty) empty.style.display = '';
      }
    } else {
      var msgs = inst.root.querySelectorAll('.msp-msg-card');
      for (var j = 0; j < msgs.length; j++) {
        var mt = msgs[j].getAttribute('data-q') || '';
        msgs[j].style.display = !q || mt.indexOf(q) >= 0 ? '' : 'none';
      }
    }
  }

  /* ---------- 会话 tab 与社区 tab 切换(leave 淡出 → 换内容 → enter 淡入) ---------- */
  function switchTab(inst, tab) {
    if (tab === inst.data.activeTab) return;
    var root = inst.root;
    var content = root.querySelector('.msp-content');
    if (inst._swTimer) clearTimeout(inst._swTimer);
    /* loading 蒙层 */
    var mask = document.createElement('div');
    mask.className = 'msp-loading';
    mask.innerHTML = '<div class="msp-loading-ring"></div><span class="msp-loading-text">加载中…</span>';
    content.appendChild(mask);
    content.classList.add('msp-phase-leave');
    content.classList.remove('msp-phase-enter');
    inst.data.activeTab = tab;
    setStore(TAB_KEY, tab);
    inst._swTimer = setTimeout(function () {
      /* 换内容:同节点切 class,保留 transition */
      var inner = tab === 'community'
        ? communityHtml(inst.allPosts || [])
        : messageListHtml(withDelays(inst.allSessions || []));
      content.innerHTML = inner;
      content.classList.remove('msp-phase-leave');
      content.classList.add('msp-phase-enter');
      content.style.opacity = '0';
      void content.offsetWidth; /* 从 0 过渡到 1 需要先落一帧起点 */
      content.style.opacity = '';
      var m2 = content.querySelector('.msp-loading');
      if (m2) m2.remove();
      inst._swTimer = setTimeout(function () {
        inst._swTimer = null;
        applyKeywordFilter(inst);
      }, 200);
    }, 180);
  }

  function openChat(inst, sid) {
    var s = null;
    inst.allSessions = (inst.allSessions || []).map(function (x) {
      if (x.id === sid) { x.unread = 0; s = x; }
      return x;
    });
    if (!s) return;
    clearUnread(inst, sid);
    setStore(STATE_KEY, { keywords: inst.data.keywords, sessions: inst.allSessions });
    APP.go('/packageMessage/chat/chat?sid=' + sid, 'push');
  }
  function addSession(inst) {
    var id = Date.now();
    var session = {
      id: id, title: '新会话 ' + String(id).slice(-4), type: 'shop',
      time: nowLabel(), lastMessage: '已创建会话，开始聊天吧。', unread: 0,
      messages: [{ mid: 'm_' + id + '_1', from: 'other', text: '已创建会话，开始聊天吧。' }],
    };
    inst.allSessions = [session].concat(inst.allSessions || []);
    setStore(STATE_KEY, { keywords: inst.data.keywords, sessions: inst.allSessions });
    APP.go('/packageMessage/chat/chat?sid=' + id, 'push');
  }
  /* 模拟登录:web 无登录流程,默认已登录;若 usercenter 页实现登出可写回 false 恢复此门禁 */
  function loginOK() {
    if (wx.getStorageSync(AUTH_KEY) === true) return true;
    wx.showModal({
      title: '需要登录',
      content: '登录后才可以进行点赞、评论、转发等互动操作。',
      confirmText: '去登录',
      cancelText: '取消',
    }).then(function (res) {
      if (res.confirm) APP.go('/pages/usercenter/index', 'tab');
    });
    return false;
  }

  /* ---------- 评论面板 ---------- */
  function openComment(inst, pid) {
    inst._cmPid = pid;
    var mask = inst.root.querySelector('.msp-cm-mask');
    if (!mask) return;
    mask.classList.add('show');
    var inp = mask.querySelector('.msp-cm-input');
    if (inp) { inp.value = ''; setTimeout(function () { inp.focus(); }, 60); }
  }
  function closeComment(inst) {
    inst._cmPid = null;
    var mask = inst.root.querySelector('.msp-cm-mask');
    if (mask) {
      mask.classList.remove('show');
      var inp = mask.querySelector('.msp-cm-input');
      if (inp) inp.value = '';
    }
  }
  function submitComment(inst) {
    if (!loginOK()) return;
    var pid = inst._cmPid;
    var mask = inst.root.querySelector('.msp-cm-mask');
    var text = mask ? (mask.querySelector('.msp-cm-input').value || '').trim() : '';
    if (!pid || !text) return;
    inst.allPosts = (inst.allPosts || []).map(function (p) {
      if (p.id === pid) p.commentCount = (p.commentCount || 0) + 1;
      return p;
    });
    setStore(POSTS_KEY, inst.allPosts);
    patchCount(inst, pid, 'comment');
    closeComment(inst);
    wx.showToast({ title: '已评论', icon: 'success' });
  }

  /* ---------- 事件委托 ---------- */
  function onTap(e) {
    var inst = instRef;
    var t = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'tab') {
      switchTab(inst, t.getAttribute('data-tab'));
    } else if (act === 'topsearch') {
      var inp = inst.root.querySelector('.msp-search-input');
      if (inp) inp.focus();
    } else if (act === 'addsession') {
      addSession(inst);
    } else if (act === 'callservice') {
      wx.makePhoneCall({ phoneNumber: '10086' });
    } else if (act === 'servicenotice') {
      wx.showToast({ title: '服务通知入口待接入', icon: 'none' });
    } else if (act === 'like' || act === 'share' || act === 'comment') {
      if (!loginOK()) return;
      var pid = Number(t.getAttribute('data-id'));
      if (!pid) return;
      if (act === 'like') {
        inst.allPosts = (inst.allPosts || []).map(function (p) {
          if (p.id !== pid) return p;
          var liked = !p.liked;
          p.liked = liked;
          p.likeCount = liked ? (p.likeCount || 0) + 1 : Math.max((p.likeCount || 0) - 1, 0);
          return p;
        });
        setStore(POSTS_KEY, inst.allPosts);
        patchLike(inst, pid);
      } else if (act === 'share') {
        inst.allPosts = (inst.allPosts || []).map(function (p) {
          if (p.id === pid) p.shareCount = (p.shareCount || 0) + 1;
          return p;
        });
        setStore(POSTS_KEY, inst.allPosts);
        patchCount(inst, pid, 'share');
        wx.showToast({ title: '已转发', icon: 'success' });
      } else {
        openComment(inst, pid);
      }
    } else if (act === 'cm-close') {
      closeComment(inst);
    } else if (act === 'cm-submit') {
      submitComment(inst);
    } else if (act === 'totop') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  function onCardTap(e) {
    var inst = instRef;
    var card = e.target.closest ? e.target.closest('.msp-msg-card') : null;
    if (!card) return;
    var sid = Number(card.getAttribute('data-id'));
    if (sid) openChat(inst, sid);
  }
  function onPreviewTap(e) {
    var inst = instRef;
    var item = e.target.closest ? e.target.closest('[data-preview]') : null;
    if (!item) return;
    var card = item.closest('.msp-post-card');
    var post = null;
    if (card) {
      var id = Number(card.getAttribute('data-id'));
      post = (inst.allPosts || []).filter(function (p) { return p.id === id; })[0];
    }
    if (!post || !post.images || !post.images.length) return;
    var idx = Number(item.getAttribute('data-i')) || 0;
    wx.previewImage({ current: post.images[idx] || post.images[0], urls: post.images });
  }
  function onInput(e) {
    var inst = instRef;
    var t = e.target;
    if (!t.classList.contains('msp-search-input')) return;
    inst.data.keywords = t.value;
    setStore(STATE_KEY, { keywords: t.value, sessions: inst.allSessions });
    applyKeywordFilter(inst);
  }
  function onKeyDown(e) {
    var inst = instRef;
    if (e.key !== 'Enter' || e.isComposing) return;
    var t = e.target;
    if (t.classList.contains('msp-cm-input')) submitComment(inst);
  }
  function onClick(e) {
    onCardTap(e);
    onPreviewTap(e);
    onTap(e);
  }

  APP.reg('/pages/message/message', {
    title: '消息',
    nav: 'custom',
    tab: true,
    data: { statusBarHeight: 0, activeTab: 'message', keywords: '' },
    init: function (query) {
      var inst = this;
      instRef = inst;
      /* web 端默认登录态(见 loginOK 注释) */
      if (wx.getStorageSync(AUTH_KEY) !== true) setStore(AUTH_KEY, true);
      var restored = getStore(STATE_KEY, null);
      var defSessions = getDefaultSessions().map(normalizeSession);
      var sessions = restored && Array.isArray(restored.sessions) && restored.sessions.length
        ? mergeSeedSessions(restored.sessions.map(normalizeSession), defSessions)
        : defSessions;
      inst.allSessions = sessions;
      inst.data.keywords = (restored && restored.keywords) || '';
      var optTab = query && (query.tab === 'community' || query.tab === 'message') ? query.tab : '';
      var storedTab = getStore(TAB_KEY, '');
      inst.data.activeTab = optTab ||
        (storedTab === 'community' || storedTab === 'message' ? storedTab : 'message');
      var storedPosts = getStore(POSTS_KEY, null);
      var defPosts = getDefaultCommunityPosts().map(normalizePost);
      inst.allPosts = Array.isArray(storedPosts) && storedPosts.length
        ? mergePosts(storedPosts.map(normalizePost), defPosts)
        : defPosts;
      return Promise.resolve(inst);
    },
    render: render,
    events: function (root, inst) {
      instRef = inst;
      root.addEventListener('click', onClick);
      root.addEventListener('input', onInput);
      root.addEventListener('keydown', onKeyDown);
      /* 入场动画仅首次播放(重渲染/切回时静态显示) */
      if (!inst._animPlayed) {
        inst._animPlayed = true;
        requestAnimationFrame(function () {
          root.querySelector('.msp-page') && root.querySelector('.msp-page').classList.add('loaded');
        });
      }
      /* 渲染层补上搜索过滤(输入用 DOM patch,重建后需重算) */
      applyKeywordFilter(inst);
      /* 评论面板:点击遮罩(非面板区域)关闭 */
      var cm = root.querySelector('.msp-cm-mask');
      if (cm) {
        cm.addEventListener('click', function (e) {
          if (e.target === cm) closeComment(inst);
        });
      }
    },
  });
})();
