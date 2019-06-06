var app = getApp();

var isSelect = false;
var util = require('../../utils/util.js');

var umorderApi = app.initApi("UmordercontrollerApi");
var userApi = app.initApi("UsercontrollerApi");


Page({
    data: {
        assetsPath: app.globalData.assetsPath,
        myCoupons: []
    },
    onLoad: function (opt) {
        var that = this;
        if (opt.cid) {

            isSelect = true;
            umorderApi.findCouponListUsingPOST(function (res) {
                app.handleApiFail(res, function() {
                    that.setData({
                        myCoupons: fmtDate(res.data.items)
                    });
                });
            });
        } else {

            isSelect = false;
            userApi.findTripListUsingPOST(function (res) {
                app.handleApiFail(res, function() {
                    that.setData({
                        myCoupons: fmtDate(res.data.content)
                    });
                });
            });
        }
    },
    selectFitCoupon: function (event) {
        if (isSelect) {
            app.globalData.selectedCoupon = this.data.myCoupons[event.currentTarget.id];
            wx.navigateBack();
        }
    }
});

function fmtDate(content) {
    var jouList = [];
    for (var i = 0; i < content.length; i++) {
        content[i].time = util.formatTime(new Date(content[i].expireDate)).split(" ")[0],
        jouList.push(content[i]);
    }
    return jouList;
}