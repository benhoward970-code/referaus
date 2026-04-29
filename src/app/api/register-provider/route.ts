import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { userId, name, slug, email } = await request.json();

    if (!userId || !name || !slug || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Use upsert so duplicate registrations don't error
    const { error } = await admin.from("providers").upsert({
      user_id: userId,
      name,
      slug,
      email,
      plan: "free",
      verified: false,
      services: [],
    }, { onConflict: "user_id" });

    if (error) {
      console.error("[register-provider]", error.message);
      // Non-fatal — user can complete profile in dashboard
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[register-provider] unexpected:", err);
    return NextResponse.json({ success: true }); // Still return success so registration isn't blocked
  }
}
