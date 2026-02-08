import Link from "next/link";

export default function ViewBoxPage() {
  return (
    <main className="min-h-screen bg-[#101B36] text-white flex flex-col items-center justify-center gap-6">
      <div className="font-gambarino text-5xl">view box (placeholder)</div>
      <Link className="underline" href="/create/add">
        back to add stuff
      </Link>
    </main>
  );
}