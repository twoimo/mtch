
import React, { useState, useEffect, useRef, useCallback } from 'react';
import JobCard from '@/components/JobCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { 
  Filter, ArrowDownAZ, ArrowDownZA, Star, MapPin,
  LayoutList, Grid2X2, ChevronDown, ChevronUp, Search,
  SlidersHorizontal, X, Settings, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { JobFilters } from '@/hooks/useApiActions';

interface Job {
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
  matchScore?: number;
  isApplied?: number;
  isRecommended?: number;
  jobType?: string;
  jobSalary?: string;
  employmentType?: string;
  createdAt?: string;
  isGptChecked?: number;
}

interface JobsTabProps {
  jobs: Job[];
  filteredJobs: Job[];
  filters: JobFilters;
  onUpdateFilters: (filters: Partial<JobFilters>) => void;
  onResetFilters: () => void;
}

interface CompanyCategory {
  label: string;
  value: string;
  types: string[];
}

const COMPANY_CATEGORIES: CompanyCategory[] = [
  {
    label: "대기업",
    value: "large",
    types: [
      "대기업", "대기업 계열사", "상장기업", "외국계기업", "금융기업"
    ]
  },
  {
    label: "중견기업",
    value: "medium",
    types: [
      "중견기업", "중견", "준대기업"
    ]
  },
  {
    label: "중소기업",
    value: "small",
    types: [
      "중소기업", "소기업", "스타트업", "벤처기업"
    ]
  },
  {
    label: "공공기관",
    value: "public",
    types: [
      "공기업", "공공기관", "정부기관", "비영리기관", "협회"
    ]
  }
];

const EMPLOYMENT_TYPES = [
  { value: "정규직", label: "정규직" },
  { value: "계약직", label: "계약직" },
  { value: "인턴", label: "인턴" },
  { value: "파견직", label: "파견직" },
  { value: "프리랜서", label: "프리랜서" },
  { value: "아르바이트", label: "아르바이트" },
];

const JOB_TYPES = [
  { value: "경력", label: "경력" },
  { value: "신입", label: "신입" },
  { value: "경력무관", label: "경력무관" },
  { value: "인턴", label: "인턴" },
];

const SALARY_RANGES = [
  { value: "all", label: "전체" },
  { value: "high", label: "상위 급여" },
  { value: "medium", label: "중간 급여" },
  { value: "low", label: "하위 급여" },
];

const ITEMS_PER_PAGE = 10;

const LAYOUT_STORAGE_KEY = 'job-grid-layout-preference';
const FILTER_EXPANDED_KEY = 'job-filter-expanded';

const JobsTab: React.FC<JobsTabProps> = ({ 
  jobs = [],
  filteredJobs = [],
  filters,
  onUpdateFilters,
  onResetFilters 
}) => {
  const isMobile = useIsMobile();
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(() => {
    const savedState = localStorage.getItem(FILTER_EXPANDED_KEY);
    return savedState === null ? true : savedState === 'true';
  });

  const [gridLayout, setGridLayout] = useState<'single' | 'double'>(() => {
    const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return (savedLayout === 'single') ? 'single' : 'double';
  });

  const [sortOrder, setSortOrder] = useState<'score' | 'name'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Ensure filters always has valid values, especially arrays
  const safeFilters = {
    keyword: filters?.keyword || '',
    minScore: filters?.minScore || 0,
    employmentType: Array.isArray(filters?.employmentType) ? filters.employmentType : [],
    companyType: filters?.companyType || 'all',
    jobType: Array.isArray(filters?.jobType) ? filters.jobType : [],
    salaryRange: filters?.salaryRange || 'all',
    onlyApplicable: filters?.onlyApplicable || false
  };

  const toggleGridLayout = useCallback(() => {
    const newLayout = gridLayout === 'single' ? 'double' : 'single';
    setGridLayout(newLayout);
    localStorage.setItem(LAYOUT_STORAGE_KEY, newLayout);
  }, [gridLayout]);

  useEffect(() => {
    localStorage.setItem(FILTER_EXPANDED_KEY, isFilterExpanded.toString());
  }, [isFilterExpanded]);

  useEffect(() => {
    if (!filteredJobs || filteredJobs.length === 0) {
      setDisplayedJobs([]);
      setCurrentPage(1);
      return;
    }

    const sortedJobs = sortJobs(filteredJobs, sortOrder, sortDirection);
    setDisplayedJobs(sortedJobs.slice(0, ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [filteredJobs, sortOrder, sortDirection]);

  // 단축키 이벤트 리스너 - 검색창에 포커스(/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // '/' 키를 누르고 input, textarea 등에 포커스가 없을 때만 검색창에 포커스
      if (e.key === '/' && 
          !['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement?.tagName || '').toUpperCase())) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // ESC 키로 검색창 포커스 해제
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortJobs = (jobsToSort: Job[] = [], order: 'score' | 'name', direction: 'asc' | 'desc'): Job[] => {
    if (!jobsToSort || !Array.isArray(jobsToSort)) return [];
    
    return [...jobsToSort].sort((a, b) => {
      let comparison = 0;

      if (order === 'score') {
        const scoreA = a.score || a.matchScore || 0;
        const scoreB = b.score || b.matchScore || 0;
        comparison = scoreA - scoreB;
      } else {
        comparison = a.companyName.localeCompare(b.companyName);
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  };

  const loadMoreJobs = useCallback(() => {
    if (loading || displayedJobs.length >= filteredJobs.length) return;

    setLoading(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * ITEMS_PER_PAGE;

      const sortedJobs = sortJobs(filteredJobs, sortOrder, sortDirection);
      setDisplayedJobs(sortedJobs.slice(startIndex, endIndex));
      setCurrentPage(nextPage);
      setLoading(false);
    }, 300);
  }, [currentPage, displayedJobs.length, filteredJobs, loading, sortOrder, sortDirection]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [loadMoreJobs, loading]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleFilterChange = (key: keyof JobFilters, value: string | number | boolean | string[]) => {
    onUpdateFilters({ [key]: value });
  };

  const handleMultiSelectChange = (key: keyof JobFilters, value: string, checked: boolean) => {
    // Ensure we're working with an array
    const currentValues = Array.isArray(safeFilters[key]) ? safeFilters[key] as string[] : [];
    let newValues: string[];

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    onUpdateFilters({ [key]: newValues });
  };

  const handleSearchClear = () => {
    handleFilterChange('keyword', '');
    // 검색창 포커스 유지
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (safeFilters.keyword) count++;
    if (safeFilters.minScore > 0) count++;
    if (safeFilters.employmentType && safeFilters.employmentType.length > 0) count++;
    if (safeFilters.companyType !== 'all') count++;
    if (safeFilters.jobType && safeFilters.jobType.length > 0) count++;
    if (safeFilters.salaryRange !== 'all') count++;
    if (safeFilters.onlyApplicable) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-border/40">
        <p className="text-muted-foreground text-center">
          추천 채용정보가 없습니다. '추천 채용 정보 조회' 버튼을 눌러 채용정보를 불러오세요.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Collapsible open={isFilterExpanded} onOpenChange={setIsFilterExpanded}>
        <Card className="border border-border/60 shadow-sm bg-card/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md overflow-hidden">
          <CardHeader className="py-3 flex flex-row items-center justify-between space-x-0 border-b border-border/20">
            <CardTitle className="text-xl flex items-center space-x-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <span>필터 옵션</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary/10 transition-all duration-300 animate-in fade-in slide-in-from-left-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onResetFilters}
                  className="gap-1.5 text-xs font-normal h-8 transition-all duration-150 hover:bg-destructive/10"
                >
                  <X className="h-3.5 w-3.5" />
                  초기화
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="h-8 w-8 p-0"
                >
                  {isFilterExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isFilterExpanded ? "필터 접기" : "필터 펼치기"}
                  </span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="pb-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="search" 
                    className={cn(
                      "flex items-center gap-1.5 transition-colors duration-200",
                      isSearchFocused ? "text-primary" : "text-foreground"
                    )}
                  >
                    <Search className={cn(
                      "h-3.5 w-3.5 transition-colors duration-200",
                      isSearchFocused ? "text-primary" : "text-muted-foreground"
                    )} />
                    검색어 <span className="text-muted-foreground text-xs ml-1">(단축키: /)</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      id="search" 
                      ref={searchInputRef}
                      placeholder="직무, 회사명, 지역 검색..."
                      value={safeFilters.keyword}
                      onChange={(e) => handleFilterChange('keyword', e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className={cn(
                        "pl-8 pr-8 transition-all duration-200",
                        isSearchFocused ? "border-primary ring-1 ring-primary/20" : ""
                      )}
                    />
                    <Search className={cn(
                      "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-70 transition-colors duration-200",
                      isSearchFocused ? "text-primary" : ""
                    )} />
                    
                    {safeFilters.keyword && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleSearchClear}
                        className="absolute right-1 top-1 h-7 w-7 opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">검색어 지우기</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-category" className="flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    회사 유형
                  </Label>
                  <Select 
                    value={safeFilters.companyType} 
                    onValueChange={(value) => handleFilterChange('companyType', value)}
                  >
                    <SelectTrigger id="company-category" className="transition-all duration-200 hover:border-primary/50">
                      <SelectValue placeholder="회사 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {COMPANY_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">기타 기업</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="min-score" className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-muted-foreground" />
                      최소 매칭 점수
                      <span className={cn(
                        "ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium transition-colors duration-200",
                        safeFilters.minScore > 0 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {safeFilters.minScore}점
                      </span>
                    </Label>
                  </div>
                  <Slider 
                    id="min-score"
                    min={0}
                    max={100}
                    step={5}
                    value={[safeFilters.minScore]}
                    onValueChange={(values) => handleFilterChange('minScore', values[0])}
                    className="py-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    고용 형태
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-between transition-all duration-200 hover:border-primary/50",
                          safeFilters.employmentType && safeFilters.employmentType.length > 0 
                            ? "border-primary/50 text-foreground font-medium" 
                            : "text-muted-foreground"
                        )}
                      >
                        {safeFilters.employmentType && safeFilters.employmentType.length > 0 
                          ? `${safeFilters.employmentType.length}개 선택됨` 
                          : "고용 형태 선택"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="고용 형태 검색..." />
                        <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {EMPLOYMENT_TYPES.map((type) => {
                            const isSelected = Array.isArray(safeFilters.employmentType) && 
                                            safeFilters.employmentType.includes(type.value);
                            return (
                              <CommandItem
                                key={type.value}
                                onSelect={() => {
                                  handleMultiSelectChange('employmentType', type.value, !isSelected);
                                }}
                                className="flex items-center gap-2 aria-selected:bg-primary/10"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <Checkbox 
                                    id={`employment-${type.value}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      handleMultiSelectChange('employmentType', type.value, !!checked);
                                    }}
                                    className={cn(
                                      isSelected ? "border-primary" : "border-muted-foreground"
                                    )}
                                    aria-labelledby={`employment-label-${type.value}`}
                                  />
                                  <label 
                                    id={`employment-label-${type.value}`}
                                    htmlFor={`employment-${type.value}`}
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    {type.label}
                                  </label>
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    직무 유형
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-between transition-all duration-200 hover:border-primary/50",
                          safeFilters.jobType && safeFilters.jobType.length > 0 
                            ? "border-primary/50 text-foreground font-medium" 
                            : "text-muted-foreground"
                        )}
                      >
                        {safeFilters.jobType && safeFilters.jobType.length > 0 
                          ? `${safeFilters.jobType.length}개 선택됨` 
                          : "직무 유형 선택"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="직무 유형 검색..." />
                        <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {JOB_TYPES.map((type) => {
                            const isSelected = Array.isArray(safeFilters.jobType) && 
                                            safeFilters.jobType.includes(type.value);
                            return (
                              <CommandItem
                                key={type.value}
                                onSelect={() => {
                                  handleMultiSelectChange('jobType', type.value, !isSelected);
                                }}
                                className="flex items-center gap-2 aria-selected:bg-primary/10"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <Checkbox 
                                    id={`job-type-${type.value}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      handleMultiSelectChange('jobType', type.value, !!checked);
                                    }}
                                    className={cn(
                                      isSelected ? "border-primary" : "border-muted-foreground"
                                    )}
                                    aria-labelledby={`job-type-label-${type.value}`}
                                  />
                                  <label 
                                    id={`job-type-label-${type.value}`}
                                    htmlFor={`job-type-${type.value}`}
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    {type.label}
                                  </label>
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center justify-between space-x-2 h-10">
                    <Label htmlFor="only-applicable" className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-muted-foreground" />
                      지원 가능한 공고만 보기
                    </Label>
                    <Switch 
                      id="only-applicable" 
                      checked={safeFilters.onlyApplicable}
                      onCheckedChange={(checked) => handleFilterChange('onlyApplicable', checked)}
                      className={safeFilters.onlyApplicable ? "bg-primary" : ""}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        
          <CardContent className="py-3 border-t border-border/30 mt-0 bg-muted/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Label className="text-sm text-muted-foreground">레이아웃:</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleGridLayout}
                        className="flex items-center gap-1 h-8 bg-background transition-all duration-200"
                      >
                        {gridLayout === 'single' ? (
                          <>
                            <LayoutList className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline text-xs">1열 보기</span>
                          </>
                        ) : (
                          <>
                            <Grid2X2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline text-xs">2열 보기</span>
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{gridLayout === 'single' ? '2열 그리드로 변경' : '1열 목록으로 변경'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label className="text-sm text-muted-foreground">정렬:</Label>
                <Select 
                  value={sortOrder} 
                  onValueChange={(value) => setSortOrder(value as 'score' | 'name')}
                >
                  <SelectTrigger className="w-[130px] h-8 bg-background transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">
                      <div className="flex items-center">
                        <Star className="w-3.5 h-3.5 mr-2" />
                        매칭 점수
                      </div>
                    </SelectItem>
                    <SelectItem value="name">
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-2" />
                        회사명
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={toggleSortDirection}
                  className="flex items-center justify-center h-8 w-8 bg-background transition-all duration-200"
                >
                  {sortDirection === 'desc' ? (
                    <ArrowDownAZ className="h-4 w-4" />
                  ) : (
                    <ArrowDownZA className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Collapsible>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          총 <span className="font-medium text-foreground">{filteredJobs.length}</span>개 중 
          <span className="font-medium text-foreground"> {displayedJobs.length}</span>개 표시 중
        </p>
        
        <div className="flex flex-wrap gap-1.5 justify-end">
          {safeFilters.keyword && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs py-0.5 h-6 group animate-in fade-in slide-in-from-right-1">
              <span>검색: {safeFilters.keyword}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1 opacity-70 hover:opacity-100" 
                onClick={() => handleFilterChange('keyword', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {safeFilters.companyType !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs py-0.5 h-6 animate-in fade-in slide-in-from-right-1">
              <span>
                {COMPANY_CATEGORIES.find(c => c.value === safeFilters.companyType)?.label || '기타'}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1 opacity-70 hover:opacity-100" 
                onClick={() => handleFilterChange('companyType', 'all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {safeFilters.minScore > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs py-0.5 h-6 animate-in fade-in slide-in-from-right-1">
              <span>점수: {safeFilters.minScore}+</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1 opacity-70 hover:opacity-100" 
                onClick={() => handleFilterChange('minScore', 0)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {safeFilters.onlyApplicable && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs py-0.5 h-6 animate-in fade-in slide-in-from-right-1">
              <span>지원가능만</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1 opacity-70 hover:opacity-100" 
                onClick={() => handleFilterChange('onlyApplicable', false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {safeFilters.employmentType && safeFilters.employmentType.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs py-0.5 h-6 animate-in fade-in slide-in-from-right-1">
              <span>고용형태: {safeFilters.employmentType.length}개</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1 opacity-70 hover:opacity-100" 
                onClick={() => handleFilterChange('employmentType', [])}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {safeFilters.jobType && safeFilters.jobType.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs py-0.5 h-6 animate-in fade-in slide-in-from-right-1">
              <span>직무: {safeFilters.jobType.length}개</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1 opacity-70 hover:opacity-100" 
                onClick={() => handleFilterChange('jobType', [])}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      </div>
      
      <div className={cn(
        "w-full grid gap-4",
        "grid-auto-rows-fr",
        gridLayout === 'single' 
          ? "grid-cols-1" 
          : isMobile 
            ? "grid-cols-1" 
            : "md:grid-cols-2"
      )}>
        {displayedJobs.map((job) => (
          <div key={job.id} className="h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <JobCard job={job} />
          </div>
        ))}
        
        {loading && (
          <div className={cn(
            "mt-4 space-y-4",
            gridLayout === 'single' ? "col-span-1" : "md:col-span-2"
          )}>
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="w-full h-32 animate-pulse bg-muted/20" />
            ))}
          </div>
        )}
        
        {filteredJobs.length > displayedJobs.length && (
          <div ref={loadMoreRef} className={cn(
            "h-4",
            gridLayout === 'single' ? "col-span-1" : "md:col-span-2"
          )} />
        )}
      </div>
      
      {filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-border/40">
          <p className="text-muted-foreground text-center">
            필터 조건에 맞는 채용 정보가 없습니다.
          </p>
          <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-2">
            필터 초기화
          </Button>
        </div>
      )}
      
      {filteredJobs.length > 0 && filteredJobs.length === displayedJobs.length && (
        <div className="text-center text-sm text-muted-foreground py-4">
          모든 채용 정보를 불러왔습니다.
        </div>
      )}
    </div>
  );
};

export default JobsTab;
