//mobileBind.js
//获取应用实例
var app = getApp();

var userApi = app.initApi("UsercontrollerApi");

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        form: {
            mob: "",
            code: ""
        },
        disabled: true, //disabled
        countdown: 60,
        showGetCode: true
    },
    onReady: function (e) {

    },
    onLoad: function () {

    },
    inputVal: function(event) {
        var mobData = this.data.form.mob, codeData = this.data.form.code;
        if (event.currentTarget.id == "mob") {
            mobData = event.detail.value;
        } else {
            codeData = event.detail.value;
        }
        this.setData({
            form: {
                mob: mobData,
                code: codeData
            }
        });
        if (mobData.length == 11 && codeData.length == 6) {
            this.setData({
                disabled: false
            });
        } else {
            this.setData({
                disabled: true
            });
        }
    },
    getCode: function() {
        var that = this;
        if (!/^1[34578]\d{9}$/.test(this.data.form.mob)) {
            app.showDialog("请输入正确的手机号!");
            return false;
        }
        //绑定手机号码的接口
        userApi.boundModileVerifycodeUsingGET(that.data.form.mob, function (res) {
            var timer;
            app.handleApiFail(res, function() {
                that.setData({
                    showGetCode: false
                });
                timer = setInterval(function() {
                    var countdown = that.data.countdown - 1;
                    if (countdown == 0) {
                        that.setData({
                            showGetCode: true,
                            countdown: 60
                        });
                        clearInterval(timer);
                    } else {
                        that.setData({
                            countdown: countdown
                        });
                    }
                }, 1000);
            });
        });
    },
    submitForm(e) {
        var that = this;
        var params = {
            mob: that.data.form.mob,
            code: that.data.form.code
        };
        if (!/^1[23456789]\d{9}$/.test(params.mob) || !/^\d+$/.test(params.code)) {
            app.showDialog("请输入正确的验证信息!");
            return false;
        }
        userApi.boundModileUsingPOST(params.mob, params.code, function (res) {
          console.log(res);
          console.log('pipipipipipi');
            app.handleApiFail(res, function() {
                app.showTips('手机验证成功', function() {
                  //是否存在该手机号码
                    if (res.data.item && res.data.item.isExistModile) {
                        app.globalData.userInfo = null;
                      wx.redirectTo({ url: "/pages/regSuccess/regSuccess" });
                        // app.getUserInfo(function() {
                        //   //获取用户信息
                        //     userApi.getMyProfileUsingGET(function (res) {
                        //         app.authStepAction(res.data.item.authStep, false, function() {
                        //             wx.navigateBack();
                        //         });
                        //     });
                        // });
                    } else {
                        userApi.getMyProfileUsingGET(function (res) {
                            app.authStepAction(res.data.item.authStep, false, function() {
                                wx.navigateBack();
                            });
                        });
                    }
                });
            }, function(res) {
                if (res.data.error == 410) {
                    app.showTips('手机验证成功', function() {
                        app.globalData.userInfo = null;
                        app.getUserInfo(function() {
                          //获取用户信息
                            userApi.getMyProfileUsingGET(function (res) {
                                app.authStepAction(res.data.item.authStep, false, function() {
                                    wx.navigateBack();
                                });
                            });
                        });
                    });
                } else {
                    wx.hideToast();
                    wx.showModal({
                        title: '提示信息',
                        showCancel: false,
                        content: res.data.error_description,
                        success: function (resu) {
                          console.log(resu)
                            // if (modalCallback && typeof modalCallback == "function") {
                            //     modalCallback(res, resu);
                            // }
                        }
                    });
                }
            });
        });
        return false;
    }
});

