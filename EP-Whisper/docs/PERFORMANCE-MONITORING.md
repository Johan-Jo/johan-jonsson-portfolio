# Performance Monitoring System

## Overview

EP-Whisper now includes a comprehensive performance monitoring system to identify bottlenecks and optimize response times in the voice processing pipeline.

## Features

### 📊 Real-time Performance Tracking
- Monitors every step of the voice processing pipeline
- Tracks timing for:
  - Audio validation
  - Whisper transcription (API call + processing)
  - Text-to-Speech generation (API call + buffer creation)
  - Conversation processing (parsing + state management)
  - Overall voice input processing

### 🔍 Bottleneck Detection
- Automatically identifies operations taking > 1000ms
- Highlights steps consuming > 30% of total processing time
- Visual indicators for performance issues

### 📈 Visual Performance Panel
- Floating UI panel accessible from any page
- Real-time performance metrics
- Bar charts showing time distribution
- Percentage breakdown for each operation
- Clear bottleneck warnings

## How to Use

### 1. Enable Performance Monitoring

Performance monitoring is automatically enabled in development mode. To enable in production:

```bash
# In your .env.local file
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

### 2. View Performance Metrics

1. Open the EP-Whisper app in your browser
2. Use the voice interface (speak to the microphone)
3. Look for the **⏱️ Performance** button in the bottom-right corner
4. Click to toggle the performance panel

### 3. Interpret the Results

The performance panel shows:

- **Total Duration**: Overall time for voice processing
- **Breakdown**: Each step with:
  - Duration in milliseconds
  - Percentage of total time
  - Visual bar chart
- **Bottlenecks**: Steps highlighted in red that need optimization

## Performance Metrics

### Typical Timings (Expected)

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| Audio Validation | 1-5ms | Should be instant |
| Whisper API Call | 1000-3000ms | Network + AI processing |
| TTS API Call | 500-1500ms | Network + audio generation |
| Conversation Processing | 10-50ms | Local text parsing |
| **Total** | **1500-4500ms** | End-to-end voice interaction |

### Bottleneck Thresholds

- ⚠️ Warning: Operations > 1000ms
- 🔴 Critical: Operations > 30% of total time

## Common Bottlenecks & Solutions

### 1. Whisper Transcription Slow (> 3000ms)
**Causes:**
- Large audio buffer
- Network latency
- OpenAI API delays

**Solutions:**
- Reduce audio quality/duration
- Implement audio compression
- Use edge functions closer to OpenAI servers
- Consider caching common phrases

### 2. TTS Generation Slow (> 2000ms)
**Causes:**
- Long text responses
- Network latency
- Multiple TTS calls

**Solutions:**
- Disable confirmation audio for some steps
- Pre-generate common responses
- Use browser TTS for simple confirmations
- Implement TTS caching

### 3. Overall Latency High (> 5000ms)
**Causes:**
- Sequential API calls
- Excessive validation
- Slow parsing logic

**Solutions:**
- Parallelize independent operations
- Optimize text parsing algorithms
- Consider WebSocket for real-time communication
- Implement progressive responses

## API Integration

### Using Performance Monitoring in Code

```typescript
import { perfMonitor, measureAsync } from '@/lib/monitoring/performance';

// Manual tracking
perfMonitor.start('my-operation');
// ... do work ...
perfMonitor.end('my-operation');

// Async function tracking
const result = await measureAsync(
  'database-query',
  async () => {
    return await db.query(sql);
  },
  { table: 'users' } // Optional metadata
);

// Generate report
const report = perfMonitor.generateReport();
console.log(report.summary);

// Clear metrics
perfMonitor.clear();
```

### Performance Events

The system tracks these key events:

1. **`voice.processInput`** - Complete voice processing pipeline
2. **`voice.validateAudio`** - Audio buffer validation
3. **`whisper.transcribe`** - Full transcription process
4. **`whisper.api_call`** - Actual OpenAI API call
5. **`tts.generate`** - Complete TTS generation
6. **`tts.api_call`** - OpenAI TTS API call
7. **`conversation.process`** - Conversation state processing
8. **`conversation.handle_*`** - Individual step handlers

## Advanced Features

### Export Performance Data

```typescript
import { perfMonitor } from '@/lib/monitoring/performance';

// Get all metrics
const metrics = perfMonitor.getAllMetrics();

// Export to JSON
const json = JSON.stringify(metrics, null, 2);

// Send to analytics service
fetch('/api/analytics', {
  method: 'POST',
  body: json
});
```

### Custom Performance Tracking

```typescript
// Track custom operations
perfMonitor.start('estimate-calculation', {
  roomSize: '20m²',
  tasks: 5
});

// ... calculate estimate ...

perfMonitor.end('estimate-calculation', {
  success: true,
  totalCost: 15000
});
```

## Optimization Roadmap

Based on performance monitoring data, here are planned optimizations:

### Phase 1: Quick Wins
- [ ] Cache common TTS responses
- [ ] Implement optimistic UI updates
- [ ] Reduce confirmation audio for simple steps
- [ ] Parallel API calls where possible

### Phase 2: Infrastructure
- [ ] Edge functions for API calls
- [ ] WebSocket for real-time communication
- [ ] Audio compression before upload
- [ ] Response streaming

### Phase 3: Advanced
- [ ] Supabase for caching and state
- [ ] Pre-computed room calculations
- [ ] ML-based response prediction
- [ ] Progressive Web App offline support

## Troubleshooting

### Performance Panel Not Showing
- Check that you're in development mode or `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true`
- Ensure at least one voice interaction has completed
- Check browser console for errors

### Inaccurate Timings
- Performance metrics use `performance.now()` for high precision
- Network timings include full round-trip
- Some operations may overlap (tracked separately)

### Memory Concerns
- Metrics are cleared on each new voice interaction
- Only last interaction is tracked
- No persistent storage by default

## Future Enhancements

- [ ] Historical performance tracking
- [ ] Performance regression detection
- [ ] Automated optimization suggestions
- [ ] Integration with analytics platforms
- [ ] A/B testing for optimizations
- [ ] Real-user monitoring (RUM)

---

**Next Steps:**
1. Test the voice interface
2. Review the performance panel
3. Identify your specific bottlenecks
4. Implement targeted optimizations
5. Monitor improvements over time

