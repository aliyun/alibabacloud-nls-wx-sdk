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

## 实时语音识别

### Class: SpeechTranscription

> SpeechTranscription类用于进行实时语音识别

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


### defaultStartParams()

> 返回一个默认的推荐参数，其中format为pcm，采样率为16000，中间结果，标点预测和ITN全开，客户在拿到默认对象后可以根据自己需求，结合**接口说明**中的参数列表来添加和修改参数

参数说明：

无

返回值：

object类型对象，字段如下：
```json
{
    "format": "pcm",
    "sample_rate": 16000,
    "enable_intermediate_result": true,
    "enable_punctuation_prediction": true,
    "enable_inverse_text_normalization": true
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
| started   | 实时识别开始     | 1                | sting类型，开始信息      |
| changed   | 实时识别中间结果 | 1                | string类型，中间结果信息 |
| completed | 实时识别完成     | 1                | string类型，完成信息     |
| closed    | 连接关闭          | 0                | 无                      |
| failed    | 错误              | 1                | string类型，错误信息 |
 | begin | 提示句子开始 | 1 | string类型，相关信息| 
 | end | 提示句子结束|1|string类型，相关信息|
 


返回值：
无


### async start(param)

> 根据param发起一次实时识别，param可以参考defaultStartParams方法的返回，具体参数见**接口说明**

参数说明：

| 参数  | 类型                        | 参数说明          |
| ----- | --------------------------- | ----------------- |
| param | object | 实时识别参数    |


返回值：
Promise对象，当started事件发生后触发resolve，并携带started信息；当任何错误发生后触发reject，并携带异常信息


### async close(param)

> 停止实时识别

参数说明：
| 参数  | 类型                        | 参数说明          |
| ----- | --------------------------- | ----------------- |
| param | object | 实时识别结束参数    |


返回值：

Promise对象，当completed事件发生后触发resolve，并携带completed信息；当任何错误发生后触发reject，并携带异常信息



### shutdown()

> 强制断开连接

参数说明：

无

返回值：

无



### sendAudio(data)

> 发送音频，音频格式必须和参数中一致

参数说明

| 参数 | 类型   | 参数说明 |
| ---- | ------ | -------- |
| data | ArrayBuffer | 二进制音频数据 |

返回值：

无


### 实时识别代码示例：
下面代码片段仅供参考，代码中使用微信小程序自带录音功能，实际使用需要考虑微信小程序的限制以及前端页面设计和具体业务功能

```js
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

```





