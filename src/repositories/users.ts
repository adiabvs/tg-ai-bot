import type { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getDb } from '../services/firebase';

const db = getDb();
const USERS_COLLECTION = 'users';

export type UserDoc = {
  name?: string;
  username?: string;
  phoneNumber?: string;
  telegramId?: number;
  sharedAt?: FieldValue | Timestamp;
  startedAt?: FieldValue | Timestamp;
};

async function saveUser(userId: number, data: UserDoc): Promise<void> {
  await db.collection(USERS_COLLECTION).doc(String(userId)).set(data, { merge: true });
}

async function getUser(userId: number): Promise<UserDoc | null> {
  const snap = await db.collection(USERS_COLLECTION).doc(String(userId)).get();
  return snap.exists ? (snap.data() as UserDoc) : null;
}

export { saveUser, getUser };

