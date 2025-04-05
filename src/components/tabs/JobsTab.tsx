import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, RotateCcw, Filter } from 'lucide-react';
import JobList from '@/components/JobList';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import the Job type from JobList to ensure type compatibility
type JobListJob = {
  id: number;
  score: number;
  reason: string;
  strength: string;
  weakness: string;
  apply_yn: number;
  companyName: string;
  jobTitle: string;
  jobLocation: string;
  companyType: string;
  url: string;
  deadline?: string;
};

interface JobFilters {
  keyword: string;
  minScore: number;
  employmentType: string[];
  companyType: string;
  jobType: string[];
  salaryRange: string;
  onlyApplicable: boolean;
  hideExpired?: boolean;
}

interface JobsTabProps {
  jobs: JobListJob[];
  filteredJobs: JobListJob[];
  filters: JobFilters;
  onUpdateFilters: (filters: JobFilters) => void;
  onResetFilters: () => void;
}

const JobsTab: React.FC<JobsTabProps> = ({ 
  jobs, filteredJobs, filters, onUpdateFilters, onResetFilters 
}) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Initialize internal state based on filters prop but only on component mount
  const [localHideExpired, setLocalHideExpired] = useState(
    filters.hideExpired === undefined ? true : !!filters.hideExpired
  );
  
  // Only sync on first mount and when filters change through parent, not drawer open/close
  useEffect(() => {
    // Only update local state if parent filters changed from outside this component
    if (filters.hideExpired !== undefined && localHideExpired !== filters.hideExpired) {
      setLocalHideExpired(filters.hideExpired);
    }
  }, [filters.hideExpired, localHideExpired]);
  
  // Calculate active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.minScore > 0) count++;
    if (filters.employmentType.length > 0) count++;
    if (filters.companyType && filters.companyType !== 'all') count++;
    if (filters.jobType.length > 0) count++;
    if (filters.onlyApplicable) count++;
    if (filters.hideExpired) count++;
    return count;
  }, [filters]);
  
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateFilters({ ...filters, keyword: e.target.value });
  };
  
  const handleScoreChange = (value: number[]) => {
    onUpdateFilters({ ...filters, minScore: value[0] });
  };
  
  const handleEmploymentTypeChange = (value: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.employmentType, value]
      : filters.employmentType.filter(type => type !== value);
    onUpdateFilters({ ...filters, employmentType: newTypes });
  };
  
  const handleCompanyTypeChange = (value: string) => {
    onUpdateFilters({ ...filters, companyType: value });
  };
  
  const handleJobTypeChange = (value: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.jobType, value]
      : filters.jobType.filter(type => type !== value);
    onUpdateFilters({ ...filters, jobType: newTypes });
  };
  
  const handleOnlyApplicableChange = (checked: boolean) => {
    onUpdateFilters({ ...filters, onlyApplicable: checked });
  };
  
  const handleHideExpiredChange = (checked: boolean) => {
    // Update local state immediately for responsive UI
    setLocalHideExpired(checked);
    // Update parent state with a slight delay to ensure local state updates first
    setTimeout(() => {
      onUpdateFilters({ ...filters, hideExpired: checked });
    }, 0);
  };
  
  const handleResetFilters = () => {
    onResetFilters();
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };
  
  const renderFiltersContent = () => (
    <ScrollArea className={`space-y-5 ${isMobile ? 'py-5 px-5 h-[70vh]' : 'px-1'} scrollbar-none`}>
      <div className="pt-1 pb-2">
        <Label htmlFor="keyword" className="text-sm font-medium mb-1.5 block">
          키워드 검색
        </Label>
        <div className="relative">
          <Input
            id="keyword"
            placeholder="회사명, 포지션 등 검색"
            value={filters.keyword}
            onChange={handleKeywordChange}
            className={`pr-8 ${filters.keyword ? 'border-primary/70' : ''} `}
          />
          {filters.keyword && (
            <button
              onClick={() => onUpdateFilters({ ...filters, keyword: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="pt-1 py-4">
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="score" className="text-sm font-medium">
            최소 매칭 점수: <span className="text-primary">{filters.minScore}점</span>
          </Label>
        </div>
        <Slider
          id="score"
          min={0}
          max={100}
          step={5}
          value={[filters.minScore]}
          onValueChange={handleScoreChange}
          className={filters.minScore > 0 ? "accent-primary" : ""}
        />
      </div>
      
      <div className="pt-1 py-4">
        <Label className="text-sm font-medium mb-2 block">고용 형태</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="employment-type-1" 
              checked={filters.employmentType.includes('정규직')}
              onCheckedChange={(checked) => 
                handleEmploymentTypeChange('정규직', checked as boolean)
              }
            />
            <label 
              htmlFor="employment-type-1" 
              className="text-sm cursor-pointer"
            >
              정규직
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="employment-type-2"
              checked={filters.employmentType.includes('계약직')}
              onCheckedChange={(checked) => 
                handleEmploymentTypeChange('계약직', checked as boolean)
              }
            />
            <label 
              htmlFor="employment-type-2" 
              className="text-sm cursor-pointer"
            >
              계약직
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="employment-type-3"
              checked={filters.employmentType.includes('인턴')}
              onCheckedChange={(checked) => 
                handleEmploymentTypeChange('인턴', checked as boolean)
              }
            />
            <label 
              htmlFor="employment-type-3" 
              className="text-sm cursor-pointer"
            >
              인턴
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="employment-type-4"
              checked={filters.employmentType.includes('파견직')}
              onCheckedChange={(checked) => 
                handleEmploymentTypeChange('파견직', checked as boolean)
              }
            />
            <label 
              htmlFor="employment-type-4" 
              className="text-sm cursor-pointer"
            >
              파견직
            </label>
          </div>
        </div>
      </div>
      
      <div className="pt-1 py-4">
        <Label className="text-sm font-medium mb-2 block">회사 유형</Label>
        <RadioGroup 
          value={filters.companyType} 
          onValueChange={handleCompanyTypeChange}
          className="grid grid-cols-2 gap-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="company-type-all" />
            <label htmlFor="company-type-all" className="text-sm cursor-pointer">
              전체
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="company-type-large" />
            <label htmlFor="company-type-large" className="text-sm cursor-pointer">
              대기업
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="company-type-medium" />
            <label htmlFor="company-type-medium" className="text-sm cursor-pointer">
              중견기업
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="company-type-small" />
            <label htmlFor="company-type-small" className="text-sm cursor-pointer">
              중소기업
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="public" id="company-type-public" />
            <label htmlFor="company-type-public" className="text-sm cursor-pointer">
              공공기관
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="company-type-other" />
            <label htmlFor="company-type-other" className="text-sm cursor-pointer">
              기타 기업
            </label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="pt-1 py-4">
        <Label className="text-sm font-medium mb-2 block">경력 유형</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="job-type-1"
              checked={filters.jobType.includes('신입')}
              onCheckedChange={(checked) => 
                handleJobTypeChange('신입', checked as boolean)
              }
            />
            <label htmlFor="job-type-1" className="text-sm cursor-pointer">
              신입
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="job-type-2"
              checked={filters.jobType.includes('경력')}
              onCheckedChange={(checked) => 
                handleJobTypeChange('경력', checked as boolean)
              }
            />
            <label htmlFor="job-type-2" className="text-sm cursor-pointer">
              경력
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="only-applicable" className="text-sm cursor-pointer">
            지원 가능한 채용만 보기
          </Label>
          <Switch 
            id="only-applicable"
            checked={filters.onlyApplicable}
            onCheckedChange={handleOnlyApplicableChange}
            className={filters.onlyApplicable ? "bg-primary" : ""}
          />
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <Label htmlFor="hide-expired" className="text-sm cursor-pointer">
            마감일 지난 공고 제외
          </Label>
          <Switch 
            id="hide-expired"
            checked={localHideExpired}
            onCheckedChange={handleHideExpiredChange}
            className={localHideExpired ? "bg-primary" : ""}
          />
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mt-4" 
        onClick={handleResetFilters}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        필터 초기화
      </Button>
    </ScrollArea>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
      {/* Desktop Filter Panel - Always visible */}
      {!isMobile && (
        <div className="md:col-span-3">
          <Card className="sticky top-4">
            <CardContent className="pt-6 pb-6 px-5">
              <div className="flex justify-between items-center mb-0">
                <h3 className="font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  필터 옵션
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
                  )}
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={handleResetFilters}
                        disabled={activeFilterCount === 0}
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span className="sr-only">필터 초기화</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>필터 초기화</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {renderFiltersContent()}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Job List Container - Always use 9 columns on desktop */}
      <div className={`${isMobile ? 'col-span-1' : 'md:col-span-9'}`}>
        {jobs.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium mb-2">추천 채용정보가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              '추천 채용 정보 가져오기' 버튼을 클릭하여 새로운 채용정보를 불러오세요.
            </p>
            <Button onClick={() => onUpdateFilters({ ...filters, keyword: '' })}>
              모든 채용정보 보기
            </Button>
          </div>
        ) : (
          <JobList 
            jobs={filteredJobs as JobListJob[]} 
            isLoading={false} 
            hideExpired={localHideExpired}
            onToggleHideExpired={handleHideExpiredChange}
            onOpenFilters={isMobile ? handleOpenDrawer : undefined}
          />
        )}

        {/* Job count summary */}
        {jobs.length > 0 && filteredJobs.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground flex items-center justify-between">
            <div>
              전체 <span className="font-medium">{jobs.length}</span>개 중{' '}
              <span className="font-medium">{filteredJobs.length}</span>개 표시됨
            </div>
            <div className="flex items-center">
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  필터 초기화
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {isMobile && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="px-0 pb-0">
            <DrawerHeader className="text-left px-6 pb-0 flex items-center justify-between">
              <div>
                <DrawerTitle>필터 옵션</DrawerTitle>
                <DrawerDescription>
                  원하는 채용 정보를 찾아보세요
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 align-middle">{activeFilterCount}</Badge>
                  )}
                </DrawerDescription>
              </div>
              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-2.5"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  초기화
                </Button>
              )}
            </DrawerHeader>
            {renderFiltersContent()}
            <DrawerFooter className="pt-2 px-6 flex flex-row gap-3">
              <Button 
                className="flex-1" 
                onClick={() => {
                  setDrawerOpen(false);
                }}
              >
                적용 ({filteredJobs.length})
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">취소</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default JobsTab;
