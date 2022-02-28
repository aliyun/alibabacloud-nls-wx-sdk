// index.js
// 获取应用实例
const app = getApp()
Page({
  onLoad: function() {

  },
  onShow : function() {
    let user = "未登录，请使用阿里云账号登录"
    if (app.globalData.AKID) {
      user = app.globalData.AKID
    } else {
      console.log("akid invalid")
    }
    this.setData({
      user : user
    })
  },
  OnLoginClick: function() {
    console.log("navigate to login page")
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  OnRecordTestClick : function() {
    if (!app.globalData.AKID || !app.globalData.AKKEY || !app.globalData.APPKEY) {
      wx.showToast({
        title: "未登录",
        icon: "error",
        duration: 1000,
        mask: true
      })
      return
    }
    console.log("navigate to record page")
    wx.navigateTo({
      url: '/pages/record/record',
    })
  },
  OnWSTestClick : function() {
    if (!app.globalData.AKID || !app.globalData.AKKEY || !app.globalData.APPKEY) {
      wx.showToast({
        title: "未登录",
        icon: "error",
        duration: 1000,
        mask: true
      })
      return
    }
    console.log("navigate to ws page")
    wx.navigateTo({
      url: '/pages/ws/ws',
    })
  },
  OnSRTestClick : function() {
    if (!app.globalData.AKID || !app.globalData.AKKEY || !app.globalData.APPKEY) {
      wx.showToast({
        title: "未登录",
        icon: "error",
        duration: 1000,
        mask: true
      })
      return
    }
    console.log("navigate to sr page")
    wx.navigateTo({
      url: '/pages/sr/sr',
    })
  },
  OnSTTestClick : function() {
    if (!app.globalData.AKID || !app.globalData.AKKEY || !app.globalData.APPKEY) {
      wx.showToast({
        title: "未登录",
        icon: "error",
        duration: 1000,
        mask: true
      })
      return
    }
    console.log("navigate to st page")
    wx.navigateTo({
      url: '/pages/st/st',
    })
  },
  OnTTSTestClick : function() {
    if (!app.globalData.AKID || !app.globalData.AKKEY || !app.globalData.APPKEY) {
      wx.showToast({
        title: "未登录",
        icon: "error",
        duration: 1000,
        mask: true
      })
      return
    }
    console.log("navigate to tts page")
    wx.navigateTo({
      url: '/pages/tts/tts',
    })
  },
  OnTokenTestClick : function() {
    if (!app.globalData.AKID || !app.globalData.AKKEY || !app.globalData.APPKEY) {
      wx.showToast({
        title: "未登录",
        icon: "error",
        duration: 1000,
        mask: true
      })
      return
    }
    console.log("token test")
    wx.navigateTo({
      url: '/pages/aliyuntoken/aliyuntoken',
    })
  },
  OnCleanCacheClick: function() {
    if (!app.globalData.AKID || !app.globalData.AKKEY || !app.globalData.APPKEY) {
      wx.showToast({
        title: "未登录",
        icon: "error",
        duration: 1000,
        mask: true
      })
      return
    }
    console.log("clean cache")
    wx.getSavedFileList({
      success : (res) => {
        if (res.fileList.length > 0) {
          for (let l of res.fileList) {
            console.log("remove " + l.filePath)
            wx.removeSavedFile({
              filePath: l.filePath,
              complete: (res) => {
                console.log("remove " + l.filePath + " done")
              }
            })
          }
        }
      } 
    })
  }
})
