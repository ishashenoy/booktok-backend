import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-flash-1.5';
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let geminiModel = null;
if (GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

/**
 * Generate plain text from an LLM, preferring OpenRouter; falls back to Gemini SDK if missing.
 */
export async function generateText(prompt) {
  // Prefer OpenRouter if configured
  if (OPENROUTER_API_KEY) {
    try {
      const { data } = await axios.post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          model: OPENROUTER_MODEL,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost',
            'X-Title': 'BookTok',
          },
          timeout: 25000,
        }
      );

      const text = data?.choices?.[0]?.message?.content || '';
      if (text) return text;
    } catch (err) {
      console.warn('OpenRouter request failed, falling back to Gemini if available:', err.message);
    }
  }

  // Fallback: Gemini SDK if configured
  if (geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error('Gemini fallback failed:', err.message);
    }
  }

  return '';
}

/**
 * Generate JSON-able content; returns string (caller parses JSON).
 */
export async function generateJsonLike(prompt) {
  return generateText(prompt);
}

/**
 * Simple config check helper.
 */
export function isLLMConfigured() {
  return Boolean(OPENROUTER_API_KEY || GEMINI_API_KEY);
}
