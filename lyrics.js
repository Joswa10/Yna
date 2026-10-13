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

    // Sync instructions: Open http://localhost:8000/?sync and hit 'M' to lock timing.
    lyrics: [
      // Verse 1
      { time: 11.0,  text: "긴 밤이 지나고 그대 마음에",          rom: "gin bami jinago geudae ma eume",         en: "After the long night passes, in your heart" },
      { time: 18.0,  text: "내가 조금씩 스며든다면",              rom: "naega jogeumsiik seumyeodeundamyeon",     en: "If I slowly seep in bit by bit" },
      { time: 25.0,  text: "두 손을 꼭 잡고 어디든 갈 텐데",      rom: "du soneul ggok japgo eodideun gal tende",   en: "I would hold your hands tight and go anywhere" },
      { time: 32.0,  text: "스쳐 지나가는 저 바람처럼",            rom: "seuchyeo jinaganeun jeo baramcheoreom",   en: "Like the wind passing by" },

      // Pre-Chorus 1
      { time: 38.0,  text: "어느새 내 맘에 조용히 내려앉아",       rom: "eoneuse nae mame joyonghi naeryeoanja",  en: "Before I knew it, quietly settling in my heart" },
      { time: 43.5,  text: "나를 미소 짓게 만드니까",              rom: "nareul miso jitge mandeunikka",          en: "Because you make me smile" },

      // Chorus 1
      { time: 49.0,  text: "'Cause I'm falling slowly in love with you" },
      { time: 55.0,  text: "오랫동안 기다려온 너는 봄이야",        rom: "oraetdong-an gidaryeoon neoneun bomiya", en: "You, whom I've waited for so long, are spring" },
      { time: 62.0,  text: "'Cause I'm falling slowly in love with you" },
      { time: 68.0,  text: "다시 지워진다 해도 All my life is you",  rom: "dasi jiwonjinda haedo All my life is you",en: "Even if it's erased again, all my life is you" },

      // Verse 2
      { time: 82.0,  text: "아득해진 기억 그 언젠가에",            rom: "adeukhaejin gi eok geu eonjengae",        en: "In those distant memories from back then" },
      { time: 89.0,  text: "너는 나를 향해 웃고 있었고",          rom: "neoneun nareul hyanghae utgo isseotgo",   en: "You were smiling toward me" },
      { time: 96.0,  text: "그렇게 또 나의 세상이 되어서",        rom: "geureokhe tto nae ui sesang-i doe-eoseo", en: "And just like that, becoming my world" },
      { time: 103.0, text: "하얗게 눈이 내리던 그날처럼",          rom: "hayakhe nuni naeridon geunalcheoreom",    en: "Like that day when white snow fell" },

      // Pre-Chorus 2
      { time: 109.0, text: "어느새 내 맘에 조용히 내려앉아",       rom: "eoneuse nae mame joyonghi naeryeoanja",  en: "Before I knew it, quietly settling in my heart" },
      { time: 114.5, text: "나를 미소 짓게 만드니까",              rom: "nareul miso jitge mandeunikka",          en: "Because you make me smile" },

      // Chorus 2
      { time: 120.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 126.0, text: "오랫동안 기다려온 너는 봄이야",        rom: "oraetdong-an gidaryeoon neoneun bomiya", en: "You, whom I've waited for so long, are spring" },
      { time: 133.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 139.0, text: "다시 지워진다 해도 All my life is you",  rom: "dasi jiwonjinda haedo All my life is you",en: "Even if it's erased again, all my life is you" },

      // Bridge
      { time: 153.0, text: "나를 감싸준 따스한 볕처럼",            rom: "nareul gamssajun ttaseuhan byeotcheoreom",en: "Like the warm sunlight wrapping around me" },
      { time: 160.0, text: "어느새 나의 맘을 덮어 버린 너",        rom: "eoneuse nae ui mameul deopeo beorin neo",en: "Before I knew it, you covered my heart" },
      { time: 167.0, text: "모든 게 다 멈춘 이 순간에도",          rom: "modeun ge da meomchun i sung-anedo",     en: "Even in this moment where everything stops" },

      // Chorus 3 / Outro
      { time: 174.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 180.0, text: "오랫동안 기다려온 너는 봄이야",        rom: "oraetdong-an gidaryeoon neoneun bomiya", en: "You, whom I've waited for so long, are spring" },
      { time: 187.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 193.0, text: "다시 지워진다 해도 All my life is you",  rom: "dasi jiwonjinda haedo All my life is you",en: "Even if it's erased again, all my life is you" },
      { time: 205.0, text: "All my life is you" }
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
