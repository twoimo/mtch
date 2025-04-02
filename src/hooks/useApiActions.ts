
import { useState, useCallback, useMemo } from 'react';
import { apiService, type Job, type ApplyResponse, type AutoMatchingResponse } from '@/services/MainServiceCommunicateService';
import { useToast } from '@/hooks/use-toast';

// 결과 타입 정의
interface TestResultData {
  success: boolean;
  message: string;
  data?: {
    count: number;
  };
  timestamp?: string;
}

// 필터 타입 정의
export interface JobFilters {
  keyword: string;
  minScore: number;
  employmentType: string[];
  companyType: string;
  jobType: string[];
  salaryRange: string;
  onlyApplicable: boolean;
}

// 기본 필터 설정
export const defaultFilters: JobFilters = {
  keyword: '',
  minScore: 0,
  employmentType: [],
  companyType: 'all',
  jobType: [],
  salaryRange: 'all',
  onlyApplicable: false,
};

// 캐시 키 상수
const CACHE_KEYS = {
  RECOMMENDED_JOBS: 'recommended-jobs-cache',
  TEST_RESULT: 'test-result-cache',
  AUTO_MATCHING: 'auto-matching-cache',
  APPLY_RESULT: 'apply-result-cache',
};

// 캐시 유효 시간 (30분)
const CACHE_TTL = 30 * 60 * 1000;

// API 액션 관련 커스텀 훅
export const useApiActions = () => {
  // 상태 관리
  const [testResult, setTestResult] = useState<TestResultData | null>(() => {
    // 캐시에서 데이터 로드
    const cached = localStorage.getItem(CACHE_KEYS.TEST_RESULT);
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        if (Date.now() - parsedData.timestamp < CACHE_TTL) {
          return parsedData;
        }
      } catch (e) {
        console.error('캐시 파싱 오류:', e);
      }
    }
    return null;
  });
  
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>(() => {
    // 캐시에서 데이터 로드
    const cached = localStorage.getItem(CACHE_KEYS.RECOMMENDED_JOBS);
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        if (Date.now() - parsedData.timestamp < CACHE_TTL) {
          return parsedData.jobs;
        }
      } catch (e) {
        console.error('캐시 파싱 오류:', e);
      }
    }
    return [];
  });
  
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  const [autoMatchingResult, setAutoMatchingResult] = useState<AutoMatchingResponse | null>(() => {
    const cached = localStorage.getItem(CACHE_KEYS.AUTO_MATCHING);
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        if (Date.now() - parsedData.timestamp < CACHE_TTL) {
          return parsedData;
        }
      } catch (e) {
        console.error('캐시 파싱 오류:', e);
      }
    }
    return null;
  });
  
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(() => {
    const cached = localStorage.getItem(CACHE_KEYS.APPLY_RESULT);
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        if (Date.now() - parsedData.timestamp < CACHE_TTL) {
          return parsedData;
        }
      } catch (e) {
        console.error('캐시 파싱 오류:', e);
      }
    }
    return null;
  });
  
  // 로딩 상태 관리
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [isAutoMatchingLoading, setIsAutoMatchingLoading] = useState(false);
  const [isApplyLoading, setIsApplyLoading] = useState(false);
  
  const { toast } = useToast();

  // 캐시 삭제 함수
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEYS.RECOMMENDED_JOBS);
    localStorage.removeItem(CACHE_KEYS.TEST_RESULT);
    localStorage.removeItem(CACHE_KEYS.AUTO_MATCHING);
    localStorage.removeItem(CACHE_KEYS.APPLY_RESULT);
    
    toast({
      title: '캐시 삭제 완료',
      description: '모든 캐시가 삭제되었습니다.',
      variant: 'default',
    });
  }, [toast]);

  // 필터링 로직을 useMemo로 최적화
  const filteredJobs = useMemo(() => {
    if (!recommendedJobs || recommendedJobs.length === 0) return [];
    
    return recommendedJobs.filter(job => {
      // 검색어 필터링 - 소문자 변환은 한 번만 수행
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const jobTitle = job.jobTitle?.toLowerCase() || '';
        const companyName = job.companyName?.toLowerCase() || '';
        const jobLocation = job.jobLocation?.toLowerCase() || '';
        
        if (!jobTitle.includes(keyword) && 
            !companyName.includes(keyword) && 
            !jobLocation.includes(keyword)) {
          return false;
        }
      }
      
      // 최소 점수 필터링
      if (filters.minScore > 0 && job.score < filters.minScore) {
        return false;
      }
      
      // 고용 형태 필터링 - 빈 배열 체크를 먼저 하여 불필요한 연산 방지
      if (filters.employmentType.length > 0) {
        const employmentType = job.employmentType?.toLowerCase() || '';
        if (!filters.employmentType.some(type => employmentType.includes(type.toLowerCase()))) {
          return false;
        }
      }
      
      // 회사 유형 필터링
      if (filters.companyType !== 'all') {
        const companyType = job.companyType?.toLowerCase() || '';
        if (!companyType.includes(filters.companyType.toLowerCase())) {
          return false;
        }
      }
      
      // 직무 유형 필터링
      if (filters.jobType.length > 0) {
        const jobType = job.jobType?.toLowerCase() || '';
        if (!filters.jobType.some(type => jobType.includes(type.toLowerCase()))) {
          return false;
        }
      }
      
      // 지원 가능 여부 필터링
      if (filters.onlyApplicable && job.apply_yn !== 1) {
        return false;
      }
      
      return true;
    });
  }, [recommendedJobs, filters]);

  // 필터 설정 업데이트 - useCallback으로 최적화
  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // 필터 초기화 - useCallback으로 최적화
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // 전체 채용 정보 조회 (이전 사람인 스크래핑 대체) - useCallback으로 최적화
  const handleTestApi = useCallback(async () => {
    setIsTestLoading(true);
    try {
      const result = await apiService.getAllJobs();
      const timestamp = Date.now();
      
      if (result.success && result.jobs) {
        const jobs = result.jobs;
        setRecommendedJobs(jobs);
        
        const testResultData = {
          success: true,
          message: '전체 채용 정보 조회가 완료되었습니다.',
          data: { count: jobs.length },
          timestamp
        };
        
        setTestResult(testResultData);
        
        // 캐시 저장
        localStorage.setItem(CACHE_KEYS.RECOMMENDED_JOBS, JSON.stringify({
          jobs,
          timestamp
        }));
        localStorage.setItem(CACHE_KEYS.TEST_RESULT, JSON.stringify(testResultData));
        
        toast({
          title: '전체 채용 정보 조회 완료',
          description: `${jobs.length}개의 채용 정보를 가져왔습니다.`,
          variant: 'default',
        });
      } else {
        const errorResult = {
          success: false,
          message: '채용 정보를 가져오지 못했습니다.',
          timestamp
        };
        
        setTestResult(errorResult);
        localStorage.setItem(CACHE_KEYS.TEST_RESULT, JSON.stringify(errorResult));
        
        toast({
          title: '데이터 없음',
          description: '채용 정보를 가져오지 못했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('전체 채용 정보 조회 중 오류:', error);
      const errorResult = {
        success: false,
        message: '전체 채용 정보 조회 중 오류가 발생했습니다.',
        timestamp: Date.now()
      };
      
      setTestResult(errorResult);
      localStorage.setItem(CACHE_KEYS.TEST_RESULT, JSON.stringify(errorResult));
      
      toast({
        title: '오류 발생',
        description: '전체 채용 정보를 조회하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsTestLoading(false);
    }
  }, [toast]);

  // 추천 채용 정보 가져오기 - useCallback으로 최적화
  const handleGetRecommendedJobs = useCallback(async () => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isRecommendedLoading) return;
    
    setIsRecommendedLoading(true);
    try {
      const result = await apiService.getRecommendedJobs();
      const timestamp = Date.now();
      
      if (result.success && result.recommendedJobs) {
        console.log('추천 채용 정보 필드 확인:', 
          result.recommendedJobs.length > 0 ? 
          `직무유형: ${result.recommendedJobs[0].jobType}, 급여: ${result.recommendedJobs[0].jobSalary}, 고용형태: ${result.recommendedJobs[0].employmentType}` : 
          '데이터 없음');
        
        const jobs = result.recommendedJobs;
        setRecommendedJobs(jobs);
        setFilters(defaultFilters); // 필터 초기화
        
        // 캐시 저장
        localStorage.setItem(CACHE_KEYS.RECOMMENDED_JOBS, JSON.stringify({
          jobs,
          timestamp
        }));
        
        toast({
          title: '추천 채용 정보 조회 완료',
          description: `${jobs.length}개의 추천 채용 정보를 가져왔습니다.`,
          variant: 'default',
        });
      } else {
        setRecommendedJobs([]);
        
        toast({
          title: '데이터 없음',
          description: '추천 채용 정보를 가져오지 못했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('추천 채용 정보 가져오기 중 오류:', error);
      
      toast({
        title: '오류 발생',
        description: '추천 채용 정보를 가져오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsRecommendedLoading(false);
    }
  }, [isRecommendedLoading, toast]);

  // 자동 채용 매칭 실행 - useCallback으로 최적화
  const handleRunAutoJobMatching = useCallback(async () => {
    setIsAutoMatchingLoading(true);
    try {
      const result = await apiService.runAutoJobMatching();
      const timestamp = Date.now();
      
      setAutoMatchingResult(result);
      
      // 캐시 저장
      localStorage.setItem(CACHE_KEYS.AUTO_MATCHING, JSON.stringify({
        ...result,
        timestamp
      }));
      
      toast({
        title: '자동 채용 매칭 완료',
        description: '자동 채용 매칭이 성공적으로 실행되었습니다.',
        variant: 'default',
      });
    } catch (error) {
      console.error('자동 채용 매칭 실행 중 오류:', error);
      
      toast({
        title: '오류 발생',
        description: '자동 채용 매칭 실행 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsAutoMatchingLoading(false);
    }
  }, [toast]);

  // 사람인 채용 지원 - useCallback으로 최적화
  const handleApplySaraminJobs = useCallback(async () => {
    setIsApplyLoading(true);
    try {
      const result = await apiService.applySaraminJobs();
      const timestamp = Date.now();
      
      setApplyResult(result);
      
      // 캐시 저장
      localStorage.setItem(CACHE_KEYS.APPLY_RESULT, JSON.stringify({
        ...result,
        timestamp
      }));
      
      toast({
        title: '사람인 채용 지원 완료',
        description: '사람인 채용 지원이 성공적으로 실행되었습니다.',
        variant: 'default',
      });
    } catch (error) {
      console.error('사람인 채용 지원 중 오류:', error);
      
      toast({
        title: '오류 발생',
        description: '사람인 채용 지원 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyLoading(false);
    }
  }, [toast]);

  return {
    // 상태
    testResult,
    recommendedJobs,
    filteredJobs,
    filters,
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
    
    // 필터 관련 메서드
    updateFilters,
    resetFilters,
    
    // 캐시 관련 메서드
    clearCache
  };
};
