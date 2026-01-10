/**
 * Character Voice Service
 * Generates character perspectives and voice-driven content
 */

import { generateJsonLike, generateText } from './llmClient.js';
import { getAvailableVoices, getVoiceRecommendations } from './elevenlabsService.js';

function parseJsonObject(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn('Failed to parse JSON from LLM response:', err.message);
    return null;
  }
}

/**
 * Extract character profiles with detailed information
 */
export async function extractCharacterProfiles(bookData) {
  try {
    const { title, description } = bookData;

    const prompt = `Extract main character profiles from this book. Be concise but descriptive.

Book: "${title}"
Description: ${description}

Respond ONLY with valid JSON (extract 2-4 main characters):
{
  "characters": [
    {
      "name": "Character Name",
      "archetype": "Their role/archetype in the story",
      "personality": "Key personality traits",
      "description": "Physical description or who they are",
      "role": "protagonist/antagonist/supporting"
    }
  ]
}`;

    const responseText = await generateJsonLike(prompt);
    const analysis = parseJsonObject(responseText) || {};
    return analysis.characters || [];
  } catch (error) {
    console.error('Error extracting characters:', error);
    return [];
  }
}

/**
 * Assign simple ElevenLabs voices to characters. Uses recommended voice for the book aesthetic
 * when available, otherwise cycles through available voices.
 */
export async function assignVoicesToCharacters(characters = [], bookAesthetic = 'contemporary') {
  const voices = getAvailableVoices();
  const voiceEntries = Object.entries(voices);
  const recommendation = getVoiceRecommendations(bookAesthetic);

  return characters.map((character, index) => {
    const fallback = voiceEntries[index % voiceEntries.length] || voiceEntries[0];
    const recommendedVoiceId = recommendation?.recommendedVoice;
    const [voiceName, voiceId] = recommendedVoiceId
      ? [bookAesthetic || 'recommended', recommendedVoiceId]
      : fallback;

    return {
      ...character,
      assignedVoice: {
        id: voiceId,
        name: voiceName,
      },
    };
  });
}

/**
 * Generate narration from a specific character's perspective
 */
export async function generateCharacterNarration(bookData, character) {
  try {
    const { title, description } = bookData;

    const prompt = `Write a 2-3 sentence narration from ${character.name}'s perspective about this story:

Book: "${title}"
Description: ${description}
Character: ${character.name} - ${character.description || 'Main character'}

Just provide the narration text, nothing else.`;

    const narration = await generateText(prompt);
    return (narration || '').trim();
  } catch (error) {
    console.error('Error generating narration:', error);
    return `Discover the world of ${title}.`;
  }
}

/**
 * Generate discussion questions from character perspectives
 */
export async function generateCharacterDrivenQuestions(bookData) {
  try {
    const { title, description } = bookData;

    const prompt = `Generate 3-4 discussion questions about this book that different characters might have different answers to.

Book: "${title}"
Description: ${description}

Respond with JSON:
{
  "questions": [
    "Question 1 (no spoilers)?",
    "Question 2 (no spoilers)?",
    "Question 3 (no spoilers)?"
  ]
}`;

    const responseText = await generateJsonLike(prompt);
    const analysis = parseJsonObject(responseText) || {};
    return analysis.questions || [];
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
}

/**
 * Generate a single character perspective script using assigned voices when available.
 */
export async function generateCharacterPerspectiveVideo(bookData, charactersWithVoices = [], focusCharacterName = null, options = {}) {
  const { duration = 30 } = options;

  const fallbackCharacter = charactersWithVoices[0] || bookData.characters?.[0];
  const focusCharacter = focusCharacterName
    ? charactersWithVoices.find((c) => c.name?.toLowerCase() === focusCharacterName.toLowerCase()) || fallbackCharacter
    : fallbackCharacter;

  if (!focusCharacter) {
    return {
      perspectiveScript: 'A mysterious narrator teases the story...'
    };
  }

  const otherCharacters = charactersWithVoices
    .filter((c) => c.name !== focusCharacter.name)
    .map((c) => c.name)
    .join(', ');

  const prompt = `Write a ${duration}-second (~120-160 words) video script from ${focusCharacter.name}'s perspective.
Book: "${bookData.title}"
Description: ${bookData.description}
Other characters: ${otherCharacters || 'none explicitly named'}
Voice tone: ${focusCharacter.personality || 'character-driven'}
Keep it engaging and hint at the conflict without spoilers.`;

  const script = await generateText(prompt);

  return {
    book: { title: bookData.title, aesthetic: bookData.aesthetic },
    perspectiveCharacter: {
      name: focusCharacter.name,
      assignedVoice: focusCharacter.assignedVoice,
    },
    perspectiveScript: (script || '').trim(),
    narratorMode: 'first-person',
    estimatedDuration: `${duration} seconds`,
  };
}

/**
 * Generate perspective videos for all characters found on the book.
 */
export async function generateAllCharacterPerspectives(bookData, options = {}) {
  const characters = bookData.characterAnalysis || bookData.characters || [];
  const withVoices = await assignVoicesToCharacters(characters, bookData.aesthetic);

  const perspectives = [];
  for (const character of withVoices) {
    const perspective = await generateCharacterPerspectiveVideo(bookData, withVoices, character.name, options);
    perspectives.push(perspective);
  }

  return perspectives;
}
