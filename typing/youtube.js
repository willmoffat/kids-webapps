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

  var loadYouTubeAPI = new Promise(function(resolve) {
    window.onYouTubeIframeAPIReady = function() {
      YT = window.YT;
      resolve();
    };
  });

  function hide() {
    if (player && player.getIframe()) {
      player.destroy();
    }
  }

  function playVideo(video) {
    return new Promise(function(resolve, reject) {
      hide();

      var monitor = function() {
        if (player.getCurrentTime() > video.end) {
          console.log('monitor: stop');
          player.pauseVideo();
          resolve();
        } else {
          setTimeout(monitor, 100);
        }
      };

      var onPlayerStateChange = function(e) {
        console.log(e);
        if (e.data === YT.PlayerState.PLAYING) {
          console.log('monitor: start');
          monitor();
        }

        if (e.data === YT.PlayerState.ENDED) {
          console.warn('ENDED without reaching end time.');
          resolve();
        }
      };

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
          onStateChange: onPlayerStateChange,
          onError: reject
        }
      });
    });
  }

  // For thumbnail URLs see:
  // https://www.binarymoon.co.uk/2014/03/using-youtube-thumbnails/

  return {
    hide: hide,
    play: function(video) {
      return loadYouTubeAPI.then(function() { return playVideo(video); });
    }
  };

})();
