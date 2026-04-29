import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'ReferAus - NDIS Provider Directory';

export default function OGImage() {
  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#2563EB', fontSize: 40, fontWeight: 900 }}>R</span>
        </div>
        <span style={{ color: 'white', fontSize: 48, fontWeight: 900, letterSpacing: -1 }}>ReferAus</span>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Find Trusted NDIS Providers Near You</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }}>Search, Compare and Connect — Free for Participants</div>
      <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 24px', color: 'white', fontSize: 16 }}>NDIS Providers</div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 24px', color: 'white', fontSize: 16 }}>Verified Reviews</div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 24px', color: 'white', fontSize: 16 }}>Hunter Region</div>
      </div>
    </div>,
    { ...size }
  );
}
