import Link from "next/link";

export default function CreatePage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const mode = searchParams.mode ?? "self";

  return (
    <main className="min-h-screen bg-[#101B36] text-white flex items-center justify-center">
      <Link href={`/create/add?mode=${mode}`} className="font-gambarino text-5xl underline">
        start creating →
      </Link>
    </main>
  );
}