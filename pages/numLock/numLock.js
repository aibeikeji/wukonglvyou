var app = getApp();



var lockTimer, overTimer, timerUnlockFlag;

Page({
    inputDis: "none",
    data: {
        number: [" ", " ", " ", " ", " ", " ", " ", " "],
        assetsPath: app.globalData.assetsPath,
        focus: true,
        inpVal: "",
        disabled: true, //disabled
    },

    onLoad: function () {
    },
    onUnload: function () {
        clearInterval(lockTimer);
        clearInterval(timerUnlockFlag);
        clearTimeout(overTimer);
    },
    inputFocus: function (event) {
        this.setData({
            inputDis: "none"
        });
    },
    inputBlur: function (event) {
        this.setData({
            inputDis: "block"
        });
    },
    inputChange: function (event) {
        var arr = event.detail.value.split("");
        if (arr.length == 8) {
            this.setData({
                disabled: false
            });
        } else {
            this.setData({
                disabled: true
            });
        }
        this.setData({
            inpVal: event.detail.value
        });
        arr.push(" ", " ", " ", " ", " ", " ", " ", " ");
        arr.splice(8, arr.length);
        this.setData({
            number: arr
        });
    },
    numberLock: function () {
        var that = this;
        checkUnlock(that);
    }

});

function checkUnlock(that) {
    wx.navigateTo({
        url: "/pages/unLockLoading/unLockLoading?code=" + that.data.inpVal
    });
}