/* 云监控系统页 /cloud-monitor/index
 * 全屏子应用:iframe 加载 cloud-monitor/index.html(千乡农田AI检测系统,自包含零依赖)。
 * nav:'fullscreen' 使桌面通栏/移动导航均不渲染,页面占满视口;子应用内"返回商城"
 * 经同源 parent.APP.go 回到首页。窄屏无入口,直达链接可访问但不做适配。
 */
(function () {
  APP.reg('/cloud-monitor/index', {
    title: '云监控系统',
    nav: 'fullscreen',
    render: function () {
      return '<iframe class="cms-frame" src="cloud-monitor/index.html" title="云监控系统" ' +
        'style="display:block;border:0;width:100%;height:100vh"></iframe>';
    },
  });
})();
