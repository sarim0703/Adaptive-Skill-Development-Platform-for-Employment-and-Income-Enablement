import { NextResponse } from "next/server";

// Simple in-memory cache to avoid hitting Nominatim too hard
const geocodeCache = new Map<string, [number, number]>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  if (!location) {
    return NextResponse.json({ error: "Location parameter is required" }, { status: 400 });
  }

  // Check cache first
  if (geocodeCache.has(location)) {
    return NextResponse.json({ coords: geocodeCache.get(location) });
  }

  try {
    const query = encodeURIComponent(location + ", India");
    // India Bounding Box: [left, top, right, bottom] -> [68.1, 37.6, 97.4, 8.4]
    // Nominatim expects viewbox as [left, top, right, bottom]
    const viewbox = "68.1,37.6,97.4,8.4";
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&viewbox=${viewbox}&bounded=1`,
      {
        headers: {
          "User-Agent": "CareerOrbit-Server",
        },
      }
    );

    if (!response.ok) throw new Error("Nominatim request failed");

    const data = await response.json();

    if (data && data.length > 0) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      geocodeCache.set(location, coords);
      return NextResponse.json({ coords });
    }

    return NextResponse.json({ coords: null });
  } catch (error: any) {
    console.error("Geocoding Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch coordinates" }, { status: 500 });
  }
}
