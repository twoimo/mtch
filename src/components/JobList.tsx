
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { JobListProps } from '@/types/job';
import JobCard from './JobCard';
import JobListHeader from './job-list/JobListHeader';
import EmptyJobList from './job-list/EmptyJobList';
import LoadingIndicator from './job-list/LoadingIndicator';
import ScrollToTopButton from './job-list/ScrollToTopButton';
import JobListFooter from './job-list/JobListFooter';
import { useJobStore, useJobStoreEffects } from '@/store/jobStore';

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
  const listRef = useRef<HTMLDivElement>(null);
  const [activeFilterCount, setActiveFilterCount] = React.useState<number>(0);
  
  // Zustand 스토어에서 상태와 액션 가져오기
  const { 
    displayedJobs, 
    filteredJobs,
    sortOrder,
    showScrollTop,
    expiredJobsCount,
    setSortOrder,
    loadMoreJobs,
    setHideExpired,
    setAllJobs,
  } = useJobStore();
  
  // 스크롤 관련 이펙트 훅 사용
  const { scrollDirection } = useJobStoreEffects();
  
  // 로더 참조
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // 스크롤 맨 위로 함수
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    setSortOrder(value as 'score' | 'apply' | 'deadline' | 'recent');
  };
  
  // 첫 렌더링 시 jobs를 스토어에 설정
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      setAllJobs(jobs);
    }
  }, [jobs, setAllJobs]);
  
  // 로딩 상태에 따라 hideExpired 업데이트
  useEffect(() => {
    setHideExpired(hideExpired);
  }, [hideExpired, setHideExpired]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!loaderRef.current || isLoading) return;
    
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
      observer.unobserve(currentLoaderRef);
    };
  }, [loadMoreJobs, isLoading, scrollDirection]);

  // 활성화된 필터 수 계산
  useEffect(() => {
    let count = 0;
    if (hideExpired) count++;
    // 필요한 경우 여기에 다른 필터 조건 추가
    setActiveFilterCount(count);
  }, [hideExpired]);

  // 로딩 중일 때 스켈레톤 UI 표시
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!jobs || jobs.length === 0) {
    return <EmptyJobList />;
  }

  return (
    <div className="relative" ref={listRef}>
      <JobListHeader 
        title={title}
        count={filteredJobs.length}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onOpenFilters={onOpenFilters}
        activeFilterCount={activeFilterCount}
      />

      <ScrollArea className="w-full">
        <div className="grid gap-4 grid-cols-1">
          {displayedJobs.map((job, index) => (
            <div 
              key={job.id} 
              className={`transition-all duration-300 ${
                index >= ((Math.floor(index / 15)) * 15) ? 'opacity-0 animate-fade-in' : ''
              }`}
              style={{ 
                animationDelay: `${Math.min(index % 15 * 0.05, 0.5)}s`, 
                animationFillMode: 'forwards',
                willChange: 'opacity, transform' // 성능 최적화
              }}
            >
              <JobCard job={job} />
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* 더 로드하기 위한 관찰자 요소 */}
      {displayedJobs.length < filteredJobs.length && (
        <div 
          ref={loaderRef} 
          className="w-full h-20 flex items-center justify-center my-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* 맨 위로 스크롤 버튼 */}
      <ScrollToTopButton 
        onClick={scrollToTop} 
        visible={showScrollTop} 
      />
      
      {/* 카운트 정보와 모바일 토글이 있는 푸터 */}
      <JobListFooter 
        displayedCount={displayedJobs.length}
        hideExpired={hideExpired}
        expiredCount={expiredJobsCount}
        totalCount={filteredJobs.length + expiredJobsCount}
        onToggleHideExpired={onToggleHideExpired}
        isMobile={isMobile}
      />
    </div>
  );
};

export default React.memo(JobList);
