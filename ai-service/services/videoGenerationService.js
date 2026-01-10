/**
 * Video Generation Service
 * 
 * This service generates prompts for Luma Dream Machine
 * to create character-driven preview videos of books
 * 
 * Integrated with ElevenLabs for AI voiceovers
 */

import {
  generatePreviewVoiceover,
  generateSummaryAudio,
  generateVibeAudio,
  isConfigured as isElevenLabsConfigured,
  getAvailableVoices,
  getVoiceRecommendations,
} from './elevenlabsService.js';
import { generateText } from './llmClient.js';

/**
 * Generate a Luma Dream Machine prompt for a book preview video
 * Returns: prompt, style, duration, characters
 */
export async function generateCharacterDrivenVideo(bookData) {
  try {
    const { title, author, description, aesthetic, characters = [] } = bookData;

    const prompt = `Create a cinematic Luma Dream Machine prompt for a book preview video. 
This should be a 15-second preview showing the book's characters and atmosphere.

Book: "${title}" by ${author}
Description: ${description}
Aesthetic: ${aesthetic}
Main Characters: ${characters.length > 0 ? characters.map(c => c.name).join(', ') : 'Create characters from the description'}

Respond with JSON:
{
  "videoPrompt": "Detailed visual prompt for Luma Dream Machine (150-200 words describing cinematic scenes, characters, mood, lighting, camera movements)",
  "style": "The visual style (e.g., cinematic, artistic, dreamlike, realistic, watercolor)",
  "duration": 15,
  "keyScenes": ["Scene 1: Opening", "Scene 2: Main conflict", "Scene 3: Resolution or climax"],
  "colorPalette": ["color1", "color2", "color3"],
  "mood": "The overall emotional tone"
}`;

    const responseText = await generateText(prompt);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getDefaultVideoPrompt(bookData);
    }

    const videoData = JSON.parse(jsonMatch[0]);
    return videoData;
  } catch (error) {
    console.error('Error generating video prompt:', error);
    return getDefaultVideoPrompt(bookData);
  }
}

/**
 * Generate a Luma prompt specifically for character showcase
 */
export async function generateCharacterShowcaseVideo(bookData, character) {
  try {
    const { title, description, aesthetic } = bookData;

    const prompt = `Create a Luma Dream Machine prompt for a 10-second character showcase video.
Show the main character in their world, with their personality and the book's aesthetic.

Book: "${title}"
Character: ${character.name || 'Main character'}
Character description: ${character.description || 'As described in the book'}
Book aesthetic: ${aesthetic}

Respond with JSON:
{
  "videoPrompt": "Detailed visual description for Luma (100-150 words)",
  "characterVibes": "How this character embodies the book's aesthetic",
  "visualStyle": "The art style to use",
  "duration": 10
}`;

    const responseText = await generateText(prompt);
    const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {};
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating character video:', error);
    return {};
  }
}

/**
 * Default video prompt when Gemini unavailable
 */
function getDefaultVideoPrompt(bookData) {
  const { title, aesthetic = 'contemporary' } = bookData;

  const aestheticPrompts = {
    'dark-academia': 'A moody library scene with books floating, students in shadows, candlelight, old architecture, mysterious atmosphere',
    'paranormal-romance': 'A supernatural scene with glowing elements, two figures drawn together, misty atmosphere, magical lighting, romantic tension',
    'paranormal-cozy': 'A cozy room filled with magical elements, warm lighting, comfortable spaces with hints of magic, inviting atmosphere',
    'paranormal-dark': 'A dark, atmospheric scene with supernatural elements, dramatic lighting, mysterious shadows, eerie but compelling',
    'cozy-fantasy': 'A warm magical village or home, golden hour lighting, inviting spaces, whimsical elements, safe and enchanted feeling',
    'contemporary': 'Modern urban or suburban setting with relatable characters, natural lighting, everyday spaces with emotional depth',
    'mystery-thriller': 'Suspenseful scene with dramatic shadows, secrets being revealed, tense atmosphere, clues visible in the scene',
  };

  const defaultPrompt = aestheticPrompts[aesthetic] || aestheticPrompts['contemporary'];

  return {
    videoPrompt: `A cinematic preview of "${title}" showing: ${defaultPrompt}. Show characters discovering something important, with dynamic camera movements and emotional depth.`,
    style: 'cinematic',
    duration: 15,
    keyScenes: [
      'Opening: Setting the mood',
      'Middle: Character introduction or conflict',
      'Climax: Emotional moment or revelation',
    ],
    colorPalette: getColorPaletteForAesthetic(aesthetic),
    mood: 'Engaging and emotionally resonant',
  };
}

/**
 * Generate complete preview package: Video + Audio
 * Combines Luma video with ElevenLabs narration
 */
export async function generateCompletePreview(bookData) {
  try {
    const { title, description, aesthetic, summaryAI, vibeCollage } = bookData;

    // Generate video prompt
    const videoPrompt = await generateCharacterDrivenVideo(bookData);

    // Generate audio components if ElevenLabs is configured
    let audioComponents = {};
    if (isElevenLabsConfigured()) {
      // Generate preview voiceover (narration about the book)
      const voiceover = await generatePreviewVoiceover(bookData);
      if (voiceover) {
        audioComponents.voiceover = voiceover;
      }

      // Generate summary audio (if summary exists)
      if (summaryAI) {
        const summaryAudio = await generateSummaryAudio(summaryAI, aesthetic);
        if (summaryAudio) {
          audioComponents.summary = summaryAudio;
        }
      }

      // Generate vibe audio (aesthetic description)
      if (vibeCollage) {
        const vibeAudio = await generateVibeAudio(vibeCollage, aesthetic);
        if (vibeAudio) {
          audioComponents.vibe = vibeAudio;
        }
      }
    }

    return {
      video: videoPrompt,
      audio: audioComponents,
      combined: {
        title: `${title} - Cinematic Preview`,
        description: `Watch and listen to the preview of "${title}". ${description}`,
        duration: (videoPrompt.duration || 15) + (audioComponents.voiceover?.duration || 0),
        hasAudio: Object.keys(audioComponents).length > 0,
        audioTracks: Object.keys(audioComponents),
      },
    };
  } catch (error) {
    console.error('Error generating complete preview:', error);
    // Fall back to video only
    return {
      video: await generateCharacterDrivenVideo(bookData),
      audio: {},
      combined: {
        hasAudio: false,
      },
    };
  }
}

/**
 * Get a color palette for different aesthetics
 */
function getColorPaletteForAesthetic(aesthetic) {
  const palettes = {
    'dark-academia': ['#1a1a2e', '#0f3460', '#e94560', '#d4af37'],
    'paranormal-romance': ['#2d1b3d', '#a91d64', '#ff69b4', '#dda0dd'],
    'paranormal-cozy': ['#8b4513', '#daa520', '#d2691e', '#ffa500'],
    'paranormal-dark': ['#0a0e27', '#1a0033', '#ff006e', '#00d4ff'],
    'cozy-fantasy': ['#daa520', '#8b7355', '#f0e68c', '#ffdead'],
    'contemporary': ['#2c3e50', '#3498db', '#95a5a6', '#ffffff'],
    'mystery-thriller': ['#1c1c1c', '#2d3436', '#636e72', '#00b894'],
  };

  return palettes[aesthetic] || palettes['contemporary'];
}

/**
 * Quick preview of which voices would be used for key characters.
 */
export async function previewCharacterVoices(bookData) {
  const voices = getAvailableVoices();
  const recommendation = getVoiceRecommendations(bookData.aesthetic);

  return {
    recommendedVoice: recommendation?.recommendedVoice,
    voices,
  };
}

/**
 * Generate multiple videos (placeholder: currently returns a single standard prompt).
 */
export async function generateAllCharacterVideos(bookData, options = {}) {
  const { count = 1 } = options;
  const videos = [];

  for (let i = 0; i < count; i += 1) {
    // Slightly vary the prompt by appending an index cue
    const video = await generateCharacterDrivenVideo({ ...bookData, promptVariant: i });
    videos.push(video);
  }

  return videos;
}
