
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
}

export interface AutoMatchingResponse extends ApiResponse {
  matchedJobs?: number;
}

export interface ApplyResponse extends ApiResponse {
  appliedJobs?: number;
}
