import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../components/ui/use-toast';

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
  APPLY_RESULT: 'apply-result-cache',
  HIDE_EXPIRED: 'hide-expired-jobs' // 마감일 지난 공고 제외 설정 키 추가
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
  
  // 필터 상태 - 기본값을 false로 변경
  const [hideExpired, setHideExpired] = useState<boolean>(() => {
    const savedState = localStorage.getItem(CACHE_KEYS.HIDE_EXPIRED);
    return savedState === null ? false : savedState === 'true';
  });
  
  const { toast } = useToast();
  
  // 직접적으로 localStorage에 접근하는 함수들 (우선순위 높게 정의)
  const directSaveToStorage = useCallback(<T,>(key: string, data: T): boolean => {
    try {
      const storageItem = {
        data,
        timestamp: Date.now()
      };
      
      // 문자열로 직렬화
      const serialized = JSON.stringify(storageItem);
      
      // 저장 시도
      localStorage.setItem(key, serialized);
      
      // 저장 확인
      const saved = localStorage.getItem(key);
      console.log(`직접 저장 완료: ${key}, 성공: ${!!saved}`);
      return !!saved;
    } catch (error) {
      console.error("저장 실패:", error);
      return false;
    }
  }, []);
  
  const directLoadFromStorage = useCallback(<T,>(key: string): T | null => {
    try {
      // 항목 가져오기
      const serialized = localStorage.getItem(key);
      if (!serialized) {
        console.log(`${key}에 해당하는 캐시 없음`);
        return null;
      }
      
      // 역직렬화
      const item = JSON.parse(serialized);
      
      // 만료 확인
      if (Date.now() - item.timestamp > CACHE_EXPIRY) {
        console.log(`${key} 캐시 만료됨`);
        localStorage.removeItem(key);
        return null;
      }
      
      console.log(`${key} 캐시 로드 성공`);
      return item.data;
    } catch (error) {
      console.error(`${key} 캐시 로드 실패:`, error);
      return null;
    }
  }, []);

  // 앱 시작 시 캐시 확인 (디버깅용)
  useEffect(() => {
    console.log("=== 캐시 상태 확인 ===");
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        console.log(`${key}: ${item ? '있음' : '없음'}`);
        
        if (item) {
          try {
            const parsed = JSON.parse(item);
            console.log(`${key} ��이터:`, parsed);
          } catch (err) {
            console.error(`${key} 파싱 실패`);
          }
        }
      });
    } catch (err) {
      console.error("캐시 확인 중 오류:", err);
    }
  }, []);
  
  // 초기 로드 시 캐시 불러오기
  useEffect(() => {
    console.log("앱 시작: 캐시 데이터 로드 시도");
    
    // 채용 정보 로드
    const jobsCache = directLoadFromStorage<Job[]>(CACHE_KEYS.RECOMMENDED_JOBS);
    if (jobsCache && jobsCache.length > 0) {
      console.log(`${jobsCache.length}개 채용 정보 로드됨`);
      setRecommendedJobs(jobsCache);
      
      toast({
        title: '캐시된 데이터 로드됨',
        description: `${jobsCache.length}개의 이전 채용 정보가 로드되었습니다.`,
        variant: 'default',
      });
    }
    
    // 테스트 결과 로드
    const testResultCache = directLoadFromStorage<TestResult>(CACHE_KEYS.TEST_RESULT);
    if (testResultCache) {
      setTestResult(testResultCache);
    }
    
    // 자동 매칭 결과 로드
    const matchingCache = directLoadFromStorage<AutoMatchingResult>(CACHE_KEYS.AUTO_MATCHING);
    if (matchingCache) {
      setAutoMatchingResult(matchingCache);
    }
    
    // 지원 결과 로드
    const applyCache = directLoadFromStorage<ApplyResult>(CACHE_KEYS.APPLY_RESULT);
    if (applyCache) {
      setApplyResult(applyCache);
    }
  }, [directLoadFromStorage, toast]);
  
  // API 핸들러 함수들
  const handleTestApi = useCallback(async () => {
    setIsTestLoading(true);
    try {
      const response = await fetch('/api/example');
      const data = await response.json() as TestResult;
      setTestResult(data);
      directSaveToStorage(CACHE_KEYS.TEST_RESULT, data);
      
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
  }, [toast, directSaveToStorage]);
  
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
      
      // 상태 업데이트
      setRecommendedJobs(dummyJobs);
      
      // 캐시 저장
      const saved = directSaveToStorage(CACHE_KEYS.RECOMMENDED_JOBS, dummyJobs);
      console.log(`채용 정보 캐싱: ${saved ? '성공' : '실패'}`);
      
      // 저장 결과 확인
      const savedData = localStorage.getItem(CACHE_KEYS.RECOMMENDED_JOBS);
      console.log(`저장된 데이터 크기: ${savedData?.length || 0}바이트`);
      
      toast({
        title: '채용 정보 로드 성공',
        description: `총 ${dummyJobs.length}개의 추천 채용 정보를 가져왔습니다`,
        variant: 'success',
      });
    } catch (error) {
      console.error("API error:", error);
      toast({
        title: '채용 정보 로드 실패',
        description: '추천 채용 정보를 가져오는 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsRecommendedLoading(false);
    }
  }, [toast, directSaveToStorage]);
  
  const handleRunAutoJobMatching = useCallback(async () => {
    setIsAutoMatchingLoading(true);
    try {
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
      directSaveToStorage(CACHE_KEYS.AUTO_MATCHING, matchingResult);
      
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
  }, [toast, directSaveToStorage]);
  
  const handleApplySaraminJobs = useCallback(async () => {
    setIsApplyLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const applyResultData: ApplyResult = {
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
      
      setApplyResult(applyResultData);
      directSaveToStorage(CACHE_KEYS.APPLY_RESULT, applyResultData);
      
      toast({
        title: '지원 완료',
        description: `${applyResultData.applied}개의 채용공고에 지원했습니다`,
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
  }, [toast, directSaveToStorage]);
  
  // 캐시 초기화 함수
  const clearCache = useCallback(() => {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
        console.log(`${key} 캐시 삭제됨`);
      });
      
      // 상태 초기화
      setTestResult(null);
      setRecommendedJobs([]);
      setAutoMatchingResult(null);
      setApplyResult(null);
      
      toast({
        title: '캐시 초기화 완료',
        description: '모든 캐시된 데이터가 삭제되었습니다.',
      });
    } catch (error) {
      console.error("캐시 초기화 중 오류:", error);
    }
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
  }, []);

  // 필터 함수 - hideExpired 상태 변경 시 항상 localStorage에 저장하도록 보장
  const toggleHideExpired = useCallback((value: boolean) => {
    console.log(`Toggling hideExpired to: ${value}`);
    setHideExpired(value);
    localStorage.setItem(CACHE_KEYS.HIDE_EXPIRED, value.toString());
  }, []);

  return {
    // 상태
    testResult,
    recommendedJobs,
    autoMatchingResult,
    applyResult,
    hideExpired,
    
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
    toggleHideExpired,
    
    // 캐시 관리 메서드
    clearCache,
    checkCacheStatus
  };
};
