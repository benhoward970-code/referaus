import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "../verify-admin";

export async function GET(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const { admin } = result;

  const { data, error } = await admin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data || [] });
}

export async function DELETE(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const { admin } = result;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }

  const { error } = await admin.from("reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
