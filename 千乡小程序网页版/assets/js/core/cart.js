/* ===== 购物车数据层 + 通用加购弹层(桌面版新增功能,源小程序无购物车实现)=====
 * 持久化:wx.storage,key 'cart:v1'(localStorage 'app:cart:v1')
 * 条目字段:{ key, spuId, skuId, specText, specInfo[], title, thumb, price(分),
 *            quantity, stockQty, storeId, checked, addedAt }
 * 加购唯一键 key = spuId + '|' + (skuId||''),同键合并数量
 */
(function () {
  var STORE_KEY = 'cart:v1';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function read() {
    try {
      var v = wx.getStorageSync(STORE_KEY);
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function write(list) {
    try { wx.setStorageSync(STORE_KEY, list); } catch (e) {}
  }
  function toast(title, icon) {
    wx.showToast({ title: title, icon: icon || 'none', duration: 1200 });
  }

  function makeKey(spuId, skuId) { return String(spuId) + '|' + String(skuId == null ? '' : skuId); }
  function capQty(qty, stockQty) {
    var cap = Math.min(99, Math.max(1, Number(stockQty) || 99));
    return Math.max(1, Math.min(cap, qty || 1));
  }
  function findIndex(list, key) {
    for (var i = 0; i < list.length; i++) if (list[i].key === key) return i;
    return -1;
  }

  var Cart = {
    list: function () { return read(); },
    count: function () {
      return read().reduce(function (n, it) { return n + (Number(it.quantity) || 0); }, 0);
    },
    /** 加入/合并一个条目;key 必填或由 spuId+skuId 派生 */
    add: function (item) {
      item = item || {};
      var list = read();
      var key = item.key || makeKey(item.spuId, item.skuId);
      var skuId = item.skuId || '';
      var specText = item.specText || '';
      var specInfo = Array.isArray(item.specInfo) ? item.specInfo : [];
      if (!specText && specInfo.length) {
        specText = specInfo.map(function (s) { return s.specValue; }).filter(Boolean).join(' / ');
      }
      var idx = findIndex(list, key);
      if (idx >= 0) {
        var old = list[idx];
        old.quantity = capQty((Number(old.quantity) || 0) + (Number(item.quantity) || 1), old.stockQty || item.stockQty);
        if (old.specText !== specText && specText) old.specText = specText;
      } else {
        list.push({
          key: key,
          spuId: String(item.spuId),
          skuId: skuId,
          specText: specText,
          specInfo: specInfo,
          title: item.title || '',
          thumb: item.thumb || item.primaryImage || '',
          price: Math.max(0, Number(item.price) || 0),
          quantity: capQty(Number(item.quantity) || 1, item.stockQty),
          stockQty: Math.max(0, Number(item.stockQty) || 0),
          storeId: item.storeId || '1',
          checked: item.checked !== false,
          addedAt: Date.now(),
        });
      }
      write(list);
      Cart.syncBadge();
      return list;
    },
    setQty: function (key, qty) {
      var list = read();
      var i = findIndex(list, key);
      if (i < 0) return list;
      list[i].quantity = capQty(qty, list[i].stockQty);
      write(list);
      Cart.syncBadge();
      return list;
    },
    toggle: function (key, val) {
      var list = read();
      var i = findIndex(list, key);
      if (i >= 0) { list[i].checked = !!val; write(list); }
      return list;
    },
    toggleAll: function (val) {
      var list = read();
      for (var i = 0; i < list.length; i++) list[i].checked = !!val;
      write(list);
      return list;
    },
    allChecked: function () {
      var list = read();
      return list.length > 0 && list.every(function (it) { return it.checked; });
    },
    checkedList: function () {
      return read().filter(function (it) { return it.checked; });
    },
    /** keys:单 key 或数组 */
    remove: function (keys) {
      keys = [].concat(keys || []);
      var map = {};
      keys.forEach(function (k) { if (k) map[String(k)] = true; });
      var list = read().filter(function (it) { return !map[it.key]; });
      write(list);
      Cart.syncBadge();
      return list;
    },
    /** 下单成功后移除对应勾选条目(keys 为下单来源 key 数组) */
    removeCheckedKeys: function (keys) {
      var map = {};
      [].concat(keys || []).forEach(function (k) { if (k) map[String(k)] = true; });
      var list = read().filter(function (it) { return !(it.checked && map[it.key]); });
      write(list);
      Cart.syncBadge();
      return list;
    },
    clear: function () { write([]); Cart.syncBadge(); },
    /** 刷新顶栏/导航角标 */
    syncBadge: function () {
      var n = Cart.count();
      var els = document.querySelectorAll('.pc-cart__num, .nav-cart__num');
      for (var i = 0; i < els.length; i++) {
        els[i].textContent = n > 99 ? '99+' : String(n);
        els[i].classList.toggle('hidden', n <= 0);
      }
    },

    /** 通用加购调度:详情单规格/无规格直加;多规格弹选择层。
     * spu: {spuId,title,thumb,price} 列表页卡片字段;返回 Promise<boolean> 是否加入 */
    pickAndAdd: function (spu) {
      spu = spu || {};
      var spuId = String(spu.spuId || '');
      if (!spuId) return Promise.resolve(false);
      return new Promise(function (resolve) {
        SVC.fetchGoodDetail(spuId).then(function (detail) {
          if (!detail) { toast('商品信息获取失败'); return resolve(false); }
          if (Number(detail.available) <= 0) { toast('商品已下架'); return resolve(false); }
          // 归一:有货且有效售价的 SKU
          var skus = normalizeSkus(detail.skuList || [], detail).filter(function (s) {
            return s.quantity > 0 && s.price > 0;
          });
          var groups = (detail.specList || []).filter(function (g) {
            return g && (g.specValueList || []).length && skus.some(function (s) {
              return (s.specInfo || []).some(function (sp) { return String(sp.specId) === String(g.specId); });
            });
          });
          // 无有效 SKU → 按 SPU 兜底加购
          if (!skus.length) {
            Cart.add({
              spuId: spuId, title: detail.title || spu.title, thumb: detail.primaryImage || spu.thumb,
              price: detail.minSalePrice, quantity: 1, stockQty: detail.spuStockQuantity,
              skuId: '', specText: '', specInfo: [],
            });
            toast('已加入购物车', 'success');
            return resolve(true);
          }
          // 无需选规格(无规格或单一 SKU)→ 直加
          if (!groups.length || skus.length === 1) {
            var s0 = skus[0];
            Cart.add({
              spuId: spuId, title: detail.title || spu.title, thumb: detail.primaryImage || spu.thumb,
              price: s0.price, quantity: 1, stockQty: s0.quantity,
              skuId: s0.skuId, specInfo: s0.specInfo,
            });
            toast('已加入购物车', 'success');
            return resolve(true);
          }
          openSkuPicker(detail, groups, skus, resolve);
        }).catch(function () { toast('加购失败'); resolve(false); });
      });
    },
  };

  /* ---------- 通用 SKU 选择弹层(结构/类名对齐详情页 popup-sku,挂 #overlayRoot)---------- */
  function normalizeSkus(skuList, detail) {
    return (skuList || []).map(function (s) {
      var salePriceItem = (s.priceInfo || []).find ? s.priceInfo.find(function (p) { return p.priceType === 1; }) : null;
      return {
        skuId: s.skuId,
        quantity: s.stockInfo ? Number(s.stockInfo.stockQuantity) || 0 : 0,
        price: Number(s.price) || parseInt(String(salePriceItem && salePriceItem.price), 10) || Number(detail.minSalePrice) || 0,
        specInfo: s.specInfo || [],
      };
    });
  }
  function specTitleOf(specInfo) {
    return (specInfo || []).map(function (sp) { return sp.specValue; }).filter(Boolean).join(' / ');
  }
  function resolveSku(groups, selected, skus) {
    var allSel = groups.every(function (g) { return selected[g.specId]; });
    var sku = null;
    if (allSel) {
      for (var i = 0; i < skus.length; i++) {
        var hit = (skus[i].specInfo || []).every(function (sub) {
          return selected[sub.specId] && String(selected[sub.specId]) === String(sub.specValueId);
        });
        if (hit) { sku = skus[i]; break; }
      }
    }
    var names = [];
    groups.forEach(function (g) {
      (g.specValueList || []).forEach(function (v) {
        if (String(v.specValueId) === String(selected[g.specId])) names.push(v.specValue);
      });
    });
    return { allSel: allSel, sku: sku, names: names };
  }

  function openSkuPicker(detail, groups, skus, done) {
    var selected = {};
    var qty = 1;
    var overlay = document.getElementById('overlayRoot');
    if (!overlay) { done(false); return; }
    // 回收旧实例
    var old = overlay.querySelector('.pc-cart-sku');
    if (old) old.parentNode.removeChild(old);

    var gid = 'pcSku' + Math.random().toString(36).slice(2, 7);

    function rowHtml() {
      return groups.map(function (g) {
        var opts = (g.specValueList || []).map(function (v) {
          var active = String(selected[g.specId]) === String(v.specValueId) ? ' popup-sku-row__item--active' : '';
          return '<span class="popup-sku-row__item' + active + '" data-gid="' + g.specId + '" data-val="' + v.specValueId + '">' + esc(v.specValue) + '</span>';
        }).join('');
        return '<div class="popup-sku-row"><div class="popup-sku-row__title">' + esc(g.title || '') + '</div>' + opts + '</div>';
      }).join('');
    }
    function refresh() {
      var r = resolveSku(groups, selected, skus);
      var selBox = overlay.querySelector('#' + gid + ' .pc-sku-sel');
      if (selBox) selBox.innerHTML = '<span>选择:</span>' + (r.names.length ? r.names.map(function (n) { return '<span class="popup-sku__selected-item">' + esc(n) + '</span>'; }).join('') : '<span class="tintColor" style="color:#999">请选择规格</span>');
      var numBox = overlay.querySelector('#' + gid + ' .pc-sku-pricebox');
      if (numBox) numBox.innerHTML = UP.ph(r.sku ? r.sku.price : detail.minSalePrice);
      var stockBox = overlay.querySelector('#' + gid + ' .pc-sku-stock');
      if (stockBox) stockBox.textContent = r.sku ? '库存 ' + Math.max(0, r.sku.quantity) + ' 件' : '';
    }
    function confirm() {
      var r = resolveSku(groups, selected, skus);
      if (!r.allSel) { toast('请选择规格'); return; }
      if (!r.sku) { toast('该规格组合暂无库存'); return; }
      var key = makeKey(detail.spuId, r.sku.skuId);
      var specText = specTitleOf(r.sku.specInfo);
      Cart.add({
        key: key, spuId: detail.spuId, skuId: r.sku.skuId, title: detail.title,
        thumb: detail.primaryImage, price: r.sku.price, quantity: qty,
        stockQty: r.sku.quantity, specText: specText, specInfo: r.sku.specInfo,
      });
      close();
      toast('已加入购物车', 'success');
      done(true);
    }
    function close() {
      var el = overlay.querySelector('.' + gid + '-pop');
      if (el) el.parentNode.removeChild(el);
      done(false);
    }

    var html = '<div class="t-popup t-popup--bottom sku-popup pc-cart-sku ' + gid + '-pop show">' +
      '<div class="popup-mask" data-close="1"></div>' +
      '<div class="popup-panel"><div class="popup-close" data-close="1"><i class="wr wr-close"></i></div>' +
      '<div class="popup-sku-header">' +
      '<img class="popup-sku-header__img" src="' + esc(detail.primaryImage || '') + '" alt=""/>' +
      '<div class="popup-sku-header__goods-info">' +
      '<div class="popup-sku__goods-name">' + esc(detail.title || '') + '</div>' +
      '<div class="goods-price-container"><span class="popup-sku__price-num pc-sku-pricebox">' + UP.ph(detail.minSalePrice) + '</span></div>' +
      '<div class="popup-sku__selected-spec pc-sku-sel"></div></div></div>' +
      '<div class="popup-sku-body"><div class="popup-sku-group-container" id="' + gid + '">' + rowHtml() + '</div>' +
      '<div class="popup-sku-stepper-stock"><div class="popup-sku-stepper-container">' +
      '<div class="popup-sku__stepper-title">购买数量<span class="pc-sku-stock" style="margin-left:6px;color:#999;font-size:12px"></span></div>' +
      '<div class="t-stepper">' +
      '<span class="t-stepper__btn" data-minus="1"><i class="wr wr-minus"></i></span>' +
      '<input class="t-stepper__num" data-num="1" value="1" inputmode="numeric"/>' +
      '<span class="t-stepper__btn" data-plus="1"><i class="wr wr-add"></i></span>' +
      '</div></div></div></div>' +
      '<div class="popup-sku-actions"><div class="sku-operate sku-operate-addCart" data-ok="1">加入购物车</div></div>' +
      '</div></div>';
    overlay.insertAdjacentHTML('beforeend', html);
    refresh();
    var pop = overlay.querySelector('.' + gid + '-pop');
    pop.addEventListener('click', function (e) {
      var t = e.target;
      var closeBtn = t.closest('[data-close]');
      if (closeBtn) { close(); return; }
      var valBtn = t.closest('[data-val]');
      if (valBtn) {
        var gId = valBtn.getAttribute('data-gid');
        var vId = valBtn.getAttribute('data-val');
        if (String(selected[gId]) === String(vId)) delete selected[gId];
        else selected[gId] = vId;
        pop.querySelector('#' + gid).innerHTML = rowHtml();
        refresh();
        return;
      }
      if (t.closest('[data-ok]')) { confirm(); return; }
      if (t.closest('[data-minus]')) {
        qty = Math.max(1, qty - 1);
        var inp = pop.querySelector('[data-num]');
        if (inp) inp.value = qty;
        return;
      }
      if (t.closest('[data-plus]')) {
        var r = resolveSku(groups, selected, skus);
        var cap = r.sku ? Math.min(99, Math.max(1, r.sku.quantity)) : 99;
        if (qty >= cap) { toast('已达可购上限'); return; }
        qty = Math.min(cap, qty + 1);
        var inp2 = pop.querySelector('[data-num]');
        if (inp2) inp2.value = qty;
        return;
      }
    });
    var input = pop.querySelector('[data-num]');
    if (input) input.addEventListener('change', function () {
      var v = Math.max(1, parseInt(input.value, 10) || 1);
      var r = resolveSku(groups, selected, skus);
      var cap = r.sku ? Math.min(99, Math.max(1, r.sku.quantity)) : 99;
      qty = Math.min(cap, v);
      input.value = qty;
    });
  }

  window.Cart = Cart;
  window.__CART__ = Cart;
})();
