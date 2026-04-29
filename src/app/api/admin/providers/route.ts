import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "../verify-admin";

export async function GET(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const { admin } = result;

  const { data, error } = await admin
    .from("providers")
    .select("id, user_id, name, email, slug, plan, verified, created_at, phone, suburb, state, postcode, website, categories, bio, stripe_customer_id, stripe_subscription_id")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const slugs = (data || []).map((p) => p.slug).filter(Boolean);
  const enquiryCounts: Record<string, number> = {};

  if (slugs.length > 0) {
    const { data: enquiries } = await admin.from("enquiries").select("provider_slug");
    if (enquiries) {
      for (const e of enquiries) {
        const s = e.provider_slug;
        if (s) enquiryCounts[s] = (enquiryCounts[s] || 0) + 1;
      }
    }
  }

  const providers = (data || []).map((p) => ({
    ...p,
    enquiry_count: enquiryCounts[p.slug] || 0,
  }));

  return NextResponse.json({ providers });
}

export async function PATCH(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const { admin } = result;

  const { id, ...updates } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing provider id" }, { status: 400 });
  }

  const allowed = ["verified", "plan"];
  const safeUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  const { data, error } = await admin
    .from("providers")
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ provider: data });
}

export async function DELETE(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const { admin } = result;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing provider id" }, { status: 400 });
  }

  const { error } = await admin.from("providers").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
