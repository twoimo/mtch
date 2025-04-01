
import React, { useState } from 'react';
import { apiService } from '@/services/MainServiceCommunicateService';
import ApiButton from '@/components/ApiButton';
import JobList from '@/components/JobList';
import ConsoleOutput from '@/components/ConsoleOutput';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Index = () => {
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

  // API 테스트 실행
  const handleTestApi = async () => {
    setIsTestLoading(true);
    try {
      const result = await apiService.test();
      setTestResult(result);
      toast({
        title: '테스트 완료',
        description: '테스트 API가 성공적으로 호출되었습니다.',
      });
    } catch (error) {
      console.error('API 테스트 중 오류:', error);
      toast({
        title: '오류 발생',
        description: 'API 테스트 중 오류가 발생했습니다.',
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

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">사람인 채용 매칭 시스템</CardTitle>
          <CardDescription>
            API를 통해 채용 정보를 조회하고 자동 매칭 및 지원을 실행할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <ApiButton 
              label="테스트 API 호출" 
              onClick={handleTestApi} 
              isLoading={isTestLoading} 
            />
            <ApiButton 
              label="추천 채용 정보 조회" 
              onClick={handleGetRecommendedJobs} 
              isLoading={isRecommendedLoading} 
            />
            <ApiButton 
              label="자동 채용 매칭 실행" 
              onClick={handleRunAutoJobMatching} 
              isLoading={isAutoMatchingLoading} 
            />
            <ApiButton 
              label="사람인 채용 지원" 
              onClick={handleApplySaraminJobs} 
              isLoading={isApplyLoading} 
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommended" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="recommended">추천 채용 정보</TabsTrigger>
          <TabsTrigger value="console">콘솔 출력</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended">
          {recommendedJobs.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-4">추천 채용 정보 ({recommendedJobs.length}개)</h2>
              <JobList jobs={recommendedJobs} />
            </>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <p className="text-gray-500">추천 채용 정보를 조회해주세요.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="console">
          <div className="space-y-6">
            {testResult && (
              <ConsoleOutput title="테스트 API 호출 결과" data={testResult} />
            )}
            
            {recommendedJobs.length > 0 && (
              <ConsoleOutput title="추천 채용 정보 결과" data={{ success: true, recommendedJobs }} />
            )}
            
            {autoMatchingResult && (
              <ConsoleOutput title="자동 채용 매칭 결과" data={autoMatchingResult} />
            )}
            
            {applyResult && (
              <ConsoleOutput title="사람인 채용 지원 결과" data={applyResult} />
            )}
            
            {!testResult && !recommendedJobs.length && !autoMatchingResult && !applyResult && (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500">API를 호출하면 결과가 여기에 표시됩니다.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
