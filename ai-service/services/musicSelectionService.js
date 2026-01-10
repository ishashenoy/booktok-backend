/**
 * Music Selection Service
 * Recommends music and audio for different aesthetics and moods
*/

import { generateText } from './llmClient.js';

/**
 * Select music for a book's aesthetic
*/
export async function selectMusicForAesthetic(bookData) {
  try {
    const { title, aesthetic, vibeCollage = '' } = bookData;

    const prompt = `Recommend music styles and characteristics for this book's aesthetic.

Book: "${title}"
Aesthetic: ${aesthetic}
Vibe: ${vibeCollage}

Respond with JSON:
{
  "musicGenres": ["genre1", "genre2", "genre3"],
  "instrumentsToFeature": ["instrument1", "instrument2"],
  "tempo": "slow/moderate/fast",
  "mood": "The emotional tone of recommended music",
  "recommendations": [
    "Artist or song suggestion",
    "Artist or song suggestion"
  ],
  "soundscapeElements": ["element1", "element2"]
}`;

    const responseText = await generateText(prompt);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getDefaultMusicForAesthetic(aesthetic);
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error selecting music:', error);
    return getDefaultMusicForAesthetic(aesthetic);
  }
}

/**
 * Get default music recommendations by aesthetic
 */
function getDefaultMusicForAesthetic(aesthetic) {
  const musicMap = {
    'dark-academia': {
      musicGenres: ['classical', 'dark ambient', 'gothic'],
      instrumentsToFeature: ['piano', 'cello', 'orchestral strings'],
      tempo: 'slow',
      mood: 'Mysterious, intellectual, slightly melancholic',
      recommendations: [
        'Ludovico Einaudi - Nuvole Bianche',
        'Ólafur Arnalds - Near Light',
        'Hans Zimmer - Time',
      ],
      soundscapeElements: ['page turning', 'library ambience', 'whispers'],
    },
    'paranormal-romance': {
      musicGenres: ['ethereal pop', 'dark synth', 'romantic soundtrack'],
      instrumentsToFeature: ['synthesizer', 'strings', 'ethereal vocals'],
      tempo: 'moderate',
      mood: 'Romantic, mysterious, slightly dark',
      recommendations: [
        'The Midnight Library soundtrack',
        'Vampire Diaries OST',
        'Eerie instrumental romance',
      ],
      soundscapeElements: ['wind', 'heartbeat', 'magical shimmer'],
    },
    'paranormal-cozy': {
      musicGenres: ['indie folk', 'whimsical', 'acoustic'],
      instrumentsToFeature: ['acoustic guitar', 'ukulele', 'piano'],
      tempo: 'moderate',
      mood: 'Warm, magical, comforting',
      recommendations: [
        'Nick Drake - Northern Sky',
        'Bon Iver - Holocene',
        'Cozy instrumental folk',
      ],
      soundscapeElements: ['fireplace', 'tea pouring', 'soft magic'],
    },
    'paranormal-dark': {
      musicGenres: ['dark ambient', 'industrial', 'horror'],
      instrumentsToFeature: ['strings', 'synth', 'percussion'],
      tempo: 'slow',
      mood: 'Ominous, tense, supernatural',
      recommendations: [
        'Trent Reznor & Atticus Ross - The Hand that Feeds',
        'Dark ambient - Halo',
        'Supernatural thriller soundtrack',
      ],
      soundscapeElements: ['creaking', 'distant howling', 'ominous hum'],
    },
    'cozy-fantasy': {
      musicGenres: ['whimsical', 'fantasy soundtrack', 'folk'],
      instrumentsToFeature: ['wooden instruments', 'flute', 'piano'],
      tempo: 'moderate',
      mood: 'Adventurous yet comforting, magical',
      recommendations: [
        'Lord of the Rings OST',
        'Studio Ghibli soundtracks',
        'Cozy fantasy instrumental',
      ],
      soundscapeElements: ['forest ambience', 'magical chime', 'tavern warmth'],
    },
    'contemporary': {
      musicGenres: ['indie pop', 'alternative', 'singer-songwriter'],
      instrumentsToFeature: ['guitar', 'vocals', 'drums'],
      tempo: 'moderate',
      mood: 'Relatable, emotional, modern',
      recommendations: [
        'Indie pop recommendations',
        'Contemporary alternatives',
        'Emotional singer-songwriters',
      ],
      soundscapeElements: ['city ambience', 'coffee shop', 'urban sounds'],
    },
    'mystery-thriller': {
      musicGenres: ['suspenseful', 'noir', 'thriller soundtrack'],
      instrumentsToFeature: ['strings', 'piano', 'percussion'],
      tempo: 'fast',
      mood: 'Tense, suspenseful, dramatic',
      recommendations: [
        'Hans Zimmer - Ticking Away',
        'Thriller soundtracks',
        'Suspense ambient music',
      ],
      soundscapeElements: ['clock ticking', 'footsteps', 'tension build'],
    },
  };

  return (
    musicMap[aesthetic] || {
      musicGenres: ['indie', 'alternative', 'ambient'],
      instrumentsToFeature: ['various'],
      tempo: 'moderate',
      mood: 'Engaging and atmospheric',
      recommendations: ['Original soundtrack recommendations'],
      soundscapeElements: ['atmospheric elements'],
    }
  );
}

/**
 * Get recommended music platforms
 */
export function getMusicPlatforms() {
  return {
    freeOptions: [
      'YouTube Audio Library',
      'Incompetech (Kevin MacLeod)',
      'FreePD.com',
      'Bensound',
    ],
    paidOptions: [
      'Epidemic Sound',
      'Artlist',
      'AudioJungle',
      'Shutterstock Music',
    ],
  };
}

/**
 * Stub exports expected by routes but not yet implemented
 */
export function selectMusicForMultiCharacterVideo() {
  return getDefaultMusicForAesthetic('contemporary');
}

export function selectMusicForCharacterPerspective() {
  return getDefaultMusicForAesthetic('contemporary');
}

export async function generateMusicCompositionBrief(bookData) {
  const { aesthetic = 'contemporary' } = bookData;
  return {
    style: aesthetic,
    mood: 'Engaging and atmospheric',
    brief: 'Create music that matches the book aesthetic and mood.',
  };
}

export function getRoyaltyFreeMusicSources() {
  return getMusicPlatforms();
}
