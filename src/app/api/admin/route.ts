import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "./verify-admin";

export async function GET(req: NextRequest) {
  const result = await verifyAdmin(req.headers.get("authorization"));
  if (!result.ok) return result.response;
  const admin = result.admin;

  const section = req.nextUrl.searchParams.get("section") || "overview";

  try {
    if (section === "overview") {
      const [users, providers, enquiries, contacts] = await Promise.all([
        admin.auth.admin.listUsers(),
        admin.from("providers").select("*", { count: "exact", head: true }),
        admin.from("enquiries").select("*", { count: "exact", head: true }),
        admin.from("contacts").select("*", { count: "exact", head: true }),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUsers = (users.data?.users || []).filter(
        (u) => new Date(u.created_at) >= today
      ).length;

      return NextResponse.json({
        totalUsers: users.data?.users?.length || 0,
        totalProviders: providers.count || 0,
        totalEnquiries: enquiries.count || 0,
        totalContacts: contacts.count || 0,
        newUsersToday: todayUsers,
      });
    }

    if (section === "users") {
      const { data } = await admin.auth.admin.listUsers();
      const users = (data?.users || []).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        confirmed: !!u.email_confirmed_at,
        last_sign_in: u.last_sign_in_at,
      }));
      return NextResponse.json(users);
    }

    if (section === "providers") {
      const { data, error } = await admin.from("providers").select("*").order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }

    if (section === "enquiries") {
      const { data, error } = await admin.from("enquiries").select("*").order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }

    if (section === "contacts") {
      const { data, error } = await admin.from("contacts").select("*").order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
