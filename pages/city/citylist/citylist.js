// pages/citylist/citylist.js
var app = getApp();
var citylist = require('../../../utils/citylist.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    assetsPath: app.globalData.assetsPath,
    letter: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    cityName: '泰安市',
    allHeight: 0,
    toUp: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        cityName: wx.getStorageSync('city')
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var cityChild = citylist.City[0];
    var that = this;
    that.setData({
      city: cityChild
    })
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight - 120,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        console.log(calc)
        that.setData({ winHeight: calc });
      }
    });
  },
  bindCity: function (e) {
    var cityName = e.currentTarget.dataset.city;
    //this.setData({ cityName: cityName });
    if (cityName.indexOf('市')!=-1){
      wx.setStorageSync('NewCity', cityName)
    }else{
      wx.setStorageSync('NewCity', cityName + '市')
    }
    wx.navigateBack()
  },
  letterTap: function (e) {
    var top = e.currentTarget.dataset.item;
    this.setData({
      toUp: top
    })
    
  },
  jumpSearch:function(e){
     wx.navigateTo({
       url: '/pages/city/citySearch/citySearch',
     })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})