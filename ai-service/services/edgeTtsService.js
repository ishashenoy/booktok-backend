/**
 * Google TTS Service (Free)
 * Free Text-to-Speech using Google's unofficial API
 * No API key required!
 */

import gTTS from 'gtts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temp directory for audio files
const TEMP_DIR = path.join(__dirname, '..', 'temp');

/**
 * Generate speech from text using Google TTS
 * @param {string} text - Text to convert to speech
 * @param {string} voiceType - Voice type (not used for gTTS, but kept for compatibility)
 * @returns {Promise<{audioBuffer: Buffer, duration: number}>}
 */
export async function generateSpeech(text, voiceType = 'female') {
  try {
    console.log(`🎤 Generating speech with Google TTS...`);
    
    // Ensure temp directory exists
    await fs.mkdir(TEMP_DIR, { recursive: true });
    
    // Create unique temp file
    const tempId = crypto.randomBytes(8).toString('hex');
    const tempPath = path.join(TEMP_DIR, `tts_${tempId}.mp3`);
    
    // Generate speech
    const gtts = new gTTS(text, 'en');
    
    await new Promise((resolve, reject) => {
      gtts.save(tempPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Read the file into a buffer
    const audioBuffer = await fs.readFile(tempPath);
    
    // Clean up temp file
    await fs.unlink(tempPath).catch(() => {});
    
    // Calculate approximate duration
    const duration = calculateSpeakingDuration(text);
    
    console.log(`✅ Google TTS audio generated (${audioBuffer.length} bytes)`);
    
    return {
      audioBuffer,
      duration,
    };
  } catch (error) {
    console.error('Google TTS error:', error);
    throw error;
  }
}

/**
 * Generate speech and save to file
 * @param {string} text - Text to convert to speech
 * @param {string} outputPath - Path to save the audio file
 * @param {string} voiceType - Voice type (not used for gTTS)
 * @returns {Promise<{filePath: string, duration: number}>}
 */
export async function generateSpeechToFile(text, outputPath, voiceType = 'female') {
  try {
    console.log(`🎤 Generating speech with Google TTS...`);
    
    const gtts = new gTTS(text, 'en');
    
    await new Promise((resolve, reject) => {
      gtts.save(outputPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    const duration = calculateSpeakingDuration(text);
    
    console.log(`✅ Google TTS audio saved to: ${outputPath}`);
    
    return {
      filePath: outputPath,
      duration,
    };
  } catch (error) {
    console.error('Google TTS error:', error);
    throw error;
  }
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
 * Get available languages (for reference)
 */
export function getAvailableLanguages() {
  return ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh-CN'];
}

export default {
  generateSpeech,
  generateSpeechToFile,
  getAvailableLanguages,
};
