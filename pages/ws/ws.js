// pages/ws.js

const app = getApp()
const getToken = require("../../utils/token").getToken
Page({

    /**
     * 页面的初始数据
     */
    data: {
        data:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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

    },

    onWsTest: async function() {
        console.log("test ws")
        try {
            let token = await getToken(app.globalData.AKID,
                 app.globalData.AKKEY)
            console.log("using token:" + token)
            let ws = wx.connectSocket({
              url: app.globalData.URL,
              tcpnodelay: true,
              header: {
                  "X-NLS-Token" : token
              },
              success: (res)=>{
                console.log("connect done")
              },
              fail: (res)=> {
                console.log("connect failed: " + res.errMsg)
              }
            })

            ws.onOpen((res)=>{
                console.log("ws onOpen")
            })

            ws.onError((errMsg)=>{
                console.log("ws onError: " + errMsg)
            })

            ws.onMessage((res)=>{
                if (typeof res.data === "string") {
                    console.log("recv:" + res.data)
                    let data = this.data.data
                    data.push(res.data)
                    this.setData({
                        data:data
                    })
                } else {
                    console.log("recv binary data:" + res.data.length)
                }
            })

            ws.onClose((code, reason)=> {
                console.log(`ws onClose ${code}:${reason}`)
            })
        } catch (e) {
            console.log("error on get token:", JSON.stringify(e))
            return
        }
    }
})