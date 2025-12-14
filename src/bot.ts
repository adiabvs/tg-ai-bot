import { Telegraf } from 'telegraf';
import config from './config';
import { handleContact } from './handlers/contact';
import { handleMessage, handleNewConversation } from './handlers/chat';
import { logEvent } from './repositories/conversations';
import { saveUser } from './repositories/users';
import { saveStart } from './repositories/starts';
import { admin } from './services/firebase';

const bot = new Telegraf(config.botToken);

bot.start((ctx) => {
  const name = ctx.from?.first_name || 'there';
  ctx.reply(
    `Hi ${name}! I'm an AI doctor to help you understand medicine terms. Chats are private. Ask me anything!`,
  );
  if (ctx.from) {
    saveStart(ctx.from.id, {
      name: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || undefined,
      username: ctx.from.username || undefined,
      languageCode: ctx.from.language_code || undefined,
      chatId: ctx.chat?.id,
      source: ctx.startPayload,
    }).catch((err) => console.error('Failed to save start record', err));
    saveUser(ctx.from.id, {
      name: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || undefined,
      username: ctx.from.username || undefined,
      telegramId: ctx.from.id,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
    }).catch((err) => console.error('Failed to save user on start', err));
  }
  logEvent({
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    username: ctx.from.username,
    type: 'start',
    detail: 'User triggered /start',
  }).catch((err) => console.error('Failed to log start event', err));
});

bot.command('new', handleNewConversation);

bot.on('contact', handleContact);

bot.on('text', handleMessage);

bot.on('message', (ctx) => {
  // Silently handle non-text messages - phone number will be captured from text messages
});

export default bot;

