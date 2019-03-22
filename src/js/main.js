import icon from "./icon";
import Swiper from './swiper';
class Player {
  constructor(node) {
    this.root = typeof node === "string" ? document.querySelector(node) : node;
    this.$=selector=>this.root.querySelector(selector);
    this.songList = [];
    this.currentIndex = 0;
    this.audio = new Audio();
    this.start();
    this.bind();
  }
  start() {
    fetch(`https://charliesmith97.github.io/mock-data/resource/music-list.json`)
      .then(res=>{return res.json()}).then(data=>{this.songList=data;
      this.audio.src=this.songList[this.currentIndex].url})
  }
  bind() {
    let self = this;
    // 点击播放按钮
    this.$(".btn-play-pause").onclick = function() {     
     if(this.classList.contains('playing')){
        self.audio.pause();
        this.classList.remove('playing');
        this.classList.add('pause');
        this.querySelector('use').setAttribute('xlink:href','#icon-play');
     }else if(this.classList.contains('pause')){ 
        self.audio.play();
        this.classList.remove('pause');
        this.classList.add('playing');
        this.querySelector('use').setAttribute('xlink:href','#icon-pause');
    }
    };

    this.$('.btn-pre').onclick=()=>self.playPreSong();
    this.$('.btn-next').onclick=()=>self.playNextSong();
    
  }

  playSong() {
    this.audio.src = this.songList[this.currentIndex].url;
    this.audio.play();
  }

  playPreSong(){
    this.currentIndex=(this.songList.length+this.currentIndex-1)%this.songList.length
    this.audio.src=this.songList[this.currentIndex].url
    console.log(this.audio.src);
    this.audio.oncanplaythrough=()=>this.audio.play();
  }
  playNextSong(){
    this.currentIndex=(this.currentIndex+1)%this.songList.length
    this.audio.src=this.songList[this.currentIndex].url
    console.log(this.audio.src);
    this.audio.oncanplaythrough=()=>this.audio.play();
  }
  loadLyrics(){
    ftech(this.songList[this.currentIndex].lyric)
    .then(res=>res.json())
    .then(data=>{this.setLyrics(data.lrc.lyric)})
  }

  setLyrics(){

  }

  loadSong(){
    let songObj=this.songList[this.currentIndex];
    this.$('.header h1').innerText=songObj.title;
    this.$('.header p').innerText=songObj.author+'-'+songObj.album;
  }
}

window.p=new Player("#player");
