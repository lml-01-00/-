/* 本文件由小程序 model 层数据自动转换生成,与源码 1:1 对应,请勿手改数据 */
(function (global) {
var mock = {};
const config = {
  /** 是否使用mock代替api返回 */
  useMock: true,
};

const cdnBase =
  'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-mp';

// const images = [
//   {
//     img: 'https://free.picui.cn/free/2026/03/11/69b13c25b89e3.jpg',
//     text: '1',
//   },
//   {
//     img: 'https://free.picui.cn/free/2026/03/11/69b13c256793a.jpg',
//     text: '2',
//   },
//   {
//     img: 'https://free.picui.cn/free/2026/03/11/69b13c256b1d3.jpg',
//     text: '3',
//   },
//   {
//     img: 'https://free.picui.cn/free/2026/03/11/69b13c265230b.jpg',
//     text: '4',
//   },
//   {
//     img: 'https://free.picui.cn/free/2026/03/11/69b13c264a0db.jpg',
//     text: '5',
//   },
//   {
//     img: 'https://free.picui.cn/free/2026/03/11/69b1387e1697d.jpg',
//     text: '6',
//   },
// ];

const images = [
  'https://free.picui.cn/free/2026/03/11/69b13c25b89e3.jpg',
  'https://free.picui.cn/free/2026/03/11/69b13c256793a.jpg',
  'https://free.picui.cn/free/2026/03/11/69b13c256b1d3.jpg',
  'https://free.picui.cn/free/2026/03/11/69b13c265230b.jpg',
  'https://free.picui.cn/free/2026/03/11/69b13c264a0db.jpg',
  'https://free.picui.cn/free/2026/03/11/69b1387e1697d.jpg',
];

function genSwiperImageList() {
  return images;
}

const userInfo = {
  avatarUrl:
    'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-ui/components-exp/avatar/avatar-1.jpg',
  nickName: 'TDesign 🌟',
  phoneNumber: '13438358888',
  gender: 2,
};
const countsData = [
  {
    num: 2,
    name: '积分',
    type: 'point',
  },
  {
    num: 10,
    name: '优惠券',
    type: 'coupon',
  },
];

const orderTagInfos = [
  {
    orderNum: 1,
    tabType: 5,
  },
  {
    orderNum: 1,
    tabType: 10,
  },
  {
    orderNum: 1,
    tabType: 40,
  },
  {
    orderNum: 0,
    tabType: 0,
  },
];

const customerServiceInfo = {
  servicePhone: '4006336868',
  serviceTimeDuration: '每周三至周五 9:00-12:00  13:00-15:00',
};

const genSimpleUserInfo = () => ({ ...userInfo });

const genUsercenter = () => ({
  userInfo,
  countsData,
  orderTagInfos,
  customerServiceInfo,
});

function getCategoryList() {
  return [
    {
      groupId: '24948',
      name: '蔬菜',
      thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
      children: [
        {
          groupId: '249481',
          name: '蔬菜',
          thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
          children: [
            {
              groupId: '249480',
              name: '秒杀',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b1307f12.png',
            },
            {
              groupId: '249480',
              name: '领券',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b19dbc6c.png',
            },
            {
              groupId: '249480',
              name: '满减',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b1bac779.png',
            },
            {
              groupId: '249480',
              name: '根茎类',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b13a880a.png',
            },
            {
              groupId: '249480',
              name: '瓜果类',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16c7dcdfda.png',
            },
            {
              groupId: '249480',
              name: '叶菜类',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16da974a4a.jpg',
            },
            {
              groupId: '249480',
              name: '花菜类',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b1bbe8f2.png',
            },
            {
              groupId: '249480',
              name: '豆类',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b1761e6e.png',
            },
            {
              groupId: '249480',
              name: '菌菇类',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b167eb4a.png',
            },
          ],
        },
      ],
    },
    {
      groupId: '24948',
      name: '共生',
      thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
      children: [
        {
          groupId: '249481',
          name: '共生',
          thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
          children: [
            {
              groupId: '249480',
              name: '蔬菜',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16da974a4a.jpg',
            },
            {
              groupId: '249480',
              name: '家禽',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b13ac6e1.png',
            },
            {
              groupId: '249480',
              name: '认养',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b13a8cbe.png',
            },
          ],
        },
      ],
    },
    {
      groupId: '24948',
      name: '农家乐',
      thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
      children: [
        {
          groupId: '249481',
          name: '农家乐',
          thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
          children: [
            {
              groupId: '249480',
              name: '农事体验',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b1719b4b.png',
            },
            {
              groupId: '249480',
              name: '水果采摘',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16c7dcdfda.png',
            },
            {
              groupId: '249480',
              name: '蔬菜采摘',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b1b94a38.png',
            },
            {
              groupId: '249480',
              name: '其他',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b173b1a9.png',
            },
          ],
        },
      ],
    },
    {
      groupId: '24948',
      name: '家禽',
      thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
      children: [
        {
          groupId: '249481',
          name: '家禽',
          thumbnail: 'https://tdesign.gtimg.com/miniprogram/template/retail/category/category-default.png',
          children: [
            {
              groupId: '249480',
              name: '共生鸡',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b13ac6e1.png',
            },
            {
              groupId: '249480',
              name: '共生鸭',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b13a8cbe.png',
            },
            {
              groupId: '249480',
              name: '其它',
              thumbnail: 'https://free.picui.cn/free/2026/03/11/69b16b1383f32.png',
            },
          ],
        },
      ],
    },
  ];
}

const imgPrefix = cdnBase;

const defaultDesc = [`${imgPrefix}/goods/details-1.png`];

const allGoods = [
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '0',
    title: '顺德地道农家乐远离都市喧嚣尝鲜农家美味赏田园风光尽享悠闲自在好时光',
    primaryImage: 'https://free.picui.cn/free/2026/03/11/69b1387e1697d.jpg',
    images: [
      'https://free.picui.cn/free/2026/03/14/69b501585b952.jpg',
      'https://free.picui.cn/free/2026/03/11/69b1387e12cb0.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: 19800,
    minLinePrice: 29800,
    maxSalePrice: 19800,
    maxLinePrice: 30000,
    spuStockQuantity: 510,
    soldNum: 1020,
    isPutOnSale: 1,
    categoryIds: ['127880527393854975', '127880527393854976', '127880537778953984'],
    specList: [
      {
        specId: '10011',
        title: '种类',
        specValueList: [
          {
            specValueId: '10012',
            specId: null,
            saasId: null,
            specValue: '经典套餐',
            image: null,
          },
        ],
      },
      {
        specId: '10013',
        title: '标准',
        specValueList: [
          {
            specValueId: '11014',
            specId: null,
            saasId: null,
            specValue: '标准1',
            image: null,
          },
          {
            specValueId: '10014',
            specId: null,
            saasId: null,
            specValue: '标准2',
            image: null,
          },
          {
            specValueId: '11013',
            specId: null,
            saasId: null,
            specValue: '标准3',
            image: null,
          },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135676631',
        skuImage: 'https://free.picui.cn/free/2026/03/14/69b501585b952.jpg',
        specInfo: [
          {
            specId: '10011',
            specTitle: null,
            specValueId: '10012',
            specValue: null,
          },
          {
            specId: '10013',
            specTitle: null,
            specValueId: '11014',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '19800', priceTypeName: '销售价' },
          { priceType: 2, price: '30000', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 175,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: '' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676632',
        skuImage: 'https://free.picui.cn/free/2026/03/11/69b1387de1ed4.jpg',
        specInfo: [
          {
            specId: '10011',
            specTitle: null,
            specValueId: '10012',
            specValue: null,
          },
          {
            specId: '10013',
            specTitle: null,
            specValueId: '11013',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '23800', priceTypeName: '销售价' },
          { priceType: 2, price: '30000', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 158,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: '' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681631',
        skuImage: 'https://free.picui.cn/free/2026/03/11/69b1387e12cb0.jpg',
        specInfo: [
          {
            specId: '10011',
            specTitle: null,
            specValueId: '10012',
            specValue: null,
          },
          {
            specId: '10013',
            specTitle: null,
            specValueId: '10014',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '21800', priceTypeName: '销售价' },
          { priceType: 2, price: '30000', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 177,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: '' },
        volume: null,
        profitPrice: null,
      },
    ],
    spuTagList: [{ id: '13001', title: '限时抢购', image: null }],
    limitInfo: [
      {
        text: '限购5份',
      },
    ],
    desc: [
      'https://free.picui.cn/free/2026/03/11/69b1387e12cb0.jpg',
      'https://free.picui.cn/free/2026/03/11/69b1387e12cb0.jpg',
    ],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135686633',
    title: '【现拔】胡萝卜脆甜新鲜自家农家乐自种植蔬菜胡萝卜新鲜绯红胡萝卜应季蔬菜',
    primaryImage: 'https://free.picui.cn/free/2026/03/11/69b16952ac54c.jpg',
    minSalePrice: '01370',
    minLinePrice: '01620',
    maxSalePrice: '01370',
    maxLinePrice: '01620',
    isSoldOut: false,
    images: [
      'https://free.picui.cn/free/2026/03/11/69b16952ac54c.jpg',
      'https://free.picui.cn/free/2026/03/11/69b16952be538.jpg',
      'https://free.picui.cn/free/2026/03/11/69b169529cc42.jpg',
    ],
    groupIdList: ['15029', '14023'],
    spuTagList: [
      {
        id: null,
        title: '绯红萝卜',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135686634',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '绯红',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '10003',
            specValue: '2KG',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '01250',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '01250',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691631',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '胡萝卜',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11003',
            specValue: '1KG',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '01270',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '01370',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 177,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691632',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '胡萝卜',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11002',
            specValue: '3KG',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '01270',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '01270',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 194,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    isAvailable: 1,
    spuStockQuantity: 371,
    soldNum: 1032,
    isPutOnSale: 1,
    specList: [
      {
        specId: '10000',
        title: '共生',
        specValueList: [
          {
            specValueId: '10001',
            specId: '10000',
            saasId: '88888888',
            specValue: '共生胡萝卜',
            image: '',
          },
        ],
      },
      {
        specId: '10002',
        title: '重量',
        specValueList: [
          {
            specValueId: '11003',
            specId: '10002',
            saasId: '88888888',
            specValue: '0.9KG',
            image: '',
          },
          {
            specValueId: '10003',
            specId: '10002',
            saasId: '88888888',
            specValue: '2.5KG',
            image: '',
          },
          {
            specValueId: '11002',
            specId: '10002',
            saasId: '88888888',
            specValue: '4.5KG',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
    desc: [
      'https://free.picui.cn/free/2026/03/11/69b169529cc42.jpg',
      'https://free.picui.cn/free/2026/03/11/69b16952be538.jpg',
    ],
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135691628',
    title: '《五彩圆椒》辣椒灯笼椒红黄绿水果甜椒蔬菜当季柿子椒不辣',
    images: [
      'https://free.picui.cn/free/2026/05/19/6a0c0e878dbde.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c0e87a186d.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c0e87eb992.jpg',
      'https://free.picui.cn/free/2026/03/11/69b169b3d6f8f.jpg',
    ],
    primaryImage: 'https://free.picui.cn/free/2026/03/11/69b169b3d6f8f.jpg',
    minSalePrice: '01570',
    minLinePrice: '01720',
    maxSalePrice: '01570',
    maxLinePrice: '01720',
    isSoldOut: true,
    groupIdList: ['15029', '14023'],
    spuTagList: [
      {
        id: null,
        title: '共生蔬菜',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135686631',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: '红色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862494014208',
            specValue: '共生',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '01570',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '01790',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135686632',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: '黄色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: '共生',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '01350',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '01530',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691629',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: '随机',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: '共生',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '01430',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '01790',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    isAvailable: 1,
    spuStockQuantity: 0,
    soldNum: 1022,
    isPutOnSale: 1,
    specList: [
      {
        specId: '127904180600844800',
        title: '种类',
        specValueList: [
          {
            specValueId: '127904180768617216',
            specId: '127904180600844800',
            saasId: '88888888',
            specValue: '甜椒',
            image: '',
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '重量',
        specValueList: [
          {
            specValueId: '127904862494014208',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '0.5KG',
            image: '',
          },
          {
            specValueId: '127904862175246592',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '1KG',
            image: '',
          },
          {
            specValueId: '127904862007474176',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '2KG',
            image: '',
          },
          {
            specValueId: '127904861755815680',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '2.5KG',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
    desc: [
      'https://free.picui.cn/free/2026/05/19/6a0c0e87a186d.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c0e87a186d.jpg',
    ],
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135686623',
    title: '东莞特色农家乐钓鱼鲫鱼鲈鱼多鱼种任钓现钓现烹柴火灶尝鲜体验',
    primaryImage: 'https://free.picui.cn/free/2026/03/11/69b169ef3543e.jpg',
    images: [
      'https://free.picui.cn/free/2026/05/19/6a0c11ff56b26.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c11ff6adb3.jpg',
    ],
    minSalePrice: '9900',
    minLinePrice: '16900',
    maxSalePrice: '10900',
    maxLinePrice: '16900',
    isSoldOut: false,
    groupIdList: [
      '15029',
      '15030',
      '14023',
      '127886731843219200',
      '127886732665303040',
      '127886733101511680',
      '127886733923595520',
      '14025',
      '127886726071855616',
      '14026',
      '127886727481142784',
      '127886731440566784',
    ],
    spuTagList: [
      {
        id: null,
        title: '养生系列',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135686624',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '经典套餐',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '10003',
            specValue: '尊贵套装',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 98,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135686625',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '11000',
            specValue: '组合1',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11003',
            specValue: '组合2',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135686626',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '11000',
            specValue: '组合3',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11002',
            specValue: '组合4',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691622',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '套餐1',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11003',
            specValue: '1小时',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691623',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '2小时',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11002',
            specValue: '3小时',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '10900',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691624',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '11000',
            specValue: '4小时',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '10003',
            specValue: '5小时',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    isAvailable: 1,
    spuStockQuantity: 598,
    soldNum: 102,
    isPutOnSale: 1,
    desc: [
      'https://free.picui.cn/free/2026/05/19/6a0c11ff56b26.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c11ff6adb3.jpg',
    ],
    specList: [
      {
        specId: '10000',
        title: '时长',
        specValueList: [
          {
            specValueId: '10001',
            specId: '10000',
            saasId: '88888888',
            specValue: '2小时',
            image: '',
          },
          {
            specValueId: '11000',
            specId: '10000',
            saasId: '88888888',
            specValue: '3小时',
            image: '',
          },
        ],
      },
      {
        specId: '10002',
        title: '套餐',
        specValueList: [
          {
            specValueId: '11003',
            specId: '10002',
            saasId: '88888888',
            specValue: '经典套装',
            image: '',
          },
          {
            specValueId: '10003',
            specId: '10002',
            saasId: '88888888',
            specValue: '尊贵套装',
            image: '',
          },
          {
            specValueId: '11002',
            specId: '10002',
            saasId: '88888888',
            specValue: '尊享嘉年华',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681628',
    title: '新鲜蔬菜混合装西红柿黄瓜尖椒圆椒茄子胡萝卜农家组合装现摘现送新鲜蔬菜',
    primaryImage: 'https://free.picui.cn/free/2026/03/11/69b16a2cda516.jpg',
    images: [
      'https://free.picui.cn/free/2026/03/11/69b16a2cda516.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c142e3ad19.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c1439ed53f.jpg',
    ],
    minSalePrice: '02310',
    minLinePrice: '03220',
    maxSalePrice: '02310',
    maxLinePrice: '03220',
    isSoldOut: false,
    groupIdList: [
      '14023',
      '127886732245873408',
      '127886733487386880',
      '14025',
      '127886726071855616',
      '14026',
      '127886728420666112',
      '127886728957538048',
      '127886729779621888',
      '127886730165497088',
      '127886730652037376',
      '127886731037912576',
      '127886731440566784',
      '127886729360190464',
      '15029',
      '15030',
    ],
    spuTagList: [
      {
        id: null,
        title: '限时抢购',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135676629',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: '超值组合',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: '混合1',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '2310',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '03220',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 80,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676630',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: '经典组合',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: '组合1',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '02310',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '03310',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 122,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681629',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: '随机套餐',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: '组合1',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '01750',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '01630',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 119,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: [
      'https://free.picui.cn/free/2026/05/19/6a0c142e3ad19.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c1439ed53f.jpg',
    ],
    isAvailable: 1,
    spuStockQuantity: 321,
    soldNum: 102,
    isPutOnSale: 1,
    specList: [
      {
        specId: '127904180600844800',
        title: '种类',
        specValueList: [
          {
            specValueId: '127904181322265856',
            specId: '127904180600844800',
            saasId: '88888888',
            specValue: '混合',
            image: '',
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '重量',
        specValueList: [
          {
            specValueId: '127904862175246592',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '1KG',
            image: '',
          },
          {
            specValueId: '127904862007474176',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '2KG',
            image: '',
          },
          {
            specValueId: '127904861755815680',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '3KG',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681626',
    title: '【共生产出】地道田园蔬菜混合装多种时令鲜蔬一站式配齐无农残不催熟',
    primaryImage: 'https://free.picui.cn/free/2026/05/19/6a0c142e3ad19.jpg',
    images: [
      'https://free.picui.cn/free/2026/05/19/6a0c142e3ad19.jpg',
      'https://free.picui.cn/free/2026/06/10/6a295bd3b153e.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c2957be26c.jpg',
    ],
    minSalePrice: '02430',
    minLinePrice: '03120',
    maxSalePrice: '02430',
    maxLinePrice: '03120',
    isSoldOut: false,
    groupIdList: [
      '15029',
      '15030',
      '14023',
      '127886732245873408',
      '127886733487386880',
      '14025',
      '127886726071855616',
      '14026',
      '127886728420666112',
      '127886728957538048',
      '127886730652037376',
      '127886731037912576',
    ],
    spuTagList: [
      {
        id: null,
        title: '限时抢购',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135676627',
        skuImage: null,
        specInfo: [
          {
            specId: '10006',
            specTitle: null,
            specValueId: '10007',
            specValue: '混合',
          },
          {
            specId: '11007',
            specTitle: null,
            specValueId: '10009',
            specValue: '组合1',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '02430',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '03120',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 123,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676628',
        skuImage: null,
        specInfo: [
          {
            specId: '10006',
            specTitle: null,
            specValueId: '10007',
            specValue: '混合',
          },
          {
            specId: '11007',
            specTitle: null,
            specValueId: '10008',
            specValue: '礼盒装',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '02420',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '03760',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 123,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681627',
        skuImage: null,
        specInfo: [
          {
            specId: '10006',
            specTitle: null,
            specValueId: '10007',
            specValue: '混合',
          },
          {
            specId: '11007',
            specTitle: null,
            specValueId: '11008',
            specValue: '组合2',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '02420',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '03410',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 120,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: [
      'https://free.picui.cn/free/2026/05/19/6a0c2957bd37a.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c2957be26c.jpg',
    ],
    isAvailable: 1,
    spuStockQuantity: 366,
    soldNum: 102,
    isPutOnSale: 1,
    specList: [
      {
        specId: '10006',
        title: '属性',
        specValueList: [
          {
            specValueId: '10007',
            specId: '10006',
            saasId: '88888888',
            specValue: '混合',
            image: '',
          },
        ],
      },
      {
        specId: '11007',
        title: '共生',
        specValueList: [
          {
            specValueId: '10009',
            specId: '11007',
            saasId: '88888888',
            specValue: '组合1',
            image: '',
          },
          {
            specValueId: '11008',
            specId: '11007',
            saasId: '88888888',
            specValue: '组合2',
            image: '',
          },
          {
            specValueId: '10008',
            specId: '11007',
            saasId: '88888888',
            specValue: '礼盒装',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681622',
    title: '【共生养殖】老母鸡散养走地鸡鸡肉新鲜溜达鸡农村土鸡柴鸡整只',
    primaryImage: 'https://free.picui.cn/free/2026/03/11/69b16ab77d112.jpg',
    images: [
      'https://free.picui.cn/free/2026/03/11/69b16ab77d112.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c2b4949780.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c2b4a1e356.jpg',
    ],
    minSalePrice: '06720',
    minLinePrice: '05130',
    maxSalePrice: '06720',
    maxLinePrice: '05130',
    isSoldOut: false,
    desc: [
      'https://free.picui.cn/free/2026/03/11/69b16ab77d112.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c2b4a1e356.jpg',
    ],
    groupIdList: [
      '14023',
      '127886732665303040',
      '127886733101511680',
      '127886733923595520',
      '14025',
      '127886726071855616',
      '14026',
      '127886728957538048',
      '127886727481142784',
      '127886729779621888',
      '127886730165497088',
      '127886730652037376',
      '127886731440566784',
      '127886729360190464',
      '15029',
      '15030',
    ],
    spuTagList: [
      {
        id: null,
        title: '掌柜热卖',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135676623',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181506815488',
            specValue: '共生',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: '土鸡',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '04630',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '05820',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 119,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676624',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181506815488',
            specValue: '土鸡',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: '共生',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '04630',
            priceTypeName: '销售价',
          },
          {
            priceType: 2,
            price: '05820',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 116,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    isAvailable: 1,
    spuStockQuantity: 357,
    soldNum: 23102,
    isPutOnSale: 1,
    specList: [
      {
        specId: '127904180600844800',
        title: '类型',
        specValueList: [
          {
            specValueId: '127904181506815488',
            specId: '127904180600844800',
            saasId: '88888888',
            specValue: '土鸡',
            image: '',
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '类型',
        specValueList: [
          {
            specValueId: '127904862175246592',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '2.5KG',
            image: '',
          },
          {
            specValueId: '127904862007474176',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '3KG',
            image: '',
          },
          {
            specValueId: '127904861755815680',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '4KG',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681624',
    title: '【共生鸭】麻鸭绿壳蛋鸭快下蛋麻鸭双蛋黄活鸭脱温麻鸭水鸭土鸭',
    primaryImage: 'https://free.picui.cn/free/2026/05/19/6a0c2f54455a8.jpg',
    images: [
      'https://free.picui.cn/free/2026/05/19/6a0c2f54455a8.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c2f54429d6.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c2f541d508.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '07620',
    minLinePrice: '08350',
    maxSalePrice: '07620',
    maxLinePrice: '08350',
    spuStockQuantity: 0,
    soldNum: 102,
    isPutOnSale: 1,
    categoryIds: ['127880527393854975', '127880527393854977', '127880526789875961'],
    specList: [
      {
        specId: '127904180600844800',
        title: '类型',
        specValueList: [
          {
            specValueId: '127904180768617216',
            specId: null,
            saasId: null,
            specValue: '活鸭',
            image: null,
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '重量',
        specValueList: [
          {
            specValueId: '127904862175246592',
            specId: null,
            saasId: null,
            specValue: '4KG',
            image: null,
          },
          {
            specValueId: '127904862007474176',
            specId: null,
            saasId: null,
            specValue: '5KG',
            image: null,
          },
          {
            specValueId: '127904861755815680',
            specId: null,
            saasId: null,
            specValue: '6KG',
            image: null,
          },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135676625',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '07620', priceTypeName: '销售价' },
          { priceType: 2, price: '08530', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676626',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '07620', priceTypeName: '销售价' },
          { priceType: 2, price: '08530', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681625',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '07620', priceTypeName: '销售价' },
          { priceType: 2, price: '08530', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
    ],
    spuTagList: [{ id: '19011', title: '2026共生', image: null }],
    spuLimitList: null,
    desc: [
      'https://free.picui.cn/free/2026/05/19/6a0c2f54429d6.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c2f54455a8.jpg',
    ],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681630',
    title: '【共生荔枝】现摘新鲜荔枝妃子笑当季荔枝新鲜水果桂味黑叶白糖罂',
    primaryImage: 'https://free.picui.cn/free/2026/05/19/6a0c3209af1d9.jpg',
    images: ['https://free.picui.cn/free/2026/05/19/6a0c320965647.jpg'],
    video: null,
    available: 1,
    minSalePrice: '03020',
    minLinePrice: '03640',
    maxSalePrice: '03020',
    maxLinePrice: '03640',
    spuStockQuantity: 321,
    soldNum: 103,
    isPutOnSale: 1,
    categoryIds: ['127880527393854975', '127880527393854977', '127880526789875961'],
    specList: [
      {
        specId: '127904180600844800',
        title: '款式',
        specValueList: [
          {
            specValueId: '127904181322265856',
            specId: null,
            saasId: null,
            specValue: '荔枝',
            image: null,
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '属性',
        specValueList: [
          {
            specValueId: '127904862175246592',
            specId: null,
            saasId: null,
            specValue: '30.4/5斤',
            image: null,
          },
          {
            specValueId: '127904862007474176',
            specId: null,
            saasId: null,
            specValue: '22.8/3斤',
            image: null,
          },
          {
            specValueId: '127904861755815680',
            specId: null,
            saasId: null,
            specValue: '中果21.8/3斤',
            image: null,
          },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135676629',
        skuImage: 'https://free.picui.cn/free/2026/05/19/6a0c320965647.jpg',
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '03280', priceTypeName: '销售价' },
          { priceType: 2, price: '03860', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 80,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676630',
        skuImage: 'https://free.picui.cn/free/2026/05/19/6a0c3209b13d7.jpg',
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '03250', priceTypeName: '销售价' },
          { priceType: 2, price: '03850', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 122,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681629',
        skuImage: 'https://free.picui.cn/free/2026/05/19/6a0c320965647.jpg',
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '03240', priceTypeName: '销售价' },
          { priceType: 2, price: '03620', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 119,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
    ],
    spuTagList: [{ id: '13001', title: '限时抢购', image: null }],
    spuLimitList: null,
    desc: [
      'https://free.picui.cn/free/2026/05/19/6a0c3209b13d7.jpg',
      'https://free.picui.cn/free/2026/05/19/6a0c320965647.jpg',
    ],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135700001',
    title: '【现摘】沙瓤西红柿酸甜多汁番茄新鲜蔬菜农家自种现摘现发家庭常备',
    primaryImage: 'https://free.picui.cn/free/2026/06/10/6a295c7824af0.jpg',
    images: [
      'https://free.picui.cn/free/2026/06/10/6a295c7835ca2.jpg',
      'https://free.picui.cn/free/2026/06/10/6a295c7848154.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '01480',
    minLinePrice: '01580',
    maxSalePrice: '02180',
    maxLinePrice: '02680',
    spuStockQuantity: 420,
    soldNum: 1680,
    isPutOnSale: 1,
    isSoldOut: false,
    groupIdList: ['15029', '14023'],
    spuTagList: [{ id: null, title: '共生蔬菜', image: null }],
    specList: [
      {
        specId: '20000',
        title: '共生',
        specValueList: [{ specValueId: '20001', specId: '20000', saasId: '88888888', specValue: '共生番茄', image: '' }],
      },
      {
        specId: '20002',
        title: '重量',
        specValueList: [
          { specValueId: '20003', specId: '20002', saasId: '88888888', specValue: '1KG', image: '' },
          { specValueId: '20004', specId: '20002', saasId: '88888888', specValue: '3KG', image: '' },
          { specValueId: '20005', specId: '20002', saasId: '88888888', specValue: '5KG', image: '' },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135700011',
        skuImage: null,
        specInfo: [
          { specId: '20000', specTitle: null, specValueId: '20001', specValue: '共生番茄' },
          { specId: '20002', specTitle: null, specValueId: '20003', specValue: '1KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '01480', priceTypeName: '销售价' },
          { priceType: 2, price: '01580', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 180, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700012',
        skuImage: null,
        specInfo: [
          { specId: '20000', specTitle: null, specValueId: '20001', specValue: '共生番茄' },
          { specId: '20002', specTitle: null, specValueId: '20004', specValue: '3KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '01880', priceTypeName: '销售价' },
          { priceType: 2, price: '02380', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 140, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700013',
        skuImage: null,
        specInfo: [
          { specId: '20000', specTitle: null, specValueId: '20001', specValue: '共生番茄' },
          { specId: '20002', specTitle: null, specValueId: '20005', specValue: '5KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '02180', priceTypeName: '销售价' },
          { priceType: 2, price: '02680', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 100, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: ['https://free.picui.cn/free/2026/06/10/6a295c7824af0.jpg', 'https://free.picui.cn/free/2026/06/10/6a295c7848154.jpg'],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135700002',
    title: '【现摘】脆嫩黄瓜清爽多汁农家自种应季鲜蔬凉拌炒食皆宜现摘现发',
    primaryImage: 'https://free.picui.cn/free/2026/06/10/6a295e24193d6.jpg',
    images: [
      'https://free.picui.cn/free/2026/06/10/6a295e2434923.jpg',
      'https://free.picui.cn/free/2026/06/10/6a295e2407684.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '01190',
    minLinePrice: '01490',
    maxSalePrice: '02090',
    maxLinePrice: '02490',
    spuStockQuantity: 520,
    soldNum: 1426,
    isPutOnSale: 1,
    isSoldOut: false,
    groupIdList: ['15029', '14023'],
    spuTagList: [{ id: null, title: '共生蔬菜', image: null }],
    specList: [
      {
        specId: '20010',
        title: '共生',
        specValueList: [{ specValueId: '20011', specId: '20010', saasId: '88888888', specValue: '共生黄瓜', image: '' }],
      },
      {
        specId: '20012',
        title: '重量',
        specValueList: [
          { specValueId: '20013', specId: '20012', saasId: '88888888', specValue: '1KG', image: '' },
          { specValueId: '20014', specId: '20012', saasId: '88888888', specValue: '2KG', image: '' },
          { specValueId: '20015', specId: '20012', saasId: '88888888', specValue: '4KG', image: '' },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135700021',
        skuImage: null,
        specInfo: [
          { specId: '20010', specTitle: null, specValueId: '20011', specValue: '共生黄瓜' },
          { specId: '20012', specTitle: null, specValueId: '20013', specValue: '1KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '01190', priceTypeName: '销售价' },
          { priceType: 2, price: '01490', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 230, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700022',
        skuImage: null,
        specInfo: [
          { specId: '20010', specTitle: null, specValueId: '20011', specValue: '共生黄瓜' },
          { specId: '20012', specTitle: null, specValueId: '20014', specValue: '2KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '01650', priceTypeName: '销售价' },
          { priceType: 2, price: '02050', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 180, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700023',
        skuImage: null,
        specInfo: [
          { specId: '20010', specTitle: null, specValueId: '20011', specValue: '共生黄瓜' },
          { specId: '20012', specTitle: null, specValueId: '20015', specValue: '4KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '02090', priceTypeName: '销售价' },
          { priceType: 2, price: '02490', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 110, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: ['https://free.picui.cn/free/2026/06/10/6a295e2407684.jpg', 'https://free.picui.cn/free/2026/06/10/6a295e24193d6.jpg'],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135700003',
    title: '【共生茄子】紫皮长茄软糯少籽家常必备新鲜茄子农家自种新鲜蔬菜现摘现发',
    primaryImage: 'https://free.picui.cn/free/2026/06/10/6a29631807634.jpg',
    images: [
      'https://free.picui.cn/free/2026/06/10/6a2963180f95a.jpg',
      'https://free.picui.cn/free/2026/06/10/6a29631823ace.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '01360',
    minLinePrice: '01760',
    maxSalePrice: '02260',
    maxLinePrice: '02860',
    spuStockQuantity: 380,
    soldNum: 986,
    isPutOnSale: 1,
    isSoldOut: false,
    groupIdList: ['15029', '14023'],
    spuTagList: [{ id: null, title: '共生蔬菜', image: null }],
    specList: [
      {
        specId: '20020',
        title: '共生',
        specValueList: [{ specValueId: '20021', specId: '20020', saasId: '88888888', specValue: '共生茄子', image: '' }],
      },
      {
        specId: '20022',
        title: '重量',
        specValueList: [
          { specValueId: '20023', specId: '20022', saasId: '88888888', specValue: '1KG', image: '' },
          { specValueId: '20024', specId: '20022', saasId: '88888888', specValue: '2KG', image: '' },
          { specValueId: '20025', specId: '20022', saasId: '88888888', specValue: '4KG', image: '' },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135700031',
        skuImage: null,
        specInfo: [
          { specId: '20020', specTitle: null, specValueId: '20021', specValue: '共生茄子' },
          { specId: '20022', specTitle: null, specValueId: '20023', specValue: '1KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '01360', priceTypeName: '销售价' },
          { priceType: 2, price: '01760', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 160, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700032',
        skuImage: null,
        specInfo: [
          { specId: '20020', specTitle: null, specValueId: '20021', specValue: '共生茄子' },
          { specId: '20022', specTitle: null, specValueId: '20024', specValue: '2KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '01880', priceTypeName: '销售价' },
          { priceType: 2, price: '02380', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 130, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700033',
        skuImage: null,
        specInfo: [
          { specId: '20020', specTitle: null, specValueId: '20021', specValue: '共生茄子' },
          { specId: '20022', specTitle: null, specValueId: '20025', specValue: '4KG' },
        ],
        priceInfo: [
          { priceType: 1, price: '02260', priceTypeName: '销售价' },
          { priceType: 2, price: '02860', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 90, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: ['https://free.picui.cn/free/2026/06/10/6a29631823ace.jpg', 'https://free.picui.cn/free/2026/06/10/6a2963180f95a.jpg'],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135700004',
    title: '【现摘】甜玉米颗粒饱满清甜多汁农家自种鲜玉米新鲜蔬菜蒸煮皆宜',
    primaryImage: 'https://free.picui.cn/free/2026/06/10/6a296850a3989.jpg',
    images: [
      'https://free.picui.cn/free/2026/06/10/6a296850a385e.jpg',
      'https://free.picui.cn/free/2026/06/10/6a296850b916c.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '01490',
    minLinePrice: '01990',
    maxSalePrice: '02690',
    maxLinePrice: '03390',
    spuStockQuantity: 300,
    soldNum: 760,
    isPutOnSale: 1,
    isSoldOut: false,
    groupIdList: ['15029', '14023'],
    spuTagList: [{ id: null, title: '当季新鲜', image: null }],
    specList: [
      {
        specId: '20030',
        title: '共生',
        specValueList: [{ specValueId: '20031', specId: '20030', saasId: '88888888', specValue: '共生玉米', image: '' }],
      },
      {
        specId: '20032',
        title: '规格',
        specValueList: [
          { specValueId: '20033', specId: '20032', saasId: '88888888', specValue: '5穗', image: '' },
          { specValueId: '20034', specId: '20032', saasId: '88888888', specValue: '10穗', image: '' },
          { specValueId: '20035', specId: '20032', saasId: '88888888', specValue: '15穗', image: '' },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135700041',
        skuImage: null,
        specInfo: [
          { specId: '20030', specTitle: null, specValueId: '20031', specValue: '共生玉米' },
          { specId: '20032', specTitle: null, specValueId: '20033', specValue: '5穗' },
        ],
        priceInfo: [
          { priceType: 1, price: '01490', priceTypeName: '销售价' },
          { priceType: 2, price: '01990', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 120, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700042',
        skuImage: null,
        specInfo: [
          { specId: '20030', specTitle: null, specValueId: '20031', specValue: '共生玉米' },
          { specId: '20032', specTitle: null, specValueId: '20034', specValue: '10穗' },
        ],
        priceInfo: [
          { priceType: 1, price: '02190', priceTypeName: '销售价' },
          { priceType: 2, price: '02890', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 110, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700043',
        skuImage: null,
        specInfo: [
          { specId: '20030', specTitle: null, specValueId: '20031', specValue: '共生玉米' },
          { specId: '20032', specTitle: null, specValueId: '20035', specValue: '15穗' },
        ],
        priceInfo: [
          { priceType: 1, price: '02690', priceTypeName: '销售价' },
          { priceType: 2, price: '03390', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 70, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: ['https://free.picui.cn/free/2026/06/10/6a296850b916c.jpg', 'https://free.picui.cn/free/2026/06/10/6a296850a385e.jpg'],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135700005',
    title: '【共生养殖】土鸡蛋散养新鲜鸡蛋营养早餐优选柴鸡蛋农家直供30枚装',
    primaryImage: 'https://free.picui.cn/free/2026/06/10/6a2969220748c.jpg',
    images: [
      'https://free.picui.cn/free/2026/06/10/6a296921db2cf.jpg',
      'https://free.picui.cn/free/2026/06/10/6a2969220d331.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '03980',
    minLinePrice: '04980',
    maxSalePrice: '06880',
    maxLinePrice: '07980',
    spuStockQuantity: 260,
    soldNum: 5120,
    isPutOnSale: 1,
    isSoldOut: false,
    groupIdList: ['15029', '14023', '14026'],
    spuTagList: [{ id: null, title: '共生养殖', image: null }],
    specList: [
      {
        specId: '20040',
        title: '类型',
        specValueList: [{ specValueId: '20041', specId: '20040', saasId: '88888888', specValue: '土鸡蛋', image: '' }],
      },
      {
        specId: '20042',
        title: '规格',
        specValueList: [
          { specValueId: '20043', specId: '20042', saasId: '88888888', specValue: '10枚', image: '' },
          { specValueId: '20044', specId: '20042', saasId: '88888888', specValue: '20枚', image: '' },
          { specValueId: '20045', specId: '20042', saasId: '88888888', specValue: '30枚', image: '' },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135700051',
        skuImage: null,
        specInfo: [
          { specId: '20040', specTitle: null, specValueId: '20041', specValue: '土鸡蛋' },
          { specId: '20042', specTitle: null, specValueId: '20043', specValue: '10枚' },
        ],
        priceInfo: [
          { priceType: 1, price: '03980', priceTypeName: '销售价' },
          { priceType: 2, price: '04980', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 120, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700052',
        skuImage: null,
        specInfo: [
          { specId: '20040', specTitle: null, specValueId: '20041', specValue: '土鸡蛋' },
          { specId: '20042', specTitle: null, specValueId: '20044', specValue: '20枚' },
        ],
        priceInfo: [
          { priceType: 1, price: '05680', priceTypeName: '销售价' },
          { priceType: 2, price: '06980', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 90, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700053',
        skuImage: null,
        specInfo: [
          { specId: '20040', specTitle: null, specValueId: '20041', specValue: '土鸡蛋' },
          { specId: '20042', specTitle: null, specValueId: '20045', specValue: '30枚' },
        ],
        priceInfo: [
          { priceType: 1, price: '06880', priceTypeName: '销售价' },
          { priceType: 2, price: '07980', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 50, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: ['https://free.picui.cn/free/2026/06/10/6a2969220d331.jpg', 'https://free.picui.cn/free/2026/06/10/6a296921db2cf.jpg'],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135700006',
    title: '【共生鸭蛋】麻鸭散养鸭蛋新鲜鸭蛋营养蛋白早餐必备咸蛋皮蛋都适合',
    primaryImage: 'https://free.picui.cn/free/2026/06/10/6a2969db565df.jpg',
    images: [
      'https://free.picui.cn/free/2026/06/10/6a2969db23ae3.jpg',
      'https://free.picui.cn/free/2026/06/10/6a2969db4139b.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '04280',
    minLinePrice: '05280',
    maxSalePrice: '07280',
    maxLinePrice: '08280',
    spuStockQuantity: 240,
    soldNum: 2890,
    isPutOnSale: 1,
    isSoldOut: false,
    groupIdList: ['15029', '14023', '14026'],
    spuTagList: [{ id: null, title: '共生养殖', image: null }],
    specList: [
      {
        specId: '20050',
        title: '类型',
        specValueList: [{ specValueId: '20051', specId: '20050', saasId: '88888888', specValue: '鸭蛋', image: '' }],
      },
      {
        specId: '20052',
        title: '规格',
        specValueList: [
          { specValueId: '20053', specId: '20052', saasId: '88888888', specValue: '12枚', image: '' },
          { specValueId: '20054', specId: '20052', saasId: '88888888', specValue: '24枚', image: '' },
          { specValueId: '20055', specId: '20052', saasId: '88888888', specValue: '36枚', image: '' },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135700061',
        skuImage: null,
        specInfo: [
          { specId: '20050', specTitle: null, specValueId: '20051', specValue: '鸭蛋' },
          { specId: '20052', specTitle: null, specValueId: '20053', specValue: '12枚' },
        ],
        priceInfo: [
          { priceType: 1, price: '04280', priceTypeName: '销售价' },
          { priceType: 2, price: '05280', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 110, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700062',
        skuImage: null,
        specInfo: [
          { specId: '20050', specTitle: null, specValueId: '20051', specValue: '鸭蛋' },
          { specId: '20052', specTitle: null, specValueId: '20054', specValue: '24枚' },
        ],
        priceInfo: [
          { priceType: 1, price: '05980', priceTypeName: '销售价' },
          { priceType: 2, price: '07180', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 80, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700063',
        skuImage: null,
        specInfo: [
          { specId: '20050', specTitle: null, specValueId: '20051', specValue: '鸭蛋' },
          { specId: '20052', specTitle: null, specValueId: '20055', specValue: '36枚' },
        ],
        priceInfo: [
          { priceType: 1, price: '07280', priceTypeName: '销售价' },
          { priceType: 2, price: '08280', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 50, safeStockQuantity: 0, soldQuantity: 0 },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: ['https://free.picui.cn/free/2026/06/10/6a2969db4139b.jpg', 'https://free.picui.cn/free/2026/06/10/6a2969db23ae3.jpg'],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135700007',
    title: '【现摘】当季草莓香甜多汁新鲜水果农家自种现摘现发礼盒装送礼自吃都合适',
    primaryImage: 'https://free.picui.cn/free/2026/06/10/6a296b73cdf15.jpg',
    images: [
      'https://free.picui.cn/free/2026/06/10/6a296b72b039a.jpg',
      'https://free.picui.cn/free/2026/06/10/6a296b72907d5.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '02880',
    minLinePrice: '03680',
    maxSalePrice: '05680',
    maxLinePrice: '06680',
    spuStockQuantity: 180,
    soldNum: 930,
    isPutOnSale: 1,
    isSoldOut: false,
    groupIdList: ['15029', '14023'],
    spuTagList: [{ id: null, title: '当季水果', image: null }],
    specList: [
      {
        specId: '20060',
        title: '款式',
        specValueList: [{ specValueId: '20061', specId: '20060', saasId: '88888888', specValue: '草莓', image: '' }],
      },
      {
        specId: '20062',
        title: '规格',
        specValueList: [
          { specValueId: '20063', specId: '20062', saasId: '88888888', specValue: '500g', image: '' },
          { specValueId: '20064', specId: '20062', saasId: '88888888', specValue: '1kg', image: '' },
          { specValueId: '20065', specId: '20062', saasId: '88888888', specValue: '礼盒2kg', image: '' },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135700071',
        skuImage: null,
        specInfo: [
          { specId: '20060', specTitle: null, specValueId: '20061', specValue: '草莓' },
          { specId: '20062', specTitle: null, specValueId: '20063', specValue: '500g' },
        ],
        priceInfo: [
          { priceType: 1, price: '02880', priceTypeName: '销售价' },
          { priceType: 2, price: '03680', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 70, safeStockQuantity: 0, soldQuantity: 0 },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700072',
        skuImage: null,
        specInfo: [
          { specId: '20060', specTitle: null, specValueId: '20061', specValue: '草莓' },
          { specId: '20062', specTitle: null, specValueId: '20064', specValue: '1kg' },
        ],
        priceInfo: [
          { priceType: 1, price: '03980', priceTypeName: '销售价' },
          { priceType: 2, price: '04880', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 60, safeStockQuantity: 0, soldQuantity: 0 },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700073',
        skuImage: null,
        specInfo: [
          { specId: '20060', specTitle: null, specValueId: '20061', specValue: '草莓' },
          { specId: '20062', specTitle: null, specValueId: '20065', specValue: '礼盒2kg' },
        ],
        priceInfo: [
          { priceType: 1, price: '05680', priceTypeName: '销售价' },
          { priceType: 2, price: '06680', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 50, safeStockQuantity: 0, soldQuantity: 0 },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
    ],
    desc: ['https://free.picui.cn/free/2026/06/10/6a296b72907d5.jpg', 'https://free.picui.cn/free/2026/06/10/6a296b73cdf15.jpg'],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135700008',
    title: '【共生柑橘】当季砂糖橘皮薄易剥酸甜适口新鲜水果农家直采家庭分享装',
    primaryImage: 'https://free.picui.cn/free/2026/06/10/6a296bfc88df2.jpg',
    images: [
      'https://free.picui.cn/free/2026/06/10/6a296bfd22eb9.jpg',
      'https://free.picui.cn/free/2026/06/10/6a296bfd8ba33.jpg',
    ],
    video: null,
    available: 1,
    minSalePrice: '01980',
    minLinePrice: '02580',
    maxSalePrice: '03880',
    maxLinePrice: '04680',
    spuStockQuantity: 210,
    soldNum: 1240,
    isPutOnSale: 1,
    isSoldOut: false,
    groupIdList: ['15029', '14023'],
    spuTagList: [{ id: null, title: '当季水果', image: null }],
    specList: [
      {
        specId: '20070',
        title: '款式',
        specValueList: [{ specValueId: '20071', specId: '20070', saasId: '88888888', specValue: '砂糖橘', image: '' }],
      },
      {
        specId: '20072',
        title: '重量',
        specValueList: [
          { specValueId: '20073', specId: '20072', saasId: '88888888', specValue: '2斤', image: '' },
          { specValueId: '20074', specId: '20072', saasId: '88888888', specValue: '5斤', image: '' },
          { specValueId: '20075', specId: '20072', saasId: '88888888', specValue: '10斤', image: '' },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135700081',
        skuImage: null,
        specInfo: [
          { specId: '20070', specTitle: null, specValueId: '20071', specValue: '砂糖橘' },
          { specId: '20072', specTitle: null, specValueId: '20073', specValue: '2斤' },
        ],
        priceInfo: [
          { priceType: 1, price: '01980', priceTypeName: '销售价' },
          { priceType: 2, price: '02580', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 80, safeStockQuantity: 0, soldQuantity: 0 },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700082',
        skuImage: null,
        specInfo: [
          { specId: '20070', specTitle: null, specValueId: '20071', specValue: '砂糖橘' },
          { specId: '20072', specTitle: null, specValueId: '20074', specValue: '5斤' },
        ],
        priceInfo: [
          { priceType: 1, price: '02980', priceTypeName: '销售价' },
          { priceType: 2, price: '03680', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 70, safeStockQuantity: 0, soldQuantity: 0 },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135700083',
        skuImage: null,
        specInfo: [
          { specId: '20070', specTitle: null, specValueId: '20071', specValue: '砂糖橘' },
          { specId: '20072', specTitle: null, specValueId: '20075', specValue: '10斤' },
        ],
        priceInfo: [
          { priceType: 1, price: '03880', priceTypeName: '销售价' },
          { priceType: 2, price: '04680', priceTypeName: '划线价格' },
        ],
        stockInfo: { stockQuantity: 60, safeStockQuantity: 0, soldQuantity: 0 },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
    ],
    desc: ['https://free.picui.cn/free/2026/06/10/6a296bfd22eb9.jpg', 'https://free.picui.cn/free/2026/06/10/6a296bfd8ba33.jpg'],
    etitle: '',
  },
];

/**
 * 旧的 mock 数据曾被错误编码污染，部分字段出现了乱码、缺省值和重复 ID。
 * 这里在导出前做统一归一化，避免商品详情、规格选择和价格渲染拿到脏数据。
 */
const DEFAULT_AVAILABLE = 1;

function buildSpecValueMap(specList = []) {
  return specList.reduce((map, spec) => {
    (spec.specValueList || []).forEach((specValue) => {
      if (specValue && specValue.specValueId) {
        map[specValue.specValueId] = specValue.specValue || '';
      }
    });
    return map;
  }, {});
}

function normalizeSpecList(specList = []) {
  return specList.map((spec) => ({
    ...spec,
    title: (spec && spec.title) || '',
    specValueList: (spec.specValueList || []).map((specValue) => ({
      ...specValue,
      specValue: (specValue && specValue.specValue) || '',
      image: (specValue && specValue.image) || '',
    })),
  }));
}

function normalizePriceInfo(priceInfo = []) {
  return priceInfo.map((price) => ({
    ...price,
    priceTypeName:
      (price && price.priceTypeName) || ((price && price.priceType) === 2 ? '划线价格' : '销售价'),
  }));
}

function normalizeSkuList(skuList = [], specValueMap = {}) {
  return skuList.map((sku) => {
    const stockQuantity = Math.max(0, Number((sku && sku.stockInfo && sku.stockInfo.stockQuantity) || 0));

    return {
      ...sku,
      specInfo: (sku.specInfo || []).map((spec) => ({
        ...spec,
        // 以 specValueId 对应的规格值为准，修正历史数据里展示值和映射值不一致的问题。
        specValue: specValueMap[spec.specValueId] || spec.specValue || '',
      })),
      priceInfo: normalizePriceInfo(sku.priceInfo || []),
      stockInfo: {
        ...sku.stockInfo,
        stockQuantity,
      },
      weight: sku.weight
        ? {
            ...sku.weight,
            unit: sku.weight.unit || '',
          }
        : null,
    };
  });
}

function normalizeGood(rawGood, { spuId, available } = {}) {
  const specList = normalizeSpecList(rawGood.specList || []);
  const specValueMap = buildSpecValueMap(specList);
  const skuList = normalizeSkuList(rawGood.skuList || [], specValueMap);
  const images = (rawGood.images || []).filter(Boolean);
  const desc = (rawGood.desc || []).filter(Boolean);
  const resolvedAvailable =
    typeof available === 'number'
      ? available
      : Number(rawGood.available != null ? rawGood.available : rawGood.isAvailable != null ? rawGood.isAvailable : DEFAULT_AVAILABLE);

  return {
    ...rawGood,
    spuId: spuId || String(rawGood.spuId),
    available: Number.isFinite(resolvedAvailable) ? resolvedAvailable : DEFAULT_AVAILABLE,
    isAvailable: Number.isFinite(resolvedAvailable) ? resolvedAvailable : DEFAULT_AVAILABLE,
    primaryImage: rawGood.primaryImage || images[0] || desc[0] || '',
    images: images.length ? images : [rawGood.primaryImage].filter(Boolean),
    desc: desc.length ? desc : defaultDesc,
    specList,
    skuList,
    spuTagList: (rawGood.spuTagList || []).map((tag) => ({
      ...tag,
      title: (tag && tag.title) || '',
    })),
    limitInfo: (rawGood.limitInfo || []).map((limit) => ({
      ...limit,
      text: (limit && limit.text) || '',
    })),
    spuStockQuantity: Math.max(
      0,
      Number(
        rawGood.spuStockQuantity != null
          ? rawGood.spuStockQuantity
          : skuList.reduce(
              (total, sku) => total + Number((sku && sku.stockInfo && sku.stockInfo.stockQuantity) || 0),
              0,
            ),
      ),
    ),
  };
}

const goodsById = new Map(allGoods.map((good) => [String(good.spuId), good]));
const goodsBySkuId = new Map(
  allGoods.flatMap((good) =>
    (Array.isArray(good.skuList) ? good.skuList : []).map((sku) => [String(sku.skuId), good]),
  ),
);

/**
 * @param {string|number} id
 * @param {number} [available] 库存, 默认沿用商品自身配置
 */
function genGood(id, available) {
  const idStr = String(id);
  const matchedGood = goodsById.get(idStr) || goodsBySkuId.get(idStr);

  if (matchedGood) {
    return normalizeGood(matchedGood, { available });
  }

  const numericId = Number(idStr);
  const safeIndex = Number.isFinite(numericId) && allGoods.length ? Math.abs(numericId) % allGoods.length : 0;
  return normalizeGood(allGoods[safeIndex], {
    spuId: idStr,
    available,
  });
}

function toPriceNumber(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function buildGoodsSearchText(good = {}) {
  return [
    good.title || '',
    good.etitle || '',
    ...(Array.isArray(good.spuTagList) ? good.spuTagList.map((item) => item.title || '') : []),
    ...(Array.isArray(good.specList)
      ? good.specList.flatMap((spec) => [
          spec.title || '',
          ...(Array.isArray(spec.specValueList) ? spec.specValueList.map((value) => value.specValue || '') : []),
        ])
      : []),
  ]
    .join(' ')
    .toLowerCase();
}

function includesAnyKeyword(text, keywords = []) {
  return keywords.some((keyword) => text.includes(String(keyword).toLowerCase()));
}

function isVegetableGood(text) {
  return includesAnyKeyword(text, [
    '蔬菜',
    '胡萝卜',
    '萝卜',
    '番茄',
    '西红柿',
    '黄瓜',
    '茄子',
    '玉米',
    '辣椒',
    '圆椒',
    '甜椒',
    '青菜',
    '花菜',
    '菜花',
    '豆角',
    '菌菇',
    '蘑菇',
  ]);
}

function isFruitGood(text) {
  return includesAnyKeyword(text, ['水果', '草莓', '荔枝', '砂糖橘', '柑橘', '橘']);
}

function isPoultryGood(text) {
  return includesAnyKeyword(text, ['家禽', '土鸡', '鸡', '鸭', '鸡蛋', '鸭蛋']);
}

function isFarmExperienceGood(text) {
  return includesAnyKeyword(text, ['农家乐', '农事', '体验', '采摘', '钓鱼', '田园']);
}

function matchTopCategory(text, topCategory) {
  if (!topCategory) {
    return true;
  }
  if (topCategory === '蔬菜') {
    return isVegetableGood(text);
  }
  if (topCategory === '共生') {
    return includesAnyKeyword(text, ['共生']);
  }
  if (topCategory === '农家乐') {
    return isFarmExperienceGood(text);
  }
  if (topCategory === '家禽') {
    return isPoultryGood(text);
  }
  return includesAnyKeyword(text, [topCategory]);
}

function matchCategory(good, categoryName = '', categoryPath = '') {
  if (!categoryName && !categoryPath) {
    return true;
  }
  const text = buildGoodsSearchText(good);
  const pathSegments = categoryPath ? categoryPath.split('>').filter(Boolean) : [];
  const topCategory = pathSegments[0] || categoryName;

  switch (categoryName) {
    case '蔬菜':
      return topCategory === '共生' ? includesAnyKeyword(text, ['共生']) && isVegetableGood(text) : isVegetableGood(text);
    case '共生':
      return includesAnyKeyword(text, ['共生']);
    case '家禽':
      return topCategory === '共生' ? includesAnyKeyword(text, ['共生']) && isPoultryGood(text) : isPoultryGood(text);
    case '根茎类':
      return includesAnyKeyword(text, ['胡萝卜', '萝卜', '根茎']);
    case '瓜果类':
      return includesAnyKeyword(text, ['黄瓜', '番茄', '西红柿', '茄子', '辣椒', '圆椒', '甜椒']);
    case '叶菜类':
      return includesAnyKeyword(text, ['叶菜', '青菜', '生菜', '白菜', '菠菜', '菜心']);
    case '花菜类':
      return includesAnyKeyword(text, ['花菜', '菜花', '西兰花']);
    case '豆类':
      return includesAnyKeyword(text, ['豆类', '豆角', '豆']);
    case '菌菇类':
      return includesAnyKeyword(text, ['菌菇', '蘑菇', '香菇', '金针菇', '平菇', '杏鲍菇']);
    case '认养':
      return includesAnyKeyword(text, ['认养']);
    case '农事体验':
      return includesAnyKeyword(text, ['农事', '体验', '农家乐']);
    case '水果采摘':
      return isFruitGood(text) || includesAnyKeyword(text, ['采摘']);
    case '蔬菜采摘':
      return isVegetableGood(text) || includesAnyKeyword(text, ['采摘']);
    case '共生鸡':
      return includesAnyKeyword(text, ['共生', '鸡']);
    case '共生鸭':
      return includesAnyKeyword(text, ['共生', '鸭']);
    case '秒杀':
    case '领券':
    case '满减':
      return matchTopCategory(text, topCategory);
    case '其他':
    case '其它':
      return matchTopCategory(text, topCategory);
    default:
      return includesAnyKeyword(text, [categoryName]) || matchTopCategory(text, topCategory);
  }
}

function sortGoodsList(list, sort, sortType) {
  if (Number(sort) !== 1) {
    return list;
  }
  const nextList = [...list];
  nextList.sort((prev, next) => {
    const prevPrice = toPriceNumber(prev.minSalePrice);
    const nextPrice = toPriceNumber(next.minSalePrice);
    return Number(sortType) === 1 ? nextPrice - prevPrice : prevPrice - nextPrice;
  });
  return nextList;
}

function getGoodsList(limit = allGoods.length) {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, Number(limit)) : allGoods.length;
  return allGoods.slice(0, safeLimit).map((item) => normalizeGood(item));
}

function queryGoodsList(params = {}) {
  const {
    keyword = '',
    minPrice = 0,
    maxPrice,
    sort = 0,
    sortType = 0,
    pageNum = 1,
    pageSize = 30,
    categoryName = '',
    categoryPath = '',
  } = params;

  let goodsList = getGoodsList(allGoods.length);
  const normalizedKeyword = String(keyword).trim().toLowerCase();

  if (normalizedKeyword) {
    goodsList = goodsList.filter((item) => buildGoodsSearchText(item).includes(normalizedKeyword));
  }

  if (categoryName || categoryPath) {
    goodsList = goodsList.filter((item) => matchCategory(item, categoryName, categoryPath));
  }

  if (Number(minPrice) > 0) {
    goodsList = goodsList.filter((item) => toPriceNumber(item.minSalePrice) >= Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    goodsList = goodsList.filter((item) => toPriceNumber(item.minSalePrice) <= Number(maxPrice));
  }

  goodsList = sortGoodsList(goodsList, sort, sortType);

  const safePageNum = Math.max(1, Number(pageNum) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 30);
  const start = (safePageNum - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    saasId: null,
    storeId: null,
    pageNum: safePageNum,
    pageSize: safePageSize,
    totalCount: goodsList.length,
    spuList: goodsList.slice(start, end),
    algId: 0,
  };
}


/**
 * @param {number} sort
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {number} minPrice
 * @param {number} maxPrice
 * @param {string} keyword
 */

function getSearchHistory() {
  return {
    historyWords: [
      '鸡',
      '蔬菜',
      '共生',
      '旅游计划',
      '佛山农家乐',
      '共生养殖',
      '原浆古井贡酒',
      '青菜',
      '莲花白',
      '土鸭',
      '土鸡',
      '农家自生产',
    ],
  };
}

function getSearchPopular() {
  return {
    popularWords: [
      '鸡',
      '蔬菜',
      '共生',
      '旅游计划',
      '佛山农家乐',
      '共生养殖',
      '原浆古井贡酒',
      '青菜',
      '莲花白',
      '土鸭',
      '土鸡',
      '农家自生产',
    ],
  };
}

function getSearchResult(params = {}) {
  return queryGoodsList(params);
}

function getActivity(id = 0) {
  const isReduce = id % 2 === 0;
  return {
    promotionId: id,
    promotionSubCode: isReduce ? 'MYJ' : 'MZK',
    promotionName: isReduce ? '满100元减10元' : '满2件享9折',
    label: isReduce ? '满100元减10元' : '满2件享9折',
  };
}


function getActivityList(baseID = 0, length = 10) {
  return new Array(length).fill(0).map((_, idx) => getActivity(idx + baseID));
}

const activityList = getActivityList();

function getGoodsDetailsComments() {
  return {
    homePageComments: [
      {
        spuId: '1722045',
        skuId: null,
        specInfo: null,
        commentContent:
          '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentScore: 4,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl:
          'https://wx.qlogo.cn/mmopen/vi_32/5mKrvn3ibyDNaDZSZics3aoKlz1cv0icqn4EruVm6gKjsK0xvZZhC2hkUkRWGxlIzOEc4600JkzKn9icOLE6zjgsxw/132',
      },
    ],
  };
}

function getGoodsDetailsCommentsCount() {
  return {
    commentCount: '47',
    badCount: '0',
    middleCount: '2',
    goodCount: '45',
    hasImageCount: '1',
    goodRate: 95.7,
    uidCount: '0',
  };
}

/**
 *  * @param {number} spuId
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {number} commentsLevel
 * @param {boolean} hasImage
 */
function getGoodsAllComments(params) {
  const { hasImage } = params.queryParameter;
  if (hasImage) {
    return {
      pageNum: 1,
      pageSize: 10,
      totalCount: '1',
      pageList: [
        {
          spuId: '1722045',
          skuId: '0',
          specInfo: '',
          commentContent: '收到货了，试了一下，特别好吃，大爱大爱。棒棒!',
          commentResources: [
            {
              src: 'https://free.picui.cn/free/2026/03/14/69b4ff615e705.jpg',
              type: 'image',
            },
            {
              src: 'https://free.picui.cn/free/2026/06/10/6a2977186a984.jpg',
              type: 'video',
              coverSrc: 'https://free.picui.cn/free/2026/06/10/6a2977186a984.jpg',
            },
          ],
          commentScore: 4,
          uid: '88881048075',
          userName: '会飞的鱼',
          userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a29771babc16.jpg',
          isAnonymity: false,
          commentTime: '1591953561000',
          isAutoComment: false,
          sellerReply: '亲，你好，我们会联系农户给您一个满意的答复请一定妥善保管好发票',
          goodsDetailInfo: '共生蔬菜',
        },
        {
          spuId: '1722045',
          skuId: '0',
          specInfo: '',
          commentContent: '品质非常好，推荐！！',
          commentResources: [
            {
              src: 'https://free.picui.cn/free/2026/06/10/6a2977380bd41.jpg',
              type: 'image',
            },
          ],
          commentScore: 4,
          uid: '88881048075',
          userName: '穷山海',
          userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a29773830dd8.jpg',
          isAnonymity: false,
          commentTime: '1591953561000',
          isAutoComment: false,
          sellerReply: '共生鸡我们捡起来了好多蛋，好喜欢',
          goodsDetailInfo: '共生鸡',
        },
        {
          spuId: '1722045',
          skuId: '0',
          specInfo: '',
          commentContent: '收到货了，非常喜欢此次的共生产品，这些共生产品给我和家人带去了不一样的体验!',
          commentResources: [
            {
              src: 'https://free.picui.cn/free/2026/06/10/6a2977382a5d3.jpg',
              type: 'image',
            },
          ],
          commentScore: 4,
          uid: '88881048075',
          userName: '叫宵夜',
          userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a2977385ada2.jpg',
          isAnonymity: false,
          commentTime: '1591953561000',
          isAutoComment: false,
          sellerReply: '亲，你好！',
          goodsDetailInfo: '共生蔬菜',
        },
        {
          spuId: '1722045',
          skuId: '0',
          specInfo: '',
          commentContent: '这青菜也太新鲜了！脆嫩得掐得出水，清炒一盘连汤汁都想拌米饭，满口都是原生态的清甜！',
          commentResources: [
            {
              src: 'https://free.picui.cn/free/2026/06/10/6a29773890d1f.jpg',
              type: 'image',
            },
          ],
          commentScore: 4,
          uid: '88881048075',
          userName: '不吃香菜。',
          userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a29773a4a073.jpg',
          isAnonymity: false,
          commentTime: '1591953561000',
          isAutoComment: false,
          sellerReply: '救命！这个萝卜直接封神！咬一口嘎嘣脆，汁水多到爆，凉拌着吃清爽解腻，冬天吃太舒服了！',
          goodsDetailInfo: '彩椒',
        },
      ],
    };
  }
  return {
    pageNum: 1,
    pageSize: 10,
    totalCount: '47',
    pageList: [
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '很不错',
        commentContent: '谁懂啊！这个花菜的口感绝了，脆而不硬，蒜蓉炒完一点都不发柴，吃完一盘还想再来！!',
        commentImageUrls: null,
        commentScore: 1,
        uid: '88881048075',
        userName: '四季随风',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a2977186a984.jpg',
        isAnonymity: false,
        commentTime: '1592224320000',
        isAutoComment: false,
        sellerReply: '挖到宝了！这根茎蔬菜自带泥土香，炖肉的时候放进去，软糯入味，吸满了肉汤的鲜，太下饭！',
        goodsDetailInfo: '辣椒',
      },
      {
        spuId: '1722045',
        skuId: '1697693',
        specInfo: '很适合',
        commentContent: '喜欢喜欢，爱吃爱吃！！',
        commentImageUrls: null,
        commentScore: 1,
        uid: '88881048075',
        userName: '九天210',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a29771babc16.jpg',
        isAnonymity: false,
        commentTime: '1592224320000',
        isAutoComment: false,
        sellerReply: '欢迎回购哦！！',
        goodsDetailInfo: '颜色:纯净白  尺码:S码',
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '新鲜度满分！这菌菇下锅煮两分钟就鲜得掉眉毛，不管是涮火锅还是做汤，鲜味儿直接拉满！!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '诗和远方在...',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a2977380bd41.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
        sellerReply: '亲，谢谢您的支持，我们会做的更好的。',
      },
      {
        spuId: '1722045',
        skuId: '0',
        specInfo: '',
        commentContent: '这豆角也太嫩了吧！一点老筋都没有，干煸完焦香酥脆，配米饭我能多炫两碗！!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: 'panipianlewo',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a29773830dd8.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: false,
        goodsDetailInfo: '豆角',
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '共生',
        commentContent: '这土鸡炖的汤也太鲜了！肉质紧实不柴，鸡皮炖得糯叽叽的，喝一口暖到心窝里，全是小时候的味道！棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '言出法随是也',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a2977382a5d3.jpg',
        isAnonymity: false,
        commentTime: '1592217607000',
        isAutoComment: false,
      },
      {
        spuId: '1722045',
        skuId: '1697693',
        specInfo: '共生',
        commentContent: '谁吃谁夸！这个鸭子处理得超干净，一点腥味都没有，红烧完酱汁裹满每一块肉，啃得停不下来！棒棒!',
        commentImageUrls: null,
        commentScore: 4,
        uid: '88881048075',
        userName: '闰土嫁豪门',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a2977385ada2.jpg',
        isAnonymity: false,
        commentTime: '1592217607000',
        isAutoComment: false,
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '共生',
        commentContent: '闭眼冲！这鸡肉炒出来鲜嫩多汁，哪怕是鸡胸肉都不发柴，简单用葱姜炒炒就香到邻居来敲门！棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '星驰MP5',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a29773890d1f.jpg',
        isAnonymity: false,
        commentTime: '1592205599000',
        isAutoComment: false,
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '共生',
        commentContent: '这鸭肉太绝了！炖得软烂脱骨，一抿就化，汤汁拌饭能连吃三碗，冬天暖身又解馋！棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '仙桃',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a29773a4a073.jpg',
        isAnonymity: false,
        commentTime: '1592188822000',
        isAutoComment: false,
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '共生',
        commentContent: '不愧是农家散养的！肉质就是不一样，紧实有嚼劲，白切蘸点酱油就超香，原汁原味的鲜！棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881055835',
        userName: '微微一笑',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a29788026aea.jpg',
        isAnonymity: false,
        commentTime: '1593792002000',
        isAutoComment: true,
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '共生',
        commentContent: '',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881055835',
        userName: '广东彭于晏',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a2978802274d.jpg',
        isAnonymity: false,
        commentTime: '1593792001000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '新鲜度满分！这菌菇下锅煮两分钟就鲜得掉眉毛，不管是涮火锅还是做汤，鲜味儿直接拉满！!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '诗和远方在...',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/10/6a2977380bd41.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
        sellerReply: '亲，谢谢您的支持，我们会做的更好的。',
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '买的共生的 产品都特别好！！！强烈推荐！！',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '喜欢吃烧烤',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c93157c6.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
        sellerReply: '亲，谢谢您的支持，我们一定好好努力。',
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '在吃的时候就能感觉到没有农药的蔬菜吃起来的口感就是不一样的。',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '离婚带两娃',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c9314eb3.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
        sellerReply: '我我们多采用农家自己种植的方式，危害大大减少哦！',
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '我对食品的要求很高的，有一说一，这里的产品确实做得很不错！!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '羊咩咩',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c931c1a3.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '不多说，直接回购！',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '喜闻乐见',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c93146f6.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '共生出品都是YYDS！',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '今天睡不着',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c933227e.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '超级喜欢，直接梭哈。',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '危险消退',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c962edca.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '这里的菜都适合给我家宝宝做辅食!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '表演法则',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c9623ee0.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '大上分，品味了一下，直接给我给到顶级!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '重生之我要做大老板',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c97187aa.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '我会一直购买的，价格适合，质量也特别高!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '斩杀线下的复活',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c962f818.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '家里有宝宝的可以买共生的蔬菜!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '我不是人机',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c96447b3.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '我种植的共生树，长得非常好，我每天都有在看着！!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '归家',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c9a34754.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '鲜美，呜呜呜!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '学会吃饭',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a367c9a46cbb.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '每次都会买，好吃爱吃',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '多久等得到',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a36819f1c72d.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '哦我哭了，因为太好吃了！！！',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '打死你周扒皮',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a36819f99604.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '都去给我吃，买买买，疯狂回购！',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '太阳日来',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a3681a052cfb.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '我的鼻子是假的，我的眼睛是假的，但它的好吃是真的！',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '月儿弯弯照晴川',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a3681a05aa64.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '美味加一',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '天天开心',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a3681a06f213.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
       {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '爱上!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: '就让往事都随风',
        userHeadUrl: 'https://free.picui.cn/free/2026/06/20/6a3681a06f213.jpg',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
      },
    ],
  };
}

function getGoodsCommentsCount() {
  return {
    commentCount: '47',
    badCount: '0',
    middleCount: '2',
    goodCount: '45',
    hasImageCount: '1',
    goodRate: 95.7,
    uidCount: '0',
  };
}

mock.config = config; mock.cdnBase = cdnBase;
mock.genSwiperImageList = genSwiperImageList;
mock.genUsercenter = genUsercenter;
mock.genSimpleUserInfo = genSimpleUserInfo;
mock.getCategoryList = getCategoryList;
mock.genGood = genGood; mock.getGoodsList = getGoodsList;
mock.queryGoodsList = queryGoodsList;
mock.getSearchResult = getSearchResult; mock.getSearchHistory = getSearchHistory; mock.getSearchPopular = getSearchPopular;
mock.getActivity = getActivity; mock.getActivityList = getActivityList;
mock.getGoodsDetailsComments = getGoodsDetailsComments; mock.getGoodsDetailsCommentsCount = getGoodsDetailsCommentsCount;
mock.getGoodsAllComments = getGoodsAllComments; mock.getGoodsCommentsCount = getGoodsCommentsCount;
global.MOCK = mock;
})(typeof window !== "undefined" ? window : globalThis);