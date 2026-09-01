// Firestore側での複合ソート（orderByの複数指定）をやめ、全件取得する
const snapshot = await db.collectionGroup('video_metrics').get();

// JavaScript側でフィルタリングとソートを実行する
const trendingVideos = snapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  // 日付の絞り込み（必要に応じて）
  .filter(video => video.lastUpdatedAt && new Date(video.lastUpdatedAt) >= startDate)
  // views（再生数）の降順でソート
  .sort((a, b) => (b.views || 0) - (a.views || 0))
  // 上位ランキング件数分を切り出し
  .slice(0, 100);
