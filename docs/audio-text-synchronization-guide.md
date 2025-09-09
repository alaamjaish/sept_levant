# Audio-Text Synchronization Implementation Guide

## Overview
This document outlines how to implement synchronized text highlighting during audio playback in the LevantTalk Arabic learning application. When users play exercise recordings, words should highlight in real-time as they are spoken.

## 🎯 Goal
- User plays an exercise recording
- Text highlights word-by-word as audio progresses
- Works automatically for all existing and new recordings
- Admin uploads audio → synchronization happens automatically

## 🔧 Technical Approaches

### Approach 1: Cloud Speech-to-Text with Timestamps (Recommended)

**How it works:**
1. When admin uploads audio, automatically send to speech recognition API
2. Get word-level timestamps from the API
3. Store timestamps alongside text in database
4. During playback, highlight words based on current audio time

**Pros:**
- High accuracy for Arabic
- Automatic generation
- Works with existing recordings
- Professional quality results

**Cons:**
- API costs (~$0.006 per minute for Google)
- Requires internet during upload
- Processing time for new uploads

**APIs to Consider:**
- **Google Speech-to-Text**: Best Arabic support, word timestamps
- **Azure Speech**: Good Arabic dialect support
- **AWS Transcribe**: Reliable but limited Arabic dialects

### Approach 2: Forced Alignment Tools

**How it works:**
1. Use specialized alignment tools (TorchAudio MMS_FA, ARBML/klaam)
2. Input: audio file + known text
3. Output: precise word-level timestamps
4. Store alignment data in database

**Pros:**
- Very accurate since we have the correct text
- No ongoing API costs
- Works offline after setup
- Specialized for Arabic phonetics

**Cons:**
- Complex setup (Python/ML environment)
- Requires server-side processing
- More technical implementation

**Tools:**
- **TorchAudio MMS_FA**: Multilingual forced alignment
- **ARBML/klaam**: Arabic-specific speech tools
- **Montreal Forced Alignment (MFA)**: Popular research tool

### Approach 3: Web Speech API with Estimation

**How it works:**
1. Use browser's Speech Recognition to transcribe during upload
2. Match transcribed words with original text
3. Estimate timing based on speech rate
4. Store estimated timestamps

**Pros:**
- Free and client-side
- No external dependencies
- Quick implementation

**Cons:**
- Less accurate timing
- Browser compatibility issues
- Requires user interaction for microphone

## 🗄️ Database Schema Changes

Add new table for word-level timing data:

```sql
-- New table for word alignment data
CREATE TABLE word_alignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    word_index INTEGER NOT NULL,
    word_text TEXT NOT NULL,
    start_time DECIMAL(10,3) NOT NULL, -- seconds with millisecond precision
    end_time DECIMAL(10,3) NOT NULL,
    confidence DECIMAL(3,2), -- optional confidence score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries during playback
CREATE INDEX idx_word_alignments_exercise_time 
ON word_alignments(exercise_id, start_time);

-- Optional: Add processing status to exercises table
ALTER TABLE exercises 
ADD COLUMN alignment_status TEXT DEFAULT 'pending' 
CHECK (alignment_status IN ('pending', 'processing', 'completed', 'failed'));
```

## 🚀 Implementation Plan

### Phase 1: Basic Infrastructure

1. **Create Word Alignment API**
```typescript
// /api/exercises/generate-alignment
POST /api/exercises/generate-alignment
{
  "exercise_id": "uuid",
  "force_regenerate": false
}
```

2. **Background Processing System**
- Queue system for processing uploads
- Status tracking for alignment generation
- Retry mechanism for failed attempts

3. **React Component for Synchronized Text**
```typescript
interface WordAlignment {
  word_index: number;
  word_text: string;
  start_time: number;
  end_time: number;
}

interface SynchronizedTextProps {
  text: string;
  alignments: WordAlignment[];
  currentTime: number;
  className?: string;
}
```

### Phase 2: Choose and Implement Alignment Method

**Recommended: Google Speech-to-Text Approach**

1. **Server-side Processing Function**
```typescript
// /api/exercises/process-alignment
async function generateWordAlignment(audioUrl: string, originalText: string) {
  const speech = new SpeechClient();
  
  const request = {
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 16000,
      languageCode: 'ar',
      enableWordTimeOffsets: true,
      model: 'latest_long'
    },
    audio: {
      uri: audioUrl // or content for direct upload
    }
  };
  
  const [response] = await speech.longRunningRecognize(request);
  return response.results[0].alternatives[0].words;
}
```

2. **Text Matching Algorithm**
```typescript
function alignTranscriptionWithOriginal(
  originalWords: string[], 
  transcribedWords: any[]
) {
  // Use Levenshtein distance or similar algorithm
  // Match transcribed words with original text
  // Handle Arabic normalization
  return alignedWords;
}
```

### Phase 3: UI Components

1. **SynchronizedText Component**
```tsx
const SynchronizedText: React.FC<SynchronizedTextProps> = ({ 
  text, 
  alignments, 
  currentTime 
}) => {
  const words = text.split(' ');
  
  return (
    <div className="synchronized-text" dir="rtl">
      {words.map((word, index) => {
        const alignment = alignments.find(a => a.word_index === index);
        const isActive = alignment && 
          currentTime >= alignment.start_time && 
          currentTime <= alignment.end_time;
        
        return (
          <span
            key={index}
            className={`word ${isActive ? 'highlighted' : ''}`}
            style={{
              backgroundColor: isActive ? '#0da6f2' : 'transparent',
              transition: 'background-color 0.1s'
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
```

2. **Enhanced Audio Player Integration**
```tsx
// In stitch2/page.tsx
const [wordAlignments, setWordAlignments] = useState<WordAlignment[]>([]);

useEffect(() => {
  if (exercise?.id) {
    fetchWordAlignments(exercise.id);
  }
}, [exercise?.id]);

// In audio timeupdate handler
const onTimeUpdate = () => {
  setAudioTime(audioRef.current?.currentTime || 0);
};
```

### Phase 4: Admin Integration

1. **Automatic Processing Trigger**
```typescript
// When admin uploads new audio
const handleAudioUpload = async (file: File) => {
  // 1. Upload to Supabase storage
  const audioUrl = await uploadAudio(file);
  
  // 2. Update exercise with new audio_url
  await updateExercise({ audio_url: audioUrl });
  
  // 3. Trigger alignment generation
  await fetch('/api/exercises/generate-alignment', {
    method: 'POST',
    body: JSON.stringify({ exercise_id: exercise.id })
  });
  
  // 4. Show processing status to admin
  setAlignmentStatus('processing');
};
```

2. **Processing Status UI**
```tsx
{alignmentStatus === 'processing' && (
  <div className="text-yellow-500">
    🔄 Generating word alignment...
  </div>
)}
{alignmentStatus === 'completed' && (
  <div className="text-green-500">
    ✅ Synchronized text ready
  </div>
)}
```

## 🔧 Technical Considerations

### Arabic Language Specific Challenges

1. **Text Normalization**
```typescript
function normalizeArabicForAlignment(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0671]/g, '') // Remove diacritics
    .replace(/[\u0610-\u061A\u06D6-\u06ED]/g, '') // Remove other marks
    .trim();
}
```

2. **Word Boundary Detection**
```typescript
function splitArabicWords(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.trim());
}
```

3. **Dialect Handling**
- Consider different Arabic dialects in recordings
- May need dialect-specific speech models
- Test with various regional pronunciations

### Performance Optimization

1. **Caching Strategy**
- Cache alignment data in browser
- Preload alignments when exercise loads
- Use service worker for offline availability

2. **Lazy Loading**
- Only process alignments when needed
- Background processing for popular exercises
- Progressive enhancement (works without sync too)

## 💰 Cost Estimation

**Google Speech-to-Text Pricing:**
- $0.006 per minute of audio
- For 1000 exercises × 30 seconds average = 500 minutes
- Cost: ~$3 for 1000 exercises
- Very affordable for the value provided

## 🎯 Implementation Priority

1. **High Priority**: Google Speech-to-Text approach
   - Fastest to implement
   - Most reliable results
   - Handles Arabic well

2. **Medium Priority**: Forced alignment tools
   - Better accuracy but more complex
   - Good for optimization later

3. **Low Priority**: Web Speech API estimation
   - Fallback option only
   - Less accurate but free

## 📝 Next Steps

1. Set up Google Cloud Speech-to-Text API
2. Create database schema for word alignments
3. Build background processing system
4. Implement SynchronizedText component
5. Test with existing Arabic recordings
6. Integrate with admin upload flow
7. Add processing status indicators

## 🧪 Testing Strategy

1. **Test with various Arabic dialects**
2. **Verify timing accuracy** (±200ms acceptable)
3. **Performance testing** with long recordings
4. **Mobile device compatibility**
5. **Network failure handling**

This feature will significantly enhance the learning experience by providing visual feedback that helps users follow along with native pronunciation patterns.