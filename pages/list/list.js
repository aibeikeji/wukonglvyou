// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      bangList:[
        {"top":"1", "name": "高力", "praiseNum": 100, "time": "2:50:35", "allRanking": "5"},
        { "top": "2", "name": "mandy", "praiseNum": 50, "time": "2:55:35", "allRanking": "8"},
        { "top": "3", "name": "刘朋朋", "praiseNum": 32, "time": "3:00:35", "allRanking": "15"},
        { "top": "4", "name": "张华强", "time": "3:05:35", "praiseNum": 16, "allRanking": "19"},
        { "top": "5", "name": "胡红金", "time": "3:08:35", "praiseNum": 15, "allRanking": "23"},
        { "top": "6","name": "张荣华", "time": "3:11:35", "praiseNum": 9, "allRanking": "25"},
        { "top": "7", "name": "张尽", "time": "3:13:35", "praiseNum": 17, "allRanking": "28"},
        { "top": "8", "name": "小曼", "time": "3:16:35", "praiseNum": 5, "allRanking": "35"},
        { "top": "9", "name": "红姐", "time": "3:19:35", "praiseNum": 0, "allRanking": "41"},
        { "top": "10", "name": "邱邱", "time": "3:22:23", "praiseNum": 2, "allRanking": "45"},
        { "top": "11", "name": "刘鹏", "time": "3:28:35", "praiseNum": 8, "allRanking": "55"},
        { "top": "12", "name": "余琪", "time": "3:30:35", "praiseNum": 3, "allRanking": "71"},
        { "top": "13", "name": "张航宇", "time": "3:35:35", "praiseNum": 6, "allRanking": "78"},
        { "top": "14", "name": "郑瑶", "time": "3:40:35", "praiseNum": 7, "allRanking": "83"},
        { "top": "15", "name": "肖波", "time": "3:48:35", "praiseNum": 9, "allRanking": "88"},
        { "top": "16", "name": "天天", "time": "3:51:35", "praiseNum": 0, "allRanking": "96"},
        { "top": "17","name": "黄工", "time": "3:53:35", "praiseNum": 0, "allRanking": "103"},
        { "top": "18", "name": "张明", "time": "3:55:35", "praiseNum": 0, "allRanking": "120"},
        { "top": "19", "name": "李旭", "time": "4:05:35", "praiseNum": 0, "allRanking": "135"},
        { "top": "20", "name": "黄鑫", "time": "4:15:35", "praiseNum": 0, "allRanking": "155"}
      ],
    img: ["unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike", "unlike"],
    arrs: []
  },


  /**
   * 生命周期函数--监听页面加载
   */
  giveDetail:function(e){
    //此处获取排名信息
    var top = e.currentTarget.dataset.top;
    var praisenum = e.currentTarget.dataset.praisenum;
    wx.navigateTo({
      url: '/pages/listdetails/listdetails?top=' + top + '&praisenum=' + praisenum+'',
    })
  },
  change:function(e){
    var a = 'img[' + e.currentTarget.dataset.index + ']'
   
    if (this.data.img[e.currentTarget.dataset.index] == 'unlike'){
      var b = 'bangList[' + e.currentTarget.dataset.index + ']'
      this.data.bangList[e.currentTarget.dataset.index].praiseNum = this.data.bangList[e.currentTarget.dataset.index].praiseNum + 1;
      var c = this.data.bangList[e.currentTarget.dataset.index];
      console.log(c);
      this.setData({
        [b]: c
      })
    }
    else{
      var b = 'bangList[' + e.currentTarget.dataset.index + ']'
      this.data.bangList[e.currentTarget.dataset.index].praiseNum = this.data.bangList[e.currentTarget.dataset.index].praiseNum - 1;
      var dd = this.data.bangList[e.currentTarget.dataset.index].praiseNum;
      var c = this.data.bangList[e.currentTarget.dataset.index];
      console.log(c);
      this.setData({
        [b]: c
      })
    }
    
    if (this.data.img[e.currentTarget.dataset.index]=='unlike'){
      this.setData({
          [a]:'like'
      })
      
    }else{
      this.setData({
        [a]: 'unlike'
      })
    }
  },
  onLoad: function (options) {
    console.log(options)
    var that = this;
    wx.getUserInfo({
      success:function(res){
        that.setData({
          arrs: JSON.parse(res.rawData)
        })
      },fail:function(e){
        console.log(e)
      }
    }) 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})