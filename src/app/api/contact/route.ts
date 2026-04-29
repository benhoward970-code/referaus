import { checkRateLimit } from '@/lib/rate-limit';
import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit('contact:' + ip, 5, 300000);
    if (!allowed) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    const body = await request.json();
    const { name, email, phone, message, type } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Server-side email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Save to contacts table
    const db = supabaseAdmin || supabaseServer;
    if (!db) {
      console.error("Contact: No Supabase client available. URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20));
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
    const { error: dbError } = await db.from("contacts").insert({
      name: name.trim(),
      email: email.trim(),
      subject: type || "general",
      message: phone ? `Phone: ${phone}\n\n${message}` : message,
    });
    if (dbError) {
      console.error("Supabase insert error:", JSON.stringify(dbError));
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Escape HTML to prevent XSS in email clients
    const esc = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Send email notification to admin
    try {
      await sendEmail({
        to: 'hello@referaus.com',
        subject: `New contact from ${esc(name.trim())} — ReferAus`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${esc(name.trim())}</p>
          <p><strong>Email:</strong> ${esc(email.trim())}</p>
          ${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ''}
          <p><strong>Type:</strong> ${esc(type || 'general')}</p>
          <hr />
          <p>${esc(message).replace(/\n/g, '<br />')}</p>
          <hr />
          <p style="color:#999;font-size:12px;">Sent from referaus.com contact form</p>
        `,
      });
    } catch (emailErr) {
      console.error('[Contact] Email notification failed:', emailErr);
      // Non-blocking — form submission still succeeds
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
