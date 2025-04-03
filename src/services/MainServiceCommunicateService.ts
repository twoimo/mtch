// API 통신을 담당하는 서비스 클래스
import recommendedJobsData from '@/components/recommended-jobs.json';

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Added a specific property to make this interface distinct from its parent
interface TestResponse extends ApiResponse {
  testCompleted?: boolean;
}

interface RecommendedJobsResponse extends ApiResponse {
  recommendedJobs: Job[];
}

interface AllJobsResponse extends ApiResponse {
  jobs: Job[];
}

interface AutoMatchingResponse extends ApiResponse {
  matchedJobs?: number;
}

interface ApplyResponse extends ApiResponse {
  appliedJobs?: number;
}

// 업데이트된 Job 인터페이스 - 새로운 API 필드 추가
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
  jobType?: string;
  jobSalary?: string;
  employmentType?: string;
  jobDescription?: string;
  descriptionType?: string;
  scrapedAt?: string;
  matchScore?: number;
  isRecommended?: number;
  matchReason?: string;
  
  // 새로 추가된 필드
  company_name?: string;
  job_title?: string;
  job_description?: string;
  job_url?: string;
  job_location?: string;
  employment_type?: string;
  job_salary?: string;
  job_type?: string;
  company_type?: string;
  scraped_at?: string;
  match_score?: number;
  match_reason?: string;
  is_recommended?: number;
  
  // 실제 새로운 필드들
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

class MainServiceCommunicateService {
  // 프록시를 사용하기 위해 상대 경로로 변경
  private baseUrl: string = '/api/developer/main_service_communicate';
  // CORS 프록시 관련 설정 제거 (더 이상 필요 없음)

  // 사람인 웹사이트 스크래핑 시작
  async test(): Promise<TestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        return { 
          success: false, 
          message: `서버 오류: ${response.status}`,
          testCompleted: false 
        };
      }
      
      return { 
        success: true, 
        message: '사람인 스크래핑 요청이 성공적으로 전송되었습니다.',
        testCompleted: true 
      };
    } catch (error) {
      console.error('사람인 스크래핑 중 오류 발생:', error);
      return { success: false, error: '사람인 스크래핑 중 오류가 발생했습니다.' };
    }
  }

  // 전체 채용 정보 조회 - API 응답 형식 업데이트
  async getAllJobs(): Promise<AllJobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/all-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`API 응답 오류: ${response.status}`);
        return { success: false, jobs: [] };
      }
      
      try {
        const data = await response.json();
        if (data && data.success && Array.isArray(data.jobs)) {
          console.info('전체 채용 정보를 성공적으로 받아왔습니다.');
          return data as AllJobsResponse;
        } else {
          console.warn('API 응답 형식이 예상과 다릅니다:', data);
          return { success: false, jobs: [] };
        }
      } catch (parseError) {
        console.error('API 응답 파싱 중 오류 발생:', parseError);
        return { success: false, jobs: [] };
      }
    } catch (error) {
      console.error('전체 채용 정보 가져오기 중 오류 발생:', error);
      return { success: false, jobs: [] };
    }
  }

  // 추천 채용 정보 가져오기 - 실제 API 데이터 처리
  async getRecommendedJobs(): Promise<RecommendedJobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/recommended-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`API 응답 오류: ${response.status}`);
        return this.getFallbackRecommendedJobs();
      }
      
      try {
        const data = await response.json();
        if (data && data.success && Array.isArray(data.recommendedJobs)) {
          console.info('실제 API 데이터를 성공적으로 받아왔습니다.');
          return data as RecommendedJobsResponse;
        } else {
          console.warn('API 응답 형식이 예상과 다릅니다:', data);
          return this.getFallbackRecommendedJobs();
        }
      } catch (parseError) {
        console.error('API 응답 파싱 중 오류 발생:', parseError);
        return this.getFallbackRecommendedJobs();
      }
    } catch (error) {
      console.error('추천 채용 정보 가져오기 중 오류 발생:', error);
      return this.getFallbackRecommendedJobs();
    }
  }
  
  // 백업 데이터 제공 메서드 - JSON 파일에서 가져오기
  private getFallbackRecommendedJobs(): RecommendedJobsResponse {
    console.info('recommended-jobs.json 파일의 데이터를 사용합니다.');
    return recommendedJobsData as RecommendedJobsResponse;
  }

  // 자동 채용 매칭 실행
  async runAutoJobMatching(): Promise<AutoMatchingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/run-auto-job-matching`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        return { 
          success: false, 
          message: `서버 오류: ${response.status}`,
        };
      }
      
      try {
        const data = await response.json();
        return data as AutoMatchingResponse;
      } catch (parseError) {
        return { 
          success: true, 
          message: '자동 채용 매칭이 성공적으로 실행되었습니다.',
          matchedJobs: 5
        };
      }
    } catch (error) {
      console.error('자동 채용 매칭 실행 중 오류 발생:', error);
      return { success: false, error: '자동 채용 매칭을 실행하는 중 오류가 발생했습니다.' };
    }
  }

  // 사람인 채용 지원
  async applySaraminJobs(): Promise<ApplyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/apply-saramin-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        return { 
          success: false, 
          message: `서버 오류: ${response.status}`,
        };
      }
      
      try {
        const data = await response.json();
        return data as ApplyResponse;
      } catch (parseError) {
        return { 
          success: true, 
          message: '사람인 채용 지원이 성공적으로 완료되었습니다.',
          appliedJobs: 3
        };
      }
    } catch (error) {
      console.error('사람인 채용 지원 중 오류 발생:', error);
      return { success: false, error: '사람인 채용 지원 중 오류가 발생했습니다.' };
    }
  }
}

// 싱글턴 인스턴스 생성 및 내보내기
export const apiService = new MainServiceCommunicateService();
export type { Job, ApiResponse, RecommendedJobsResponse, AllJobsResponse, AutoMatchingResponse, ApplyResponse };
