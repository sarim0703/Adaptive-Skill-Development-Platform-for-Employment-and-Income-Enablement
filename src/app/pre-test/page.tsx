import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import PreTestClient from "./PreTestClient";

export default async function PreTestPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const userId = session.user.id;

  // Check if pre-test already done
  const model = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId),
  });

  if (model?.preTestScore !== null && model?.preTestScore !== undefined) {
    redirect("/learn");
  }

  // Get path and profile info for generating questions
  const roadmap = await db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
  });

  if (!roadmap) redirect("/path-selection");

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  const profileSummary = profile
    ? `Location: ${profile.location}, Education: ${profile.educationLevel}, Interest: ${profile.workInterest}`
    : 'No profile data';

  return (
    <PreTestClient
      pathTitle={roadmap.pathTitle}
      profileSummary={profileSummary}
      language={profile?.languagePreference ?? 'english'}
    />
  );
}
