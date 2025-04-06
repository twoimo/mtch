
import { useState, useEffect } from 'react';
import { jobService } from '@/services/jobService';
import { Job } from '@/types/api';
import { toast } from '@/hooks/use-toast';

export function useJobsData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // 모든 채용 정보 및 추천 채용 정보 가져오기
  const fetchAllJobData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        jobService.fetchAllJobs(),
        jobService.fetchRecommendedJobs()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('데이터 로드 중 오류가 발생했습니다.'));
      toast({
        title: "오류",
        description: "채용 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAllJobData();
  }, []);
  
  return {
    isLoading,
    error,
    refetch: fetchAllJobData
  };
}
