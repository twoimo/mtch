import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define proper interface types for our data structures
interface Job {
  id: number;
  score: number;
  reason: string;
  strength: string;
  weakness: string;
  apply_yn: number;
  companyName: string;
  jobTitle: string;
  jobLocation: string;
  companyType: string;
  url: string;
  deadline?: string;
}

interface TestResult {
  success: boolean;
  message: string;
  data?: unknown;
  timestamp?: string;
}

interface AutoMatchingResult {
  success: boolean;
  matched: number;
  skipped: number;
  details?: string[];
  timestamp?: string;
}

interface ApplyResult {
  success: boolean;
  applied: number;
  failed: number;
  details?: string[];
  timestamp?: string;
}

// 로컬스토리지 키 상수
const CACHE_KEYS = {
  RECOMMENDED_JOBS: 'recommended-jobs-cache',
  TEST_RESULT: 'test-result-cache',
  AUTO_MATCHING: 'auto-matching-cache',
  APPLY_RESULT: 'apply-result-cache'
};

// 캐시 유효 시간 (밀리초 단위, 기본 30분)
const CACHE_EXPIRY = 30 * 60 * 1000;

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export const useApiActions = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [autoMatchingResult, setAutoMatchingResult] = useState<AutoMatchingResult | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);
  
  // 로딩 상태
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [isAutoMatchingLoading, setIsAutoMatchingLoading] = useState(false);
  const [isApplyLoading, setIsApplyLoading] = useState(false);
  
  const { toast } = useToast();
  
  // 캐시 저장 함수 개선
  const saveToCache = <T,>(key: string, data: T) => {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`Data cached to ${key}`, data);
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };
  
  // 캐시 로드 함수 개선
  const loadFromCache = <T,>(key: string): T | null => {
    try {
      const cachedData = localStorage.getItem(key);
      if (!cachedData) {
        console.log(`No cached data found for ${key}`);
        return null;
      }
      
      const parsedCache: CacheData<T> = JSON.parse(cachedData);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_EXPIRY;
      
      if (isExpired) {
        console.log(`Cached data for ${key} is expired`);
        localStorage.removeItem(key);
        return null;
      }
      
      console.log(`Loaded cached data from ${key}`, parsedCache.data);
      return parsedCache.data;
    } catch (error) {
      console.error(`Error loading cache for ${key}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  };
  
  // 초기 로드 시 캐시된 데이터 불러오기
  useEffect(() => {
    // 동기식으로 캐시 로드 보장
    const loadCache = () => {
      try {
        // 캐시된 채용 정보 로드
        const cachedJobs = loadFromCache<Job[]>(CACHE_KEYS.RECOMMENDED_JOBS);
        if (cachedJobs && cachedJobs.length > 0) {
          console.log("Setting cached jobs:", cachedJobs.length);
          setRecommendedJobs(cachedJobs);
          // useEffect 내에서 사용하므로 의존성에 포함해야 함
          if (toast) {
            toast({
              title: '캐시된 정보 로드됨',
              description: `${cachedJobs.length}개의 캐시된 채용 정보를 불러왔습니다.`,
              variant: 'default',
            });
          }
        }
        
        // 기타 캐시 데이터 로드
        const cachedTestResult = loadFromCache<TestResult>(CACHE_KEYS.TEST_RESULT);
        if (cachedTestResult) setTestResult(cachedTestResult);
        
        const cachedAutoMatchingResult = loadFromCache<AutoMatchingResult>(CACHE_KEYS.AUTO_MATCHING);
        if (cachedAutoMatchingResult) setAutoMatchingResult(cachedAutoMatchingResult);
        
        const cachedApplyResult = loadFromCache<ApplyResult>(CACHE_KEYS.APPLY_RESULT);
        if (cachedApplyResult) setApplyResult(cachedApplyResult);
      } catch (error) {
        console.error("Error loading cache:", error);
      }
    };

    // 컴포넌트 마운트 시 즉시 캐시 로드
    loadCache();
  }, [toast]);  // toast를 의존성 배열에 추가

  // API 핸들러
  const handleTestApi = useCallback(async () => {
    setIsTestLoading(true);
    try {
      const response = await fetch('/api/example');
      const data = await response.json() as TestResult;
      setTestResult(data);
      saveToCache(CACHE_KEYS.TEST_RESULT, data);
      
      toast({
        title: 'API 호출 성공',
        description: '테스트 API가 성공적으로 호출되었습니다',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'API 호출 실패',
        description: '테스트 API 호출 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsTestLoading(false);
    }
  }, [toast]);
  
  const handleGetRecommendedJobs = useCallback(async () => {
    setIsRecommendedLoading(true);
    try {
      // 실제 API 호출 코드 (현재는 더미 데이터)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const dummyJobs: Job[] = Array.from({ length: 25 }).map((_, i) => ({
        id: i + 1,
        companyName: `회사 ${i + 1}`,
        jobTitle: `개발자 포지션 ${i + 1}`,
        jobLocation: `서울 강남구`,
        companyType: ['대기업', '스타트업', 'IT기업', '외국계기업', '중소기업'][i % 5],
        score: Math.floor(Math.random() * 31) + 70,
        reason: "이력서와 직무 요구사항이 일치합니다.",
        strength: "지원자가 보유한 기술 스택과 회사에서 요구하는 기술이 일치합니다.",
        weakness: "요구하는 경력보다 지원자의 경력이 부족합니다.",
        apply_yn: Math.random() > 0.3 ? 1 : 0,
        url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=43755511",
        deadline: `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`
      }));
      
      // 상태 및 캐시 업데이트
      setRecommendedJobs(dummyJobs);
      
      // 명시적으로 localStorage에 직접 저장
      saveToCache(CACHE_KEYS.RECOMMENDED_JOBS, dummyJobs);
      
      // 캐시 저장 확인
      console.log("Jobs cached:", dummyJobs.length);
      
      toast({
        title: '채용 정보 로드 성공',
        description: `총 ${dummyJobs.length}개의 추천 채용 정보를 가져왔습니다`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: '채용 정보 로드 실패',
        description: '추천 채용 정보를 가져오는 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsRecommendedLoading(false);
    }
  }, [toast]);
  
  const handleRunAutoJobMatching = useCallback(async () => {
    setIsAutoMatchingLoading(true);
    try {
      // 실제 API 호출 코드 (현재는 더미 데이터)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const matchingResult: AutoMatchingResult = {
        success: true,
        matched: Math.floor(Math.random() * 10) + 5,
        skipped: Math.floor(Math.random() * 3),
        details: [
          "매칭 프로세스가 성공적으로 완료되었습니다.",
          "총 15개의 채용공고를 검토했습니다.",
          "8개의 채용공고가 귀하의 이력서와 매칭되었습니다."
        ],
        timestamp: new Date().toISOString()
      };
      
      setAutoMatchingResult(matchingResult);
      saveToCache(CACHE_KEYS.AUTO_MATCHING, matchingResult);
      
      toast({
        title: '자동 매칭 성공',
        description: `${matchingResult.matched}개의 채용공고가 매칭되었습니다`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: '자동 매칭 실패',
        description: '채용 매칭 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsAutoMatchingLoading(false);
    }
  }, [toast]);
  
  const handleApplySaraminJobs = useCallback(async () => {
    setIsApplyLoading(true);
    try {
      // 실제 API 호출 코드 (현재는 더미 데이터)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const applyResult: ApplyResult = {
        success: true,
        applied: Math.floor(Math.random() * 5) + 1,
        failed: Math.floor(Math.random() * 2),
        details: [
          "지원 프로세스가 완료되었습니다.",
          "3개의 채용공고에 지원했습니다.",
          "1개의 채용공고는 이미 마감되었습니다."
        ],
        timestamp: new Date().toISOString()
      };
      
      setApplyResult(applyResult);
      saveToCache(CACHE_KEYS.APPLY_RESULT, applyResult);
      
      toast({
        title: '지원 완료',
        description: `${applyResult.applied}개의 채용공고에 지원했습니다`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: '지원 실패',
        description: '채용 지원 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsApplyLoading(false);
    }
  }, [toast]);
  
  // 캐시 초기화 함수
  const clearCache = useCallback(() => {
    Object.values(CACHE_KEYS).forEach(key => localStorage.removeItem(key));
    setTestResult(null);
    setRecommendedJobs([]);
    setAutoMatchingResult(null);
    setApplyResult(null);
    toast({
      title: '캐시 초기화',
      description: '모든 캐시된 데이터가 삭제되었습니다.',
      variant: 'default',
    });
  }, [toast]);
  
  // 유틸리티 함수: 캐시 디버깅을 위한 함수
  const checkCacheStatus = useCallback(() => {
    try {
      const keys = Object.values(CACHE_KEYS);
      const status = keys.map(key => {
        const item = localStorage.getItem(key);
        return {
          key,
          exists: !!item,
          size: item ? item.length : 0,
          valid: item ? (() => {
            try { 
              JSON.parse(item);
              return true;
            } catch(e) { 
              return false;
            }
          })() : false
        };
      });
      
      console.table(status);
      return status;
    } catch (error) {
      console.error("Error checking cache status:", error);
      return [];
    }
  }, []); // Fixed: Added empty dependency array and removed typo

  return {
    // 상태
    testResult,
    recommendedJobs,
    autoMatchingResult,
    applyResult,
    
    // 로딩 상태
    isTestLoading,
    isRecommendedLoading,
    isAutoMatchingLoading,
    isApplyLoading,
    
    // 액션 메서드
    handleTestApi,
    handleGetRecommendedJobs,
    handleRunAutoJobMatching,
    handleApplySaraminJobs,
    
    // 캐시 관리 메서드
    clearCache,
    checkCacheStatus, // 디버깅용 메서드 추가
  };
};
