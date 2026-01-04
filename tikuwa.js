process.env.DISCORDJS_WVOICE = 'false'; 

const http = require('http');
require('dotenv').config();

// 💡 読み込みエラーを無視して強引に Client だけ取り出す
const { Client } = require('discord.js-selfbot-v13');
// RPCが無理なら手書きに切り替えるための保険
let SpotifyRPC;
try {
  SpotifyRPC = require('discord.js-selfbot-rpc').SpotifyRPC;
} catch (e) {
  SpotifyRPC = null;
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

async function updatePresence() {
  try {
    const song = songs[currentIndex];
    const ep = UNEXT_EPISODES[Math.floor(Math.random() * UNEXT_EPISODES.length)];

    let spotifyData;
    if (SpotifyRPC) {
      const spotify = new SpotifyRPC(client)
        .setAssetsLargeImage(`spotify:${song.largeImageId}`)
        .setAssetsSmallImage('spotify:ab6761610000f178049d8aeae802c96c8208f3b7')
        .setDetails(song.details)
        .setState(song.state)
        .setSongId(song.songId)
        .setAlbumId(song.albumId);
      spotifyData = spotify.toData();
    } else {
      // 💡 もしライブラリがなくても手書きで Spotify を再現（最強の予備策）
      spotifyData = {
        name: 'Spotify',
        type: 2,
        flags: 1,
        details: song.details,
        state: song.state,
        sync_id: song.songId,
        metadata: { album_id: song.albumId },
        assets: {
          large_image: `spotify:${song.largeImageId}`,
          small_image: 'spotify:ab6761610000f178049d8aeae802c96c8208f3b7'
        },
        party: { id: `spotify:${client.user.id}` }
      };
    }

    const now = Date.now();
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
        start: now - (5 * 60 * 1000),
        end: now + (19 * 60 * 1000)
      }
    };

    await client.user.setPresence({
      activities: [spotifyData, unextData],
      status: 'online'
    });

    console.log(`[INFO] 更新: ${song.details}`);
    currentIndex = (currentIndex + 1) % songs.length;
  } catch (err) {
    console.error('[ERROR]', err);
  }
}

setInterval(updatePresence, 30000);

http.createServer((req, res) => res.end('OK')).listen(process.env.PORT || 8080);

client.once('ready', () => {
  console.log(`[READY] Logged in as ${client.user.tag}`);
  updatePresence();
});

client.login(process.env.DISCORD_TOKEN);
