//certification.js
//获取应用实例
var app = getApp();

var userApi = app.initApi("UsercontrollerApi");

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        form: {
            name: "",
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
    inputVal: function (event) {
        var mobData = this.data.form.name, codeData = this.data.form.code;
        if (event.currentTarget.id == "name") {
            mobData = event.detail.value;
        } else {
            codeData = event.detail.value;
        }
        this.setData({
            form: {
                name: mobData,
                code: codeData
            }
        });
        if (/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(codeData) && mobData.length > 1) {
            this.setData({
                disabled: false
            });
        } else {
            this.setData({
                disabled: true
            });
        }
    },
    submitForm(e) {
        var that = this;
        var params = {
            name: that.data.form.name,
            code: that.data.form.code
        };
        var flag = true;
        var year = Number(params.code.substring(6,10)), month = Number(params.code.substring(10,12)), date = Number(params.code.substring(12,14)), now = new Date();
        var nowYear = now.getFullYear(), nowMonth = now.getMonth() + 1, nowDate = now.getDate();

        /*

        if ((nowYear - year) < 12) {
            flag = false;
        } else if ((nowYear - year) == 12) {
            if (nowMonth < month) {
                flag = false;
            } else if (nowMonth == month) {
                if (nowDate < date) {
                    flag = false;
                }
            }
        }
        if (flag) {
            //
        } else {
            wx.showModal({
                title: '提示信息',
                showCancel: false,
                content: '你未满12周岁,不能骑行单车！',
                success: function (res) {
                    wx.navigateBack();
                }
            });
        }
         */
      if (this.data.form.name.length > 0 &&checkCode(this.data.form.code)){
        userApi.realnameUsingGET(params.name, params.code, function (res) {
          app.handleApiFail(res, function () {
            app.showTips('实名验证成功', function () {
              wx.redirectTo({ url: "/pages/userInfo/userInfo" });
            });
          });
        });
      }
      else{
       wx.showModal({
         title: '请填写正确的信息',
         content: '',
       })
      }
    }
});

function isEmpty(obj) {
  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
}
var checkCode = function (val) {
  var p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
  var code = val.substring(17);
  if (p.test(val)) {
    var sum = 0;
    for (var i = 0; i < 17; i++) {
      sum += val[i] * factor[i];
    }
    if (parity[sum % 11] == code.toUpperCase()) {
      return true;
    }
  }
  return false;
}