// Quick test of Google TTS and audio file creation
import 'dotenv/config';
import { generateSpeech } from './services/edgeTtsService.js';
import fs from 'fs/promises';
import path from 'path';

async function testAudio() {
  console.log('🧪 Testing Google TTS...\n');
  
  const text = "Welcome to the Midnight Library, a mysterious tale of secrets and forbidden knowledge.";
  
  try {
    const result = await generateSpeech(text, 'female');
    
    console.log('Audio buffer size:', result.audioBuffer.length, 'bytes');
    console.log('Estimated duration:', result.duration, 'seconds');
    
    // Save to file for testing
    const testPath = path.join(process.cwd(), 'test-audio.mp3');
    await fs.writeFile(testPath, result.audioBuffer);
    console.log('\n✅ Audio saved to:', testPath);
    console.log('Try playing it: start test-audio.mp3');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAudio();
