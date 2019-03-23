let $=selector=>document.querySelector(selector);
class Swiper {
  constructor(node) {

    if (!node) throw new Error('需要传递需要绑定的DOM元素');
    let root = typeof node === 'string' ? $(node) : node;
    let eventHub = { 'swipLeft': [], 'swipRight': [] };
    let initX, newX, clock;
    root.ontouchstart = (e) => { initX = e.changedTouches[0].pageX; }
    root.ontouchmove = (e) => {
      if (clock) { clearInterval(clock); }
      clock = setTimeout(() => {
        newX = e.changedTouches[0].pageX;
        if (newX - initX > 50) { eventHub['swipRight'].forEach(fn => fn.bind(root)()) }
        else if (initX - newX > 50) { eventHub['swipLeft'].forEach(fn => fn.bind(root)()) }
      }, 100)
    }
    this.on = (type, fn) => { if (eventHub[type]) { eventHub[type].push(fn) } }
    this.off = (type, fn) => {
      let index = eventHub[type].indexOf(fn);
      if (index !== -1) { eventHub[type].splice(index, 1) }
    }
  }
}
export default Swiper;