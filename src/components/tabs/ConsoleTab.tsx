import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Job, ApplyResponse, AutoMatchingResponse } from '@/services/MainServiceCommunicateService';

interface TestResult {
  success: boolean;
  message: string;
  data?: {
    count: number;
  };
  timestamp?: string;
}

interface ConsoleTabProps {
  testResult: TestResult | null;
  recommendedJobs: Job[];
  autoMatchingResult: AutoMatchingResponse | null;
  applyResult: ApplyResponse | null;
}

// 추천 채용 정보 타입 (ConsoleOutput에서 사용)
interface RecommendedJobsData {
  success: boolean;
  message?: string;
  recommendedJobs: Job[];
}

// Console Output 컴포넌트의 data 타입을 안전하게 정의
interface ConsoleOutputBaseData {
  success: boolean;
  message?: string;
}

interface RecommendedJobsOutputData extends ConsoleOutputBaseData {
  recommendedJobs: Job[];
}

interface MatchingOutputData extends ConsoleOutputBaseData {
  matchedJobs?: number;
}

interface ApplyOutputData extends ConsoleOutputBaseData {
  appliedJobs?: number;
}

// Union 타입으로 명확하게 정의
type ConsoleOutputData = ConsoleOutputBaseData | RecommendedJobsOutputData | MatchingOutputData | ApplyOutputData;

// Console Output 컴포넌트 추가
interface ConsoleOutputProps {
  title: string;
  data: ConsoleOutputData;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ title, data }) => {
  // 타입 가드 함수들 추가
  const hasRecommendedJobs = (data: ConsoleOutputData): data is RecommendedJobsOutputData => 
    'recommendedJobs' in data && Array.isArray((data as RecommendedJobsOutputData).recommendedJobs);
  
  const hasMatchedJobs = (data: ConsoleOutputData): data is MatchingOutputData =>
    'matchedJobs' in data;
    
  const hasAppliedJobs = (data: ConsoleOutputData): data is ApplyOutputData =>
    'appliedJobs' in data;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Database className="mr-2 h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant={data.success ? "success" : "destructive"}>
            {data.success ? "성공" : "실패"}
          </Badge>
        </div>
        <CardDescription>
          {new Date().toLocaleTimeString()} 실행됨
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Alert variant={data.success ? "default" : "destructive"}>
          <div className="flex items-start">
            {data.success ? 
              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5" /> : 
              <XCircle className="h-4 w-4 mr-2 mt-0.5" />
            }
            <AlertTitle className="mb-1">
              {data.success ? "성공" : "실패"}
            </AlertTitle>
          </div>
          <AlertDescription className="ml-6">
            {data.message || "요청이 처리되었습니다."}
            {title.includes("추천 채용") && hasRecommendedJobs(data) && (
              <div className="mt-2">
                <span className="font-semibold">채용 정보 수:</span> {data.recommendedJobs.length}개
              </div>
            )}
            {title.includes("자동 채용 매칭") && hasMatchedJobs(data) && data.matchedJobs !== undefined && (
              <div className="mt-2">
                <span className="font-semibold">매칭된 채용 정보:</span> {data.matchedJobs}개
              </div>
            )}
            {title.includes("채용 지원") && hasAppliedJobs(data) && data.appliedJobs !== undefined && (
              <div className="mt-2">
                <span className="font-semibold">지원된 채용 정보:</span> {data.appliedJobs}개
              </div>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

const ConsoleTab: React.FC<ConsoleTabProps> = ({ 
  testResult, 
  recommendedJobs, 
  autoMatchingResult, 
  applyResult 
}) => {
  const getTimeString = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  // 결과가 하나라도 있는지 확인하는 로직
  const hasResults = testResult || recommendedJobs.length > 0 || autoMatchingResult || applyResult;
  
  return (
    <div className="space-y-4">
      {/* 테스트 결과 (전체 채용 정보 조회 결과로 변경) */}
      {testResult && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">전체 채용 정보 조회 결과</CardTitle>
              </div>
              <Badge variant={testResult.success ? "success" : "destructive"}>
                {testResult.success ? "성공" : "실패"}
              </Badge>
            </div>
            <CardDescription>
              {getTimeString()} 실행됨
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <div className="flex items-start">
                {testResult.success ? 
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5" /> : 
                  <XCircle className="h-4 w-4 mr-2 mt-0.5" />
                }
                <AlertTitle className="mb-1">
                  {testResult.success ? "조회 성공" : "조회 실패"}
                </AlertTitle>
              </div>
              <AlertDescription className="ml-6">
                {testResult.message}
                {testResult.success && testResult.data && (
                  <div className="mt-2">
                    <span className="font-semibold">채용 정보 수:</span> {testResult.data.count}개
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
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
      
      {!hasResults && (
        <div className="text-center py-12 border rounded-lg bg-gray-50 shadow-sm transition-all duration-300">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">API를 호출하면 결과가 여기에 표시됩니다.</p>
          <p className="text-gray-400 mt-2">상단의 버튼을 클릭하여 API를 호출해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default ConsoleTab;
