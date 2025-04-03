import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterData {
  keyword: string;
  minScore: number;
  employmentType: string[];
  companyType: string;
  jobType: string[];
  salaryRange: string;
  onlyApplicable: boolean;
}

interface MobileSearchSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterData;
  onUpdateFilters: (filters: Partial<FilterData>) => void;
  onResetFilters: () => void;
  onSearch: () => void;
  className?: string;
}

export const MobileSearchSheet: React.FC<MobileSearchSheetProps> = ({
  isOpen,
  onOpenChange,
  filters,
  onUpdateFilters,
  onResetFilters,
  onSearch,
  className
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterData>({ ...filters });
  
  // 로컬 필터 상태 업데이트
  const updateLocalFilters = (partialFilters: Partial<FilterData>) => {
    setLocalFilters(prev => ({
      ...prev,
      ...partialFilters
    }));
  };
  
  // 필터 적용
  const handleApplyFilters = () => {
    onUpdateFilters(localFilters);
    onSearch();
    onOpenChange(false);
  };
  
  // 필터 초기화
  const handleResetFilters = () => {
    onResetFilters();
    setLocalFilters({
      keyword: '',
      minScore: 0,
      employmentType: [],
      companyType: 'all',
      jobType: [],
      salaryRange: 'all',
      onlyApplicable: false
    });
  };
  
  // 시트가 열릴 때 현재 필터 상태로 초기화
  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters({ ...filters });
    }
  }, [isOpen, filters]);
  
  // 직무 유형 옵션
  const jobTypeOptions = [
    { id: 'newbie', label: '신입' },
    { id: 'experienced', label: '경력' },
    { id: 'any', label: '경력무관' },
  ];
  
  // 고용 형태 옵션
  const employmentTypeOptions = [
    { id: 'regular', label: '정규직' },
    { id: 'contract', label: '계약직' },
    { id: 'intern', label: '인턴' },
  ];
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className={cn("h-[90vh] max-h-[90vh] rounded-t-[20px]", className)}
      >
        <div className="sheet-handle" />
        
        <SheetHeader className="space-y-1 pb-4">
          <SheetTitle className="text-xl">검색 필터</SheetTitle>
          <SheetDescription>
            원하는 채용 정보를 검색하고 필터링하세요
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 py-4 overflow-y-auto h-[calc(90vh-130px)]">
          {/* 키워드 검색 */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="키워드 검색 (제목, 회사명, 위치)"
                className="pl-9"
                value={localFilters.keyword}
                onChange={(e) => updateLocalFilters({ keyword: e.target.value })}
              />
              {localFilters.keyword && (
                <button 
                  className="absolute right-2 top-2 p-1 rounded-full bg-muted hover:bg-muted/70"
                  onClick={() => updateLocalFilters({ keyword: '' })}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* 기본 필터 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">매칭 점수</Label>
              <Badge variant="outline" className="font-mono">
                {localFilters.minScore}점 이상
              </Badge>
            </div>
            
            <Slider
              defaultValue={[localFilters.minScore]}
              value={[localFilters.minScore]}
              onValueChange={(value) => updateLocalFilters({ minScore: value[0] })}
              max={100}
              step={5}
              showTooltip
              formatTooltip={(value) => `${value}점`}
              className="py-4"
            />
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="onlyApplicable"
                checked={localFilters.onlyApplicable}
                onCheckedChange={(checked) => 
                  updateLocalFilters({ onlyApplicable: checked as boolean })
                }
              />
              <Label htmlFor="onlyApplicable">지원 가능한 채용공고만 표시</Label>
            </div>
          </div>
          
          {/* 고급 필터 토글 */}
          <Button 
            variant="outline" 
            className="w-full flex justify-between"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <span className="flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              고급 필터 {showAdvancedFilters ? '접기' : '펼치기'}
            </span>
            <Badge variant="secondary">
              {
                Object.entries(localFilters)
                  .filter(([key, value]) => {
                    if (key === 'employmentType' && Array.isArray(value)) return value.length > 0;
                    if (key === 'jobType' && Array.isArray(value)) return value.length > 0;
                    if (key === 'companyType') return value !== 'all';
                    if (key === 'salaryRange') return value !== 'all';
                    return false;
                  })
                  .length
              }
            </Badge>
          </Button>
          
          {/* 고급 필터 옵션 */}
          {showAdvancedFilters && (
            <div className="space-y-5 pt-2">
              {/* 고용 형태 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">고용 형태</Label>
                <div className="flex flex-wrap gap-2">
                  {employmentTypeOptions.map(option => (
                    <Badge
                      key={option.id}
                      variant={localFilters.employmentType.includes(option.id) ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => {
                        const newTypes = localFilters.employmentType.includes(option.id)
                          ? localFilters.employmentType.filter(t => t !== option.id)
                          : [...localFilters.employmentType, option.id];
                        updateLocalFilters({ employmentType: newTypes });
                      }}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* 경력 조건 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">경력 조건</Label>
                <div className="flex flex-wrap gap-2">
                  {jobTypeOptions.map(option => (
                    <Badge
                      key={option.id}
                      variant={localFilters.jobType.includes(option.id) ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => {
                        const newTypes = localFilters.jobType.includes(option.id)
                          ? localFilters.jobType.filter(t => t !== option.id)
                          : [...localFilters.jobType, option.id];
                        updateLocalFilters({ jobType: newTypes });
                      }}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* 회사 유형 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">회사 유형</Label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'startup', 'sme', 'large', 'foreign'].map(type => (
                    <Badge
                      key={type}
                      variant={localFilters.companyType === type ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => updateLocalFilters({ companyType: type })}
                    >
                      {type === 'all' && '전체'}
                      {type === 'startup' && '스타트업'}
                      {type === 'sme' && '중소기업'}
                      {type === 'large' && '대기업'}
                      {type === 'foreign' && '외국계'}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* 연봉 범위 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">연봉 범위</Label>
                <div className="flex flex-wrap gap-2">
                  {['all', '0-3000', '3000-5000', '5000-7000', '7000-9000', '9000+'].map(range => (
                    <Badge
                      key={range}
                      variant={localFilters.salaryRange === range ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => updateLocalFilters({ salaryRange: range })}
                    >
                      {range === 'all' && '전체'}
                      {range === '0-3000' && '~ 3천만원'}
                      {range === '3000-5000' && '3천만원 ~ 5천만원'}
                      {range === '5000-7000' && '5천만원 ~ 7천만원'}
                      {range === '7000-9000' && '7천만원 ~ 9천만원'}
                      {range === '9000+' && '9천만원 이상'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 하단 버튼 */}
        <div className="flex gap-3 pt-5 pb-2 border-t sticky bottom-0 bg-background">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={handleResetFilters}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            초기화
          </Button>
          <Button 
            className="flex-1"
            onClick={handleApplyFilters}
          >
            <Search className="mr-2 h-4 w-4" />
            검색 적용하기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSearchSheet;
