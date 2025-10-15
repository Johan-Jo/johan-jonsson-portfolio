# EP-Whisper Testing Guide

This guide explains how to test the voice interface functionality.

## Prerequisites

### 1. OpenAI API Key

You need an OpenAI API key to use the voice features (Whisper for speech recognition and TTS for text-to-speech).

1. Get your API key from: https://platform.openai.com/api-keys
2. Create a file named `.env.local` in the `app/` directory
3. Add your API key:

```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** 
- The `NEXT_PUBLIC_` prefix is required for the key to work in the browser
- Never commit your actual API key to Git
- See `app/.env.example` for the template

### 2. Install Dependencies

```bash
cd EP-Whisper/app
npm install
```

## Running the Test Interface

### 1. Start the Development Server

```bash
cd EP-Whisper/app
npm run dev
```

The server will start at: **http://localhost:3000**

### 2. Open in Browser

Navigate to http://localhost:3000 in your browser (Chrome or Edge recommended for best Web Audio API support).

## Testing the Voice Interface

The test page has three panels:

### Left Panel: Manual Input
- Enter room dimensions manually
- Generate estimates using the "Skapa offert" button
- Useful for testing the calculation engine independently

### Middle Panel: Voice Interface
This is where you test the voice features:

#### **1. API Key Status**
- Check the status indicator at the top
- ✓ Configured (green) = Ready to use
- ✗ Missing (red) = API key not set

#### **2. Voice Recording**
1. Click **"Börja Spela In"** (Start Recording) to begin
2. Speak in Swedish (e.g., "måla väggarna två gånger")
3. Click **"Sluta Spela In"** (Stop Recording) to finish
4. Wait for transcription (you'll see "Bearbetar...")

#### **3. Voice Activity Detector (VAD)**
- Shows real-time volume levels
- Indicates when voice is detected (green dot)
- Helps you understand if the microphone is picking up your voice

#### **4. Live Transcript**
- Displays the transcribed text in real-time
- Keywords are highlighted by type:
  - 🔵 **Blue**: Tasks (bredspackla, måla, spackla)
  - 🟢 **Green**: Surfaces (vägg, tak, golv, dörr, fönster)
  - 🟣 **Purple**: Quantities (en, två, tre)
  - 🟡 **Yellow**: Modifiers (gång, gånger)
- Click on highlighted words for more information

#### **5. Results History**
- Shows the last 5 voice processing results
- Displays transcription text, confidence level, and processing time
- Useful for debugging and understanding what the system heard

### Right Panel: Estimate Output
- Shows the generated estimate based on manual or voice input
- Displays room geometry calculations
- Lists all painting tasks with prices

## Swedish Test Phrases

Try these Swedish phrases to test the voice recognition:

### Basic Commands
```
"måla väggarna"           (paint the walls)
"måla taket"              (paint the ceiling)
"måla golvet"             (paint the floor)
```

### With Quantities
```
"måla väggarna två gånger"        (paint the walls twice)
"bredspackla väggarna en gång"    (skim coat the walls once)
"grundmåla taket"                 (prime the ceiling)
```

### Complete Room
```
"bredspackla väggarna, grundmåla väggarna, täckmåla väggarna två gånger, måla taket två gånger"
(skim coat walls, prime walls, topcoat walls twice, paint ceiling twice)
```

## Troubleshooting

### Issue: API Key Status Shows "Missing"
**Solution:** 
1. Check that `.env.local` exists in the `app/` directory
2. Verify the key starts with `NEXT_PUBLIC_OPENAI_API_KEY=`
3. Restart the dev server after adding the key

### Issue: "Permission denied" for microphone
**Solution:**
1. Click the microphone icon in your browser's address bar
2. Allow microphone access for localhost
3. Refresh the page and try again

### Issue: No transcription appears
**Solution:**
1. Check browser console (F12) for errors
2. Ensure your API key is valid and has credits
3. Try recording for at least 1-2 seconds
4. Speak clearly and avoid background noise

### Issue: Low confidence scores
**Solution:**
1. Speak more clearly and slowly
2. Move closer to your microphone
3. Reduce background noise
4. Ensure you're speaking Swedish

### Issue: Build errors with `xlsx` module
**Note:** The estimate API currently uses mock data for the demo. This is intentional to avoid Next.js build issues with the `xlsx` library. The voice interface testing doesn't require the Excel functionality.

## Browser Compatibility

- ✅ **Chrome**: Full support (recommended)
- ✅ **Edge**: Full support
- ⚠️ **Firefox**: May have limited Web Audio API support
- ⚠️ **Safari**: May require additional permissions

## What's Being Tested

When you use the voice interface, you're testing:

1. **Microphone Access**: Browser permissions and audio capture
2. **Voice Activity Detection**: Real-time voice detection
3. **Audio Recording**: Converting microphone input to audio files
4. **Whisper ASR**: OpenAI's speech-to-text with Swedish language
5. **Keyword Extraction**: Identifying painting tasks and surfaces
6. **UI Feedback**: Real-time updates and visual indicators
7. **Error Handling**: Graceful handling of API errors and low confidence

## Next Steps

After testing the voice interface:

1. Review the console logs (F12) for detailed processing information
2. Try different Swedish phrases and accents
3. Test with varying room noise levels
4. Report any issues or unexpected behavior
5. The next epic will integrate NLP intent parsing to map voice commands to MEPS tasks

## Support

If you encounter issues:
- Check the browser console (F12) for error messages
- Verify your OpenAI API key is valid
- Ensure you have sufficient API credits
- Try the basic test phrases first before complex commands

---

**Tip:** The voice interface is designed for Swedish language input. Speaking in other languages may result in poor recognition or low confidence scores.

