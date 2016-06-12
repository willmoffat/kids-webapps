window.Speech = (function() {
  "use strict";
  var speechFixes = {};  // For example the name 'Joke':'Yoka'.

  var speechSynthesis = window.speechSynthesis;
  if (!speechSynthesis) {
    window.alert('You are using an old browser without speech. ' +
                 'Consider using Google Chrome');
  }

  function setup(fixes) { speechFixes = fixes; }
  function say(txt) {
    if (!speechSynthesis) {
      return;
    }
    for (var word in speechFixes) {
      var fix = speechFixes[word];
      txt = txt.replace(word, fix);  // TODO(wdm) Enforce word boundaries.
    }
    speechSynthesis.cancel();
    var msg = new SpeechSynthesisUtterance(txt);
    msg.lang = 'en-GB';  // For some reason, my default voice is German.
    speechSynthesis.speak(msg);
  }
  return {say: say, setup: setup};
})();
