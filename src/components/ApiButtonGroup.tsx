
import React from 'react';
import ApiButton from '@/components/ApiButton';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ApiButton 
        label="사람인 스크래핑 시작" 
        onClick={onTestApi} 
        isLoading={isTestLoading}
        className="bg-indigo-600 hover:bg-indigo-700"
        variant="default"
      />
      <ApiButton 
        label="추천 채용 정보 조회" 
        onClick={onGetRecommendedJobs} 
        isLoading={isRecommendedLoading}
        className="bg-emerald-600 hover:bg-emerald-700" 
        variant="default"
      />
      <ApiButton 
        label="자동 채용 매칭 실행" 
        onClick={onRunAutoJobMatching} 
        isLoading={isAutoMatchingLoading}
        className="bg-amber-600 hover:bg-amber-700" 
        variant="default"
      />
      <ApiButton 
        label="사람인 채용 지원" 
        onClick={onApplySaraminJobs} 
        isLoading={isApplyLoading}
        className="bg-rose-600 hover:bg-rose-700" 
        variant="default"
      />
    </div>
  );
};

export default ApiButtonGroup;
