
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
  
  // New cache keys for API client
  API_CACHE_PREFIX: 'api-cache-',
  
  // User preferences
  USER_PREFERENCES: 'user-preferences',
  THEME: 'app-theme',
  AUTO_FETCH: 'auto-fetch-jobs-enabled',
  LANGUAGE: 'app-language',
};

export const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

export const API_ENDPOINTS = {
  TEST: '/test',
  RECOMMENDED_JOBS: '/recommended-jobs',
  ALL_JOBS: '/all-jobs',
  AUTO_MATCHING: '/run-auto-job-matching',
  APPLY_JOBS: '/apply-saramin-jobs',
};

export const ERROR_MESSAGES = {
  API_ERROR: '서버 통신 중 오류가 발생했습니다.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해 주세요.',
  UNAUTHORIZED: '인증이 필요합니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  GENERAL_ERROR: '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};
