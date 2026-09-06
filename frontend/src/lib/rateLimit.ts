/**
 * High-performance In-Memory Sliding Window Rate Limiter
 * Provides defensive rate limiting for sensitive endpoints:
 * - Authentication (brute-force defense)
 * - AI Chat & RAG (quota exhaustion & abuse defense)
 * - Resume File Uploads (storage and DoS defense)
 * - Diagnostics & Testing (spam defense)
 */

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private lastCleanup = Date.now();

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  public check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    // Graceful bypass in automated testing environments
    if (process.env.NODE_ENV === 'test' || process.env.BYPASS_RATE_LIMIT === 'true') {
      return { allowed: true, remaining: this.maxRequests, resetTime: 0 };
    }

    const now = Date.now();
    this.cleanup(now);

    const record = this.cache.get(identifier) || { timestamps: [] };
    const windowStart = now - this.windowMs;

    // Filter out timestamps outside the active sliding window
    const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (activeTimestamps.length >= this.maxRequests) {
      const oldest = activeTimestamps[0];
      const resetTime = Math.ceil((oldest + this.windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.max(1, resetTime),
      };
    }

    activeTimestamps.push(now);
    this.cache.set(identifier, { timestamps: activeTimestamps });

    return {
      allowed: true,
      remaining: this.maxRequests - activeTimestamps.length,
      resetTime: Math.ceil(this.windowMs / 1000),
    };
  }

  private cleanup(now: number) {
    // Run cleanup every 60 seconds to prevent unbounded memory growth
    if (now - this.lastCleanup > 60000) {
      const cutoff = now - this.windowMs;
      for (const [key, val] of this.cache.entries()) {
        const fresh = val.timestamps.filter((ts) => ts > cutoff);
        if (fresh.length === 0) {
          this.cache.delete(key);
        } else {
          this.cache.set(key, { timestamps: fresh });
        }
      }
      this.lastCleanup = now;
    }
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new RateLimiter(60 * 1000, 10); // 10 attempts per minute per IP
export const aiRateLimiter = new RateLimiter(60 * 1000, 30); // 30 AI prompts per minute per user/IP
export const uploadRateLimiter = new RateLimiter(60 * 1000, 10); // 10 uploads per minute per user/IP
export const generalApiRateLimiter = new RateLimiter(60 * 1000, 120); // 120 requests per minute

/**
 * Extracts client IP identifier defensively from request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
