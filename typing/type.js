(function(GoogleSheet, Speech) {
  "use strict";
  var DEBUG = document.location.search.indexOf('debug') !== -1;
  var TAG = document.location.hash.substr(1);
  var SHEET_ID = '1IXOByukXMgx3eI1DpDXEKZZStWXTrK7-KwMU_BFoBzA';
  var OK_IMG = 'smile.svg';
  var wordInput = document.getElementById('wordInput');

  function parseSheet(sheet) {
    var game = {
      currentSentence: null,
      sentences: [],
      speechFixes: {},
      nextSentence: function() {
        return randomPick(game.sentences, game.currentSentence);
      }
    };

    var extractFix = function(match) {
      var w = match.split('|');
      game.speechFixes[w[0]] = w[1];
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
          game.sentences.push(s);
        }
      }
    }
    return game;
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

  function randomPick(list, lastPick) {
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
    return pick;
  }

  function speakLastWord(text) {
    var words = text.split(/\s+/);
    words.pop();
    Speech.say(words.pop());
  }

  function doNextSentence(game) {
    game.currentSentence = game.nextSentence();
    var wordGuide = document.getElementById('wordGuide');
    Speech.say(game.currentSentence.text);
    wordGuide.textContent = game.currentSentence.text;
    updateBackground(null);
    wordInput.value = '';
    wordInput.focus();
  }

  function updateBackground(sentence) {
    var bg = "";
    if (sentence) {
      bg = 'url("' + (sentence.img || OK_IMG) + '")';
    }
    document.getElementById('background').style.backgroundImage = bg;
  }

  function makeKeyHandler(game) {
    return function onKey(e) {
      fullscreen(document.body);

      Speech.say(e.key);

      if (e.keyCode === 13) {
        doNextSentence(game);
        return;
      }

      var got = wordInput.value.toUpperCase();
      var want = game.currentSentence.text.toUpperCase();

      var typo = want.slice(0, got.length) !== got;
      wordInput.className = typo ? 'typo' : '';

      if (e.keyCode === 32) {
        speakLastWord(wordInput.value);  // Don't use uppercase for speech.
        return;
      }

      if (got === want) {
        // Success!
        updateBackground(game.currentSentence);
        // Wait for letter to finish speaking.
        setTimeout(function() { Speech.say(game.currentSentence.text); }, 500);
      }
    };
  }

  function disableBrowserUI() {
    wordInput.addEventListener('keydown', trapModifierKeys, false);
    // Disable mouse.
    var elements = Array.prototype.slice.call(document.querySelectorAll('*'));
    ['contextmenu', 'mousedown', 'mouseup', 'click'].forEach(function(
        eventName) {
      elements.forEach(function(el) {
        el.addEventListener(eventName, trapEvent, true);
      });
    });
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

  function play(game) {
    Speech.setup(game.speechFixes);
    wordInput.addEventListener('keyup', makeKeyHandler(game), false);
    if (!DEBUG) {
      disableBrowserUI();
    }
    doNextSentence(game);
  }

  if (DEBUG) {
    var change = document.getElementById('change');
    change.addEventListener('click', openSheet);
    change.className = '';
  }

  wordInput.value = 'Loading...';
  GoogleSheet.load(SHEET_ID).then(parseSheet).then(play);

  if (false) {
    var testGame = {
      sentences: [{promt: 'Hello, please type the word below:', text: 'hi'}],
      speechFixes: {},
      nextSentence: function() { return testGame.sentences[0]; }
    };
    play(testGame);
  }

})(window.GoogleSheet, window.Speech);
