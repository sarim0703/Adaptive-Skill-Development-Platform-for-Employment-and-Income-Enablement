import { getUserRoadmap, getUserModel } from "@/app/actions";
import OutlineClient from "./OutlineClient";
import { redirect } from "next/navigation";

export default async function OutlinePage() {
  const roadmap = await getUserRoadmap();
  const userModel = await getUserModel();

  if (!roadmap) {
    redirect("/path-selection");
  }

  return (
    <OutlineClient 
      roadmap={{ ...roadmap, modules: roadmap.modules as unknown[] }}
      currentStreak={(userModel as { currentStreak?: number } | null)?.currentStreak}
      capabilityScore={(userModel as { capabilityScore?: number } | null)?.capabilityScore}
    />
  );
}
