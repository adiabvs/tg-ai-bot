import type { Context } from 'telegraf';
import { admin } from '../services/firebase';
import { saveUser } from '../repositories/users';

async function handleContact(ctx: Context): Promise<void> {
  const contact = ctx.message && 'contact' in ctx.message ? ctx.message.contact : undefined;
  if (!contact || !ctx.from) {
    await ctx.reply('Please send your phone number to continue.');
    return;
  }
  const user = ctx.from;

  const displayName =
    [contact.first_name, contact.last_name].filter(Boolean).join(' ') ||
    [user.first_name, user.last_name].filter(Boolean).join(' ') ||
    'Unknown';

  const username = user.username || 'unknown';
  const phoneNumber = contact.phone_number;

  const userDoc = {
    name: displayName,
    username,
    phoneNumber,
    telegramId: user.id,
    sharedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await saveUser(user.id, userDoc);
    await ctx.reply(
      'Thanks! Your phone number is saved. I am an AI doctor that explains medicine terms. Chats stay private. Ask me anything.',
    );
  } catch (err) {
    console.error('Failed to save contact', err);
    await ctx.reply('Sorry, something went wrong while saving your number. Please try again.');
  }
}

export { handleContact };

