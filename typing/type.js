var DEBUG = true;
var wordGuide = document.getElementById('wordGuide');
var wordInput = document.getElementById('wordInput');

function init() {
  initWordBox();
  if (!DEBUG) {
    fullScreen();
    disableMouse();
    wordInput.addEventListener('keydown', trapModifierKeys, false);
  }
  changeGuideWord('My name is Yann');
}
window.addEventListener('load', init);

function speak(txt) {
  speechSynthesis.cancel();
  var msg = new SpeechSynthesisUtterance(txt);
  msg.lang = 'en-GB'; // For some reason, my default voice is German.
  speechSynthesis.speak(msg);
}

function speakLetter(e) {
  var letter = e.data;
  speak(letter.toUpperCase());
}

function changeGuideWord(toType) {
  speak(toType);
  wordGuide.textContent = toType;
  wordInput.value = '';
}

function onKey(e) {
  var got = wordInput.value.toUpperCase();
  var want = wordGuide.textContent.toUpperCase();
  if (got === want) {
    console.log('TODO: success!');
    speak(want);
  }
  var typo = want.slice(0, got.length) !== got;
  wordInput.className = typo ? 'typo' : '';
}

function initWordBox() {
  wordInput.addEventListener('textInput', speakLetter, false);
  wordInput.addEventListener('keyup', onKey, false);
}

function trapModifierKeys(e) {
  if (e.metaKey || e.ctrlKey || e.altGraphKey || e.altKey || e.which == 9) {
    console.log('trapping ', e);
    trapEvent(e);
  }
}

function trapEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}

function disableMouse() {
  var elements = Array.prototype.slice.call(document.querySelectorAll('*'));
  ['contextmenu', 'mousedown', 'mouseup', 'click'].forEach(function(eventName) {
    elements.forEach(function(el) {
      el.addEventListener(eventName, trapEvent, true);
    });
  });
}
