import Link from "next/link";
import GiftBox from "@/components/GiftBox";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#101B36] overflow-hidden">
      <div className="absolute left-1/2 top-[180px] -translate-x-1/2">
        <GiftBox />
      </div>

      <div className="absolute left-1/2 top-[760px] -translate-x-1/2 text-white">
        <Link href="/choose" className="inline-block">
          <div className="text-[85px] leading-none font-gambarino">send a box →</div>
          <div className="mt-1 w-[475px] border-t-4 border-white" />
        </Link>
      </div>
    </main>
  );
}