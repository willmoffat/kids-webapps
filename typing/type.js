(function(Google) {
  "use strict";
  var DEBUG = document.location.search === '?debug';
  var SHEET_ID = '1IXOByukXMgx3eI1DpDXEKZZStWXTrK7-KwMU_BFoBzA';
  var wordGuide = document.getElementById('wordGuide');
  var wordInput = document.getElementById('wordInput');
  var backgroundEl = document.getElementById('background');

  var OK_IMG = 'smile.svg';

  var currentSentence;
  var sentences = [];

  function init(sheet) {
    for (var i = 1; i < sheet.length; i++) {
      var row = sheet[i];
      var s = {text: row[0], img: row[1]};
      if (s.text) {
        sentences.push(s);
      }
    }
    initEventListeners();
    changeGuideWord();
  }

  function fullscreen(el) {
    if (DEBUG) {
      return;
    }
    var fn = el.requestFullScreen || el.webkitRequestFullscreen;
    if (fn) {
      fn.call(el);
    }
  }

  var lastPick;
  function randomPick(list) {
    var pick;
    do {
      pick = list[Math.floor(Math.random() * list.length)];
    } while (pick === lastPick);
    lastPick = pick;
    return pick;
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

  function speakLastWord(text) {
    var words = text.split(/\s+/);
    words.pop();
    speak(words.pop());
  }

  function changeGuideWord(sentence) {
    if (!sentence || !sentence.text) {
      sentence = randomPick(sentences);
    }
    currentSentence = sentence;
    speak(sentence.text);
    wordGuide.textContent = sentence.text;
    backgroundEl.style.backgroundImage = '';
    wordInput.value = '';
    wordInput.focus();
  }

  function onKey(e) {
    fullscreen(document.body);
    if (e.keyCode === 13) {
      changeGuideWord();
      return;
    }

    var got = wordInput.value.toUpperCase();
    var want = currentSentence.text.toUpperCase();

    var typo = want.slice(0, got.length) !== got;
    wordInput.className = typo ? 'typo' : '';
    if (typo) {
      return;
    }

    if (e.keyCode === 32) {
      speakLastWord(got);
      return;
    }

    if (got === want) {
      // Success!
      backgroundEl.style.backgroundImage =
          'url("' + (currentSentence.img || OK_IMG) + '")';
      // Wait for letter to finish speaking.
      setTimeout(function() { speak(want); }, 500);
    }
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

    document.getElementById('change').addEventListener('click', openSheet);
  }

  function openSheet() {
    var url = Google.editUrl(SHEET_ID);
    window.open(url, '_blank');
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
    fullscreen(document.body);
    e.preventDefault();
    e.stopPropagation();
  }

  wordInput.value = 'Loading...';
  Google.loadSpreadsheet(SHEET_ID, init);
})(window.Google);
