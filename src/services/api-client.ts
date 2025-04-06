
import { STORAGE_KEYS, CACHE_EXPIRY } from '@/constants/storage';
import { toast } from '@/hooks/use-toast';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheKey?: string;
  cacheExpiry?: number;
}

interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
  }

  /**
   * 캐시에서 데이터를 가져옵니다.
   * @param key 캐시 키
   * @returns 캐시된 데이터 또는 null
   */
  private getFromCache<T>(key: string): T | null {
    try {
      const cachedData = localStorage.getItem(key);
      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();

      // 캐시 만료 확인
      if (now - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('캐시 데이터 불러오기 오류:', error);
      return null;
    }
  }

  /**
   * 데이터를 캐시에 저장합니다.
   * @param key 캐시 키
   * @param data 저장할 데이터
   */
  private saveToCache<T>(key: string, data: T): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('캐시 데이터 저장 오류:', error);
    }
  }

  /**
   * API 요청을 실행합니다.
   * @param endpoint API 엔드포인트
   * @param options 요청 옵션
   * @returns 응답 데이터 Promise
   */
  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = false,
      cacheKey,
      cacheExpiry = CACHE_EXPIRY,
    } = options;

    // 캐시 키 결정
    const effectiveCacheKey = cacheKey || `${method}-${endpoint}`;

    // 캐시 처리 (GET 요청일 경우만)
    if (cache && method === 'GET') {
      const cachedData = this.getFromCache<T>(effectiveCacheKey);
      if (cachedData) {
        console.log(`캐시에서 데이터 로드: ${effectiveCacheKey}`);
        return cachedData;
      }
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const requestOptions: RequestInit = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
      };

      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);

      // 네트워크 응답 오류 처리
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }

      // 응답 데이터 파싱
      const data = await response.json();

      // 캐시 저장 (GET 요청일 경우만)
      if (cache && method === 'GET') {
        this.saveToCache(effectiveCacheKey, data);
      }

      return data as T;
    } catch (error) {
      console.error(`API 요청 오류 (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * GET 요청을 실행합니다.
   * @param endpoint API 엔드포인트
   * @param options 요청 옵션
   * @returns 응답 데이터 Promise
   */
  public async get<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST 요청을 실행합니다.
   * @param endpoint API 엔드포인트
   * @param body 요청 본문
   * @param options 요청 옵션
   * @returns 응답 데이터 Promise
   */
  public async post<T>(
    endpoint: string,
    body: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT 요청을 실행합니다.
   * @param endpoint API 엔드포인트
   * @param body 요청 본문
   * @param options 요청 옵션
   * @returns 응답 데이터 Promise
   */
  public async put<T>(
    endpoint: string,
    body: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE 요청을 실행합니다.
   * @param endpoint API 엔드포인트
   * @param options 요청 옵션
   * @returns 응답 데이터 Promise
   */
  public async delete<T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient({
  baseUrl: '/api/developer/main_service_communicate',
});
