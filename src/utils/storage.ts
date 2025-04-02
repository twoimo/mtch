
// Export CACHE_KEYS so it can be imported by other modules
export const CACHE_KEYS = {
  RECOMMENDED_JOBS: 'recommended-jobs-cache',
  TEST_RESULT: 'test-result-cache',
  AUTO_MATCHING: 'auto-matching-cache',
  APPLY_RESULT: 'apply-result-cache',
  SCROLL_POSITION: 'job-list-scroll-position',
  SORT_ORDER: 'job-list-sort-order'
};

// Default cache TTL (30 minutes)
export const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

/**
 * Save data to localStorage with timestamp
 * @param key Storage key
 * @param data Data to store
 * @returns Boolean indicating success
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    const storageItem = {
      data,
      timestamp: new Date().toISOString()
    };
    
    const serialized = JSON.stringify(storageItem);
    localStorage.setItem(key, serialized);
    
    return true;
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    return false;
  }
}

/**
 * Load data from localStorage with timestamp validation
 * @param key Storage key
 * @param ttl Time-to-live in milliseconds (default: 30 minutes)
 * @returns The stored data or null if expired/missing
 */
export function loadFromStorage<T>(key: string, ttl = DEFAULT_CACHE_TTL): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) return null;
    
    const item = JSON.parse(serialized);
    if (!item.timestamp) return null;
    
    const timestamp = new Date(item.timestamp).getTime();
    if (Date.now() - timestamp > ttl) {
      // Cache expired
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error(`Error loading from storage (${key}):`, error);
    return null;
  }
}

/**
 * Clear all application cache 
 */
export function clearAllCache(): void {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('All cache cleared successfully');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get all cache items status for debugging 
 */
export function getCacheStatus() {
  try {
    const keys = Object.values(CACHE_KEYS);
    return keys.map(key => {
      const item = localStorage.getItem(key);
      let isValid = false;
      let age = null;
      let expired = false;
      
      try {
        if (item) {
          if (key === CACHE_KEYS.SCROLL_POSITION || key === CACHE_KEYS.SORT_ORDER) {
            isValid = true;
            age = 'N/A';
            expired = false;
          } else {
            const parsedData = JSON.parse(item);
            isValid = true;
            
            if (parsedData.timestamp) {
              const timestamp = new Date(parsedData.timestamp).getTime();
              const secondsElapsed = Math.round((Date.now() - timestamp) / 1000);
              age = `${secondsElapsed}초`;
              expired = Date.now() - timestamp > DEFAULT_CACHE_TTL;
            }
          }
        }
      } catch (e) {
        console.error(`Cache parsing error for ${key}:`, e);
      }
      
      return {
        key,
        exists: !!item,
        size: item ? new Blob([item]).size : 0,
        valid: isValid,
        age: age !== null ? age : 'N/A',
        expired
      };
    });
  } catch (error) {
    console.error("Error checking cache status:", error);
    return [];
  }
}
