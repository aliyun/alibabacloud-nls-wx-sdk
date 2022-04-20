// pages/tts/tts.js
const app = getApp()
const SpeechSynthesizer = require("../../utils/tts")
const formatTime = require("../../utils/util").formatTime
const sleep = require("../../utils/util").sleep
const getToken = require("../../utils/token").getToken
const fs = wx.getFileSystemManager()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ttsStart: false, 
        ttsText: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        try {
            this.data.token = await getToken(app.globalData.AKID,
                 app.globalData.AKKEY)
        } catch (e) {
            console.log("error on get token:", JSON.stringify(e))
            return
        }

        let tts = new SpeechSynthesizer({
            url: app.globalData.URL,
            appkey:app.globalData.APPKEY,
            token:this.data.token
        })
        
        tts.on("meta", (msg)=>{
            console.log("Client recv metainfo:", msg)
        })
    
        tts.on("data", (msg)=>{
            console.log(`recv size: ${msg.byteLength}`)
            //console.log(dumpFile.write(msg, "binary"))
            if (this.data.saveFile) {
                try {
                  fs.appendFileSync(
                      this.data.saveFile,
                      msg,
                      "binary"
                  )
                  console.log(`append ${msg.byteLength}`)
                } catch (e) {
                  console.error(e)
                }
            } else {
                console.log("save file empty")
            }
        })
    
        tts.on("completed", async (msg)=>{
            console.log("Client recv completed:", msg)
            await sleep(500)
            fs.close({
                fd : this.data.saveFd,
                success: (res)=> {
                    let ctx = wx.createInnerAudioContext()
                    ctx.autoplay = true
                    ctx.src = this.data.saveFile
                    ctx.onPlay(() => {
                        console.log('start playing..')
                    })
                    ctx.onError((res) => {
                        console.log(res.errMsg)
                        console.log(res.errCode)
                        fs.unlink({
                            filePath: this.data.saveFile,
                            success: (res)=>{
                                console.log(`remove ${this.data.saveFile} done`)
                                this.data.saveFile = null
                                this.data.saveFd = null
                            },
                            failed: (res)=>{
                                console.log("remove failed:" + res.errMsg)
                            }
                        })
                    })
                    ctx.onEnded((res)=>{
                        console.log("play done...")
                        fs.unlink({
                            filePath: this.data.saveFile,
                            success: (res)=>{
                                console.log(`remove ${this.data.saveFile} done`)
                                this.data.saveFile = null
                                this.data.saveFd = null
                            },
                            failed: (res)=>{
                                console.log("remove failed:" + res.errMsg)
                            }
                        })
                    })
                },
                fail : (res)=>{
                    console.log("saved file error:" + res.errMsg)
                }
            })
        })
    
        tts.on("closed", () => {
            console.log("Client recv closed")
        })
    
        tts.on("failed", (msg)=>{
            console.log("Client recv failed:", msg)
        })

        this.data.tts = tts
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
    textInput: function(e) {
        this.setData({
            ttsText:e.detail.value
        })
    },
    onTtsStart: function() {
        if (!this.data.ttsText || !this.data.tts) {
            console.log("text empty")
            wx.showToast({
                title: "文本为空",
                icon: "error",
                duration: 1000,
                mask: true
              })
            return
        }
        if (this.data.ttsStart) {
            wx.showToast({
                title: "正在合成请稍候",
                icon: "error",
                duration: 1000,
                mask: true
              })
            return
        } else {
            this.data.ttsStart = true
        }
        console.log("try to synthesis:" + this.data.ttsText)
        let save = formatTime(new Date()) + ".wav"
        let savePath = wx.env.USER_DATA_PATH + "/" + save
        console.log(`save to ${savePath}`)
        fs.open({
            filePath:savePath,
            flag : "a+",
            success: async (res)=> {
                console.log(`open ${savePath} done`)
                this.data.saveFd = res.fd
                this.data.saveFile = savePath
                let param = this.data.tts.defaultStartParams()
                param.text = this.data.ttsText
                param.voice = "aixia"
                try {
                    await this.data.tts.start(param)
                    console.log("tts done")
                    this.data.ttsStart = false
                } catch(e) {
                    console.log("tts start error:" + e)
                }
            },
            fail: (res)=> {
                console.log(`open ${savePath} failed: ${res.errMsg}`)
            }
        })
    }
})
