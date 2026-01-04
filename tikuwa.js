/**
 * =========================================================
 * Meumeu Ultra Presence System (Error-Proof Version)
 * 依存関係エラーを自動回避するサイキョーコード
 * =========================================================
 */

const http = require('http');
require('dotenv').config();

// --- 💡 依存関係の二段構えチェック ---
let Client, SpotifyRPC;
try {
  const sbot = require('discord.js-selfbot-v13');
  Client = sbot.Client;
  // v13本体に含まれている場合と、別パッケージの場合の両方に対応
  SpotifyRPC = sbot.SpotifyRPC || require('discord.js-selfbot-rpc').SpotifyRPC;
} catch (e) {
  console.error("ライブラリの読み込みに失敗しました。package.jsonを確認してください。");
  process.exit(1);
}

const client = new Client({
  ws: { properties: { $browser: 'Discord iOS' } },
  syncStatus: true,
  checkUpdate: false
});

// --- DATA ---
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
let rotateTimer = null;

async function updatePresence() {
  try {
    const song = songs[currentIndex];
    const ep = UNEXT_EPISODES[Math.floor(Math.random() * UNEXT_EPISODES.length)];

    // Spotify Activity
    const spotify = new SpotifyRPC(client)
      .setAssetsLargeImage(`spotify:${song.largeImageId}`)
      .setAssetsSmallImage('spotify:ab6761610000f178049d8aeae802c96c8208f3b7')
      .setDetails(song.details)
      .setState(song.state)
      .setSongId(song.songId)
      .setAlbumId(song.albumId);

    const spotifyData = typeof spotify.toData === 'function' ? spotify.toData() : spotify;
    spotifyData.flags = 1;

    // U-NEXT Activity (シークバー表示あり)
    const now = Date.now();
    const totalAnimeTime = 24 * 60 * 1000;
    const randomElapsed = Math.floor(Math.random() * 18 * 60 * 1000);

    const unextData = {
      name: 'U-NEXT',
      type: 3,
      application_id: process.env.APPLICATION_ID,
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

    console.log(`[INFO] 更新成功: ${song.details}`);

    if (rotateTimer) clearTimeout(rotateTimer);
    rotateTimer = setTimeout(() => {
      currentIndex = (currentIndex + 1) % songs.length;
      updatePresence();
    }, 30000);

  } catch (err) {
    console.error('[ERROR]', err);
    setTimeout(updatePresence, 5000);
  }
}

const PORT = process.env.PORT || 8080;
http.createServer((req, res) => { res.writeHead(200); res.end('Meumeu Active'); }).listen(PORT, '0.0.0.0');

client.once('ready', () => {
  console.log(`[READY] Logged in as ${client.user.tag}`);
  updatePresence();
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
