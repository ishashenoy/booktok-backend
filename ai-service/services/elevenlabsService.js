/**
 * ElevenLabs Text-to-Speech Service
 * Generates AI voiceovers for book previews
 */

import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Predefined voice IDs for different character types
const VOICES = {
  protagonist: 'EXAVITQu4vr4xnSDxMaL', // Female voice (default for main character)
  antagonist: '5Q0gWLnLqe003yXDbnXu',  // Male voice (for conflict)
  narrator: 'JBFqnCBsd6RMkjVY3EL8',    // Neutral narrator voice
  mysterious: 'nPczCjzI2devNBz1zQrb',   // Deep, mysterious voice
};

/**
 * Generate voiceover for book preview
 * Creates a short narration about the book
 */
export async function generatePreviewVoiceover(bookData) {
  if (!ELEVENLABS_API_KEY) {
    console.warn('⚠️  ElevenLabs API key not configured');
    return null;
  }

  try {
    const { title, description, aesthetic } = bookData;

    // Create a compelling preview narration (15-30 seconds)
    const narration = generateNarrationText(title, description, aesthetic);

    // Select voice based on aesthetic
    const voiceId = selectVoiceForAesthetic(aesthetic);

    // Generate audio
    const audioUrl = await generateAudio(narration, voiceId);

    return {
      narration,
      audioUrl,
      voiceId,
      duration: calculateDuration(narration),
    };
  } catch (error) {
    console.error('Error generating preview voiceover:', error);
    return null;
  }
}

/**
 * Generate character voice snippets
 * Creates individual character voice lines
 */
export async function generateCharacterVoicelines(bookData, character) {
  if (!ELEVENLABS_API_KEY) {
    return null;
  }

  try {
    const { name, archetype, description } = character;

    // Create character voice line
    const voiceline = createCharacterLine(name, archetype, bookData);

    // Select voice for character archetype
    const voiceId = selectVoiceForArchetype(archetype);

    // Generate audio
    const audioUrl = await generateAudio(voiceline, voiceId);

    return {
      character: name,
      voiceline,
      audioUrl,
      archetype,
      duration: calculateDuration(voiceline),
    };
  } catch (error) {
    console.error('Error generating character voiceline:', error);
    return null;
  }
}

/**
 * Generate summary voiceover
 * Reads the book summary aloud
 */
export async function generateSummaryAudio(summary, aesthetic = 'contemporary') {
  if (!ELEVENLABS_API_KEY) {
    return null;
  }

  try {
    // Trim summary to fit in reasonable audio length (30-60 seconds)
    const trimmedSummary = trimForAudio(summary, 300); // ~300 characters

    // Use narrator voice for summary
    const voiceId = VOICES.narrator;

    // Generate audio
    const audioUrl = await generateAudio(trimmedSummary, voiceId);

    return {
      audioUrl,
      duration: calculateDuration(trimmedSummary),
      type: 'summary',
    };
  } catch (error) {
    console.error('Error generating summary audio:', error);
    return null;
  }
}

/**
 * Generate vibe description audio
 * Reads the aesthetic vibe collage aloud
 */
export async function generateVibeAudio(vibeCollage, aesthetic = 'contemporary') {
  if (!ELEVENLABS_API_KEY) {
    return null;
  }

  try {
    // Trim vibe description for audio
    const trimmedVibe = trimForAudio(vibeCollage, 250);

    // Select voice based on aesthetic
    const voiceId = selectVoiceForAesthetic(aesthetic);

    // Generate audio
    const audioUrl = await generateAudio(trimmedVibe, voiceId);

    return {
      audioUrl,
      duration: calculateDuration(trimmedVibe),
      type: 'vibe',
    };
  } catch (error) {
    console.error('Error generating vibe audio:', error);
    return null;
  }
}

/**
 * Actual API call to ElevenLabs
 */
async function generateAudio(text, voiceId) {
  console.log('🔊 ElevenLabs Request:');
  console.log('   URL:', `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`);
  console.log('   Voice ID:', voiceId);
  console.log('   Text length:', text.length, 'chars');
  console.log('   Text preview:', text.substring(0, 100) + '...');
  console.log('   Model:', 'eleven_multilingual_v2');
  console.log('   API Key:', ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.substring(0, 10)}...` : 'NOT SET');

  try {
    const requestBody = {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      }
    };
    
    console.log('   Request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      requestBody,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
      }
    );

    console.log('✅ ElevenLabs Response:');
    console.log('   Status:', response.status);
    console.log('   Audio size:', response.data.byteLength, 'bytes');

    const buffer = Buffer.from(response.data);

    return {
      base64: `data:audio/mpeg;base64,${buffer.toString('base64')}`,
      buffer
    };
  } catch (error) {
    console.error('❌ ElevenLabs API Error:');
    console.error('   Status:', error.response?.status);
    console.error('   Status Text:', error.response?.statusText);
    
    // Try to parse error response
    if (error.response?.data) {
      try {
        const errorData = Buffer.isBuffer(error.response.data) 
          ? JSON.parse(error.response.data.toString('utf-8'))
          : error.response.data;
        console.error('   Error Detail:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.error('   Raw Error:', error.response.data.toString?.() || error.response.data);
      }
    }
    console.error('   Message:', error.message);
    throw error;
  }
}

/**
 * Generate compelling narration for preview
 */
function generateNarrationText(title, description, aesthetic) {
  const aestheticDescriptions = {
    'dark-academia': 'A mysterious tale of secrets and knowledge...',
    'paranormal-romance': 'A supernatural love story like no other...',
    'paranormal-cozy': 'Magic meets comfort in this enchanting adventure...',
    'paranormal-dark': 'Darkness falls, and danger awakens...',
    'cozy-fantasy': 'Step into a world of magic and warmth...',
    'contemporary': 'A modern story that touches the heart...',
    'mystery-thriller': 'A mystery waiting to be solved...',
  };

  const description_snippet = aestheticDescriptions[aesthetic] || 'A story worth reading...';

  return `Discover "${title}". ${description_snippet} Read about ${title.toLowerCase()} today.`;
}

/**
 * Create character voice line
 */
function createCharacterLine(characterName, archetype, bookData) {
  const archetypeLines = {
    protagonist: `I'm ${characterName}, and my journey begins in "${bookData.title}".`,
    antagonist: `I am ${characterName}, the force of conflict in this tale.`,
    mentor: `I'm ${characterName}, here to guide you through this story.`,
    'love-interest': `${characterName} here. Our story unfolds in "${bookData.title}".`,
    supporting: `I'm ${characterName}, part of this incredible story.`,
  };

  return archetypeLines[archetype] || `I'm ${characterName} from "${bookData.title}".`;
}

/**
 * Select voice based on aesthetic
 */
function selectVoiceForAesthetic(aesthetic) {
  const voiceMap = {
    'dark-academia': VOICES.mysterious,
    'paranormal-romance': VOICES.protagonist,
    'paranormal-cozy': VOICES.protagonist,
    'paranormal-dark': VOICES.antagonist,
    'cozy-fantasy': VOICES.protagonist,
    'contemporary': VOICES.narrator,
    'mystery-thriller': VOICES.mysterious,
  };

  return voiceMap[aesthetic] || VOICES.narrator;
}

/**
 * Select voice based on character archetype
 */
function selectVoiceForArchetype(archetype) {
  const voiceMap = {
    protagonist: VOICES.protagonist,
    antagonist: VOICES.antagonist,
    mentor: VOICES.narrator,
    'love-interest': VOICES.protagonist,
    supporting: VOICES.narrator,
    mysterious: VOICES.mysterious,
  };

  return voiceMap[archetype] || VOICES.narrator;
}

/**
 * Trim text to reasonable length for audio
 */
function trimForAudio(text, maxChars = 300) {
  if (text.length <= maxChars) {
    return text;
  }

  // Find last complete sentence within maxChars
  const trimmed = text.substring(0, maxChars);
  const lastPeriod = trimmed.lastIndexOf('.');

  if (lastPeriod > maxChars * 0.7) {
    return trimmed.substring(0, lastPeriod + 1);
  }

  return trimmed + '...';
}

/**
 * Calculate approximate audio duration in seconds
 * Average speaking rate: ~150 words per minute = ~2.5 words per second
 */
function calculateDuration(text) {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 2.5;
  return Math.ceil(wordCount / wordsPerSecond);
}

/**
 * Check if ElevenLabs is configured
 */
export function isConfigured() {
  return !!ELEVENLABS_API_KEY;
}

/**
 * Get all available voices
 */
export function getAvailableVoices() {
  return VOICES;
}

/**
 * Get voice recommendations for aesthetic
 */
export function getVoiceRecommendations(aesthetic) {
  return {
    aesthetic,
    recommendedVoice: selectVoiceForAesthetic(aesthetic),
    alternatives: [VOICES.narrator, VOICES.protagonist, VOICES.mysterious],
  };
}
