const { Client, SpotifyRPC } = require('discord.js-selfbot-v13');
require('dotenv').config();

// 環境変数の確認
if (!process.env.DISCORD_TOKEN) {
  console.error('エラー: .envファイルにDISCORD_TOKENが定義されていません。');
  process.exit(1);
}

// クライアントの設定
const client = new Client({
  syncStatus: false,
});

// 複数の曲情報を定義（largeImageIdを含む）
const songs = [
  {
    songId: '2jt59rxHFcoZpW73XjOjLJ',
    albumId: '3XXE2RELSxhwcvrGgjDHtd',
    largeImageId: 'ab67706c0000da84c0052dc7fb523a68affdb8f7', // 地方創生☆チクワクティクス
    state: '芽兎めう (日向美ビタースイーツ♪)',
    details: '地方創生☆チクワクティクス',
    artistIds: ['5Ys6fi9S8rdaw2YKYenVpe'],
  },
  {
    songId: '3btKs4ln57kQ46ALWdsvYi',
    albumId: '5FWUjYrzJ819QM9JwYm2oq',
    largeImageId: 'ab67706c0000da84abeeaae7c11c3455bc45d603', // めうめうぺったんたん
    state: '芽兎めう (日向美ビタースイーツ♪)',
    details: 'めうめうぺったんたん',
    artistIds: ['5Ys6fi9S8rdaw2YKYenVpe'],
  },
];

// Spotifyステータスを設定する関数
async function setSpotifyStatus(client, song) {
  const spotify = new SpotifyRPC(client)
    .setAssetsLargeImage(`spotify:${song.largeImageId}`)
    .setAssetsSmallImage('spotify:ab6761610000f178049d8aeae802c96c8208f3b7')
    .setAssetsLargeText(song.details) // 曲ごとに異なるLarge Text
    .setState(song.state)
    .setDetails(song.details)
    .setStartTimestamp(Date.now())
    .setEndTimestamp(Date.now() + 1000 * (3 * 60 + 30)) // 3分30秒
    .setSongId(song.songId)
    .setAlbumId(song.albumId)
    .setArtistIds(song.artistIds);

  client.user.setActivity(spotify);
  console.log(`Spotify風ステータスを設定しました: ${song.details} (Large Image ID: ${song.largeImageId})`);
}

// ステータスをリピートする関数
async function startStatusLoop(client) {
  const duration = 1000 * (3 * 60 + 30); // 3分30秒（ミリ秒）
  let currentSongIndex = 0;

  // 初回設定
  await setSpotifyStatus(client, songs[currentSongIndex]);

  // 3分30秒ごとに曲を切り替え
  setInterval(async () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length; // 次の曲に進む（最後なら最初に戻る）
    await setSpotifyStatus(client, songs[currentSongIndex]);
    console.log('ステータスをリピートしました');
  }, duration);
}

// 準備完了イベント
client.once('ready', () => {
  console.log(`${client.user.tag}としてログインしました`);
  console.log('使用する最初のLarge Image ID:', songs[0].largeImageId); // 初回ターミナルに出力

  // ステータスループを開始
  startStatusLoop(client).catch((error) => {
    console.error('ステータスループの開始に失敗しました:', error);
  });
});

// エラー処理
client.on('error', (error) => {
  console.error('クライアントでエラーが発生しました:', error);
});

// Discordにログイン
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('ログインに失敗しました:', error);
  process.exit(1);
});