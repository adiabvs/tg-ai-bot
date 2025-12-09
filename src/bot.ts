import { Telegraf } from 'telegraf';
import config from './config';
import { handleContact } from './handlers/contact';
import { handleMessage, handleNewConversation } from './handlers/chat';
import { requestContactKeyboard } from './keyboards';
import { logEvent } from './repositories/conversations';

const bot = new Telegraf(config.botToken);

bot.start((ctx) => {
  const name = ctx.from?.first_name || 'there';
  ctx.reply(
    `Hi ${name}! I'm an AI doctor to help you understand medicine terms. Chats are private. Please share your phone number to start (required).`,
    requestContactKeyboard,
  );
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
  ctx.reply('Please tap "Share phone number" to send your contact (required).', requestContactKeyboard);
});

export default bot;

