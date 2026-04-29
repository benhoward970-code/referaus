import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/app/api/admin/verify-admin";

export async function POST(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results: string[] = [];

  // Add missing columns to providers table one by one
  // We use upsert-like approach: try to read the column, if it fails, we know it's missing
  const columnsToAdd = [
    { name: "slug", type: "text", unique: true },
    { name: "abn", type: "text" },
    { name: "bio", type: "text" },
    { name: "brand_color", type: "text", default: "'#f97316'" },
    { name: "logo_url", type: "text" },
    { name: "cover_image_url", type: "text" },
    { name: "gallery_urls", type: "text[]", default: "'{}'" },
    { name: "services", type: "text[]", default: "'{}'" },
    { name: "location", type: "text" },
    { name: "plan", type: "text", default: "'free'" },
    { name: "registration_ready", type: "boolean", default: "false" },
    { name: "updated_at", type: "timestamptz", default: "now()" },
  ];

  // Check existing columns by trying a select
  const { data: sample } = await admin.from("providers").select("*").limit(1);
  const existingCols = sample && sample.length > 0 ? Object.keys(sample[0]) : [];

  for (const col of columnsToAdd) {
    if (existingCols.includes(col.name)) {
      results.push(`Column '${col.name}' already exists`);
      continue;
    }

    // Try adding the column via RPC or direct query
    // Since we can't run raw SQL via REST, we'll use a workaround:
    // Insert a provider with the new column to see if it exists
    results.push(`Column '${col.name}' needs to be added via SQL Editor`);
  }

  // Check reviews table columns
  const { data: reviewSample, error: revErr } = await admin.from("reviews").select("*").limit(1);
  if (revErr) {
    results.push(`Reviews table error: ${revErr.message}`);
  } else {
    const reviewCols = reviewSample && reviewSample.length > 0 ? Object.keys(reviewSample[0]) : [];
    results.push(`Reviews columns: ${reviewCols.join(", ") || "(empty table)"}`);
  }

  // Check enquiries table columns
  const { data: enqSample, error: enqErr } = await admin.from("enquiries").select("*").limit(1);
  if (enqErr) {
    results.push(`Enquiries table error: ${enqErr.message}`);
  } else {
    const enqCols = enqSample && enqSample.length > 0 ? Object.keys(enqSample[0]) : [];
    results.push(`Enquiries columns: ${enqCols.join(", ") || "(empty table)"}`);
  }

  // Generate the ALTER TABLE SQL that needs to be run
  const alterSQL = columnsToAdd
    .filter(col => !existingCols.includes(col.name))
    .map(col => {
      let stmt = `ALTER TABLE providers ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
      if (col.default) stmt += ` DEFAULT ${col.default}`;
      return stmt + ";";
    })
    .join("\n");

  // Try to update the existing provider to add slug
  if (!existingCols.includes("slug") && sample && sample.length > 0) {
    results.push("Existing provider needs slug column - run migration SQL");
  }

  // Update existing provider row to add slug based on name
  if (existingCols.includes("slug") || existingCols.includes("name")) {
    const { data: allProviders } = await admin.from("providers").select("id, name, slug").is("slug", null);
    if (allProviders) {
      for (const p of allProviders) {
        if (!p.slug && p.name) {
          const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          await admin.from("providers").update({ slug }).eq("id", p.id);
          results.push(`Set slug for ${p.name}: ${slug}`);
        }
      }
    }
  }

  return NextResponse.json({ results, alterSQL, existingCols });
}
