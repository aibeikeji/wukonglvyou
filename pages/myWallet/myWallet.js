//myWallet.js
//获取应用实例
var app = getApp();

var jouList;
var lastTime;
var umorderApi = app.initApi("UmordercontrollerApi");
var userApi = app.initApi("UsercontrollerApi");
var util = require('../../utils/util.js');
var screenInfo = wx.getSystemInfoSync();
var sW = screenInfo.windowWidth; //获取屏幕的宽
var sH = screenInfo.windowHeight; //获取屏幕的高
Page({
  data: {
    userInfo: {},
    assetsPath: app.globalData.assetsPath,
    deposit: 0,
    sHeight: Math.floor(sH - sW * 0.4),
    smjg: '', //此定义的字段为扫码成功后返回的结果
    maxDeposit: 190, //此字段是用户充值完所有的押金
    hiddenName: false,
    Detailed:[],//押金明细
    Detaileds:[],//数组，对象不支持循环
    page:1,//当前页数
    totalPages: 0, //押金明细总页数
  },
  onReady: function(e) {},
  //打开弹窗
  tapName: function(e) {
    var that = this;
    if (that.data.deposit>0){
      that.setData({
        hiddenName: true
      })
      this.getlist()
    }
  },
  //关闭弹窗
  closeBtn: function() {
    var that = this;
    that.setData({
      hiddenName: false
    })
  },
  //此处是获取所有产品类型的押金总数
  getTotalMoney: function() {
    var value = wx.getStorageSync('access_token');
    var headvalue = 'Bearer' + ' ' + value;
    var that = this;
    wx.request({
      url: that.data.assetsPath+'api/deposit/all/count',
      method: 'get',
      header: {
        Authorization: headvalue
      },
      success: function(res) {
        that.setData({
          maxDeposit: res.data.item
        })
      }
    })
  },
  jumpChoice: function() {
    wx.navigateTo({
      url: '/pages/depositRecharge/depositRecharge',
    })
  },
  onShow:function(){
    this.onLoad();
    console.log(54546656565)
  },
  onLoad: function() {
    var that = this;
    jouList = [];
    lastTime = null;
    loadData(that);
    //获取用户的个人信息
    userApi.getMyProfileUsingGET(function(res) {
      app.handleApiFail(res, function() {
        if (res.data.item) {
          var item = res.data.item;
          that.setData({
            deposit: item.deposit,
            authStep: item.authStep,
            isAuthByMayi: item.isAuthByMayi
          });
        }
      });
    });
    that.getTotalMoney();
  },
  scrolltolower: function() {
    var that = this;
    loadData(that);
    wx.showToast({
      title: "loading",
      icon: 'loading',
      duration: 10000
    });
  },
  refundDeposit: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/refund/refund'
    });
    // wx.showModal({
    //   title: '提示',
    //   content: '押金退还时间为2-7个工作日，在此期间您的账户将无法用棒。是否仍然退押金？',
    //   success: function(res) {
    //     if (res.confirm) {
    //       //此处的接口是退押金的接口
    //       wx.redirectTo({
    //         url: '/pages/refund/refund'
    //       });
    //     }
    //   }
    // });
  },
  chargeDeposit: function() {
    //此接口是获取用户的本人信息
    userApi.getMyProfileUsingGET(function(res) {
      //如果步骤是1则跳转到手机认证页面
      if (res.data.item.authStep == '1') {
        wx.redirectTo({
          url: '/pages/mobileBind/mobileBind'
        });
      } else {

        userApi.paymetUsingPOST({}, function(res) {
          //此处是支付接口
          if (res.data.success) {

            var paymet = res.data.item.weiXinPaymet;
            wx.requestPayment({
              'timeStamp': paymet.timeStamp,
              'nonceStr': paymet.nonceStr,
              'package': "prepay_id=" + paymet.prepayId,
              'signType': 'MD5',
              'paySign': paymet.sign,
              'success': function(res) {
                app.showTips("押金充值成功!", function() {
                  wx.redirectTo({
                    url: "/pages/myWallet/myWallet"
                  });
                });
              },
              'fail': function(res) {
                console.log(res);
              }
            })
          }
        })
      }
    });

  },
  list: function() { //押金明细，下滑加载
    // if (this.data.page < this.data.totalPages){
    //   this.getlist()
    // } 
  },
  getlist: function(e) { //获取押金明细
    var that = this;
    var e = that.data.page
    var value = wx.getStorageSync('access_token');
    var headvalue = 'Bearer' + ' ' + value;
    wx.request({
      url: that.data.assetsPath+'api/deposit/already/list',
      header: {
        Authorization: headvalue,
      },
      method: 'get',
      success: function(res) {
        if (res.data.success){
          for (var i = 0; i < res.data.item.apiAlreadyListBOS.length;i++){
            res.data.item.apiAlreadyListBOS[i].createTime = timestampToTime(res.data.item.apiAlreadyListBOS[i].createTime)
          }
          that.setData({
            // totalPages: res.data.totalPages,
            Detailed: res.data.item.apiAlreadyListBOS,
            page:e+1
          })
        }
      }
    })
  }
});

function timestampToTime(timestamp) {
  var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = change(date.getDate()) + ' ';
  var h = change(date.getHours()) + ':';
  var m = change(date.getMinutes()) + ':';
  var s = change(date.getSeconds());
  return Y + M + D + h + m + s;
}
function change(t) {
  if (t < 10) {
    return "0" + t;
  } else {
    return t;
  }
}
function loadData(that) {
  userApi.depositLogUsingGET({
    ltTime: lastTime
  }, function(res) {
    app.handleApiFail(res, function() {
      wx.hideToast();
      if (res.data.success) {
        var content = res.data.content;
        console.log(content);
        if (lastTime && res.data.content.length == 0) {
          return false;
        }
        jouList=[]
        for (var i = 0; i < content.length; i++) {
          jouList.push({
            id: content[i].id,
            price: content[i].amount,
            time: util.formatTime(new Date(content[i].createTime)),
            status: content[i].type,
            name: content[i].modelName
          });
          if (content.length == (i + 1)) {
            lastTime = content[i].createTime;
          }
        }
        console.log(jouList)
        that.setData({
          jList: jouList
        });
      }
    });
  });
}
//开锁功能
//此处我需要获取到用户的经纬度，以及扫一扫之后成功返回的result的值
//此处是获取扫码之后返回的结果
function checkUnlock(that, result) {
  wx.navigateTo({
    url: "/pages/unLockLoading/unLockLoading?code=" + encodeURIComponent(result) + "&x=" + lastPos.x + "&y=" + lastPos.y
  });
}