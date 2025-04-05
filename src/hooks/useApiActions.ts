
import { useState, useCallback, useMemo } from 'react';
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

// Export JobFilters interface so it can be imported
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

// Simplified employment types for safer filtering
const EMPLOYMENT_TYPES = {
  REGULAR: '정규직',
  CONTRACT: '계약직',
  INTERN: '인턴'
};

// Default filters with guaranteed initialized arrays
export const defaultFilters: JobFilters = {
  keyword: '',
  minScore: 0,
  employmentType: [], // Always initialized as empty array
  companyType: 'all',
  jobType: [], // Always initialized as empty array
  salaryRange: 'all',
  onlyApplicable: false,
  hideExpired: false, // 기본값을 false로 변경
};

/**
 * Custom hook for API operations with caching
 * @returns API related states and functions
 */
export const useApiActions = () => {
  // Initialize state from cache or default values
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
  
  // Loading states
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

  // Helper function to check if a job is expired
  const isJobExpired = useCallback((job: Job): boolean => {
    if (!job.deadline) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let deadlineDate;
    if (job.deadline.includes('.')) {
      const [year, month, day] = job.deadline.split('.').map(num => parseInt(num));
      deadlineDate = new Date(year, month - 1, day);
    } else {
      deadlineDate = new Date(job.deadline);
    }
    
    return deadlineDate < today;
  }, []);

  // More robust helper function to check if an employment type matches
  const matchesEmploymentType = useCallback((job: Job, filterType: string): boolean => {
    // If no employment type data in job, return false
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

  // More defensive filtering approach
  const filteredJobs = useMemo(() => {
    if (!recommendedJobs || recommendedJobs.length === 0) return [];
    
    return recommendedJobs.filter(job => {
      // Hide expired jobs filter (applied at the main level)
      if (filters.hideExpired && isJobExpired(job)) {
        return false;
      }
      
      // Keyword filtering
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
      
      // Minimum score filtering - more defensive approach
      if (filters.minScore > 0) {
        const score = job.score || job.matchScore || job.match_score || 0;
        if (score < filters.minScore) {
          return false;
        }
      }
      
      // Employment type filtering - simplified approach to avoid iteration errors
      if (filters.employmentType && Array.isArray(filters.employmentType) && filters.employmentType.length > 0) {
        // Check if any selected employment type matches
        const matchesAny = filters.employmentType.some(type => matchesEmploymentType(job, type));
        if (!matchesAny) return false;
      }
      
      // Company type filtering - more robust approach
      if (filters.companyType && filters.companyType !== 'all') {
        const companyType = (job.companyType || job.company_type || '').toLowerCase();
        
        if (!companyType) return false;
        
        // Get category types more safely
        const category = COMPANY_CATEGORIES.find(cat => cat.value === filters.companyType);
        const categoryTypes = category?.types || [];
        
        if (categoryTypes.length > 0) {
          const matchesCategory = categoryTypes.some(type => 
            companyType.includes(type.toLowerCase())
          );
          if (!matchesCategory) return false;
        } else if (filters.companyType === 'other') {
          // 'Other' category - doesn't match any defined categories
          const allCategoryTypes = COMPANY_CATEGORIES.flatMap(cat => cat.types || []);
          const matchesAnyCategory = allCategoryTypes.some(type => 
            companyType.includes(type.toLowerCase())
          );
          if (matchesAnyCategory) return false;
        }
      }
      
      // Job type filtering - simplified robust approach
      if (filters.jobType && Array.isArray(filters.jobType) && filters.jobType.length > 0) {
        // Get jobType safely
        const jobTypeValue = job.jobType || '';
        
        if (!jobTypeValue) return false;
        
        // Simple includes check instead of iterating
        const jobTypeLower = jobTypeValue.toLowerCase();
        const matchesJobType = filters.jobType.some(type => 
          jobTypeLower.includes(type.toLowerCase())
        );
        
        if (!matchesJobType) return false;
      }
      
      // Applicability filtering - more defensive
      if (filters.onlyApplicable) {
        const isApplicable = job.apply_yn === 1 || job.isApplied === 1 || job.is_applied === 1;
        if (!isApplicable) return false;
      }
      
      return true;
    });
  }, [recommendedJobs, filters, COMPANY_CATEGORIES, matchesEmploymentType, isJobExpired]);

  // More robust filter update function
  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters(prevFilters => {
      // Create a new object to avoid reference issues
      const updatedFilters = { ...prevFilters };
      
      // Handle each filter type individually for safety
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
      
      // Handle the hideExpired filter
      if ('hideExpired' in newFilters) {
        updatedFilters.hideExpired = !!newFilters.hideExpired;
      }
      
      // Special handling for array types
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

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Test API
  const handleTestApi = useCallback(async () => {
    setIsTestLoading(true);
    try {
      const result = await apiService.getAllJobs();
      
      if (result.success && result.jobs) {
        const jobs = result.jobs;
        setRecommendedJobs(jobs);
        
        const testResultData: TestResultData = {
          success: true,
          message: 'All jobs retrieved successfully.',
          data: { count: jobs.length },
          timestamp: new Date().toISOString()
        };
        
        setTestResult(testResultData);
        
        // Cache data
        saveToStorage(CACHE_KEYS.RECOMMENDED_JOBS, { jobs });
        saveToStorage(CACHE_KEYS.TEST_RESULT, testResultData);
        
        toast({
          title: 'All Jobs Retrieved',
          description: `Retrieved ${jobs.length} jobs.`,
          variant: 'default',
        });
      } else {
        const errorResult: TestResultData = {
          success: false,
          message: 'Failed to retrieve jobs.',
          timestamp: new Date().toISOString()
        };
        
        setTestResult(errorResult);
        saveToStorage(CACHE_KEYS.TEST_RESULT, errorResult);
        
        toast({
          title: 'No Data',
          description: 'Failed to retrieve jobs.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error retrieving all jobs:', error);
      const errorResult: TestResultData = {
        success: false,
        message: 'An error occurred while retrieving all jobs.',
        timestamp: new Date().toISOString()
      };
      
      setTestResult(errorResult);
      saveToStorage(CACHE_KEYS.TEST_RESULT, errorResult);
      
      toast({
        title: 'Error',
        description: 'An error occurred while retrieving all jobs.',
        variant: 'destructive',
      });
    } finally {
      setIsTestLoading(false);
    }
  }, [toast]);

  // Get recommended jobs
  const handleGetRecommendedJobs = useCallback(async () => {
    if (isRecommendedLoading) return; // Prevent duplicate requests
    
    setIsRecommendedLoading(true);
    try {
      const result = await apiService.getRecommendedJobs();
      
      if (result.success && result.recommendedJobs) {
        console.log('Recommended jobs field check:', 
          result.recommendedJobs.length > 0 ? 
          `Job type: ${result.recommendedJobs[0].jobType}, Salary: ${result.recommendedJobs[0].jobSalary}, Employment type: ${result.recommendedJobs[0].employmentType}` : 
          'No data');
        
        const jobs = result.recommendedJobs;
        setRecommendedJobs(jobs);
        setFilters(defaultFilters); // Reset filters
        
        // Cache data
        saveToStorage(CACHE_KEYS.RECOMMENDED_JOBS, { jobs });
        
        toast({
          title: 'Recommended Jobs Retrieved',
          description: `Retrieved ${jobs.length} recommended jobs.`,
          variant: 'default',
        });
      } else {
        setRecommendedJobs([]);
        
        toast({
          title: 'No Data',
          description: 'Failed to retrieve recommended jobs.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error retrieving recommended jobs:', error);
      
      toast({
        title: 'Error',
        description: 'An error occurred while retrieving recommended jobs.',
        variant: 'destructive',
      });
    } finally {
      setIsRecommendedLoading(false);
    }
  }, [isRecommendedLoading, toast]);

  // Run auto job matching
  const handleRunAutoJobMatching = useCallback(async () => {
    setIsAutoMatchingLoading(true);
    try {
      const result = await apiService.runAutoJobMatching();
      
      setAutoMatchingResult(result);
      
      // Cache data
      saveToStorage(CACHE_KEYS.AUTO_MATCHING, result);
      
      toast({
        title: 'Auto Job Matching Complete',
        description: 'Auto job matching completed successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error running auto job matching:', error);
      
      toast({
        title: 'Error',
        description: 'An error occurred while running auto job matching.',
        variant: 'destructive',
      });
    } finally {
      setIsAutoMatchingLoading(false);
    }
  }, [toast]);

  // Apply to Saramin jobs
  const handleApplySaraminJobs = useCallback(async () => {
    setIsApplyLoading(true);
    try {
      const result = await apiService.applySaraminJobs();
      
      setApplyResult(result);
      
      // Cache data
      saveToStorage(CACHE_KEYS.APPLY_RESULT, result);
      
      toast({
        title: 'Saramin Job Applications Complete',
        description: 'Saramin job applications completed successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error applying to Saramin jobs:', error);
      
      toast({
        title: 'Error',
        description: 'An error occurred while applying to Saramin jobs.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyLoading(false);
    }
  }, [toast]);

  return {
    // States
    testResult,
    recommendedJobs,
    filteredJobs,
    filters,
    autoMatchingResult,
    applyResult,
    
    // Loading states
    isTestLoading,
    isRecommendedLoading,
    isAutoMatchingLoading,
    isApplyLoading,
    
    // Action methods
    handleTestApi,
    handleGetRecommendedJobs,
    handleRunAutoJobMatching,
    handleApplySaraminJobs,
    
    // Filter methods
    updateFilters,
    resetFilters,
    
    // Cache methods
    clearCache: clearAllCache
  };
};
