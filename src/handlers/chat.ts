import type { Context } from 'telegraf';
import { generateReply } from '../services/gemini';
import * as conversations from '../state/conversations';
import { saveExchange, logEvent } from '../repositories/conversations';
import { getUser } from '../repositories/users';
import { requestContactKeyboard } from '../keyboards';

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

async function handleMessage(ctx: Context): Promise<void> {
  if (!ctx.chat || !ctx.from) return;
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
  if (!text) {
    await ctx.reply('Please share your phone number to continue (required).', requestContactKeyboard);
    return;
  }

  const chatId = ctx.chat.id;
  const existingUser = await getUser(ctx.from.id);
  if (!existingUser) {
    await ctx.reply(
      'Please share your phone number first to continue (required). Tap "Share phone number".',
      requestContactKeyboard,
    );
    return;
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

