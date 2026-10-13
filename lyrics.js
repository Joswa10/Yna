/* ==========================================================================
   SPRING SNOW + DITO SA'KIN — song settings + lyrics
   This is the ONLY file you need to edit to change a song, its lyrics or timing.

   Every song ("part") has:
     audioSrc    path to the mp3 (relative to index.html)
     startTime   second where the lyrics/progress bar begin (0 = very start)
     endTime     second where it ends. null = play to the end of the file
     offset      fine-tune sync in seconds. +0.3 shows lyrics 0.3s EARLIER,
                 -0.3 shows them 0.3s LATER
     background  optional photo that is blended over the sunset (null = pure CSS)
     lyrics      [{ time, text, rom?, en? }]  time = seconds in the ORIGINAL file

   HOW TO SYNC EXACTLY (about 4 minutes per song):
     1. Open the site with  ?sync  on the end, e.g.  http://localhost:8000/?sync
     2. Press play and hit the  M  key (or the Mark button) the instant each
        line begins. A ready-to-paste array appears in the little panel.
     3. Paste it over the `lyrics:` array of that song below. Done.
        (For Part 2 you can paste the lyrics into the panel first — see README
        notes in the chat.)
   ========================================================================== */

window.SONGS = {

  /* ------------------------------ PART 1 ------------------------------ */
  part1: {
    label: "Part 1",
    title: "Spring Snow",
    audioSrc: "spring-snow.mp3",
    startTime: 0,
    endTime: null,            // full track (3:37)
    offset: 0.15,             // small lead so a line is on screen as it is sung
    background: "background.jpg",
    backgroundOpacity: 0.16,
    backgroundBlend: "soft-light",
    endingTitle: "Some moments are too beautiful to end.",
    endingSubtitle: "And this one is for you. ♡",

    // !! Times are ESTIMATES from the song's energy/structure — run ?sync once
    // !! to lock them to the exact second each line is sung.
    lyrics: [
      // Verse 1
      { time: 11.0,  text: "긴 밤이 지나고 그대 마음에",   rom: "gin bami jinago geudae ma eume",       en: "After the long night passes, inside your heart" },
      { time: 19.0,  text: "내가 조금씩 스며든다면",        rom: "naega jogeumsiik seumyeodeundamyeon", en: "If I slowly soak in bit by bit" },
      { time: 26.0,  text: "두 손을 꼭 잡고 어디든 갈 텐데", rom: "du soneul ggok japgo eodideun gal tende", en: "I would hold your two hands tightly and go anywhere" },
      { time: 33.0,  text: "스쳐 지나가는 저 바람처럼",     rom: "seuchyeo jinaganeun jeo baramcheoreom", en: "Like that wind passing by" },

      // Chorus
      { time: 44.0,  text: "'Cause I'm falling slowly in love with you" },
      { time: 50.0,  text: "오랫동안 기다려온 너는 봄이야", rom: "oraetdong-an gidaryeoon neoneun bomiya", en: "You, whom I've waited for so long, are spring" },
      { time: 56.5,  text: "'Cause I'm falling slowly in love with you" },
      { time: 63.0,  text: "다시 지워진다 해도 All my life is you", rom: "dasi jiwonjinda haedo All my life is you", en: "Even if it's erased again, all my life is you" },

      // Verse 2
      { time: 75.0,  text: "아득해진 기억 그 언젠가에",     rom: "adeukhaejin gi eok geu eonjengae",     en: "In those distant memories from back then" },
      { time: 81.0,  text: "너는 나를 향해 웃고 있었고",    rom: "neoneun nareul hyanghae utgo isseotgo", en: "You were smiling toward me" },
      { time: 87.0,  text: "그렇게 또 나의 세상이 되어서",  rom: "geureokhe tto nae ui sesang-i doe-eoseo", en: "And just like that, becoming my world" },
      { time: 92.5,  text: "하얗게 눈이 내리던 그날처럼",   rom: "hayakhe nuni naeridon geunalcheoreom", en: "Like that day when white snow fell" },

      // Chorus
      { time: 98.5,  text: "'Cause I'm falling slowly in love with you" },
      { time: 104.5, text: "오랫동안 기다려온 너는 봄이야", rom: "oraetdong-an gidaryeoon neoneun bomiya", en: "You, whom I've waited for so long, are spring" },
      { time: 111.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 117.5, text: "다시 지워진다 해도 All my life is you", rom: "dasi jiwonjinda haedo All my life is you", en: "Even if it's erased again, all my life is you" },

      // Bridge
      { time: 124.0, text: "나를 감싸준 따스한 볕처럼",     rom: "nareul gamssajun ttaseuhan byeotcheoreom", en: "Like the warm sunlight wrapping around me" },
      { time: 131.0, text: "어느새 나의 맘을 덮어 버린 너", rom: "eoneuse nae ui mameul deopeo beorin neo", en: "Before I knew it, you covered my heart" },
      { time: 138.0, text: "모든 게 다 멈춘 이 순간에도",   rom: "modeun ge da meomchun i sung-anedo",   en: "Even in this moment where everything stops" },

      // Final chorus + outro
      { time: 144.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 151.0, text: "오랫동안 기다려온 너는 봄이야", rom: "oraetdong-an gidaryeoon neoneun bomiya", en: "You, whom I've waited for so long, are spring" },
      { time: 159.0, text: "'Cause I'm falling slowly in love with you" },
      { time: 168.0, text: "다시 지워진다 해도 All my life is you", rom: "dasi jiwonjinda haedo All my life is you", en: "Even if it's erased again, all my life is you" },
      { time: 180.0, text: "All my life is you" }
    ]
  },

  /* ------------------------------ PART 2 ------------------------------ */
  part2: {
    label: "Part 2",
    title: "Dito Sa'kin",
    artist: "Earl Agustin",
    audioSrc: "dito-sakin.mp3",      // <- put your mp3 next to index.html with this name
    startTime: 0,
    endTime: null,                   // full-length song
    offset: 0.15,
    background: "background2.jpg",   // <- put your warm photo here (optional)
    backgroundOpacity: 0.92,
    backgroundBlend: "normal",   // your sunset illustration shows as-is, with a warm glow on top
    endingTitle: "Dito ka na lang. ♡",
    endingSubtitle: "Always, always for you.",
    fallbackDuration: 240,           // only used until the mp3 reports its real length

    // Paste the synced lyrics here. Until then the page shows a friendly
    // placeholder line, and the ?sync panel lets you paste the lyrics and
    // tap through them to get exact times.
    lyrics: []
  }
};

window.SONG_ORDER = ["part1", "part2"];
