/*
nls.js

Copyright 1999-present Alibaba Group Holding Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
"use strict"

const uuid = require("./uuid").uuid

class NlsClient {
  constructor(config) {
    if (!config || !config.url || !config.appkey || !config.token) {
      throw new Error("invalid config!")
    }
    this._config = config
  }

  start(onmessage, onclose) {
    if (typeof onmessage !== 'function') {
      throw new Error("expect function onmessage")
    }
    if (typeof onclose != 'function') {
      throw new Error("expect function onclose")
    }
    this._ws = wx.connectSocket({
      url: this._config.url,
      tcpNoDelay: true,
      header: {
        "X-NLS-Token" : this._config.token
      }
    })
    this._ws.onMessage((res) => {
      if (typeof res.data === "string") {
        onmessage(res.data, false)
      } else {
        onmessage(res.data, true)
      }
    })
    this._ws.onClose((code, reason)=>{
      onclose(code, reason)
    })

    return new Promise((resolve, reject) => {
      this._ws.onOpen((res)=>{
        resolve(res)
      })
      this._ws.onError((errMsg)=>{
        reject(errMsg)
      })
    })
  }

  send(data, isBinary) {
    if (this._ws == null) {
      return
    }
    this._ws.send({
      data: data
    })
  }

  uuid() {
    return uuid(true)
  }

  shutdown() {
    if (this._ws == null) {
      return
    }
    this._ws.close()
  }

  defaultContext() {
    return {
      sdk:{
        name: "nls-wx-sdk",
        version: "0.0.1",
        language: "wxjs"
      }
    }
  }
}

module.exports = NlsClient
