//userInfo.js
//获取应用实例
var app = getApp();

var umorderApi = app.initApi("UmordercontrollerApi");
var userApi = app.initApi("UsercontrollerApi");
var sysApi = app.initApi("AppparamcontrollerApi");

var util = require('../../utils/util.js');

Page({
  data: {
    userInfos: {
      headImgPath: app.globalData.assetsPath + "wx-applet/portrait.png"
    },
    assetsPath: app.globalData.assetsPath,
    polyline: [],
    markers: [],
    share: false,
    item: {}
  },
  onReady: function(e) {
    var that = this;
    // app.getUserInfo(function(userInfo) {
    //   that.setData({
    //     userInfo: userInfo
    //   });
    // });
  },
  onShow: function() {

    var that = this;
    //此处是获取用户芝麻信用系列的接口
    userApi.getMyProfileUsingGET(function(res) {
      app.handleApiFail(res, function() {
        if (res.data.item) {
          var item = res.data.item;
          that.setData({
            userInfo: item
          });
          app.globalData.userData = item;
        }
      });
    });
  },
  onLoad: function(opt) {
    console.log(this.data)
    console.log(app.globalData.assetsPath)
    var that = this;
    if (opt.cid) {
      //调用的是订单详情
      umorderApi.profileUsingGET(opt.cid, {
        pointType: "GCJ02"
      }, function(res) {
        app.handleApiFail(res, function() {
          console.log(res)
          var item = res.data.item;
          that.setData({
            item: item,
            beginTime: fmtDate(item.beginTime),
            time: item.rideTime,
            sysCode: item.returnMachineCode || '',
            price: item.price,
            finishTime: fmtDate(item.finishTime),
            beginLocationDetails: item.beginLocationDetails||'',
            endLocaitonDetails: item.endLocaitonDetails||'',
            borrowType: item.borrowType || "",
            returnType: item.returnType || "",
            longitude: (function() {
              if (item.beginLocation.x) {
                return item.beginLocation.x;
              } else if (item.endLocation.x) {
                return item.endLocation.x;
              } else {
                return '116.4071700000';
              }
            }()),
            latitude: (function() {
              if (item.beginLocation.y) {
                return item.beginLocation.y;
              } else if (item.endLocation.y) {
                return item.endLocation.y;
              } else {
                return '39.9046900000';
              }
            }()),
            includePoints: (function() {
              if (item.beginLocation.x && item.endLocation.x) {
                return [{
                  latitude: item.beginLocation.y,
                  longitude: item.beginLocation.x
                }, {
                  latitude: item.endLocation.y,
                  longitude: item.endLocation.x
                }];
              } else {
                return []
              }
            }()),
            markers: (function() {
              if (item.returnType == "transfer" && item.borrowType == "transfer") {
                return []
              } else if (item.returnType == "transfer") {
                return [{
                  iconPath: "/map/starting_point.png",
                  id: 0,
                  latitude: item.beginLocation.y || 0,
                  longitude: item.beginLocation.x || 0,
                  width: 28,
                  height: 34
                }];
              } else if (item.borrowType == "transfer") {
                return [{
                  iconPath: "/map/end_point.png",
                  id: 1,
                  latitude: item.endLocation.y || 0,
                  longitude: item.endLocation.x || 0,
                  width: 32,
                  height: 60
                }];
              } else {
                return [{
                  iconPath: "/map/end_point.png",
                  id: 1,
                  latitude: item.endLocation.y || 0,
                  longitude: item.endLocation.x || 0,
                  width: 32,
                  height: 60
                }, {
                  iconPath: "/map/starting_point.png",
                  id: 0,
                  latitude: item.beginLocation.y || 0,
                  longitude: item.beginLocation.x || 0,
                  width: 28,
                  height: 34
                }]
              }
            }())
          });

        });
      });
    }

  },
  onShareAppMessage: function() {
    return {
      title: app.globalData.sysInfo.shareTitle,
      path: '/pages/index/index'
    }
  },
  showShare: function() {
    this.setData({
      share: true
    });
  },
  hideShare: function() {
    this.setData({
      share: false
    });
  }
});


function fmtDate(time) {
  return util.formatTime(new Date(time));
}