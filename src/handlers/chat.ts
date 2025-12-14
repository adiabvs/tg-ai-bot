import type { Context } from 'telegraf';
import { generateReply } from '../services/gemini';
import * as conversations from '../state/conversations';
import { saveExchange, logEvent } from '../repositories/conversations';
import { getUser, saveUser } from '../repositories/users';
import { admin } from '../services/firebase';

async function handleNewConversation(ctx: Context): Promise<void> {
  if (!ctx.chat || !ctx.from) return;
  conversations.reset(ctx.chat.id);
  await logEvent({
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    username: ctx.from.username,
    type: 'reset',
    detail: 'Conversation reset via /new',
  });
  await ctx.reply('Started a new conversation. Ask your question!');
}

function isValidPhoneNumber(phone: string): boolean {
  // Remove common phone number characters and check if it's mostly digits
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  // Check if it has at least 7 digits (minimum for a valid phone number)
  return /^\d{7,15}$/.test(cleaned);
}

function normalizePhoneNumber(phone: string): string {
  // Remove common formatting characters
  return phone.replace(/[\s\-+()]/g, '');
}

async function handleMessage(ctx: Context): Promise<void> {
  if (!ctx.chat || !ctx.from) return;
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
  if (!text) {
    await ctx.reply('Please send your phone number to continue (required).');
    return;
  }

  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  let existingUser = await getUser(userId);
  
  // If user doesn't exist, treat the message as a phone number
  if (!existingUser) {
    if (isValidPhoneNumber(text)) {
      const phoneNumber = normalizePhoneNumber(text);
      const displayName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || 'Unknown';
      const username = ctx.from.username || 'unknown';
      
      try {
        await saveUser(userId, {
          name: displayName,
          username,
          phoneNumber,
          telegramId: userId,
          sharedAt: admin.firestore.FieldValue.serverTimestamp(),
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await ctx.reply(
          'Thanks! Your phone number is saved. I am an AI doctor that explains medicine terms. Chats stay private. Ask me anything.',
        );
        existingUser = await getUser(userId);
      } catch (err) {
        console.error('Failed to save phone number', err);
        await ctx.reply('Sorry, something went wrong while saving your number. Please try again.');
        return;
      }
    } else {
      await ctx.reply('Please send a valid phone number to continue (required).');
      return;
    }
  }

  const history = conversations.getHistory(chatId);

  try {
    const reply = await generateReply(history, text);
    conversations.appendExchange(chatId, text, reply);
    await saveExchange({
      chatId,
      userId: ctx.from.id,
      username: ctx.from.username,
      userMessage: text,
      botReply: reply,
    });
    await ctx.reply(reply);
  } catch (err) {
    console.error('Gemini response failed', err);
    await ctx.reply('Sorry, I could not get a response right now. Please try again.');
  }
}

export { handleMessage, handleNewConversation };

