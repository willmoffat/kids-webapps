var $num = document.getElementById('num');
var $formatted = document.getElementById('formatted');
var $container = document.getElementById('container');

function parse(val) {
  val = val.replace(/,/g, '');
  return parseInt(val, 10);
}

function boxes(n) {
  if (n > 10000) {
    return 'Too big to show!';
  }
  if (n < 1) {
    return '';
  }
  var a = new Array(n + 1);
  return a.join('<span></span>');
}

function showNaN() {
  $formatted.textContent = 'Not a number';
  $container.innerHTML = '';
}

function showNum(n, nStr) {
  $formatted.textContent = nStr;
  $container.innerHTML = boxes(n);
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

$num.addEventListener('input', show);
$num.addEventListener('blur', function() { $num.focus(); });
$num.value = '10';
show();
