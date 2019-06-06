// pages/find/find.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //获取当前经纬度
    longitude: 113.943189, //获取经度
    latitude: 22.549001, //获取纬度
    size: 10, //每一页的条数
    pagesNum: 1, //默认的页数
    activeLitem: [], //初始化活动列表
    hasMore: false, //是否有更多的数据
    dayBefore: 1, //多少天前
    assetsPath: app.globalData.assetsPath

  },
  //事件格式的转化---转化为多少天前
  dateDiff: function(timestamp) {
    // 补全为13位
    var arrTimestamp = (timestamp + '').split('');
    for (var start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
        arrTimestamp[start] = '0';
      }
    }
    timestamp = arrTimestamp.join('') * 1;

    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - timestamp;

    // 如果本地时间反而小于变量时间
    if (diffValue < 0) {
      return '不久前';
    }

    // 计算差异时间的量级
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;

    // 数值补0方法
    var zero = function(value) {
      if (value < 10) {
        return '0' + value;
      }
      return value;
    };

    // 使用
    if (monthC > 12) {
      // 超过1年，直接显示年月日
      return (function() {
        var date = new Date(timestamp);
        return date.getFullYear() + '年' + zero(date.getMonth() + 1) + '月' + zero(date.getDate()) + '日';
      })();
    } else if (monthC >= 1) {
      return parseInt(monthC) + "月前";
    } else if (weekC >= 1) {
      return parseInt(weekC) + "周前";
    } else if (dayC >= 1) {
      return parseInt(dayC) + "天前";
    } else if (hourC >= 1) {
      return parseInt(hourC) + "小时前";
    } else if (minC >= 1) {
      return parseInt(minC) + "分钟前";
    }
    return '刚刚';
  },

  /**
   * 生命周期函数--监听页面加载
   */
  //点击事件拿到相应id的
  getId: function(event) {
    var that = this;
    console.log(event.currentTarget.id);
    var id = event.currentTarget.id;
    wx.navigateTo({
      url: '/pages/findDetails/findDetails?id=' + id,
    });
    that.getReadVolume(id);
    setTimeout(function() {
      that.getData(that.data.pagesNum, that.data.size, that.data.longitude, that.data.latitude);
    })

  },
  //阅读量的增加
  getReadVolume: function(id) {
    var value = wx.getStorageSync('access_token');
    var headvalue = 'Bearer' + ' ' + value;
    wx.request({
      url: this.data.assetsPath + 'api/content/activity/read?id=' + id + '',
      method: 'get',
      header: {
        Authorization: headvalue
      },
      success: function() {
        console.log('接口返回成功！')
      }
    })
  },
  //获取数据的接口
  getData: function(num, size, longitude, latitude) {
    var that = this;
    console.log(that.data.assetsPath);
    var value = wx.getStorageSync('access_token');
    var headvalue = 'Bearer' + ' ' + value;
    wx.request({
      url: this.data.assetsPath + 'api/content/activity/list?',
      method: 'get',
      header: {
        Authorization: headvalue
      },
      data: {
        'page': num,
        'size': size,
        'x': longitude,
        'y': latitude
      },
      success: function(res) {
        setTimeout(function() {
          wx.stopPullDownRefresh();
        }, 500);
        for (var i = 0; i < res.data.content.length; i++) {
          var test = res.data.content[i];
          test.remark = test.remark.substring(0, 20) + '...';
          test.createTime = test.createTime;
          test.createTime = that.dateDiff(test.createTime);
        }
        wx.hideLoading();
        if (that.data.hasMore || res.data.content.length >= 10) {
          that.setData({
            activeLitem: res.data.content
          });
        } else {
          that.setData({
            activeLitem: res.data.content
          });
        }
      },
      fail: function(e) {
        wx.showToast({
          title: '获取失败', //标题   
          icon: 'loading',
          duration: 2000000,
          mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false      
          success: function() {}, //接口调用成功的回调函数      
          fail: function() {}, //接口调用失败的回调函数      
          complete: function() {} //接口调用结束的回调函数    
        })

      }
    })
  },

  onLoad: function(options) {
    //此处是获取用户的经纬度信息
    var that = this;
    wx.showLoading({
      title: '加载中',
    });
    //获取token的值
    wx.getStorage({
      key: 'access_token',
      success: function(res) {
        console.log('皮皮是是猫');
        console.log(res);
      }
    });

    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        longitude: res.longitude;
        latitude: res.latitude
      },
    });
    that.getData(that.data.pagesNum, that.data.size, that.data.longitude, that.data.latitude);
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
    console.log('下拉');
    this.setData({
      pageNum: 1,
      hasMore: false
    })
    this.getData(this.data.pagesNum, this.data.size, this.data.longitude, this.data.latitude);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('上啦加载');
    let {
      pageNum,
      hasMore
    } = this.data;
    if (hasMore) {
      pageNum: pageNum + 1;
      this.getData(this.data.pagesNum, this.data.size, this.data.longitude, this.data.latitude);
    }
    else {
      wx.stopPullDownRefresh();
    }
    //显示加载更多

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})