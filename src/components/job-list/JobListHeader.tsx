
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface JobListHeaderProps {
  title: string;
  count: number;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onOpenFilters?: () => void;
  activeFilterCount?: number;
}

const JobListHeader: React.FC<JobListHeaderProps> = ({
  title,
  count,
  sortOrder,
  onSortChange,
  onOpenFilters,
  activeFilterCount = 0
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <div className="flex flex-col">
        <div className="flex items-center text-lg font-semibold">
          {title} <span className="text-primary ml-1">{count}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        {isMobile && onOpenFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`gap-1 ${activeFilterCount > 0 ? 'border-primary text-primary' : ''}`} 
            onClick={onOpenFilters}
          >
            <Filter className="h-4 w-4" />
            필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        )}
        
        <div className="flex items-center gap-1">
          <Select value={sortOrder} onValueChange={onSortChange}>
            <SelectTrigger className={`h-8 ${isMobile ? 'w-[120px]' : 'w-[150px]'}`}>
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent className="min-w-[150px]">
              <SelectItem value="score">매칭 점수순</SelectItem>
              <SelectItem value="apply">지원 가능 우선</SelectItem>
              <SelectItem value="deadline">마감일순</SelectItem>
              <SelectItem value="recent">최신순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(JobListHeader);
