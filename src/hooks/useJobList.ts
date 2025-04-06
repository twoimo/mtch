
import { useJobStore } from '@/store/jobStore';
import { STORAGE_KEYS, debounce } from '@/store/jobStore';

// 기존 훅을 Zustand 스토어를 사용하도록 수정하여 이전 코드와의 호환성 유지
export const useJobList = (
  jobs: Job[],
  hideExpired: boolean = true,
  itemsPerPage: number = 15
) => {
  const { 
    displayedJobs,
    filteredJobs,
    sortOrder,
    showScrollTop,
    expiredJobsCount,
    setSortOrder: handleSortChange,
    loadMoreJobs,
    setHideExpired,
    setAllJobs
  } = useJobStore();
  
  // 첫 렌더링 시 jobs를 스토어에 설정
  React.useEffect(() => {
    if (jobs && jobs.length > 0) {
      setAllJobs(jobs);
    }
  }, [jobs, setAllJobs]);
  
  // 로딩 상태에 따라 hideExpired 업데이트
  React.useEffect(() => {
    setHideExpired(hideExpired);
  }, [hideExpired, setHideExpired]);
  
  // 참조 변수들
  const loaderRef = React.useRef<HTMLDivElement>(null);
  
  // Zustand에서 스크롤 방향 가져오기
  const scrollDirection = useJobStore(state => state.scrollDirection);
  
  // 스크롤 맨 위로 함수
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    displayedJobs,
    filteredJobs,
    sortOrder,
    showScrollTop,
    loaderRef,
    scrollDirection,
    expiredJobsCount,
    
    // 메서드
    handleSortChange,
    loadMoreJobs,
    scrollToTop
  };
};

// 스토리지 키와 디바운스 유틸리티 재내보내기 (이전 코드와의 호환성 유지)
export { STORAGE_KEYS, debounce };

