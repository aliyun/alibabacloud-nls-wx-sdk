// pages/st/st.js

const app = getApp()

const getToken = require("../../utils/token").getToken
const SpeechTranscription = require("../../utils/st")
const sleep = require("../../utils/util").sleep

Page({

    /**
     * 页面的初始数据
     */
    data: {
        stStart : false,
        stResult : "未开始识别"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        wx.getRecorderManager().onFrameRecorded((res)=>{
            if (res.isLastFrame) {
                console.log("record done")
            }
            if (this.data.st && this.data.stStart) {
                console.log("send " + res.frameBuffer.byteLength)
                this.data.st.sendAudio(res.frameBuffer)
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
        let st = new SpeechTranscription({
            url : app.globalData.URL,
            appkey: app.globalData.APPKEY,
            token: this.data.token
        })

        st.on("started", (msg)=> {
            console.log("Client recv started")
            this.setData({
                stResult : msg
            })
        })

        st.on("changed", (msg)=>{
            console.log("Client recv changed:", msg)
            this.setData({
                stResult : msg
            })
        })
      
        st.on("completed", (msg)=>{
            console.log("Client recv completed:", msg)
            this.setData({
                stResult : msg
            })
        })

        st.on("begin", (msg)=>{
            console.log("Client recv sentenceBegin:", msg)
            this.setData({
                stResult : msg
            })
          })
      
          st.on("end", (msg)=>{
            console.log("Client recv sentenceEnd:", msg)
            this.setData({
                stResult : msg
            })
          })
    
        st.on("closed", () => {
            console.log("Client recv closed")
        })
    
        st.on("failed", (msg)=>{
            console.log("Client recv failed:", msg)
            this.setData({
                stResult : msg
            })
        })

        this.data.st = st
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
        console.log("st onUnload")
        this.data.stStart = false
        wx.getRecorderManager().stop()
        if (this.data.st) {
            this.data.st.shutdown()
        } else {
            console.log("st is null")
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
    onStStart: async function() {
        if (!this.data.st) {
            console.log("st is null")
            return
        }

        if (this.data.stStart) {
            console.log("st is started!")
            return
        }
        let st = this.data.st
        try {
            await st.start(st.defaultStartParams())
            this.data.stStart = true
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

    onStStop: async function() {
        wx.getRecorderManager().stop()
        await sleep(500)
        if (this.data.stStart && this.data.st) {
            try {
                console.log("prepare close st")
                await this.data.st.close()
                this.data.stStart = false
            } catch(e) {
                console.log("close st failed:" + e)
            }
        }
    }
})