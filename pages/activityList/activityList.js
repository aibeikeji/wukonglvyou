//userInfo.js
//获取应用实例
var app = getApp();
var activityApi = app.initApi("ActivitycontrollerApi");
var util = require('../../utils/util.js');
var jouList = [];
var isLoading = false;
Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        jList: [],
        listType: ""
    },
    onReady: function (e) {

    },
    onLoad: function () {
        var that = this;
        jouList = [];
        loadData(that);
    },
    selectType: function(e) {
        var that = this;
        jouList = [];
        //lastTime = null;
        if (isLoading) return;
        isLoading = true;
        wx.showLoading();
        if (e.currentTarget.id == 'today') {
            loadData(that);
        } else if (e.currentTarget.id == 'history') {
            loadDataHistory(that);
        }
    },
    activityDetails: function(e) {
        var that = this;
        wx.navigateTo({
            url: '/pages/activityDetails/activityDetails?activityId=' + e.currentTarget.dataset.aid
        });
    }
});


function loadData(that) {
    activityApi.listActivityUsingPOST("today", function (res) {
        app.handleApiFail(res, function() {
            wx.hideLoading();
            if (res.data.success) {
                var content = res.data.items;
                for (var i = 0; i < content.length; i++) {
                    jouList.push({
                        id: content[i].id,
                        title: content[i].activityName,
                        cover: content[i].cover,
                        beginDate: util.formatTime(new Date(content[i].beginDate)).replace(/\-/g, ".").split(" ")[0],
                        endDate: util.formatTime(new Date(content[i].endDate)).replace(/\-/g, ".").split(" ")[0],
                        days: util.getDays(content[i].beginDate, content[i].endDate),
                        status: content[i].status,
                        totalNumber: content[i].totalNumber
                    });
                }
                that.setData({
                    listType: "today",
                    jList: jouList
                });
            }
        });
        isLoading = false;
    });
}

function loadDataHistory(that) {
    activityApi.listActivityUsingPOST("history", function (res) {
        app.handleApiFail(res, function() {
            wx.hideLoading();
            if (res.data.success) {
                var content = res.data.items;
                for (var i = 0; i < content.length; i++) {
                    jouList.push({
                        id: content[i].id,
                        title: content[i].activityName,
                        cover: content[i].cover,
                        beginDate: util.formatTime(new Date(content[i].beginDate)).replace(/\-/g, ".").split(" ")[0],
                        endDate: util.formatTime(new Date(content[i].endDate)).replace(/\-/g, ".").split(" ")[0],
                        days: util.getDays(content[i].beginDate, content[i].endDate),
                        status: content[i].status,
                        totalNumber: content[i].totalNumber
                    });
                }

                that.setData({
                    listType: "history",
                    jList: jouList
                });
            }
        });
        isLoading = false;
    });
}

