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
    waitPay: 100, //待支付押金
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
      url: that.data.assetsPath+'api/deposit/productModel/list?type=recharger',
      header: {
        Authorization: headvalue
      },
      method: 'get',
      success: function(res) {
        if (res.data.items.length > 0) {
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
          console.log(that.data.arr);
        } else {
          wx.navigateBack({ changed: true });
        }
      }
    })
  },
  //点击事件
  clickCancel: function(e) {
    var index = e.currentTarget.dataset.index;
    var ats = 'arr[' + index + ']'
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
    if (this.data.selectId.length > 0) {
      var that = this;
      var value = wx.getStorageSync('access_token');
      var headvalue = 'Bearer' + ' ' + value;
      wx.request({
        url:that.data. assetsPath+ 'api/paymet',
        header: {
          Authorization: headvalue,
          'content-type': 'application/x-www-form-urlencoded',
        },
        method: 'post',
        data: {
          // 'paymentMark':'wx_app',//充值方式
          'modelIdsStr': that.data.selectId, //产品型号ID
          'rechargeType': 'wallet', //押金充值类型
        },
        success: function(res) {
          console.log(res)
          if (res.data.item) {
            var paymet = res.data.item.weiXinPaymet; //支付方式
            wx.requestPayment({
              'timeStamp': paymet.timeStamp,
              'nonceStr': paymet.nonceStr,
              'package': "prepay_id=" + paymet.prepayId,
              'signType': 'MD5',
              'paySign': paymet.sign,
              'success': function(res) {
                app.showTips("充值成功", function() {
                      wx.navigateTo({
                        url: '/pages/myWallet/myWallet',
                      })
                });
                that.setData({
                  waitPay: 0,
                  selectId: []
                })
                that.onLoad()
              },
              'fail': function(res) {
                console.log(res);
              }
            })
          } else {
            app.showDialog("充值成功", function() {

            });
            that.onLoad()
          }
        }
      })
    } else {
      app.showDialog("请选择产品", function() {

      });
    }

  }
})
//删除数组元素
Array.prototype.indexOf = function(val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) return i;
  }
  return -1;
};
Array.prototype.remove = function(val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};