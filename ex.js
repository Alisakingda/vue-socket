let ws = new socket({
  //网址（端口是我下面的服务器的端口）
  url: "ws://127.0.0.1:8001"
  //心跳时间（单位:ms）
  //'heartBeat':5000,
  //发送心跳信息（支持json传入）(这个一般内容不重要，除非后端变态)
  //'heartMsg':'hello',
  //开起重连
  //'reconnect':true,
  //重连间隔时间（单位:ms）
  //'reconnectTime':5000,
  //重连次数
  //'reconnectTimes':10
})

//发送信息
ws.send({ msg: "你好" })

//关闭连接
ws.close()

//心跳事件
ws.onheartbeat(() => {
  console.log("heartbeat")
})

//心跳事件
ws.onreconnect(() => {
  console.log("reconnect")
})

//接收信息
ws.onmessage(data => {
  console.log(data)
})

//关闭事件
ws.onclose(event => {
  console.log(event)
})

//开启事件
ws.onopen(event => {
  console.log(event)
})

//异常事件
ws.onopen(event => {
  console.log(event)
})

//更甚至可以直接拿出websocket来用（不推荐）
ws.ws.send("你好")
