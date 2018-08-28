(function() {
    FastClick.attach(document.body);

    // 常用变量
    var $popCity = $('#pop_city'),
        pageSize = 15, // 城市列表每页多少
        currentPage = 0, // 当前页码
        isGetting = false,
        isSubmitting = false,
        noMore = false;
    /* --------------- 事件绑定 --------------- */
    $('.content-signup').on('click', '#city', function(e) {
        getCityData();
        showCities();
    });

    // 提交按钮
    $('.content-signup').on('click', '#btn_submit', function(e) {
        submitInfo(e);
    });

    // 选择城市
    $popCity.on('click', '#list_city li', function(e) {
        selectItem(e);
    });

    // 确定城市
    $popCity.on('click', '#sure', function(e) {
        selectCity(e);
    });

    // 取消
    $popCity.on('click', '#cancel', function(e) {
        hideCities();
    });

    // 监听滚动
    $('#list_city').on('scroll', function(e) {
        listScroll(e)
    })

    /* --------------- 事件绑定 --------------- */
    // 显示城市弹层
    function showCities() {
        $popCity.show();
    }

    function hideCities() {
        $popCity.hide();
    }

    function selectItem(e) {
        var $target = $(e.currentTarget);
        $('#list_city li').removeClass('selected');
        if ($target.hasClass('item-loader')) {
            return;
        }
        $target.addClass('selected');
    }

    function selectCity(e) {
        var $citySelect = $('.selected'),
            $city = $('#city'),
            code = $citySelect.attr('data-code'),
            name = $citySelect.attr('data-name');
        if ($citySelect.length === 1) {
            $city.attr('data-code', code).attr('data-name', name).html(name).removeClass('not-select');

        }
        hideCities();
    }

    function listScroll(e) {
        var $list = $(e.currentTarget);
        // console.log($list.scrollTop(),$list.height(),$list.get(0).scrollHeight)
        if ($list[0].scrollHeight - $list.scrollTop() - $list.height() < 40) {
            // console.log('getdata');
            getCityData();
        }
    }

    // 获取城市
    function getCityData() {
        if (noMore || isGetting) {
            return;
        }
        isGetting = true;
        Util.Ajax({
            url: Util.OPENAPI + '/merchant/v1.0/sqrecycler/qryallowarea',
            type: 'POST',
            data: {
                "pageSize": pageSize,
                "currentPage": currentPage + 1
            },
            dataType: 'json',
            cbOk: function(data, textStatus, jqXHR) {
                if (data.code !=="1") {
                    Util.toast(data.message);
                    return;
                }
                if (data.responseBody.code === "1") {
                    // console.log(data.data)
                    var _data = data.responseBody.data;
                    if (!_data) {
                        return;
                    }
                    var _list = _data.list,
                        _temp = '',
                        $loader = $('#item_loader');
                    if (_list && _list.length > 0) {
                        for (var i = 0; i < _list.length; i++) {
                            var _item = _list[i];
                            _temp += '<li data-code="' + _item.areaCode + '" data-name="' + _item.areaName + '">' + _item.areaName + '</li>'
                        }
                        console.log(_temp)
                        $loader.before(_temp);
                    }

                    currentPage = _data.currentPage;

                    if (currentPage >= _data.totalPages) {
                        $loader.remove();
                        noMore = true;
                    }
                } else {
                    Util.toast(data.responseBody.message, 3000);
                }
            },
            cbErr: function(e, xhr, type) {
                Util.toast('请求出错，请稍后再试！', 3000);
            },
            cbCp: function(xhr, status) {
                isGetting = false;
            }
        }, sha256);
    }

    // 提交资料
    function submitInfo(e) {
        var username = $('#username').val().trim(),
            phone = $('#phone').val().trim(),
            $city = $('#city'),
            cityCode = $city.attr('data-code'),
            cityName = $city.attr('data-name')

        if (!/^[\u4E00-\u9FA5]{2,12}$/.test(username)) {
            Util.toast('只能输入2～12个汉字');
            return;
        }

        if (!phone || !/^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(phone)) {
            Util.toast('请输入正确的手机号码');
            return;
        }

        if (!cityCode || !cityName) {
            Util.toast('请选择对应的城市');
            return;
        }

        if (isSubmitting) {
            return;
        }
        isSubmitting = true;
        Util.Ajax({
            url: Util.OPENAPI + '/merchant/v1.0/sqrecycler/applyrecycle',
            type: 'POST',
            data: {
                "areaCode": cityCode,
                "areaName": cityName,
                "name": username,
                "phone": phone
            },
            dataType: 'json',
            cbOk: function(data, textStatus, jqXHR) {
                if (data.code !=="1") {
                    Util.toast(data.message);
                    return;
                }
                var response = data.responseBody;
                if (response.code === "1") {
                    // console.log(data.data)
                    Util.popup({
                        title: '报名信息提交成功',
                        content: '您的报名信息我们已经收到，请您耐心等待小黄狗的客服人员与您联系进行认证',
                        btns: [{
                            name: '确认',
                            cb: function() {
                                // 跳回首页，原生监听跳转链接
                                window.location.href = 'https://www.gobackhomepage.com';
                            }
                        }]
                    });
                } else {
                    Util.toast(response.message, 3000);
                }
            },
            cbErr: function(e, xhr, type) {
                Util.toast('请求出错，请稍后再试！', 3000);
            },
            cbCp: function(xhr, status) {
                isSubmitting = false;
            }
        }, sha256, true);
    }

    // 具体实现
    // 初始化selector
    /*function initSelector() {
        var data = [{
            'id': '10001',
            'value': '东莞'
        }];
        var $city = $('#city'),
            $cityId = $('city_id');
        $city.on('click', function(e) {
            var cityId = $city.attr('data-id'),
                cityName = $city.attr('data-value');
            console.log('init');
            var citySelect = new IosSelect(1, [
                data
            ], {
                container: '.container', // 容器class
                title: '已开放城市', // 标题
                headerHeight: 81,
                itemHeight: 49, // 每个元素的高度
                itemShowCount: 5, // 每一列显示元素个数，超出将隐藏
                oneLevelId: cityId, // 第一级默认值
                showLoading: true,
                callback: function(selectOneObj) { // 用户确认选择后的回调函数
                    $cityId.val(selectOneObj.id);
                    $city.html(selectOneObj.value);
                    $city.attr('data-id', selectOneObj.id);
                    $city.attr('data-value', selectOneObj.value);
                    $city.removeClass('not-select');
                }
            });
        })
    }*/
})();
