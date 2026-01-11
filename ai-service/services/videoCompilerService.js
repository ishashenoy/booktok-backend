/**
 * Video Compiler Service
 * Compiles images and audio into a video using FFmpeg
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temp directory for processing
const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, '..', 'temp');
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '..', 'output');

/**
 * Compile images and audio into a video
 * @param {string[]} imageUrls - Array of image URLs
 * @param {Buffer|string} audioData - Audio buffer or file path
 * @param {object} options - Compilation options
 * @returns {Promise<{videoPath: string, duration: number}>}
 */
export async function compileVideo(imageUrls, audioData, options = {}) {
  const {
    fps = 0.5, // Frames per second (0.5 = each image shows for 2 seconds)
    outputFormat = 'mp4',
    resolution = '768x1024', // 3:4 portrait aspect ratio (default)
    transition = 'fade',
    audioDuration = null,
  } = options;

  // Create unique session ID for this compilation
  const sessionId = crypto.randomBytes(8).toString('hex');
  const sessionDir = path.join(TEMP_DIR, sessionId);
  
  try {
    // Ensure directories exist
    await fs.mkdir(sessionDir, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    console.log(`📁 Created session directory: ${sessionDir}`);

    // Download all images
    const localImages = await downloadAllImages(imageUrls, sessionDir);
    if (localImages.length === 0) {
      throw new Error('No images were downloaded successfully');
    }

    console.log(`📥 Downloaded ${localImages.length} images`);

    // Save audio file
    let audioPath = null;
    if (audioData) {
      audioPath = path.join(sessionDir, 'audio.mp3');
      if (Buffer.isBuffer(audioData)) {
        await fs.writeFile(audioPath, audioData);
      } else if (typeof audioData === 'string') {
        // If it's a URL, download it
        if (audioData.startsWith('http')) {
          const response = await axios.get(audioData, { responseType: 'arraybuffer' });
          await fs.writeFile(audioPath, response.data);
        } else {
          // It's a file path
          audioPath = audioData;
        }
      }
      console.log(`🔊 Audio saved to: ${audioPath}`);
    }

    // Calculate timing
    const imageDuration = audioDuration 
      ? audioDuration / localImages.length 
      : 5; // 5 seconds per image if no audio duration (default for ~15s video with 3 images)

    console.log(`⏱️ Image duration: ${imageDuration.toFixed(2)}s each, Total: ${(localImages.length * imageDuration).toFixed(2)}s`);

    // Create video using FFmpeg
    const outputPath = path.join(OUTPUT_DIR, `video_${sessionId}.${outputFormat}`);
    
    await createVideoWithFFmpeg(localImages, audioPath, outputPath, {
      imageDuration,
      resolution,
      transition,
    });

    console.log(`🎬 Video created: ${outputPath}`);

    // Get video duration
    const duration = localImages.length * imageDuration;

    // Cleanup temp files
    await cleanupSession(sessionDir);

    return {
      videoPath: outputPath,
      duration,
      sessionId,
    };
  } catch (error) {
    console.error('Error compiling video:', error);
    // Cleanup on error
    await cleanupSession(sessionDir).catch(() => {});
    throw error;
  }
}

/**
 * Download all images to local storage
 */
async function downloadAllImages(urls, outputDir) {
  const downloadPromises = urls.map(async (url, index) => {
    try {
      const ext = url.includes('.png') ? 'png' : 'jpg';
      const filename = `image_${String(index).padStart(3, '0')}.${ext}`;
      const filepath = path.join(outputDir, filename);
      
      const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      
      await fs.writeFile(filepath, response.data);
      return filepath;
    } catch (error) {
      console.error(`Failed to download image ${index}:`, error.message);
      return null;
    }
  });

  const results = await Promise.all(downloadPromises);
  return results.filter(r => r !== null);
}

/**
 * Create video using FFmpeg
 */
async function createVideoWithFFmpeg(imagePaths, audioPath, outputPath, options) {
  const { imageDuration, resolution, transition } = options;
  const [width, height] = resolution.split('x').map(Number);

  // Calculate total video duration
  const totalDuration = imagePaths.length * imageDuration;

  return new Promise((resolve, reject) => {
    // Build FFmpeg command using individual inputs with loop
    const args = [];
    
    // Add each image as an input with loop and duration
    imagePaths.forEach((imgPath) => {
      args.push('-loop', '1');
      args.push('-t', String(imageDuration));
      args.push('-i', imgPath);
    });

    // Add audio if available
    const audioInputIndex = imagePaths.length;
    if (audioPath) {
      args.push('-i', audioPath);
      console.log(`🔊 Audio input at index ${audioInputIndex}: ${audioPath}`);
    }

    // Build filter complex to concatenate all images
    const filterInputs = imagePaths.map((_, i) => 
      `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p[v${i}]`
    ).join(';');
    
    const concatInputs = imagePaths.map((_, i) => `[v${i}]`).join('');
    const filterComplex = `${filterInputs};${concatInputs}concat=n=${imagePaths.length}:v=1:a=0[outv]`;
    
    args.push('-filter_complex', filterComplex);
    args.push('-map', '[outv]');

    // Map audio if available
    if (audioPath) {
      args.push('-map', `${audioInputIndex}:a`);
      args.push('-c:a', 'aac');
      args.push('-b:a', '192k');
      // Trim audio to match video duration
      args.push('-t', String(totalDuration));
    }

    // Video encoding settings
    args.push(
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-movflags', '+faststart',
      '-y', // Overwrite output
      outputPath
    );

    console.log('🎥 Running FFmpeg...');
    console.log('📋 FFmpeg command: ffmpeg', args.join(' '));
    
    const ffmpeg = spawn('ffmpeg', args);

    let stderr = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      // Log progress
      const timeMatch = data.toString().match(/time=(\d{2}:\d{2}:\d{2})/);
      if (timeMatch) {
        process.stdout.write(`\r   Encoding: ${timeMatch[1]}`);
      }
    });

    ffmpeg.on('close', (code) => {
      console.log(''); // New line after progress
      if (code === 0) {
        console.log('✅ FFmpeg completed successfully');
        resolve(outputPath);
      } else {
        console.error('❌ FFmpeg failed with code:', code);
        console.error('📋 Last 1500 chars of stderr:');
        console.error(stderr.slice(-1500));
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (error) => {
      console.error('❌ FFmpeg spawn error:', error.message);
      reject(new Error(`FFmpeg error: ${error.message}`));
    });
  });
}

/**
 * Create video with Ken Burns effect (pan/zoom on images)
 */
export async function compileVideoWithEffects(imageUrls, audioData, options = {}) {
  const {
    outputFormat = 'mp4',
    resolution = '1024x576',
    audioDuration = null,
  } = options;

  const sessionId = crypto.randomBytes(8).toString('hex');
  const sessionDir = path.join(TEMP_DIR, sessionId);

  try {
    await fs.mkdir(sessionDir, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const localImages = await downloadAllImages(imageUrls, sessionDir);
    if (localImages.length === 0) {
      throw new Error('No images downloaded');
    }

    // Save audio
    let audioPath = null;
    if (audioData) {
      audioPath = path.join(sessionDir, 'audio.mp3');
      if (Buffer.isBuffer(audioData)) {
        await fs.writeFile(audioPath, audioData);
      } else if (audioData.startsWith?.('http')) {
        const response = await axios.get(audioData, { responseType: 'arraybuffer' });
        await fs.writeFile(audioPath, response.data);
      }
    }

    const imageDuration = audioDuration 
      ? audioDuration / localImages.length 
      : 3;

    const outputPath = path.join(OUTPUT_DIR, `video_${sessionId}.${outputFormat}`);
    const [width, height] = resolution.split('x').map(Number);

    // Build complex filter for Ken Burns effect
    const filters = [];
    const inputs = [];
    
    localImages.forEach((img, i) => {
      inputs.push('-loop', '1', '-t', String(imageDuration), '-i', img);
      
      // Alternate between zoom in and zoom out
      const zoomDir = i % 2 === 0 ? 'in' : 'out';
      const zoomStart = zoomDir === 'in' ? 1 : 1.1;
      const zoomEnd = zoomDir === 'in' ? 1.1 : 1;
      
      filters.push(
        `[${i}:v]scale=8000:-1,zoompan=z='${zoomStart}+(${zoomEnd}-${zoomStart})*on/${imageDuration * 25}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${imageDuration * 25}:s=${width}x${height}:fps=25[v${i}]`
      );
    });

    // Concat all video streams
    const concatInputs = localImages.map((_, i) => `[v${i}]`).join('');
    filters.push(`${concatInputs}concat=n=${localImages.length}:v=1:a=0[outv]`);

    return new Promise((resolve, reject) => {
      const args = [
        ...inputs,
      ];

      if (audioPath) {
        args.push('-i', audioPath);
      }

      args.push(
        '-filter_complex', filters.join(';'),
        '-map', '[outv]',
      );

      if (audioPath) {
        args.push('-map', `${localImages.length}:a`);
        args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
      }

      args.push(
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-movflags', '+faststart',
        '-y',
        outputPath
      );

      const ffmpeg = spawn('ffmpeg', args);
      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', async (code) => {
        await cleanupSession(sessionDir).catch(() => {});
        if (code === 0) {
          resolve({ videoPath: outputPath, duration: localImages.length * imageDuration, sessionId });
        } else {
          reject(new Error(`FFmpeg failed: ${stderr.slice(-500)}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  } catch (error) {
    await cleanupSession(sessionDir).catch(() => {});
    throw error;
  }
}

/**
 * Cleanup temporary session files
 */
async function cleanupSession(sessionDir) {
  try {
    await fs.rm(sessionDir, { recursive: true, force: true });
    console.log(`🧹 Cleaned up: ${sessionDir}`);
  } catch (error) {
    console.warn('Cleanup warning:', error.message);
  }
}

/**
 * Get video file as buffer (for sending to client)
 */
export async function getVideoBuffer(videoPath) {
  return await fs.readFile(videoPath);
}

/**
 * Delete a video file
 */
export async function deleteVideo(videoPath) {
  try {
    await fs.unlink(videoPath);
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
}

/**
 * Check if FFmpeg is available
 */
export async function checkFFmpeg() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    ffmpeg.on('close', (code) => resolve(code === 0));
    ffmpeg.on('error', () => resolve(false));
  });
}
