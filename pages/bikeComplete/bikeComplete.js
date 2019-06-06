var app = getApp();

var umorderApi = app.initApi("UmordercontrollerApi");

var backPage;

Page({
    data: {
        assetsPath: app.globalData.assetsPath,
        price: 0,
        id: 0,
        sysCode: "",
        rideTime: 0,
        fitCoupon: {
            amount: 0,
            id: null
        }
    },
    onReady: function (e) {
    },
    onShow: function() {
        if (backPage) {
            wx.navigateBack();
        }
        console.log(app.globalData.selectedCoupon);
        if (app.globalData.selectedCoupon.id) {
            this.setData({
                fitCoupon: {
                    amount: app.globalData.selectedCoupon.amount,
                    id: app.globalData.selectedCoupon.id
                }
            })
        }
        app.globalData.selectedCoupon = {};
    },
    onLoad: function (opt) {
        var that = this;
        backPage = false;
        umorderApi.findNotPayTripUsingGET({}, function (res) {
            app.handleApiFail(res, function() {
                var item = res.data.item;
                console.log("res.data.item");
                console.log(item)
                that.setData({
                    price: item.price,
                    id: item.umbrellaId,
                    sysCode: item.umbrellaCode,
                    rideTime: item.rideTime,
                    fitCoupon: item.fitCoupon,
                    orderCode: item.orderCode
                });
            });
        });
    },
    payAction: function () {
        var that = this, _tid = "", _cid = that.data.orderCode;
        if (that.data.fitCoupon) {
            _tid = that.data.fitCoupon.id
        }
        umorderApi.paymetUsingPOST(_cid, {cid: _tid}, function (res) {
            app.handleApiFail(res, function () {
                if (res.data.item) {
                    var paymet = res.data.item.weiXinPaymet;
                    wx.requestPayment({
                        'timeStamp': paymet.timeStamp,
                        'nonceStr': paymet.nonceStr,
                        'package': "prepay_id=" + paymet.prepayId,
                        'signType': 'MD5',
                        'paySign': paymet.sign,
                        'success': function (res) {
                            app.showTips("支付成功", function() {
                                backPage = true;
                                wx.navigateTo({
                                    url: '/pages/journeyDetails/journeyDetails?cid=' + _cid
                                });
                            });
                        },
                        'fail': function (res) {
                            console.log(res);
                        }
                    })
                } else {
                    app.showTips("支付成功", function() {
                        backPage = true;
                        wx.navigateTo({
                            url: '/pages/journeyDetails/journeyDetails?cid=' + _cid
                        });
                    });
                }
            });
        });
    },
    selectFitCoupon: function() {
        var that = this;
        wx.navigateTo({
            url: '/pages/myCoupon/myCoupon?cid=' + that.data.id
        });
    },
    journeyDetailsAction: function() {
        var that = this;
        wx.navigateTo({
            url: '/pages/journeyDetails/journeyDetails?cid=' + that.data.orderCode
        });
    },
    feedbackAction: function() {
        var that = this;
        wx.navigateTo({
            url: '/pages/feedback/feedback?type=3&sysCode=' + that.data.sysCode + "&tripId=" + that.data.orderCode
        });
    }
});