'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ndisServices = [
  "Occupational Therapy", "Speech Pathology", "Physiotherapy", "Psychology",
  "Support Coordination", "Plan Management", "Behaviour Support",
  "Daily Living Support", "Community Access", "Supported Independent Living",
  "Transport", "Respite Care", "Early Childhood Intervention",
  "Home Modifications", "Assistive Technology", "Social Skills Groups",
  "Personal Care", "Meal Preparation", "Cleaning & Household",
  "Group Programs", "Employment Support", "Exercise Physiology",
].sort();

const hunterLocations = [
  "Newcastle", "Maitland", "Cessnock", "Lake Macquarie", "Port Stephens",
  "Singleton", "Muswellbrook", "Raymond Terrace", "Charlestown", "Wallsend",
  "Hamilton", "Lambton", "Mayfield", "Adamstown", "Merewether",
  "Belmont", "Toronto", "Kurri Kurri", "Morisset", "Swansea",
].sort();

const popularServices = [
  "Support Coordination", "Occupational Therapy", "Speech Pathology",
  "Physiotherapy", "Psychology", "Daily Living Support",
  "Plan Management", "Community Access",
];

const allSuggestions = [
  ...ndisServices.map(s => ({ type: 'service' as const, text: s })),
  ...hunterLocations.map(s => ({ type: 'location' as const, text: s })),
];

export function SearchAutocomplete({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Show popular services when focused with no query, filter on 1+ chars
  const filtered = query.length === 0
    ? popularServices.map(s => ({ type: 'service' as const, text: s }))
    : allSuggestions
        .filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => {
          // Prioritise matches that START with the query
          const aStarts = a.text.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
          const bStarts = b.text.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;
          // Then services before locations
          if (a.type !== b.type) return a.type === 'service' ? -1 : 1;
          return a.text.localeCompare(b.text);
        })
        .slice(0, 10);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (text: string) => {
    router.push('/providers?q=' + encodeURIComponent(text));
    setOpen(false);
    setQuery('');
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (selected >= 0 && filtered[selected]) go(filtered[selected].text); else if (query) go(query); }
    else if (e.key === 'Escape') setOpen(false);
  };

  const typeIcon = (t: string) => t === 'service' ? '🏷️' : '📍';
  const typeLabel = (t: string) => t === 'service' ? 'Service' : 'Location';

  return (
    <div ref={ref} className={'relative ' + className}>
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setSelected(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="What support do you need? e.g. coordination, therapy..."
          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white shadow-sm"
          aria-label="Search NDIS services and locations"
          aria-expanded={open && filtered.length > 0}
          role="combobox"
          aria-autocomplete="list"
        />
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50" role="listbox">
          {/* Header when no query */}
          {query.length === 0 && (
            <li className="px-4 pt-3 pb-1.5 text-[0.65rem] font-semibold text-gray-400 uppercase tracking-wider">
              Popular services
            </li>
          )}

          {filtered.map((s, i) => (
            <li
              key={s.type + s.text}
              role="option"
              aria-selected={i === selected}
              onClick={() => go(s.text)}
              onMouseEnter={() => setSelected(i)}
              className={
                'flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors ' +
                (i === selected ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50')
              }
            >
              <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs flex-shrink-0">
                {typeIcon(s.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {query.length > 0 ? highlightMatch(s.text, query) : s.text}
                </div>
              </div>
              <span className="text-[0.6rem] text-gray-400 uppercase tracking-wider flex-shrink-0">
                {typeLabel(s.type)}
              </span>
            </li>
          ))}

          {/* Show "Search for ..." option when typing */}
          {query.length > 0 && (
            <li
              onClick={() => go(query)}
              className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs flex-shrink-0">🔍</span>
              <span>Search for &ldquo;<strong>{query}</strong>&rdquo;</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/* Highlight matching text in bold */
function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="text-orange-600">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}
