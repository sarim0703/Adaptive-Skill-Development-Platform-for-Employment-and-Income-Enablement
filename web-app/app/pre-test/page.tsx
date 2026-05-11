import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import PreTestClient from "./PreTestClient";

export default async function PreTestPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const userId = session.user.id;

  // If the user already has an active roadmap, they belong on the learning dashboard
  const activeRoadmap = await db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
  });

  if (activeRoadmap) {
    redirect("/learn");
  }

  // Get path and profile info for generating questions
  const pathOption = await db.query.pathOptions.findFirst({
    where: (p, { eq, and }) => and(eq(p.userId, userId), eq(p.isSelected, true)),
  });

  if (!pathOption) redirect("/path-selection");

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  const profileSummary = profile
    ? `Location: ${profile.location}, Education: ${profile.educationLevel}, Interest: ${profile.workInterest}`
    : 'No profile data';

  return (
    <PreTestClient
      pathId={pathOption.id}
      pathTitle={pathOption.pathTitle}
      profileSummary={profileSummary}
      language={profile?.languagePreference ?? 'english'}
    />
  );
}
