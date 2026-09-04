/* 商品详情 pages/goods/details/index.js ← index.wxml/js/wxss + buy-bar + goods-specs-popup + promotion-popup */
(function () {
  var CN = 'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-mp/';
  var HOME = '/pages/home/home';
  var MSG = '/pages/message/message';

  var specGroups = [];      // [{specId,title,values:[{specValueId,specValue,isSelected,hasStock,combo:[[id...]]}]}]
  var skuArray = [];        // [{skuId,quantity,specInfo:[{specId,specValueId,specValue}],price(分),skuImage}]
  var selectedSku = {};     // {specId: valueId|''}
  var selectItem = null;    // 命中的 sku
  var buyNum = 1;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------- 组件 initData:为每个规格值计算初始库存组合 ---------- */
  function checkSkuStockQuantity(specValueId, list) {
    var hasStock = false, array = [];
    (list || []).forEach(function (item) {
      (item.specInfo || []).forEach(function (sub) {
        if (sub.specValueId === specValueId && item.quantity > 0) {
          var subArray = [];
          (item.specInfo || []).forEach(function (sp) { subArray.push(sp.specValueId); });
          array.push(subArray);
          hasStock = true;
        }
      });
    });
    return { hasStock: hasStock, specsArray: array };
  }
  function initSpecGroups(specList, skuList) {
    specGroups = [];
    selectedSku = {};
    (specList || []).forEach(function (spec) {
      var values = (spec.specValueList || []).map(function (v) {
        var st = checkSkuStockQuantity(v.specValueId, skuList);
        return { specValueId: v.specValueId, specValue: v.specValue, isSelected: false, hasStock: st.hasStock, combo: st.specsArray };
      });
      specGroups.push({ specId: spec.specId, title: spec.title, values: values });
      selectedSku[spec.specId] = '';
    });
    selectItem = null;
  }
  function buildSkuArray(details) {
    skuArray = ((details && details.skuList) || []).map(function (item) {
      var salePriceItem = ((item.priceInfo || []).find ? item.priceInfo.find(function (p) { return p.priceType === 1; }) : null);
      var salePrice = salePriceItem ? salePriceItem.price : 0;
      return {
        skuId: item.skuId,
        quantity: item.stockInfo ? item.stockInfo.stockQuantity : 0,
        specInfo: item.specInfo || [],
        price: parseInt(String(salePrice), 10) || 0,
        skuImage: item.skuImage || '',
      };
    });
  }

  function flatten(input) {
    var stack = input.slice(), res = [];
    while (stack.length) {
      var next = stack.pop();
      if (Array.isArray(next)) for (var i = 0; i < next.length; i++) stack.push(next[i]);
      else res.push(next);
    }
    return res.reverse();
  }
  /* ---------- 组件 chooseSpecValueId:点击规格后重算各选项库存态 ---------- */
  function rebuildStockStatus(chosenSpecId) {
    var selectSpecObj = {};
    specGroups.forEach(function (group) {
      var itemAll = [], itemUn = [], itemSel = [];
      var specSelectStatus = false;
      group.values.forEach(function (v) {
        itemAll.push(v.combo);
        if (v.isSelected) specSelectStatus = true;
        if (v.hasStock) itemSel.push(v.specValueId); else itemUn.push(v.specValueId);
      });
      if (group.specId === chosenSpecId) {
        var clicked = group.values.filter(function (v) { return v.specValueId === selectedSku[chosenSpecId]; })[0];
        if (specSelectStatus) {
          var arr = clicked && clicked.combo ? clicked.combo.concat(itemSel) : itemSel;
          selectSpecObj[chosenSpecId] = flatten(arr);
        } else {
          var set2 = {}; itemUn.forEach(function (id) { set2[id] = true; });
          var subset = [];
          flatten(itemAll).forEach(function (val) { if (!set2[val]) subset.push(val); });
          selectSpecObj[chosenSpecId] = subset;
        }
      } else {
        if (specSelectStatus) {
          selectSpecObj[group.specId] = flatten(itemAll);
        } else {
          delete selectSpecObj[group.specId];
        }
      }
    });
    var keys = Object.keys(selectSpecObj);
    if (keys.length) {
      /* 源:Object.values(selectSpecObj).reduce((x,y)=>交集) 无初值;空初值 a.concat 在 a=null 时抛错 */
      var show = keys.map(function (k) { return selectSpecObj[k]; })
        .reduce(function (x, y) { return intersect(x, y); });
      var last = Array.from(new Set(show));
      specGroups.forEach(function (group) {
        group.values.forEach(function (v) {
          v.hasStock = last.indexOf(v.specValueId) > -1;
        });
      });
    } else {
      specGroups.forEach(function (group) {
        group.values.forEach(function (v) {
          var st = checkSkuStockQuantity(v.specValueId, skuArray);
          v.hasStock = st.hasStock; v.combo = st.specsArray;
        });
      });
    }
  }
  function intersect(a, b) { return a.filter(function (x) { return b.indexOf(x) > -1; }); }

  /* ---------- 计算命中 sku 与摘要 ---------- */
  function resolveSku() {
    var allSel = specGroups.every(function (g) { return selectedSku[g.specId]; });
    var sku = null;
    if (allSel) {
      sku = skuArray.filter(function (item) {
        return (item.specInfo || []).every(function (sub) {
          return selectedSku[sub.specId] && selectedSku[sub.specId] === sub.specValueId;
        });
      })[0] || null;
    }
    var names = [];
    specGroups.forEach(function (g) {
      var v = g.values.filter(function (x) { return x.specValueId === selectedSku[g.specId]; })[0];
      if (v) names.push(v.specValue);
    });
    return { allSel: allSel, sku: sku, attrStr: names.length ? '已选 ' + names.join(' ') : '' };
  }

  function toast(msg) { wx.showToast({ title: msg, icon: 'none', duration: 1000 }); }

  /* ---------- 渲染 ---------- */
  function swiperHtml(images, cur) {
    if (!images.length) return '';
    var items = images.map(function (src) {
      return '<div class="t-swiper__item"><img src="' + src + '" alt=""/></div>';
    }).join('');
    var info = inst().data.detailImageCount || images.length;
    return '<div class="t-swiper t-swiper--square" data-act="swiper">' +
      '<div class="t-swiper__track" style="transform:translateX(' + (-cur * 100) + '%)">' + items + '</div>' +
      '<div class="t-swiper__fraction"><span class="cur">' + (cur + 1) + '</span>/' + info + '</div></div>';
  }
  function activityHtml(list) {
    if (!list.length) return '';
    var tags = list.slice(0, 4).map(function (a) {
      return '<span class="goods-activity-tag">' + esc(a.tag) + '</span>';
    }).join('');
    return '<div class="goods-activity" data-act="promo-pop">' +
      '<div class="tags-container">' + tags + '</div>' +
      '<div class="activity-show"><span class="activity-show-text">领劵</span><i class="wr wr-arrow_forward_s activity-chev"></i></div></div>';
  }
  function skuSelectHtml(attrStr) {
    var tint = attrStr ? '' : 'tintColor';
    return '<div class="spu-select" data-act="sku-pop">' +
      '<span class="label">已选</span>' +
      '<div class="content"><div class="' + tint + '">' + (attrStr || '请选择') + '</div>' +
      '<i class="wr wr-arrow_forward_s spu-chev"></i></div></div>';
  }
  function commentsHtml(d) {
    var stats = d.commentsStatistics;
    if (!(stats.commentCount > 0) && !(d.commentsList.length > 0)) return '';
    var stars = '★★★★★'.split('').map(function (s, i) {
      var score = d.commentsList.length && d.commentsList[0].commentScore;
      var full = i < score ? ' active' : '';
      return '<i class="t-rate__star' + full + '">' + s + '</i>';
    }).join('');
    var item = d.commentsList.length ? d.commentsList[0] : null;
    return '<div class="comments-wrap">' +
      '<div class="comments-head" data-act="comments">' +
      '<div class="comments-title-wrap"><span class="comments-title-label">商品评价</span>' +
      '<span class="comments-title-count">(' + (stats.commentCount || 0) + ')</span></div>' +
      '<div class="comments-rate-wrap"><span class="comments-good-rate">' + (stats.goodRate || 0) + '% 好评</span>' +
      '<i class="wr wr-arrow_forward_s rate-chev"></i></div></div>' +
      (item ? '<div class="comment-item-wrap"><div class="comment-item-head">' +
        (item.userHeadUrl ? '<img class="comment-item-avatar" src="' + item.userHeadUrl + '" alt=""/>' : '<span class="comment-item-avatar comment-item-avatar--empty"></span>') +
        '<div class="comment-head-right"><div class="comment-username">' + esc(item.userName) + '</div>' +
        '<div class="t-rate">' + stars + '</div></div></div>' +
        '<div class="comment-item-content">' + esc(item.commentContent) + '</div></div>' : '') +
      '</div>';
  }
  function render() {
    var d = this.data;
    var list = d.list || [];
    var cur = d.swiperIdx || 0;
    var html = '<div class="goods-detail-page">';
    // head
    html += '<div class="goods-head">';
    html += swiperHtml(d.details.images || [], cur);
    html += '<div class="goods-info">';
    html += '<div class="goods-number"><div class="goods-price">' +
      '<span class="gd-price">' + UP.ph(d.minSalePrice, 'class-goods-price') + '</span>' +
      (d.details.maxLinePrice ? '<span class="goods-price-up">起</span><span class="class-goods-del">' + UP.ph(d.maxLinePrice) + '</span>' : '') +
      '</div><div class="sold-num">已售' + (d.soldNum || 0) + '</div></div>';
    html += activityHtml(list);
    html += '<div class="goods-title"><div class="goods-name">' + esc(d.details.title || '') + '</div>' +
      '<div class="goods-tag"><div class="btn-icon" data-act="share"><i class="wr wr-share share-icon"></i><span class="share-text">分享</span></div></div></div>';
    if (d.intro) html += '<div class="goods-intro">' + esc(d.intro) + '</div>';
    html += '</div>';
    html += skuSelectHtml(d.selectedAttrStr || '');
    html += commentsHtml(d);
    html += '</div>';
    // desc
    if ((d.details.desc || []).length) {
      html += '<div class="desc-content"><div class="desc-content__title">' +
        '<img class="desc-title-img" src="' + CN + 'common/rec-left.png" alt=""/><span class="desc-content__title--text">详情介绍</span>' +
        '<img class="desc-title-img" src="' + CN + 'common/rec-right.png" alt=""/></div>';
      d.details.desc.forEach(function (src) {
        html += '<img class="desc-content__img" src="' + src + '" alt=""/>';
      });
      html += '</div>';
    }
    // bottom bar
    html += bottomBarHtml(d);
    // sku popup
    html += skuPopupHtml(d);
    // promotion popup
    if (list.length) html += promoPopupHtml(d);
    html += '</div>';
    return html;
  }
  function bottomBarHtml(d) {
    var soldout = d.soldout, isStock = d.isStock;
    if (soldout || !isStock) {
      return '<div class="goods-bottom-operation"><div class="soldout-bar">' + (soldout ? '商品已下架' : '商品已售罄') + '</div></div>';
    }
    var jump = (d.jumpArray || []).slice(0, 2).map(function (item) {
      var badge = item.showCartNum && d.cartNum > 0
        ? '<span class="tag-cart-num">' + (d.cartNum > 99 ? '99+' : d.cartNum) + '</span>' : '';
      return '<div class="icon-warp operate-wrap" data-act="jump" data-url="' + item.url + '">' + badge +
        '<i class="wr wr-' + item.iconName + ' op-icon"></i><span class="operate-text">' + item.title + '</span></div>';
    }).join('');
    return '<div class="goods-bottom-operation"><div class="footer-cont">' +
      '<div class="bottom-operate-left">' + jump + '</div>' +
      '<div class="buy-buttons"><div class="bar-separately" data-act="to-cart">加入购物车</div>' +
      '<div class="bar-buy" data-act="to-buy">立即购买</div></div></div></div>';
  }
  function skuPopupHtml(d) {
    var shown = d.isSpuSelectPopupShow;
    var priceVal = d.selectSkuSellsPrice ? d.selectSkuSellsPrice : d.minSalePrice;
    var delPrice = '';
    if (!d.selectSkuSellsPrice && d.minSalePrice !== d.maxSalePrice && !d.isAllSelectedSku && d.maxSalePrice) {
      delPrice = '<span class="popup-sku__price-del">' + UP.ph(d.maxSalePrice) + '</span>';
    }
    var selChips = [];
    specGroups.forEach(function (g) {
      g.values.forEach(function (v) {
        if (v.isSelected) selChips.push('<span class="popup-sku__selected-item">' + esc(v.specValue) + '</span>');
      });
    });
    var rows = specGroups.map(function (g) {
      var opts = g.values.map(function (v) {
        var cls = v.isSelected ? ' popup-sku-row__item--active' : '';
        if (!v.hasStock || !d.isStock) cls += ' disabled-sku-selected';
        return '<span class="popup-sku-row__item' + cls + '" data-act="sku-val" data-specid="' + g.specId + '" data-id="' + v.specValueId + '" data-stock="' + v.hasStock + '">' + esc(v.specValue) + '</span>';
      }).join('');
      return '<div class="popup-sku-row"><div class="popup-sku-row__title">' + esc(g.title) + '</div>' + opts + '</div>';
    }).join('');
    var footer = d.buyType === 1
      ? '<div class="single-confirm-btn" data-act="sku-confirm">确定</div>'
      : '<div class="popup-sku-actions">' +
        '<div class="sku-operate sku-operate-addCart" data-act="sku-cart">加入购物车</div>' +
        '<div class="sku-operate sku-operate-buyNow" data-act="sku-buy">立即购买</div></div>';
    return '<div class="t-popup t-popup--bottom sku-popup' + (shown ? ' show' : '') + '" data-name="sku">' +
      '<div class="popup-mask" data-act="sku-close"></div>' +
      '<div class="popup-panel"><div class="popup-close" data-act="sku-close"><i class="wr wr-close"></i></div>' +
      '<div class="popup-sku-header">' +
      '<img class="popup-sku-header__img" id="skuPopImg" src="' + (d.specImg || d.primaryImage || '') + '" alt=""/>' +
      '<div class="popup-sku-header__goods-info">' +
      '<div class="popup-sku__goods-name">' + esc(d.details.title || '') + '</div>' +
      '<div class="goods-price-container" id="skuPopPrice">' +
      '<span class="popup-sku__price-num">' + UP.ph(priceVal) + '</span>' + delPrice +
      '</div>' +
      '<div class="popup-sku__selected-spec"><span>选择：</span>' + selChips.join('') + '</div>' +
      '</div></div>' +
      '<div class="popup-sku-body" id="skuPopBody">' +
      '<div class="popup-sku-group-container">' + rows + '</div>' +
      '<div class="popup-sku-stepper-stock"><div class="popup-sku-stepper-container">' +
      '<div class="popup-sku__stepper-title">购买数量' + (d.limitBuyText ? '<span class="limit-text"> (' + esc(d.limitBuyText) + ') </span>' : '') + '</div>' +
      '<div class="t-stepper">' +
      '<span class="t-stepper__btn" data-act="num-minus"><i class="wr wr-minus"></i></span>' +
      '<input class="t-stepper__num" data-act="num-input" value="' + buyNum + '" inputmode="numeric"/>' +
      '<span class="t-stepper__btn" data-act="num-plus"><i class="wr wr-add"></i></span>' +
      '</div></div></div></div>' +
      footer + '</div></div>';
  }
  function promoPopupHtml() {
    var d = inst().data;
    var shown = d.isShowPromotionPop;
    var items = d.list.map(function (a, i) {
      return '<div class="promotion-detail-list-item" data-act="promo-item" data-index="' + i + '">' +
        '<span class="promotion-tag">' + esc(a.tag) + '</span>' +
        '<span class="promotion-content">' + esc(a.label || '') + '</span>' +
        '<i class="wr wr-arrow_forward_s promotion-chev"></i></div>';
    }).join('');
    return '<div class="t-popup t-popup--bottom promo-popup' + (shown ? ' show' : '') + '" data-name="promo">' +
      '<div class="popup-mask" data-act="promo-close"></div>' +
      '<div class="popup-panel"><div class="popup-close" data-act="promo-close"><i class="wr wr-close"></i></div>' +
      '<div class="promotion-popup-title">促销说明</div>' +
      '<div class="promotion-popup-content">' + items + '</div></div></div>';
  }

  function inst() { return APP.instances['/pages/goods/details/index']; }

  /* ---------- 数据加载(等价 onLoad→getDetail/getComments*) ---------- */
  function loadData(query) {
    var d = inst().data;
    d.spuId = query.spuId || '';
    if (!d.spuId) { toast('商品参数缺失'); return Promise.resolve(); }
    return Promise.all([
      SVC.fetchGoodDetail(d.spuId),
      SVC.fetchActivityList(),
      SVC.fetchDetailComments(d.spuId),
      SVC.fetchDetailCommentsCount(d.spuId),
    ]).then(function (res) {
      var details = res[0] || {};
      var activityList = res[1] || [];
      var promotionArray = activityList.map(function (item, index) {
        var isReduce = item.promotionSubCode === 'MYJ';
        return {
          promotionId: item.promotionId !== undefined && item.promotionId !== null ? item.promotionId : index,
          promotionSubCode: item.promotionSubCode || '',
          tag: isReduce ? '满减' : '满折',
          label: item.label || item.promotionName || (isReduce ? '满100元减10元' : '满2件享9折'),
        };
      });
      // 评论
      var stats = res[3] || {};
      var commentsList = (res[2] || []).map(function (c) {
        return {
          goodsSpu: c.spuId,
          userName: c.userName || '',
          commentScore: c.commentScore,
          commentContent: c.commentContent || '用户未填写评价',
          userHeadUrl: c.isAnonymity ? '' : (c.userHeadUrl || ''),
        };
      });
      d.details = details;
      d.commentsList = commentsList;
      d.commentsStatistics = {
        badCount: parseInt(stats.badCount) || 0,
        commentCount: parseInt(stats.commentCount) || 0,
        goodCount: parseInt(stats.goodCount) || 0,
        goodRate: Math.floor((Number(stats.goodRate) || 0) * 10) / 10,
        hasImageCount: parseInt(stats.hasImageCount) || 0,
        middleCount: parseInt(stats.middleCount) || 0,
      };
      d.activityList = promotionArray;
      d.list = promotionArray;
      d.isStock = details.spuStockQuantity > 0;
      d.maxSalePrice = parseInt(details.maxSalePrice) || 0;
      d.maxLinePrice = parseInt(details.maxLinePrice) || 0;
      d.minSalePrice = parseInt(details.minSalePrice) || 0;
      d.primaryImage = details.primaryImage || '';
      d.intro = resolveIntro(details);
      d.limitBuyText = Array.isArray(details.limitInfo) && details.limitInfo.length ? (details.limitInfo[0].text || '') : '';
      d.soldout = Number(details.isPutOnSale) === 0;
      d.soldNum = details.soldNum || 0;
      d.detailImageCount = (details.images || []).length || 0;
      if (query.skuId) {
        var sku = (details.skuList || []).filter(function (s) { return String(s.skuId) === String(query.skuId); })[0];
        if (sku && Array.isArray(sku.specInfo)) {
          d.skuIdFromUrl = sku.skuId;
          d.autoSelect = true;
        }
      }
      buildSkuArray(details);
      initSpecGroups(details.specList || [], skuArray);
      if (d.autoSelect) {
        // 从 skuId 反向全选规格
        var t = d.details.skuList.filter(function (s) { return String(s.skuId) === String(d.skuIdFromUrl); })[0];
        if (t) {
          (t.specInfo || []).forEach(function (sp) {
            if (selectedSku[sp.specId] !== undefined) {
              selectedSku[sp.specId] = sp.specValueId;
              var g = specGroups.filter(function (x) { return x.specId === sp.specId; })[0];
              if (g) g.values.forEach(function (v) { v.isSelected = v.specValueId === sp.specValueId; });
            }
          });
          specGroups.forEach(function (g) { rebuildStockStatus(g.specId); });
          var r = resolveSku();
          d.isAllSelectedSku = r.allSel;
          if (r.sku) { selectItem = r.sku; d.selectSkuSellsPrice = r.sku.price; d.specImg = r.sku.skuImage || d.primaryImage; }
          d.selectedAttrStr = r.attrStr;
        }
      }
    }).catch(function () {
      toast('商品详情加载失败，请稍后重试');
    });
  }
  function resolveIntro(details) {
    var intro = [details.brief, details.subtitle, details.shortDesc, details.etitle]
      .find(function (x) { return typeof x === 'string' && x.trim(); });
    if (intro) return intro.trim();
    return (Array.isArray(details.spuTagList) ? details.spuTagList : [])
      .map(function (x) { return x && x.title ? String(x.title).trim() : ''; }).filter(Boolean).join(' ');
  }

  /* ---------- 事件 ---------- */
  function onTap(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    var d = inst().data;
    if (act === 'share') {
      toast('分享');
    } else if (act === 'promo-pop') {
      d.isShowPromotionPop = true;
      syncPopupVisibility();
    } else if (act === 'sku-pop') {
      openSkuPopup(0);
    } else if (act === 'comments') {
      APP.go('/pages/goods/comments/index?spuId=' + d.spuId, 'push');
    } else if (act === 'jump') {
      var url = t.getAttribute('data-url');
      if (url === HOME || url === MSG) APP.go(url, 'tab'); else APP.go(url, 'push');
    } else if (act === 'to-cart') {
      openSkuPopup(2);
    } else if (act === 'to-buy') {
      openSkuPopup(1);
    } else if (act === 'sku-close') {
      d.isSpuSelectPopupShow = false;
      d.isShowPromotionPop = false;
      syncPopupVisibility();
    } else if (act === 'promo-close') {
      d.isShowPromotionPop = false;
      syncPopupVisibility();
    } else if (act === 'promo-item') {
      var idx = Number(t.getAttribute('data-index')) || 0;
      d.isShowPromotionPop = false;
      syncPopupVisibility();
      APP.go('/pages/promotion/promotion-detail/index?promotion_id=' + idx, 'push');
    } else if (act === 'sku-val') {
      if (!d.isStock) return;
      if (t.getAttribute('data-stock') !== 'true') { toast('该规格已售罄'); return; }
      chooseSkuValue(t.getAttribute('data-specid'), t.getAttribute('data-id'));
    } else if (act === 'sku-cart') {
      skuFooterAction('cart');
    } else if (act === 'sku-buy') {
      skuFooterAction('buy');
    } else if (act === 'sku-confirm') {
      skuFooterAction(d.buyType === 1 ? 'buy' : 'cart');
    } else if (act === 'num-minus') {
      setBuyNum(buyNum - 1);
    } else if (act === 'num-plus') {
      setBuyNum(buyNum + 1);
    } else if (act === 'swiper') {
      // 详情页轮播不跳转
    }
  }
  function openSkuPopup(type) {
    var d = inst().data;
    d.buyType = type || 0;
    d.isSpuSelectPopupShow = true;
    d.isShowPromotionPop = false;
    inst().setData({});
  }
  function chooseSkuValue(specId, valueId) {
    var d = inst().data;
    // 切换/取消
    if (selectedSku[specId] === valueId) { selectedSku[specId] = ''; } else { selectedSku[specId] = valueId; }
    var g = specGroups.filter(function (x) { return x.specId === specId; })[0];
    if (g) g.values.forEach(function (v) { v.isSelected = v.specValueId === selectedSku[specId]; });
    rebuildStockStatus(specId);
    var r = resolveSku();
    d.isAllSelectedSku = r.allSel;
    if (!r.allSel) d.selectSkuSellsPrice = 0;
    if (r.sku) {
      selectItem = r.sku;
      d.selectSkuSellsPrice = r.sku.price;
      d.specImg = r.sku.skuImage || d.primaryImage;
    } else { selectItem = null; }
    d.selectedAttrStr = r.attrStr;
    d.selectItem = selectItem;
    refreshSkuPopupDom();
    // 同步页面"已选"摘要
    var selEl = document.querySelector('.spu-select .content > div');
    if (selEl) {
      selEl.textContent = r.attrStr || '请选择';
      selEl.classList.toggle('tintColor', !r.attrStr);
    }
  }
  function setBuyNum(n) {
    n = Math.max(1, Math.min(2, n || 1));
    buyNum = n;
    var input = document.querySelector('.sku-popup input.t-stepper__num');
    if (input) input.value = n;
  }
  function skuFooterAction(kind) {
    var d = inst().data;
    var r = resolveSku();
    if (!r.allSel) { toast('请选择规格'); return; }
    if (kind === 'cart') {
      var skuC = r.sku;
      if (!skuC) { toast('当前规格不可用'); return; }
      var specInfoC = (skuC.specInfo || []).map(function (sp) {
        var specC = (d.details.specList || []).filter(function (x) { return x.specId === sp.specId; })[0];
        var valueC = specC && (specC.specValueList || []).filter(function (v) { return v.specValueId === sp.specValueId; })[0];
        return { specTitle: (specC && specC.title) || sp.specTitle || '', specValue: (valueC && valueC.specValue) || sp.specValue || '' };
      }).filter(function (x) { return x.specTitle || x.specValue; });
      d.isSpuSelectPopupShow = false;
      syncPopupVisibility();
      Cart.add({
        spuId: d.spuId,
        title: d.details.title,
        thumb: d.primaryImage,
        price: skuC.price || d.minSalePrice,
        quantity: buyNum,
        stockQty: skuC.quantity,
        skuId: skuC.skuId,
        specInfo: specInfoC,
      });
      wx.showToast({ title: '已加入购物车', icon: 'success', duration: 1200 });
      return;
    }
    var sku = r.sku;
    if (!sku) { toast('当前规格不可用'); return; }
    d.isSpuSelectPopupShow = false;
    syncPopupVisibility();
    // 组装 specInfo(标题+值)
    var specInfo = (sku.specInfo || []).map(function (sp) {
      var spec = (d.details.specList || []).filter(function (x) { return x.specId === sp.specId; })[0];
      var value = spec && (spec.specValueList || []).filter(function (v) { return v.specValueId === sp.specValueId; })[0];
      return { specTitle: (spec && spec.title) || sp.specTitle || '', specValue: (value && value.specValue) || sp.specValue || '' };
    }).filter(function (x) { return x.specTitle || x.specValue; });
    var query = {
      quantity: buyNum,
      storeId: '1',
      spuId: d.spuId,
      goodsName: d.details.title,
      skuId: sku.skuId,
      available: d.details.available != null ? d.details.available : 1,
      price: sku.price || d.minSalePrice,
      specInfo: specInfo,
      primaryImage: d.primaryImage,
      thumb: d.primaryImage,
      title: d.details.title,
    };
    APP.go('/pages/order/order-confirm/index?goodsRequestList=' + encodeURIComponent(JSON.stringify([query])), 'push');
  }

  /* ---------- 弹层 DOM 级刷新(局部,避免整页重绘) ---------- */
  function refreshSkuPopupDom() {
    var d = inst().data;
    // 选项行
    var body = document.getElementById('skuPopBody');
    if (body) {
      var rows = specGroups.map(function (g) {
        var opts = g.values.map(function (v) {
          var cls = v.isSelected ? ' popup-sku-row__item--active' : '';
          if (!v.hasStock || !d.isStock) cls += ' disabled-sku-selected';
          return '<span class="popup-sku-row__item' + cls + '" data-act="sku-val" data-specid="' + g.specId + '" data-id="' + v.specValueId + '" data-stock="' + v.hasStock + '">' + esc(v.specValue) + '</span>';
        }).join('');
        return '<div class="popup-sku-row"><div class="popup-sku-row__title">' + esc(g.title) + '</div>' + opts + '</div>';
      }).join('');
      body.innerHTML = '<div class="popup-sku-group-container">' + rows + '</div>' +
        '<div class="popup-sku-stepper-stock"><div class="popup-sku-stepper-container">' +
        '<div class="popup-sku__stepper-title">购买数量' + (d.limitBuyText ? '<span class="limit-text"> (' + esc(d.limitBuyText) + ') </span>' : '') + '</div>' +
        '<div class="t-stepper">' +
        '<span class="t-stepper__btn" data-act="num-minus"><i class="wr wr-minus"></i></span>' +
        '<input class="t-stepper__num" data-act="num-input" value="' + buyNum + '" inputmode="numeric"/>' +
        '<span class="t-stepper__btn" data-act="num-plus"><i class="wr wr-add"></i></span>' +
        '</div></div></div>';
    }
    // 价格 + 已选 chips + 图
    var priceBox = document.getElementById('skuPopPrice');
    if (priceBox) {
      var priceVal = d.selectSkuSellsPrice ? d.selectSkuSellsPrice : d.minSalePrice;
      var del = '';
      if (!d.selectSkuSellsPrice && d.minSalePrice !== d.maxSalePrice && !d.isAllSelectedSku && d.maxSalePrice) {
        del = '<span class="popup-sku__price-del">' + UP.ph(d.maxSalePrice) + '</span>';
      }
      priceBox.innerHTML = '<span class="popup-sku__price-num">' + UP.ph(priceVal) + '</span>' + del;
    }
    var img = document.getElementById('skuPopImg');
    if (img) img.src = d.specImg || d.primaryImage || '';
    var sel = document.querySelector('.sku-popup .popup-sku__selected-spec');
    if (sel) {
      var chips = [];
      specGroups.forEach(function (g) {
        g.values.forEach(function (v) { if (v.isSelected) chips.push('<span class="popup-sku__selected-item">' + esc(v.specValue) + '</span>'); });
      });
      sel.innerHTML = '<span>选择：</span>' + chips.join('');
    }
  }
  function syncPopupVisibility() {
    var d = inst().data;
    var skuEl = document.querySelector('.sku-popup');
    var promoEl = document.querySelector('.promo-popup');
    if (skuEl) skuEl.classList.toggle('show', !!d.isSpuSelectPopupShow);
    if (promoEl) promoEl.classList.toggle('show', !!d.isShowPromotionPop);
  }

  /* ---------- swiper 轮播(fraction 模式,支持拖拽) ---------- */
  var swiperState = null;
  function initSwiper(root) {
    var track = root.querySelector('.t-swiper__track');
    if (!track) return;
    var count = root.querySelectorAll('.t-swiper__item').length;
    if (!count) return;
    swiperState = { track: track, count: count, idx: inst().data.swiperIdx || 0 };
    var cur = swiperState.idx;
    track.style.transform = 'translateX(' + (-cur * 100) + '%)';
    var frac = root.querySelector('.t-swiper__fraction .cur');
    if (frac) frac.textContent = cur + 1;
    if (swiperState.timer) clearInterval(swiperState.timer);
    swiperState.timer = setInterval(function () {
      moveTo(swiperState.idx + 1);
    }, 5000);
    var startX = null;
    track.addEventListener('pointerdown', function (ev) { startX = ev.clientX; });
    window.addEventListener('pointerup', function (ev) {
      if (startX == null || !swiperState) return;
      var dx = ev.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 30) moveTo(swiperState.idx + (dx < 0 ? 1 : -1));
    });
    function moveTo(n) {
      if (!swiperState) return;
      var c = swiperState.count;
      var idx = ((n % c) + c) % c;
      swiperState.idx = idx;
      inst().data.swiperIdx = idx;
      swiperState.track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      var f = document.querySelector('.t-swiper__fraction .cur');
      if (f) f.textContent = idx + 1;
    }
    inst().data._swiperCleanup = function () {
      if (swiperState && swiperState.timer) clearInterval(swiperState.timer);
      swiperState = null;
    };
  }
  function events(root) {
    root.addEventListener('click', onTap);
    initSwiper(root);
    root.querySelectorAll('input.t-stepper__num').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var v = parseInt(inp.value, 10);
        if (v > 2) v = 2;
        if (v < 1 || !v) v = 1;
        buyNum = v;
        inp.value = v;
      });
    });
  }

  APP.reg('/pages/goods/details/index', {
    title: '商品详情',
    reinitOnQuery: true,
    data: {
      commentsList: [], commentsStatistics: {},
      isShowPromotionPop: false, activityList: [],
      details: {}, list: [], isStock: true, cartNum: 0, soldout: false, buttonType: 1,
      buyNum: 1, selectedAttrStr: '', skuArray: [], primaryImage: '', specImg: '',
      isSpuSelectPopupShow: false, isAllSelectedSku: false, buyType: 0,
      selectSkuSellsPrice: 0, maxLinePrice: 0, minSalePrice: 0, maxSalePrice: 0,
      spuId: '', intro: '', limitBuyText: '', soldNum: 0, swiperIdx: 0, detailImageCount: 0,
      jumpArray: [
        { title: '首页', url: HOME, iconName: 'home' },
        { title: '消息', url: MSG, iconName: 'notify', showCartNum: true },
      ],
    },
    init: function (query) {
      var d = this.data;
      d.swiperIdx = 0;
      return loadData(query);
    },
    render: render,
    events: events,
  });
})();
