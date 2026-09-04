/* 评价商品页 pages/goods/comments/create/index ← create/index(t-rate + textarea + upload + checkbox + 提交)
 * 参数:imgUrl/title/specs(商品来源);三组星级(商品/物流/服务);500 字文本域带计数;
 * 本地图片上传预览(9 张上限,file 读取为 dataURL);匿名勾选;文本非空才可提交→toast+返回
 */
(function () {
  var MAX_FILES = 9;
  var picker = null; // 动态 file input

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function rateStarsHtml(score, item) {
    var s = '';
    var n = Math.max(0, Math.min(5, Number(score) || 0));
    for (var i = 0; i < 5; i++) {
      s += '<i class="wr ' + (i < n ? 'wr-star_filled' : 'wr-star') + '" data-rate-item="' + item +
        '" data-rate-v="' + (i + 1) + '" style="color:' + (i < n ? '#ffc51c' : '#ddd') +
        ';font-size:13px;margin-right:3px;font-style:normal;cursor:pointer"></i>';
    }
    return s;
  }

  function goodsCardHtml(d) {
    return '<div class="comment-card">' +
      '<div class="goods-info-container">' +
      (d.imgUrl ? '<div class="goods-image-container"><img class="goods-image" src="' + d.imgUrl + '" alt=""/></div>' : '') +
      '<div class="goods-title-container">' +
      '<div class="goods-title">' + esc(d.title) + '</div>' +
      (d.goodsDetail ? '<div class="goods-detail">' + esc(d.goodsDetail) + '</div>' : '') +
      '</div></div>' +
      '<div class="rate-container">' +
      '<span class="rate-title">商品评价</span>' +
      '<span class="rate">' + rateStarsHtml(d.goodRateValue, 'goodRateValue') + '</span>' +
      '</div>' +
      '<div class="textarea-container">' +
      '<textarea class="textarea" maxlength="500" rows="5" placeholder="对商品满意吗？评论一下" ' +
      'data-act="comment-input">' + esc(d.commentText || '') + '</textarea>' +
      '<span class="textarea-indicator"><span class="cm-count">0</span>/500</span>' +
      '</div>' +
      '<div class="upload-container" data-act="upload-pick">' +
      uploadHtml(d) +
      '</div>' +
      '<div class="anonymous-box">' +
      '<label class="cm-checkbox' + (d.isAnonymous ? ' checked' : '') + '">' +
      '<input type="checkbox" class="cm-checkbox-input" data-act="anonymous" ' +
      (d.isAnonymous ? 'checked' : '') + '/></label>' +
      '<span class="name">匿名评价</span>' +
      '</div></div>';
  }

  function uploadHtml(d) {
    var files = d.uploadFiles || [];
    var cells = '';
    for (var i = 0; i < files.length; i++) {
      cells += '<div class="cm-upload-cell"><img src="' + files[i].url + '" alt=""/>' +
        '<i class="cm-upload-close" data-act="upload-remove" data-u-i="' + i + '">&times;</i></div>';
    }
    if (files.length < MAX_FILES) {
      cells += '<div class="cm-upload-cell cm-upload-add" data-act="upload-pick"><i class="cm-plus">+</i></div>';
    }
    return '<div class="cm-upload-grid">' + cells + '</div>';
  }

  function conveyCardHtml(d) {
    return '<div class="comment-card convey-card">' +
      '<div class="convey-comment-title">物流服务评价</div>' +
      '<div class="rate-container">' +
      '<span class="rate-title">物流评价</span>' +
      '<span class="rate">' + rateStarsHtml(d.conveyRateValue, 'conveyRateValue') + '</span>' +
      '</div>' +
      '<div class="rate-container">' +
      '<span class="rate-title">服务评价</span>' +
      '<span class="rate">' + rateStarsHtml(d.serviceRateValue, 'serviceRateValue') + '</span>' +
      '</div></div>';
  }

  function render() {
    var d = this.data;
    var disabledCls = d.isAllowedSubmit ? '' : '-disabled';
    return '<div class="create-page">' +
      goodsCardHtml(d) +
      conveyCardHtml(d) +
      '<div class="submit-button-container">' +
      '<div class="submit-button' + disabledCls + '" data-act="submit">提交</div>' +
      '</div></div>';
  }

  function pickFiles(inst) {
    if (!picker) {
      picker = document.createElement('input');
      picker.type = 'file';
      picker.accept = 'image/*,video/*';
      picker.multiple = true;
      picker.style.display = 'none';
      document.body.appendChild(picker);
      picker.addEventListener('change', function () {
        var files = Array.prototype.slice.call(picker.files || []);
        files.forEach(function (f) {
          if (inst.data.uploadFiles.length >= MAX_FILES) return;
          var reader = new FileReader();
          reader.onload = function () {
            if (inst.data.uploadFiles.length >= MAX_FILES) return;
            var arr = inst.data.uploadFiles.slice();
            arr.push({ name: f.name, url: reader.result });
            inst.setData({ uploadFiles: arr });
          };
          reader.readAsDataURL(f);
        });
        picker.value = '';
      });
    }
    picker.click();
  }

  function updateSubmitBtn(inst) {
    var d = inst.data;
    var ok = d.goodRateValue && d.conveyRateValue && d.serviceRateValue && !!inst.commentText;
    if (ok !== d.isAllowedSubmit) {
      d.isAllowedSubmit = ok;
      var btn = inst.root && inst.root.querySelector('.submit-button');
      if (btn) btn.className = 'submit-button' + (ok ? '' : '-disabled');
    }
  }

  function syncCommentText(inst) {
    var ta = inst.root && inst.root.querySelector('.textarea');
    var v = ta ? ta.value : (inst.commentText || '');
    inst.commentText = v;
    inst.data.commentText = v;
  }

  function onTap(e) {
    var t = e.target;
    var inst = APP.instances['/pages/goods/comments/create/index'];
    var act = t.getAttribute && t.getAttribute('data-act');
    if (act === 'submit') {
      if (!inst.data.isAllowedSubmit) return;
      wx.showToast({ title: '评价提交成功', icon: 'success' });
      setTimeout(function () { inst.back(); }, 900);
      return;
    }
    if (t.getAttribute && t.getAttribute('data-rate-item')) {
      var item = t.getAttribute('data-rate-item');
      var v = Number(t.getAttribute('data-rate-v'));
      syncCommentText(inst);
      var patch = {};
      patch[item] = v;
      inst.setData(patch);
      updateSubmitBtn(inst);
      return;
    }
    if (act === 'upload-pick') {
      pickFiles(inst);
      return;
    }
    if (act === 'upload-remove') {
      var arr = inst.data.uploadFiles.slice();
      arr.splice(Number(t.getAttribute('data-u-i')), 1);
      inst.setData({ uploadFiles: arr });
    }
  }

  function onInput(e) {
    var t = e.target;
    var inst = APP.instances['/pages/goods/comments/create/index'];
    inst.commentText = t.value;
    inst.data.commentText = t.value;
    var root = inst.root;
    if (root) {
      var counter = root.querySelector('.cm-count');
      if (counter) counter.textContent = String(t.value.length);
    }
    updateSubmitBtn(inst);
  }

  function onCheck(e) {
    var inst = APP.instances['/pages/goods/comments/create/index'];
    inst.setData({ isAnonymous: e.target.checked });
    var label = e.target.closest('.cm-checkbox');
    if (label) label.classList.toggle('checked', e.target.checked);
  }

  APP.reg('/pages/goods/comments/create/index', {
    title: '评价商品',
    nav: 'default',
    reinitOnQuery: true,
    data: {
      serviceRateValue: 1,
      goodRateValue: 1,
      conveyRateValue: 1,
      isAnonymous: false,
      uploadFiles: [],
      isAllowedSubmit: false,
      commentText: '',
      imgUrl: '',
      title: '',
      goodsDetail: '',
    },
    init: function (queryOptions) {
      var inst = this;
      var options = queryOptions || {};
      inst.setData({
        imgUrl: options.imgUrl || '',
        title: options.title || '',
        goodsDetail: options.specs || '',
        commentText: '',
      });
      inst.commentText = '';
      return Promise.resolve(inst);
    },
    render: render,
    events: function (root) {
      root.addEventListener('click', onTap);
      root.addEventListener('input', onInput);
      root.addEventListener('change', onCheck);
    },
  });
})();
