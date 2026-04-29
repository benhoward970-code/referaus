import * as React from 'react';

interface EnquiryNotificationEmailProps {
  providerName: string;
  participantName: string;
  participantEmail: string;
  messagePreview: string;
  enquiryUrl?: string;
  enquiryDate?: string;
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

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

export function EnquiryNotificationEmail({
  providerName,
  participantName,
  participantEmail,
  messagePreview,
  enquiryUrl = 'https://referaus.com/dashboard/enquiries',
  enquiryDate,
}: EnquiryNotificationEmailProps) {
  const displayDate = enquiryDate || new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

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
                  New Enquiry
                </p>
                <h1 style={{ color: '#111827', fontSize: '26px', fontWeight: '700', margin: '0 0 12px' }}>
                  New Enquiry Received ??
                </h1>
                <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px' }}>
                  Hi <strong>{providerName}</strong>,<br /><br />
                  You have a new enquiry from an NDIS participant. Responding promptly increases your chances of securing a new client!
                </p>

                {/* Enquiry details box */}
                <div style={infoBoxStyle}>
                  <p style={{ color: '#0369a1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 12px' }}>Enquiry Details</p>
                  <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '120px', color: '#6b7280', fontSize: '14px', paddingBottom: '8px', verticalAlign: 'top' }}>From:</td>
                        <td style={{ color: '#111827', fontSize: '14px', fontWeight: '600', paddingBottom: '8px' }}>{participantName}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#6b7280', fontSize: '14px', paddingBottom: '8px', verticalAlign: 'top' }}>Email:</td>
                        <td style={{ paddingBottom: '8px' }}>
                          <a href={`mailto:${participantEmail}`} style={{ color: '#1d4ed8', fontSize: '14px' }}>{participantEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: '#6b7280', fontSize: '14px', paddingBottom: '8px', verticalAlign: 'top' }}>Date:</td>
                        <td style={{ color: '#111827', fontSize: '14px', paddingBottom: '8px' }}>{displayDate}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#6b7280', fontSize: '14px', verticalAlign: 'top', paddingTop: '8px', borderTop: '1px solid #bae6fd' }} colSpan={2}>
                          <p style={{ margin: '0 0 6px', fontWeight: '600' }}>Message:</p>
                          <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            &quot;{messagePreview}&quot;
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CTA */}
                <table cellPadding="0" cellSpacing="0" style={{ margin: '24px auto 32px' }}>
                  <tbody>
                    <tr>
                      <td>
                        <a href={enquiryUrl} style={ctaStyle}>View Enquiry</a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Tips */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '20px' }}>
                  <p style={{ color: '#166534', fontSize: '14px', fontWeight: '600', margin: '0 0 10px' }}>?? Quick Response Tips</p>
                  <ul style={{ color: '#374151', fontSize: '14px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
                    <li>Respond within <strong>24 hours</strong> — participants often contact multiple providers</li>
                    <li>Introduce yourself and your experience with their specific needs</li>
                    <li>Mention your availability and next steps clearly</li>
                    <li>Keep your tone warm, professional, and reassuring</li>
                  </ul>
                </div>
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

export default EnquiryNotificationEmail;
