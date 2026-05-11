import dotenv from 'dotenv';
import { YtCaptionKit } from 'yt-caption-kit';

dotenv.config({ path: '.env.local' });

const captionKit = new YtCaptionKit();

async function simulatePersona(name, query, sector) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const video = searchData.items?.[0];

        if (!video) return { sector, error: "No video found" };

        let transcript = "No transcript found";
        try {
            const data = await captionKit.fetch(video.id.videoId, { languages: ["en", "hi"] });
            transcript = data.snippets.map(s => s.text).join(' ').substring(0, 500) + "...";
        } catch (e) {
            transcript = "Transcript unavailable: " + e.message;
        }

        return {
            persona: name,
            sector,
            videoTitle: video.snippet.title,
            videoId: video.id.videoId,
            transcriptSnippet: transcript
        };
    } catch (err) {
        return { sector, error: err.message };
    }
}

async function runFullAudit() {
    const p1 = await simulatePersona("IT Junior", "Python Rest API Tutorial for beginners", "IT Sector");
    const p2 = await simulatePersona("Gig Partner", "Zomato delivery partner training Hindi", "Gig Work");
    const p3 = await simulatePersona("Skilled Tech", "Inverter AC PCB repairing course", "Skilled Trade");

    console.log(JSON.stringify([p1, p2, p3], null, 2));
}

runFullAudit();
