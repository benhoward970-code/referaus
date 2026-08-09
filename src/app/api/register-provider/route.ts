import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = await checkRateLimit("register-provider:" + ip, 5, 300000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Verify the caller is authenticated and the token matches the userId
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const { userId, name, slug, email } = await request.json();

    if (!userId || !name || !slug || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Block reserved slugs that would conflict with app routes or be misleading
    const RESERVED_SLUGS = new Set([
      "admin", "api", "dashboard", "login", "signup", "register", "pricing",
      "about", "blog", "contact", "faq", "help", "terms", "privacy", "cookies",
      "cookie-preferences", "providers", "participants", "resources", "sitemap",
      "robots", "verify", "for-providers", "for-participants", "compare",
      "testimonial", "registered-providers", "undefined", "null", "test",
      "referaus", "support", "home", "index", "app", "www", "mail", "email",
    ]);
    const normalizedSlug = slug.toLowerCase().trim();
    if (RESERVED_SLUGS.has(normalizedSlug)) {
      return NextResponse.json({ error: "This name is reserved and cannot be used as a provider slug." }, { status: 400 });
    }
    // Enforce slug format: lowercase letters, numbers, hyphens only
    if (!/^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$/.test(normalizedSlug)) {
      return NextResponse.json({ error: "Invalid slug format." }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify token belongs to the userId being registered
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
