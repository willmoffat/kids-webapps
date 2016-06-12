window.GoogleSheet = (function() {
  "use strict";

  function loadSpreadsheet(sheetId, callback) {
    var url = 'https://spreadsheets.google.com/feeds/cells/' + sheetId +
              '/od6/public/basic?alt=json';
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) {
        return;
      }
      callback(decodeResponse(this));
    };
    xhr.open("GET", url, true);
    xhr.send();
  }

  function editUrl(sheetId) {
    return 'https://docs.google.com/spreadsheets/d/' + sheetId;
  }

  function makeTable(entry) {
    var table = [];
    entry.forEach(function(entry) {
      var val = entry.content.$t;
      var r = /R(\d+)C(\d+)$/.exec(entry.id.$t);
      if (!r || r.length !== 3) {
        console.error('could not parse', entry.id.$t);
        return;
      }
      var row = parseInt(r[1], 10) - 1;
      var col = parseInt(r[2], 10) - 1;
      if (!(row in table)) {
        table[row] = [];
      }
      table[row][col] = val;
      // console.log(row, col, val);
    });
    return table;
  }

  // Must be "Published to the web" (not "Anybody with the link can view")
  function decodeResponse(xhr) {
    var response = JSON.parse(xhr.response);
    var table = makeTable(response.feed.entry);
    return table;
  }

  return {load: loadSpreadsheet, editUrl: editUrl};

})();
