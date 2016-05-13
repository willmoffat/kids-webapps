var $num = document.getElementById('num');
var $formatted = document.getElementById('formatted');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function parse(val) {
  val = val.replace(/,/g, '');
  return parseInt(val, 10);
}

function resize() {
  // Set the internal size to match CSS size.
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight; // HACK?
  show();
}

var W = 5;
var H = 5;
var SX = W + 1;
var SY = H + 1;
var MAXY;

function boxes(n) {
  var MAXX = canvas.width;
  ctx.clearRect(0, 0, MAXX, MAXY);
  var perLine = Math.ceil(MAXX / SX);
  var MAXY = Math.ceil(n / perLine) * SY;
  if (MAXY > 32000) {
    return;
  }
  canvas.style.height = MAXY + 'px';
  canvas.height = MAXY;
  var x = 0, y = 0;
  for (var i = 0; i < n; i++) {
    ctx.fillStyle = (i % 10 === 0) ? "red" : "pink";
    ctx.fillRect(x, y, W, H);
    x += SX;
    if (x > MAXX) {
      x = 0;
      y += SY;
      if (y >= MAXY) {
        break;  // HACK ?
      }
    }
  }
}

function showNaN() {
  $formatted.textContent = 'Not a number';
}

function showNum(n, nStr) {
  $formatted.textContent = nStr;
  boxes(n);
  speak(nStr);
}

function show() {
  var value = $num.value;
  var n = parse(value);
  if (isNaN(n)) {
    showNaN();
    return;
  }
  var nStr = n.toLocaleString();  // 1978 -> 1,978.
  showNum(n, nStr);
}


function speak(txt) {
  speechSynthesis.cancel();
  var msg = new SpeechSynthesisUtterance(txt);
  msg.lang = 'en-GB';  // For some reason, my default voice is German.
  speechSynthesis.speak(msg);
}


window.addEventListener('resize', resize);
$num.addEventListener('input', show);
$num.addEventListener('blur', function() { $num.focus(); });
$num.value = '10';
resize();
