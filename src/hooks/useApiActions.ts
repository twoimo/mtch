
import { useState, useCallback, useMemo } from 'react';
import { apiService } from '@/services/api-service';
import { 
  Job, 
  JobFilters, 
  TestResultData, 
  AutoMatchingResponse, 
  ApplyResponse 
} from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { 
  saveToStorage, 
  loadFromStorage, 
  clearAllCache,
  DEFAULT_CACHE_TTL,
  CACHE_KEYS 
} from '@/utils/storage';

// Default filters
export const defaultFilters: JobFilters = {
  keyword: '',
  minScore: 0,
  employmentType: [],
  companyType: 'all',
  jobType: [],
  salaryRange: 'all',
  onlyApplicable: false,
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

  // Optimize filtering with useMemo
  const filteredJobs = useMemo(() => {
    if (!recommendedJobs || recommendedJobs.length === 0) return [];
    
    return recommendedJobs.filter(job => {
      // Keyword filtering
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
      
      // Minimum score filtering
      if (filters.minScore > 0 && job.score < filters.minScore) {
        return false;
      }
      
      // Employment type filtering
      if (filters.employmentType.length > 0) {
        const employmentType = job.employmentType?.toLowerCase() || '';
        if (!filters.employmentType.some(type => employmentType.includes(type.toLowerCase()))) {
          return false;
        }
      }
      
      // Company type filtering
      if (filters.companyType !== 'all') {
        const companyType = job.companyType?.toLowerCase() || '';
        if (!companyType.includes(filters.companyType.toLowerCase())) {
          return false;
        }
      }
      
      // Job type filtering
      if (filters.jobType.length > 0) {
        const jobType = job.jobType?.toLowerCase() || '';
        if (!filters.jobType.some(type => jobType.includes(type.toLowerCase()))) {
          return false;
        }
      }
      
      // Applicability filtering
      if (filters.onlyApplicable && job.apply_yn !== 1) {
        return false;
      }
      
      return true;
    });
  }, [recommendedJobs, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
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
