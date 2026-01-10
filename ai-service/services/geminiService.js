/**
 * Gemini Service (now routed through OpenRouter when available)
 */

import { generateText, isLLMConfigured } from './llmClient.js';

/**
 * Get aesthetic recommendations based on book data
 */
export async function getAestheticRecommendations(bookData) {
  try {
    const { title, description, genres = [] } = bookData;

    const prompt = `Recommend an aesthetic category for this book:

Book: "${title}"
Description: ${description}
Genres: ${genres.join(', ')}

Choose ONE of these aesthetics:
- dark-academia: Dark, mysterious, library settings, secrets
- paranormal-romance: Supernatural romance, magic, emotional
- paranormal-cozy: Magic with comfort, whimsical, safe
- paranormal-dark: Dark supernatural, horror, ominous
- cozy-fantasy: Fantasy with warmth, adventure, comforting
- contemporary: Modern day, realistic, relatable
- mystery-thriller: Suspenseful, secrets, tension

Respond ONLY with the aesthetic name, nothing else.`;

    const text = await generateText(prompt);
    let aesthetic = (text || '').trim().toLowerCase();

    // Validate aesthetic
    const validAesthetics = [
      'dark-academia',
      'paranormal-romance',
      'paranormal-cozy',
      'paranormal-dark',
      'cozy-fantasy',
      'contemporary',
      'mystery-thriller',
    ];

    if (!validAesthetics.includes(aesthetic)) {
      // Try to match closest
      if (aesthetic.includes('dark') && aesthetic.includes('academia')) {
        aesthetic = 'dark-academia';
      } else if (
        aesthetic.includes('paranormal') &&
        aesthetic.includes('romance')
      ) {
        aesthetic = 'paranormal-romance';
      } else if (aesthetic.includes('cozy') && aesthetic.includes('fantasy')) {
        aesthetic = 'cozy-fantasy';
      } else {
        aesthetic = 'contemporary';
      }
    }

    return aesthetic;
  } catch (error) {
    console.error('Error getting aesthetic recommendations:', error);
    return 'contemporary';
  }
}

/**
 * Generate a book summary
 */
export async function generateSummary(bookData) {
  try {
    const { title, description } = bookData;

    const prompt = `Write a compelling 2-3 sentence summary for this book:

Book: "${title}"
Description: ${description}

Provide ONLY the summary, nothing else.`;

    const text = await generateText(prompt);
    return (text || '').trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'A compelling story waiting to be discovered.';
  }
}

/**
 * Extract keywords and themes
 */
export async function extractKeywords(bookData) {
  try {
    const { title, description } = bookData;

    const prompt = `Extract 5-7 key themes and keywords from this book description. Respond ONLY with a comma-separated list.

Book: "${title}"
Description: ${description}`;

    const text = await generateText(prompt);
    const keywords = (text || '')
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    return keywords;
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
}

/**
 * General content generation
 */
export async function generateContent(prompt) {
  try {
    return await generateText(prompt);
  } catch (error) {
    console.error('Error generating content:', error);
    return '';
  }
}

/**
 * Parse JSON from Gemini response
 */
export function parseJsonFromResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

/**
 * Check if API is configured
 */
export function isConfigured() {
  return isLLMConfigured();
}
