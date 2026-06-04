import { ActionCentre } from "@/components/actions/ActionCentre";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actions | Verseodin",
  description: "Prioritized recommendations to improve AI visibility.",
};

export default function ActionsPage() {
  return (
    <div className="bg-[#000000] min-h-screen w-full selection:bg-[#F97316]/30">
      <ActionCentre />
    </div>
  );
}
