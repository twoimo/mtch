
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface JobListFooterProps {
  displayedCount: number;
  hideExpired: boolean;
  expiredCount: number;
  totalCount: number;
  onToggleHideExpired?: (hide: boolean) => void;
  isMobile: boolean;
}

const JobListFooter: React.FC<JobListFooterProps> = ({
  displayedCount,
  hideExpired,
  expiredCount,
  totalCount,
  onToggleHideExpired,
  isMobile
}) => {
  const handleToggleHideExpired = (checked: boolean) => {
    if (onToggleHideExpired) {
      onToggleHideExpired(checked);
      // Store preference in localStorage for persistence
      localStorage.setItem('hide-expired-jobs', checked.toString());
    }
  };

  return (
    <>
      <div className="text-center text-sm text-gray-500 mt-6 mb-2">
        {displayedCount}개 표시 중 
        {hideExpired && expiredCount > 0 && 
          ` (마감된 ${expiredCount}개 제외, 총 ${totalCount}개)`}
      </div>
      
      {isMobile && onToggleHideExpired && (
        <div className="flex items-center justify-center pt-1 pb-3">
          <ToggleGroup 
            type="single" 
            value={hideExpired ? "hide" : "show"} 
            className="border rounded-lg"
          >
            <ToggleGroupItem 
              value="hide" 
              onClick={() => handleToggleHideExpired(true)}
              className={`px-3 py-1.5 text-xs ${hideExpired ? "bg-primary/10 text-primary" : ""}`}
            >
              마감공고 숨기기
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="show" 
              onClick={() => handleToggleHideExpired(false)}
              className={`px-3 py-1.5 text-xs ${!hideExpired ? "bg-primary/10 text-primary" : ""}`}
            >
              모든공고 보기
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    </>
  );
};

export default React.memo(JobListFooter);
