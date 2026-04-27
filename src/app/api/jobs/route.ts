import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

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
    const scriptPath = path.join(process.cwd(), "scripts", "fetch_jobs_api.py");
    
    // Pass city as 3rd argument to the Python scraper
    const command = `python "${scriptPath}" "${search}" "${location}" "${city}"`;
    
    console.log(`[Jobs API] Cache MISS. Executing: ${command}`);
    
    const { stdout, stderr } = await execAsync(command, { 
      maxBuffer: 1024 * 1024 * 10,
      timeout: 60000 // 60s timeout for scraping
    });
    
    if (stderr && !stderr.includes("FutureWarning") && !stderr.includes("UserWarning") && !stderr.includes("DeprecationWarning")) {
      console.warn("[Jobs API] Python warning:", stderr.slice(0, 200));
    }
    
    // Extract JSON from output (skip any stray log lines)
    let jsonOutput = stdout.trim();
    
    if (jsonOutput.includes("[")) {
      jsonOutput = jsonOutput.substring(jsonOutput.indexOf("["));
    } else if (jsonOutput.includes("{")) {
      jsonOutput = jsonOutput.substring(jsonOutput.indexOf("{"));
    }
    
    const parsedData = JSON.parse(jsonOutput);
    
    if (parsedData && parsedData.error) {
      console.error("[Jobs API] Scraper error:", parsedData.error);
      return NextResponse.json({ error: parsedData.error }, { status: 500 });
    }
    
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
      { error: "Failed to fetch live jobs. The scraper timed out or encountered an error." }, 
      { status: 500 }
    );
  }
}
