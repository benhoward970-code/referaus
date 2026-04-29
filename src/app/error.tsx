'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[Error]', error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-black mb-3">Something went wrong</h1>
        <p className="text-gray-500 mb-8 max-w-md">An unexpected error occurred. Our team has been notified.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all">Try Again</button>
          <Link href="/" className="px-6 py-3 border border-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
