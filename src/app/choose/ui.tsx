"use client";

import { useRouter } from "next/navigation";
import GiftBox from "@/components/GiftBox";

export default function ChooseClient() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[#101B36] overflow-hidden">
      {/* tiny corner box */}
      <div className="absolute left-[70px] top-[54px] scale-[0.2] origin-top-left">
        <GiftBox />
      </div>

      {/* buttons */}
      <div className="absolute left-1/2 top-[512px] -translate-x-1/2 flex gap-[186px]">
        <button
          onClick={() => router.push("/create?mode=self")}
          className="w-[403px] h-[114px] bg-[#D9D9D9] rounded-[143px] flex items-center justify-center cursor-pointer transform-gpu transition-transform duration-200 ease-out hover:-translate-y-[2px] hover:scale-[1.02] active:scale-[0.98] hover:drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          <span className="font-gambarino text-black text-[55px] leading-none">
            for myself
          </span>
        </button>

        <button
          onClick={() => router.push("/create?mode=other")}
          className="w-[414px] h-[114px] bg-[#D9D9D9] rounded-[143px] flex items-center justify-center cursor-pointer transform-gpu transition-transform duration-200 ease-out hover:-translate-y-[2px] hover:scale-[1.02] active:scale-[0.98] hover:drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          <span className="font-gambarino text-black text-[48px] leading-none">
            for someone else
          </span>
        </button>
      </div>
    </main>
  );
}