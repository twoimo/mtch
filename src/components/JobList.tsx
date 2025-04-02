
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import JobCard from './JobCard';
import { ArrowUp, ArrowDownUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
}

interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
}

// 스크롤 위치를 로컬 스토리지에 저장/복원하기 위한 키
const SCROLL_POSITION_KEY = 'job-list-scroll-position';

// 채용 정보 목록을 표시하는 컴포넌트
const JobList: React.FC<JobListProps> = ({ jobs, isLoading = false }) => {
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortOrder, setSortOrder] = useState<'score' | 'apply'>(() => {
    // 로컬 스토리지에서 정렬 설정 복원
    const savedSort = localStorage.getItem('job-list-sort-order');
    return (savedSort as 'score' | 'apply') || 'score';
  });
  const loaderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 15; // 성능을 위해 항목 수 증가
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollTop = useRef(0);

  // 디바운스 함수
  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    wait: number
  ): ((...args: Parameters<F>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return (...args: Parameters<F>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // 정렬 함수 - useMemo 사용하여 계산 최적화
  const sortJobs = useCallback((jobsToSort: Job[], order: 'score' | 'apply') => {
    if (order === 'score') {
      return [...jobsToSort].sort((a, b) => b.score - a.score);
    } else {
      return [...jobsToSort].sort((a, b) => {
        if (a.apply_yn !== b.apply_yn) {
          return b.apply_yn - a.apply_yn; // 지원 가능한 것을 먼저
        }
        return b.score - a.score; // 동점이면 점수로 정렬
      });
    }
  }, []);

  // 전체 정렬된 작업 목록 계산 - useMemo로 최적화
  const sortedAllJobs = useMemo(() => sortJobs(jobs, sortOrder), [jobs, sortOrder, sortJobs]);

  // jobs prop이 변경될 때 실행
  useEffect(() => {
    if (isInitialLoad && jobs.length > 0) {
      // 마지막 스크롤 위치 복원
      const savedScrollPosition = localStorage.getItem(SCROLL_POSITION_KEY);
      if (savedScrollPosition) {
        const position = parseInt(savedScrollPosition, 10);
        const sortedJobs = sortJobs(jobs, sortOrder);
        
        // 충분한 항목을 로드하여 이전 스크롤 위치를 복원
        const itemsToLoad = Math.ceil(position / 100) * itemsPerPage;
        const pageToLoad = Math.ceil(itemsToLoad / itemsPerPage);
        
        setPage(pageToLoad);
        setDisplayedJobs(sortedJobs.slice(0, pageToLoad * itemsPerPage));
        
        // 비동기적으로 스크롤 위치 복원
        setTimeout(() => {
          window.scrollTo(0, position);
        }, 100);
      } else {
        // 초기 로드
        setDisplayedJobs(sortedAllJobs.slice(0, itemsPerPage));
      }
      
      setIsInitialLoad(false);
    } else if (jobs.length > 0) {
      // 새 데이터가 로드된 경우 처음부터 표시
      setDisplayedJobs(sortedAllJobs.slice(0, itemsPerPage));
      setPage(1);
      window.scrollTo(0, 0);
    } else {
      setDisplayedJobs([]);
    }
    
    // 언마운트 시 스크롤 위치 저장
    return () => {
      if (jobs.length > 0) {
        localStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
      }
    };
  }, [jobs, sortedAllJobs, sortOrder, isInitialLoad, sortJobs]);

  // 정렬 순서가 변경될 때 실행
  useEffect(() => {
    if (jobs.length > 0) {
      const sorted = sortJobs(jobs, sortOrder);
      setDisplayedJobs(sorted.slice(0, page * itemsPerPage));
      
      // 정렬 설정 저장
      localStorage.setItem('job-list-sort-order', sortOrder);
    }
  }, [sortOrder, page, jobs, sortJobs]);

  // 추가 데이터 로드 함수 - useCallback으로 메모이제이션
  const loadMoreJobs = useCallback(() => {
    if (jobs.length === 0 || isLoading) return;
    
    const nextPage = page + 1;
    const endIndex = nextPage * itemsPerPage;
    
    if (endIndex <= sortedAllJobs.length) {
      setDisplayedJobs(sortedAllJobs.slice(0, endIndex));
      setPage(nextPage);
    }
  }, [jobs.length, isLoading, page, itemsPerPage, sortedAllJobs]);

  // 무한 스크롤 관찰자 설정
  useEffect(() => {
    if (!loaderRef.current || isLoading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && scrollDirection === 'down') {
          loadMoreJobs();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loaderRef.current);
    
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMoreJobs, isLoading, scrollDirection]);

  // 스크롤 위치 및 방향 감지
  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollTop = window.scrollY;
      
      // 스크롤 방향 감지
      if (scrollTop > lastScrollTop.current) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      lastScrollTop.current = scrollTop;
      
      // 스크롤 위치에 따라 상단으로 이동 버튼 표시/숨김
      setShowScrollTop(scrollTop > 300);
      
      // 스크롤 위치 저장
      localStorage.setItem(SCROLL_POSITION_KEY, scrollTop.toString());
    }, 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 정렬 순서 변경
  const handleSortChange = (value: string) => {
    setSortOrder(value as 'score' | 'apply');
  };

  // 로딩 중인 경우 스켈레톤 UI 표시 - 최적화된 렌더링
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1">
        {Array(3).fill(0).map((_, index) => (
          <Card key={index} className="mb-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-20 w-full mb-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-lg">표시할 채용 정보가 없습니다.</div>
        <div className="text-gray-400 text-sm mt-2">새로운 추천 채용 정보를 가져오려면 '추천 채용 정보 가져오기' 버튼을 클릭하세요.</div>
      </div>
    );
  }

  return (
    <div className="relative" ref={listRef}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">
          총 <span className="text-blue-600">{jobs.length}</span>개의 추천 채용정보
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            <ArrowDownUp className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm text-gray-600">정렬:</span>
          </div>
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">매칭 점수순</SelectItem>
              <SelectItem value="apply">지원 가능 우선</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {displayedJobs.map((job, index) => (
          <div 
            key={job.id} 
            className={`transition-all duration-300 ${
              index >= (page - 1) * itemsPerPage ? 'opacity-0 animate-fade-in' : ''
            }`}
            style={{ 
              animationDelay: `${Math.min(index % itemsPerPage * 0.05, 0.5)}s`, 
              animationFillMode: 'forwards',
              willChange: 'opacity, transform' // 성능 최적화
            }}
          >
            <JobCard job={job} />
          </div>
        ))}
      </div>
      
      {/* 더 로드하기 위한 관찰자 요소 - 최적화된 표시 로직 */}
      {displayedJobs.length < jobs.length && (
        <div 
          ref={loaderRef} 
          className="w-full h-20 flex items-center justify-center my-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* 페이지 상단으로 이동 버튼 - 최적화된 렌더링 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 z-50"
          aria-label="페이지 상단으로 이동"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      
      {/* 로드된 항목 수 표시 */}
      <div className="text-center text-sm text-gray-500 mt-4">
        {displayedJobs.length}개 표시 중 (총 {jobs.length}개)
      </div>
    </div>
  );
};

export default React.memo(JobList); // 메모이제이션으로 불필요한 리렌더링 방지
