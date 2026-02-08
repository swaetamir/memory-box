import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function previewFromPayload(payload: any): string {
  const firstNote = payload?.notes?.[0]?.text;
  if (typeof firstNote === "string" && firstNote.trim().length > 0) {
    const t = firstNote.trim().replace(/\s+/g, " ");
    return t.length > 52 ? `“${t.slice(0, 52)}...”` : `“${t}”`;
  }
  return "“someone shared a memory…”";
}

export async function GET() {
  const { data, error } = await supabaseServer
    .from("boxes")
    .select("id, created_at, payload")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items =
    data?.map((row) => ({
      id: row.id as string,
      created_at: row.created_at as string,
      quote: previewFromPayload(row.payload),
    })) ?? [];

  return NextResponse.json({ items });
}