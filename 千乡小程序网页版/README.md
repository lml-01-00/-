# 千乡一链 · 商城网页版(移动壳 1:1 + PC 桌面版 + 云监控系统)

将微信小程序电商 Demo(TDesign Retail 农家乐版)无框架 1:1 转换为纯静态 Web 版并更名 **千乡一链**,在此基础上增加 **≥1024px 自动切换的 PC 桌面版**(正宗电商形态:顶部通栏导航 + 1200px 居中内容 + 多列网格 + 详情/结算双栏),并在桌面通栏嵌入 **云监控系统** 入口(全屏子应用)。无构建、无依赖、无框架,浏览器直接打开即可运行。

**三种形态共存于同一代码库**:窄屏(≤1023px)保持小程序 375px 移动壳零回归;宽屏(≥1024px)由 `pc.css` 覆盖层接管为桌面版;云监控系统为独立深色全屏子应用,仅桌面顶栏入口(窄屏无入口,直达链接仍可访问)。

## 运行

```bash
# 任意静态服务均可(无需后端)
python -m http.server 8118
# 打开 http://127.0.0.1:8118/index.html
```

双击 `index.html` 亦可打开(推荐静态服务,路由/接口体验完整)。

## 结构

```
cloud-monitor/
  index.html    # 云监控系统(千乡农田AI检测系统)全屏子应用:自包含零依赖,含登录/AI实时监控端/农田云检测后台
assets/
  css/
    pc.css        # PC 桌面版覆盖层(@media min-width:1024px;壳层 + 页面级桌面重排 + 云监控全屏规则)
  js/
    core/
      app.js      # 极简 SPA 框架:hash 路由、页面实例缓存、生命周期(init/render/events/show/leave)+ 桌面通栏渲染
      api.js      # mock 数据层:全部接口本地生成(订单 901~906 每次调用重建,删除为本地语义)
      cart.js     # 真购物车数据层(localStorage `app:cart:v1` 持久)+ 通用加购/规格弹层调度
      ui.js       # 微信 API 适配(wx.showToast/showModal/setClipboardData/request 等)
      svc.js      # 服务桥接(SVC.*,含 ADDR_SELECT 页面间选择桥)
      wv.js       # wx 全局填充与 UP 工具(UP.ph:分→元)
    app/pages/**  # 30 个页面,每页独立 IIFE(APP.reg 注册);源页面 + 组件 js/wxml/wxss 合并转写
    app/cloud-monitor/index.js  # 云监控全屏页:iframe 载入子应用(conf.nav='fullscreen',无导航壳)
```

页面间跳转用 hash:`#/pages/order/order-detail/index?orderNo=…`,query 编码规则同微信 `navigateTo`(需 `encodeURIComponent` 的字段先编码)。

## PC 桌面版

- **断点**:`@media (min-width:1024px)`。所有桌面差异收敛在 `assets/css/pc.css` 单文件,不动移动端 375 规则。
- **壳层**:桌面渲染顶部通栏(品牌"千乡一链" + 5 个导航 tab + **云监控入口** + 搜索框 + 购物车入口带角标),移动端 `.navbar/.tabbar-root` 隐藏;页面容器切 1200px 居中。
- **页面形态**:首页/列表/搜索/活动 5 列商品网格;分类页侧栏 + 内容多列;详情页左轮播右信息双栏;结算页左信息右 sticky 金额卡;个人中心 hero 横幅;全屏弹层/底部操作条收拢为 1200 通栏或居中卡。
- **购物车**:源占位页补为真购物车 —— 加购(含多规格 SKU 选择弹层)合并同规格、改数/勾选/删除、勾选合计、"去结算"走 order-confirm 链路,下单成功后按 `cartKeys` 清空;数据 `localStorage` 持久。窄屏同样可用(移动端导航追加小购物车入口)。

## 云监控系统

- 桌面通栏"云监控"按钮进入 `#/cloud-monitor/index`(全屏页,不渲染商城导航壳),页面占满视口 iframe 加载 `cloud-monitor/index.html`(子应用自包含:登录页 + AI实时监控端 + 农田云检测后台,手写 canvas 图表,零外部依赖)。
- 子应用内任一 topbar/登录页均有"返回商城",同源经父级 SPA 回首页;登录态存 `localStorage('cms:auth')`,退出即清除,进出商城免重复登录。
- 改造仅:通栏按钮 + 全屏页注册(app.js `nav:'fullscreen'`)+ pc.css 全屏规则;子应用与商城样式完全隔离。

## 验收(批次 8 更名 + 云监控 · 2026-09-04)

headless Edge + CDP 驱动脚本(`%TEMP%\pc-smoke\`):

| 脚本 | 覆盖 | 结果 |
| --- | --- | --- |
| `probe-cms.js` | 更名断言(通栏"千乡一链"/logo"千")→ 云监控入口 → 全屏页无壳 + iframe 登录 → 4 分屏监控 → 切后台大屏 → 返回商城回首页 → 再进自动登录;双层 0 JS 错误 | 21/21 PASS |
| `pc-sweep.js` | 30 页桌面壳层回归(更名后) | 30/30 PASS |
| `probe-layout.js` | 桌面几何断言回归(更名后) | 37/37 PASS |
| `probe-mobile.js` | 窄屏 390px 回归(更名后,云监控入口不出现) | 40/40 PASS |

## 验收(批次 7 桌面版 · 2026-09-04)

headless Edge + CDP 驱动脚本(`%TEMP%\pc-smoke\`):

| 脚本 | 覆盖 | 结果 |
| --- | --- | --- |
| `pc-sweep.js` | 30 页桌面壳层:通栏渲染 + 无移动壳残留 + 无横向溢出 + 0 JS 错误 | 30/30 PASS |
| `probe-layout.js` | 桌面几何断言:首页 5 列/分类双栏/列表 5 列/详情双栏/结算 sticky 金额卡/个人中心横幅等 11 页 | 37/37 PASS |
| `drive-cart.js` | 购物车链路:详情选规格加购 → 合并数量 → 角标 → 改数/勾选/删除 → 结算 → 下单后清空 → 空态 | 24/24 PASS |
| `probe-mobile.js` | 窄屏 390px 回归:5 tab + 购物车/详情/搜索,375 壳 + 无横向滚动 + 通栏不出现 | 40/40 PASS |

## 验收(批次 6 · 2026-09-04)

headless Edge + CDP 驱动的全站冒烟脚本(位于 `%TEMP%\smoke-b6\`):

| 脚本 | 覆盖 | 结果 |
| --- | --- | --- |
| `sweep.js` | 30 页逐个导航:标题匹配 + 主体关键词 + 0 页面 JS 错误 | 30/30 PASS |
| `driver.js` | tabbar→个人中心→优惠券链;列表/详情删除同步;倒计时走秒与超时态;售后/发票/物流入口;ADDR_SELECT 改地址回填 | 18/18 PASS |
| `drive-settle.js` | 结算链:确认页→选券 45% 重算(13.70→7.53)→换地址券 1:1 重置→提交支付→重入选券再支付(缓存实例复位) | 9/9 PASS |
| `drive-buy.js` | 真实点击链:首页卡→详情→SKU 弹层选规格→立即购买→结算→支付 | 6/6 PASS |

## 保留的源语义(非缺陷)

- **购物车为自由新增**(原 Demo 购物车未实现):mock 无购物车接口,数据自存 localStorage、下单为本地语义,无 1:1 约束。
- **订单删除为本地语义**:mock 每次调用重建订单,刷新后订单重现(源 Demo 同:无持久后端)。
- **结算换地址后优惠券重置**:源 1:1 —— 换址重算请求不带 couponList。
- **支付成功页无真实支付**:mock 固定成功(单/拼团可配置)。
- 首页展示价与 sku 实际价存在 mock 数据差异(展示价非 sku 价),为数据层现象。

## 批次 6 修复记录

1. `order-confirm` 缓存实例重入不复位 → 加 `reinitOnQuery` + init 复位 + 支付成功重入重载(对齐微信 navigateTo 新实例)。
2. `order-detail` 删除订单不同步列表 → 确认后过滤缓存列表实例数据。
3. `pay-result` 不同 query 复用旧数据 → 加 `reinitOnQuery`。
4. `goods/details` SKU 规格库存重算 `reduce` 空初值致 `a.concat` 抛错、选规格完全失效 → 对齐源组件无初值交集写法。
5. 首页商品价 ×100 显示(漏分→元换算)→ `fmtPrice` 补 `/100`。
