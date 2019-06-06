// pages/city/citySearch/citySearch.js
var app = getApp();
var city = require('../../../utils/city.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    assetsPath: app.globalData.assetsPath,
    searchValue:'',
    searchResult:{},
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  input1:function(e){
    var value = e.detail.value.toLowerCase();
    if (value.length>0){
      var data = city.data;
      var arr = []
      for (var i = 0; i < data.length; i++) {
        if (data[i].label.toLowerCase().indexOf(value) != -1) {
          arr.push(data[i].name)
        }
      }
      this.setData({
        searchResult: arr
      });
      console.log(this.data.searchResult)
    }else{
      this.setData({
        searchResult: []
      });
    }
  },
  obtainVal:function(e){
    var val = e.currentTarget.dataset.id;
  wx.setStorageSync('NewCity', val + '市')
   wx.switchTab({
     url: '/pages/index/index',
   })

  },
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var cityChild = city;
    // console.log(city);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  clickCancel:function(e){
    console.log(333333333);
    wx.navigateTo({
      url: '/pages/city/citylist/citylist',
    })
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
