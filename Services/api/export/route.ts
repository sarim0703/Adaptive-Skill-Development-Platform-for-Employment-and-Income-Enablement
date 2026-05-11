import { db } from "@/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all learning events for this user
    const events = await db.query.learningEvents.findMany({
      where: (e, { eq }) => eq(e.userId, userId),
      orderBy: (e, { asc }) => [asc(e.occurredAt)],
    });

    if (events.length === 0) {
      return new NextResponse("No data available", { status: 404 });
    }

    // Convert to CSV
    // Columns: Event ID, Occurred At, Event Type, Subtopic ID, Mastery Before, Mastery After, Quiz Score
    const headers = ["Event_ID", "Timestamp", "Event_Type", "Subtopic_ID", "BKT_Before", "BKT_After", "Quiz_Score", "Capability_Score"];
    
    const rows = events.map(e => {
      const data = e.data as any;
      return [
        e.id,
        e.occurredAt?.toISOString() || '',
        e.eventType,
        e.subtopicId || '',
        data.bktBefore ?? '',
        data.bktAfter ?? '',
        data.quizScore ?? '',
        data.capabilityScore ?? ''
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const response = new NextResponse(csvContent);
    response.headers.set("Content-Type", "text/csv");
    response.headers.set("Content-Disposition", `attachment; filename="bkt_export_${userId.substring(0,8)}.csv"`);
    
    return response;

  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
