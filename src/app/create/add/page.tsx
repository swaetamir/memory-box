import Link from "next/link";
import BoxCanvas from "@/components/box/BoxCanvas";

export default function AddStuffPage() {
  return (
    <main className="relative min-h-screen bg-[#101B36] overflow-hidden">
      {/* canvas on the top */}
      <div className="absolute left-[59px] top-[74px]">
        <BoxCanvas />
      </div>

      {/* action row */}
      <div className="absolute left-[60px] top-[700px] flex gap-[80px] text-white font-gambarino text-[36px]">
        <button className="hover:opacity-80">add a photo</button>
        <button className="hover:opacity-80">add a song</button>
        <button className="hover:opacity-80">add a note</button>
        <button className="hover:opacity-80">add an item</button>
      </div>

      {/* view box when done */}
      <div className="absolute left-[1500px] top-[860px] text-white">
        <Link href="/create/view" className="inline-block hover:opacity-80">
          <div className="font-gambarino text-[48px] leading-none">view box →</div>
          <div className="mt-1 w-[244px] border-t-[3px] border-white" />
        </Link>
      </div>
    </main>
  );
}