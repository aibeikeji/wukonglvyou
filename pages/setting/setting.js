//userInfo.js
//获取应用实例
var app = getApp();

var userApi = app.initApi("UsercontrollerApi");

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        articleList: [],
      url:'/pages/article/article?cid=',
      url2:"jsdbfjkdsbdks"
    },
    onReady: function (e) {

    },
    onLoad: function (opt) {
        var that = this;
        if (opt.type == 1) {
            wx.setNavigationBarTitle({
                title: '用户指南'
            });
        } else {
            wx.setNavigationBarTitle({
                title: '设置'
            });
        }
        userApi.userGuideListUsingGET(opt.type, function(res) {
          console.log(res)
            app.handleApiFail(res, function() {
                that.setData({
                    articleList: res.data.items
                });
              console.log(that.data.articleList)
            });
        });
    }
});

