/* 数据服务层:对齐源码 services/* 的 mock 实现(delay + 字段映射),model 数据来自 mock-data.js */
(function () {
  var MOCK = window.MOCK;
  var AREA = window.AREA_DATA || [];

  function delay() {
    return new Promise(function (resolve) {
      setTimeout(resolve, 300);
    });
  }

  /** 获取首页数据(services/home/home.js fetchHome) */
  function fetchHome() {
    return delay().then(function () {
      return {
        swiper: MOCK.genSwiperImageList(),
        tabList: [
          { text: '蔬菜', key: 0 },
          { text: '养殖', key: 1 },
          { text: '娱乐', key: 2 },
          { text: '住宿', key: 3 },
          { text: '休闲', key: 4 },
          { text: '垂钓', key: 5 },
        ],
        activityImg: MOCK.cdnBase + '/activity/banner.png',
      };
    });
  }

  /** 获取商品列表(根 services 语义:按 startIndex 切片,每次 pageSize 条) */
  function fetchGoodsList(pageIndex, pageSize) {
    pageIndex = pageIndex == null ? 1 : pageIndex;
    pageSize = pageSize == null ? 20 : pageSize;
    return delay().then(function () {
      var all = MOCK.getGoodsList();
      return all.slice(pageIndex, pageIndex + pageSize).map(function (item) {
        return {
          spuId: item.spuId,
          thumb: item.primaryImage,
          title: item.title,
          price: Number(item.minSalePrice) || 0,
          originPrice: Number(item.maxLinePrice) || 0,
          tags: (item.spuTagList || []).map(function (tag) {
            return tag.title;
          }),
        };
      });
    });
  }

  /** 商品列表/搜索(common services/good/fetchGoodsList.js:queryGoodsList + 字段规整) */
  function fetchGoodList(params) {
    return delay().then(function () {
      var result = MOCK.queryGoodsList(params || {});
      var spuList = Array.isArray(result.spuList) ? result.spuList : [];
      spuList.forEach(function (item) {
        item.spuId = item.spuId;
        item.thumb = item.primaryImage || item.thumb || '';
        item.title = item.title || '';
        item.price = Number(item.minSalePrice) || item.price || 0;
        item.originPrice = Number(item.maxLinePrice) || item.originPrice || 0;
        item.desc = item.desc || '';
        item.tags = Array.isArray(item.spuTagList) ? item.spuTagList.map(function (tag) { return tag.title; }) : (item.tags || []);
      });
      return {
        totalCount: typeof result.totalCount === 'number' ? result.totalCount : spuList.length,
        spuList: spuList,
        pageNum: result.pageNum,
        pageSize: result.pageSize,
      };
    });
  }

  /** 搜索历史/热门词 */
  function fetchSearchHistory() {
    return delay().then(function () {
      var h = MOCK.getSearchHistory();
      var p = MOCK.getSearchPopular();
      return {
        historyWords: (h && h.historyWords) || [],
        popularWords: (p && p.popularWords) || [],
      };
    });
  }

  /** 活动列表 */
  function fetchActivityList() {
    return delay().then(function () {
      return MOCK.getActivityList();
    });
  }

  /** 详情页评价列表/统计 */
  function fetchDetailComments(spuId) {
    return delay().then(function () {
      var d = MOCK.getGoodsDetailsComments(spuId);
      return (d && d.homePageComments) || [];
    });
  }
  function fetchDetailCommentsCount(spuId) {
    return delay().then(function () {
      var d = MOCK.getGoodsDetailsCommentsCount(spuId);
      return d || {};
    });
  }

  /** 评论页(services/comments:model/comments.js getGoodsAllComments)
   * 源 mock 声明 totalCount 47 但 pageList 仅 29 条,统一为实际条数避免分页死循环 */
  function fetchComments(params) {
    return delay().then(function () {
      var r = window.MOCK_COMMENTS.getGoodsAllComments(params || {});
      var list = Array.isArray(r.pageList) ? r.pageList : [];
      return {
        pageNum: r.pageNum,
        pageSize: r.pageSize,
        totalCount: list.length,
        pageList: list,
      };
    });
  }
  function fetchCommentsCount() {
    return delay().then(function () {
      return window.MOCK_COMMENTS.getGoodsCommentsCount();
    });
  }

  /** 获取全部分类(services/category 等,model/category.js getCategoryList) */
  function getCategoryList() {
    return delay().then(function () {
      return MOCK.getCategoryList();
    });
  }

  /** 获取用户中心数据(services/usercenter.js fetchUserCenter) */
  function fetchUserCenter() {
    return delay().then(function () {
      return MOCK.genUsercenter();
    });
  }

  /** 获取商品详情(services/good fetchGoodDetail,model/good.js genGood) */
  function fetchGoodDetail(spuId) {
    return delay().then(function () {
      return MOCK.genGood(spuId);
    });
  }

  /* ---------- 地址 mock(源 pages/user/common/model/address.js genAddress/genAddressList) ---------- */
  function genAddress(id) {
    return {
      saasId: '88888888', uid: '8888888820550' + id,
      authToken: null, id: '' + id, addressId: '' + id,
      phone: '17612345678', name: '测试用户' + id,
      countryName: '中国', countryCode: 'chn',
      provinceName: '甘肃省', provinceCode: '620000',
      cityName: '甘南藏族自治州', cityCode: '623000',
      districtName: '碌曲县', districtCode: '623026',
      detailAddress: '松日鼎盛大厦' + id + '层' + id + '号',
      isDefault: String(id) === '0' ? 1 : 0,
      addressTag: id === 0 ? '' : '公司',
      latitude: '34.59103', longitude: '102.48699',
      storeId: null,
    };
  }
  /** 地址列表展示行(源 fetchAddress.js:列表项拼 phoneNumber/address/tag) */
  function toListRow(address) {
    return Object.assign({}, address, {
      phoneNumber: address.phone,
      address: address.provinceName + address.cityName + address.districtName + address.detailAddress,
      tag: address.addressTag,
    });
  }

  /* ---------- 下单流程 mock(源 pages/order/order-confirm model 文件缺失,
   * 按 index.js/wxml 消费字段自建:storeGoodsList 门店商品 + 金额汇总 + userAddress) ---------- */
  var SETTLE_STORE_NAME = '千乡优选旗舰店'; // detail 下单 query 仅传 storeId:'1',店铺名由 mock 兜底
  function defaultAddress() { return genAddress('0'); }
  function buildSettle(params) {
    var req = (params && params.goodsRequestList) || [];
    var storeMap = {};
    var stores = [];
    req.forEach(function (g) {
      var sid = g.storeId;
      if (!storeMap[sid]) {
        storeMap[sid] = true;
        stores.push({ storeId: sid, storeName: g.storeName || SETTLE_STORE_NAME, skuDetailVos: [], couponList: [], storeTotalPayAmount: 0 });
      }
    });
    var totalSale = 0;
    var totalCount = 0;
    stores.forEach(function (st) {
      req.forEach(function (g) {
        if (String(g.storeId) !== String(st.storeId)) return;
        var q = Math.max(1, Number(g.quantity) || 1);
        var p = Math.max(0, Number(g.price) || 0);
        st.skuDetailVos.push({
          image: g.primaryImage || g.thumb || '',
          goodsName: g.goodsName || g.title || '',
          skuSpecLst: ((g.specInfo || []).filter(function (s) { return s && s.specValue; }))
            .map(function (s) { return { specValue: s.specValue }; }),
          settlePrice: p, tagPrice: null, tagText: '',
          quantity: q, skuId: g.skuId, spuId: g.spuId, storeId: g.storeId,
        });
        st.storeTotalPayAmount += p * q;
        totalSale += p * q;
        totalCount += q;
      });
    });
    // 优惠券:mock 1 张 5.5 折折扣券(couponId 11),选中即按 55% 实付
    var hasCoupon = (params && params.couponList || []).some(function (c) { return c && c.couponId != null; });
    var couponAmt = hasCoupon ? Math.round(totalSale * 0.45) : 0;
    var payAmt = Math.max(0, totalSale - couponAmt);
    return {
      storeGoodsList: stores,
      outOfStockGoodsList: [], abnormalDeliveryGoodsList: [],
      inValidGoodsList: [], limitGoodsList: [],
      userAddress: (params && params.userAddressReq) || defaultAddress(),
      totalSalePrice: totalSale,
      totalDeliveryFee: 0,
      totalPromotionAmount: 0,
      totalCouponAmount: couponAmt,
      invoiceSupport: true,
      totalGoodsCount: totalCount,
      totalPayAmount: payAmt,
      totalAmount: totalSale,
      settleType: payAmt > 0 ? 1 : 0,
    };
  }
  /** 获取结算数据(orderConfirm.js fetchSettleDetail → model genSettleDetail) */
  function fetchSettleDetail(params) {
    return delay().then(function () {
      return { data: buildSettle(params) };
    });
  }
  /** 提交订单(orderConfirm.js dispatchCommitPay,返回固定成功单) */
  function dispatchCommitPay() {
    return delay().then(function () {
      return {
        code: 'Success', msg: null, success: true,
        data: {
          isSuccess: true,
          tradeNo: '350930961469409099',
          payInfo: '{}',
          transactionId: 'E-200915180100299000',
          interactId: '15145',
          channel: 'wechat',
          limitGoodsList: null,
        },
      };
    });
  }
  /** 补开发票(dispatchSupplementInvoice) */
  function dispatchSupplementInvoice() {
    return delay();
  }

  /** 获取地址列表(fetchAddress.js fetchDeliveryAddressList → genAddressList) */
  function fetchAddressList(len) {
    var n = len == null ? 10 : len;
    return delay().then(function () {
      return new Array(n).fill(0).map(function (_, idx) { return toListRow(genAddress(idx)); });
    });
  }
  /** 获取地址详情(edit 回填;fetchAddress.js fetchDeliveryAddress) */
  function fetchAddressDetail(id) {
    return delay().then(function () { return genAddress(id == null ? 0 : Number(id)); });
  }
  /** 获取个人信息(fetchPerson.js → genSimpleUserInfo + 地址) */
  function fetchPerson() {
    return delay().then(function () {
      var a = genAddress(0);
      return Object.assign({}, MOCK.genSimpleUserInfo(), {
        address: {
          provinceName: a.provinceName, provinceCode: a.provinceCode,
          cityName: a.cityName, cityCode: a.cityCode,
        },
      });
    });
  }
  /** 名称→代码(源 addressParse.js;数据源为乱码 area.js,web 版换为 AREA_DATA) */
  function parseArea(provinceName, cityName, districtName) {
    var p = AREA.filter(function (v) { return v.label === provinceName; })[0];
    if (!p) return null;
    var c = (p.children || []).filter(function (v) { return v.label === cityName; })[0];
    if (!c) return null;
    var d = (c.children || []).filter(function (v) { return v.label === districtName; })[0];
    if (!d) return null;
    return { provinceCode: p.value, cityCode: c.value, districtCode: d.value };
  }
  /** promise 桥(源 pages/user/common/services/address/{list,edit}.js:跨页等待选择/保存的地址) */
  function makeBridge() {
    var waiters = [];
    return {
      wait: function () {
        return new Promise(function (resolve, reject) {
          waiters.push({ resolve: resolve, reject: reject });
        });
      },
      resolve: function (value) {
        var all = waiters; waiters = [];
        all.forEach(function (w) { w.resolve(value); });
      },
      reject: function (err) {
        var all = waiters; waiters = [];
        all.forEach(function (w) { w.reject(err || new Error('cancel')); });
      },
    };
  }

  /* ---------- 订单 mock(源 pages/order/common/model/order/{orderList,orderDetail}.js 文件缺失,
   * 按 order-list/order-detail 页及其组件消费字段自建;商品取商品池,金额运行时汇总保证自洽) ---------- */
  function orderFmtTime(input, template) {
    var date = new Date(input);
    if (isNaN(date.getTime())) return '';
    var pad2 = function (n) { return n < 10 ? '0' + n : '' + n; };
    var map = {
      YYYY: '' + date.getFullYear(), MM: pad2(date.getMonth() + 1), DD: pad2(date.getDate()),
      HH: pad2(date.getHours()), mm: pad2(date.getMinutes()), ss: pad2(date.getSeconds()),
    };
    return String(template || 'YYYY-MM-DD HH:mm:ss').replace(/YYYY|MM|DD|HH|mm|ss/g, function (t) { return map[t] || t; });
  }
  function ordGoodsRow(gIdx, num, opts) {
    opts = opts || {};
    var g = MOCK.getGoodsList()[gIdx];
    var price = Math.max(0, Number(g.minSalePrice) || 0);
    var specs = ((g.specList || []).map(function (s) {
      var first = ((s.specValueList || [])[0] || {}).specValue;
      return first ? { specValue: first } : null;
    })).filter(Boolean);
    return {
      id: opts.id != null ? opts.id : gIdx + 1,
      goodsPictureUrl: g.primaryImage,
      goodsName: g.title,
      spuId: g.spuId,
      skuId: opts.skuId || '8888000' + gIdx,
      specifications: specs,
      actualPrice: price, tagPrice: null, tagText: '',
      buyQuantity: num || 1,
      buttonVOs: opts.buttons || [],
    };
  }
  /** 组装一单:goodsList 商品行配置 → 金额汇总 + 公共字段 */
  function buildOrder(conf) {
    var itemVOs = (conf.goods || []).map(function (row) { return ordGoodsRow(row[0], row[1], row[2] || {}); });
    var goodsAmt = itemVOs.reduce(function (s, g) { return s + g.actualPrice * g.buyQuantity; }, 0);
    var freight = conf.freightFee || 0;
    var discount = conf.discountAmount || 0;
    var coupon = conf.couponAmount || 0;
    var pay = Math.max(0, goodsAmt + freight - discount - coupon);
    var addr = genAddress('0');
    return {
      saasId: '88888888', storeId: '1000', storeName: '千乡优选旗舰店',
      orderId: conf.orderId, orderNo: conf.orderNo, parentOrderNo: '',
      orderStatus: conf.status, orderStatusName: conf.statusName,
      orderSubStatus: 0, holdStatus: 0,
      createTime: conf.createTime, autoCancelTime: conf.autoCancelTime || null,
      paymentVO: { paySuccessTime: conf.paidAt || null },
      totalAmount: goodsAmt, goodsAmountApp: goodsAmt, freightFee: freight,
      discountAmount: discount, couponAmount: coupon, paymentAmount: pay,
      remark: conf.remark || '', orderStatusRemark: conf.remarkDesc || '',
      logisticsVO: Object.assign({
        logisticsNo: '', logisticsCompanyName: '', logisticsCompanyTel: '',
        receiverName: addr.name, receiverPhone: addr.phone,
        receiverProvince: addr.provinceName, receiverCity: addr.cityName,
        receiverCountry: addr.districtName, receiverArea: '',
        receiverAddress: addr.detailAddress,
      }, conf.logisticsVO || {}),
      /* 发票(源 model 缺失;invoice 页消费 buyerName 等字段 → mock 补全:默认个人已开票,invoiceType 0 不开票) */
      invoiceVO: {
        invoiceType: conf.invoiceType == null ? 5 : conf.invoiceType,
        titleType: conf.invoiceType === 0 ? null : 1,
        contentType: conf.invoiceType === 0 ? null : 1,
        buyerName: conf.invoiceType === 0 ? '' : '张伟',
        buyerTaxNo: '',
        buyerPhone: conf.invoiceType === 0 ? '' : '13800138000',
        email: conf.invoiceType === 0 ? '' : 'zhangwei@example.com',
        money: conf.invoiceType === 0 ? '' : '' + (pay / 100).toFixed(2),
      },
      invoiceStatus: conf.invoiceStatus == null ? 4 : conf.invoiceStatus,
      trajectoryVos: conf.trajectoryVos || [],
      orderItemVOs: itemVOs,
      buttonVOs: conf.buttons || [],
      groupInfoVo: null,
    };
  }
  function orderButton(type, name, primary) {
    return { type: type, name: name, primary: !!primary };
  }
  function trajNode(code, title, nodes) {
    return { code: code, title: title, nodes: nodes };
  }
  /** 物流轨迹节点(页面 flattenNodes → 时间轴) */
  function logisticsNodes(code, title, shippedText, shippedStamp, extra) {
    return trajNode(code, title, [
      { status: shippedText, timestamp: shippedStamp },
      { status: '您的订单已提交', timestamp: shippedStamp - 1000 * 60 * 60 * 20 },
    ].concat(extra || []));
  }
  function genOrderList() {
    var now = Date.now();
    var H = 3600 * 1000;
    var DAY = 24 * H;
    var CANCEL = orderButton(2, '取消订单', false);
    var PAY = orderButton(1, '去支付', true);
    var SERVICE = orderButton(4, '申请售后', false);
    var CONFIRM = orderButton(3, '确认收货', true);
    var REBUY = orderButton(9, '再次购买', true);
    var DEL = orderButton(7, '删除订单', false);
    var SVC_BTN = [{ name: '申请售后', type: 4, primary: false }];
    return [
      /* 待付款(倒计时;remark 空) */
      buildOrder({
        orderId: 901, orderNo: '202609031200000101', status: 5, statusName: '待付款',
        createTime: now - 12 * 60 * 1000, autoCancelTime: now + 90 * 60 * 1000,
        goods: [[0, 1, { buttons: [] }], [3, 2, { buttons: [] }]],
        buttons: [CANCEL, PAY],
        invoiceType: 0, invoiceStatus: 2,
        remarkDesc: '订单超时未支付将自动关闭',
      }),
      /* 待发货 一(整只老母鸡) */
      buildOrder({
        orderId: 902, orderNo: '202609020020000102', status: 10, statusName: '待发货',
        createTime: now - 4 * H, paidAt: now - 4 * H + 60 * 1000,
        goods: [[6, 1, { buttons: SVC_BTN }], [7, 1, { buttons: SVC_BTN }]],
        buttons: [SERVICE],
        remark: '麻烦尽快发货谢谢',
        remarkDesc: '商家正在加急打包,请耐心等待',
      }),
      /* 待收货(4 种商品 + 物流轨迹 + 运费/活动优惠,金额明细全分支) */
      buildOrder({
        orderId: 903, orderNo: '202609011030000103', status: 40, statusName: '待收货',
        createTime: now - 26 * H, paidAt: now - 26 * H + 3 * 60 * 1000,
        freightFee: 600, discountAmount: 1500,
        goods: [[0, 1, { buttons: SVC_BTN }], [1, 2, { buttons: SVC_BTN }], [4, 1, { buttons: SVC_BTN }], [5, 1, { buttons: SVC_BTN }]],
        buttons: [CONFIRM],
        logisticsVO: {
          logisticsNo: 'SF1360123456789', logisticsCompanyName: '顺丰速运',
          logisticsCompanyTel: '95338',
        },
        trajectoryVos: [logisticsNodes(200007, '运输中', '您的包裹已从[千乡优选]广州仓发出,准备送往[甘南藏族自治州碌曲县]', now - 6 * H, [
          { status: '您的订单已支付成功', timestamp: now - 24 * H },
        ])],
        remarkDesc: '包裹已出库,正在运输中',
      }),
      /* 已完成 一(优惠券减 900) */
      buildOrder({
        orderId: 904, orderNo: '202608310900000104', status: 50, statusName: '已完成',
        createTime: now - 3 * DAY, paidAt: now - 3 * DAY + 5 * 60 * 1000, couponAmount: 900,
        goods: [[2, 3, { buttons: SVC_BTN }]],
        buttons: [REBUY, DEL],
        logisticsVO: {
          logisticsNo: 'YT7503456789012', logisticsCompanyName: '圆通速递',
          logisticsCompanyTel: '95554',
        },
        trajectoryVos: [logisticsNodes(200005, '已签收', '快件已签收,签收人:测试用户0', now - 2 * DAY)],
        remarkDesc: '交易完成,感谢您的购买',
      }),
      /* 已完成 二(活动优惠与券同单) */
      buildOrder({
        orderId: 905, orderNo: '202608281830000105', status: 50, statusName: '已完成',
        createTime: now - 5 * DAY, paidAt: now - 5 * DAY + 2 * 60 * 1000,
        freightFee: 0, discountAmount: 2000, couponAmount: 0,
        goods: [[8, 1, { buttons: SVC_BTN }]],
        buttons: [DEL],
        logisticsVO: {
          logisticsNo: 'JD001234567890', logisticsCompanyName: '京东物流',
          logisticsCompanyTel: '950616',
        },
        trajectoryVos: [logisticsNodes(200005, '已签收', '商品已由本人签收', now - 4 * DAY)],
        remarkDesc: '交易完成,感谢您的购买',
      }),
      /* 待发货 二(无按钮,差异展示) */
      buildOrder({
        orderId: 906, orderNo: '202609030500000106', status: 10, statusName: '待发货',
        createTime: now - 2 * H,
        goods: [[2, 1, { buttons: SVC_BTN }]],
        buttons: [],
        remarkDesc: '商品已出库,等待揽收',
      }),
    ];
  }
  /** 获取订单列表(orderList.js fetchOrders → genOrders;按 status 过滤 + 分页) */
  function fetchOrders(params) {
    return delay().then(function () {
      var ps = (params && params.parameter) || {};
      var status = ps.orderStatus;
      var size = ps.pageSize || 5;
      var num = ps.pageNum || 1;
      var all = genOrderList();
      var hit = (status == null || status === -1) ? all : all.filter(function (o) { return o.orderStatus === status; });
      return { data: { orders: hit.slice((num - 1) * size, num * size) } };
    });
  }
  /** 各 tab 订单数(orderList.js fetchOrdersCount → genOrdersCount) */
  function fetchOrdersCount() {
    return delay().then(function () {
      var all = genOrderList();
      var count = function (s) { return s === -1 ? all.length : all.filter(function (o) { return o.orderStatus === s; }).length; };
      return { data: [-1, 5, 10, 40, 50].map(function (k) { return { tabType: k, orderNum: count(k) }; }) };
    });
  }
  /** 订单详情(orderDetail.js fetchOrderDetail → genOrderDetail) */
  function fetchOrderDetail(params) {
    return delay().then(function () {
      var no = params && params.parameter;
      var hit = genOrderList().filter(function (o) { return o.orderNo === no; })[0];
      return { data: hit || genOrderList()[0] };
    });
  }
  /** 客服信息(orderDetail.js fetchBusinessTime → genBusinessTime) */
  function fetchBusinessTime() {
    return delay().then(function () {
      return { data: { telphone: '400-810-9888', businessTime: ['周一至周日 09:00-22:00'] } };
    });
  }

  /** 营销活动详情(promotion/common/services/promotion/detail.js getPromotion) */
  function fetchPromotion() {
    return delay().then(function () {
      var goods = MOCK.getGoodsList().slice(0, 10).map(function (item) {
        return {
          spuId: item.spuId,
          thumb: item.primaryImage,
          title: item.title,
          price: Number(item.minSalePrice) || 0,
          originPrice: Number(item.maxLinePrice) || 0,
          tags: (item.spuTagList || []).map(function (tag) { return tag.title; }),
        };
      });
      return {
        list: goods,
        banner: 'https://free.picui.cn/free/2026/03/11/69b13c25b89e3.jpg',
        time: 1000 * 60 * 60 * 20,
        showBannerDesc: true,
        statusTag: 'running',
      };
    });
  }

  /* ---- 优惠券(coupon/common/model/coupon.js getCoupon/getCouponList + service normalize) ---- */
  var COUPON_TIME_LIMIT = '2019.11.18-2023.12.18';
  /** 单张券:type 1=满减(价,单位分)/2=折扣(折);value 满减分/折扣值;base=门槛分 */
  function couponModel(id, status, type) {
    id = Number(id) || 0;
    if (type == null) type = (id % 2) + 1;
    return {
      key: '' + id,
      status: status || 'default',
      type: type,
      value: type === 2 ? 5.5 : 1800,
      tag: '',
      desc: id > 0 ? '满' + id * 100 + '元可用' : '无门槛使用',
      base: 10000 * id,
      title: (type === 2 ? '生鲜折扣券' : '生鲜满减券') + ' - ' + id,
      timeLimit: COUPON_TIME_LIMIT,
      currency: '¥',
    };
  }
  /** 券列表(couponList.js fetchCouponList → mockFetchCoupon → getCouponList(status,10)) */
  function fetchCouponList(status) {
    status = status || 'default';
    return delay().then(function () {
      var arr = [];
      for (var i = 0; i < 10; i++) arr.push(couponModel(i, status));
      return arr;
    });
  }
  /** 券详情(源 normalize 把 type 归为 'price'/'discount' 字符串,web 1:1 保留该口径) */
  function fetchCouponDetail(id) {
    id = /^\d+$/.test('' + id) ? Number(id) : 0;
    return delay().then(function () {
      var detail = couponModel(id, 'default');
      var couponType = detail.type === 1 ? 'price' : (detail.type === 2 ? 'discount' : '' + detail.type);
      detail.useNotes = '1个订单限1张，除运费券外，不能与其它类型的优惠券叠加使用（运费券除外）\n2.仅适用于各区域正常售卖商品，不支持团购、抢购、预售类商品';
      detail.storeAdapt = '商城通用';
      detail.type = couponType;
      if (couponType === 'price') {
        detail.desc = '减免 ' + detail.value / 100 + ' 元';
        if (detail.base) detail.desc += '，满' + detail.base / 100 + '元可用';
        detail.desc += '，仅限优惠商品使用';
      } else if (couponType === 'discount') {
        detail.desc = detail.value + '折';
        if (detail.base) detail.desc += '，满' + detail.base / 100 + '元可用';
        detail.desc += '，最高优惠20元';
      }
      return { detail: detail };
    });
  }

  /* ---------- 售后(pages/order/{apply-service,after-service-list,after-service-detail,fill-tracking-no,delivery-detail}
   * 源 pages/order/common/model/order/*.js 目录缺失、common/services/order/applyService.js require 该路径即断 →
   * mock 按各页面与 after-service-button-bar 消费字段自建,以订单 mock 为底(金额统一分口径)
   * 列表/详情共享内存态 store:申请→详情、撤销→关闭 立即可见(源 mock 静态 resp,web 端让其形成可演示闭环) ---------- */
  var AS_CDN = 'https://tdesign.gtimg.com/miniprogram/template/retail/';
  var AS_STORE = null;
  var AS_SEQ = 1010;
  function asFindOrder(orderNo) {
    return genOrderList().filter(function (o) { return o.orderNo === orderNo; })[0];
  }
  /** 订单内 sku 行(预览/提交共用);缺省回落商品池首项(同订单详情页 fallback 语义) */
  function asSkuRow(orderNo, skuId) {
    var row = null;
    var order = asFindOrder(orderNo);
    if (order) {
      for (var i = 0; i < order.orderItemVOs.length; i++) {
        if (String(order.orderItemVOs[i].skuId) === String(skuId)) { row = order.orderItemVOs[i]; break; }
      }
    }
    if (row) return row;
    var g = MOCK.getGoodsList()[0];
    var first = (g.specList || [])[0] || {};
    first = (first.specValueList || [])[0] || {};
    return {
      skuId: skuId != null ? skuId : '88880000',
      spuId: g.spuId,
      goodsPictureUrl: g.primaryImage,
      goodsName: g.title,
      specifications: first.specValue ? [{ specValue: first.specValue }] : [],
      actualPrice: Math.max(0, Number(g.minSalePrice) || 0),
      buyQuantity: 1,
    };
  }
  function asRightsRefund(desc, amount) {
    return {
      channel: '微信支付', channelTrxNo: '123123', refundDesc: desc || '', memo: '无摘要',
      refundAmount: amount || 0, refundStatus: 1, traceNo: '123123',
      createTime: '', requestTime: '', callbackTime: '', successTime: '', updateTime: '',
    };
  }
  function asLogisticsVO(conf) {
    conf = conf || {};
    return {
      logisticsType: 1, logisticsNo: conf.logisticsNo || '', logisticsStatus: null,
      logisticsCompanyCode: conf.companyCode || '', logisticsCompanyName: conf.companyName || '',
      remark: conf.remark || '',
      receiverName: '周杰伦', receiverPhone: '18371736717',
      receiverProvince: '广东省', receiverCity: '深圳市', receiverCountry: '南山区',
      receiverArea: '', receiverAddress: '清风路御龙湾',
      senderName: '刘德华', senderPhone: '1273109238123',
      senderAddress: '北京市昌平区大丰家园三号楼四单元108号',
      expectArrivalTime: null, sendTime: null, arrivalTime: null,
      nodes: conf.nodes || [],
    };
  }
  /** 退货物流轨迹(源 after-service-list mock 三节点;日期改为相对当下,避免展示 2020 老日期) */
  function asLogisticsNodes() {
    var DAY = 24 * 3600 * 1000;
    var t = Date.now();
    return [
      { title: '已签收', icon: AS_CDN + 'icon/order.png', code: '200003', desc: '商家已签收，感谢使用顺丰，期待再次为您服务', date: '' + (t - 2 * DAY) },
      { title: '运输中', icon: AS_CDN + 'icon/deliver.png', code: '200002', desc: '快件已到达成都中转站', date: '' + (t - 3 * DAY) },
      { title: '已寄出', icon: AS_CDN + 'icon/deliver.png', code: '200002', desc: '买家已寄出，物流承运商：顺丰速运', date: '' + (t - 3 * DAY - 3600 * 1000) },
    ].map(function (n) {
      var d = new Date(Number(n.date));
      var p2 = function (v) { return v < 10 ? '0' + v : '' + v; };
      n.date = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) +
        ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
      return n;
    });
  }
  /** 组装一条售后记录:rights(主单)+ rightsItem + buttonVOs + 附属 VO(字段对齐 after-service-list api.js resp) */
  function asEntry(conf) {
    var row = conf.row || {};
    var unit = row.actualPrice != null ? row.actualPrice : 888;
    var qty = conf.rightsQuantity || 1;
    var t = conf.time != null ? conf.time : Date.now();
    var item = {
      goodsPictureUrl: row.goodsPictureUrl || AS_CDN + 'goods/nz-09a.png',
      goodsName: row.goodsName || '小米手机',
      specInfo: (row.specifications || []).map(function (s) { return { specTitle: '', specValues: s.specValue }; }),
      skuId: row.skuId != null ? row.skuId : 812312, actualPrice: unit,
      itemRefundAmount: unit, rightsQuantity: qty,
      itemTotalAmount: unit * qty, itemStatus: 2,
      disconutInfo: '现在下单，立刻优惠100元',
    };
    return {
      saasId: '8888', storeId: '2591', uid: '88881046205', createTime: '' + t,
      storeName: conf.storeName || '千乡优选旗舰店',
      rights: {
        rightsNo: conf.rightsNo, orderNo: conf.orderNo,
        storeName: conf.storeName || '千乡优选旗舰店',
        rightsType: conf.rightsType == null ? 20 : conf.rightsType,
        bizRightsStatus: 1, bizRightsStatusName: '退款退货',
        rightsStatus: conf.rightsStatus, rightsStatusName: conf.rightsStatusName || '',
        userRightsStatus: conf.userStatus, userRightsStatusName: conf.userName || '',
        userRightsStatusDesc: conf.userDesc || '',
        refundAmount: conf.refundAmount != null ? conf.refundAmount : unit * qty,
        refundRequestAmount: conf.refundRequestAmount != null ? conf.refundRequestAmount : unit * qty,
        rightsMethod: 1, rightsParentNo: '78970',
        rightsReasonDesc: conf.reasonDesc || '太贵了，不想要了',
        rightsReasonType: conf.reasonType != null ? conf.reasonType : 10,
        rightsImageUrls: conf.images || [],
        afterSaleRequireType: conf.rightsType === 20 ? 'REFUND_MONEY' : 'REFUND_GOODS_MONEY',
        shippingFee: 99, shippingFeeBear: 1, saasId: 123, storeId: 123, uid: '123',
        createTime: '' + t, updateTime: '' + t,
      },
      rightsItem: [item],
      rightsRefund: asRightsRefund(conf.refundDesc, conf.refundRequestAmount != null ? conf.refundRequestAmount : unit * qty),
      buttonVOs: conf.buttons || [],
      refundMethodList: conf.refundMethods || null,
      logisticsVO: asLogisticsVO(conf.logistics),
    };
  }
  /** 售后记录池(固定 9 条 + 页面申请新增;状态/按钮/凭证覆盖 detail 各展示分支) */
  function asStore() {
    if (AS_STORE) return AS_STORE;
    var DAY = 24 * 3600 * 1000;
    var now = Date.now();
    function entry(orderNo, skuId, conf) {
      var row = asSkuRow(orderNo, skuId);
      conf = conf || {};
      conf.orderNo = orderNo; conf.row = row;
      var order = asFindOrder(orderNo);
      conf.storeName = (order && order.storeName) || '千乡优选旗舰店';
      conf.time = now - (conf.ago || 1) * DAY;
      return asEntry(conf);
    }
    var refundMethods = [
      { refundMethodName: '微信支付', refundMethodAmount: 99999 },
      { refundMethodName: '银行卡支付', refundMethodAmount: 100000 },
    ];
    var s1 = entry('202609031200000101', '88880000', {
      ago: 9, rightsNo: '123123423', rightsType: 20,
      rightsStatus: 50, rightsStatusName: '已完成',
      userStatus: 160, userName: '已退款', userDesc: '退款/售后已完成',
      refundMethods: refundMethods, refundDesc: '由于您信誉良好，商家同意退款',
      buttons: [], rightsQuantity: 1, reasonDesc: '太贵了，不想要了', reasonType: 10,
    });
    var s2 = entry('202609020020000102', '88880006', {
      ago: 6, rightsNo: '1231234231', rightsType: 10,
      rightsStatus: 20, rightsStatusName: '已审核',
      userStatus: 120, userName: '商家已审核', userDesc: '商家已审核确认，请尽快寄回商品',
      buttons: [orderButton(4, '修改运单号', false), orderButton(5, '查看物流', false)],
      logistics: { logisticsNo: 'SF2380380982034', companyName: '顺丰', nodes: asLogisticsNodes() },
    });
    var s3 = entry('202609020020000102', '88880007', {
      ago: 3, rightsNo: '1231234232', rightsType: 10,
      rightsStatus: 20, rightsStatusName: '已审核',
      userStatus: 120, userName: '商家已审核', userDesc: '商家已审核确认，请尽快寄回商品并填写运单号',
      buttons: [orderButton(3, '填写运单号', false)],
    });
    var s4 = entry('202609030500000106', '88880002', {
      ago: 1, rightsNo: '1231234233', rightsType: 20,
      rightsStatus: 10, rightsStatusName: '待审核',
      userStatus: 100, userName: '待商家审核', userDesc: '商家将在24小时内审核，如24小时后商家仍未审核，系统将自动审核通过',
      buttons: [orderButton(2, '撤销申请', false)], reasonDesc: '不想要了，申请退款',
    });
    var s5 = entry('202609011030000103', '88880001', {
      ago: 5, rightsNo: '1231234234', rightsType: 10,
      rightsStatus: 60, rightsStatusName: '已关闭',
      userStatus: 170, userName: '已关闭', userDesc: '售后申请已撤销',
      buttons: [], reasonDesc: '太贵了，不想要了',
    });
    var s6 = entry('202609011030000103', '88880004', {
      ago: 4, rightsNo: '1231234235', rightsType: 10,
      rightsStatus: 20, rightsStatusName: '已审核',
      userStatus: 120, userName: '商家已审核', userDesc: '商家已审核确认，请尽快寄回商品',
      buttons: [orderButton(4, '修改运单号', false)],
      logistics: { logisticsNo: '90900808', companyName: '申通快递', companyCode: '0002', remark: '质量问题，申请退货退款' },
    });
    var s7 = entry('202609020020000102', '88880006', {
      ago: 2, rightsNo: '1231234236', rightsType: 20,
      rightsStatus: 10, rightsStatusName: '待审核',
      userStatus: 100, userName: '待商家审核', userDesc: '商家将在24小时内审核，如24小时后商家仍未审核，系统将自动审核通过',
      buttons: [orderButton(2, '撤销申请', false)],
      images: [AS_CDN + 'goods/nz-09a.png', AS_CDN + 'goods/nz-09a.png', AS_CDN + 'goods/nz-09a.png', AS_CDN + 'goods/nz-09a.png'],
      refundDesc: '实际商品与描述不符', reasonDesc: '商品与描述不符',
    });
    var s8 = entry('202608310900000104', '88880003', {
      ago: 10, rightsNo: '1231234237', rightsType: 20,
      rightsStatus: 50, rightsStatusName: '已完成',
      userStatus: 160, userName: '已退款', userDesc: '退款/售后已完成',
      refundMethods: refundMethods, refundDesc: '由于您信誉良好，商家同意退款',
      buttons: [], reasonDesc: '协商一致退款',
    });
    var s9 = entry('202608281830000105', '88880008', {
      ago: 8, rightsNo: '1231234238', rightsType: 10,
      rightsStatus: 50, rightsStatusName: '已完成',
      userStatus: 160, userName: '已退款', userDesc: '退款/售后已完成',
      refundMethods: refundMethods, buttons: [], reasonDesc: '商品与描述不符',
    });
    AS_STORE = [s7, s4, s6, s2, s3, s5, s9, s8, s1].reverse();
    return AS_STORE;
  }
  /** 售后预览(apply-service 页 refresh → genRightsPreview 语义;金额与订单行同口径:单元价分*数量 + 运费) */
  function fetchRightsPreview(params) {
    return delay().then(function () {
      var orderNo = params && params.orderNo;
      var skuId = params && params.skuId;
      var row = asSkuRow(orderNo, skuId);
      var order = asFindOrder(orderNo);
      var qty = Math.max(1, Number(params && params.numOfSku) || 1);
      var bought = Math.max(1, Number(row.buyQuantity) || 1);
      var freight = (order && order.freightFee) || 0;
      return {
        data: {
          skuId: row.skuId, spuId: row.spuId,
          goodsInfo: {
            skuImage: row.goodsPictureUrl,
            goodsName: row.goodsName,
            specInfo: (row.specifications || []).map(function (s) { return { specValue: s.specValue }; }),
          },
          paidAmountEach: row.actualPrice, boughtQuantity: bought,
          refundableAmount: row.actualPrice * qty + freight,
          shippingFeeIncluded: freight,
          numOfSku: qty, numOfSkuAvailable: bought,
        },
      };
    });
  }
  function dispatchConfirmReceived() {
    return delay();
  }
  /** 可选售后原因(apply-service 按收货状态 1已收货/2未收到货 拉取;源 genApplyReasonList 缺失自建) */
  function fetchApplyReasonList(params) {
    return delay().then(function () {
      var st = params && params.rightsReasonType;
      var list = st === 2
        ? [
            { id: 20, desc: '快递/包裹一直没有送到' }, { id: 21, desc: '错发/漏发' },
            { id: 22, desc: '快递长时间未更新' }, { id: 23, desc: '其他' },
          ]
        : [
            { id: 10, desc: '质量问题' }, { id: 11, desc: '商品与描述不符' },
            { id: 12, desc: '尺寸拍错/不喜欢' }, { id: 13, desc: '少件/漏发' }, { id: 14, desc: '其他' },
          ];
      return { data: { rightsReasonList: list } };
    });
  }
  /** 发起售后申请:按提交入参生成"待审核"记录并置于 store 顶(申请成功 → 详情可查/列表可刷新) */
  function dispatchApplyService(params) {
    return delay().then(function () {
      var rights = (params && params.rights) || {};
      var item0 = (params && params.rightsItem && params.rightsItem[0]) || {};
      var row = asSkuRow(rights.orderNo, item0.skuId);
      var order = asFindOrder(rights.orderNo);
      /* 源 onApplyOnlyRefund 未置 serviceType → rightsType null;此处归为仅退款,保证落地记录可展示 */
      var type = rights.rightsType === 10 ? 10 : 20;
      var qty = Math.max(1, Number(item0.rightsQuantity) || 1);
      var req = Number(rights.refundRequestAmount);
      if (!(req > 0)) req = row.actualPrice * qty + ((order && order.freightFee) || 0);
      var t = Date.now();
      var entry = asEntry({
        orderNo: rights.orderNo, time: t, rightsNo: '1231' + (AS_SEQ++),
        storeName: (order && order.storeName) || '千乡优选旗舰店',
        row: row, rightsQuantity: qty, rightsType: type,
        rightsStatus: 10, rightsStatusName: '待审核',
        userStatus: 100, userName: '待商家审核',
        userDesc: '商家将在24小时内审核，如24小时后商家仍未审核，系统将自动审核通过',
        reasonDesc: rights.rightsReasonDesc || '', reasonType: rights.rightsReasonType,
        refundRequestAmount: req,
        buttons: [orderButton(2, '撤销申请', false)],
      });
      asStore().unshift(entry);
      return { data: { rightsNo: entry.rights.rightsNo } };
    });
  }
  /** 售后列表(源 getRightsList:pageNum>3 返回空;status -1 全部) */
  function fetchAfterRightsList(params) {
    return delay().then(function () {
      var ps = (params && params.parameter) || {};
      var status = ps.afterServiceStatus;
      var size = ps.pageSize || 10;
      var num = ps.pageNum || 1;
      var all = asStore();
      var hit = (status == null || status === -1) ? all
        : all.filter(function (x) { return x.rights.rightsStatus === status; });
      function cnt(st) {
        return all.filter(function (x) { return x.rights.rightsStatus === st; }).length;
      }
      return {
        data: {
          pageNum: num, pageSize: size, totalCount: hit.length,
          states: { audit: cnt(10), approved: cnt(20), complete: cnt(50), closed: cnt(60) },
          dataList: num > 3 ? [] : hit.slice((num - 1) * size, num * size),
        },
      };
    });
  }
  /** 售后详情(源 getRightsDetail 在固定 resp 里按 rightsNo 过滤;找不到回落首条,防空白) */
  function fetchAfterRightsDetail(rightsNo) {
    return delay().then(function () {
      var hit = asStore().filter(function (x) { return x.rights.rightsNo === rightsNo; })[0];
      return { data: hit || asStore()[0] };
    });
  }
  /** 撤销申请:记录置为已关闭(源 mock 空实现;web 端落地状态,列表刷新可见) */
  function cancelRights(params) {
    return delay().then(function () {
      var hit = asStore().filter(function (x) { return String(x.rights.rightsNo) === String(params && params.rightsNo); })[0];
      if (hit) {
        hit.rights.rightsStatus = 60; hit.rights.rightsStatusName = '已关闭';
        hit.rights.userRightsStatus = 170; hit.rights.userRightsStatusName = '已关闭';
        hit.rights.userRightsStatusDesc = '售后申请已撤销';
        hit.buttonVOs = [];
      }
      return { data: {} };
    });
  }
  /** 填写/修改运单号保存:落地 store 物流信息并切换按钮为 修改+查看物流(fill-tracking-no 返回后详情/列表回显)
   *  源 create/update 均为空实现;web 两端同写 store。页面按源调用:修改态(带 logisticsNo)走 dispatchCreateTracking,新填走 dispatchUpdateTracking */
  function saveTracking(params) {
    return delay().then(function () {
      var hit = asStore().filter(function (x) { return String(x.rights.rightsNo) === String(params && params.rightsNo); })[0];
      if (hit) {
        hit.logisticsVO = asLogisticsVO({
          logisticsNo: params.logisticsNo || '', companyCode: params.logisticsCompanyCode || '',
          companyName: params.logisticsCompanyName || '', remark: params.remark || '',
          nodes: asLogisticsNodes(),
        });
        hit.buttonVOs = [orderButton(4, '修改运单号', false), orderButton(5, '查看物流', false)];
      }
      return { data: {} };
    });
  }
  /** 物流公司(源 fill-tracking-no/api.js getDeliverCompanyList 原样) */
  function fetchDeliverCompanyList() {
    return delay().then(function () {
      return {
        data: [
          { name: '中通快递', code: '0001' }, { name: '申通快递', code: '0002' },
          { name: '圆通快递', code: '0003' }, { name: '顺丰快递', code: '0004' },
          { name: '百世快递', code: '0005' }, { name: '韵达快递', code: '0006' },
          { name: '邮政快递', code: '0007' }, { name: '丰网快递', code: '0008' },
          { name: '顺丰直邮', code: '0009' },
        ],
      };
    });
  }

  window.SVC = {
    fetchHome: fetchHome,
    fetchGoodsList: fetchGoodsList,
    fetchGoodList: fetchGoodList,
    fetchSearchHistory: fetchSearchHistory,
    getCategoryList: getCategoryList,
    fetchUserCenter: fetchUserCenter,
    fetchGoodDetail: fetchGoodDetail,
    fetchActivityList: fetchActivityList,
    fetchDetailComments: fetchDetailComments,
    fetchDetailCommentsCount: fetchDetailCommentsCount,
    fetchComments: fetchComments,
    fetchCommentsCount: fetchCommentsCount,
    fetchSettleDetail: fetchSettleDetail,
    dispatchCommitPay: dispatchCommitPay,
    dispatchSupplementInvoice: dispatchSupplementInvoice,
    fetchPromotion: fetchPromotion,
    fetchAddressList: fetchAddressList,
    fetchAddressDetail: fetchAddressDetail,
    fetchPerson: fetchPerson,
    parseArea: parseArea,
    fetchOrders: fetchOrders,
    fetchOrdersCount: fetchOrdersCount,
    fetchOrderDetail: fetchOrderDetail,
    fetchBusinessTime: fetchBusinessTime,
    fetchCouponList: fetchCouponList,
    fetchCouponDetail: fetchCouponDetail,
    fetchRightsPreview: fetchRightsPreview,
    dispatchConfirmReceived: dispatchConfirmReceived,
    fetchApplyReasonList: fetchApplyReasonList,
    dispatchApplyService: dispatchApplyService,
    fetchAfterRightsList: fetchAfterRightsList,
    fetchAfterRightsDetail: fetchAfterRightsDetail,
    cancelRights: cancelRights,
    fetchDeliverCompanyList: fetchDeliverCompanyList,
    dispatchCreateTracking: saveTracking,
    dispatchUpdateTracking: saveTracking,
    ADDR_SELECT: makeBridge(), // order-confirm 选择地址 ↔ address/list
    ADDR_EDIT: makeBridge(),   // address/list 等待编辑保存 ↔ address/edit
  };
})();
