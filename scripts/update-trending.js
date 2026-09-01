
const admin = require('firebase-admin');

// サービスアカウントキーの取得と安全なパース
const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountRaw) {
  console.error("FIREBASE_SERVICE_ACCOUNT is not defined.");
  process.exit(1);
}

const serviceAccount = typeof serviceAccountRaw === 'string' 
  ? JSON.parse(serviceAccountRaw) 
  : serviceAccountRaw;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
