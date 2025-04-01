
import { useState } from 'react';
import { apiService } from '@/services/MainServiceCommunicateService';
import { useToast } from '@/hooks/use-toast';

// API 액션 관련 커스텀 훅
export const useApiActions = () => {
  // 상태 관리
  const [testResult, setTestResult] = useState<any>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [autoMatchingResult, setAutoMatchingResult] = useState<any>(null);
  const [applyResult, setApplyResult] = useState<any>(null);
  
  // 로딩 상태 관리
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [isAutoMatchingLoading, setIsAutoMatchingLoading] = useState(false);
  const [isApplyLoading, setIsApplyLoading] = useState(false);
  
  const { toast } = useToast();

  // 사람인 스크래핑 시작
  const handleTestApi = async () => {
    setIsTestLoading(true);
    try {
      const result = await apiService.test();
      setTestResult(result);
      toast({
        title: '스크래핑 완료',
        description: '사람인 웹사이트 스크래핑이 성공적으로 완료되었습니다.',
      });
    } catch (error) {
      console.error('사람인 스크래핑 중 오류:', error);
      toast({
        title: '오류 발생',
        description: '사람인 스크래핑 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  // 추천 채용 정보 가져오기
  const handleGetRecommendedJobs = async () => {
    setIsRecommendedLoading(true);
    try {
      const result = await apiService.getRecommendedJobs();
      if (result.success && result.recommendedJobs) {
        setRecommendedJobs(result.recommendedJobs);
        toast({
          title: '추천 채용 정보 조회 완료',
          description: `${result.recommendedJobs.length}개의 추천 채용 정보를 가져왔습니다.`,
        });
      } else {
        setRecommendedJobs([]);
        toast({
          title: '데이터 없음',
          description: '추천 채용 정보를 가져오지 못했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('추천 채용 정보 가져오기 중 오류:', error);
      toast({
        title: '오류 발생',
        description: '추천 채용 정보를 가져오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsRecommendedLoading(false);
    }
  };

  // 자동 채용 매칭 실행
  const handleRunAutoJobMatching = async () => {
    setIsAutoMatchingLoading(true);
    try {
      const result = await apiService.runAutoJobMatching();
      setAutoMatchingResult(result);
      toast({
        title: '자동 채용 매칭 완료',
        description: '자동 채용 매칭이 성공적으로 실행되었습니다.',
      });
    } catch (error) {
      console.error('자동 채용 매칭 실행 중 오류:', error);
      toast({
        title: '오류 발생',
        description: '자동 채용 매칭 실행 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsAutoMatchingLoading(false);
    }
  };

  // 사람인 채용 지원
  const handleApplySaraminJobs = async () => {
    setIsApplyLoading(true);
    try {
      const result = await apiService.applySaraminJobs();
      setApplyResult(result);
      toast({
        title: '사람인 채용 지원 완료',
        description: '사람인 채용 지원이 성공적으로 실행되었습니다.',
      });
    } catch (error) {
      console.error('사람인 채용 지원 중 오류:', error);
      toast({
        title: '오류 발생',
        description: '사람인 채용 지원 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyLoading(false);
    }
  };

  return {
    // 상태
    testResult,
    recommendedJobs,
    autoMatchingResult,
    applyResult,
    
    // 로딩 상태
    isTestLoading,
    isRecommendedLoading,
    isAutoMatchingLoading,
    isApplyLoading,
    
    // 액션 메서드
    handleTestApi,
    handleGetRecommendedJobs,
    handleRunAutoJobMatching,
    handleApplySaraminJobs
  };
};
