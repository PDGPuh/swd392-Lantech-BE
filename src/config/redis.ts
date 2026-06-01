import Redis from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.warn('Redis connection error (non-fatal, cache disabled):', err.message);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }
  return redis;
}

/**
 * Safe cache get - returns null if Redis is unavailable
 */
export async function cacheGet(key: string): Promise<string | null> {
  try {
    const r = getRedis();
    return await r.get(key);
  } catch {
    return null;
  }
}

/**
 * Safe cache set - silently fails if Redis is unavailable
 */
export async function cacheSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  try {
    const r = getRedis();
    if (ttlSeconds) {
      await r.setex(key, ttlSeconds, value);
    } else {
      await r.set(key, value);
    }
  } catch {
    // Redis unavailable, skip caching
  }
}

/**
 * Safe cache delete
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    const r = getRedis();
    await r.del(key);
  } catch {
    // Redis unavailable
  }
}
