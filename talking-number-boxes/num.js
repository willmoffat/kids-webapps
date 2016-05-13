var $num = document.getElementById('num');
var $formatted = document.getElementById('formatted');
var $container = document.getElementById('container');

function parse(val) {
  val = val.replace(/,/g, '');
  return parseInt(val, 10);
}


function show() {
  $container.innerHTML = '';
  var value = $num.value;
  var n = parse(value);
  if (isNaN(n)) {
    $container.textContent = '';
    $formatted.textContent = 'Not a number';
    return;
  }
  var nStr = n.toLocaleString();  // 1978 -> 1,978.
  $formatted.textContent = nStr;
  speak(nStr);
  if (n > 10000) {
    $container.textContent = 'Too big to show!';
    return;
  }
  var a = new Array(n + 1);
  $container.innerHTML = a.join('<span></span>');
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
