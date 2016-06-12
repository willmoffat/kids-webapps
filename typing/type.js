(function(GoogleSheet, Speech) {
  "use strict";
  var DEBUG = document.location.search.indexOf('debug') !== -1;
  var TAG = document.location.hash.substr(1);
  var SHEET_ID = '1IXOByukXMgx3eI1DpDXEKZZStWXTrK7-KwMU_BFoBzA';
  var wordGuide = document.getElementById('wordGuide');
  var wordInput = document.getElementById('wordInput');
  var backgroundEl = document.getElementById('background');

  var OK_IMG = 'smile.svg';

  var currentSentence;
  var sentences;

  function parseSheet(sheet) {
    var sentences = [];
    var speechFixes = {};
    var extractFix = function(match) {
      var w = match.split('|');
      console.log(w[0], '-->', w[1]);
      speechFixes[w[0]] = w[1];
      return w[0];
    };

    for (var i = 1; i < sheet.length; i++) {
      var row = sheet[i];
      var text = row[0];
      if (text) {
        if (text.indexOf('//') === 0) {
          continue;  // Skip comments.
        }
        text = text.replace(/\S+\|\S+/g, extractFix);
        var tags = row[1].split(',');
        if (!TAG || tags.indexOf(TAG) !== -1) {
          var s = {text: text, img: row[2]};
          sentences.push(s);
        }
      }
    }
    Speech.setup(speechFixes);
    return sentences;
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
    for (var i = 0; i < 10; i++) {
      pick = list[Math.floor(Math.random() * list.length)];
      if (pick !== lastPick) {
        break;
      }
    }
    if (!pick) {
      throw new Error("No sentences!");
    }
    lastPick = pick;
    return pick;
  }

  function speakLastWord(text) {
    var words = text.split(/\s+/);
    words.pop();
    Speech.say(words.pop());
  }

  function changeGuideWord(sentence) {
    if (!sentence || !sentence.text) {
      sentence = randomPick(sentences);
    }
    currentSentence = sentence;
    Speech.say(sentence.text);
    wordGuide.textContent = sentence.text;
    backgroundEl.style.backgroundImage = '';
    if (DEBUG) {
      updateBackground(currentSentence);
    }
    wordInput.value = '';
    wordInput.focus();
  }

  function updateBackground(sentence) {
    backgroundEl.style.backgroundImage =
        'url("' + (sentence.img || OK_IMG) + '")';
  }

  function onKey(e) {
    fullscreen(document.body);

    Speech.say(e.key);

    if (e.keyCode === 13) {
      changeGuideWord();
      return;
    }

    var got = wordInput.value.toUpperCase();
    var want = currentSentence.text.toUpperCase();

    var typo = want.slice(0, got.length) !== got;
    wordInput.className = typo ? 'typo' : '';

    if (e.keyCode === 32) {
      speakLastWord(wordInput.value);  // Don't use uppercase for speech.
      return;
    }

    if (got === want) {
      // Success!
      updateBackground(currentSentence);
      // Wait for letter to finish speaking.
      setTimeout(function() { Speech.say(currentSentence.text); }, 500);
    }
  }

  function initEventListeners() {
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
  }

  function openSheet() {
    var url = GoogleSheet.editUrl(SHEET_ID);
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

  function init(s) {
    sentences = s;
    initEventListeners();
    changeGuideWord();
  }

  if (DEBUG) {
    var change = document.getElementById('change');
    change.addEventListener('click', openSheet);
    change.className = '';
  }

  wordInput.value = 'Loading...';
  GoogleSheet.load(SHEET_ID).then(parseSheet).then(init);

  // init([{text: 'hi'}]);

})(window.GoogleSheet, window.Speech);
