import Link from "next/link";

export default async function CreatePage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const mode = sp.mode ?? "self";

  return (
    <main className="min-h-screen bg-[#101B36] text-white flex items-center justify-center">
      <Link
        href={`/create/add?mode=${mode}`}
        className="font-gambarino text-5xl underline"
      >
        start creating →
      </Link>
    </main>
  );
}