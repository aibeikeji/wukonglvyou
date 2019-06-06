//userInfo.js
//获取应用实例
var app = getApp();


Page({
  data: {
    height: 0,
    markers: [{
      iconPath: "/map/needle.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 30,
      height: 50
    }],
    polyline: [{
      points: [{
        longitude: 113.3245211,
        latitude: 23.10229
      }, {
        longitude: 113.324520,
        latitude: 23.21229
      }],
      color:"#FF000033",
      width: 2,
      dottedLine: true
    }],
    controls: [{
      id: 1,
      iconPath: '/map/map_my_n.png',
      position: {
        left: "100%",
        top: 100,
        width: 60,
        height: 60
      },
      clickable: true
    }]
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
    this.setData({height: 200})
  }
})