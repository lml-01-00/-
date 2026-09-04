/* 分类页 pages/category/index ← index.wxml/js/wxss + goods-category(level=3)
 * 布局:左 c-sidebar 一级导航(激活白块+红条/上下邻圆角),右三级分组网格;
 * 点击叶子 → /pages/goods/list/index?categoryId&categoryName&categoryPath
 * 数据:model/category.js 原始三级树 + service normalize(categoryId/categoryPath 规则)
 */
(function () {
  var state = { list: [], activeKey: 0 };
  var leaves = []; // 拍平后的叶子节点(与渲染顺序一致,含 categoryId/name/categoryPath)
  var jumpingId = '';

  /* services/good/fetchCategoryList.js normalizeCategoryList 同规则 */
  function normalize(list, parentMeta) {
    return list.map(function (item, index) {
      var parentPath = parentMeta && parentMeta.categoryPath ? parentMeta.categoryPath : '';
      var categoryPath = parentPath ? parentPath + '>' + item.name : item.name;
      var categoryId = parentMeta
        ? parentMeta.categoryId + '-' + (index + 1)
        : 'category-' + (index + 1);
      var n = Object.assign({}, item, {
        categoryId: categoryId,
        categoryPath: categoryPath,
      });
      n.children = normalize(n.children || [], n);
      return n;
    });
  }

  function collectLeaves(list) {
    var out = [];
    list.forEach(function (l2) {
      (l2.children || []).forEach(function (leaf) {
        out.push({
          categoryId: leaf.categoryId,
          name: leaf.name,
          categoryPath: leaf.categoryPath,
          thumbnail: leaf.thumbnail,
        });
      });
    });
    return out;
  }

  function render() {
    var list = state.list;
    if (!list.length) return '<div class="category-page"></div>';
    var len = list.length;
    var ak = Math.min(state.activeKey, len - 1);
    state.activeKey = ak;

    var topR = {};
    var bottomR = {};
    if (ak !== 0) { topR[0] = true; bottomR[ak - 1] = true; }
    if (ak < len - 1) { topR[ak + 1] = true; }

    var sideHtml = '';
    for (var i = 0; i < len; i++) {
      var c = list[i];
      var cls = 'cat-side-item';
      if (i === ak) cls += ' active';
      if (topR[i]) cls += ' top-r';
      if (bottomR[i]) cls += ' bottom-r';
      sideHtml += '<div class="' + cls + '" data-act="side" data-i="' + i + '">' +
        '<span class="cat-side-item__text">' + c.name + '</span></div>';
    }

    var mainHtml = '';
    var group = list[ak];
    leaves = [];
    if (group && group.children) {
      group.children.forEach(function (l2) {
        if (l2.children && l2.children.length) {
          mainHtml += '<div class="cat-group">' +
            '<div class="cat-group-title">' + l2.name + '</div>' +
            '<div class="cat-group-grid">';
          l2.children.forEach(function (leaf) {
            leaves.push(leaf);
            var img = leaf.thumbnail
              ? '<img src="' + leaf.thumbnail + '" alt="" loading="lazy"/>' : '';
            mainHtml += '<div class="cat-grid-item" data-act="leaf" data-i="' + (leaves.length - 1) + '">' +
              img + '<span>' + leaf.name + '</span></div>';
          });
          mainHtml += '</div></div>';
        }
      });
    }

    return '<div class="category-page">' +
      '<div class="cat-sidebar">' + sideHtml + '</div>' +
      '<div class="cat-main">' + mainHtml + '</div>' +
      '</div>';
  }

  function onTap(e) {
    var target = e.target.closest('[data-act]');
    if (!target) return;
    var act = target.getAttribute('data-act');
    if (act === 'side') {
      var i = Number(target.getAttribute('data-i'));
      if (i === state.activeKey) return;
      state.activeKey = i;
      APP.instances['/pages/category/index'].refresh();
    } else if (act === 'leaf') {
      var leaf = leaves[Number(target.getAttribute('data-i'))];
      if (!leaf || jumpingId === leaf.categoryId) return;
      jumpingId = leaf.categoryId;
      var q = 'categoryId=' + encodeURIComponent(leaf.categoryId) +
        '&categoryName=' + encodeURIComponent(leaf.name) +
        '&categoryPath=' + encodeURIComponent(leaf.categoryPath || '');
      APP.go('/pages/goods/list/index?' + q, 'push');
      jumpingId = '';
    }
  }

  APP.reg('/pages/category/index', {
    title: '分类',
    tab: true,
    data: { loaded: false },
    init: function () {
      var inst = this;
      return SVC.getCategoryList().then(function (raw) {
        state.list = normalize(raw, null);
        state.activeKey = Math.min(state.activeKey, state.list.length - 1);
        inst.setData({ loaded: true });
        return inst;
      });
    },
    render: render,
    events: function (root) {
      root.addEventListener('click', onTap);
    },
  });
})();
