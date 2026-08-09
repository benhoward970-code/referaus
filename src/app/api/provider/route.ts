import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

// GET /api/provider?userId=xxx - get provider by user ID (authenticated)
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Only allow fetching your own provider record
  if (userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getAdmin();
  const { data, error } = await admin
    .from("providers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ provider: null });
  }

  return NextResponse.json({ provider: data });
}

// PATCH /api/provider - update provider profile (authenticated, owner only)
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing provider id" }, { status: 400 });
  }

  const admin = getAdmin();

  // Verify the authenticated user owns this provider
  const { data: existing, error: lookupError } = await admin
    .from("providers")
    .select("user_id, registration_ready, slug")
    .eq("id", id)
    .single();

  if (lookupError || !existing) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // When going live for the first time and a business name is provided,
  // regenerate the slug from the business name (not the personal name used at signup)
  const justWentLive = updates.registration_ready === true && !existing.registration_ready;
  if (justWentLive && updates.name) {
    const base = updates.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 54);
    const candidate = base.length >= 3 ? base : 'provider';
    // Check for collision (exclude current provider)
    const { data: collision } = await admin
      .from("providers")
      .select("id")
      .eq("slug", candidate)
      .neq("id", id)
      .maybeSingle();
    const newSlug = !collision ? candidate : candidate + '-' + id.replace(/-/g, '').slice(0, 6);
    // Preserve old slug so /providers/<old-slug> can redirect to the new URL
    if (newSlug !== existing.slug) {
      updates.slug = newSlug;
      updates.previous_slug = existing.slug;
    }
  }

  const { data, error } = await admin
    .from("providers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send welcome email when provider goes live for the first time
  if (justWentLive && data?.email && data?.name) {
    // Notify admin
    try {
      await sendEmail({
        to: "hello@referaus.com",
        subject: `New provider live: ${data.name}`,
        html: `
          <p><strong>${data.name}</strong> just completed onboarding and went live on ReferAus.</p>
          <ul>
            <li>Email: ${data.email}</li>
            <li>Location: ${data.suburb || "—"}, ${data.state || ""}</li>
            <li>Services: ${(data.services || []).join(", ") || "—"}</li>
            <li>Plan: ${data.plan || "free"}</li>
          </ul>
          <p><a href="https://referaus.com/admin">View in admin →</a></p>
        `,
      });
    } catch (e) { console.error("[provider] Admin notification failed:", e); }

    try {
      await sendEmail({
        to: data.email,
        subject: "Your ReferAus listing is live! 🎉",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1d4ed8;padding:24px 32px;">
              <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">REFER<span style="color:#f97316;">AUS</span></span>
            </div>
            <div style="padding:32px;">
              <h2 style="margin:0 0 8px;color:#111827;">You're live on ReferAus!</h2>
              <p style="color:#374151;margin:0 0 24px;">Hi ${data.name}, your listing is now visible to participants and support coordinators across Newcastle and the Hunter Region.</p>
              <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;color:#15803d;font-weight:600;">What happens next?</p>
                <ul style="margin:8px 0 0;padding-left:20px;color:#166534;font-size:14px;line-height:1.8;">
                  <li>Participants searching for your services will find your profile</li>
                  <li>You'll get an email the moment someone sends you an enquiry</li>
                  <li>Log in any time to update your profile, photos, or services</li>
                </ul>
              </div>
              <a href="https://referaus.com/dashboard" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;margin-bottom:24px;">View Your Dashboard →</a>
              <p style="color:#6b7280;font-size:13px;margin:0;">Questions? Reply to this email or visit <a href="https://referaus.com/contact" style="color:#2563eb;">referaus.com/contact</a></p>
            </div>
            <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">ReferAus · Newcastle, NSW · <a href="https://referaus.com" style="color:#9ca3af;">referaus.com</a></p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[provider] Welcome email failed:", emailErr);
    }
  }

  return NextResponse.json({ provider: data });
}
