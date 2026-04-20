import { db } from "@/db";
import { roadmaps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // We archive all active roadmaps so the user can start fresh from path selection
    await db.update(roadmaps)
      .set({ status: 'archived', archivedAt: new Date(), archiveReason: 'language_switch' })
      .where(eq(roadmaps.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset roadmap", error);
    return NextResponse.json({ error: "Failed to reset roadmap" }, { status: 500 });
  }
}
