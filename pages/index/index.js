//index.js
//获取应用实例
var app = getApp();

var umorderApi = app.initApi("UmordercontrollerApi");
var userApi = app.initApi("UsercontrollerApi");
var ummachineApi = app.initApi("UmmachinecontrollerApi");
var appApi = app.initApi("AppparamcontrollerApi");
var umApi = app.initApi("UmbrellacontrollerApi");
var msgApi = app.initApi("MessagecontrollerApi");
var util = require('../../utils/util.js');
var gcoord = require('../../gcoord/index.js');


var amapFile = require('../../map/amap-wx.js');
var myAmapFun = new amapFile.AMapWX({
  key: app.globalData.mapKey
});

var QR = require('../../utils/qrcode.js');
//var myAmapFun = new amapFile.AMapWX({key: app.globalData.mapKey});

var screenInfo = wx.getSystemInfoSync();
var sW = screenInfo.windowWidth;
var sH = screenInfo.windowHeight;
var markerTap = true;
var lastPos = {
  x: 117.087614,
  y: 36.200252
};
var lastMyPos;
var lockTimer;
var curTrips = null;
var reserveTimer;
var hs = 105;
var imgs = 'Feedback'
var imeg = '/map/jgb/map_on_light_n.png';
var deng = 800; //灯
var test = true; //扫码按钮防止多次点击
//新增加的
var controlsFixed = function(_sH) {

  return [{
      id: 1,
      iconPath: '/map/needle.png',
      position: (function() {
        return {
          left: sW / 2 - 7,
          top: _sH / 2 - 30,
          width: 13,
          height: 34
        }
      }())
    },
    /* {
          id: 2,
          iconPath: '/map/map_my_n.png', //用户中心按钮
          position: (function() {
            return {
              left: sW - 66,
              top: _sH - 80,
              width: 40,
              height: 40
            }
          }()),
          clickable: true
        }, */
    {
      id: 3,
      iconPath: '/map/' + imgs + '.png', //语音播报
      position: (function() {
        return {
          left: sW - 50,
          top: _sH - 60,
          width: 40,
          height: 40
        }
      }()),
      clickable: true
    },
    /*{
         id: 6,
         iconPath: '/map/map_refresh_n.png',    //刷新按钮
         position: (function () {
         return {
         left: 6,
         top: _sH - 150,
         width: 60,
         height: 60
         }
         }()),
         clickable: true
         },*/
    {
      id: 4,
      iconPath: '/map/map_location_n.png', //定位按钮
      position: (function() {
        return {
          left: 20,
          top: _sH - 60,
          width: 40,
          height: 40
        }
      }()),
      clickable: true
    }, {
      id: 6,
      iconPath: '/map/jgb/map_weather_n.png', //天气按钮
      position: (function() {
        return {
          left: 20,
          top: _sH - 120,
          width: 40,
          height: 40
        }
      }()),
      clickable: true
    }, {
      id: 5,
      iconPath: '/map/sweep_button.png', //扫码按钮
      position: (function() {
        return {
          left: sW / 2 - 45,
          top: _sH - hs,
          width: 80,
          height: 80
        }
      }()),
      clickable: true
    },
    // {
    //   id: 10,
    //   iconPath: '/map/user-help.png', //此处是新加了一个用户帮助按钮
    //   position: (function() {
    //     return {
    //       left: sW - 60,
    //       top: 160,
    //       width: 40,
    //       height: 40
    //     }
    //   }()),
    //   clickable: true
    // }
  ];
};

//控制灯泡的按钮的js

var addLampMapButton = function(arr) {
  var status = app.globalData.lampStatus;
  if (!status) return arr;
  arr.push({
    id: 8,
    iconPath: (function() {
      console.log(status)
      console.log(imeg)
      if (status == 1) {
        imeg = '/map/jgb/map_on_light_n.png'
      } else {
        imeg = '/map/jgb/map_off_light_n.png'
      }
      // var lampIcons = [
      //   '/map/jgb/map_on_light_n.png',
      //   '/map/jgb/map_off_light_n.png',
      //   '/map/jgb/map_on_light_s.png',
      //   '/map/jgb/map_off_light_s.png'
      // ]
      return imeg;
    }()), //'/map/jgb/map_off_light_n.png',
    position: {
      left: sW - deng,
      top: 80,
      width: 40,
      height: 40
    },
    clickable: true
  });
  return arr;
};
//登山杖的选项
var addActivityMapButton = function(arr) {
  arr.push({
    id: 7,
    iconPath: '/map/jgb/map_activity_n.png',
    position: {
      left: sW - 50,
      top: 20,
      width: 40,
      height: 40
    },
    clickable: true
  });
  return arr;
};

Page({
  data: {
    mapHeight: 100,
    testDis: "none",
    longitude: 117.087614,
    latitude: 36.200252,
    mapDis: "block",
    dialogType: 100,
    userInfo: {},
    tripId: 0,
    reserveOK: {},
    reserveInfo: {},
    sW: sW,
    sH: sH,
    reserveOKTime: "",
    reserveNum: 0,
    assetsPath: app.globalData.assetsPath,
    qrCode: "",
    markers: [],
    controls: [],
    polyline: [],
    dataType: 'all', //初始化产品的分类列表-默认的产品列表
    productTypeID: 1,
    riding: {
      journey: 0, //行驶里程
      time: 0
    },
    mapImage: false,
    isShowBuy: false,
    sysInfo: {},
    listItem: [], //产品的种类
    showView: false, //桩机和驿站的显示与隐藏
    province: '',
    city: '', //获取城市
    weatherType: '晴', //当前城市的天气状况
    weatherimg: 'qing', //当前城市的天气状况的图标
    temperature: '', //当前城市的温度
    firstUPrompt: false, //新增加的字段-用来查看用户是否是第一次使用产品的归还提示
    jList: [], //系统消息
    productType: 0, //产品类型
    setInter:'',//定时器
  },
  //此处是获取用户的经纬度
  getLocation: function() {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        // //console.log('皮皮是只猫啊');
        console.log(res);
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
        that.getProductPosition(that.data.productTypeID, res.longitude, res.latitude, 2000)
      },
    })
  },
  //该接口是获取产品的列表数据
  getProductList: function() {
    var that = this;
    wx.request({
      url: this.data.assetsPath + 'api/pd_product/acquire_productType_list',
      method: 'get',
      success: function(res) {
        that.setData({
          listItem: res.data.items
        });
      }
    })
  },
  //根据产品的类型，以及经纬度查询产品所在位置
  //所需要传的参数是产品的id,经纬度，以及距离距离是固定的
  getProductPosition: function(productTypeID, longitude, latitude, distance) {
    wx.request({
      url: this.data.assetsPath + 'api/um_machine/find_by_location?',
      method: 'get',
      data: {
        'productTypeID': productTypeID,
        'x': longitude,
        'y': latitude,
        'distance': 2000,
        'dataType': 'all',
        'pointType': 'GCJ02'
      },
      success: function(res) {
        // //console.log('皮皮只是一个猫咪啊！');
        // //console.log(res.data);
      },
      fail: function() {
        //console.log(res.data);
      }
    })
  },
  regionchange(e) {
    var that = this;
    
    if (e.type == "end") {
      if (that.data.markers.length > 0 && that.data.markers[that.data.markers.length - 1].isNeedle) return false;
      // //console.log(2222290);
      if (that.data.dialogType == 1) {
        return false
      } else {
        
        wx.createMapContext('myMap').getCenterLocation({
          success: function(res) {
            
            if (getFlatternDistance(lastPos.y, lastPos.x, res.latitude, res.longitude) > 500) {
              wx.showLoading({
                title: '加载中',
              });
             
              showMarker(that, res);
            }
          }
        });
      }
    }
  },
  changeCity: function(e) {
    wx.navigateTo({
      url: '/pages/city/citylist/citylist',
    })
  },
  indexTapMap: function(e) {
    //console.log(that.data.dialogType);
    var that = this;
    if (markerTap) {

      if (that.data.dialogType == 1) {
        setMapControls(this, {
          dialogType: 100
        });
      } else if (that.data.dialogType == 3 || that.data.dialogType == 4) {
        setMapControls(this, {
          dialogType: 2
        });
      } else if (that.data.dialogType == 8 || that.data.dialogType == 9) {
        setMapControls(this, {
          dialogType: 7
        });
      }
      clearPathAndTips(that);
    }
  },
  markertap(e) {
    var that = this;
    var arr = e.markerId.split(",");
    var marker = this.data.markers[arr[1]];
    var oIndex = that.data.reserveInfo.index;
    ////console.log(JSON.stringify(marker));
    //console.log(this.data.dialogType);
    if (this.data.dialogType < 2 || this.data.dialogType > 10) {
      markerTap = false;
      setMapControls(this, {
        dialogType: 1
      });
      walkLine(that, marker.longitude, marker.latitude, arr[1], oIndex);
    } else if (this.data.dialogType == 2 || this.data.dialogType == 3 || this.data.dialogType == 4 || this.data.dialogType == 7 || this.data.dialogType == 8 || this.data.dialogType == 9) {
      //console.log("this.data.dialogType:" + this.data.dialogType);
      var num = 3;
      if (this.data.dialogType < 7) {
        if (marker.isMa) {
          num = 4
        }
      } else {
        //console.log("marker.isMa:" + marker.isMa);
        if (marker.isMa) {
          num = 9
        } else {
          num = 8
        }
      }
      setMapControls(this, {
        dialogType: num
      });
      walkLine(that, marker.longitude, marker.latitude, arr[1], oIndex);
    }

    this.setData({
      reserveInfo: marker,
      reserve: {
        x: marker.longitude, //经度  
        y: marker.latitude, //纬度
        text: marker.address //地理位置
      }
    });
    setTimeout(function() {
      markerTap = true;
    }, 1500);
  },
  controltap(e) {
    var that = this;
    console.log(e.controlId);
    switch (e.controlId) {
      case 1:
        break;
      case 2: // 个人中心
        wx.navigateTo({
          url: '/pages/userCenter/userCenter'
        });
        break;
      case 3: // 问题反馈
        wx.navigateTo({
          url: '/pages/msgList/msgList',
        });
        // var _type = 1,
        //   sysCode = null;
        // if (that.data.dialogType > 1 && that.data.dialogType < 10) {
        //   _type = 2;
        // }

        // wx.navigateTo({
        //   url: '/pages/feedback/feedback?type=' + _type + "&tripId=" + that.data.riding.orderCode + "&sysCode=" + that.data.riding.umbrellaCode
        // });
        break;
      case 4: //重新定位
        this.indexTapMap();
        this.moveToLocation();
        wx.setStorageSync('NewCity', '')
        this.dw()
        wx.createMapContext('myMap').getCenterLocation({
          success: function(res) {
            showMarker(that, res);
          }
        });
        break;
      case 5: // 扫码

        if (that.data.dialogType == 2 || that.data.dialogType == 3 || that.data.dialogType == 4) {
          app.showTips("使用中...");
        } else if (test) {
          test = false;
          checkHaveNotEnd(function() {
            scanCode(that);
          });
        }
        break;
      case 6: // 天气

        wx.navigateTo({
          url: '/pages/weather/wIndex/wIndex'
        });

        //that.openMarkDialog();

        // if (that.data.dialogType == 3) {
        //     app.showTips("骑行中...");
        // } else {
        //     checkHaveNotEnd(function() {
        //         wx.navigateTo({
        //             url: '/pages/numLock/numLock'
        //         });
        //     });
        // }
        break;
      case 7: //登山杖的
        wx.navigateTo({
          url: '/pages/list/list'
        });
        break;
      case 8: // 灯光
        app.showTips("指令发送成功!");
        if (app.globalData.lampStatus == 1) {
          //此处调用的是开关灯接口
          umApi.turnOnOrOffLampUsingGET("open", function(res) {
            console.log(res)
            app.handleApiFail(res, function() {
              app.globalData.lampStatus = 2;
              setMapControls(that, {
                dialogType: that.data.dialogType
              });
            });
          });
        } else if (app.globalData.lampStatus == 2) {
          umApi.turnOnOrOffLampUsingGET("close", function(res) {
            app.handleApiFail(res, function(res) {
              app.globalData.lampStatus = 1;
              setMapControls(that, {
                dialogType: that.data.dialogType
              });
            });
          });
        }
        break;
      case 10: //用户帮助按钮
        wx.navigateTo({
          url: '/pages/msgList/msgList',
        });
        break;
      default:
        break;
    }
  },
  moveToLocation: function() {
    wx.createMapContext('myMap').moveToLocation()
  },
  //事件处理函数
  onReady: function(e) {
    // 使用 wx.createMapContext 获取 map 上下文
    var that = this;
  },
  onShareAppMessage: function() {
    return {
      title: app.globalData.sysInfo.shareTitle,
      path: '/pages/index/index'
    }
  },
  onShow: function(opt) {
    console.log('onShow')
    if (wx.getStorageSync('NewCity') == wx.getStorageSync('city') || wx.getStorageSync('NewCity') == '') {
      this.moveToLocation()
    }
    var that = this
    console.log('加载3')
    that.data.setInter=setInterval(function () {
      if (that.data.controls.length <= 0) {
        console.log('重新加载')
        usericycleState(that)
        that.moveToLocation()
      } else {
        console.log('有数据')
        clearInterval(that.data.setInter)
      }
    }, 1000)
    this.dw()
    usericycleState(this)
    //获取用户状态
    /* */
    // if (that.data.userInfo.nickName) {
    //     usericycleState(that);
    // }
  },
  onLoad: function(opt) {
    console.log('加载')
    //this.moveToLocation();
    loadData(this)
    // checkMobile(this);
    wx.showLoading({
      title: '加载中',
    });
    this.getLocation(); //获取用户的经纬度
    //点击事件的切换
    this.getProductList(); //调用产品列表   
    //初始化登山杖的数据

    //默认的产品
    var that = this;
    //调用应用实例的方法获取全局数据
    //高德地图获取用户的地址信息



    var initStatus = 0;
    // wx.showLoading({
    //   title: '初始化...',
    //   mask: true
    // });
    app.getUserInfo(function(userInfo) {
      that.setData({
        userInfo: userInfo
      });
      // app.showTips("骑行中...");
      userApi.saveUserInfoUsingGET(userInfo.nickName, userInfo.avatarUrl);
      //系统配置相关的接口
      appApi.querySysSetUsingGET(function(res) {
        app.handleApiFail(res, function() {
          var sysItem = res.data.item;
          sysItem.umbrellaNotices = sysItem.umbrellaBuyNotice.split("\r\n");
          app.globalData.sysInfo = Object.assign(app.globalData.sysInfo, sysItem);
          appApi.queryAppShareUsingGET(function(res2) {
            app.handleApiFail(res2, function() {
              app.globalData.sysInfo = Object.assign(app.globalData.sysInfo, res2.data.item);

              that.setData({
                sysInfo: app.globalData.sysInfo
              });

              initStatus += 1;

              if (initStatus > 1) {
                wx.hideLoading();
              }
            });
          });
        });
      });

      if (false) {
        checkUnlock(that, decodeURIComponent(opt.q)); //检查解锁情况
      } else {
        wx.getLocation({
          type: "gcj02",
          success: function(res) {
            that.setData({
              longitude: res.longitude,
              latitude: res.latitude
            });
            wx.createMapContext('myMap').moveToLocation();
            showMarker(that, res);

            initStatus += 1;

            if (initStatus > 1) {
              wx.hideLoading();
            }

          }
        });
        usericycleState(that);
      }

    });
    this.moveToLocation()
  },
  weather: function(e) { //当前城市天气api
    var that = this
    myAmapFun.getWeather({
      city: e,
      success: function(data) {
        //console.log(data)
        wx.hideLoading() //关闭提示
        that.setData({
          weatherType: data.liveData.weather,
          temperature: data.liveData.temperature
        })
        //console.log(data.liveData.weather.indexOf("雨"))
        if (data.liveData.weather.indexOf("雨") != -1) {
          that.setData({
            weatherimg: 'yu',
          })
        } else if (data.liveData.weather.indexOf("雪") != -1) {
          that.setData({
            weatherimg: 'xue',
          })
        } else if (data.liveData.weather.indexOf("晴") != -1) {
          that.setData({
            weatherimg: 'qing',
          })
        } else if (data.liveData.weather.indexOf("多云") != -1) {
          that.setData({
            weatherimg: 'duo',
          })
        } else if (data.liveData.weather.indexOf("少云") != -1) {
          that.setData({
            weatherimg: 'shao',
          })
        } else if (data.liveData.weather.indexOf("雷") != -1) {
          that.setData({
            weatherimg: 'lei',
          })
        } else if (data.liveData.weather.indexOf("阴") != -1) {
          that.setData({
            weatherimg: 'yin',
          })
        } else if (data.liveData.weather.indexOf("雾") != -1) {
          that.setData({
            weatherimg: 'wu',
          })
        } else {
          that.setData({
            weatherimg: data.liveData.weather
          })
        }
      },
      fail: function(info) {
        //失败回调
        //console.log(info)
      }
    });
  },
  dw: function() { //城市选择
    wx.showLoading({
      title: '加载中',
    });
    var that = this
    if (wx.getStorageSync('NewCity') == '') {

      this.weather() //获取当前城市天气
      myAmapFun.getRegeo({
        success: function(data) {
          //console.log('皮皮屁');
          that.setData({
            city: data[0].regeocodeData.addressComponent.city
          })
          wx.setStorageSync('city', data[0].regeocodeData.addressComponent.city)
          console.log(wx.getStorageSync('city'))
          //当前城市
        },
        fail: function(info) {
          //失败回调
          //console.log(info)
        }
      });
    } else {
      wx.request({
        url: 'https://restapi.amap.com/v3/geocode/geo',
        method: 'get',
        data: {
          key: '9364bfe27f14e58780b67bcff73a7ea2',
          address: wx.getStorageSync('NewCity'),
          city: wx.getStorageSync('NewCity')
        },
        success: function(res) {
          console.log(res)
          if (wx.getStorageSync('NewCity') == wx.getStorageSync('city')) {
            that.moveToLocation();
            that.weather()
          } else {
            that.weather(wx.getStorageSync('NewCity'))
            that.setData({
              longitude: res.data.geocodes[0].location.split(",")[0],
              latitude: res.data.geocodes[0].location.split(",")[1]
            })
          }

        },
        fail: function(res) {

        }
      })
      that.setData({
        city: wx.getStorageSync('NewCity')
      })
    }
  },
  onUnload: function() {
    clearTimeout(lockTimer);
  },
  openWXMapPage: function() {
    var that = this;
    openWXMap(that.data.reserve.x, that.data.reserve.y, that.data.reserve.text);
  },
  //此处是问题反馈的页面
  closeLockHaveNotEnd: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/feedback/feedback?type=2&tripId=' + that.data.riding.orderCode + "&sysCode=" + that.data.umbrellaCode
    });
  },
  openMarkDialog: function() {
    var that = this;
    that.setData({
      mapImage: true,
      qrDialog: false
    });
  },
  closeMarkDialog: function() {
    var that = this;
    that.setData({
      mapImage: false,
      qrDialog: false,
      isShowBuy: false
    });
    return false;
  },
  callMe: function(e) {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phone
    });
  },
  openQrCodeDialog: function() {
    var that = this;
    that.setData({
      mapImage: true,
      qrDialog: true,
      isShowBuy: false
    });
    var initUrl = that.data.qrCode;
    that.createQrCode(initUrl, "mycanvas", sW * 0.6, sW * 0.6);
  },
  createQrCode: function(url, canvasId, cavW, cavH) {

    //调用插件中的draw方法，绘制二维码图片
    QR.qrApi.draw(url, canvasId, cavW, cavH);
  },
  swPoint: function(e) {
    var that = this;
    //console.log(e.currentTarget.id);
    var productTypeID = e.currentTarget.id; //产品类型
    var dialogs = that.data.dialogType; //此处是获取dialog的状态
    that.setData({
      productTypeID: e.currentTarget.id
    });
    var long = this.data.longitude;
    var lat = this.data.latitude;
    var distance = 3000;
    wx.request({
      url: this.data.assetsPath + 'api/um_machine/find_by_location?productTypeID=' + productTypeID + '&x=' + long + '&y=' + lat + '&distance=' + distance + '&dataType=all&pointType=GCJ02',
      method: 'get',
      success: function(res) {
        // //console.log('烦烦烦');
        //console.log(that.data.pointType)
        // setMapControls(that, {
        //   dialogType: dialogs
        // });
      }
    })
    clearPathAndTips(that);
    if (that.data.dialogType == 1) {
      setMapControls(that, {
        dialogType: 100
      });
    } else if (that.data.dialogType == 3 || that.data.dialogType == 4) {
      setMapControls(that, {
        dialogType: 2
      });
    }
    wx.createMapContext('myMap').getCenterLocation({
      success: function(res) {
        wx.showToast({
          title: '加载中...',
          icon: 'loading',
          duration: 2000
        });
        showMarker(that, res);
      }
    });
  },
  closeWin: function() {
    this.setData({
      showDeposit: false,
      isShowBuy: false,
      mapImage: false
    });
  },
  openBuyDialog: function(umbrellaBuy) {
    var that = this;
    that.setData({
      mapImage: true,
      isShowBuy: true,
      umbrellaBuy: umbrellaBuy
    });
  },
  umbrellaBuyAction: function(e) {
    var that = this,
      orderCode = e.target.dataset.cid;
    //用户购买产品
    umorderApi.orderBuyPaymetUsingPOST(orderCode, {
      paymentMark: "wx_js"
    }, function(res) {
      app.handleApiFail(res, function() {
        if (res.data.item) {
          var paymet = res.data.item.weiXinPaymet; //支付方式
          wx.requestPayment({
            'timeStamp': paymet.timeStamp,
            'nonceStr': paymet.nonceStr,
            'package': "prepay_id=" + paymet.prepayId,
            'signType': 'MD5',
            'paySign': paymet.sign,
            'success': function(res) {
              app.showTips("购买成功", function() {

              });
            },
            'fail': function(res) {
              //console.log(res);
            }
          })
        } else {
          app.showTips("购买成功", function() {

          });
        }
      });
    });
  },
  buyWinOpen: function() {
    var that = this;
    that.openBuyDialog(curTrips.umbrellaBuy);
  }
});

//获取用户状态
function usericycleState(that) {
  //console.log(that.data.dialogType)
  curTrips = null;
  //此处接口调用的是进行中的订单
  umorderApi.findDoingInfoUsingGET({
    pointType: "GCJ02"
  }, function(res) {
    //console.log(res)
    if (res.data.item != undefined) {
      that.setData({
        productType: res.data.item.productType
      })
      if (res.data.item.productType == 1) {
        deng = 50;
      } else {
        deng = 900;
      }
    }
    app.handleApiFail(res, function() {
      if (res.data.item != undefined) {
        hs = 900
      } else {
        hs = 105
      }
      clearTimeout(lockTimer);
      if (res.data && res.data.item) {
        if (res.data.item.lampLock) {
          app.globalData.lampStatus = 2;
        } else if (res.data.item.lampLock == false) {
          app.globalData.lampStatus = 1;
        }

        if (res.data.item.doingFeedbacks.length > 0 && res.data.item.doingFeedbacks[res.data.item.doingFeedbacks.length - 1].feedType > 1 && res.data.item.status == 30) {
          setMapControls(that, {
            dialogType: 6
          });

          that.setData({
            markers: []
          });

          // 结束投诉的行程
          reserveTimer = setInterval(function() {
            umorderApi.findDoingInfoUsingGET({
              pointType: "GCJ02"
            }, function(res) {
              app.handleApiFail(res, function() {
                if (!res.data.item || res.data.item.status != 30 || res.data.item.doingFeedbacks.length == 0) {
                  clearInterval(reserveTimer);
                  usericycleState(that);

                  wx.createMapContext('myMap').getCenterLocation({
                    success: function(res) {
                      showMarker(that, res);
                    }
                  });
                }
              })
            })
          }, 5000);

          that.closeWin();
        } else {
          var trip = res.data.item;

          curTrips = trip;

          if (res.data.item.isShowBuy) {
            var trip = res.data.item;

            //console.log("isShowBuy: " + res.data.item.isShowBuy);

            if (that.data.dialogType != 7 && that.data.dialogType != 8 && that.data.dialogType != 9) {
              setMapControls(that, {
                dialogType: 7
              });
            }

            //that.openBuyDialog(trip.umbrellaBuy);

          }

          if (trip.status == 30) {
            trip.time = Math.ceil((new Date().getTime() - trip.beginTime) / 1000 / 60);

            that.setData({
              riding: trip,
              tripId: trip.orderCode,
              qrCode: trip.qrCode
            });


            if (that.data.dialogType != 3 && that.data.dialogType != 4 && that.data.dialogType != 7 && that.data.dialogType != 8 && that.data.dialogType != 9) {
              setMapControls(that, {
                dialogType: 2
              });

            }

            lockTimer = setTimeout(function() {
              usericycleState(that);
            }, 5000);

          } else if (trip.status == 40) {
            setMapControls(that, {
              dialogType: 100
            });
            clearTimeout(lockTimer);
            that.setData({
              tripId: 0,
              riding: trip
            });
            that.closeWin();

            var curPage = getCurrentPages();

            if (curPage[curPage.length - 1].route == "pages/bikeComplete/bikeComplete") {
              clearTimeout(lockTimer);
              return false;
            }

            app.showTips("还成功!", function() {
              wx.navigateTo({
                url: '/pages/bikeComplete/bikeComplete'
              });
            });
          } else if (trip.status == 50) {
            setMapControls(that, {
              dialogType: 100
            });
            that.closeWin();
            clearTimeout(lockTimer);
            that.setData({
              tripId: 0
            });

            var curPage = getCurrentPages();

            if (curPage[curPage.length - 1].route == "pages/bikeComplete/bikeComplete") {
              clearTimeout(lockTimer);
              return false;
            }
            // 此处是跳转到订单详情页
            app.showTips("还产品成功", function() {
              wx.navigateTo({
                url: '/pages/journeyDetails/journeyDetails'
              });
            });
          } else {
            clearTimeout(lockTimer);
          }
        }
      } else {
        setMapControls(that, {
          dialogType: 100
        });
        that.closeWin();
      }
    });
  });
}



function walkLine(that, x, y, index, oIndex) {
  wx.createMapContext('myMap').getCenterLocation({
    success: function(res) {
      var origin = {
        x: res.longitude,
        y: res.latitude
      };
      var markers = that.data.markers,
        controls = that.data.controls;
      if (controls[0].id == 1) {
        controls = controls.slice(1);
      }
      if (markers[markers.length - 1].isNeedle) {
        origin = {
          x: markers[markers.length - 1].longitude,
          y: markers[markers.length - 1].latitude
        }
      }
      myAmapFun.getWalkingRoute({
        origin: origin.x + ',' + origin.y,
        destination: x + ',' + y,
        success: function(data) {
          var points = [{
            longitude: origin.x,
            latitude: origin.y
          }];

          if (data.paths && data.paths[0] && data.paths[0].steps) {
            var steps = data.paths[0].steps;
            for (var i = 0; i < steps.length; i++) {
              var poLen = steps[i].polyline.split(';');
              for (var j = 0; j < poLen.length; j++) {
                points.push({
                  longitude: parseFloat(poLen[j].split(',')[0]),
                  latitude: parseFloat(poLen[j].split(',')[1])
                })
              }
            }
          }
          points.push({
            latitude: y,
            longitude: x
          });

          if (markers[markers.length - 1].isNeedle) {
            markers[markers.length - 1].latitude = points[0].latitude;
            markers[markers.length - 1].longitude = points[0].longitude;
          } else {
            markers.push({
              iconPath: "/map/needle.png",
              latitude: points[0].latitude,
              longitude: points[0].longitude,
              width: 13,
              height: 34,
              isNeedle: true
            });
          }

          if (markers[oIndex]) {
            markers[oIndex].callout = {};
          }


          if (data.paths[0] && data.paths[0].distance && data.paths[0].duration) {
            markers[index].callout = {
              content: "步行 " + Math.ceil(data.paths[0].duration / 60) + "分钟 \n距离 " + data.paths[0].distance + "米",
              color: "#666666",
              fontSize: 12,
              borderRadius: 6,
              bgColor: "#ffffff",
              padding: 6,
              display: 'ALWAYS'
            }
          }
          that.setData({
            markers: markers,
            controls: controls,
            includePoints: points,
            polyline: [{
              points: points,
              color: "#0091ff",
              width: 6
            }]
          });
        }
      });
    }
  });
}


//
function openWXMap(x, y, text) {
  wx.openLocation({
    latitude: y,
    longitude: x,
    address: text
  })
  
}
//此处是取出开锁界面的orderS的值
wx.getStorage({
  key: 'orderS',
  success: function(res) {
    //console.log(res);
    that.setData({
      firstUPrompt: res
    })
  },
})

//改部分是订单信息
function checkHaveNotEnd(callback) {
  //获取用户的状态
  umorderApi.findDoingInfoUsingGET({}, function(res) {
    app.handleApiFail(res, function() {
      //此处需要获取用户所使用的产品类型
      // wx.setStorage({
      //   key: 'productType',
      //   data: res.data.item.productType,
      // })
      if (res.data.item && res.data.item.status == 10) {
        app.showHaveNotEndDialog();
      } else {
        callback();
      }
    });
  });
}
//扫码函数
function scanCode(that) {
  wx.scanCode({
    success: (res) => {
      if (res.errMsg == "scanCode:ok" && res.result.indexOf('admin.ryjgb.net')) {
        var qr = res.result
        var value = wx.getStorageSync('access_token');
        var headvalue = 'Bearer' + ' ' + value;
        console.log(value)
        wx.request({
          url: that.data.assetsPath + 'api/userprofile',
          method: 'get',
          header: {
            Authorization: headvalue
          },
          success: function(res) {
            test = true;
            console.log(res);
            if (res.data.item.authStatus == '0') {
              wx.setStorage({
                key: 'SMJG',
                data: {
                  qrcode: qr,
                  x: lastPos.x,
                  y: lastPos.y
                }
              })
              wx.navigateTo({
                url: '/pages/mobileBind/mobileBind',
              })
            } else {
              judge(qr, that)
            }
          }
        })
        //  checkUnlock(that, res.result);
        // var smjg = res.result;
        // //此处将扫码之后的结果缓存起来
        // wx.setStorage({
        //   key: 'er',
        //   data: res.result
        // })
      }
    },
    fail: (res) => {
      //console.log(res);
      test = true;
    }
  });
};

function judge(e, that) { //判断是否交了押金 
  var value = wx.getStorageSync('access_token');
  var headvalue = 'Bearer' + ' ' + value;
  console.log(that)
  wx.request({
    url: that.data.assetsPath + 'api/get_deposit?qrCode=' + e,
    header: {
      Authorization: headvalue
    },
    method: 'get',
    success: function(res) {
      //console.log(res)
      if (res.data.item == 0) {
        checkUnlock(that, e)
      } else {
        wx.setStorage({
          key: 'SMJG',
          data: {
            qrcode: e,
            x: lastPos.x,
            y: lastPos.y
          }
        })
        wx.navigateTo({
          url: "/pages/deposit/deposit"
        });
      }
    }
  })
}
//校验解锁
function checkUnlock(that, result) {
  wx.navigateTo({
    url: "/pages/unLockLoading/unLockLoading?code=" + encodeURIComponent(result) + "&x=" + lastPos.x + "&y=" + lastPos.y
  });
}

function showMarker(thatApp, data) {
  lastPos = {
    x: data.longitude,
    y: data.latitude
  };
  // 投诉中不显示
  if (thatApp.data.dialogType == 6) {
    thatApp.setData({
      markers: []
    });
    return false;
  }
  var that = this;
  //此接口是上面的切换以及图标的遍历方法
  ummachineApi.findByLocationAndDistanceUsingGET(thatApp.data.productTypeID, data.longitude, data.latitude, 2000, {
    dataType: thatApp.data.dataType,
    pointType: "GCJ02"
  }, function(res) {
    //console.log(res)
    app.handleApiFail(res, function() {
      // //console.log('屁屁屁屁屁');
      //   //console.log(res.data.item);
      wx.hideToast();
      wx.hideLoading();
      var arr = [],
        ma = res.data.item.machineList,
        ag = res.data.item.agentList,
        maLength = 0;
      if (ma && ma.length > 0) {
        maLength = ma.length;
        for (let i = 0; i < ma.length; i++) {
          arr.push({
            iconPath: "/map/jgb/umbrella_position.png",
            id: ma[i].assetNumber + "," + i,
            latitude: ma[i].locationLat,
            longitude: ma[i].locationLon,
            width: 41,
            height: 48,
            address: ma[i].locationAddress,
            locationDesc: ma[i].locationDesc,
            distance: ma[i].distance,
            agentName: ma[i].assetNumber,
            index: i,
            isMa: true,
            idlePositionNum: ma[i].idlePositionNum,
            existUmbrellNum: ma[i].existUmbrellNum,
            isMa: true,
            anchor: {
              x: 0.5,
              y: 0.5
            }
          });
        }
      }

      if (ag && ag.length > 0) {
        for (let i = 0; i < ag.length; i++) {
          //var arrt = gcoord.bd09togcj02(ag[i].location.x, ag[i].location.y)
          arr.push({
            iconPath: "/map/jgb/branch_position.png",
            id: ag[i].uid + "," + (maLength + i),
            latitude: ag[i].location.y,
            longitude: ag[i].location.x,
            width: 41,
            height: 48,
            index: (maLength + i),
            agentName: ag[i].agentName,
            address: ag[i].locationAddress,
            locationDesc: ag[i].locationDesc,
            distance: ag[i].distance,
            agentPhone: ag[i].agentPhone,
            businessTime: ag[i].businessTime,
            idlePositionNum: ag[i].idlePositionNum,
            existUmbrellNum: ag[i].existUmbrellNum,
            anchor: {
              x: 0.5,
              y: 0.5
            }
          });
        }
      }
      thatApp.setData({
        markers: arr
      });
      //console.log(thatApp.data.markers);
    });
  });
}
//此处是改变地图的行高，以及遍历出来哪些按钮图片
function setMapControls(that, obj) {
  wx.getSystemInfo({
    success: function(res) {
      //console.log(res);
      // 可使用窗口宽度、高度
      //console.log(res.windowHeight - res.windowWidth / 750 * 300 - 40);
      //console.log('width=' + res.windowWidth);
      // 计算主体部分高度,单位为px
      that.setData({
        // second部分高度 = 利用窗口可使用高度 - first部分高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
        second_height: res.windowHeight - res.windowWidth / 750 * 300
      })
    }
  })
  var _sH, testDis = 100;
  if (obj.dialogType == 100) {
    testDis = 84;
    _sH = sH * 0.84;
    clearPathAndTips(that);

  } else if (obj.dialogType == 2) { //2 行高度    行程中。。。
    testDis = 66;
    _sH = sH * 0.66;
  } else if (obj.dialogType == 7) { //当用户使用产品超过一天，提醒用户是否购买产品
    testDis = 55;
    _sH = sH * 0.55;
  } else if (obj.dialogType == 8) { //可购买雨伞 行程中选择驿站
    testDis = 40;
    _sH = sH * 0.40;
  } else if (obj.dialogType == 9) { //可购买雨伞 行程中选择棒机
    testDis = 37;
    _sH = sH * 0.37;
  } else if (obj.dialogType == 1) { // 行高度   点选Marker查看棒机或驿站信息
    testDis = 66;
    _sH = sH * 0.66;
  } else if (obj.dialogType == 3) { // 行高度  行程中选择驿站
    testDis = 55;
    _sH = sH * 0.55;
  } else if (obj.dialogType == 4) { // 行高度   行程中选择棒机
    testDis = 47;
    _sH = sH * 0.47;
  } else if (obj.dialogType == 6) { // 1.5行高度   投诉中
    testDis = 76;
    _sH = sH * 0.76;
    that.setData({
      dialogType: obj.dialogType,
      mapHeight: testDis,
      controls: []
    });
    return false;
  }

  that.setData({
    dialogType: obj.dialogType,
    mapHeight: testDis,
    controlsCenter: {
      id: 1,
      iconPath: '/map/needle.png',
      position: (function() {
        return {
          left: sW / 2 - 7,
          top: _sH / 2 - 30,
          width: 13,
          height: 34
        }
      }())
    },
    controls: (function() {


      /*
       0: needle  不可移动中心指针
       1: map_my  用户中心按钮
       2: map_help  帮助按钮
       3: map_location   定位按钮
       4: sweep_button    扫码按钮
       *
       * */
      //在此处获取productTypeID
      //  //console.log(that.data.productTypeID);
      if (that.data.productTypeID != 1) {
        var markers = that.data.markers;
        if (markers.length > 0 && markers[markers.length - 1].isNeedle) {
          if (obj.dialogType == 3 || obj.dialogType == 4 || obj.dialogType == 6 || obj.dialogType == 7 ||
            obj.dialogType == 8 || obj.dialogType == 9) {
            return addActivityMapButton(controlsFixed(_sH).slice(1, 5));
          } else if (obj.dialogType == 1) {
            return addActivityMapButton(controlsFixed(_sH).slice(1));
          } else if (obj.dialogType == 2) {
            return addActivityMapButton(controlsFixed(_sH).slice(0, 5));
          } else {
            return addActivityMapButton(controlsFixed(_sH));
          }
        } else if (obj.dialogType == 3 || obj.dialogType == 4 || obj.dialogType == 5 ||
          obj.dialogType == 6 || obj.dialogType == 7 || obj.dialogType == 8 || obj.dialogType == 9) {
          return addActivityMapButton(controlsFixed(_sH).slice(0, 5));
        } else if (obj.dialogType == 2) {
          return addActivityMapButton(controlsFixed(_sH).slice(0, 5));
        } else {
          return addActivityMapButton(controlsFixed(_sH));
        }
      } else {
        var markers = that.data.markers;
        if (markers.length > 0 && markers[markers.length - 1].isNeedle) {
          if (obj.dialogType == 3 || obj.dialogType == 4 || obj.dialogType == 6 || obj.dialogType == 7 ||
            obj.dialogType == 8 || obj.dialogType == 9) {
            return addLampMapButton(addActivityMapButton(controlsFixed(_sH).slice(1, 5)));
          } else if (obj.dialogType == 1) {
            return addActivityMapButton(controlsFixed(_sH).slice(1));
          } else if (obj.dialogType == 2) {
            return addLampMapButton(addActivityMapButton(controlsFixed(_sH).slice(0, 5)));
          } else {
            return addActivityMapButton(controlsFixed(_sH));
          }
        } else if (obj.dialogType == 3 || obj.dialogType == 4 || obj.dialogType == 5 ||
          obj.dialogType == 6 || obj.dialogType == 7 || obj.dialogType == 8 || obj.dialogType == 9) {
          return addLampMapButton(addActivityMapButton(controlsFixed(_sH).slice(0, 5)));
        } else if (obj.dialogType == 2) {
          return addLampMapButton(addActivityMapButton(controlsFixed(_sH).slice(0, 5)));
        } else {
          return addActivityMapButton(controlsFixed(_sH));
        }
      }
      var markers = that.data.markers;
      if (markers.length > 0 && markers[markers.length - 1].isNeedle) {

        if (obj.dialogType == 3 || obj.dialogType == 4 || obj.dialogType == 6 || obj.dialogType == 7 ||
          obj.dialogType == 8 || obj.dialogType == 9) {
          return addLampMapButton(addActivityMapButton(controlsFixed(_sH).slice(1, 5)));
        } else if (obj.dialogType == 1) {
          return addActivityMapButton(controlsFixed(_sH).slice(1));
        } else if (obj.dialogType == 2) {
          return addLampMapButton(addActivityMapButton(controlsFixed(_sH).slice(0, 5)));
        } else {
          return addActivityMapButton(controlsFixed(_sH));
        }
      } else if (obj.dialogType == 3 || obj.dialogType == 4 || obj.dialogType == 5 ||
        obj.dialogType == 6 || obj.dialogType == 7 || obj.dialogType == 8 || obj.dialogType == 9) {
        return addLampMapButton(addActivityMapButton(controlsFixed(_sH).slice(0, 5)));
      } else if (obj.dialogType == 2) {
        return addLampMapButton(addActivityMapButton(controlsFixed(_sH).slice(0, 5)));
      } else {
        return addActivityMapButton(controlsFixed(_sH));
      }
    }()) //

  })
}


function clearPathAndTips(that) {
  var markers = that.data.markers;
  if (markers.length > 0 && markers[markers.length - 1].isNeedle) {
    markers = markers.slice(0, markers.length - 1);
  }
  if (that.data.reserveInfo && markers[that.data.reserveInfo.index]) {
    markers[that.data.reserveInfo.index].callout = {};
  }
  that.setData({
    markers: markers,
    polyline: [],
    controls: showCenterControl(that)
  });
}

function showCenterControl(that) {
  var controls = that.data.controls;
  // //console.log("that.data.controls!!!");
  // //console.log(that.data.controls);
  if (controls.length > 0) {
    if (controls[0].id != 1) {
      controls.unshift(that.data.controlsCenter);
    }
    return controls;
  } else {
    return []
  }
}


var EARTH_RADIUS = 6378137.0; //单位M
var PI = Math.PI;

function getRad(d) {
  return d * PI / 180.0;
}

function getFlatternDistance(lat1, lng1, lat2, lng2) {

  if (lat1 == lat2 && lng1 == lng2) return 0;

  var f = getRad((lat1 + lat2) / 2);
  var g = getRad((lat1 - lat2) / 2);
  var l = getRad((lng1 - lng2) / 2);
  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);
  var s, c, w, r, d, h1, h2;
  var a = EARTH_RADIUS;

  var fl = 1 / 298.257;
  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;
  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;

  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;

  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}
var jouList;
var lastTime;

function loadData(that) {
  setInterval(function () {
    msgApi.sysListUsingGET("2", {
      ltTime: lastTime
    }, function (res) {
      app.handleApiFail(res, function () {
        wx.hideToast();
        //console.log(res.data)
        if (res.data.success) {
          var content = res.data.content;
          if (lastTime && res.data.content.length == 0) {
            return false;
          }
          jouList = []
          for (var i = 0; i < content.length; i++) {
            if (content[i].bizType == 55 && !content[i].isRead) {
              jouList.push(content[i])
            }
          }
          that.setData({
            jList: jouList
          });
          if (jouList.length > 0) {
            imgs = 'Feedback2'
          } else {
            imgs = 'Feedback'
          }
        }
      });
    });
  }, 5000)
}