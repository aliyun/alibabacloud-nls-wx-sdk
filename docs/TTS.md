# NLS 微信小程序SDK说明

> 本文介绍如何使用阿里云智能语音服务提供的微信小程序SDK，包括SDK的安装方法及SDK代码示例。



## 前提条件

使用SDK前，请先阅读接口说明，详细请参见**接口说明**。

### 下载安装

> 说明
>
> * 微信基础库2.4.4版本及以上
> * 请确认已经安装微信小程序开发环境，并完成基本配置
> * **需要提前将如下URL添加到微信小程序后台服务器域名中**
>  request合法域名：https://nls-meta.cn-shanghai.aliyuncs.com
>  socket合法域名：wss://nls-gateway.cn-shanghai.aliyuncs.com 

1. 下载SDK

通过github下载对应SDK代码

2. 导入SDK

将代码放入工程合适目录下，然后根据目录位置通过require进行导入

## Token获取
### getToken
> 获取token并以akid和akkey为key缓存对应token，如果缓存的token过期则自动刷新并获取。缓存机制参考微信小程序文档API的数据缓存部分

参数：

无

返回值：

string类型token

### getTokenInner
> 直接获取token，不带任何缓存机制，适用于客户自定义缓存方式，**注意频繁调用该接口会被服务端拒绝访问**

参数：

无

返回值：

string类型token


## 语音合成

### Class: SpeechSynthesizer

> SpeechSynthesizer类用于进行语音合成

构造函数参数说明:

| 参数                           | 类型   | 参数说明              |
| ------------------------------ | ------ | --------------------- |
| config                         | object | 连接配置对象|

config object说明：

| 参数                           | 类型   | 参数说明              |
| ------------------------------ | ------ | --------------------- |
| url                         | string | 服务URL| 
| appkey| string|Appkey| 
| token | string| token，见开发指南-获取Token部分，SDK需要客户自行获取或缓存token|


### defaultStartParams(voice)

> 返回一个默认的推荐参数，其中voice为用户提供，采样率为16000，格式为wav，音量50，语速语调皆为0，不开启字幕。客户在拿到默认对象后可以根据自己需求，结合**接口说明**中的参数列表来添加和修改参数

参数说明：

| 参数                           | 类型   | 参数说明              |
| ------------------------------ | ------ | --------------------- |
| voice                         | string | 发音人| 

返回值：

object类型对象，字段如下：
```json
{
    "voice": voice, 
    "format": "wav",
    "sample_rate": 16000,
    "volume": 50,
    "speech_rate": 0,
    "pitch_rate": 0,
    "enable_subtitle": false
}
```


### on(which, handler)

> 设置事件回调

参数说明：

| 参数          | 类型                      | 参数说明                                              |
| ------------- | ------------------------- | ----------------------------------------------------- |
| which        | string         | 事件名称                                |
| handler       | function                | 回调函数                                     |

支持的回调事件如下：
| 事件名称  | 事件说明          | 回调函数参数个数 | 回调函数参数说明        |
|-----------|-------------------|------------------|:------------------------|
| meta   | 字幕回调     | 1                | sting类型，字幕信息      |
| data   | 合成音频回调 | 1                | Arraybuffer类型，合成音频数据 |
| completed | 语音合成完成     | 1                | string类型，完成信息     |
| closed    | 连接关闭          | 0                | 无                      |
| failed    | 错误              | 1                | string类型，错误信息     |

返回值：
无


### async start(param)

> 根据param发起一次语音合成，param可以参考defaultStartParams方法的返回，待合成文本需要设置到param的text字段中，具体参数见**接口说明**

参数说明：

| 参数  | 类型                        | 参数说明          |
| ----- | --------------------------- | ----------------- |
| param | object | 语音合成参数    |

返回值：
Promise对象，当completed事件发生后触发resolve，并携带合成完毕的相关信息；当任何错误发生后触发reject，并携带异常信息



### 语音合成代码示例：
下面代码片段仅供参考，代码中使用微信小程序自带录音功能，实际使用需要考虑微信小程序的限制以及前端页面设计和具体业务功能

```js
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
```





