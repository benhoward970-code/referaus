import { ImageResponse } from 'next/og';
import { getBlogPost } from '@/data/blog-posts';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function BlogOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? 'ReferAus Blog';
  const excerpt = post?.excerpt ?? 'NDIS Provider insights and guides for Newcastle & Hunter Region';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
          fontFamily: 'sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Orange accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: '#f97316' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: 'white',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#2563EB', fontSize: 30, fontWeight: 900 }}>R</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 24, fontWeight: 700 }}>ReferAus Blog</span>
        </div>

        {/* Title */}
        <div
          style={{
            color: 'white',
            fontSize: title.length > 60 ? 40 : 52,
            fontWeight: 900,
            lineHeight: 1.15,
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* Excerpt */}
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22, maxWidth: 800, lineHeight: 1.5 }}>
          {excerpt.length > 120 ? excerpt.slice(0, 117) + '...' : excerpt}
        </div>

        {/* Bottom tag */}
        <div style={{ position: 'absolute', bottom: 48, right: 60 }}>
          <div
            style={{
              background: '#f97316',
              color: 'white',
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            referaus.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
