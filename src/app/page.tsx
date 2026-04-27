import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import HomeContent from "@/components/HomeContent";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center"><Sparkles className="w-8 h-8 text-blue-500 animate-pulse" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
