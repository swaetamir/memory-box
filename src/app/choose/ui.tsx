"use client";

import { useRouter } from "next/navigation";
import GiftBox from "@/components/GiftBox";

export default function ChooseClient() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[#101B36] overflow-hidden">
      {/* tiny corner box */}
      <div className="absolute left-[70px] top-[54px] scale-[0.3] origin-top-left">
        <GiftBox />
      </div>

      {/* buttons */}
      <div className="absolute left-1/2 top-[512px] -translate-x-1/2 flex gap-[186px]">
        <button
          onClick={() => router.push("/create?mode=self")}
          className="w-[403px] h-[114px] bg-[#D9D9D9] rounded-[143px] flex items-center justify-center"
        >
          <span className="font-gambarino text-black text-[64px] leading-none">
            for myself
          </span>
        </button>

        <button
          onClick={() => router.push("/create?mode=other")}
          className="w-[414px] h-[114px] bg-[#D9D9D9] rounded-[143px] flex items-center justify-center"
        >
          <span className="font-gambarino text-black text-[48px] leading-none">
            for someone else
          </span>
        </button>
      </div>
    </main>
  );
}