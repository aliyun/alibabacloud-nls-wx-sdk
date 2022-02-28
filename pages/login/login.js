// pages/login/login.js
const app = getApp()
const getToken = require("../../utils/token").getToken
const sleep = require("../../utils/util").sleep
Page({

    /**
     * 页面的初始数据
     */
    data: {

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

    textAKID: function(e) {
        this.setData({
            akid:e.detail.value
        })
    },

    textAKKEY: function(e) {
        this.setData({
            akkey:e.detail.value
        })
    },

    textAPPKEY: function(e) {
        this.setData({
            appkey:e.detail.value
        })
    },

    onSave: async function() {
        if (!this.data.akid || !this.data.akkey || !this.data.appkey) {
            console.log("info invalid")
            wx.showToast({
                title: "信息为空",
                icon: "error",
                duration: 1000,
                mask: true
              })
            return
        }

        try {
            this.data.token = await getToken(this.data.akid,
                 this.data.akkey)
        } catch (e) {
            wx.showToast({
                title: "AKID或者AKKEY不正确",
                icon: "error",
                duration: 1000,
                mask: true
              })
            return
        }

        app.globalData.AKID = this.data.akid
        app.globalData.AKKEY = this.data.akkey
        app.globalData.APPKEY = this.data.appkey
        wx.showToast({
            title: "保存成功",
            icon: "success",
            duration: 2000,
            mask: true
        })
    
        await sleep(2000)
        wx.navigateBack({
          delta: 0,
        })
    }
})