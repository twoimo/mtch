import { useApiActions } from '@/hooks/useApiActions';
import ApiButtonGroup from '@/components/ApiButtonGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Search } from 'lucide-react';
import JobsTab from '@/components/tabs/JobsTab';
import ConsoleTab from '@/components/tabs/ConsoleTab';

const Index = () => {
  const {
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
  } = useApiActions();

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <Card className="mb-8 shadow-md border-t-4 border-t-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-blue-700">사람인 채용 매칭 시스템</CardTitle>
          <CardDescription className="text-gray-600">
            API를 통해 채용 정보를 조회하고 자동 매칭 및 지원을 실행할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiButtonGroup 
            onTestApi={handleTestApi}
            onGetRecommendedJobs={handleGetRecommendedJobs}
            onRunAutoJobMatching={handleRunAutoJobMatching}
            onApplySaraminJobs={handleApplySaraminJobs}
            
            isTestLoading={isTestLoading}
            isRecommendedLoading={isRecommendedLoading}
            isAutoMatchingLoading={isAutoMatchingLoading}
            isApplyLoading={isApplyLoading}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="recommended" className="mb-6">
        <TabsList className="mb-4 w-full p-1 bg-gray-100 rounded-lg">
          <TabsTrigger value="recommended" className="flex-1 py-2 rounded-md">
            <Briefcase className="w-4 h-4 mr-2" /> 추천 채용 정보
          </TabsTrigger>
          <TabsTrigger value="console" className="flex-1 py-2 rounded-md">
            <Search className="w-4 h-4 mr-2" /> 콘솔 출력
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended">
          <JobsTab jobs={recommendedJobs} />
        </TabsContent>
        
        <TabsContent value="console">
          <ConsoleTab 
            testResult={testResult} 
            recommendedJobs={recommendedJobs} 
            autoMatchingResult={autoMatchingResult} 
            applyResult={applyResult} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
