App({
  onLaunch: function() {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    wx.setStorageSync('logs', logs);
    wx.getUserInfo({
      success: function (res) {
       
      }, fail: function (e) {
        wx.reLaunch({
          url: '/pages/welcome/welcome'
        });
      }
    });
  },
  getUserInfo: function(cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      // wx.setStorageSync('access_token', "");
      wx.login({
        success: function(resu) {
          that.userLogin(resu.code, "123456", cb);
          //登陆接口之后获取用户的信息-主要是获取用户是否手机验证没有
          // setTimeout(function() {
          //   that.getPersonMessage();
          // }, 2000)
        },
        fail: function(resu) {
          console.log(resu);
        }
      });
    }
  },
  globalData: { //
    userInfo: null,
    access_token: "",
    assetsPath: "https://api.ryjgb.net/",
    apiPath: "https://api.ryjgb.net/",
    oauthPath: "https://oauth.ryjgb.net/",
    // assetsPath: "http://test.api.ryjgb.net/",
    // apiPath: "http://test.api.ryjgb.net/",
    // oauthPath: "http://test.oauth.ryjgb.net/",

    mapKey: "4991d8f6cd08a398092108930a00b7fc",
    //oauthPath: "http://192.168.1.69:8082/",
    //assetsPath: "http://192.168.1.90:8080/front/rainbow/",
    indexLoad: false, //首页状态重置
    selectedCoupon: {}, // 选择的优惠
    api: {},
    sysInfo: {},
    lampStatus: 1,

    //api:umbrella.api.thinker.vc
    //oauth:umbrella.oauth.thinker.vc
  },
  userLogin: function(userName, password, cb) {
    var that = this;
    wx.request({
      url: that.globalData.oauthPath + 'oauth/token', //接口地址
      method: "POST",
      data: {
        username: userName,
        client_secret: "92aa5479e9b3fc62c4f7faff7d41538c",
        grant_type: "password",
        client_id: "2000001",
        password: password
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        //console.log(res.statusCode)
        //console.log(res.data.access_token);
        if (res.statusCode == 200) {
          wx.setStorageSync('access_token', res.data.access_token);
          //typeof cb == "function" && cb(that.globalData.userInfo)
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }, fail: function (e) {
              // wx.navigateTo({
              //   url: '/pages/welcome/welcome'
              // });
            }
          });
        } else if (res.statusCode == 401) {
          that.getUserInfo(cb);
        }
      },
      complete: function(res) {
        //console.log(res);
        //console.log("登录接口完成");
      }
    });
  },
  initApi: function(api) {
    var that = this;
    if (that.globalData.api[api]) {
      return that.globalData.api[api];
    } else {
      var apiController = require('sdk/src/api/' + api);
      return new apiController();
    }
  },
  showDialog: function(info, callback) {
    wx.showModal({
      title: '提示信息',
      showCancel: false,
      content: info,
      success: function(res) {
        if (callback) {
          callback(res || "");
        }
      }
    });
  },
  showErr: function(res, callback) {
    this.showDialog(res.data.error_description, callback);
  },
  showTips: function(info, callback, time, icon) {
    wx.showToast({
      title: info,
      icon: icon || 'success',
      duration: 1500 || time
    });
    setTimeout(function() {
      if (callback) callback();
    }, 1500 || time);
  },
  showHaveNotEndDialog: function() {
    wx.hideToast();
    wx.showModal({
      title: '提示信息',
      content: '你有未结束的订单!',
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/bikeComplete/bikeComplete'
          });
        }
      }
    });
  },
  handleApiFail: function(res, callback, failCallback, modalCallback) {
    if (res.data.success) {
      if (callback && typeof callback == "function") {
        callback(res);
      }
    } else {
      if (failCallback && typeof failCallback == "function") {
        failCallback(res);
      } else {
        wx.hideToast();
        wx.showModal({
          title: '提示信息',
          showCancel: false,
          content: res.data.error_description,
          success: function(resu) {
            if (modalCallback && typeof modalCallback == "function") {
              modalCallback(res, resu);
            }
          }
        });
      }
    }
  },
  authStepAction: function(authStep, isSelf, callback) {
    var that = this;
    if (isSelf) {
      if (authStep == 1) {
        wx.navigateTo({
          url: '/pages/mobileBind/mobileBind'
        });
      } else if (authStep == 2) {
        // wx.navigateTo({
        //   url: '/pages/myCharge/myCharge'
        // });
        wx.navigateTo({
          url: '/pages/regSuccess/regSuccess'
        });
      } else if (callback && typeof callback == "function") {
        callback();
      }
    } else {
      if (authStep == 1) {
        wx.redirectTo({
          url: '/pages/mobileBind/mobileBind'
        });
      } else if (authStep == 2) {
        wx.navigateTo({
          url: '/pages/regSuccess/regSuccess'
        });
      } else if (callback && typeof callback == "function") {
        callback();
      }
    }
  }
});