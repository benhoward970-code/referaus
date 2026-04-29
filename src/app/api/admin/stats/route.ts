import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "../verify-admin";

export async function GET(request: NextRequest) {
  const result = await verifyAdmin(request.headers.get("authorization"));
  if (!result.ok) return result.response;
  const { admin } = result;

  const [providersRes, enquiriesRes, reviewsRes, plansRes, weekAgo] = await Promise.all([
    admin.from("providers").select("id", { count: "exact", head: true }),
    admin.from("enquiries").select("id", { count: "exact", head: true }),
    admin.from("reviews").select("id", { count: "exact", head: true }),
    admin.from("providers").select("plan"),
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return admin
        .from("providers")
        .select("id", { count: "exact", head: true })
        .gte("created_at", d.toISOString());
    })(),
  ]);

  const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, premium: 0 };
  if (plansRes.data) {
    for (const row of plansRes.data) {
      const p = (row.plan || "free").toLowerCase();
      planCounts[p] = (planCounts[p] || 0) + 1;
    }
  }

  return NextResponse.json({
    totalProviders: providersRes.count ?? 0,
    totalEnquiries: enquiriesRes.count ?? 0,
    totalReviews: reviewsRes.count ?? 0,
    newThisWeek: weekAgo.count ?? 0,
    planCounts,
  });
}
