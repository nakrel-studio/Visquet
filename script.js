// --- 設定値（ビルド時にVercelで置換） ---
const API_KEY = "REPLACE_ME_WITH_API_KEY";
const UPD_KEY = "REPLACE_ME_WITH_UPD";
const PLAYLIST_ID = "TmP_mR9eFus";

// キャッシュの設定
const CACHE_KEY = 'visquet_video_cache';
const CACHE_TIME_KEY = 'visquet_last_fetch';
const TWENTY_HOURS = 20 * 60 * 60 * 1000;

// --- 1. 秘密の更新チェック ---
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('upd') === UPD_KEY) {
    localStorage.clear();
    alert("キャッシュをクリアしました。最新のリストを取得します。");
    window.location.href = window.location.origin + window.location.pathname;
}

// --- 2. YouTube IFrame API 読み込み ---
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

// --- 3. プラットフォームの初期化ロジック ---
async function initPlatform() {
    const now = new Date().getTime();
    const lastFetch = localStorage.getItem(CACHE_TIME_KEY);
    const savedData = localStorage.getItem(CACHE_KEY);

    // 20時間以内のキャッシュがあればそれを使う
    if (lastFetch && (now - lastFetch < TWENTY_HOURS) && savedData) {
        console.log("Using cached data");
        renderPlaylist(JSON.parse(savedData));
    } else {
        // キャッシュがない、または古い場合はAPIを叩く
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
            document.getElementById('video-title').innerText = "動画が見つかりませんでした (API Error)";
        }
    } catch (e) {
        console.error("API Fetch Error:", e);
    }
}

// --- 4. 画面への描画処理 ---
function renderPlaylist(items) {
    const listContainer = document.getElementById('playlist-items');
    listContainer.innerHTML = ''; // クリア

    items.forEach((item, index) => {
        const snippet = item.snippet;
        const videoId = snippet.resourceId.videoId;
        
        // リスト項目を作成
        const div = document.createElement('div');
        div.className = 'playlist-item'; // CSSでデザインしたクラス
        div.style.display = "flex";
        div.style.gap = "10px";
        div.style.marginBottom = "15px";
        div.style.cursor = "pointer";

        div.innerHTML = `
            <img src="${snippet.thumbnails.default.url}" style="width:120px; border-radius:8px;">
            <p style="font-size:14px; margin:0;">${snippet.title}</p>
        `;

        div.onclick = () => {
            player.loadVideoById(videoId);
            document.getElementById('video-title').innerText = snippet.title;
        };

        listContainer.appendChild(div);

        // 最初の動画を自動セット
        if (index === 0) {
            player.cueVideoById(videoId);
            document.getElementById('video-title').innerText = snippet.title;
        }
    });
}