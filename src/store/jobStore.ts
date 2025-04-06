
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job } from '@/types/api';
import { isJobExpired, sortJobs } from '@/utils/jobUtils';

// 잡 관련 상태 타입 정의
interface JobState {
  // 데이터 상태
  allJobs: Job[];
  recommendedJobs: Job[];
  filteredJobs: Job[];
  displayedJobs: Job[];
  
  // UI 상태
  loading: boolean;
  page: number;
  itemsPerPage: number;
  sortOrder: 'score' | 'apply' | 'deadline' | 'recent';
  hideExpired: boolean;
  showScrollTop: boolean;
  scrollDirection: 'up' | 'down';
  
  // 파생된 정보
  expiredJobsCount: number;
  
  // 액션
  setAllJobs: (jobs: Job[]) => void;
  setRecommendedJobs: (jobs: Job[]) => void;
  setSortOrder: (order: 'score' | 'apply' | 'deadline' | 'recent') => void;
  setHideExpired: (hide: boolean) => void;
  loadMoreJobs: () => void;
  filterJobs: () => void;
  setScrollDirection: (direction: 'up' | 'down') => void;
  setShowScrollTop: (show: boolean) => void;
  resetPagination: () => void;
}

// 스토리지 키
export const STORAGE_KEYS = {
  SCROLL_POSITION: 'job-list-scroll-position',
  SORT_ORDER: 'job-list-sort-order',
  HIDE_EXPIRED: 'hide-expired-jobs'
};

// Zustand 스토어 생성
export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      allJobs: [],
      recommendedJobs: [],
      filteredJobs: [],
      displayedJobs: [],
      loading: false,
      page: 1,
      itemsPerPage: 15,
      sortOrder: 'score',
      hideExpired: true,
      showScrollTop: false,
      scrollDirection: 'down',
      expiredJobsCount: 0,
      
      // 액션
      setAllJobs: (jobs: Job[]) => 
        set(state => {
          // 만료된 작업 개수 계산
          const expiredCount = jobs.filter(isJobExpired).length;
          return { 
            allJobs: jobs,
            expiredJobsCount: expiredCount
          };
        }),
        
      setRecommendedJobs: (jobs: Job[]) => 
        set({ recommendedJobs: jobs }),
        
      setSortOrder: (order) => 
        set(state => {
          // 정렬 순서를 변경하고 필터링 다시 실행
          localStorage.setItem(STORAGE_KEYS.SORT_ORDER, order);
          return { 
            sortOrder: order, 
            page: 1 // 페이지 초기화
          };
        }),
        
      setHideExpired: (hide) => 
        set(state => {
          localStorage.setItem(STORAGE_KEYS.HIDE_EXPIRED, String(hide));
          return { 
            hideExpired: hide,
            page: 1 // 페이지 초기화
          };
        }),
        
      loadMoreJobs: () => 
        set(state => {
          const { page, filteredJobs, itemsPerPage, displayedJobs } = state;
          // 더 로드할 항목이 있는지 확인
          if (displayedJobs.length < filteredJobs.length) {
            return { page: page + 1 };
          }
          return {};
        }),
        
      filterJobs: () => 
        set(state => {
          const { allJobs, hideExpired, sortOrder, page, itemsPerPage } = state;
          
          // 필터링 (만료된 작업 숨기기)
          let filtered = [...allJobs];
          if (hideExpired) {
            filtered = filtered.filter(job => !isJobExpired(job));
          }
          
          // 정렬
          const sorted = sortJobs(filtered, sortOrder);
          
          // 현재 페이지까지의 항목만 표시
          const displayed = sorted.slice(0, page * itemsPerPage);
          
          return {
            filteredJobs: sorted,
            displayedJobs: displayed,
          };
        }),
        
      setScrollDirection: (direction) => 
        set({ scrollDirection: direction }),
        
      setShowScrollTop: (show) => 
        set({ showScrollTop: show }),
        
      resetPagination: () => 
        set({ page: 1 }),
    }),
    {
      name: 'job-storage',
      partialize: (state) => ({ 
        sortOrder: state.sortOrder,
        hideExpired: state.hideExpired 
      }),
    }
  )
);

// 데이터 필터링 및 표시 업데이트를 위한 이펙트 함수
export const useJobStoreEffects = () => {
  const { 
    allJobs, 
    filterJobs, 
    setScrollDirection, 
    setShowScrollTop,
    scrollDirection
  } = useJobStore();
  
  // 필터링 실행
  React.useEffect(() => {
    if (allJobs.length > 0) {
      filterJobs();
    }
  }, [allJobs, filterJobs, useJobStore(state => state.hideExpired), useJobStore(state => state.sortOrder), useJobStore(state => state.page)]);
  
  // 스크롤 이벤트 처리
  React.useEffect(() => {
    let lastScrollTop = 0;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      
      // 스크롤 방향 감지
      if (scrollTop > lastScrollTop) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      lastScrollTop = scrollTop;
      
      // 스크롤 위치에 따라 위로 스크롤 버튼 표시/숨김
      setShowScrollTop(scrollTop > 300);
      
      // 스크롤 위치 저장
      localStorage.setItem(STORAGE_KEYS.SCROLL_POSITION, scrollTop.toString());
    };
    
    const debounceScroll = debounce(handleScroll, 50);
    window.addEventListener('scroll', debounceScroll);
    
    return () => {
      window.removeEventListener('scroll', debounceScroll);
    };
  }, [setScrollDirection, setShowScrollTop]);
  
  return { scrollDirection };
};

// 디바운스 헬퍼 함수
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
