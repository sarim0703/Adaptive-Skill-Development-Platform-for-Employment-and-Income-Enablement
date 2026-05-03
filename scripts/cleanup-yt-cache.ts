import fs from 'fs';
import path from 'path';

/**
 * YouTube Cache Cleanup Utility
 * 
 * This script identifies and removes legacy or low-quality entries from youtube-cache.json.
 * It ensures that all cached data meets the latest NSQF/BKT-First instructional standards.
 */

const CACHE_FILE = path.join(process.cwd(), "youtube-cache.json");
const CURRENT_VERSION = "v2.0";

if (!fs.existsSync(CACHE_FILE)) {
  console.log("Cache file not found. Nothing to clean.");
  process.exit(0);
}

const rawData = fs.readFileSync(CACHE_FILE, "utf-8");
const cache = JSON.parse(rawData);
const initialCount = Object.keys(cache).length;

let removedCount = 0;
let migratedCount = 0;

for (const query in cache) {
  const entry = cache[query];

  // 1. Remove entries without transcripts (impossible to ground quizzes)
  if (!entry.transcript || entry.transcript.trim().length === 0) {
    console.log(`[REMOVED] No transcript for query: "${query}"`);
    delete cache[query];
    removedCount++;
    continue;
  }

  // 2. Remove entries that are excessively old (older than 30 days)
  const lastFetched = new Date(entry.lastFetched);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  if (lastFetched < thirtyDaysAgo) {
    console.log(`[REMOVED] Stale cache (30+ days) for query: "${query}"`);
    delete cache[query];
    removedCount++;
    continue;
  }

  // 3. Mark version for migration if it's high quality but unversioned
  if (entry.version !== CURRENT_VERSION) {
    console.log(`[MIGRATED] Updating version for high-quality entry: "${query}"`);
    entry.version = CURRENT_VERSION;
    migratedCount++;
  }
}

fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

console.log("\n--- Cleanup Summary ---");
console.log(`Total Initial Entries: ${initialCount}`);
console.log(`Entries Removed:       ${removedCount}`);
console.log(`Entries Migrated:      ${migratedCount}`);
console.log(`Final Cache Size:      ${Object.keys(cache).length}`);
console.log("------------------------\n");
