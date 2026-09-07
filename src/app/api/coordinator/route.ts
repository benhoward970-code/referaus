import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const admin = getAdmin();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

/**
 * GET /api/coordinator
 * Returns the signed-in Support Coordinator's referral link and its results.
 * Scoped strictly to the caller — a coordinator can only ever see their own.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit("coordinator-get:" + ip, 30, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getAdmin();

  const { data: coordinator } = await admin
    .from("coordinators")
    .select("id, name, email, organisation, referral_slug, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!coordinator) {
    return NextResponse.json({ error: "Not a coordinator account" }, { status: 403 });
  }

  const { data: events } = await admin
    .from("referral_events")
    .select("event_type, provider_name, provider_slug, created_at")
    .eq("coordinator_id", coordinator.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const all = events ?? [];
  const visits = all.filter((e) => e.event_type === "visit").length;
  const enquiries = all.filter((e) => e.event_type === "enquiry");

  // Which providers referred clients actually contacted, most-contacted first.
  const providerCounts = new Map<string, { name: string; slug: string | null; count: number }>();
  for (const e of enquiries) {
    const key = e.provider_slug || e.provider_name || "unknown";
    const existing = providerCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      providerCounts.set(key, {
        name: e.provider_name || "A provider",
        slug: e.provider_slug,
        count: 1,
      });
    }
  }

  return NextResponse.json({
    coordinator: {
      name: coordinator.name,
      email: coordinator.email,
      organisation: coordinator.organisation,
      referralSlug: coordinator.referral_slug,
      memberSince: coordinator.created_at,
    },
    stats: {
      visits,
      enquiries: enquiries.length,
      providersContacted: providerCounts.size,
    },
    topProviders: Array.from(providerCounts.values()).sort((a, b) => b.count - a.count).slice(0, 10),
    recent: all.slice(0, 20),
  });
}
