// API 응답 타입 정의
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
  
  // 신규 필드
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
  match_reason?: number | string; // 숫자와 문자열 모두 허용
  is_recommended?: number;
  
  // 추가 필드
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
  job_type?: string; // 누락된 필드 추가
}

export interface JobFilters {
  keyword: string;
  minScore: number;
  employmentType: string[];
  companyType: string;
  jobType: string[];
  salaryRange: string;
  onlyApplicable: boolean;
  hideExpired?: boolean; // 마감일 지난 공고 제외 설정
}

// 기본 API 응답 인터페이스
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// 각종 응답 타입들
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

// 누락된 응답 타입 추가
export interface AutoMatchingResponse extends ApiResponse {
  matchedJobs?: number;
}

export interface ApplyResponse extends ApiResponse {
  appliedJobs?: number;
}

/**
 * 채용 데이터 정규화 함수 - 필요한 모든 필드에 기본값 설정
 */
// Record<string, unknown>은 any보다 안전한 타입입니다
export function normalizeJob(job: Record<string, unknown>): Job {
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

  // camelCase 또는 snake_case 속성에서 값 추출 (기본값 설정)
  const id = Number(job.id) || 0;
  
  // 점수는 여러 가능한 필드명 확인
  const score = Number(job.score) || Number(job.match_score) || Number(job.matchScore) || 0;
  
  // 이유는 여러 가능한 필드명 확인
  const reason = String(job.reason || job.match_reason || job.matchReason || '');
  
  // 강점과 약점 (snake case 없음)
  const strength = String(job.strength || '');
  const weakness = String(job.weakness || '');
  
  // 지원 가능 여부
  const apply_yn = job.apply_yn !== undefined ? Number(job.apply_yn) : 
                  job.isApplied !== undefined ? Number(job.isApplied) : 
                  job.is_applied !== undefined ? Number(job.is_applied) : 0;
  
  // 회사명, 직무명, 위치
  const companyName = String(job.companyName || job.company_name || '');
  const jobTitle = String(job.jobTitle || job.job_title || '');
  const jobLocation = String(job.jobLocation || job.job_location || '');
  
  // 회사 유형
  const companyType = String(job.companyType || job.company_type || '');
  
  // URL
  const url = String(job.url || job.job_url || '');

  // 정규화된 Job 객체 생성
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

  // 원본 job의 모든 다른 속성 추가
  // snake_case 키를 camelCase로 변환
  const extraProps: Record<string, unknown> = {};
  for (const key in job) {
    if (typeof key === 'string' && key.includes('_')) {
      // snake_case를 camelCase로 변환
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      extraProps[camelKey] = job[key];
    }
    if (typeof key === 'string') {
      extraProps[key] = job[key];
    }
  }

  return {
    ...normalizedJob,
    ...extraProps as Partial<Job>
  };
}

/**
 * API 응답 데이터 정규화 함수
 */
export function normalizeApiResponse(data: Record<string, unknown> | unknown[]): AllJobsResponse {
  if (!data) {
    return { success: false, jobs: [] };
  }

  // 표준 응답 형태 생성
  const normalizedResponse: AllJobsResponse = {
    success: Array.isArray(data) ? true : Boolean(data && typeof data === 'object' && 'success' in data && data.success),
    jobs: [],
    page: Array.isArray(data) ? 1 : (data && typeof data === 'object' && 'page' in data ? Number(data.page) : 1),
    limit: Array.isArray(data) ? 10 : (data && typeof data === 'object' && 'limit' in data ? Number(data.limit) : 10),
    total: Array.isArray(data) ? data.length : (data && typeof data === 'object' && 'total' in data ? Number(data.total) : 0)
  };

  // 에러 메시지 있으면 추가
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if ('message' in data && data.message) {
      normalizedResponse.message = String(data.message);
    }
    if ('error' in data && data.error) {
      normalizedResponse.error = String(data.error);
    }
  }

  // 다양한 형태의 응답 처리
  if (data && typeof data === 'object' && !Array.isArray(data) && 'jobs' in data && Array.isArray(data.jobs)) {
    // 'jobs' 배열이 있는 경우
    normalizedResponse.jobs = (data.jobs as unknown[]).map(job => normalizeJob(job as Record<string, unknown>));
  } else if (Array.isArray(data)) {
    // 데이터 자체가 배열인 경우
    normalizedResponse.jobs = data.map(job => normalizeJob(job as Record<string, unknown>));
  } else if (data && typeof data === 'object' && 'data' in data && typeof data.data === 'object' && 
             data.data && 'jobs' in data.data && Array.isArray(data.data.jobs)) {
    // data 속성 내에 jobs 배열이 중첩된 경우
    normalizedResponse.jobs = (data.data.jobs as unknown[]).map(job => normalizeJob(job as Record<string, unknown>));
  }
  
  return normalizedResponse;
}

/**
 * 추천 채용 정보 응답 정규화 함수
 */
export function normalizeRecommendedJobsResponse(data: Record<string, unknown> | unknown[]): RecommendedJobsResponse {
  if (!data) {
    return { success: false, recommendedJobs: [] };
  }

  // 표준 응답 형태 생성
  const normalizedResponse: RecommendedJobsResponse = {
    success: Array.isArray(data) ? true : Boolean(data && typeof data === 'object' && 'success' in data && data.success),
    recommendedJobs: []
  };

  // 에러 메시지 있으면 추가
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if ('message' in data && data.message) {
      normalizedResponse.message = String(data.message);
    }
    if ('error' in data && data.error) {
      normalizedResponse.error = String(data.error);
    }
  }

  // 다양한 형태의 응답 처리
  if (data && typeof data === 'object' && !Array.isArray(data) && 'recommendedJobs' in data && Array.isArray(data.recommendedJobs)) {
    // 'recommendedJobs' 배열이 있는 경우
    normalizedResponse.recommendedJobs = (data.recommendedJobs as unknown[]).map(job => 
      normalizeJob(job as Record<string, unknown>));
  } else if (data && typeof data === 'object' && !Array.isArray(data) && 'jobs' in data && Array.isArray(data.jobs)) {
    // 'jobs' 배열이 있는 경우
    normalizedResponse.recommendedJobs = (data.jobs as unknown[]).map(job => 
      normalizeJob(job as Record<string, unknown>));
  } else if (Array.isArray(data)) {
    // 데이터 자체가 배열인 경우
    normalizedResponse.recommendedJobs = data.map(job => 
      normalizeJob(job as Record<string, unknown>));
  } else if (data && typeof data === 'object' && 'data' in data && typeof data.data === 'object' && 
             data.data && 'jobs' in data.data && Array.isArray(data.data.jobs)) {
    // data 속성 내에 jobs 배열이 중첩된 경우
    normalizedResponse.recommendedJobs = (data.data.jobs as unknown[]).map(job => 
      normalizeJob(job as Record<string, unknown>));
  }
  
  return normalizedResponse;
}
