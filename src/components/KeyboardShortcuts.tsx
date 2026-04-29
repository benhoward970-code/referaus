'use client';
import { useEffect } from 'react';

export function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable;

      // "/" → focus search bar
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="earch"], input[aria-label*="earch"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // "Escape" → close open modals / menus
      if (e.key === 'Escape') {
        // Dispatch a custom event that modals can listen to
        window.dispatchEvent(new CustomEvent('referaus:escape'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
