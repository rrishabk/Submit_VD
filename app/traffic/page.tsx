import { TrafficDashboard } from "@/components/traffic/TrafficDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Traffic | Verseodin",
  description: "AI bot traffic and crawler activity dashboard.",
};

export default function TrafficPage() {
  return (
    <div className="bg-[#000000] min-h-screen w-full selection:bg-[#F97316]/30">
      <TrafficDashboard />
    </div>
  );
}
