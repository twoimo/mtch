import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { apiService } from '@/services/api-service';
import { 
  Job, 
  TestResultData, 
  AutoMatchingResponse, 
  ApplyResponse 
} from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { 
  saveToStorage, 
  loadFromStorage, 
  clearAllCache,
  CACHE_KEYS 
} from '@/utils/storage';

// 외부 가져오기를 위해 JobFilters 인터페이스 내보내기
export interface JobFilters {
  keyword: string;
  minScore: number;
  employmentType: string[];
  companyType: string;
  jobType: string[];
  salaryRange: string;
  onlyApplicable: boolean;
  hideExpired?: boolean; // 마감일 지난 공고 제외 필터 추가
}

// 안전한 필터링을 위한 단순화된 고용 유형
const EMPLOYMENT_TYPES = {
  REGULAR: '정규직',
  CONTRACT: '계약직',
  INTERN: '인턴'
};

// 항상 초기화된 배열로 기본 필터 설정
export const defaultFilters: JobFilters = {
  keyword: '',
  minScore: 0,
  employmentType: [], // 항상 빈 배열로 초기화
  companyType: 'all',
  jobType: [], // 항상 빈 배열로 초기화
  salaryRange: 'all',
  onlyApplicable: false,
  hideExpired: false, // 기본값을 false로 변경
};

/**
 * 캐싱 기능이 있는 API 작업을 위한 커스텀 훅
 * @returns API 관련 상태 및 함수
 */
export const useApiActions = () => {
  // 캐시 또는 기본값에서 상태 초기화
  const [testResult, setTestResult] = useState<TestResultData | null>(() => 
    loadFromStorage<TestResultData>(CACHE_KEYS.TEST_RESULT)
  );
  
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>(() => {
    const cachedData = loadFromStorage<{ jobs: Job[] }>(CACHE_KEYS.RECOMMENDED_JOBS);
    return cachedData?.jobs || [];
  });
  
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  
  const [autoMatchingResult, setAutoMatchingResult] = useState<AutoMatchingResponse | null>(() => 
    loadFromStorage<AutoMatchingResponse>(CACHE_KEYS.AUTO_MATCHING)
  );
  
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(() => 
    loadFromStorage<ApplyResponse>(CACHE_KEYS.APPLY_RESULT)
  );
  
  // 로딩 상태
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [isAutoMatchingLoading, setIsAutoMatchingLoading] = useState(false);
  const [isApplyLoading, setIsApplyLoading] = useState(false);
  
  const { toast } = useToast();

  // 회사 유형 카테고리 정의
  const COMPANY_CATEGORIES = useMemo(() => [
    {
      label: "대기업",
      value: "large",
      types: [
        "대기업", "대기업 계열사", "상장기업", "외국계기업", "금융기업"
      ]
    },
    {
      label: "중견기업",
      value: "medium",
      types: [
        "중견기업", "중견", "준대기업"
      ]
    },
    {
      label: "중소기업",
      value: "small",
      types: [
        "중소기업", "소기업", "스타트업", "벤처기업"
      ]
    },
    {
      label: "공공기관",
      value: "public",
      types: [
        "공기업", "공공기관", "정부기관", "비영리기관", "협회"
      ]
    }
  ], []);

  // 채용공고 만료 여부 확인 헬퍼 함수
  const isJobExpired = useCallback((job: Job): boolean => {
    if (!job.deadline) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let deadlineDate: Date;
    if (job.deadline.includes('.')) {
      const [year, month, day] = job.deadline.split('.').map(num => parseInt(num));
      deadlineDate = new Date(year, month - 1, day);
    } else {
      deadlineDate = new Date(job.deadline);
    }
    
    return deadlineDate < today;
  }, []);

  // 고용 유형이 일치하는지 확인하는 더 견고한 헬퍼 함수
  const matchesEmploymentType = useCallback((job: Job, filterType: string): boolean => {
    // 채용공고에 고용 유형 데이터가 없으면 false 반환
    if (!job.employmentType && !job.employment_type) return false;
    
    const empType = (job.employmentType || job.employment_type || '').toLowerCase();
    
    switch(filterType) {
      case EMPLOYMENT_TYPES.REGULAR:
        return empType.includes('정규직');
      case EMPLOYMENT_TYPES.CONTRACT:
        return empType.includes('계약직') || empType.includes('계약');
      case EMPLOYMENT_TYPES.INTERN:
        return empType.includes('인턴') || empType.includes('인턴십');
      default:
        return empType.includes(filterType.toLowerCase());
    }
  }, []);

  // 더 방어적인 필터링 접근 방식
  const filteredJobs = useMemo(() => {
    if (!recommendedJobs || recommendedJobs.length === 0) return [];
    
    return recommendedJobs.filter(job => {
      // 만료된 채용공고 숨기기 필터 (주요 수준에서 적용)
      if (filters.hideExpired && isJobExpired(job)) {
        return false;
      }
      
      // 키워드 필터링
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const jobTitle = (job.jobTitle || job.job_title || '').toLowerCase();
        const companyName = (job.companyName || job.company_name || '').toLowerCase();
        const jobLocation = (job.jobLocation || job.job_location || '').toLowerCase();
        
        if (!jobTitle.includes(keyword) && 
            !companyName.includes(keyword) && 
            !jobLocation.includes(keyword)) {
          return false;
        }
      }
      
      // 최소 점수 필터링 - 더 방어적인 접근 방식
      if (filters.minScore > 0) {
        const score = job.score || job.matchScore || job.match_score || 0;
        if (score < filters.minScore) {
          return false;
        }
      }
      
      // 고용 유형 필터링 - 반복 오류를 피하기 위한 단순화된 접근 방식
      if (filters.employmentType && Array.isArray(filters.employmentType) && filters.employmentType.length > 0) {
        // 선택된 고용 유형이 일치하는지 확인
        const matchesAny = filters.employmentType.some(type => matchesEmploymentType(job, type));
        if (!matchesAny) return false;
      }
      
      // 회사 유형 필터링 - 더 견고한 접근 방식
      if (filters.companyType && filters.companyType !== 'all') {
        const companyType = (job.companyType || job.company_type || '').toLowerCase();
        
        if (!companyType) return false;
        
        // 카테고리 유형을 더 안전하게 가져오기
        const category = COMPANY_CATEGORIES.find(cat => cat.value === filters.companyType);
        const categoryTypes = category?.types || [];
        
        if (categoryTypes.length > 0) {
          const matchesCategory = categoryTypes.some(type => 
            companyType.includes(type.toLowerCase())
          );
          if (!matchesCategory) return false;
        } else if (filters.companyType === 'other') {
          // '기타' 카테고리 - 정의된 카테고리와 일치하지 않음
          const allCategoryTypes = COMPANY_CATEGORIES.flatMap(cat => cat.types || []);
          const matchesAnyCategory = allCategoryTypes.some(type => 
            companyType.includes(type.toLowerCase())
          );
          if (matchesAnyCategory) return false;
        }
      }
      
      // 직무 유형 필터링 - 단순화된 견고한 접근 방식
      if (filters.jobType && Array.isArray(filters.jobType) && filters.jobType.length > 0) {
        // 직무 유형을 안전하게 가져오기
        const jobTypeValue = job.jobType || '';
        
        if (!jobTypeValue) return false;
        
        // 반복 대신 간단한 포함 확인
        const jobTypeLower = jobTypeValue.toLowerCase();
        const matchesJobType = filters.jobType.some(type => 
          jobTypeLower.includes(type.toLowerCase())
        );
        
        if (!matchesJobType) return false;
      }
      
      // 적용 가능성 필터링 - 더 방어적인 접근 방식
      if (filters.onlyApplicable) {
        const isApplicable = job.apply_yn === 1 || job.isApplied === 1 || job.is_applied === 1;
        if (!isApplicable) return false;
      }
      
      return true;
    });
  }, [recommendedJobs, filters, COMPANY_CATEGORIES, matchesEmploymentType, isJobExpired]);

  // 더 견고한 필터 업데이트 함수
  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters(prevFilters => {
      // 참조 문제를 피하기 위해 새 객체 생성
      const updatedFilters = { ...prevFilters };
      
      // 각 필터 유형을 개별적으로 처리하여 안전성 확보
      if ('keyword' in newFilters) {
        updatedFilters.keyword = newFilters.keyword || '';
      }
      
      if ('minScore' in newFilters) {
        updatedFilters.minScore = newFilters.minScore || 0;
      }
      
      if ('companyType' in newFilters) {
        updatedFilters.companyType = newFilters.companyType || 'all';
      }
      
      if ('salaryRange' in newFilters) {
        updatedFilters.salaryRange = newFilters.salaryRange || 'all';
      }
      
      if ('onlyApplicable' in newFilters) {
        updatedFilters.onlyApplicable = !!newFilters.onlyApplicable;
      }
      
      // hideExpired 필터 처리
      if ('hideExpired' in newFilters) {
        updatedFilters.hideExpired = !!newFilters.hideExpired;
      }
      
      // 배열 유형에 대한 특별 처리
      if ('employmentType' in newFilters) {
        updatedFilters.employmentType = Array.isArray(newFilters.employmentType) ? 
          [...newFilters.employmentType] : [];
      }
      
      if ('jobType' in newFilters) {
        updatedFilters.jobType = Array.isArray(newFilters.jobType) ? 
          [...newFilters.jobType] : [];
      }
      
      return updatedFilters;
    });
  }, []);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // 초기 페이지 로드 시 모든 채용공고 데이터를 로드하는 useEffect 추가
  useEffect(() => {
    // 컴포넌트가 마운트될 때 모든 채용공고 로드
    handleTestApi();
    // 이 작업은 마운트 시 한 번만 실행하고 싶습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테스트 API - getAllJobs 호출
  const handleTestApi = useCallback(async () => {
    setIsTestLoading(true);
    try {
      const result = await apiService.getAllJobs();
      
      if (result.success && result.jobs) {
        // 모든 채용공고를 기본 데이터 소스로 사용
        const jobs = result.jobs;
        setRecommendedJobs(jobs);
        
        const testResultData: TestResultData = {
          success: true,
          message: '모든 채용공고가 성공적으로 조회되었습니다.',
          data: { count: jobs.length },
          timestamp: new Date().toISOString()
        };
        
        setTestResult(testResultData);
        
        // 데이터 캐시
        saveToStorage(CACHE_KEYS.RECOMMENDED_JOBS, { jobs });
        saveToStorage(CACHE_KEYS.TEST_RESULT, testResultData);
        
        toast({
          title: '모든 채용공고 조회 완료',
          description: `${jobs.length}개의 채용공고를 조회했습니다.`,
          variant: 'default',
        });
      } else {
        const errorResult: TestResultData = {
          success: false,
          message: '채용공고 조회에 실패했습니다.',
          timestamp: new Date().toISOString()
        };
        
        setTestResult(errorResult);
        saveToStorage(CACHE_KEYS.TEST_RESULT, errorResult);
        
        toast({
          title: '데이터 없음',
          description: '채용공고 조회에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('모든 채용공고 조회 중 오류 발생:', error);
      const errorResult: TestResultData = {
        success: false,
        message: '모든 채용공고 조회 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      };
      
      setTestResult(errorResult);
      saveToStorage(CACHE_KEYS.TEST_RESULT, errorResult);
      
      toast({
        title: '오류',
        description: '모든 채용공고 조회 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsTestLoading(false);
    }
  }, [toast]);

  // 추천 채용공고 가져오기
  const handleGetRecommendedJobs = useCallback(async () => {
    if (isRecommendedLoading) return; // 중복 요청 방지
    
    setIsRecommendedLoading(true);
    try {
      const result = await apiService.getRecommendedJobs();
      
      if (result.success && result.recommendedJobs) {
        console.log('추천 채용공고 필드 확인:', 
          result.recommendedJobs.length > 0 ? 
          `직무 유형: ${result.recommendedJobs[0].jobType}, 급여: ${result.recommendedJobs[0].jobSalary}, 고용 유형: ${result.recommendedJobs[0].employmentType}` : 
          '데이터 없음');
        
        const jobs = result.recommendedJobs;
        setRecommendedJobs(jobs);
        setFilters(defaultFilters); // 필터 초기화
        
        // 데이터 캐시
        saveToStorage(CACHE_KEYS.RECOMMENDED_JOBS, { jobs });
        
        toast({
          title: '추천 채용공고 조회 완료',
          description: `${jobs.length}개의 추천 채용공고를 조회했습니다.`,
          variant: 'default',
        });
      } else {
        setRecommendedJobs([]);
        
        toast({
          title: '데이터 없음',
          description: '추천 채용공고 조회에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('추천 채용공고 조회 중 오류 발생:', error);
      
      toast({
        title: '오류',
        description: '추천 채용공고 조회 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsRecommendedLoading(false);
    }
  }, [isRecommendedLoading, toast]);

  // 자동 채용공고 매칭 실행
  const handleRunAutoJobMatching = useCallback(async () => {
    setIsAutoMatchingLoading(true);
    try {
      const result = await apiService.runAutoJobMatching();
      
      setAutoMatchingResult(result);
      
      // 데이터 캐시
      saveToStorage(CACHE_KEYS.AUTO_MATCHING, result);
      
      toast({
        title: '자동 채용공고 매칭 완료',
        description: '자동 채용공고 매칭이 성공적으로 완료되었습니다.',
        variant: 'default',
      });
    } catch (error) {
      console.error('자동 채용공고 매칭 실행 중 오류 발생:', error);
      
      toast({
        title: '오류',
        description: '자동 채용공고 매칭 실행 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsAutoMatchingLoading(false);
    }
  }, [toast]);

  // 사람인 채용공고 지원
  const handleApplySaraminJobs = useCallback(async () => {
    setIsApplyLoading(true);
    try {
      const result = await apiService.applySaraminJobs();
      
      setApplyResult(result);
      
      // 데이터 캐시
      saveToStorage(CACHE_KEYS.APPLY_RESULT, result);
      
      toast({
        title: '사람인 채용공고 지원 완료',
        description: '사람인 채용공고 지원이 성공적으로 완료되었습니다.',
        variant: 'default',
      });
    } catch (error) {
      console.error('사람인 채용공고 지원 중 오류 발생:', error);
      
      toast({
        title: '오류',
        description: '사람인 채용공고 지원 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyLoading(false);
    }
  }, [toast]);

  // 초기 API 호출이 이루어졌는지 추적하기 위한 ref 추가
  const initialApiCallMade = useRef(false);

  // 여러 번의 API 호출을 방지하기 위해 ref를 사용하여 useEffect 수정
  useEffect(() => {
    // 컴포넌트가 마운트될 때 한 번만 모든 채용공고를 로드하고 이미 로드되지 않은 경우
    if (!initialApiCallMade.current && recommendedJobs.length === 0) {
      initialApiCallMade.current = true;
      handleTestApi();
    }
    // 이 작업은 마운트 시 한 번만 실행하고 싶습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    
    // 필터 메서드
    updateFilters,
    resetFilters,
    
    // 캐시 메서드
    clearCache: clearAllCache
  };
};
