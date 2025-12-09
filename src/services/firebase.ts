import admin from 'firebase-admin';
import config from '../config';

let app: admin.app.App | null = null;

function getApp(): admin.app.App {
  if (!app) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
  }
  return app;
}

function getDb(): admin.firestore.Firestore {
  return getApp().firestore();
}

export { admin, getDb };

