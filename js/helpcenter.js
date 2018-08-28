(function() {
	FastClick.attach(document.body);
	var data = {
		"b": [{
			"ques": "1、如果回收机断网可以取货吗？",
			"answer": "如果回收机处于断网状态是无法进行取货操作，请等待回收机网络恢复正常后在前往回收机进行取货。"
		}, {
			"ques": "2、如果取货时遇到回收机故障怎么办？",
			"answer": "在取货过程中若遇到箱门无法正常打开或关闭等故障时，可及时拨打客服电话进行故障申报，我们会派专业维修人员前往检修。"
		}, {
			"ques": "3、APP账号密码与取货时的账号密码是相同的吗？",
			"answer": "APP账号密码与回收机取货时的账号密码使用同一套密码，当您在APP中操作修改登录密码时回收机的登录密码也会同时修改。"
		}, {
			"ques": "4、想更换登录绑定的手机号怎么办？",
			"answer": "若您想修改登录绑定的手机号需联系客服人员并按要求提供相关的资料进行手机号更换。"
		}, {
			"ques": "5、回收机回收哪些垃圾类型？",
			"answer": "现在支持的回收类型包括：金属、塑料、纺织物、饮料瓶、纸类、玻璃、有害垃圾；其中您回收金属、塑料、纺织物、饮料瓶和纸类等品类的货物时需要支付相关费用，玻璃与有害垃圾类型您可免费回收。"
		}, {
			"ques": "6、回收时存在不符合分类的其他物品如何处理？",
			"answer": "在回收的过程中若发现回收的货物中有回收品类之外的其他杂物从而影响了货物重量，导致您的订单金额有差异您可与客服人员联系进行沟通。"
		}, {
			"ques": "7、如果回收时未全部取走货物是否有影响？",
			"answer": "您每次取货的订单重量是根据累计投递重量计算的，您开箱取货后我们会清空回收箱的订单重量重新计算，故您若未全部取走货物下次取货时不会重复计费。"
		}],
		"c": [{
			"ques": "1、如何找到回收点？",
			"answer": "您可在首页找到【附近回收点】，点击“查看更多”，即可查找到离你最近的回收点。"
		}, {
			"ques": "2、没带手机可以投递吗？",
			"answer": "没带手机也可在回收机上输入您的手机号码登录进行投递。"
		}, {
			"ques": "3、为什么回收机有时候不能使用扫码投递？",
			"answer": "二维码生成系统将定时维护，在回收机上输入手机号同样可以进行投递。"
		}, {
			"ques": "4、回收机支持哪些垃圾类型的投递？",
			"answer": "现在支持投递的类型包括：塑料瓶、服装及纺织物、废旧金属、塑料垃圾、玻璃、纸制品、有害垃圾（暂不支持有偿投递），具体品类以站点实际情况为准。"
		}, {
			"ques": "5、严禁投递的物品有哪些？",
			"answer": "易燃易爆物品、液体、食品等。如投递以上物品，将被追究法律责任。"
		}, {
			"ques": "6、我的投递是如何计费的？",
			"answer": "投递后将会由系统计算投递数量及总价，环保金精确到分，以实际计算结果为准。"
		}, {
			"ques": "7、环保金提现规则。",
			"answer": "每次投递获得的环保金将会转入您的账户，环保金≥10元即可提现，目前仅支持提现至您的银行卡，1-3个工作日内到账。未来将开通更多的提现通道。"
		}, {
			"ques": "8、投递的垃圾将如何处理？",
			"answer": "投递的垃圾由我们的回收人员统一运至我们管理的城市回收站进行科学分拣，可回收垃圾将交由专业公司进行再生循环利用，不可回收垃圾将通过各种形式转化为能源、化肥等资源，最大程度减少因垃圾产生的污染及浪费。"
		}]
	}

	initPage(data);
	// 事件绑定
	$('.content-hc').on('click', '#go_online_service', function(e) {
		goOnlineService()
	})
	$('.list-ques').on('click', '.ques', function(e) {
		var $target = $(e.currentTarget),
			$item = $target.parent();
		if($item.hasClass('open')) {
			$item.removeClass('open');
		} else {
			$item.addClass('open');
			if($item[0].id == "item7") {
				var h = $(document).height() - $(window).height();
				$(document).scrollTop(h);
			}
		}
	})

	// 调起在线客服
	function goOnlineService() {
		if(!window.Bridge.isAPP()) {
			return;
		}
		window.Bridge.callHandler('openCustomerService', '')
	}

	// 判断在哪个端就使用对应的文案
	function initPage(data) {
		if(window.Bridge.isAPP()) {
			var _data = window.Bridge.isAPP2b() ? data.b : data.c,
				_temp = '';
			for(var i = 0; i < _data.length; i++) {
				_temp += '<li class="item" id="item' + [i] + '">' +
					'<div class="ques">' + _data[i].ques + '<i class="arrow"></i></div>' +
					'<p class="answer">' + _data[i].answer + '</p>' +
					'</li>';
			}
			$('.list-ques').html(_temp);
		}
	}

})();
