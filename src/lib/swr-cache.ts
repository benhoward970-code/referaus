/**
 * Item 94: Simple stale-while-revalidate client-side cache.
 * Stores responses in memory (Map) with optional localStorage persistence.
 * Returns cached data immediately, fetches fresh data in background.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function readLS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`swr:${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

function writeLS<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`swr:${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // quota exceeded — ignore
  }
}

/**
 * useSWRCache: stale-while-revalidate hook.
 * - Returns cached data immediately (from memory or localStorage)
 * - Fetches fresh data in background, calls onFresh when done
 */
export async function fetchWithSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  onFresh: (data: T) => void,
): Promise<T | null> {
  // 1. Check memory cache
  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  let stale: T | null = null;
  if (memEntry) {
    stale = memEntry.data;
  } else {
    // 2. Try localStorage
    stale = readLS<T>(key);
    if (stale) {
      memoryCache.set(key, { data: stale, timestamp: 0 }); // timestamp=0 → always revalidate
    }
  }

  // 3. Revalidate if stale or expired
  const isExpired = !memEntry || now - memEntry.timestamp > TTL_MS;
  if (isExpired) {
    (async () => {
      try {
        const fresh = await fetcher();
        memoryCache.set(key, { data: fresh, timestamp: Date.now() });
        writeLS(key, fresh);
        onFresh(fresh);
      } catch {
        // silently fail — stale data is still shown
      }
    })();
  }

  return stale;
}
