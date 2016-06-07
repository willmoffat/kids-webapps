this.Google = (function() {
  "use strict";
  var Google = {};

  // https://docs.google.com/spreadsheets/d/1IXOByukXMgx3eI1DpDXEKZZStWXTrK7-KwMU_BFoBzA
  var docId = '1IXOByukXMgx3eI1DpDXEKZZStWXTrK7-KwMU_BFoBzA';
  Google.loadSpreadsheet = function(callback) {
    var url = 'https://spreadsheets.google.com/feeds/cells/' + docId +
              '/od6/public/basic?alt=json';
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) {
        return;
      }
      callback(Google.decodeResponse(this));
    };
    xhr.open("GET", url, true);
    xhr.send();
  };

  Google.makeTable = function(entry) {
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
      console.log(row, col, val);
    });
    return table;
  };

  // Must be Word, Pronunciation, Image Url
  // Must be "Published to the web" (not same as "Anybody with the link can
  // view")
  Google.decodeResponse = function(xhr) {
    var response = JSON.parse(xhr.response);
    var table = Google.makeTable(response.feed.entry);

    // Remove header row.
    table.shift();

    return table.map(function(row) { return {text : row[0], img : row[1]}; });
  };

  return Google;
})();
