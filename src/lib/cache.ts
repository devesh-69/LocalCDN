/**
 * Simple in-memory cache implementation for the application
 * Helps reduce database queries and API calls for frequently accessed data
 */

type CacheEntry<T> = {
  value: T;
  expiry: number | null; // null means no expiration
};

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to store
   * @param ttl - Time to live in milliseconds (default: 5 minutes, null for no expiration)
   */
  set<T>(key: string, value: T, ttl: number | null = this.DEFAULT_TTL): void {
    const expiry = ttl === null ? null : Date.now() + ttl;
    
    this.cache.set(key, {
      value,
      expiry,
    });
  }

  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if the entry has expired
    if (entry.expiry !== null && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }

  /**
   * Delete a value from the cache
   * @param key - The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all values from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get a value from the cache or compute it if not found
   * @param key - The cache key
   * @param fn - Function to compute the value if not in cache
   * @param ttl - Time to live in milliseconds
   * @returns The cached value or computed value
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl: number | null = this.DEFAULT_TTL): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const value = await fn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Remove all expired entries from the cache
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry !== null && entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Create a singleton instance
export const cache = new MemoryCache();

// Run cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

// Helper to create cache keys with prefixes for different data types
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  image: (id: string) => `image:${id}`,
  gallery: (userId: string, page: number = 1, limit: number = 20) => 
    `gallery:${userId}:${page}:${limit}`,
  tags: (query: string = '') => `tags:${query}`,
  stats: (userId: string) => `stats:${userId}`,
}; 