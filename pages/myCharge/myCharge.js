var app = getApp();

var userApi = app.initApi("UsercontrollerApi");

Page({
  data: {
    money: 99,//押金数目
    assetsPath: app.globalData.assetsPath
  },
  onLoad: function () {
    var that = this;
    //此处是从后台接口获取 需要交的押金数目
    userApi.getDepositUsingGET(function (res) {
      that.setData({
        money: res.data.item
      });
    });
  },
  //此处调用的接口是充值押金的接口
  payPledgeCash: function () {
    userApi.paymetUsingPOST({}, function (res) {
      if (res.data.success) {
        var paymet = res.data.item.weiXinPaymet;//支付方式
        wx.requestPayment({
          'timeStamp': paymet.timeStamp,
          'nonceStr': paymet.nonceStr,
          'package': "prepay_id=" + paymet.prepayId,
          'signType': 'MD5',
          'paySign': paymet.sign,
          'success': function (res) {
            app.showTips("押金充值成功!", function () {
              //如果押金充值成功
              userApi.getMyProfileUsingGET(function (res) {
                //此处的接口是获取用户信息
                //authStep 认证步骤
                //如果是1进行手机验证，2是押金充值 3是实名制认证-目前这个版本需要去掉实名制认证步骤 4是认证完成
                if (res.data.item.authStep == 1) {
                  wx.redirectTo({
                    url: '/pages/mobileBind/mobileBind'
                  });
                } else if (res.data.item.authStep == 2) {
                  wx.redirectTo({
                    url: '/pages/myCharge/myCharge'
                  });
                } else {
                  wx.navigateBack();
                }
              });
            });
          },
          'fail': function (res) {
            console.log(res);
          }
        })
      }

    })

  }
})