//userInfo.js
//获取应用实例
var app = getApp();

var userController = require('../../sdk/src/api/UsercontrollerApi');
var userApi = new userController();

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        problem2: [],
        selectId: null
    },
    onReady: function (e) {
    },
    onLoad: function (opt) {
        var that = this;
        that.setData({
            selectId: opt.sid
        });
        userApi.findFeedbackTypeListUsingGET(opt.type, function(res) {
            var problem2 = [];
            app.handleApiFail(res, function() {
                var item = res.data.items;
                for(var i = 5; i < item.length; i++) {
                    problem2.push({
                        id: item[i].id,
                        name: item[i].typeName
                    });
                }
                that.setData({
                    problem2: problem2
                });
            });
        });
    },
    selectFeedback: function(event) {
        var sid = event.currentTarget.id;
        this.setData({
            selectId: sid
        });
        app.globalData.problemSelectId = sid;
        wx.navigateBack();
    }
});

