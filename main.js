var blacklisted_sites = [
'*.pdf$'
];

function easeOutSine(t, b, c, d) {
  return c * Math.sin(t/d * (Math.PI/2)) + b;
};

var isScrolling;
function smoothScrollBy(x, y, e) {
  isScrolling = true;
  var direction = (x===0)? "vertical" : "horizontal";
  var scale = 0.8;
  var i = 0;
  var duration = 30;
  var oldY = y;
  y *= scale;
  d = 25;
  i = 0;
  var begin = setInterval(function() {
    if (direction === "horizontal") {
      e.scrollLeft += easeOutSine(i, i/duration*x, -i/duration*x, duration);
    } else {
      e.scrollTop += easeOutSine(i, i/duration*y, -i/duration*y, duration);
    }
    i += 1;
    if (i >= duration) {
      isScrolling = false;
      clearInterval(begin);
    }

  }, 15);
};

function accelFactor(delta, r) {

  var accel = 0.1;
  if (r == null) {
    r = 1;
  }
  if (isScrolling) {
    r += accel;
  } else {
    r = 1;
  }
  return delta*r;

};

var isScrollable = {
  x: function (e, direction) {
    var s = e.scrollLeft;
    if (direction === "right") {
      e.scrollLeft++;
      return e.scrollLeft != s;
    } else {
      e.scrollLeft--;
      return e.scrollLeft != s && e.scrollLeft != 0;
    }
  },
  y: function (e, direction) {
    var s = e.scrollTop;
    if (direction === "down") {
      e.scrollTop++;
      return e.scrollTop != s;
    } else {
      e.scrollTop--;
      return e.scrollTop != s && e.scrollTop != 0;
    }
  }
};

function traverseUpwards(e, offset, direction) {
  if (!e.parentNode) {
    return document.body;
  }
  if (direction === "vertical") {
    if (e.scrollHeight > e.offsetHeight) {
      if (e.scrollTop+e.offsetHeight >= e.scrollHeight || offset < 0 && e.scrollTop == 0) {
        if ((!isScrollable.y(e, "down") && offset > 0) || (!isScrollable.y(e, "up") && offset > 0)) {
          return document.body;
        }
      }
      s = e.scrollTop;
      if (s === 0 && offset < 0) {
        return document.body;
      }
      e.scrollTop++;
      if (s != e.scrollTop) {
        return e;
      }
    }
    return traverseUpwards(e.parentNode, offset, "vertical");
  } else {
    if (e.scrollWidth > e.offsetWidth) {
      if (e.scrollLeft+e.offsetWidth >= e.scrollWidth || offset < 0 && e.scrollLeft === 0) {
        if ((!isScrollable.x(e, "right") && offset > 0) || (!isScrollable.x(e, "left") && offset > 0)) {
          return document.body;
        }
      }
      s = e.scrollLeft;
      if (s === 0 && offset < 0) {
        return document.body;
      }
      e.scrollLeft++;
      if (s != e.scrollLeft) {
        return e;
      }
    }
    return traverseUpwards(e.parentNode, offset, "horizontal");
  }

}

function updateElement(e, deltaX, deltaY) {
  if (deltaX) {
    return traverseUpwards(e, deltaX, "horizontal");
  } else {
    var s = traverseUpwards(e, deltaY, "vertical");
    return s;
  }
}

function checkParentScroll(e) { // check parents for hidden overflows
  var _e = e;
  while (e.parentNode) {
    var s = window.getComputedStyle(e);
    if (s.overflow === "scroll"
        || s.overflowX === "scroll"
        || s.overflowY === "scroll"
        || s.overflow === "auto"
        || s.overflowX === "auto"
        || s.overflowY === "auto") {
          return e;
        }
    if (s.overflow == "hidden"
        || s.overflowX == "hidden"
        || s.overflowY == "hidden") {
          _e = e.parentNode;
        }
    e = e.parentNode;
  }
  return _e;
}

var scrollElement;
var oldClientX, oldClientY;
var isBlacklisted = false;
window.onmousewheel = function(e) {
  isBlacklisted = false;
  for (var i = 0; i < blacklisted_sites.length; i++) {
    if (new RegExp(blacklisted_sites[i]).test(document.URL)) {
      isBlacklisted = true;
    }
  }
  if (!isBlacklisted && window == window.top) { // skip iframe when necessary
    e.preventDefault();
    var adjustedSpeed = accelFactor(e.deltaX || e.deltaY);
    if (e.clientX !== oldClientX || e.clientY !== oldClientY) {
      var newE = checkParentScroll(e.toElement);
      scrollElement = updateElement(newE, e.deltaX, e.deltaY);
      if (e.deltaX) {
        smoothScrollBy(adjustedSpeed, 0, scrollElement);
      } else {
        smoothScrollBy(0, adjustedSpeed, scrollElement);
      }
    } else {
      if (e.deltaX) {
        smoothScrollBy(adjustedSpeed, 0, scrollElement);
      } else {
        smoothScrollBy(0, adjustedSpeed, scrollElement);
      }
    }
    oldClientX = e.clientX;
    oldClientY = e.clientY;
  }
};
