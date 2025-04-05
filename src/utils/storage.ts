// 다른 모듈에서 import할 수 있도록 CACHE_KEYS를 export
export const CACHE_KEYS = {
  RECOMMENDED_JOBS: 'recommended-jobs-cache',
  TEST_RESULT: 'test-result-cache',
  AUTO_MATCHING: 'auto-matching-cache',
  APPLY_RESULT: 'apply-result-cache',
  SCROLL_POSITION: 'job-list-scroll-position',
  SORT_ORDER: 'job-list-sort-order'
};

// 기본 캐시 TTL (30분)
export const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

/**
 * 데이터를 타임스탬프와 함께 localStorage에 저장
 * @param key 저장 키
 * @param data 저장할 데이터
 * @returns 성공 여부를 나타내는 boolean 값
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
    console.error(`저장 중 오류 발생 (${key}):`, error);
    return false;
  }
}

/**
 * 타임스탬프 유효성 검사를 통해 localStorage에서 데이터 로드
 * @param key 저장 키
 * @param ttl 유효 시간 (기본값: 30분)
 * @returns 저장된 데이터 또는 만료/누락된 경우 null
 */
export function loadFromStorage<T>(key: string, ttl = DEFAULT_CACHE_TTL): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) return null;
    
    const item = JSON.parse(serialized);
    if (!item.timestamp) return null;
    
    const timestamp = new Date(item.timestamp).getTime();
    if (Date.now() - timestamp > ttl) {
      // 캐시 만료
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error(`로드 중 오류 발생 (${key}):`, error);
    return null;
  }
}

/**
 * 모든 애플리케이션 캐시 삭제
 */
export function clearAllCache(): void {
  try {
    // 모든 캐시 키를 순회하며 삭제
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('모든 캐시가 성공적으로 삭제되었습니다');
  } catch (error) {
    console.error('캐시 삭제 중 오류 발생:', error);
  }
}

/**
 * 디버깅을 위한 모든 캐시 상태 확인
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
          // 단순 데이터인 경우 (스크롤 위치, 정렬 순서)
          if (key === CACHE_KEYS.SCROLL_POSITION || key === CACHE_KEYS.SORT_ORDER) {
            isValid = true;
            age = 'N/A';
            expired = false;
          } else {
            // JSON 데이터인 경우
            const parsedData = JSON.parse(item);
            isValid = true;
            
            // 타임스탬프가 있으면 경과 시간 계산
            if (parsedData.timestamp) {
              const timestamp = new Date(parsedData.timestamp).getTime();
              const secondsElapsed = Math.round((Date.now() - timestamp) / 1000);
              age = `${secondsElapsed}초`;
              expired = Date.now() - timestamp > DEFAULT_CACHE_TTL;
            }
          }
        }
      } catch (e) {
        console.error(`캐시 데이터 파싱 오류 (${key}):`, e);
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
    console.error("캐시 상태 확인 중 오류:", error);
    return [];
  }
}
