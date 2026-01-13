process.env.DISCORDJS_WVOICE = 'false'; 

const http = require('http');
const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

// --- 💡 アプリケーションID ---
const APP_ID = '1447891267336802400'; 

// --- 🔧 クライアント設定 (エラー修正済) ---
const client = new Client({
  checkUpdate: false,
  syncStatus: true,
  // ログイン前にPCとして定義することでクラッシュを回避
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
  { songId: '2Jz14TeOoO7WpXAllHmLoT', albumId: '4gOKhDHtuTyma4MlJOgg6p', largeImageId: 'ab67616d0000b2733a2e5ec15ee327a3c82d057e', details: "Cat's Meow", state: '黒鉄たま (CV: 秋奈)' }
];

let currentIndex = 0;

async function updatePresence() {
  try {
    const song = songs[currentIndex];
    const ep = UNEXT_EPISODES[Math.floor(Math.random() * UNEXT_EPISODES.length)];
    const now = Date.now();

    // --- Spotify ---
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

    // --- U-NEXT (ボタンあり版) ---
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
      },
      // 💡 ボタンをここに追加
      buttons: [
        { label: '公式サイト', url: 'https://hikikomari.com/' }
      ]
    };

    await client.user.setPresence({
      activities: [spotifyData, unextData],
      status: 'online'
    });

    console.log(`[INFO] 更新: ${song.details} / ${ep.details}`);
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
