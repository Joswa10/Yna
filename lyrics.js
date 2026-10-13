/* ==========================================================================
   SPRING SNOW + DITO SA'KIN — song settings + lyrics
   This is the ONLY file you need to edit to change a song, its lyrics or timing.
   ========================================================================== */

window.SONGS = {

  /* ------------------------------ PART 1 ------------------------------ */
  part1: {
    label: "Part 1",
    title: "Spring Snow",
    artist: "10cm",
    audioSrc: "spring-snow.mp3",
    startTime: 0,
    endTime: null,             // full track (3:37)
    offset: 0.15,              // small lead so a line is on screen as it is sung
    background: "background.jpg",
    backgroundOpacity: 0.16,
    backgroundBlend: "soft-light",
    endingTitle: "Some moments are too beautiful to end.",
    endingSubtitle: "And this one is for you. ♡",

    lyrics: [
      // Verse 1
      { time: 13.0,  text: "가려진 오랜 시간이",                       rom: "garyeojin oraen shigani",                         en: "A long time hidden" },
      { time: 18.0,  text: "우리를 다시 불러와",                       rom: "urireul dashi bulleowa",                           en: "Brings us back" },
      { time: 25.0,  text: "어느 곳에 있어도",                         rom: "eoneu gose isseodo",                              en: "No matter where you are" },
      { time: 31.0,  text: "그 끝은 항상 너인걸",                       rom: "geu kkeucheun hangsang neoingeol",                 en: "The end is always you" },

      // Chorus 1
      { time: 45.0,  text: "'Cause I'm falling slowly in love with you" },
      { time: 50.0,  text: "오랫동안 기다려온 너는 봄이야",             rom: "oraetdong-an gidaryeoon neoneun bomiya",          en: "You, whom I've waited for so long, are spring" },
      { time: 56.5,  text: "'Cause I'm falling slowly in love with you" },
      { time: 63.0,  text: "다시 지워진다 해도, all my life is you",      rom: "dasi jiwonjinda haedo, all my life is you",        en: "Even if it's erased again, all my life is you" },

      // Verse 2
      { time: 120.0, text: "너라는 이야기 속에",                       rom: "neoraneun iyagi soge",                             en: "In the story of you" },
      { time: 125.0, text: "다시 또 꿈을 꾸는 나",                     rom: "dashi tto kkumeul kkuneun na",                    en: "I'm dreaming again" },
      { time: 130.0, text: "어떤 순간이 와도",                         rom: "eotteon sungani wado",                            en: "No matter what moment comes" },
      { time: 139.0, text: "난 너를 찾아 갈거야",                       rom: "nan neoreul chaja galgeoya",                       en: "I'm going to find you" },

      // Chorus 2
      { time: 153.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 159.0, text: "오랫동안 기다려온 너는 봄이야",             rom: "oraetdong-an gidaryeoon neoneun bomiya",          en: "You, whom I've waited for so long, are spring" },
      { time: 165.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 171.0, text: "다시 지워진다 해도, all my life is you",      rom: "dasi jiwonjinda haedo, all my life is you",        en: "Even if it's erased again, all my life is you" },

      // Bridge
      { time: 215.0, text: "꽃잎 날리던 하얀 길위에",                   rom: "kkot-ip nallideon hayan gil-wie",                  en: "On the white road where petals were flying" },
      { time: 222.0, text: "행복했던 너와 나 다시 만날 수 있다면",       rom: "haengbokhaessdeon neowa na dashi mannal su issdamyeon", en: "If you and I, who were happy, can meet again" },

      // Final Chorus
      { time: 241.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 247.0, text: "오랫동안 기다려온 너는 봄이야",             rom: "oraetdong-an gidaryeoon neoneun bomiya",          en: "You, whom I've waited for so long, are spring" },
      { time: 255.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 261.0, text: "다시 지워진다 해도, all my life is you",      rom: "dasi jiwonjinda haedo, all my life is you",        en: "Even if it's erased again, all my life is you" }
    ]
  },

  /* ------------------------------ PART 2 ------------------------------ */
  part2: {
    label: "Part 2",
    title: "Dito Sa'kin",
    artist: "Earl Agustin",
    audioSrc: "dito-sakin.mp3",
    startTime: 0,
    endTime: null,
    offset: 0.15,
    background: "background2.jpg",
    backgroundOpacity: 0.92,
    backgroundBlend: "normal",
    endingTitle: "Dito ka na lang. ♡",
    endingSubtitle: "Always, always for you.",
    fallbackDuration: 215,

    lyrics: [
      // Verse 1
      { time: 14.0, text: "Kung sino man ang nakapagparamdam" },
      { time: 17.6, text: "Sa iyo ng gan'yan" },
      { time: 21.2, text: "Sana naman ay matutunan niya" },
      { time: 24.8, text: "Na hindi basta lang" },
      { time: 28.4, text: "Ang iyong halaga, hah-hah" },
      { time: 32.0, text: "Para ganyanin ka, ah-ah" },
      { time: 35.6, text: "Laging binabalewala, ah" },
      { time: 39.2, text: "Siguro naman iyong napapansin" },
      { time: 42.8, text: "Kung paano tratuhin" },
      { time: 46.4, text: "Kung ako pa 'yan, 'di ka gagano'nin" },
      { time: 50.0, text: "At ika'y mamahalin" },
      { time: 53.6, text: "Na ng tama" },
      { time: 57.2, text: "At 'yong madarama, hah-hah" },
      { time: 60.8, text: "Na ika'y mahalaga, ooh" },

      // Chorus 1
      { time: 62.0, text: "'Di ka mahirap mahalin, hmm" },
      { time: 66.5, text: "Ikaw ang pangarap na ibigin" },
      { time: 71.0, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby, hmm" },
      { time: 75.5, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby, yeah" },

      // Verse 2
      { time: 82.0, text: "'Di pa ba sapat ang mga luha't" },
      { time: 85.8, text: "Sakit na nadarama?" },
      { time: 89.6, text: "Bakit pa kailangang magtiis" },
      { time: 93.4, text: "Kung hindi ka na masaya" },
      { time: 97.2, text: "Sa pagmamahal niya? Ah-hah" },
      { time: 101.0, text: "'Wag nang ipilit pa, hah-hah" },
      { time: 104.8, text: "Ang sarili sa kaniya, ooh" },

      // Chorus 2
      { time: 108.0, text: "'Di ka mahirap mahalin" },
      { time: 112.5, text: "Ikaw ang pangarap na ibigin" },
      { time: 117.0, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby" },
      { time: 121.5, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby, ooh" },

      // Chorus 3
      { time: 128.0, text: "'Di ka mahirap mahalin" },
      { time: 132.5, text: "Ikaw ang pangarap ibigin" },
      { time: 137.0, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby" },
      { time: 141.5, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby, ah" },

      // Bridge
      { time: 148.0, text: "Ooh, whoa, yeah, yeah" },

      // Chorus 4
      { time: 156.0, text: "'Di ka mahirap mahalin" },
      { time: 160.5, text: "Ikaw ang pangarap na ibigin" },
      { time: 165.0, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby" },
      { time: 169.5, text: "Sa 'kin ka na lang, sa 'kin ka na lang, oh, baby, yeah (sa 'kin ka na lang)" },

      // Final Chorus
      { time: 178.0, text: "'Di ako mahirap mahalin, ah" },
      { time: 182.5, text: "Ikaw ang pangarap na ibigin" },
      { time: 187.0, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby" },
      { time: 191.5, text: "Dito ka na lang, sa 'kin ka na lang, oh, baby, ooh, ah" }
    ]
  }
};

window.SONG_ORDER = ["part1", "part2"];
