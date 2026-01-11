# booktok-backend
SheHacks+ 2026 Build

## Overview

BookTok Backend is an AI-powered service that generates video trailers from book summaries. It combines:
- **AI Image Generation** (Replicate/Stable Diffusion)
- **AI Voice Narration** (ElevenLabs)
- **Video Compilation** (FFmpeg)

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐
│   Frontend      │────▶│   Main Backend      │
│   (React)       │     │   (Express :3001)   │
└─────────────────┘     └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │   AI Service        │
                        │   (Express :5001)   │
                        ├─────────────────────┤
                        │ • Image Generation  │
                        │ • Voice Synthesis   │
                        │ • Video Compilation │
                        └─────────────────────┘
```

## Quick Start

### Prerequisites

1. **Node.js** (v18+)
2. **FFmpeg** - Required for video compilation
   - Windows: `winget install ffmpeg` or download from https://ffmpeg.org/
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`
3. **MongoDB** - For user data storage

### Installation

```bash
# Install main backend dependencies
npm install

# Install AI service dependencies
cd ai-service
npm install
cd ..
```

### Environment Setup

1. Copy `.env.example` files and configure:

**Main Backend (.env)**
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/booktok
AI_SERVICE_URL=http://localhost:5001
JWT_SECRET=your_jwt_secret
```

**AI Service (ai-service/.env)**
```env
AI_SERVICE_PORT=5001
OPENROUTER_API_KEY=your_key    # or GEMINI_API_KEY
REPLICATE_API_TOKEN=your_key   # For image generation
ELEVENLABS_API_KEY=your_key    # For voice synthesis
```

### Running the Services

```bash
# Terminal 1: Start main backend
npm run dev

# Terminal 2: Start AI service
cd ai-service
npm start
```

## API Reference

### Generate Video from Summary

**POST** `/api/generate/video`

Generate a complete video trailer from a book summary.

**Request:**
```json
{
  "summary": "A young witch discovers she's the heir to a forbidden magical legacy...",
  "title": "The Midnight Garden",
  "aesthetic": "dark-academia",
  "voiceType": "female",
  "quality": "standard"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| summary | string | Yes | Book summary or description |
| title | string | No | Book title (default: "Book Preview") |
| aesthetic | string | No | Visual style: `dark-academia`, `cozy-fantasy`, `paranormal-romance`, `mystery-thriller`, `contemporary`, etc. |
| voiceType | string | No | Narrator voice: `male`, `female`, `mysterious` |
| quality | string | No | Generation quality: `quick` (3 images), `standard` (4), `premium` (6 with effects) |

**Response:**
```json
{
  "success": true,
  "videoUrl": "/videos/video_abc123.mp4",
  "duration": 15,
  "metadata": {
    "title": "The Midnight Garden",
    "aesthetic": "dark-academia",
    "narration": "In the shadows of an ancient academy...",
    "imageCount": 4
  }
}
```

### Health Check

**GET** `/api/generate/health`

Check if the AI service is running and configured.

**Response:**
```json
{
  "aiService": {
    "status": "healthy",
    "ffmpeg": true,
    "imageGeneration": true,
    "voiceGeneration": true
  }
}
```

### Analyze Book

**POST** `/api/generate/analyze`

Analyze a book and get aesthetic recommendations.

**Request:**
```json
{
  "title": "The Midnight Garden",
  "description": "A dark academic mystery...",
  "genres": ["fantasy", "mystery"]
}
```

## Pipeline Flow

1. **Text Processing**: Summary is enhanced into a compelling narration script
2. **Scene Generation**: LLM creates visual scene descriptions
3. **Image Generation**: Stable Diffusion generates images for each scene
4. **Voice Synthesis**: ElevenLabs creates voiceover from narration
5. **Video Compilation**: FFmpeg stitches images + audio into final video

## Service Configuration

### Replicate (Image Generation)
- Sign up at https://replicate.com
- Get API token from account settings
- Uses Stable Diffusion XL for high-quality images

### ElevenLabs (Voice)
- Sign up at https://elevenlabs.io
- Get API key from profile settings
- Uses pre-configured voice IDs for different narration styles

### OpenRouter (LLM)
- Sign up at https://openrouter.ai
- Supports multiple models (Gemini, GPT-4, Claude)
- Fallback to direct Gemini API if configured

## Development

```bash
# Run with hot reload
npm run dev

# Run AI service in watch mode
cd ai-service
npm run dev
```

## Troubleshooting

**"FFmpeg not found"**
- Ensure FFmpeg is installed and in your PATH
- Test with: `ffmpeg -version`

**"AI service unavailable"**
- Make sure the AI service is running on port 5001
- Check `AI_SERVICE_URL` in your .env

**"Image generation failed"**
- Verify REPLICATE_API_TOKEN is set correctly
- Check Replicate dashboard for API usage/limits

## License

MIT
