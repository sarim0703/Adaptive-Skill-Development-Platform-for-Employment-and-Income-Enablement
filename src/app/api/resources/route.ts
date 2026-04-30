import { getGPT5InstantModel } from "@/lib/ai/models";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = 'edge';

const resourceSchema = z.object({
  youtube_videos: z.array(
    z.object({
      title: z.string().describe("Engaging title for the video"),
      search_query: z.string().describe("A very specific YouTube search query that will find this exact tutorial"),
      description: z.string().describe("What the user will learn from this video (max 15 words)"),
    })
  ).length(3).describe("Exactly 3 high-quality YouTube video recommendations"),
  web_resources: z.array(
    z.object({
      title: z.string().describe("Clear title of the article or course"),
      url: z.string().describe("A REAL, verified URL to a reputable site (GeeksforGeeks, MDN, W3Schools, etc.)"),
      description: z.string().describe("Concise description of the resource (max 15 words)"),
    })
  ).length(3).describe("Exactly 3 verified web-based learning resources"),
});

export async function POST(req: Request) {
  try {
    const { subtopicTitle, practicalTask } = await req.json();

    const model = getGPT5InstantModel();
    const { object } = await generateObject({
      model,
      schema: resourceSchema,
      system: `You are a learning resource curator. Provide exactly 3 YouTube recommendations and 3 Web Resources for the given topic.
Rules:
- YouTube: Provide specific search queries that are GUARANTEED to return high-quality results.
- Web Resources: ONLY use extremely reputable domains (GeeksforGeeks, MDN, W3Schools, freeCodeCamp, Khan Academy, Coursera, HubSpot).
- NO HALLUCINATED URLS: If you are not 100% sure a deep link works, provide a search-based link to the reputable domain (e.g., https://www.google.com/search?q=site:geeksforgeeks.org+topic).
- Every resource must be FREE and highly relevant to the practical task.
- Keep descriptions under 15 words.`,
      prompt: `Topic: ${subtopicTitle}\nPractical Task: ${practicalTask}`,
    });

    // Transform search queries into working YouTube links for the frontend
    const enrichedResources = [
      ...object.youtube_videos.map(v => ({
        ...v,
        type: "video",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(v.search_query)}`
      })),
      ...object.web_resources.map(w => ({
        ...w,
        type: "article",
      }))
    ];

    return NextResponse.json({ resources: enrichedResources });
  } catch (error: any) {
    console.error("Resources API error:", error);
    return NextResponse.json({ resources: [] }, { status: 500 });
  }
}
