let $=selector=>document.querySelector(selector);
let $$=selector=>document.querySelectorAll(selector);
class Swiper{
    constructor(node){
    if(node)throw new Error('需要传递绑定的DOM元素!');
    let root=typeof node === 'string' ? $(node):node;
    let eventHub={'swipLeft':[],'swipRight':[]};
    let initX,newX,clock;
    root.ontouchstart=e=>{initX=e.changedTouches[0].pagex;}
    root.ontouchmove=e=>{
        if(clock){clearInterval(clock);}
            clock=new setTimeout(()=>{
            newX=e.changedTouches[0].pageX;
            if(newX-initX>50){eventHub['swipLeft']
            .forEach(fn=>fn.bind(root)());}
            else if(initX-newX>50){eventHub['swipRight']
            .forEach(fn=>fn.bind(root)());}},100);
        }
        this.on=(type,fn)=>{if(eventHub[type]){eventHub[type].push(fn);}}
        this.off=(type,fn)=>{
            let index=eventhub[type].indexOf(fn);
            if (index !== -1) {eventhub[type].splice(index,1);}
        }
    }
}
export default Swiper;