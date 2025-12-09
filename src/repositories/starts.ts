import { admin, getDb } from '../services/firebase';

const db = getDb();
const STARTS_COLLECTION = 'starts';

type StartDoc = {
  telegramId: number;
  chatId?: number;
  name?: string;
  username?: string;
  languageCode?: string;
  source?: string;
  startedAt: admin.firestore.FieldValue;
};

async function saveStart(userId: number, data: Omit<StartDoc, 'telegramId' | 'startedAt'>) {
  const doc: StartDoc = {
    telegramId: userId,
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    ...data,
  };
  await db.collection(STARTS_COLLECTION).add(doc);
}

export { saveStart };

