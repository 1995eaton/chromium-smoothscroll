var grabber, sliding, slider_offset, slider_val, save_button, offset;
var grabber_pos = 0;
var log = console.log.bind(console);

function mousemove(e) {
  if (sliding) {
    offset = e.x - 15 - slider_offset + 5;
    grabber.style.left = offset+"px";
    if (e.x - 15 - slider_offset < 0) {
      grabber.style.left = "0px";
      offset = 0;
    } else  if (e.x - 15 - slider_offset + 2 >= 236) {
      grabber.style.left = 236+"px";
      offset = 236;
    }
    slider_val.value = offset;
  }
}

function mouseup(e) {
  sliding = false;
}

function mousedown(e) {
  if (e.target.className === "slider_grabber") {
    log(localStorage["smoothness"]);
    e.preventDefault();
    sliding = true;
  } else {
    sliding = false;
    if (e.target.id === "save_button") {
      localStorage["offset"] = offset;
      localStorage["smoothness"] = offset;
    }
  }
}

function keydown(e) {
  if (e.which === 13 && document.activeElement.id === "slider_val") {
    if (slider_val.value >= 236) {
      offset = 236;
      grabber.style.left = 236+"px";
    } else if (slider_val.value <= 0) {
      offset = 0;
      grabber.style.left = 0+"px";
    } else {
      offset = slider_val.value;
      grabber.style.left = slider_val.value+"px";
    }
  }
}

function main() {
  if (!localStorage["offset"]) {
    localStorage["offset"] = 50;
    localStorage["smoothness"] = 50;
  }
  slider_offset = parseInt(getComputedStyle(document.getElementById("slider")).left.replace('px', ''));
  grabber.style.left = localStorage["offset"]+"px";
  slider_val.value = parseInt(localStorage["offset"]);
  save_button.style.left = window.innerWidth/2 - 50 + "px";
}

document.addEventListener("DOMContentLoaded", function() {
  grabber = document.getElementsByClassName("slider_grabber")[0];
  slider_val = document.getElementById("slider_val");
  save_button = document.getElementById("save_button");
  main();
  document.addEventListener("mousedown", mousedown, false);
  document.addEventListener("mousemove", mousemove, false);
  document.addEventListener("mouseup", mouseup, false);
  document.addEventListener("keydown", keydown, false);
});
