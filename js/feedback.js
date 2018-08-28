(function() {
    FastClick.attach(document.body);

    // 全局常用变量
    var $btnFeedback = $('#btn_feedback'),
        $num = $('#num');
    $addItem = $('.item-add');
    /* --------------- 事件绑定 --------------- */
    // 反馈输入监听
    $('.sec-feedback').on('input', '#feedback', function(e) {
        if ($(this).prop('comStart')) {
            return;
        }
        textareaListen(e);
    }).on('compositionstart', '#feedback', function(e) {
        $(this).prop('comStart', true);
    }).on('compositionend', '#feedback', function(e) {
        $(this).prop('comStart', false);
        textareaListen(e);
    });

    // 选择图片
    $('.sec-feedback').on('change', '#add_img', function(e) {
        chooseImg(e);
    });

    // 删除图片
    $('.sec-feedback').on('click', '.icon-del', function(e) {
        delImg(e);
    });

    // 提交按钮
    $btnFeedback.on('click', function(e) {
        submitData(e);
    });

    /* --------------- 事件实现 --------------- */
    function textareaListen(e) {
        var $target = $(e.currentTarget),
            value = Util.emojiFilter($target.val().trim());
        // 大于5个字才能点击按钮
        if (value.length > 5) {
            $btnFeedback.removeClass('unabled');
        } else {
            $btnFeedback.addClass('unabled');
        }
        // 如果超出300个字，就不能输入
        value = value.substring(0, 300);

        $target.val(value);
        $num.html(value.length);
    }

    // 选择图片
    function chooseImg(e) {
        if ($('.img-item').length >= 4) {
            return;
        }
        Util.showLoader();
        var $target = $(e.currentTarget);
        lrz(e.target.files[0], {
                "fieldName": "Filedata"
            })
            .then(function(rst) {
                var _img = {
                    "uid": new Date(),
                    "path": e.target.value,
                    "src": rst.base64,
                };
                /* ==================================================== */
                // 原生ajax上传代码，所以看起来特别多 ╮(╯_╰)╭，但绝对能用
                // 其他框架，例如jQuery处理formData略有不同，请自行google，baidu。
                // console.log(rst);
                var _temp = '<li class="img-item"><img src="' + _img.src + '" alt=""><i class="icon-del"></i></li>'
                $addItem.before(_temp);

                if ($('.img-item').length >= 4) {
                    $addItem.hide();
                }
                e.target.value = '';

                Util.hideLoader();
                rst.formData.append("version", 4);
                console.log(rst.formData.get('Filedata'));
                return rst;
            })
            .catch(function(error) {
                console.log(error);
            })
            .always(function() {
                // e.target.value = '';
            });
    }

    // 上传图片
    function uploadFile(rst) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Config.baseUrl + "/app/index.php");

        xhr.onload = function() {
            if (xhr.status === 200) {
                // 上传成功
                var data = JSON.parse(xhr.response);
                console.log(data);
                if (data.code == 200) {
                    _img.aid = data.data.aid;
                    that.imgList.push(_img);
                    if (that.imgList.length > 10) {
                        that.addImg = false;
                    }
                } else {
                    that.toastobj.$emit("show", data.message);
                }

            } else {
                // 处理其他情况
                that.toastobj.$emit("show", "上传失败！");
            }
        };

        xhr.onerror = function() {
            // 处理错误
        };

        xhr.upload.onprogress = function(e) {
            // 上传进度
            var percentComplete = ((e.loaded / e.total) || 0) * 100;
        };

        // 添加参数
        rst.formData.append("version", 4);
        rst.formData.append("module", "forumupload");
        // rst.formData.append("Filedata",rst.file);

        // 触发上传
        xhr.send(rst.formData);
        /* ==================================================== */

        return rst;
    }

    // 删除图片
    function delImg(e) {
        var $target = $(e.currentTarget),
            $parent = $target.parent();
        $parent.remove();
        if ($('.img-item').length < 4) {
            $addItem.show();
        }
    }

    // 提交数据
    function submitData(e) {
        if ($btnFeedback.hasClass('unabled')) {
            return;
        }

        var feedback = $('#feedback').val().trim(),
            phone = $('#tel').val().trim();
        if (feedback.length < 5) {
            Util.toast('建议与反馈不得少于5个字');
            return;
        }
        if ( phone && (!phone.length === 11 || !/^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/.test(phone))) {
            Util.toast('手机号码错误', 3000);
            return;
        }

        console.log('submit')
    }

})();
