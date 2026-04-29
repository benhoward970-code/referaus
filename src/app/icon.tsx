import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0f05', borderRadius: 6 }}>
      <span style={{ color: '#f97316', fontSize: 20, fontWeight: 900, fontFamily: 'system-ui' }}>R</span>
    </div>,
    { ...size }
  );
}
