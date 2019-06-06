
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: 114.05956,
    latitude: 22.54286,
    token:'',
    url: '',
    assetsPath: app.globalData.assetsPath
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var dId = options.id;
    var x = that.data.longitude;
    var y = that.data.latitude;
    var token = wx.getStorageSync('access_token');
    wx.getStorage({
      key: 'longitude',
     success:function(res){
        that.setData({
          longitude: res.data
        })
     }
    });
    wx.getStorage({
      key: 'latitude',
      success:function(res){
          that.setData({
            latitude:res.data
          })
      }
    })
    //请求详情页的数据接口
    var value = wx.getStorageSync('access_token');
    var url = this.data.assetsPath+'api/content/activeDetailsPage?id='+dId+'&x='+x+'&y='+y+'&token='+token+'';
    that.setData({
      url: url
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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