
import React from 'react';
import ConsoleOutput from '@/components/ConsoleOutput';
import { Search } from 'lucide-react';

interface ConsoleTabProps {
  testResult: any;
  recommendedJobs: any[];
  autoMatchingResult: any;
  applyResult: any;
}

// 콘솔 출력 탭 컴포넌트
const ConsoleTab: React.FC<ConsoleTabProps> = ({ 
  testResult, 
  recommendedJobs, 
  autoMatchingResult, 
  applyResult 
}) => {
  const hasResults = testResult || recommendedJobs.length > 0 || autoMatchingResult || applyResult;

  return (
    <div className="space-y-6 animate-fade-in">
      {testResult && (
        <ConsoleOutput title="사람인 스크래핑 결과" data={testResult} />
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
