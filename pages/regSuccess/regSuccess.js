//regSuccess.js
//获取应用实例
var app = getApp();

var userApi = app.initApi("UsercontrollerApi");

Page({
  data: {
    assetsPath: app.globalData.assetsPath,
    code: ''
  },
  onReady: function(e) {},
  onLoad: function() {

  },
  skipCode: function() {
    wx.navigateBack();
  },
  inputVal: function(event) {
    this.setData({
      code: event.detail.value
    });
  },
  inputCode: function() {
    if (this.data.code.length > 0) {
      userApi.boundInviteCodeUsingPOST(this.data.code, function(res) {
        app.handleApiFail(res, function() {
          app.showTips("认证成功", function() {

          });
        });
      });
    }
    var urls=this.data.assetsPath;
    wx.getStorage({
      key: 'SMJG',
      success: function(res) {
        var value = wx.getStorageSync('access_token');
        var headvalue = 'Bearer' + ' ' + value;
        wx.request({
          url: urls+ 'api/get_deposit?qrCode=' + res.data.qrcode,
          header: {
            Authorization: headvalue
          },
          method: 'get',
          success: function(res) {
            //console.log(res)
            if (res.data.item == 0) {
              wx.navigateTo({
                url: "/pages/unLockLoading/unLockLoading?code=" + encodeURIComponent(res.data.qrcode) + "&x=" + res.data.x + "&y=" + res.data.y
              });
            } else {
              wx.navigateTo({
                url: "/pages/deposit/deposit"
              });
            }
          }
        })
      },
    })

  }
});

function judge(e) { //判断是否交了押金

}