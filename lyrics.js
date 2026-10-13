/* ==========================================================================
   SPRING SNOW — song settings + lyrics
   This is the ONLY file you need to edit to change the song or the timing.
   ========================================================================== */

window.SPRING_SNOW = {
  // Put your audio file at assets/spring-snow.mp3 (or change this path).
  // Leave as "" to run in silent preview mode.
  audioSrc: "assets/spring-snow.mp3",

  // The playback window, in seconds from the start of the ORIGINAL track.
  startTime: 20,   // 0:20
  endTime: 135,    // 2:15

  /* Lyrics — your exact wording.
     `time` = second (in the original track) when the line should appear.
     Every time MUST be between startTime and endTime.

     !! The times below are EVEN ESTIMATES spread over 0:20–2:15 !!
     To set them exactly, open the site with  ?sync  at the end of the URL
     (e.g. http://localhost:8000/?sync), play the song and press the "M" key
     the moment each line begins. It prints a ready-to-paste array. */
  lyrics: [
    { time: 20,  text: "가려진 오랜 시간이" },
    { time: 24,  text: "우리를 다시 불러와" },
    { time: 28,  text: "어느 곳에 있어도" },
    { time: 32,  text: "그 끝은 항상 너인걸" },

    { time: 37,  text: "'Cause I'm falling slowly in love with you" },
    { time: 42,  text: "오랫동안 기다려온 너는 봄이야" },
    { time: 47,  text: "'Cause I'm falling slowly in love with you" },
    { time: 52,  text: "다시 지워진다 해도, all my life is you" },

    { time: 58,  text: "너라는 이야기 속에" },
    { time: 62,  text: "다시 또 꿈을 꾸는 나" },
    { time: 66,  text: "어떤 순간이 와도" },
    { time: 70,  text: "난 너를 찾아 갈거야" },

    { time: 75,  text: "'Cause I'm falling slowly in love with you" },
    { time: 80,  text: "오랫동안 기다려온 너는 봄이야" },
    { time: 85,  text: "'Cause I'm falling slowly in love with you" },
    { time: 90,  text: "다시 지워진다 해도, all my life is you" },

    { time: 97,  text: "꽃잎 날리던 하얀 길위에" },
    { time: 102, text: "행복했던 너와 나 다시 만날 수 있다면" },

    { time: 109, text: "'Cause I'm falling slowly in love with you" },
    { time: 114, text: "오랫동안 기다려온 너는 봄이야" },
    { time: 119, text: "'Cause I'm falling slowly in love with you" },
    { time: 125, text: "다시 지워진다 해도, all my life is you" }
  ],

  // Ending-screen copy
  endingTitle: "Some moments are too beautiful to end.",
  endingSubtitle: "And this one is for you. ♡"
};
