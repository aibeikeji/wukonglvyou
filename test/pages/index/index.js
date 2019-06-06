//index.js
//获取应用实例
const app = getApp()
var until = require('../../utils/util.js');

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var just = new Date().getTime();//获取当前的时间
    var afewminutesago = new Date("Nov 29, 2016 00:50:00").getTime();

    //几周前
    var afewweekago = new Date("Nov 29, 2016 00:50:00").getTime();

    //几年前
    var someday = new Date("Nov 21, 2012 01:15:00").getTime();

    var helloData = {
      time: afewweekago
    }
    console.log(just);
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
