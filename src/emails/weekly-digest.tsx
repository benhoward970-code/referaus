import * as React from 'react';

interface WeeklyDigestEmailProps {
  providerName: string;
  businessName: string;
  weekEnding: string;
  profileViews: number;
  profileViewsChange: number; // percentage vs last week
  newEnquiries: number;
  searchAppearances: number;
  dashboardUrl?: string;
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

const statCardStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
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

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0) return <span style={{ color: '#6b7280', fontSize: '12px' }}>no change</span>;
  const up = change > 0;
  return (
    <span style={{ color: up ? '#16a34a' : '#dc2626', fontSize: '12px', fontWeight: '600' }}>
      {up ? '?' : '?'} {Math.abs(change)}% vs last week
    </span>
  );
}

export function WeeklyDigestEmail({
  providerName,
  businessName,
  weekEnding,
  profileViews,
  profileViewsChange,
  newEnquiries,
  searchAppearances,
  dashboardUrl = 'https://referaus.com/dashboard',
}: WeeklyDigestEmailProps) {
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
                <p style={{ color: '#1d4ed8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
                  Weekly Digest · Week ending {weekEnding}
                </p>
                <h1 style={{ color: '#111827', fontSize: '26px', fontWeight: '700', margin: '0 0 8px' }}>
                  Your Week in Review ??
                </h1>
                <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', margin: '0 0 28px' }}>
                  Hi <strong>{providerName}</strong>, here&apos;s how <strong>{businessName}</strong> performed this week on ReferAus.
                </p>

                {/* Stats grid */}
                <table cellPadding="0" cellSpacing="0" style={{ width: '100%', marginBottom: '28px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '33%', paddingRight: '8px' }}>
                        <div style={statCardStyle}>
                          <p style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 6px', letterSpacing: '0.5px' }}>Profile Views</p>
                          <p style={{ color: '#111827', fontSize: '36px', fontWeight: '700', margin: '0 0 4px', lineHeight: 1 }}>{profileViews}</p>
                          <ChangeIndicator change={profileViewsChange} />
                        </div>
                      </td>
                      <td style={{ width: '33%', paddingLeft: '4px', paddingRight: '4px' }}>
                        <div style={statCardStyle}>
                          <p style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 6px', letterSpacing: '0.5px' }}>New Enquiries</p>
                          <p style={{ color: '#111827', fontSize: '36px', fontWeight: '700', margin: '0 0 4px', lineHeight: 1 }}>{newEnquiries}</p>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>this week</span>
                        </div>
                      </td>
                      <td style={{ width: '33%', paddingLeft: '8px' }}>
                        <div style={statCardStyle}>
                          <p style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 6px', letterSpacing: '0.5px' }}>Search Appearances</p>
                          <p style={{ color: '#111827', fontSize: '36px', fontWeight: '700', margin: '0 0 4px', lineHeight: 1 }}>{searchAppearances}</p>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>impressions</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Tips */}
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '20px', marginBottom: '28px' }}>
                  <p style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', margin: '0 0 10px' }}>?? Tips to Improve Your Visibility</p>
                  <ul style={{ color: '#374151', fontSize: '14px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
                    <li>Keep your profile <strong>100% complete</strong> — complete profiles rank higher in search</li>
                    <li>Add a <strong>profile photo or logo</strong> to build participant trust</li>
                    <li>List all <strong>NDIS support categories</strong> you deliver — this expands your reach</li>
                    <li>Add <strong>service areas</strong> so local participants can find you</li>
                    <li>Respond to enquiries quickly — fast responders get featured</li>
                  </ul>
                </div>

                {/* CTA */}
                <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
                  <tbody>
                    <tr>
                      <td>
                        <a href={dashboardUrl} style={ctaStyle}>View Full Dashboard</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Footer */}
            <tr>
              <td style={footerStyle}>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 4px' }}>
                  &copy; {new Date().getFullYear()} ReferAus. All rights reserved.
                </p>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 4px' }}>
                  You&apos;re receiving this because you have a provider listing on ReferAus.
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

export default WeeklyDigestEmail;
