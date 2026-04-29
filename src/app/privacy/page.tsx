import { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy | ReferAus" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-14 px-6">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Legal</span>
        <h1 className="text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">When you use ReferAus, we may collect:</p>
            <ul className="space-y-2 list-disc pl-6">
              <li><strong>Account information:</strong> Name, email address, phone number when you register.</li>
              <li><strong>Provider information:</strong> Business name, ABN, services offered, location, qualifications.</li>
              <li><strong>Usage data:</strong> Pages visited, searches made, interactions with provider profiles.</li>
              <li><strong>Communications:</strong> Messages sent through our contact form or enquiry system.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>To connect NDIS participants with suitable providers.</li>
              <li>To display provider profiles and reviews on the platform.</li>
              <li>To send relevant notifications about enquiries and messages.</li>
              <li>To improve our platform and user experience.</li>
              <li>To comply with legal obligations under Australian law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Information Sharing</h2>
            <p className="mb-3">We do not sell your personal information. We may share information with:</p>
            <ul className="space-y-2 list-disc pl-6">
              <li>Providers you choose to contact or enquire about.</li>
              <li>Service providers who help us operate (e.g., hosting, payment processing).</li>
              <li>Authorities when required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard encryption. We use Supabase for database hosting and Stripe for payment processing, both of which maintain SOC 2 compliance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Rights</h2>
            <p className="mb-3">Under the Australian Privacy Act 1988, you have the right to:</p>
            <ul className="space-y-2 list-disc pl-6">
              <li>Access your personal information.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your account and data.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
            <p>We use essential cookies to keep you logged in and remember your preferences. We do not use third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact Us</h2>
            <p>For privacy-related enquiries, contact us at <a href="mailto:hello@referaus.com" className="text-blue-600 hover:underline">hello@referaus.com</a>.</p>
            <p className="mt-4">ReferAus (ABN 83 588 359 423)<br/>Newcastle, NSW, Australia</p>
          </section>
        </div>
        <p className="text-xs text-gray-400 mt-10 pb-4">Last updated: March 2026</p>
      </div>
    </div>
  );
}