// pages/depositRecharge/depositRecharge.js

var app = getApp();
var umorderApi = app.initApi("UmordercontrollerApi");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productList: [], //产品的设备种类数组
    isSelected: true,
    waitPay: 100, //待退还押金
    selectId: [], //此数组是是专门用来选中的id
    waitPay: 0, //待充值押金
    isSelect: false, //是否选中的切换
    arr: [],
    assetsPath: app.globalData.assetsPath
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.getProductStyle();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  //获取产品的种类接口
  getProductStyle: function() {
    var that = this;
    var value = wx.getStorageSync('access_token');
    var headvalue = 'Bearer' + ' ' + value;
    wx.request({
      url: that.data.assetsPath+'api/deposit/productModel/list?type=refund',
      header: {
        Authorization: headvalue
      },
      method: 'get',
      success: function(res) {
        console.log(res);
        if (res.data.items!=undefined){
          for (var i = 0; i < res.data.items.length; i++) {
            var test = res.data.items[i];
            test.modelName = test.modelName;
            res.data.items[i].isSelected = 'false';
          };
          that.setData({
            productList: res.data.items
          })
          res.data.items.forEach(function (a, b) {
            var ats = 'arr[' + b + ']'
            that.setData({
              [ats]: ''
            })
          })
        }else{
          
        }
        that.data.productList=[]
      }
    })
  },
  //点击事件
  clickCancel: function(e) {
    console.log(e);
    var index = e.currentTarget.dataset.index;
    var ats = 'arr[' + index +']'
    
    // if (this.data.arr[index] == 'choiceSelected') {
    //   this.setData({
    //     [ats]: ''
    //   })
    //   this.data.selectId.remove(e.currentTarget.id)
    // } else {
    //   this.setData({
    //     [ats]: 'choiceSelected'
    //   })
    //   this.data.selectId.push(e.currentTarget.id)
    // }
    if (this.data.arr[index] == 'choiceSelected') {
      this.setData({
        arr: []
      })
    } else {
      this.setData({
        arr: []
      })
      this.setData({
        [ats]: 'choiceSelected'
      })
    }
    if (this.data.arr.length > 0) {
      this.data.selectId = e.currentTarget.id
      this.setData({
        waitPay: e.currentTarget.dataset.waitpay
      })
    } else {
      this.data.selectId = []
      this.setData({
        waitPay: 0
      })
    }
  },
  //等待支付的押金的总额
  waitPays: function() {
    if (this.data.selectId.length>0){
      var that = this;
      var value = wx.getStorageSync('access_token');
      var headvalue = 'Bearer' + ' ' + value;
      wx.request({
        url: this.data.assetsPath+ 'api/refundDeposit',
        header: {
          Authorization: headvalue,
          'content-type': 'application/x-www-form-urlencoded',
        },
        method: 'post',
        data: {
          // 'paymentMark':'wx_app',//充值方式
          'modelIdsStr': that.data.selectId,//产品型号ID
        },
        success: function (res) {
          console.log(res)
          if (res.data.success) {
            app.showTips("退还成功", function () {
             that.setData({
                waitPay: 0,
                selectId: []
              })
              wx.navigateBack({ changed: true });
            });
          }else{
            app.showTips(res.data.error_description, function () {
              that.onLoad()
            });
          }
          that.onLoad()
        }
      })
    }else{
      app.showDialog("请选择产品", function () {

      });
    }
    
  }
})