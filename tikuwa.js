process.env.DISCORDJS_WVOICE = 'false'; 

const http = require('http');
const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

// --- 💡 アプリケーションID ---
const APP_ID = '1447891267336802400'; 

// --- 🔧 修正: iOS偽装を削除し、PC(Windows)として設定 ---
const client = new Client({
  checkUpdate: false,
  syncStatus: true,
  ws: {
    properties: {
      $os: 'Windows',
      $browser: 'Discord Client',
      $device: 'Discord Client'
    }
  }
});

const UNEXT_EPISODES = [
  { id: '1457346793753804925', details: 'ひきこまり吸血鬼の悶々 第1話', state: '「引きこもり吸血鬼、外に出る」──烈核解放' },
  { id: '1457346793041035337', details: 'ひきこまり吸血鬼の悶々 第4話', state: '「孤高の吸血姫」──烈核解放' },
  { id: '1457346796886954128', details: 'ひきこまり吸血鬼の悶々 第12話', state: '「黄金の微睡み」──烈核解放' }
];

const songs = [
  { songId: '3btKs4ln57kQ46ALWdsvYi', albumId: '5FWUjYrzJ819QM9JwYm2oq', largeImageId: 'ab67706c0000da84abeeaae7c11c3455bc45d603', details: 'めうめうぺったんたん！！', state: '芽兎めう (日向美ビタースイーツ♪)' },
  { songId: '2jt59rxHFcoZpW73XjOjLJ', albumId: '3XXE2RELSxhwcvrGgjDHtd', largeImageId: 'ab67706c0000da84c0052dc7fb523a68affdb8f7', details: '地方創生☆チクワクティクス', state: '芽兎めう (日向美ビタースイーツ♪)' },
  { songId: '2Jz14TeOoO7WpXAllHmLoT', albumId: '4gOKhDHtuTyma4MlJOgg6p', largeImageId: 'ab67616d0000b2733a2e5ec15ee327a3c82d057e', details: "Cat's Meow", state: '黒鉄たま (CV: 秋奈)' },
  { songId: '5v5CodfWGLTUEki4ffiH6R', albumId: '1JKkF3lHBSqlaCGrVWNu0F', largeImageId: 'ab67616d0000b273021c9f2bf2063de7411015cb', details: 'カウントダウンラブ - Off Vocal', state: "I'm a Cutie Finder" },
  { songId: '4hyZBYXl4RVRh9yZ1UqVBl', albumId: '1JKkF3lHBSqlaCGrVWNu0F', largeImageId: 'ab67616d0000b273021c9f2bf2063de7411015cb', details: 'KAWAII♡めたもる交響曲 - Game Size', state: "I'm a Cutie Finder" },
  { songId: '76GAKLQoyG4129aRnbgs6e', albumId: '5VturOz14q5HPscCAAXquX', largeImageId: 'ab67616d0000b273b32a6d4bfc35db6096a34183', details: 'ルピラ', state: 'アルストロメリア' },
  { songId: '6pw3NHEm4q0XYmj98ikWvX', albumId: '5D8XL4PWEuwBy7RjzgQdl6', largeImageId: 'ab67616d0000b273b48ecf9292bd42c0b88d246e', details: 'キラピコ.exe', state: 'HO-KA-GO CLIMAX GIRLS' },
  { songId: '03ihlQGMBrQrOPkBiIXqy1', albumId: '25jyF9Awrh8pOMZvQGgH5O', largeImageId: 'ab67616d0000b273bba5daa38846449940babdbe', details: '迅雷鉄火', state: 'HO-KA-GO CLIMAX GIRLS; Straylight' }
];

let currentIndex = 0;

async function updatePresence() {
  try {
    const song = songs[currentIndex];
    const ep = UNEXT_EPISODES[Math.floor(Math.random() * UNEXT_EPISODES.length)];
    const now = Date.now();

    // --- Spotify (ボタンあり、シークバーなし) ---
    const spotifyData = {
      name: 'Spotify',
      type: 2, 
      flags: 48, 
      details: song.details,
      state: song.state,
      sync_id: song.songId,
      metadata: { 
        album_id: song.albumId,
        context_uri: `spotify:album:${song.albumId}` 
      },
      assets: {
        large_image: `spotify:${song.largeImageId}`,
        small_image: 'spotify:ab6761610000f178049d8aeae802c96c8208f3b7',
        large_text: song.details
      },
      party: { id: `spotify:${client.user.id}` }
    };

    // --- U-NEXT (シークバーあり) ---
    const totalAnimeTime = 24 * 60 * 1000;
    const randomElapsed = Math.floor(Math.random() * 18 * 60 * 1000);

    const unextData = {
      name: 'U-NEXT',
      type: 3, 
      application_id: APP_ID, 
      details: ep.details,
      state: ep.state,
      assets: {
        large_image: ep.id, 
        small_image: '1457346948989321384',
        large_text: '烈核解放中'
      },
      timestamps: {
        start: now - randomElapsed,
        end: now - randomElapsed + totalAnimeTime
      }
    };

    await client.user.setPresence({
      activities: [spotifyData, unextData],
      status: 'online'
    });

    console.log(`[INFO] 更新: ${song.details} (ID: ${APP_ID})`);
    currentIndex = (currentIndex + 1) % songs.length;

  } catch (err) {
    console.error('[ERROR]', err);
  }
}

setInterval(updatePresence, 30000);

const PORT = process.env.PORT || 8080;
http.createServer((req, res) => res.end('Meumeu Active')).listen(PORT);

client.once('ready', () => {
  console.log(`[READY] Logged in as ${client.user.tag}`);
  updatePresence();
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
