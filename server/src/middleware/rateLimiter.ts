import { Request, Response, NextFunction } from "express";

interface Bucket {
  tokens: number;
  lastRefill: number; // ms timestamp
}

interface RateLimiterOptions {
  capacity: number;      // max burst size (tokens)
  refillRate: number;    // tokens added per second
  keyBy?: (req: Request) => string;
}

// Stale buckets (no activity for this long) are pruned on each cleanup pass.
const STALE_TTL_MS = 60_000;

function createRateLimiter(options: RateLimiterOptions) {
  const { capacity, refillRate, keyBy } = options;
  const store = new Map<string, Bucket>();

  // Periodically remove buckets that have been idle long enough to be fully
  // refilled — they'd reset to capacity on next hit anyway, so keeping them
  // wastes memory.
  const pruneInterval = setInterval(() => {
    const cutoff = Date.now() - STALE_TTL_MS;
    for (const [key, bucket] of store) {
      if (bucket.lastRefill < cutoff) store.delete(key);
    }
  }, STALE_TTL_MS);

  // Don't block process exit if the server shuts down gracefully.
  pruneInterval.unref();

  function getKey(req: Request): string {
    if (keyBy) return keyBy(req);
    return req.ip ?? "unknown";
  }

  function refill(bucket: Bucket): void {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillRate);
    bucket.lastRefill = now;
  }

  return function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const key = getKey(req);

    let bucket = store.get(key);
    if (!bucket) {
      bucket = { tokens: capacity, lastRefill: Date.now() };
      store.set(key, bucket);
    }

    refill(bucket);

    if (bucket.tokens < 1) {
      const retryAfter = Math.ceil((1 - bucket.tokens) / refillRate);
      res.setHeader("Retry-After", retryAfter);
      res.setHeader("X-RateLimit-Limit", capacity);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.status(429).json({ message: "Too many requests. Please try again later." });
      return;
    }

    bucket.tokens -= 1;
    res.setHeader("X-RateLimit-Limit", capacity);
    res.setHeader("X-RateLimit-Remaining", Math.floor(bucket.tokens));
    next();
  };
}

// General API rate limiter: 60 req burst, 1 req/s sustained refill (60 req/min).
export const apiLimiter = createRateLimiter({
  capacity: 60,
  refillRate: 1,
});

// Stricter limiter for auth endpoints: 10 req burst, 1 req/6s sustained (10 req/min).
export const authLimiter = createRateLimiter({
  capacity: 10,
  refillRate: 1 / 6,
});
