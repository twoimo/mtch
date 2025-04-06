
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import JobCard from './JobCard';
import { ArrowUp, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
}

interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
  hideExpired?: boolean;
  onToggleHideExpired?: (hide: boolean) => void;
  title?: string;
  onOpenFilters?: () => void;
}

// Key for storing scroll position in localStorage
const SCROLL_POSITION_KEY = 'job-list-scroll-position';
const SORT_ORDER_KEY = 'job-list-sort-order';

// Component to display job listings
const JobList: React.FC<JobListProps> = ({ 
  jobs, 
  isLoading = false, 
  hideExpired = true, // Default to true
  onToggleHideExpired,
  title = '채용 정보',
  onOpenFilters
}) => {
  const isMobile = useIsMobile();
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortOrder, setSortOrder] = useState<'score' | 'apply' | 'deadline' | 'recent'>(() => {
    // Restore sort setting from localStorage
    const savedSort = localStorage.getItem(SORT_ORDER_KEY);
    return (savedSort as 'score' | 'apply' | 'deadline' | 'recent') || 'score';
  });
  
  // Add a new state to track filter active status for feedback
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);
  
  const loaderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 15; // Increased number of items for performance
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollTop = useRef(0);
  const [lastLoadedCount, setLastLoadedCount] = useState(itemsPerPage);

  // Debounce function with proper typing
  const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
    func: F,
    wait: number
  ): ((...args: Parameters<F>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return (...args: Parameters<F>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Function to check if a job is expired
  const isJobExpired = useCallback((job: Job): boolean => {
    if (!job.deadline) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let deadlineDate: Date;
    if (job.deadline.includes('.')) {
      const [year, month, day] = job.deadline.split('.').map(num => parseInt(num));
      deadlineDate = new Date(year, month - 1, day);
    } else {
      deadlineDate = new Date(job.deadline);
    }
    
    return deadlineDate < today;
  }, []);

  // Filter out expired jobs if hideExpired is true
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    
    // Filter jobs based on hideExpired setting
    let jobsToDisplay = [...jobs];
    if (hideExpired) {
      jobsToDisplay = jobs.filter(job => !isJobExpired(job));
    }
    
    setFilteredJobs(jobsToDisplay);
  }, [jobs, hideExpired, isJobExpired]);

  // Sort function - use memo to optimize calculation
  const sortJobs = useCallback((jobsToSort: Job[], order: 'score' | 'apply' | 'deadline' | 'recent') => {
    if (order === 'score') {
      return [...jobsToSort].sort((a, b) => b.score - a.score);
    } else if (order === 'apply') {
      return [...jobsToSort].sort((a, b) => {
        if (a.apply_yn !== b.apply_yn) {
          return b.apply_yn - a.apply_yn; // Show applicable jobs first
        }
        return b.score - a.score; // If same applicability, sort by score
      });
    } else if (order === 'deadline') {
      return [...jobsToSort].sort((a, b) => {
        // Process deadline dates for comparison
        const parseDate = (deadline?: string): Date => {
          if (!deadline) return new Date(9999, 11, 31); // Far future for items without deadline
          
          if (deadline.includes('.')) {
            const [year, month, day] = deadline.split('.').map(num => parseInt(num));
            return new Date(year, month - 1, day);
          } else {
            return new Date(deadline);
          }
        };
        
        const dateA = parseDate(a.deadline);
        const dateB = parseDate(b.deadline);
        
        // Sort by deadline (earliest first)
        return dateA.getTime() - dateB.getTime();
      });
    } else if (order === 'recent') {
      // Sort by most recently added (assuming id is sequential or using createdAt if available)
      return [...jobsToSort].sort((a, b) => b.id - a.id);
    }
    
    // Default sorting
    return [...jobsToSort];
  }, []);

  // Calculate all sorted jobs - optimized with useMemo
  const sortedAllJobs = useMemo(() => sortJobs(filteredJobs, sortOrder), 
    [filteredJobs, sortOrder, sortJobs]);

  // When the jobs prop changes
  useEffect(() => {
    if (isInitialLoad && jobs.length > 0) {
      // Restore last scroll position
      const savedScrollPosition = localStorage.getItem(SCROLL_POSITION_KEY);
      if (savedScrollPosition) {
        const position = parseInt(savedScrollPosition, 10);
        
        // Load enough items to restore previous scroll position
        const itemsToLoad = Math.ceil(position / 100) * itemsPerPage;
        const pageToLoad = Math.ceil(itemsToLoad / itemsPerPage);
        
        setPage(pageToLoad);
        setTimeout(() => {
          window.scrollTo(0, position);
        }, 100);
      } else {
        // Initial load
        setPage(1);
      }
      
      setIsInitialLoad(false);
    } else if (jobs.length > 0) {
      // New data loaded, maintain current page
      // This helps prevent resetting to page 1 when toggling filters
      const currentLoadedCount = page * itemsPerPage;
      setLastLoadedCount(currentLoadedCount);
    } else {
      setDisplayedJobs([]);
    }
    
    // Save scroll position on unmount
    return () => {
      if (jobs.length > 0) {
        localStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
      }
    };
  }, [jobs, isInitialLoad, itemsPerPage, page]);

  // Update displayed jobs when sortedAllJobs changes or when page changes
  useEffect(() => {
    if (sortedAllJobs.length > 0) {
      const jobsToDisplay = sortedAllJobs.slice(0, Math.max(page * itemsPerPage, lastLoadedCount));
      setDisplayedJobs(jobsToDisplay);
      
      // Store the displayed count for maintaining state during filter changes
      setLastLoadedCount(jobsToDisplay.length);
    } else {
      setDisplayedJobs([]);
    }
  }, [sortedAllJobs, page, itemsPerPage, lastLoadedCount]);

  // Sort order change handler
  useEffect(() => {
    if (filteredJobs.length > 0) {
      const sorted = sortJobs(filteredJobs, sortOrder);
      const jobsToDisplay = sorted.slice(0, Math.max(page * itemsPerPage, lastLoadedCount));
      setDisplayedJobs(jobsToDisplay);
      
      // Save sort setting
      localStorage.setItem(SORT_ORDER_KEY, sortOrder);
    }
  }, [sortOrder, page, filteredJobs, sortJobs, itemsPerPage, lastLoadedCount]);

  // Load more jobs function - memoized with useCallback
  const loadMoreJobs = useCallback(() => {
    if (filteredJobs.length === 0 || isLoading) return;
    
    const nextPage = page + 1;
    const endIndex = nextPage * itemsPerPage;
    
    if (endIndex <= sortedAllJobs.length) {
      setPage(nextPage);
    }
  }, [filteredJobs.length, isLoading, page, itemsPerPage, sortedAllJobs.length]);

  // Infinite scroll observer setup with proper ref handling
  useEffect(() => {
    if (!loaderRef.current || isLoading) return;
    
    // Store the current ref value in a variable to avoid closure issues
    const currentLoaderRef = loaderRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && scrollDirection === 'down') {
          loadMoreJobs();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(currentLoaderRef);
    
    return () => {
      // Use the stored ref value in cleanup
      observer.unobserve(currentLoaderRef);
    };
  }, [loadMoreJobs, isLoading, scrollDirection]);

  // Scroll position and direction detection
  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollTop = window.scrollY;
      
      // Detect scroll direction
      if (scrollTop > lastScrollTop.current) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      lastScrollTop.current = scrollTop;
      
      // Show/hide scroll to top button based on scroll position
      setShowScrollTop(scrollTop > 300);
      
      // Save scroll position
      localStorage.setItem(SCROLL_POSITION_KEY, scrollTop.toString());
    }, 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sort order change handler
  const handleSortChange = (value: string) => {
    setSortOrder(value as 'score' | 'apply' | 'deadline' | 'recent');
  };

  // Count active filters for visual feedback
  useEffect(() => {
    let count = 0;
    if (hideExpired) count++;
    // Add other filter conditions here if needed
    setActiveFilterCount(count);
  }, [hideExpired]);

  // Toggle handler for expired jobs
  const handleToggleHideExpired = (value: boolean) => {
    if (onToggleHideExpired) {
      onToggleHideExpired(value);
      // Store preference in localStorage for persistence
      localStorage.setItem('hide-expired-jobs', value.toString());
    }
  };

  // When loading, show skeleton UI - optimized rendering
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

  // Calculate the number of expired jobs for the UI
  const expiredJobsCount = jobs.filter(isJobExpired).length;

  // 통합된 헤더 렌더링
  const renderIntegratedHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <div className="flex flex-col">
        <div className="flex items-center text-lg font-semibold">
          {title} <span className="text-primary ml-1">{filteredJobs.length}</span>
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
          <Select value={sortOrder} onValueChange={handleSortChange}>
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

  return (
    <div className="relative" ref={listRef}>
      {renderIntegratedHeader()}

      <ScrollArea className="w-full">
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
                willChange: 'opacity, transform' // Performance optimization
              }}
            >
              <JobCard job={job} />
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Observer element for loading more - Optimized display logic */}
      {displayedJobs.length < filteredJobs.length && (
        <div 
          ref={loaderRef} 
          className="w-full h-20 flex items-center justify-center my-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Scroll to top button - Optimized rendering */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 p-2.5 sm:p-3 bg-primary text-white rounded-full shadow-lg transition-all duration-300 z-50 hover:bg-primary/90"
          aria-label="페이지 상단으로 이동"
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}
      
      {/* Display count information */}
      <div className="text-center text-sm text-gray-500 mt-6 mb-2">
        {displayedJobs.length}개 표시 중 
        {hideExpired && expiredJobsCount > 0 && 
          ` (마감된 ${expiredJobsCount}개 제외, 총 ${filteredJobs.length + expiredJobsCount}개)`}
      </div>
      
      {/* Add toggle group for hideExpired status on mobile */}
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
    </div>
  );
};

export default React.memo(JobList); // Memoize to prevent unnecessary re-renders
