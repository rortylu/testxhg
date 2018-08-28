(function() {
    FastClick.attach(document.body);

    // 常用dom
    var $region = $('#region'),
        $street = $('#street'),
        $apartment = $('#apartment'),
        $detail = $('#detail'),
        $btnSubmit = $('#btn_submit'),
        $popLocation = $('.popup-location'),
        $batchNo=$('#batchNo');
    // 全局变量
    var deviceId = Util.getParam('deviceId'), // 设备id
        username = Util.getParam('username'), // 用户名,
        modelType=Util.getParam('modelType'), //激活模式  1 工厂模式  2投产模式
        isSumbiting = false,
        lng = '',
        lat = '',
        iosProvinceData = [],
        iosCityDataInit = [],
        iosDistrictDataInit = [],
        location={lng:'', lat:''};//定位地址

    /* --------------- 页面初始化 --------------- */
    initPage();
    // getData(0,0);
    /* --------------- 事件绑定 --------------- */
    // 定位
    $('.form-active').on('click', '#get_location', function(e) {
        getLocation(e);
    });
    $('.form-active').on('input', 'input', function(e) {
        changeBtnStatus();
        //四个条码填写符合规则就去掉错误警告
        if($(this).attr('name')=='nameplateCode'&&$('#nameplateCode').val().trim().length==11){
            $(this).removeClass('warn');
        }
        if($(this).attr('name')=='routerCode'&&$('#routerCode').val().trim().length==16){
            $(this).removeClass('warn');
        }
        if($(this).attr('name')=='cameraCode'&&$('#cameraCode').val().trim().length==9){
            $(this).removeClass('warn');
        }
    });
    // 提交按钮
    $('.form-active').on('click', '#btn_submit', function(e) {
        submitClick(e);
    });
    $('.form-active').on('change', 'input[name="kind"]', function(e) {
        changeBtnStatus();
    });
    $('.form-active').on('change', 'select[name="batchNo"]', function(e) {
        changeBtnStatus();
    });
    $('.form-active').on('click','#apartment,#detail',function () {
        $(this).focus();
    })
    /**************微信扫一扫初始化start*******************/
    //获取微信sdk参数
    Util.Ajax({
        url: Util.OPENAPI + '/gateway/h52terminal/get-signature',
        type: 'POST',
        data: {
            appId:Util.AppID,
            appSecret:Util.AppSecret,
            callUrl:window.location.href
        },
        dataType: 'json',
        cbOk: function (data, textStatus, jqXHR) {
            if (data.code === "1") {
                var res=data.responseBody.data;
                wx.config({
                    debug: false,
                    appId: res.appId,
                    timestamp: res.timestamp,
                    nonceStr: res.nonceStr,
                    signature: res.signature,
                    jsApiList: [
                        'checkJsApi',
                        'scanQRCode'
                    ]
                });
                console.log(data.responseBody.data)
            } else {
                Util.toast(data.message, 3000);
            }
        },
        cbErr: function (e, xhr, type) {
            Util.toast('请求出错，请稍后再试！', 3000);
        }
    },sha256)

    wx.ready(function () {
        // 1 判断当前版本是否支持指定 JS 接口，支持批量判断
        wx.checkJsApi({
            jsApiList : ['scanQRCode'],
            success : function(res) {
                console.log(JSON.stringify(res))
            },
            fail:function (error) {
                console.log(JSON.stringify(error))
            }
        });
        // 9.1.2 扫描二维码并返回结果
        $('.scanQRcode').click(function () {
            var that=this;
            wx.scanQRCode({
                needResult: 1,
                desc: 'scanQRCode desc',
                success: function (res) {
                    var resultArr=res.resultStr.split(',');//正常条码返回形式第一个是条码类别{resultStr:'EAN_13,123456789123'}
                    var txtObj=$(that).parent().find('input');
                    $(txtObj).val(resultArr.length>1?resultArr[1]:resultArr[0]);
                }
            });
        })

    })
    wx.error(function (res) {
        console.log(res.errMsg);
    });
    /**************微信扫一扫初始化end*******************/
    // 关闭地图
    $popLocation.on('click', '.close', function(e) {
        $popLocation.hide();
    })
    // 手机号码输入框

    /* --------------- 事件实现 --------------- */
    // 提交资料
    function submitClick(e) {
        e.preventDefault();
        if (isSumbiting) {
            return;
        }
        if($btnSubmit.hasClass('unabled')) {
            return;
        }
        if (!username) {
            Util.toast('用户名不能为空，此链接非法！', 3000);
            return;
        }
        // 各个验证
        var $kind = $('input[name="kind"]:checked'),
            provinceName = $region.attr('data-province-name'),
            provinceCode = $region.attr('data-province-tcode'),
            cityName = $region.attr('data-city-name'),
            cityCode = $region.attr('data-city-tcode'),
            districtName = $region.attr('data-district-name'),
            districtCode = $region.attr('data-district-tcode'),

            street = $street.val().trim(),
            apartment = $apartment.val().trim(),
            detail = $detail.val().trim(),
            batchNo=$batchNo.val(),
            nameplateCode=$('#nameplateCode').val().trim(),
            routerCode=$('#routerCode').val().trim(),
            cameraCode=$('#cameraCode').val().trim(),
            ipcCode=$('#ipcCode').val().trim(),
            reg=/^[A-Za-z0-9]+$/;


        if($kind.length <= 0) {
            Util.toast('请选择回收箱品类', 3000);
            return;
        }

        if (!lng || !lat) {
            Util.toast('定位失败，请重新获取！', 3000);
            return;
        }
        if(!provinceName || !provinceCode) {
            Util.toast('省份没选择，请手动到地区选择框进行选择！', 3000);
            return;
        }
        if(!cityName || !cityCode) {
            Util.toast('城市没选择，请手动到地区选择框进行选择！', 3000);
            return;
        }
        if(!districtName || !districtCode) {
            Util.toast('区域没选择，请手动到地区选择框进行选择！', 3000);
            return;
        }
        if(!street) {
            Util.toast('街道不能为空', 3000);
            return;
        }
        if(!apartment) {
            Util.toast('小区不能为空', 3000);
            return;
        }
        if($('#nameplateCode').val().trim()&&$('#nameplateCode').val().trim().length!=11){
            Util.toast('机器铭牌号长度为11位字符', 3000);
            $('#nameplateCode').addClass('warn');
            return;
        }
        if($('#routerCode').val().trim()&&$('#routerCode').val().trim().length!=16){
            Util.toast('路由器编号长度为16位字符', 3000);
            $('#routerCode').addClass('warn');
            return;
        }
        if($('#cameraCode').val().trim()&&$('#cameraCode').val().trim().length!=9){
            Util.toast('安防摄像头号长度为9位字符', 3000);
            $('#cameraCode').addClass('warn');
            return;
        }
        // if(nameplateCode&&!reg.test(nameplateCode)){
        //     Util.toast('机器铭牌号必须为数字或字符', 3000);
        //     $('#nameplateCode').addClass('warn');
        //     return;
        // }
        // if(routerCode&&!reg.test(routerCode)){
        //     Util.toast('路由器编号必须为数字或字符', 3000);
        //     $('#routerCode').addClass('warn');
        //     return;
        // }
        // if(cameraCode&&!reg.test(cameraCode)){
        //     Util.toast('安防摄像头号必须为数字或字符', 3000);
        //     $('#cameraCode').addClass('warn');
        //     return;
        // }
        // if(ipcCode&&!reg.test(ipcCode)){
        //     Util.toast('工控机编号必须为数字或字符', 3000);
        //     $('#ipcCode').addClass('warn');
        //     return;
        // }
        var kinds = [];
        $kind.each(function(index, item) {
            console.log(item)
            kinds.push(+item.value);
        })
        // do submit
        isSumbiting = true;
        $btnSubmit.html('提交资料中...');

        Util.Ajax({
            url: Util.OPENAPI + '/gateway/h52terminal/init-machine',
            type: 'POST',
            data: {
                "username": username,
                "deviceId": deviceId,
                "status": $('#status').val() === "1",
                "longitude": lng,
                "latitude": lat,
                "provinceName": provinceName,
                "provinceCode": provinceCode,
                "cityName": cityName,
                "cityCode": cityCode,
                "districtName": districtName,
                "districtCode": districtCode,
                "street": street,
                "apartment": apartment,
                "detail": detail,
                "batchNo":batchNo,
                "typeList": kinds,
                "modelType":modelType,
                "cameraCode":$('#cameraCode').val().trim(),
                "ipcCode":$('#ipcCode').val().trim(),
                "nameplateCode":$('#nameplateCode').val().trim(),
                "routerCode":$('#routerCode').val().trim()
            },
            dataType: 'json',
            cbOk: function(data, textStatus, jqXHR) {
                if (data.code === "1") {
                    window.location.href = './result.html?deviceId='+deviceId+'&modelType='+modelType;
                } else {
                    Util.toast(data.message, 3000);
                }
                $btnSubmit.html('提交资料激活');
            },
            cbErr: function(e, xhr, type) {
                $btnLogin.html('登录');
                Util.toast('请求出错，请稍后再试！', 3000);
            },
            cbCp: function(xhr, status) {
                isSumbiting = false;
            }
        }, sha256);
    }
    // 页面初始化
    function initPage() {
        $('#deviceid').html(deviceId);
        initSelect();
        if(modelType==1){ //工厂模式激活
            $('#model_type').addClass('factory_model');
        }
        else if(modelType==2) {
            $('#model_type').addClass('production_model');
            $('.scan_code,.batchNo').removeClass('hide');
        }
    }
    // 定位事件
    function getLocation(e) {
        Util.popup({
            content: '“小黄狗”要获取你的地理位置，是否允许？',
            btns: [{
                name: '不允许',
                cb: function() {
                    Util.hideLoader();
                }
            }, {
                name: '允许',
                cb: function() {
                    Util.showLoader();
                    getMapLocation();//初始化地图组件
                    $popLocation.show();
                    Util.hideLoader();
                    /*getGPS_GD(function(data) {
                        $popLocation.html('<i class="close"></i><iframe id="location" src="https://m.amap.com/picker/?center=' + data.position.getLng() + ',' + data.position.getLat() + '&amp;key=7239636fdf5584e2afacfae18236ac5b"></iframe>');
                        $popLocation.show();
                        Util.hideLoader();
                        iframeEvent();
                    });*/
                }
            }]
        })
    }

    function getMapLocation(){
        // var map, geolocation;
        //加载地图，调用浏览器定位服务
        // map = new AMap.Map();
        AMapUI.loadUI(['misc/PositionPicker','misc/PoiPicker'], function(PositionPicker) {
            var geolocation;
            var map = new AMap.Map('container', {
                zoom: 14,
                scrollWheel: false
            })
            AMap.service('AMap.Geolocation', function() {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                    convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    showButton: true,        //显示定位按钮，默认：true
                    buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                });
                map.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
                AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
            });

            //解析定位结果
            function onComplete(data) {
                console.log(data)
            }
            //解析定位错误信息
            function onError(data) {
                console.log('fail')
            }

            var positionPicker = new PositionPicker({
                mode: 'dragMap',
                map: map
            });

            positionPicker.on('success', function (positionResult) {
                console.log(positionResult)
                location.lat=positionResult.position.lat;
                location.lng=positionResult.position.lng;
            });
            positionPicker.on('fail', function (positionResult) {
                Util.toast('获取位置信息失败，请稍后再试！', 3000);
            });
            var onModeChange = function(e) {
                positionPicker.setMode(e.target.value)
            }
            positionPicker.start();
            map.panBy(0, 1);
            map.addControl(new AMap.ToolBar({
                liteStyle: true
            }))
        })
    }
    //确认选中地理位置
    $('.confirm_postion').click(function () {
        lng = location.lng;
        lat = location.lat;
        getAddGD(location.lng,location.lat,function(add) {
            add.name = '已获取定位信息';
            fillAdd(add);
        });
        $popLocation.hide();
    })

    // 高德获取当前位置
    function getGPS_GD(cb) {
        var map, geolocation;
        //加载地图，调用浏览器定位服务
        // map = new AMap.Map();
        AMap.service('AMap.Geolocation', function() {
            geolocation = new AMap.Geolocation({
                enableHighAccuracy: true, //是否使用高精度定位，默认:true
                timeout: 10000, //超过10秒后停止定位，默认：无穷大
                buttonOffset: new AMap.Pixel(0, 0), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                buttonPosition: 'RB'
            });
            // map.addControl(geolocation);
            geolocation.getCurrentPosition();
            AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
            AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
        });
        //解析定位结果
        function onComplete(data) {
            cb && cb(data);
            // str.push('经度：' + data.position.getLng());
            // str.push('纬度：' + data.position.getLat());
            // if (data.accuracy) {
            //     str.push('精度：' + data.accuracy + ' 米');
            // } //如为IP精确定位结果则没有精度信息
        }
        //解析定位错误信息
        function onError(data) {
            Util.hideLoader();
            // Util.toast('定位失败');
            $('#loca').html('<i class="icon-loca"></i>定位失败，请重新获取')[0].className = 'status-fail'

        }
    }
    // 地理逆编码
    function getAddGD(lng, lat, cb) {
        var geocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: "all"
        });
        geocoder.getAddress([lng, lat], function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                console.log(result);
                cb && cb(result.regeocode.addressComponent)
            }
        });
    }
    // 监听地图iframe的样式
    function iframeEvent() {
        var $location = $('#location')[0],
            iframe = $location.contentWindow;
        $location.onload = function() {
            iframe.postMessage('hello', 'https://m.amap.com/picker/');
        };
        window.addEventListener("message", function(e) {
            // console.log(e.)
            // alert('您选择了:' + e.data.name + ',' + e.data.location)
            var loca = e.data.location.split(',');
            lng = loca[0];
            lat = loca[1];
            getAddGD(lng, lat, function(add) {
                add.name = e.data.name;
                fillAdd(add);
            });
        }, false);
    }
    // 填充地址
    function fillAdd(add) {
        Util.showLoader();
        $('#loca').html('<i class="icon-loca"></i>' + add.name)[0].className = 'status-success';
        // $('#loca')[0].className = 'status-success';
        $region.removeClass('not-select').attr('data-province-name', add.province).attr('data-city-name', add.city).attr('data-district-name', add.district).html(add.province + add.city + add.district);
        $('#street').val(add.township + add.street + add.streetNumber);
        changeBtnStatus();

        // 选中select的省市
        var _province = '',
            _city = '',
            _district = '';
        // 过滤省份
        if (!add.province || iosProvinceData.length === 0) {
            Util.hideLoader();
            $popLocation.hide();
            return;
        }
        _province = iosProvinceData.filter(function(item) {
            return item.value === add.province;
        })[0]
        $region.attr('data-province-code', _province.id).attr('data-province-tcode', _province.code);
        $('#contact_province_code').attr('data-province-name', _province.value).val(_province.id);
        // 过滤市
        if (!add.city) {
            Util.hideLoader();
            $popLocation.hide();
            return;
        }
        getData(1, _province.id, function(data) {
            iosCityDataInit = data;
            _city = iosCityDataInit.filter(function(item) {
                return item.value === add.city;
            })[0];
            $region.attr('data-city-code', _city.id).attr('data-city-tcode', _city.code);
            $('#contact_city_code').attr('data-city-name', _city.value).val(_city.id);
            // 过滤区
            if (!add.district) {
                Util.hideLoader();
                $popLocation.hide();
                return;
            }
            getData(2, _city.id, function(data) {
                iosDistrictDataInit = data;
                _district = iosDistrictDataInit.filter(function(item) {
                    return item.value === add.district;
                })[0];
                $region.attr('data-district-code', _district.id).attr('data-district-tcode', _district.code);
                Util.hideLoader();
                $popLocation.hide();
                return;
            })

        })
    }
    // 省市select
    function initSelect() {
        var $selectContact = $('#select_contact');
        var $contactProvinceCode = $('#contact_province_code');
        var $contactCityCodeDom = $('#contact_city_code');
        // 初始化获取省份
        getData(0, 0, function(data) {
            iosProvinceData = data;
            var iosCityData = function(province, callback) { // province为已经选中的省份ID
                if (iosCityDataInit.length > 1 && province == iosCityDataInit[0].parentId) {
                    callback(iosCityDataInit);
                    return;
                }
                getData(1, province, function(data) {
                    // var _city = data.filter(function(item) {
                    //     return item.value === $region.attr('data-city-name');
                    // })[0];
                    // $region.attr('data-city-code', _city.id).attr('data-city-tcode', _city.code);
                    // $contactCityCodeDom.attr('data-city-name', _city.value).val(_city.id);
                    callback(data);
                });
            }
            var iosCountyData = function(province, city, callback) { // province为已经选中的省份ID,city为已经选中的城市ID
                if (iosDistrictDataInit.length > 1 && city == iosDistrictDataInit[0].parentId) {
                    callback(iosDistrictDataInit);
                    return;
                }
                getData(2, city, function(data) {
                    callback(data);
                });
            }
            $selectContact.bind('click', function() {
                console.log(11)
                var sccode = $region.attr('data-city-code');
                var scname = $region.attr('data-city-name');

                var oneLevelId = $region.attr('data-province-code');
                var twoLevelId = $region.attr('data-city-code');
                var threeLevelId = $region.attr('data-district-code');
                var iosSelect = new IosSelect(3, [iosProvinceData, iosCityData, iosCountyData], {
                    title: '地区选择',
                    itemHeight: 35,
                    relation: [1, 1],
                    oneLevelId: oneLevelId,
                    twoLevelId: twoLevelId,
                    threeLevelId: threeLevelId,
                    callback: function(selectOneObj, selectTwoObj, selectThreeObj) {
                        // console.log(selectOneObj)
                        $contactProvinceCode.val(selectOneObj.id);
                        $contactProvinceCode.attr('data-province-name', selectOneObj.value);
                        $contactCityCodeDom.val(selectTwoObj.id);
                        $contactCityCodeDom.attr('data-city-name', selectTwoObj.value);

                        $region.removeClass('not-select');
                        $region.attr('data-province-code', selectOneObj.id);
                        $region.attr('data-city-code', selectTwoObj.id);
                        $region.attr('data-district-code', selectThreeObj.id);

                        $region.attr('data-province-tcode', selectOneObj.code)
                        $region.attr('data-city-tcode', selectTwoObj.code)
                        $region.attr('data-district-tcode', selectThreeObj.code)

                        $region.attr('data-province-name', selectOneObj.value)
                        $region.attr('data-city-name', selectTwoObj.value)
                        $region.attr('data-district-name', selectThreeObj.value)

                        $region.html(selectOneObj.value + selectTwoObj.value + selectThreeObj.value);
                        changeBtnStatus();
                    }
                });
            });
        });

    }

    // 改变按钮状态
    function changeBtnStatus() {
        var kinds = $('input[name="kind"]:checked').length,
            street = $street.val().trim(),
            apartment = $apartment.val().trim(),
            detail = $detail.val().trim(),
            batchNo=$batchNo.val();
        if(modelType==1){
            if (kinds > 0 && lng && lat && !$region.hasClass('not-select') && street && apartment && detail) {
                $btnSubmit.removeClass('unabled');
            } else {
                $btnSubmit.addClass('unabled');
            }
        }
        else if(modelType==2){
            if (kinds > 0 && lng && lat && !$region.hasClass('not-select') && street && apartment && detail&& batchNo) {
                $btnSubmit.removeClass('unabled');
            } else {
                $btnSubmit.addClass('unabled');
            }
        }

    }

    // 获取地区数据
    function getData(level, parentId, cb) {
        Util.Ajax({
            url: Util.OPENAPI + '/gateway/h52terminal/get-area',
            type: 'POST',
            data: {
                "parentAreaId": parentId,
                "level": level
            },
            dataType: 'json',
            cbOk: function(data, textStatus, jqXHR) {
                console.log('ajax' + level);
                if (data.code === "1") {
                    var _data = data.responseBody.data,
                        _datas = [];
                    for (var i = 0; i < _data.length; i++) {
                        _datas.push({
                            id: _data[i].areaId,
                            value: _data[i].areaName,
                            code: _data[i].areaCode,
                            parentId: parentId
                        })
                    }
                    cb && cb(_datas);
                } else {
                    Util.toast(data.message, 3000);
                }
            },
            cbErr: function(e, xhr, type) {
                Util.toast('请求出错，请稍后再试！', 3000);
            },
            cbCp: function(xhr, status) {}
        }, sha256);
    }
})();
