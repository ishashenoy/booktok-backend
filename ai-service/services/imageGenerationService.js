/**
 * Image Generation Service
 * Generates images from text prompts using Gemini Image via OpenRouter
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

/**
 * Generate multiple images for a book summary using Nano Banana via OpenRouter
 * @param {string} summary - Book summary text
 * @param {string} aesthetic - Visual aesthetic (dark-academia, cozy-fantasy, etc.)
 * @returns {Promise<string[]>} Array of image URLs or base64 data
 */
export async function generateImagesFromSummary(summary, aesthetic = 'cinematic') {
    const numImages = 4;

  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️ OpenRouter API not configured. Using placeholder images.');
    return generatePlaceholderImages(numImages);
  }

  try {
    // Generate scene prompts from summary
    const scenePrompts = await generateScenePrompts(summary, aesthetic, numImages);
    
    // Generate images in parallel
    const imagePromises = scenePrompts.map((prompt, index) => 
      generateSingleImage(prompt, aesthetic, index)
    );
    
    const images = await Promise.all(imagePromises);
    return images.filter(img => img !== null);
  } catch (error) {
    console.error('Error generating images:', error);
    return generatePlaceholderImages(numImages);
  }
}

/**
 * Generate scene prompts from a summary using LLM
 */
async function generateScenePrompts(summary, aesthetic, numScenes) {
  const { generateText } = await import('./llmClient.js');
  
  const styleGuide = getStyleGuide(aesthetic);
  
  const prompt = `You are a visual director. Create ${numScenes} distinct scene descriptions for a book trailer video.

Book Summary: "${summary}"

Visual Style: ${styleGuide}

Create ${numScenes} scenes that tell the story visually. Each scene should be a detailed image description (50-80 words) suitable for AI image generation.

Respond ONLY with a JSON array of strings:
["Scene 1 description...", "Scene 2 description...", ...]

Focus on:
- Vivid visual details
- Mood and atmosphere
- Character positioning (but no specific faces)
- Lighting and color palette
- Camera angle/composition`;

  try {
    const response = await generateText(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const scenes = JSON.parse(jsonMatch[0]);
      return scenes.slice(0, numScenes);
    }
  } catch (error) {
    console.error('Error generating scene prompts:', error);
  }
  
  // Fallback: create generic scenes
  return generateFallbackScenes(summary, numScenes);
}

/**
 * Generate a single image using Gemini Image via OpenRouter
 */
async function generateSingleImage(prompt, aesthetic, index) {
  const styleGuide = getStyleGuide(aesthetic);
  const fullPrompt = `Create a detailed, high-quality image of this scene in 3:4 portrait aspect ratio (768x1024 pixels): ${prompt}. Style: ${styleGuide}, cinematic lighting, high quality, detailed, 4k resolution. The image MUST be in portrait orientation (taller than wide, 3:4 ratio). Output only the generated image.`;
  
  try {
    console.log(`🎨 Generating image ${index + 1}: ${prompt.substring(0, 50)}...`);
    
    // Using Gemini 3 Pro Image Preview via OpenRouter for image generation
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: fullPrompt
              }
            ]
          }
        ],
        // Request specific modalities
        modalities: ['image', 'text'],
        max_tokens: 4096,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'BookTok',
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2 minute timeout for image generation
      }
    );

    // Log response info for debugging  
    const responseStr = JSON.stringify(response.data);
    console.log(`📦 Response for image ${index + 1}: ${(responseStr.length / 1024 / 1024).toFixed(2)} MB`);

    // Extract image from response
    const message = response.data?.choices?.[0]?.message;
    
    // Check for images array (Gemini returns images in this field)
    if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
      const imageData = message.images[0];
      if (imageData?.image_url?.url) {
        console.log(`✅ Image ${index + 1} generated (images array)`);
        return imageData.image_url.url;
      }
    }
    
    const content = message?.content;
    
    // Handle array content (multipart response with text and image)
    if (Array.isArray(content)) {
      for (const part of content) {
        // Check for inline_data (base64 image)
        if (part.type === 'image' && part.image_url?.url) {
          console.log(`✅ Image ${index + 1} generated (multipart image_url)`);
          return part.image_url.url;
        }
        if (part.inline_data?.data) {
          const mimeType = part.inline_data.mime_type || 'image/png';
          console.log(`✅ Image ${index + 1} generated (inline_data)`);
          return `data:${mimeType};base64,${part.inline_data.data}`;
        }
        // Check for base64 in the part itself
        if (part.type === 'image_url' && part.image_url?.url) {
          console.log(`✅ Image ${index + 1} generated (image_url in array)`);
          return part.image_url.url;
        }
      }
    }
    
    // Handle string content
    if (typeof content === 'string' && content) {
      // Check if it's a URL or base64
      if (content.startsWith('http')) {
        console.log(`✅ Image ${index + 1} generated (URL)`);
        return content;
      } else if (content.startsWith('data:image')) {
        console.log(`✅ Image ${index + 1} generated (base64)`);
        return content;
      } else {
        // Try to extract URL from markdown or text
        const urlMatch = content.match(/https?:\/\/[^\s\)\]"']+/i);
        if (urlMatch) {
          console.log(`✅ Image ${index + 1} generated (extracted URL)`);
          return urlMatch[0];
        }
        // Try to extract base64 from text
        const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (base64Match) {
          console.log(`✅ Image ${index + 1} generated (extracted base64)`);
          return base64Match[0];
        }
      }
    }

    // Check for image in different response formats
    if (response.data?.data?.[0]?.url) {
      console.log(`✅ Image ${index + 1} generated (data URL)`);
      return response.data.data[0].url;
    }

    if (response.data?.data?.[0]?.b64_json) {
      console.log(`✅ Image ${index + 1} generated (data b64)`);
      return `data:image/png;base64,${response.data.data[0].b64_json}`;
    }

    console.warn(`⚠️ Image ${index + 1}: Unexpected response format`);
    return null;
  } catch (error) {
    console.error(`Error generating image ${index + 1}:`, error.response?.data || error.message);
    
    // Try alternative image generation model
    return await generateImageFallback(fullPrompt, index);
  }
}

/**
 * Fallback image generation using different OpenRouter model
 */
async function generateImageFallback(prompt, index) {
  try {
    console.log(`🔄 Trying fallback image generation for image ${index + 1}...`);
    
    // Try with a different image model available on OpenRouter
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/images/generations`,
      {
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        prompt: prompt,
        n: 1,
        size: '1024x576',
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'BookTok',
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );

    if (response.data?.data?.[0]?.url) {
      console.log(`✅ Image ${index + 1} generated via fallback`);
      return response.data.data[0].url;
    }

    return null;
  } catch (error) {
    console.error(`Fallback also failed for image ${index + 1}:`, error.message);
    return null;
  }
}

/**
 * Download image from URL to local file
 */
export async function downloadImage(url, outputPath) {
  try {
    // Handle base64 data URLs
    if (url.startsWith('data:image')) {
      const base64Data = url.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.writeFile(outputPath, buffer);
      return outputPath;
    }
    
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(outputPath, response.data);
    return outputPath;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

/**
 * Get style guide for different aesthetics
 */
function getStyleGuide(aesthetic) {
  const styles = {
    'dark-academia': 'dark moody lighting, vintage academic setting, rich browns and deep greens, mysterious atmosphere, gothic architecture, candlelight, old books',
    'paranormal-romance': 'ethereal lighting, magical atmosphere, soft focus romance, supernatural elements, misty background, moonlight, passionate mood',
    'paranormal-cozy': 'warm magical lighting, cozy interior, magical creatures, soft colors, enchanted objects, whimsical atmosphere, comfort and wonder',
    'paranormal-dark': 'dark supernatural atmosphere, ominous lighting, horror elements, deep shadows, eerie mood, gothic, dangerous beauty',
    'cozy-fantasy': 'warm golden lighting, fantasy village, magical creatures, enchanted forest, soft warm colors, inviting atmosphere, whimsical details',
    'contemporary': 'modern realistic setting, natural lighting, urban or suburban backdrop, relatable spaces, authentic mood, clean composition',
    'mystery-thriller': 'dramatic shadows, noir lighting, suspenseful atmosphere, urban night scenes, rain-slicked streets, mysterious mood, tension',
    'cinematic': 'cinematic composition, dramatic lighting, film grain, movie-like quality, professional cinematography, epic scale',
  };
  
  return styles[aesthetic] || styles['cinematic'];
}

/**
 * Generate fallback scene descriptions
 */
function generateFallbackScenes(summary, numScenes) {
  const scenes = [
    `Opening scene establishing the world and mood of the story: ${summary.substring(0, 100)}`,
    `A pivotal moment showing the main characters in their environment`,
    `Rising tension or conflict scene with dramatic lighting`,
    `Climactic moment capturing the emotional peak of the story`,
    `Resolution or hook scene leaving viewers wanting more`,
  ];
  
  return scenes.slice(0, numScenes);
}

/**
 * Generate placeholder images when API is not available
 */
function generatePlaceholderImages(count) {
  const placeholders = [];
  for (let i = 0; i < count; i++) {
    // Using picsum for placeholder images (3:4 portrait ratio)
    placeholders.push(`https://picsum.photos/768/1024?random=${Date.now()}-${i}`);
  }
  return placeholders;
}

/**
 * Check if the service is configured (uses OpenRouter for image generation)
 */
export function isConfigured() {
  return !!OPENROUTER_API_KEY;
}
