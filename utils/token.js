/*
token.js

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

const URL = "https://nls-meta.cn-shanghai.aliyuncs.com"
const b64_hmac_sha1 = require("./hmacsha1").b64_hmac_sha1
const uuid = require("./uuid").uuid
const utctimestamp = require("./util").utctimestamp

function normalizeParam(param) {
    let result = ""
    for (let k in param) {
        result += `${encodeURIComponent(k)}=${encodeURIComponent(param[k])}&`
    }
    return result.substring(0, result.length - 1)
}
async function getTokenInner(akid, akkey, url) {
    if (!url) {
        url = URL
    }
    let param = {
        AccessKeyId: akid,
        Action: "CreateToken",
        Format: "JSON",
        RegionId: "cn-shanghai",
        SignatureMethod: "HMAC-SHA1",
        SignatureNonce: uuid(),
        SignatureVersion: "1.0",
        Timestamp: utctimestamp(),
        Version: "2019-02-28"
    }
    let norm = normalizeParam(param)
    let encodedNorm = "GET&" + encodeURIComponent("/") + "&" + encodeURIComponent(norm)
    let sig = b64_hmac_sha1(`${akkey}&`, encodedNorm)
    let finalParam = "Signature=" + encodeURIComponent(sig) + "&" + norm
    return new Promise((reslove, reject)=> {
        wx.request({
            url: url + "/?" + finalParam,
            success: (res)=> {
              reslove(res)
            },
            fail : (res)=> {
              reject(res)
            }
          })
    })
}

async function getToken(akid, akkey) {
    let cacheKey = akid+"&"+akkey
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key : cacheKey,
            encrypt: true,
            success : async (res) => {
                try {
                    let obj = JSON.parse(res.data)
                    if (obj.Id && obj.ExpireTime) {
                        let now = Date.now()
                        console.log(`now is ${now} expire time ${obj.ExpireTime * 1000}`)
                        if (now > obj.ExpireTime * 1000) {
                            console.log("expired....")
                            throw new Error()
                        }
                        resolve(obj.Id)
                    } else {
                        console.log("get data failed: " + res.data)
                        throw new Error()
                    }
                } catch(e) {
                    console.log("refresh token...")
                    try {
                        let tokenObj = await getTokenInner(akid, akkey)
                        if (tokenObj.data 
                            && tokenObj.data.Token
                            && tokenObj.data.Token.Id
                            && tokenObj.data.Token.ExpireTime) {
                            wx.setStorage({
                                key : cacheKey,
                                data : JSON.stringify(tokenObj.data.Token),
                                encrypt: true, 
                                success: (res) => {
                                    console.log("cache token done")
                                },
                                fail : (res) => {
                                    console.log("set storage failed")
                                },
                                complete : () => {
                                    resolve(tokenObj.data.Token.Id)
                                }
                            })
                        } else {
                            console.log("token invalid:" + JSON.stringify(tokenObj))
                            throw new Error("response result invalid:" + JSON.stringify(tokenObj))
                        }
                    } catch (e) {
                        reject(e)
                    }
                }
            },
            fail : async (res) => {
                try {
                    let tokenObj = await getTokenInner(akid, akkey)
                    if (tokenObj.data 
                        && tokenObj.data.Token
                        && tokenObj.data.Token.Id
                        && tokenObj.data.Token.ExpireTime) {
                        wx.setStorage({
                            key : cacheKey,
                            data : JSON.stringify(tokenObj.data.Token),
                            encrypt: true, 
                            fail : (res) => {
                                console.log("set storage failed")
                            },
                            complete : () => {
                                resolve(tokenObj.data.Token.Id)
                            }
                        })
                    } else {
                        console.log("token invalid:" + JSON.stringify(tokenObj))
                        throw new Error("response result invalid:" + JSON.stringify(tokenObj))
                    }
                } catch (e) {
                    reject(e)
                }
            }
        })
    })
}

module.exports = {
    getToken,
    getTokenInner
}
