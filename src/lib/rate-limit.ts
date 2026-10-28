/**
 * Very small in-memory rate limiter.
 * Keeps bots from flooding the order form (max N submissions per window per IP).
 */

type Bucket = { hits: number[] };

const globalForLimiter = globalThis as typeof globalThis & {
  __decucareRateBuckets?: Map<string, Bucket>;
};

const buckets: Map<string, Bucket> =
  globalForLimiter.__decucareRateBuckets ?? new Map<string, Bucket>();
globalForLimiter.__decucareRateBuckets = buckets;

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 6; // submissions per window

export function tooManyRequests(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < WINDOW_MS);

  if (bucket.hits.length >= MAX_HITS) {
    buckets.set(key, bucket);
    return true;
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // opportunistic cleanup
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.hits.every((t) => now - t >= WINDOW_MS)) buckets.delete(k);
    }
  }
  return false;
}

export function clientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
