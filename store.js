//store.js
import Vue from "vue"
import Vuex from "vuex"
//加载文件
import ws from "@/requests/websocket.js"
const socket = new ws({
  url: "ws://127.0.0.1:8001",
  reconnectTimes: 0
})
export default new Vuex.Store({
  state: {
    WS: socket
  },
  mutations: {},
  actions: {}
})
