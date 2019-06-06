//feedback.js
//获取应用实例
var app = getApp();

var userApi = app.initApi("UsercontrollerApi");


Page({
    data: {
        userInfo: {},
        inputVal: "",
        assetsPath: app.globalData.assetsPath,
        problem: [],
        problem2: [],
        selectId: null,
        selectAll: false,
        tripId: 0,
        typeId: 1,
        form: {
            text: ""
        },
        files: [],
        sysCode: null,
        disabled: true
    },
    onReady: function (e) {
    },
    onShow: function () {
        if (app.globalData.problemSelectId) {
            this.setData({
                selectId: app.globalData.problemSelectId,
                selectAll: true
            });
            app.globalData.problemSelectId = "";
        }
    },
    onLoad: function (opt) {
        var _type, that = this;
        if (opt) {
            _type = opt.type || 1;
            that.setData({
                tripId: opt.tripId,
                typeId: _type,
                sysCode: opt.sysCode,
                form: {
                    text: ""
                }
            });
        }

        userApi.findFeedbackTypeListUsingGET(_type, function (res) {
            var problem = [], problem2 = [];
            console.log(11111)
            console.log(res)
            app.handleApiFail(res, function () {
                var item = res.data.items, len = Math.min(item.length, 5);
                for (var i = 0; i < len; i++) {
                    problem.push({
                        id: item[i].id,
                        name: item[i].typeName
                    });

                }
                that.setData({
                    selectId: item[0].id
                });
                if (item.length == 6) {
                    problem.push({
                        id: item[5].id,
                        name: item[5].typeName
                    });
                } else if (item.length > 6) {
                    for (var i = 5; i < item.length; i++) {
                        problem2.push({
                            id: item[i].id,
                            name: item[i].typeName
                        });
                    }
                }
                that.setData({
                    problem: problem,
                    problem2: problem2
                });
            });
        });
    },
    scanFeedback: function () {
        var that = this;
        wx.scanCode({
            success: (res) => {
                if (res.errMsg == "scanCode:ok" || res.result) {

                    that.setData({
                      inputVal: res.result.split(':')[2]
                    });
                }
            },
            fail: (res) => {
                console.log(res);
            }
        });
    },
    selectProblemAction: function (event) {
        var that = this;
        that.setData({
            selectId: event.currentTarget.id,
            selectAll: false
        });
    },
    chooseImage: function () {
        var that = this;
        wx.chooseImage({
            count: 4 - that.data.files.length,
            success: function (res) {
                var tempFilePaths = res.tempFilePaths, _files = that.data.files;

                for (var i = 0; i < tempFilePaths.length; i++) {
                    console.log(tempFilePaths[i]);
                    wx.uploadFile({
                        url: getApp().globalData.apiPath + 'api/fs/upload', //仅为示例，非真实的接口地址
                        filePath: tempFilePaths[i],
                        name: 'file',
                        header: {
                            Authorization: 'Bearer ' + wx.getStorageSync('access_token')
                        },
                        formData: {
                            'user': 'test',
                            'fileType': 'IMAGE'
                        },
                        success: function (res) {
                            var data = JSON.parse(res.data);
                            if (data.success) {

                                _files.push({
                                    url: data.item.url
                                });
                                that.setData({
                                    files: _files
                                });
                            } else {
                                wx.hideToast();
                                wx.showModal({
                                    title: '提示信息',
                                    showCancel: false,
                                    content: data.error_description
                                });
                            }
                        },
                        complete: function (res) {
                            console.log(res);

                        }
                    });
                }
            }
        })
    },
    inputValue: function (event) {
        var that = this;
        var textData = this.data.form.text, codeData = this.data.inputVal;

        if (event.currentTarget.id == "text") {
            textData = event.detail.value;
        } else {
            codeData = event.detail.value;
        }
        this.setData({
            form: {
                text: textData
            },
            inputVal: codeData
        });

        if (textData.length > 0) {
            if (that.data.typeId < 2) {
                if (codeData.length > 0) {
                    that.setData({
                        disabled: false
                    });
                } else {
                    that.setData({
                        disabled: true
                    });
                }
            } else {
                this.setData({
                    disabled: false
                });
            }

        } else {
            this.setData({
                disabled: true
            });
        }
    },
    removeUpload: function (event) {
        var that = this;
        var _files = that.data.files;
        _files.splice(event.currentTarget.id.split("_")[1], 1);
        that.setData({
            files: _files
        });
    },
    feedbackAction: function () {
        var that = this, data = that.data;
        var getFileUrl = function (index) {
            var url = "";
            if (that.data.files[index]) url = that.data.files[index].url;
            return url;
        }
        userApi.feedbackUsingPOST({
            vo: {
                feedDesc: data.form.text,
                imgUrl1: getFileUrl(0),
                imgUrl2: getFileUrl(1),
                imgUrl3: getFileUrl(2),
                imgUrl4: getFileUrl(3),
                machineCode: this.data.inputVal,
                orderCode: data.tripId,
                typeId: data.selectId
            }
        }, function (res) {
            app.handleApiFail(res, function () {
                wx.showModal({
                    title: '提示信息',
                    showCancel: false,
                    content: '感谢反馈，我们会尽快处理！',
                    success: function (res) {
                        wx.navigateBack();
                    }
                });
            });
        });
    },
    feedbackMoreAction: function () {
        var that = this;
        wx.navigateTo({
            url: '/pages/feedbackMore/feedbackMore?type=' + that.data.typeId + "&sid=" + that.data.selectId
        });
    }
});

