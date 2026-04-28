import { getPathOptions } from "../actions";
import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import PathSelectionClient from "./PathSelectionClient";

export const dynamic = 'force-dynamic';

export default async function PathSelectionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  const userId = session.user.id;

  // Verify profile exists before allowing path selection
  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  if (!profile) {
    redirect("/onboarding");
  }

  const paths = await getPathOptions();
  
  return <PathSelectionClient initialPaths={paths} />;
}
