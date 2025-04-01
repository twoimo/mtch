import React from 'react';
import ApiButton from '@/components/ApiButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Database, FileSearch, BriefcaseBusiness, SendToBack } from 'lucide-react';

interface ApiButtonGroupProps {
  onTestApi: () => Promise<void>;
  onGetRecommendedJobs: () => Promise<void>;
  onRunAutoJobMatching: () => Promise<void>;
  onApplySaraminJobs: () => Promise<void>;
  
  isTestLoading: boolean;
  isRecommendedLoading: boolean;
  isAutoMatchingLoading: boolean;
  isApplyLoading: boolean;
}

// API 버튼 그룹 컴포넌트
const ApiButtonGroup: React.FC<ApiButtonGroupProps> = ({
  onTestApi,
  onGetRecommendedJobs,
  onRunAutoJobMatching,
  onApplySaraminJobs,
  
  isTestLoading,
  isRecommendedLoading,
  isAutoMatchingLoading,
  isApplyLoading
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "grid gap-4 transition-all duration-300",
      isMobile 
        ? "grid-cols-1 mt-2" 
        : "sm:grid-cols-2 lg:grid-cols-4"
    )}>
      <ApiButton 
        label="사람인 스크래핑" 
        onClick={onTestApi} 
        isLoading={isTestLoading}
        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        variant="default"
        icon={<Database className="h-4 w-4" />}
        tooltip="사람인 웹사이트에서 채용 정보를 스크래핑합니다"
      />
      <ApiButton 
        label="추천 채용 정보 조회" 
        onClick={onGetRecommendedJobs} 
        isLoading={isRecommendedLoading}
        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800" 
        variant="default"
        icon={<FileSearch className="h-4 w-4" />}
        tooltip="맞춤형 추천 채용 정보를 조회합니다"
      />
      <ApiButton 
        label="자동 채용 매칭 실행" 
        onClick={onRunAutoJobMatching} 
        isLoading={isAutoMatchingLoading}
        className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800" 
        variant="default"
        icon={<BriefcaseBusiness className="h-4 w-4" />}
        tooltip="자동으로 이력서와 채용 정보를 매칭합니다"
      />
      <ApiButton 
        label="사람인 채용 지원" 
        onClick={onApplySaraminJobs} 
        isLoading={isApplyLoading}
        className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800" 
        variant="default"
        icon={<SendToBack className="h-4 w-4" />}
        tooltip="매칭된 채용 정보에 자동으로 지원합니다"
      />
    </div>
  );
};

export default ApiButtonGroup;
