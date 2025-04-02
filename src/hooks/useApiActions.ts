
import { useState } from 'react';
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

// API 액션 관련 커스텀 훅
export const useApiActions = () => {
  // 상태 관리
  const [testResult, setTestResult] = useState<TestResultData | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  const [autoMatchingResult, setAutoMatchingResult] = useState<AutoMatchingResponse | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyResponse | null>(null);
  
  // 로딩 상태 관리
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [isAutoMatchingLoading, setIsAutoMatchingLoading] = useState(false);
  const [isApplyLoading, setIsApplyLoading] = useState(false);
  
  const { toast } = useToast();

  // 필터 적용 함수
  const applyFilters = (jobs: Job[], currentFilters: JobFilters) => {
    if (!jobs || jobs.length === 0) return [];
    
    return jobs.filter(job => {
      // 검색어 필터링
      if (currentFilters.keyword && 
          !job.jobTitle.toLowerCase().includes(currentFilters.keyword.toLowerCase()) && 
          !job.companyName.toLowerCase().includes(currentFilters.keyword.toLowerCase()) &&
          !job.jobLocation.toLowerCase().includes(currentFilters.keyword.toLowerCase())) {
        return false;
      }
      
      // 최소 점수 필터링
      if (currentFilters.minScore > 0 && job.score < currentFilters.minScore) {
        return false;
      }
      
      // 고용 형태 필터링
      if (currentFilters.employmentType.length > 0 && 
          !currentFilters.employmentType.some(type => job.employmentType?.includes(type))) {
        return false;
      }
      
      // 회사 유형 필터링
      if (currentFilters.companyType !== 'all' && 
          !job.companyType?.toLowerCase().includes(currentFilters.companyType.toLowerCase())) {
        return false;
      }
      
      // 직무 유형 필터링
      if (currentFilters.jobType.length > 0 && 
          !currentFilters.jobType.some(type => job.jobType?.includes(type))) {
        return false;
      }
      
      // 지원 가능 여부 필터링
      if (currentFilters.onlyApplicable && job.apply_yn !== 1) {
        return false;
      }
      
      return true;
    });
  };

  // 필터 설정 업데이트
  const updateFilters = (newFilters: Partial<JobFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setFilteredJobs(applyFilters(recommendedJobs, updatedFilters));
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters(defaultFilters);
    setFilteredJobs(recommendedJobs);
  };

  // 전체 채용 정보 조회 (이전 사람인 스크래핑 대체)
  const handleTestApi = async () => {
    setIsTestLoading(true);
    try {
      const result = await apiService.getAllJobs();
      if (result.success && result.jobs) {
        const jobs = result.jobs;
        setRecommendedJobs(jobs);
        setFilteredJobs(jobs); // 필터링되지 않은 초기 상태로 설정
        setTestResult({
          success: true,
          message: '전체 채용 정보 조회가 완료되었습니다.',
          data: { count: jobs.length }
        });
        toast({
          title: '전체 채용 정보 조회 완료',
          description: `${jobs.length}개의 채용 정보를 가져왔습니다.`,
          variant: 'default',
        });
      } else {
        setTestResult({
          success: false,
          message: '채용 정보를 가져오지 못했습니다.',
        });
        toast({
          title: '데이터 없음',
          description: '채용 정보를 가져오지 못했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('전체 채용 정보 조회 중 오류:', error);
      setTestResult({
        success: false,
        message: '전체 채용 정보 조회 중 오류가 발생했습니다.',
      });
      toast({
        title: '오류 발생',
        description: '전체 채용 정보를 조회하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  // 추천 채용 정보 가져오기
  const handleGetRecommendedJobs = async () => {
    setIsRecommendedLoading(true);
    try {
      const result = await apiService.getRecommendedJobs();
      if (result.success && result.recommendedJobs) {
        console.log('추천 채용 정보 필드 확인:', 
          result.recommendedJobs.length > 0 ? 
          `직무유형: ${result.recommendedJobs[0].jobType}, 급여: ${result.recommendedJobs[0].jobSalary}, 고용형태: ${result.recommendedJobs[0].employmentType}` : 
          '데이터 없음');
        
        const jobs = result.recommendedJobs;
        setRecommendedJobs(jobs);
        setFilteredJobs(jobs); // 필터링되지 않은 초기 상태로 설정
        setFilters(defaultFilters); // 필터 초기화
        
        toast({
          title: '추천 채용 정보 조회 완료',
          description: `${jobs.length}개의 추천 채용 정보를 가져왔습니다.`,
          variant: 'default',
        });
      } else {
        setRecommendedJobs([]);
        setFilteredJobs([]);
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
  };

  // 자동 채용 매칭 실행
  const handleRunAutoJobMatching = async () => {
    setIsAutoMatchingLoading(true);
    try {
      const result = await apiService.runAutoJobMatching();
      setAutoMatchingResult(result);
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
  };

  // 사람인 채용 지원
  const handleApplySaraminJobs = async () => {
    setIsApplyLoading(true);
    try {
      const result = await apiService.applySaraminJobs();
      setApplyResult(result);
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
  };

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
    resetFilters
  };
};
