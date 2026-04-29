import * as React from 'react';

interface WelcomeEmailProps {
  businessName: string;
  profileUrl?: string;
}

const headerStyle: React.CSSProperties = {
  backgroundColor: '#1d4ed8',
  padding: '32px 40px',
  textAlign: 'center',
};

const bodyStyle: React.CSSProperties = { padding: '40px' };

const footerStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  padding: '24px 40px',
  textAlign: 'center',
};

const ctaStyle: React.CSSProperties = {
  backgroundColor: '#1d4ed8',
  color: '#ffffff',
  borderRadius: '6px',
  padding: '14px 32px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

export function WelcomeEmail({
  businessName,
  profileUrl = 'https://referaus.com/dashboard/profile',
}: WelcomeEmailProps) {
  return (
    <html>
      <body style={{ backgroundColor: '#f4f7f9', margin: 0, padding: '40px 16px', fontFamily: 'Arial, sans-serif' }}>
        <table width="600" cellPadding="0" cellSpacing="0" style={{ margin: '0 auto', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          <tbody>
            {/* Header */}
            <tr>
              <td style={headerStyle}>
                <p style={{ color: '#fff', fontSize: '28px', fontWeight: '700', margin: 0 }}>ReferAus</p>
                <p style={{ color: '#bfdbfe', fontSize: '14px', margin: '4px 0 0' }}>Australia&apos;s NDIS Provider Directory</p>
              </td>
            </tr>

            {/* Body */}
            <tr>
              <td style={bodyStyle}>
                <h1 style={{ color: '#111827', fontSize: '26px', fontWeight: '700', margin: '0 0 12px' }}>
                  Welcome to ReferAus ??
                </h1>
                <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px' }}>
                  Hi <strong>{businessName}</strong>,<br /><br />
                  You&apos;re now listed on ReferAus — Australia&apos;s trusted directory connecting NDIS participants
                  with quality service providers. We&apos;re excited to have you on board!
                </p>

                <p style={{ color: '#111827', fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>
                  Get started in 3 easy steps:
                </p>

                {[
                  { n: 1, title: 'Complete Your Profile', desc: 'Add your services, service areas, and business details so participants can find you easily.' },
                  { n: 2, title: 'Add Your Services', desc: 'List the NDIS support categories you provide to appear in relevant searches.' },
                  { n: 3, title: 'Respond to Enquiries', desc: 'When participants reach out, respond promptly to build trust and win new clients.' },
                ].map(({ n, title, desc }) => (
                  <table key={n} cellPadding="0" cellSpacing="0" style={{ marginBottom: '16px', width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '36px' }}>
                          <span style={{ backgroundColor: '#1d4ed8', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'inline-block', textAlign: 'center', lineHeight: '28px', fontSize: '14px', fontWeight: '700' }}>{n}</span>
                        </td>
                        <td style={{ paddingLeft: '10px' }}>
                          <p style={{ color: '#111827', fontSize: '15px', fontWeight: '600', margin: '0 0 2px' }}>{title}</p>
                          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{desc}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ))}

                <table cellPadding="0" cellSpacing="0" style={{ margin: '32px auto' }}>
                  <tbody>
                    <tr>
                      <td>
                        <a href={profileUrl} style={ctaStyle}>Complete Your Profile</a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  Questions? Reply to this email or visit our{' '}
                  <a href="https://referaus.com/faq" style={{ color: '#1d4ed8' }}>Help Centre</a>.
                </p>
              </td>
            </tr>

            {/* Footer */}
            <tr>
              <td style={footerStyle}>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 4px' }}>
                  &copy; {new Date().getFullYear()} ReferAus. All rights reserved.
                </p>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                  <a href="https://referaus.com/contact" style={{ color: '#6b7280' }}>Unsubscribe</a>
                  {' · '}
                  <a href="https://referaus.com/privacy" style={{ color: '#6b7280' }}>Privacy Policy</a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export default WelcomeEmail;
