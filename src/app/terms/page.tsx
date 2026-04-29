import { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service | ReferAus" };

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 pb-14 px-6">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Legal</span>
        <h1 className="text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. About ReferAus</h2>
            <p>ReferAus (ABN 83 588 359 423) is an online platform connecting NDIS participants with disability service providers in Australia. By using our platform, you agree to these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. For Participants</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>ReferAus is free for NDIS participants. Always.</li>
              <li>We provide information and connections, but we are not a provider ourselves.</li>
              <li>Provider ratings and reviews reflect user experiences and are not endorsements by ReferAus.</li>
              <li>You are responsible for verifying provider qualifications and suitability for your needs.</li>
              <li>Always confirm NDIS registration status directly with providers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. For Providers</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>You must provide accurate and current information about your services.</li>
              <li>Paid plans are billed monthly or annually as selected. Cancel anytime.</li>
              <li>ReferAus reserves the right to remove listings that are misleading, inactive, or violate these terms.</li>
              <li>You retain ownership of your content. By listing, you grant ReferAus a licence to display it on the platform.</li>
              <li>Verified badges indicate identity verification, not quality endorsement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Reviews and Content</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>Reviews must be honest and based on genuine experiences.</li>
              <li>We reserve the right to remove reviews that are fake, abusive, or defamatory.</li>
              <li>Providers may respond publicly to reviews.</li>
              <li>Do not post personal health information or NDIS plan details in reviews.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Payments and Refunds</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>All prices are in AUD.</li>
              <li>Payments are processed securely through Stripe.</li>
              <li>You may cancel your subscription at any time. Access continues until the end of the billing period.</li>
              <li>Refunds are considered on a case-by-case basis for the current billing period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p>ReferAus is a directory and connection platform. We do not provide disability services and are not responsible for the quality, safety, or outcomes of services provided by listed providers. We recommend participants conduct their own due diligence.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms. We will notify registered users of material changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Governing Law</h2>
            <p>These terms are governed by the laws of New South Wales, Australia.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:hello@referaus.com" className="text-blue-600 hover:underline">hello@referaus.com</a>.</p>
          </section>
        </div>
        <p className="text-xs text-gray-400 mt-10 pb-4">Last updated: March 2026</p>
      </div>
    </div>
  );
}