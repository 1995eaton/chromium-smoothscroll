var blacklisted_sites = [
  /\.pdf$/i
];

var ease = {
  outSine: function(t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  outQuint: function(t, b, c, d) {
    t /= d;
    t--;
    return c*(t*t*t*t*t + 1) + b;
  },
  outQuad: function(t, b, c, d) {
    t /= d;
    return -c * t*(t-2) + b;
  },
  outExpo: function(t, b, c, d) {
    return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
  },
  outQuart: function(t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  }
};

var Scroll = {

  currentAccel: 1,
  accelStep: 0.2,
  scale: 1.3,
  scrollDuration: 30,
  scrollMethod: ease.outQuint,
  isScrolling: false,
  scrollElement: null,
  oldClientX: null,
  oldClientY: null,

  accelFactor: function() {
    if (this.isScrolling) {
      this.currentAccel += this.accelStep;
    } else {
      this.currentAccel = 1;
    }
    return this.currentAccel;
  },

  smoothScrollBy: function(x, y, el) { // TODO: Convert to requestAnimationFrame
    x ? x : y *= this.scale * this.accelFactor();
    var interval = 0;
    var negative = (x || y) < 0;
    this.isScrolling = true;
    if (x) x /= 4;
    var start = setInterval(function() {
      if (x) {
        if (negative) { // No clue why a floor is required when scrolling up, but for some reason it balances the amount to be scrolled
          el.scrollLeft -= Scroll.scrollMethod(interval, interval / Scroll.scrollDuration * x , -interval / Scroll.scrollDuration * x, Scroll.scrollDuration);
        } else {
          el.scrollLeft -= Math.floor(Scroll.scrollMethod(interval, interval / Scroll.scrollDuration * x , -interval / Scroll.scrollDuration * x, Scroll.scrollDuration));
        }
      } else {
        if (negative) {
          el.scrollTop -= Scroll.scrollMethod(interval, interval / Scroll.scrollDuration * y, -interval / Scroll.scrollDuration * y, Scroll.scrollDuration);
        } else {
          el.scrollTop -= Math.floor(Scroll.scrollMethod(interval, interval / Scroll.scrollDuration * y, -interval / Scroll.scrollDuration * y, Scroll.scrollDuration));
        }
      }
      interval++;
      if (interval >= Scroll.scrollDuration) {
        Scroll.isScrolling = false;
        clearInterval(start);
      }

    }, 1000 / 60);
  },
  climbTheDOM: function(el, deltaX, deltaY) {
    if (!el.parentNode) {
      if (Scroll.isIframe) {
        if ((deltaX > 0 && document.body.scrollLeft === 0) || (deltaX < 0 && document.body.scrollLeft + window.innerWidth >= document.body.scrollWidth) || (deltaY > 0 && document.body.scrollTop === 0) || (deltaY < 0 && document.body.scrollTop + window.innerHeight >= document.body.scrollHeight)) {
          return Scroll.body;
        }
      }
      return document.body;
    }
    if (deltaY && el.scrollHeight > el.clientHeight) {
      var cStyle = getComputedStyle(el);
      if (cStyle.overflow !== "hidden" && cStyle.overflowY !== "hidden") {
        if (deltaY < 0) {
          if (el.scrollTop + el.clientHeight !== el.scrollHeight) {
            var scrollTop = el.scrollTop;
            el.scrollTop++;
            if (scrollTop !== el.scrollTop) {
              return el;
            }
          }
        } else {
          if (el.scrollTop !== 0) {
            var scrollTop = el.scrollTop;
            el.scrollTop--;
            if (scrollTop !== el.scrollTop) {
              return el;
            }
          }
        }
      }
    } else if (deltaX && el.scrollWidth > el.clientWidth) {
      var cStyle = getComputedStyle(el);
      if (cStyle.overflow !== "hidden" && cStyle.overflowX !== "hidden") {
        if (deltaX < 0) {
          if (el.scrollLeft + el.clientWidth !== el.scrollWidth) {
            var scrollLeft = el.scrollLeft;
            el.scrollLeft++;
            if (scrollLeft !== el.scrollLeft) {
              return el;
            }
          }
        } else {
          if (el.scrollLeft !== 0) {
            var scrollLeft = el.scrollLeft;
            el.scrollLeft--;
            if (scrollLeft !== el.scrollLeft) {
              return el;
            }
          }
        }
      }
    }
    return this.climbTheDOM(el.parentNode, deltaX, deltaY);
  }

};

var onMouseWheel = function(ev) {
  if (window !== window.top) {
    Scroll.isIframe = true;
  } else {
    Scroll.isIframe = false;
  }
  ev.stopPropagation(); ev.preventDefault();
  if (ev.clientX !== Scroll.oldClientX || ev.clientY !== Scroll.oldClientY) {
    scrollElement = Scroll.climbTheDOM(ev.target, ev.wheelDeltaX, ev.wheelDeltaY);
    Scroll.smoothScrollBy(ev.wheelDeltaX, ev.wheelDeltaY, scrollElement);
  } else {
    Scroll.smoothScrollBy(ev.wheelDeltaX, ev.wheelDeltaY, scrollElement);
  }
  Scroll.oldClientX = ev.clientX;
  Scroll.oldClientY = ev.clientY;
};

document.addEventListener("DOMContentLoaded", function() {
  if (!document.body) return;
  Scroll.body = window.top.document.body;
  for (var i = 0; i < blacklisted_sites.length; i++) {
    if (blacklisted_sites[i].test(document.URL)) return;
  }
  document.addEventListener("mousewheel", onMouseWheel, false);
}, false);
