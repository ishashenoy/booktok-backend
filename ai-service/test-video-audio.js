// Test video compilation with audio
import 'dotenv/config';
import { generateSpeech } from './services/edgeTtsService.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

async function testVideoWithAudio() {
  console.log('🧪 Testing Video Compilation with Audio\n');
  
  const sessionId = crypto.randomBytes(4).toString('hex');
  const tempDir = path.join(process.cwd(), 'temp', `test_${sessionId}`);
  const outputDir = path.join(process.cwd(), 'output');
  
  await fs.mkdir(tempDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  
  // Step 1: Generate audio
  console.log('📝 Step 1: Generating audio...');
  const text = "Welcome to the Midnight Library. A mysterious tale of secrets and forbidden knowledge awaits you.";
  const audioResult = await generateSpeech(text, 'female');
  
  const audioPath = path.join(tempDir, 'audio.mp3');
  await fs.writeFile(audioPath, audioResult.audioBuffer);
  console.log(`✅ Audio saved: ${audioPath} (${audioResult.audioBuffer.length} bytes)`);
  
  // Step 2: Create a simple test image (solid color)
  console.log('\n📝 Step 2: Creating test image...');
  const imagePath = path.join(tempDir, 'image_001.png');
  
  // Use FFmpeg to create a test image
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'color=c=blue:s=768x1024:d=1',
      '-frames:v', '1',
      '-y',
      imagePath
    ]);
    ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error('Image creation failed')));
  });
  console.log(`✅ Test image created: ${imagePath}`);
  
  // Step 3: Compile video with audio
  console.log('\n📝 Step 3: Compiling video with audio...');
  const outputPath = path.join(outputDir, `test_audio_${sessionId}.mp4`);
  
  const args = [
    // Image input
    '-loop', '1',
    '-t', '6', // 6 seconds to match audio
    '-i', imagePath,
    // Audio input
    '-i', audioPath,
    // Map both video and audio
    '-map', '0:v',
    '-map', '1:a',
    // Video settings
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    // Audio settings
    '-c:a', 'aac',
    '-b:a', '192k',
    // Make audio the same length as video, or video same length as audio
    '-shortest',
    // Output
    '-movflags', '+faststart',
    '-y',
    outputPath
  ];
  
  console.log('FFmpeg command:', 'ffmpeg', args.join(' '));
  
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    
    let stderr = '';
    ffmpeg.stderr.on('data', data => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        console.error('FFmpeg stderr:', stderr);
        reject(new Error(`FFmpeg failed with code ${code}`));
      }
    });
  });
  
  console.log(`\n✅ Video created: ${outputPath}`);
  
  // Check file size
  const stats = await fs.stat(outputPath);
  console.log(`📦 Video size: ${(stats.size / 1024).toFixed(1)} KB`);
  
  // Cleanup temp
  await fs.rm(tempDir, { recursive: true });
  
  console.log(`\n🎬 Opening video...`);
  spawn('cmd', ['/c', 'start', outputPath], { shell: true });
}

testVideoWithAudio().catch(console.error);
