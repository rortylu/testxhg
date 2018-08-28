(function(global) {
	//	var openApi = 'http://219.134.241.202:8010/zsd/customer';/*C端联调地址 周仕冬*/
//	var openApi = 'http://10.10.10.86:8085'; /*加盟商联调地址    捐哥*/
//	var openApi = 'http://10.10.10.95:8080/qc'; /*加盟商联调地址*/
	//  var openApi = 'http://10.10.10.95:8082/merchant'; // 联调后端地址
		//  var openApi = 'http://test.xhg.com:8010'; // test环境
	// var openApi = 'https://test2.xhg.com:8011'; // test环境
	// var openApi = 'https://dev.xhg.com:8011'; // 测试环境
		 var openApi = 'https://pre.xhg.com'; // 预发布环境
	//	 var openApi = 'https://www.xhg.com'; // 生产环境
	// var openApi = 'https://xcx.xhg.com'; // 小程序环境
    // var openApi='http://10.10.10.199:8081'
	var Util = {
        AppID:'wx3e8a13cc8a84e1b4',//微信公众号id
        AppSecret:'4af81abe5d5bc78da7a28e77e4109350',//密码
        AppUrl:'https://pre.xhg.com/static/html/activation/activation.html',//调用微信接口的页面
		/**
		 * @func
		 * @desc toast提示
		 * @param {string} msg - 提示信息
		 * @param {number} duration=1500 - 显示持续时间，默认为1500ms
		 */
		OPENAPI: openApi,
		toast: function(msg, duration) {
			duration = duration || 1500;
			var _toast = $('<div/>').addClass('toast'),
				_msg = $('<span/>').html(msg);
			_toast.append(_msg);
			$('body').append(_toast);
			setTimeout(function() {
				_toast.remove();
			}, duration);
		},
		showLoader: function() {
			var temp = '<div class="loader-wrapper"><svg class="spinner show" viewBox="0 0 44 44"><circle class="path" fill="none" stroke-width="4" stroke-linecap="round" cx="22" cy="22" r="20"></circle> </svg></div>',
				$loader = $('.loader-wrapper');
			if($loader.length > 0) {
				$loader.show();
			} else {
				$('body').append(temp);
			}
		},
		hideLoader: function() {
			$('.loader-wrapper').hide();
		},
		getParam: function(name, url) {
			if(!url) {
				url = location.href;
			}
			var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
			var returnValue;
			for(var i = 0; i < paraString.length; i++) {
				var tempParas = paraString[i].split('=')[0];
				var parasValue = paraString[i].split('=')[1];
				if(tempParas === name)
					returnValue = parasValue;
			}

			if(!returnValue) {
				return "";
			} else {
				if(returnValue.indexOf("#") != -1) {
					returnValue = returnValue.split("#")[0];
				}
				return returnValue;
			}
		},
		/**
		 * @func
		 * @desc popup 对话框
		 * @param {options} options - 配置参数
		 * @param {string} [options.title] - 对话框标题，选填
		 * @param {string} options.content - 对话框提示信息，必填
		 * @param {object[]} options.btns - 参数btns为一个对象数组，必填
		 * @param {string} btns.name - 参数btns数组中一项的name属性，表示按钮名称
		 * @param {string} btns.cb - 参数btns数组中一项的cb，表示对应按钮的回调函数
		 */
		popup: function(options) {
			var _options = {
				title: '',
				content: '',
				btns: [{
					name: '',
					cb: function() {}
				}, {
					name: '',
					cb: function() {}
				}]
			};
			_options = $.extend(_options, options || {});
			var dialog_component = $('<div/>').addClass('popup').addClass('component-dialog'),
				masker = $('<div/>').addClass('masker'),
				dialog_wrapper = $('<div/>').addClass('pop-wrapper'),
				dialog_title = _options.title ? $('<div/>').addClass('pop-title').html(_options.title) : '',
				dialog_content = $('<div/>').addClass('pop-content').html(_options.content),
				btns = $('<div/>').addClass('btns'),
				_btn_temp = '';

			dialog_wrapper.append(dialog_title).append(dialog_content);

			for(var i = 0; i < _options.btns.length; i++) {
				_btn_temp += '<button>' + _options.btns[i].name + '</button>';
			}
			btns.html(_btn_temp);
			dialog_wrapper.append(btns);

			dialog_component.append(masker).append(dialog_wrapper);

			$('body').append(dialog_component);
			// 事件绑定
			masker.bind('click', function(e) {
				hide(dialog_component);
			});

			btns.on('click', 'button', function(e) {
				var $target = $(e.currentTarget);
				var cb = _options.btns[$target.index()].cb;
				cb && cb.call(this, arguments);
				hide(dialog_component);
			});

			function hide(target) {
				target.remove();
			}
		},
		/**
		 * @func
		 * @desc Ajax 请求
		 * @param {config} config - 配置参数
		 * @param {string} config.url - 请求路径，选填
		 * @param {string} config.type - 请求类型，必填
		 * @param {object} config.data - 请求参数，必填
		 * @param {string} config.dataType - 返回数据类型，必填
		 * @param {function} [config.beforeSend] - 请求发送前事件，选填
		 * @param {function} [config.cbOk] - 请求成功事件，选填
		 * @param {function} [config.cbErr] - 请求失败事件，选填
		 * @param {function} [config.cbCp] - 请求完成事件，选填
		 * @param {object} [sha256] - sha256签名依赖，选填
		 * @param {boolean} [loader] - 是否有loader, 选填，不填的时候，默认为false
		 */
		Ajax: function(config, sha256, loader) {
			// "deviceId": "heyb4s3x3l8",
			var me = this;
			var _data = {};
			//			console.log(!!config.requestHead)
			if(!!config.requestHead) {
				_data = {
					"requestHead": {
						"validateTime": "20180323111901",
						// "deviceId": "heyb4s3x3l8",
						"deviceId": me.getParam('deviceId'),
						"appId": "oa1k92hmx4",
						"appVersion": config.requestHead.appVersion || '',
						"configVersion": config.requestHead.configVersion || '',
						"systemVersion": "lzvv4ixpnq",
						"ostype": config.requestHead.ostype || '',
						"channel": config.requestHead.channel || '',
						// "sign": "63chnz0k3sj",
						"sign": sha256 ? me.sign(sha256, config.data) : '',
						"token": config.requestHead.token || '',
						"phoneModel": config.requestHead.phoneModel || '',
						"phoneResolution": ''
					},
					"requestBody": {
						"data": config.data
					}
				};
			} else {
				_data = {
					"requestHead": {
						"validateTime": "20180323111901",
						// "deviceId": "heyb4s3x3l8",
						"deviceId": me.getParam('deviceId'),
						"appId": "oa1k92hmx4",
						"appVersion": "pu3sz68eei8",
						"configVersion": "84dltxt0gn",
						"systemVersion": "lzvv4ixpnq",
						"ostype": "ANDROID",
						"channel": 1,
						// "sign": "63chnz0k3sj",
						"sign": sha256 ? me.sign(sha256, config.data) : '',
						"token": "liyn2yvemm",
						"phoneModel": "华为P20",
						"phoneResolution": ''
					},
					"requestBody": {
						"data": config.data
					}
				};
			}
			$.ajax({
				timeout: 20 * 1000,
				url: config.url,
				type: config.type,
				data: JSON.stringify(_data),
				dataType: config.dataType,
				contentType: 'application/json',
				beforeSend: function(xhr, settings) {
					// xhr.setRequestHeader("If-Modified-Since", "0");
					if(loader) {
						me.showLoader();
					}
					config.beforeSend && config.beforeSend(xhr, settings);

				},
				success: function(data, textStatus, jqXHR) {
					config.cbOk && config.cbOk(data, textStatus, jqXHR);
				},
				error: function(e, xhr, type) {
					config.cbErr && config.cbErr(e, xhr, type);
				},
				complete: function(xhr, status) {
					if(loader) {

						me.hideLoader();
					}
					config.cbCp && config.cbCp(xhr, status);
				}
			});
		},

		isIosPlatform: function() {
			return navigator.userAgent.match(/(iPad|iPhone)/);
		},
		isAndroidPlatform: function() {
			return navigator.userAgent.match(/(Android)/);
		},
		isWeiXin: function() {
			var ua = navigator.userAgent.toLowerCase();
			return ua.match(/MicroMessenger/i) == 'micromessenger';
		},
		// 前端过滤emoji
		emojiFilter: function(str) {
			return str.replace(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g, ""); //不允许输入emoji
			// return str.replace(/[\u2190-\u21FF]|[\u2600-\u26FF]|[\u2700-\u27BF]|[\u3000-\u303F]|[\u1F300-\u1F64F]|[\u1F680-\u1F6FF]/g, ""); //不允许输入emoji
			// return str.replace(/(?:0\u20E3|1\u20E3|2\u20E3|3\u20E3|4\u20E3|5\u20E3|6\u20E3|7\u20E3|8\u20E3|9\u20E3|#\u20E3|\*\u20E3|\uD83C(?:\uDDE6\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF2|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFD|\uDDFF)|\uDDE7\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFC|\uDDFE|\uDDFF)|\uDDE8\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDE9\uD83C(?:\uDDEA|\uDDEC|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDFF)|\uDDEA\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDED|\uDDF7|\uDDF8|\uDDF9|\uDDFA)|\uDDEB\uD83C(?:\uDDEE|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDF7)|\uDDEC\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF1|\uDDF2|\uDDF3|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFE)|\uDDED\uD83C(?:\uDDF0|\uDDF2|\uDDF3|\uDDF7|\uDDF9|\uDDFA)|\uDDEE\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9)|\uDDEF\uD83C(?:\uDDEA|\uDDF2|\uDDF4|\uDDF5)|\uDDF0\uD83C(?:\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDF2|\uDDF3|\uDDF5|\uDDF7|\uDDFC|\uDDFE|\uDDFF)|\uDDF1\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDEE|\uDDF0|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFE)|\uDDF2\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDF3\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFF)|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C(?:\uDDE6|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF7|\uDDF8|\uDDF9|\uDDFC|\uDDFE)|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C(?:\uDDEA|\uDDF4|\uDDF8|\uDDFA|\uDDFC)|\uDDF8\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDE9|\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFD|\uDDFE|\uDDFF)|\uDDF9\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF9|\uDDFB|\uDDFC|\uDDFF)|\uDDFA\uD83C(?:\uDDE6|\uDDEC|\uDDF2|\uDDF8|\uDDFE|\uDDFF)|\uDDFB\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDEE|\uDDF3|\uDDFA)|\uDDFC\uD83C(?:\uDDEB|\uDDF8)|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C(?:\uDDEA|\uDDF9)|\uDDFF\uD83C(?:\uDDE6|\uDDF2|\uDDFC)))|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2694\u2696\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD79\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED0\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3]|\uD83E[\uDD10-\uDD18\uDD80-\uDD84\uDDC0]/g,"");
		},
		//JSON按照Key的ASCII码排序，使用SHA-256生成签名
		sign: function(sha256, obj) {
			return sha256(JSON.stringify(obj, Object.keys(obj).sort()));
		},
		//从url地址获取参数
		getParam: function(name) {
			var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");　　
			if(reg.test(location.href)) {
				window["url_" + name] = unescape(RegExp.$2.replace(/\+/g, " ")).split("#")[0];
				return unescape(RegExp.$2.replace(/\+/g, " "));
			} else {
				return "";
			}
		},
		bankCard: function(cardNo) {
			var tmp = true,
				total = 0;
			for(var i = cardNo.length; i > 0; i--) {
				var num = cardNo.substring(i, i - 1);
				if(tmp = !tmp, tmp) num = num * 2;
				var gw = num % 10;
				total += (gw + (num - gw) / 10);
			}
			return total % 10 == 0;
		},
	}

	global.Util = Util;
})(window);
