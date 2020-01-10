App.vue (这个随便你在哪里用反正已经开启的话，到哪里都行)
  mounted(){
    this.$store.state.WS.message(data=>{
      console.log(data)
    })
    //或者用mapState放在computed中，个人喜欢
  }
