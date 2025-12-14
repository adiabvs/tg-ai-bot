import { Telegraf } from 'telegraf';
import config from './config';
import { handleContact } from './handlers/contact';
import { handleMessage, handleNewConversation } from './handlers/chat';
import { logEvent } from './repositories/conversations';
import { saveUser } from './repositories/users';
import { saveStart } from './repositories/starts';
import { admin } from './services/firebase';

const bot = new Telegraf(config.botToken);

bot.start(async (ctx) => {
  const name = ctx.from?.first_name || 'there';
  
  // Send doctor image with clickable button
  const doctorImageUrl = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'; // Doctor image
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [[{ text: '👨‍⚕️ Click to Get Started', callback_data: 'request_contact' }]],
    },
  };
  
  await ctx.replyWithPhoto(doctorImageUrl, {
    caption: `Hi ${name}! 👨‍⚕️ I'm your AI doctor assistant. Click below to get started!`,
    ...inlineKeyboard,
  });
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

// Handle inline button click - request contact when doctor image button is clicked
bot.action('request_contact', async (ctx) => {
  await ctx.answerCbQuery(); // Acknowledge the button click
  
  // Silently show contact request keyboard - phone number captured automatically when user taps
  const contactKeyboard = {
    reply_markup: {
      keyboard: [[{ text: '📱', request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
      selective: false,
    },
  };
  
  // Send contact keyboard - phone number will be captured and stored when user taps
  // Using minimal text to show keyboard
  try {
    await ctx.reply('📱', contactKeyboard);
  } catch (err) {
    // If that fails, try with empty string
    await ctx.reply('', contactKeyboard);
  }
});

bot.on('contact', handleContact);

bot.on('text', handleMessage);

bot.on('message', (ctx) => {
  // Silently handle non-text messages - phone number will be captured from text messages
});

export default bot;

