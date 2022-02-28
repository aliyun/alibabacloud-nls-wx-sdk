// pages/record/record.js
const uploadToSaver = require("../../utils/util").uploadToSaver

Page({

    /**
     * 页面的初始数据
     */
    data: {
        recordStatus : 0,
        status: "未开始录音"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: '录音测试'
        })
        wx.getRecorderManager().onFrameRecorded((res)=>{
            console.log("record " + res.frameBuffer.byteLength)
            if (res.isLastFrame) {
                console.log("record done")
            }
        })
        wx.getRecorderManager().onStart(()=>{
            this.setData({
                recordStatus:1,
                status: "录音中"
            })
            console.log("start recording...")
        })
        wx.getRecorderManager().onStop((res) => {
            this.setData({
                tempFilePath: res.tempFilePath,
                recordStatus:0,
                status: "未开始录音"
            })
            console.log("save to " + this.data.tempFilePath)
            console.log("try upload to http://30.224.161.18:9110/res/upload")
            uploadToSaver(res.tempFilePath)
        })
        wx.getRecorderManager().onError((res) => {
            console.log("recording failed:" + res)
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
        if (this.data.recordStatus) {
            console.log("stop recording since hide")
            wx.getRecorderManager().stop()
        }
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

    onStartRecord: function() {
        if (this.data.recordStatus) {
            wx.showToast({
                title: "已经开始录音",
                icon: "loading",
                duration: 2000,
                mask: true
            })
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

    onStopRecord: function() {
        if (this.data.recordStatus == 0) {
            wx.showToast({
                title: "未开始录音",
                icon: "loading",
                duration: 2000,
                mask: true
            })
            return
        }
        console.log("stop recording...")
        wx.getRecorderManager().stop()
    }
})