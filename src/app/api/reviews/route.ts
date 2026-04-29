import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface Review {
  id?: string;
  provider_slug: string;
  reviewer_name: string;
  rating: number;
  text: string;
  service_type?: string;
  created_at?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const client = getClient();
  if (!client) {
    return NextResponse.json({ reviews: [] });
  }

  const { data, error } = await client
    .from("reviews")
    .select("*")
    .eq("provider_slug", slug)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ reviews: [] });
  }

  return NextResponse.json({ reviews: data || [] });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit("reviews:" + ip, 5, 3600000);
  if (!allowed) return NextResponse.json({ error: "Too many reviews. Please try again later." }, { status: 429 });

  const body = await request.json();
  const { provider_slug, author_name, reviewer_name, rating, text, service_type } = body;
  const name = reviewer_name || author_name;

  if (!provider_slug || !name || !rating || !text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }
  if (text.trim().length < 10) {
    return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
  }

  const review = {
    provider_slug,
    reviewer_name: name.trim().substring(0, 80),
    rating,
    text: text.trim().substring(0, 1000),
    service_type: service_type?.trim().substring(0, 80),
    created_at: new Date().toISOString(),
  };

  const client = getClient();
  if (!client) {
    return NextResponse.json({ success: true, review: { ...review, id: "demo-" + Date.now() }, demo: true });
  }

  const { data, error } = await client.from("reviews").insert(review).select().single();
  if (error) {
    console.error("Review insert error:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }

  return NextResponse.json({ success: true, review: data });
}
