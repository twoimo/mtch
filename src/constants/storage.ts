
export const STORAGE_KEYS = {
  // Job list related keys
  SCROLL_POSITION: 'job-list-scroll-position',
  SORT_ORDER: 'job-list-sort-order',
  HIDE_EXPIRED: 'hide-expired-jobs',
  
  // API cache related keys
  RECOMMENDED_JOBS: 'recommended-jobs-cache',
  TEST_RESULT: 'test-result-cache',
  AUTO_MATCHING: 'auto-matching-cache',
  APPLY_RESULT: 'apply-result-cache',
};

export const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds
