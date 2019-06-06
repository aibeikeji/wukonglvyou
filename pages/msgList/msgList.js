//userInfo.js
//获取应用实例
var app = getApp();

var msgApi = app.initApi("MessagecontrollerApi");
var util = require('../../utils/util.js');


var jouList;
var lastTime;

Page({
  data: {
    userInfo: {},
    assetsPath: app.globalData.assetsPath,
    jList: []
  },
  onShow: function (e) {
    // loadData(this)
  },
  onLoad: function () {
    var that = this;
    jouList = [];
    lastTime = null;
     loadData(this);
    setInterval(function () {
      loadData(that);
    }, 5000)
    //loadMessage(this);
  },
  getIdType: function (e) {
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        longitude: ;
        latitude: ;
        wx.setStorage({
          key: 'longitude',
          data: {
            x: res.longitude,
            y: res.latitude
          },
        });
      }
    });
    var typeId = e.currentTarget.dataset.type;
    var isRead = e.currentTarget.dataset.read;
    if (typeId == 55) {
      var id = e.currentTarget.dataset.bid
      wx.navigateTo({
        url: '/pages/msgDetails/msgDetails?id=' + id + '&typeId=' + typeId + '&read=' + isRead + '' + '&sid=' + e.currentTarget.dataset.id,
      })
    } else if (typeId == 50) {
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/msgDetails/msgDetails?id=' + id + '&typeId=' + typeId + '&read=' + isRead + '' + '&sid=' + e.currentTarget.dataset.id,
      })
    } else {
      var that = this;

      var value = wx.getStorageSync('access_token');
      var headvalue = 'Bearer' + ' ' + value;
      wx.request({
        url: this.data.assetsPath + 'api/message/set_msg_read_status',
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': headvalue
        },
        data: {
          'msgID': e.currentTarget.dataset.id,
          'isRead': 1
        },
        success: function (res) {
          loadData(that)
        }
      })
    }

  }
});

function loadData(that) {
  var value = wx.getStorageSync('access_token');
  console.log(value)
  var headvalue = 'Bearer' + ' ' + value;
  wx.request({
    url: that.data.assetsPath + 'api/message/sys_list?page=1&size=500&userType=2',
    method: 'get',
    header: {
      Authorization: headvalue
    },
    success: function (res) {
      wx.hideToast();
      if (res.data.success) {
        var content = res.data.content;
        if (lastTime && res.data.content.length == 0) {
          return false;
        }
        jouList = content;
        for (var i = 0; i < content.length; i++) {
          jouList[i].sendDate = formatMsgTime(content[i].sendTime);
        }
        that.setData({
          jList: jouList
        });
        console.log(jouList)
      }
    }
  })
}
//此处需要处理时间函数 -如果超过一天则显示月日，如果没有则显示的是时分
function formatMsgTime(timespan) {
  var oldTimer = 1536580851000;
  var oneDay = 86400000;
  //获取当前时间
  var timer = new Date(timespan);
  //将当前时间转化为时间戳
  var newTimer = timer.getTime();
  //将当前时间减去创建的事件
  var remaining = newTimer - timespan;
  if (remaining < oneDay) {
    var hours = timer.getHours();
    var minutes = timer.getMinutes();
    hours = hours < 10 ? ('0' + hours) : hours;
    minutes = minutes < 10 ? ('0' + minutes) : minutes;
    return hours + ":" + minutes

  } else {
    var date = new Date(timespan); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    var Yr = M + D;
    return Yr;
  }
}

function loadMessage(that) {
  var value = wx.getStorageSync('access_token');
  var headvalue = 'Bearer' + ' ' + value;
  wx.request({
    url: that.data.assetsPath + 'api/message/sys_list?page=1&size=500&userType=2',
    method: 'get',
    header: {
      Authorization: headvalue
    },
    success: function (res) {
      console.log(res);
      console.log('pppppppppppppppppppppppppppp');
    }
  })

}
