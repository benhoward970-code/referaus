'use client';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Show on long pages: blog posts + provider profiles
const LONG_PAGE_PATTERNS = [/^\/blog\/[^/]+$/, /^\/providers\/[^/]+$/];

export function ScrollProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  const isLongPage = LONG_PAGE_PATTERNS.some(p => p.test(pathname));

  useEffect(() => {
    if (!isLongPage) {
      setVisible(false);
      setProgress(0);
      return;
    }

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setProgress(pct);
      setVisible(scrollTop > 50);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isLongPage, pathname]);

  if (!isLongPage) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[300] h-[3px] bg-transparent"
      aria-hidden="true"
    >
      <div
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition: 'width 0.1s linear, opacity 0.3s ease',
          height: '100%',
          backgroundColor: '#f97316',
        }}
      />
    </div>
  );
}
