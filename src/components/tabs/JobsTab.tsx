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
import { Filter, ArrowDownAZ, ArrowDownZA, Star, MapPin, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface JobsTabProps {
  jobs: any[];
}

const ITEMS_PER_PAGE = 10;

const JobsTab: React.FC<JobsTabProps> = ({ jobs }) => {
  const isMobile = useIsMobile();
  const [displayedJobs, setDisplayedJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [onlyApplicable, setOnlyApplicable] = useState(false);
  const [sortOrder, setSortOrder] = useState<'score' | 'name'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // 필터링된 회사 유형 옵션들을 얻기
  const companyTypeOptions = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    const types = [...new Set(jobs.map(job => job.companyType))];
    return types.filter(type => type).sort();
  }, [jobs]);
  
  const loadMoreRef = useRef(null);
  
  // 필터링 로직
  useEffect(() => {
    if (!jobs || jobs.length === 0) {
      setFilteredJobs([]);
      setDisplayedJobs([]);
      return;
    }
    
    let result = [...jobs];
    
    // 검색어 필터링
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.jobTitle.toLowerCase().includes(term) || 
        job.companyName.toLowerCase().includes(term) ||
        job.jobLocation.toLowerCase().includes(term)
      );
    }
    
    // 회사 유형 필터링
    if (companyType && companyType !== 'all') {
      result = result.filter(job => job.companyType === companyType);
    }
    
    // 최소 점수 필터링
    if (minScore > 0) {
      result = result.filter(job => job.score >= minScore);
    }
    
    // 지원 가능 여부 필터링
    if (onlyApplicable) {
      result = result.filter(job => job.apply_yn === 1);
    }
    
    // 정렬
    result = sortJobs(result, sortOrder, sortDirection);
    
    setFilteredJobs(result);
    setCurrentPage(1);
    setDisplayedJobs(result.slice(0, ITEMS_PER_PAGE));
    
  }, [jobs, searchTerm, companyType, minScore, onlyApplicable, sortOrder, sortDirection]);
  
  // 정렬 함수
  const sortJobs = (jobsToSort: any[], order: 'score' | 'name', direction: 'asc' | 'desc') => {
    return [...jobsToSort].sort((a, b) => {
      let comparison = 0;
      
      if (order === 'score') {
        comparison = a.score - b.score;
      } else {
        comparison = a.companyName.localeCompare(b.companyName);
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });
  };
  
  // 더 많은 직업 로드하기
  const loadMoreJobs = useCallback(() => {
    if (loading || displayedJobs.length >= filteredJobs.length) return;
    
    setLoading(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      
      setDisplayedJobs(filteredJobs.slice(startIndex, endIndex));
      setCurrentPage(nextPage);
      setLoading(false);
    }, 500); // 로딩 효과를 위한 지연
  }, [currentPage, displayedJobs.length, filteredJobs, loading]);
  
  // 무한 스크롤을 위한 IntersectionObserver 설정
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
  
  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setCompanyType('all');
    setMinScore(0);
    setOnlyApplicable(false);
    setSortOrder('score');
    setSortDirection('desc');
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
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
      {/* 필터 영역 */}
      <div className="bg-card border rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Filter className="w-5 h-5 mr-2" /> 필터 옵션
          </h3>
          <Button variant="outline" size="sm" onClick={resetFilters}>초기화</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 검색어 */}
          <div className="space-y-2">
            <Label htmlFor="search">검색어</Label>
            <Input 
              id="search" 
              placeholder="직무, 회사명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* 회사 유형 */}
          <div className="space-y-2">
            <Label htmlFor="company-type">회사 유형</Label>
            <Select 
              value={companyType} 
              onValueChange={setCompanyType}
            >
              <SelectTrigger id="company-type">
                <SelectValue placeholder="회사 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {companyTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 최소 점수 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="min-score">최소 매칭 점수: {minScore}</Label>
            </div>
            <Slider 
              id="min-score"
              min={0}
              max={100}
              step={5}
              value={[minScore]}
              onValueChange={(values) => setMinScore(values[0])}
            />
          </div>
          
          {/* 지원 가능 여부 */}
          <div className="space-y-2 flex flex-col justify-end">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="only-applicable">지원 가능한 공고만 보기</Label>
              <Switch 
                id="only-applicable" 
                checked={onlyApplicable}
                onCheckedChange={setOnlyApplicable}
              />
            </div>
          </div>
        </div>
        
        {/* 정렬 옵션 */}
        <div className="flex justify-end items-center mt-4 space-x-2">
          <Label>정렬:</Label>
          <Select 
            value={sortOrder} 
            onValueChange={(value) => setSortOrder(value as 'score' | 'name')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  매칭 점수
                </div>
              </SelectItem>
              <SelectItem value="name">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  회사명
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSortDirection}
            className="flex items-center justify-center"
          >
            {sortDirection === 'desc' ? (
              <ArrowDownAZ className="h-4 w-4" />
            ) : (
              <ArrowDownZA className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* 필터 결과 정보 */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          총 <span className="font-medium text-foreground">{filteredJobs.length}</span>개 중 
          <span className="font-medium text-foreground"> {displayedJobs.length}</span>개 표시 중
        </p>
      </div>
      
      {/* 채용 정보 목록 */}
      <div className="w-full grid grid-cols-1 gap-4">
        {displayedJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        
        {/* 로딩 표시기 */}
        {loading && (
          <div className="mt-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="w-full h-32 animate-pulse bg-muted/20" />
            ))}
          </div>
        )}
        
        {/* 더 로드할 항목이 있는지 확인하는 참조 요소 */}
        {filteredJobs.length > displayedJobs.length && (
          <div ref={loadMoreRef} className="h-4" />
        )}
      </div>
      
      {/* 더 이상 표시할 항목이 없는 경우 메시지 */}
      {filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-border/40">
          <p className="text-muted-foreground text-center">
            필터 조건에 맞는 채용 정보가 없습니다.
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
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
