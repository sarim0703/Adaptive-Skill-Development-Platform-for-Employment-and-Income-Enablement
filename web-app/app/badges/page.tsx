import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BadgesClient from "./BadgesClient";
import { getUserBadgesData } from "./actions";

export default async function BadgesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  const data = await getUserBadgesData();

  return <BadgesClient initialData={data} />;
}
