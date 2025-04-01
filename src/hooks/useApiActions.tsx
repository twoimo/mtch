import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { safeSetItem, safeGetItem, safeRemoveItem, isLocalStorageAvailable } from '@/utils/storage';

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
  
  // 직접 localStorage 접근 함수들
  const directSaveToStorage = useCallback((key: string, data: unknown) => {
    try {
      const storageItem = {
        data,
        timestamp: Date.now()
      };
      
      // 문자열로 직렬화
      const serialized = JSON.stringify(storageItem);
      
      // 저장 시도
      window.localStorage.setItem(key, serialized);
      
      // 저장 확인
      console.log(`Direct save to localStorage - key: ${key}, success: ${!!window.localStorage.getItem(key)}`);
      return true;
    } catch (error) {
      console.error(`Failed to save to localStorage: ${error}`);
      return false;
    }
  }, []);
  
  const directLoadFromStorage = useCallback(<T,>(key: string): T | null => {
    try {
      // 항목 가져오기
      const serialized = window.localStorage.getItem(key);
      console.log(`Direct load from localStorage - key: ${key}, exists: ${!!serialized}`);
      
      if (!serialized) {
        return null;
      }
      
      // 역직렬화
      const item = JSON.parse(serialized);
      
      // 만료 확인
      if (Date.now() - item.timestamp > CACHE_EXPIRY) {
        console.log(`Item is expired - key: ${key}`);
        window.localStorage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error(`Failed to load from localStorage: ${error}`);
      return null;
    }
  }, []);
  
  // 초기화 시 모든 localStorage 캐시 키 확인 (디버깅용)
  useEffect(() => {
    // 모든 localStorage 키 출력
    console.log('All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`${i}: ${key}`);
    }
    
    // 관련 캐시 키 검사
    Object.values(CACHE_KEYS).forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`Cache key ${key}:`, value ? 'exists' : 'does not exist');
    });
  }, []);

  // 캐시 상태 확인 
  useEffect(() => {
    const storageAvailable = isLocalStorageAvailable();
    console.log(`localStorage is ${storageAvailable ? 'available' : 'not available'}`);
    
    if (!storageAvailable) {
      toast({
        title: '저장소 오류',
        description: '브라우저 localStorage를 사용할 수 없습니다. 캐싱 기능이 작동하지 않습니다.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [toast]);

  // 캐시 초기화 시 직접 호출
  useEffect(() => {
    function loadInitialCache() {
      console.log("====== INITIAL CACHE LOADING ======");
      
      try {
        // 캐시된 채용 정보 로드
        const jobsData = directLoadFromStorage<Job[]>(CACHE_KEYS.RECOMMENDED_JOBS);
        console.log("직접 로드한 채용정보:", jobsData);
        
        if (jobsData && jobsData.length > 0) {
          setRecommendedJobs(jobsData);
          toast({
            title: '저장된 채용정보 로드됨',
            description: `${jobsData.length}개의 추천 채용 정보를 불러왔습니다.`,
          });
        }
        
        // 다른 캐싱된 데이터 로드
        const testData = directLoadFromStorage<TestResult>(CACHE_KEYS.TEST_RESULT);
        if (testData) setTestResult(testData);
        
        const matchingData = directLoadFromStorage<AutoMatchingResult>(CACHE_KEYS.AUTO_MATCHING);
        if (matchingData) setAutoMatchingResult(matchingData);
        
        const applyData = directLoadFromStorage<ApplyResult>(CACHE_KEYS.APPLY_RESULT);
        if (applyData) setApplyResult(applyData);
        
        console.log("====== INITIAL CACHE LOADING COMPLETE ======");
      } catch (error) {
        console.error("캐시 초기화 중 오류:", error);
      }
    }
    
    // 컴포넌트 마운트 시 캐시 로드
    loadInitialCache();
  }, [directLoadFromStorage, toast]);
  
  // API 핸들러
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
  
  // 채용 정보 조회 함수
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
      
      // 직접 로컬 스토리지에 저장 
      const saveSuccess = directSaveToStorage(CACHE_KEYS.RECOMMENDED_JOBS, dummyJobs);
      console.log(`채용 정보 저장 ${saveSuccess ? '성공' : '실패'}`);
      
      // 저장 확인
      const checkSaved = window.localStorage.getItem(CACHE_KEYS.RECOMMENDED_JOBS);
      console.log('저장된 데이터 확인: ', !!checkSaved, checkSaved?.length);
      
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
      directSaveToStorage(CACHE_KEYS.APPLY_RESULT, applyResult);
      
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
  }, [toast, directSaveToStorage]);
  
  // 캐시 초기화 함수
  const clearCache = useCallback(() => {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        window.localStorage.removeItem(key);
        console.log(`캐시 삭제: ${key}`);
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
    checkCacheStatus // 디버깅용 메서드 추가
  };
};
