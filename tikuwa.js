const http = require('http');
const { Client, SpotifyRPC } = require('discord.js-selfbot-v13');
require('dotenv').config();

// HTTPサーバー（Northflankヘルスチェック用）
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
});
server.listen(process.env.PORT || 8080, () => {
  log('INFO', `HTTP server running on port ${process.env.PORT || 8080}`);
});

// ログ関数
function log(level, message, data = {}) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...data }));
}

// 環境変数の確認
if (!process.env.DISCORD_TOKEN) {
  log('FATAL', '必要な環境変数が未設定です', {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN ? '設定済み' : '未設定',
  });
  process.exit(1);
}

// Discordクライアントの初期化
const client = new Client({
  syncStatus: false,
});

// Spotifyステータスの曲データ
const songs = [
  {
    songId: '2jt59rxHFcoZpW73XjOjLJ',
    albumId: '3XXE2RELSxhwcvrGgjDHtd',
    largeImageId: 'ab67706c0000da84c0052dc7fb523a68affdb8f7',
    state: '芽兎めう (日向美ビタースイーツ♪)',
    details: '地方創生☆チクワクティクス',
    artistIds: ['5Ys6fi9S8rdaw2YKYenVpe'],
  },
  {
    songId: '3btKs4ln57kQ46ALWdsvYi',
    albumId: '5FWUjYrzJ819QM9JwYm2oq',
    largeImageId: 'ab67706c0000da84abeeaae7c11c3455bc45d603',
    state: '芽兎めう (日向美ビタースイーツ♪)',
    details: 'めうめうぺったんたん',
    artistIds: ['5Ys6fi9S8rdaw2YKYenVpe'],
  },
];

// Spotifyステータス設定関数
async function setSpotifyStatus(client, song) {
  try {
    const spotify = new SpotifyRPC(client)
      .setAssetsLargeImage(`spotify:${song.largeImageId}`)
      .setAssetsSmallImage('spotify:ab6761610000f178049d8aeae802c96c8208f3b7')
      .setAssetsLargeText(song.details)
      .setState(song.state)
      .setDetails(song.details)
      .setStartTimestamp(Date.now())
      .setEndTimestamp(Date.now() + 1000 * (3 * 60 + 30))
      .setSongId(song.songId)
      .setAlbumId(song.albumId)
      .setArtistIds(song.artistIds);
    client.user.setActivity(spotify);
    log('INFO', `Spotifyステータスを設定: ${song.details}`);
  } catch (error) {
    log('ERROR', 'Spotifyステータス設定失敗', { error: error.message });
  }
}

// ステータスループ
async function startStatusLoop(client) {
  const duration = 1000 * (3 * 60 + 30); // 3分30秒
  let currentSongIndex = 0;
  await setSpotifyStatus(client, songs[currentSongIndex]);
  setInterval(async () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    await setSpotifyStatus(client, songs[currentSongIndex]);
  }, duration);
}

// クライアント準備完了イベント
client.once('ready', () => {
  log('DEBUG', `ボット起動！ ユーザー: ${client.user.tag}`);
  startStatusLoop(client).catch((error) => {
    log('ERROR', 'ステータスループ開始失敗', { error: error.message });
  });
});

// エラー処理
client.on('error', (error) => {
  log('ERROR', 'クライアントエラー', { error: error.message });
});

// ログイン
log('INFO', 'Discordログイン開始');
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  log('FATAL', 'ログイン失敗', { error: error.message, code: error.code });
  process.exit(1);
});

// プロセス維持
setInterval(() => {
  log('INFO', 'プロセス稼働中');
}, 60000);

process.on('SIGTERM', () => {
  log('INFO', 'SIGTERM received. Closing client...');
  client.destroy();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log('FATAL', 'Uncaught Exception', { error: error.message });
});

process.on('warning', (warning) => {
  log('WARN', 'プロセス警告', { warning: warning.message });
});
