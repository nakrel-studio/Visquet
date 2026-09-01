const admin = require('firebase-admin');

// GitHub Secrets からサービスアカウント情報を取得
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateTrendingRanking() {
  try {
    console.log('急上昇ランキングの集計を開始します...');

    // 直近3週間（21日）前の日時を算出
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    // 直近3週間以内に更新があり、再生数が多い上位5件を取得
    const snapshot = await db.collection('video_metrics')
      .where('lastUpdatedAt', '>=', threeWeeksAgo)
      .orderBy('lastUpdatedAt', 'desc')
      .orderBy('views', 'desc')
      .limit(5)
      .get();

    const trendingList = [];
    snapshot.forEach(doc => {
      trendingList.push({
        videoId: doc.id,
        views: doc.data().views || 0
      });
    });

    // rankings/trending ドキュメントへ保存
    await db.collection('rankings').doc('trending').set({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      list: trendingList
    });

    console.log('rankings/trending の更新が完了しました！');
  } catch (error) {
    console.error('急上昇更新エラー:', error);
    process.exit(1);
  }
}

updateTrendingRanking();
