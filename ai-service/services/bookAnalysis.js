import { generateJsonLike } from './llmClient.js';

const DEFAULT_TROPES = [
  'enemies-to-lovers',
  'found-family',
  'slow-burn',
  'reluctant-hero',
  'grumpy-sunshine',
  'secret-identity',
  'second-chance',
  'heist',
  'dark-academia',
  'haunted-house',
  'forbidden-magic',
];

/**
 * Analyze a book and extract key information
 * Returns: summary, tropes, aesthetic, vibeCollage
 */
export async function analyzeBook(bookData) {
  try {
    const { title, author, description, genres = [] } = bookData;

    const prompt = `Analyze this book and provide structured JSON output:

Book: "${title}" by ${author}
Description: ${description}
Genres: ${genres.join(', ')}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "summary": "2-3 sentence summary of the book's essence",
  "tropes": ["trope1", "trope2", "trope3", "trope4"],
  "aesthetic": "one-word aesthetic category like: cozy-fantasy, dark-academia, paranormal-romance, contemporary, mystery-thriller, paranormal-cozy, paranormal-dark",
  "vibeCollage": "Vivid sensory description of the book's mood, atmosphere, and aesthetic (2-3 sentences with colors, lighting, textures, and emotions)"
}`;

    const responseText = await generateJsonLike(prompt);

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in response, using defaults');
      return getDefaultAnalysis(bookData);
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      summary: analysis.summary || 'A compelling story worth reading.',
      tropes: Array.isArray(analysis.tropes) ? analysis.tropes : [],
      aesthetic: analysis.aesthetic || 'contemporary',
      vibeCollage: analysis.vibeCollage || 'A unique reading experience.',
    };
  } catch (error) {
    console.error('Error analyzing book:', error);
    return getDefaultAnalysis(bookData);
  }
}

/**
 * Quick trope suggestions (static list for now)
 */
export function getTropeSuggestions() {
  return DEFAULT_TROPES;
}

/**
 * Extract character profiles from book description
 */
export async function extractCharacterProfiles(bookData) {
  try {
    const { title, description } = bookData;

    const prompt = `Extract main character profiles from this book description. Respond ONLY with valid JSON:

Book: "${title}"
Description: ${description}

{
  "characters": [
    {
      "name": "Character Name",
      "archetype": "The archetype (e.g., The Hero, The Love Interest, The Mentor)",
      "description": "Brief description of their role",
      "perspective": "How this character might describe the book's core message"
    }
  ]
}`;

    const responseText = await generateJsonLike(prompt);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { characters: [] };
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis.characters || [];
  } catch (error) {
    console.error('Error extracting characters:', error);
    return [];
  }
}

/**
 * Generate character-driven perspectives
 */
export async function generateAllCharacterPerspectives(bookData) {
  try {
    const { title, description } = bookData;

    const prompt = `Write brief perspectives from different character types about this book:

Book: "${title}"
Description: ${description}

Respond with JSON:
{
  "perspectives": [
    { "character": "The Protagonist", "view": "What they'd say about this story" },
    { "character": "The Antagonist", "view": "Their perspective" },
    { "character": "A Supporting Character", "view": "Their perspective" }
  ]
}`;

    const responseText = await generateJsonLike(prompt);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [];
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis.perspectives || [];
  } catch (error) {
    console.error('Error generating perspectives:', error);
    return [];
  }
}

/**
 * Generate discussion questions for a book.
 */
export async function generateDiscussionQuestions(bookData) {
  try {
    const { title, description } = bookData;

    const prompt = `Generate 4 thoughtful discussion questions for this book. Avoid spoilers.

Book: "${title}"
Description: ${description}

Respond with JSON:
{
  "questions": ["q1", "q2", "q3", "q4"]
}`;

    const responseText = await generateJsonLike(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getDefaultQuestions(title);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : getDefaultQuestions(title);
    return questions;
  } catch (error) {
    console.error('Error generating discussion questions:', error);
    return getDefaultQuestions(bookData.title);
  }
}

/**
 * Fallback analysis if Gemini fails
 */
function getDefaultAnalysis(bookData) {
  const { title, genres = [] } = bookData;

  const aestheticMap = {
    fantasy: 'dark-academia',
    romance: 'paranormal-romance',
    mystery: 'mystery-thriller',
    science: 'contemporary',
    horror: 'paranormal-dark',
  };

  const firstGenre = genres[0]?.toLowerCase() || 'contemporary';
  const aesthetic = aestheticMap[firstGenre] || 'contemporary';

  return {
    summary: `An engaging story that explores complex themes and compelling characters.`,
    tropes: ['character-driven', 'immersive-world', 'emotional-journey', 'thought-provoking'],
    aesthetic,
    vibeCollage: 'A richly textured narrative with depth and emotional resonance.',
  };
}

function getDefaultQuestions(title = 'this book') {
  return [
    `What motivates the protagonist most in ${title}?`,
    `How does the setting influence the conflicts in ${title}?`,
    `Which relationship felt most compelling and why?`,
    `What unanswered question would you ask the author?`,
  ];
}

function normalizeArray(arr = []) {
  return arr
    .filter(Boolean)
    .map((item) => item.toString().toLowerCase().trim())
    .filter((item) => item.length > 0);
}

/**
 * Simple similarity scoring for books.
 */
export function findSimilarBooks(targetBook, allBooks = []) {
  if (!targetBook) return [];

  const targetId = targetBook._id?.toString();
  const targetTropes = new Set(normalizeArray(targetBook.tropes));
  const targetAesthetic = (targetBook.aesthetic || '').toLowerCase();

  const scored = allBooks
    .filter((book) => book._id?.toString() !== targetId)
    .map((book) => {
      const tropes = normalizeArray(book.tropes);
      const sharedTropes = tropes.filter((t) => targetTropes.has(t)).length;
      const aestheticMatch = (book.aesthetic || '').toLowerCase() === targetAesthetic ? 1 : 0;
      const sameAuthor = book.author && targetBook.author && book.author === targetBook.author ? 1 : 0;

      const score = sharedTropes * 1.5 + aestheticMatch * 2 + sameAuthor;
      return { book, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(({ book }) => book);
}

/**
 * Personalized recommendations based on user's read history.
 */
export function getPersonalizedRecommendations(user, allBooks = []) {
  if (!user) return [];

  const readIds = new Set(
    (user.readBooks || []).map((rb) => rb.bookId?._id?.toString?.() || rb.bookId?.toString?.()).filter(Boolean)
  );

  const likedTropes = new Set(
    (user.readBooks || [])
      .flatMap((rb) => normalizeArray(rb.bookId?.tropes || []))
  );

  const preferredAesthetics = new Set(
    (user.readBooks || [])
      .map((rb) => (rb.bookId?.aesthetic || '').toLowerCase())
      .filter(Boolean)
  );

  const scored = allBooks
    .filter((book) => !readIds.has(book._id?.toString()))
    .map((book) => {
      const tropes = normalizeArray(book.tropes);
      const aesthetic = (book.aesthetic || '').toLowerCase();

      const tropeOverlap = tropes.filter((t) => likedTropes.has(t)).length;
      const aestheticMatch = preferredAesthetics.has(aesthetic) ? 2 : 0;

      const score = tropeOverlap * 1.25 + aestheticMatch;
      return { book, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(({ book }) => book);
}
