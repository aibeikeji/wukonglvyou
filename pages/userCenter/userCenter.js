//userCenter.js
//获取应用实例
var app = getApp();

var userApi = app.initApi("UsercontrollerApi");
var sysApi = app.initApi("AppparamcontrollerApi");

Page({
    data: {
        userInfo: app.globalData.userInfo,
        assetsPath: app.globalData.assetsPath,
        userData: {
            headImgPath: app.globalData.assetsPath + "wx-applet/portrait.png"
        },
        contactMobile: null,
        defaultImage:'../../images/webwxgetmsgimg.jpg',//设置用户默认的图像
    },
    onShow: function () {
      
        var that = this;
        //此处是获取用户芝麻信用系列的接口
        userApi.getMyProfileUsingGET(function(res) {
            app.handleApiFail(res, function() {
                if (res.data.item) {
                    var item = res.data.item;
                    that.setData({
                        userData: item
                    });
                    app.globalData.userData = item;
                }
            });
        });
    },
  onLoad: function (opt) {
  
    console.log(this.data)
  },
    //邀请好友
    invitationAction: function() {
        // if (app.globalData.userData.authStep < 4) {
        //     app.showDialog("你还没有通过实名认证, 暂时不能邀请好友。");
        // } else {
        //     wx.navigateTo({
        //         url: '/pages/inviteFriend/inviteFriend'
        //     });
        // }
        wx.navigateTo({
          url: '/pages/inviteFriend/inviteFriend'
        });
    },
    //此处应该是联系我们的
    callMe: function() {
        var that = this;
        if (that.data.contactMobile) {
            wx.makePhoneCall({
                phoneNumber: that.data.contactMobile
            });
        } else {
            sysApi.querySysSetUsingGET(function(res) {
                app.handleApiFail(res, function() {
                    if (res.data.item) {
                        var item = res.data.item;
                        that.setData({
                            contactMobile: item.contactMobile
                        });
                        wx.makePhoneCall({
                            phoneNumber: item.contactMobile
                        });
                    }
                });
            });
        }
    },
    //此处是获取认证到了什么步骤
    authStepAction: function() {
        userApi.getMyProfileUsingGET(function (res) {
            app.authStepAction(res.data.item.authStep, true);
        });
    }
});

