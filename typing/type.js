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

function speak(text) {
  // Correct weird pronunciation.
  text = text;
  // chrome.tts.speak(text);
}

function newLetter(e) {
  var letter = e.data;
  speak(letter.toUpperCase());
}

function changeGuideWord(toType) {
  wordGuide.textContent = toType;
  wordInput.value = '';
}

function onKey(e) {
  var newText = wordInput.value.toUpperCase();
  if (newText === wordGuide.textContent.toUpperCase()) {
    console.log('TODO: success!');
  }
}

function initWordBox() {
  wordInput.addEventListener('textInput', newLetter, false);
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
