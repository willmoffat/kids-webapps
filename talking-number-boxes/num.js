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
  for (var i = 1; i <= n; i++) {
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
function show() {
  var value = $num.value;
  var n = parse(value);
  var nStr = n.toLocaleString();  // 1978 -> 1,978.

  if (isNaN(n)) {
    n = 0;
    nStr = '';
  }
  $formatted.textContent = nStr;
  boxes(n);
  Speech.say(nStr);
}
function onKey(e) {
  if (/^(Digit)|(Arrow)|(Backspace)|(Delete)/.test(e.code)) {
    return;
  }
  console.log('Disallowing ', e.code);
  e.preventDefault();
}

window.addEventListener('keydown', onKey);
window.addEventListener('resize', resize);
$num.addEventListener('input', show);
$num.addEventListener('blur', function() { $num.focus(); });
$num.value = '10';
resize();



//////////////////////////////////////////////////////////////////////////////
(function liveReload() {
  if (!document.location.search.includes('reload')) {
    return;
  }
  var s = document.querySelectorAll('script'), src = s[s.length - 1].src, lm;
  var compare = function(r) {
    if (lm && lm !== r.headers.get('Last-Modified')) {
      return document.location.reload();
    }
    lm = r.headers.get('Last-Modified');
    return setTimeout(get, 1000);
  };
  var get = function() { fetch(src, {method: 'HEAD'}).then(compare); };
  get();
})();
//////////////////////////////////////////////////////////////////////////////
