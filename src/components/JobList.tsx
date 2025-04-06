
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useJobList } from '@/hooks/useJobList';
import { Job, JobListProps } from '@/types/job';
import JobCard from './JobCard';
import JobListHeader from './job-list/JobListHeader';
import EmptyJobList from './job-list/EmptyJobList';
import LoadingIndicator from './job-list/LoadingIndicator';
import ScrollToTopButton from './job-list/ScrollToTopButton';
import JobListFooter from './job-list/JobListFooter';

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
  const itemsPerPage = 15;
  const listRef = useRef<HTMLDivElement>(null);
  const [activeFilterCount, setActiveFilterCount] = React.useState<number>(0);
  
  // Use our custom hook for job list functionality
  const {
    displayedJobs,
    filteredJobs,
    sortOrder,
    loaderRef,
    showScrollTop,
    scrollDirection,
    expiredJobsCount,
    
    handleSortChange,
    loadMoreJobs,
    scrollToTop
  } = useJobList(jobs, hideExpired, itemsPerPage);

  // Setup intersection observer for infinite scroll
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

  // Count active filters for visual feedback
  useEffect(() => {
    let count = 0;
    if (hideExpired) count++;
    // Add other filter conditions here if needed
    setActiveFilterCount(count);
  }, [hideExpired]);

  // When loading, show skeleton UI
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
                index >= ((Math.floor(index / itemsPerPage)) * itemsPerPage) ? 'opacity-0 animate-fade-in' : ''
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
      
      {/* Observer element for loading more */}
      {displayedJobs.length < filteredJobs.length && (
        <div 
          ref={loaderRef} 
          className="w-full h-20 flex items-center justify-center my-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Scroll to top button */}
      <ScrollToTopButton 
        onClick={scrollToTop} 
        visible={showScrollTop} 
      />
      
      {/* Footer with count information and mobile toggle */}
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
