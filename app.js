// app.js
App({
  onLaunch() {
    wx.getSystemInfo({
      success : (res) => {
        console.log(res.SDKVersion)
      }
    })
    wx.setEnableDebug({
      enableDebug: true
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    URL: "wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1"
  }
})
