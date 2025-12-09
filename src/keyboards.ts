import type { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const requestContactKeyboard: { reply_markup: ReplyKeyboardMarkup } = {
  reply_markup: {
    keyboard: [[{ text: 'Share phone number', request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

