// --- 設定値（ビルド時にVercelの環境変数で書き換えます） ---
const API_KEY = "REPLACE_ME_WITH_API_KEY";
const PLAYLIST_ID = "PL_TmP_mR9eFus9W7vW-6y0P_L0fVqIuW6"; 

// YouTube API 読み込み
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%', width: '100%',
        playerVars: { 'rel': 0 },
        events: { 'onReady': fetchFromYouTube }
    });
}

async function fetchFromYouTube() {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items) {
            renderPlaylist(data.items);
        } else {
            document.getElementById('video-title').innerText = "APIキーの設定を確認してください";
        }
    } catch (e) { console.error(e); }
}

function renderPlaylist(items) {
    const listContainer = document.getElementById('playlist-items');
    listContainer.innerHTML = '';
    items.forEach((item, index) => {
        const snippet = item.snippet;
        const videoId = snippet.resourceId.videoId;
        const div = document.createElement('div');
        div.style.cssText = "display:flex; gap:10px; margin-bottom:12px; cursor:pointer; padding:5px; align-items:center; border-bottom:1px solid #333;";
        div.innerHTML = `
            <img src="${snippet.thumbnails.default.url}" style="width:80px; border-radius:4px;">
            <p style="font-size:12px; margin:0; color:#fff;">${snippet.title}</p>
        `;
        div.onclick = () => {
            player.loadVideoById(videoId);
            document.getElementById('video-title').innerText = snippet.title;
        };
        listContainer.appendChild(div);
        if (index === 0) {
            player.cueVideoById(videoId);
            document.getElementById('video-title').innerText = snippet.title;
        }
    });
}
