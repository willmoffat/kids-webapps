(function() {
  "use strict";
  var DEBUG = true;
  var wordGuide = document.getElementById('wordGuide');
  var wordInput = document.getElementById('wordInput');

  var OK_IMG = 'smile.svg';

  var currentSentence;
  var sentences;

  function init(s) {
    sentences = s;
    initEventListeners();
    // fullScreen(); TODO(wdm)
    changeGuideWord();
  }

  function randomPick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function speak(txt) {
    speechSynthesis.cancel();
    var msg = new SpeechSynthesisUtterance(txt);
    msg.lang = 'en-GB';  // For some reason, my default voice is German.
    speechSynthesis.speak(msg);
  }

  function speakLetter(e) {
    var letter = e.data;
    speak(letter.toUpperCase());
  }

  function changeGuideWord(sentence) {
    if (!sentence || !sentence.text) {
      sentence = randomPick(sentences);
    }
    currentSentence = sentence;
    speak(sentence.text);
    wordGuide.textContent = sentence.text;
    document.body.style.backgroundImage = '';
    wordInput.value = '';
    wordInput.focus();
  }

  function onKey(e) {
    if (e.keyCode === 13) {
      changeGuideWord();
      return;
    }

    // if (e.keyCode === 32) {} // TODO(wdm) Speak last word.
    var got = wordInput.value.toUpperCase();
    var want = currentSentence.text.toUpperCase();
    if (got === want) {
      console.log('TODO: success!');
      document.body.style.backgroundImage =
          'url("' + currentSentence.img + '")';
      speak(want);
    }
    var typo = want.slice(0, got.length) !== got;
    wordInput.className = typo ? 'typo' : '';
  }

  function doChangeBtn() {
    var text = window.prompt("Enter a sentence");
    var img = window.prompt('Image URL to display', OK_IMG);
    changeGuideWord({text: text, img: img});
  }

  function initEventListeners() {
    wordInput.addEventListener('textInput', speakLetter, false);
    wordInput.addEventListener('keyup', onKey, false);
    wordInput.addEventListener('keydown', trapModifierKeys, false);

    if (!DEBUG) {
      // Disable mouse.
      var elements = Array.prototype.slice.call(document.querySelectorAll('*'));
      ['contextmenu', 'mousedown', 'mouseup', 'click'].forEach(function(
          eventName) {
        elements.forEach(function(el) {
          el.addEventListener(eventName, trapEvent, true);
        });
      });
    }

    document.getElementById('change').addEventListener('click', doChangeBtn);
  }

  function trapModifierKeys(e) {
    if (DEBUG) {
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altGraphKey || e.altKey || e.which === 9) {
      console.log('trapping ', e);
      trapEvent(e);
    }
  }

  function trapEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  wordInput.value = 'Loading...';
  window.Google.loadSpreadsheet(init);
})();
