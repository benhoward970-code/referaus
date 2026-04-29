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

// GET /api/enquiries?slug=xxx - get enquiries for a provider (authenticated, owner only)
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit("enquiries-get:" + ip, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const admin = getAdmin();

  // Verify the authenticated user owns this provider
  const { data: provider } = await admin
    .from("providers")
    .select("user_id")
    .eq("slug", slug)
    .single();

  if (!provider || provider.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("enquiries")
    .select("*")
    .eq("provider_slug", slug)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ enquiries: [] });
  }

  return NextResponse.json({ enquiries: data || [] });
}

// POST /api/enquiries - submit an enquiry (public)
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit("enquiries-post:" + ip, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { provider_slug, provider_name, name, email, phone, service, message } = body;

  if (!provider_slug || !name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Server-side email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Server-side message length validation
  if (message.trim().length < 5 || message.trim().length > 1000) {
    return NextResponse.json({ error: "Message must be between 5 and 1000 characters" }, { status: 400 });
  }

  const admin = getAdmin();
  const { data, error } = await admin.from("enquiries").insert({
    provider_slug,
    provider_name,
    name: name.trim().substring(0, 80),
    email: email.trim().substring(0, 120),
    phone: phone?.trim().substring(0, 20),
    service: service?.trim().substring(0, 80),
    message: message.trim().substring(0, 1000),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }

  return NextResponse.json({ success: true, enquiry: data });
}

// PATCH /api/enquiries - mark enquiry as read (authenticated, owner only)
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = getAdmin();

  // Verify the authenticated user owns the provider this enquiry belongs to
  const { data: enquiry } = await admin
    .from("enquiries")
    .select("provider_slug")
    .eq("id", id)
    .single();

  if (!enquiry) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  const { data: provider } = await admin
    .from("providers")
    .select("user_id")
    .eq("slug", enquiry.provider_slug)
    .single();

  if (!provider || provider.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await admin
    .from("enquiries")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
