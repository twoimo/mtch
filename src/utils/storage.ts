/**
 * 브라우저 스토리지 가용성 확인 및 안전한 접근을 위한 유틸리티
 */

/**
 * localStorage 사용 가능 여부 확인
 */
export function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 안전하게 localStorage에 데이터 저장
 */
export function safeSetItem(key: string, value: unknown) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }
  
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('localStorage setItem failed:', error);
    return false;
  }
}

/**
 * 안전하게 localStorage에서 데이터 가져오기
 */
export function safeGetItem<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return null;
  }
  
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return null;
    
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error('localStorage getItem failed:', error);
    return null;
  }
}

/**
 * 안전하게 localStorage에서 데이터 삭제하기
 */
export function safeRemoveItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('localStorage removeItem failed:', error);
    return false;
  }
}
