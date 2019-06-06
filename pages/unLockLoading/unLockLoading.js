//userInfo.js
//获取应用实例
var app = getApp();

var umorderApi = app.initApi("UmordercontrollerApi");
var userApi = app.initApi("UsercontrollerApi");

var lockTimer, overTimer, lockOpenTimer;
Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        userData: {},
        code: "",
        flag: true,
        progress: 0,//开锁的进度
        borrowChannel: -1,//借用产品的通道号码
        orderStatus:false,//此处设置一个自定义属性的值true or false
        productPay:0,//产品所需要缴纳的押金数目
    },
    onReady: function (e) {
        
    },
    onShow: function() {
        clearTimeout(lockOpenTimer);//清除定时器
        var that = this;
        var plus = 0;
        //此处是那么采用定时器来加载那个进度条
        lockOpenTimer = setInterval(function() {
            var pro = that.data.progress;
            plus = (100 - pro) / 30 + plus;
            if (plus >= 1) {
                that.setData({
                    progress: Math.round(pro + plus)
                });
                plus = 0;
            }
        }, 100);
    },
    onLoad: function (opt) {
        var that = this;
        clearTimeout(lockTimer);//清除定时器
        clearTimeout(overTimer);//清除定时器
        that.setData({
            code: decodeURIComponent(opt.code).replace(/\S+\?bike=/g, "")
        });
        //设置二维码
       //此处判断用户是否是第一次借用产品
      // createOrder();
        //此处是创建订单-生成的只是一个二维码
        //status(integer, optional): 状态 10: 创建中 20: 创建失败 30: 进行中 40: 未支付 50: 已支付,
         umorderApi.createOrderUsingPOST(decodeURIComponent(opt.code).replace(/\S+\?bike=/g, ""), function(res) {
           console.log(res)
             app.handleApiFail(res, function() {
                 var cItem = res.data.item;
                    //此处是设置产品的所需缴纳的押金数目
                    // that.setData({
                    //   productPay: cItem.price 
                    // });
              //  wx.setStorage("productPay", productPay)//此处讲产品的押金缓存起来
                 if (cItem) {
                     if (cItem.status == 10) {
                       console.log(9)
                         that.setData({
                           borrowChannel: cItem.borrowChannel//借产品的通道号 
                         });
                         checkOrderTimer();
                         overTimer = setTimeout(function() {
                             clearTimeout(lockTimer);
                             wx.hideToast();
                              wx.showModal({
                                  title: '提示信息',
                                  content: "取棒超时, 是否重试?",
                                  success: function (res) {
                                      if (res.confirm) {
                                          wx.redirectTo({
                                              url: "/pages/unLockLoading/unLockLoading?code=" + that.data.code
                                          });
                                      } else {
                                          checkAndBack();
                                      }
                                  }
                              });
                         }, 30000);
                     } else if (cItem.status == 20) {
                       console.log(8)
                         wx.showModal({
                             title: '提示信息',
                             content: "操作失败, 是否重试?",
                             success: function (res) {
                                 if (res.confirm) {
                                     wx.redirectTo({
                                         url: "/pages/unLockLoading/unLockLoading?code=" + that.data.code
                                     });
                                 } else {
                                     checkAndBack();
                                 }
                             }
                          });
                     }
                     else {
                       console.log(555656)
                         wx.hideToast();
                         clearTimeout(lockTimer);
                         clearTimeout(overTimer);
                         app.globalData.indexLoad = true;
                       wx.reLaunch({
                           url: '/pages/index/index',
                         })
                        
                     }
                 }

             }, function() {
              
                 if (res.data.error == 406) {
                     wx.showModal({
                         title: '提示信息',
                         showCancel: false,
                         content: res.data.error_description,
                         success: function (res) {
                             checkAndBack();
                         }
                     });
                 } else if (res.data.error == 410) {
                     app.showHaveNotEndDialog();
                 } else if (res.data.error == 408) {
                     userApi.getMyProfileUsingGET(function (res) {

                         app.authStepAction(res.data.item.authStep, false);

                     });

                 } else if (res.data.error == 407) {
                     wx.hideToast();
                     wx.showModal({
                         title: '提示信息',
                         showCancel: false,
                         content: res.data.error_description,
                         success: function (res) {
                             checkAndBack();
                         }
                     });
                 } else if (res.data.error == 409) {
                     wx.hideToast();
                     wx.showModal({
                         title: '提示信息',
                         showCancel: false,
                         content: res.data.error_description,
                         success: function (res) {
                           wx.redirectTo({
                             url: "/pages/deposit/deposit"
                           });
                         }
                     });
                 } else {
                   console.log(98)
                     wx.hideToast();
                     wx.showModal({
                         title: '提示信息',
                         showCancel: false,
                       content: res.data.error_description || res.data.error,
                         success: function (res) {
                             checkAndBack();
                         }
                     });
                 }
             });
         });

    },
    onUnLoad: function() {
        clearTimeout(lockTimer);//清除定时器
        clearTimeout(overTimer);//清除定时器
    }
});
//判断用户是否是第一次使用该产品----功能是如果是第一次使用该产品告诉用户怎么归还-此处只会返回true false
function checkNoFirst(){
  var that = this;
  wx.request({
    url: that.data.assetsPath+'/api/first/use',
    method:'get',
    success:function(res){
      //用户是第一次登陆
      if(res==true){
        that.setData({
          orderStatus:res
        })
        //设置缓存
        wx.setStorage({
          key: "orderS",
          data: orderStatus
        })
      }
      //用户不是第一次登陆
      else{
        that.setData({
          orderStatus: res
        });
        wx.setStorage({
          key: "orderS",
          data: orderStatus
        })
      }
    }
  })
};
//此处是通过订单来查询产品所需要缴纳的押金数目


//检查进行中的订单信息
function checkOrderTimer() {
    lockTimer = setTimeout(function() {
        umorderApi.findDoingInfoUsingGET({pointType: "GCJ02"}, function(res) {
            var item = res.data.item;
            // console.log(item);
            // console.log("itemitemitemitemitemitem");
            if (item) {
                wx.hideToast();
                clearTimeout(lockTimer);//清除定时器
                clearTimeout(overTimer);//清除定时器
                app.globalData.indexLoad = true;//首页状态开始重置
                //关闭所有页面，跳转到主页
                wx.reLaunch({
                    url: '/pages/index/index'
                });
            } else {
                checkOrderTimer();
            }
        });
    }, 2000);
}

//如果获取的长度大于1返回否则跳转到主页面
function checkAndBack() {
    if (getCurrentPages().length > 1) {
      wx.reLaunch({
        url: '/pages/index/index'
      });//关闭当前页面，返回上一页或多级页面。可通过getCurrentPages()获取当前的页面栈，决定需要返回几层
    } else {
      //此方法是关闭所有的页面，跳转到主页
        wx.reLaunch({
            url: '/pages/index/index'
        });
    }
}
