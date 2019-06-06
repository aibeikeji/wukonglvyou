var app = getApp();

var msgApi = app.initApi("MessagecontrollerApi");
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    assetsPath: app.globalData.assetsPath,
    message: {},
    audios: [],
    playingIndex: -1,
    audioDuration: 0,
    url: '',
    readT: 0,
    ids: 0,
    bizTypes: 0,
    isReads: true,
    x: 0,
    y: 0,
  },
  onReady: function (e) {
  },
  onHide: function () {
    var that = this;
    that.setData({
      playingIndex: -1
    });
  },
  onLoad: function (opt) {
    console.log(opt)

    var that = this;
    setTimeout(function () {
      that.getMes();
    }, 2000);
    //获取消息id和bizType类型 -bizType有三种 55是景点播报的推送 41是产品借还的推送，50是普通的图文推送
    var id = opt.id;
    var bizType = opt.typeId;
    var isRead = opt.read;
    that.setData({
      sid: opt.sid
    });
    //判断调取那种h5页面
    var headvalue = wx.getStorageSync('access_token');
    var that = this
    console.log(this.data)
    if (bizType == 55) {//景点播报
      this.setData({
        url: this.data.assetsPath + 'api/attractions/vocalIntroduce?id=' + id + '&token=' + headvalue
      });
      console.log(that.data.url)
    } else if (bizType == 50) {//普通图文
      wx.getStorage({
        key: 'longitude',
        success: function (res) {
          console.log(res)
          that.setData({
            url: that.data.assetsPath + 'api/message/actiondetails?id=' + id + '&token=' + headvalue + '&x=' + res.data.x + '&y=' + res.data.y
          });
          console.log(that.data.url)
        }
      });

    }
    that.setData({
      ids: id
    });
    that.setData({
      bizTypes: bizType
    });
    that.setData({
      isReads: isRead
    });
    if (isRead == false) {
      that.setData({
        readT: 0
      })
    }
    else {
      that.setData({
        readT: 1
      })
    }
  },
  //此处是获取景点播报的接口
  getBroadcast: function (id) {
    var value = wx.getStorageSync('access_token');
    var headvalue = 'Bearer' + ' ' + value;
    wx.request({
      url: '/api/attractions/vocalIntroduce',
      method: 'get',
      header: {
        'Authorization': headvalue
      },
      data: {
        'id': id
      },
      success: function (res) {
        console.log(res)
      }
    })
  },
  //此处是获取一般图文的接口
  getGeneral: function () { },
  //此处是获取借还消息的推送
  getBorrowed: function () {

  },
  //此处是调用设置消息的已读状态
  getMes: function () {

    var that = this;
    var msgID = that.data.ids;
    var isRead = that.data.readT;
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
        'msgID': this.data.sid,
        'isRead': isRead
      },
      success: function (res) {
        console.log('成功了啊');
      }
    })
  },
  onShareAppMessage: function () {
    var that = this;
    return {
      title: that.data.message.title,
      path: '/pages/msgDetails/msgDetails?msgId=' + that.data.message.id,
      success: function (res) {
        // 转发成功
        wx.showToast({
          icon: 'success',
          title: '转发成功'
        });
        msgApi.addShareTimesUsingPOST(that.data.message.id, function () {
          var message = that.data.message;
          message.shareCount += 1;
          that.setData({
            message: message
          });
        });
      }
    }
  }
});

function formatTimer(curTime) {
  var minute = Math.floor(curTime / 60);
  minute = minute < 10 ? "0" + minute : minute;

  var second = Math.floor(curTime % 60);
  second = second < 10 ? "0" + second : second;

  return minute + ":" + second;
}