(function(global) {
    // 回调全局参数
    var __callback;

    /**
     * @func
     * @desc 原生调用h5，在这里相当于毁掉函数
     * @param {Object} json - 回调参数，json数据对应接口文档的返回数据
     */
    function _callback(json) {
        __callback(json);
    }

    /**
     * @func
     * @desc 原生调用h5
     * @param {Object} json - 回调参数，json数据
     */
    function callHandler(nativeName, data, cb) {
        var params = {
            "nativeName": nativeName,
            "data": data
        };
        typeof cb === 'function' && (__callback = cb);
        global.location.replace("app://callNative?" + JSON.stringify(params));
    }
    /**
     * @func
     * @desc 原生调用h5
     * @param {Object} json - 回调参数，json数据
     */
    function callNativeHandler(nativeName, data, cb) {
        var params = {
            "params": data
        };
        typeof cb === 'function' && (__callback = cb);
        global.location.replace('XHG://native?type=' + nativeName + '&params=' + JSON.stringify(data));
    }


    /**
     * @func
     * @desc 通过useragent判断是否在app内部
     */
    function isAPP() {
        return navigator.userAgent.match(/(xhg_app_client)/);
    }

    /**
     * @func
     * @desc 通过useragent判断是否是b端内部
     */
    function isAPP2b() {
        return navigator.userAgent.match(/(xhg_app_client_2b)/);
    }

    var bridge = {
        isAPP: isAPP,
        isAPP2b: isAPP2b,
        callHandler: callHandler,
        callNativeHandler: callNativeHandler
    }
    global._callback = _callback;
    global.Bridge = bridge;
})(window);
