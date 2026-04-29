import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "../verify-admin";

export async function GET(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const { admin } = result;

  const { data, error } = await admin
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enquiries: data || [] });
}

export async function PATCH(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const { admin } = result;

  const { id, read } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing enquiry id" }, { status: 400 });
  }

  const { error } = await admin
    .from("enquiries")
    .update({ read: !!read })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
