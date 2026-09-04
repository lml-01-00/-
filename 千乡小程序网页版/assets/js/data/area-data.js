/* 省市区数据(替代源 pages/user/common/area.js:该文件 20k 行且为 GBK 乱码,不可直接复用)
 * 结构对齐源 cascader options:{label, value, children[]}。演示覆盖常用省 + 全部源 mock 地址路径
 * (甘肃/兰州/甘南州碌曲县、微信导入 mock 的 广东/广州/天河)。label 值(value)与民政部代码一致。
 */
(function () {
  var areaData = [
    { label: '北京市', value: '110000', children: [
      { label: '北京市', value: '110100', children: [
        { label: '东城区', value: '110101' }, { label: '西城区', value: '110102' },
        { label: '朝阳区', value: '110105' }, { label: '海淀区', value: '110108' },
        { label: '丰台区', value: '110106' } ] } ] },
    { label: '上海市', value: '310000', children: [
      { label: '上海市', value: '310100', children: [
        { label: '黄浦区', value: '310101' }, { label: '徐汇区', value: '310104' },
        { label: '静安区', value: '310106' }, { label: '闵行区', value: '310112' },
        { label: '浦东新区', value: '310115' } ] } ] },
    { label: '广东省', value: '440000', children: [
      { label: '广州市', value: '440100', children: [
        { label: '越秀区', value: '440104' }, { label: '海珠区', value: '440105' },
        { label: '天河区', value: '440106' }, { label: '白云区', value: '440111' },
        { label: '番禺区', value: '440113' } ] },
      { label: '深圳市', value: '440300', children: [
        { label: '罗湖区', value: '440303' }, { label: '福田区', value: '440304' },
        { label: '南山区', value: '440305' }, { label: '宝安区', value: '440306' } ] },
      { label: '佛山市', value: '440600', children: [
        { label: '禅城区', value: '440604' }, { label: '南海区', value: '440605' },
        { label: '顺德区', value: '440606' } ] } ] },
    { label: '浙江省', value: '330000', children: [
      { label: '杭州市', value: '330100', children: [
        { label: '上城区', value: '330102' }, { label: '拱墅区', value: '330105' },
        { label: '西湖区', value: '330106' }, { label: '滨江区', value: '330108' } ] },
      { label: '宁波市', value: '330200', children: [
        { label: '海曙区', value: '330203' }, { label: '江北区', value: '330205' },
        { label: '镇海区', value: '330211' }, { label: '鄞州区', value: '330212' } ] } ] },
    { label: '江苏省', value: '320000', children: [
      { label: '南京市', value: '320100', children: [
        { label: '玄武区', value: '320102' }, { label: '秦淮区', value: '320104' },
        { label: '建邺区', value: '320105' }, { label: '鼓楼区', value: '320106' } ] },
      { label: '苏州市', value: '320500', children: [
        { label: '虎丘区', value: '320505' }, { label: '吴中区', value: '320506' },
        { label: '相城区', value: '320507' }, { label: '姑苏区', value: '320508' } ] } ] },
    { label: '山东省', value: '370000', children: [
      { label: '济南市', value: '370100', children: [
        { label: '历下区', value: '370102' }, { label: '市中区', value: '370103' },
        { label: '槐荫区', value: '370104' }, { label: '天桥区', value: '370105' } ] },
      { label: '青岛市', value: '370200', children: [
        { label: '市南区', value: '370202' }, { label: '市北区', value: '370203' },
        { label: '崂山区', value: '370212' } ] } ] },
    { label: '福建省', value: '350000', children: [
      { label: '福州市', value: '350100', children: [
        { label: '鼓楼区', value: '350102' }, { label: '台江区', value: '350103' },
        { label: '仓山区', value: '350104' }, { label: '晋安区', value: '350111' } ] },
      { label: '厦门市', value: '350200', children: [
        { label: '思明区', value: '350203' }, { label: '湖里区', value: '350206' },
        { label: '集美区', value: '350211' } ] } ] },
    { label: '湖南省', value: '430000', children: [
      { label: '长沙市', value: '430100', children: [
        { label: '芙蓉区', value: '430102' }, { label: '天心区', value: '430103' },
        { label: '岳麓区', value: '430104' }, { label: '开福区', value: '430105' } ] },
      { label: '株洲市', value: '430200', children: [
        { label: '荷塘区', value: '430202' }, { label: '天元区', value: '430211' } ] } ] },
    { label: '湖北省', value: '420000', children: [
      { label: '武汉市', value: '420100', children: [
        { label: '江岸区', value: '420102' }, { label: '汉阳区', value: '420105' },
        { label: '武昌区', value: '420106' }, { label: '洪山区', value: '420111' } ] },
      { label: '宜昌市', value: '420500', children: [
        { label: '西陵区', value: '420502' }, { label: '伍家岗区', value: '420503' },
        { label: '点军区', value: '420504' } ] } ] },
    { label: '四川省', value: '510000', children: [
      { label: '成都市', value: '510100', children: [
        { label: '锦江区', value: '510104' }, { label: '青羊区', value: '510105' },
        { label: '武侯区', value: '510107' }, { label: '成华区', value: '510108' } ] },
      { label: '绵阳市', value: '510700', children: [
        { label: '涪城区', value: '510703' }, { label: '游仙区', value: '510704' } ] } ] },
    { label: '陕西省', value: '610000', children: [
      { label: '西安市', value: '610100', children: [
        { label: '碑林区', value: '610103' }, { label: '莲湖区', value: '610104' },
        { label: '未央区', value: '610112' }, { label: '雁塔区', value: '610113' } ] },
      { label: '宝鸡市', value: '610300', children: [
        { label: '渭滨区', value: '610302' }, { label: '金台区', value: '610303' } ] } ] },
    { label: '甘肃省', value: '620000', children: [
      { label: '兰州市', value: '620100', children: [
        { label: '城关区', value: '620102' }, { label: '七里河区', value: '620103' },
        { label: '西固区', value: '620104' }, { label: '安宁区', value: '620105' } ] },
      { label: '天水市', value: '620500', children: [
        { label: '秦州区', value: '620502' }, { label: '麦积区', value: '620503' } ] },
      { label: '甘南藏族自治州', value: '623000', children: [
        { label: '临潭县', value: '623021' }, { label: '卓尼县', value: '623022' },
        { label: '碌曲县', value: '623026' }, { label: '夏河县', value: '623027' } ] } ] },
    { label: '广西壮族自治区', value: '450000', children: [
      { label: '南宁市', value: '450100', children: [
        { label: '兴宁区', value: '450102' }, { label: '青秀区', value: '450103' },
        { label: '西乡塘区', value: '450107' } ] } ] },
    { label: '海南省', value: '460000', children: [
      { label: '海口市', value: '460100', children: [
        { label: '秀英区', value: '460105' }, { label: '龙华区', value: '460106' },
        { label: '美兰区', value: '460108' } ] } ] },
    { label: '云南省', value: '530000', children: [
      { label: '昆明市', value: '530100', children: [
        { label: '五华区', value: '530102' }, { label: '盘龙区', value: '530103' },
        { label: '官渡区', value: '530111' } ] } ] },
    { label: '贵州省', value: '520000', children: [
      { label: '贵阳市', value: '520100', children: [
        { label: '南明区', value: '520102' }, { label: '云岩区', value: '520103' },
        { label: '观山湖区', value: '520115' } ] } ] },
  ];
  window.AREA_DATA = areaData;
})();
