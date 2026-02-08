import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseServer
    .from("boxes")
    .select("payload")
    .eq("id", params.id)
    .single();

  if (error) {
    // if row doesnt exist supabase returns an error for `.single()`.
    // treat as not found, otherwise surface a 500
    const msg = error.message?.toLowerCase?.() ?? "";
    const notFound = msg.includes("0 rows") || msg.includes("results contain 0 rows");
    return NextResponse.json(
      { error: error.message },
      { status: notFound ? 404 : 500 }
    );
  }

  return NextResponse.json({ payload: data.payload });
}