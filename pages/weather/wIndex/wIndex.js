//userInfo.js
//获取应用实例
var app = getApp();

var weatherController = require('../../../sdk/src/api/WeathercontrollerApi');
var weatherApi = new weatherController();

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        userData: {
            headImgPath: app.globalData.assetsPath + "wx-applet/portrait.png"
        },
        scenic: null
    },
    onReady: function (e) {
        console.log(111);
    },
    onLoad: function (opt) {
        var that = this;
        if (opt && opt.sid) {
            weatherApi.findDetailUsingGET(opt.sid, function (res) {
              console.log(res)
                app.handleApiFail(res, function () {
                    if (res.data.item) {
                        that.setData({
                            scenic: res.data.item
                        });
                        wx.setNavigationBarTitle({
                            title: res.data.item.scenicName
                        });
                    }
                });
            });
        } else {
            wx.getLocation({
                type:"gcj02",
                success: function (res) {
                    weatherApi.findByLocationUsingGET({x: res.longitude, y: res.latitude, pointType: "GCJ02"}, function (res) {
                      console.log(res)
                        app.handleApiFail(res, function () {
                            if (res.data.item) {
                                that.setData({
                                    scenic: res.data.item
                                });
                                wx.setNavigationBarTitle({
                                    title: res.data.item.scenicName
                                });
                            }
                        });
                    });
                }
            });
        }
    },
    selectScenic: function() {
        wx.navigateTo({
            url: '/pages/weather/wSearch/wSearch'
        });
    }
});

