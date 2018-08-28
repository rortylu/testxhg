(function() {

    FastClick.attach(document.body);

    // 常用dom
    var $phone = $('#phone'),
        $password = $('#password'),
        $btnLogin = $('#btn_login');
    // 全局变量
    var deviceId = Util.getParam('deviceId'), // 设备id
        isLogining = false;
    /* --------------- 事件绑定 --------------- */
    // 登录按钮
    $('.form-login').on('click', '#btn_login', function(e) {
        loginClick(e);
    });
    // 手机号码输入框
    $('.form-login').on('input', '#phone, #password', function(e) {
        changeBtnStatus(e);
    });

    /* --------------- 事件实现 --------------- */

    function loginClick(e) {
        e.preventDefault();
        if (isLogining) {
            return;
        }
        if ($btnLogin.hasClass('unabled')) {
            return;
        }
        var phone = $phone.val().trim(),
            password = $password.val().trim();

        // 验证电话号码
        if (!phone.length === 11 || !/^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/.test(phone)) {
            Util.toast('请输入正确的账号', 3000);
            return;
        }
        if(!/^[0-9a-zA-Z]*$/g.test(password)) {
            Util.toast('密码不正确', 3000);
            return;
        }

        isLogining = true;
        $btnLogin.html('登录中...');
        // dologin
        Util.Ajax({
            url: Util.OPENAPI + '/gateway/h52terminal/login-check-machine',
            type: 'POST',
            data: {
                "username": phone,
                "password": password,
                "deviceId": deviceId
            },
            dataType: 'json',
            cbOk: function(data, textStatus, jqXHR) {
                if (data.responseBody.code === "1") {
                    var _data = data.responseBody.data;
                    if (_data) {
                        // 那么跳转到激活页面
                        var modelType='1';
                        if(_data.modelType==1){
                            window.location.href = './modelchoose.html?deviceId='+deviceId + '&username=' + phone +'&type=2';
                        }
                        else if(_data.modelType==2){
                            window.location.href = './result.html?deviceId='+deviceId+'&modelType=2';
                        }
                    }
                    else{
                        window.location.href = './modelchoose.html?deviceId='+deviceId + '&username=' + phone +'&type=1';
                        // window.location.href = './result.html?deviceId='+deviceId;
                    }
                } else {
                    Util.toast(data.responseBody.message, 3000);
                }
                $btnLogin.html('登录');
            },
            cbErr: function(e, xhr, type) {
                $btnLogin.html('登录');
                Util.toast('请求出错，请稍后再试！', 3000);
            },
            cbCp: function(xhr, status) {
                isLogining = false;
            }
        }, sha256);

    }

    function changeBtnStatus(e) {
        var phone = $phone.val().trim(),
            password = $password.val().trim();
        if (phone && password) {
            $btnLogin.removeClass('unabled');
        } else {
            $btnLogin.addClass('unabled');
        }
    }
})();
