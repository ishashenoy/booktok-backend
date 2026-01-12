# booktok-backend
SheHacks+ 2026 Build

## Overview

BookTok Backend is an AI-powered service that generates video trailers from book summaries. It combines:
- **AI Image Generation** (Gemini)
- **AI Voice Narration** (ElevenLabs)
- **Video Compilation** (FFmpeg)

## Pipeline Flow

1. **Text Processing**: Summary is enhanced into a compelling narration script
2. **Scene Generation**: LLM creates visual scene descriptions
3. **Image Generation**: Gemini generates images for each scene
4. **Voice Synthesis**: ElevenLabs creates voiceover from narration
5. **Video Compilation**: FFmpeg stitches images + audio into final video
