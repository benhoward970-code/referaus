"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase, isConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Admin emails are managed server-side via ADMIN_EMAILS env var (src/lib/admin.ts)
// The client-side check here is a UX convenience only — real enforcement is on the API
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "benhoward970@gmail.com,hello@referaus.com")
  .split(",").map((e) => e.trim().toLowerCase());

// Admin access is controlled server-side via ADMIN_EMAILS env var in src/lib/admin.ts

interface OverviewData {
  totalUsers: number;
  totalProviders: number;
  totalEnquiries: number;
  totalContacts: number;
  newUsersToday: number;
}

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  confirmed: boolean;
  last_sign_in: string | null;
}

interface ProviderRow {
  id: number;
  name: string;
  email: string;
  plan: string;
  category: string;
  location: string | null;
  created_at: string;
  phone: string | null;
  abn: string | null;
}

interface EnquiryRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  service: string | null;
  provider_id: number | null;
  created_at: string;
}

interface ContactRow {
  id: number;
  name: string;
  email: string;
  message: string;
  type: string | null;
  created_at: string;
}

type Section = "overview" | "users" | "providers" | "enquiries" | "contacts";

const NAV_ITEMS: { key: Section; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "users", label: "Users", icon: "👤" },
  { key: "providers", label: "Providers", icon: "🏢" },
  { key: "enquiries", label: "Enquiries", icon: "📩" },
  { key: "contacts", label: "Contacts", icon: "📬" },
];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);

  // Auth check
  useEffect(() => {
    if (!isConfigured() || !supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !ADMIN_EMAILS.includes(session.user.email?.toLowerCase() ?? "")) {
        router.push("/login?redirect=/admin");
        return;
      }
      setToken(session.access_token);
      setAuthed(true);
    });
  }, [router]);

  const fetchSection = useCallback(
    async (s: Section) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin?section=${s}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (s === "overview") setOverview(data);
        if (s === "users") setUsers(data);
        if (s === "providers") setProviders(data);
        if (s === "enquiries") setEnquiries(data);
        if (s === "contacts") setContacts(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
      setLoading(false);
    },
    [token]
  );

  useEffect(() => {
    if (authed && token) fetchSection(section);
  }, [authed, token, section, fetchSection]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-gray-400 text-sm">Checking access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Admin
            </p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  section === item.key
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                section === item.key
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500"
              }`}
            >
              <span className="block text-lg mb-0.5">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {section === "overview" && (
              <OverviewSection data={overview} loading={loading} />
            )}
            {section === "users" && (
              <UsersSection data={users} loading={loading} />
            )}
            {section === "providers" && (
              <ProvidersSection data={providers} loading={loading} />
            )}
            {section === "enquiries" && (
              <EnquiriesSection data={enquiries} loading={loading} />
            )}
            {section === "contacts" && (
              <ContactsSection data={contacts} loading={loading} />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-3xl font-black ${accent || "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function OverviewSection({
  data,
  loading,
}: {
  data: OverviewData | null;
  loading: boolean;
}) {
  if (loading || !data)
    return <LoadingSkeleton count={5} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={data.totalUsers} accent="text-blue-600" />
        <StatCard label="Providers" value={data.totalProviders} accent="text-orange-500" />
        <StatCard label="Enquiries" value={data.totalEnquiries} />
        <StatCard label="Contacts" value={data.totalContacts} />
        <StatCard label="New Today" value={data.newUsersToday} accent="text-green-600" />
      </div>
    </div>
  );
}

function UsersSection({ data, loading }: { data: UserRow[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Users ({data.length})</h1>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Signed Up</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Confirmed</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Last Sign In</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.confirmed
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {u.confirmed ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.last_sign_in)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProvidersSection({ data, loading }: { data: ProviderRow[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Providers ({data.length})</h1>
      <div className="space-y-3">
        {data.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.email}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  p.plan === "free"
                    ? "bg-gray-100 text-gray-500"
                    : p.plan === "starter"
                    ? "bg-blue-50 text-blue-600"
                    : p.plan === "pro"
                    ? "bg-orange-50 text-orange-600"
                    : "bg-purple-50 text-purple-600"
                }`}
              >
                {p.plan}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
              {p.category && <span>📂 {p.category}</span>}
              {p.location && <span>📍 {p.location}</span>}
              {p.phone && <span>📞 {p.phone}</span>}
              {p.abn && <span>ABN: {p.abn}</span>}
              <span>Joined: {formatDate(p.created_at)}</span>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No providers yet</p>
        )}
      </div>
    </div>
  );
}

function EnquiriesSection({ data, loading }: { data: EnquiryRow[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Enquiries ({data.length})</h1>
      <div className="space-y-3">
        {data.map((e) => (
          <div
            key={e.id}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900">{e.name}</h3>
                <p className="text-sm text-gray-500">{e.email}</p>
              </div>
              <span className="text-xs text-gray-400">{formatDate(e.created_at)}</span>
            </div>
            {e.service && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
                {e.service}
              </span>
            )}
            <p className="mt-2 text-sm text-gray-600">{e.message}</p>
            {e.phone && <p className="mt-1 text-xs text-gray-400">📞 {e.phone}</p>}
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No enquiries yet</p>
        )}
      </div>
    </div>
  );
}

function ContactsSection({ data, loading }: { data: ContactRow[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Contacts ({data.length})</h1>
      <div className="space-y-3">
        {data.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.email}</p>
              </div>
              <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
            </div>
            {c.type && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                {c.type}
              </span>
            )}
            <p className="mt-2 text-sm text-gray-600">{c.message}</p>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No contacts yet</p>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
