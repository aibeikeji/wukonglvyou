//userInfo.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

var userApi = app.initApi("UsercontrollerApi");

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        articleList: []
    },
    onReady: function (e) {

    },
    onLoad: function (opt) {
        var that = this;
        userApi.userGuideDetailUsingGET(opt.cid, function(res) {
          console.log(res.data);
          if (res.data.item.id == 19) {
            wx.navigateTo({
              url: '/pages/abouts/abouts',
            })
          }
          else{
            app.handleApiFail(res, function () {
              WxParse.wxParse('article', 'html', res.data.item.content, that, 5);
              that.setData({
                title: res.data.item.title
              });
            });

          }   
        });
    }
});

