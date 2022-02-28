/*
util.js

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

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('_')}_${[hour, minute, second].map(formatNumber).join('_')}`
}

function padding2(t) {
  if (t < 10) {
    return "0" + t
  } 
  return "" + t
}

function utctimestamp() {
  let date = new Date()
  let YYYY = date.getUTCFullYear()
  let MM = padding2(date.getUTCMonth() + 1)
  let DD = padding2(date.getUTCDate())
  let HH = padding2(date.getUTCHours())
  let mm = padding2(date.getUTCMinutes())
  let ss = padding2(date.getUTCSeconds())
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}Z`
}

function uploadToSaver(f) {
  wx.uploadFile({
    url: "http://30.224.161.18:9110/res/upload",
    filePath: f,
    name : "file",
    success(res) {
      wx.removeSavedFile({
        filePath: f,
        success: ()=> {
          console.log(`remove ${f} done`)
        },
        fail: ()=>{
          console.log(`remove ${f} failed`)
        }
      })
    }
  })
} 

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

function sleep(milSec) {
  return new Promise(resolve => {
    setTimeout(resolve, milSec)
  }) 
}

module.exports = {
  formatTime,
  uploadToSaver,
  utctimestamp,
  sleep
}
