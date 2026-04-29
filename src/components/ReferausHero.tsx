'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferausHero() {
  const searchParams = useSearchParams();
  const [isProviderMode, setIsProviderMode] = useState(false);
  const [typingWord, setTypingWord] = useState('Providers');
  const [subtitle, setSubtitle] = useState('Find trusted NDIS providers in Newcastle');
  const [stats, setStats] = useState({ stat1: 0, stat2: 0, stat3: 0 });

  // Check URL param on mount
  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsProviderMode(mode === 'provider');
  }, [searchParams]);

  // Typing animation for participant mode
  useEffect(() => {
    if (isProviderMode) return;

    const WORDS = ['Providers', 'Therapists', 'Support', 'Services'];
    let wordIndex = 0, charIndex = 0, isDeleting = false;
    const type = () => {
      const currentWord = WORDS[wordIndex];
      if (!isDeleting) {
        if (charIndex < currentWord.length) {
          setTypingWord(currentWord.slice(0, charIndex + 1));
          charIndex++;
          setTimeout(type, 80);
        } else {
          isDeleting = true;
          setTimeout(type, 2600);
        }
      } else {
        if (charIndex > 0) {
          setTypingWord(currentWord.slice(0, charIndex - 1));
          charIndex--;
          setTimeout(type, 50);
        } else {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % WORDS.length;
          setTimeout(type, 500);
        }
      }
    };
    setTimeout(type, 500);
  }, [isProviderMode]);

  // Rotating subtitles for participant mode
  useEffect(() => {
    if (isProviderMode) return;

    const SUBS = ['Find trusted NDIS providers in Newcastle', 'List your NDIS business and grow', 'Compare providers, read real reviews'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % SUBS.length;
      setSubtitle(SUBS[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, [isProviderMode]);

  // Stat counter animation
  useEffect(() => {
    const countUp = (target: number, duration: number, callback: (val: number) => void) => {
      let start: number;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        callback(Math.floor(easeOut * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    setTimeout(() => {
      if (isProviderMode) {
        countUp(500, 2000, (v) => setStats((s) => ({ ...s, stat1: v })));
        countUp(49, 2000, (v) => setStats((s) => ({ ...s, stat2: v })));
        countUp(100, 2000, (v) => setStats((s) => ({ ...s, stat3: v })));
      } else {
        countUp(100, 2000, (v) => setStats((s) => ({ ...s, stat1: v })));
        countUp(24, 2000, (v) => setStats((s) => ({ ...s, stat2: v })));
        countUp(5, 2000, (v) => setStats((s) => ({ ...s, stat3: v })));
      }
    }, 800);
  }, [isProviderMode]);

  const ProviderBenefits = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
      {[
        { icon: '✅', label: 'Verified Badge', desc: 'Stand out from the crowd' },
        { icon: '📧', label: 'Unlimited Inquiries', desc: 'Reach verified NDIS clients' },
        { icon: '⭐', label: 'Client Reviews', desc: 'Build your reputation' },
        { icon: '🆓', label: '100% Free', desc: 'No hidden fees' },
      ].map((benefit) => (
        <div key={benefit.label} style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{benefit.icon}</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>{benefit.label}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{benefit.desc}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '-160px', right: '-160px', width: '600px', height: '600px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1 }} />

      <nav style={{ position: 'fixed', left: 0, right: 0, top: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', height: '64px' }}>
          <a href="/?mode=participant" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#1a0f05', border: '2px solid #f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#f97316' }}>R</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}><span>REFER</span><span style={{ color: '#f97316' }}>AUS</span></div>
          </a>

          <div style={{ display: 'flex', gap: '2rem', flex: 1, marginLeft: '2rem' }}>
            {['Providers', 'Pricing', 'About', 'Contact', 'Blog'].map((link, i) => (
              <a key={link} href="#" style={{ fontSize: '14px', fontWeight: 500, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: i === 0 ? '2px solid #f97316' : 'none', paddingBottom: '2px' }}>{link}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="#" style={{ fontSize: '14px', fontWeight: 500, padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Login</a>
            <a href="#" style={{ fontSize: '14px', fontWeight: 500, padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>Sign Up</a>
            <a href="/?mode=provider" style={{ fontSize: '14px', fontWeight: 600, padding: '0.5rem 1.25rem', backgroundColor: '#f97316', color: '#fff', textDecoration: 'none', borderRadius: '8px', boxShadow: '0 8px 24px -6px rgba(249,115,22,0.6)' }}>List Your Business</a>
          </div>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 10, minHeight: '88vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '7rem 1.5rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>

        {isProviderMode ? (
          <>
            {/* PROVIDER MODE */}
            <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.6s ease-out' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 1rem', fontSize: '0.7rem', color: '#fed7aa', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '9999px', backdropFilter: 'blur(10px)' }}>
                <span style={{ width: '1.5px', height: '1.5px', borderRadius: '9999px', backgroundColor: '#4ade80' }} />
                For NDIS Providers & Services
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 2px 18px rgba(0,0,0,0.5)', marginBottom: '1rem', maxWidth: '820px', animation: 'fadeIn 0.6s ease-out 0.15s both' }}>
              Grow Your <span style={{ background: 'linear-gradient(90deg, #fb923c 0%, #f97316 50%, #ea580c 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Client Base</span>
            </h1>

            <div style={{ marginBottom: '2rem', minHeight: '1.8em', animation: 'fadeIn 0.6s ease-out 0.3s both' }}>
              <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '550px', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>List your NDIS service. Reach verified clients. Get inquiries automatically. 100% free.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', animation: 'fadeIn 0.6s ease-out 0.45s both', flexWrap: 'wrap' }}>
              <a href="#" style={{ fontSize: '0.9375rem', fontWeight: 600, padding: '1rem 2rem', backgroundColor: '#f97316', color: '#fff', textDecoration: 'none', borderRadius: '0.75rem', boxShadow: '0 10px 30px -8px rgba(249,115,22,0.7)', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}>Start Listing Now (Free)</a>
              <a href="/?mode=participant" style={{ fontSize: '0.9375rem', fontWeight: 600, padding: '1rem 2rem', backgroundColor: 'transparent', color: '#fff', textDecoration: 'none', borderRadius: '0.75rem', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>View as Participant</a>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', animation: 'fadeIn 0.6s ease-out 0.6s both' }}>
              {['📊 Grow 5x Faster', '⭐ Get Rated & Reviewed', '✅ Always Verified'].map((badge) => (
                <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '9999px', backdropFilter: 'blur(10px)' }}>{badge}</span>
              ))}
            </div>

            <ProviderBenefits />

            {/* Provider Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)', animation: 'fadeIn 0.6s ease-out 0.75s both' }}>
              {[
                { value: stats.stat1, label: 'Active Clients Searching', suffix: '+' },
                { value: stats.stat2, label: 'Providers Growing', suffix: '%' },
                { value: stats.stat3, label: 'Free', suffix: '%' }
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}{stat.suffix}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* PARTICIPANT MODE (Original) */}
            <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.6s ease-out' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 1rem', fontSize: '0.7rem', color: '#fed7aa', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '9999px', backdropFilter: 'blur(10px)' }}>
                <span style={{ width: '1.5px', height: '1.5px', borderRadius: '9999px', backgroundColor: '#4ade80' }} />
                referaus.com — Australia's NDIS Marketplace
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 2px 18px rgba(0,0,0,0.5)', marginBottom: '1.5rem', maxWidth: '820px', animation: 'fadeIn 0.6s ease-out 0.15s both' }}>
              Find Trusted<br />
              <span style={{ display: 'inline-block' }}>
                NDIS <span style={{ background: 'linear-gradient(90deg, #fb923c 0%, #f97316 50%, #ea580c 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{typingWord}</span>
                <span style={{ display: 'inline-block', width: '3px', height: '0.85em', backgroundColor: '#f97316', marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 1.06s infinite steps(2, start)' }} />
              </span>
              <br />
              Near You
            </h1>

            <div style={{ marginBottom: '2rem', minHeight: '1.8em', overflow: 'hidden', animation: 'fadeIn 0.6s ease-out 0.3s both' }}>
              <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '550px', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{subtitle}</p>
            </div>

            <div style={{ marginBottom: '1.75rem', animation: 'fadeIn 0.6s ease-out 0.45s both' }}>
              <input type="text" placeholder="Search providers by service or location…" style={{ width: '100%', maxWidth: '600px', padding: '1rem 1.25rem', paddingLeft: '3rem', borderRadius: '1rem', fontSize: '0.875rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(14px)', boxSizing: 'border-box' }} />
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Popular searches: OT, Speech, Physio, Psychology, Support Coordination</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', animation: 'fadeIn 0.6s ease-out 0.6s both' }}>
              {['🏢 NDIS Providers', '✅ Verified Reviews', '🆓 100% Free'].map((badge) => (
                <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '9999px', backdropFilter: 'blur(10px)' }}>{badge}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)', animation: 'fadeIn 0.6s ease-out 0.75s both' }}>
              {[{ value: stats.stat1, label: 'Free for Participants', suffix: '%' }, { value: stats.stat2, label: 'Always Available', suffix: '/7' }, { value: stats.stat3, label: 'To Get Listed', suffix: 'min' }].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}{stat.suffix}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); filter: blur(6px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes blink { to { visibility: hidden; } }
      `}</style>
    </div>
  );
}
