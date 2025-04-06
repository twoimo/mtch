
import { apiClient } from './api-client';
import { 
  RecommendedJobsResponse, 
  AllJobsResponse,
  Job
} from '@/types/api';
import { useJobStore } from '@/store/jobStore';

/**
 * 채용 정보와 관련된 비즈니스 로직을 처리하는 서비스
 */
class JobService {
  /**
   * 모든 채용 정보를 가져오고 상태를 업데이트합니다.
   */
  async fetchAllJobs(): Promise<Job[]> {
    try {
      const response = await apiClient.get<AllJobsResponse>('/all-jobs', { cache: true });
      
      if (response.success && response.jobs) {
        // 전역 상태 업데이트
        useJobStore.getState().setAllJobs(response.jobs);
        return response.jobs;
      }
      
      throw new Error(response.message || '채용 정보를 불러오는데 실패했습니다.');
    } catch (error) {
      console.error('모든 채용 정보 가져오기 실패:', error);
      return [];
    }
  }
  
  /**
   * 추천 채용 정보를 가져오고 상태를 업데이트합니다.
   */
  async fetchRecommendedJobs(): Promise<Job[]> {
    try {
      const response = await apiClient.get<RecommendedJobsResponse>('/recommended-jobs', { cache: true });
      
      if (response.success && response.recommendedJobs) {
        // 전역 상태 업데이트
        useJobStore.getState().setRecommendedJobs(response.recommendedJobs);
        return response.recommendedJobs;
      }
      
      throw new Error(response.message || '추천 채용 정보를 불러오는데 실패했습니다.');
    } catch (error) {
      console.error('추천 채용 정보 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * 자동 매칭 작업을 실행합니다.
   */
  async runAutoMatching() {
    return apiClient.get('/run-auto-job-matching');
  }
  
  /**
   * 채용에 지원합니다.
   */
  async applyToJobs() {
    return apiClient.get('/apply-saramin-jobs');
  }
}

// 싱글톤 인스턴스
export const jobService = new JobService();
