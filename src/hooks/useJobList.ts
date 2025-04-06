
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Job } from '@/types/job';
import { isJobExpired, sortJobs } from '@/utils/jobUtils';

// Storage keys
export const STORAGE_KEYS = {
  SCROLL_POSITION: 'job-list-scroll-position',
  SORT_ORDER: 'job-list-sort-order',
  HIDE_EXPIRED: 'hide-expired-jobs'
};

// Debounce helper
export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const useJobList = (
  jobs: Job[],
  hideExpired: boolean = true,
  itemsPerPage: number = 15
) => {
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortOrder, setSortOrder] = useState<'score' | 'apply' | 'deadline' | 'recent'>(() => {
    // Restore sort setting from localStorage
    const savedSort = localStorage.getItem(STORAGE_KEYS.SORT_ORDER);
    return (savedSort as 'score' | 'apply' | 'deadline' | 'recent') || 'score';
  });
  
  const loaderRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastLoadedCount, setLastLoadedCount] = useState(itemsPerPage);

  // Filter out expired jobs if hideExpired is true
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    
    // Filter jobs based on hideExpired setting
    let jobsToDisplay = [...jobs];
    if (hideExpired) {
      jobsToDisplay = jobs.filter(job => !isJobExpired(job));
    }
    
    setFilteredJobs(jobsToDisplay);
  }, [jobs, hideExpired]);

  // Calculate all sorted jobs - optimized with useMemo
  const sortedAllJobs = useMemo(() => sortJobs(filteredJobs, sortOrder), 
    [filteredJobs, sortOrder]);

  // When the jobs prop changes
  useEffect(() => {
    if (isInitialLoad && jobs.length > 0) {
      // Restore last scroll position
      const savedScrollPosition = localStorage.getItem(STORAGE_KEYS.SCROLL_POSITION);
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
      const currentLoadedCount = page * itemsPerPage;
      setLastLoadedCount(currentLoadedCount);
    } else {
      setDisplayedJobs([]);
    }
    
    // Save scroll position on unmount
    return () => {
      if (jobs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SCROLL_POSITION, window.scrollY.toString());
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
      localStorage.setItem(STORAGE_KEYS.SORT_ORDER, sortOrder);
    }
  }, [sortOrder, page, filteredJobs, itemsPerPage, lastLoadedCount]);

  // Load more jobs function - memoized with useCallback
  const loadMoreJobs = useCallback(() => {
    if (filteredJobs.length === 0) return;
    
    const nextPage = page + 1;
    const endIndex = nextPage * itemsPerPage;
    
    if (endIndex <= sortedAllJobs.length) {
      setPage(nextPage);
    }
  }, [filteredJobs.length, page, itemsPerPage, sortedAllJobs.length]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sort order change handler
  const handleSortChange = useCallback((value: string) => {
    setSortOrder(value as 'score' | 'apply' | 'deadline' | 'recent');
  }, []);

  // Setup scroll event listener
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
      localStorage.setItem(STORAGE_KEYS.SCROLL_POSITION, scrollTop.toString());
    }, 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate the number of expired jobs
  const expiredJobsCount = useMemo(() => 
    jobs.filter(isJobExpired).length, 
    [jobs]
  );

  return {
    displayedJobs,
    filteredJobs,
    sortOrder,
    sortedAllJobs,
    showScrollTop,
    loaderRef,
    scrollDirection,
    expiredJobsCount,
    
    // Methods
    handleSortChange,
    loadMoreJobs,
    scrollToTop
  };
};
