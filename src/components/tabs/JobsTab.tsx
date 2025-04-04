
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
import JobList from '@/components/JobList';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface JobsTabProps {
  jobs: any[];
  filteredJobs: any[];
  filters: {
    keyword: string;
    minScore: number;
    employmentType: string[];
    companyType: string;
    jobType: string[];
    salaryRange: string;
    onlyApplicable: boolean;
  };
  onUpdateFilters: (filters: any) => void;
  onResetFilters: () => void;
}

const JobsTab: React.FC<JobsTabProps> = ({ 
  jobs, filteredJobs, filters, onUpdateFilters, onResetFilters 
}) => {
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [filtersVisible, setFiltersVisible] = useState(!isMobile);
  const [hideExpired, setHideExpired] = useState(true);
  
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
    setHideExpired(checked);
    onToggleHideExpired(checked);
  };
  
  const toggleFilters = () => {
    if (isMobile) return;
    setFiltersVisible(!filtersVisible);
  };
  
  const handleResetFilters = () => {
    onResetFilters();
  };

  const handleToggleHideExpired = (hide: boolean) => {
    setHideExpired(hide);
  };
  
  const renderFiltersContent = () => (
    <div className={`space-y-4 ${isMobile ? 'px-4 py-4' : ''}`}>
      <div>
        <Label htmlFor="keyword" className="text-sm font-medium mb-1.5 block">
          키워드 검색
        </Label>
        <div className="relative">
          <Input
            id="keyword"
            placeholder="회사명, 포지션 등 검색"
            value={filters.keyword}
            onChange={handleKeywordChange}
            className="pr-8"
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
      
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <Label htmlFor="score" className="text-sm font-medium">
            최소 매칭 점수: {filters.minScore}점
          </Label>
        </div>
        <Slider
          id="score"
          min={0}
          max={100}
          step={5}
          value={[filters.minScore]}
          onValueChange={handleScoreChange}
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-1.5 block">고용 형태</Label>
        <div className="grid grid-cols-2 gap-2">
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
      
      <div>
        <Label className="text-sm font-medium mb-1.5 block">회사 유형</Label>
        <RadioGroup 
          value={filters.companyType} 
          onValueChange={handleCompanyTypeChange}
          className="grid grid-cols-2 gap-2"
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
      
      <div>
        <Label className="text-sm font-medium mb-1.5 block">경력 유형</Label>
        <div className="grid grid-cols-2 gap-2">
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
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="job-type-3"
              checked={filters.jobType.includes('경력무관')}
              onCheckedChange={(checked) => 
                handleJobTypeChange('경력무관', checked as boolean)
              }
            />
            <label htmlFor="job-type-3" className="text-sm cursor-pointer">
              경력무관
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="job-type-4"
              checked={filters.jobType.includes('인턴/계약')}
              onCheckedChange={(checked) => 
                handleJobTypeChange('인턴/계약', checked as boolean)
              }
            />
            <label htmlFor="job-type-4" className="text-sm cursor-pointer">
              인턴/계약
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="only-applicable"
            checked={filters.onlyApplicable}
            onCheckedChange={handleOnlyApplicableChange}
          />
          <Label htmlFor="only-applicable" className="text-sm cursor-pointer">
            지원 가능한 채용만 보기
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="hide-expired"
            checked={hideExpired}
            onCheckedChange={handleHideExpiredChange}
          />
          <Label htmlFor="hide-expired" className="text-sm cursor-pointer">
            마감일 지난 공고 제외
          </Label>
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
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {!isMobile && (
        <div className={`md:col-span-3 transition-all duration-300 ease-in-out ${filtersVisible ? 'opacity-100' : 'opacity-0 md:h-0 md:overflow-hidden md:my-0 md:py-0'}`}>
          <Card>
            <CardContent className="pt-6">
              {renderFiltersContent()}
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className={`${isMobile ? 'col-span-1' : filtersVisible ? 'md:col-span-9' : 'md:col-span-12'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            채용 정보 
            <span className="text-primary ml-1">
              {filteredJobs.length}
            </span>
          </h2>
          
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  필터
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle>필터 옵션</DrawerTitle>
                  <DrawerDescription>
                    원하는 채용 정보만 확인하세요
                  </DrawerDescription>
                </DrawerHeader>
                {renderFiltersContent()}
                <DrawerFooter className="pt-2">
                  <DrawerClose asChild>
                    <Button variant="outline">닫기</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFilters}
              className="gap-1"
            >
              {filtersVisible ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  필터 숨기기
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  필터 보기
                </>
              )}
            </Button>
          )}
        </div>
        
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
            jobs={filteredJobs} 
            isLoading={false} 
            hideExpired={hideExpired}
            onToggleHideExpired={handleToggleHideExpired}
          />
        )}
      </div>
    </div>
  );
};

export default JobsTab;
