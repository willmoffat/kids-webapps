function show(n) {
  speak(n);
  if (n > 10000) {
    container.textContent = 'too big!';
    return;
  }
  var a = new Array(n + 1);
  container.innerHTML = a.join('<span></span>');
}

var err = document.getElementById('err');
var num = document.getElementById('num');
var container = document.getElementById('container');

function speak(n) {
  var num = n.toLocaleString(); // Convert 1978 to '1,978'. Don't speak as date.
  speechSynthesis.cancel();
  //  if (speechSynthesis.speaking) {    return;  }
  var msg = new SpeechSynthesisUtterance(num);
  msg.lang = 'en-GB'; // For some default, my default voice is German.
  speechSynthesis.speak(msg);
}

function onChange() {
  container.innerHTML = '';
  show(parseInt(num.value, 10) || 0);
}

num.addEventListener('change', onChange);

onChange();
