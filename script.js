// --- 設定値（Vercelで置換されます） ---
const API_KEY = "REPLACE_ME_WITH_API_KEY";
const UPD_KEY = "REPLACE_ME_WITH_UPD";
const PLAYLIST_ID = "PL_TmP_mR9eFus9W7vW-6y0P_L0fVqIuW6"; 

// ※ PLAYLIST_IDをフル形式に修正しました

// 2. YouTube API 読み込み
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
    // API_KEYが正しく置換されているか確認するためのデバッグ
    console.log("Key Length Check:", API_KEY.length);
    
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items) {
            renderPlaylist(data.items);
        } else {
            console.error("API Error Response:", data);
            document.getElementById('video-title').innerText = "API Error: リストを取得できませんでした";
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

function renderPlaylist(items) {
    const listContainer = document.getElementById('playlist-items');
    listContainer.innerHTML = '';
    items.forEach((item, index) => {
        const snippet = item.snippet;
        const videoId = snippet.resourceId.videoId;
        const div = document.createElement('div');
        div.style.cssText = "display:flex; gap:10px; margin-bottom:12px; cursor:pointer; padding:5px; align-items:center;";
        div.innerHTML = `
            <img src="${snippet.thumbnails.default.url}" style="width:80px; border-radius:4px;">
            <p style="font-size:12px; margin:0;">${snippet.title}</p>
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
