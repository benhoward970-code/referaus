import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";

type VerifyResult =
  | { ok: true; admin: SupabaseClient; user: User }
  | { ok: false; response: NextResponse };

/**
 * Verifies the requesting user is an admin.
 * Expects the Supabase access token in the Authorization header.
 */
export async function verifyAdmin(authHeader: string | null): Promise<VerifyResult> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error } = await client.auth.getUser(token);

  if (error || !user) {
    return { ok: false, response: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  if (!isAdminEmail(user.email)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, admin: client, user };
}
