//myJourney.js
//获取应用实例
var app = getApp();

var umorderApi = app.initApi("UmordercontrollerApi");

var util = require('../../utils/util.js');
var jouList;
var lastTime;

Page({
    data: {
        userInfo: {},
        assetsPath: app.globalData.assetsPath,
        jList: []
    },
    onReady: function (e) {
    },
    onLoad: function () {
        var that = this;
        jouList = [];
        lastTime = null;
        loadData(that);
    },
    scrolltolower: function () {
        var that = this;
        loadData(that);
        wx.showToast({
            title: "loading",
            icon: 'loading',
            duration: 10000
        });
    },
    journeyDetailsAction: function(event) {
        var that = this;
        wx.navigateTo({
            url: '/pages/journeyDetails/journeyDetails?cid=' + event.currentTarget.id
        });
    }
});

function loadData(that) {
    umorderApi.findOrderListUsingPOST({ltTime :lastTime}, function (res) {
        wx.hideToast();
        app.handleApiFail(res, function(){
            var content = res.data.content;
            if (lastTime && res.data.content.length == 0) {
                return false;
            }
            for (var i = 0; i < content.length; i++) {
                jouList.push({
                    id: content[i].id,
                    time: util.formatTime(new Date(content[i].beginTime)),
                    price: content[i].price,
                    status: content[i].status,
                    code: content[i].orderCode,
                    payType: content[i].payType
                });
                if (content.length == (i + 1)) {
                    lastTime = content[i].finishTime;
                }
            }
            that.setData({
                jList: jouList
            });
        });
    });
}
//此处是时间不够前面加0的函数
function add0(m) { return m < 10 ? '0' + m : m }
//此处是时间戳转化为年月日时分秒
function timeFormat(timestamp){
  //timestamp是整数，否则要parseInt转换,不会出现少个0的情况
  var time = new Date(timestamp);
  var year = time.getFullYear();
  var month = time.getMonth() + 1;
  var date = time.getDate();
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var seconds = time.getSeconds();
  return year + '-' + add0(month) + '-' + add0(date) + ' ' + add0(hours) + ':' + add0(minutes) + ':' + add0(seconds);
}
 
