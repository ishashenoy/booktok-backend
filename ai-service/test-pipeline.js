/**
 * Test script for the Book Video Pipeline
 * 
 * Run with: node test-pipeline.js
 */

import 'dotenv/config';
import { generateVideoFromSummary, checkPipelineHealth } from './services/bookVideoPipeline.js';

async function runTest() {
  console.log('🧪 BookTok Video Pipeline Test\n');
  console.log('='.repeat(50));

  // Step 1: Check pipeline health
  console.log('\n📋 Step 1: Checking pipeline health...\n');
  const health = await checkPipelineHealth();
  console.log('Pipeline Status:');
  console.log(`  ✅ FFmpeg: ${health.ffmpeg ? 'Available' : '❌ Not found'}`);
  console.log(`  ${health.imageGeneration ? '✅' : '⚠️'} Image Generation: ${health.imageGeneration ? 'Configured' : 'Not configured (will use placeholders)'}`);
  console.log(`  ${health.voiceGeneration ? '✅' : '⚠️'} Voice Generation: ${health.voiceGeneration ? 'Configured' : 'Not configured (will be silent)'}`);
  console.log(`  Overall: ${health.ready ? '✅ Ready' : '❌ Not ready'}`);

  if (!health.ffmpeg) {
    console.log('\n❌ FFmpeg is required. Please install it and restart your terminal.');
    console.log('   Windows: winget install ffmpeg');
    console.log('   Then restart your terminal/VS Code');
    process.exit(1);
  }

  // Step 2: Test video generation
  console.log('\n📋 Step 2: Generating test video...\n');
  
  const testData = {
    summary: `In the shadowed halls of Ravencroft Academy, eighteen-year-old Elena discovers 
    an ancient library hidden beneath the school. Within its dusty tomes, she finds a journal 
    belonging to her grandmother—a woman she was told died decades ago. But the journal speaks 
    of forbidden magic, secret societies, and a darkness awakening beneath the academy. 
    As Elena unravels the truth, she must choose between the life she knows and the 
    dangerous legacy she was born to inherit.`,
    title: "The Midnight Library",
    aesthetic: "dark-academia",
    voiceType: "female",
    numImages: 3, // Use fewer images for faster testing
  };

  console.log(`📖 Title: ${testData.title}`);
  console.log(`🎨 Aesthetic: ${testData.aesthetic}`);
  console.log(`📝 Summary: ${testData.summary.substring(0, 100)}...`);
  console.log('\n⏳ This may take 1-3 minutes...\n');

  const startTime = Date.now();
  
  try {
    const result = await generateVideoFromSummary(testData);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (result.success) {
      console.log('\n' + '='.repeat(50));
      console.log('🎉 SUCCESS! Video generated!');
      console.log('='.repeat(50));
      console.log(`\n📁 Video saved to: ${result.videoPath}`);
      console.log(`⏱️  Generation time: ${elapsed} seconds`);
      console.log(`📹 Duration: ${result.duration} seconds`);
      console.log(`\n📊 Metadata:`);
      console.log(`   - Images used: ${result.metadata.imageCount}`);
      console.log(`   - Narration: "${result.metadata.narration.substring(0, 80)}..."`);
      console.log('\n✨ Open the video file to view your generated book trailer!');
    } else {
      console.log('\n❌ Video generation failed:');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

// Run the test
runTest().catch(console.error);
