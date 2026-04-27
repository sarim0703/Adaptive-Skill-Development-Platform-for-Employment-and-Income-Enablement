import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Fetches the full transcript for a specific YouTube video ID.
 * Concatenates all transcript segments into a single string.
 */
export async function fetchVideoTranscript(videoId: string, lang: string = 'en'): Promise<string | null> {
  try {
    // Attempt to fetch the transcript in the requested language, 
    // or fallback to whatever is available.
    let segments;
    try {
      // First attempt: specifically request the target language
      const transcriptConfig = lang ? { lang } : undefined;
      segments = await YoutubeTranscript.fetchTranscript(videoId, transcriptConfig);
    } catch (langError) {
      // Second attempt: Fallback to whatever default language the video actually has
      console.warn(`[Transcript] Language '${lang}' not found for ${videoId}. Falling back to default.`);
      segments = await YoutubeTranscript.fetchTranscript(videoId);
    }
    
    if (!segments || segments.length === 0) {
      return null;
    }

    // Concatenate text segments and clean up whitespace
    return segments
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
      
  } catch (error) {
    console.warn(`Could not fetch transcript for video ${videoId}:`, error);
    
    // Some videos don't have captions. 
    // In a production app, we would handle this with a fallback or a transcription service.
    return null;
  }
}
