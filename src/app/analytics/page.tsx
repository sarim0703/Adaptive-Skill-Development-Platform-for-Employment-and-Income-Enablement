import { getAnalyticsData } from "@/app/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const data = await getAnalyticsData();
  if (!data) redirect("/learn");

  return <AnalyticsDashboard data={data} />;
}
