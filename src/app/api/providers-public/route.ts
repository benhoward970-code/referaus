import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // cache for 5 min

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/providers?select=*&verified=eq.true&order=rating.desc&limit=200`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      // Fallback: return empty so client uses hardcoded
      return NextResponse.json([]);
    }

    const providers = await res.json();
    return NextResponse.json(providers);
  } catch {
    return NextResponse.json([]);
  }
}
