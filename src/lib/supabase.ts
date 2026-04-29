import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

export const isConfigured = () => !!supabaseUrl && !!supabaseAnonKey;

let _supabase: SupabaseClient | null = null;
try {
  _supabase = isConfigured() ? createClient(supabaseUrl, supabaseAnonKey) : null;
} catch (e) {
  console.error("[supabase] Failed to create client:", e);
  _supabase = null;
}
export const supabase = _supabase;

// Server-side admin client (uses service role key - never expose to browser)
let _supabaseAdmin: SupabaseClient | null = null;
export function supabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabaseAdmin;
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>,
) {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  return supabase.auth.signUp({ email, password, options: { data: metadata } });
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// ---------------------------------------------------------------------------
// Provider helpers
// ---------------------------------------------------------------------------

export async function getProviderByUserId(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    console.error("[supabase] getProviderByUserId error:", error.message);
    return null;
  }
  return data;
}

export async function getProviderBySlug(slug: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) {
    console.error("[supabase] getProviderBySlug error:", error.message);
    return null;
  }
  return data;
}


export async function getAllProviders(): Promise<any[]> {
  try {
    // Use server-side API route (bypasses broken anon key)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://referaus.com');
    const res = await fetch(`${baseUrl}/api/providers-public`, { 
      next: { revalidate: 300 } 
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function updateProvider(
  id: string,
  updates: Record<string, unknown>,
) {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  const { data, error } = await supabase
    .from("providers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { success: !error, data, error };
}

// ---------------------------------------------------------------------------
// Enquiry helpers
// ---------------------------------------------------------------------------

export async function submitEnquiry(data: {
  provider_slug: string;
  provider_name: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
}) {
  if (!supabase) {
    console.log("[Demo] Enquiry submitted:", data);
    return { success: true, demo: true };
  }

  // Try new schema first (flat columns)
  const newRow = {
    provider_slug: data.provider_slug,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    service: data.service || "General Enquiry",
    message: data.message,
    read: false,
  };

  const { error } = await supabase.from("enquiries").insert(newRow);

  // Fallback: if new schema fails, try legacy column mapping
  if (error) {
    console.warn(
      "[supabase] New enquiry schema failed, trying legacy:",
      error.message,
    );
    const legacyRow = {
      participant_name: data.name,
      provider_name: data.provider_name,
      subject: data.service || "General Enquiry",
      messages: JSON.stringify([
        {
          from: "participant",
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          text: data.message,
          sent_at: new Date().toISOString(),
        },
      ]),
      status: "open",
    };
    const { error: legacyError } = await supabase
      .from("enquiries")
      .insert(legacyRow);
    return { success: !legacyError, error: legacyError };
  }

  return { success: true, error: null };
}

export async function getProviderEnquiries(providerSlug: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .eq("provider_slug", providerSlug)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] getProviderEnquiries error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function markEnquiryRead(id: string) {
  if (!supabase) return { success: false, error: "Supabase not configured" };
  const { error } = await supabase
    .from("enquiries")
    .update({ read: true })
    .eq("id", id);
  return { success: !error, error };
}

// ---------------------------------------------------------------------------
// Review helpers
// ---------------------------------------------------------------------------

export async function getProviderReviews(providerSlug: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_slug", providerSlug)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] getProviderReviews error:", error.message);
    return [];
  }
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

export async function uploadProviderImage(
  file: File,
  path: string,
): Promise<{ url: string | null; error: string | null }> {
  if (!supabase)
    return { url: null, error: "Supabase not configured" };

  const { error } = await supabase.storage
    .from("provider-images")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("[supabase] uploadProviderImage error:", error.message);
    return { url: null, error: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("provider-images").getPublicUrl(path);

  return { url: publicUrl, error: null };
}

export async function deleteProviderImage(
  path: string,
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase)
    return { success: false, error: "Supabase not configured" };

  const { error } = await supabase.storage
    .from("provider-images")
    .remove([path]);

  if (error) {
    console.error("[supabase] deleteProviderImage error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

// ---------------------------------------------------------------------------
// Contact / Newsletter / Waitlist (unchanged)
// ---------------------------------------------------------------------------

export async function submitContact(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!supabase) {
    console.log("[Demo] Contact submitted:", data);
    return { success: true, demo: true };
  }
  const { error } = await supabase.from("contacts").insert(data);
  return { success: !error, error };
}

export async function subscribeNewsletter(email: string) {
  if (!supabase) {
    console.log("[Demo] Newsletter signup:", email);
    return { success: true, demo: true };
  }
  const { error } = await supabase.from("newsletter").insert({ email });
  return { success: !error, error };
}

export async function submitWaitlist(email: string, role: string) {
  if (!supabase) {
    console.log("[Demo] Waitlist signup:", email, role);
    return { success: true, demo: true };
  }
  const { error } = await supabase.from("waitlist").insert({ email, role });
  return { success: !error, error };
}

// ---------------------------------------------------------------------------
// Plan / Stripe helpers (server-side, uses service role)
// ---------------------------------------------------------------------------

export async function updateProviderPlan(
  customerEmail: string,
  plan: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string | null,
) {
  const admin = supabaseAdmin();
  if (!admin) return { error: "Supabase admin not configured" };

  const { error } = await admin
    .from("providers")
    .update({
      plan,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq("email", customerEmail);

  if (error) {
    console.error("[supabase] updateProviderPlan error:", error.message);
    return { error: error.message };
  }
  return { success: true };
}

export async function downgradeProviderByCustomerId(
  stripeCustomerId: string,
) {
  const admin = supabaseAdmin();
  if (!admin) return { error: "Supabase admin not configured" };

  const { error } = await admin
    .from("providers")
    .update({
      plan: "free",
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    console.error("[supabase] downgradeProvider error:", error.message);
    return { error: error.message };
  }
  return { success: true };
}
