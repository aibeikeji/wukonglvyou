var app = getApp();

var userApi = app.initApi("UsercontrollerApi");

Page({
  data: {
    money: 0,
    code: "",
    assetsPath: app.globalData.assetsPath,
    share: false
  },
  onLoad: function () {

    var that = this;

    that.setData({
      code: app.globalData.userData.inviteCode
    });

    userApi.queryInviteAmountUsingGET(function(res) {
        app.handleApiFail(res, function () {
          that.setData({
            money: res.data.item
          });
        });
    });

  },
  onShareAppMessage: function () {
    return {
      title: app.globalData.sysInfo.inviteTitle,
      path: '/pages/index/index'
    }
  }
})