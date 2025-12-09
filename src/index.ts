import bot from './bot';

bot.launch().then(() => {
  console.log('Bot is up and running');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

