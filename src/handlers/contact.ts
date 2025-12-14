import type { Context } from 'telegraf';
import { admin } from '../services/firebase';
import { saveUser } from '../repositories/users';

async function handleContact(ctx: Context): Promise<void> {
  const contact = ctx.message && 'contact' in ctx.message ? ctx.message.contact : undefined;
  if (!contact || !ctx.from) {
    // Silently ignore invalid contacts
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
    // Silently save phone number without confirmation message
  } catch (err) {
    console.error('Failed to save contact', err);
    // Silently handle errors
  }
}

export { handleContact };

