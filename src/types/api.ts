
// API response types
export interface TestResultData {
  success: boolean;
  message: string;
  data?: {
    count: number;
  };
  timestamp: string;
}

export interface Job {
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
  jobType?: string;
  jobSalary?: string;
  employmentType?: string;
  jobDescription?: string;
  descriptionType?: string;
  scrapedAt?: string;
  matchScore?: number;
  isRecommended?: number;
  matchReason?: string;
  
  // New fields
  company_name?: string;
  job_title?: string;
  job_description?: string;
  job_url?: string;
  job_location?: string;
  employment_type?: string;
  job_salary?: string;
  company_type?: string;
  scraped_at?: string;
  match_score?: number;
  match_reason?: number | string; // Changed to accept both number and string
  is_recommended?: number;
  
  // Additional fields
  isApplied?: number;
  is_applied?: number;
  isGptChecked?: number;
  is_gpt_checked?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  deletedAt?: string | null;
  deleted_at?: string | null;
  job_type?: string; // Added this field which was missing
}

export interface JobFilters {
  keyword: string;
  minScore: number;
  employmentType: string[];
  companyType: string;
  jobType: string[];
  salaryRange: string;
  onlyApplicable: boolean;
  hideExpired?: boolean; // Added hideExpired property
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TestResponse extends ApiResponse {
  testCompleted?: boolean;
}

export interface RecommendedJobsResponse extends ApiResponse {
  recommendedJobs: Job[];
}

export interface AllJobsResponse extends ApiResponse {
  jobs: Job[];
  page?: number;
  limit?: number;
  total?: number;
}

// Helper function to normalize job data with proper defaults for all required fields
export function normalizeJob(job: any): Job {
  if (!job) return {
    id: 0,
    score: 0,
    reason: '',
    strength: '',
    weakness: '',
    apply_yn: 0,
    companyName: '',
    jobTitle: '',
    jobLocation: '',
    companyType: '',
    url: ''
  };

  // Extract values from either camelCase or snake_case properties with defaults
  const id = job.id || 0;
  
  // For score, check all possible field names with numeric default
  const score = job.score || job.match_score || job.matchScore || 0;
  
  // For reason, check all possible field names with empty string default
  const reason = job.reason || job.match_reason || job.matchReason || '';
  
  // For strength and weakness (no snake case equivalents)
  const strength = job.strength || '';
  const weakness = job.weakness || '';
  
  // For apply_yn, check all possible field names
  const apply_yn = job.apply_yn !== undefined ? job.apply_yn : 
                  job.isApplied !== undefined ? job.isApplied : 
                  job.is_applied !== undefined ? job.is_applied : 0;
  
  // For company name, job title, and location
  const companyName = job.companyName || job.company_name || '';
  const jobTitle = job.jobTitle || job.job_title || '';
  const jobLocation = job.jobLocation || job.job_location || '';
  
  // For company type
  const companyType = job.companyType || job.company_type || '';
  
  // For url
  const url = job.url || job.job_url || '';

  // Create the normalized job object with required fields
  const normalizedJob: Job = {
    id,
    score,
    reason,
    strength,
    weakness,
    apply_yn,
    companyName,
    jobTitle,
    jobLocation,
    companyType,
    url
  };

  // Add all other properties from the original job
  // First convert potential snake_case keys to camelCase
  const extraProps: Record<string, any> = {};
  for (const key in job) {
    if (key.includes('_')) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      extraProps[camelKey] = job[key];
    }
    extraProps[key] = job[key];
  }

  return {
    ...normalizedJob,
    ...extraProps
  };
}

// Helper function to normalize API response data
export function normalizeApiResponse(data: any): AllJobsResponse {
  if (!data) {
    return { success: false, jobs: [] };
  }

  // Create standard response shape
  const normalizedResponse: AllJobsResponse = {
    success: data.success || false,
    jobs: [],
    page: data.page || 1,
    limit: data.limit || 10,
    total: data.total || 0
  };

  // Add error message if present
  if (data.message) {
    normalizedResponse.message = data.message;
  }
  if (data.error) {
    normalizedResponse.error = data.error;
  }

  // If the response has a 'jobs' array, normalize each job
  if (Array.isArray(data.jobs)) {
    normalizedResponse.jobs = data.jobs.map(job => normalizeJob(job));
  } else if (Array.isArray(data)) {
    // Handle case where data itself is an array of jobs
    normalizedResponse.jobs = data.map(job => normalizeJob(job));
  } else if (data.data && Array.isArray(data.data.jobs)) {
    // Handle case where jobs are nested in data property
    normalizedResponse.jobs = data.data.jobs.map(job => normalizeJob(job));
  }
  
  return normalizedResponse;
}

// Helper function to normalize recommended jobs response
export function normalizeRecommendedJobsResponse(data: any): RecommendedJobsResponse {
  if (!data) {
    return { success: false, recommendedJobs: [] };
  }

  // Create standard response shape
  const normalizedResponse: RecommendedJobsResponse = {
    success: data.success || false,
    recommendedJobs: []
  };

  // Add error message if present
  if (data.message) {
    normalizedResponse.message = data.message;
  }
  if (data.error) {
    normalizedResponse.error = data.error;
  }

  // If the response has a 'recommendedJobs' array, normalize each job
  if (Array.isArray(data.recommendedJobs)) {
    normalizedResponse.recommendedJobs = data.recommendedJobs.map(job => normalizeJob(job));
  } else if (Array.isArray(data.jobs)) {
    // Handle case where data has a jobs array instead of recommendedJobs
    normalizedResponse.recommendedJobs = data.jobs.map(job => normalizeJob(job));
  } else if (Array.isArray(data)) {
    // Handle case where data itself is an array of jobs
    normalizedResponse.recommendedJobs = data.map(job => normalizeJob(job));
  } else if (data.data && Array.isArray(data.data.jobs)) {
    // Handle case where jobs are nested in data property
    normalizedResponse.recommendedJobs = data.data.jobs.map(job => normalizeJob(job));
  }
  
  return normalizedResponse;
}
