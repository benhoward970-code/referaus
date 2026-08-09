import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

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
  const { allowed } = await checkRateLimit("enquiries-get:" + ip, 10, 60000);
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
    .maybeSingle();

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
  const { allowed } = await checkRateLimit("enquiries-post:" + ip, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { provider_slug, provider_name, name, email, phone, service, message } = body;

  if (!provider_slug || !name || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Email is optional (callback requests provide phone only) but validate format if supplied
  if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Server-side message length validation
  if (message.trim().length < 5 || message.trim().length > 1000) {
    return NextResponse.json({ error: "Message must be between 5 and 1000 characters" }, { status: 400 });
  }

  const admin = getAdmin();

  // Look up provider_id from slug so RLS policies work correctly
  const { data: providerRow } = await admin
    .from("providers")
    .select("id")
    .eq("slug", provider_slug)
    .maybeSingle();

  const { data, error } = await admin.from("enquiries").insert({
    provider_slug,
    provider_name,
    provider_id: providerRow?.id ?? null,
    name: name.trim().substring(0, 80),
    email: email?.trim().substring(0, 120),
    phone: phone?.trim().substring(0, 20),
    service: service?.trim().substring(0, 80),
    message: message.trim().substring(0, 1000),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }

  // Notify the provider by email
  try {
    const { data: provider } = await admin
      .from("providers")
      .select("email, name, email_notifications")
      .eq("slug", provider_slug)
      .maybeSingle();

    if (provider?.email && provider?.email_notifications !== false) {
      const esc = (s: string) => s
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      await sendEmail({
        to: provider.email,
        subject: `New enquiry from ${name.trim()} — ReferAus`,
        transactional: true,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1d4ed8;padding:24px 32px;">
              <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">REFER<span style="color:#f97316;">AUS</span></span>
            </div>
            <div style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#111827;">You have a new enquiry</h2>
              <p style="color:#374151;margin:0 0 24px;">Someone on ReferAus just reached out to <strong>${esc(provider.name)}</strong>.</p>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px;">From</td><td style="padding:8px 0;font-weight:600;color:#111827;">${esc(name.trim())}</td></tr>
                ${email ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;color:#2563eb;">${esc(email.trim())}</td></tr>` : ""}
                ${phone ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:8px 0;color:#111827;">${esc(phone.trim())}</td></tr>` : ""}
                ${service ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Service</td><td style="padding:8px 0;color:#111827;">${esc(service.trim())}</td></tr>` : ""}
              </table>
              <div style="background:#f9fafb;border-left:4px solid #2563eb;border-radius:4px;padding:16px 20px;margin-bottom:28px;">
                <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">${esc(message.trim()).replace(/\n/g, "<br/>")}</p>
              </div>
              <a href="https://referaus.com/dashboard/enquiries" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">View in Dashboard →</a>
            </div>
            <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">ReferAus · Newcastle, NSW · <a href="https://referaus.com" style="color:#9ca3af;">referaus.com</a></p>
            </div>
          </div>
        `,
      });
    }
  } catch (emailErr) {
    console.error("[enquiries] Provider notification failed:", emailErr);
    // Non-blocking — enquiry is still saved
  }

  // Confirmation email to the person who submitted the enquiry
  if (email && email.trim()) {
    try {
      const esc = (s: string) => s
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      await sendEmail({
        to: email.trim(),
        subject: `Your enquiry to ${provider_name || "the provider"} was received — ReferAus`,
        transactional: true,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1d4ed8;padding:24px 32px;">
              <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">REFER<span style="color:#f97316;">AUS</span></span>
            </div>
            <div style="padding:32px;">
              <h2 style="margin:0 0 8px;color:#111827;">Enquiry received</h2>
              <p style="color:#374151;margin:0 0 24px;">Hi ${esc(name.trim())}, your enquiry to <strong>${esc(provider_name || "the provider")}</strong> has been sent. They'll be in touch with you shortly.</p>
              <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your message</p>
                <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">${esc(message.trim()).replace(/\n/g, "<br/>")}</p>
              </div>
              <p style="color:#6b7280;font-size:14px;">In the meantime, you can browse more providers on ReferAus.</p>
              <a href="https://referaus.com/providers" style="display:inline-block;margin-top:16px;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">Browse Providers →</a>
            </div>
            <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">ReferAus · Newcastle, NSW · <a href="https://referaus.com" style="color:#9ca3af;">referaus.com</a></p>
            </div>
          </div>
        `,
      });
    } catch (confirmErr) {
      console.error("[enquiries] Confirmation email to sender failed:", confirmErr);
      // Non-blocking — enquiry is still saved
    }
  }

  return NextResponse.json({ success: true, enquiry: data });
}

// PATCH /api/enquiries - mark enquiry as read or archived (authenticated, owner only)
// Body: { id, read?: true } or { id, archived?: boolean }
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, archived } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = getAdmin();

  // Verify the authenticated user owns the provider this enquiry belongs to
  const { data: enquiry } = await admin
    .from("enquiries")
    .select("provider_slug")
    .eq("id", id)
    .maybeSingle();

  if (!enquiry) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  const { data: provider } = await admin
    .from("providers")
    .select("user_id")
    .eq("slug", enquiry.provider_slug)
    .maybeSingle();

  if (!provider || provider.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Support both read-marking and archiving
  const updatePayload: Record<string, unknown> = {};
  if (typeof archived === "boolean") {
    updatePayload.archived = archived;
    if (archived) updatePayload.read = true; // archiving also marks as read
  } else {
    updatePayload.read = true;
  }

  const { error } = await admin
    .from("enquiries")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
