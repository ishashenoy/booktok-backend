/**
 * Test ElevenLabs API connection
 */

import 'dotenv/config';
import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

async function testElevenLabs() {
  console.log('🔊 Testing ElevenLabs API Connection\n');
  console.log('API Key:', ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.substring(0, 10)}...` : 'NOT SET');
  
  if (!ELEVENLABS_API_KEY) {
    console.log('\n❌ ELEVENLABS_API_KEY is not set in .env');
    return;
  }

  // Test 1: Check subscription/user info
  console.log('\n📋 Test 1: Checking account status...');
  try {
    const userResponse = await axios.get(`${ELEVENLABS_API_URL}/user/subscription`, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY }
    });
    console.log('✅ Account status:', userResponse.data.tier);
    console.log('   Character count:', userResponse.data.character_count, '/', userResponse.data.character_limit);
  } catch (error) {
    console.log('❌ Account check failed:', error.response?.status, error.response?.data?.detail?.message || error.message);
  }

  // Test 2: List available voices
  console.log('\n📋 Test 2: Listing available voices...');
  try {
    const voicesResponse = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY }
    });
    console.log('✅ Available voices:');
    voicesResponse.data.voices.slice(0, 5).forEach(v => {
      console.log(`   - ${v.name} (${v.voice_id})`);
    });
  } catch (error) {
    console.log('❌ Voice list failed:', error.response?.status, error.response?.data?.detail?.message || error.message);
  }

  // Test 3: Generate a short audio clip
  console.log('\n📋 Test 3: Generating test audio...');
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel - default voice
  try {
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        text: 'Hello, this is a test.',
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
        timeout: 30000,
      }
    );
    console.log('✅ Audio generated successfully!');
    console.log('   Size:', response.data.byteLength, 'bytes');
  } catch (error) {
    console.log('❌ Audio generation failed:', error.response?.status);
    if (error.response?.data) {
      try {
        const errorText = Buffer.from(error.response.data).toString('utf-8');
        console.log('   Error details:', errorText);
      } catch (e) {
        console.log('   Error:', error.message);
      }
    }
  }
}

testElevenLabs();
