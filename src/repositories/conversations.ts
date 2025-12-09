import { getDb, admin } from '../services/firebase';

const db = getDb();

type ConversationDoc = {
  chatId: number;
  userId: number;
  username: string | null;
  userMessage?: string;
  botReply?: string;
  type?: string;
  detail?: string | null;
  createdAt: admin.firestore.FieldValue;
};

async function saveExchange({
  chatId,
  userId,
  username,
  userMessage,
  botReply,
}: {
  chatId: number;
  userId: number;
  username?: string;
  userMessage: string;
  botReply: string;
}): Promise<void> {
  const doc: ConversationDoc = {
    chatId,
    userId,
    username: username || null,
    userMessage,
    botReply,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await db.collection('conversations').add(doc);
}

async function logEvent({
  chatId,
  userId,
  username,
  type,
  detail,
}: {
  chatId: number;
  userId: number;
  username?: string;
  type: string;
  detail?: string;
}): Promise<void> {
  const doc: ConversationDoc = {
    chatId,
    userId,
    username: username || null,
    type,
    detail: detail || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await db.collection('conversationEvents').add(doc);
}

export { saveExchange, logEvent };

