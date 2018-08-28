(function(){
    FastClick.attach(document.body);
    var thisPage={
        init:function () {
            this.loadPage();
            this.addEvent();
        },
        loadPage:function(){
            this.deviceId = Util.getParam('deviceId'), // 设备id
                this.username = Util.getParam('username'), // 用户名
                this.modelType = Util.getParam('type') //类型  1 工厂模式  2投产模式
            if(this.modelType==1){
                $('#icon_bg img').attr('src','../../images/activation/icon_bg_factory.png');
                $('#btn_bg img').attr('src','../../images/activation/btn_factory.png');
                $('.model_tip').html('工厂模式激活仅作为测试使用<br/>不可用于实际对外投产');
            }
            else if(this.modelType==2){
                $('#icon_bg img').attr('src','../../images/activation/icon_bg_production.png');
                $('#btn_bg img').attr('src','../../images/activation/btn_production.png');
                $('.model_tip').html('投产模式用于实际对外投产 <br/>一旦激活无法回退');
            }

        },
        addEvent:function () {
            var _this=this;
            $('#btn_bg').click(function () {
                location.href='./activation.html?deviceId='+_this.deviceId + '&username=' + _this.username+'&modelType='+_this.modelType;
            })
        }
    }
    thisPage.init();
})()
