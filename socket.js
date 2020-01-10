class socket {
  /* websocket实例 */
  ws = null

  /*'$'为私有属性，外部不可调用 */

  /* 状态 */
  //连接状态
  $alive = false
  //把类的参数传入这里，方便调用
  $params = null

  /* 计时器 */
  //重连计时器
  $reconnect_timer = null
  //心跳计时器
  $heart_timer = null
  // 信息onmessage缓存方法
  $message_func = null

  /* 参数 */
  //心跳时间 50秒一次
  heartBeat = 50000
  //心跳信息：默认为‘hello’随便改，看后台
  heartMsg = "hello"
  //是否自动重连
  reconnect = true
  //重连间隔时间
  reconnectTime = 5000
  //重连次数
  reconnectTimes = 10

  constructor(params) {
    this.$params = params
    this.init()
  }

  /* 初始化 */
  init() {
    //重中之重，不然重连的时候会越来越快
    clearInterval(this.$reconnect_timer)
    clearInterval(this.$heart_timer)

    //取出所有参数
    let params = this.$params
    //设置连接路径
    let { url, port } = params
    let global_params = [
      "heartBeat",
      "heartMsg",
      "reconnect",
      "reconnectTime",
      "reconnectTimes"
    ]

    //定义全局变量
    Object.keys(params).forEach(key => {
      if (global_params.indexOf(key) !== -1) {
        this[key] = params[key]
      }
    })

    let ws_url = port ? url + ":" + port : url

    // this.ws = null
    delete this.ws
    this.ws = new WebSocket(ws_url)

    // window.console.log(this.$message_func)
    if (this.$message_func) {
      this.onmessage(this.$message_func)
    }

    //默认绑定事件
    this.ws.onopen = () => {
      //设置状态为开启
      this.$alive = true
      clearInterval(this.$reconnect_timer)
      //连接后进入心跳状态
      this.onheartbeat()
    }
    this.ws.onclose = () => {
      //设置状态为断开
      this.$alive = false

      clearInterval(this.$heart_timer)

      //自动重连开启  +  不在重连状态下
      if (true == this.reconnect) {
        /* 断开后立刻重连 */
        this.onreconnect()
      }
    }
  }

  /*
   *
   * 新增‘心跳事件’和‘重连事件’
   *
   */

  /* 心跳事件 */
  onheartbeat(func) {
    //在连接状态下
    if (true == this.$alive) {
      /* 心跳计时器 */
      this.$heart_timer = setInterval(() => {
        //发送心跳信息
        this.send(this.heartMsg)
        func ? func(this) : false
      }, this.heartBeat)
    }
  }

  /* 重连事件 */
  onreconnect(func) {
    /* 重连间隔计时器 */
    this.$reconnect_timer = setInterval(() => {
      //限制重连次数
      if (this.reconnectTimes <= 0) {
        //关闭定时器
        // this.$isReconnect = false
        clearInterval(this.$reconnect_timer)
        //跳出函数之间的循环
        return
      } else {
        //重连一次-1
        this.reconnectTimes--
      }
      //进入初始状态
      this.init()
      func ? func(this) : false
    }, this.reconnectTime)
  }

  /*
   *
   * 对原生方法和事件进行封装
   *
   */

  // 发送消息
  send(text) {
    if (true == this.$alive) {
      text = typeof text == "string" ? text : JSON.stringify(text)
      this.ws.send(text)
    }
  }

  // 断开连接
  close() {
    if (true == this.$alive) {
      this.ws.close()
    }
  }

  //接受消息
  onmessage(func, all = false) {
    this.ws.onmessage = data => {
      this.$message_func = func
      func(!all ? data.data : data)
    }
  }

  //websocket连接成功事件
  onopen(func) {
    this.ws.onopen = event => {
      this.$alive = true
      func ? func(event) : false
    }
  }
  //websocket关闭事件
  onclose(func) {
    this.ws.onclose = event => {
      //设置状态为断开
      this.$alive = false

      clearInterval(this.$heart_timer)

      //自动重连开启  +  不在重连状态下
      if (true == this.reconnect) {
        /* 断开后立刻重连 */
        this.onreconnect()
      }
      func ? func(event) : false
    }
  }
  //websocket错误事件
  onerror(func) {
    this.ws.onerror = event => {
      func ? func(event) : false
    }
  }
}

export default socket

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
使用
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
