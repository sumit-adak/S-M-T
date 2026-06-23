/**
 * Server-side Supabase REST reader — TypeScript port of lib/supabase.php.
 *
 * Same contract as the PHP version: every page falls back to its static
 * content if these return null, so the site never breaks when Supabase is
 * offline / rate-limited.
 *
 * The PHP disk cache (lib/cache/, 120s TTL) is replaced by Next's fetch
 * cache: `next: { revalidate: 120 }`. Content updates appear within 120s
 * with zero rebuild — same behaviour as before.
 */

export const SB_REVALIDATE = 120; // seconds, mirrors SB_CACHE_TTL

function env(key: string): string | undefined {
  return process.env[key];
}

function urlFor(table: string, query: string): string | null {
  const base = env('NEXT_PUBLIC_SUPABASE_URL');
  const anon = env('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!base || !anon) return null;
  return `${base.replace(/\/$/, '')}/rest/v1/${table}?${query}`;
}

/**
 * GET /rest/v1/{table}?{query} → parsed array, or null on any failure.
 * Cached by Next for SB_REVALIDATE seconds (stale-while-revalidate-ish).
 */
export async function sbFetch<T = any>(
  table: string,
  query = 'select=*'
): Promise<T[] | null> {
  const url = urlFor(table, query);
  const anon = env('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anon) return null;

  try {
    const res = await fetch(url, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
      next: { revalidate: SB_REVALIDATE },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as T[]) : null;
  } catch {
    return null;
  }
}

/** Read one site_settings value (already-decoded JSON), or `fallback`. */
export async function sbSetting<T = any>(
  key: string,
  fallback: T
): Promise<T> {
  const rows = await sbFetch<{ key: string; value: any }>(
    'site_settings',
    'select=key,value'
  );
  if (!rows) return fallback;
  const row = rows.find((r) => r.key === key);
  return row ? (row.value as T) : fallback;
}

/** Prefix root-relative asset paths ("assets/…") with `base`; pass URLs through. */
export function sbAsset(path: string | null | undefined, base = '/'): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return base + path.replace(/^\/+/, '');
}
