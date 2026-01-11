/**
 * Book Video Pipeline Service
 * 
 * Complete pipeline: Text Summary → Images + Voice → Video
 * 
 * This service orchestrates the entire video generation process:
 * 1. Takes a book summary/prompt from frontend
 * 2. Generates scene images using AI
 * 3. Generates voiceover narration using ElevenLabs
 * 4. Compiles everything into a final video using FFmpeg
 */

import { generateImagesFromSummary, isConfigured as isImageConfigured } from './imageGenerationService.js';
import { generateSummaryAudio, isConfigured as isVoiceConfigured } from './elevenlabsService.js';
import { compileVideo, compileVideoWithEffects, getVideoBuffer, deleteVideo, checkFFmpeg } from './videoCompilerService.js';
import { generateText } from './llmClient.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for narration
const NARRATOR_VOICES = {
  male: 'JBFqnCBsd6RMkjVY3EL8',      // Professional narrator
  female: 'EXAVITQu4vr4xnSDxMaL',    // Female narrator
  mysterious: 'nPczCjzI2devNBz1zQrb', // Deep mysterious voice
};

/**
 * Main pipeline function: Generate video from book summary
 * 
 * @param {object} params - Pipeline parameters
 * @param {string} params.summary - Book summary or description
 * @param {string} params.title - Book title (optional)
 * @param {string} params.aesthetic - Visual style (dark-academia, cozy-fantasy, etc.)
 * @param {string} params.voiceType - Voice type (male, female, mysterious)
 * @param {number} params.numImages - Number of images/scenes (default 4)
 * @param {boolean} params.useEffects - Use Ken Burns effect (default false)
 * @returns {Promise<{success: boolean, videoBuffer?: Buffer, videoPath?: string, error?: string}>}
 */
export async function generateVideoFromSummary(params) {
  const {
    summary,
    title = 'Book Preview',
    aesthetic = 'cinematic',
    voiceType = 'female',
    numImages = 4,
    useEffects = false,
  } = params;

  console.log('🎬 Starting video generation pipeline...');
  console.log(`📖 Title: ${title}`);
  console.log(`🎨 Aesthetic: ${aesthetic}`);
  console.log(`🖼️ Images: ${numImages}`);

  // Validate FFmpeg availability
  const ffmpegAvailable = await checkFFmpeg();
  if (!ffmpegAvailable) {
    return {
      success: false,
      error: 'FFmpeg is not installed or not available in PATH. Please install FFmpeg to generate videos.',
    };
  }

  try {
    // Step 1: Enhance the summary for narration
    console.log('\n📝 Step 1: Preparing narration script...');
    const narrationScript = await prepareNarrationScript(summary, title);
    console.log(`✅ Narration: "${narrationScript.substring(0, 100)}..."`);

    // Step 2: Generate images from the summary
    console.log('\n🎨 Step 2: Generating images...');
    const imageUrls = await generateImagesFromSummary(summary, aesthetic, numImages);
    console.log(`✅ Generated ${imageUrls.length} images`);

    // Step 3: Generate voiceover
    console.log('\n🔊 Step 3: Generating voiceover...');
    const audioResult = await generateVoiceover(narrationScript, voiceType);
    console.log(`✅ Voiceover generated (${audioResult.duration}s)`);

    // Step 4: Compile video
    console.log('\n🎥 Step 4: Compiling video...');
    const compileFunc = useEffects ? compileVideoWithEffects : compileVideo;
    const videoResult = await compileFunc(imageUrls, audioResult.audioBuffer, {
      audioDuration: audioResult.duration,
      resolution: '768x1024', // 3:4 portrait aspect ratio
    });
    console.log(`✅ Video compiled: ${videoResult.videoPath}`);

    // Step 5: Read video buffer for response
    const videoBuffer = await getVideoBuffer(videoResult.videoPath);

    return {
      success: true,
      videoPath: videoResult.videoPath,
      videoBuffer,
      duration: videoResult.duration,
      metadata: {
        title,
        aesthetic,
        narration: narrationScript,
        imageCount: imageUrls.length,
        sessionId: videoResult.sessionId,
      },
    };
  } catch (error) {
    console.error('❌ Pipeline error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate video',
    };
  }
}

/**
 * Prepare narration script from summary
 */
async function prepareNarrationScript(summary, title) {
  // If summary is short enough, use it directly
  if (summary.length <= 300) {
    return `${title}. ${summary}`;
  }

  // Use LLM to create a compelling narration
  try {
    const prompt = `Create a compelling 30-second voiceover narration for a book trailer.

Book Title: "${title}"
Summary: ${summary}

Requirements:
- Keep it under 100 words (approximately 30 seconds when spoken)
- Make it dramatic and engaging
- Don't give away major spoilers
- End with a hook that makes viewers want to read the book
- Do NOT include any stage directions or speaker notes

Respond ONLY with the narration text, nothing else.`;

    const narration = await generateText(prompt);
    return narration.trim() || `${title}. ${summary.substring(0, 250)}...`;
  } catch (error) {
    console.error('Error preparing narration:', error);
    return `${title}. ${summary.substring(0, 250)}...`;
  }
}

/**
/**
 * Generate voiceover audio using ElevenLabs
 */
async function generateVoiceover(text, voiceType = 'female') {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in .env file.');
  }

  const voiceId = NARRATOR_VOICES[voiceType] || NARRATOR_VOICES.female;

  console.log('🎤 Generating voiceover with ElevenLabs...');
  const response = await axios.post(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    },
    {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
      timeout: 60000,
    }
  );

  const audioBuffer = Buffer.from(response.data);
  const duration = calculateSpeakingDuration(text);
  console.log('✅ ElevenLabs TTS successful');

  return {
    audioBuffer,
    duration,
  };
}

/**
 * Calculate approximate speaking duration
 */
function calculateSpeakingDuration(text) {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 2.5; // Average speaking rate
  return Math.ceil(wordCount / wordsPerSecond);
}

/**
 * Quick generation - uses fewer images for faster results
 */
export async function generateQuickVideo(params) {
  return generateVideoFromSummary({
    ...params,
    numImages: 3,
    useEffects: false,
  });
}

/**
 * Premium generation - uses more images with effects
 */
export async function generatePremiumVideo(params) {
  return generateVideoFromSummary({
    ...params,
    numImages: 6,
    useEffects: true,
  });
}

/**
 * Check pipeline health
 */
export async function checkPipelineHealth() {
  const ffmpegAvailable = await checkFFmpeg();
  
  return {
    ffmpeg: ffmpegAvailable,
    imageGeneration: isImageConfigured(),
    voiceGeneration: isVoiceConfigured(),
    ready: ffmpegAvailable, // Minimum requirement is FFmpeg
  };
}

/**
 * Cleanup generated video
 */
export async function cleanupVideo(videoPath) {
  return await deleteVideo(videoPath);
}
