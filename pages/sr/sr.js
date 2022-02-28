// pages/sr/sr.js

const app = getApp()

const getToken = require("../../utils/token").getToken
const SpeechRecognition = require("../../utils/sr")
const sleep = require("../../utils/util").sleep

Page({
    /**
     * 页面的初始数据
     */
    data: {
        srStart : false,
        srResult : "未开始识别"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        wx.getRecorderManager().onFrameRecorded((res)=>{
            if (res.isLastFrame) {
                console.log("record done")
            }
            if (this.data.sr && this.data.srStart) {
                console.log("send " + res.frameBuffer.byteLength)
                this.data.sr.sendAudio(res.frameBuffer)
            }
        })
        wx.getRecorderManager().onStart(()=>{
            console.log("start recording...")
        })
        wx.getRecorderManager().onStop((res) => {
            console.log("stop recording...")
            if (res.tempFilePath) {
                wx.removeSavedFile({
                    filePath:res.tempFilePath
                })
            }
        })
        wx.getRecorderManager().onError((res) => {
            console.log("recording failed:" + res)
        })

        try {
            this.data.token = await getToken(app.globalData.AKID,
                 app.globalData.AKKEY)
        } catch (e) {
            console.log("error on get token:", JSON.stringify(e))
            return
        }
        let sr = new SpeechRecognition({
            url : app.globalData.URL,
            appkey: app.globalData.APPKEY,
            token: this.data.token
        })

        sr.on("started", (msg)=> {
            console.log("Client recv started")
            this.setData({
                srResult : msg
            })
        })

        sr.on("changed", (msg)=>{
            console.log("Client recv changed:", msg)
            this.setData({
                srResult : msg
            })
        })
      
        sr.on("completed", (msg)=>{
            console.log("Client recv completed:", msg)
            this.setData({
                srResult : msg
            })
        })
    
        sr.on("closed", () => {
            console.log("Client recv closed")
        })
    
        sr.on("failed", (msg)=>{
            console.log("Client recv failed:", msg)
            this.setData({
                srResult : msg
            })
        })

        this.data.sr = sr
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
        console.log("sr onUnload")
        this.data.srStart = false
        wx.getRecorderManager().stop()
        if (this.data.sr) {
            this.data.sr.shutdown()
        } else {
            console.log("sr is null")
        }
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

    onSrStart: async function() {
        if (!this.data.sr) {
            console.log("sr is null")
            return
        }

        if (this.data.srStart) {
            console.log("sr is started!")
            return
        }
        let sr = this.data.sr
        try {
            await sr.start(sr.defaultStartParams())
            this.data.srStart = true
        } catch (e) {
            console.log("start failed:" + e)
            return
        }

        wx.getRecorderManager().start({
            duration: 600000,
            numberOfChannels: 1,
            sampleRate : 16000,
            format: "PCM",
            frameSize: 4
        })
    },

    onSrStop: async function() {
        wx.getRecorderManager().stop()
        await sleep(500)
        if (this.data.srStart && this.data.sr) {
            try {
                console.log("prepare close sr")
                await this.data.sr.close()
                this.data.srStart = false
            } catch(e) {
                console.log("close sr failed:" + e)
            }
        }
    }
})