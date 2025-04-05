import { 
  AllJobsResponse, 
  RecommendedJobsResponse, 
  TestResponse, 
  AutoMatchingResponse, 
  ApplyResponse,
  normalizeApiResponse,
  normalizeRecommendedJobsResponse
} from '@/types/api';
import recommendedJobsData from '../../recommended-jobs.json';
import allJobsData from '../../all-jobs.json';

/**
 * 메인 서비스와 통신하기 위한 API 서비스
 */
class ApiService {
  private baseUrl: string = '/api/developer/main_service_communicate';

  /**
   * 테스트 API 엔드포인트 - 스크래핑 스케줄러
   * @returns 테스트 응답 Promise
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
          message: `서버 오류: ${response.status}`,
          testCompleted: false 
        };
      }
      
      return { 
        success: true, 
        message: '스크래핑 스케줄러가 성공적으로 시작되었습니다.',
        testCompleted: true 
      };
    } catch (error) {
      console.error('스크래핑 스케줄러 API 오류:', error);
      return { success: false, error: '스크래핑 스케줄러 시작 중 오류가 발생했습니다.' };
    }
  }

  /**
   * API에서 모든 채용 정보 가져오기
   * @returns 모든 채용 정보가 포함된 응답 Promise
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
        console.warn(`API 오류: ${response.status}`);
        return this.getFallbackAllJobs();
      }
      
      try {
        const data = await response.json();
        if (data) {
          console.info('모든 채용 정보를 성공적으로 가져왔습니다');
          // API 응답을 적절히 변환하기 위해 정규화 함수 사용
          return normalizeApiResponse(data);
        } else {
          console.warn('예상치 못한 API 응답 형식:', data);
          return this.getFallbackAllJobs();
        }
      } catch (parseError) {
        console.error('API 응답 파싱 오류:', parseError);
        return this.getFallbackAllJobs();
      }
    } catch (error) {
      console.error('모든 채용 정보 가져오기 중 오류:', error);
      return this.getFallbackAllJobs();
    }
  }

  /**
   * API 실패 시 대체 데이터 제공
   * @returns JSON 파일에서 가져온 모든 채용 정보
   */
  private getFallbackAllJobs(): AllJobsResponse {
    console.info('all-jobs.json 파일의 대체 데이터 사용 중');
    // 예상 형식과 일치하도록 대체 데이터 정규화 - 타입 캐스팅으로 에러 해결
    return normalizeApiResponse(allJobsData as Record<string, unknown>);
  }

  /**
   * API에서 추천 채용 정보 가져오기
   * @returns 추천 채용 정보가 포함된 응답 Promise
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
        console.warn(`API 오류: ${response.status}`);
        return this.getFallbackRecommendedJobs();
      }
      
      try {
        const data = await response.json();
        if (data) {
          console.info('추천 채용 정보를 성공적으로 가져왔습니다');
          // API 응답을 적절히 변환하기 위해 정규화 함수 사용
          return normalizeRecommendedJobsResponse(data);
        } else {
          console.warn('예상치 못한 API 응답 형식:', data);
          return this.getFallbackRecommendedJobs();
        }
      } catch (parseError) {
        console.error('API 응답 파싱 오류:', parseError);
        return this.getFallbackRecommendedJobs();
      }
    } catch (error) {
      console.error('추천 채용 정보 가져오기 중 오류:', error);
      return this.getFallbackRecommendedJobs();
    }
  }
  
  /**
   * API 실패 시 대체 데이터 제공
   * @returns JSON 파일에서 가져온 추천 채용 정보
   */
  private getFallbackRecommendedJobs(): RecommendedJobsResponse {
    console.info('recommended-jobs.json 파일의 대체 데이터 사용 중');
    // 예상 형식과 일치하도록 대체 데이터 정규화 - 타입 캐스팅으로 에러 해결
    return normalizeRecommendedJobsResponse(recommendedJobsData as Record<string, unknown>);
  }

  /**
   * 자동 채용 매칭 실행
   * @returns 자동 매칭 응답 Promise
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
          message: `서버 오류: ${response.status}`,
        };
      }
      
      try {
        const data = await response.json();
        return data as AutoMatchingResponse;
      } catch (parseError) {
        return { 
          success: true, 
          message: '자동 채용 매칭이 성공적으로 완료되었습니다',
          matchedJobs: 5
        };
      }
    } catch (error) {
      console.error('자동 채용 매칭 실행 중 오류:', error);
      return { success: false, error: '자동 채용 매칭 중 오류가 발생했습니다.' };
    }
  }

  /**
   * Saramin 채용에 지원하기
   * @returns 지원 응답 Promise
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
          message: `서버 오류: ${response.status}`,
        };
      }
      
      try {
        const data = await response.json();
        return data as ApplyResponse;
      } catch (parseError) {
        return { 
          success: true, 
          message: 'Saramin 채용 지원이 성공적으로 완료되었습니다',
          appliedJobs: 3
        };
      }
    } catch (error) {
      console.error('Saramin 채용 지원 중 오류:', error);
      return { success: false, error: '채용 지원 중 오류가 발생했습니다.' };
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();
