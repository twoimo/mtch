
// API 통신을 담당하는 서비스 클래스
class MainServiceCommunicateService {
  private baseUrl: string = 'http://localhost:6080/api/developer/main_service_communicate';

  // 테스트 API 호출
  async test(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/test`);
      return await response.json();
    } catch (error) {
      console.error('테스트 API 호출 중 오류 발생:', error);
      return { success: false, error: '테스트 API 호출 중 오류가 발생했습니다.' };
    }
  }

  // 추천 채용 정보 가져오기
  async getRecommendedJobs(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/recommended-jobs`);
      return await response.json();
    } catch (error) {
      console.error('추천 채용 정보 가져오기 중 오류 발생:', error);
      return { success: false, error: '추천 채용 정보를 가져오는 중 오류가 발생했습니다.' };
    }
  }

  // 자동 채용 매칭 실행
  async runAutoJobMatching(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/run-auto-job-matching`);
      return await response.json();
    } catch (error) {
      console.error('자동 채용 매칭 실행 중 오류 발생:', error);
      return { success: false, error: '자동 채용 매칭을 실행하는 중 오류가 발생했습니다.' };
    }
  }

  // 사람인 채용 지원
  async applySaraminJobs(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/apply-saramin-jobs`);
      return await response.json();
    } catch (error) {
      console.error('사람인 채용 지원 중 오류 발생:', error);
      return { success: false, error: '사람인 채용 지원 중 오류가 발생했습니다.' };
    }
  }
}

// 싱글턴 인스턴스 생성 및 내보내기
export const apiService = new MainServiceCommunicateService();
