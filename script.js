// --- 設定値（ビルド時にVercelで置換されます） ---
const API_KEY = "REPLACE_ME_WITH_API_KEY";
const UPD_KEY = "REPLACE_ME_WITH_UPD";
const PLAYLIST_ID = "TmP_mR9eFus";

// キャッシュの設定
const CACHE_KEY = 'visquet_video_cache';
const CACHE_TIME_KEY = 'visquet_last_fetch';
const TWENTY_HOURS = 20 * 60 * 60 * 1000;

// 1. 秘密の更新機能
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('upd') === UPD_KEY) {
    localStorage.clear();
    alert("キャッシュをクリアしました。最新のリストを取得します。");
    window.location.href = window.location.origin + window.location.pathname;
}

// 2. YouTube IFrame API 読み込み
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        playerVars: { 'rel': 0 },
        events: { 'onReady': initPlatform }
    });
}

// 3. 初期化（キャッシュがあれば使い、なければAPIを叩く）
async function initPlatform() {
    const now = new Date().getTime();
    const lastFetch = localStorage.getItem(CACHE_TIME_KEY);
    const savedData = localStorage.getItem(CACHE_KEY);

    if (lastFetch && (now - lastFetch < TWENTY_HOURS) && savedData) {
        console.log("Using cached data");
        renderPlaylist(JSON.parse(savedData));
    } else {
        fetchFromYouTube();
    }
}

async function fetchFromYouTube() {
    console.log("Fetching from YouTube API...");
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.items));
            localStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString());
            renderPlaylist(data.items);
        } else {
            console.error("API Error Response:", data);
            document.getElementById('video-title').innerText = "動画が見つかりませんでした (API Error)";
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

// 4. 画面に表示
function renderPlaylist(items) {
    const listContainer = document.getElementById('playlist-items');
    listContainer.innerHTML = '';

    items.forEach((item, index) => {
        const snippet = item.snippet;
        const videoId = snippet.resourceId.videoId;
        
        const div = document.createElement('div');
        div.className = 'playlist-item';
        div.style.cssText = "display:flex; gap:10px; margin-bottom:12px; cursor:pointer; padding:5px;";

        div.innerHTML = `
            <img src="${snippet.thumbnails.default.url}" style="width:100px; border-radius:4px;">
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
