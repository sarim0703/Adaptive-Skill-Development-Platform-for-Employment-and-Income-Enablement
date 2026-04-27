import { NextRequest, NextResponse } from "next/server";

// ── In-Memory Cache (1 hour TTL) ──
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

function getCacheKey(search: string, location: string, city: string) {
  return `${search}|${location}|${city}`.toLowerCase();
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search");
  const location = searchParams.get("location") || "India";
  const city = searchParams.get("city") || "";

  if (!search) {
    return NextResponse.json({ error: "Missing search parameter" }, { status: 400 });
  }

  // ── Check Cache ──
  const cacheKey = getCacheKey(search, location, city);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Jobs API] Cache HIT for "${cacheKey}"`);
    return NextResponse.json(cached.data);
  }

  try {
    const origin = req.nextUrl.origin;
    const pythonUrl = `${origin}/api/fetch_jobs?q=${encodeURIComponent(search)}&l=${encodeURIComponent(location)}&c=${encodeURIComponent(city)}`;
    
    console.log(`[Jobs API] Cache MISS. Calling internal Python function: ${pythonUrl}`);
    
    const response = await fetch(pythonUrl, {
      signal: AbortSignal.timeout(60000) // 60s timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python function failed (${response.status}): ${errorText.slice(0, 100)}`);
    }
    
    const parsedData = await response.json();
    
    // ── Store in Cache ──
    cache.set(cacheKey, { data: parsedData, timestamp: Date.now() });
    
    // Prune old cache entries (keep max 50)
    if (cache.size > 50) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < cache.size - 50; i++) {
        cache.delete(oldest[i][0]);
      }
    }
    
    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error("[Jobs API] Fatal error:", error.message?.slice(0, 300));
    return NextResponse.json(
      { error: "Failed to fetch live jobs. The Python bridge encountered an error or timed out." }, 
      { status: 500 }
    );
  }
}
