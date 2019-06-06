//userInfo.js
//获取应用实例
var app = getApp();

var userController = require('../../sdk/src/api/UsercontrollerApi');
var userApi = new userController();

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        userData: {
            headImgPath: app.globalData.assetsPath + "wx-applet/portrait.png"
        },
      Authentication:false,
      userReal:'',

    },
    renZheng:function(){
      var that = this;
      var value = wx.getStorageSync('access_token');
      var headvalue = 'Bearer' + ' ' + value;
      wx.request({
        url: that.data.assetsPath + 'api/userprofile',
        header: {
          Authorization: headvalue
        },
        method: 'get',
        success: function (res) {
          wx.hideLoading()
          console.log(res.data.item.idCard=='');
          if (res.data.item.idCard == '') {
            that.setData({
              Authentication: false,
            });
          } else {
            that.setData({
              Authentication: true,
              userReal: res.data.item.name
            });
          }
        }
      })
    },
  //跳转到实名制认证
  jumpurl: function (e) {
    if (!this.data.Authentication) {
      wx.redirectTo({
        url: '/pages/certification/certification',
      })
    }
  },
  aa:function(){
  },
    onShow: function (e) {
      this.renZheng();
    },
    onLoad: function () {
      wx.showLoading({
        title: '加载中',
      });
        this.setData({
            userData: app.globalData.userData,
        });
        setTimeout(function() {
            wx.vibrateLong();//改方法是手机抖动
        }, 5000);
    },
    userCertify: function() {
        userApi.getMyProfileUsingGET(function (res) {
            if (res.data.item.authStep == 1) {
                wx.redirectTo({
                    url: '/pages/mobileBind/mobileBind'
                });
            } else if (res.data.item.authStep == 2) {
                wx.redirectTo({
                    url: '/pages/myCharge/myCharge'
                });
            }
        });
    },
});

