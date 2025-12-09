// In-memory conversation store keyed by chat id.
// Keeps a rolling history of exchanges for contextual replies.
const historyByChat = new Map<number, string[]>();
const MAX_HISTORY = 20; // limit to avoid unbounded growth

function getHistory(chatId: number): string[] {
  return historyByChat.get(chatId) || [];
}

function appendExchange(chatId: number, userMessage: string, botReply: string): void {
  const history = getHistory(chatId);
  history.push(`User: ${userMessage}`);
  history.push(`Bot: ${botReply}`);
  const trimmed = history.slice(-MAX_HISTORY);
  historyByChat.set(chatId, trimmed);
}

function reset(chatId: number): void {
  historyByChat.delete(chatId);
}

export { getHistory, appendExchange, reset };

