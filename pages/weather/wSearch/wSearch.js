//userInfo.js
//获取应用实例
var app = getApp();

var weatherController = require('../../../sdk/src/api/WeathercontrollerApi');
var weatherApi = new weatherController();

var keywordsTimer;

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        userData: {
            headImgPath: app.globalData.assetsPath + "wx-applet/portrait.png"
        },
        province: [],
        selectedProvince: {},
        selectedCity: {},
        showProvince: false,
        city: [],
        keywords: "",
        showSearchList: false,
        searchResult: [],
        scenicList: [],
        currentProvince: ""
    },
    onReady: function (e) {
    },
    onLoad: function () {
        var that = this;
        wx.getLocation({
            type:"gcj02",
            success: function (res) {

                weatherApi.queryCurrentProviceUsingGET(res.longitude, res.latitude, {pointType: "GCJ02"}, function (res) {
                    app.handleApiFail(res, function () {
                        if (res.data.item) {
                            that.setData({
                                currentProvince: res.data.item.pName,
                                currentProvinceCode: res.data.item.pCode,
                                selectedProvince: {
                                    name: res.data.item.pName,
                                    code: res.data.item.pCode
                                },
                                selectedCity: {
                                    name: res.data.item.cName,
                                    code: res.data.item.cCode
                                }
                            });

                            findCity(that, res.data.item.pCode, res.data.item.cCode);

                            findScenic(that, res.data.item.cCode);

                        }
                    });
                });
            }
        });



        this.setData({
            userData: app.globalData.userData
        });
    },
    selectProvince: function() {
        var that = this;


        if (that.data.showProvince) {
            that.setData({
                showProvince: false
            })
        } else {

            if (that.data.province.length > 0) {
                that.setData({
                    showProvince: true
                })
            } else {
                wx.showLoading({
                    title: ""
                });
                weatherApi.findProvinceUsingGET(function (res) {
                    app.handleApiFail(res, function () {
                        wx.hideLoading();
                        that.setData({
                            province: res.data.items,
                            showProvince: true
                        })
                    });
                });
            }
        }
    },
    clickProvince: function(e) {
        var code = e.currentTarget.dataset.code;
        this.setData({
            selectedProvince: {
                name: e.currentTarget.dataset.name,
                code: code
            },
            cityScrollTop: 0
        });
        findCity(this, code);
    },
    clickCity: function(e) {
        var code = e.currentTarget.dataset.code;
        this.setData({
            cityCode: code
        });
        findScenic(this, code);
    },
    searchInput: function(event) {
        var that = this;
        var keywords = event.detail.value;

        this.setData({
            keywords: keywords
        });

        if (keywords == "") {
            that.setData({
                searchResult: [],
                showSearchList: false
            });
            clearTimeout(keywordsTimer);
        } else {
            clearTimeout(keywordsTimer);
            keywordsTimer = setTimeout(function() {
                weatherApi.findScenicUsingGET({code: that.data.selectedProvince.code, resultNum: 10, scenicName: keywords}, function(res) {
                    app.handleApiFail(res, function () {
                        wx.hideLoading();
                        if (keywords == "") return;
                        that.setData({
                            searchResult: res.data.items,
                            showSearchList: true
                        })
                    });
                });
            }, 300);
        }
    },
    clearSearch: function() {
        var that = this;
        that.setData({
            keywords: "",
            showSearchList: false
        });
    },
    clickScenic: function(e) {
        var that = this;

        wx.redirectTo({
            url: '/pages/weather/wIndex/wIndex?sid=' + e.currentTarget.dataset.id
        });

    },
    clickCurrentProvince: function() {
        var that = this;
        var code = that.data.currentProvinceCode;

        that.setData({
            selectedProvince: {
                name: that.data.currentProvince,
                code: code
            },
            cityScrollTop: 0
        });
        findCity(that, code);
    }
});


function findCity(that, code, cityCode) {
    wx.showLoading({
        title: ""
    });
    weatherApi.findCityUsingGET(code, function(res) {
        app.handleApiFail(res, function () {
            wx.hideLoading();
            that.setData({
                city: res.data.items,
                cityCode: cityCode || res.data.items[0].code,
                showProvince: false
            });
            findScenic(that, that.data.cityCode);
        });
    });
}

function findScenic(that, code) {

    wx.showLoading({
        title: ""
    });

    weatherApi.findScenicUsingGET({code: code}, function(res) {
        app.handleApiFail(res, function () {
          console.log(res)
            wx.hideLoading();
            that.setData({
                scenicList: res.data.items
            })
        });
    });
}

