// Full screen video support with start & end times.
this.Video = (function() {
  "use strict";

  var DEBUG = document.location.search.indexOf('debug') !== -1;

  // Note(wdm) Extract YT play-list info.
  //           -> Can only get name. No start & stop times.

  // var playlistId = 'PLZw4T5Dq7_FuRWtP_wgKVeEcu1KXobb-k';
  // player.loadPlaylist({list: playlistId, listType: 'playlist'});

  var player;
  var YT;

  window.onYouTubeIframeAPIReady = function() { YT = window.YT; };

  function hide() {
    clearTimeout(monitorT);
    if (!DEBUG) {
      document.getElementById('video-player').className = 'hidden';
    }
    if (player && player.getIframe()) {
      player.destroy();
    }
  }

  function play() {
    document.getElementById('video-player').className = '';
    player.loadingP.then(function() {
      player.seekTo(player.video.start);
      player.playVideo();
    });
  }

  var monitorT;
  function monitor() {
    if (player.getCurrentTime() > player.video.end) {
      player.pauseVideo();
    } else {
      monitorT = setTimeout(monitor, 100);
    }
  }

  function onStateChange(e) {
    if (e.data === YT.PlayerState.PLAYING) {
      if (player.loadingResolve) {
        player.pauseVideo();  // Stop when buffering finished.
        var resolve = player.loadingResolve;
        delete player.loadingResolve;
        resolve();
      } else {
        monitor();  // Invoked by play(). Start the end monitor.
      }
    }
  }

  function load(video) {
    if (player && player.video === video) {
      return player.loadingP;  // Only pre-load once.
    }

    hide();

    // https://developers.google.com/youtube/player_parameters
    var playerVars = {
      start: video.start,
      end: video.end + 1,  // Must be an int.
      controls: 0,
      'iv_load_policy': 3,  // Don't show annotations.
      modestbranding: 1,    // Minimal YT logo.
      rel: 0                // Don't show related videos.
    };
    if (DEBUG) {
      playerVars.controls = 1;
      console.log('playerVars', playerVars);
    }
    var container = document.getElementById('video-container');
    var w = container.clientWidth;
    var h = container.clientHeight + 100;
    if (DEBUG) {
      h -= 200;
    }
    player = new YT.Player('video-player', {
      height: h,
      width: w,
      videoId: video.videoId,
      playerVars: playerVars,
      events: {
        onReady: function() { player.playVideo(); },
        onStateChange: onStateChange,
        onError: function(e) { console.error(e); }
      }
    });
    player.video = video;
    player.loadingP =
        new Promise(function(resolve) { player.loadingResolve = resolve; });
    return player.loadingP;
  }

  // For thumbnail URLs see:
  // https://www.binarymoon.co.uk/2014/03/using-youtube-thumbnails/

  return {hide: hide, load: load, play: play};
})();
