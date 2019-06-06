// pages/deposit/deposit.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    depositePay: 0, //此处定义的字段是用户应付的产品押金
    qrCode: '', //此处是产品扫描后的二维码
    productType: '1', //此处是产品型号id
    depositeStyle: 'qrCode',
    assetsPath: app.globalData.assetsPath
  },

  /**
   * 生命周期函数--监听页面加载
   */
  //此处是押金充值的接口
  rechargeDeposit: function() {
    var that = this;
    //console.log(that.data.qrCode.qrCode);
    //此处是调用押金充值接口
    var qrcode1 = that.data.qrCode.qrCode;
    // console.log(qrcode1);
    var productType = that.data.productType;
    var depositeStyles = that.data.depositeStyle;
    var value = wx.getStorageSync('access_token');
    var headvalue = 'Bearer' + ' ' + value;
    function json2Form(json) {
      var str = [];
      for (var p in json) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
      }
      return str.join("&");
    }
    wx.getStorage({
      key: 'SMJG',
      success: function (txt) {
        var data1 = {
          'modelIdsStr': productType, //此处是产品类型id
          // 'paymentMark': 'wx_app',//此处是支付方式rechargeType
          'qrCode': txt.data.qrcode, //此处是扫描产品二维码
          'rechargeType': 'qrCode' //此处是押金充值类型
        }
        wx.request({
          url: that.data.assetsPath+'api/paymet',
          method: 'post',
          data: json2Form(data1),
          header: {
            'Authorization': headvalue,
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            //console.log(res.data.item.weiXinPaymet);
            var paymet = res.data.item.weiXinPaymet; 
            wx.requestPayment({
              'timeStamp': paymet.timeStamp,
              'nonceStr': paymet.nonceStr,
              'package': "prepay_id=" + paymet.prepayId,
              'signType': 'MD5',
              'paySign': paymet.sign,
              'success': function (res) {
                checkUnlock(txt.x,txt.y,txt.data.qrcode)
              },
              'fail': function (res) {
                console.log(res);
              }
            })
          }
        })
      },
    });
   
  },
  //此处是押金充值的
  onLoad: function(options) {
    var that = this;
    wx.getStorage({
      key: "productPay",
      success: function(res) {
        that.setData({
          depositePay: res.data
        })
      }
    }) //此处是取出产品的押金
    wx.getStorage({
      key: 'qrcode',
      success: function(res) {
        console.log(res.data);
        that.setData({
          qrCode: res.data
        })
        console.log(that.data.qrCode);
      },
    });
    //此处是取得产品的类型
    wx.getStorage({
      key: 'productType',
      success: function(res) {
        console.log(res.data);
        that.setData({
          productType: res.data
        })
      },
    });
    var that = this
    wx.getStorage({
      key: 'SMJG',
      success: function (txt) {
        var qrcode2 = txt.data.qrcode;
        var value = wx.getStorageSync('access_token');
        var headvalue = 'Bearer' + ' ' + value;
        wx.request({
          url:that.data. assetsPath+'api/get_deposit',
          method: 'get',
          header: {
            Authorization: headvalue
          },
          data: {
            'qrCode': qrcode2
          },
          success: function (res) {
            // if(res.data.items)
            console.log(res)
            if (res.data.items == 0) {
              wx.showLoading({
                title: '已经充值完成',
              })
             
            } else {
              that.setData({
                depositePay: res.data.item
              })
            }
          }
        })
      },
    });
    //此处是取出用户需要缴纳的押金数额

    


    // for (var arr in that.data){
    //   console.log(arr)
    //   console.log(that.data[arr])
    // }

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

  }
})
function checkUnlock(x,y, result) {
  wx.navigateTo({
    url: "/pages/unLockLoading/unLockLoading?code=" + encodeURIComponent(result) + "&x=" + x + "&y=" +y
  });
}