
const admin = require('firebase-admin');

// GitHub Secret からサービスアカウント情報を読み込み
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateRanking() {
  try {
    console.log('集計を開始します...');

    // video_metrics から再生数上位10件を取得
    const snapshot = await db.collection('video_metrics')
      .orderBy('views', 'desc')
      .limit(10)
      .get();

    const top10List = [];
    snapshot.forEach(doc => {
      top10List.push({
        videoId: doc.id,
        views: doc.data().views || 0
      });
    });

    // rankings/popular ドキュメントを上書き
    await db.collection('rankings').doc('popular').set({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      list: top10List
    });

    console.log('rankings/popular の更新が完了しました！');
  } catch (error) {
    console.error('更新エラー:', error);
    process.exit(1);
  }
}

updateRanking();
