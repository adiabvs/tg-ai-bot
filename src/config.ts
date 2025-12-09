import dotenv from 'dotenv';

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN ?? '';
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID ?? '';
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? '';
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '';
const geminiApiKey = process.env.GEMINI_API_KEY ?? '';
const geminiModel = process.env.GEMINI_MODEL ?? 'models/gemini-2.5-flash';

function requireEnv(name: string, value: string): string {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const config = {
  botToken: requireEnv('TELEGRAM_BOT_TOKEN', botToken),
  firebase: {
    projectId: requireEnv('FIREBASE_PROJECT_ID', firebaseProjectId),
    clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL', firebaseClientEmail),
    privateKey: requireEnv('FIREBASE_PRIVATE_KEY', firebasePrivateKey),
  },
  geminiApiKey: requireEnv('GEMINI_API_KEY', geminiApiKey),
  geminiModel,
};

export default config;

