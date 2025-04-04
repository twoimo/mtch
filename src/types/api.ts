

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
  match_reason?: string;
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

export interface AutoMatchingResponse extends ApiResponse {
  matchedJobs?: number;
}

export interface ApplyResponse extends ApiResponse {
  appliedJobs?: number;
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

  // Make sure required fields exist with default values
  return {
    // Required fields with defaults
    id: job.id || 0,
    score: job.score || job.match_score || job.matchScore || 0,
    reason: job.reason || job.match_reason || job.matchReason || '',
    strength: job.strength || '',
    weakness: job.weakness || '',
    apply_yn: job.apply_yn || job.isApplied || job.is_applied || 0,
    companyName: job.companyName || job.company_name || '',
    jobTitle: job.jobTitle || job.job_title || '',
    jobLocation: job.jobLocation || job.job_location || '',
    companyType: job.companyType || job.company_type || '',
    url: job.url || job.job_url || '',
    
    // Copy all other fields to maintain data integrity
    ...job
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
  }
  
  return normalizedResponse;
}

