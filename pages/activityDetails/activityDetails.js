//userInfo.js
//获取应用实例
var app = getApp();

var activityApi = app.initApi("ActivitycontrollerApi");
var util = require('../../utils/util.js');

var screenInfo = wx.getSystemInfoSync();
var sW = screenInfo.windowWidth;

Page({
    data: {
        assetsPath: app.globalData.assetsPath,
        activity: {},
        longitude: 0,
        latitude: 0,
        polyline: [{
            points: [],
            color: "#0091ff",
            width: 6
        }],
        controls: [{
            id: 1,
            iconPath: '/map/jgb/introduce_yellow.png',
            position: {
                left: sW - 90,
                top: 20,
                width: 90,
                height: 27
            },
            clickable: true
        }]
    },
    controltap(e) {
        var that = this;

        console.log(e.controlId);

        switch (e.controlId) {
            case 1:   // 个人中心
                that.viewDetails();
                break;
            default:
                break;
        }
    },
    onReady: function (e) {

    },
    onLoad: function (opt) {
        var that = this;
        //opt.activityId
        var polyline = {
            points: [],
            color: "#0091ff",
            width: 6
        };
        var includePoints = [];
        var optionals = {pointType: "GCJ02"};

        if (opt.uid) {
            optionals.uid =  opt.uid
        }

        activityApi.activityDetailUsingPOST(opt.activityId, optionals, function (res) {
            console.log(opt.activityId);
            console.log(optionals);
            console.log("================");
            console.log(res);
            app.handleApiFail(res, function() {
                if (res.data.success) {
                    var item = res.data.item;

                    item.days = util.getDays(item.beginDate, item.endDate);
                    item.beginDate = util.formatTime(new Date(item.beginDate)).replace(/\-/g, ".").split(" ")[0];
                    item.endDate = util.formatTime(new Date(item.endDate)).replace(/\-/g, ".").split(" ")[0];

                    if (item.log && item.log.beginDate) {
                        item.log.beginDate = util.formatTime(new Date(item.log.beginDate)).replace(/\-/g, ".");
                    }

                    if (item.log && item.log.cyclingPoints.length > 0) {
                        for (var i = 0; i < item.log.cyclingPoints.length; i++) {
                            polyline.points.push({
                                latitude: item.log.cyclingPoints[i].pointLat,
                                longitude: item.log.cyclingPoints[i].pointLon
                            });
                        }
                        if (item.log.status != 20) {
                            includePoints = polyline.points;
                            that.setData({
                                activity: item,
                                polyline: [polyline],
                                includePoints: includePoints,
                                markers: [{
                                    iconPath: "/map/jgb/activity_start_icon.png",
                                    id: 0,
                                    latitude: includePoints[0].latitude || 0,
                                    longitude: includePoints[0].longitude || 0,
                                    width: 24,
                                    height: 24
                                },{
                                    iconPath: "/map/jgb/activity_end_icon.png",
                                    id: 1,
                                    latitude: includePoints[includePoints.length - 1].latitude || 0,
                                    longitude: includePoints[includePoints.length - 1].longitude || 0,
                                    width: 24,
                                    height: 24
                                }]
                            });
                        } else {
                            wx.getLocation({
                                type: 'gcj02',
                                success: function(res) {
                                    polyline.points.push({
                                        latitude: res.latitude,
                                        longitude: res.longitude
                                    });
                                    includePoints = polyline.points;
                                    that.setData({
                                        activity: item,
                                        polyline: [polyline],
                                        includePoints: includePoints,
                                        markers: [{
                                            iconPath: "/map/jgb/activity_start_icon.png",
                                            id: 0,
                                            latitude: includePoints[0].latitude || 0,
                                            longitude: includePoints[0].longitude || 0,
                                            width: 30,
                                            height: 30
                                        }]
                                    });
                                }
                            });
                        }
                    } else {
                        if (item.log && item.log.status != 40) {
                            wx.getLocation({
                                type: 'gcj02',
                                success: function(res) {
                                    that.setData({
                                        activity: item,
                                        latitude: res.latitude,
                                        longitude: res.longitude
                                    });
                                }
                            });
                        } else {
                            that.setData({
                                activity: item
                            });
                        }
                    }

                    wx.setNavigationBarTitle({
                        title: item.activityName
                    });
                }
            });
        });

    },
    viewDetails: function() {
        var that = this;
        wx.showModal({
            title: '活动简介',
            showCancel: false,
            content: that.data.activity.introduce,
            success: function (res) {

            }
        });
    },
    onShareAppMessage: function () {
        var that = this;
        return {
            title: that.data.activity.activityName,
            path: '/pages/activityDetails/activityDetails?activityId=' + that.data.activity.id + "&uid=" + that.data.activity.uid,
            success: function(res) {
                // 转发成功
                wx.showToast({
                    icon: 'success',
                    title: '转发成功!'
                });
                activityApi.addShareTimesUsingPOST(that.data.activity.id, function() {
                    var activity = that.data.activity;
                    activity.shareTimes += 1;
                    that.setData({
                        activity: activity
                    });
                });
            }
        }
    }
});