import icon from "./icon";
import Swiper from "./swiper";
class Player {
  constructor(node) {
    this.root = typeof node === "string" ? document.querySelector(node) : node;
    this.$ = selector => this.root.querySelector(selector);
    this.$$ = selector => this.root.querySelectorAll(selector);
    this.songList = [];
    this.currentIndex = 0;
    this.audio = new Audio();
    this.lyricArr = [];
    this.lyricIndex = -1;
    this.start();
    this.bind();
  }
  start() {
    fetch(`https://ProbeDream.github.io/mock-data/resource/music-list.json`)
      .then(res => {
        return res.json();
      })
      .then(data => {
        this.songList = data;
        this.loadSong();
      });
  }
  bind() {
    let self = this;
    // 点击播放按钮
    this.$(".btn-play-pause").onclick = function() {
      if (this.classList.contains("playing")) {
        self.audio.pause();
        this.classList.remove("playing");
        this.classList.add("pause");
        this.querySelector("use").setAttribute("xlink:href", "#icon-play");
      } else if (this.classList.contains("pause")) {
        self.audio.play();
        this.classList.remove("pause");
        this.classList.add("playing");
        this.querySelector("use").setAttribute("xlink:href", "#icon-pause");
      }
    };

    this.$(".btn-pre").onclick = () => {
      self.currentIndex=(self.songList.length+self.currentIndex-1)%(self.songList.length);
      self.loadSong();
      self.playSong();  
    }
    this.$(".btn-next").onclick = () => {
      self.currentIndex=(self.currentIndex+1)%(self.songList.length);
      self.loadSong();
      self.playSong();
    }

    // 如果时间发生了变化的话 就对其定位到对应的歌词和设置进度条!
    this.audio.ontimeupdate=()=>{
      self.locateLyric();
      self.setProgerssBar();
    }

    let swiper = new Swiper(this.$(".panels"));
    swiper.on("swipLeft", function() {
      document.querySelectorAll('.balls span')[0].classList.remove('current');
      document.querySelectorAll('.balls span')[1].classList.add('current');
      this.classList.remove("panel1");
      this.classList.add("panel2");
    });

    swiper.on("swipRight", function() {
      document.querySelectorAll('.balls span')[1].classList.remove('current');
      document.querySelectorAll('.balls span')[0].classList.add('current');
      this.classList.remove("panel2");
      this.classList.add("panel1");
    });
  }
  loadSong() {
    let songObj = this.songList[this.currentIndex];
    this.$(".header h1").innerText = songObj.title;

    this.$(".header p").innerText = songObj.author + "-" + songObj.albumn;
    this.audio.src = songObj.url;
    // 当audio对象加载了元数据的时候! 将进度条的结束时间设置为当前audio的持续时间赋值给当前的area-time的innerText!
    this.audio.onloadedmetadata = () =>
    this.$(".time-end").innerText = this.formateTime(this.audio.duration);
    this.loadLyrics();
  }
  
  playSong() {

   this.audio.oncanplaythrough=()=>this.audio.play();
  }

  //加载歌词!
  loadLyrics() {
    fetch(this.songList[this.currentIndex].lyric)
      .then(res => res.json())
      .then(data => {
        this.setLyrics(data.lrc.lyric);
        window.lyrics = data.lrc.lyric
      });
  }

  locateLyric(){
    let currentTime=this.audio.currentTime*1000;
    let nextLineTime=this.lyricArr[this.lyricIndex+1][0];
    // 如果当前的时间大于下一行的时间 或者说当前的歌词坐标小于歌词数组的长度减一的话!
    if (currentTime>nextLineTime && this.lyricIndex < this.lyricArr.length-1) {
       this.lyricIndex++;
       let node=this.$(`[data-time="`+this.lyricArr[this.lyricIndex][0]+`"]`) 
       if (node) {
          this.setLyricsToCenter(node);
          this.$$('.panel-effect .lyric p')[0].innerText=this.lyricArr[this.lyricIndex][1];
          this.$$('.panel-effect .lyric p')[1].innerText=this.lyricArr[this.lyricIndex+1]?this.lyricArr[this.lyricIndex+1][1]:'';
       }
    }
  }


  //设置歌词!
  setLyrics(lyrics) {
    this.lyricIndex=0;
    let fragment=document.createDocumentFragment();
    let lyricArr=[];
    this.lyricArr=lyricArr;
    // 歌词通过回车将其分割成字符串数组 并且通过过滤器进行匹配! 并且竟可能少的匹配换行符之外的字符!
    lyrics.split(/\n/).filter(str=>str.match(/\[.+?\]/))
    .forEach(line=>{
      let str=line.replace(/\[.+?\]/g,'');
      line.match(/\[.+?\]/g).forEach(t=>{
        t=t.replace(/[\[\]]/g,"");
        let milliseconds=parseInt(t.slice(0,2))*60*1000
        +parseInt(t.slice(3,5))*1000
        +parseInt(t.slice(6));
        lyricArr.push([milliseconds,str]);
      })
    })
    lyricArr.filter(line=>line[1].trim()!=='').sort((v1,v2)=>{
      if (v1[0] > v2[0]) {
         return 1; 
      }else{
        return -1;
      }
    }).forEach(line=>{
      let node=document.createElement('p');
      node.setAttribute('data-time',line[0]);
      node.innerText=line[1];
      fragment.appendChild(node);
    })
    this.$('.panel-lyrics .container').innerHTML='';
    this.$('.panel-lyrics .container').appendChild(fragment);
  }

  

  // settings lyrics scroll
  setLyricsToCenter(node) {
    let translateY = node.offsetTop - this.$(".panel-lyrics").offsetHeight / 2;
    translateY = translateY > 0 ? translateY : 0;
    this.$(".panel-lyrics .container").style.transform = `translateY(-${translateY}px)`;
    this.$$(".panel-lyrics p").forEach(element => {
      element.classList.remove("current");
    });
    node.classList.add("current");
  }

  // 处理进度条问题
  setProgerssBar() {
    // 将当前的时间除以持续时间(一首歌的总时间) 等于现在时间段的百分比!
    let percent = (this.audio.currentTime * 100) / this.audio.duration + "%";
    //并且将百分比给定当前的 progress类的样式width属性中!
    this.$(".bar .progress").style.width = percent;
    //与此同时 将当前的时间格式化之后 播放进度条里面 最前面就是time-start也就是当前的播放时间!
    this.$(".time-start").innerText = this.formateTime(this.audio.currentTime);
  }

  // 将秒的总数作为参数传入!
  formateTime(secondsTotal) {
    //将其转换成为分钟!
    let minutes = parseInt(secondsTotal / 60);
    //如果minutes大于或者说是等于10的话 那么就将值转换成为字符串 否则小于10前缀加0然后转换成为字符串!
    minutes = minutes >= 10 ? "" + minutes : "0" + minutes;
    //如果是秒钟的话对60取余操作! 最后面将两者拼接起来返回出去!
    let seconds = parseInt(secondsTotal % 60);
    seconds = seconds >= 10 ? "" + seconds : "0" + seconds;
    return minutes + ":" + seconds;
  }
}

window.p = new Player("#player");
