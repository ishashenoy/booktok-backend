/**
 * Debug script to inspect full response from Gemini Image model
 */

import 'dotenv/config';
import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

async function testImageGeneration() {
  console.log('🧪 Testing Gemini Image Generation Response Format\n');

  const prompt = 'Create a detailed, high-quality image of a moody library with gothic architecture, candlelight, and old books. Dark academia aesthetic.';

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );

    console.log('✅ Response received!');
    console.log(`📊 Total response size: ${JSON.stringify(response.data).length} bytes`);
    
    const data = response.data;
    console.log('\n📋 Top-level keys:', Object.keys(data));
    
    const message = data?.choices?.[0]?.message;
    console.log('\n📋 Message keys:', message ? Object.keys(message) : 'none');
    console.log('📋 Content type:', typeof message?.content);
    console.log('📋 Content length:', message?.content?.length);
    console.log('📋 Content is array:', Array.isArray(message?.content));
    
    // Check for multimodal_content
    if (message?.multimodal_content) {
      console.log('\n🎨 Found multimodal_content!');
      console.log('   Keys:', Object.keys(message.multimodal_content));
      console.log('   First 200 chars:', JSON.stringify(message.multimodal_content).substring(0, 200));
    }

    // Check for parts
    if (message?.parts) {
      console.log('\n🎨 Found parts!');
      console.log('   Length:', message.parts.length);
      message.parts.forEach((part, i) => {
        console.log(`   Part ${i} keys:`, Object.keys(part));
        if (part.inline_data) {
          console.log(`   Part ${i} has inline_data! mime_type:`, part.inline_data.mime_type);
          console.log(`   Part ${i} data length:`, part.inline_data.data?.length);
        }
      });
    }

    // Look for any key containing 'image' or 'data'
    console.log('\n🔍 Searching for image data in response...');
    const responseStr = JSON.stringify(data);
    
    // Check for base64 pattern
    const hasBase64 = responseStr.includes('base64');
    const hasInlineData = responseStr.includes('inline_data');
    const hasImageUrl = responseStr.includes('image_url');
    const hasDataImage = responseStr.includes('data:image');
    
    console.log('   Contains "base64":', hasBase64);
    console.log('   Contains "inline_data":', hasInlineData);  
    console.log('   Contains "image_url":', hasImageUrl);
    console.log('   Contains "data:image":', hasDataImage);

    // Try to find inline_data in the structure
    if (hasInlineData) {
      const inlineMatch = responseStr.match(/"inline_data"\s*:\s*\{[^}]*"data"\s*:\s*"([^"]{100})/);
      if (inlineMatch) {
        console.log('\n✨ Found inline_data pattern! First 100 chars of data:', inlineMatch[1]);
      }
    }

    // Print the raw structure (without the huge data)
    const choices = data.choices?.[0];
    if (choices) {
      const choicesCopy = JSON.parse(JSON.stringify(choices));
      // Truncate any long strings
      const truncate = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string' && obj[key].length > 200) {
            obj[key] = obj[key].substring(0, 200) + `... (${obj[key].length} chars total)`;
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            truncate(obj[key]);
          }
        }
      };
      truncate(choicesCopy);
      console.log('\n📄 Choices structure (truncated):');
      console.log(JSON.stringify(choicesCopy, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testImageGeneration();
