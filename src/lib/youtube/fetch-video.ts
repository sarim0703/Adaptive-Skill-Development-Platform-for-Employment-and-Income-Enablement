/**
 * Utility to search for a specific YouTube video using the YouTube Data API v3.
 * Returns the most relevant video matching the search query.
 */

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

/**
 * Post-processes the AI-generated query to ensure vocational quality.
 * Strips noise, appends instructional qualifiers, and enforces negative filters.
 */
function refineQuery(query: string): string {
  let refined = query.trim();

  // 1. Strip redundant LLM-isms or noise words
  const noiseWords = [/video/gi, /search/gi, /query/gi, /find/gi, /"|'/g];
  noiseWords.forEach(word => {
    refined = refined.replace(word, '');
  });

  // 2. Ensure instructional focus
  const hasInstructionalFocus = /tutorial|course|lesson|class|training|guide|how to/i.test(refined);
  if (!hasInstructionalFocus) {
    refined += " practical tutorial";
  }

  // 3. Enforce negative filters to remove low-value content
  const negativeFilters = ["-shorts", "-music", "-vlog", "-gaming", "-review"];
  negativeFilters.forEach(filter => {
    if (!refined.includes(filter)) {
      refined += ` ${filter}`;
    }
  });

  return refined.replace(/\s+/g, ' ').trim();
}

export async function fetchSpecificVideo(query: string, lang: string = 'en'): Promise<YouTubeVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is not defined in environment variables.");
    return null;
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.append("part", "snippet");
    url.searchParams.append("maxResults", "1");
    
    // Use the refined query for the final API call
    const finalQuery = refineQuery(query);
    url.searchParams.append("q", finalQuery);
    
    url.searchParams.append("type", "video");
    // 'medium' enforces videos between 4 and 20 minutes, perfect for micro-learning
    url.searchParams.append("videoDuration", "medium");
    // ENFORCE CLOSED CAPTIONS: This filters out videos with no transcripts or just auto-generated music
    url.searchParams.append("videoCaption", "closedCaption");
    // FORCE ENGLISH SEARCH: Major English videos have the highest quality manual transcripts.
    // GPT-5.4 will translate the resulting quiz into the user's local language later.
    url.searchParams.append("relevanceLanguage", "en");
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
      console.error("YouTube API Error:", data.error.message);
      return null;
    }

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const item = data.items[0];
    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    };
  } catch (error) {
    console.error("Failed to fetch video from YouTube:", error);
    return null;
  }
}
