import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

// Use the fully qualified model path to avoid API version mismatches.
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: config.geminiModel });

/**
 * Generate a reply based on conversation history and the latest user message.
 * History is an array of strings alternating user and bot messages.
 */
async function generateReply(history: string[], userMessage: string): Promise<string> {
  const contextText = history.length
    ? history.map((line, idx) => `${idx + 1}. ${line}`).join('\n')
    : 'No prior context.';

  const prompt = `
You are a helpful assistant inside a Telegram bot. Respond concisely.
Conversation so far:
${contextText}

User just asked: "${userMessage}"

Provide a clear, short reply.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export { generateReply };

