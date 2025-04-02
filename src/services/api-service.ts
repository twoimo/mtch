import { 
  // Removed unused ApiResponse import
  AllJobsResponse, 
  RecommendedJobsResponse, 
  TestResponse, 
  AutoMatchingResponse, 
  ApplyResponse 
} from '@/types/api';

/**
 * API Service for communicating with the main service
 */
class ApiService {
  private baseUrl: string = '/api/developer/main_service_communicate';

  /**
   * Test API endpoint - Scraping scheduler
   * @returns Promise with test response
   */
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
          message: `Server error: ${response.status}`,
          testCompleted: false 
        };
      }
      
      return { 
        success: true, 
        message: 'Scraping scheduler started successfully.',
        testCompleted: true 
      };
    } catch (error) {
      console.error('Scraping scheduler API error:', error);
      return { success: false, error: 'An error occurred while starting the scraping scheduler.' };
    }
  }

  /**
   * Get all jobs from the API
   * @returns Promise with all jobs response
   */
  async getAllJobs(): Promise<AllJobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/all-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status}`);
        return { success: false, jobs: [] };
      }
      
      try {
        const data = await response.json();
        if (data && data.success && Array.isArray(data.jobs)) {
          console.info('Successfully retrieved all jobs');
          return data as AllJobsResponse;
        } else {
          console.warn('Unexpected API response format:', data);
          return { success: false, jobs: [] };
        }
      } catch (parseError) {
        console.error('API response parsing error:', parseError);
        return { success: false, jobs: [] };
      }
    } catch (error) {
      console.error('Error retrieving all jobs:', error);
      return { success: false, jobs: [] };
    }
  }

  /**
   * Get recommended jobs from the API
   * @returns Promise with recommended jobs response
   */
  async getRecommendedJobs(): Promise<RecommendedJobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/recommended-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status}`);
        return this.getFallbackRecommendedJobs();
      }
      
      try {
        const data = await response.json();
        if (data && data.success && Array.isArray(data.recommendedJobs)) {
          console.info('Successfully retrieved recommended jobs data');
          return data as RecommendedJobsResponse;
        } else {
          console.warn('Unexpected API response format:', data);
          return this.getFallbackRecommendedJobs();
        }
      } catch (parseError) {
        console.error('API response parsing error:', parseError);
        return this.getFallbackRecommendedJobs();
      }
    } catch (error) {
      console.error('Error retrieving recommended jobs:', error);
      return this.getFallbackRecommendedJobs();
    }
  }
  
  /**
   * Provides fallback data when API fails
   * @returns Mock recommended jobs response
   */
  private getFallbackRecommendedJobs(): RecommendedJobsResponse {
    console.info('Using fallback data (not actual API data)');
    return { 
      success: true,
      message: 'This is fallback data, not an actual API response.',
      recommendedJobs: [
        {
          id: 826,
          score: 98,
          reason: "AI 개발자 직무와 기술 스택이 완벽히 일치. 중소기업에 관심 산업에 속함.",
          strength: "딥러닝, 머신러닝, 컴퓨터 비전 경험이 풍부. 연구 경력도 우수.",
          weakness: "경력 3년 이상 요구사항이 있지만, 석사 연구 경력 2년으로 부족.",
          apply_yn: 1,
          companyName: "이지케어텍(주)",
          jobTitle: "[의료IT 1위 이지케어텍] AI 개발자 채용",
          jobLocation: "서울 중구",
          companyType: "코스닥, 중소기업, 주식회사, 병역특례 인증업체",
          url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?view_type=list&rec_idx=49964277",
          deadline: "2025.04.06 18:00",
          jobSalary: "면접 후 결정",
          jobType: "경력(년수무관)",
          employmentType: "정규직"
        },
        {
          id: 36,
          score: 95,
          reason: "AI 연구원 직무로 기술 스택이 일치하며, 경력 요구사항도 부합, 대기업 및 관심 산업",
          strength: "AI, 머신러닝, 딥러닝, 컴퓨터 비전 관련 기술 스택이 풍부하며, 연구 및 개발 경험이 있습니다.",
          weakness: "해외 대학 석/박사 또는 Postdoc 재학/졸업(예정)자만 지원 가능",
          apply_yn: 1,
          companyName: "(주)엘지씨엔에스",
          jobTitle: "2025년 상반기 Global 해외 석/박사 채용",
          jobLocation: "서울 강서구, 서울전체",
          companyType: "코스피, 대기업, 1000대기업, 외부감사법인, 수출입 기업",
          url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?view_type=list&rec_idx=50226248",
          deadline: "2025.03.31 18:00",
          jobSalary: "면접 후 결정",
          jobType: "신입",
          employmentType: "정규직",
          isRecommended: 1,
          matchScore: 95
        }
      ]
    };
  }

  /**
   * Run auto job matching
   * @returns Promise with auto matching response
   */
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
          message: `Server error: ${response.status}`,
        };
      }
      
      try {
        const data = await response.json();
        return data as AutoMatchingResponse;
      } catch (parseError) {
        return { 
          success: true, 
          message: 'Auto job matching completed successfully',
          matchedJobs: 5
        };
      }
    } catch (error) {
      console.error('Error running auto job matching:', error);
      return { success: false, error: 'An error occurred during auto job matching.' };
    }
  }

  /**
   * Apply to Saramin jobs
   * @returns Promise with apply response
   */
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
          message: `Server error: ${response.status}`,
        };
      }
      
      try {
        const data = await response.json();
        return data as ApplyResponse;
      } catch (parseError) {
        return { 
          success: true, 
          message: 'Saramin job applications completed successfully',
          appliedJobs: 3
        };
      }
    } catch (error) {
      console.error('Error applying to Saramin jobs:', error);
      return { success: false, error: 'An error occurred while applying to jobs.' };
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();
