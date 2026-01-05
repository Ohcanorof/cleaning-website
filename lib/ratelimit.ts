// Rate limiting for public endpoints.
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

//Upstash expects a Duration like "10m", "5m", "30s" (no spaces)
type Duration = Parameters<typeof Ratelimit.slidingWindow>[1];

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; //epoch ms
};

type Limiter = {
  limit: (key: string) => Promise<LimitResult>;
};

function hasUpstash() {
  return (
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

//In memory fallback for local dev
class MemorySlidingWindow implements Limiter {
  private hits = new Map<string, number[]>();
  constructor(private max: number, private windowMs: number) {}

  async limit(key: string): Promise<LimitResult> {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const arr = this.hits.get(key) ?? [];
    const recent = arr.filter((t) => t > cutoff);
    recent.push(now);
    this.hits.set(key, recent);

    const count = recent.length;
    const success = count <= this.max;
    const oldest = recent[0] ?? now;
    const reset = oldest + this.windowMs;
    const remaining = Math.max(0, this.max - count);
    return { success, limit: this.max, remaining, reset };
  }
}

function upstashLimiter(max: number, window: Duration, prefix: string): Limiter {
  const redis = Redis.fromEnv();
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    analytics: true,
    prefix,
  });
  return limiter as unknown as Limiter;
}

function makeLimiter(
  max: number,
  windowMs: number,
  windowLabel: Duration,
  prefix: string
): Limiter {
  if (hasUpstash()) return upstashLimiter(max, windowLabel, prefix);
  return new MemorySlidingWindow(max, windowMs);
}

//Public customer booking endpoint (/api/reservation)
export const reservationIpRatelimit = makeLimiter(
  5,
  10 * 60 * 1000,
  "10m",
  "ratelimit:reservation:ip"
);

//Additional per-email throttling (helps when multiple users share one IP)
export const reservationEmailRatelimit = makeLimiter(
  3,
  10 * 60 * 1000,
  "10m",
  "ratelimit:reservation:email"
);

//Owner actions (status updates, etc.)
export const ownerActionRatelimit = makeLimiter(
  60,
  5 * 60 * 1000,
  "5m",
  "ratelimit:owner:action"
);

//Email-link confirmation endpoint (should prevent brute force token probes)
export const authConfirmRatelimit = makeLimiter(
  30,
  10 * 60 * 1000,
  "10m",
  "ratelimit:auth:confirm"
);