import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Support Coordinator referral link: referaus.com/ref/<slug>
 *
 * Records the visit against the coordinator, drops an attribution cookie so a
 * later enquiry can be credited back to them, then sends the visitor to the
 * provider directory.
 *
 * The cookie is httpOnly — only /api/enquiries reads it, server-side. It is
 * never exposed to client JS, and it carries only the coordinator id, no
 * participant data.
 */

export const REFERRAL_COOKIE = "referaus_ref";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const directoryUrl = new URL("/providers", req.url);

  const admin = supabaseAdmin();
  if (!admin) {
    // Tracking unavailable (not configured) — still send them to the directory
    // rather than showing an error. The link should never be a dead end.
    return NextResponse.redirect(directoryUrl);
  }

  const { data: coordinator } = await admin
    .from("coordinators")
    .select("id")
    .eq("referral_slug", slug)
    .maybeSingle();

  if (!coordinator) {
    // Unknown link — no tracking, but still a working entry point.
    return NextResponse.redirect(directoryUrl);
  }

  // Mark where the visitor came from so the directory can acknowledge it.
  directoryUrl.searchParams.set("ref", slug);

  const response = NextResponse.redirect(directoryUrl);

  try {
    await admin.from("referral_events").insert({
      coordinator_id: coordinator.id,
      event_type: "visit",
    });
  } catch {
    // Never let a tracking failure break the redirect.
  }

  response.cookies.set(REFERRAL_COOKIE, coordinator.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}
