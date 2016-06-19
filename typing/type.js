(function(Tabletop, Speech, Video) {
  "use strict";
  var DEBUG = document.location.search.indexOf('debug') !== -1;
  var TAG = document.location.hash.substr(1);
  var SHEET_ID = '1IXOByukXMgx3eI1DpDXEKZZStWXTrK7-KwMU_BFoBzA';
  var OK_IMG = 'smile.svg';
  var wordInput = document.getElementById('wordInput');

  function showByTag(rawTags) {
    if (!TAG) {
      return true;
    }  // No tag in hash. Show all.
    var tags = rawTags.split(/\s*,\s*/);
    if (tags.indexOf(TAG) !== -1) {
      return true;
    }
    return false;  // Doesn't match #tag
  }

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

    for (var i = 0; i < sheet.sentences.elements.length; i++) {
      var row = sheet.sentences.elements[i];
      var text = row.sentence;
      if (text) {
        if (text.indexOf('//') === 0) {
          continue;  // Skip comments.
        }
        text = text.replace(/\S+\|\S+/g, extractFix);

        if (showByTag(row.tags)) {
          var s = {text: text, img: row.image};
          game.sentences.push(s);
        }
      }
    }
    // TODO(wdm) DRI.
    for (i = 0; i < sheet.videos.elements.length; i++) {
      row = sheet.videos.elements[i];
      text = row.sentence;
      if (text) {
        if (text.indexOf('//') === 0) {
          continue;  // Skip comments.
        }
        text = text.replace(/\S+\|\S+/g, extractFix);
        if (showByTag(row.tags)) {
          s = {text: text, videoId: row.id, start: row.start, end: row.end};
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
    var s = game.nextSentence();
    game.currentSentence = s;
    var speech = s.prompt || s.text;
    document.getElementById('prompt').textContent = s.prompt || '';
    Speech.say(speech);
    document.getElementById('wordGuide').textContent = s.text;
    updateBackground(null);
    wordInput.value = '';
    wordInput.focus();
  }

  function updateBackground(sentence) {
    var bg = "";
    if (sentence) {
      if (sentence.videoId) {
        Video.play(sentence);
        bg = '';
      } else {
        bg = 'url("' + (sentence.img || OK_IMG) + '")';
      }
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
    var url = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID;
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

  function loadSheet(id) {
    return new Promise(function(resolve) {
      Tabletop.init({key: id, callback: resolve});
    });
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
  if (true) {
    loadSheet(SHEET_ID).then(parseSheet).then(play);
  } else {
    var testGame = {
      sentences: [
        {
          prompt: 'Please type the word below:',  // TODO(wdm) Press Enter!
          text: 'hi'
        },
        {prompt: 'Hello. What is your name?', text: 'Yann'},
        {prompt: 'Are you hungry?', text: 'I like eating frogs!'}
      ],
      speechFixes: {},
      currentIndex: 0,
      nextSentence: function() {
        return testGame.sentences[testGame.currentIndex++];
      }
    };
    play(testGame);
  }
})(window.Tabletop, window.Speech, window.Video);
